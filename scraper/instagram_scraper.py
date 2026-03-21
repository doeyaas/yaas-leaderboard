"""
Instagram scraper for YAAS Leaderboard.

Reads active IPs with instagram_handle from Supabase, fetches recent posts/Reels
using instagrapi (mimics the official IG app — avoids 429s that plague instaloader),
and writes to:
  - videos      (upsert by platform + platform_video_id)
  - metrics     (insert views/likes/comments snapshot)
  - scrape_log  (audit trail)

First-time setup:
  Add INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD to ../.env.local
  Run once — it logs in and saves a settings file (ig_settings.json)
  Subsequent runs load the saved session (no password needed)

Run:  python instagram_scraper.py
Schedule via Windows Task Scheduler for 12:30 PM / 3:30 PM / 7:30 PM IST.
"""

import os
import sys
import time
import random
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
IG_SESSIONID  = os.environ.get("INSTAGRAM_SESSIONID", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit(
        "ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n"
        "They are read automatically from ../.env.local"
    )

if not IG_USERNAME:
    sys.exit(
        "ERROR: INSTAGRAM_USERNAME must be set in ../.env.local\n"
        "Add: INSTAGRAM_USERNAME=your_ig_handle\n"
        "     INSTAGRAM_SESSIONID=your_sessionid_from_browser  (recommended)\n"
        "  or INSTAGRAM_PASSWORD=your_ig_password"
    )

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
try:
    from instagrapi import Client
    from instagrapi.exceptions import LoginRequired, BadPassword, TwoFactorRequired
except ImportError:
    sys.exit("ERROR: instagrapi not installed. Run: pip install instagrapi")

try:
    from supabase import create_client, Client as SupabaseClient
except ImportError:
    sys.exit("ERROR: supabase not installed. Run: pip install supabase")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
LOOKBACK_DAYS      = 30   # fetch posts published in the last N days
POST_DELAY_BASE    = 3    # seconds between per-post media_info() API calls
POST_DELAY_JITTER  = 2    # ± random jitter
PROFILE_DELAY      = 45   # seconds between profiles
SCRAPE_LIMIT       = int(os.getenv('SCRAPE_LIMIT', '15'))  # posts per profile
SETTINGS_FILE      = Path(__file__).parent / "ig_settings.json"

# ---------------------------------------------------------------------------
# Supabase client
# ---------------------------------------------------------------------------
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_KEY)

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


def build_client() -> Client:
    """Create an instagrapi Client and authenticate."""
    cl = Client()
    cl.delay_range = [2, 5]

    # --- Preferred: session ID from browser (no challenge, no password needed) ---
    if IG_SESSIONID:
        if SETTINGS_FILE.exists():
            log(f"Loading saved session from {SETTINGS_FILE.name}")
            cl.load_settings(str(SETTINGS_FILE))

        log(f"Authenticating via session ID …")
        try:
            cl.login_by_sessionid(IG_SESSIONID)
            log(f"Logged in as user_id={cl.user_id}")
            cl.dump_settings(str(SETTINGS_FILE))
            return cl
        except Exception as exc:
            sys.exit(
                f"ERROR: Session ID login failed: {exc}\n"
                "The sessionid cookie may have expired — grab a fresh one from your browser."
            )

    # --- Fallback: username + password ---
    if not IG_PASSWORD:
        sys.exit(
            "ERROR: Set either INSTAGRAM_SESSIONID or INSTAGRAM_PASSWORD in ../.env.local"
        )

    if SETTINGS_FILE.exists():
        log(f"Loading saved session from {SETTINGS_FILE.name}")
        cl.load_settings(str(SETTINGS_FILE))
        try:
            cl.login(IG_USERNAME, IG_PASSWORD)
            if cl.user_id:
                log("Session loaded OK")
                return cl
        except Exception as exc:
            log(f"WARN: saved session failed ({exc}) — doing fresh login")
            SETTINGS_FILE.unlink(missing_ok=True)
            cl = Client()
            cl.delay_range = [2, 5]

    log(f"Logging in as @{IG_USERNAME} …")
    try:
        cl.login(IG_USERNAME, IG_PASSWORD)
    except BadPassword:
        sys.exit("ERROR: Bad credentials — check INSTAGRAM_USERNAME / INSTAGRAM_PASSWORD")
    except TwoFactorRequired:
        sys.exit(
            "ERROR: Two-factor auth is enabled.\n"
            "Disable 2FA temporarily, run once to save the session, then re-enable it."
        )
    except Exception as exc:
        sys.exit(f"ERROR: Instagram login failed: {exc}")

    if not cl.user_id:
        sys.exit("ERROR: Login appeared to succeed but user_id is not set — try again.")

    cl.dump_settings(str(SETTINGS_FILE))
    log(f"Logged in as user_id={cl.user_id}, session saved to {SETTINGS_FILE.name}")
    return cl


def fetch_active_ips() -> list[dict]:
    resp = (
        supabase.table("ips")
        .select("id, name, instagram_handle, instagram_user_id")
        .eq("active", True)
        .not_.is_("instagram_handle", "null")
        .execute()
    )
    return resp.data or []


