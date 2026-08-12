import { api, APIError } from "encore.dev/api";
import db from "./db";
import { Product, CreateProductRequest } from "./types";
import { slugify, getVariantsForProduct } from "./helpers";

interface CreateProductResponse { product: Product; }

// Creates a new product in the merchant's catalog.
export const createProduct = api<CreateProductRequest, CreateProductResponse>(
  { expose: true, method: "POST", path: "/products" },
  async (req) => {
    const slug = req.slug ?? slugify(req.title);
    const attrsStr = JSON.stringify(req.attributes ?? {});

    const existing = await db.queryRow`
      SELECT id FROM products WHERE organization_id = ${req.organizationId} AND slug = ${slug}
    `;
    if (existing) throw APIError.alreadyExists("product slug already exists for this organization");

    const row = await db.queryRow<{
      id: string; organization_id: string; external_id: string | null; slug: string;
      title: string; description: string | null; brand: string | null; category: string | null;
      product_url: string | null; primary_image_url: string | null; status: string;
      attributes: Record<string, unknown>; source: string | null; created_at: Date; updated_at: Date;
    }>`
      INSERT INTO products (organization_id, external_id, slug, title, description, brand, category,
        product_url, primary_image_url, attributes, source)
      VALUES (
        ${req.organizationId}, ${req.externalId ?? null}, ${slug}, ${req.title},
        ${req.description ?? null}, ${req.brand ?? null}, ${req.category ?? null},
        ${req.productUrl ?? null}, ${req.primaryImageUrl ?? null},
        ${attrsStr}::jsonb, ${req.source ?? "manual"}
      )
      RETURNING *
    `;
    if (!row) throw APIError.internal("failed to create product");

    return {
      product: {
        id: row.id, organizationId: row.organization_id, externalId: row.external_id ?? undefined,
        slug: row.slug, title: row.title, description: row.description ?? undefined,
        brand: row.brand ?? undefined, category: row.category ?? undefined,
        productUrl: row.product_url ?? undefined, primaryImageUrl: row.primary_image_url ?? undefined,
        status: row.status as Product["status"], attributes: row.attributes ?? {},
        source: row.source ?? undefined, variants: [],
        createdAt: row.created_at, updatedAt: row.updated_at,
      },
    };
  }
);
