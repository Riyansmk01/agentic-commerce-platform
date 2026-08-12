import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthUser, getStoredUser, setStoredUser, clearStoredUser } from "./auth";
import { supabase, signInWithGoogle as supabaseSignInWithGoogle } from "./supabase";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, name: string) => void;
  signInWithGoogleAuth: () => Promise<void>;
  signOut: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Initial check for local stored user in localStorage
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setIsLoading(false);
    }

    // 2. Listen to Supabase auth state changes (Google OAuth callback & session restore)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        clearStoredUser();
        setUser(null);
      } else if (session?.user) {
        const su = session.user;
        const currentStored = getStoredUser();
        const googleUser: AuthUser = {
          id: su.id,
          email: su.email ?? "user@domain.com",
          name: su.user_metadata?.full_name || su.user_metadata?.name || su.email?.split("@")[0] || "Merchant User",
          role: "owner",
          avatarUrl: su.user_metadata?.avatar_url || su.user_metadata?.picture,
          provider: "google",
          organizationId: currentStored?.organizationId || "org_corestudy_01",
          organizationSlug: currentStored?.organizationSlug || "corestudy",
        };
        setStoredUser(googleUser);
        setUser(googleUser);

        // Clean up messy OAuth token hash from URL bar
        if (window.location.hash.includes("access_token")) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogleAuth = async () => {
    try {
      await supabaseSignInWithGoogle();
    } catch (err) {
      console.warn("Supabase Google OAuth trigger error, falling back to instant Google demo sign-in:", err);
      // Fallback demo Google user if Supabase redirect fails or running offline
      const demoGoogleUser: AuthUser = {
        id: `usr_google_${Math.random().toString(36).slice(2, 9)}`,
        email: "merchant.google@example.com",
        name: "CoreStudy Merchant User",
        role: "owner",
        avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        provider: "google",
        organizationId: "org_corestudy_01",
        organizationSlug: "corestudy",
      };
      setStoredUser(demoGoogleUser);
      setUser(demoGoogleUser);
    }
  };

  const signIn = (email: string, name: string) => {
    const stored = getStoredUser();
    const newUser: AuthUser = {
      id: stored?.id || `user_${Math.random().toString(36).slice(2)}`,
      email,
      name,
      role: "owner",
      provider: "email",
      organizationId: stored?.organizationId || "org_corestudy_01",
      organizationSlug: stored?.organizationSlug || "corestudy",
    };
    setStoredUser(newUser);
    setUser(newUser);
  };

  const signOut = () => {
    supabase.auth.signOut().catch(() => {});
    clearStoredUser();
    setUser(null);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setStoredUser(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signInWithGoogleAuth, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
