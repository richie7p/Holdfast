# PDF audit follow-up — Holdfast

Source: GitHub Portfolio Technical Audit, 2026-10-03, pages 13–14.
Repeated build, dependency and coverage findings are consolidated below.

| Finding | Resolution and evidence |
| --- | --- |
| P1/P2 Windows official build failure (duplicate) | Fixed cross-platform wrapper; real official build and preview pass locally on Windows; OS matrix checks each revision. |
| P2 advisory packages (duplicate) | Repaired lock; compatible security fixes; full + production audit gate. |
| P2/P3 missing product coverage (three duplicates) | 13 domain/storage tests cover placement cost/occupied cells/selling, wave schedule/duplicate call, pause, all six stage terminal win states, defeat, star thresholds, locked/out-of-range stage selection, legacy saves and recovery. 4 production browser cases cover desktop/mobile placement, wave start, pause/restart, export and corrupt-primary backup recovery. |
| Observed shared lint errors | Corrected empty catch documentation and obsolete suppressions; lint and typecheck pass. |
| Needs verification: save recovery | Implemented validation, v1 migration, previous-save backup, recovery, quota/security errors, visible failure notice and user JSON export/import. Tested corrupt JSON, invalid shapes, finite bounded progress, no overwrite of good backup, and failed primary writes. |

Domain rules now reject negative, non-integer and locked stage starts, and invalid
stage indices cannot corrupt progress. Wins preserve the best stars. Out-of-range
or nonnumeric imported progress is normalized to finite integer limits.

Local result: 197 script scaffold + 24 app-data/auth tests; 13 domain tests; 4 E2E
cases; typecheck, lint and official production build pass. All-six-stage coverage
checks terminal rules, not the balance or ability of a human player to beat every wave.

## Validation and reproduction

Node 22 / npm 10. `npm ci --ignore-scripts`, `npm audit --audit-level=high`,
`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`,
`npx playwright install chromium`, `npm run test:e2e`.
The repository's official Vite wrapper is used for the production build and browser preview.
`test:scaffold` reports platform helper tests separately from `test:domain` game tests.
GitHub Actions runs the same gates and Chromium E2E on Ubuntu and Windows. Browser
traces/screenshots are uploaded on failures. Browser tests use fresh storage for each case.

The dependency lock was repaired because a fresh `npm ci` failed on the newer main
branch. `npm audit fix` updated compatible transitive versions (brace-expansion and
js-yaml); the complete and production-only audits now report zero vulnerabilities.
The old PDF snapshot is not the current dependency graph. This is a dated scan,
not a guarantee against future advisories. fast-uri resolves to 3.1.8 in the current graph.

The wrapper executes the resolved local Vite JS CLI through `process.execPath`,
preserving arguments, environment precedence, signals and failure exit status.
`app-env.json` keeps this public game auth-off on a clean clone; optional `.grok`
settings override it and process environment overrides both. Existing platform
branding, helpers and deployment configuration are preserved. Rebuildable deployment
output is ignored instead of committing machine-specific generated bundles.

Platform regression tests now use an isolated blank OG workspace when testing
fallback metadata; they no longer inherit the real game's title/card. Windows
directory-link tests use junctions without needing administrator symlink privileges.
No test cases, lint rules, vulnerability gate or bundle threshold were disabled.

## Limits that remain explicit

Browser saves are local, user-controlled and not an anti-cheat or server durability
boundary. Manual JSON export/import provides a portable backup, not automatic cloud
sync. An authenticated shared service requires a separate product and deployment
choice; this change adds no unauthenticated shared database. Newer save versions
are preserved instead of silently overwritten. Exports are local JSON files, imports
are size-limited, validated and confirmed before replacement.

Desktop Chromium and emulated mobile viewport checks do not prove real iOS/Android
touch/audio behavior, long-session memory stability, production provider behavior,
or low-end device frame rates. No deployment or merge was performed. The provider's
external Grok extension can be blocked by its cross-origin response; it is retained
and is recorded as an external integration warning. Application uncaught errors are
asserted by the browser suite. Physical audio listening and long play sessions remain
external verification tasks.
