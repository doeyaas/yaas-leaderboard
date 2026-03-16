/**
 * Query functions that mirror what real Supabase calls would return.
 * Each function returns the same shape as a Supabase `.select()` response.
 *
 * To migrate to real Supabase later, replace the body of each function
 * with the equivalent `supabase.from(...).select(...)` call.
 */

import { BRANDS, IPS, VIDEOS, METRICS, IP_MONTHLY_METRICS } from './tables'
import type {
  Brand, IP, Video, CompanyStats, LeaderboardEntry,
  IPGrowthEntry, TimeWindow, LeaderboardCategory,
} from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────

function ipById(id: string): IP | undefined {
  return IPS.find((ip) => ip.id === id)
}

function brandById(id: string): Brand | undefined {
  return BRANDS.find((b) => b.id === id)
}

function metricsForVideo(videoId: string) {
  const rows = METRICS.filter((m) => m.video_id === videoId)
  return {
    views:    rows.find((m) => m.metric_name === 'views')?.value    ?? 0,
    likes:    rows.find((m) => m.metric_name === 'likes')?.value    ?? 0,
    comments: rows.find((m) => m.metric_name === 'comments')?.value ?? 0,
    shares:   rows.find((m) => m.metric_name === 'shares')?.value   ?? 0,
  }
}

/**
 * Videos published within the given rolling window.
 * Mirrors: metrics filtered by timestamp >= now() - interval
 */
function videosInWindow(window: TimeWindow): Video[] {
  const now = Date.now()
  const cutoffMs: Record<TimeWindow, number> = {
    '24h': 24 * 3_600_000,
    '7d':   7 * 24 * 3_600_000,
    '30d': 30 * 24 * 3_600_000,
  }
  return VIDEOS.filter((v) => {
    const age = now - new Date(v.published_at).getTime()
    return age <= cutoffMs[window]
  })
}

/**
 * Compute velocity: views / hours since publish (capped at 1 hour minimum)
 */
function velocity(video: Video, views: number): number {
  const ageHours = Math.max(
    1,
    (Date.now() - new Date(video.published_at).getTime()) / 3_600_000
  )
  return Math.round(views / ageHours)
}

function toEntry(
  video: Video,
  rank: number,
  score: number,
  category: LeaderboardCategory,
  window: TimeWindow,
  id: string,
): LeaderboardEntry {
  const m = metricsForVideo(video.id)
  const ip = ipById(video.ip_id)
  return {
    id,
    category,
    time_window: window,
    rank,
    video_id: video.id,
    score,
    updated_at: new Date().toISOString(),
    video: {
      ...video,
      views:    m.views,
      likes:    m.likes,
      comments: m.comments,
      shares:   m.shares,
      velocity: velocity(video, m.views),
      ip,
    },
  }
}

// ─── Public query functions ────────────────────────────────

/**
 * SELECT * FROM leaderboard WHERE category = 'most_viewed' AND time_window = ?
 * ORDER BY rank ASC LIMIT 10
 */
export function getMostViewed(window: TimeWindow): LeaderboardEntry[] {
  const videos = videosInWindow(window)
  return videos
    .map((v) => ({ video: v, views: metricsForVideo(v.id).views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map((item, i) =>
      toEntry(item.video, i + 1, item.views, 'most_viewed', window, `mv-${window}-${i}`)
    )
}

/**
 * SELECT * FROM leaderboard WHERE category = 'most_interactions' AND time_window = ?
 * ORDER BY rank ASC LIMIT 10
 */
export function getMostInteractions(window: TimeWindow): LeaderboardEntry[] {
  const videos = videosInWindow(window)
  return videos
    .map((v) => {
      const m = metricsForVideo(v.id)
      return { video: v, engagement: m.likes + m.comments + m.shares }
    })
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 10)
    .map((item, i) =>
      toEntry(item.video, i + 1, item.engagement, 'most_interactions', window, `mi-${window}-${i}`)
    )
}

/**
 * SELECT * FROM leaderboard WHERE category = 'fastest_growing' AND time_window = ?
 * ORDER BY rank ASC LIMIT 10
 */
export function getFastestGrowing(window: TimeWindow): LeaderboardEntry[] {
  const videos = videosInWindow(window)
  return videos
    .map((v) => {
      const views = metricsForVideo(v.id).views
      return { video: v, vel: velocity(v, views) }
    })
    .sort((a, b) => b.vel - a.vel)
    .slice(0, 10)
    .map((item, i) =>
      toEntry(item.video, i + 1, item.vel, 'fastest_growing', window, `fg-${window}-${i}`)
    )
}

/**
 * SELECT ip_id, month, total_views FROM ip_monthly_metrics
 * ORDER BY growth DESC
 */
export function getIPMonthOnMonthGrowth(): IPGrowthEntry[] {
  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().slice(0, 10)
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    .toISOString().slice(0, 10)

  const current = IP_MONTHLY_METRICS.filter((r) => r.month === thisMonth)
  const previous = IP_MONTHLY_METRICS.filter((r) => r.month === lastMonth)

  return current
    .map((curr) => {
      const prev = previous.find((p) => p.ip_id === curr.ip_id)
      const prevViews = prev?.total_views ?? 0
      const growth = prevViews > 0
        ? ((curr.total_views - prevViews) / prevViews) * 100
        : 100
      const ip = ipById(curr.ip_id)!
      return { ip, current_month_views: curr.total_views, previous_month_views: prevViews, growth_percentage: parseFloat(growth.toFixed(1)), rank: 0 }
    })
    .sort((a, b) => b.growth_percentage - a.growth_percentage)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))
}

/**
 * Aggregated company-wide stats.
 * Mirrors: SUM(metrics.value) WHERE metric_name = 'views' AND timestamp >= ?
 */
export function getCompanyStats(): CompanyStats {
  const allVideos = VIDEOS
  const windows: TimeWindow[] = ['24h', '7d', '30d']
  const cutoffMs: Record<TimeWindow, number> = {
    '24h': 24 * 3_600_000,
    '7d':   7 * 24 * 3_600_000,
    '30d': 30 * 24 * 3_600_000,
  }

  function sumViews(window: TimeWindow) {
    const now = Date.now()
    return allVideos
      .filter((v) => now - new Date(v.published_at).getTime() <= cutoffMs[window])
      .reduce((sum, v) => sum + metricsForVideo(v.id).views, 0)
  }

  const totalInteractions = METRICS
    .filter((m) => m.metric_name !== 'views')
    .reduce((sum, m) => sum + m.value, 0)

  return {
    views_24h: sumViews('24h'),
    views_7d: sumViews('7d'),
    views_30d: sumViews('30d'),
    total_interactions: totalInteractions,
    total_videos: VIDEOS.length,
    total_active_ips: IPS.filter((ip) => ip.active).length,
  }
}

/**
 * Top N videos across all windows — used for Company Overview snapshot.
 */
export function getTopVideos(limit = 5): LeaderboardEntry[] {
  return getMostViewed('24h').slice(0, limit)
}

/**
 * SELECT * FROM ips WHERE active = true (with brand joined)
 */
export function getActiveIPs(): (IP & { brand?: Brand })[] {
  return IPS
    .filter((ip) => ip.active)
    .map((ip) => ({ ...ip, brand: brandById(ip.brand_id) }))
}