def upsert_video(ip_id: str, media) -> str | None:
    """Upsert video row and return its UUID."""
    caption_raw = media.caption_text or ""
    title = caption_raw[:200].replace("\n", " ").strip() or "(no caption)"

    # Prefer thumbnail_url; fall back to cover image
    thumb = str(media.thumbnail_url or "")

    pub_at = media.taken_at.astimezone(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
    video_url = f"https://www.instagram.com/p/{media.code}/"

    resp = (
        supabase.table("videos")
        .upsert(
            {
                "ip_id":             ip_id,
                "platform":          "instagram",
                "platform_video_id": media.code,   # shortcode e.g. "C1abc123"
                "title":             title,
                "caption":           caption_raw or None,
                "video_url":         video_url,
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

    # upsert may return empty on no-change — fetch existing row
    fetch = (
        supabase.table("videos")
        .select("id")
        .eq("platform", "instagram")
        .eq("platform_video_id", media.code)
        .single()
        .execute()
    )
    return fetch.data["id"] if fetch.data else None


def insert_metrics(video_id: str, metrics: dict[str, int]) -> int:
    payload = [{"video_id": video_id, "metric_name": k, "value": v} for k, v in metrics.items()]
    resp = supabase.table("metrics").insert(payload).execute()
    return len(resp.data) if resp.data else 0


def scrape_profile(cl: Client, ip: dict, cutoff: datetime.datetime) -> tuple[int, int, int]:
    handle = ip["instagram_handle"]
    ip_id  = ip["id"]

    log(f"  Scraping @{handle} …")

    # Use cached user_id if available — skips user_info_by_username_v1 API call
    cached_user_id = ip.get("instagram_user_id")
    if cached_user_id:
        user_id = cached_user_id
        log(f"  Using cached user_id={user_id}")
    else:
        try:
            user_info = cl.user_info_by_username_v1(handle)
            user_id = user_info.pk
            # Save for future runs
            supabase.table("ips").update({"instagram_user_id": str(user_id)}).eq("id", ip_id).execute()
            log(f"  Resolved and cached user_id={user_id}")
        except Exception as exc:
            log(f"  ERROR resolving user ID for @{handle}: {exc}")
            return 0, 0, 0

    found = upserted = metrics_count = 0

    try:
        # Fetch last N posts — covers ~1-2 weeks for active accounts
        medias = cl.user_medias(user_id, amount=SCRAPE_LIMIT)
    except LoginRequired:
        log("  ERROR: session expired mid-run — re-login required")
        return 0, 0, 0
    except Exception as exc:
        log(f"  ERROR fetching posts for @{handle}: {exc}")
        return 0, 0, 0

    log(f"  Got {len(medias)} total posts from API (cutoff: {cutoff.strftime('%Y-%m-%d')})")
    if medias:
        newest = medias[0].taken_at
        if newest.tzinfo is None:
            newest = newest.replace(tzinfo=datetime.timezone.utc)
        log(f"  Newest post: {newest.strftime('%Y-%m-%d')} — type: {medias[0].media_type}")

    for media in medias:
        taken_at = media.taken_at
        if taken_at.tzinfo is None:
            taken_at = taken_at.replace(tzinfo=datetime.timezone.utc)
        if taken_at < cutoff:
            log(f"  Skipping {media.code} dated {taken_at.strftime('%Y-%m-%d')} (before cutoff)")
            continue

        found += 1

        # user_medias() bulk response omits play_count/view_count — fetch full info
        try:
            full = cl.media_info(media.pk)
        except Exception as exc:
            log(f"    WARN: media_info failed for {media.code}: {exc} — using partial data")
            full = media

        # Rate-limit delay applies to the Instagram API call above, not the DB writes below
        delay = POST_DELAY_BASE + random.uniform(-POST_DELAY_JITTER, POST_DELAY_JITTER)
        time.sleep(delay)

        views    = full.play_count or full.view_count or 0
        likes    = full.like_count    or 0
        comments = full.comment_count or 0
        shares   = getattr(full, "share_count", None) or getattr(full, "reshare_count", None) or 0

        video_id = upsert_video(ip_id, full)
        if not video_id:
            log(f"    WARN: could not upsert post {full.code}")
        else:
            upserted     += 1
            metrics_count += insert_metrics(video_id, {
                "views": views, "likes": likes, "comments": comments, "shares": shares,
            })

        log(f"    [{found}] {full.code} — views:{views} likes:{likes} shares:{shares} | waited {delay:.1f}s")

    log(f"  @{handle}: {found} found, {upserted} upserted, {metrics_count} metric rows")
    return found, upserted, metrics_count


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    # Optional: python instagram_scraper.py deathofpc  — runs only that handle
    only_handle = sys.argv[1].lstrip("@").lower() if len(sys.argv) > 1 else None

    log(f"=== Instagram scraper starting{f' (handle: @{only_handle})' if only_handle else ''} ===")

    started_at = now_utc_iso()

    log_resp = (
        supabase.table("scrape_log")
        .insert({"platform": "instagram", "started_at": started_at, "triggered_by": "github_actions" if os.environ.get("GITHUB_ACTIONS") == "true" else "manual"})
        .execute()
    )
    log_id = log_resp.data[0]["id"] if log_resp.data else None

    ips = fetch_active_ips()
    if only_handle:
        ips = [ip for ip in ips if ip["instagram_handle"].lower() == only_handle]
        if not ips:
            log(f"No active IP found with instagram_handle='{only_handle}'")
            return
    if not ips:
        log("No active IPs with instagram_handle found. Done.")
        if log_id:
            supabase.table("scrape_log").update({"completed_at": now_utc_iso()}).eq("id", log_id).execute()
        return

    log(f"Found {len(ips)} IP(s) to scrape")

    cl = build_client()
    cutoff = now_utc() - datetime.timedelta(days=LOOKBACK_DAYS)

    total_found = total_upserted = total_metrics = 0
    error_msg = None

    try:
        for i, ip in enumerate(ips):
            f, u, m = scrape_profile(cl, ip, cutoff)
            total_found    += f
            total_upserted += u
            total_metrics  += m

            if i < len(ips) - 1:
                log(f"  Waiting {PROFILE_DELAY}s before next profile …")
                time.sleep(PROFILE_DELAY)

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
