CREATE TABLE agent_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  request_id TEXT UNIQUE NOT NULL,
  protocol TEXT NOT NULL DEFAULT 'rest',
  operation TEXT NOT NULL,
  agent_name TEXT,
  partner_key_id UUID,
  status_code INTEGER,
  latency_ms INTEGER,
  query_summary TEXT,
  result_count INTEGER,
  checkout_session_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  actor_user_id TEXT,
  actor_type TEXT NOT NULL DEFAULT 'user',
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_requests_organization_id ON agent_requests(organization_id, created_at);
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id, created_at);
