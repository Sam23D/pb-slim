---
name: pb-spec
description: "Living product spec for a PB Slim app. Writes, never builds."
license: MIT
metadata:
  author: sam23d
  version: "0.4.0"
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

Screens read and write PocketBase directly. One acceptance test: do the happy path, refresh, the change is still there. A screen that should update live gets one sentence ("this list updates by itself"). A write the server refuses: the user goes back to the old value and a short message says why. Typed text is never dropped.

**Only if they asked to work with no signal:** add a section **Offline** with phase 1 (works on the device, airplane-mode test), phase 2 (sync, conflict rule in plain words, live updates on shared screens, two-device test), and the screens that stay online-only and why. Recipe and tests: `pb-build/references/offline-first.md`. Do not add this section "just in case."

## 4. PM half (first in the file)

1. **Name + one-liner** — what this is.
2. **v1 (floor)** — the smallest demo loop. Numbered clicks, starting from the Install button. Time-to-demo target (e.g. 10 minutes).
3. **Look & feel** — 3 words, one thing it must not look like, one signature element only this product has (`pb-design`).
4. **Later (ceiling)** — wanted, but must not block v1. Each item: why it can wait; what v1 must not paint into a corner.
5. **Who** — roles (visitor, member, staff). What each may see and do, in verbs.
6. **Happy path** — 5–12 user-visible steps.
7. **Not now** — explicit cuts (payments, invites, store listings, …).
8. **Risks in product language** — "if we turn the server off, you cannot save"; live lists freeze if the server sleeps.
9. **Acceptance** — one test a teammate with no repo can follow and say pass/fail.
10. **Open questions** — max 5, each with your recommended answer.

## 5. Build notes (short appendix, last)

- Collections and fields for v1 only.
- Who can read/write each collection, in role words, then the rule.
- Screens and files to add.
- Install: the starter's service worker caches the shell + `vendor/`; manifest + Install button. The shell opens with no signal. That is not a data test.
- Live updates: only the named screens.
- Automations (email, webhook) only if v1 dies without them.
- Photos: on disk vs bucket; backups separate.
- Bite-sized tasks with file paths.

**v1 quality bar:** if a section does not change what the user can *do* in the demo, it belongs in Later or Not now.

## 6. A new feature on a living spec

- Add it as a new numbered section in the same file ("11. Feature: Teams"). Never a second spec.
- The section holds: what it is, demo loop, rules, screens, acceptance, later, not now.
- Mark the section's state in its heading and in the file's status: SPEC → approved → built. Write "not checked yet" next to any acceptance step that has not run on the current release.
- Record decisions with the default in **Decisions** (e.g. "4 per team; join goes to the smaller team").

## 7. After saving

5–8 line chat summary, the file path, then: "Want me to build v1, or change the cuts?" **Do not build.**

## Other spec shapes

- **As-built PRD** ("what does the app do today?"): `references/as-built-prd.md`.
- **Restyle / redesign**: `references/restyle.md`.
