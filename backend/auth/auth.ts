import { authHandler } from "encore.dev/auth";
import { APIError } from "encore.dev/api";
import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from environment since Encore secrets require `encore secret set`
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
}

const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

export interface AuthParams {
  authorization: string;
}

export interface AuthData {
  userID: string;
}

export const auth = authHandler<AuthParams, AuthData>(async (params) => {
  const token = params.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw APIError.unauthenticated("missing authorization token");
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw APIError.unauthenticated("invalid token");
  }

  return { userID: data.user.id };
});
