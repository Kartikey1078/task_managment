#!/usr/bin/env bash
# Re-apply local seed (includes admin, manager, and users). Dev only.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTAINER="${MYSQL_CONTAINER:-taskmgmt-mysql-test}"

docker exec -i "$CONTAINER" mysql -uroot -pdevroot task_management < "$ROOT/database/seed.sql"
docker exec "$CONTAINER" mysql -uroot -pdevroot -e \
  "SELECT id, email, role FROM task_management.users ORDER BY id;"
