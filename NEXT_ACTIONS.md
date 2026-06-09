# NEXT_ACTIONS - Active Execution Queue

**Updated At:** 2026-06-08
**Execution Mode:** bootstrap
**Max Items:** 10

## Active Work

### P1 [BL-006] Browser-review Subnet Master locally

Owner: human + coding agent
Next: open `http://127.0.0.1:5173` and visually test the polished dashboard, IP/VLSM formula explanations, calculators, quiz modes, cheat sheet, and visual network view.
Exit: acceptance or specific UI/behavior issues are recorded with evidence.

### P2 [BL-008] Decide bootstrap-to-operating transition

Owner: human + coding agent
Next: after browser acceptance, decide whether the repo baseline is complete enough to switch from bootstrap to operating mode.
Exit: `AGENTS.md`, `PROJECT_STATE.yaml`, and `WORKLOG.md` are updated if the mode changes.

## Queue Rules

- Keep this file short.
- List only active, open work.
- Remove completed items immediately.
- Every active item must reference a backlog ID like `[BL-001]`.
- Include owner, next action, and exit criteria when items exist.
