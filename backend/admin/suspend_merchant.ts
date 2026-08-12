import { api, APIError } from "encore.dev/api";
import merchantsDb from "../merchants/db";

interface SuspendMerchantParams { id: string; }
interface SuspendMerchantResponse { success: boolean; }

// Suspends a merchant organization, disabling their access and public API.
export const suspendMerchant = api<SuspendMerchantParams, SuspendMerchantResponse>(
  { expose: true, method: "POST", path: "/admin/merchants/:id/suspend" },
  async (req) => {
    const org = await merchantsDb.queryRow<{ id: string }>`SELECT id FROM organizations WHERE id = ${req.id}`;
    if (!org) throw APIError.notFound("merchant not found");

    await merchantsDb.exec`
      UPDATE organizations SET status = 'suspended', updated_at = NOW() WHERE id = ${req.id}
    `;

    return { success: true };
  }
);
