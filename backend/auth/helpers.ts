import { APIError } from "encore.dev/api";
import db from "../merchants/db";
import { getAuthData } from "~encore/auth";
import { AuthData } from "./auth";

export async function requireOrgMember(organizationId: string) {
  const authData = getAuthData() as AuthData | undefined;
  if (!authData || !authData.userID) {
    throw APIError.unauthenticated("unauthenticated");
  }

  const member = await db.queryRow`
    SELECT role FROM organization_members 
    WHERE user_id = ${authData.userID} 
      AND organization_id = ${organizationId} 
      AND status = 'active'
  `;

  if (!member) {
    throw APIError.permissionDenied("not a member of this organization");
  }

  return member;
}
