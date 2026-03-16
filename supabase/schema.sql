-- ============================================================
-- Content Leaderboard TV — Supabase Schema
-- Run this in the Supabase SQL Editor to initialize tables.
-- ============================================================

-- Brands
create table if not exists brands (
  id   uuid primary key default gen_random_uuid(),
  name text not null
);

-- IPs (content channels / properties)
create table if not exists ips (
  id                   uuid primary key default gen_random_uuid(),
  brand_id             uuid references brands(id) on delete set null,
  name                 text not null,
  logo_url             text,
  youtube_channel_id   text,
  instagram_handle     text,
  active               boolean not null default true,
  created_at           timestamptz not null default now()
);

-- Videos
create table if not exists videos (
  id                uuid primary key default gen_random_uuid(),
  ip_id             uuid not null references ips(id) on delete cascade,
  platform          text not null check (platform in ('youtube', 'instagram')),
  platform_video_id text not null unique,
  title             text,
  thumbnail_url     text,
  published_at      timestamptz,
  created_at        timestamptz not null default now()
);

-- Metrics (time-series snapshots, appended each fetch cycle)
create table if not exists metrics (
  id          uuid primary key default gen_random_uuid(),
  video_id    uuid not null references videos(id) on delete cascade,
  metric_name text not null check (metric_name in ('views', 'likes', 'comments', 'shares')),
  value       bigint not null default 0,
  timestamp   timestamptz not null default now()
);

create index if not exists metrics_video_id_timestamp_idx on metrics (video_id, timestamp desc);
create index if not exists metrics_metric_name_idx on metrics (metric_name);

-- Leaderboard (pre-computed, refreshed 3× per day)
create table if not exists leaderboard (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('most_viewed', 'most_interactions', 'fastest_growing')),
  time_window text not null check (time_window in ('24h', '7d', '30d')),
  rank        int not null,
  video_id    uuid not null references videos(id) on delete cascade,
  score       numeric not null default 0,
  updated_at  timestamptz not null default now(),
  unique (category, time_window, rank)
);

-- IP Monthly Metrics (aggregated, for MoM growth)
create table if not exists ip_monthly_metrics (
  id                  uuid primary key default gen_random_uuid(),
  ip_id               uuid not null references ips(id) on delete cascade,
  month               date not null, -- first day of the month
  total_views         bigint not null default 0,
  total_interactions  bigint not null default 0,
  unique (ip_id, month)
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
