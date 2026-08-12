import { api, APIError } from "encore.dev/api";
import merchantsDb from "../merchants/db";
import { AgentApiMeta } from "./types";
import { buildMeta } from "./helpers";

interface GetPublicMerchantParams { merchantId: string; }

interface GetPublicMerchantResponse {
  data: {
    id: string; name: string; displayName: string; description?: string;
    supportEmail?: string; supportUrl?: string;
    currency: string; timezone: string; countryCode: string;
  };
  meta: AgentApiMeta;
}

// Returns public merchant information for AI agents.
export const getPublicMerchant = api<GetPublicMerchantParams, GetPublicMerchantResponse>(
  { expose: true, method: "GET", path: "/v1/merchants/:merchantId" },
  async (req) => {
    const org = await merchantsDb.queryRow<{
      id: string; name: string; country_code: string; timezone: string;
      currency: string; status: string;
    }>`SELECT id, name, country_code, timezone, currency, status FROM organizations WHERE id = ${req.merchantId}`;
    if (!org || org.status !== "active") throw APIError.notFound("merchant not found");

    const profile = await merchantsDb.queryRow<{
      display_name: string; description: string | null;
      support_email: string | null; support_url: string | null; public_status: string;
    }>`SELECT display_name, description, support_email, support_url, public_status FROM merchant_profiles WHERE organization_id = ${req.merchantId}`;

    return {
      data: {
        id: org.id, name: org.name, displayName: profile?.display_name ?? org.name,
        description: profile?.description ?? undefined,
        supportEmail: profile?.support_email ?? undefined,
        supportUrl: profile?.support_url ?? undefined,
        currency: org.currency, timezone: org.timezone, countryCode: org.country_code,
      },
      meta: buildMeta(),
    };
  }
);
