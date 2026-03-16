# Content Leaderboard TV
Product Requirements Document (PRD)

Version: v1  
Owner: Content Strategy / Engineering  
Status: Draft

---

# 1. Overview

The Content Leaderboard TV is an internal analytics display system designed to showcase content performance across all IPs of the company.

The system aggregates data from YouTube and Instagram accounts associated with company IPs, computes performance metrics across multiple time windows, and displays ranked leaderboards on a vertically mounted 65-inch TV in the office.

The goal is to create visibility around content performance, foster internal competition, and help teams quickly understand which content is performing best.

---

# 2. Goals

## Primary Goals

1. Surface the top performing content across all IPs.
2. Provide a simple visual summary of company-wide content performance.
3. Encourage competition between IP teams.
4. Provide leadership with a quick overview of content output performance.
5. Track and display **IP self-growth month-on-month**, measuring how each IP grows relative to its own previous performance.

---

## Secondary Goals

1. Create a modular analytics foundation for future internal dashboards.
2. Support expansion to additional social platforms.
3. Enable historical performance tracking.

---

# 3. Non Goals

The following are intentionally excluded from Version 1:

- Competitor tracking
- Advanced analytics dashboards
- Trend charts and graphs
- User accounts or authentication systems
- Mobile or desktop UI versions

The system is designed specifically for a **large office display screen**.

---

# 4. Users

## Viewer

Team members who see the leaderboard on the office TV.

Purpose:
- Identify top performing content
- Track company-wide performance
- Monitor performance of their IPs

---

## Admin

Operations or content strategy team managing connected IPs.

Purpose:
- Add or edit IP connections
- Connect YouTube and Instagram accounts
- Manage platform integrations

---

# 5. Platforms

## Data Sources

YouTube  
Instagram

Instagram data will be retrieved using either:

Instagram Graph API (preferred)  
or  
Instagram scraping service (fallback)

---

## Technology Stack

Frontend

Next.js

Hosting

Vercel

Database

Supabase

Repository

GitHub

---

# 6. System Architecture

```

YouTube API
Instagram Graph API / Scraper
│
│
Data Fetch Jobs
│
▼
Supabase Database
│
▼
Leaderboard Computation
│
▼
Next.js TV Dashboard
│
▼
Office TV Screen

```

---

# 7. Data Update Schedule

The system updates three times per day.

12:00 PM  
3:00 PM  
7:00 PM

Each update cycle performs the following steps:

1. Fetch latest metrics from all platforms
2. Store metric snapshots
3. Recompute leaderboard rankings
4. Update dashboard data

---

# 8. Time Windows

The leaderboard supports rolling time windows.

## Daily

0–24 hours from current time

Example

If current time = 7 PM

Daily window = Yesterday 7 PM → Today 7 PM

---

## Weekly

Last 7 days from current time

---

## Monthly

Last 30 days from current time

---

# 9. Leaderboard Categories

Each leaderboard displays **Top 10 videos**.

## Most Viewed

Videos ranked by total views in the selected time window.

---

## Most Interactions

Videos ranked by:

likes + comments + shares

---

## Fastest Growing Videos

Videos ranked by view increase during the selected time window.

---

## IP Month-on-Month Growth

Ranks IPs by their **percentage growth compared to their own previous month performance**.

This metric measures how much an IP has grown relative to itself.

### Calculation

```

Month-on-Month Growth % =
(Current Month Views - Previous Month Views) / Previous Month Views * 100

```

Example

| Rank | Logo | IP Name | Current Month Views | Previous Month Views | Growth |
|-----|-----|-----|-----|-----|-----|
| 1 | Logo | ReactionTest | 22M | 14M | +57% |
| 2 | Logo | TechToday | 18M | 13M | +38% |
| 3 | Logo | BuildIndia | 12M | 10M | +20% |

This leaderboard focuses on **IP performance improvement rather than absolute scale**.

---

# 10. Screen Structure

The display rotates between three screens.

Each screen remains visible for:

