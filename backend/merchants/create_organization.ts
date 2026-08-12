import { api, APIError } from "encore.dev/api";
import db from "./db";
import { Organization, CreateOrganizationRequest } from "./types";

interface CreateOrganizationResponse {
  organization: Organization;
}

// Creates a new merchant organization workspace.
export const createOrganization = api<CreateOrganizationRequest, CreateOrganizationResponse>(
  { expose: true, method: "POST", path: "/organizations" },
  async (req) => {
    const existing = await db.queryRow`SELECT id FROM organizations WHERE slug = ${req.slug}`;
    if (existing) {
      throw APIError.alreadyExists("organization slug already taken");
    }

    const row = await db.queryRow<{
      id: string; name: string; slug: string; country_code: string;
      timezone: string; currency: string; website_url: string | null;
      logo_url: string | null; status: string; created_by: string;
      created_at: Date; updated_at: Date;
    }>`
      INSERT INTO organizations (name, slug, country_code, timezone, currency, website_url, created_by)
      VALUES (
        ${req.name}, ${req.slug}, ${req.countryCode ?? "ID"},
        ${req.timezone ?? "Asia/Jakarta"}, ${req.currency ?? "IDR"},
        ${req.websiteUrl ?? null}, ${req.createdBy}
      )
      RETURNING *
    `;
    if (!row) throw APIError.internal("failed to create organization");

    await db.exec`
      INSERT INTO merchant_profiles (organization_id, display_name)
      VALUES (${row.id}, ${req.name})
    `;

    await db.exec`
      INSERT INTO organization_members (organization_id, user_id, role)
      VALUES (${row.id}, ${req.createdBy}, 'owner')
    `;

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
