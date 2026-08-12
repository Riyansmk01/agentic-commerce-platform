import { api, APIError } from "encore.dev/api";
import db from "./db";
import { CheckoutSession, GetCheckoutSessionParams } from "./types";

interface GetCheckoutSessionResponse { session: CheckoutSession; }

// Retrieves a checkout session by its public ID.
export const getCheckoutSession = api<GetCheckoutSessionParams, GetCheckoutSessionResponse>(
  { expose: true, method: "GET", path: "/checkout/:publicId" },
  async (req) => {
    const session = await db.queryRow<{
      id: string; organization_id: string; public_id: string; status: string;
      currency: string; subtotal_amount: number; shipping_amount: number; total_amount: number;
      source: string; source_agent: string | null; customer_json: Record<string, unknown>;
      shipping_json: Record<string, unknown>; return_url: string | null;
      expires_at: Date; created_at: Date; updated_at: Date;
    }>`SELECT * FROM checkout_sessions WHERE public_id = ${req.publicId}`;
    if (!session) throw APIError.notFound("checkout session not found");

    const items = await db.queryAll<{
      product_id: string; variant_id: string; sku_snapshot: string | null;
      title_snapshot: string; attributes_snapshot: Record<string, unknown>;
      unit_amount: number; quantity: number; line_amount: number;
    }>`SELECT * FROM checkout_items WHERE checkout_session_id = ${session.id}`;

    return {
      session: {
        id: session.id, organizationId: session.organization_id, publicId: session.public_id,
        status: session.status, currency: session.currency,
        subtotalAmount: session.subtotal_amount, shippingAmount: session.shipping_amount,
        totalAmount: session.total_amount, source: session.source,
        sourceAgent: session.source_agent ?? undefined,
        customerJson: session.customer_json, shippingJson: session.shipping_json,
        returnUrl: session.return_url ?? undefined, expiresAt: session.expires_at,
        createdAt: session.created_at, updatedAt: session.updated_at,
        items: items.map(i => ({
          productId: i.product_id, variantId: i.variant_id,
          skuSnapshot: i.sku_snapshot ?? undefined, titleSnapshot: i.title_snapshot,
          attributesSnapshot: i.attributes_snapshot ?? {}, unitAmount: i.unit_amount,
          quantity: i.quantity, lineAmount: i.line_amount,
        })),
      },
    };
  }
);
