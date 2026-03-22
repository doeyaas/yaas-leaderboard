# Apify Integration — YAAS Leaderboard

## Why This Change

The current setup runs two separate scrapers:
- A Python (`instagrapi`) scraper on GitHub Actions for Instagram
- A TypeScript (`youtubei.js`) route on GitHub Actions for YouTube

Both are fragile — they depend on session cookies, unofficial APIs, and local credentials. Apify replaces them with cloud-hosted, maintained actors that handle proxies, rate limits, and login challenges automatically.

---

## Architecture: Before vs After

**Before**
```
GitHub Actions (3x/day)
  ├─ Python: instagrapi → Supabase (videos, metrics, scrape_log)
  ├─ TS: youtubei.js   → Supabase (videos, metrics, scrape_log)
  └─ POST /api/scrape/recompute
```

**After**
```
Apify Scheduler (3x/day)
  ├─ Instagram Actor (apify/instagram-scraper)
  │    └─ Run complete → Webhook → POST /api/apify/instagram-webhook
  │                                  ├─ Read Apify dataset
  │                                  ├─ Write to Supabase
  │                                  └─ POST /api/scrape/recompute
  │
  └─ YouTube Actor (streamers/youtube-scraper)
       └─ Run complete → Webhook → POST /api/apify/youtube-webhook
                                      ├─ Read Apify dataset
                                      ├─ Write to Supabase
                                      └─ POST /api/scrape/recompute
```

---

## Step 1 — Create Apify Account

1. Go to [apify.com](https://apify.com) → Sign up (free, no credit card required)
2. Navigate to **Settings → Integrations**
3. Copy your **API token** — this is `APIFY_API_TOKEN`
4. Choose any strong random string for `APIFY_WEBHOOK_SECRET` (e.g., `yaas-apify-2026`)

---

## Step 2 — Add Environment Variables

Add to `.env.local` and Vercel project settings:

```env
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
APIFY_WEBHOOK_SECRET=yaas-apify-2026
```

Remove after migration (no longer needed):
```env
# DELETE THESE:
INSTAGRAM_USERNAME=...
INSTAGRAM_PASSWORD=...
INSTAGRAM_SESSIONID=...
```

---

## Step 3 — Set Up Actors on Apify

### Instagram Actor

**Actor:** `apify/instagram-scraper` (find in Apify Store)

**Input JSON:**
```json
{
  "directUrls": [
    "https://www.instagram.com/vi_tamin_t/",
    "https://www.instagram.com/deathofpc/",
    "https://www.instagram.com/hackonomics_/",
    "https://www.instagram.com/hookedexe/",
    "https://www.instagram.com/sizzleroom.yt/",
    "https://www.instagram.com/builderscentral_/"
  ],
  "resultsType": "posts",
  "resultsLimit": 15,
  "addParentData": false,
  "onlyPostsNewerThan": "30 days"
}
```

> Replace the list with your actual handles. `resultsLimit: 15` matches the current `SCRAPE_LIMIT`. Keeping this at 15 is critical for staying on the free tier.

---

### YouTube Actor

**Actor:** `streamers/youtube-scraper` (find in Apify Store)

**Input JSON:**
```json
{
  "startUrls": [
    { "url": "https://www.youtube.com/@Vi.taminTech/shorts" },
    { "url": "https://www.youtube.com/@DeathOfPC/shorts" },
    { "url": "https://www.youtube.com/@hackonomics/shorts" },
    { "url": "https://www.youtube.com/@HookedExe/shorts" },
    { "url": "https://www.youtube.com/@SizzleRoom/shorts" },
    { "url": "https://www.youtube.com/@BuildersCentral/shorts" }
  ],
  "maxResultsShorts": 15,
  "downloadSubtitles": false,
  "includeVideoInfo": true
}
```

> Use the `/shorts` URL suffix so the actor only fetches Shorts.

---

## Step 4 — Schedule the Actors

In each actor → **Schedules** tab → Create schedule:

| Run | UTC Cron | IST Time |
|-----|----------|----------|
| Morning | `30 6 * * *` | 12:00 PM |
| Afternoon | `30 9 * * *` | 3:00 PM |
| Evening | `30 13 * * *` | 7:00 PM |

Create **two schedules** — one for the Instagram actor, one for the YouTube actor. They can run at the same time (parallel is fine since they write different data).

---

## Step 5 — Configure Webhooks

In each actor → **Integrations → Webhooks** tab → Add webhook:

| Field | Value |
|-------|-------|
| Event type | `Actor run succeeded` |
| Request URL (Instagram) | `https://your-vercel-domain.vercel.app/api/apify/instagram-webhook` |
| Request URL (YouTube) | `https://your-vercel-domain.vercel.app/api/apify/youtube-webhook` |
| Payload template | Leave as default |
| Headers | `x-apify-webhook-secret: yaas-apify-2026` |

The default payload includes `resource.defaultDatasetId` which is how the webhook handler fetches results.

---

## Step 6 — Create Webhook API Routes

### `src/app/api/apify/instagram-webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface ApifyWebhookBody {
  resource?: { defaultDatasetId?: string }
}

