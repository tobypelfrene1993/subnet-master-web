# subnetweb Status

**Updated At:** 2026-06-08
**Execution Mode:** bootstrap
**Project State:** functional_frontend_verified
**Public URL:** local only: http://127.0.0.1:5173

## Snapshot

- Subnet Master is now a frontend-only React + TypeScript + Vite + TailwindCSS website.
- The app includes IP Calculator, VLSM Calculator, CIDR Wizard, Practice Mode, Exam Mode, Cheat Sheet, and Visual Network View.
- The Dashboard, header, panels, forms, and tables received visual polish; IP/VLSM results now include formula explanations.
- Core subnet, VLSM, and quiz logic lives under `src/lib/` and is covered by Vitest tests.
- `npm test` passed: 13 tests across 3 files.
- `npm run build` passed; latest local dev runtime returned HTTP 200 with `Subnet Master` content at `http://127.0.0.1:5173`.

## Immediate Priorities

1. For class sharing, run `npm run dev -- --host 0.0.0.0`, then `ngrok http 5173` in a second PowerShell window.
2. Browser-review the polished UI and formula explanations; capture screenshot/evidence if accepted.
3. Decide whether to move the repo from bootstrap to operating mode after acceptance.

## Active Blockers

- StateDD Python validation scripts remain blocked because Python is not available as `python`, `python3`, or `py`.
- Node/npm were installed, but this shell required direct PATH injection for npm scripts.

## Notes

- Keep `STATUS.md` short.
- Use `PROJECT_STATE.yaml` for structured truth.
- Use `BACKLOG.md` backlog IDs inside `NEXT_ACTIONS.md` when active items are added.
- Prove runtime identity before accepting user-facing behavior.
