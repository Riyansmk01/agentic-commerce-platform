import { api, APIError } from "encore.dev/api";
import { Header } from "encore.dev/api";
import db from "./db";
import ordersDb from "../orders/db";

// Use a raw endpoint because webhooks often need raw body for signature verification
// For simplicity, we define a normal API but in a real setup we'd use api.raw
interface WebhookPayload {
  event: string;
  orderId: string; // The provider_order_id stored in payments table
  status: string;
  amount: number;
}

interface WebhookRequest {
  deliveryId?: Header<"X-Pakasir-Delivery">;
  signature?: Header<"X-Pakasir-Signature">;
  payload: WebhookPayload;
}

export const pakasirWebhook = api<WebhookRequest, { received: boolean }>(
  { expose: true, method: "POST", path: "/webhooks/pakasir" },
  async (req) => {
    const deliveryId = req.deliveryId || `temp_${Math.random().toString(36).slice(2)}`;
    
    // 1. Idempotency Check: Insert into webhook_events
    // If deliveryId already exists, it will throw a unique constraint violation
    let webhookEventId: string;
    try {
      const we = await db.queryRow<{ id: string }>`
        INSERT INTO webhook_events (source, event_type, delivery_id, processing_status, payload_safe)
        VALUES ('pakasir', ${req.payload.event}, ${deliveryId}, 'received', ${JSON.stringify(req.payload)}::jsonb)
        RETURNING id
      `;
      if (!we) throw new Error("Failed to insert webhook event");
      webhookEventId = we.id;
    } catch (err: any) {
      if (err.message?.includes("unique constraint") || err.code === "23505") {
        // Duplicate delivery, safely acknowledge
        return { received: true };
      }
      throw err;
    }

    try {
      // 2. Process payment completed
      if (req.payload.event === "payment.completed" && req.payload.status === "paid") {
        const payment = await db.queryRow<{ id: string; checkout_session_id: string; organization_id: string }>`
          SELECT id, checkout_session_id, organization_id FROM payments 
          WHERE provider = 'pakasir' AND provider_order_id = ${req.payload.orderId}
        `;
        
        if (!payment) {
          throw new Error("Payment not found");
        }

        // Update payment status
        await db.exec`
          UPDATE payments SET status = 'paid', completed_at = NOW(), updated_at = NOW()
          WHERE id = ${payment.id}
        `;

        // Update checkout session status
        await db.exec`
          UPDATE checkout_sessions SET status = 'completed', updated_at = NOW()
          WHERE id = ${payment.checkout_session_id}
        `;

        // 3. Create Order if it doesn't exist
        const session = await db.queryRow<{ 
          subtotal_amount: number; shipping_amount: number; total_amount: number;
          currency: string; source: string; source_agent: string | null;
          customer_json: any; shipping_json: any;
        }>`
          SELECT subtotal_amount, shipping_amount, total_amount, currency, source, source_agent, customer_json, shipping_json
          FROM checkout_sessions WHERE id = ${payment.checkout_session_id}
        `;

        if (session) {
          const orderNumber = `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
          
          try {
            const order = await ordersDb.queryRow<{ id: string }>`
              INSERT INTO orders (
                organization_id, order_number, checkout_session_id, status, payment_status, 
                fulfillment_status, subtotal_amount, shipping_amount, total_amount, currency,
                source, source_agent, customer_snapshot, shipping_snapshot, placed_at, paid_at
              ) VALUES (
                ${payment.organization_id}, ${orderNumber}, ${payment.checkout_session_id}, 'active', 'paid',
                'unfulfilled', ${session.subtotal_amount}, ${session.shipping_amount}, ${session.total_amount}, ${session.currency},
                ${session.source}, ${session.source_agent}, ${JSON.stringify(session.customer_json)}::jsonb, 
                ${JSON.stringify(session.shipping_json)}::jsonb, NOW(), NOW()
              ) RETURNING id
            `;

            if (order) {
              // Copy items from checkout_items to order_items
              const items = await db.queryAll<{
                product_id: string; variant_id: string; sku_snapshot: string | null;
                title_snapshot: string; attributes_snapshot: any; unit_amount: number;
                quantity: number; line_amount: number;
              }>`SELECT * FROM checkout_items WHERE checkout_session_id = ${payment.checkout_session_id}`;

              for (const item of items) {
                await ordersDb.exec`
                  INSERT INTO order_items (
                    order_id, product_id, variant_id, sku_snapshot, title_snapshot, 
                    attributes_snapshot, unit_amount, quantity, line_amount
                  ) VALUES (
                    ${order.id}, ${item.product_id}, ${item.variant_id}, ${item.sku_snapshot}, ${item.title_snapshot},
                    ${JSON.stringify(item.attributes_snapshot)}::jsonb, ${item.unit_amount}, ${item.quantity}, ${item.line_amount}
                  )
                `;
              }

              // Update webhook event with success and order ID
              await db.exec`
                UPDATE webhook_events SET processing_status = 'processed', payment_id = ${payment.id}, order_id = ${order.id}, processed_at = NOW()
                WHERE id = ${webhookEventId}
              `;
            }
          } catch (orderErr: any) {
            if (orderErr.message?.includes("unique constraint") || orderErr.code === "23505") {
              // Order already exists, safe to ignore
              await db.exec`
                UPDATE webhook_events SET processing_status = 'processed', payment_id = ${payment.id}, processed_at = NOW()
                WHERE id = ${webhookEventId}
              `;
            } else {
              throw orderErr;
            }
          }
        }
      } else {
        // Other events
        await db.exec`
          UPDATE webhook_events SET processing_status = 'processed', processed_at = NOW()
          WHERE id = ${webhookEventId}
        `;
      }
    } catch (err: any) {
      await db.exec`
        UPDATE webhook_events SET processing_status = 'failed', error_message = ${err.message}, processed_at = NOW()
        WHERE id = ${webhookEventId}
      `;
      throw APIError.internal(err.message);
    }

    return { received: true };
  }
);
