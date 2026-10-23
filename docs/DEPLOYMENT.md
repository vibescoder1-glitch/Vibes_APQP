# Deployment and first-run checklist

## Required environment

- `DATABASE_URL`: PostgreSQL connection string, restricted to the application database.
- `SESSION_SECRET`: random secret with at least 32 characters.
- `PG_POOL_MAX`: optional connection pool size.
- Set `NODE_ENV=production` in production.
- For PostgreSQL TLS, set `PGSSLMODE=require` only when the host certificate chain is trusted by the runtime.

## Initialize

1. Provision PostgreSQL and a least-privilege application role. Do not use a database superuser for the app.
2. Apply `db/schema.sql` to the target database.
3. Set `DATABASE_URL` and `SESSION_SECRET` in the hosting provider's secret manager. Never commit a real .env file.
4. Run `npm ci` (or `npm install` while the lockfile is being established), `npm run typecheck`, and `npm run build`.
5. Bootstrap the first administrator once, from a trusted shell: `npm run create-admin`. This command refuses to create a second admin when one already exists.
6. Deploy behind HTTPS, restrict database network access, configure backups, and test a restore.
7. Confirm login, authorization, audit events, file upload policy, and recovery procedures before entering production data.

## Current boundaries

The database/API layer is a foundation, not a certified quality system. The current frontend still contains illustrative demo state and is not yet wired to every API. Document metadata exists in the schema, but a private object-storage adapter, malware scanning, signed downloads, and retention controls must be configured before accepting real files. Login throttling in the current in-memory map is only per-process and must be replaced with a shared rate limiter at the edge or in Redis for multi-instance production deployments.

Do not deploy this version for real customer-confidential information until the remaining UI/API integration, tests, security review, backup/restore validation, and customer-specific quality process validation are completed.
