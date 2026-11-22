# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project does not yet follow Semantic Versioning releases; entries are
grouped by the repository's tags and by `main`.

## [Unreleased]

Commits on `main` since the `task-1-submission` tag (2026-09-22), newest first.

### Added

- Welcoming auth-page hook and a personalized dashboard greeting (`322d0b6`)
- A welcoming tagline above the DevDash name on auth pages (`e7656d8`)
- Role-aware registration and dashboards for developers vs team leads (`0ea5a0f`)
- Registration profile fields (`4bcc42a`)
- A profile photo at registration, shown instead of initials (`d7dd52a`)

### Changed

- Replaced the header badge and favicon with the new logo mark (`7f99f67`)

### Fixed

- Prettier drift that broke CI on the last push (`896a7d6`)

### Documentation

- ADR-018 (avatar upload and `<img>` vs `next/image`) and refreshed two stale
  gate-status rows (`b866e4b`)
- Recorded a gap in the WebKit `_rsc=` prefetch filter found while landing the
  avatar feature (`0ded320`)

Merge commits for the above (`0acbf19`, `4ced397`, `e2ddf4b`) are omitted from
the list above; their contents are the entries they merged.

## [task-1-submission] - 2026-09-22

Task 1 submission: strict-TypeScript Next.js frontend on a typed mock service
layer, tagged on `main`. See [README.md](README.md), [docs/audit.md](docs/audit.md)
and [docs/traceability.md](docs/traceability.md) for the full scope, the
quality-gate results and the requirement-to-test mapping recorded at that tag.
