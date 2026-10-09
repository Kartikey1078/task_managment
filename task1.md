# Master Prompt: Full-Stack RBAC Task Management System

Act as a Senior Full-Stack Developer, Software Architect, UI/UX Designer, and Security Engineer.

Build a complete, production-quality **Role-Based Access Control (RBAC) Task Management System** that satisfies all requirements of a Full-Stack Developer Assessment.

Do not create only a demo UI or static prototype. Build a fully functional application with a working frontend, backend APIs, MySQL database, authentication, authorization, validation, error handling, and documentation.

## 1. Technology Stack

### Frontend

- React.js with Vite
- JavaScript
- React Router DOM
- Tailwind CSS
- Axios
- React Hook Form
- Zod for form validation
- Lucide React icons
- Recharts for dashboard charts, if needed

### Backend

- Node.js
- Express.js
- REST API architecture
- JWT authentication using secure HTTP-only cookies
- bcrypt for password hashing
- Zod for API validation
- Helmet for security headers
- CORS configured for the frontend origin
- Rate limiting for authentication endpoints

### Database

- MySQL
- phpMyAdmin for database administration
- mysql2
- Environment variables for database configuration
- SQL schema and seed files

Use phpMyAdmin to create, inspect, and manage the MySQL database. The application backend must connect directly to MySQL; do not use phpMyAdmin as an API or database connection layer.

## 2. Application Overview

Build a professional Task Management System where users can log in and access features according to their assigned roles.

The application must implement three roles:

1. Admin
2. Manager
3. User

Every role must have different permissions enforced on both the frontend and backend.

## 3. Role-Based Permissions

### Admin

- View the complete dashboard.
- View all users.
- Create, update, activate, and deactivate users.
- Assign roles to users.
- View all tasks.
- Create, edit, assign, and delete tasks.
- View task statistics and activity logs.
- Search, filter, sort, and paginate users and tasks.

### Manager

- View the manager dashboard.
- View tasks they are authorized to manage.
- Create tasks.
- Assign tasks to users within their permitted team or scope.
- Edit tasks they are authorized to manage.
- Update task priorities and deadlines.
- Track task status and progress.
- View task-related statistics.
- Cannot access Admin-only user management or assign Admin roles.

### User

- View their own dashboard.
- View only tasks assigned to them or otherwise explicitly authorized.
- View task details.
- Update the status of their assigned tasks.
- Add comments to authorized tasks, if comments are implemented.
- Cannot create, delete, or reassign tasks unless explicitly permitted.
- Cannot access Admin or Manager-only pages and APIs.

Implement these permissions in a centralized authorization layer. Do not rely on hiding frontend buttons as the security mechanism.

Prevent users from changing their role by modifying request payloads or calling APIs directly.

## 4. Authentication

Implement:

- Login page.
- Logout functionality.
- Password hashing with bcrypt.
- Secure JWT-based authentication using HTTP-only cookies.
- Authentication middleware.
- Role-based authorization middleware.
- Current-user API endpoint.
- Session/token expiration handling.
- Login rate limiting.
- Validation of email and password.
- Proper handling of invalid credentials.
- Protection against unauthorized access.
- No plain-text password storage.
- No secrets or credentials hardcoded in source code.

Use secure cookie settings appropriate to development and production environments. Configure CORS and credentials correctly.

Registration should either be disabled for public users or use a safe default role. Public registration must never allow users to choose Admin or Manager privileges.

## 5. Dashboard and UI

Create a clean, modern, responsive SaaS-style interface.

### Design requirements

- Professional layout suitable for a developer assessment.
- Consistent typography, spacing, colors, and components.
- Responsive desktop, tablet, and mobile layouts.
- Sidebar navigation and top navigation bar.
- Dashboard summary cards.
- Task tables or responsive task cards.
- Status and priority badges.
- Search and filter controls.
- Loading indicators and skeleton states.
- Empty states.
- Success and error notifications.
- Confirmation dialogs for destructive actions.
- Accessible forms and buttons.
- Pagination controls.
- Consistent handling of API errors.

Use a professional design with a light background, dark green or navy accents, subtle borders, and clear visual hierarchy. Avoid unnecessary animations and excessive gradients.

### Required pages

1. Login
2. Admin dashboard
3. Manager dashboard
4. User dashboard
5. Task listing
6. Task details
7. Create task
8. Edit task
9. User management — Admin only
10. Activity logs — Admin only
11. Profile/settings page
12. Not Found page
13. Unauthorized access page

