"""
Instagram scraper for YAAS Leaderboard.

Reads active IPs with instagram_handle from Supabase, fetches recent posts/Reels
using instaloader (residential IP — avoids Vercel block), and writes to:
  - videos      (upsert by platform + platform_video_id)
  - metrics     (insert views/likes/comments snapshot)
  - scrape_log  (audit trail)

First-time setup:
  Add INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD to ../.env.local
  Run once — it logs in and saves a session file (session-<username>)
  Subsequent runs load the saved session (no password needed)

Run:  python instagram_scraper.py
Schedule via Windows Task Scheduler for 12:30 PM / 3:30 PM / 7:30 PM IST.
"""

import os
import sys
import time
import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# Load .env.local from the project root (one level up from this file)
# ---------------------------------------------------------------------------
def load_env(path: Path) -> None:
    if not path.exists():
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())

load_env(Path(__file__).parent.parent / ".env.local")

# ---------------------------------------------------------------------------
# Validate required env vars
# ---------------------------------------------------------------------------
SUPABASE_URL  = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY  = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
IG_USERNAME   = os.environ.get("INSTAGRAM_USERNAME", "")
IG_PASSWORD   = os.environ.get("INSTAGRAM_PASSWORD", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit(
        "ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n"
        "They are read automatically from ../.env.local"
    )

if not IG_USERNAME:
    sys.exit(
        "ERROR: INSTAGRAM_USERNAME must be set in ../.env.local\n"
        "Add: INSTAGRAM_USERNAME=your_ig_handle\n"
        "     INSTAGRAM_PASSWORD=your_ig_password  (only needed on first run)"
    )

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
try:
    import instaloader
except ImportError:
    sys.exit("ERROR: instaloader not installed. Run: pip install instaloader")

try:
    from supabase import create_client, Client
except ImportError:
    sys.exit("ERROR: supabase not installed. Run: pip install supabase")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
LOOKBACK_DAYS  = 30   # fetch posts published in the last N days
DELAY_BETWEEN  = 10   # seconds to wait between profiles (rate-limit safety)
SESSION_FILE   = Path(__file__).parent / f"session-{IG_USERNAME}"

# ---------------------------------------------------------------------------
# Supabase client
# ---------------------------------------------------------------------------
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def log(msg: str) -> None:
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}")


def now_utc() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def now_utc_iso() -> str:
    return now_utc().isoformat().replace("+00:00", "Z")


def build_loader() -> instaloader.Instaloader:
    """Create an Instaloader instance and authenticate via saved session or password."""
    loader = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False,
        quiet=True,
    )

    if SESSION_FILE.exists():
        log(f"Loading saved session from {SESSION_FILE.name}")
        try:
            loader.load_session_from_file(IG_USERNAME, str(SESSION_FILE))
            log("Session loaded OK")
            return loader
        except Exception as exc:
            log(f"WARN: Could not load saved session ({exc}) — will re-login")

    # No saved session — login with password
    if not IG_PASSWORD:
        sys.exit(
            "ERROR: No saved session found and INSTAGRAM_PASSWORD is not set.\n"
            "Add INSTAGRAM_PASSWORD to ../.env.local for the first login."
        )

    log(f"Logging in as @{IG_USERNAME} …")
    try:
        loader.login(IG_USERNAME, IG_PASSWORD)
        loader.save_session_to_file(str(SESSION_FILE))
        log(f"Logged in and session saved to {SESSION_FILE.name}")
    except instaloader.exceptions.BadCredentialsException:
        sys.exit("ERROR: Instagram login failed — check INSTAGRAM_USERNAME / INSTAGRAM_PASSWORD")
    except instaloader.exceptions.TwoFactorAuthRequiredException:
        sys.exit(
            "ERROR: Two-factor authentication is enabled on this account.\n"
            "Disable 2FA temporarily, run once to save the session, then re-enable it."
        )
    except Exception as exc:
        sys.exit(f"ERROR: Instagram login failed: {exc}")

    return loader


def fetch_active_ips() -> list[dict]:
    resp = (
        supabase.table("ips")
        .select("id, name, instagram_handle")
        .eq("active", True)
        .not_.is_("instagram_handle", "null")
        .execute()
    )
    return resp.data or []