5 minutes

---

## Screen 1 — Company Overview

Displays aggregated company performance plus the top 5 videos in the last 24 hours.

### Performance Counters

24 Hour Views
7 Day Views
30 Day Views
Total Interactions
Total Videos Posted
Total Active IPs

---

### Top Videos Snapshot

Shows the Top 5 most viewed videos in the last 24 hours.

Columns:

Rank | IP (with brand color) | Platform icon | Video Title | Views

Example:

1 | ReactionTest | YT | Why Bridges Fail | 1.8M
2 | TechToday | IG | AI Chip War | 1.5M
3 | BuildIndia | YT | Mumbai Metro | 1.2M

---

## Screen 2 — Most Viewed

Shows Top 10 videos across three time windows side by side.

Sections:

Sector 1 — Last 24 Hours
Sector 2 — Last 7 Days
Sector 3 — Last 30 Days

---

## Screen 3 — IP Month-on-Month Growth

Displays each IP's performance growth compared to its own previous month.

Columns:

Rank
IP Name (with brand color)
Current Month Views
Previous Month Views
Growth Percentage

---

# 11. Leaderboard Table Layout

Leaderboard columns:

Rank  
Logo  
IP Name  
Video Title  
Platform  
Views  
Engagement  
Velocity

---

## Column Definitions

Rank

Position in leaderboard.

---

Logo

IP or brand icon.

---

IP Name

Content IP associated with the video.

---

Video Title

Shortened title of the video.

---

Platform

YouTube or Instagram.

---

Views

Total views within the selected time window.

---

Engagement

Calculated as:

likes + comments + shares

---

Velocity

Calculated as:

views gained per hour

---

# 12. Company Performance Counters

At the top of the screen:

Company Performance

Example:

24H Views: 18.2M  
7D Views: 92.4M  
30D Views: 402M

This shows the total reach generated by the company across all IPs.

---

# 13. Admin Interface

The admin interface allows management of IP connections.

---

## IP Information

Fields:

IP Name  
Brand  
Logo Upload  
Active / Disabled Status

---

## YouTube Integration

Fields:

YouTube Channel ID  
YouTube Channel URL

---

## Instagram Integration

If using Graph API.

Fields:

Instagram Handle  
Instagram Business Account ID  
Facebook Page ID  
Access Token  
Token Expiry

---

## OAuth Option

Admin can connect accounts via Meta login.

Process:

1. Click Connect Instagram
2. Login via Meta
3. Grant permissions
4. Access token stored automatically

---

# 14. Data Model

## Brands Table

Fields

id  
name  

---

## IP Table

Fields

id  
brand_id  
name  
logo_url  
youtube_channel_id  
instagram_handle  
active  

---

## Videos Table

Fields

id  
ip_id  
platform  
platform_video_id  
title  
thumbnail_url  
published_at  

---

## Metrics Table

Stores normalized metrics.

Fields

video_id  
metric_name  
value  
timestamp  

Example metrics

views  
likes  
comments  
shares  

---

## Leaderboard Table

Fields

category  
time_window  
rank  
video_id  
score  
updated_at  

---

## IP Monthly Metrics Table

Stores monthly aggregated IP metrics.

Fields

ip_id  
month  
total_views  
total_interactions  

Used for calculating month-on-month IP growth.

---

# 15. Data Correlation

All platform data is linked through IP.

Structure

Brand  
→ IP  
→ Platform Account  
→ Videos  
→ Metrics  

This allows unified analytics across platforms.

---

# 16. Failure Handling

If data fetching fails:

1. Last available data remains visible
2. Leaderboard rows become grey
3. Warning message displayed

Example:

Last updated at 12:00 PM  
Displaying previous data

---

# 17. Modularity

The architecture supports future platform additions.

Possible future integrations:

TikTok  
LinkedIn  
Twitter

Adding a new platform requires only:

1. Data ingestion service
2. Platform mapping to IP
3. Metric normalization

No database schema changes required.

