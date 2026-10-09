# REST API Contracts

Base path: `/api`  
Content-Type: `application/json`  
Cookies: `credentials: include` from browser.

---

## Common

### Pagination query params

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int ≥ 1 | 1 | Page number |
| `limit` | int 1–100 | 10 | Page size |
| `sortBy` | string | context | e.g. `created_at`, `due_date`, `title` |
| `sortOrder` | `asc` \| `desc` | `desc` | Sort direction |
| `search` | string | — | Substring match on title/email/name as documented per endpoint |
| `status` | enum | — | Task filter |
| `priority` | enum | — | Task filter |
| `role` | enum | — | User filter (admin list) |
| `is_active` | `0` \| `1` | — | User filter |

### HTTP status usage

| Code | When |
|------|------|
| 200 | OK (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No body (optional logout) |
| 400 | Validation failed |
| 401 | Not authenticated |
| 403 | Authenticated but forbidden |
| 404 | Resource not found |
| 409 | Conflict (duplicate email) |
| 429 | Rate limited (login) |
| 500 | Unexpected server error |

---

## Health

### `GET /api/health`

**Auth:** none

**Response 200:**

```json
{
  "success": true,
  "data": { "status": "ok", "timestamp": "2026-10-09T12:00:00.000Z", "db": "connected" }
}
```

---

## Authentication

### `POST /api/auth/login`

**Auth:** none  
**Rate limit:** e.g. 10 requests / 15 min / IP

**Body:**

```json
{
  "email": "admin@example.com",
  "password": "string min 8"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "is_active": true,
      "manager_id": null,
      "created_at": "...",
      "updated_at": "..."
    }
  }
}
```

Sets `Set-Cookie: token=...; HttpOnly; Path=/; ...` and CSRF cookie if enabled.

**Errors:** 400 validation, 401 invalid credentials, 403 inactive account, 429 rate limit.

---

### `POST /api/auth/logout`

**Auth:** optional (clears cookie even if expired)

**Response 200:**

```json
{ "success": true, "data": { "message": "Logged out" } }
```

---

### `GET /api/auth/me`

**Auth:** required

**Response 200:** same `user` object as login (no `password_hash`).

**Errors:** 401

---

## Users (Admin list; profile rules per RBAC)

### `GET /api/users`

**Auth:** admin

**Query:** pagination + `search` (name, email), `role`, `is_active`

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Jane Manager",
      "email": "manager@example.com",
      "role": "manager",
      "is_active": true,
      "manager_id": null,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

---

### `GET /api/users/:id`

**Auth:** admin OR `id === self`

---

### `POST /api/users`

**Auth:** admin

**Body:**

```json
{
  "name": "string min 1",
  "email": "valid email",
  "password": "string min 8",
  "role": "admin | manager | user",
  "manager_id": null,
  "is_active": true
}
```

**Validation:**

- `manager_id` required when `role = user` (optional: nullable for users without manager)
- Managers may have `manager_id` null

**Response 201:** user object (no password).

---

### `PUT /api/users/:id`

**Auth:** admin (full) OR self (limited)

**Admin body:** `name`, `email`, `role`, `manager_id`, `is_active` (not `password` here — separate reset flow optional)

**Self body:** `name` only (email change optional with uniqueness check)

**Response 200:** updated user.

---

### `PATCH /api/users/:id/status`

**Auth:** admin

**Body:**

```json
{ "is_active": false }
```

---

## Tasks

### Enums

- `status`: `pending`, `in_progress`, `completed`
- `priority`: `low`, `medium`, `high`

### `GET /api/tasks`

**Auth:** required  
**Scope:** per RBAC matrix

**Query:** pagination, `search` (title, description), `status`, `priority`, `assigned_to` (admin)

**Response 200:** array of tasks + `meta`.

**Task object:**

```json
{
  "id": 1,
  "title": "string",
  "description": "string | null",
  "status": "pending",
  "priority": "medium",
  "assigned_to": 3,
  "assigned_to_name": "Bob User",
  "created_by": 2,
  "created_by_name": "Jane Manager",
  "due_date": "2026-10-15",
  "created_at": "...",
  "updated_at": "..."
}
```

---

### `GET /api/tasks/:id`

**Auth:** required, scoped

---

### `POST /api/tasks`

**Auth:** admin, manager

**Body:**

```json
{
  "title": "required",
  "description": "optional",
  "status": "pending",
  "priority": "medium",
  "assigned_to": 3,
  "due_date": "2026-10-20"
}
```

Server sets `created_by` from `req.user.id`. Validates `due_date` ≥ today (or allow past with warning — **decision: allow any valid date**, warn in UI only).

**Response 201:** task object.

---

### `PUT /api/tasks/:id`

**Auth:** admin; manager if in scope

**Body:** full task fields permitted for role (user ❌).

---

### `PATCH /api/tasks/:id/status`

**Auth:** admin/manager scoped; user on own assigned task

**Body:**

```json
{ "status": "in_progress" }
```

---

### `DELETE /api/tasks/:id`

**Auth:** admin; manager if in scope per matrix

**Response 200:**

```json
{ "success": true, "data": { "message": "Task deleted", "id": 1 } }
```

---

## Activity logs

### `GET /api/activity-logs`

**Auth:** admin

**Query:** pagination, `user_id`, `entity_type`, `action`, date range optional (Phase 3)

**Log object:**

```json
{
  "id": 1,
  "user_id": 1,
  "user_name": "Admin User",
  "action": "task.created",
  "entity_type": "task",
  "entity_id": 5,
  "details": "{\"title\":\"...\"}",
  "created_at": "..."
}
```

---

## Comments (optional / bonus)

If implemented: `task_comments` table and `POST/GET /api/tasks/:id/comments` — user on assigned task. Not required for MVP; schema extension reserved.

---

## Error examples

**Validation 400:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [{ "path": "email", "message": "Invalid email" }]
  }
}
```

**Forbidden 403:**

```json
{
  "success": false,
  "error": { "code": "FORBIDDEN", "message": "You do not have permission to perform this action." }
}
```
