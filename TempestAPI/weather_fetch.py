#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
import os
import time
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List

import requests

# ================= CONFIG =================
BASE_URL = "https://swd.weatherflow.com/swd/rest"
DEVICE_CACHE = Path(".tempest_device.json")
LOOKBACK_MINUTES = 4320
BIN_SECONDS = 300
# ==========================================


# ---------- Utilities ----------
def utc_iso(ts: int) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()


def mps_to_mph(v: float | None) -> float | None:
    return None if v is None else v * 2.2369362920544


# ---------- Device ID cache ----------
def load_cached_device_id() -> int | None:
    if DEVICE_CACHE.exists():
        try:
            return int(json.loads(DEVICE_CACHE.read_text())["device_id"])
        except Exception:
            return None
    return None


def save_device_id(device_id: int):
    DEVICE_CACHE.write_text(json.dumps({
        "device_id": device_id,
        "saved_at": datetime.utcnow().isoformat() + "Z"
    }, indent=2))


# ---------- HTTP ----------
def get_json(url: str, params: Dict[str, Any]) -> Dict[str, Any]:
    r = requests.get(url, params=params, timeout=20)
    r.raise_for_status()
    return r.json()


# ---------- Tempest ----------
def get_device_id(token: str) -> int:
    cached = load_cached_device_id()
    if cached:
        print(f"Using cached device_id={cached}")
        return cached

    print("Fetching device_id from /stations")
    data = get_json(f"{BASE_URL}/stations", {"token": token})

    for station in data.get("stations", []):
        for dev in station.get("devices", []):
            if dev.get("device_type") == "ST":
                device_id = int(dev["device_id"])
                save_device_id(device_id)
                print(f"Cached device_id={device_id}")
                return device_id

    raise RuntimeError("No Tempest device found")


# ---------- obs_st full layout ----------
OBS_ST_FIELDS = [
    "epoch",
    "wind_lull_mps",
    "wind_avg_mps",
    "wind_gust_mps",
    "wind_dir_deg",
    "air_temp_c",
    "relative_humidity_pct",
    "baro_pressure_mb",
    "sea_level_pressure_mb",
    "solar_radiation_wm2",
    "uv_index",
    "precip_mm",
    "precip_type",
    "lightning_avg_dist_km",
    "lightning_count",
    "battery_v",
    "report_interval_min",
    "local_day",
    "local_minute"
]


def parse_obs_st(obs: List[Any]) -> Dict[str, Any]:
    data = {}
    for i, field in enumerate(OBS_ST_FIELDS):
        data[field] = obs[i] if i < len(obs) else None

    data["time_utc"] = utc_iso(data["epoch"])

    # Derived wind MPH
    data["wind_lull_mph"] = mps_to_mph(data["wind_lull_mps"])
    data["wind_avg_mph"] = mps_to_mph(data["wind_avg_mps"])
    data["wind_gust_mph"] = mps_to_mph(data["wind_gust_mps"])

    # Derived metrics
    if data["wind_avg_mps"] and data["wind_gust_mps"]:
        data["gust_factor"] = round(
            data["wind_gust_mps"] / data["wind_avg_mps"], 2
        )
    else:
        data["gust_factor"] = None

    return data


# ---------- Downsampling ----------
def downsample_5min(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    bins = {}
    for r in sorted(rows, key=lambda x: x["epoch"]):
        b = (r["epoch"] // BIN_SECONDS) * BIN_SECONDS
        bins[b] = r
    return [bins[k] for k in sorted(bins)]


# ---------- Main ----------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--token", default=os.getenv("TEMPEST_TOKEN"))
    parser.add_argument("--minutes", type=int, default=LOOKBACK_MINUTES)
    parser.add_argument("--json", default="tempest_full_5min.json")
    parser.add_argument("--csv", default="tempest_full_5min.csv")
    args = parser.parse_args()

    if not args.token:
        raise SystemExit("Missing API token")

    device_id = get_device_id(args.token)

    now = int(time.time())
    start = now - args.minutes * 60

    params = {
        "token": args.token,
        "time_start": start,
        "time_end": now,
        "bucket": "b"
    }

    try:
        data = get_json(
            f"{BASE_URL}/observations/device/{device_id}",
            params
        )
    except requests.HTTPError:
        params.pop("bucket")
        data = get_json(
            f"{BASE_URL}/observations/device/{device_id}",
            params
        )

    rows = []
    for obs in data.get("obs", []):
        try:
            rows.append(parse_obs_st(obs))
        except Exception:
            pass

    rows_5m = downsample_5min(rows)

    # ---------- Write JSON ----------
    with open(args.json, "w") as f:
        json.dump({
            "device_id": device_id,
            "start": utc_iso(start),
            "end": utc_iso(now),
            "records": len(rows_5m),
            "data": rows_5m
        }, f, indent=2)

    # ---------- Write CSV ----------
    with open(args.csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=rows_5m[0].keys())
        w.writeheader()
        for r in rows_5m:
            w.writerow(r)

    print(f"Saved {len(rows_5m)} 5-minute records")
    print(f"→ {args.json}")
    print(f"→ {args.csv}")


if __name__ == "__main__":
    main()
