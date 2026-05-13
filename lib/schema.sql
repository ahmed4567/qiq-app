-- ============================================================
-- QiQ Portal — Database Schema
-- Run once against your Neon database
-- ============================================================

-- auto-updated timestamps trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'reviewer', 'agent')),
  agent_id      TEXT,
  reviewer_id   TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  invited_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- ============================================================
-- INVITES
-- ============================================================
CREATE TABLE IF NOT EXISTS invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'reviewer', 'agent')),
  token       TEXT UNIQUE NOT NULL,
  agent_id    TEXT,
  reviewer_id TEXT,
  invited_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);

-- ============================================================
-- CASES
-- ============================================================
CREATE TABLE IF NOT EXISTS cases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_id           TEXT UNIQUE,
  booking_reference TEXT NOT NULL,
  case_type         TEXT NOT NULL,
  month             TEXT NOT NULL,

  -- People
  agent_id          TEXT NOT NULL,
  agent_email       TEXT NOT NULL,
  reviewer_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewer_name     TEXT,
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Status
  status            TEXT NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'in_review', 'closed')),
  published         BOOLEAN NOT NULL DEFAULT false,
  auto_fail         BOOLEAN NOT NULL DEFAULT false,

  -- Dates
  creation_date     DATE,
  resolved_date     DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Scoring criteria (value = raw label, e.g. "Excellent" / "Yes")
  ownership_value             TEXT,
  ownership_comment           TEXT,
  handover_value              TEXT,
  handover_comment            TEXT,
  copy_paste_value            TEXT,
  copy_paste_comment          TEXT,
  correct_email_value         TEXT,
  correct_email_comment       TEXT,
  flow_value                  TEXT,
  flow_comment                TEXT,
  client_approach_value       TEXT,
  client_approach_comment     TEXT,
  supplier_approach_value     TEXT,
  supplier_approach_comment   TEXT,
  freshdesk_value             TEXT,
  freshdesk_comment           TEXT,
  juniper_value               TEXT,
  juniper_comment             TEXT,

  -- Computed totals (stored for fast queries / reporting)
  total_score       NUMERIC(5,1),
  kpi_tier          TEXT,
  notes             TEXT,

  -- Dispute
  dispute_status    TEXT NOT NULL DEFAULT 'none'
                      CHECK (dispute_status IN ('none', 'pending', 'accepted', 'rejected')),
  dispute_comment   TEXT,
  dispute_reply     TEXT
);

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_cases_agent_id       ON cases(agent_id);
CREATE INDEX IF NOT EXISTS idx_cases_reviewer_id    ON cases(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_cases_status         ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_month          ON cases(month);
CREATE INDEX IF NOT EXISTS idx_cases_published      ON cases(published);
CREATE INDEX IF NOT EXISTS idx_cases_dispute_status ON cases(dispute_status);
CREATE INDEX IF NOT EXISTS idx_cases_case_type      ON cases(case_type);