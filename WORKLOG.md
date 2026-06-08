# WORKLOG

**Purpose:** Append-only history for completed work.

Use this file for dated session notes, verification summaries, and references to evidence artifacts.

## 2026-06-08 - Fresh template checkout initialized

- Cloned the public corrected repository URL `https://github.com/lennertvhoy/StateDD_Template` after the requested `StateDD_Templat` URL returned 404.
- Removed the cloned template `.git` directory and initialized a new local git repository in `C:\Users\Admin\opencode\new\subnetweb`.
- Confirmed the repo contract is in `bootstrap` mode.
- Attempted to run the template initializer and validation path, but local Python commands `python`, `python3`, and `py` were unavailable.
- Updated state files manually to record the initial bootstrap baseline and the Python blocker.

## 2026-06-08 - Subnet Master frontend implemented

- Built a complete frontend-only Subnet Master website using React, TypeScript, Vite, TailwindCSS, and Vitest.
- Added polished responsive sections for Dashboard, IP Calculator, VLSM Calculator, CIDR Wizard, Practice Mode, Exam Mode, CIDR Cheat Sheet, and Visual Network View.
- Implemented browser-safe subnet, VLSM, and quiz logic in `src/lib/subnet.ts`, `src/lib/vlsm.ts`, and `src/lib/quiz.ts`.
- Added Vitest coverage for IPv4 parsing, masks, subnet calculations, CIDR recommendations, VLSM allocation/no-overlap behavior, base-network-too-small errors, and quiz answer checking.
- Installed Node.js LTS with winget, installed npm dependencies, ran tests, ran production build, and verified the local dev site returned HTTP 200 at `http://127.0.0.1:5173`.

## 2026-06-08 - Ngrok self-hosting preparation

- Updated Vite scripts so `npm run dev -- --host 0.0.0.0` can expose the dev server for ngrok/local-network testing without fighting a hardcoded host flag.
- Added `server.allowedHosts: ['.ngrok-free.app']` in `vite.config.ts` for ngrok free-app forwarding URLs.
- Added README instructions for Windows ngrok sharing, optional local-network testing, and troubleshooting.
- Verified no app/config source files contain hardcoded `localhost` or `127.0.0.1` URLs.
- Verified `npm install`, plain `npm run dev`, ngrok-ready `npm run dev -- --host 0.0.0.0`, `npm test`, and `npm run build`.
