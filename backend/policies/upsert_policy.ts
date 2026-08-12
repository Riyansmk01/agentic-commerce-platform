import { api } from "encore.dev/api";
import db from "./db";
import { MerchantPolicy, UpsertPolicyRequest } from "./types";

interface UpsertPolicyResponse { policy: MerchantPolicy; }

// Creates or updates a merchant policy of a given type.
export const upsertPolicy = api<UpsertPolicyRequest, UpsertPolicyResponse>(
  { expose: true, method: "POST", path: "/policies" },
  async (req) => {
    const structuredStr = JSON.stringify(req.structuredData ?? {});
    const active = req.active ?? true;

    const row = await db.queryRow<{
      id: string; organization_id: string; policy_type: string; title: string;
      summary: string | null; full_url: string | null; structured_data: Record<string, unknown>;
      active: boolean; updated_at: Date;
    }>`
      INSERT INTO merchant_policies (organization_id, policy_type, title, summary, full_url, structured_data, active)
      VALUES (${req.organizationId}, ${req.policyType}, ${req.title}, ${req.summary ?? null},
        ${req.fullUrl ?? null}, ${structuredStr}::jsonb, ${active})
      ON CONFLICT (organization_id, policy_type) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        full_url = EXCLUDED.full_url,
        structured_data = EXCLUDED.structured_data,
        active = EXCLUDED.active,
        updated_at = NOW()
      RETURNING *
    `;

    return {
      policy: {
        id: row!.id, organizationId: row!.organization_id,
        policyType: row!.policy_type as MerchantPolicy["policyType"],
        title: row!.title, summary: row!.summary ?? undefined,
        fullUrl: row!.full_url ?? undefined, structuredData: row!.structured_data ?? {},
        active: row!.active, updatedAt: row!.updated_at,
      },
    };
  }
);
