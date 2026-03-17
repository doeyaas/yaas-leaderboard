import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { INTERACTION_METRICS } from '@/lib/types'

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

const TIME_WINDOWS = [
  { key: '24h', ms: 24 * 3_600_000 },
  { key: '7d',  ms:  7 * 24 * 3_600_000 },
  { key: '30d', ms: 30 * 24 * 3_600_000 },
] as const

async function handler(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()

  // ── 1. Recompute leaderboard (most_viewed per time window) ──────────────

  let leaderboardRowsWritten = 0

  for (const { key, ms } of TIME_WINDOWS) {
    const cutoff = new Date(now.getTime() - ms).toISOString()

    // Get all non-deleted videos published within the window
    const { data: videos } = await supabase
      .from('videos')
      .select('id, published_at')
      .eq('is_deleted', false)
      .gte('published_at', cutoff)

    if (!videos?.length) continue

    // For each video, get the latest view count snapshot
    const scored: { video_id: string; views: number }[] = []

    for (const video of videos) {
      const { data: metric } = await supabase
        .from('metrics')
        .select('value')
        .eq('video_id', video.id)
        .eq('metric_name', 'views')
        .order('scraped_at', { ascending: false })
        .limit(1)
        .single()

      if (metric) {
        scored.push({ video_id: video.id, views: Number(metric.value) })
      }
    }

    // Sort by views descending, take top 10
    const top10 = scored
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Upsert leaderboard rows
    const rows = top10.map((item, i) => ({
      category:    'most_viewed',
      time_window: key,
      rank:        i + 1,
      video_id:    item.video_id,
      score:       item.views,
      updated_at:  now.toISOString(),
    }))

    if (rows.length) {
      await supabase
        .from('leaderboard')
        .upsert(rows, { onConflict: 'category,time_window,rank' })
      leaderboardRowsWritten += rows.length
    }
  }

  // ── 2. Recompute ip_monthly_metrics ────────────────────────────────────

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const { data: ips } = await supabase
    .from('ips')
    .select('id')
    .eq('active', true)

  let monthlyRowsWritten = 0

  for (const ip of ips ?? []) {
    for (const [monthStart, monthEnd] of [
      [thisMonthStart, thisMonthEnd],
      [lastMonthStart, thisMonthStart],
    ]) {
      // Get videos for this IP published in this month
      const { data: videos } = await supabase
        .from('videos')
        .select('id')
        .eq('ip_id', ip.id)
        .eq('is_deleted', false)
        .gte('published_at', monthStart.toISOString())
        .lt('published_at', monthEnd.toISOString())

      if (!videos?.length) continue

      const videoIds = videos.map((v) => v.id)

      // Sum latest views per video
      let totalViews = 0
      let totalInteractions = 0

      for (const vid of videoIds) {
        const { data: viewRow } = await supabase
          .from('metrics')
          .select('value')
          .eq('video_id', vid)
          .eq('metric_name', 'views')
          .order('scraped_at', { ascending: false })
          .limit(1)
          .single()

        totalViews += viewRow ? Number(viewRow.value) : 0

        // Fetch all recent interaction rows, then pick the latest per metric in code
        // (avoids the .limit(N) bug where N rows across all metrics != 1 per metric)
        const { data: interactionRows } = await supabase
          .from('metrics')
          .select('metric_name, value, scraped_at')
          .eq('video_id', vid)
          .in('metric_name', [...INTERACTION_METRICS])
          .order('scraped_at', { ascending: false })

        const latestByMetric = new Map<string, number>()
        for (const row of interactionRows ?? []) {
          if (!latestByMetric.has(row.metric_name)) {
            latestByMetric.set(row.metric_name, Number(row.value))
          }
        }
        totalInteractions += [...latestByMetric.values()].reduce((s, v) => s + v, 0)
      }

      await supabase
        .from('ip_monthly_metrics')
        .upsert({
          ip_id:              ip.id,
          month:              monthStart.toISOString().slice(0, 10),
          total_views:        totalViews,
          total_interactions: totalInteractions,
        }, { onConflict: 'ip_id,month' })

      monthlyRowsWritten++
    }
  }

  return NextResponse.json({
    ok: true,
    leaderboard_rows: leaderboardRowsWritten,
    monthly_rows:     monthlyRowsWritten,
  })
}

export const GET  = handler
export const POST = handler
