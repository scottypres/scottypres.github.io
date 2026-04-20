import datetime
from zoneinfo import ZoneInfo
import gzip
import http.cookiejar
import json
import os
from pathlib import Path
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zlib

FEED_URL = "https://tfr.faa.gov/tfrapi/exportTfrList?button1="
TOKEN = os.getenv("TELEGRAM_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
STATE_FILE = Path("TFRNotifier/state/last_wpb.json")
ET_ZONE = ZoneInfo("America/New_York")

TZ_RE = re.compile(r"(Z|[+-]\d{2}:?\d{2})$")

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

print("Python cwd:", os.getcwd())
print("Files:", os.listdir("."))
print("STATE_FILE real path:", STATE_FILE.resolve())


BROWSER_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "application/json,text/xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
}

TFR3_HOME = "https://tfr.faa.gov/tfr3/"


def _build_opener() -> urllib.request.OpenerDirector:
    jar = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))


# One opener for the entire run so the FAA session cookies set by the initial
# /tfr3/ visit persist across later requests. Without this each call started a
# fresh session and got the "NOTAM Search" HTML stub instead of JSON/XML.
SESSION = _build_opener()
_session_primed = False


def _open(url: str, timeout: int = 15, referer: str | None = None):
    global _session_primed
    if not _session_primed and url != TFR3_HOME:
        _session_primed = True  # set first so a failing prime doesn't loop
        try:
            with _open(TFR3_HOME, timeout=timeout):
                pass
        except Exception as exc:
            print(f"Session prime via {TFR3_HOME} failed (continuing): {exc}")

    headers = dict(BROWSER_HEADERS)
    if referer:
        headers["Referer"] = referer
    req = urllib.request.Request(url, headers=headers)
    return SESSION.open(req, timeout=timeout)


def _read_body(resp) -> bytes:
    raw = resp.read()
    encoding = (resp.headers.get("Content-Encoding") or "").lower()
    if encoding == "gzip":
        return gzip.decompress(raw)
    if encoding == "deflate":
        try:
            return zlib.decompress(raw)
        except zlib.error:
            return zlib.decompress(raw, -zlib.MAX_WBITS)
    return raw


