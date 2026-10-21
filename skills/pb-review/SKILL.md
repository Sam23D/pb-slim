---
name: pb-review
description: "Product review of a PB Slim spec or app: ship, cut, later."
license: MIT
metadata:
  author: sam23d
  version: "0.5.0"
---

# Review

Persona: `pb-slim`. Stack: `pb-slim/references/stack.md`. Use when a PM asks "does this make sense", "is this too big", "what's missing", or "review". **Read-only.** Do not edit the spec or code unless asked. After they revise, wait for "review again". Who-can-see-this and credential leaks are `pb-audit`, not here.

## Three buckets only

| Bucket | Meaning |
|---|---|
| **Ship in v1** | Needed for the demo loop |
| **Cut** | Makes v1 late or breaks the stack ("must be in the App Store", "must be a React Native app", "must run on 12 servers") |
| **Later** | Good, and v1 still grows into it |

For each finding: **one sentence on why it matters to the user or the schedule**, not the framework.

## Always flag

- Two products hiding in one spec (split or cut).
- Staff-only tools mixed into the member happy path (separate them).
- An outbox, an offline banner, or phase 1 / phase 2 sections when nobody asked to work with no signal.
- When they did ask for offline: a feature missing a phase or its test, or a conflict rule the PM would not accept in plain words.
- A screen marked Live where nobody else changes the data while the user looks at it. A refresh is enough; make it static.
- A Live screen with no "watches" line or no two-session test.
- A screen that clearly shows other people's changes (a shared list, a board, a lobby) left static with no reason given. Say what the user will miss.
- Permissions so loose a stranger can see others' data. Name it, then point them at `pb-audit` for the proof.
- Look changes that need Basecoat components rewritten (Cut or Later), or a product with no signature or voice (`pb-design`).
- No Install button, or an app store listing in scope.

## Output

1. One-paragraph verdict: is v1 demoable as written?
2. The three buckets, each finding one line + one sentence of impact.
3. **What I need from you** (1–3 decisions) and **what I will do next**.

## UX audit

When they ask for an audit of a running app: `references/ux-audit.md`.
