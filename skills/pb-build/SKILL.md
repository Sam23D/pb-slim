---
name: pb-build
description: "Scaffold and build a PB Slim app with the PocketBase SDK."
license: MIT
metadata:
  author: sam23d
  version: "0.6.0"
---

# Build

Persona: `pb-slim`. Stack: `pb-slim/references/stack.md`. Use when a PM says "start a blank app", "build it", "implement", or "ship v1", or when writing PocketBase migrations, rules, hooks, or realtime code.

Build **only** what the approved spec calls v1, or the approved feature section. No file under `pb_hooks/`, `pb_migrations/`, or `pb_public/` before the yes: a running local server applies them on save.

**Say only what you saw.** Report a step as passed only from a run on the current release. Otherwise say "not checked yet" and how to check it. If you overstated earlier, correct it before the next action.

## New app — done when a PM can click

1. Start one PocketBase process with `pb_public/`, `pb_hooks/`, `pb_migrations/` from the project (`references/local-dev.md`). Never start a second process for another app.
2. Copy the starter into `pb_public/`: `index.html`, `manifest.webmanifest`, `sw.js`, `css/`, `js/install.js`, `js/app.js`, `icons/`, and `vendor/`. The pinned libraries are already inside. Do not re-download them. Do **not** copy `js/outbox.js`. Pins and checksums: `assets/vendor/VERSIONS.json`.
3. Prove it: the page loads, the **Install app** button works, the installed app opens in airplane mode (the shell; there is no product data yet).
4. Reply in everyday words: the URL, how to install, how to create the first admin (`/_/`), and "Tell me the first user and the first job, and I'll write the v1 spec."

README in human steps: start, open, install, admin, "data is saved on this machine; don't delete the data folder."

## Build v1

0. **Look first, briefly.** If there is no `DESIGN.md`, run `pb-design` (theme pick in one line). Do not block on polish.
1. **Collections and rules** as migrations (`references/migrations.md`). Rules are the lock, not the UI. The list rule also decides who receives live events for that collection.
2. **Screens** on Basecoat, one HTML file per screen with plain links between them, no client router (`references/pages.md`). Data through the PocketBase JS SDK (`references/data.md`). Every screen renders through one `render(rows)` that patches by `data-id`, whether or not it is Live. Public pages are static files, or files a hook writes.
3. **Live screens**, only the ones the spec marks Live (`references/realtime.md`). One subscription per screen, filtered to what it shows, gated by the rule, subscribed before the first load, unsubscribed on leave, reloaded on `PB_CONNECT`. Live signals (presence, typing) are a custom topic sent from a hook, never a collection. A screen the spec left static gets no subscription, even if it would be easy.
4. **Prove the acceptance yourself, online:** do the happy path, refresh, the data is still there. For each Live screen, run the two-session test from the spec: A changes it, B sees it without touching the page. Prove the shell: Install button works, and the installed app opens with the network off. Data may be empty then. That is expected.
5. **Demo script.** Install, do the job, refresh, expect the save. For a Live screen: open it on two devices, change it on one, watch the other. Say that the installed app opens with no signal, and edits need a connection. Mention admin vs member if both exist.
6. **Git (only if they use git).** When done, propose one batch of commits split by concern that covers every changed file. Wait for approval, then commit. No push unless asked.

If v1 cannot be demoed without a product decision, stop and ask. Never guess a payment provider, email vendor, or branding. Ceiling items are a TODO comment at most.

**Offline, only if they asked to work with no signal:** `references/offline-first.md` owns it — the outbox file, phase 1, the wait for a yes, phase 2, and both tests. Do not start it from memory.

## Server rules and hooks

- Permissions go in collection rules first. Hooks only for email, webhooks, derived rows, or "after signup do X".
- PocketBase JS hook pitfalls (helpers, rule re-apply, delete hooks, 404 vs 403): `references/pocketbase-jsvm.md`.

## Verification

- No `package.json` / bundler for the frontend. One PocketBase process. SQLite on disk.
- One HTML file per screen, each in the service worker `SHELL`. No client router. No server template engine.
- Installed app opens with no signal (the shell). Install button visible on the site. No store listing.
- Screens call PocketBase. `outbox.js` is not copied and not wired in, unless they asked for offline.
- Only the screens the spec marks Live subscribe. Each has one filtered subscription, unsubscribes on `pagehide`, and reloads on `PB_CONNECT`. No `'*'` subscribe without a filter.
- Every vendor file is local and in the service worker cache list.
