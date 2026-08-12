import { api, APIError } from "encore.dev/api";
import merchantsDb from "../merchants/db";

interface GetMerchantDetailsParams { id: string; }

interface GetMerchantDetailsResponse {
  organization: {
    id: string; name: string; slug: string; status: string;
    countryCode: string; currency: string; timezone: string;
    websiteUrl?: string; createdAt: Date;
  };
  profile?: {
    displayName: string; description?: string; supportEmail?: string;
    publicStatus: string; readinessScore: number;
  };
  memberCount: number;
}

// Retrieves full merchant details for admin review.
export const getMerchantDetails = api<GetMerchantDetailsParams, GetMerchantDetailsResponse>(
  { expose: true, method: "GET", path: "/admin/merchants/:id" },
  async (req) => {
    const org = await merchantsDb.queryRow<{
      id: string; name: string; slug: string; status: string;
      country_code: string; currency: string; timezone: string;
      website_url: string | null; created_at: Date;
    }>`SELECT * FROM organizations WHERE id = ${req.id}`;
    if (!org) throw APIError.notFound("merchant not found");

    const profile = await merchantsDb.queryRow<{
      display_name: string; description: string | null;
      support_email: string | null; public_status: string; readiness_score: number;
    }>`SELECT display_name, description, support_email, public_status, readiness_score FROM merchant_profiles WHERE organization_id = ${req.id}`;

    const memberRow = await merchantsDb.queryRow<{ count: string }>`
      SELECT COUNT(*)::text as count FROM organization_members WHERE organization_id = ${req.id}
    `;

    return {
      organization: {
        id: org.id, name: org.name, slug: org.slug, status: org.status,
        countryCode: org.country_code, currency: org.currency, timezone: org.timezone,
        websiteUrl: org.website_url ?? undefined, createdAt: org.created_at,
      },
      profile: profile ? {
        displayName: profile.display_name, description: profile.description ?? undefined,
        supportEmail: profile.support_email ?? undefined, publicStatus: profile.public_status,
        readinessScore: profile.readiness_score,
      } : undefined,
      memberCount: parseInt(memberRow?.count ?? "0", 10),
    };
  }
);
