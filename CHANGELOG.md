# Changelog

## 0.4.0 — 2026-10-20

One release number for the whole pack from here on.

- Every skill description is one short sentence with the trigger first. The "use when" phrases moved into each body.
- `pb-slim`: the fixed stack, defaults, and "things this stack is not" moved to `references/stack.md`. The router is shorter.
- `pb-spec`: no Offline line on a normal spec. The offline section is added only when they ask, and its recipe lives in `pb-build`. New `references/restyle.md`.
- `pb-build`: new `references/data.md` (PocketBase SDK, the default) and `references/migrations.md` (one collection, five rules). The offline branch moved out of the skill body into `offline-first.md`, which now owns setup, phase order, both tests, and the demo script. `realtime.md` shows the online client first; the `Local` variant is marked offline-only. The CI rehearsal server is gone from `local-dev.md`.
- `pb-audit`: `references/checks.md` has a runnable two-client proof (guest and member B) with expected status codes.
- `pb-design`: one `theme.css` shape. The starter ships the short version; `assets/theme.css` is the full token list with the font block commented out.
- `pb-review`, `pb-deploy`: wording only.
- Blank-app starter ships the pinned libraries and install icons. Versions and checksums: `skills/pb-build/assets/vendor/VERSIONS.json`. PocketBase JS SDK 0.28.1, Basecoat 1.0.2, Tailwind browser build 4.3.3.

## 0.3.2 — 2026-10-19

- Online is the only default. The starter HTML and service worker do not load `outbox.js`. Add the outbox only when they ask for offline.
- Vendor pins: PocketBase JS SDK 0.28.1, Basecoat 1.0.2, Tailwind browser build 4.3.3.
- `pb-deploy`: one always-on server only. Per-PR test links, sprites, and CI are removed until a later version of this skill.

## 0.3.1 — 2026-10-19

- `pb-audit`: read-only security audit. Rules, protected files, hooks that skip rules, secrets in the browser. "Is this safe?" loads it, not `pb-review`.

## 0.3.0 — 2026-10-19

Offline data is a project choice, off by default. Install and the theme step stay.

- `pb-slim`: spec says `Offline: off` or `Offline: on`. Off talks to PocketBase. On loads the two-phase recipe. The installed shell still opens with no signal.
- `pb-spec`: one Offline line and one acceptance test. Phase sections only when on.
- `pb-review`: do not demand an outbox or an airplane-mode data test when off.
- `pb-build`: default build uses the PocketBase SDK. Copy `outbox.js` only when on. Theme step unchanged.
- `pb-deploy` / `pb-design`: do not promise data edits with no signal unless the spec says on.

## 0.2.0 — 2026-10-05

Lessons from putting Playroom online and adding teams.

- `pb-slim`: report only what you saw on the current release; correct an overstatement before the next action. A feature bundled with another request still gets spec-first. New job: test links per pull request.
- `pb-deploy`: "which kind of online?" — production for data that matters, a test link per pull request for throwaway data. New reference `pr-test-links.md`: spike, scripts, one-`test`-job workflow, teardown reads scripts from the default branch, smoke test the new release, the drill.
- `pb-build`: outbox `save(…, { snapBack })` for changes the server may refuse later, plus `local:rejected`; lost-reply creates checked with `getOne` (PocketBase names the clashing unique field, not always `id`); `pendingIds`. Presence: a failed subscribe sticks in the SDK, so unsubscribe and retry after sync. A local hook reload also applies new migrations. Testing offline in a browser tool; CI rehearsal server.
- `pb-spec`: a new feature is a numbered section of the living spec, with state in its heading; conflict rule for changes the server may refuse later.

## 0.1.0 — 2026-10-05

First release.

- `pb-slim`: persona, which skill to use for each job, the fixed stack, defaults, what it refuses.
- `pb-spec`: discovery, the living spec with two phases (offline first, then sync and live) and look & feel; as-built PRD.
- `pb-review`: ship / cut / later review; UX audit.
- `pb-build`: new app, phase 1 offline → test → phase 2 sync + live; starter files (service worker, Install button, outbox).
- `pb-design`: Basecoat base with per-product theme, signature, and voice; PRODUCT.md / DESIGN.md templates.
- `pb-deploy`: one always-on server, HTTPS, files vs backups, email.
