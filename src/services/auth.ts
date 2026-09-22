import type { User } from "@/schemas";

/** A photo to upload, or a link to an image already hosted elsewhere. */
export type AvatarInput = { kind: "file"; file: File } | { kind: "url"; url: string };

/** The complete professional block used by the Task 4 registration flow. */
export type RegistrationProfile = {
  discipline: string;
  seniority: string;
  employmentStatus: string;
  companyName?: string;
  jobTitle?: string;
  country: string;
  city?: string;
  timeZone: string;
  termsAccepted: true;
  ageConfirmed: true;
};

/** Session and account management. Mocked in Task 1; the real API in Task 4. */
export interface AuthService {
  getSession(): Promise<User | null>;
  login(email: string, password: string): Promise<User>;
  /** Creates the account only: registering never starts a session. `avatar` is optional;
   * the initials avatar is used when it is omitted. */
  register(
    name: string,
    email: string,
    password: string,
    avatar?: AvatarInput,
    profile?: RegistrationProfile,
  ): Promise<User>;
  logout(): Promise<void>;
  forgotPassword(email: string): Promise<{ devResetUrl: string | null }>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  updateProfile(userId: string, input: { name?: string; email?: string }): Promise<User>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
  uploadAvatar(userId: string, file: File): Promise<User>;
  deleteAvatar(userId: string): Promise<User>;
  deleteAccount(userId: string): Promise<void>;
}
