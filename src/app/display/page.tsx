import ScreenRotator from '@/components/ScreenRotator'
import {
  getCompanyStats,
  getTopVideos,
  getMostViewed,
  getMostInteractions,
  getFastestGrowing,
  getIPMonthOnMonthGrowth,
} from '@/lib/db/queries'

export default function DisplayPage() {
  const stats    = getCompanyStats()
  const topVideos = getTopVideos(5)

  const viewedEntries      = { '24h': getMostViewed('24h'),       '7d': getMostViewed('7d'),       '30d': getMostViewed('30d')       }
  const interactionEntries = { '24h': getMostInteractions('24h'), '7d': getMostInteractions('7d'), '30d': getMostInteractions('30d') }
  const growingEntries     = { '24h': getFastestGrowing('24h'),   '7d': getFastestGrowing('7d'),   '30d': getFastestGrowing('30d')   }
  const ipGrowthEntries    = getIPMonthOnMonthGrowth()

  return (
    <ScreenRotator
      stats={stats}
      topVideos={topVideos}
      viewedEntries={viewedEntries}
      interactionEntries={interactionEntries}
      growingEntries={growingEntries}
      ipGrowthEntries={ipGrowthEntries}
      lastUpdated={new Date()}
    />
  )
}
