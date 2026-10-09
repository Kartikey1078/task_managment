# RBAC Task Management System

Production-style full-stack task management with **Role-Based Access Control (RBAC)**. Three roles—**Admin**, **Manager**, and **User**—each get different dashboards, APIs, and UI routes. Authorization is enforced on the **server**; the React app only guides navigation.

## Main features

- JWT authentication via **HTTP-only cookies** (with CSRF protection on mutating requests)
- User management (Admin): create, update, activate/deactivate, assign roles
- Task CRUD with scoped visibility for Manager and User
- Activity / audit logging (Admin read-only API)
- Dashboards with task statistics and charts
- Search, filter, sort, and pagination on list endpoints
- Responsive SaaS-style UI (sidebar, tables, forms, toasts)
- Automated API integration tests (Vitest + Supertest)

## Technology stack

| Layer | Stack |
|-------|--------|
| Frontend | React 19, Vite, JavaScript, React Router, Tailwind CSS, Axios, React Hook Form, Zod, Lucide, Recharts |
| Backend | Node.js 20+, Express, JWT, bcrypt, Zod, Helmet, CORS, express-rate-limit |
| Database | MySQL 8, `mysql2` (parameterized queries) |

## Architecture overview

```text
Browser (React SPA)
    │  credentials + CORS
    ▼
Express API (/api)
    ├── middleware: auth, RBAC, validation, CSRF, rate limit
    ├── services: business rules + authorization
    └── repositories: MySQL
```

Detailed design docs live in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md).

## Folder structure

```text
task_management_kartikey/
├── backend/           # Express API
│   ├── src/
│   │   ├── config/ controllers/ services/ repositories/
│   │   ├── routes/ middleware/ validators/ utils/
│   │   ├── app.js server.js
│   │   └── tests/     # Vitest integration tests
│   └── package.json
├── frontend/          # React SPA
│   └── src/
│       ├── components/ pages/ layouts/ routes/
│       ├── context/ services/ utils/
│       └── App.jsx
├── database/
│   ├── schema.sql
│   └── seed.sql
├── docs/              # Architecture, RBAC matrix, testing
├── scripts/           # smoke-test-api.sh
└── docker-compose.yml # Optional local MySQL
```

## Database schema

Tables: **`users`**, **`tasks`**, **`activity_logs`** (see [`database/schema.sql`](database/schema.sql)).

- `users`: `role` enum, optional `manager_id` for manager team scope
- `tasks`: status/priority enums, `assigned_to`, `created_by`, `due_date`
- `activity_logs`: JSON `details`, indexed by user, entity, action

## phpMyAdmin / MySQL setup

1. Start MySQL (local install, Docker, or managed service).
2. In phpMyAdmin: **Import** → `database/schema.sql`.
3. Import **`database/seed.sql`** for local demo data only.

Or CLI:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Docker MySQL (recommended for local dev)

```bash
docker compose up -d
# DB on localhost:3308, root password: devroot, database: task_management
docker exec -i task_management_mysql mysql -uroot -pdevroot task_management < database/schema.sql
docker exec -i task_management_mysql mysql -uroot -pdevroot task_management < database/seed.sql
```

## Local installation

### Prerequisites

- Node.js 20+
- MySQL 8+

### Backend

```bash
cd backend
cp .env.example .env
# Edit DB_* and JWT_SECRET
npm install
npm run dev
```

Default API: `http://localhost:5000/api` (use `PORT=5001` if macOS uses port 5000).

### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL must match backend (e.g. http://localhost:5001/api)
npm install
npm run dev
```

Open **http://localhost:5173**

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5000`) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `JWT_SECRET` | Signing secret (long random string) |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `FRONTEND_URL` | CORS origin (e.g. `http://localhost:5173`) |
| `LOGIN_RATE_LIMIT_ENABLED` | `false` in dev; `true` in production |
| `LOGIN_RATE_LIMIT_MAX` | Max failed logins per window per IP |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL including `/api` |

