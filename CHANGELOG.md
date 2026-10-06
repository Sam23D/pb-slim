# Changelog

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
