---
name: pb-deploy
description: "Use for 'put it online', 'deploy', backups, email, uptime. One always-on server."
license: MIT
metadata:
  author: sam23d
  version: "0.8.0"
---

# Online

Persona: `pb-slim`. Stack: `pb-slim/references/stack.md`. Technical detail: `references/hosting-and-storage.md`. Use when a PM says "put it online", "deploy", "host it", or asks about backups, photos storage, or uptime.

One always-on server. Per-PR test links, sprites, and CI are not in this version. If they ask, say so and stop.

## Explain as product ops

- **One small computer that stays on.** Sleeping to save money breaks login and live lists.
- **The installed app still opens with no signal.** Edits need a connection unless they asked for offline.
- **Install needs HTTPS.** The Install button only appears on a real web address with a certificate.
- **Data lives on that computer's disk.** Photos can stay there until they get large; then a cloud bucket — the app still controls who sees them.
- **Backups are a second bucket**, not the same as photos.
- **Email** (password reset, magic link) needs a real mail service, or messages land in spam.

## You decide

- Pick the host (a single Fly.io machine with a volume, or a cheap VPS). Do not make the PM choose unless cost or risk differs. Fly: `assets/fly.toml` + the steps in `references/hosting-and-storage.md`.
- Tell them the **monthly ballpark** and the **one thing they must not delete** (the data disk).
- Never scale to more than one server. If they need that, the product is past this stack.
- Before you say "done", run the settings list in `references/hosting-and-storage.md` (name and URL, mail, backups, rate limits).

## Done when

- The app opens on HTTPS, the Install button appears, the installed app opens in airplane mode (the shell).
- An admin can sign in. Password-reset email arrives in the inbox.
- A backup exists in its own bucket and the PM knows where.
- Reply with: the URL, how to sign in as admin, the monthly cost, and what never to delete.