Redirect users to the correct dashboard after login based on their actual role returned by the backend.

## 6. Task Management CRUD

Implement complete task CRUD functionality.

Each task should include:

- ID
- Title
- Description
- Status: Pending, In Progress, Completed
- Priority: Low, Medium, High
- Assigned user ID
- Created by user ID
- Due date
- Created timestamp
- Updated timestamp

Requirements:

- Create a task.
- Read task lists and details.
- Update permitted task fields.
- Delete tasks only for authorized roles.
- Assign and reassign tasks only for authorized roles.
- Validate due dates and required fields.
- Prevent unauthorized access to task IDs belonging to other users.
- Return appropriate errors for missing or inaccessible tasks.

Use server-side authorization for every read and mutation. Do not trust task IDs, user IDs, or role information supplied by the client.

## 7. MySQL Database Design

Create the required SQL schema.

Minimum tables:

### users

- id
- name
- email (unique)
- password_hash
- role
- is_active
- created_at
- updated_at

### tasks

- id
- title
- description
- status
- priority
- assigned_to
- created_by
- due_date
- created_at
- updated_at

### activity_logs

- id
- user_id
- action
- entity_type
- entity_id
- details
- created_at

Add foreign keys, indexes, unique constraints, appropriate data types, and timestamps.

Use database transactions where multiple related operations must succeed or fail together.

Generate:

- `database/schema.sql`
- `database/seed.sql`
- Database setup instructions for phpMyAdmin.

The seed script must create sample users for all three roles using securely hashed passwords. Never seed production systems with publicly accessible default credentials.

## 8. REST API Design

Use a consistent `/api` prefix.

### Authentication

- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`

### Users

- GET `/api/users` — Admin only
- GET `/api/users/:id` — Authorized access only
- POST `/api/users` — Admin only
- PUT `/api/users/:id` — Admin only, with safe field restrictions
- PATCH `/api/users/:id/status` — Admin only

### Tasks

- GET `/api/tasks`
- GET `/api/tasks/:id`
- POST `/api/tasks`
- PUT `/api/tasks/:id`
- PATCH `/api/tasks/:id/status`
- DELETE `/api/tasks/:id`

### Activity Logs

- GET `/api/activity-logs` — Admin only

Apply the correct authentication, authorization, ownership checks, and input validation to every endpoint. If an operation is not permitted for a particular role, return HTTP 403 or an appropriate non-disclosing error.

Support pagination, search, sorting, and filtering for task and user listings where applicable.

Use consistent response formats and appropriate HTTP status codes.

## 9. Backend Architecture

Use a maintainable folder structure:

`backend/`

- `src/config/`
- `src/controllers/`
- `src/services/`
- `src/repositories/`
- `src/routes/`
- `src/middleware/`
- `src/validators/`
- `src/utils/`
- `src/app.js`
- `src/server.js`
- `database/`
- `.env.example`
- `package.json`

Separate routes, controllers, business logic, database access, validation, and middleware.

Create reusable middleware for:

- Authentication
- Role authorization
- Request validation
- Error handling
- Not-found routes
- Rate limiting

Use parameterized SQL queries or a properly configured ORM. Never construct SQL statements by concatenating untrusted user input.

## 10. Frontend Architecture

Use this structure:

`frontend/`

- `src/components/`
- `src/pages/`
- `src/layouts/`
- `src/routes/`
- `src/context/`
- `src/hooks/`
- `src/services/`
- `src/utils/`
- `src/validators/`
- `src/App.jsx`
- `src/main.jsx`

Create reusable components:

- Sidebar
- Navbar
- ProtectedRoute
- RoleGuard
- DataTable
- Pagination
- SearchInput
- FilterPanel
- FormInput
- Modal
- ConfirmationDialog
- LoadingSpinner
- ErrorState
- StatusBadge
- PriorityBadge

Use a centralized Axios instance with credentials enabled. Load the authenticated user from the backend and handle expired sessions correctly.

Frontend route protection is for navigation and user experience; the backend must independently enforce every permission.

## 11. Security Requirements

Implement:

- Secure password hashing.
- HTTP-only authentication cookies.
- Appropriate SameSite and Secure cookie settings.
- CSRF protection appropriate to the cookie-based authentication design.
- CORS allowlisting.
- Helmet security headers.
- Rate limiting for login attempts.
- Request body validation.
- SQL injection prevention.
- Safe error responses.
- Authorization checks for every sensitive operation.
- Protection against privilege escalation.
- Task ownership and scope checks.
- No password hashes or tokens in API responses.
- No sensitive information in logs.
- Environment-based configuration.

Validate role transitions and account activation/deactivation on the server. In particular, prevent a Manager or User from promoting themselves or other users to Admin.

## 12. Testing

Add automated tests for critical behavior.

Test:

- Successful login.
- Invalid login.
- Inactive account rejection.
- Admin-only endpoints.
- Manager restrictions.
- User restrictions.
- Unauthorized requests.
- Cross-user task access.
- Task creation, updates, and deletion.
- Invalid request payloads.
- Pagination and filtering.
- Logout and session expiration.

Use an appropriate testing framework such as Vitest or Jest and Supertest.

Include a role-permission matrix in the README. Ensure the test suite demonstrates that forbidden actions are actually blocked by the backend.

## 13. Deployment

Prepare the application for deployment.

Frontend:

- Vercel&#x20;

Backend:

- aws ec2

Database:

- A managed MySQL service accessible to the backend.

Requirements:

- Production environment variables.
- Correct frontend/backend API URL configuration.
- HTTPS in production.
- Secure cookies and correct CORS settings.
- Database migrations or repeatable schema setup.
- Deployment instructions.
- Health-check endpoint such as `GET /api/health`.

Do not expose database credentials in frontend environment variables or commit `.env` files to GitHub.

## 14. Documentation

Create a complete `README.md` containing:

1. Project overview.
2. Main features.
3. Technology stack.
4. Architecture overview.
5. Folder structure.
6. Database schema.
7. Instructions for creating the database in phpMyAdmin.
8. Local installation steps.
9. Environment variable configuration.
10. Frontend and backend startup commands.
11. Test instructions.
12. Test user credentials for local development.
13. Role-permission matrix.
14. API endpoint documentation.
15. Security decisions and assumptions.
16. Deployment instructions.
17. Screenshots section.

Create a `.gitignore` that excludes `.env`, `node_modules`, build artifacts, logs, and other sensitive files.

## 15. Bonus Features

If time permits, implement:

- Docker and Docker Compose.
- Unit and integration tests.
- GitHub Actions CI pipeline.
- Activity/audit logging.
- Task search, filtering, and pagination.
- Dashboard charts.
- Toast notifications.
- CSV export.
- Demo screenshots.

Prioritize core requirements over bonus features.

## 16. Implementation Workflow

Follow this sequence:

Phase 1: Plan architecture, permissions, database schema, and API contracts.

Phase 2: Create the backend, database connection, SQL schema, seed script, authentication, and RBAC middleware.

Phase 3: Implement task CRUD, user management, validation, error handling, and audit logs.

Phase 4: Build the React frontend, dashboards, protected routes, forms, tables, and responsive design.

Phase 5: Integrate the frontend with the backend and verify all role-specific behavior.

Phase 6: Run tests, fix errors, and verify security restrictions.

Phase 7: Write the README, prepare deployment configuration, and deploy if hosting credentials and services are available.

## 17. Acceptance Criteria

The application is complete only when:

- All three roles can log in with valid accounts.
- Each role sees the appropriate dashboard.
- All protected pages and APIs enforce permissions.
- Task CRUD operations work with MySQL.
- Users cannot access unauthorized tasks.
- User roles cannot be manipulated through client requests.
- Input validation and error handling work correctly.
- The UI is responsive and usable.
- SQL schema and seed files are provided.
- Automated tests cover the core RBAC rules.
- README setup instructions are complete.
- The project runs locally without missing files or unresolved imports.

## Final Instructions

- Generate actual working source code, not pseudocode.
- Do not leave critical functionality as TODO comments or placeholder buttons.
- Do not fabricate successful test results or deployment URLs.
- Use maintainable, readable code with clear naming.
- Keep frontend and backend responsibilities separate.
- Explain commands required to install, configure, run, and test the application.
- If you have access to the project filesystem, create and edit the actual project files, install dependencies when possible, run tests, and fix errors.
- If you cannot execute commands or access the filesystem, provide complete file contents and explicit setup commands instead of claiming the project is finished.
- Implement and verify the core assessment requirements before spending time on optional features.

Start by presenting the proposed architecture and folder structure, then implement the project phase by phase.
