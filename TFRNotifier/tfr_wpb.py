import datetime
from zoneinfo import ZoneInfo
import json
import os
from pathlib import Path
import re
import sys
import urllib.parse
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET

FEED_URL = "https://tfr.faa.gov/tfrapi/exportTfrList"
TOKEN = os.getenv("TELEGRAM_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
STATE_FILE = Path("TFRNotifier/state/last_wpb.json")
ET_ZONE = ZoneInfo("America/New_York")

TZ_RE = re.compile(r"(Z|[+-]\d{2}:?\d{2})$")

print("Python cwd:", os.getcwd())
print("Files:", os.listdir("."))
print("STATE_FILE real path:", STATE_FILE.resolve())

def fetch_json(url: str):
    with urllib.request.urlopen(url, timeout=15) as resp:
        return json.loads(resp.read().decode())


def fetch_detail(notam_id: str):
    url_id = notam_id.replace("/", "_")
    url = f"https://tfr.faa.gov/download/detail_{url_id}.xml"
    with urllib.request.urlopen(url, timeout=15) as resp:
        xml_text = resp.read()
    root = ET.fromstring(xml_text)
    eff = root.find(".//dateEffective")
    exp = root.find(".//dateExpire")
    return {
        "effective": eff.text if eff is not None else None,
        "expires": exp.text if exp is not None else None,
    }


def parse_utc(dt_str: str | None):
    if not dt_str:
        return None
    dt_str = dt_str.strip()
    if not TZ_RE.search(dt_str):
        dt_str = dt_str + "Z"
    try:
        return datetime.datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except ValueError:
        return None


def format_et(dt_obj: datetime.datetime | None) -> str:
    if not dt_obj:
        return "N/A"
    return dt_obj.astimezone(ET_ZONE).strftime("%Y-%m-%d %a %I:%M %p %Z")


def load_state(path: Path) -> dict:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        return {"seen": {}}
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
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
    # Telegram messages have a hard cap (4096 chars). Keep some slack for safety.
    max_len = 3900
    chunks: list[str] = []
    if len(body) <= max_len:
        chunks = [body]
    else:
        # Prefer splitting on blank lines/newlines to keep chunks readable.
        current: list[str] = []
        current_len = 0
        for part in body.split("\n\n"):
            part = part.strip()
            if not part:
                continue
            candidate = (("\n\n".join(current) + "\n\n" + part) if current else part)
            if len(candidate) <= max_len:
                current = candidate.split("\n\n")
                current_len = len(candidate)
                continue
            # If the single part itself is too big, hard-split it.
            if not current:
                for i in range(0, len(part), max_len):
                    chunks.append(part[i : i + max_len])
                continue
            chunks.append("\n\n".join(current))
            current = [part]
            current_len = len(part)
        if current:
            chunks.append("\n\n".join(current))

    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    for idx, chunk in enumerate(chunks, start=1):
        data = urllib.parse.urlencode({"chat_id": CHAT_ID, "text": chunk}).encode()
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                # Drain response body to avoid ResourceWarning in some runtimes.
                _ = resp.read()
                print(
                    "Telegram status:",
                    resp.status,
                    f"(chunk {idx}/{len(chunks)})" if len(chunks) > 1 else "",
                )
        except urllib.error.HTTPError as exc:
            detail = ""
            try:
                detail = exc.read().decode("utf-8", errors="replace")
            except Exception:
                detail = ""
            print(f"Telegram HTTPError {exc.code}: {exc.reason}")
            if detail:
                print("Telegram response:", detail)
            # Don't fail the entire run if Telegram is misconfigured or rejects the message.
            return
        except urllib.error.URLError as exc:
            print(f"Telegram URLError: {exc}")
            return
        except Exception as exc:
            print(f"Telegram send failed: {exc}")
            return


def main() -> int:
    now = datetime.datetime.now(datetime.timezone.utc)

    feed = fetch_json(FEED_URL)
    wpb = [
        n
        for n in feed
        if ("west palm beach" in n.get("description", "").lower())
        or ("PBI" in n.get("description", ""))
    ]

    state = load_state(STATE_FILE)
    seen: dict = state.get("seen", {})

    current_active: dict[str, dict] = {}
    new_msgs: list[str] = []
    revoke_msgs: list[str] = []

    for n in wpb:
        notam_id = n.get("notam_id")
        if not notam_id:
            continue

        try:
            detail = fetch_detail(notam_id)
        except Exception as exc:
            print(f"Failed detail fetch for {notam_id}: {exc}")
            continue

        eff_dt = parse_utc(detail.get("effective"))
        exp_dt = parse_utc(detail.get("expires"))

        if not exp_dt or exp_dt <= now:
            # expired or missing expiration; ignore
            continue

        current_active[notam_id] = {
            "effective": eff_dt.isoformat() if eff_dt else None,
            "expires": exp_dt.isoformat(),
            "description": n.get("description", "").strip(),
            "type": n.get("type", "?"),
        }

        if notam_id not in seen:
            desc = n.get("description", "").strip()
            start_str = format_et(eff_dt)
            end_str = format_et(exp_dt)
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
            # refresh stored info in case effective/expiration changed
            seen[notam_id].update(current_active[notam_id])

    # Find revocations: previously seen, not expired, now missing from feed
    for notam_id, info in list(seen.items()):
        exp_dt = parse_utc(info.get("expires"))
        if exp_dt and exp_dt <= now:
            # naturally expired, just drop from state
            seen.pop(notam_id, None)
            continue
        if notam_id not in current_active:
            start = format_et(parse_utc(info.get("effective")))
            until = format_et(parse_utc(info.get("expires")))
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
