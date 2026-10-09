#!/usr/bin/env bash
# Wipe and re-apply minimal local seed (1 admin, 1 manager, 1 user, no tasks). Dev only.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTAINER="${MYSQL_CONTAINER:-taskmgmt-mysql-test}"

docker exec -i "$CONTAINER" mysql -uroot -pdevroot task_management < "$ROOT/database/seed.sql"
docker exec "$CONTAINER" mysql -uroot -pdevroot -e \
  "SELECT id, email, role FROM task_management.users ORDER BY id;"
