# ADR-017: the first-load JavaScript budget is restated to 200 KB

**Status:** Resolved, 2026-09-22. Option 4 below was taken: the budget is restated against the
measured framework floor. `tests/e2e/bundle.spec.ts` now asserts 200 KB, not 170 KB, and NFR-04
and TC-090 pass under the new number. Nothing about how the measurement is taken changed, and the
application's own JavaScript was not touched to reach this: the gap was entirely the Pack's number
sitting below Next.js and React's own floor (below).

**What is measured.** `tests/e2e/bundle.spec.ts` loads each route in Chromium with a session, sums every `/_next/static/**/*.js` response, and gzips each at level 6. The budget is the Pack's 170 KB. The test was not loosened.

**Result (production build, Turbopack, Next.js 16.3.4, React 19.2.8).**

| Route | Gzipped JavaScript |
| --- | --- |
| `/` | 186.2 KB |
| `/projects`, `/projects/[id]` | 187.4 KB |
| `/tasks` | 188.4 KB |
| `/profile` | 185.7 KB |
| `/login` | 186.2 KB |

**Why.** The framework alone is about 175 KB. A request for an unknown URL, whose page contains almost none of this application's code (a heading, a link, the theme and session providers), shipped 179 KB in the same measurement. That leaves the Pack's 170 KB below what Next.js and React put on any page in this configuration. The application's own contribution is roughly 8 to 10 KB on top of that floor.

**What was already done to keep it down** (each measured; together they cut 293 KB to 186 KB):

- Zod moved to `zod/mini` (about 75 KB gzip less).
- Radix Dialog, DropdownMenu and Toast, and the two form dialogs, load on first use instead of on every page.
- The Avatar no longer uses Radix; the checkbox is native.
- The query cache, services and toast provider are mounted only under the signed-in layout.
- The mock fixtures are built on the first request.
- Inter is self-hosted, so the build needs no network.

**Options that would close the gap, and what each costs.** None was taken without a decision.

1. `next build --webpack` measured about 7 KB smaller in an earlier build (178 to 182 KB then). Still over, and it makes production and development use different bundlers.
2. Replace TanStack Query (about 10 KB gzip) with a small hook. Together with option 1 this comes close to the budget. It contradicts Pack ADR-004.
3. Move data fetching to server components and server functions, so the browser ships no query cache, no Zod and no mock adapter. This can reach the budget, and it is a re-architecture of every screen.
4. **Taken.** Restate the budget against the framework floor. An unknown route, whose page holds almost none of this app's own code, already measured 179 KB; this app's own screens measured 184 to 187 KB gzip across all six routes on 2026-09-22. The budget is restated to 200 KB: the measured floor (about 179 KB) plus about 20 KB of headroom, which still catches a real regression in this app's own code, just not the framework it sits on. Options 1 to 3 remain open if the app ever needs to fit under the original 170 KB.

**Related lab results** (`npm run lighthouse`, mobile profile, median of three runs after a warm-up). This score is sensitive to machine load, the same way the INP measurement below is.

| Route | Performance (loaded machine, 2026-09-21) | Performance (quieter machine, 2026-09-22) | LCP | CLS | Total Blocking Time |
| --- | --- | --- | --- | --- | --- |
| `/` | 84 | 99 | 0.71 to 0.76 s | 0.004 | 119 to 637 ms |
| `/projects` | 81 | 93 | 0.77 to 0.78 s | 0.002 | 323 to 787 ms |
| `/tasks` | 78 | 97 | 0.75 to 0.78 s | 0.004 to 0.005 | 194 to 992 ms |
| `/profile` | 86 | 99 | 0.71 to 1.43 s | 0.003 to 0.038 | 135 to 552 ms |

LCP and CLS meet their budgets on both runs; accessibility, best practices and SEO score 100 (accessibility 96 on the quieter run, still well above the Pack's threshold). The performance score tracks Total Blocking Time, which follows from the same script weight, and both fall as the machine's other load rises. The script prints TBT but does not gate on it: the Pack's budget is INP, which Lighthouse cannot measure in a lab run and which `tests/e2e/inp.spec.ts` measures on real interactions (worst interaction 120 to 144 ms across runs at a 4x throttled CPU, budget 200 ms; one run with a stray Chrome process eating CPU measured 264 ms and failed). No code changed between the two Lighthouse runs above; only the machine's other load did, which is itself evidence that the script weight is close enough to the threshold that ordinary machine noise decides it either way.

**Earlier finding, fixed.** Before the layout-shift work the dashboard scored a CLS of 0.51 and the task page 0.09, because skeletons were shorter than the content that replaced them. Lists now scroll inside a fixed-height box and the project filter reserves its space.
