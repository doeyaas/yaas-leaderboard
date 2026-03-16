import { NextRequest, NextResponse } from 'next/server'
import { Innertube } from 'youtubei.js'
import { createServiceClient } from '@/lib/supabase/server'

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

// youtubei.js returns a union of video types — extract id/title safely
function videoId(v: unknown): string | null {
  if (typeof v === 'object' && v !== null && 'id' in v && typeof (v as { id: unknown }).id === 'string') {
    return (v as { id: string }).id
  }
  return null
}

function videoTitle(v: unknown): string {
  if (typeof v === 'object' && v !== null && 'title' in v) {
    const t = (v as { title: unknown }).title
    if (typeof t === 'string') return t
    if (typeof t === 'object' && t !== null && 'toString' in t) return String(t)
  }
  return ''
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
        const videosTab = await channel.getVideos()
        const videos    = videosTab.videos.slice(0, 30)
        videosFound += videos.length

        for (const v of videos) {
          const vid = videoId(v)
          if (!vid) continue

          try {
            // Extract view count directly from channel listing (Text object → number)
            const viewText = (v as unknown as { view_count?: { toString(): string } }).view_count?.toString() ?? '0'
            const views = parseInt(viewText.replace(/[^0-9]/g, ''), 10) || 0

            // Thumbnail from listing
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
          } catch {
            // Skip individual video errors — continue with next
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
