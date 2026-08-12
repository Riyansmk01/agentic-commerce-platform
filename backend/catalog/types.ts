export interface Product {
  id: string;
  organizationId: string;
  externalId?: string;
  slug: string;
  title: string;
  description?: string;
  brand?: string;
  category?: string;
  productUrl?: string;
  primaryImageUrl?: string;
  status: "draft" | "active" | "archived";
  attributes: Record<string, unknown>;
  source?: string;
  variants: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  organizationId: string;
  sku?: string;
  barcode?: string;
  title: string;
  attributes: Record<string, unknown>;
  imageUrl?: string;
  status: string;
  weightGrams?: number;
  price?: Price;
  inventory?: Inventory;
  createdAt: Date;
  updatedAt: Date;
}

export interface Price {
  id: string;
  variantId: string;
  currency: string;
  listAmount: number;
  saleAmount?: number;
  validFrom?: Date;
  validUntil?: Date;
}

export interface Inventory {
  variantId: string;
  quantityAvailable: number;
  quantityReserved: number;
  availabilityStatus: "in_stock" | "low_stock" | "out_of_stock" | "unknown";
}

export interface CreateProductRequest {
  organizationId: string;
  title: string;
  slug?: string;
  description?: string;
  brand?: string;
  category?: string;
  productUrl?: string;
  primaryImageUrl?: string;
  externalId?: string;
  attributes?: Record<string, unknown>;
  source?: string;
}

export interface UpdateProductRequest {
  id: string;
  title?: string;
  description?: string;
  brand?: string;
  category?: string;
  productUrl?: string;
  primaryImageUrl?: string;
  status?: string;
  attributes?: Record<string, unknown>;
}

export interface CreateVariantRequest {
  id: string;
  organizationId: string;
  sku?: string;
  barcode?: string;
  title: string;
  attributes?: Record<string, unknown>;
  imageUrl?: string;
  weightGrams?: number;
  listAmount?: number;
  saleAmount?: number;
  currency?: string;
  quantityAvailable?: number;
}

export interface UpdateVariantRequest {
  id: string;
  sku?: string;
  title?: string;
  attributes?: Record<string, unknown>;
  imageUrl?: string;
  status?: string;
  weightGrams?: number;
  listAmount?: number;
  saleAmount?: number;
  quantityAvailable?: number;
  availabilityStatus?: string;
}