---

# 18. Future Expansion

Potential features after v1.

Brand-level leaderboards

IP growth dashboards

Content analytics dashboard

Trending content alerts

Competitor benchmarking

Multi-office display screens

---

# 19. Success Criteria

The system is successful if:

Teams frequently reference the leaderboard.

Teams compete to reach top rankings.

Leadership uses the screen to gauge content output.

The system runs reliably without manual intervention.

---

# 20. Database Schema

The system uses Supabase (PostgreSQL). Below is the reviewed and finalised schema with issues from the original draft corrected.

---

## Schema Review — Issues Found and Fixed

The original draft had 7 issues that would have caused bugs or required painful migrations later.

| # | Issue | Original | Fix Applied |
|---|-------|----------|-------------|
| 1 | IP colors hardcoded in code by mock ID keys | ip-colors.ts maps `ip-1`, `ip-2` etc. | Added `color` column to `ips` table — stored in DB |
| 2 | `platform_video_id` unique constraint too broad | `unique(platform_video_id)` globally | Changed to `unique(platform, platform_video_id)` |
| 3 | No way to mark deleted videos | No `is_deleted` field | Added `is_deleted boolean default false` to `videos` |
| 4 | `metric_name` check constraint blocks future metrics | Locked to views/likes/comments/shares | Constraint removed — validated at app layer |
| 5 | Wrong index on `metrics` for "latest value" queries | Index on `(video_id, timestamp desc)` | Index changed to `(video_id, metric_name, timestamp desc)` |
| 6 | No scraper audit trail | No log table | Added `scrape_log` table |
| 7 | `leaderboard` categories include removed screens | most_interactions, fastest_growing | Constraint updated to `most_viewed` only |

---

## Table: brands

Stores parent company or group names.

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| id | uuid | PRIMARY KEY, default gen_random_uuid() | Auto-generated |
| name | text | NOT NULL | e.g. "YAAS Studio" |
| created_at | timestamptz | NOT NULL, default now() | Auto-set |

---

## Table: ips

Stores each content property and its platform connections.

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| id | uuid | PRIMARY KEY, default gen_random_uuid() | Auto-generated |
| brand_id | uuid | REFERENCES brands(id) ON DELETE SET NULL | Parent brand |
| name | text | NOT NULL | Display name, e.g. "ReactionTest" |
| color | text | NOT NULL, default '#666666' | Hex color for F1 livery, e.g. "#e10600" — **must be set per IP** |
| logo_url | text | | Hosted image URL (optional) |
| youtube_channel_id | text | | YouTube channel ID starting with UC (optional) |
| instagram_handle | text | | Instagram username without @ (optional) |
| active | boolean | NOT NULL, default true | Set false to pause scraping without deleting |
| created_at | timestamptz | NOT NULL, default now() | Auto-set |

Note: An IP can have YouTube only, Instagram only, or both. If a field is null, that platform is skipped during scraping.

---

## Table: videos

Stores individual video or post records from any platform.

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| id | uuid | PRIMARY KEY, default gen_random_uuid() | Auto-generated |
| ip_id | uuid | NOT NULL, REFERENCES ips(id) ON DELETE CASCADE | Owner IP |
| platform | text | NOT NULL, check in ('youtube', 'instagram') | Platform identifier |
| platform_video_id | text | NOT NULL | YouTube video ID or Instagram shortcode |
| title | text | | Video title or post caption (truncated to 200 chars) |
| thumbnail_url | text | | CDN URL for thumbnail or Reel cover |
| published_at | timestamptz | | When the content was published on the platform |
| is_deleted | boolean | NOT NULL, default false | Set true if the video is removed from the platform — stops appearing in leaderboard |
| created_at | timestamptz | NOT NULL, default now() | Auto-set |

Unique constraint: `(platform, platform_video_id)` — prevents duplicate records across platforms.

---

## Table: metrics

