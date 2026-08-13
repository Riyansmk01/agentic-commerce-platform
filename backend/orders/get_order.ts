import { api, APIError } from "encore.dev/api";
import db from "./db";
import { Order } from "./types";
import { requireOrgMember } from "../auth/helpers";

interface GetOrderParams { id: string; }
interface GetOrderResponse { order: Order; }

// Retrieves a single order with all its items.
export const getOrder = api<GetOrderParams, GetOrderResponse>(
  { expose: true, auth: true, method: "GET", path: "/orders/:id" },
  async (req) => {
    const row = await db.queryRow<{
      id: string; organization_id: string; order_number: string; checkout_session_id: string;
      status: string; payment_status: string; fulfillment_status: string;
      subtotal_amount: number; shipping_amount: number; total_amount: number;
      currency: string; source: string; source_agent: string | null;
      customer_snapshot: Record<string, unknown>; shipping_snapshot: Record<string, unknown>;
      placed_at: Date; paid_at: Date | null; created_at: Date; updated_at: Date;
    }>`SELECT * FROM orders WHERE id = ${req.id}`;
    if (!row) throw APIError.notFound("order not found");

    await requireOrgMember(row.organization_id);

    const items = await db.queryAll<{
      id: string; order_id: string; product_id: string; variant_id: string;
      sku_snapshot: string | null; title_snapshot: string;
      attributes_snapshot: Record<string, unknown>; unit_amount: number;
      quantity: number; line_amount: number;
    }>`SELECT * FROM order_items WHERE order_id = ${row.id}`;

    return {
      order: {
        id: row.id, organizationId: row.organization_id, orderNumber: row.order_number,
        checkoutSessionId: row.checkout_session_id, status: row.status,
        paymentStatus: row.payment_status, fulfillmentStatus: row.fulfillment_status,
        subtotalAmount: row.subtotal_amount, shippingAmount: row.shipping_amount,
        totalAmount: row.total_amount, currency: row.currency, source: row.source,
        sourceAgent: row.source_agent ?? undefined,
        customerSnapshot: row.customer_snapshot, shippingSnapshot: row.shipping_snapshot,
        placedAt: row.placed_at, paidAt: row.paid_at ?? undefined,
        createdAt: row.created_at, updatedAt: row.updated_at,
        items: items.map(i => ({
          id: i.id, orderId: i.order_id, productId: i.product_id, variantId: i.variant_id,
          skuSnapshot: i.sku_snapshot ?? undefined, titleSnapshot: i.title_snapshot,
          attributesSnapshot: i.attributes_snapshot ?? {}, unitAmount: i.unit_amount,
          quantity: i.quantity, lineAmount: i.line_amount,
        })),
      },
    };
  }
);
