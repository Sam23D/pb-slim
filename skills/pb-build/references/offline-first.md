# Offline first: install, store, outbox, sync

Starter files in `assets/`: `manifest.webmanifest`, `sw.js`, `install.js`, `outbox.js`, `index.html`.

## Install button (always)

- `install.js` registers `sw.js`, listens for `beforeinstallprompt`, and shows `#install-app`. A click calls `prompt()`.
- iPhone/iPad has no prompt: the button shows `#install-help` with "Tap Share → Add to Home Screen".
- Hidden when already installed (`display-mode: standalone`).
- Optional Android APK (TWA wrapper, e.g. built with Bubblewrap): link it as a direct download next to the button. Never a store listing.
- Requires HTTPS (or `localhost`), a manifest with name, icons (192 + 512, one `maskable`), `start_url`, `display: standalone`, and a registered service worker.

## Service worker

- On install: cache the **app shell** (HTML, CSS, JS, manifest, icons, every file in `vendor/`) under a versioned cache name. Bump `VERSION` on each release.
- Navigations: network first, fall back to the cached page.
- Static files: cache first.
- **Never cache `/api/` or `/_/`.** Data comes from IndexedDB, not the HTTP cache. Images from `/api/files/` therefore show a placeholder offline unless you store them in IndexedDB.

## Phase 1 — on the device

`outbox.js` exposes `window.Local`:

| Call | Does |
|---|---|
| `Local.all(col)` / `Local.get(col, id)` | Read from IndexedDB |
| `Local.save(col, data)` | Put in IndexedDB, give a PocketBase-shaped id if new, add to outbox |
| `Local.remove(col, id)` | Delete locally, add a delete to the outbox |
| `Local.pending()` | Count of unsynced changes ("3 changes saved on this device") |

- Set `DB_NAME` and `COLLECTIONS` at the top of `outbox.js`. Bump `DB_VERSION` when you add a collection.
- Screens render from `Local`, never from `pb.collection(...)` directly. Listen for the `local:change` event to re-render.
- Show "Saved on this device" after a save while offline or with pending changes.
- Signed-in state: the PocketBase SDK keeps the token in localStorage, so the app opens offline. Show the cached user. If the token expired by the time the app is back online, ask them to sign in again and **keep the outbox**.
- Photos: store the `File`/`Blob` in the record; IndexedDB keeps Blobs. The SDK sends it as form data on sync.
- No network code in phase 1. The outbox only grows.

**Phase 1 test:** install, airplane mode, run the happy path, close and reopen, data is still there, pending count is right.

## Phase 2 — sync and live

```js
async function sync() {
  await Local.flush(pb)                       // send outbox in order
  for (const col of COLLECTIONS) await Local.pull(pb, col)  // refresh local copy
}
window.addEventListener('online', sync)
document.addEventListener('visibilitychange', () => { if (!document.hidden) sync() })
pb.realtime.subscribe('PB_CONNECT', sync)     // also runs after a reconnect
pb.collection('items').subscribe('*', (e) => Local.applyRemote('items', e.action, e.record))
```

- `flush` sends each outbox item in order. Network error → stop and retry later. Validation or permission error → mark the item failed and show it to the user ("This change could not be saved: …"); do not drop it silently.
- Create retried after a lost response → the id already exists → it updates instead. Update of a record the server never saw → it creates instead. Delete of a missing record → done.
- `pull` replaces the local copy with the server list, **except** records that still have pending outbox items. Fine for small collections (hundreds to low thousands of rows per user). For more, pull with `filter: updated > lastSync` and use a soft-delete field.
- **Conflict rule (default): last write wins** — the last device to sync overwrites. Say it in the spec. If the PM needs more (e.g. "don't overwrite a newer edit"), add a `client_updated` field and a hook that rejects older writes; failed items then show in the UI.
- Live updates only on screens that show shared data. Realtime patches `Local` first, then the screen re-renders (`references/realtime.md`).

**Phase 2 test:** two browsers, two members. A goes offline, edits, comes back; both match. A edits online; B sees it without refresh. Kill the network mid-sync; nothing is lost or duplicated.
