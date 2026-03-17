import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

interface IGPost {
  shortcode: string
  timestamp: number
  edge_media_to_caption?: { edges: { node: { text: string } }[] }
  thumbnail_src?: string
  display_url?: string
  edge_liked_by?: { count: number }
  edge_media_to_comment?: { count: number }
  video_view_count?: number
  is_video?: boolean
}

async function fetchProfilePosts(handle: string): Promise<IGPost[]> {
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${handle}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'X-IG-App-ID': '936619743392459',
      'Accept': 'application/json',
      'Referer': `https://www.instagram.com/${handle}/`,
    },
  })

  if (!res.ok) throw new Error(`Instagram API returned ${res.status} for @${handle}`)

  const json = await res.json()
  const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges ?? []
  return edges.map((e: { node: IGPost }) => e.node)
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
      platform: 'instagram',
      started_at: startedAt,
      triggered_by: req.headers.get('x-triggered-by') ?? 'manual',
    })
    .select('id')
    .single()

  const logId = logRow?.id

  try {
    const { data: ips } = await supabase
      .from('ips')
      .select('id, name, instagram_handle')
      .eq('active', true)
      .not('instagram_handle', 'is', null)

    if (!ips?.length) {
      await supabase.from('scrape_log').update({ completed_at: new Date().toISOString() }).eq('id', logId)
      return NextResponse.json({ ok: true, message: 'No active IPs with Instagram handles' })
    }

    let postsFound = 0
    let postsUpserted = 0
    let metricsInserted = 0

    for (const ip of ips) {
      try {
        const posts = await fetchProfilePosts(ip.instagram_handle!)
        postsFound += posts.length

        for (const post of posts) {
          if (!post.shortcode) continue

          const caption = post.edge_media_to_caption?.edges?.[0]?.node?.text ?? ''
          const title   = caption.slice(0, 200).replace(/\n/g, ' ').trim() || '(no caption)'
          const thumb   = post.thumbnail_src ?? post.display_url ?? null
          const pubAt   = post.timestamp
            ? new Date(post.timestamp * 1000).toISOString()
            : new Date().toISOString()

          const { error: videoErr } = await supabase
            .from('videos')
            .upsert({
              ip_id:             ip.id,
              platform:          'instagram',
              platform_video_id: post.shortcode,
              title,
              caption:           caption || null,
              video_url:         `https://www.instagram.com/p/${post.shortcode}/`,
              thumbnail_url:     thumb,
              published_at:      pubAt,
              is_deleted:        false,
            }, { onConflict: 'platform,platform_video_id' })

          if (videoErr) continue
          postsUpserted++

          const { data: videoRow } = await supabase
            .from('videos')
            .select('id')
            .eq('platform', 'instagram')
            .eq('platform_video_id', post.shortcode)
            .single()

          if (!videoRow) continue

          const views    = post.video_view_count ?? 0
          const likes    = post.edge_liked_by?.count ?? 0
          const comments = post.edge_media_to_comment?.count ?? 0

          const metricsPayload = [
            { video_id: videoRow.id, metric_name: 'views',    value: views },
            { video_id: videoRow.id, metric_name: 'likes',    value: likes },
            { video_id: videoRow.id, metric_name: 'comments', value: comments },
          ]

          const { error: metricErr } = await supabase.from('metrics').insert(metricsPayload)
          if (!metricErr) metricsInserted += metricsPayload.length
        }
      } catch (ipErr) {
        console.error(`Instagram scrape failed for IP ${ip.name}:`, ipErr)
      }
    }

    await supabase
      .from('scrape_log')
      .update({
        completed_at:     new Date().toISOString(),
        videos_found:     postsFound,
        videos_upserted:  postsUpserted,
        metrics_inserted: metricsInserted,
      })
      .eq('id', logId)

    return NextResponse.json({ ok: true, posts_found: postsFound, posts_upserted: postsUpserted, metrics_inserted: metricsInserted })
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
