# Secure Task Management — Full Friendly README

Welcome! This file is a friendly, detailed README describing the project, how to run it, what was implemented, and verification steps.

## Overview
This NX monorepo implements a secure Task Management application with role-based access control (RBAC), a NestJS backend, and an Angular dashboard.

Apps and libs
- `apps/api` — NestJS backend (TypeORM, JWT authentication, RBAC decorators/guards)
- `apps/dashboard` — Angular frontend (standalone components, Tailwind, Toastr)
- `libs/data` — shared DTOs and interfaces
- `libs/auth` — shared RBAC helpers, decorators, and guards

## Quick Start (development)
1. Install dependencies
```powershell
npm install
```
2. Start backend and frontend (dev mode)
```powershell
npm run start:api
npm run start:dashboard
```
3. Seed demo data (creates schema + demo org/user/tasks)
```powershell
npm run seed
```
4. Run tests
```powershell
npx nx test api
npx nx test dashboard
```

## Environment variables
- The API reads env values from `apps/api/.env`. Example variables:
  - `DATABASE_URL` (preferred) or `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`.
  - `JWT_SECRET` — secret used to sign tokens.
  - `PORT` — API port (default 3000).

Tip: If your DB password contains characters like `!`, encode them when used in `DATABASE_URL` (e.g. `!` -> `%21`).

## Implemented features (brief)
- JWT-based authentication and login endpoint.
- Global JWT guard with a `@Public()` decorator for opt-out endpoints.
- RBAC with `@Roles(...)` and a `RolesGuard`; Owner/Admin/Viewer roles with inheritance.
- Organization-scoped access (2-level hierarchy).
- Tasks CRUD endpoints: create/list/update/delete with permission checks.
- Audit log endpoint available to Owner/Admin.
- Frontend includes an `ApiInterceptor` (attaches JWT, redirects to /login on 401/403) and uses `ngx-toastr` for notifications.
- Seed script for easy local data setup and consistent environment loading.
- Global process handlers in `apps/api/src/main.ts` to gracefully shut down on uncaught errors or signals.

## Quick verification steps
1. Start services (see Quick Start).
2. Seed demo data.
3. Login using the demo owner account (default if not overridden in `.env`):
   - username: `owner`
   - password: `owner123`
4. Use the returned JWT in `Authorization: Bearer <token>` for protected endpoints.
5. Verify that public endpoints (e.g., `GET /api/organizations/parents`) respond without auth.
6. Verify RBAC: Owner can create/delete tasks; Viewer should be forbidden to delete tasks.

## Key files to inspect
- `apps/api/src/app/auth/*` — auth strategy, decorators, guards
- `apps/api/src/app/tasks/*` — controllers/services for tasks
- `apps/api/scripts/seed-sql.js` — seeding and env handling
- `apps/api/src/main.ts` — env loader + process error handlers
- `apps/dashboard/src/app/services/api.interceptor.ts` — token attach + 401/403 handling

## Troubleshooting
- `client password must be a string`: ensure env vars are loaded and `DB_PASS` is a string or use a URL-encoded `DATABASE_URL`.
- `Unknown at rule @tailwind`: add a PostCSS config with `tailwindcss` plugin.
- Peer dependency warnings for Angular packages: align `@angular/*` versions rather than using `--force`.

## Next steps (suggested)
- Add integration (SuperTest) tests for authentication/RBAC flows.
- Tighten TypeScript types across the repo.
- Add refresh tokens and rate-limiting/captcha for production readiness.

---

If you want, I can move this file to `README.md` at the root and/or further tailor it for an assessor summary. Which would you prefer?