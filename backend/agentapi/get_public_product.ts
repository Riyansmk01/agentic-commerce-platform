import { api, APIError } from "encore.dev/api";
import catalogDb from "../catalog/db";
import merchantsDb from "../merchants/db";
import { AgentApiMeta } from "./types";
import { buildMeta } from "./helpers";
import { getVariantsForProduct } from "../catalog/helpers";

interface GetPublicProductParams { productId: string; }

interface GetPublicProductResponse {
  data: {
    id: string; title: string; description?: string; brand?: string;
    category?: string; productUrl?: string; imageUrl?: string;
    merchantId: string; merchantName: string;
    variants: Array<{
      id: string; sku?: string; title: string;
      attributes: Record<string, unknown>; currentPrice?: number;
      compareAtPrice?: number; currency?: string;
      stockStatus: string; quantityAvailable?: number;
    }>;
  };
  meta: AgentApiMeta;
}

// Returns public product details for AI agent consumption.
export const getPublicProduct = api<GetPublicProductParams, GetPublicProductResponse>(
  { expose: true, method: "GET", path: "/v1/products/:productId" },
  async (req) => {
    const product = await catalogDb.queryRow<{
      id: string; organization_id: string; title: string; description: string | null;
      brand: string | null; category: string | null; product_url: string | null;
      primary_image_url: string | null; status: string;
    }>`SELECT * FROM products WHERE id = ${req.productId}`;
    if (!product || product.status !== "active") throw APIError.notFound("product not found");

    const merchantProfile = await merchantsDb.queryRow<{ display_name: string }>`
      SELECT display_name FROM merchant_profiles WHERE organization_id = ${product.organization_id}
    `;

    const variants = await getVariantsForProduct(product.id);

    return {
      data: {
        id: product.id, title: product.title, description: product.description ?? undefined,
        brand: product.brand ?? undefined, category: product.category ?? undefined,
        productUrl: product.product_url ?? undefined, imageUrl: product.primary_image_url ?? undefined,
        merchantId: product.organization_id,
        merchantName: merchantProfile?.display_name ?? "Unknown Merchant",
        variants: variants.map(v => ({
          id: v.id, sku: v.sku, title: v.title, attributes: v.attributes,
          currentPrice: v.price?.saleAmount ?? v.price?.listAmount,
          compareAtPrice: v.price?.saleAmount ? v.price.listAmount : undefined,
          currency: v.price?.currency,
          stockStatus: v.inventory?.availabilityStatus ?? "unknown",
          quantityAvailable: v.inventory?.quantityAvailable,
        })),
      },
      meta: buildMeta(),
    };
  }
);
