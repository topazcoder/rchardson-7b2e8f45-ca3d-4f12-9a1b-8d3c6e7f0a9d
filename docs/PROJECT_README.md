# Secure Task Management (NX monorepo)

This workspace implements a secure Task Management System with role-based access control (RBAC). It contains a NestJS backend (JWT auth, RBAC) and an Angular frontend.

Repository layout
- `apps/api` — NestJS backend (TypeORM, JWT, RBAC guards/decorators)
- `apps/dashboard` — Angular frontend (standalone components, Tailwind, Toastr)
- `libs/data` — shared DTOs and interfaces
- `libs/auth` — reusable auth/RBAC code (decorators, guards)

This README documents setup, what has been implemented, the architecture, and next steps.

## Quick start
```powershell
# install deps
npm install

# start backend
npm run start:api

# start frontend
npm run start:dashboard

# seed DB using apps/api/.env
npm run api:seed:sql

# run tests (examples)
npx nx test api
npx nx test dashboard
```

## Environment
- The backend reads environment from `apps/api/.env` (this project includes a loader so scripts and the Nest entrypoint use the same file).
- Important vars (example):
  - `DATABASE_URL` or `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - `JWT_SECRET` — secret used to sign tokens
  - `PORT` — API port

If your DB password has special characters and you use `DATABASE_URL`, URL-encode the password (e.g. `!` -> `%21`).

## What I implemented (brief)
- Global JWT verification guard (applied by default) and a `@Public()` decorator to opt-out per-endpoint.
- `@Roles(...)` decorator and a `RolesGuard` for RBAC with Owner/Admin/Viewer roles.
- Role inheritance logic and organization-scoped access (Owner > Admin > Viewer).
- API endpoints for tasks (create/list/update/delete) and an audit endpoint restricted to Owner/Admin.
- Frontend toast notifications via `ngx-toastr` and a central `ApiInterceptor` that redirects to `/login` on 401/403.
- Header user/profile popup with organization display and click-outside close behavior.
- Seed script `apps/api/scripts/seed-sql.js` that creates schema, demo org/user/tasks and robustly reads `apps/api/.env`.
- Global process handlers in `apps/api/src/main.ts` for `uncaughtException`, `unhandledRejection`, `SIGINT`, `SIGTERM` to attempt graceful shutdown and exit.
- Unit tests added for guards, auth service, and several frontend components; Jest configs fixed for project tests.

## Data model (high level)
- User: id, username, email, passwordHash, role ('owner'|'admin'|'viewer'), organizationId
- Organization: id, name, parentId (supports 2-level hierarchy)
- Task: id, title, description, status (integer), category, ownerId (organization)
- Audit: id, action, meta, actorId, orgId, created_at

## Access control summary
- Authentication: JWT-based; login issues a token used for subsequent requests.
- Global guard: JWT guard applied globally; endpoints decorated with `@Public()` bypass it.
- RBAC: `@Roles(...)` decorates controllers/actions; `RolesGuard` enforces role membership with optional org scoping.
- Owners have full access to their organization; Admins have management rights; Viewers have read-only scopes.

## API (essential endpoints)
- POST `/api/auth/login` — returns JWT
- POST `/api/auth/register` — register (public)
- GET `/api/tasks` — list tasks visible to the caller (scoped by role/org)
- POST `/api/tasks` — create task (permission-checked)
- PUT `/api/tasks/:id` — update task (permission-checked)
- DELETE `/api/tasks/:id` — delete task (permission-checked)
- GET `/api/audit-log` — view audit logs (Owner/Admin only)
- GET `/api/organizations/parents` — public endpoint used by registration UI

## Frontend notes
- The dashboard attaches JWT to requests using an `ApiInterceptor` and shows user-facing toasts for errors/successes.
- Registration page fetches parent organizations from the public org endpoints so it functions when unauthenticated.

## Testing
- Backend: Jest unit tests added for RBAC guards and the auth service. Run with `npx nx test api`.
- Frontend: Jest unit tests for services/components; run with `npx nx test dashboard`.

## How to seed data
```powershell
npm run api:seed:sql
```
This script reads `apps/api/.env` for DB config and will create the `task_management` schema and sample data.

## Troubleshooting
- If you see `client password must be a string`, ensure `DB_PASS` or `DATABASE_URL` is set and the script loads `apps/api/.env` (the repo includes an env loader).
- If `@tailwind` unknown at-rule appears during frontend build, ensure PostCSS/Tailwind plugins are configured in the build pipeline.

## Next recommended tasks
- Add integration (SuperTest) tests that verify protected endpoints return 401/403 appropriately and permitted roles succeed.
- Replace remaining `any` usages across the codebase with concrete interfaces in `libs/data`.
- Add refresh token support and rate-limiting/captcha on registration for production hardening.

---

**Notes:** This README reflects the current implementation in this workspace (guards, decorators, Toastr integration, seed script, graceful shutdown, and tests). Run the commands above to boot the services and run the seed script. If you want, I can produce a compact submission README (one-page) tailored to an assessor that highlights the security decisions and acceptance tests.
