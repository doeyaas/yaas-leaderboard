/**
 * Dummy in-memory tables that mirror the Supabase schema exactly.
 * Replace with real Supabase queries when the project is set up.
 */

import type { Brand, IP, Video, Metric, LeaderboardEntry, IPMonthlyMetric } from '@/lib/types'

// ─── brands ───────────────────────────────────────────────
export const BRANDS: Brand[] = [
  { id: 'brand-1', name: 'MediaCo' },
  { id: 'brand-2', name: 'TechGroup' },
  { id: 'brand-3', name: 'FoodNetwork' },
]

// ─── ips ──────────────────────────────────────────────────
export const IPS: IP[] = [
  { id: 'ip-1', brand_id: 'brand-1', name: 'ReactionTest',   logo_url: null, youtube_channel_id: 'UCabc001', instagram_handle: 'reactiontest',   active: true },
  { id: 'ip-2', brand_id: 'brand-1', name: 'TechToday',      logo_url: null, youtube_channel_id: 'UCabc002', instagram_handle: 'techtoday',       active: true },
  { id: 'ip-3', brand_id: 'brand-2', name: 'BuildIndia',     logo_url: null, youtube_channel_id: 'UCabc003', instagram_handle: 'buildindia',      active: true },
  { id: 'ip-4', brand_id: 'brand-2', name: 'SpaceHunt',      logo_url: null, youtube_channel_id: 'UCabc004', instagram_handle: 'spacehunt',       active: true },
  { id: 'ip-5', brand_id: 'brand-3', name: 'FoodieIndia',    logo_url: null, youtube_channel_id: null,        instagram_handle: 'foodieindia',     active: true },
  { id: 'ip-6', brand_id: 'brand-1', name: 'HistoryUnboxed', logo_url: null, youtube_channel_id: 'UCabc006', instagram_handle: 'historyunboxed',  active: true },
  { id: 'ip-7', brand_id: 'brand-2', name: 'ScienceBurst',   logo_url: null, youtube_channel_id: 'UCabc007', instagram_handle: 'scienceburst',    active: true },
  { id: 'ip-8', brand_id: 'brand-3', name: 'SportsPulse',    logo_url: null, youtube_channel_id: null,        instagram_handle: 'sportspulse',     active: true },
  { id: 'ip-9', brand_id: 'brand-1', name: 'CrimeFiles',     logo_url: null, youtube_channel_id: 'UCabc009', instagram_handle: 'crimefiles',      active: true },
  { id: 'ip-10',brand_id: 'brand-2', name: 'EcoWatch',       logo_url: null, youtube_channel_id: 'UCabc010', instagram_handle: 'ecowatch',        active: true },
]

// ─── videos ───────────────────────────────────────────────
const d = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3_600_000).toISOString()

