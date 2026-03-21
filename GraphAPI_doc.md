# Instagram Graph API — Integration Guide

## Overview

Instagram Graph API is the official Meta API for reading Instagram Business/Creator account data. It provides real metrics (views, impressions, reach, engagement) that are unavailable or unreliable through scraping.

This document covers how Graph API would integrate with the YAAS Leaderboard system.

---

## Architecture

### One App, Multiple Accounts

You create **one Meta Business App**. Each IP (influencer) authorizes your app via OAuth. You receive a separate long-lived access token per account — no need for multiple apps.

```
Meta Business App (one)
    ├── IP 1 Access Token  →  @vi.tamin.tech
    ├── IP 2 Access Token  →  @death.of.pc
    ├── IP 3 Access Token  →  @hackonomics.ai
    └── ...
```

---

## Requirements Per IP

Each influencer must:
1. Have an **Instagram Business or Creator account** (not a personal account)
2. Have their Instagram connected to a **Facebook Page**
3. Complete a one-time **OAuth authorization** — clicking "Connect Instagram" and granting permissions

---

## Available Metrics

Graph API provides richer data than scraping:

| Metric | Description |
|---|---|
| `video_views` | Total video views |
| `impressions` | Total times the post was seen |
| `reach` | Unique accounts that saw the post |
| `saved` | Number of saves |
| `likes` | Like count |
| `comments` | Comment count |
| `shares` | Share count |

Fetched via:
```
GET /{media-id}/insights?metric=video_views,impressions,reach,saved,likes,comments,shares
```

---

## How It Integrates with the Current System

### Current flow (scraping)
```
GitHub Actions → instagram_scraper.py → instagrapi → Instagram private API → Supabase
```

### Graph API flow
```
GitHub Actions → scraper → Graph API (with stored token) → Supabase
```

### Changes needed
1. Add `graph_api_token` column to the `ips` table in Supabase
2. Build a one-time OAuth flow (admin page) for each IP to authorize
3. Store long-lived tokens securely in Supabase
4. Replace `instagrapi` calls with Graph API HTTP calls
5. Add a token refresh job (tokens expire after 60 days)

---

## OAuth Flow

```
1. Admin clicks "Connect Instagram" for an IP
2. Redirect to Meta OAuth URL with app_id + required permissions
3. IP logs in and grants permissions
4. Meta redirects back with a short-lived code
5. Exchange code for a short-lived token (1 hour)
6. Exchange short-lived token for a long-lived token (60 days)
7. Store long-lived token in Supabase ips.graph_api_token
```

---

## Token Management

- **Long-lived tokens** are valid for **60 days**
- Refresh by calling:
  ```
  GET /oauth/access_token
    ?grant_type=fb_exchange_token
    &client_id={app-id}
    &client_secret={app-secret}
    &fb_exchange_token={current-token}
  ```
- A scheduled job should refresh tokens **before** they expire (e.g., every 30 days)
- If a token expires, that IP stops being scraped until re-authorized

---

## Security

| Concern | Approach |
|---|---|
| Access tokens | Stored in Supabase (server-side only, never sent to frontend) |
| App Secret | Stored as environment variable, never in code |
| Transport | Graph API enforces HTTPS |
| Revocation | Each IP can revoke access anytime from their Meta settings — scraper gracefully skips that IP |
| Token exposure | Scraper runs server-side (GitHub Actions / Vercel) only |

---

## Required OAuth Permissions

```
instagram_basic              — read profile and media
instagram_manage_insights    — read post-level metrics
pages_show_list              — see connected Facebook Pages
pages_read_engagement        — required alongside Instagram permissions
```

---

## Advantages Over Current Scraping

| | Scraping (current) | Graph API |
|---|---|---|
| Views data | Often 0 (unreliable) | Real `video_views` |
| Rate limits | 429 errors possible | Official limits, much higher |
| Session management | Session token expires/gets flagged | Long-lived tokens, stable |
| Terms of Service | Grey area | Fully compliant |
| Setup complexity | Low | Medium (OAuth per IP) |

---

## Next Steps (when ready to implement)

1. Create a Meta Business App at [developers.facebook.com](https://developers.facebook.com)
2. Add `instagram_basic` and `instagram_manage_insights` permissions
3. Build OAuth callback route in Next.js (`/api/auth/instagram/callback`)
4. Add `graph_api_token` to the `ips` schema
5. Update scraper to use Graph API instead of instagrapi
6. Add token refresh cron job
