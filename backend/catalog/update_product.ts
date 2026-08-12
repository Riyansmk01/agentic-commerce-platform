import { api, APIError } from "encore.dev/api";
import db from "./db";
import { Product, UpdateProductRequest } from "./types";
import { getVariantsForProduct } from "./helpers";

interface UpdateProductResponse { product: Product; }

// Updates a product's metadata and status.
export const updateProduct = api<UpdateProductRequest, UpdateProductResponse>(
  { expose: true, method: "PUT", path: "/products/:id" },
  async (req) => {
    const existing = await db.queryRow<{ id: string }>`SELECT id FROM products WHERE id = ${req.id}`;
    if (!existing) throw APIError.notFound("product not found");

    const attrsStr = req.attributes ? JSON.stringify(req.attributes) : null;

    const row = await db.queryRow<{
      id: string; organization_id: string; external_id: string | null; slug: string;
      title: string; description: string | null; brand: string | null; category: string | null;
      product_url: string | null; primary_image_url: string | null; status: string;
      attributes: Record<string, unknown>; source: string | null; created_at: Date; updated_at: Date;
    }>`
      UPDATE products SET
        title = COALESCE(${req.title ?? null}, title),
        description = COALESCE(${req.description ?? null}, description),
        brand = COALESCE(${req.brand ?? null}, brand),
        category = COALESCE(${req.category ?? null}, category),
        product_url = COALESCE(${req.productUrl ?? null}, product_url),
        primary_image_url = COALESCE(${req.primaryImageUrl ?? null}, primary_image_url),
        status = COALESCE(${req.status ?? null}, status),
        attributes = COALESCE(${attrsStr}::jsonb, attributes),
        updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING *
    `;
    if (!row) throw APIError.internal("failed to update product");

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
