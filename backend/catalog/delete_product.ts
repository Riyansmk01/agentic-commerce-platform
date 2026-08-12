import { api, APIError } from "encore.dev/api";
import db from "./db";

interface DeleteProductParams { id: string; }
interface DeleteProductResponse { success: boolean; }

// Archives (soft-deletes) a product from the catalog.
export const deleteProduct = api<DeleteProductParams, DeleteProductResponse>(
  { expose: true, method: "DELETE", path: "/products/:id" },
  async (req) => {
    const existing = await db.queryRow<{ id: string }>`SELECT id FROM products WHERE id = ${req.id}`;
    if (!existing) throw APIError.notFound("product not found");

    await db.exec`UPDATE products SET status = 'archived', updated_at = NOW() WHERE id = ${req.id}`;

    return { success: true };
  }
);
