"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/lib/trpc';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  username: string;
  fullName: string | null;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'WORKER';
  branchId: number;
  branch?: { id: number; name: string };
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ── Fetch full profile from DB after BetterAuth session is confirmed ────────
  const fetchProfile = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      if (!session?.data?.user) {
        setUser(null);
        return;
      }

      // Fetch role + branchId from DB server-side (never from cookie/localStorage)
      const res = await fetch('/api/trpc/users.me', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const json = await res.json();
      const dbUser = json?.result?.data;

      if (dbUser) {
        setUser({
          id: dbUser.id,
          username: dbUser.username,
          fullName: dbUser.fullName,
          email: dbUser.email,
          role: dbUser.role,
          branchId: dbUser.branchId,
          branch: dbUser.branch,
        });
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login: username → lookup email → BetterAuth signIn ─────────────────────
  const login = async (username: string, password: string) => {
    // Step 1: Resolve username → email via public tRPC endpoint
    const lookupRes = await fetch(
      `/api/trpc/users.lookupByUsername?batch=1&input=${encodeURIComponent(
        JSON.stringify({ "0": { username } })
      )}`,
      { credentials: 'include' }
    );

    if (!lookupRes.ok) {
      throw new Error('ไม่พบชื่อผู้ใช้นี้ในระบบ');
    }

    const lookupJson = await lookupRes.json();
    const email: string | undefined =
      lookupJson?.[0]?.result?.data?.email;

    if (!email) {
      throw new Error('ไม่พบชื่อผู้ใช้นี้ในระบบ');
    }

    // Step 2: Sign in via BetterAuth (sets HttpOnly session cookie automatically)
    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || 'รหัสผ่านไม่ถูกต้อง');
    }

    // Step 3: Hydrate user profile from DB
    await fetchProfile();

    router.push('/dashboard');
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authClient.signOut();
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  // ── Bootstrap: check existing session on mount ──────────────────────────────
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
