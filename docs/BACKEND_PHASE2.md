# Phase 2 — Backend foundation (local setup)

## Prerequisites

- Node.js 20+
- MySQL 8+ (phpMyAdmin optional)

## Database

1. Import schema: `database/schema.sql`
2. Import seed: `database/seed.sql`

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

## Backend

```bash
cd backend
cp .env.example .env
# Edit DB_* and JWT_SECRET
npm install
npm run dev
```

API base: `http://localhost:5000/api`

## Test auth (curl)

```bash
# Health
curl -s http://localhost:5000/api/health

# Login (saves cookies)
curl -s -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@taskmgmt.local","password":"ChangeMe_Admin123!"}'

# Me (use token + csrf for mutating routes)
CSRF=$(grep csrf_token cookies.txt | awk '{print $7}')
curl -s -b cookies.txt http://localhost:5000/api/auth/me

curl -s -b cookies.txt -X POST http://localhost:5000/api/auth/logout \
  -H "X-CSRF-Token: $CSRF"
```

## Dev test users

| Email | Password | Role |
|-------|----------|------|
| admin@taskmgmt.local | ChangeMe_Admin123! | admin |
| manager@taskmgmt.local | ChangeMe_Manager123! | manager |
| user1@taskmgmt.local | ChangeMe_User123! | user |
| user2@taskmgmt.local | ChangeMe_User2123! | user |
