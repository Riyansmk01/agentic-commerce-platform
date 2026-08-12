import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "./db";
import { Product } from "./types";
import { getVariantsForProduct } from "./helpers";

interface ListProductsParams {
  organizationId: Query<string>;
  status?: Query<string>;
  category?: Query<string>;
  search?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListProductsResponse {
  products: Product[];
  total: number;
}

// Lists all products for a merchant organization with optional filters.
export const listProducts = api<ListProductsParams, ListProductsResponse>(
  { expose: true, method: "GET", path: "/products" },
  async (req) => {
    const limit = req.limit ?? 50;
    const offset = req.offset ?? 0;
    const status = req.status ?? null;
    const category = req.category ?? null;
    const search = req.search ? `%${req.search}%` : null;

    const rows = await db.rawQueryAll<{
      id: string; organization_id: string; external_id: string | null; slug: string;
      title: string; description: string | null; brand: string | null; category: string | null;
      product_url: string | null; primary_image_url: string | null; status: string;
      attributes: Record<string, unknown>; source: string | null; created_at: Date; updated_at: Date;
    }>(
      `SELECT * FROM products
       WHERE organization_id = $1
         AND ($2::text IS NULL OR status = $2)
         AND ($3::text IS NULL OR category = $3)
         AND ($4::text IS NULL OR title ILIKE $4)
       ORDER BY created_at DESC
       LIMIT $5 OFFSET $6`,
      req.organizationId, status, category, search, limit, offset
    );

    const countRow = await db.rawQueryRow<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM products
       WHERE organization_id = $1
         AND ($2::text IS NULL OR status = $2)
         AND ($3::text IS NULL OR category = $3)
         AND ($4::text IS NULL OR title ILIKE $4)`,
      req.organizationId, status, category, search
    );

    const products: Product[] = [];
    for (const row of rows) {
      const variants = await getVariantsForProduct(row.id);
      products.push({
        id: row.id, organizationId: row.organization_id, externalId: row.external_id ?? undefined,
        slug: row.slug, title: row.title, description: row.description ?? undefined,
        brand: row.brand ?? undefined, category: row.category ?? undefined,
        productUrl: row.product_url ?? undefined, primaryImageUrl: row.primary_image_url ?? undefined,
        status: row.status as Product["status"], attributes: row.attributes ?? {},
        source: row.source ?? undefined, variants,
        createdAt: row.created_at, updatedAt: row.updated_at,
      });
    }

    return { products, total: parseInt(countRow?.count ?? "0", 10) };
  }
);