export const VIDEOS: Video[] = [
  // ReactionTest (ip-1)
  { id: 'v-01', ip_id: 'ip-1',  platform: 'youtube',   platform_video_id: 'yt_bridge',    title: 'Why Bridges Fail',              thumbnail_url: null, published_at: d(6)  },
  { id: 'v-02', ip_id: 'ip-1',  platform: 'youtube',   platform_video_id: 'yt_dam',       title: 'Dam vs Earthquake',             thumbnail_url: null, published_at: d(52) },
  { id: 'v-03', ip_id: 'ip-1',  platform: 'instagram', platform_video_id: 'ig_react1',    title: 'Architects React to Designs',   thumbnail_url: null, published_at: d(130)},
  // TechToday (ip-2)
  { id: 'v-04', ip_id: 'ip-2',  platform: 'instagram', platform_video_id: 'ig_aichip',    title: 'AI Chip War Explained',         thumbnail_url: null, published_at: d(10) },
  { id: 'v-05', ip_id: 'ip-2',  platform: 'youtube',   platform_video_id: 'yt_quantum',   title: 'Quantum Computing in 5 Mins',   thumbnail_url: null, published_at: d(80) },
  { id: 'v-06', ip_id: 'ip-2',  platform: 'instagram', platform_video_id: 'ig_ev',        title: 'EV Battery Deep Dive',          thumbnail_url: null, published_at: d(200)},
  // BuildIndia (ip-3)
  { id: 'v-07', ip_id: 'ip-3',  platform: 'youtube',   platform_video_id: 'yt_metro',     title: 'Mumbai Metro Deep Dive',        thumbnail_url: null, published_at: d(12) },
  { id: 'v-08', ip_id: 'ip-3',  platform: 'youtube',   platform_video_id: 'yt_highway',   title: 'NH 48 Highway Story',           thumbnail_url: null, published_at: d(95) },
  // SpaceHunt (ip-4)
  { id: 'v-09', ip_id: 'ip-4',  platform: 'youtube',   platform_video_id: 'yt_space',     title: 'India Space Mission 2025',      thumbnail_url: null, published_at: d(20) },
  { id: 'v-10', ip_id: 'ip-4',  platform: 'instagram', platform_video_id: 'ig_mars',      title: 'Mars Colonisation Timeline',    thumbnail_url: null, published_at: d(160)},
  // FoodieIndia (ip-5)
  { id: 'v-11', ip_id: 'ip-5',  platform: 'instagram', platform_video_id: 'ig_food',      title: 'Street Food Champions',         thumbnail_url: null, published_at: d(3)  },
  { id: 'v-12', ip_id: 'ip-5',  platform: 'instagram', platform_video_id: 'ig_biryani',   title: 'Best Biryani in India',         thumbnail_url: null, published_at: d(170)},
  // HistoryUnboxed (ip-6)
  { id: 'v-13', ip_id: 'ip-6',  platform: 'youtube',   platform_video_id: 'yt_mughal',    title: 'Mughal Empire Explained',       thumbnail_url: null, published_at: d(18) },
  { id: 'v-14', ip_id: 'ip-6',  platform: 'instagram', platform_video_id: 'ig_indus',     title: 'Indus Valley Secrets',          thumbnail_url: null, published_at: d(110)},
  // ScienceBurst (ip-7)
  { id: 'v-15', ip_id: 'ip-7',  platform: 'youtube',   platform_video_id: 'yt_blackhole', title: 'Black Holes Simplified',        thumbnail_url: null, published_at: d(22) },
  { id: 'v-16', ip_id: 'ip-7',  platform: 'instagram', platform_video_id: 'ig_dna',       title: 'How DNA Editing Works',         thumbnail_url: null, published_at: d(145)},
  // SportsPulse (ip-8)
  { id: 'v-17', ip_id: 'ip-8',  platform: 'instagram', platform_video_id: 'ig_ipl',       title: 'IPL 2025 Highlights',           thumbnail_url: null, published_at: d(5)  },
  { id: 'v-18', ip_id: 'ip-8',  platform: 'instagram', platform_video_id: 'ig_kabaddi',   title: 'Kabaddi World Cup Preview',     thumbnail_url: null, published_at: d(190)},
  // CrimeFiles (ip-9)
  { id: 'v-19', ip_id: 'ip-9',  platform: 'youtube',   platform_video_id: 'yt_heist',     title: 'The Mumbai Bank Heist Case',    thumbnail_url: null, published_at: d(14) },
  { id: 'v-20', ip_id: 'ip-9',  platform: 'youtube',   platform_video_id: 'yt_fraud',     title: 'Biggest Ponzi Schemes in India',thumbnail_url: null, published_at: d(220)},
  // EcoWatch (ip-10)
  { id: 'v-21', ip_id: 'ip-10', platform: 'youtube',   platform_video_id: 'yt_glacier',   title: 'Glaciers Are Disappearing',     thumbnail_url: null, published_at: d(30) },
  { id: 'v-22', ip_id: 'ip-10', platform: 'instagram', platform_video_id: 'ig_coral',     title: 'Coral Reef Crisis',             thumbnail_url: null, published_at: d(180)},
]

// ─── metrics ──────────────────────────────────────────────
// One snapshot row per metric per video (latest values)
type RawMetric = Omit<Metric, 'id'> & { id: string }

function m(videoId: string, views: number, likes: number, comments: number, shares: number): RawMetric[] {
  const ts = new Date().toISOString()
  return [
    { id: `m-${videoId}-v`, video_id: videoId, metric_name: 'views',    value: views,    timestamp: ts },
    { id: `m-${videoId}-l`, video_id: videoId, metric_name: 'likes',    value: likes,    timestamp: ts },
    { id: `m-${videoId}-c`, video_id: videoId, metric_name: 'comments', value: comments, timestamp: ts },
    { id: `m-${videoId}-s`, video_id: videoId, metric_name: 'shares',   value: shares,   timestamp: ts },
  ]
}

