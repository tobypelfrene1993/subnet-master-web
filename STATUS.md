# subnetweb Status

**Updated At:** 2026-06-08
**Execution Mode:** bootstrap
**Project State:** functional_frontend_verified
**Public URL:** local only: http://127.0.0.1:5173

## Snapshot

- Subnet Master is now a frontend-only React + TypeScript + Vite + TailwindCSS website.
- The app includes IP Calculator, VLSM Calculator, CIDR Wizard, Practice Mode, Exam Mode, Cheat Sheet, and Visual Network View.
- Core subnet, VLSM, and quiz logic lives under `src/lib/` and is covered by Vitest tests.
- `npm test` passed: 13 tests across 3 files.
- `npm run build` passed and the local dev server returned HTTP 200 at `http://127.0.0.1:5173`.

## Immediate Priorities

1. Visually review the running website in a browser at `http://127.0.0.1:5173`.
2. Fix any UI/content issues found during browser review.
3. Decide whether to move the repo from bootstrap to operating mode after acceptance.

## Active Blockers

- StateDD Python validation scripts remain blocked because Python is not available as `python`, `python3`, or `py`.
- Node/npm were installed, but this shell required direct PATH injection for npm scripts.

## Notes

- Keep `STATUS.md` short.
- Use `PROJECT_STATE.yaml` for structured truth.
- Use `BACKLOG.md` backlog IDs inside `NEXT_ACTIONS.md` when active items are added.
- Prove runtime identity before accepting user-facing behavior.
