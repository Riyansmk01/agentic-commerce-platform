import { api, APIError } from "encore.dev/api";
import db from "./db";
import { ProductVariant, CreateVariantRequest } from "./types";

interface CreateVariantResponse { variant: ProductVariant; }

// Adds a new variant to an existing product.
export const createVariant = api<CreateVariantRequest, CreateVariantResponse>(
  { expose: true, method: "POST", path: "/products/:id/variants" },
  async (req) => {
    const product = await db.queryRow<{ id: string; organization_id: string }>`
      SELECT id, organization_id FROM products WHERE id = ${req.id}
    `;
    if (!product) throw APIError.notFound("product not found");

    const attrsStr = JSON.stringify(req.attributes ?? {});

    const row = await db.queryRow<{
      id: string; product_id: string; organization_id: string; sku: string | null;
      barcode: string | null; title: string; attributes: Record<string, unknown>;
      image_url: string | null; status: string; weight_grams: number | null;
      created_at: Date; updated_at: Date;
    }>`
      INSERT INTO product_variants (organization_id, product_id, sku, title, attributes, image_url, weight_grams)
      VALUES (
        ${product.organization_id}, ${req.id}, ${req.sku ?? null}, ${req.title},
        ${attrsStr}::jsonb, ${req.imageUrl ?? null}, ${req.weightGrams ?? null}
      )
      RETURNING *
    `;
    if (!row) throw APIError.internal("failed to create variant");

    if (req.listAmount !== undefined) {
      await db.exec`
        INSERT INTO prices (organization_id, variant_id, currency, list_amount, sale_amount)
        VALUES (${product.organization_id}, ${row.id}, ${req.currency ?? "IDR"}, ${req.listAmount}, ${req.saleAmount ?? null})
      `;
    }

    const qty = req.quantityAvailable ?? 0;
    const status = qty > 10 ? "in_stock" : qty > 0 ? "low_stock" : "out_of_stock";
    await db.exec`
      INSERT INTO inventory (organization_id, variant_id, quantity_available, availability_status)
      VALUES (${product.organization_id}, ${row.id}, ${qty}, ${status})
    `;

    return {
      variant: {
        id: row.id, productId: row.product_id, organizationId: row.organization_id,
        sku: row.sku ?? undefined, barcode: row.barcode ?? undefined, title: row.title,
        attributes: row.attributes ?? {}, imageUrl: row.image_url ?? undefined,
        status: row.status, weightGrams: row.weight_grams ?? undefined,
        createdAt: row.created_at, updatedAt: row.updated_at,
      },
    };
  }
);
