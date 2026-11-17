# Hosting and storage

## Process model

PocketBase is one always-on process + local SQLite (WAL) on a **persistent volume**. Official guidance: no other databases; scale vertically. Sleep / autostop breaks login, sync, and realtime.

- **Fly.io:** one Machine, volume mounted at the data dir (`/pb/pb_data`). Never scale count > 1. Autostop off. Steps below.
- **VPS:** upload the binary, `pocketbase serve yourdomain.com` (built-in Let's Encrypt) or put it behind a reverse proxy. Persist `pb_data`.
- HTTPS is required for service workers and the install prompt (`localhost` is fine for development).

## Fly.io, step by step

The project already has the starter `Dockerfile` (pinned PocketBase). Copy `assets/fly.toml` to the project root and set `app` (globally unique, e.g. `pb-<app>`) and `primary_region`.

```sh
fly launch --no-deploy --copy-config --name pb-<app>
fly volumes create pb_data --size 1 --region <region> --yes
fly deploy --ha=false                       # one Machine; the default makes two
fly ssh console -C "/pb/pocketbase superuser upsert EMAIL PASSWORD"
fly certs add <app.example.com>             # custom domain; then the DNS records it prints
```

- Roll back: `fly releases --image`, then `fly deploy --image <previous image>`. Migrations already applied stay applied; restore the backup if they changed data (`pb-build/references/changes.md`).
- Cost: say a number from fly.io/pricing for the Machine size + 1 GB volume, per month. Do not guess.

## After the first deploy: settings (Dashboard → Settings)

1. **Application:** name and URL (the https address). Unset, emails say "Acme" and link to `localhost`.
2. **Mail:** SMTP from a real mail service, sender name and address. Send the test email.
3. **Backups:** cron `0 3 * * *`, keep 7, **S3 on**, pointing at the backup bucket (not the files bucket). Press **Create backup** once and check the file is in the bucket.
4. **Rate limits:** turn on (off by default).
5. **Files storage:** S3 only when uploads get large; a different bucket from backups.

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
