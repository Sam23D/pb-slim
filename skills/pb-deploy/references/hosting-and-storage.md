# Hosting and storage

## Process model

PocketBase is one always-on process + local SQLite (WAL) on a **persistent volume**. Official guidance: no other databases; scale vertically. Sleep / autostop breaks login, sync, and realtime.

- **Fly.io:** one Machine, volume mounted at the data dir (e.g. `/pb/pb_data`), bind `0.0.0.0:$PORT`. Never scale count > 1. Turn autostop off.
- **VPS:** upload the binary, `pocketbase serve yourdomain.com` (built-in Let's Encrypt) or put it behind a reverse proxy. Persist `pb_data`.
- HTTPS is required for service workers and the install prompt (`localhost` is fine for development).

## Do not use Turso / remote databases

`DBConnect` can open libSQL/Turso, but that needs a custom Go build and is unofficial.

- Remote: every query is a network round trip.
- Several servers on one database: **hooks and realtime only fire on the instance that handled the write.**

For disaster recovery use **Litestream or PocketBase backups to S3**, not a remote database.

## Files vs backups

PocketBase always owns the file **API** (fields, size/type checks, thumbs, protected URLs). Bytes live in `pb_data/storage/` **or** an S3-compatible bucket.

| Job | Setting | Contents |
|---|---|---|
| Live files | Settings → Files storage | Uploads + thumbs |
| Backups | Settings → Backups (or Litestream) | ZIP of `pb_data`; **excludes files already on S3** |

- Use **two buckets**. One ZIP is never "everything" once files are on S3.
- Switching files to S3 does **not** migrate existing local files. Copy them, or old links 404.

## Production extras

SMTP (not sendmail), rate limiter, settings encryption key if backups leave the box, superuser IP allowlist when possible, a custom domain with HTTPS before sharing the Install button.