Stores time-series metric snapshots. Append-only — one set of rows added per video per scrape cycle.

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| id | uuid | PRIMARY KEY, default gen_random_uuid() | Auto-generated |
| video_id | uuid | NOT NULL, REFERENCES videos(id) ON DELETE CASCADE | Owner video |
| metric_name | text | NOT NULL | One of: views, likes, comments. No constraint — validated at app layer. |
| value | bigint | NOT NULL, default 0 | The metric count at the time of scraping |
| scraped_at | timestamptz | NOT NULL, default now() | When this snapshot was taken |

Index: `(video_id, metric_name, scraped_at DESC)` — optimised for "latest value of metric X for video Y" queries.

Note on shares: Neither YouTube nor Instagram exposes share counts via scraping. The `shares` metric type is not stored. Total interactions are computed as `likes + comments`.

Note on column rename: `timestamp` was renamed to `scraped_at` to avoid collision with the SQL reserved keyword `timestamp`.

---

## Table: leaderboard

Pre-computed rankings. Refreshed after each scrape cycle. The dashboard reads exclusively from this table — no heavy aggregation at read time.

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| id | uuid | PRIMARY KEY, default gen_random_uuid() | Auto-generated |
| category | text | NOT NULL, check ('most_viewed') | Only Most Viewed is active. Constraint can be widened if new screens are added. |
| time_window | text | NOT NULL, check in ('24h', '7d', '30d') | Rolling time window |
| rank | int | NOT NULL | Position 1–10 |
| video_id | uuid | NOT NULL, REFERENCES videos(id) ON DELETE CASCADE | Ranked video |
| score | numeric | NOT NULL, default 0 | Raw score used for ranking (views count for most_viewed) |
| updated_at | timestamptz | NOT NULL, default now() | Timestamp of last recompute |

Unique constraint: `(category, time_window, rank)` — upserted on each recompute cycle so ranks are always replaced in place.

---

## Table: ip_monthly_metrics

Monthly aggregated totals per IP. Used for the month-on-month growth screen.

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| id | uuid | PRIMARY KEY, default gen_random_uuid() | Auto-generated |
| ip_id | uuid | NOT NULL, REFERENCES ips(id) ON DELETE CASCADE | Owner IP |
| month | date | NOT NULL | First day of the month, e.g. 2026-03-01 |
| total_views | bigint | NOT NULL, default 0 | Sum of all view counts for this IP in this month |
| total_interactions | bigint | NOT NULL, default 0 | Sum of likes + comments for this month |

Unique constraint: `(ip_id, month)` — upserted each time monthly metrics are recomputed.

---

## Table: scrape_log

Audit trail for every scraper run. Used to monitor reliability and debug failures.

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| id | uuid | PRIMARY KEY, default gen_random_uuid() | Auto-generated |
| platform | text | NOT NULL | Which platform was scraped: "youtube" or "instagram" |
| started_at | timestamptz | NOT NULL, default now() | When the scrape job started |
| completed_at | timestamptz | | Null if job crashed mid-run |
| videos_found | int | NOT NULL, default 0 | Total videos/posts discovered |
| videos_upserted | int | NOT NULL, default 0 | New or updated video records written |
| metrics_inserted | int | NOT NULL, default 0 | Metric snapshot rows written |
| error_message | text | | Populated if the job encountered an error |
| triggered_by | text | | "cron" or "manual" |

---

## Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| metrics | (video_id, metric_name, scraped_at DESC) | Fast "latest value per metric per video" lookups |
| metrics | (metric_name) | Fast filter by metric type across all videos |
| leaderboard | (category, time_window, rank) | Dashboard read — primary access pattern |
| videos | (ip_id) | Join videos to their IP |
| videos | (is_deleted) | Exclude deleted videos from leaderboard |

---

## Relationship Diagram

```
brands
  └── ips (brand_id → brands.id)
        ├── videos (ip_id → ips.id)
        │     ├── metrics (video_id → videos.id)
        │     └── leaderboard (video_id → videos.id)
        └── ip_monthly_metrics (ip_id → ips.id)

scrape_log (standalone — no foreign keys)
```

