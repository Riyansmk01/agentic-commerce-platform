import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "./db";
import { Order } from "./types";

interface ListOrdersParams {
  organizationId: Query<string>;
  paymentStatus?: Query<string>;
  fulfillmentStatus?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListOrdersResponse { orders: Order[]; total: number; }

// Lists all orders for a merchant with optional status filters.
export const listOrders = api<ListOrdersParams, ListOrdersResponse>(
  { expose: true, method: "GET", path: "/orders" },
  async (req) => {
    const limit = req.limit ?? 50;
    const offset = req.offset ?? 0;
    const paymentStatus = req.paymentStatus ?? null;
    const fulfillmentStatus = req.fulfillmentStatus ?? null;

    const rows = await db.rawQueryAll<{
      id: string; organization_id: string; order_number: string; checkout_session_id: string;
      status: string; payment_status: string; fulfillment_status: string;
      subtotal_amount: number; shipping_amount: number; total_amount: number;
      currency: string; source: string; source_agent: string | null;
      customer_snapshot: Record<string, unknown>; shipping_snapshot: Record<string, unknown>;
      placed_at: Date; paid_at: Date | null; created_at: Date; updated_at: Date;
    }>(
      `SELECT * FROM orders WHERE organization_id = $1
       AND ($2::text IS NULL OR payment_status = $2)
       AND ($3::text IS NULL OR fulfillment_status = $3)
       ORDER BY created_at DESC LIMIT $4 OFFSET $5`,
      req.organizationId, paymentStatus, fulfillmentStatus, limit, offset
    );

    const countRow = await db.rawQueryRow<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM orders WHERE organization_id = $1
       AND ($2::text IS NULL OR payment_status = $2)
       AND ($3::text IS NULL OR fulfillment_status = $3)`,
      req.organizationId, paymentStatus, fulfillmentStatus
    );

    const orders: Order[] = [];
    for (const row of rows) {
      const items = await db.queryAll<{
        id: string; order_id: string; product_id: string; variant_id: string;
        sku_snapshot: string | null; title_snapshot: string;
        attributes_snapshot: Record<string, unknown>; unit_amount: number;
        quantity: number; line_amount: number;
      }>`SELECT * FROM order_items WHERE order_id = ${row.id}`;

      orders.push({
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
      });
    }

    return { orders, total: parseInt(countRow?.count ?? "0", 10) };
  }
);
