#!/usr/bin/env bash
set -euo pipefail

BASE="${API_BASE:-http://localhost:5001/api}"
COOKIES="${COOKIES_FILE:-/tmp/taskmgmt-cookies.txt}"

echo "Health: $BASE/health"
curl -sf "$BASE/health" | python3 -m json.tool

rm -f "$COOKIES"
curl -sf -c "$COOKIES" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@taskmgmt.local","password":"ChangeMe_Admin123!"}' | python3 -m json.tool

CSRF=$(grep csrf_token "$COOKIES" | awk '{print $7}')
curl -sf -b "$COOKIES" "$BASE/tasks?limit=2" | python3 -m json.tool
curl -sf -b "$COOKIES" -X POST "$BASE/auth/logout" -H "X-CSRF-Token: $CSRF" | python3 -m json.tool

echo "Smoke test passed."
