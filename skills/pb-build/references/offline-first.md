# Offline: only when they asked to work with no signal

The default app is online (`data.md`). Load this file only after the PM asked for no-signal use and the spec has an **Offline** section. It replaces the read/write part of `data.md` with `Local` and adds an outbox and sync. Install and the service-worker shell are already in every app; they are not offline data.

## Setup

1. Copy `assets/js/outbox.js` to `pb_public/js/outbox.js`. Add `<script defer src="/js/outbox.js">` before `app.js`, and `/js/outbox.js` to the `SHELL` list in `sw.js`.
2. Set `DB_NAME` and `COLLECTIONS` at the top of `outbox.js`. Bump `DB_VERSION` when you add a collection.
3. The service worker never caches `/api/`. Data comes from IndexedDB. Images from `/api/files/` show a placeholder offline unless you store the Blob in the record.

## Build order

Build **phase 1**, prove it, report "Phase 1 passes offline. Try it: …. Start phase 2 (sync + live)?" and **wait for yes**. Then phase 2. Never both in one pass.

## Phase 1 — on the device

`outbox.js` exposes `window.Local`:

| Call | Does |
|---|---|
| `Local.all(col)` / `Local.get(col, id)` | Read from IndexedDB |
| `Local.save(col, data)` | Put in IndexedDB, give a PocketBase-shaped id if new, add to outbox |
| `Local.save(col, data, { snapBack: true })` | Same, for a change the server may refuse later (see phase 2) |
| `Local.remove(col, id)` | Delete locally, add a delete to the outbox |
| `Local.pending()` | Count of unsynced changes ("3 changes saved on this device") |
| `Local.pendingIds(col)` | Ids still waiting to sync (e.g. "Friends can join once this saves") |

- Screens render from `Local`, never from `pb.collection(...)` directly. Listen for the `local:change` event to re-render.
- Show "Saved on this device" after a save while offline or with pending changes.
- Signed-in state: the SDK keeps the token in localStorage, so the app opens offline. Show the cached user. If the token expired by the time the app is back online, ask them to sign in again and **keep the outbox**.
- Photos: store the `File`/`Blob` in the record; IndexedDB keeps Blobs. The SDK sends it as form data on sync.
- No network code in phase 1. The outbox only grows.

**Phase 1 test (you run it):** install, airplane mode or DevTools offline, run the happy path, close and reopen, data is still there, pending count is right. Reload while offline; data must still show.

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
- Create retried after a lost response → the record already exists → that create is done. **Check with `getOne(id)`, not the error field**: PocketBase reports the first unique field that clashes, not always `id`. Update of a record the server never saw → it creates instead. Delete of a missing record → done.
- **Changes the server may refuse later** (a seat on a full team, a move after the game started): save with `{ snapBack: true }`. On a 4xx the outbox drops the item, the next pull restores the server copy, and `local:rejected` carries the server message for a toast. Plain saves keep refused items as failed so typed text is never lost. Pick per action in the spec's conflict rule.
- `pull` replaces the local copy with the server list, **except** records that still have pending outbox items. Fine for small collections (hundreds to low thousands of rows per user). For more, pull with `filter: updated > lastSync` and use a soft-delete field.
- **Conflict rule (default): last write wins** — the last device to sync overwrites. Say it in the spec. If the PM needs more, add a `client_updated` field and a hook that rejects older writes; failed items then show in the UI.
- Live updates only on screens that show shared data. Realtime patches `Local` first, then the screen re-renders (`realtime.md`, offline variant).
- Client-made ids: PocketBase accepts an `id` on create (15 chars, `[a-z0-9]`). The outbox uses this so the same id works on the device and the server.

**Phase 2 test (you run it):** two browser sessions, two members. A goes offline, edits, comes back; both match. A edits online; B sees it without refresh. Kill the network mid-sync; nothing is lost or duplicated. Run each multi-step flow in one call. If a session comes back blank, reopen it and recreate the state; do not reuse old ids. After any client change, check that an already-open tab moves to the new release by itself before you blame sync.

## Testing offline in a browser tool

- DevTools offline (`Network.emulateNetworkConditions offline=true`) makes `fetch` fail with status 0, so outbox items stay queued. Check it took: `navigator.onLine === false` **and** a blocked `fetch('/api/health')`. Re-apply it after every reload; it does not survive one.
- A "refused once back online" path (snap-back, failed item) runs only after the network returns. Test it in two steps: queue the change offline, then make the server refuse it online and watch for `local:rejected` and the toast.
- Do not pause or stop the app's server to fake an outage: page requests hang and the tool times out, and it changes container state, so ask first.

## Demo script

Install, turn off wifi, click that, see "Saved on this device", turn wifi on, expect it on the other device.
