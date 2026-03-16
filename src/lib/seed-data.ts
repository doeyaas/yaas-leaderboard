import type { LeaderboardEntry, IPGrowthEntry, CompanyStats } from './types'

export const COMPANY_STATS: CompanyStats = {
  views_24h: 18_200_000,
  views_7d: 92_400_000,
  views_30d: 402_000_000,
  total_interactions: 3_400_000,
  total_videos: 248,
  total_active_ips: 12,
}

export const SAMPLE_ENTRIES: LeaderboardEntry[] = [
  {
    id: '1', category: 'most_viewed', time_window: '24h', rank: 1,
    video_id: 'v1', score: 1_800_000, updated_at: new Date().toISOString(),
    video: {
      id: 'v1', ip_id: 'ip1', platform: 'youtube',
      platform_video_id: 'yt1', title: 'Why Bridges Fail',
      thumbnail_url: null, published_at: new Date().toISOString(),
      views: 1_800_000, likes: 42_000, comments: 3_100, shares: 8_200, velocity: 75_000,
      ip: { id: 'ip1', brand_id: 'b1', name: 'ReactionTest', logo_url: null, youtube_channel_id: null, instagram_handle: null, active: true },
    },
  },
  {
    id: '2', category: 'most_viewed', time_window: '24h', rank: 2,
    video_id: 'v2', score: 1_500_000, updated_at: new Date().toISOString(),
    video: {
      id: 'v2', ip_id: 'ip2', platform: 'instagram',
      platform_video_id: 'ig1', title: 'AI Chip War Explained',
      thumbnail_url: null, published_at: new Date().toISOString(),
      views: 1_500_000, likes: 38_000, comments: 2_400, shares: 11_000, velocity: 62_500,
      ip: { id: 'ip2', brand_id: 'b1', name: 'TechToday', logo_url: null, youtube_channel_id: null, instagram_handle: null, active: true },
    },
  },
  {
    id: '3', category: 'most_viewed', time_window: '24h', rank: 3,
    video_id: 'v3', score: 1_200_000, updated_at: new Date().toISOString(),
    video: {
      id: 'v3', ip_id: 'ip3', platform: 'youtube',
      platform_video_id: 'yt2', title: 'Mumbai Metro Deep Dive',
      thumbnail_url: null, published_at: new Date().toISOString(),
      views: 1_200_000, likes: 27_000, comments: 1_900, shares: 5_600, velocity: 50_000,
      ip: { id: 'ip3', brand_id: 'b2', name: 'BuildIndia', logo_url: null, youtube_channel_id: null, instagram_handle: null, active: true },
    },
  },
  {
    id: '4', category: 'most_viewed', time_window: '24h', rank: 4,
    video_id: 'v4', score: 980_000, updated_at: new Date().toISOString(),
    video: {
      id: 'v4', ip_id: 'ip4', platform: 'youtube',
      platform_video_id: 'yt3', title: 'India Space Mission 2025',
      thumbnail_url: null, published_at: new Date().toISOString(),
      views: 980_000, likes: 22_000, comments: 1_500, shares: 4_200, velocity: 40_800,
      ip: { id: 'ip4', brand_id: 'b2', name: 'SpaceHunt', logo_url: null, youtube_channel_id: null, instagram_handle: null, active: true },
    },
  },
  {
    id: '5', category: 'most_viewed', time_window: '24h', rank: 5,
    video_id: 'v5', score: 870_000, updated_at: new Date().toISOString(),
    video: {
      id: 'v5', ip_id: 'ip5', platform: 'instagram',
      platform_video_id: 'ig2', title: 'Street Food Champions',
      thumbnail_url: null, published_at: new Date().toISOString(),
      views: 870_000, likes: 19_000, comments: 1_200, shares: 3_800, velocity: 36_250,
      ip: { id: 'ip5', brand_id: 'b3', name: 'FoodieIndia', logo_url: null, youtube_channel_id: null, instagram_handle: null, active: true },
    },
  },
]

export const SAMPLE_IP_GROWTH: IPGrowthEntry[] = [
  { rank: 1, current_month_views: 22_000_000, previous_month_views: 14_000_000, growth_percentage: 57.1, ip: { id: 'ip1', brand_id: 'b1', name: 'ReactionTest', logo_url: null, youtube_channel_id: null, instagram_handle: null, active: true } },
  { rank: 2, current_month_views: 18_000_000, previous_month_views: 13_000_000, growth_percentage: 38.5, ip: { id: 'ip2', brand_id: 'b1', name: 'TechToday', logo_url: null, youtube_channel_id: null, instagram_handle: null, active: true } },
  { rank: 3, current_month_views: 12_000_000, previous_month_views: 10_000_000, growth_percentage: 20.0, ip: { id: 'ip3', brand_id: 'b2', name: 'BuildIndia', logo_url: null, youtube_channel_id: null, instagram_handle: null, active: true } },
  { rank: 4, current_month_views: 9_500_000, previous_month_views: 8_200_000, growth_percentage: 15.9, ip: { id: 'ip4', brand_id: 'b2', name: 'SpaceHunt', logo_url: null, youtube_channel_id: null, instagram_handle: null, active: true } },
  { rank: 5, current_month_views: 7_800_000, previous_month_views: 7_100_000, growth_percentage: 9.9, ip: { id: 'ip5', brand_id: 'b3', name: 'FoodieIndia', logo_url: null, youtube_channel_id: null, instagram_handle: null, active: true } },
]
