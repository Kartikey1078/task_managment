-- Local development seed only — do not run on production
-- Minimal: 1 admin, 1 manager, 1 user — no tasks, no activity logs
USE task_management;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE tasks;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Passwords (see README):
--   Admin:   ChangeMe_Admin123!
--   Manager: ChangeMe_Manager123!
--   User:    ChangeMe_User123!

INSERT INTO users (id, name, email, password_hash, role, manager_id, is_active) VALUES
(1, 'Admin User', 'admin@taskmgmt.local', '$2b$10$Mi7Ff6MCCQyrN8ICuW64ke5f9es97JA8K4sQtEhZ3j6WswR38CBGi', 'admin', NULL, 1),
(2, 'Jane Manager', 'manager@taskmgmt.local', '$2b$10$3L4vk2ZM9m3WoW5v5ffiTuBfZIYETAjEplaRfyD4xyIUwXDj43QDm', 'manager', NULL, 1),
(3, 'Bob User', 'user1@taskmgmt.local', '$2b$10$HVeusYoIWSgmo3tCaZgmC.nzhCy3N1N5KQ0ZRpDmwPUuDTGe2mZbG', 'user', 2, 1);
