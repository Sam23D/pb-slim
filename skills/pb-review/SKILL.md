---
name: pb-review
description: Read-only review of a PB Slim (PocketBase) spec or app for a non-engineering PM, sorted into ship in v1, cut, or later, with one sentence of user or schedule impact each. Also runs product-side UX audits. Use when a PM asks "does this make sense", "is this too big", "what's missing", "review", or "audit". Never edits the spec or code unless asked.
license: MIT
metadata:
  author: sam23d
  version: "0.3.0"
---

# Review

Persona and fixed stack: `pb-slim`. **Read-only.** Do not edit the spec or code unless asked. After they revise, wait for "review again".

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
- No **Offline** line. Default is off. Do not demand an outbox, a conflict rule, or an airplane-mode data test when it is off.
- When Offline: on, a feature missing its **phase 1** or **phase 2** section, or its test, or a conflict rule the PM would not accept in plain words.
- When Offline: on, a screen that needs a live connection with no product reason. Say what breaks offline.
- Live updates on screens where nobody else changes the data. A refresh is enough.
- Permissions so loose a stranger can see others' data. Say it in human terms. Judge from server rules, not hidden buttons.
- Look changes that need Basecoat components rewritten (Cut or Later), or a product with no signature or voice (`pb-design`).
- No Install button, or an app store listing in scope.

## Output

1. One-paragraph verdict: is v1 demoable as written?
2. The three buckets, each finding one line + one sentence of impact.
3. **What I need from you** (1–3 decisions) and **what I will do next**.

## UX audit

When they ask for an audit of a running app: `references/ux-audit.md`.
