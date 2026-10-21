# Data through the PocketBase JS SDK (online)

The default for every screen. `pocketbase.umd.js` is vendored by the starter and exposes `PocketBase` on `window`.

## One client

```js
// js/app.js
const pb = new PocketBase(location.origin)   // same origin, no base URL to configure
window.pb = pb
```

The SDK keeps the auth token in `localStorage`, so a reload stays signed in. `pb.authStore.isValid` tells you whether to show the sign-in screen.

## Sign in, sign up

```js
await pb.collection('users').authWithPassword(email, password)
await pb.collection('users').create({ email, password, passwordConfirm: password, name })
pb.authStore.clear()   // sign out
```

Show the error message from `err.response?.message` or the first field error in `err.response?.data`. Do not show the raw error object.

## Read, write

```js
const rows = await pb.collection('items').getFullList({ sort: '-created' })
const one  = await pb.collection('items').getOne(id)
await pb.collection('items').create({ title, owner: pb.authStore.record.id })
await pb.collection('items').update(id, { done: true })
await pb.collection('items').delete(id)
```

- Use `getList(page, perPage)` past a few hundred rows.
- `filter` and `sort` strings go through `pb.filter('owner = {:id}', { id })` so user input cannot change the query.
- Expand only what the screen shows: `expand: 'owner'` returns `record.expand.owner`. Expanded rows follow that collection's view rule.
- Photos: send a `FormData` or a `File` in the record. URL: `pb.files.getURL(record, record.photo)`. Private files are marked Protected and need `pb.files.getToken()` (`pb-audit/references/checks.md`).

## Refused writes

Rules return **404** on a refused update or delete and **400** on a refused create. The screen keeps the old value, shows a short reason, and never drops typed text. Map the status to plain copy in one helper and call it from every write.

## Render

Render from the rows the server returned. Patch by `data-id` instead of replacing the whole list, so focus and in-progress edits survive. The same `render(rows)` is reused by realtime (`realtime.md`).

## Not here

No IndexedDB, no outbox, no "saved on this device". If they asked for offline, `offline-first.md` replaces this file's read/write section with `Local`.
