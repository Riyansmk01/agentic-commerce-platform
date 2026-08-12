import { api, APIError } from "encore.dev/api";
import db from "./db";
import { MerchantProfile, UpdateMerchantProfileRequest } from "./types";

interface UpdateMerchantProfileResponse {
  profile: MerchantProfile;
}

// Updates a merchant's profile information.
export const updateMerchantProfile = api<UpdateMerchantProfileRequest, UpdateMerchantProfileResponse>(
  { expose: true, method: "PUT", path: "/merchants/:id/profile" },
  async (req) => {
    const existing = await db.queryRow<{ organization_id: string }>`
      SELECT organization_id FROM merchant_profiles WHERE organization_id = ${req.id}
    `;
    if (!existing) throw APIError.notFound("merchant profile not found");

    const addressJsonStr = req.addressJson ? JSON.stringify(req.addressJson) : null;

    const row = await db.queryRow<{
      organization_id: string; legal_name: string | null; display_name: string;
      description: string | null; support_email: string | null; support_phone: string | null;
      support_url: string | null; address_json: Record<string, unknown> | null;
      public_status: string; readiness_score: number; published_at: Date | null; updated_at: Date;
    }>`
      UPDATE merchant_profiles SET
        legal_name = COALESCE(${req.legalName ?? null}, legal_name),
        display_name = COALESCE(${req.displayName ?? null}, display_name),
        description = COALESCE(${req.description ?? null}, description),
        support_email = COALESCE(${req.supportEmail ?? null}, support_email),
        support_phone = COALESCE(${req.supportPhone ?? null}, support_phone),
        support_url = COALESCE(${req.supportUrl ?? null}, support_url),
        address_json = COALESCE(${addressJsonStr}::jsonb, address_json),
        public_status = COALESCE(${req.publicStatus ?? null}, public_status),
        updated_at = NOW()
      WHERE organization_id = ${req.id}
      RETURNING *
    `;
    if (!row) throw APIError.internal("failed to update profile");

    return {
      profile: {
        organizationId: row.organization_id,
        legalName: row.legal_name ?? undefined,
        displayName: row.display_name,
        description: row.description ?? undefined,
        supportEmail: row.support_email ?? undefined,
        supportPhone: row.support_phone ?? undefined,
        supportUrl: row.support_url ?? undefined,
        addressJson: row.address_json ?? undefined,
        publicStatus: row.public_status,
        readinessScore: row.readiness_score,
        publishedAt: row.published_at ?? undefined,
        updatedAt: row.updated_at,
      },
    };
  }
);
