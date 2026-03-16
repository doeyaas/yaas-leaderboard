import { NextRequest, NextResponse } from 'next/server'
import { Innertube } from 'youtubei.js'
import { createServiceClient } from '@/lib/supabase/server'

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

// youtubei.js returns union types — handle GridVideo, ReelItem, ShortsLockupView
function videoId(v: unknown): string | null {
  if (typeof v !== 'object' || v === null) return null
  const obj = v as Record<string, unknown>
  // GridVideo / ReelItem: top-level id
  if (typeof obj.id === 'string') return obj.id
  // ShortsLockupView: id is in on_tap.payload.videoId
  const tap     = obj.on_tap     as Record<string, unknown> | undefined
  const payload = tap?.payload   as Record<string, unknown> | undefined
  if (typeof payload?.videoId === 'string') return payload.videoId
  return null
}

function videoTitle(v: unknown): string {
  if (typeof v !== 'object' || v === null) return ''
  const obj = v as Record<string, unknown>
  // GridVideo / ReelItem: top-level title (string or Text)
  if ('title' in obj) {
    const t = obj.title
    if (typeof t === 'string') return t
    if (typeof t === 'object' && t !== null && 'toString' in t) return String(t)
  }
  // ShortsLockupView: title is in overlay_metadata.primary_text
  const meta = obj.overlay_metadata as Record<string, unknown> | undefined
  if (meta?.primary_text != null) return String(meta.primary_text)
  return ''
}

function videoViews(v: unknown): number {
  if (typeof v !== 'object' || v === null) return 0
  const obj = v as Record<string, unknown>
  // GridVideo: view_count (Text), ReelItem: views (Text)
  const raw = (obj.view_count ?? obj.views) as { toString(): string } | undefined
  if (raw != null) return parseInt(raw.toString().replace(/[^0-9]/g, ''), 10) || 0
  // ShortsLockupView: overlay_metadata.secondary_text e.g. "1.2M views"
  const meta = obj.overlay_metadata as Record<string, unknown> | undefined
  if (meta?.secondary_text != null) return parseInt(String(meta.secondary_text).replace(/[^0-9]/g, ''), 10) || 0
  return 0
}

async function handler(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const startedAt = new Date().toISOString()

  const { data: logRow } = await supabase
    .from('scrape_log')
    .insert({
      platform: 'youtube',
      started_at: startedAt,
      triggered_by: req.headers.get('x-triggered-by') ?? 'manual',
    })
    .select('id')
    .single()

  const logId = logRow?.id

  try {
    const { data: ips } = await supabase
      .from('ips')
      .select('id, name, youtube_channel_id')
      .eq('active', true)
      .not('youtube_channel_id', 'is', null)

    if (!ips?.length) {
      await supabase.from('scrape_log').update({ completed_at: new Date().toISOString() }).eq('id', logId)
      return NextResponse.json({ ok: true, message: 'No active IPs with YouTube channels' })
    }

    const yt = await Innertube.create({ retrieve_player: false })

    let videosFound = 0
    let videosUpserted = 0
    let metricsInserted = 0

    for (const ip of ips) {
      try {
        // Resolve @handle to a channel — getChannel also accepts UC... IDs directly
        let channelId = ip.youtube_channel_id!
        if (channelId.startsWith('@')) {
          const nav = await yt.resolveURL(`https://www.youtube.com/${channelId}`)
          const resolved = (nav as unknown as { payload?: { browseId?: string } }).payload?.browseId
          if (resolved) channelId = resolved
        }

        const channel   = await yt.getChannel(channelId)
        const shortsTab = await channel.getShorts()
        const videos    = shortsTab.videos.slice(0, 30)
        videosFound += videos.length

        // Debug: log first item structure
        if (videos[0]) {
          const sample = videos[0] as Record<string, unknown>
          console.log('[YT-DEBUG] first short keys:', Object.keys(sample))
          console.log('[YT-DEBUG] type:', sample.type)
          console.log('[YT-DEBUG] id:', sample.id)
          console.log('[YT-DEBUG] on_tap:', JSON.stringify(sample.on_tap)?.slice(0, 200))
        }

        for (const v of videos) {
          const vid = videoId(v)
          if (!vid) continue

          try {
            const views  = videoViews(v)
            const thumbs = (v as unknown as { thumbnails?: { url: string }[] }).thumbnails
            const thumb  = thumbs?.[0]?.url ?? null

            // Publish date: GridVideo has a `published` Text like "2 days ago" — convert best-effort
            const publishedAt = new Date().toISOString()

            await supabase
              .from('videos')
              .upsert({
                ip_id:             ip.id,
                platform:          'youtube',
                platform_video_id: vid,
                title:             videoTitle(v),
                thumbnail_url:     thumb,
                published_at:      publishedAt,
                is_deleted:        false,
              }, { onConflict: 'platform,platform_video_id' })

            videosUpserted++

            const { data: videoRow } = await supabase
              .from('videos')
              .select('id')
              .eq('platform', 'youtube')
              .eq('platform_video_id', vid)
              .single()

            if (!videoRow) continue

            const { error: metricErr } = await supabase.from('metrics').insert([
              { video_id: videoRow.id, metric_name: 'views', value: views },
            ])
            if (!metricErr) metricsInserted++
          } catch (vidErr) {
            console.error('[YT] video error:', vidErr)
          }
        }
      } catch (ipErr) {
        console.error(`YouTube scrape failed for IP ${ip.name}:`, ipErr)
      }
    }

    await supabase
      .from('scrape_log')
      .update({
        completed_at:     new Date().toISOString(),
        videos_found:     videosFound,
        videos_upserted:  videosUpserted,
        metrics_inserted: metricsInserted,
      })
      .eq('id', logId)

    return NextResponse.json({ ok: true, videos_found: videosFound, videos_upserted: videosUpserted, metrics_inserted: metricsInserted })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await supabase
      .from('scrape_log')
      .update({ completed_at: new Date().toISOString(), error_message: message })
      .eq('id', logId)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export const GET  = handler
export const POST = handler
