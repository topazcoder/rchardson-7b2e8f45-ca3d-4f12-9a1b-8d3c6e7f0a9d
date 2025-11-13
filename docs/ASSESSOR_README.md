# Assessor Summary — Secure Task Management

This one-page summary highlights the implemented security features, acceptance criteria, and quick verification steps for assessors.

Project snapshot
- Backend: NestJS (apps/api) with JWT authentication, TypeORM, and RBAC guards/decorators.
- Frontend: Angular (apps/dashboard) with JWT-attaching interceptor, Toastr notifications, and basic task UI.
- Shared libs: `libs/data` (DTOs/types), `libs/auth` (decorators/guards).

Acceptance checklist (implemented)
- [x] JWT-based authentication (login issues JWT).
- [x] Global token verification guard applied by default; `@Public()` decorator available for public endpoints.
- [x] RBAC: `@Roles(...)` decorator + `RolesGuard` (Owner/Admin/Viewer) with org scoping.
- [x] Task endpoints with permission checks: create/list/update/delete.
- [x] Audit endpoint accessible to Owner/Admin only.
- [x] Registration UI works without authentication (organization listing endpoints are public).
- [x] Seed script creates schema and demo data and reads `apps/api/.env` reliably.
- [x] Graceful process handlers for `uncaughtException`/`unhandledRejection`/signals.

Quick verification (5–10 minutes)
1. From repo root install and start services:
   ```powershell
   npm install
   npm run start:api
   npm run start:dashboard
   ```
2. Seed demo data (in a separate terminal):
   ```powershell
   npm run api:seed:sql
   ```
   The seed script creates a demo organization and an owner user. Default credentials (if not overridden in `.env`):
   - username: `owner`
   - password: `owner123`
3. Login via API (curl example) to obtain a token:
   ```powershell
   $body = @{ username = 'owner'; password = 'owner123' } | ConvertTo-Json
   Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
   ```
   Save the returned `accessToken` and attach it as `Authorization: Bearer <token>` for protected requests.
4. Verify public org endpoint (no auth required):
   ```powershell
   Invoke-RestMethod -Uri 'http://localhost:3000/api/organizations/parents' -Method GET
   ```
   Expect: 200 with an array of organizations.
5. Verify RBAC behavior:
   - As Owner (token from step 3), POST `/api/tasks` should succeed (201).
   - Create a Viewer user under the same org (or change role in DB), request with its token then attempt DELETE `/api/tasks/:id` — expect 403 Forbidden.

Key files to inspect
- `apps/api/src/app/auth/*` — JWT strategy, `Public` decorator, `Roles` decorator, guards.
- `apps/api/src/app/tasks/*` — Tasks controller/service; permission checks.
- `apps/api/scripts/seed-sql.js` — DB seed script and env loading.
- `apps/api/src/main.ts` — env loader import and process-level error handlers.
- `apps/dashboard/src/app/services/api.interceptor.ts` — attaches token and redirects on 401/403.

Test evidence
- Unit tests were added for RBAC guards and auth logic (backend) and for several frontend services/components.
- Run tests:
  - `npx nx test api`
  - `npx nx test dashboard`

Notes for the assessor
- The global guard enforces JWT on all endpoints by default; endpoints intended to be public (registration, organization lists used for registration) are marked with `@Public()`.
- The seed script and env loader ensure reproducible local runs: `apps/api/.env` is used by both the Nest app and the seed script.

Recommendations / next checks
- Run integration tests (SuperTest) that exercise 401/403/200 flows for key endpoints — I can add these if needed.
- Review `libs/data` for any remaining `any` types and tighten TS types before final submission.

Contact
- If you need additional verification steps or sample requests, tell me which endpoints you want scripted and I will add small verification scripts.

---

End of assessor summary.
