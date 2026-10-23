# Product Scope — MVP

## Primary users

- APQP / NPD project owner
- Quality engineer
- Process / manufacturing engineer
- Product / design engineer
- Production and inspection personnel
- Approver / quality manager
- System administrator

Role names and permissions must be configurable; do not rely on hiding UI elements as the security boundary.

## MVP outcomes

A user should be able to create a customer program and component project, assign a project owner and contributors, plan APQP phases, assign deliverables, attach supporting evidence, review and approve submissions, and see a traceable project status.

## Core entities

- Organization / plant
- User and role assignment
- Customer
- Program / project
- Product or component
- APQP phase and phase gate
- Deliverable template and project deliverable
- Action item / risk
- Document and document revision
- Review / approval
- Audit event

## Traceability chain

Customer and statutory requirements
→ product / process characteristics
→ process flow operations
→ PFMEA failure modes and controls
→ Control Plan controls and reaction plans
→ inspection / test evidence
→ PPAP submission items and approval status.

The implementation should use stable identifiers and explicit relationship records where many-to-many links occur. A document reference alone should not replace structured links between quality records.

## Recommended first APQP templates

- Project timing and cross-functional team
- Customer input and feasibility review
- Process flow diagram
- PFMEA
- Control Plan
- Measurement system / MSA evidence
- Process capability / SPC evidence
- Inspection and test records
- PPAP readiness checklist
- Lessons learned and engineering-change assessment

Templates and gate criteria must be reviewed against licensed/current standards and customer-specific requirements before formal use. This specification is not a replacement for those requirements.

## Status model

Prefer explicit statuses such as Draft, In Review, Changes Requested, Approved, and Obsolete for controlled records. Project phase status should be computed from deliverables, approvals, and due dates. Preserve the difference between missing evidence, not-applicable evidence (with an approved rationale), and completed evidence.

## Non-functional requirements

- Server-side authorization on every read/write path.
- Tenant/customer/plant scoping where required by company policy.
- Audit entries for create, update, submit, approve, reject, and revision events.
- Version history for controlled documents and quality records.
- Secure, private file storage; validate file size and allowed file types.
- Backups and tested restore process.
- No secrets or real customer data in source control or demo fixtures.
- Accessible, responsive user interface.
- Automated tests for workflow transitions, permissions, and traceability.