def upsert_video(ip_id: str, post: "instaloader.Post") -> str | None:
    """Upsert video row and return its UUID."""
    caption_raw = post.caption or ""
    title = caption_raw[:200].replace("\n", " ").strip() or "(no caption)"
    thumb = post.url

    pub_at = post.date_utc.replace(tzinfo=datetime.timezone.utc).isoformat().replace("+00:00", "Z")

    resp = (
        supabase.table("videos")
        .upsert(
            {
                "ip_id":             ip_id,
                "platform":          "instagram",
                "platform_video_id": post.shortcode,
                "title":             title,
                "thumbnail_url":     thumb,
                "published_at":      pub_at,
                "is_deleted":        False,
            },
            on_conflict="platform,platform_video_id",
        )
        .execute()
    )

    if resp.data:
        return resp.data[0]["id"]

    # upsert may return empty on no-change — fetch the existing row
    fetch = (
        supabase.table("videos")
        .select("id")
        .eq("platform", "instagram")
        .eq("platform_video_id", post.shortcode)
        .single()
        .execute()
    )
    return fetch.data["id"] if fetch.data else None


def insert_metrics(video_id: str, views: int, likes: int, comments: int) -> int:
    payload = [
        {"video_id": video_id, "metric_name": "views",    "value": views},
        {"video_id": video_id, "metric_name": "likes",    "value": likes},
        {"video_id": video_id, "metric_name": "comments", "value": comments},
    ]
    resp = supabase.table("metrics").insert(payload).execute()
    return len(resp.data) if resp.data else 0


def scrape_profile(
    loader: instaloader.Instaloader,
    ip: dict,
    cutoff: datetime.datetime,
) -> tuple[int, int, int]:
    handle = ip["instagram_handle"]
    ip_id  = ip["id"]

    log(f"  Scraping @{handle} …")

    try:
        profile = instaloader.Profile.from_username(loader.context, handle)
    except instaloader.exceptions.ProfileNotExistsException:
        log(f"  WARN: @{handle} does not exist — skipping")
        return 0, 0, 0
    except Exception as exc:
        log(f"  ERROR fetching profile @{handle}: {exc}")
        return 0, 0, 0

    found = upserted = metrics = 0
    cutoff_naive = cutoff.replace(tzinfo=None)

    for post in profile.get_posts():
        if post.date_utc.replace(tzinfo=None) < cutoff_naive:
            break

        found += 1
        views    = (post.video_view_count or 0) if post.is_video else 0
        likes    = post.likes    or 0
        comments = post.comments or 0

        video_id = upsert_video(ip_id, post)
        if not video_id:
            log(f"    WARN: could not upsert post {post.shortcode}")
            continue

        upserted += 1
        metrics  += insert_metrics(video_id, views, likes, comments)

    log(f"  @{handle}: {found} found, {upserted} upserted, {metrics} metric rows")
    return found, upserted, metrics


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    log("=== Instagram scraper starting ===")

    started_at = now_utc_iso()

    log_resp = (
        supabase.table("scrape_log")
        .insert({"platform": "instagram", "started_at": started_at, "triggered_by": "manual"})
        .execute()
    )
    log_id = log_resp.data[0]["id"] if log_resp.data else None

    ips = fetch_active_ips()
    if not ips:
        log("No active IPs with instagram_handle found. Done.")
        if log_id:
            supabase.table("scrape_log").update({"completed_at": now_utc_iso()}).eq("id", log_id).execute()
        return

    log(f"Found {len(ips)} IP(s) to scrape")

    loader = build_loader()
    cutoff = now_utc() - datetime.timedelta(days=LOOKBACK_DAYS)

    total_found = total_upserted = total_metrics = 0
    error_msg = None

    try:
        for i, ip in enumerate(ips):
            f, u, m = scrape_profile(loader, ip, cutoff)
            total_found    += f
            total_upserted += u
            total_metrics  += m

            if i < len(ips) - 1:
                log(f"  Waiting {DELAY_BETWEEN}s …")
                time.sleep(DELAY_BETWEEN)

    except Exception as exc:
        error_msg = str(exc)
        log(f"FATAL ERROR: {exc}")

    if log_id:
        update: dict = {
            "completed_at":     now_utc_iso(),
            "videos_found":     total_found,
            "videos_upserted":  total_upserted,
            "metrics_inserted": total_metrics,
        }
        if error_msg:
            update["error_message"] = error_msg
        supabase.table("scrape_log").update(update).eq("id", log_id).execute()

    log(
        f"=== Done — {total_found} found, "
        f"{total_upserted} upserted, {total_metrics} metric rows ==="
    )


if __name__ == "__main__":
    main()
