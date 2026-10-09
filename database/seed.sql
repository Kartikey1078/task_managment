-- Local development seed only — do not run on production
USE task_management;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE tasks;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Passwords (document in README): ChangeMe_Admin123!, ChangeMe_Manager123!, ChangeMe_User123!, ChangeMe_User2123!

INSERT INTO users (id, name, email, password_hash, role, manager_id, is_active) VALUES
(1, 'Admin User', 'admin@taskmgmt.local', '$2b$10$Mi7Ff6MCCQyrN8ICuW64ke5f9es97JA8K4sQtEhZ3j6WswR38CBGi', 'admin', NULL, 1),
(2, 'Jane Manager', 'manager@taskmgmt.local', '$2b$10$3L4vk2ZM9m3WoW5v5ffiTuBfZIYETAjEplaRfyD4xyIUwXDj43QDm', 'manager', NULL, 1),
(3, 'Bob User', 'user1@taskmgmt.local', '$2b$10$HVeusYoIWSgmo3tCaZgmC.nzhCy3N1N5KQ0ZRpDmwPUuDTGe2mZbG', 'user', 2, 1),
(4, 'Alice User', 'user2@taskmgmt.local', '$2b$10$0kbVkWUkLkJ72e9gz3bJpeBeX3qR.ZRAXHEhxgQdzPFeXuuPGfEvW', 'user', 2, 1);

INSERT INTO tasks (title, description, status, priority, assigned_to, created_by, due_date) VALUES
('Onboard new hire', 'Prepare access and equipment', 'pending', 'high', 3, 2, DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
('Quarterly report', 'Compile Q3 metrics', 'in_progress', 'medium', 3, 2, DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
('Update documentation', 'API and README drafts', 'pending', 'low', 4, 2, DATE_ADD(CURDATE(), INTERVAL 10 DAY)),
('Security review', 'Audit RBAC rules', 'pending', 'high', 2, 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY)),
('Fix login bug', 'Investigate session expiry', 'completed', 'medium', 4, 1, DATE_ADD(CURDATE(), INTERVAL -2 DAY)),
('Client demo prep', 'Slides and walkthrough', 'in_progress', 'high', 3, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY));

INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'seed.completed', 'system', NULL, JSON_OBJECT('message', 'Database seeded for local development')),
(1, 'user.created', 'user', 2, JSON_OBJECT('email', 'manager@taskmgmt.local', 'role', 'manager')),
(2, 'task.created', 'task', 1, JSON_OBJECT('title', 'Onboard new hire'));
