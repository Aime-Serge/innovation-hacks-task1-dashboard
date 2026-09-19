"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { createMockAuth } from "@/adapters/mock";
import { hardNavigate } from "@/lib/navigation";
import type { User } from "@/schemas";
import type { AuthService } from "@/services/auth";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";
type AuthValue = {
  auth: AuthService;
  user: User | null;
  status: SessionStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthValue | null>(null);
const ENTRY_PATHS = ["/login", "/register"];
const PUBLIC_PATHS = [...ENTRY_PATHS, "/forgot-password", "/reset-password"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useMemo(() => createMockAuth(), []);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    void auth.getSession().then((session) => {
      setUser(session);
      setStatus(session === null ? "unauthenticated" : "authenticated");
    });
  }, [auth]);

  // Backs up proxy.ts, which only checks that a cookie exists.
  useEffect(() => {
    if (status === "unauthenticated" && !PUBLIC_PATHS.includes(pathname)) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
    if (status === "authenticated" && ENTRY_PATHS.includes(pathname)) router.replace("/");
  }, [status, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      setUser(await auth.login(email, password));
      setStatus("authenticated");
    },
    [auth],
  );
  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
    setStatus("unauthenticated");
    hardNavigate("/login");
  }, [auth]);

  const value = useMemo(
    () => ({ auth, user, status, login, logout, setUser }),
    [auth, user, status, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (value === null) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
