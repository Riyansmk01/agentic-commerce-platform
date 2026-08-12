import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import catalogDb from "../catalog/db";
import merchantsDb from "../merchants/db";
import { CatalogSearchResult, AgentApiMeta } from "./types";
import { buildMeta } from "./helpers";

interface SearchCatalogParams {
  q?: Query<string>;
  merchantId?: Query<string>;
  category?: Query<string>;
  maxPrice?: Query<number>;
  minPrice?: Query<number>;
  stockStatus?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface SearchCatalogResponse {
  data: { results: CatalogSearchResult[]; total: number };
  meta: AgentApiMeta;
}

// Searches the agent-readable product catalog with optional filters.
export const searchCatalog = api<SearchCatalogParams, SearchCatalogResponse>(
  { expose: true, method: "GET", path: "/v1/catalog/search" },
  async (req) => {
    const limit = req.limit ?? 20;
    const offset = req.offset ?? 0;
    const search = req.q ? `%${req.q}%` : null;
    const merchantId = req.merchantId ?? null;
    const category = req.category ?? null;
    const maxPrice = req.maxPrice ?? null;
    const minPrice = req.minPrice ?? null;
    const stockStatus = req.stockStatus ?? null;

    const rows = await catalogDb.rawQueryAll<{
      product_id: string; variant_id: string; title: string; description: string | null;
      brand: string | null; category: string | null; sku: string | null;
      attributes: Record<string, unknown>; list_amount: number; sale_amount: number | null;
      currency: string; availability_status: string; product_url: string | null;
      image_url: string | null; organization_id: string; updated_at: Date;
    }>(
      `SELECT p.id as product_id, pv.id as variant_id, p.title, p.description, p.brand, p.category,
         pv.sku, pv.attributes, pr.list_amount, pr.sale_amount, pr.currency,
         COALESCE(i.availability_status, 'unknown') as availability_status,
         p.product_url, COALESCE(pv.image_url, p.primary_image_url) as image_url,
         p.organization_id, p.updated_at
       FROM products p
       JOIN product_variants pv ON pv.product_id = p.id
       LEFT JOIN prices pr ON pr.variant_id = pv.id
       LEFT JOIN inventory i ON i.variant_id = pv.id
       WHERE p.status = 'active' AND pv.status = 'active'
         AND ($1::text IS NULL OR p.title ILIKE $1 OR p.description ILIKE $1 OR p.brand ILIKE $1)
         AND ($2::uuid IS NULL OR p.organization_id = $2::uuid)
         AND ($3::text IS NULL OR p.category = $3)
         AND ($4::bigint IS NULL OR COALESCE(pr.sale_amount, pr.list_amount) <= $4)
         AND ($5::bigint IS NULL OR COALESCE(pr.sale_amount, pr.list_amount) >= $5)
         AND ($6::text IS NULL OR COALESCE(i.availability_status, 'unknown') = $6)
       ORDER BY p.updated_at DESC LIMIT $7 OFFSET $8`,
      search, merchantId, category, maxPrice, minPrice, stockStatus, limit, offset
    );

    const results: CatalogSearchResult[] = [];
    for (const row of rows) {
      const merchantProfile = await merchantsDb.queryRow<{ display_name: string }>`
        SELECT display_name FROM merchant_profiles WHERE organization_id = ${row.organization_id}
      `;

      results.push({
        productId: row.product_id, variantId: row.variant_id, title: row.title,
        shortDescription: row.description?.substring(0, 150) ?? undefined,
        brand: row.brand ?? undefined, category: row.category ?? undefined,
        sku: row.sku ?? undefined, attributes: row.attributes ?? {},
        currentPrice: row.sale_amount ?? row.list_amount,
        compareAtPrice: row.sale_amount ? row.list_amount : undefined,
        currency: row.currency,
        stockStatus: (row.availability_status ?? "unknown") as CatalogSearchResult["stockStatus"],
        productUrl: row.product_url ?? undefined, imageUrl: row.image_url ?? undefined,
        merchantId: row.organization_id,
        merchantName: merchantProfile?.display_name ?? "Unknown Merchant",
        lastUpdatedAt: row.updated_at,
      });
    }

    return { data: { results, total: results.length }, meta: buildMeta() };
  }
);
