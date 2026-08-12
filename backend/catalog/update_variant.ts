import { api, APIError } from "encore.dev/api";
import db from "./db";
import { ProductVariant, UpdateVariantRequest } from "./types";

interface UpdateVariantResponse { variant: ProductVariant; }

// Updates a product variant's details, price, and inventory.
export const updateVariant = api<UpdateVariantRequest, UpdateVariantResponse>(
  { expose: true, method: "PUT", path: "/variants/:id" },
  async (req) => {
    const existing = await db.queryRow<{ id: string; organization_id: string }>`
      SELECT id, organization_id FROM product_variants WHERE id = ${req.id}
    `;
    if (!existing) throw APIError.notFound("variant not found");

    const attrsStr = req.attributes ? JSON.stringify(req.attributes) : null;

    const row = await db.queryRow<{
      id: string; product_id: string; organization_id: string; sku: string | null;
      barcode: string | null; title: string; attributes: Record<string, unknown>;
      image_url: string | null; status: string; weight_grams: number | null;
      created_at: Date; updated_at: Date;
    }>`
      UPDATE product_variants SET
        sku = COALESCE(${req.sku ?? null}, sku),
        title = COALESCE(${req.title ?? null}, title),
        attributes = COALESCE(${attrsStr}::jsonb, attributes),
        image_url = COALESCE(${req.imageUrl ?? null}, image_url),
        status = COALESCE(${req.status ?? null}, status),
        weight_grams = COALESCE(${req.weightGrams ?? null}, weight_grams),
        updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING *
    `;
    if (!row) throw APIError.internal("failed to update variant");

    if (req.listAmount !== undefined) {
      const existingPrice = await db.queryRow<{ id: string }>`SELECT id FROM prices WHERE variant_id = ${req.id}`;
      if (existingPrice) {
        await db.exec`
          UPDATE prices SET list_amount = ${req.listAmount},
            sale_amount = COALESCE(${req.saleAmount ?? null}, sale_amount),
            updated_at = NOW()
          WHERE variant_id = ${req.id}
        `;
      } else {
        await db.exec`
          INSERT INTO prices (organization_id, variant_id, currency, list_amount, sale_amount)
          VALUES (${existing.organization_id}, ${req.id}, 'IDR', ${req.listAmount}, ${req.saleAmount ?? null})
        `;
      }
    }

    if (req.quantityAvailable !== undefined) {
      const qty = req.quantityAvailable;
      const availStatus = req.availabilityStatus ?? (qty > 10 ? "in_stock" : qty > 0 ? "low_stock" : "out_of_stock");
      const existingInv = await db.queryRow<{ variant_id: string }>`SELECT variant_id FROM inventory WHERE variant_id = ${req.id}`;
      if (existingInv) {
        await db.exec`
          UPDATE inventory SET quantity_available = ${qty}, availability_status = ${availStatus}, updated_at = NOW()
          WHERE variant_id = ${req.id}
        `;
      } else {
        await db.exec`
          INSERT INTO inventory (organization_id, variant_id, quantity_available, availability_status)
          VALUES (${existing.organization_id}, ${req.id}, ${qty}, ${availStatus})
        `;
      }
    }

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
