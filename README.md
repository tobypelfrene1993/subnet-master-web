# Subnet Master

Subnet Master is a modern frontend-only subnetting learning and calculation website for IT Network and System Administration students.

It runs completely in the browser. There is no backend, no database, and no login.

## Features

- Dashboard with quick access to every subnetting tool.
- IPv4 calculator for network address, broadcast address, host range, subnet mask, wildcard mask, totals, usable hosts, block size, and step-by-step formula breakdown.
- VLSM calculator with original order, optimized largest-first allocation, random display order, and per-subnet CIDR formula explanation.
- CIDR Wizard that recommends the smallest fitting CIDR for a required host count.
- Practice Mode with random subnetting questions and instant feedback.
- Exam Mode with timed quizzes, scoring, final results, and wrong-answer review.
- CIDR cheat sheet from `/16` through `/32`.
- Visual Network View for VLSM blocks and standalone subnet visualization.
- Help tooltips for important subnetting terms.
- Polished dark professional Cisco/network-engineering style UI.
- Responsive layout for laptops first, with tablet and mobile support.

## Tech Stack

- React
- TypeScript
- Vite
- TailwindCSS
- Vitest

## Run Locally On Windows

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the local URL shown by Vite, normally:

```text
http://127.0.0.1:5173
```

If Vite prints `http://localhost:5173`, that is also correct for local browser testing on the laptop.

## Update GitHub After Changes

To update GitHub after changes, double-click:

```text
push-to-github.bat
```

## Share With Classmates Through Ngrok

Use this when you want to run Subnet Master on your Windows laptop and share a public temporary link with classmates.

Start the Vite dev server and allow external connections:

```bash
npm run dev -- --host 0.0.0.0
```

Open a second PowerShell window. Keep the first PowerShell window open.

Start ngrok:

```bash
ngrok http 5173
```

Copy the public forwarding URL from ngrok, for example:

```text
https://random-name.ngrok-free.app
```

Share that ngrok URL with classmates.

Keep both PowerShell windows open while classmates are using the site.

## Optional Local Network Testing

To test from another device on the same Wi-Fi or LAN, start Vite with:

```bash
npm run dev -- --host 0.0.0.0
```

Then open the network URL shown by Vite from the other device, if Windows Firewall and your network allow it.

## Ngrok Troubleshooting

- If `npm` is not recognized, open a new PowerShell window so the Node.js PATH refreshes.
- If PowerShell blocks `npm.ps1`, run the same command with `npm.cmd`, for example `npm.cmd run dev -- --host 0.0.0.0`, or use Command Prompt.
- If `ngrok` is not recognized, install ngrok or add it to PATH.
- If classmates cannot open the link, verify the Vite server and ngrok are both running.
- Keep the laptop turned on while sharing.
- Do not close the PowerShell windows running Vite or ngrok.
- Free ngrok URLs can change every time ngrok restarts.
- If ngrok shows a public URL but the page does not load, restart Vite with `npm run dev -- --host 0.0.0.0` and restart `ngrok http 5173`.

## Production Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The preview server normally opens at:

```text
http://127.0.0.1:4173
```

## Test

```bash
npm test
```

Tests cover IPv4 parsing, CIDR masks, wildcard masks, network/broadcast calculations, first and last hosts, usable host counts, CIDR recommendations, VLSM allocation/no-overlap behavior, base-network-too-small errors, and quiz answer checking.

## Project Structure

```text
src/
  components/  Reusable UI panels, tooltips, stat grids, subnet block cards
  data/        Term definitions and static learning data
  lib/         Browser-safe subnet, VLSM, and quiz logic
  pages/       Website sections
  tests/       Vitest test suite
  types/       Shared TypeScript types
```

Core calculation logic is separated from the UI:

- `src/lib/subnet.ts`
- `src/lib/vlsm.ts`
- `src/lib/quiz.ts`

## Future Hosting Options

Subnet Master is ready to become a hosted static website later. Good options include:

- Vercel
- Cloudflare Pages
- Static files served from a VPS or web server
- Temporary self-hosted sharing through ngrok during classes or demos

The production output is generated into `dist/` by `npm run build`.

## Future PWA/Webapp Plan

The current app includes a basic `public/manifest.webmanifest` so future PWA work has a defined place to start.

Future PWA work can add:

- Installable app icon assets in `public/icons/`
- Offline cache/service worker
- Cache-first strategy for static assets
- Optional saved local practice progress using browser storage

PWA/offline behavior is intentionally not implemented yet; the first priority is a polished local website.
