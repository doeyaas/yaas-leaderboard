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

insert into ips (id, brand_id, name, color, logo_url, youtube_channel_id, instagram_handle, active) values
  (
    '00000000-0000-0000-0001-000000000007',
    '00000000-0000-0000-0000-000000000001',
    'Lumio',
    '#f39c12',
    '/ip_logo/lumio.jpg',
    null,
    'lumio_in',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000008',
    '00000000-0000-0000-0000-000000000001',
    'The Money Hook',
    '#27ae60',
    '/ip_logo/themoneyhook.jpg',
    null,
    'the.money.hook',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000009',
    '00000000-0000-0000-0000-000000000001',
    'The Career Hook',
    '#2980b9',
    '/ip_logo/thecareerhook.jpg',
    null,
    'the.career.hook',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'Scroll Healthy',
    '#1abc9c',
    '/ip_logo/scrollhealthy.jpg',
    null,
    'scrollhealthy',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000011',
    '00000000-0000-0000-0000-000000000001',
    'Vitamin Pop',
    '#e74c3c',
    '/ip_logo/vitaminpop.jpg',
    null,
    'vitamin.pop',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000012',
    '00000000-0000-0000-0000-000000000001',
    'The Fincredibles',
    '#8e44ad',
    '/ip_logo/thefincredibles.jpg',
    null,
    'the.fincredibles',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000013',
    '00000000-0000-0000-0000-000000000001',
    'Full Disclosure',
    '#34495e',
    '/ip_logo/fulldisclosure.jpg',
    null,
    'fulldisclosure.ig',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000014',
    '00000000-0000-0000-0000-000000000001',
    'Supercharged GG',
    '#f1c40f',
    '/ip_logo/superchargedgg.jpg',
    null,
    'supercharged_gg',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000015',
    '00000000-0000-0000-0000-000000000001',
    'Fully Hooked',
    '#16a085',
    '/ip_logo/fullyhooked.jpg',
    null,
    'fully._.hooked',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000016',
    '00000000-0000-0000-0000-000000000001',
    'Life at YAAS',
    '#d35400',
    '/ip_logo/lifeatyaas.jpg',
    null,
    'lifeatyaas',
    true
  )
on conflict do nothing;
