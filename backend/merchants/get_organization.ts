import { api, APIError } from "encore.dev/api";
import db from "./db";
import { Organization } from "./types";

interface GetOrganizationParams {
  slug: string;
}

interface GetOrganizationResponse {
  organization: Organization;
}

// Retrieves an organization by its slug.
export const getOrganization = api<GetOrganizationParams, GetOrganizationResponse>(
  { expose: true, method: "GET", path: "/organizations/:slug" },
  async (req) => {
    const row = await db.queryRow<{
      id: string; name: string; slug: string; country_code: string;
      timezone: string; currency: string; website_url: string | null;
      logo_url: string | null; status: string; created_by: string;
      created_at: Date; updated_at: Date;
    }>`SELECT * FROM organizations WHERE slug = ${req.slug}`;
    if (!row) throw APIError.notFound("organization not found");

    return {
      organization: {
        id: row.id, name: row.name, slug: row.slug,
        countryCode: row.country_code, timezone: row.timezone,
        currency: row.currency, websiteUrl: row.website_url ?? undefined,
        logoUrl: row.logo_url ?? undefined, status: row.status,
        createdBy: row.created_by, createdAt: row.created_at, updatedAt: row.updated_at,
      },
    };
  }
);
