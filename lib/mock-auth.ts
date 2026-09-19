import type { User } from "./types";
import { getInitials } from "./format";

// Mock authentication for Task 1's frontend-only demo — there is no
// backend, so this is a plaintext, unsigned stand-in that exists purely
// to demonstrate the UI/UX of a real auth system (login, register,
// forgot/reset password, profile, avatar, account deletion). It must
// never be used as a template for real auth: Task 4 has the real
// version (Argon2id hashing, signed JWT sessions, hashed reset tokens)
// — see that repo's backend/app/security.py.
//
// The account list itself is persisted to localStorage, not just kept
// in a module-level array: a plain in-memory array gets wiped on every
// full page navigation (a real browser reload re-runs this module from
// scratch), which would make a freshly registered account, a changed
// password, or a pending reset token vanish the moment the user
// followed a link instead of staying on a client-side route. A real
// backend's database doesn't have that problem, and this mock shouldn't
// either.

interface Account {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  initials: string;
  avatarDataUrl: string | null;
  resetToken: string | null;
  resetExpiresAt: number | null;
}

function seedAccounts(): Account[] {
  return [
    {
      id: "user-1",
      name: "Aime Serge UKOBIZABA",
      email: "aime.serge@example.com",
      password: "password123",
      role: "Backend Engineer",
      initials: "ASU",
      avatarDataUrl: null,
      resetToken: null,
      resetExpiresAt: null,
    },
  ];
}

const ACCOUNTS_STORAGE_KEY = "devdash_mock_accounts";
const SESSION_COOKIE = "mock_session";
const SESSION_STORAGE_KEY = "devdash_session_user_id";
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export class MockAuthError extends Error {}

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function loadAccounts(): Account[] {
  if (typeof window === "undefined") return seedAccounts();
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Account[];
  } catch {
    // Corrupt or inaccessible storage — fall through to a fresh seed.
  }
  const seeded = seedAccounts();
  saveAccounts(seeded);
  return seeded;
}

function saveAccounts(list: Account[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage full or blocked (private mode) — mutations still work for
    // the rest of this tab's session, just won't survive a reload.
  }
}

const accounts: Account[] = loadAccounts();

function persist() {
  saveAccounts(accounts);
}

function toUser(account: Account): User {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    initials: account.initials,
    hasAvatar: account.avatarDataUrl !== null,
  };
}

// A plain, readable cookie (never httpOnly — there's no server to keep
// a secret from) that proxy.ts checks for presence only, purely to
// avoid flashing a protected page before the client-side redirect below
// would otherwise kick in.
function setSessionCookie(userId: string | null) {
  if (typeof document === "undefined") return;
  document.cookie = userId
    ? `${SESSION_COOKIE}=${userId}; path=/; max-age=${60 * 60 * 24 * 7}`
    : `${SESSION_COOKIE}=; path=/; max-age=0`;
}

function persistSession(userId: string | null) {
  setSessionCookie(userId);
  if (typeof window === "undefined") return;
  if (userId) window.localStorage.setItem(SESSION_STORAGE_KEY, userId);
  else window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

function requireAccount(userId: string): Account {
  const account = accounts.find((a) => a.id === userId);
  if (!account) throw new MockAuthError("Account not found.");
  return account;
}

function randomToken(): string {
  return `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

export async function getSession(): Promise<User | null> {
  if (typeof window === "undefined") return delay(null, 0);
  const id = window.localStorage.getItem(SESSION_STORAGE_KEY);
  const account = id ? accounts.find((a) => a.id === id) ?? null : null;
  return delay(account ? toUser(account) : null, 200);
}

export async function login(email: string, password: string): Promise<User> {
  await delay(null, 400);
  const account = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!account || account.password !== password) {
    throw new MockAuthError("Invalid email or password.");
  }
  persistSession(account.id);
  return toUser(account);
}

export async function register(name: string, email: string, password: string): Promise<User> {
  await delay(null, 400);
  if (accounts.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) {
    throw new MockAuthError("An account with this email already exists.");
  }
  const account: Account = {
    id: `user-${randomToken().slice(0, 7)}`,
    name,
    email,
    password,
    role: "Team Member",
    initials: getInitials(name),
    avatarDataUrl: null,
    resetToken: null,
    resetExpiresAt: null,
  };
  accounts.push(account);
  persist();
  // Creates the account only. No session is started: like the real API in
  // Task 4, registering is not a login — the user signs in afterwards.
  return toUser(account);
}

export async function logout(): Promise<void> {
  persistSession(null);
  await delay(undefined, 150);
}

export async function forgotPassword(
  email: string,
): Promise<{ message: string; devResetUrl: string | null }> {
  await delay(null, 400);
  const message =
    "If an account exists for that email, a password reset link has been generated.";
  const account = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!account) return { message, devResetUrl: null };
  const token = randomToken();
  account.resetToken = token;
  account.resetExpiresAt = Date.now() + RESET_TOKEN_TTL_MS;
  persist();
  return { message, devResetUrl: `/reset-password?token=${token}` };
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await delay(null, 400);
  const account = accounts.find((a) => a.resetToken === token);
  if (!account || !account.resetExpiresAt || account.resetExpiresAt < Date.now()) {
    if (account) {
      account.resetToken = null;
      account.resetExpiresAt = null;
      persist();
    }
    throw new MockAuthError("Invalid or expired reset link.");
  }
  account.password = newPassword;
  account.resetToken = null;
  account.resetExpiresAt = null;
  persist();
}

export async function updateProfile(
  userId: string,
  input: { name?: string; email?: string },
): Promise<User> {
  await delay(null, 300);
  const account = requireAccount(userId);
  if (input.name !== undefined) {
    account.name = input.name;
    account.initials = getInitials(input.name);
  }
  if (input.email !== undefined) account.email = input.email;
  persist();
  return toUser(account);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await delay(null, 300);
  const account = requireAccount(userId);
  if (account.password !== currentPassword) {
    throw new MockAuthError("Current password is incorrect.");
  }
  account.password = newPassword;
  persist();
}

const AVATAR_MAX_BYTES = 500_000;
const AVATAR_ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function uploadAvatar(userId: string, file: File): Promise<User> {
  if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
    throw new MockAuthError("Only PNG, JPEG, or WebP images are allowed.");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new MockAuthError("Image must be 500 KB or smaller.");
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new MockAuthError("Failed to read image."));
    reader.readAsDataURL(file);
  });
  await delay(null, 300);
  const account = requireAccount(userId);
  account.avatarDataUrl = dataUrl;
  persist();
  return toUser(account);
}

export async function deleteAvatar(userId: string): Promise<User> {
  await delay(null, 300);
  const account = requireAccount(userId);
  account.avatarDataUrl = null;
  persist();
  return toUser(account);
}

export function getAvatarDataUrl(userId: string): string | null {
  return accounts.find((a) => a.id === userId)?.avatarDataUrl ?? null;
}

export async function deleteAccount(userId: string): Promise<void> {
  await delay(null, 300);
  const index = accounts.findIndex((a) => a.id === userId);
  if (index !== -1) accounts.splice(index, 1);
  persist();
  persistSession(null);
}
