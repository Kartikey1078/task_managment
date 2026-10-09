# Phase 3 — Domain APIs

## Endpoints

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/users` | Admin — pagination, search, `role`, `is_active` |
| GET | `/api/users/:id` | Admin or self |
| POST | `/api/users` | Admin |
| PUT | `/api/users/:id` | Admin (full) or self (`name`, `email` only) |
| PATCH | `/api/users/:id/status` | Admin |
| GET | `/api/tasks` | Scoped by role |
| GET | `/api/tasks/stats/summary` | Scoped task counts by status |
| GET | `/api/tasks/:id` | Scoped |
| POST | `/api/tasks` | Admin, Manager |
| PUT | `/api/tasks/:id` | Admin, Manager (scoped) |
| PATCH | `/api/tasks/:id/status` | Admin, Manager (scoped), User (own tasks) |
| DELETE | `/api/tasks/:id` | Admin, Manager (scoped) |
| GET | `/api/activity-logs` | Admin |

Mutating requests require `X-CSRF-Token` (see Phase 2 docs).

## RBAC enforcement

- Manager task scope: `created_by = manager` OR assignee in manager's team (`users.manager_id`).
- Users cannot create/update/delete tasks; may PATCH status on assigned tasks only.
- Role / `is_active` cannot be changed by non-admins.
- Activity logs written on user/task mutations and login.
