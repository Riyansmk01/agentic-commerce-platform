import { api, APIError } from "encore.dev/api";
import db from "./db";
import { Organization, UpdateOrganizationRequest } from "./types";

interface UpdateOrganizationResponse {
  organization: Organization;
}

// Updates an organization's details.
export const updateOrganization = api<UpdateOrganizationRequest, UpdateOrganizationResponse>(
  { expose: true, method: "PUT", path: "/organizations/:id" },
  async (req) => {
    const existing = await db.queryRow<{ id: string }>`SELECT id FROM organizations WHERE id = ${req.id}`;
    if (!existing) throw APIError.notFound("organization not found");

    const row = await db.queryRow<{
      id: string; name: string; slug: string; country_code: string;
      timezone: string; currency: string; website_url: string | null;
      logo_url: string | null; status: string; created_by: string;
      created_at: Date; updated_at: Date;
    }>`
      UPDATE organizations SET
        name = COALESCE(${req.name ?? null}, name),
        website_url = COALESCE(${req.websiteUrl ?? null}, website_url),
        logo_url = COALESCE(${req.logoUrl ?? null}, logo_url),
        status = COALESCE(${req.status ?? null}, status),
        updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING *
    `;
    if (!row) throw APIError.internal("failed to update organization");

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
