---
name: pb-deploy
description: Put a PB Slim (PocketBase) app online and explain it to a non-engineering PM in product terms — one always-on server with a persistent disk, HTTPS for the Install button, file storage vs backups in separate buckets, real email, monthly cost; or, for throwaway data, a test link per pull request with no production. Use when a PM says "put it online", "deploy", "host it", "let friends try it", "a link per PR", or asks about backups, photos storage, or uptime.
license: MIT
metadata:
  author: sam23d
  version: "0.2.0"
---

# Online

Persona and fixed stack: `pb-slim`. Technical detail: `references/hosting-and-storage.md` (production) and `references/pr-test-links.md` (a test link per pull request).

## First: which kind of online?

- **The data matters** (accounts, money, records people keep) → one production server. The rest of this file.
- **The data is throwaway** (a game match, a lobby, a demo) → no production. Every pull request gets its own test link, and the link goes away when the pull request closes. Section "Test links per pull request".

Say which one you picked and why, in one line. Mixed apps keep production for the real data.

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

## Test links per pull request

Explain it like this:

- **Every change gets its own link.** Open a pull request, mark it ready, and a bot comments **Play this PR:** with the link. Friends open it on their phones and install it from there.
- **A push updates the same link.** Open apps reload by themselves within a few seconds. Lobbies and data survive the push.
- **A broken change never reaches the link.** Tests run first. If they fail, the link keeps the last good version.
- **The link goes away when the change is done** (merged, closed, or back to draft). Its data goes with it. An app installed from that link stops working.
- **It sleeps when nobody uses it** and wakes in about a second, so it costs cents while you are not testing. This is fine here because nobody depends on it.
- **It is public but hidden from search engines.** No password: a password breaks join links and the Install button. Only for throwaway data.

You decide: host, workflow shape, branch names (`rc-<number>-<topic>`). Ask before anything billed or remote: the first test machine, creating the repo, pushing, setting the token.

Done when, on a real pull request (the drill in the reference):

- Draft: tests pass, no link. Ready: the link comment appears, two devices play.
- A visible change updates the same link; an open app reloads itself.
- A deliberately broken change fails the tests; the link keeps the old version.
- Back to draft, and close: the link is gone and nothing is left running. Check it, do not assume it.
- Reply with: the link, how to install from it, what happens on push and on close, the cost in words.

## Done when (production)

- The app opens on HTTPS, the Install button appears, the installed app opens in airplane mode.
- An admin can sign in. Password-reset email arrives in the inbox.
- A backup exists in its own bucket and the PM knows where.
- Reply with: the URL, how to sign in as admin, the monthly cost, and what never to delete.