---

# 21. Supabase Setup

## Account

Login: doe@yaas.studio

---

## Steps

1. Log into Supabase at supabase.com.
2. Create a new project. Give it a name and a database password.
3. Once the project is ready, open the **SQL Editor**.
4. Paste and run the contents of `supabase/schema.sql` — this creates all six tables.
5. Paste and run the contents of `supabase/seed.sql` — this loads placeholder data for testing.

---

## Credentials to Collect

After project creation, go to **Settings → API**. Collect the following three values:

| Key | Where to find it | Used for |
|-----|-----------------|---------|
| Project URL | Settings → API → Project URL | Connecting the app to Supabase |
| anon key | Settings → API → Project API Keys → anon / public | Browser-safe read access |
| service_role key | Settings → API → Project API Keys → service_role | Server-side writes (scrapers) |

These are added to `.env.local` on the development machine and to the Vercel environment variables for production.

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
CRON_SECRET=a-random-string-you-choose
```

The `CRON_SECRET` is a password you create yourself (any random string). It protects the scraper API routes so only Vercel's cron scheduler can trigger them.

---

# 22. YouTube Scraper

## Library

`youtubei.js` — an actively maintained unofficial Node.js client for YouTube's internal API.

No API key required. No Google Cloud account required.

GitHub: github.com/LuanRT/YouTube.js

---

## What You Need to Provide

For each IP that has a YouTube channel, you must store its **YouTube Channel ID** in the `ips` table under `youtube_channel_id`.

### How to find a YouTube Channel ID

1. Go to the channel's YouTube page.
2. Click on the channel name to open the channel.
3. The URL will look like:
   - `youtube.com/channel/UCxxxxxxxxxxxxxx` — the part after `/channel/` is the Channel ID.
   - Or `youtube.com/@handle` — click **About**, then **Share channel**, then **Copy channel ID**.

Channel IDs always start with `UC` and are 24 characters long.

Example:

| IP Name | YouTube Channel ID |
|---------|-------------------|
| ReactionTest | UCxxxxxxxxxxxxxx |
| TechToday | UCyyyyyyyyyyyyyy |

---

## How the Scraper Works

1. Reads all active IPs with a `youtube_channel_id` from the database.
2. For each channel, fetches the most recent videos (last 30 days).
3. For each video, fetches current metrics.
4. Stores or updates the video record in the `videos` table.
5. Appends a new metric snapshot row to the `metrics` table.

---

## Data Returned by YouTube Scraper

| Field | Source | Stored in |
|-------|--------|-----------|
| Video ID | YouTube internal ID | videos.platform_video_id |
| Title | Video title | videos.title |
| Thumbnail URL | YouTube thumbnail | videos.thumbnail_url |
| Published date | When video was uploaded | videos.published_at |
| View count | Current total views | metrics (metric_name = views) |
| Like count | Current total likes | metrics (metric_name = likes) |
| Comment count | Current total comments | metrics (metric_name = comments) |

**Note:** YouTube does not expose a public share count. The `shares` metric for YouTube videos is stored as 0.

---

## Limitations

- YouTube may rate-limit or block requests if too many are made in a short time. The 3× daily schedule is designed to stay within safe limits.
- Private videos are not accessible.
- Shorts and long-form videos are treated the same way.

---

# 23. Instagram Scraper

## Library

`instagram-media-scraper` — an actively maintained Node.js scraper for public Instagram profiles.

No Instagram account required. No API credentials required.

GitHub: github.com/ahmedrangel/instagram-media-scraper

---

## What You Need to Provide

For each IP that has an Instagram account, store the **Instagram username** in the `ips` table under `instagram_handle`.

Do not include the `@` symbol.

Example:

| IP Name | Instagram Handle |
|---------|-----------------|
| ReactionTest | reactiontest |
| TechToday | techtoday.in |

---

## Requirements

- The Instagram account must be **public**.
- Private accounts cannot be scraped.
- Requires Node.js v20.12 or higher on the server.

---

## How the Scraper Works

1. Reads all active IPs with an `instagram_handle` from the database.
2. For each handle, fetches the most recent posts and Reels.
3. For each post, extracts available metrics.
4. Stores or updates the post record in the `videos` table (platform = instagram).
5. Appends a new metric snapshot row to the `metrics` table.

---

## Data Returned by Instagram Scraper

| Field | Source | Stored in |
|-------|--------|-----------|
| Post shortcode | Instagram post ID | videos.platform_video_id |
| Caption (first 100 chars) | Post caption | videos.title |
| Thumbnail / cover image | Post image or Reel cover | videos.thumbnail_url |
| Published date | When the post was uploaded | videos.published_at |
| Like count | Current likes on post | metrics (metric_name = likes) |
| Comment count | Current comments on post | metrics (metric_name = comments) |
| Play count / View count | Views for Reels | metrics (metric_name = views) |

**Note:** Instagram does not expose share counts on public profiles. The `shares` metric for Instagram is stored as 0.

**Note:** For static photo posts (non-Reels), view count is not publicly available and will be stored as 0. Reels expose play counts.

---

## Limitations

- Instagram actively updates its internal API. The scraper library requires periodic updates to remain functional.
- Instagram may block IP addresses if too many requests are made. The 3× daily schedule is designed to stay within safe limits.
- Instagram may introduce changes that temporarily break the scraper. In such cases, the last successfully fetched data remains visible on the dashboard.

---

# 24. Data Refresh Schedule

Scrapers run automatically via Vercel Cron Jobs.

| Time (UTC) | Time (IST) | Action |
|-----------|-----------|--------|
| 07:00 | 12:30 PM | YouTube scrape + Instagram scrape |
| 10:00 | 03:30 PM | YouTube scrape + Instagram scrape |
| 14:00 | 07:30 PM | YouTube scrape + Instagram scrape |
| +15 min after each | | Leaderboard recompute |

---

## Manual Trigger

Any scrape can be triggered manually by calling the API route directly:

```
POST /api/scrape/youtube
POST /api/scrape/instagram
POST /api/scrape/recompute
```

All routes require the `Authorization: Bearer <CRON_SECRET>` header.

---

# 25. IP Configuration Checklist

Before the system can display real data, each IP must be configured in the database.

For each IP, provide the following:

| Field | Required | Description |
|-------|----------|-------------|
| IP Name | Yes | Display name shown on leaderboard |
| Brand | Yes | Parent company or group |
| Color | Yes | Hex color code for the F1 livery bar and label (e.g. #e10600 for red). Each IP should have a unique, visually distinct color. |
| YouTube Channel ID | If using YouTube | Starts with UC, 24 characters long |
| Instagram Handle | If using Instagram | Username without @ |
| Logo URL | Optional | Hosted image URL for the IP logo |
| Active | Yes | Set to true to include in scraping and leaderboard |

An IP can have YouTube only, Instagram only, or both.

### Color Assignment

The leaderboard uses the IP color to render the brand label and the left-side rank bar for each row. Colors must be distinct and high-contrast against a black background.

Suggested palette reference (F1 constructor colors):

| Color Name | Hex Code |
|-----------|---------|
| Ferrari Red | #e10600 |
| Williams Blue | #0090ff |
| McLaren Orange | #ff8000 |
| Mercedes Teal | #00d2be |
| Alpine Pink | #ff87bc |
| Aston Martin Green | #006f62 |
| Haas Silver | #b6babd |
| RB Blue | #3671c6 |
| Sauber Green | #229c3c |
| Dark Crimson | #9b0000 |

---

# 26. Success Criteria

The system is successful if:

Teams frequently reference the leaderboard.

Teams compete to reach top rankings.

Leadership uses the screen to gauge content output.

The system runs reliably without manual intervention.

Real data updates are visible on the dashboard within 15 minutes of each scrape cycle.

---