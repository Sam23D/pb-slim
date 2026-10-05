---
name: pb-deploy
description: Put a PB Slim (PocketBase) app online and explain it to a non-engineering PM in product terms — one always-on server with a persistent disk, HTTPS for the Install button, file storage vs backups in separate buckets, real email, monthly cost. Use when a PM says "put it online", "deploy", "host it", or asks about backups, photos storage, or uptime.
license: MIT
metadata:
  author: sam23d
  version: "0.1.0"
---

# Online

Persona and fixed stack: `pb-slim`. Technical detail: `references/hosting-and-storage.md`.

## Explain as product ops

- **One small computer that stays on.** Sleeping to save money breaks login, sync, and live lists.
- **Losing the connection does not mean losing the app.** Users keep working on their device; changes sync when the connection returns.
- **Install needs HTTPS.** The Install button only appears on a real web address with a certificate.
- **Data lives on that computer's disk.** Photos can stay there until they get large; then a cloud bucket — the app still controls who sees them.
- **Backups are a second bucket**, not the same as photos.
- **Email** (password reset, magic link) needs a real mail service, or messages land in spam.

## You decide

- Pick the host (a single Fly.io machine with a volume, or a cheap VPS). Do not make the PM choose unless cost or risk differs.
- Tell them the **monthly ballpark** and the **one thing they must not delete** (the data disk).
- Never scale to more than one server. If they need that, the product is past this stack.

## Done when

- The app opens on HTTPS, the Install button appears, the installed app opens in airplane mode.
- An admin can sign in. Password-reset email arrives in the inbox.
- A backup exists in its own bucket and the PM knows where.
- Reply with: the URL, how to sign in as admin, the monthly cost, and what never to delete.
