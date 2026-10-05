---
name: pb-spec
description: Write or update the living product spec for a PB Slim (PocketBase) app — discovery in at most three questions, v1 floor vs later ceiling, two phases per feature (offline first, then sync and live updates), look and feel, acceptance per phase. Also writes as-built PRDs from existing code. Use when a PM says "users should be able to…", "we need…", "write the spec", or "what does the app do today". Never builds.
license: MIT
metadata:
  author: sam23d
  version: "0.1.0"
---

# Spec

Persona and fixed stack: `pb-slim`. This skill writes; it **does not build**.

## 1. Discovery (before any spec)

Ask at most three questions. Fill the rest with defaults and state them.

1. **Who** is the first user (role), and what is the one job they hire the app for?
2. **Done when** — one sentence they could demo to a teammate.
3. **Out of scope for v1** — if they do not know, propose cuts.

Silent defaults: email + password, one user type, public page + signed-in installable app, files on the server disk, one region, last write wins on sync conflicts. Write them back: "I'm assuming X, Y, Z. Correct me in one line."

## 2. One living file

Save to `specs/<slug>.md` in the project, or where the user keeps docs. Iterate that file; never start a second spec for the same product. Template: `assets/spec-template.md`.

Write in **Simplified Technical English** (ASD-STE100 style): one short sentence, one instruction per line. Active voice, present tense. Simple words; the same thing said the same way every time. Max ~20 words a sentence. No noun stacks — use a short verb phrase. One meaning per word.

## 3. Two phases for every feature (required)

- **Phase 1 — Offline.** The feature works fully on the device with no network: read, create, edit, delete. Changes save on the device and wait in an outbox. The screen shows "Saved on this device" for unsynced changes. **Test:** the installed app in airplane mode (or browser offline mode) passes the happy path.
- **Phase 2 — Online.** The outbox syncs to PocketBase when the connection returns. The spec names the **conflict rule** (default: last write wins per record — say who loses what). Screens that show shared data get live updates. **Test:** two devices; one goes offline, edits, comes back; both match. A change on device A appears on B without refresh.
- Phase 2 never starts before phase 1 passes. Phase 1 must not paint phase 2 into a corner: records get their final id on the device from day one.
- Name every screen that is an **exception** to offline-first (e.g. payment checkout) and why.

## 4. PM half (first in the file)

1. **Name + one-liner** — what this is.
2. **v1 (floor)** — the smallest demo loop. Numbered clicks, starting from the Install button. Time-to-demo target (e.g. 10 minutes).
3. **Phases** — what the user can do after phase 1 and after phase 2.
4. **Look & feel** — 3 words, one thing it must not look like, one signature element only this product has (`pb-design`).
5. **Later (ceiling)** — wanted, but must not block v1. Each item: why it can wait; what v1 must not paint into a corner.
6. **Who** — roles (visitor, member, staff). What each may see and do, in verbs.
7. **Happy path** — 5–12 user-visible steps.
8. **Not now** — explicit cuts (payments, invites, store listings, …).
9. **Risks in product language** — "if we turn the server off, live lists freeze"; "two people edit the same item offline: the last one to sync wins"; offline exceptions.
10. **Acceptance** — per phase. A teammate with no repo can follow it and say pass/fail.
11. **Open questions** — max 5, each with your recommended answer.

## 5. Build notes (short appendix, last)

- Collections and fields for v1 only.
- Who can read/write each collection, in role words, then the rule.
- Screens and files to add.
- Phase 1: IndexedDB stores, what the service worker caches (shell + `pb_public/vendor/`), outbox, manifest + Install button.
- Phase 2: sync order, conflict rule, which screens get live updates.
- Automations (email, webhook) only if v1 dies without them.
- Photos: on disk vs bucket; backups separate; photos taken offline wait in the outbox.
- Bite-sized tasks with file paths, grouped by phase.

**v1 quality bar:** if a section does not change what the user can *do* in the demo, it belongs in Later or Not now.

## 6. After saving

5–8 line chat summary, the file path, then: "Want me to build v1, or change the cuts?" **Do not build.**

## Other spec shapes

- **As-built PRD** ("what does the app do today?"): `references/as-built-prd.md`.
- **Restyle / redesign**: PM shape plus a screen-by-screen Today → After table, a "what does not change" list, and a pilot of 3 screens first. Personality rules: `pb-design`.
