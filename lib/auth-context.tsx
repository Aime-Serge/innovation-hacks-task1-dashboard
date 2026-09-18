"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "./types";
import {
  getSession,
  login as mockLogin,
  logout as mockLogout,
  register as mockRegister,
} from "./mock-auth";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: SessionStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Redirect away from these if a session already exists.
const AUTH_ENTRY_PATHS = ["/login", "/register"];
// Never require a session — and, unlike the entry paths above, never
// redirect away from these even if one exists (a signed-in user must
// still be able to open a reset-password link).
const ALWAYS_PUBLIC_PATHS = ["/forgot-password", "/reset-password"];
const PUBLIC_PATHS = [...AUTH_ENTRY_PATHS, ...ALWAYS_PUBLIC_PATHS];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getSession().then((u) => {
      setUser(u);
      setStatus(u ? "authenticated" : "unauthenticated");
    });
  }, []);

  // Belt-and-suspenders: proxy.ts already redirects on the mock session
  // cookie's mere presence; this catches the case where that cookie is
  // stale (e.g. the account behind it was deleted in this same tab).
  useEffect(() => {
    if (status === "unauthenticated" && !PUBLIC_PATHS.includes(pathname)) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
    if (status === "authenticated" && AUTH_ENTRY_PATHS.includes(pathname)) {
      router.replace("/");
    }
  }, [status, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await mockLogin(email, password);
    setUser(loggedInUser);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const registeredUser = await mockRegister(name, email, password);
    setUser(registeredUser);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await mockLogout();
    setUser(null);
    setStatus("unauthenticated");
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
