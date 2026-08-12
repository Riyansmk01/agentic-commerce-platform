import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "./db";
import { MerchantPolicy } from "./types";

interface ListPoliciesParams { organizationId: Query<string>; }
interface ListPoliciesResponse { policies: MerchantPolicy[]; }

// Lists all policies for a merchant organization.
export const listPolicies = api<ListPoliciesParams, ListPoliciesResponse>(
  { expose: true, method: "GET", path: "/policies" },
  async (req) => {
    const rows = await db.queryAll<{
      id: string; organization_id: string; policy_type: string; title: string;
      summary: string | null; full_url: string | null; structured_data: Record<string, unknown>;
      active: boolean; updated_at: Date;
    }>`SELECT * FROM merchant_policies WHERE organization_id = ${req.organizationId} ORDER BY policy_type`;

    return {
      policies: rows.map(row => ({
        id: row.id, organizationId: row.organization_id,
        policyType: row.policy_type as MerchantPolicy["policyType"],
        title: row.title, summary: row.summary ?? undefined,
        fullUrl: row.full_url ?? undefined, structuredData: row.structured_data ?? {},
        active: row.active, updatedAt: row.updated_at,
      })),
    };
  }
);
