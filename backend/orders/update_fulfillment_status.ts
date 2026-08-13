import { api, APIError } from "encore.dev/api";
import db from "./db";
import { requireOrgMember } from "../auth/helpers";

interface UpdateFulfillmentStatusRequest {
  id: string;
  fulfillmentStatus: string;
  trackingNumber?: string;
  carrier?: string;
}

interface UpdateFulfillmentStatusResponse { success: boolean; fulfillmentStatus: string; }

// Updates the fulfillment status of an order.
export const updateFulfillmentStatus = api<UpdateFulfillmentStatusRequest, UpdateFulfillmentStatusResponse>(
  { expose: true, auth: true, method: "PUT", path: "/orders/:id/fulfillment" },
  async (req) => {
    const existing = await db.queryRow<{ id: string; organization_id: string }>`SELECT id, organization_id FROM orders WHERE id = ${req.id}`;
    if (!existing) throw APIError.notFound("order not found");

    await requireOrgMember(existing.organization_id);

    const validStatuses = ["unfulfilled", "partially_fulfilled", "fulfilled", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(req.fulfillmentStatus)) {
      throw APIError.invalidArgument(`invalid fulfillment status: ${req.fulfillmentStatus}`);
    }

    await db.exec`
      UPDATE orders SET fulfillment_status = ${req.fulfillmentStatus}, updated_at = NOW()
      WHERE id = ${req.id}
    `;

    return { success: true, fulfillmentStatus: req.fulfillmentStatus };
  }
);
