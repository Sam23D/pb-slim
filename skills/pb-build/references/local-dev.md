# Local development

## One process

- The starter ships `assets/root/compose.yaml` and a `Dockerfile` that downloads the pinned server and checks its sha256. Start: `PB_PORT=8090 docker compose up -d --build`. Liveness: `curl -s -m 3 http://127.0.0.1:$PB_PORT/api/health`. Logs: `docker compose logs -f pb`. Stop: `docker compose down` (data stays in `pb_data/`).
- Without Docker: download the pinned zip for the machine from `VERSIONS.json` (`server`), check its sha256, then `./pocketbase serve --http 127.0.0.1:8090 --dir ./pb_data --publicDir ./pb_public --hooksDir ./pb_hooks --migrationsDir ./pb_migrations`.
- First admin: open the `/_/#/pbinstall/…` link from the first log lines, or `docker compose exec pb /pb/pocketbase superuser upsert EMAIL PASS`.
- One app per process, one port per app (8090, 8091, …). Change `name:` in `compose.yaml` per app so containers do not collide.
- **Data:** `pb_data/` — never delete it; never commit it.
- Hook file changes reload automatically. New **migrations** apply on process start, **and on that hook reload**: saving a hook while a new file sits in `pb_migrations/` ran the migration on the local data (seen on 0.40 in Docker). So writing a migration is a data change. Write it only after the spec is approved, and say how to undo it (`pocketbase migrate down 1`, ask first).
- The starter port is bound to `127.0.0.1`: only this machine can open it. For phones on the same Wi-Fi, drop the `127.0.0.1:` prefix in `compose.yaml` (or bind to the LAN IP). That is still not internet-facing.
- Service workers and the install prompt need HTTPS, except on `localhost`. To test install on a phone, use a tunnel with HTTPS or deploy (`pb-deploy`).

## Docker notes

- `compose.yaml` bind-mounts `pb_data`, `pb_public`, `pb_hooks`, `pb_migrations` from the project. Folders the container creates may be root-owned; keep writable copies in the project and mount those.
- If you cannot run `docker ps`, read `compose.yaml`: `name:` and the bind mounts name the app being served.

## Reading data safely

`pb_data` is in WAL mode and may be root-owned, so read-only `sqlite3` can fail. Copy the database and its `-wal` file to a temp folder and query the copy:

```sh
cp pb_data/data.db pb_data/data.db-wal "$TMPDIR"/
sqlite3 "$TMPDIR/data.db" "select name, type, system from _collections"
```

Never write to the live `pb_data`. Report to the PM as "one app, X, with these things saved"; do not list system tables (`_superusers`, `_otps`, …).

## Testing on live data

Ask first. Use throwaway members named `ZZ Test …` and remove what they created afterwards.
