import { expect, test } from "@playwright/test";
import { gzipSync } from "node:zlib";
import { signIn, visit } from "./helpers";

// NFR-04: 200 KB or less of JavaScript on first load per route, gzip. Restated from the Pack's
// 170 KB (ADR-017, option 4): a route with almost none of this app's own code already measured
// 179 KB in this Next.js 16 / React 19 configuration, so 170 KB sat below the framework's own
// floor. 200 KB is that floor plus about 20 KB of headroom for this app's own code (measured
// 184 to 187 KB); the test still fails a real regression, it just no longer fails on the
// framework alone.
const BUDGET_BYTES = 200 * 1024;
const ROUTES = ["/", "/projects", "/projects/project-1", "/tasks", "/profile", "/login"] as const;

test.describe("TC-090 JavaScript budget (NFR-04)", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "measured once, in Chromium");

  for (const route of ROUTES) {
    test(`TC-090 ${route} ships at most 200 KB of gzipped JavaScript`, async ({
      page,
      context,
    }) => {
      await signIn(context);
      const scripts = new Map<string, number>();
      page.on("response", (response) => {
        const url = response.url();
        if (!url.includes("/_next/static/") || !url.endsWith(".js")) return;
        void response.body().then((body) => scripts.set(url, gzipSync(body, { level: 6 }).length));
      });
      await visit(page, route);
      await page.waitForLoadState("networkidle");
      const total = [...scripts.values()].reduce((sum, size) => sum + size, 0);
      console.log(`${route}: ${(total / 1024).toFixed(1)} KB gzip in ${scripts.size} files`);
      expect(total).toBeGreaterThan(0);
      expect(total).toBeLessThanOrEqual(BUDGET_BYTES);
    });
  }
});
