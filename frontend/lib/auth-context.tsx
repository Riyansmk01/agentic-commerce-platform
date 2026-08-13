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

    // 2. Fetch session properly from Supabase before listening to changes
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session?.user) {
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
      } else if (stored) {
        // Fallback to local storage if Supabase says no session but we have one
        // Note: In a real app we might want to clear it if Supabase session is dead
        setUser(stored);
      }
      
      // Clean up messy OAuth token hash from URL bar
      if (window.location.hash.includes("access_token")) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      setIsLoading(false);
    });

    // 3. Listen to future auth state changes
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
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogleAuth = async () => {
    try {
      await supabaseSignInWithGoogle();
    } catch (err) {
      console.warn("Supabase Google OAuth trigger error:", err);
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
