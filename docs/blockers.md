
## B-405 (2026-09-22): Firefox e2e flakiness on GitHub's shared CI runners
Across 5 CI attempts on this branch's PR and its merge to main, the "End to end and accessibility"
job failed 3 times and passed 2 times, each failure on a **different** Firefox test
(TC-009 theme toggle, TC-016 WebKit CSP nonce, TC-009 theme + TC-040 progress ring together), always
a `toHaveAttribute`/CSP-timing style assertion, never the same test twice in the same way, and never
on Chromium. All of the failing tests pass cleanly and repeatably (4/4) run locally in isolation and
passed together in one full local run (144/144) and one full PR-triggered CI run. This matches the
runner-load sensitivity this repo already documents for Lighthouse and INP (ADR-017): different
resource pressure on GitHub's shared runners, not a deterministic bug in this branch's code. None of
the failing tests exercise anything this branch changed (Prettier formatting, the JS-budget number,
or the sidebar's height token). Not fixed, because there is nothing here to fix: re-running the job
resolves it, and it does not reproduce locally.

## B-406 (2026-09-22): WebKit's _rsc= prefetch-cancellation filter has a gap
tests/e2e/platform.spec.ts's "TC-016 the page's own scripts carry the nonce and nothing violates
the CSP" test already has a filter for exactly this: WebKit logs Next's cancelled background
prefetches (`?_rsc=...`) as console errors, and the test excludes any message containing both
"_rsc=" and "access control checks". While landing the avatar feature (896a7d6), this test failed
3 times in a row on WebKit in CI with exactly that excluded text still appearing in `problems`,
then passed clean on a 4th retry with no code change in between. This is not caused by the avatar
work: img-src (the only CSP directive touched) governs images, not the connect-src-style RSC data
fetches this filter is about, and the test's own comment already documents this WebKit quirk as
pre-existing. The filter's string match is real but apparently does not catch every variant of how
WebKit emits this message (timing of when the fetch is aborted relative to console logging, most
likely). Not fixed here: reproducing it needs WebKit, which this machine cannot run (missing system
libraries), so it could only be investigated through repeated CI runs, which is slow and not part
of this feature. Flagged for whoever next touches this test.
