# Initial Architecture

## Application layers

1. **Web UI** — responsive dashboard, forms, tables, phase boards, and controlled-record views.
2. **Server/API** — authenticated server-side operations, request validation, authorization, workflow rules, and reporting.
3. **Domain services** — project planning, deliverable workflow, revision control, approvals, and traceability.
4. **Persistence** — PostgreSQL with relational constraints and migrations.
5. **Private file storage** — documents and evidence served only through authorized access.
6. **Operational controls** — structured logs, health checks, backups, dependency checks, and deployment secrets.

## Recommended first data model

- `users`
- `roles` and `user_roles`
- `customers`
- `plants`
- `components`
- `projects`
- `project_members`
- `apqp_phases`
- `deliverable_templates`
- `project_deliverables`
- `action_items`
- `documents` and `document_revisions`
- `approvals`
- `audit_events`

More detailed quality-domain tables (process operations, failure modes, controls, characteristics, inspection plans, measurements and PPAP evidence) should be designed with explicit cross-references as modules are implemented.

## Security decisions

- Authenticate on the server and authorize each action against role and record scope.
- Deny access by default and validate file access independently of UI navigation.
- Use parameterized database queries / ORM APIs.
- Keep secrets outside source control and rotate them when exposed.
- Avoid storing passwords directly; use a reputable authentication implementation.
- Record approval actions and meaningful changes in append-only audit events.
- Treat user-uploaded files and AI-provided content as untrusted input.
- Do not allow AI output to approve or release controlled quality records.

## Reliability and delivery

- Use versioned database migrations.
- Add unit tests for domain rules and integration tests for permission boundaries.
- Run formatting, linting, type checks, and tests in continuous integration.
- Monitor errors without logging credentials or sensitive customer content.
- Define backup retention and recovery objectives before production launch.