def fetch_json(url: str, attempts: int = 3):
    # The FAA ack page only flips to JSON on the second hit within the same
    # session (the first request is the ack that sets server-side state).
    # Retry up to `attempts` times, using the previous response URL as the
    # Referer so each retry looks like a page reload.
    last_body = b""
    last_exc: Exception | None = None
    referer = TFR3_HOME
    for attempt in range(1, attempts + 1):
        with _open(url, referer=referer) as resp:
            last_body = _read_body(resp)
        try:
            return json.loads(last_body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            last_exc = exc
            referer = url  # next try looks like a reload of the same page
    snippet = last_body[:500].decode("utf-8", errors="replace")
    print(
        f"fetch_json failed to parse response from {url} after {attempts} attempts: {last_exc}\n"
        f"  Body length: {len(last_body)}\n"
        f"  First 500 bytes: {snippet!r}"
    )
    assert last_exc is not None
    raise last_exc


def fetch_detail(notam_id: str):
    url_id = notam_id.replace("/", "_")
    url = f"https://tfr.faa.gov/download/detail_{url_id}.xml"
    with _open(url, referer=TFR3_HOME) as resp:
        xml_text = _read_body(resp)
    root = ET.fromstring(xml_text)
    eff = root.find(".//dateEffective")
    exp = root.find(".//dateExpire")
    return {
        "effective": eff.text if eff is not None else None,
        "expires": exp.text if exp is not None else None,
    }


def parse_utc(dt_str: str | None):
    """Parse a timestamp into UTC, handling 'effective immediately' strings."""
    if not dt_str:
        return None

    normalized = dt_str.strip().lower()
    if "immediat" in normalized:
        # Some TFRs list the effective time as "IMMEDIATELY"; treat as now.
        return datetime.datetime.now(datetime.timezone.utc)

    if not TZ_RE.search(normalized):
        normalized = normalized + "Z"

    try:
        return datetime.datetime.fromisoformat(normalized.replace("z", "+00:00"))
    except ValueError:
        return None


def format_et(dt_obj: datetime.datetime | None, missing_label: str = "N/A") -> str:
    if not dt_obj:
        return missing_label
    return dt_obj.astimezone(ET_ZONE).strftime("%Y-%m-%d %a %I:%M %p %Z")


def load_state(path: Path) -> dict:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        return {"seen": {}}
    with path.open("r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            # If the file is empty or corrupted, reset it to an empty state so
            # future runs have a valid JSON file.
            data = {"seen": {}}
            save_state(path, data)
    # Backward compatibility if we ever had a different format
    if "seen" not in data:
        data["seen"] = {}
    return data


def save_state(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, sort_keys=True)


def send_telegram(body: str) -> None:
    if not (TOKEN and CHAT_ID):
        print("Telegram env vars missing; skipping send.")
        return
    data = urllib.parse.urlencode(
        {"chat_id": CHAT_ID, "text": body}
    ).encode()
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print("Telegram status:", resp.status)
    except urllib.error.HTTPError as exc:
        # Capture Telegram error response for easier debugging
        body = exc.read().decode(errors="replace") if exc.fp else ""
        body_snip = body[:500] + ("..." if len(body) > 500 else "")
        print(f"Telegram send failed: HTTP {exc.code} {exc.reason}")
        if body_snip:
            print(f"Response body: {body_snip}")
        # If Telegram says the chat was migrated to a supergroup, auto-retry once.
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = {}
        migrate_id = parsed.get("parameters", {}).get("migrate_to_chat_id")
        if migrate_id:
            print(f"Retrying with migrate_to_chat_id={migrate_id}")
            migrated_data = urllib.parse.urlencode(
                {"chat_id": migrate_id, "text": body}
            ).encode()
            migrated_req = urllib.request.Request(
                url,
                data=migrated_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            try:
                with urllib.request.urlopen(migrated_req, timeout=10) as resp2:
                    print("Telegram status (migrated):", resp2.status)
            except Exception as exc2:
                print(f"Telegram migrated send failed: {exc2}")
                print("Please update TELEGRAM_CHAT_ID to the migrated id.")
    except Exception as exc:
        # Don't fail the whole workflow on other errors; just log them.
        print(f"Telegram send failed: {exc}")


def main() -> int:
    now = datetime.datetime.now(datetime.timezone.utc)

    feed = fetch_json(FEED_URL)

    # Post-NMS migration the feed no longer tags Palm Beach TFRs as "VIP" -
    # they land under SECURITY, SPECIAL, etc. Filter on facility + description
    # keywords and keep all types.
    def is_wpb_tfr(n: dict) -> bool:
        facility = n.get("facility", "")
        desc = n.get("description", "").lower()
        if facility.upper() != "ZMA":
            return False
        return (
            "west palm beach" in desc
            or "palm beach" in desc
            or "pbi" in desc
        )

    wpb = [n for n in feed if is_wpb_tfr(n)]

    state = load_state(STATE_FILE)
    seen: dict = state.get("seen", {})

    current_active: dict[str, dict] = {}
    new_msgs: list[str] = []
    revoke_msgs: list[str] = []

    for n in wpb:
        notam_id = n.get("notam_id")
        if not notam_id:
            continue

        # The NMS feed no longer exposes dateEffective/dateExpire, and the
        # legacy detail_<id>.xml endpoint may or may not still work. Try it
        # best-effort and fall back to the feed entry so we still alert.
        eff_dt = None
        exp_dt = None
        try:
            detail = fetch_detail(notam_id)
            eff_dt = parse_utc(detail.get("effective"))
            exp_dt = parse_utc(detail.get("expires"))
        except Exception as exc:
            print(f"Detail fetch unavailable for {notam_id}: {exc}")

        if exp_dt and exp_dt <= now:
            # definitively expired
            continue

        current_active[notam_id] = {
            "effective": eff_dt.isoformat() if eff_dt else None,
            "expires": exp_dt.isoformat() if exp_dt else None,
            "description": n.get("description", "").strip(),
            "type": n.get("type", "?"),
        }

        if notam_id not in seen:
            desc = n.get("description", "").strip()
            start_str = format_et(eff_dt, "Effective Immediately")
            end_str = format_et(exp_dt, "See description")
            link = (
                f"https://tfr.faa.gov/tfr3/?page=detail_{notam_id.replace('/', '_')}"
            )
            new_msgs.append(
                f"- {notam_id}: {desc} (type: {n.get('type','?')})\n"
                f"  Starts: {start_str}\n"
                f"  Ends:   {end_str}\n"
                f"  Link: {link}"
            )
            seen[notam_id] = current_active[notam_id]
        else:
            seen[notam_id].update(current_active[notam_id])

    # Find revocations: previously seen, not expired, now missing from feed
    for notam_id, info in list(seen.items()):
        exp_dt = parse_utc(info.get("expires"))
        if exp_dt and exp_dt <= now:
            seen.pop(notam_id, None)
            continue
        if notam_id not in current_active:
            start = format_et(parse_utc(info.get("effective")), "Effective Immediately")
            until = format_et(parse_utc(info.get("expires")), "See description")
            revoke_msgs.append(
                f"- {notam_id} revoked before expiration\n"
                f"  Was: {start} to {until}"
            )
            seen.pop(notam_id, None)

    messages: list[str] = []
    if new_msgs:
        messages.append(
            "New West Palm Beach TFR(s) detected:\n" + "\n".join(new_msgs)
        )
    if revoke_msgs:
        messages.append(
            "TFR(s) revoked early:\n" + "\n".join(revoke_msgs)
        )

    if messages:
        full_msg = "\n\n".join(messages)
        print(full_msg)
        send_telegram(full_msg)
    else:
        print("No new or revoked WPB NOTAMs.")
        # Optional: if you want a quiet "status OK" on manual run:
        if os.getenv("GITHUB_EVENT_NAME") == "workflow_dispatch":
            send_telegram(
                "No new West Palm Beach TFRs or revocations at this time."
            )

    state["seen"] = seen
    save_state(STATE_FILE, state)
    return 0


if __name__ == "__main__":
    sys.exit(main())
