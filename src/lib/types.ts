export type Platform = 'youtube' | 'instagram'

export type TimeWindow = '24h' | '7d' | '30d'

export type LeaderboardCategory = 'most_viewed'

export interface Brand {
  id: string
  name: string
}

export interface IP {
  id: string
  brand_id: string
  name: string
  color: string
  logo_url: string | null
  youtube_channel_id: string | null
  instagram_handle: string | null
  active: boolean
  brand?: Brand
}

export interface Video {
  id: string
  ip_id: string
  platform: Platform
  platform_video_id: string
  title: string
  thumbnail_url: string | null
  published_at: string
  is_deleted: boolean
  ip?: IP
}

export interface Metric {
  id: string
  video_id: string
  metric_name: 'views' | 'likes' | 'comments'
  value: number
  scraped_at: string
}

export interface LeaderboardEntry {
  id: string
  category: LeaderboardCategory
  time_window: TimeWindow
  rank: number
  video_id: string
  score: number
  updated_at: string
  video?: Video & {
    views?: number
    likes?: number
    comments?: number
    velocity?: number
  }
}

export interface IPMonthlyMetric {
  id: string
  ip_id: string
  month: string
  total_views: number
  total_interactions: number
  ip?: IP
}

export interface IPGrowthEntry {
  ip: IP
  current_month_views: number
  previous_month_views: number
  growth_percentage: number
  rank: number
}

export interface CompanyStats {
  views_24h: number
  views_7d: number
  views_30d: number
  total_interactions: number
  total_videos: number
  total_active_ips: number
}
