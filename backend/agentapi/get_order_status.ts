import { api } from "encore.dev/api";
import { orders } from "~encore/clients";
import { AgentApiMeta } from "./types";
import { buildMeta } from "./helpers";

interface GetOrderStatusParams { id: string; }

interface GetOrderStatusResponse {
  data: {
    orderId: string; orderNumber: string; status: string;
    paymentStatus: string; fulfillmentStatus: string;
    totalAmount: number; currency: string; placedAt: string;
  };
  meta: AgentApiMeta;
}

// Returns the current status of an order for tracking purposes.
export const getOrderStatus = api<GetOrderStatusParams, GetOrderStatusResponse>(
  { expose: true, method: "GET", path: "/v1/orders/:id" },
  async (req) => {
    const result = await orders.getOrder({ id: req.id });
    const order = result.order;

    return {
      data: {
        orderId: order.id, orderNumber: order.orderNumber, status: order.status,
        paymentStatus: order.paymentStatus, fulfillmentStatus: order.fulfillmentStatus,
        totalAmount: order.totalAmount, currency: order.currency,
        placedAt: order.placedAt.toISOString(),
      },
      meta: buildMeta(),
    };
  }
);
