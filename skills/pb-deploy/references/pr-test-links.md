# Test links per pull request (no production)

For apps with throwaway data: one small machine per pull request, made on "ready", updated on every push, deleted on close or back to draft. Checked with Fly Sprites + GitHub Actions on PocketBase 0.40. Any host with "create / exec / destroy" and a public HTTPS URL works the same way.

## Plan and spike first

1. Write a short plan: a PM summary, decisions with defaults, risks in product words, the files, the drill. Wait for a yes.
2. Spike on **one throwaway machine**, then delete it (ask first: it is billed):
   - Deploy exactly as CI will, and time it (first deploy ~7 s incl. the PocketBase download; redeploy ~5 s).
   - Make the URL public. Two real browsers through it: live updates, install check (Chrome `Page.getInstallabilityErrors` is empty), offline reload, a second deploy while a tab is open.
   - Idle: close every tab, wait for the machine to sleep, time the first request (under 1 s), check data survived.
   - Read prices from the host's pricing page. Never guess numbers.
3. Write every result into the plan before building.

## Scripts in the repo

- `scripts/sprite/activate.sh` runs **on the machine**: unpack `pb_public pb_hooks pb_migrations` into `releases/<sha>`, switch a `current` symlink atomically (`ln -sfn … current.new && mv -T current.new current`), keep 3 releases, run `pocketbase migrate up` **before** the restart (a bad migration fails the deploy; the running server keeps serving), then restart the service. `pb_data` lives outside `releases/` and is never reset.
- `scripts/ci/pocketbase.sh <version>`: pinned download, checked against the release `checksums.txt` (`grep " $zip$" checksums.txt | sha256sum -c -`).
- `scripts/ci/release_guard.sh [base]`: fails when `?v=` in `index.html` and `RELEASE` in `sw.js` differ, when a cached vendor file is missing, or when `pb_public/` changed since `base` without a new `RELEASE`. An all-zero base (first push) means "no base".
- `scripts/sprite/admin.sh <pr> <email>`: `superuser upsert` on the machine; the password is typed at a hidden prompt and sent as an uploaded file, never in argv. Never leave the first-run admin installer open on a public link.
- Upload to a fresh per-run folder (`/home/sprite/deploy-<run_id>-<attempt>`) and `trap rm -rf` it. Reused paths can be unwritable.

## Workflow shape

One file, three jobs:

- `test` — every PR into `main` and every push to `main`. Skips on `closed` / `converted_to_draft`. Steps: JS and shell syntax, release guard, pinned PocketBase on a fresh `--dir`, the rule and live-update check scripts. **One test job, not a separate "check" job.**
- `sprite` — `needs: test`. Only when not draft, branch `rc-*`, and the PR comes from this repo (`head.repo.full_name == github.repository`; forks have no secrets). Per-PR `concurrency` with `cancel-in-progress: false`. Create if missing, make the URL public, deploy, smoke test, sticky comment.
- `sprite-teardown` — on `closed` or `converted_to_draft`. Check the name against `^<app>-pr-[0-9]+$` before destroying. Mark the comment "Test link removed."

Pitfalls (each one happened):

- **Teardown must read its scripts from the default branch** (`ref: ${{ github.event.repository.default_branch }}`, sparse checkout), not `base.sha`. The PR that adds the workflow has no scripts at its base: its teardown fails (exit 127) and leaves a billed machine running.
- **Smoke test the new release, not HTTP 200.** The old release also answers 200. Compare `RELEASE` in the served `sw.js` with the checkout.
- **Quiet-window tests flake.** A one-minute cron sweep can resend an unchanged list inside a "nothing arrives in 1 s" window. Assert "nothing changed" instead, and rerun the suite 3 times before trusting a fix.
- Lint with `actionlint` (download the release binary and its checksums into a scratch folder) and rehearse the `test` job locally on a spare port before the first push.
- The token goes in a GitHub environment (`gh api -X PUT repos/<o>/<r>/environments/pr-sprite`, secret `SPRITES_TOKEN`). The PM adds it. Do not lift a local CLI login.

## App side

- `X-Robots-Tag: noindex, nofollow` (a tiny `routerUse` hook) and `robots.txt` with `Disallow: /`. No Basic Auth on share-link apps.
- The PM how-to goes in the README, section "Test online": branch name, draft → ready, the comment, install from the link, push updates, failing tests keep the old version, close deletes.

## Drill on the first real PR

Open as **draft** (test green, no link) → ready (link + comment) → two devices play → push a visible change with a release bump (same link, comment shows the new commit, open tab reloads itself) → push a deliberately broken server rule (test fails, nothing deployed, link keeps the old release) → back to draft (deleted) → ready (new link) → close (deleted).

- Before each step, read the real state (`gh pr view <n> --json isDraft`, `gh secret list -e pr-sprite`). The PM may flip draft/ready or add the token between turns.
- After merge or close, **check** teardown: the job result and `sprite list`. If it failed: read the failed log, delete the machine by hand, update the comment, land the fix on the next `rc-*` branch.
- Remove drill commits only with approval (force push), then bump the release **above** the drill number: open tabs only move to a higher version.
- Draft / ready / close / force-push need approval. If the approval times out, stop and ask. Do not retry.
