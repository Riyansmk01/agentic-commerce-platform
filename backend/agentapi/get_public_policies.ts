import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import policiesDb from "../policies/db";
import { AgentApiMeta } from "./types";
import { buildMeta } from "./helpers";

interface GetPublicPoliciesParams { merchantId: Query<string>; }

interface GetPublicPoliciesResponse {
  data: {
    policies: Array<{
      type: string; title: string; summary?: string; fullUrl?: string;
      structuredData: Record<string, unknown>;
    }>;
  };
  meta: AgentApiMeta;
}

// Returns all active merchant policies for AI agent consumption.
export const getPublicPolicies = api<GetPublicPoliciesParams, GetPublicPoliciesResponse>(
  { expose: true, method: "GET", path: "/v1/policies" },
  async (req) => {
    const rows = await policiesDb.queryAll<{
      policy_type: string; title: string; summary: string | null;
      full_url: string | null; structured_data: Record<string, unknown>;
    }>`
      SELECT policy_type, title, summary, full_url, structured_data
      FROM merchant_policies
      WHERE organization_id = ${req.merchantId} AND active = true
    `;

    return {
      data: {
        policies: rows.map(r => ({
          type: r.policy_type, title: r.title, summary: r.summary ?? undefined,
          fullUrl: r.full_url ?? undefined, structuredData: r.structured_data ?? {},
        })),
      },
      meta: buildMeta(),
    };
  }
);
