import { api } from "encore.dev/api";
import { checkout } from "~encore/clients";
import { AgentApiMeta } from "./types";
import { buildMeta } from "./helpers";

interface CreateCheckoutRequest {
  merchantId: string;
  items: Array<{ productId: string; variantId: string; quantity: number }>;
  agentName?: string;
  returnUrl?: string;
  customerJson?: Record<string, unknown>;
}

interface CreateCheckoutResponse {
  data: {
    checkoutId: string; publicId: string; checkoutUrl: string;
    totalAmount: number; currency: string; expiresAt: string; status: string;
  };
  meta: AgentApiMeta;
}

// Creates a checkout session for an AI agent, validating stock and prices server-side.
export const createCheckout = api<CreateCheckoutRequest, CreateCheckoutResponse>(
  { expose: true, method: "POST", path: "/v1/checkouts" },
  async (req) => {
    const session = await checkout.createCheckoutSession({
      organizationId: req.merchantId,
      items: req.items,
      source: "agent",
      sourceAgent: req.agentName,
      returnUrl: req.returnUrl,
      customerJson: req.customerJson,
    });

    return {
      data: {
        checkoutId: session.session.id,
        publicId: session.session.publicId,
        checkoutUrl: `/checkout/${session.session.publicId}`,
        totalAmount: session.session.totalAmount,
        currency: session.session.currency,
        expiresAt: session.session.expiresAt.toISOString(),
        status: session.session.status,
      },
      meta: buildMeta(),
    };
  }
);
