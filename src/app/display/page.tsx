import ScreenRotator from '@/components/ScreenRotator'
import {
  getCompanyStats,
  getTopVideos,
  getMostViewed,
  getIPMonthOnMonthGrowth,
} from '@/lib/db/queries'

export default async function DisplayPage() {
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

  const viewedEntries = { '24h': viewed24h, '7d': viewed7d, '30d': viewed30d }

  return (
    <ScreenRotator
      stats={stats}
      topVideos={topVideos}
      viewedEntries={viewedEntries}
      ipGrowthEntries={ipGrowthEntries}
      lastUpdated={new Date()}
    />
  )
}
