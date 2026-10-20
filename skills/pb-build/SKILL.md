---
name: pb-build
description: Scaffold and build PB Slim apps on one PocketBase process with plain HTML/JS, Basecoat UI, and an installable PWA. Default build talks to PocketBase directly. If the spec says Offline: on, build phase 1 (IndexedDB and an outbox, tested in airplane mode) before phase 2 (sync, conflict rule, realtime). Use when a PM says "start a blank app", "build it", "implement", or "ship v1", or when writing PocketBase hooks, rules, or realtime code.
license: MIT
metadata:
  author: sam23d
  version: "0.3.0"
---

# Build

Persona and fixed stack: `pb-slim`. Build **only** what the approved spec calls v1, or the approved feature section. No file under `pb_hooks/`, `pb_migrations/`, or `pb_public/` before the yes: a running local server applies them on save.

Read the request before writing data code. Online is the default. Do not add IndexedDB, an outbox, or an offline banner unless they asked to work with no signal.

## New app — done when a PM can click

1. Start one PocketBase process with `pb_public/`, `pb_hooks/`, `pb_migrations/` from the project (`references/local-dev.md`). Never start a second process for another app.
2. Copy the starter files from `assets/` into `pb_public/`: `index.html`, `manifest.webmanifest`, `sw.js`, `js/install.js`. Those files are online-only. Do **not** copy `js/outbox.js`, and do not add a script tag for it, until they ask for offline. Vendor into `pb_public/vendor/` from the npm tarball, never a CDN: PocketBase JS SDK **0.28.1** (`dist/pocketbase.umd.js`), Basecoat **1.0.2**, Tailwind browser build **4.3.3**. Uncomment the matching lines in `index.html` and `sw.js` after the copy. Recipe: `pb-design/references/basecoat.md`.
3. Prove it: the page loads, the **Install app** button works, the installed app opens in airplane mode (the shell; there is no product data yet).
4. Reply in everyday words: the URL, how to install, how to create the first admin (`/_/`), and "Tell me the first user and the first job, and I'll write the v1 spec."

README in human steps: start, open, install, admin, "data is saved on this machine; don't delete the data folder."

## Build v1

0. **Look first, briefly.** If there is no `DESIGN.md`, run `pb-design` (theme pick in one line). Do not block on polish.
1. **Default — online.** Collections and rules (migrations), screens on Basecoat, data through the PocketBase JS SDK (not `Local` / `outbox.js`). Service worker caches the shell + vendor. Install button stays.
   - Prove the acceptance yourself **online**: do the happy path, refresh, the data is still there.
   - Prove the shell: Install button works, and the installed app opens with the network off. Data may be empty. That is expected.
   - Do not write outbox or IndexedDB code.
2. **Only if they asked to work with no signal.** Follow `references/offline-first.md`. Copy `js/outbox.js` and add its script tag then, not before.
   - **Phase 1 — offline.** Data through `Local` in `outbox.js`. Prove the phase 1 acceptance yourself with the network **off** (DevTools offline or airplane mode on the installed app). Reload while offline; data must still show.
   - Report: "Phase 1 passes offline. Try it: …. Start phase 2 (sync + live)?" **Wait for yes.**
   - **Phase 2 — online.** Outbox flush on reconnect, pull, the spec's conflict rule, realtime on shared screens. Recipes: `references/offline-first.md` (sync) and `references/realtime.md`.
   - Prove the two-device test yourself: two browsers, two members; one goes offline, edits, reconnects; both match; a change on A appears on B without refresh.
   - Use a separate browser session per person, and run each multi-step flow in one call. If a session comes back blank, reopen it and recreate the state; do not reuse old ids.
   - After any client change, check that an already-open tab moves to the new release by itself before you blame sync.
3. **Demo script.** Online: install, do the job, refresh, expect the save. Say that the installed app opens with no signal, and edits need a connection. If they asked for offline: install, turn off wifi, click that, turn wifi on, expect this. Mention admin vs member if both exist.
4. **Git (only if they use git).** When done, propose one batch of commits split by concern that covers every changed file. Wait for approval, then commit. No push unless asked.

Report a step as passed only from a run on the current release. Say "not checked yet" for the rest.

If v1 cannot be demoed without a product decision, stop and ask. Never guess a payment provider, email vendor, or branding.

Ceiling items are a TODO comment at most.

## Server rules and hooks

- Permissions go in collection rules first. Hooks only for email, webhooks, derived rows, or "after signup do X".
- PocketBase JS hook pitfalls (helpers, rule re-apply, delete hooks, 404 vs 403): `references/pocketbase-jsvm.md`.
- Rules are the lock, not the UI. A hidden button protects nothing.

## Verification

- No `package.json` / bundler for the frontend. One PocketBase process. SQLite on disk.
- Installed app opens with no signal (the shell). Install button visible on the site. No store listing.
- Unless they asked for offline, screens call PocketBase. `outbox.js` is not copied and not wired in.
- If they asked for offline, phase 1 passed offline before any phase 2 code.
- Every vendor file is local and in the service worker cache list.
