import { api, APIError } from "encore.dev/api";
import { checkout } from "~encore/clients";
import { AgentApiMeta } from "./types";
import { buildMeta } from "./helpers";

interface GetCheckoutParams { id: string; }

interface GetCheckoutResponse {
  data: {
    checkoutId: string; publicId: string; status: string;
    totalAmount: number; currency: string; expiresAt: string;
    items: Array<{ title: string; quantity: number; unitAmount: number; lineAmount: number }>;
  };
  meta: AgentApiMeta;
}

// Returns the current status of a checkout session.
export const getCheckout = api<GetCheckoutParams, GetCheckoutResponse>(
  { expose: true, method: "GET", path: "/v1/checkouts/:id" },
  async (req) => {
    const result = await checkout.getCheckoutSession({ publicId: req.id });
    const session = result.session;

    return {
      data: {
        checkoutId: session.id, publicId: session.publicId, status: session.status,
        totalAmount: session.totalAmount, currency: session.currency,
        expiresAt: session.expiresAt.toISOString(),
        items: session.items.map((i: any) => ({
          title: i.titleSnapshot, quantity: i.quantity,
          unitAmount: i.unitAmount, lineAmount: i.lineAmount,
        })),
      },
      meta: buildMeta(),
    };
  }
);
