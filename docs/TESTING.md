# Automated tests (Phase 6)

Backend integration tests use **Vitest** + **Supertest** against MySQL.

## Prerequisites

- MySQL with schema + seed applied (e.g. Docker `taskmgmt-mysql-test` on port **3308**)

## Run

```bash
cd backend
npm install
DB_HOST=127.0.0.1 DB_PORT=3308 DB_PASSWORD=devroot npm test
```

## Coverage

- Health check
- Login / invalid credentials / logout / inactive user
- Admin vs user RBAC (users list, activity logs, task create)
- Cross-user task access denied
- Manager task create, user status patch, validation errors, pagination meta
