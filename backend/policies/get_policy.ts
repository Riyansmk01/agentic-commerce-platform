import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "./db";
import { MerchantPolicy } from "./types";

interface GetPolicyParams {
  policyType: string;
  organizationId: Query<string>;
}
interface GetPolicyResponse { policy: MerchantPolicy; }

export const getPolicy = api<GetPolicyParams, GetPolicyResponse>(
  { expose: true, method: "GET", path: "/policies/:policyType" },
  async (req) => {
    const row = await db.queryRow<{
      id: string; organization_id: string; policy_type: string; title: string;
      summary: string | null; full_url: string | null; structured_data: Record<string, unknown>;
      active: boolean; updated_at: Date;
    }>`SELECT * FROM merchant_policies WHERE organization_id = ${req.organizationId} AND policy_type = ${req.policyType}`;
    if (!row) throw APIError.notFound("policy not found");

    return {
      policy: {
        id: row.id, organizationId: row.organization_id,
        policyType: row.policy_type as MerchantPolicy["policyType"],
        title: row.title, summary: row.summary ?? undefined,
        fullUrl: row.full_url ?? undefined, structuredData: row.structured_data ?? {},
        active: row.active, updatedAt: row.updated_at,
      },
    };
  }
);
