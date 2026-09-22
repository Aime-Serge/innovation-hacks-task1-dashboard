/**
 * Rules for a profile photo, shared by the registration form (instant feedback) and the mock
 * auth adapter (the rule that actually applies), so the two can never drift apart.
 */
export const AVATAR_MAX_BYTES = 500_000;
export const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const AVATAR_ACCEPT = AVATAR_TYPES.join(",");

export function isHttpsImageUrl(url: string): boolean {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

/** `null` when the file is fine to upload. */
export function avatarFileProblem(file: File): "type" | "size" | null {
  if (!AVATAR_TYPES.includes(file.type as (typeof AVATAR_TYPES)[number])) return "type";
  if (file.size > AVATAR_MAX_BYTES) return "size";
  return null;
}