interface ApifyIGPost {
  ownerUsername?: string
  shortCode?: string
  caption?: string | null
  url?: string
  displayUrl?: string
  timestamp?: string
  videoViewCount?: number | null
  likesCount?: number
  commentsCount?: number
  type?: string
}

function authorized(req: NextRequest): boolean {
  return req.headers.get('x-apify-webhook-secret') === process.env.APIFY_WEBHOOK_SECRET
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: ApifyWebhookBody = await req.json()
  const datasetId = body.resource?.defaultDatasetId
  if (!datasetId) {
    return NextResponse.json({ error: 'No defaultDatasetId in payload' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const startedAt = new Date().toISOString()

  const { data: logRow } = await supabase
    .from('scrape_log')
    .insert({ platform: 'instagram', started_at: startedAt, triggered_by: 'apify' })
    .select('id')
    .single()
  const logId = logRow?.id

  try {
    // Fetch dataset items from Apify
    const res = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${process.env.APIFY_API_TOKEN}&limit=9999`
    )
    const posts: ApifyIGPost[] = await res.json()

    // Build handle → ip_id map once
    const { data: ips } = await supabase
      .from('ips')
      .select('id, instagram_handle')
      .eq('active', true)
      .not('instagram_handle', 'is', null)

    const handleToIpId = new Map<string, string>()
    for (const ip of ips ?? []) {
      if (ip.instagram_handle) {
        handleToIpId.set(ip.instagram_handle.toLowerCase(), ip.id)
      }
    }

    let videosFound = 0
    let videosUpserted = 0
    let metricsInserted = 0

    for (const post of posts) {
      const handle = post.ownerUsername?.toLowerCase()
      const shortCode = post.shortCode
      if (!handle || !shortCode) continue

      const ipId = handleToIpId.get(handle)
      if (!ipId) continue

      videosFound++

      const caption = post.caption ?? null
      const title = caption ? caption.slice(0, 200).replace(/\n/g, ' ').trim() : '(no caption)'
      const publishedAt = post.timestamp ? new Date(post.timestamp).toISOString() : new Date().toISOString()

      await supabase
        .from('videos')
        .upsert(
          {
            ip_id:             ipId,
            platform:          'instagram',
            platform_video_id: shortCode,
            title,
            caption,
            video_url:         post.url ?? `https://www.instagram.com/p/${shortCode}/`,
            thumbnail_url:     post.displayUrl ?? null,
            published_at:      publishedAt,
            is_deleted:        false,
          },
          { onConflict: 'platform,platform_video_id' }
        )

      videosUpserted++

      const { data: videoRow } = await supabase
        .from('videos')
        .select('id')
        .eq('platform', 'instagram')
        .eq('platform_video_id', shortCode)
        .single()

      if (!videoRow) continue

      const metrics = [
        { video_id: videoRow.id, metric_name: 'views',    value: post.videoViewCount ?? 0 },
        { video_id: videoRow.id, metric_name: 'likes',    value: post.likesCount ?? 0 },
        { video_id: videoRow.id, metric_name: 'comments', value: post.commentsCount ?? 0 },
      ]
      const { error: metricErr } = await supabase.from('metrics').insert(metrics)
      if (!metricErr) metricsInserted += metrics.length
    }

    await supabase
      .from('scrape_log')
      .update({
        completed_at:     new Date().toISOString(),
        videos_found:     videosFound,
        videos_upserted:  videosUpserted,
        metrics_inserted: metricsInserted,
      })
      .eq('id', logId)

    // Trigger recompute
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scrape/recompute`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })

    return NextResponse.json({ ok: true, videos_found: videosFound, videos_upserted: videosUpserted, metrics_inserted: metricsInserted })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await supabase
      .from('scrape_log')
      .update({ completed_at: new Date().toISOString(), error_message: message })
      .eq('id', logId)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
```

---

### `src/app/api/apify/youtube-webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface ApifyWebhookBody {
  resource?: { defaultDatasetId?: string }
}

interface ApifyYTVideo {
  id?: string
  title?: string
  url?: string
  thumbnailUrl?: string
  date?: string
  viewCount?: number
  channelId?: string
  channelUrl?: string
}

function authorized(req: NextRequest): boolean {
  return req.headers.get('x-apify-webhook-secret') === process.env.APIFY_WEBHOOK_SECRET
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: ApifyWebhookBody = await req.json()
  const datasetId = body.resource?.defaultDatasetId
  if (!datasetId) {
    return NextResponse.json({ error: 'No defaultDatasetId in payload' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const startedAt = new Date().toISOString()

  const { data: logRow } = await supabase
    .from('scrape_log')
    .insert({ platform: 'youtube', started_at: startedAt, triggered_by: 'apify' })
    .select('id')
    .single()
  const logId = logRow?.id

  try {
    const res = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${process.env.APIFY_API_TOKEN}&limit=9999`
    )
    const videos: ApifyYTVideo[] = await res.json()

    // Build channelId → ip_id map once
    // ips.youtube_channel_id stores either @handle or UCxxx ID
    const { data: ips } = await supabase
      .from('ips')
      .select('id, youtube_channel_id')
      .eq('active', true)
      .not('youtube_channel_id', 'is', null)

    // Match by channel URL substring or ID
    function findIpId(video: ApifyYTVideo): string | undefined {
      for (const ip of ips ?? []) {
        const stored = ip.youtube_channel_id?.toLowerCase() ?? ''
        const vidChannel = (video.channelUrl ?? '').toLowerCase()
        const vidChannelId = (video.channelId ?? '').toLowerCase()
        if (stored && (vidChannel.includes(stored) || vidChannelId === stored)) {
          return ip.id
        }
      }
    }

    let videosFound = 0
    let videosUpserted = 0
    let metricsInserted = 0

    for (const video of videos) {
      const vid = video.id
      if (!vid) continue

      const ipId = findIpId(video)
      if (!ipId) continue

      videosFound++

      const publishedAt = video.date ? new Date(video.date).toISOString() : new Date().toISOString()

      await supabase
        .from('videos')
        .upsert(
          {
            ip_id:             ipId,
            platform:          'youtube',
            platform_video_id: vid,
            title:             video.title ?? '',
            video_url:         video.url ?? `https://www.youtube.com/shorts/${vid}`,
            thumbnail_url:     video.thumbnailUrl ?? null,
            published_at:      publishedAt,
            is_deleted:        false,
          },
          { onConflict: 'platform,platform_video_id' }
        )

      videosUpserted++

      const { data: videoRow } = await supabase
        .from('videos')
        .select('id')
        .eq('platform', 'youtube')
        .eq('platform_video_id', vid)
        .single()

      if (!videoRow) continue

      const { error: metricErr } = await supabase
        .from('metrics')
        .insert([{ video_id: videoRow.id, metric_name: 'views', value: video.viewCount ?? 0 }])
      if (!metricErr) metricsInserted++
    }

    await supabase
      .from('scrape_log')
      .update({
        completed_at:     new Date().toISOString(),
        videos_found:     videosFound,
        videos_upserted:  videosUpserted,
        metrics_inserted: metricsInserted,
      })
      .eq('id', logId)

    // Trigger recompute
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scrape/recompute`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })

    return NextResponse.json({ ok: true, videos_found: videosFound, videos_upserted: videosUpserted, metrics_inserted: metricsInserted })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await supabase
      .from('scrape_log')
      .update({ completed_at: new Date().toISOString(), error_message: message })
      .eq('id', logId)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
```

---

## Step 7 — Data Mapping

### Instagram (`apify/instagram-scraper` output → Supabase)

| Apify Field | Supabase Target | Notes |
|---|---|---|
| `ownerUsername` | match to `ips.instagram_handle` | Used to find `ip_id` |
| `shortCode` | `videos.platform_video_id` | |
| `caption` (first 200 chars) | `videos.title` | |
| `caption` | `videos.caption` | Full text |
| `url` | `videos.video_url` | |
| `displayUrl` | `videos.thumbnail_url` | |
| `timestamp` | `videos.published_at` | ISO string |
| `videoViewCount` | `metrics` (views) | 0 for image posts |
| `likesCount` | `metrics` (likes) | |
| `commentsCount` | `metrics` (comments) | |

### YouTube (`streamers/youtube-scraper` output → Supabase)

| Apify Field | Supabase Target | Notes |
|---|---|---|
| `channelId` / `channelUrl` | match to `ips.youtube_channel_id` | Used to find `ip_id` |
| `id` | `videos.platform_video_id` | YouTube video ID |
| `title` | `videos.title` | |
| `url` | `videos.video_url` | |
| `thumbnailUrl` | `videos.thumbnail_url` | |
| `date` | `videos.published_at` | |
| `viewCount` | `metrics` (views) | |

---

## Step 8 — Add `NEXT_PUBLIC_APP_URL` Env Var

The webhook handlers call recompute internally using the app's own URL. Add this to `.env.local` and Vercel:

```env
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

For local dev: `NEXT_PUBLIC_APP_URL=http://localhost:3000`

---

## Step 9 — What to Remove After Migration

Once the Apify integration is verified working, remove the following:

| Item | Action |
|------|--------|
| `scraper/` folder | Delete entirely |
| `.github/workflows/instagram-scraper.yml` | Delete |
| `.github/workflows/scrape.yml` | Delete (Apify + webhooks replace it) |
| `src/app/api/scrape/instagram/route.ts` | Delete |
| `src/app/api/scrape/youtube/route.ts` | Delete |
| `src/app/api/scrape/recompute/route.ts` | **Keep** — called by webhook handlers |

---

## Cost Analysis — Staying on Free Tier

**Free tier:** $5/month = ~16.67 CU at $0.30/CU

**How CU is calculated:**
```
CU = RAM (GB) × Runtime (hours)

Instagram actor (all profiles in 1 run):
  512 MB RAM × ~4 min = 0.5 × (4/60) = 0.033 CU per run
  3 runs/day × 30 days = 90 runs/month
  90 × 0.033 = ~3.0 CU/month

YouTube actor (all channels in 1 run):
  512 MB RAM × ~3 min = 0.5 × (3/60) = 0.025 CU per run
  90 runs/month = ~2.25 CU/month

Total: ~5.25 CU/month → just within free tier
```

**Key insight:** Actors scrape ALL profiles in ONE run, not one run per profile. This is why it's dramatically cheaper than running one actor per IP.

**To stay on free tier:**
- Keep `resultsLimit: 15` per profile
- Keep `onlyPostsNewerThan: "30 days"`
- Do not increase schedule frequency beyond 3x/day
- Monitor CU usage in Apify → **Usage** tab monthly

---

## Verification Checklist

1. **Run actor manually** → Apify → Storage → Dataset → confirm fields match the mapping table above
2. **Test webhook locally** using [ngrok](https://ngrok.com):
   - `ngrok http 3000`
   - Set webhook URL to ngrok URL temporarily
   - Trigger a manual actor run → confirm webhook fires and handler returns `200 ok`
3. **Check Supabase** → `videos` and `metrics` tables have new rows
4. **Check `scrape_log`** → entry with `platform: 'instagram'` or `'youtube'`, `triggered_by: 'apify'`
5. **Check `leaderboard`** → rows updated after recompute fires
6. **Check display page** → leaderboard shows updated data
