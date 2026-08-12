import { api, APIError } from "encore.dev/api";
import db from "./db";

interface PublishCatalogRequest {
  organizationId: string;
}

interface PublishCatalogResponse {
  publishedCount: number;
  success: boolean;
}

// Publishes all draft products in a merchant's catalog, making them publicly discoverable.
export const publishCatalog = api<PublishCatalogRequest, PublishCatalogResponse>(
  { expose: true, method: "POST", path: "/catalog/publish" },
  async (req) => {
    const draftProducts = await db.queryAll<{ id: string }>`
      SELECT id FROM products WHERE organization_id = ${req.organizationId} AND status = 'draft'
    `;

    await db.exec`
      UPDATE products SET status = 'active', updated_at = NOW()
      WHERE organization_id = ${req.organizationId} AND status = 'draft'
    `;

    return { publishedCount: draftProducts.length, success: true };
  }
);
