# RBAC Permission Matrix

Roles: **admin**, **manager**, **user** (stored as `ENUM` in MySQL).

Legend: ✅ allowed · ❌ denied · 🔶 scoped (conditions below)

---

## Authentication & session

| Action | Admin | Manager | User |
|--------|:-----:|:-------:|:----:|
| Login (active account) | ✅ | ✅ | ✅ |
| Login (inactive account) | ❌ | ❌ | ❌ |
| Logout | ✅ | ✅ | ✅ |
| GET /api/auth/me | ✅ | ✅ | ✅ |
| Public self-registration with Admin/Manager role | ❌ | ❌ | ❌ |

---

## Users (`/api/users`)

| Action | Admin | Manager | User |
|--------|:-----:|:-------:|:----:|
| List all users | ✅ | ❌ | ❌ |
| Get user by id | ✅ | 🔶 own profile only | 🔶 own profile only |
| Create user | ✅ | ❌ | ❌ |
| Update user (name, email, role) | ✅ | ❌ | 🔶 own name only (no role) |
| PATCH activate/deactivate | ✅ | ❌ | ❌ |
| Assign Admin role | ✅ | ❌ | ❌ |
| Assign Manager role | ✅ | ❌ | ❌ |

**Notes:**

- Managers and users calling `GET /api/users/:id` receive **403** unless `:id` is their own id (profile page uses `/api/auth/me` or own id).
- `role` and `is_active` are never writable by non-admin, even if sent in JSON body.

---

## Manager team scope

A **manager** manages users where `users.manager_id = manager.id`.

| Task operation | Scope |
|----------------|--------|
| List tasks | Tasks where `assigned_to` is in manager's team **OR** `created_by = manager.id` |
| View task detail | Same as list visibility |
| Create task | Allowed; `assigned_to` must be in team (or self) unless admin |
| Edit / assign / delete | Same visibility as view; cannot assign to users outside team |
| Statistics | Aggregates over visible tasks only |

**Admin:** all users and all tasks.

**User:** tasks where `assigned_to = user.id` only (unless future “watcher” feature; not in scope).

---

## Tasks (`/api/tasks`)

| Action | Admin | Manager | User |
|--------|:-----:|:-------:|:----:|
| List tasks | ✅ all | 🔶 team scope | 🔶 assigned only |
| Get task by id | ✅ | 🔶 | 🔶 |
| Create task | ✅ | ✅ (team assignee) | ❌ |
| PUT full update | ✅ | 🔶 | ❌ |
| PATCH status | ✅ | 🔶 | 🔶 own assigned tasks only |
| Delete task | ✅ | 🔶 created by self or team task | ❌ |
| Change assignee | ✅ | 🔶 team only | ❌ |
| Change priority/due date | ✅ | 🔶 | ❌ |

**User PATCH status:** only `status` field; values `pending`, `in_progress`, `completed`.

**Manager/User:** cannot set `created_by` or escalate to admin endpoints.

---

## Activity logs (`/api/activity-logs`)

| Action | Admin | Manager | User |
|--------|:-----:|:-------:|:----:|
| GET list (paginated) | ✅ | ❌ | ❌ |

Log writes are server-side only on: login (optional), user CRUD, task CRUD, status changes, role changes.

---

## Frontend routes (navigation UX)

| Route | Admin | Manager | User |
|-------|:-----:|:-------:|:----:|
| `/login` | ✅ | ✅ | ✅ |
| `/admin/dashboard` | ✅ | ❌ | ❌ |
| `/manager/dashboard` | ❌ | ✅ | ❌ |
| `/user/dashboard` | ❌ | ❌ | ✅ |
| `/tasks`, `/tasks/:id` | ✅ | 🔶 | 🔶 |
| `/tasks/new`, `/tasks/:id/edit` | ✅ | 🔶 | ❌ |
| `/users` | ✅ | ❌ | ❌ |
| `/activity-logs` | ✅ | ❌ | ❌ |
| `/profile` | ✅ | ✅ | ✅ |
| `/unauthorized` | ✅ | ✅ | ✅ |

Post-login redirect:

- `admin` → `/admin/dashboard`
- `manager` → `/manager/dashboard`
- `user` → `/user/dashboard`

---

## Privilege escalation prevention (server)

1. Re-load `role` and `is_active` from DB on login and on sensitive mutations.
2. Strip forbidden fields in user update based on caller role.
3. Ignore client-supplied `role` on task create unless caller is admin/manager per rules.
4. Return **404** or **403** for out-of-scope task ids (prefer **403** for authenticated but forbidden, **404** when hiding existence is required — we use **403** for authenticated wrong scope, **404** for non-existent id).

---

## Central authorization API (backend)

```text
authenticate          → 401 if no/invalid token or inactive user
authorize('admin')    → 403 if role not in list
assertTaskAccess(user, taskId, action)
assertUserAccess(user, targetUserId, action)
```

Implemented in Phase 2–3 in `middleware/authorize.js` and `services/*`.
