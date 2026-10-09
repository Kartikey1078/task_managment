# Seed Data Plan (implementation in Phase 2)

## Principles

- Passwords hashed with bcrypt (cost 10+) in `seed.sql` or a one-off `scripts/hash-passwords.js` — never commit plain passwords except in **README local dev section** with clear “development only” warning.
- Seed order: users (admin, managers, users) → tasks → sample activity_logs.

## Planned accounts (local dev)

| Email | Role | Password (dev doc only) | manager_id |
|-------|------|---------------------------|------------|
| admin@taskmgmt.local | admin | `ChangeMe_Admin123!` | NULL |
| manager@taskmgmt.local | manager | `ChangeMe_Manager123!` | NULL |
| user1@taskmgmt.local | user | `ChangeMe_User123!` | manager id |
| user2@taskmgmt.local | user | `ChangeMe_User2123!` | manager id |

Replace domain/emails in README as needed.

## Sample tasks

- 6–10 tasks spanning statuses/priorities
- Mix: assigned to user1/user2, created by manager and admin
- At least one task per user for dashboard demos

## Sample activity logs

- 5–10 entries mirroring seed mutations (`user.created`, `task.created`, `task.status_updated`)

## phpMyAdmin setup (summary)

1. Start MySQL (local or Docker).
2. Open phpMyAdmin → Import → `database/schema.sql`.
3. Import `database/seed.sql` (Phase 2).
4. Verify FKs and row counts in `users`, `tasks`, `activity_logs`.

Full steps will be merged into root `README.md` in Phase 7.
