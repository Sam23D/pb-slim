---
name: pb-audit
description: "Security audit of a PB Slim app: rules, files, hooks, leaks."
license: MIT
metadata:
  author: sam23d
  version: "0.5.0"
---

# Security audit

Persona: `pb-slim`. Stack: `pb-slim/references/stack.md`. Use when someone asks "is this safe", "who can see this", "security", "credentials", or "does the client leak". **Read-only.** Do not edit the spec or code unless asked. This is not the product review (`pb-review`).

Say what a stranger, another member, or the browser can see. One sentence of harm each. Do not print a secret, token, or password you found. Name the file and the kind of secret, and redact the value.

**Say only what you saw.** Report a check as passed only if you ran it on the current app. Otherwise say "not checked yet" and how to check it.

## What to read

1. Collection rules in `pb_migrations/` and any `pb_hooks` file that sets rules on boot. The boot hook wins. If they disagree, the hook is the truth.
2. Every file the browser can load: `pb_public/` (HTML, JS, CSS, the service worker, `vendor/`). Also search the repo for files that would be copied into a release.
3. JS hooks and custom routes. Hooks run as a superuser. A route that sends those records to the browser skips the rules.
4. Cheat sheet, search list, and the two-client proof: `references/checks.md`.

## Prove it, do not trust the screen

A hidden button is not a lock. Run the two-client proof in `references/checks.md` against a running server: a guest (no token) and a second member. For each sensitive collection, try list, view, create-as-someone-else, update of `owner` / `role` / `email`, and the file URL.

- List rule miss: **200 and an empty list**, not an error. An empty list is not proof the rule is locked.
- View, update, delete miss: **404**. Locked (`null`, superuser only): **403**.

If you cannot run the two clients, say "not checked yet". Do not call the rules safe from reading them alone when the finding would block a share.

## Always flag

- A rule of `""` (anyone, including guests) on a collection that holds private rows, emails, phones, notes, or files. `null` is locked. An expression is a filter. People mix these up.
- Create that does not pin the owner: `@request.body.owner = @request.auth.id` (use the real field name). Anyone can write the row as someone else.
- Update that lets the client change `owner`, `role`, `email`, or a staff flag. Require `:changed = false` (or `:isset = false`) on that field.
- `manageRule` set so one user can change another user's email or password, unless the spec says a staff member may.
- A custom field named like a secret (`password`, `pin`, `token`, `secret`, `api_key`). It is returned with the record whenever list or view allows it. Auth passwords are not. Custom text fields are.
- A `file` field that is not **Protected**, when the file is private (receipt, ID, contract, medical note). Knowing the URL is enough. A tight view rule does **not** hide an unprotected file. Public avatars may stay unprotected. Say which.
- Protected files whose view rule is `""`. The protected flag does nothing then.
- A secret in a file the browser loads: superuser or admin password, SMTP or S3 or host token, OAuth client secret, Turnstile **secret**, `_superusers` sign-in, a literal `authWithPassword("…", "…")`. A Turnstile **site** key is public. The signed-in user's own SDK token in localStorage is normal. Do not flag those two.
- The service worker caching `/api/` or `/_/`, including `/api/files/`.
- A hook or custom route that loads records with the app (superuser) and returns them to the client without checking that caller's rule.
- Expand or a roster call that returns another member's email, phone, or secret field. Prove it with member B's token. Do not assume a field is hidden.
- When they asked for offline: a pull or outbox that keeps other people's private rows on the device, or that keeps them after sign-out on a shared phone.

## Output

1. One paragraph: can a stranger or another member see something they should not, or is a secret in the client?
2. A table: **What** | **Who can see it** | **Why it matters** | **Fix in one line**.
3. Secrets: file path and kind only. Value redacted.
4. **Not checked yet**, with the one command or click that would check it.
5. **What I need from you** (1–3 decisions) and **what I will do next**.

Do not fix in the same turn. Wait until they ask.
