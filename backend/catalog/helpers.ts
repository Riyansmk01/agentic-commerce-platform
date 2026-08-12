import db from "./db";
import { ProductVariant, Price, Inventory } from "./types";

export async function getVariantsForProduct(productId: string): Promise<ProductVariant[]> {
  const variantRows = await db.queryAll<{
    id: string; product_id: string; organization_id: string; sku: string | null;
    barcode: string | null; title: string; attributes: Record<string, unknown>;
    image_url: string | null; status: string; weight_grams: number | null;
    created_at: Date; updated_at: Date;
  }>`SELECT * FROM product_variants WHERE product_id = ${productId} ORDER BY created_at`;

  const variants: ProductVariant[] = [];
  for (const v of variantRows) {
    const price = await db.queryRow<{
      id: string; variant_id: string; currency: string; list_amount: number;
      sale_amount: number | null; valid_from: Date | null; valid_until: Date | null;
    }>`SELECT * FROM prices WHERE variant_id = ${v.id} ORDER BY updated_at DESC LIMIT 1`;

    const inv = await db.queryRow<{
      variant_id: string; quantity_available: number; quantity_reserved: number;
      availability_status: string;
    }>`SELECT * FROM inventory WHERE variant_id = ${v.id}`;

    variants.push({
      id: v.id, productId: v.product_id, organizationId: v.organization_id,
      sku: v.sku ?? undefined, barcode: v.barcode ?? undefined, title: v.title,
      attributes: v.attributes ?? {}, imageUrl: v.image_url ?? undefined,
      status: v.status, weightGrams: v.weight_grams ?? undefined,
      createdAt: v.created_at, updatedAt: v.updated_at,
      price: price ? {
        id: price.id, variantId: price.variant_id, currency: price.currency,
        listAmount: price.list_amount, saleAmount: price.sale_amount ?? undefined,
        validFrom: price.valid_from ?? undefined, validUntil: price.valid_until ?? undefined,
      } : undefined,
      inventory: inv ? {
        variantId: inv.variant_id, quantityAvailable: inv.quantity_available,
        quantityReserved: inv.quantity_reserved,
        availabilityStatus: inv.availability_status as Inventory["availabilityStatus"],
      } : undefined,
    });
  }
  return variants;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
