export interface CheckoutItem {
  productId: string;
  variantId: string;
  skuSnapshot?: string;
  titleSnapshot: string;
  attributesSnapshot: Record<string, unknown>;
  unitAmount: number;
  quantity: number;
  lineAmount: number;
}

export interface CheckoutSession {
  id: string;
  organizationId: string;
  publicId: string;
  status: string;
  currency: string;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  source: string;
  sourceAgent?: string;
  customerJson: Record<string, unknown>;
  shippingJson: Record<string, unknown>;
  returnUrl?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  items: CheckoutItem[];
}

export interface CreateCheckoutSessionRequest {
  organizationId: string;
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>;
  source?: string;
  sourceAgent?: string;
  customerJson?: Record<string, unknown>;
  shippingJson?: Record<string, unknown>;
  returnUrl?: string;
  currency?: string;
}

export interface GetCheckoutSessionParams {
  publicId: string;
}
