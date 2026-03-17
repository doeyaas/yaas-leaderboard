import { createClient } from '@/lib/supabase/server'
import type {
  Brand, IP, CompanyStats, LeaderboardEntry,
  IPGrowthEntry, TimeWindow,
} from '@/lib/types'
import { INTERACTION_METRICS } from '@/lib/types'

// ─── Most Viewed ───────────────────────────────────────────

export async function getMostViewed(window: TimeWindow): Promise<LeaderboardEntry[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leaderboard')
    .select(`
      *,
      video:videos (
        *,
        ip:ips (*)
      )
    `)
    .eq('category', 'most_viewed')
    .eq('time_window', window)
    .order('rank', { ascending: true })
    .limit(10)

  return (data ?? []) as LeaderboardEntry[]
}

// ─── Top N videos (used by Company Overview) ───────────────

export async function getTopVideos(limit = 5): Promise<LeaderboardEntry[]> {
  const entries = await getMostViewed('24h')
  return entries.slice(0, limit)
}

// ─── IP Month-on-Month Growth ──────────────────────────────

export async function getIPMonthOnMonthGrowth(): Promise<IPGrowthEntry[]> {
  const supabase = await createClient()

  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().slice(0, 10)
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    .toISOString().slice(0, 10)

  const { data } = await supabase
    .from('ip_monthly_metrics')
    .select('*, ip:ips(*)')
    .in('month', [thisMonth, lastMonth])

  if (!data) return []

  const current  = data.filter((r) => r.month === thisMonth)
  const previous = data.filter((r) => r.month === lastMonth)

  return current
    .map((curr) => {
      const prev      = previous.find((p) => p.ip_id === curr.ip_id)
      const prevViews = prev?.total_views ?? 0
      const growth    = prevViews > 0
        ? ((curr.total_views - prevViews) / prevViews) * 100
        : 100
      return {
        ip: curr.ip as IP,
        current_month_views:  curr.total_views,
        previous_month_views: prevViews,
        growth_percentage:    parseFloat(growth.toFixed(1)),
        rank: 0,
      }
    })
    .sort((a, b) => b.growth_percentage - a.growth_percentage)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))
}

// ─── Company Stats ─────────────────────────────────────────

export async function getCompanyStats(): Promise<CompanyStats> {
  const supabase = await createClient()

  // Total views per time window from leaderboard scores
  const windows: TimeWindow[] = ['24h', '7d', '30d']
  const viewTotals: Record<string, number> = {}

  await Promise.all(windows.map(async (w) => {
    const { data } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('category', 'most_viewed')
      .eq('time_window', w)
    viewTotals[w] = (data ?? []).reduce((sum, r) => sum + Number(r.score), 0)
  }))

  // Total videos and active IPs
  const [{ count: totalVideos }, { count: totalIPs }] = await Promise.all([
    supabase.from('videos').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('ips').select('*', { count: 'exact', head: true }).eq('active', true),
  ])

  // Total interactions from latest metric snapshots
  const { data: interactions } = await supabase
    .from('metrics')
    .select('value')
    .in('metric_name', [...INTERACTION_METRICS])

  const totalInteractions = (interactions ?? []).reduce((sum, r) => sum + Number(r.value), 0)

  return {
    views_24h:          viewTotals['24h'] ?? 0,
    views_7d:           viewTotals['7d']  ?? 0,
    views_30d:          viewTotals['30d'] ?? 0,
    total_interactions: totalInteractions,
    total_videos:       totalVideos ?? 0,
    total_active_ips:   totalIPs    ?? 0,
  }
}

// ─── Active IPs ────────────────────────────────────────────

export async function getActiveIPs(): Promise<(IP & { brand?: Brand })[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ips')
    .select('*, brand:brands(*)')
    .eq('active', true)
  return (data ?? []) as (IP & { brand?: Brand })[]
}
