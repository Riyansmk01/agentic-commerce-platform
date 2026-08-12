CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  checkout_session_id UUID UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled',
  subtotal_amount BIGINT NOT NULL,
  shipping_amount BIGINT NOT NULL DEFAULT 0,
  total_amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  source TEXT NOT NULL DEFAULT 'direct',
  source_agent TEXT,
  customer_snapshot JSONB DEFAULT '{}',
  shipping_snapshot JSONB DEFAULT '{}',
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID NOT NULL,
  sku_snapshot TEXT,
  title_snapshot TEXT NOT NULL,
  attributes_snapshot JSONB DEFAULT '{}',
  unit_amount BIGINT NOT NULL,
  quantity INTEGER NOT NULL,
  line_amount BIGINT NOT NULL
);

CREATE INDEX idx_orders_organization_id ON orders(organization_id, created_at);
