-- =============================================================================
-- AGENTIC COMMERCE PLATFORM — COMPLETE DATABASE SCHEMA
-- Supabase PostgreSQL 15+ / Encore.dev compatible
-- Run this on a fresh database. Services use separate logical DBs in Encore,
-- but all tables are listed here for easy reference & Supabase deployment.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- SECTION 1: MERCHANTS SERVICE
-- Tables: organizations, organization_members, merchant_profiles
-- =============================================================================

CREATE TABLE organizations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  slug        TEXT        UNIQUE NOT NULL,
  country_code TEXT       NOT NULL DEFAULT 'ID',
  timezone    TEXT        NOT NULL DEFAULT 'Asia/Jakarta',
  currency    TEXT        NOT NULL DEFAULT 'IDR',
  website_url TEXT,
  logo_url    TEXT,
  status      TEXT        NOT NULL DEFAULT 'active',  -- active | suspended | deleted
  created_by  TEXT        NOT NULL,                   -- supabase auth user id
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE organizations IS 'Merchant workspace / tenant root. One organization per merchant.';
COMMENT ON COLUMN organizations.slug IS 'URL-safe unique identifier, e.g. "riyan-running-store"';
COMMENT ON COLUMN organizations.status IS 'active | suspended | deleted';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE organization_members (
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         TEXT        NOT NULL,  -- supabase auth.users.id
  role            TEXT        NOT NULL DEFAULT 'owner',  -- owner | admin | member | viewer
  status          TEXT        NOT NULL DEFAULT 'active',  -- active | removed
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

COMMENT ON TABLE organization_members IS 'Maps supabase users to merchant organizations with roles.';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE merchant_profiles (
  organization_id UUID        PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  legal_name      TEXT,
  display_name    TEXT        NOT NULL,
  description     TEXT,
  support_email   TEXT,
  support_phone   TEXT,
  support_url     TEXT,
  address_json    JSONB,       -- { street, city, province, postal_code, country }
  public_status   TEXT        NOT NULL DEFAULT 'draft',  -- draft | public | private
  readiness_score INTEGER     NOT NULL DEFAULT 0,        -- 0-100
  published_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE merchant_profiles IS 'Public-facing merchant identity shown to AI agents and buyers.';
COMMENT ON COLUMN merchant_profiles.readiness_score IS 'Agent-readiness score 0–100, recalculated on profile/catalog changes.';

-- Indexes: Merchants
CREATE INDEX idx_organizations_slug             ON organizations(slug);
CREATE INDEX idx_organizations_status           ON organizations(status);
CREATE INDEX idx_organization_members_user_id   ON organization_members(user_id);
CREATE INDEX idx_organization_members_org_id    ON organization_members(organization_id);


-- =============================================================================
-- SECTION 2: CATALOG SERVICE
-- Tables: products, product_variants, inventory, prices, catalog_imports
-- =============================================================================

CREATE TABLE products (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  external_id       TEXT,                             -- original ID from CSV/ERP import
  slug              TEXT        NOT NULL,             -- URL-safe product handle
  title             TEXT        NOT NULL,
  description       TEXT,
  brand             TEXT,
  category          TEXT,
  product_url       TEXT,
  primary_image_url TEXT,
  status            TEXT        NOT NULL DEFAULT 'draft',  -- draft | active | archived
  attributes        JSONB       DEFAULT '{}',              -- flexible key-value metadata
  source            TEXT        DEFAULT 'manual',          -- manual | csv | api
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

COMMENT ON TABLE products IS 'Product master record. Each product has one or more variants.';
COMMENT ON COLUMN products.status IS 'draft = not visible to agents. active = agent-readable. archived = soft-deleted.';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE product_variants (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_id      UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku             TEXT,                               -- Stock Keeping Unit
  barcode         TEXT,                               -- EAN / GTIN / QR
  title           TEXT        NOT NULL,               -- e.g. "Size 43 / Black"
  attributes      JSONB       DEFAULT '{}',           -- { size, color, material, ... }
  image_url       TEXT,
  status          TEXT        NOT NULL DEFAULT 'active',  -- active | inactive
  weight_grams    INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE product_variants IS 'A specific purchasable variant of a product (size, color, etc.).';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE inventory (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  variant_id          UUID        NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity_available  INTEGER     NOT NULL DEFAULT 0,
  quantity_reserved   INTEGER     NOT NULL DEFAULT 0,  -- locked by open checkouts
  availability_status TEXT        NOT NULL DEFAULT 'unknown',  -- in_stock | out_of_stock | low_stock | unknown
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(variant_id)
);

COMMENT ON TABLE inventory IS 'Real-time stock level per variant. quantity_reserved is incremented on checkout creation.';
COMMENT ON COLUMN inventory.availability_status IS 'in_stock | out_of_stock | low_stock | unknown';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE prices (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  variant_id      UUID        NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  currency        TEXT        NOT NULL DEFAULT 'IDR',
  list_amount     BIGINT      NOT NULL,               -- base price in smallest currency unit (IDR = Rupiah)
  sale_amount     BIGINT,                             -- discounted price; NULL means no discount
  valid_from      TIMESTAMPTZ,                        -- NULL = always valid
  valid_until     TIMESTAMPTZ,                        -- NULL = never expires
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE prices IS 'Pricing record per variant. Amounts in smallest currency unit (e.g. Rupiah, not Rp).';
COMMENT ON COLUMN prices.list_amount IS 'The original/regular price, always required.';
COMMENT ON COLUMN prices.sale_amount IS 'If set, agents will see this as the current price. list_amount is shown as "compare at".';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE catalog_imports (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_type     TEXT        NOT NULL DEFAULT 'csv',  -- csv | json | shopify_export | tokopedia_export
  file_path       TEXT,
  status          TEXT        NOT NULL DEFAULT 'pending',  -- pending | processing | completed | failed
  total_rows      INTEGER     DEFAULT 0,
  valid_rows      INTEGER     DEFAULT 0,
  invalid_rows    INTEGER     DEFAULT 0,
  mapping_json    JSONB,       -- column → field mapping used during import
  error_report    JSONB,       -- array of { row, field, error } objects
  created_by      TEXT        NOT NULL,   -- supabase user id
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

COMMENT ON TABLE catalog_imports IS 'Tracks bulk product import jobs (CSV, JSON, etc.) for progress and error reporting.';

-- Indexes: Catalog
CREATE INDEX idx_products_organization_id        ON products(organization_id);
CREATE INDEX idx_products_status                 ON products(status);
CREATE INDEX idx_products_category               ON products(category);
CREATE INDEX idx_products_org_status             ON products(organization_id, status);
CREATE INDEX idx_product_variants_product_id     ON product_variants(product_id);
CREATE INDEX idx_product_variants_organization_id ON product_variants(organization_id);
CREATE INDEX idx_product_variants_sku            ON product_variants(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_inventory_variant_id            ON inventory(variant_id);
CREATE INDEX idx_inventory_availability_status   ON inventory(availability_status);
CREATE INDEX idx_prices_variant_id               ON prices(variant_id);
CREATE INDEX idx_catalog_imports_organization_id ON catalog_imports(organization_id, created_at);


-- =============================================================================
-- SECTION 3: POLICIES SERVICE
-- Tables: merchant_policies
-- =============================================================================

CREATE TABLE merchant_policies (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  policy_type     TEXT        NOT NULL,    -- returns | shipping | privacy | terms | support
  title           TEXT        NOT NULL,
  summary         TEXT,                    -- short machine-readable version for AI agents
  full_url        TEXT,                    -- external URL to full policy page
  structured_data JSONB       DEFAULT '{}',  -- machine-parseable fields, e.g. { days_to_return: 30 }
  active          BOOLEAN     NOT NULL DEFAULT true,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, policy_type)
);

COMMENT ON TABLE merchant_policies IS 'Merchant commerce policies (returns, shipping, etc.) served to AI agents for customer queries.';
COMMENT ON COLUMN merchant_policies.structured_data IS 'Machine-parseable policy fields. E.g. for returns: { "days_to_return": 30, "condition": "unused", "method": "pickup" }';

-- Indexes: Policies
CREATE INDEX idx_merchant_policies_organization_id ON merchant_policies(organization_id);
CREATE INDEX idx_merchant_policies_active          ON merchant_policies(organization_id, active);


-- =============================================================================
-- SECTION 4: CHECKOUT SERVICE
-- Tables: checkout_sessions, checkout_items, payments, payment_events
-- =============================================================================

CREATE TABLE checkout_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID        NOT NULL REFERENCES organizations(id),
  public_id        TEXT        UNIQUE NOT NULL,  -- short ID shown in URL, e.g. "chk_a1b2c3"
  status           TEXT        NOT NULL DEFAULT 'open',  -- open | completed | expired | cancelled
  currency         TEXT        NOT NULL DEFAULT 'IDR',
  subtotal_amount  BIGINT      NOT NULL DEFAULT 0,
  shipping_amount  BIGINT      NOT NULL DEFAULT 0,
  total_amount     BIGINT      NOT NULL DEFAULT 0,
  source           TEXT        NOT NULL DEFAULT 'direct',  -- direct | agent | api
  source_agent     TEXT,                                   -- agent name/ID if source = agent
  customer_json    JSONB       DEFAULT '{}',   -- { name, email, phone }
  shipping_json    JSONB       DEFAULT '{}',   -- { address, method, notes }
  return_url       TEXT,                       -- redirect after payment
  expires_at       TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE checkout_sessions IS 'A single checkout session created by merchant dashboard, AI agent, or direct API. Prices are locked at creation time from database.';
COMMENT ON COLUMN checkout_sessions.public_id IS 'Short human-friendly ID used in checkout URLs.';
COMMENT ON COLUMN checkout_sessions.source IS 'Tracks whether checkout was created via agent, direct, or partner API for analytics.';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE checkout_items (
  id                   UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id  UUID    NOT NULL REFERENCES checkout_sessions(id) ON DELETE CASCADE,
  product_id           UUID    NOT NULL,    -- denormalized snapshot, not FK (cross-service)
  variant_id           UUID    NOT NULL,    -- denormalized snapshot
  sku_snapshot         TEXT,               -- SKU at time of checkout
  title_snapshot       TEXT    NOT NULL,   -- product + variant title at time of checkout
  attributes_snapshot  JSONB   DEFAULT '{}',  -- variant attributes at time of checkout
  unit_amount          BIGINT  NOT NULL,   -- price per item, locked from DB at checkout creation
  quantity             INTEGER NOT NULL,
  line_amount          BIGINT  NOT NULL    -- unit_amount * quantity
);

COMMENT ON TABLE checkout_items IS 'Line items within a checkout. Prices are snapshots from database at checkout creation — immutable to frontend manipulation.';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE payments (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id          UUID        NOT NULL REFERENCES organizations(id),
  checkout_session_id      UUID        NOT NULL REFERENCES checkout_sessions(id),
  provider                 TEXT        NOT NULL,   -- pakasir | midtrans | xendit | stripe
  provider_order_id        TEXT        NOT NULL,   -- ID returned by payment gateway
  provider_transaction_id  TEXT,                   -- transaction ID after payment
  payment_method           TEXT,                   -- QRIS | VA | CC | gopay | ...
  amount                   BIGINT      NOT NULL,
  provider_fee             BIGINT,
  total_payment            BIGINT,                 -- amount net of fees
  status                   TEXT        NOT NULL DEFAULT 'pending',  -- pending | paid | failed | expired | cancelled | refunded
  expires_at               TIMESTAMPTZ,
  completed_at             TIMESTAMPTZ,
  raw_safe_metadata        JSONB       DEFAULT '{}',  -- sanitized gateway response, no PII
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_order_id)   -- idempotency: prevent double-recording same payment
);

COMMENT ON TABLE payments IS 'Payment record per checkout. UNIQUE on (provider, provider_order_id) enforces idempotency — duplicate webhooks cannot create 2 payment records.';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE payment_events (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id        UUID        REFERENCES payments(id),
  provider          TEXT        NOT NULL,
  event_type        TEXT        NOT NULL,         -- payment.completed | payment.expired | refund.issued
  provider_event_id TEXT,                         -- gateway's own event ID for dedup
  payload_hash      TEXT,                         -- SHA-256 of raw payload for signature verification
  payload_safe      JSONB       DEFAULT '{}',     -- sanitized payload, no card data
  processing_status TEXT        NOT NULL DEFAULT 'pending',  -- pending | processed | failed | duplicate
  error_message     TEXT,
  received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at      TIMESTAMPTZ
);

COMMENT ON TABLE payment_events IS 'Raw incoming webhook events from payment gateways. Used for audit trail and idempotency (duplicate webhooks are recorded as "duplicate").';
COMMENT ON COLUMN payment_events.payload_hash IS 'Hash of the raw payload body, used to detect and reject duplicate webhook deliveries.';

-- Indexes: Checkout
CREATE INDEX idx_checkout_sessions_organization_id ON checkout_sessions(organization_id, created_at);
CREATE INDEX idx_checkout_sessions_status          ON checkout_sessions(status);
CREATE INDEX idx_checkout_sessions_expires_at      ON checkout_sessions(expires_at) WHERE status = 'open';
CREATE INDEX idx_payments_provider                 ON payments(provider, provider_order_id);
CREATE INDEX idx_payments_organization_id          ON payments(organization_id, created_at);
CREATE INDEX idx_payments_checkout_session         ON payments(checkout_session_id);
CREATE INDEX idx_payments_status                   ON payments(status);
CREATE INDEX idx_payment_events_payment_id         ON payment_events(payment_id);
CREATE INDEX idx_payment_events_provider_event_id  ON payment_events(provider_event_id) WHERE provider_event_id IS NOT NULL;
CREATE INDEX idx_payment_events_processing_status  ON payment_events(processing_status);


-- =============================================================================
-- SECTION 5: ORDERS SERVICE
-- Tables: orders, order_items
-- =============================================================================

CREATE TABLE orders (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID        NOT NULL REFERENCES organizations(id),
  order_number        TEXT        UNIQUE NOT NULL,  -- human-readable, e.g. "ORD-00001"
  checkout_session_id UUID        UNIQUE NOT NULL,  -- one checkout → one order
  status              TEXT        NOT NULL DEFAULT 'active',        -- active | cancelled | completed
  payment_status      TEXT        NOT NULL DEFAULT 'pending',       -- pending | paid | failed | refunded
  fulfillment_status  TEXT        NOT NULL DEFAULT 'unfulfilled',   -- unfulfilled | partial | fulfilled | cancelled
  subtotal_amount     BIGINT      NOT NULL,
  shipping_amount     BIGINT      NOT NULL DEFAULT 0,
  total_amount        BIGINT      NOT NULL,
  currency            TEXT        NOT NULL DEFAULT 'IDR',
  source              TEXT        NOT NULL DEFAULT 'direct',  -- direct | agent | api
  source_agent        TEXT,
  customer_snapshot   JSONB       DEFAULT '{}',   -- customer info at time of order
  shipping_snapshot   JSONB       DEFAULT '{}',   -- shipping address/method at time of order
  tracking_number     TEXT,
  carrier             TEXT,
  placed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at             TIMESTAMPTZ,
  fulfilled_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Created automatically when a payment webhook is verified as PAID. checkout_session_id is UNIQUE to prevent duplicate orders from duplicate webhooks.';
COMMENT ON COLUMN orders.order_number IS 'Sequential human-readable ID displayed in merchant dashboard.';
COMMENT ON COLUMN orders.checkout_session_id IS 'UNIQUE constraint is the primary idempotency guard against double order creation.';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE order_items (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id          UUID    NOT NULL,
  variant_id          UUID    NOT NULL,
  sku_snapshot        TEXT,
  title_snapshot      TEXT    NOT NULL,
  attributes_snapshot JSONB   DEFAULT '{}',
  unit_amount         BIGINT  NOT NULL,
  quantity            INTEGER NOT NULL,
  line_amount         BIGINT  NOT NULL
);

COMMENT ON TABLE order_items IS 'Immutable snapshot of what was ordered and at what price.';

-- Indexes: Orders
CREATE INDEX idx_orders_organization_id      ON orders(organization_id, created_at);
CREATE INDEX idx_orders_payment_status       ON orders(payment_status);
CREATE INDEX idx_orders_fulfillment_status   ON orders(fulfillment_status);
CREATE INDEX idx_orders_order_number         ON orders(order_number);
CREATE INDEX idx_order_items_order_id        ON order_items(order_id);


-- =============================================================================
-- SECTION 6: PARTNER API KEYS
-- Table: partner_api_keys
-- (Used by integrations/APIKeys page — TEST 7: create, use, revoke)
-- =============================================================================

CREATE TABLE partner_api_keys (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,              -- human label, e.g. "Production Agent Server"
  key_prefix      TEXT        NOT NULL,              -- first 12 chars shown in UI, e.g. "sk_live_ab12"
  key_hash        TEXT        NOT NULL UNIQUE,       -- bcrypt/SHA-256 hash of full key — never store plaintext
  scopes          TEXT[]      NOT NULL DEFAULT '{}', -- catalog:read | checkout:create | orders:read | ...
  status          TEXT        NOT NULL DEFAULT 'active',  -- active | revoked
  last_used_at    TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ,
  revoked_by      TEXT,                              -- supabase user id who revoked
  created_by      TEXT        NOT NULL,              -- supabase user id
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE partner_api_keys IS 'API keys issued to AI agent partners and integrations. Only the hash is stored — the plaintext key is shown once at creation.';
COMMENT ON COLUMN partner_api_keys.key_hash IS 'SHA-256 or bcrypt hash. Plaintext key is NEVER stored in database.';
COMMENT ON COLUMN partner_api_keys.scopes IS 'Array of allowed operations: catalog:read, policies:read, checkout:create, checkout:read, orders:read';

-- Indexes: Partner API Keys
CREATE INDEX idx_partner_api_keys_organization_id ON partner_api_keys(organization_id);
CREATE INDEX idx_partner_api_keys_key_hash        ON partner_api_keys(key_hash);
CREATE INDEX idx_partner_api_keys_status          ON partner_api_keys(status);


-- =============================================================================
-- SECTION 7: ANALYTICS SERVICE
-- Tables: agent_requests, audit_logs
-- =============================================================================

CREATE TABLE agent_requests (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID        REFERENCES organizations(id),
  request_id          TEXT        UNIQUE NOT NULL,  -- client-provided or auto-generated trace ID
  protocol            TEXT        NOT NULL DEFAULT 'rest',  -- rest | mcp | ucp
  operation           TEXT        NOT NULL,   -- searchCatalog | createCheckout | getOrderStatus | ...
  agent_name          TEXT,                   -- name of AI agent/bot making the request
  partner_key_id      UUID        REFERENCES partner_api_keys(id),  -- which API key was used
  status_code         INTEGER,
  latency_ms          INTEGER,
  query_summary       TEXT,                   -- condensed version of the query
  result_count        INTEGER,
  checkout_session_id UUID,                   -- if operation resulted in a checkout
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE agent_requests IS 'Request log for every AI agent call. Powers the analytics dashboard.';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        REFERENCES organizations(id),
  actor_user_id   TEXT,                   -- supabase user id, or system
  actor_type      TEXT        NOT NULL DEFAULT 'user',  -- user | agent | system | admin
  action          TEXT        NOT NULL,   -- product.created | order.fulfilled | key.revoked | ...
  resource_type   TEXT        NOT NULL,   -- product | order | checkout | policy | api_key | ...
  resource_id     TEXT,
  metadata        JSONB       DEFAULT '{}',
  ip_hash         TEXT,                   -- hashed client IP for privacy-safe audit
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Immutable audit trail of all significant actions for compliance and debugging.';

-- Indexes: Analytics
CREATE INDEX idx_agent_requests_organization_id ON agent_requests(organization_id, created_at);
CREATE INDEX idx_agent_requests_operation       ON agent_requests(operation);
CREATE INDEX idx_agent_requests_partner_key_id  ON agent_requests(partner_key_id) WHERE partner_key_id IS NOT NULL;
CREATE INDEX idx_audit_logs_organization_id     ON audit_logs(organization_id, created_at);
CREATE INDEX idx_audit_logs_actor_user_id       ON audit_logs(actor_user_id) WHERE actor_user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_resource_type       ON audit_logs(resource_type, resource_id);


-- =============================================================================
-- SECTION 8: WEBHOOK INSPECTOR
-- Table: webhook_events
-- (Used by admin/AdminWebhooks page — TEST 10: idempotency, replay)
-- =============================================================================

CREATE TABLE webhook_events (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID        REFERENCES organizations(id),
  source              TEXT        NOT NULL,         -- pakasir | midtrans | xendit | stripe
  event_type          TEXT        NOT NULL,         -- payment.completed | payment.expired | refund.issued
  event_id            TEXT,                         -- provider's own idempotency key
  delivery_id         TEXT        UNIQUE,           -- unique per HTTP delivery attempt (for dedup)
  signature_valid     BOOLEAN,                      -- result of HMAC signature check
  payload_safe        JSONB       DEFAULT '{}',     -- sanitized JSON body
  processing_status   TEXT        NOT NULL DEFAULT 'received',  -- received | validated | processed | failed | duplicate
  payment_id          UUID        REFERENCES payments(id),
  order_id            UUID        REFERENCES orders(id),
  error_message       TEXT,
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at        TIMESTAMPTZ
);

COMMENT ON TABLE webhook_events IS 'Every inbound webhook delivery is logged here. delivery_id UNIQUE constraint makes the system idempotent — same webhook delivered twice is recorded as "duplicate" and skipped.';
COMMENT ON COLUMN webhook_events.delivery_id IS 'Provider-provided unique delivery ID (e.g. X-Pakasir-Delivery header). UNIQUE constraint prevents duplicate processing.';
COMMENT ON COLUMN webhook_events.signature_valid IS 'True if HMAC signature was verified against provider secret. NULL if signature check was skipped.';

-- Indexes: Webhook Events
CREATE INDEX idx_webhook_events_organization_id  ON webhook_events(organization_id, received_at);
CREATE INDEX idx_webhook_events_source           ON webhook_events(source);
CREATE INDEX idx_webhook_events_event_type       ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_processing_status ON webhook_events(processing_status);
CREATE INDEX idx_webhook_events_event_id         ON webhook_events(event_id) WHERE event_id IS NOT NULL;


-- =============================================================================
-- SECTION 9: ROW-LEVEL SECURITY (RLS)
-- Supabase RLS policies — enforce data isolation between merchants
-- Uncomment and enable after setting up Supabase auth
-- =============================================================================

-- Enable RLS on all tenant tables
ALTER TABLE organizations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory               ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_imports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_policies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments                ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_api_keys        ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_requests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs              ENABLE ROW LEVEL SECURITY;

-- Helper function: returns the set of organization IDs the current user belongs to
CREATE OR REPLACE FUNCTION current_user_organizations()
RETURNS SETOF UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()::text
    AND status = 'active';
$$;

-- RLS Policies: organizations
-- Users can only see organizations they are members of
CREATE POLICY "org_member_select" ON organizations
  FOR SELECT USING (id IN (SELECT current_user_organizations()));

CREATE POLICY "org_member_update" ON organizations
  FOR UPDATE USING (id IN (SELECT current_user_organizations()));

-- RLS Policies: organization_members
CREATE POLICY "member_select_own_org" ON organization_members
  FOR SELECT USING (organization_id IN (SELECT current_user_organizations()));

-- RLS Policies: merchant_profiles
CREATE POLICY "profile_member_select" ON merchant_profiles
  FOR SELECT USING (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "profile_member_update" ON merchant_profiles
  FOR UPDATE USING (organization_id IN (SELECT current_user_organizations()));

-- RLS Policies: products
CREATE POLICY "product_member_select" ON products
  FOR SELECT USING (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "product_member_insert" ON products
  FOR INSERT WITH CHECK (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "product_member_update" ON products
  FOR UPDATE USING (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "product_member_delete" ON products
  FOR DELETE USING (organization_id IN (SELECT current_user_organizations()));

-- RLS Policies: product_variants
CREATE POLICY "variant_member_select" ON product_variants
  FOR SELECT USING (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "variant_member_insert" ON product_variants
  FOR INSERT WITH CHECK (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "variant_member_update" ON product_variants
  FOR UPDATE USING (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "variant_member_delete" ON product_variants
  FOR DELETE USING (organization_id IN (SELECT current_user_organizations()));

-- RLS Policies: inventory
CREATE POLICY "inventory_member_select" ON inventory
  FOR SELECT USING (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "inventory_member_update" ON inventory
  FOR UPDATE USING (organization_id IN (SELECT current_user_organizations()));

-- RLS Policies: prices
CREATE POLICY "prices_member_select" ON prices
  FOR SELECT USING (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "prices_member_insert" ON prices
  FOR INSERT WITH CHECK (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "prices_member_update" ON prices
  FOR UPDATE USING (organization_id IN (SELECT current_user_organizations()));

-- RLS Policies: merchant_policies
CREATE POLICY "policies_member_select" ON merchant_policies
  FOR SELECT USING (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "policies_member_insert" ON merchant_policies
  FOR INSERT WITH CHECK (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "policies_member_update" ON merchant_policies
  FOR UPDATE USING (organization_id IN (SELECT current_user_organizations()));

-- RLS Policies: orders
CREATE POLICY "orders_member_select" ON orders
  FOR SELECT USING (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "orders_member_update" ON orders
  FOR UPDATE USING (organization_id IN (SELECT current_user_organizations()));

-- RLS Policies: partner_api_keys
CREATE POLICY "apikeys_member_select" ON partner_api_keys
  FOR SELECT USING (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "apikeys_member_insert" ON partner_api_keys
  FOR INSERT WITH CHECK (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "apikeys_member_update" ON partner_api_keys
  FOR UPDATE USING (organization_id IN (SELECT current_user_organizations()));

-- RLS Policies: analytics (read own org)
CREATE POLICY "agent_requests_member_select" ON agent_requests
  FOR SELECT USING (organization_id IN (SELECT current_user_organizations()));

CREATE POLICY "audit_logs_member_select" ON audit_logs
  FOR SELECT USING (organization_id IN (SELECT current_user_organizations()));


-- =============================================================================
-- SECTION 10: TRIGGERS — auto-update updated_at timestamps
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all tables that have the column
CREATE TRIGGER set_updated_at_organizations       BEFORE UPDATE ON organizations       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_merchant_profiles   BEFORE UPDATE ON merchant_profiles   FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_products            BEFORE UPDATE ON products            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_product_variants    BEFORE UPDATE ON product_variants    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_inventory           BEFORE UPDATE ON inventory           FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_prices              BEFORE UPDATE ON prices              FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_merchant_policies   BEFORE UPDATE ON merchant_policies   FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_checkout_sessions   BEFORE UPDATE ON checkout_sessions   FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_payments            BEFORE UPDATE ON payments            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_orders              BEFORE UPDATE ON orders              FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- =============================================================================
-- SECTION 11: VIEWS — useful for dashboard & agent queries
-- =============================================================================

-- Active catalog view used by Agent API /v1/catalog/search
CREATE OR REPLACE VIEW active_catalog AS
SELECT
  p.id              AS product_id,
  pv.id             AS variant_id,
  p.organization_id,
  p.title,
  p.description,
  p.brand,
  p.category,
  p.product_url,
  COALESCE(pv.image_url, p.primary_image_url) AS image_url,
  pv.sku,
  pv.attributes,
  pv.weight_grams,
  pr.list_amount,
  pr.sale_amount,
  COALESCE(pr.sale_amount, pr.list_amount)    AS current_price,
  pr.currency,
  COALESCE(i.availability_status, 'unknown')  AS availability_status,
  i.quantity_available,
  p.updated_at
FROM products p
JOIN product_variants pv ON pv.product_id = p.id
LEFT JOIN prices pr       ON pr.variant_id = pv.id
LEFT JOIN inventory i     ON i.variant_id  = pv.id
WHERE p.status  = 'active'
  AND pv.status = 'active';

COMMENT ON VIEW active_catalog IS 'Flattened agent-readable catalog view joining products, variants, prices, and inventory. Used by searchCatalog API.';

-- ─────────────────────────────────────────────────────────────────────────────

-- Order summary view for merchant dashboard
CREATE OR REPLACE VIEW order_summary AS
SELECT
  o.id,
  o.organization_id,
  o.order_number,
  o.payment_status,
  o.fulfillment_status,
  o.total_amount,
  o.currency,
  o.source,
  o.source_agent,
  o.placed_at,
  o.paid_at,
  mp.display_name AS merchant_name,
  COUNT(oi.id)    AS item_count
FROM orders o
LEFT JOIN merchant_profiles mp ON mp.organization_id = o.organization_id
LEFT JOIN order_items oi       ON oi.order_id = o.id
GROUP BY o.id, mp.display_name;

COMMENT ON VIEW order_summary IS 'Aggregated order view for merchant dashboard list pages.';


-- =============================================================================
-- END OF SCHEMA
-- Total: 17 tables, 2 views, 1 helper function, triggers, RLS policies
--
-- Table summary:
--   merchants:   organizations, organization_members, merchant_profiles
--   catalog:     products, product_variants, inventory, prices, catalog_imports
--   policies:    merchant_policies
--   checkout:    checkout_sessions, checkout_items, payments, payment_events
--   orders:      orders, order_items
--   analytics:   agent_requests, audit_logs
--   integrations: partner_api_keys
--   webhooks:    webhook_events
-- =============================================================================
