CREATE TABLE checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  public_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  currency TEXT NOT NULL DEFAULT 'IDR',
  subtotal_amount BIGINT NOT NULL DEFAULT 0,
  shipping_amount BIGINT NOT NULL DEFAULT 0,
  total_amount BIGINT NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'direct',
  source_agent TEXT,
  customer_json JSONB DEFAULT '{}',
  shipping_json JSONB DEFAULT '{}',
  return_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE checkout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id UUID NOT NULL REFERENCES checkout_sessions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID NOT NULL,
  sku_snapshot TEXT,
  title_snapshot TEXT NOT NULL,
  attributes_snapshot JSONB DEFAULT '{}',
  unit_amount BIGINT NOT NULL,
  quantity INTEGER NOT NULL,
  line_amount BIGINT NOT NULL
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  checkout_session_id UUID NOT NULL REFERENCES checkout_sessions(id),
  provider TEXT NOT NULL,
  provider_order_id TEXT NOT NULL,
  provider_transaction_id TEXT,
  payment_method TEXT,
  amount BIGINT NOT NULL,
  provider_fee BIGINT,
  total_payment BIGINT,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  raw_safe_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_order_id)
);

CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  provider_event_id TEXT,
  payload_hash TEXT,
  payload_safe JSONB DEFAULT '{}',
  processing_status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_checkout_sessions_organization_id ON checkout_sessions(organization_id, created_at);
CREATE INDEX idx_payments_provider ON payments(provider, provider_order_id);
