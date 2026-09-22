
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
