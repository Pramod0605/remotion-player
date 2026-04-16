"""
Supabase Connectivity Tester — HTTP REST API
Compares: Direct Supabase URL vs Cloudflare Proxy URL

Install dependency first:
    pip install requests
"""

import requests
import time

# ── Credentials ──────────────────────────────────────────────────────────────
ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94d2hxdnNvZWxxcXNibG1xa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTU4NTgsImV4cCI6MjA3NTA5MTg1OH0"
    ".nZbWSb9AQK5uGAQmc7zXAceTHm9GRQJvqkg4-LNo_DM"
)

PUBLISHABLE_KEY = "sb_publishable_LhJzjP6VlbOVF2ywbYiLwg_1OTo5wiK"

DIRECT_URL = "https://oxwhqvsoelqqsblmqkxx.supabase.co"
PROXY_URL  = "https://supabase-proxy.utuberpraveen.workers.dev"

HEADERS = {
    "apikey":        ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type":  "application/json",
}

TIMEOUT = 15  # seconds

# ── Test cases ────────────────────────────────────────────────────────────────
# Each: (label, path, method, extra_headers, body)
TESTS = [
    ("REST API — schema probe",    "/rest/v1/",             "GET",  {}, None),
    ("Auth — settings endpoint",   "/auth/v1/settings",     "GET",  {}, None),
    ("Auth — anon sign-in probe",  "/auth/v1/token?grant_type=password",
                                                             "POST",
                                   {},
                                   {"email": "test@example.com", "password": "wrong-intentional"}),
    ("Storage — bucket list",      "/storage/v1/bucket",    "GET",  {}, None),
    ("REST — PostgREST health",    "/rest/v1/?apikey=" + ANON_KEY,
                                                             "GET",  {}, None),
]


def run_tests(base_label: str, base_url: str):
    print(f"\n{'='*65}")
    print(f"  🌐 BASE URL : {base_url}")
    print(f"  MODE       : {base_label}")
    print(f"{'='*65}")

    passed = 0
    total  = len(TESTS)

    for name, path, method, extra_headers, body in TESTS:
        url = base_url.rstrip("/") + path
        hdrs = {**HEADERS, **extra_headers}

        try:
            t0 = time.perf_counter()
            if method == "GET":
                r = requests.get(url, headers=hdrs, timeout=TIMEOUT)
            else:
                r = requests.post(url, headers=hdrs, json=body, timeout=TIMEOUT)
            elapsed = (time.perf_counter() - t0) * 1000

            # Treat any response (even 4xx) as "reached the server"
            reachable = True
            symbol = "✅"
            note = f"HTTP {r.status_code} — {elapsed:.0f} ms"

            # Special cases that are still considered "working"
            if r.status_code == 401:
                note += "  (auth required — expected)"
            elif r.status_code == 422:
                note += "  (validation error — expected for probe)"
            elif r.status_code == 400:
                note += "  (bad request — expected for probe)"
            elif r.status_code >= 500:
                symbol = "⚠️ "
                note += "  (server error)"
            elif r.status_code == 404:
                symbol = "⚠️ "
                note += "  (not found)"

            passed += 1
            print(f"  {symbol} {name}")
            print(f"      {note}")

            # Show snippet of response for debugging
            try:
                snippet = str(r.json())[:120]
            except Exception:
                snippet = r.text[:120]
            print(f"      Body: {snippet}")

        except requests.exceptions.ConnectionError as e:
            print(f"  ❌ {name}")
            print(f"      Connection ERROR: {str(e)[:150]}")
        except requests.exceptions.Timeout:
            print(f"  ❌ {name}")
            print(f"      TIMEOUT after {TIMEOUT}s")
        except Exception as e:
            print(f"  ❌ {name}")
            print(f"      Error: {str(e)[:150]}")

    print(f"\n  📊 Result: {passed}/{total} endpoints reachable")
    return passed, total


def main():
    print("\n🔌 Supabase HTTP Connectivity Test")
    print(f"   Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    results = {}

    p, t = run_tests("DIRECT (Supabase)", DIRECT_URL)
    results["DIRECT (Supabase)"] = (p, t)

    p, t = run_tests("PROXY (Cloudflare Worker)", PROXY_URL)
    results["PROXY (Cloudflare Worker)"] = (p, t)

    # ── Summary ────────────────────────────────────────────────────────────────
    print(f"\n{'='*65}")
    print("  FINAL SUMMARY")
    print(f"{'='*65}")
    for label, (passed, total) in results.items():
        icon = "✅" if passed == total else ("⚠️ " if passed > 0 else "❌")
        print(f"  {icon}  {label}: {passed}/{total} endpoints reachable")
    print()


if __name__ == "__main__":
    main()