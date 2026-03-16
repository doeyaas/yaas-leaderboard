-- ============================================================
-- Content Leaderboard TV — Supabase Schema (v2)
-- Run this in the Supabase SQL Editor to initialize tables.
-- ============================================================

-- Brands
create table if not exists brands (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  created_at timestamptz not null default now()
);

-- IPs (content channels / properties)
-- color: hex string for F1 livery — must be set per IP (e.g. '#e10600')
create table if not exists ips (
  id                   uuid        primary key default gen_random_uuid(),
  brand_id             uuid        references brands(id) on delete set null,
  name                 text        not null,
  color                text        not null default '#666666',
  logo_url             text,
  youtube_channel_id   text,
  instagram_handle     text,
  active               boolean     not null default true,
  created_at           timestamptz not null default now()
);

-- Videos
-- unique constraint on (platform, platform_video_id) — not globally on platform_video_id alone
-- is_deleted: set true if the video is removed from the platform
create table if not exists videos (
  id                uuid        primary key default gen_random_uuid(),
  ip_id             uuid        not null references ips(id) on delete cascade,
  platform          text        not null check (platform in ('youtube', 'instagram')),
  platform_video_id text        not null,
  title             text,
  thumbnail_url     text,
  published_at      timestamptz,
  is_deleted        boolean     not null default false,
  created_at        timestamptz not null default now(),
  unique (platform, platform_video_id)
);

-- Metrics (time-series snapshots, appended each scrape cycle)
-- metric_name: validated at app layer (not constrained here) for forward compatibility
-- scraped_at: renamed from 'timestamp' to avoid SQL reserved word collision
create table if not exists metrics (
  id          uuid        primary key default gen_random_uuid(),
  video_id    uuid        not null references videos(id) on delete cascade,
  metric_name text        not null,
  value       bigint      not null default 0,
  scraped_at  timestamptz not null default now()
);

-- Optimised for "latest value of metric X for video Y" — the primary dashboard query
create index if not exists metrics_video_metric_time_idx
  on metrics (video_id, metric_name, scraped_at desc);

create index if not exists metrics_metric_name_idx
  on metrics (metric_name);

-- Leaderboard (pre-computed, refreshed after each scrape cycle)
-- category: 'most_viewed' only for now — widen the check if new screens are added later
create table if not exists leaderboard (
  id          uuid        primary key default gen_random_uuid(),
  category    text        not null check (category in ('most_viewed')),
  time_window text        not null check (time_window in ('24h', '7d', '30d')),
  rank        int         not null,
  video_id    uuid        not null references videos(id) on delete cascade,
  score       numeric     not null default 0,
  updated_at  timestamptz not null default now(),
  unique (category, time_window, rank)
);

-- IP Monthly Metrics (aggregated, for MoM growth screen)
create table if not exists ip_monthly_metrics (
  id                  uuid    primary key default gen_random_uuid(),
  ip_id               uuid    not null references ips(id) on delete cascade,
  month               date    not null, -- first day of the month, e.g. 2026-03-01
  total_views         bigint  not null default 0,
  total_interactions  bigint  not null default 0, -- likes + comments (shares not available)
  unique (ip_id, month)
);

-- Scrape Log (audit trail for every scraper run)
create table if not exists scrape_log (
  id                uuid        primary key default gen_random_uuid(),
  platform          text        not null, -- 'youtube' or 'instagram'
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,          -- null if the job crashed mid-run
  videos_found      int         not null default 0,
  videos_upserted   int         not null default 0,
  metrics_inserted  int         not null default 0,
  error_message     text,                 -- populated on failure
  triggered_by      text        not null default 'cron' -- 'cron' or 'manual'
);

-- ============================================================
-- Row Level Security (enable after connecting auth if needed)
-- ============================================================
-- alter table brands enable row level security;
-- alter table ips enable row level security;
-- alter table videos enable row level security;
-- alter table metrics enable row level security;
-- alter table leaderboard enable row level security;
-- alter table ip_monthly_metrics enable row level security;
-- alter table scrape_log enable row level security;
