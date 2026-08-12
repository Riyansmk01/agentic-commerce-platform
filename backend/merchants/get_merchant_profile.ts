import { api, APIError } from "encore.dev/api";
import db from "./db";
import { MerchantProfile } from "./types";

interface GetMerchantProfileParams {
  id: string;
}

interface GetMerchantProfileResponse {
  profile: MerchantProfile;
}

// Retrieves a merchant's public profile.
export const getMerchantProfile = api<GetMerchantProfileParams, GetMerchantProfileResponse>(
  { expose: true, method: "GET", path: "/merchants/:id" },
  async (req) => {
    const row = await db.queryRow<{
      organization_id: string; legal_name: string | null; display_name: string;
      description: string | null; support_email: string | null; support_phone: string | null;
      support_url: string | null; address_json: Record<string, unknown> | null;
      public_status: string; readiness_score: number; published_at: Date | null; updated_at: Date;
    }>`SELECT * FROM merchant_profiles WHERE organization_id = ${req.id}`;
    if (!row) throw APIError.notFound("merchant profile not found");

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
