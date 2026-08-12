import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://amoouhnixhxnjcxpnvjx.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtb291aG5peGh4bmpjeHBudmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTYyMzEsImV4cCI6MjEwMjEzMjIzMX0.rJoRQaIxw0Ul5N6F9_zJ3A3PeJU1OgPzn8W_vTuFS1Y";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function signInWithGoogle() {
  const redirectTo = window.location.origin + "/app/overview";
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Supabase Google OAuth error:", error.message);
    throw error;
  }

  return data;
}
