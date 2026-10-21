# Fixed stack and defaults

Loaded on demand from `pb-slim`. Never violate the stack. Mention it only when it blocks a request.

## Stack

- **One PocketBase process.** Website and API from the same origin. Static HTML/CSS/JS in `pb_public/`. No React/Next/Vite/npm frontend unless they explicitly override.
- **Basecoat UI** for components (plain HTML classes + a little vanilla JS, no build step). Personality per product comes only from **theme, one signature element, and voice** (`pb-design`). Never rewrite Basecoat components or invent new ones.
- **Vendor files are local.** The blank-app starter already contains them. Pins and checksums: `pb-build/assets/vendor/VERSIONS.json`. Never a CDN at runtime.
- **Installable PWA, always.** Web manifest + service worker + an in-site **Install app** button. Never publish to the App Store or Play Store. An Android APK (TWA wrapper) is allowed only as a direct download behind the same button. The installed shell opens with no signal. Edits need a connection.
- **Online always.** Screens talk to PocketBase through the JS SDK. Do not add IndexedDB, an outbox, or an offline banner unless they ask to work with no signal. If they ask, `pb-build/references/offline-first.md` owns the rest.
- **SQLite on that machine.** Not Turso/Postgres.
- **Files:** PocketBase owns uploads and permissions. Bytes may live in an S3-compatible bucket. Backups go to a **different** bucket.
- **Server code (JS hooks) only when permission rules cannot express the rule** (email, payment webhook, "after signup do X").
- **No second backend. No scaling out to many servers** (hooks and live updates only fire on the server that took the write). If they need that, the product is past this stack.

## Defaults (you pick; they override)

| Topic | Default | Say it as |
|---|---|---|
| UI | Plain HTML/JS + Basecoat | "Simple pages, no heavy app framework" |
| Look | Basecoat base + product theme, one signature, own voice | "Same solid base, its own colors and words" |
| Install | PWA + in-site Install button; APK download optional | "Tap Install on the site — no app store" |
| Sign-in | Email + password | Offer magic link if they flinch |
| Offline | Not included | Add it only if they ask to work with no signal |
| Live updates | Only on a shared screen the spec names | "Other people's changes appear by themselves" only if the spec asks |
| Photos | On the server disk | Cloud storage when size or cost shows up |
| Specs | `specs/<slug>.md` in the project (or where they ask) | "One living doc we keep updating" |
| Process | Spec → approve → build, online | Never silent build |

## Things this stack is not

Say no, then offer the nearest honest v1:

- Instagram-at-scale, multiplayer-global, or real-time co-editing of the same text ("like Google Docs").
- An App Store / Play Store listing or a native iOS/Android app. The Install button gives the same home-screen app.
- "SEO blog + logged-in product" as one clever framework. Marketing pages can be static; the product stays this app.
- Replacing an existing Node/Phoenix/Rails monolith "for free."
