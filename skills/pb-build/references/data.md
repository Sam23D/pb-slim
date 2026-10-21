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

Keep the screen's rows in a `Map` keyed by id. One `render()` reads that map and patches the DOM by `data-id`: insert a missing node, update a changed one, remove a gone one. Never rebuild the list with `innerHTML`; it kills focus and in-progress edits.

```js
const rows = new Map()

async function load() {
  const list = await pb.collection('items').getFullList({ filter: pb.filter('owner = {:id}', { id: me }) })
  rows.clear()
  for (const r of list) rows.set(r.id, r)
  render()
}

function render() {
  const ul = document.getElementById('list')
  const seen = new Set()
  for (const rec of rows.values()) {
    seen.add(rec.id)
    let el = ul.querySelector(`[data-id="${rec.id}"]`)
    if (!el) { el = document.createElement('li'); el.dataset.id = rec.id; ul.append(el) }
    el.textContent = rec.title
  }
  for (const el of ul.querySelectorAll('[data-id]')) if (!seen.has(el.dataset.id)) el.remove()
}
```

After a write, put the returned record into the map and call `render()`. This is the whole reactive loop for a static screen. A Live screen adds one subscription that writes into the same map (`realtime.md`); nothing else changes.

## Not here

No IndexedDB, no outbox, no "saved on this device". If they asked for offline, `offline-first.md` replaces this file's read/write section with `Local`.
