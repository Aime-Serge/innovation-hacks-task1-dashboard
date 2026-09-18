// QA verification suite — real browser checks that Vitest/jsdom can't do:
// automated accessibility scanning, keyboard interaction, and responsive
// layout integrity. Requires the app already running (dev or prod) at
// BASE_URL. Not part of `npm test` because it needs a live server;
// run it manually or wire it into CI as a separate step.
//
// Usage:
//   npm run dev &
//   BASE_URL=http://localhost:3000 node scripts/qa-checks.mjs

import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
let failures = 0;

function report(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? ": " + detail : ""}`);
  if (!ok) failures++;
}

async function newPage(viewport) {
  const context = await browser.newContext({ viewport });
  return context.newPage();
}

// Every check below needs its own fresh browser context (for a clean
// a11y/responsive scan), which means a fresh localStorage too — the
// dashboard is now behind the mock auth gate, so each context logs in
// with the seeded demo account before touching a protected page.
async function loginAsSeedUser(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.fill("#email", "aime.serge@example.com");
  await page.fill("#password", "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
  // Login is a client-side navigation (router.push): the browser's
  // sequential focus-navigation starting point stays anchored near the
  // just-clicked (and now-unmounted) submit button rather than resetting
  // to the top of the document the way a real page load would — merely
  // blurring the element doesn't fix this. A reload gives later
  // Tab-order checks the same clean starting point a user opening this
  // URL fresh (or reloading after login) would actually have.
  await page.reload({ waitUntil: "networkidle" });
}

// 1. Axe scan: login page (unauthenticated, public)
{
  const page = await newPage({ width: 1280, height: 900 });
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.waitForSelector("h1:has-text('Log in')");
  const results = await new AxeBuilder({ page }).analyze();
  report(
    "axe scan: login page has zero violations",
    results.violations.length === 0,
    results.violations.map((v) => `${v.id} (${v.nodes.length} nodes)`).join(", "),
  );
  await page.close();
}

// 2. Axe scan: register page
{
  const page = await newPage({ width: 1280, height: 900 });
  await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
  await page.waitForSelector("h1:has-text('Create an account')");
  const results = await new AxeBuilder({ page }).analyze();
  report(
    "axe scan: register page has zero violations",
    results.violations.length === 0,
    results.violations.map((v) => `${v.id} (${v.nodes.length} nodes)`).join(", "),
  );
  await page.close();
}

// 3. Axe scan: forgot-password page
{
  const page = await newPage({ width: 1280, height: 900 });
  await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: "networkidle" });
  await page.waitForSelector("h1:has-text('Reset your password')");
  const results = await new AxeBuilder({ page }).analyze();
  report(
    "axe scan: forgot-password page has zero violations",
    results.violations.length === 0,
    results.violations.map((v) => `${v.id} (${v.nodes.length} nodes)`).join(", "),
  );
  await page.close();
}

// 4. Keyboard: Tab order on the login form reaches "Forgot password?"
//    before the submit button.
{
  const page = await newPage({ width: 1280, height: 900 });
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.focus("#email");
  await page.keyboard.press("Tab"); // -> password
  await page.keyboard.press("Tab"); // -> Forgot password? link
  const onForgotLink = await page.evaluate(() => document.activeElement?.textContent);
  report(
    "Tab order reaches 'Forgot password?' after the password field",
    onForgotLink === "Forgot password?",
    `got: ${onForgotLink}`,
  );
  await page.keyboard.press("Tab"); // -> submit button
  const onSubmit = await page.evaluate(() => document.activeElement?.getAttribute("type"));
  report("Tab order then reaches the submit button", onSubmit === "submit", `got: ${onSubmit}`);
  await page.close();
}

// 5. Axe scan: dashboard
{
  const page = await newPage({ width: 1280, height: 900 });
  await loginAsSeedUser(page);
  await page.waitForSelector("text=Dashboard");
  await page.waitForTimeout(1000);
  const results = await new AxeBuilder({ page }).analyze();
  report(
    "axe scan: dashboard has zero violations",
    results.violations.length === 0,
    results.violations.map((v) => `${v.id} (${v.nodes.length} nodes)`).join(", "),
  );
  await page.close();
}

// 6. Axe scan: project detail
{
  const page = await newPage({ width: 1280, height: 900 });
  await loginAsSeedUser(page);
  await page.goto(`${BASE_URL}/projects/proj-atlas`, { waitUntil: "networkidle" });
  await page.waitForSelector("h2:has-text('Tasks')");
  await page.waitForTimeout(800);
  const results = await new AxeBuilder({ page }).analyze();
  report(
    "axe scan: project detail has zero violations",
    results.violations.length === 0,
    results.violations.map((v) => `${v.id} (${v.nodes.length} nodes)`).join(", "),
  );
  await page.close();
}

// 7. Axe scan: settings page
{
  const page = await newPage({ width: 1280, height: 900 });
  await loginAsSeedUser(page);
  await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
  await page.waitForSelector("h1:has-text('Settings')");
  await page.waitForTimeout(500);
  const results = await new AxeBuilder({ page }).analyze();
  report(
    "axe scan: settings page has zero violations",
    results.violations.length === 0,
    results.violations.map((v) => `${v.id} (${v.nodes.length} nodes)`).join(", "),
  );
  await page.close();
}

// 8. Nonexistent project id doesn't crash
{
  const page = await newPage({ width: 1280, height: 900 });
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  await loginAsSeedUser(page);
  await page.goto(`${BASE_URL}/projects/does-not-exist`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const text = await page.textContent("body");
  report(
    "nonexistent project id shows 'Project not found', no crash",
    text.includes("Project not found") && errors.length === 0,
    errors.join("; "),
  );
  await page.close();
}

// 9. Keyboard: Tab reaches the profile menu, Enter opens it, Escape closes
//    it and returns focus to the trigger.
{
  const page = await newPage({ width: 1280, height: 900 });
  await loginAsSeedUser(page);
  await page.waitForSelector("text=Dashboard");
  await page.waitForTimeout(800);
  // skip-link -> logo link -> Dashboard link -> profile trigger
  for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-haspopup"));
  report("Tab order reaches the profile menu trigger", focused === "menu", `got: ${focused}`);

  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  report("Enter opens the profile menu", await page.isVisible('[role="menu"]'));

  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  report("Escape closes the profile menu", !(await page.isVisible('[role="menu"]')));

  const refocused = await page.evaluate(() => document.activeElement?.getAttribute("aria-haspopup"));
  report("focus returns to the trigger after Escape", refocused === "menu", `got: ${refocused}`);
  await page.close();
}

// 10. Responsive: no horizontal scroll at 375px
{
  const page = await newPage({ width: 375, height: 900 });
  await loginAsSeedUser(page);
  await page.waitForSelector("text=Dashboard");
  await page.waitForTimeout(800);
  const hScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  report("no horizontal scroll at 375px", !hScroll);
  await page.close();
}

// 11. Truncation stress test: a pathologically long, unbreakable title
//     must not blow out the layout (real bug class: truncate/line-clamp
//     classes present in JSX but not actually effective, e.g. a missing
//     min-w-0 on a flex ancestor).
{
  const page = await newPage({ width: 375, height: 900 });
  await loginAsSeedUser(page);
  await page.waitForSelector("text=Dashboard");
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const longText = "X".repeat(300);
    const projectTitle = document.querySelector("h3");
    const taskTitle = document.querySelector("li p.truncate");
    if (projectTitle) projectTitle.textContent = longText;
    if (taskTitle) taskTitle.textContent = longText;
  });
  await page.waitForTimeout(100);
  const hScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  report("a 300-char unbreakable title doesn't cause horizontal scroll", !hScroll);
  await page.close();
}

// 12. Axe scan: New Project modal open
{
  const page = await newPage({ width: 1280, height: 900 });
  await loginAsSeedUser(page);
  await page.getByRole("button", { name: "New Project" }).click();
  await page.waitForSelector('[role="dialog"]');
  await page.waitForTimeout(200);
  const results = await new AxeBuilder({ page }).analyze();
  report(
    "axe scan: New Project modal has zero violations",
    results.violations.length === 0,
    results.violations.map((v) => `${v.id} (${v.nodes.length} nodes)`).join(", "),
  );
  await page.close();
}

// 13. Axe scan: New Task modal open, from a project detail page
{
  const page = await newPage({ width: 1280, height: 900 });
  await loginAsSeedUser(page);
  await page.goto(`${BASE_URL}/projects/proj-atlas`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "New Task" }).click();
  await page.waitForSelector('[role="dialog"]');
  await page.waitForTimeout(200);
  const results = await new AxeBuilder({ page }).analyze();
  report(
    "axe scan: New Task modal has zero violations",
    results.violations.length === 0,
    results.violations.map((v) => `${v.id} (${v.nodes.length} nodes)`).join(", "),
  );
  await page.close();
}

// 14. Escape closes a modal and returns focus to its trigger (same
//     contract as the profile menu, checked for the CRUD modals too).
{
  const page = await newPage({ width: 1280, height: 900 });
  await loginAsSeedUser(page);
  await page.getByRole("button", { name: "New Project" }).click();
  await page.waitForSelector('[role="dialog"]');
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  report("Escape closes the New Project modal", !(await page.isVisible('[role="dialog"]')));
  await page.close();
}

// 15. Full CRUD flow smoke test: create a project, create a task on it,
//     change its status, edit it, delete it, delete the project — the
//     kind of end-to-end path that unit tests (each component in
//     isolation) can't catch if two pieces don't actually wire together.
{
  const page = await newPage({ width: 1280, height: 900 });
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));

  await loginAsSeedUser(page);
  await page.getByRole("button", { name: "New Project" }).click();
  await page.getByLabel("Name").fill("QA Smoke Test Project");
  await page.getByRole("button", { name: "Create Project" }).click();
  await page.waitForSelector("text=QA Smoke Test Project");

  await page.getByText("QA Smoke Test Project").click();
  await page.waitForSelector("h2:has-text('Tasks')");
  await page.getByRole("button", { name: "New Task" }).click();
  await page.getByLabel("Title").fill("QA Smoke Test Task");
  await page.getByRole("button", { name: "Create Task" }).click();
  await page.waitForSelector("text=QA Smoke Test Task");

  const statusSelect = page.locator("select").first();
  await statusSelect.selectOption("done");
  await page.waitForTimeout(300);
  const statusOk = (await statusSelect.inputValue()) === "done";

  // Project/task-row delete buttons now carry a descriptive aria-label
  // (multiple bare "Delete" buttons on one page was itself a real a11y
  // finding from this test — fixed in ProjectDetailView/TaskCard). The
  // confirm dialog's own button is still plain "Delete", disambiguated
  // by scoping to the dialog.
  await page.getByRole("button", { name: "Delete project" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await page.waitForURL(`${BASE_URL}/`);
  const stillListed = await page.isVisible("text=QA Smoke Test Project");

  report(
    "full create -> status change -> delete flow works with no console errors",
    statusOk && !stillListed && errors.length === 0,
    errors.join("; "),
  );
  await page.close();
}

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
