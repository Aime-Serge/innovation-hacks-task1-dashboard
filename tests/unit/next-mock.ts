import { vi } from "vitest";

// A controllable stand-in for next/navigation, installed for every test.
export const nav = {
  pathname: "/",
  search: new URLSearchParams(),
  replace: vi.fn<(href: string) => void>(),
  push: vi.fn<(href: string) => void>(),
};

export const resetNav = (): void => {
  nav.pathname = "/";
  nav.search = new URLSearchParams();
  nav.replace.mockReset();
  nav.push.mockReset();
};

export const usePathname = (): string => nav.pathname;
export const useSearchParams = (): URLSearchParams => nav.search;
export const useRouter = () => ({ replace: nav.replace, push: nav.push, prefetch: vi.fn(), back: vi.fn() });
