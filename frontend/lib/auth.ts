export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  provider?: "google" | "demo" | "email";
  organizationId?: string;
  organizationSlug?: string;
}

const STORAGE_KEY = "cl_auth_user";

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function createMockUser(email: string, name: string): AuthUser {
  return {
    id: `user_${Math.random().toString(36).slice(2)}`,
    email,
    name,
    role: "owner",
  };
}
