CREATE TABLE merchant_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  policy_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  full_url TEXT,
  structured_data JSONB DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, policy_type)
);

CREATE INDEX idx_merchant_policies_organization_id ON merchant_policies(organization_id);
