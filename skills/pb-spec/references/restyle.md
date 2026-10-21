# Restyle or redesign spec

Use when the PM wants an existing app to look different. A restyle is a spec first; never start on the screens.

## Shape

The PM half from `pb-spec`, plus:

1. **Look & feel** — 3 words, one thing it must not look like, the signature idea. Personality rules: `pb-design`.
2. **Today → After** — one table row per screen: what it shows today, what changes, what stays. Keep every `id`, `name`, and `data-*` the screen JS reads.
3. **What does not change** — a plain list: data, rules, URLs, the demo loop. A restyle must not change what a user can do.
4. **Pilot** — 3 high-traffic screens first. Stop for the PM's look. Then the rest.
5. **Regression check** — the demo script, the story list from the last UX audit, phone width, keyboard.

## Build notes

- `theme.css` from the picked theme (`pb-design`). `app.css` only for the signature.
- Mark migrated pages `<html data-ui="basecoat">` while two looks coexist. Rollout pitfalls: `pb-design/references/basecoat.md`.
- One commit batch at the end, split by screen group.
