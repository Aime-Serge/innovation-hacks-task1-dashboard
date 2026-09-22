import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test.describe("TC-001 landing and authentication", () => {
  test("TC-001 an anonymous visitor is sent to login and back to the page they wanted", async ({
    page,
  }) => {
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/login\?next=%2Ftasks/);
    await page.getByLabel("Email").fill("aime.serge@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/tasks$/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1, name: "Tasks" })).toBeVisible();
  });

  test("TC-001 / opens the dashboard with four KPIs, deadlines and activity", async ({
    page,
    context,
  }) => {
    await signIn(context);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
    for (const label of ["Active projects", "Open tasks", "Overdue tasks", "Completion rate"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: "Upcoming deadlines" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent activity" })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);
  });

  test("TC-005 creating an account lands on the login page, not inside the app", async ({
    page,
  }) => {
    const email = `new-${Date.now()}@example.com`;
    await page.goto("/register");
    await page.getByLabel("Name").fill("New Person");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("password123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/login\?registered=1/, { timeout: 30_000 });
    await expect(page.getByText("Account created. Log in to continue.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toHaveCount(0);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("TC-005 an uploaded photo becomes the avatar, in the header and on the profile page", async ({
    page,
  }) => {
    const email = `photo-${Date.now()}@example.com`;
    // A real, tiny, valid PNG (1x1 red pixel), so the browser has something genuine to
    // decode: this proves the photo round-trips and renders, not just that a URL was set.
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    );
    await page.goto("/register");
    await page.getByLabel("Name").fill("Photo Person");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("password123");
    await page
      .getByLabel("Upload a photo")
      .setInputFiles({ name: "avatar.png", mimeType: "image/png", buffer: png });
    // The live preview proves the file was accepted before submitting.
    await expect(page.locator("form img")).toBeVisible();
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/login\?registered=1/, { timeout: 30_000 });
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible({
      timeout: 30_000,
    });
    // The header shows the photo, not initials, and it actually decoded (no broken image).
    const headerAvatar = page.locator("header img");
    await expect(headerAvatar).toBeVisible();
    expect(
      await headerAvatar.evaluate((img: HTMLImageElement) => img.naturalWidth),
    ).toBeGreaterThan(0);
    await page.goto("/profile");
    await expect(page.locator("main img")).toBeVisible();
  });

  test("TC-004 wrong credentials show one plain message and keep the user on login", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("aime.serge@example.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.locator("main [role=alert]")).toHaveText("Invalid email or password.");
    await expect(page).toHaveURL(/\/login/);
  });

  test("TC-004 a signed-in user is kept away from login, and logout returns there", async ({
    page,
    context,
  }) => {
    await signIn(context);
    await page.goto("/login");
    await expect(page).toHaveURL(/localhost:3100\/$/);
    await page.getByRole("button", { name: /Account menu/ }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/login\?next=%2Ftasks/);
  });

  test("TC-004 forgot password shows the same message for any email", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("status")).toContainText("If an account exists");
  });

  test("TC-004 an open redirect through ?next= is ignored", async ({ page }) => {
    await page.goto("/login?next=https%3A%2F%2Fevil.example");
    await page.getByLabel("Email").fill("aime.serge@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/localhost:3100\/$/, { timeout: 30_000 });
  });
});
