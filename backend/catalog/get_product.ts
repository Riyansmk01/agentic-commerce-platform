import { api, APIError } from "encore.dev/api";
import db from "./db";
import { Product } from "./types";
import { getVariantsForProduct } from "./helpers";

interface GetProductParams { id: string; }
interface GetProductResponse { product: Product; }

// Retrieves a product with all its variants, prices, and inventory.
export const getProduct = api<GetProductParams, GetProductResponse>(
  { expose: true, method: "GET", path: "/products/:id" },
  async (req) => {
    const row = await db.queryRow<{
      id: string; organization_id: string; external_id: string | null; slug: string;
      title: string; description: string | null; brand: string | null; category: string | null;
      product_url: string | null; primary_image_url: string | null; status: string;
      attributes: Record<string, unknown>; source: string | null; created_at: Date; updated_at: Date;
    }>`SELECT * FROM products WHERE id = ${req.id}`;
    if (!row) throw APIError.notFound("product not found");

    const variants = await getVariantsForProduct(row.id);

    return {
      product: {
        id: row.id, organizationId: row.organization_id, externalId: row.external_id ?? undefined,
        slug: row.slug, title: row.title, description: row.description ?? undefined,
        brand: row.brand ?? undefined, category: row.category ?? undefined,
        productUrl: row.product_url ?? undefined, primaryImageUrl: row.primary_image_url ?? undefined,
        status: row.status as Product["status"], attributes: row.attributes ?? {},
        source: row.source ?? undefined, variants,
        createdAt: row.created_at, updatedAt: row.updated_at,
      },
    };
  }
);
