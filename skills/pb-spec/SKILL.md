---
name: pb-spec
description: "Living product spec for a PB Slim app. Writes, never builds."
license: MIT
metadata:
  author: sam23d
  version: "0.6.0"
---

# Spec

Persona: `pb-slim`. Stack and defaults: `pb-slim/references/stack.md`. Use when a PM says "users should be able to…", "we need…", "write the spec", or "what does the app do today". This skill writes; it **does not build**.

## 1. Discovery (before any spec)

Ask at most three questions. Fill the rest with defaults and state them.

1. **Who** is the first user (role), and what is the one job they hire the app for?
2. **Done when** — one sentence they could demo to a teammate.
3. **Out of scope for v1** — if they do not know, propose cuts.

Silent defaults: email + password, one user type, public page + signed-in installable app, files on the server disk, one region, online. Write them back: "I'm assuming X, Y, Z. Correct me in one line."

Do not ask about offline. Add an offline section only if they ask to work with no signal (section 3).

## 2. One living file

Save to `specs/<slug>.md` in the project, or where the user keeps docs. Iterate that file; never start a second spec for the same product. Template: `assets/spec-template.md`.

Write in **Simplified Technical English** (ASD-STE100 style): one short sentence, one instruction per line. Active voice, present tense. Simple words; the same thing said the same way every time. Max ~20 words a sentence. No noun stacks — use a short verb phrase. One meaning per word.

## 3. Data: online, with one exception

Screens read and write PocketBase directly. One acceptance test: do the happy path, refresh, the change is still there. A write the server refuses: the user goes back to the old value and a short message says why. Typed text is never dropped.

**Only if they asked to work with no signal:** add a section **Offline** with phase 1 (works on the device, airplane-mode test), phase 2 (sync, conflict rule in plain words, two-device test), and the screens that stay online-only and why. Recipe and tests: `pb-build/references/offline-first.md`. Do not add this section "just in case."

## 4. Live screens: a per-screen decision

Every screen is **static** unless the spec marks it **Live**. A refresh shows new data on a static screen. A Live screen updates by itself while it is open.

Mark a screen Live only when **someone else changes that data while the user is looking at it**: a shared list, a board, a chat, a lobby, a "who is here" strip. My own items, settings, reports, and anything one person edits alone stay static. If you cannot name who else writes it, it is static.

For each Live screen, the spec says:

- **Watches:** the one collection (or the one record) the screen shows, and the filter. One screen, one subscription.
- **Who else writes it:** the role, in words.
- **Test:** two sessions, two members. A changes it. B sees it without touching the page, within a second. Then B reloads and sees the same thing.

Presence ("who is online"), typing, and cursors are not rows. They are a **live signal**, not saved data. Name them as such; the build uses a different mechanism and nothing is stored.

Say the product cost once in Risks: a Live screen needs the server awake, so it will not sleep to save money.

**Public pages.** A screen is Public only when the spec says anyone may open it without signing in and search engines may index it: landing, pricing, a shareable record page. A Public page shows only the fields the spec lists as public. Everything else needs sign-in. A signed-in page cannot be indexed; if they need that, say so and stop.

## 5. PM half (first in the file)

1. **Name + one-liner** — what this is.
2. **v1 (floor)** — the smallest demo loop. Numbered clicks, starting from the Install button. Time-to-demo target (e.g. 10 minutes).
3. **Look & feel** — 3 words, one thing it must not look like, one signature element only this product has (`pb-design`).
4. **Later (ceiling)** — wanted, but must not block v1. Each item: why it can wait; what v1 must not paint into a corner.
5. **Who** — roles (visitor, member, staff). What each may see and do, in verbs.
6. **Screens** — one line each: name, who looks at it, **Public** (no sign-in, search engines may index it) or signed-in, **static** or **Live** (with watches / who else writes it).
7. **Happy path** — 5–12 user-visible steps.
8. **Not now** — explicit cuts (payments, invites, store listings, …).
9. **Risks in product language** — "if we turn the server off, you cannot save"; Live screens freeze if the server sleeps.
10. **Acceptance** — one test a teammate with no repo can follow and say pass/fail, plus the two-session test for each Live screen.
11. **Open questions** — max 5, each with your recommended answer.

## 6. Build notes (short appendix, last)

- Collections and fields for v1 only.
- Who can read/write each collection, in role words, then the rule.
- Screens and files to add.
- Install: the starter's service worker caches the shell + `vendor/`; manifest + Install button. The shell opens with no signal. That is not a data test.
- Live: for each Live screen, the subscription (collection or record, filter) and the rule that gates it. Live signals (presence, typing): the topic name, who may hear it. Nothing else subscribes.
- Public pages: static file, or written by a hook from which collection, and the list of public fields.
- Automations (email, webhook) only if v1 dies without them.
- Photos: on disk vs bucket; backups separate.
- Bite-sized tasks with file paths.

**v1 quality bar:** if a section does not change what the user can *do* in the demo, it belongs in Later or Not now.

## 7. A new feature on a living spec

- Add it as a new numbered section in the same file ("11. Feature: Teams"). Never a second spec.
- The section holds: what it is, demo loop, rules, screens (static or Live), acceptance, later, not now.
- Mark the section's state in its heading and in the file's status: SPEC → approved → built. Write "not checked yet" next to any acceptance step that has not run on the current release.
- Record decisions with the default in **Decisions** (e.g. "4 per team; join goes to the smaller team").

## 8. After saving

5–8 line chat summary, the file path, then: "Want me to build v1, or change the cuts?" **Do not build.**

## Other spec shapes

- **As-built PRD** ("what does the app do today?"): `references/as-built-prd.md`.
- **Restyle / redesign**: `references/restyle.md`.
