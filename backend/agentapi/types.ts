export interface AgentApiMeta {
  requestId: string;
  apiVersion: string;
  generatedAt: string;
}

export interface CatalogSearchResult {
  productId: string;
  variantId: string;
  title: string;
  shortDescription?: string;
  brand?: string;
  category?: string;
  sku?: string;
  attributes: Record<string, unknown>;
  currentPrice: number;
  compareAtPrice?: number;
  currency: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "unknown";
  productUrl?: string;
  imageUrl?: string;
  merchantId: string;
  merchantName: string;
  lastUpdatedAt: Date;
}
