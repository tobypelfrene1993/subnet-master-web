# EVIDENCE_LOG.md

**Purpose:** Structured ledger of proof artifacts for user-facing claims.

## Entry Format

```yaml
- ID: EV-YYYY-MM-DD-001
  File: /absolute/path/to/artifact.png
  Title: short description
  Source/System: browser | api | test | log | screenshot
  Route/Page: optional route or URL
  Action: what was done
  Shows:
    - visible fact 1
    - visible fact 2
  Proves:
    - why the artifact matters
  Type: source-data | chatbot | gap | integration | docs-render-verification
  as_of: 2026-03-18T18:00:00+01:00
  Notes: optional context
```

## Guidance

- Link evidence to the specific claim it supports.
- Prefer durable artifact paths.
- Place saved artifacts under `docs/evidence/YYYY-MM-DD-<slug>/` when possible.
- Add timestamps for anything that may become stale.

## EV-2026-06-08-001: Fresh template checkout bootstrap setup

```yaml
- ID: EV-2026-06-08-001
  File: inline session/tool output
  Title: Fresh StateDD template checkout initialized for subnetweb
  Source/System: git and shell output
  Action: cloned corrected public template URL, removed template git metadata, initialized fresh git repo, attempted Python validation
  Shows:
    - requested URL `https://github.com/lennertvhoy/StateDD_Templat` returned 404
    - corrected URL `https://github.com/lennertvhoy/StateDD_Template` was public and cloned
    - fresh local git repo reports `No commits yet on main`
    - `python scripts/check_state_docs.py` is blocked because Python is not available on PATH
  Proves:
    - this workspace is no longer using the cloned template git history
    - bootstrap mode is started, but Python-based validation remains blocked
  Type: source-data
  as_of: 2026-06-08
  Notes: No application runtime exists in the template checkout.
```

## EV-2026-06-08-002: Subnet Master local frontend verification

```yaml
- ID: EV-2026-06-08-002
  File: inline session/tool output
  Title: Subnet Master tests, build, and local dev server verification
  Source/System: npm, vite, HTTP request
  Route/Page: http://127.0.0.1:5173
  Action: installed dependencies, ran Vitest, ran production build, started Vite dev server, requested local URL
  Shows:
    - `npm install` added 191 packages and reported 0 vulnerabilities
    - `npm test` passed 13 tests across 3 test files
    - `npm run build` completed successfully and emitted `dist/`
    - local Vite dev server returned `HTTP 200 OK`
    - response content contained `Subnet Master`
  Proves:
    - the frontend project is installable and buildable on this Windows machine
    - core subnetting logic test suite passes
    - the local browser-test URL is serving the Subnet Master app
  Type: docs-render-verification
  as_of: 2026-06-08
  Notes: The running local process is a Vite development server on port 5173.
```

## EV-2026-06-08-003: Ngrok-ready local hosting verification

```yaml
- ID: EV-2026-06-08-003
  File: inline session/tool output
  Title: Subnet Master prepared for ngrok sharing from Windows
  Source/System: npm, Vite, grep, HTTP request
  Route/Page: http://localhost:5173 and http://127.0.0.1:5173
  Action: updated Vite host handling, added ngrok README instructions, started local and host-exposed dev servers, ran tests and build
  Shows:
    - `npm install` completed with 0 vulnerabilities
    - plain `npm run dev` served `Subnet Master` with HTTP 200
    - `npm run dev -- --host 0.0.0.0` served `Subnet Master` with HTTP 200 and printed network URLs
    - source/config search found no hardcoded `localhost` or `127.0.0.1` URLs in app source/config files
    - `npm test` passed 13 tests across 3 files
    - `npm run build` completed successfully
  Proves:
    - the app can run locally and in Vite host-exposed mode for ngrok forwarding
    - the current frontend does not depend on local-only source URLs
  Type: integration
  as_of: 2026-06-08
  Notes: ngrok itself was documented but not started; use `ngrok http 5173` after starting Vite with `--host 0.0.0.0`.
```

## EV-2026-06-08-004: Visual polish and formula explanation verification

```yaml
- ID: EV-2026-06-08-004
  File: inline session/tool output
  Title: Subnet Master polished UI and formula explanations verified by tests, build, and HTTP runtime
  Source/System: npm, TypeScript/Vite, HTTP request
  Route/Page: http://127.0.0.1:5173
  Action: updated React/Tailwind UI, added IP Calculator formula cards and VLSM formula explanations, ran tests/build, started Vite dev server, requested local URL, stopped runtime
  Shows:
    - `npm test` passed 13 tests across 3 files
    - `npm run build` completed successfully
    - local Vite dev server returned `HTTP 200 OK`
    - response content contained `Subnet Master`
    - port 5173 was stopped after verification
  Proves:
    - the updated frontend compiles and passes the existing subnet/VLSM/quiz tests
    - the local runtime served the Subnet Master app from this repo after the UI/formula slice
  Type: docs-render-verification
  as_of: 2026-06-08
  Notes: Browser screenshot acceptance is not captured because no browser/screenshot tool is available in this session.
```
