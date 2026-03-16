-- ============================================================
-- Content Leaderboard TV — Seed Data (Development)
-- Run AFTER schema.sql
-- ============================================================

-- Brands
insert into brands (id, name) values
  ('b1000000-0000-0000-0000-000000000001', 'MediaCo'),
  ('b2000000-0000-0000-0000-000000000002', 'TechGroup')
on conflict do nothing;

-- IPs
insert into ips (id, brand_id, name, active) values
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'ReactionTest', true),
  ('a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'TechToday', true),
  ('a3000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000002', 'BuildIndia', true),
  ('a4000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000002', 'SpaceHunt', true),
  ('a5000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000002', 'FoodieIndia', true)
on conflict do nothing;

-- Videos
insert into videos (id, ip_id, platform, platform_video_id, title, published_at) values
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'youtube',   'yt_bridge',   'Why Bridges Fail',         now() - interval '6 hours'),
  ('c2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'instagram', 'ig_aichip',   'AI Chip War Explained',     now() - interval '10 hours'),
  ('c3000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000003', 'youtube',   'yt_mumbai',   'Mumbai Metro Deep Dive',    now() - interval '12 hours'),
  ('c4000000-0000-0000-0000-000000000004', 'a4000000-0000-0000-0000-000000000004', 'youtube',   'yt_space',    'India Space Mission 2025',  now() - interval '20 hours'),
  ('c5000000-0000-0000-0000-000000000005', 'a5000000-0000-0000-0000-000000000005', 'instagram', 'ig_food',     'Street Food Champions',     now() - interval '3 hours')
on conflict do nothing;

-- Metrics snapshots (views)
insert into metrics (video_id, metric_name, value, timestamp) values
  ('c1000000-0000-0000-0000-000000000001', 'views',    1800000, now()),
  ('c1000000-0000-0000-0000-000000000001', 'likes',      42000, now()),
  ('c1000000-0000-0000-0000-000000000001', 'comments',    3100, now()),
  ('c1000000-0000-0000-0000-000000000001', 'shares',      8200, now()),

  ('c2000000-0000-0000-0000-000000000002', 'views',    1500000, now()),
  ('c2000000-0000-0000-0000-000000000002', 'likes',      38000, now()),
  ('c2000000-0000-0000-0000-000000000002', 'comments',    2400, now()),
  ('c2000000-0000-0000-0000-000000000002', 'shares',     11000, now()),

  ('c3000000-0000-0000-0000-000000000003', 'views',    1200000, now()),
  ('c3000000-0000-0000-0000-000000000003', 'likes',      27000, now()),
  ('c3000000-0000-0000-0000-000000000003', 'comments',    1900, now()),
  ('c3000000-0000-0000-0000-000000000003', 'shares',      5600, now()),

  ('c4000000-0000-0000-0000-000000000004', 'views',     980000, now()),
  ('c4000000-0000-0000-0000-000000000004', 'likes',      22000, now()),
  ('c4000000-0000-0000-0000-000000000004', 'comments',    1500, now()),
  ('c4000000-0000-0000-0000-000000000004', 'shares',      4200, now()),

  ('c5000000-0000-0000-0000-000000000005', 'views',     870000, now()),
  ('c5000000-0000-0000-0000-000000000005', 'likes',      19000, now()),
  ('c5000000-0000-0000-0000-000000000005', 'comments',    1200, now()),
  ('c5000000-0000-0000-0000-000000000005', 'shares',      3800, now());

-- IP Monthly Metrics (for MoM growth)
insert into ip_monthly_metrics (ip_id, month, total_views, total_interactions) values
  -- current month
  ('a1000000-0000-0000-0000-000000000001', date_trunc('month', now())::date, 22000000, 1200000),
  ('a2000000-0000-0000-0000-000000000002', date_trunc('month', now())::date, 18000000,  980000),
  ('a3000000-0000-0000-0000-000000000003', date_trunc('month', now())::date, 12000000,  640000),
  ('a4000000-0000-0000-0000-000000000004', date_trunc('month', now())::date,  9500000,  420000),
  ('a5000000-0000-0000-0000-000000000005', date_trunc('month', now())::date,  7800000,  310000),
  -- previous month
  ('a1000000-0000-0000-0000-000000000001', (date_trunc('month', now()) - interval '1 month')::date, 14000000,  850000),
  ('a2000000-0000-0000-0000-000000000002', (date_trunc('month', now()) - interval '1 month')::date, 13000000,  710000),
  ('a3000000-0000-0000-0000-000000000003', (date_trunc('month', now()) - interval '1 month')::date, 10000000,  530000),
  ('a4000000-0000-0000-0000-000000000004', (date_trunc('month', now()) - interval '1 month')::date,  8200000,  380000),
  ('a5000000-0000-0000-0000-000000000005', (date_trunc('month', now()) - interval '1 month')::date,  7100000,  280000)
on conflict do nothing;
