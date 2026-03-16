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

The display rotates between multiple screen types.

Each screen remains visible for:

5 minutes

---

## Screen 1 — Company Overview

Displays aggregated company performance.

### Header

Company Performance

Example:

24 Hour Views: 18.2M  
7 Day Views: 92.4M  
30 Day Views: 402M  

Optional additional metrics:

Total Interactions  
Total Videos Posted  
Total Active IPs

---

### Top Videos Snapshot

Each time window shows Top 5 videos.

Example:

Top Videos — Last 24 Hours

Rank | Logo | IP | Video | Platform | Views

1 | Logo | ReactionTest | Why Bridges Fail | YT | 1.8M  
2 | Logo | TechToday | AI Chip War | IG | 1.5M  
3 | Logo | BuildIndia | Mumbai Metro | YT | 1.2M  

---

## Screen 2 — Most Viewed

Shows Top 10 videos for each duration.

Sections:

Last 24 Hours  
Last 7 Days  
Last 30 Days

---

## Screen 3 — Most Interactions

Same layout across three time windows.

---

## Screen 4 — Fastest Growing Videos

Ranks videos by velocity.

Velocity definition:

Views gained per hour.

---

## Screen 5 — IP Month-on-Month Growth

Displays IP performance growth compared to the previous month.

Columns:

Rank  
Logo  
IP Name  
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