export const METRICS: RawMetric[] = [
  ...m('v-01', 1_800_000, 42_000, 3_100, 8_200),
  ...m('v-02', 4_200_000, 98_000, 7_400, 19_000),
  ...m('v-03', 9_100_000, 210_000, 15_000, 44_000),
  ...m('v-04', 1_500_000, 38_000, 2_400, 11_000),
  ...m('v-05', 3_600_000, 82_000, 6_100, 15_500),
  ...m('v-06', 7_800_000, 180_000, 12_200, 36_000),
  ...m('v-07', 1_200_000, 27_000, 1_900, 5_600),
  ...m('v-08', 2_900_000, 64_000, 4_800, 12_000),
  ...m('v-09',   980_000, 22_000, 1_500, 4_200),
  ...m('v-10', 6_400_000, 148_000, 11_000, 29_000),
  ...m('v-11',   870_000, 19_000, 1_200, 3_800),
  ...m('v-12', 5_200_000, 122_000, 8_900, 23_000),
  ...m('v-13',   760_000, 17_000, 1_100, 3_200),
  ...m('v-14', 3_100_000, 72_000, 5_400, 14_000),
  ...m('v-15',   650_000, 15_000,   980, 2_900),
  ...m('v-16', 2_400_000, 56_000, 4_100, 10_500),
  ...m('v-17',   590_000, 14_000,   880, 2_700),
  ...m('v-18', 1_900_000, 44_000, 3_300, 8_600),
  ...m('v-19',   520_000, 12_500,   800, 2_400),
  ...m('v-20', 1_400_000, 33_000, 2_500, 6_400),
  ...m('v-21',   480_000, 11_000,   720, 2_100),
  ...m('v-22', 1_100_000, 26_000, 1_950, 5_100),
]

// ─── ip_monthly_metrics ───────────────────────────────────
const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 10)

export const IP_MONTHLY_METRICS: IPMonthlyMetric[] = [
  // current month
  { id: 'imm-01', ip_id: 'ip-1',  month: thisMonth, total_views: 22_000_000, total_interactions: 1_200_000 },
  { id: 'imm-02', ip_id: 'ip-2',  month: thisMonth, total_views: 18_000_000, total_interactions:   980_000 },
  { id: 'imm-03', ip_id: 'ip-3',  month: thisMonth, total_views: 12_000_000, total_interactions:   640_000 },
  { id: 'imm-04', ip_id: 'ip-4',  month: thisMonth, total_views:  9_500_000, total_interactions:   420_000 },
  { id: 'imm-05', ip_id: 'ip-5',  month: thisMonth, total_views:  7_800_000, total_interactions:   310_000 },
  { id: 'imm-06', ip_id: 'ip-6',  month: thisMonth, total_views:  6_400_000, total_interactions:   275_000 },
  { id: 'imm-07', ip_id: 'ip-7',  month: thisMonth, total_views:  5_100_000, total_interactions:   218_000 },
  { id: 'imm-08', ip_id: 'ip-8',  month: thisMonth, total_views:  4_200_000, total_interactions:   190_000 },
  { id: 'imm-09', ip_id: 'ip-9',  month: thisMonth, total_views:  3_600_000, total_interactions:   155_000 },
  { id: 'imm-10', ip_id: 'ip-10', month: thisMonth, total_views:  2_900_000, total_interactions:   118_000 },
  // previous month
  { id: 'imm-11', ip_id: 'ip-1',  month: lastMonth, total_views: 14_000_000, total_interactions:   850_000 },
  { id: 'imm-12', ip_id: 'ip-2',  month: lastMonth, total_views: 13_000_000, total_interactions:   710_000 },
  { id: 'imm-13', ip_id: 'ip-3',  month: lastMonth, total_views: 10_000_000, total_interactions:   530_000 },
  { id: 'imm-14', ip_id: 'ip-4',  month: lastMonth, total_views:  8_200_000, total_interactions:   380_000 },
  { id: 'imm-15', ip_id: 'ip-5',  month: lastMonth, total_views:  7_100_000, total_interactions:   280_000 },
  { id: 'imm-16', ip_id: 'ip-6',  month: lastMonth, total_views:  4_100_000, total_interactions:   192_000 },
  { id: 'imm-17', ip_id: 'ip-7',  month: lastMonth, total_views:  4_800_000, total_interactions:   204_000 },
  { id: 'imm-18', ip_id: 'ip-8',  month: lastMonth, total_views:  3_100_000, total_interactions:   148_000 },
  { id: 'imm-19', ip_id: 'ip-9',  month: lastMonth, total_views:  3_900_000, total_interactions:   162_000 },
  { id: 'imm-20', ip_id: 'ip-10', month: lastMonth, total_views:  1_900_000, total_interactions:    80_000 },
]
