import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import merchantsDb from "../merchants/db";

interface ListMerchantsParams {
  status?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface MerchantSummary {
  id: string; name: string; slug: string; status: string;
  countryCode: string; currency: string; createdAt: Date;
  displayName?: string; readinessScore?: number; publicStatus?: string;
}

interface ListMerchantsResponse { merchants: MerchantSummary[]; total: number; }

// Lists all merchant organizations (admin only).
export const listMerchants = api<ListMerchantsParams, ListMerchantsResponse>(
  { expose: true, method: "GET", path: "/admin/merchants" },
  async (req) => {
    const limit = req.limit ?? 50;
    const offset = req.offset ?? 0;
    const status = req.status ?? null;

    const rows = await merchantsDb.rawQueryAll<{
      id: string; name: string; slug: string; status: string;
      country_code: string; currency: string; created_at: Date;
      display_name: string | null; readiness_score: number | null; public_status: string | null;
    }>(
      `SELECT o.id, o.name, o.slug, o.status, o.country_code, o.currency, o.created_at,
         mp.display_name, mp.readiness_score, mp.public_status
       FROM organizations o
       LEFT JOIN merchant_profiles mp ON mp.organization_id = o.id
       WHERE ($1::text IS NULL OR o.status = $1)
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      status, limit, offset
    );

    const countRow = await merchantsDb.rawQueryRow<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM organizations WHERE ($1::text IS NULL OR status = $1)`,
      status
    );

    return {
      merchants: rows.map(r => ({
        id: r.id, name: r.name, slug: r.slug, status: r.status,
        countryCode: r.country_code, currency: r.currency, createdAt: r.created_at,
        displayName: r.display_name ?? undefined,
        readinessScore: r.readiness_score ?? undefined,
        publicStatus: r.public_status ?? undefined,
      })),
      total: parseInt(countRow?.count ?? "0", 10),
    };
  }
);
