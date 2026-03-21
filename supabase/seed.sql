-- ============================================================
-- Content Leaderboard TV — Seed Data (Real IPs)
-- Run AFTER schema.sql
-- ============================================================

-- Brand
insert into brands (id, name) values
  ('00000000-0000-0000-0000-000000000001', 'YAAS Studio')
on conflict do nothing;

-- IPs
-- youtube_channel_id: stored as @handle — scraper resolves to UC... ID automatically
-- instagram_handle:   username without @
insert into ips (id, brand_id, name, color, logo_url, youtube_channel_id, instagram_handle, active) values
  (
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Vitamin Tech',
    '#00d2be',
    '/ip_logo/vitamintech.jpg',
    '@Vi.taminTech',
    'vi.tamin.tech',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Death of PC',
    '#e10600',
    '/ip_logo/deathofpc.jpg',
    '@deathofpc',
    'death.of.pc',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Hackonomics',
    '#0090ff',
    '/ip_logo/hackonomics.jpg',
    '@Hackonomics_ai',
    'hackonomics.ai',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Hooked.exe',
    '#9b59b6',
    '/ip_logo/hookedexe.jpg',
    null,
    'hooked._.exe',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'Sizzleroom',
    '#ff8000',
    '/ip_logo/sizzleroom.jpg',
    '@SizzleRoom',
    'sizzleroom',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000006',
    '00000000-0000-0000-0000-000000000001',
    'Builders Central',
    '#39b54a',
    '/ip_logo/builderscentral.jpg',
    '@BuildersCentral',
    'builders.central',
    true
  )
on conflict do nothing;
