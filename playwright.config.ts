import { defineConfig, devices } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const PORT = 3100;
const cache = path.join(homedir(), ".cache", "ms-playwright");
const installed = (prefix: string): boolean =>
  existsSync(cache) && readdirSync(cache).some((name) => name.startsWith(prefix));

// Only browsers that are actually installed run; the report states which.
const projects = [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ...(installed("firefox-") ? [{ name: "firefox", use: { ...devices["Desktop Firefox"] } }] : []),
  ...(installed("webkit-") ? [{ name: "webkit", use: { ...devices["Desktop Safari"] } }] : []),
];

export default defineConfig({
  testDir: "tests",
  timeout: 45_000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects,
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env["CI"],
    timeout: 240_000,
  },
});
