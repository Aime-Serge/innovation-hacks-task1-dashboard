// Full live end-to-end check for Task 1's mock auth/profile mirror —
// drives the actual product through a real browser. There is no real
// backend here (lib/mock-auth.ts is an in-memory, plaintext mock), but
// the UI flow itself is real: register -> login -> dashboard -> logout ->
// forgot/reset password using the real mocked reset link -> login with
// the new password -> settings (profile, avatar, change password) ->
// delete account.
//
// Usage:
//   BASE_URL=http://localhost:3000 node scripts/live-e2e-check.mjs

import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();

const uncaughtErrors = [];
page.on("pageerror", (e) => uncaughtErrors.push(String(e)));

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? ": " + detail : ""}`);
  if (!ok) failures++;
}

const TINY_PNG = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4" +
    "890000000a49444154789c6360000002000100000005ac9c8d0000000049454e44ae426082",
  "hex",
);
const tinyPngPath = join(mkdtempSync(join(tmpdir(), "avatar-")), "tiny.png");
writeFileSync(tinyPngPath, TINY_PNG);

const email = `live-e2e-${Date.now()}@example.com`;
const password = "supersecret1";

// 1. Unauthenticated visit redirects to /login
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
check("visiting / while unauthenticated redirects to /login", page.url().includes("/login"));

// 2. Register
await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
await page.fill("#name", "Live E2E User");
await page.fill("#email", email);
await page.fill("#password", password);
await page.fill("#confirm-password", password);
await page.click('button[type="submit"]');
// Registering must not sign you in: it sends you to the login page.
await page.waitForURL(new RegExp(`^${BASE}/login`), { timeout: 15000 });
check("register redirects to the login page, not the dashboard", page.url().includes("registered=1"));
check(
  "login page confirms the account was created",
  await page.isVisible("text=Account created. Log in to continue."),
);
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
check("still signed out after registering (dashboard redirects to login)", page.url().includes("/login"));

await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button[type="submit"]');
await page.waitForURL(`${BASE}/`, { timeout: 15000 });
check("logging in after registering lands on dashboard", page.url() === `${BASE}/`);
await page.waitForSelector("h1:has-text('Dashboard')");

// 3. Log out, confirm protected routes now reject
await page.click('button[aria-haspopup="menu"]');
await page.waitForSelector('[role="menu"]');
await page.click('button:has-text("Sign out")');
await page.waitForURL(new RegExp(`^${BASE}/login`), { timeout: 10000 });
check("logout redirects to /login", page.url().startsWith(`${BASE}/login`));

await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
check("visiting /settings after logout redirects back to /login", page.url().includes("/login"));

// 4. Forgot password -> reset -> login with the new password
await page.goto(`${BASE}/forgot-password`, { waitUntil: "networkidle" });
await page.fill("#email", email);
await page.click('button:has-text("Send reset link")');
await page.waitForSelector('a[href*="/reset-password?token="]', { timeout: 10000 });
const resetLinkHref = await page.getAttribute('a[href*="/reset-password?token="]', "href");
check("forgot-password page surfaces a mocked reset link", Boolean(resetLinkHref));

const newPassword = "brandnewpassword1";
await page.goto(`${BASE}${resetLinkHref}`, { waitUntil: "networkidle" });
await page.fill("#password", newPassword);
await page.fill("#confirm-password", newPassword);
await page.click('button:has-text("Reset password")');
await page.waitForSelector("text=Your password has been reset", { timeout: 10000 });
check("reset-password flow completes", true);

await page.click('a:has-text("Log in")');
await page.waitForURL(new RegExp(`^${BASE}/login`));
await page.fill("#email", email);
await page.fill("#password", newPassword);
await page.click('button[type="submit"]');
await page.waitForURL(`${BASE}/`, { timeout: 10000 });
check("login with the newly reset password works", page.url() === `${BASE}/`);

// 5. Settings: profile fields pre-populated, avatar upload, change password
await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
check("settings page loads while authenticated", await page.isVisible("h1:has-text('Settings')"));

const profileNameValue = await page.inputValue("#settings-name");
const profileEmailValue = await page.inputValue("#settings-email");
check(
  "settings profile fields are pre-populated with real data, not empty",
  profileNameValue === "Live E2E User" && profileEmailValue === email,
  `got name="${profileNameValue}" email="${profileEmailValue}"`,
);

await page.setInputFiles('input[type="file"]', tinyPngPath);
await page.waitForSelector('button:has-text("Remove")', { timeout: 10000 });
check("avatar upload succeeds (Remove button now shown)", true);

await page.fill("#current-password", newPassword);
await page.fill("#new-password", "yetanotherpassword1");
await page.fill("#confirm-new-password", "yetanotherpassword1");
await page.click('button:has-text("Change password")');
await page.waitForSelector("text=Password changed.", { timeout: 10000 });
check("change-password flow completes", true);

// 6. Delete account
await page.click('button:has-text("Delete my account")');
await page.waitForSelector('[role="dialog"]');
await page.click('button:has-text("Delete account")');
await page.waitForURL(new RegExp(`^${BASE}/login`), { timeout: 10000 });
check("delete-account flow completes and redirects to /login", page.url().startsWith(`${BASE}/login`));

check("no uncaught client-side exceptions during the run", uncaughtErrors.length === 0, uncaughtErrors.join(" | "));

console.log(`\n${failures === 0 ? "ALL LIVE CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