Never commit `.env` files or put DB secrets in the frontend.

## Test users (local seed only)

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@taskmgmt.local` | `ChangeMe_Admin123!` |
| Manager | `manager@taskmgmt.local` | `ChangeMe_Manager123!` |
| User | `user1@taskmgmt.local` | `ChangeMe_User123!` |

Seed is minimal: three users, **no sample tasks** (create tasks manually for testing).

**Do not use these credentials in production.**

## Running tests

```bash
cd backend
DB_HOST=127.0.0.1 DB_PORT=3308 DB_PASSWORD=devroot npm test
```

See [`docs/TESTING.md`](docs/TESTING.md).

Quick API smoke test:

```bash
API_BASE=http://localhost:5001/api ./scripts/smoke-test-api.sh
```

## Role–permission matrix

Full matrix: [`docs/RBAC_PERMISSION_MATRIX.md`](docs/RBAC_PERMISSION_MATRIX.md).

| Capability | Admin | Manager | User |
|------------|:-----:|:-------:|:----:|
| All users / activity logs | ✅ | ❌ | ❌ |
| All tasks | ✅ | 🔶 team | 🔶 assigned |
| Create / edit / delete tasks | ✅ | 🔶 | ❌ |
| Update task status | ✅ | 🔶 | 🔶 own tasks |
| Profile (name/email) | ✅ | ✅ | ✅ |

## API endpoints

Base: `/api` · Auth: cookie `token` · Mutations: header `X-CSRF-Token` (matches `csrf_token` cookie)

| Method | Path | Access |
|--------|------|--------|
| GET | `/health` | Public |
| POST | `/auth/login` | Public (rate limited in prod) |
| POST | `/auth/logout` | Authenticated |
| GET | `/auth/me` | Authenticated |
| GET | `/users` | Admin |
| GET | `/users/assignees` | Admin, Manager |
| GET/POST | `/users`, `/users/:id` | Admin (+ self read/update rules) |
| PATCH | `/users/:id/status` | Admin |
| GET | `/tasks`, `/tasks/stats/summary` | Scoped |
| GET/POST/PUT/PATCH/DELETE | `/tasks`, `/tasks/:id` | Per RBAC |
| GET | `/activity-logs` | Admin |

Request/response shapes: [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md).

## Security decisions

- Passwords stored as **bcrypt** hashes only
- JWT in **httpOnly** cookies; role re-read from DB on protected operations
- **CSRF**: double-submit cookie + `X-CSRF-Token` on POST/PUT/PATCH/DELETE (login exempt)
- **CORS** allowlist with `credentials: true`
- **Helmet** security headers
- Login **rate limiting** in production (`skipSuccessfulRequests`)
- **Zod** validation on inputs; parameterized SQL only
- Clients cannot set `role` / `is_active` without Admin APIs

## Deployment

### Frontend — Vercel

1. Import repo; set root directory to `frontend`.
2. Build: `npm run build` · Output: `dist`
3. Environment: `VITE_API_URL=https://your-api-domain.com/api`
4. Deploy; ensure backend CORS `FRONTEND_URL` matches the Vercel URL.

### Backend — AWS EC2

1. Node 20+, process manager (e.g. PM2), reverse proxy (nginx) with **HTTPS**.
2. Environment: production `JWT_SECRET`, `DB_*` pointing to managed MySQL (RDS), `FRONTEND_URL`, `NODE_ENV=production`, `LOGIN_RATE_LIMIT_ENABLED=true`.
3. Cookie: `Secure` + `SameSite=None` when using HTTPS cross-site SPA.
4. Health check: `GET /api/health`

### Database

Managed MySQL (RDS, PlanetScale, etc.) reachable only from the EC2 security group.

Do not expose MySQL to the public internet.

## Screenshots

_Add screenshots of login, admin dashboard, task list, and user management after deployment._

## License

Assessment / educational project — add a license if you open-source it.
