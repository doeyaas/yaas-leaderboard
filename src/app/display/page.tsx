import ScreenRotator from '@/components/ScreenRotator'
import {
  getCompanyStats,
  getTopVideos,
  getMostViewed,
  getIPMonthOnMonthGrowth,
} from '@/lib/db/queries'
import type { CompanyStats, LeaderboardEntry, IPGrowthEntry, TimeWindow } from '@/lib/types'

const EMPTY_STATS: CompanyStats = {
  views_24h: 0, views_7d: 0, views_30d: 0,
  total_interactions: 0, total_videos: 0, total_active_ips: 0,
}

const EMPTY_ENTRIES: Record<TimeWindow, LeaderboardEntry[]> = {
  '24h': [], '7d': [], '30d': [],
}

export default async function DisplayPage() {
  try {
    const [
      stats,
      topVideos,
      viewed24h,
      viewed7d,
      viewed30d,
      ipGrowthEntries,
    ] = await Promise.all([
      getCompanyStats(),
      getTopVideos(5),
      getMostViewed('24h'),
      getMostViewed('7d'),
      getMostViewed('30d'),
      getIPMonthOnMonthGrowth(),
    ])

    return (
      <ScreenRotator
        stats={stats}
        topVideos={topVideos}
        viewedEntries={{ '24h': viewed24h, '7d': viewed7d, '30d': viewed30d }}
        ipGrowthEntries={ipGrowthEntries}
        lastUpdated={new Date()}
      />
    )
  } catch (err) {
    console.error('[display] failed to load data:', err)
    return (
      <ScreenRotator
        stats={EMPTY_STATS}
        topVideos={[]}
        viewedEntries={EMPTY_ENTRIES}
        ipGrowthEntries={[] as IPGrowthEntry[]}
        lastUpdated={new Date()}
      />
    )
  }
}
