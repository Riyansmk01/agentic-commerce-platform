export interface Order {
  id: string;
  organizationId: string;
  orderNumber: string;
  checkoutSessionId: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  source: string;
  sourceAgent?: string;
  customerSnapshot: Record<string, unknown>;
  shippingSnapshot: Record<string, unknown>;
  placedAt: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  skuSnapshot?: string;
  titleSnapshot: string;
  attributesSnapshot: Record<string, unknown>;
  unitAmount: number;
  quantity: number;
  lineAmount: number;
}
