-- PostgreSQL schema for Vibes APQP. Apply with: psql "$DATABASE_URL" -f db/schema.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE user_role AS ENUM ('ADMIN','APQP_MANAGER','QUALITY_ENGINEER','ENGINEER','VIEWER');
CREATE TYPE project_status AS ENUM ('ON_TRACK','AT_RISK','DELAYED','COMPLETED','ON_HOLD');
CREATE TYPE deliverable_status AS ENUM ('NOT_STARTED','IN_PROGRESS','IN_REVIEW','APPROVED','BLOCKED','NOT_APPLICABLE');
CREATE TYPE review_decision AS ENUM ('APPROVED','REJECTED','CHANGES_REQUESTED');
CREATE TABLE IF NOT EXISTS app_users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE, full_name text NOT NULL,
 password_hash text NOT NULL, role user_role NOT NULL DEFAULT 'VIEWER', active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, name text NOT NULL, requirements jsonb NOT NULL DEFAULT '{}',
 active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS plants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, name text NOT NULL, location text, active boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS components (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid REFERENCES customers(id), part_number text NOT NULL,
 name text NOT NULL, revision text NOT NULL DEFAULT 'A', material text, process_family text,
 UNIQUE(customer_id, part_number, revision)
);
CREATE TABLE IF NOT EXISTS apqp_projects (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_code text NOT NULL UNIQUE, name text NOT NULL,
 customer_id uuid REFERENCES customers(id), component_id uuid REFERENCES components(id), plant_id uuid REFERENCES plants(id),
 owner_id uuid REFERENCES app_users(id), status project_status NOT NULL DEFAULT 'ON_TRACK',
 target_date date, start_date date, current_phase smallint NOT NULL DEFAULT 1 CHECK(current_phase BETWEEN 1 AND 5),
 description text, customer_specific_requirements jsonb NOT NULL DEFAULT '{}',
 created_by uuid REFERENCES app_users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz
);
CREATE TABLE IF NOT EXISTS project_members (
 project_id uuid REFERENCES apqp_projects(id) ON DELETE CASCADE, user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
 project_role text NOT NULL DEFAULT 'MEMBER', PRIMARY KEY(project_id,user_id)
);
CREATE TABLE IF NOT EXISTS apqp_phases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES apqp_projects(id) ON DELETE CASCADE,
 phase_number smallint NOT NULL CHECK(phase_number BETWEEN 1 AND 5), name text NOT NULL, gate_status text NOT NULL DEFAULT 'OPEN',
 planned_start date, planned_finish date, approved_by uuid REFERENCES app_users(id), approved_at timestamptz,
 UNIQUE(project_id,phase_number)
);
CREATE TABLE IF NOT EXISTS deliverables (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES apqp_projects(id) ON DELETE CASCADE,
 phase_id uuid NOT NULL REFERENCES apqp_phases(id) ON DELETE CASCADE, code text NOT NULL, title text NOT NULL,
 description text, owner_id uuid REFERENCES app_users(id), due_date date, status deliverable_status NOT NULL DEFAULT 'NOT_STARTED',
 mandatory boolean NOT NULL DEFAULT true, evidence_required boolean NOT NULL DEFAULT false,
 completed_at timestamptz, created_by uuid REFERENCES app_users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(project_id,code)
);
CREATE TABLE IF NOT EXISTS deliverable_comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), deliverable_id uuid NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
 user_id uuid REFERENCES app_users(id), comment text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid REFERENCES apqp_projects(id) ON DELETE CASCADE,
 deliverable_id uuid REFERENCES deliverables(id) ON DELETE SET NULL, document_code text NOT NULL, title text NOT NULL,
 category text NOT NULL, storage_key text NOT NULL, mime_type text, file_size bigint, revision integer NOT NULL DEFAULT 1,
 status text NOT NULL DEFAULT 'DRAFT', uploaded_by uuid REFERENCES app_users(id), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(project_id,document_code,revision)
);
CREATE TABLE IF NOT EXISTS document_reviews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
 reviewer_id uuid REFERENCES app_users(id), decision review_decision NOT NULL, comments text,
 decided_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS quality_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES apqp_projects(id) ON DELETE CASCADE,
 record_type text NOT NULL CHECK(record_type IN ('FEASIBILITY','PROCESS_FLOW','DFMEA','PFMEA','CONTROL_PLAN','MSA','SPC','INSPECTION','CHANGE_REQUEST')),
 record_code text NOT NULL, title text NOT NULL, revision integer NOT NULL DEFAULT 1,
 status text NOT NULL DEFAULT 'DRAFT', payload jsonb NOT NULL DEFAULT '{}',
 created_by uuid REFERENCES app_users(id), approved_by uuid REFERENCES app_users(id), approved_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(project_id,record_type,record_code,revision)
);
CREATE TABLE IF NOT EXISTS ppap_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES apqp_projects(id) ON DELETE CASCADE,
 submission_number text NOT NULL, submission_level smallint NOT NULL CHECK(submission_level BETWEEN 1 AND 5),
 reason text NOT NULL, status text NOT NULL DEFAULT 'PREPARING', submitted_at timestamptz, customer_decision text,
 customer_comments text, created_by uuid REFERENCES app_users(id), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(project_id,submission_number)
);
CREATE TABLE IF NOT EXISTS ppap_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), submission_id uuid NOT NULL REFERENCES ppap_submissions(id) ON DELETE CASCADE,
 item_number smallint NOT NULL CHECK(item_number BETWEEN 1 AND 18), title text NOT NULL,
 required boolean NOT NULL DEFAULT true, status deliverable_status NOT NULL DEFAULT 'NOT_STARTED',
 document_id uuid REFERENCES documents(id), notes text, UNIQUE(submission_id,item_number)
);
CREATE TABLE IF NOT EXISTS action_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES apqp_projects(id) ON DELETE CASCADE,
 deliverable_id uuid REFERENCES deliverables(id) ON DELETE SET NULL, title text NOT NULL, owner_id uuid REFERENCES app_users(id),
 due_date date, priority text NOT NULL DEFAULT 'MEDIUM', status text NOT NULL DEFAULT 'OPEN',
 closed_at timestamptz, created_by uuid REFERENCES app_users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_events (
 id bigserial PRIMARY KEY, actor_id uuid REFERENCES app_users(id), project_id uuid REFERENCES apqp_projects(id) ON DELETE SET NULL,
 entity_type text NOT NULL, entity_id text NOT NULL, action text NOT NULL, before_data jsonb, after_data jsonb,
 ip_address inet, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projects_status_target ON apqp_projects(status,target_date) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deliverables_project_phase ON deliverables(project_id,phase_id,status);
CREATE INDEX IF NOT EXISTS idx_actions_open_due ON action_items(status,due_date);
CREATE INDEX IF NOT EXISTS idx_quality_records_project_type ON quality_records(project_id,record_type);
CREATE INDEX IF NOT EXISTS idx_audit_project_time ON audit_events(project_id,created_at DESC);
