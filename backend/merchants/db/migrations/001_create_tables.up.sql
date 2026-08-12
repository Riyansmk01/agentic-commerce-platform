CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'ID',
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  currency TEXT NOT NULL DEFAULT 'IDR',
  website_url TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organization_members (
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE merchant_profiles (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id),
  legal_name TEXT,
  display_name TEXT NOT NULL,
  description TEXT,
  support_email TEXT,
  support_phone TEXT,
  support_url TEXT,
  address_json JSONB,
  public_status TEXT NOT NULL DEFAULT 'draft',
  readiness_score INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
