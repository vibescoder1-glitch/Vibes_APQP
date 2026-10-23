# Vibes APQP & NPD Management System

An integrated APQP (Advanced Product Quality Planning) and NPD (New Product Development) workspace for automotive manufacturing, initially tailored for rubber components and mold manufacturing.

> **Project status:** Early UI MVP. A responsive demo dashboard and project list are implemented. Authentication, persisted database records, controlled quality workflows, and production deployment are still pending.

## Objectives

- Track APQP projects, phases, milestones, owners, risks, and approvals.
- Connect customer requirements, feasibility, process flow, DFMEA/PFMEA, Control Plan, inspection evidence, and PPAP deliverables.
- Maintain document revisions, review decisions, traceability, and an auditable activity history.
- Provide project health dashboards and exportable reports.
- Support customer-specific requirements and configurable workflows.

## Planned modules

1. **Project portfolio** — customer, component, program, plant, project owner, phase, timing, and status.
2. **APQP planning** — phase gates, deliverables, responsibility assignments, due dates, and evidence.
3. **Product and process planning** — feasibility review, process flow, DFMEA/PFMEA, Control Plan, and linked characteristics.
4. **Quality validation** — MSA, SPC, inspection / test results, and PPAP submission checklist.
5. **Document control** — controlled uploads, revisions, approvals, effective dates, and change history.
6. **Engineering change** — change requests, impact assessment, approvals, and affected-document traceability.
7. **Analytics and reports** — overdue actions, milestone slippage, risk exposure, phase-gate readiness, and exports.
8. **Administration** — role-based access, user management, customer-specific requirements, and configurable reference data.

## Recommended architecture

- **Web application:** Next.js, React, TypeScript
- **API / server logic:** TypeScript on Node.js
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** secure server-side sessions and role-based authorization
- **File storage:** private object storage with controlled access
- **Validation and tests:** schema validation, unit tests, integration tests, and end-to-end tests
- **Deployment:** HTTPS-enabled hosting, protected environment secrets, automated checks, backups, and monitoring

The initial UI uses Next.js, React, TypeScript, and Lucide icons. The database, authentication, file storage, and production API are planned but not wired into the current MVP.

## Initial delivery milestones

### Milestone 1 — Application foundation
- Establish application structure, coding conventions, environment configuration, and database connection.
- Build responsive navigation and a first dashboard using clearly identified sample data.
- Define core data models for users, customers, products/components, projects, phases, deliverables, and action items.
- Add authorization boundaries and basic tests before introducing sensitive project data.

### Milestone 2 — APQP planning
- Create projects and assign owners.
- Configure phase-gate checklists and due dates.
- Track deliverable status, review comments, and supporting evidence.

### Milestone 3 — Linked quality tools
- Add process flow, PFMEA, and Control Plan records.
- Link process steps, failure modes, controls, and product/process characteristics.
- Keep revision and approval history.

### Milestone 4 — Validation and PPAP
- Add MSA/SPC/inspection evidence and PPAP submission readiness.
- Add exports and dashboard summaries.
- Validate required fields, permissions, audit history, recovery, and performance.

### Milestone 5 — Advanced workflow
- Add engineering change impact analysis, reusable process libraries, notifications, and optional AI-assisted drafting.
- AI-generated material must be marked as a draft and reviewed by qualified personnel before release.

## Core design principles

- **Traceability first:** avoid duplicate entry and preserve links between requirements, process planning, risks, controls, and validation evidence.
- **Controlled revisions:** approved records must not be silently overwritten.
- **Least privilege:** users should only access functions and records authorized for their role and scope.
- **Auditability:** capture who changed or approved a record and when.
- **Evidence-based status:** readiness indicators should be calculated from deliverables and approvals, not manually asserted.
- **Customer-specific configuration:** requirements must be configurable per customer/program rather than assumed to be universal.

## Important quality-system note

The application is a workflow and record-management aid. Before operational use, the company must validate its forms, gate criteria, terminology, retention rules, and approval process against the applicable current AIAG APQP / Control Plan requirements, IATF 16949 obligations where applicable, and each customer’s specific requirements. This repository does not include or reproduce proprietary standards content.

## Local development

Prerequisites: Node.js 20.9+ and npm.

```bash
git clone https://github.com/vibescoder1-glitch/Vibes_APQP.git
cd Vibes_APQP
npm install
npm run dev
```

Open `http://localhost:3000`. Available scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, and `npm run typecheck`. The GitHub Actions workflow runs type-checking and a production build on pushes and pull requests to `main`.

The current dashboard uses illustrative sample records held in browser memory. Creating a project, filters, CSV export, and action-item toggles are demo interactions; records reset on refresh. Do not enter real customer, supplier, product, or confidential manufacturing data. Never commit credentials or production data. Keep secrets in environment variables or the deployment platform's secret store.

## Security baseline

- Keep production deployments behind HTTPS.
- Enforce server-side authentication and authorization for every protected operation.
- Validate request payloads at the API boundary.
- Use least-privilege database credentials and private document storage.
- Do not commit `.env` files, credentials, customer records, or production exports.
- Back up the database and files, and test restoration periodically.
- Review dependency updates and run automated checks before merging changes.
