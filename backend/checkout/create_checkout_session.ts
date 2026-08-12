import { api, APIError } from "encore.dev/api";
import db from "./db";
import catalogDb from "../catalog/db";
import { CheckoutSession, CreateCheckoutSessionRequest } from "./types";
import { randomBytes } from "crypto";

interface CreateCheckoutSessionResponse { session: CheckoutSession; }

function generatePublicId(): string {
  return "chk_" + randomBytes(12).toString("hex");
}

// Creates a new checkout session, validating prices and stock server-side.
export const createCheckoutSession = api<CreateCheckoutSessionRequest, CreateCheckoutSessionResponse>(
  { expose: true, method: "POST", path: "/checkout" },
  async (req) => {
    const currency = req.currency ?? "IDR";
    let subtotal = 0;
    const resolvedItems: Array<{
      productId: string; variantId: string; skuSnapshot?: string;
      titleSnapshot: string; attributesSnapshot: Record<string, unknown>;
      unitAmount: number; quantity: number; lineAmount: number;
    }> = [];

    for (const item of req.items) {
      const variant = await catalogDb.queryRow<{
        id: string; sku: string | null; title: string; attributes: Record<string, unknown>;
        status: string;
      }>`SELECT id, sku, title, attributes, status FROM product_variants WHERE id = ${item.variantId} AND product_id = ${item.productId}`;
      if (!variant) throw APIError.notFound(`variant ${item.variantId} not found`);
      if (variant.status !== "active") throw APIError.invalidArgument(`variant ${item.variantId} is not active`);

      const price = await catalogDb.queryRow<{ list_amount: number; sale_amount: number | null }>`
        SELECT list_amount, sale_amount FROM prices WHERE variant_id = ${item.variantId}
        ORDER BY updated_at DESC LIMIT 1
      `;
      if (!price) throw APIError.invalidArgument(`no price found for variant ${item.variantId}`);

      const inv = await catalogDb.queryRow<{ quantity_available: number; availability_status: string }>`
        SELECT quantity_available, availability_status FROM inventory WHERE variant_id = ${item.variantId}
      `;
      if (!inv || inv.availability_status === "out_of_stock" || inv.quantity_available < item.quantity) {
        throw APIError.invalidArgument(`insufficient stock for variant ${item.variantId}`);
      }

      const unitAmount = price.sale_amount ?? price.list_amount;
      const lineAmount = unitAmount * item.quantity;
      subtotal += lineAmount;

      resolvedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        skuSnapshot: variant.sku ?? undefined,
        titleSnapshot: variant.title,
        attributesSnapshot: variant.attributes ?? {},
        unitAmount,
        quantity: item.quantity,
        lineAmount,
      });
    }

    const totalAmount = subtotal;
    const publicId = generatePublicId();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const customerStr = JSON.stringify(req.customerJson ?? {});
    const shippingStr = JSON.stringify(req.shippingJson ?? {});

    const session = await db.queryRow<{
      id: string; organization_id: string; public_id: string; status: string;
      currency: string; subtotal_amount: number; shipping_amount: number; total_amount: number;
      source: string; source_agent: string | null; customer_json: Record<string, unknown>;
      shipping_json: Record<string, unknown>; return_url: string | null;
      expires_at: Date; created_at: Date; updated_at: Date;
    }>`
      INSERT INTO checkout_sessions (organization_id, public_id, currency, subtotal_amount, shipping_amount,
        total_amount, source, source_agent, customer_json, shipping_json, return_url, expires_at)
      VALUES (
        ${req.organizationId}, ${publicId}, ${currency}, ${subtotal}, 0, ${totalAmount},
        ${req.source ?? "direct"}, ${req.sourceAgent ?? null},
        ${customerStr}::jsonb, ${shippingStr}::jsonb, ${req.returnUrl ?? null}, ${expiresAt}
      )
      RETURNING *
    `;
    if (!session) throw APIError.internal("failed to create checkout session");

    for (const item of resolvedItems) {
      const attrsStr = JSON.stringify(item.attributesSnapshot);
      await db.exec`
        INSERT INTO checkout_items (checkout_session_id, product_id, variant_id, sku_snapshot,
          title_snapshot, attributes_snapshot, unit_amount, quantity, line_amount)
        VALUES (${session.id}, ${item.productId}, ${item.variantId}, ${item.skuSnapshot ?? null},
          ${item.titleSnapshot}, ${attrsStr}::jsonb, ${item.unitAmount}, ${item.quantity}, ${item.lineAmount})
      `;
    }

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
        items: resolvedItems,
      },
    };
  }
);
