# YAAS Leaderboard

An internal content performance dashboard designed to run on a large office TV screen. Displays rotating leaderboards for YouTube and Instagram content across all company IPs, creating real-time visibility into what's performing best.

## What it does

- Rotates through 5 screens every 5 minutes: Company Overview, Most Viewed, Most Interactions, Fastest Growing, and IP Month-on-Month Growth
- Tracks metrics across 24h, 7-day, and 30-day windows
- F1/racing-themed UI with per-IP constructor colors, podium styling, and scanline TV effect
- Built for vertical 65" display

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (PostgreSQL)
- **Tailwind CSS v4**
- **Vercel** (hosting)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up the database

Run the schema against your Supabase project:

```bash
# In Supabase SQL editor, run:
supabase/schema.sql
```

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/display`.

## Deploying

This project uses a custom deploy script that commits, pushes to GitHub, and triggers a Vercel redeploy.

### Setup (first time)

Create a `deploy.env` file in the root (never committed):

```env
OFFICE_PAT="your_github_pat_with_repo_scope"
```

### Deploy

```bash
pnpm run deploy
```

You'll be prompted for a commit message. It will commit all changes, push to `main`, and trigger Vercel.

## Project Structure

```
src/
├── app/
│   ├── display/        # Main TV display page
│   └── admin/          # Admin panel (WIP)
├── components/
│   ├── ScreenRotator.tsx       # Manages screen rotation and timing
│   ├── LeaderboardTable.tsx    # Reusable ranking table
│   └── screens/
│       ├── CompanyOverview.tsx
│       ├── MostViewed.tsx
│       ├── MostInteractions.tsx
│       ├── FastestGrowing.tsx
│       └── IPGrowth.tsx
└── lib/
    ├── types.ts
    ├── ip-colors.ts
    ├── db/
    │   ├── queries.ts      # Data aggregation logic
    │   └── tables.ts       # Mock data (dev)
    └── supabase/
        ├── client.ts
        └── server.ts
```

## Database Schema

Six tables: `brands`, `ips`, `videos`, `metrics`, `leaderboard`, `ip_monthly_metrics`.

See [`supabase/schema.sql`](supabase/schema.sql) for the full schema.

## Status

| Feature | Status |
|---|---|
| TV display UI | Done |
| Mock data | Done |
| Supabase integration | In progress |
| YouTube API sync | Not started |
| Instagram API sync | Not started |
| Admin panel | Stub only |
