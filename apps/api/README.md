# API (NestJS + TypeORM + PostgreSQL)

This API app uses TypeORM with a DataSource and migrations. Migrations are run automatically on app startup when `migrationsRun: true` is set in the TypeORM config. Additionally, there are helper scripts to run and revert migrations manually.

## Environment
Set these environment variables (or provide via `.env`):

- DB_HOST (default: localhost)
- DB_PORT (default: 5432)
- DB_USER (default: postgres)
- DB_PASS (default: postgres)
- DB_NAME (default: task_management)
- JWT_SECRET

## Useful commands
From the repo root:

Run pending migrations using the TypeORM DataSource script:

```powershell
npm run api:migrate:run
```

Revert the last applied migration:

```powershell
npm run api:migrate:revert
```

Start the API (with Nx):

```powershell
npm run start:api
```

Notes
- The project contains an initial migration at `apps/api/src/app/migrations/0001-initial.ts`.
- The DataSource configuration is at `apps/api/src/data-source.ts`.
- On app startup TypeORM will also run pending migrations because `migrationsRun: true` is set. That makes deployments apply schema changes automatically (ensure migrations are reviewed and applied responsibly).
