# Data through the PocketBase JS SDK (online)

The default for every screen. `pocketbase.umd.js` is vendored by the starter and exposes `PocketBase` on `window`.

## One client

The starter's `js/app.js` already makes it: `const pb = new PocketBase(location.origin)`, also on `window.pb`. It also holds the auth guard, `errorMessage(err)`, and `toast(title, category)`. Keep them; add screen code in `js/<page>.js`.

Two things `app.js` already handles, so screens do not:

- **Stale sign-in.** Since PocketBase 0.42 an expired or revoked token gets 401 on every request, public ones too. `app.js` drops the token and sends the user home.
- **Cancelled requests.** The SDK cancels a pending request when an identical one starts (a double click, a reload on reconnect). The cancelled one rejects with `isAbort`; `errorMessage` returns `null` for it and `toast(null)` shows nothing. Loads that may overlap pass `requestKey: null` so both finish.

The SDK keeps the auth token in `localStorage`, so a reload stays signed in. `pb.authStore.isValid` tells you whether to show the sign-in screen.

## Sign in, sign up

```js
await pb.collection('users').authWithPassword(email, password)
await pb.collection('users').create({ email, password, passwordConfirm: password, name })
pb.authStore.clear()   // sign out
```

Show `errorMessage(err)`. Do not show the raw error object. Password reset, email codes, verified email, Google: `auth.md`.

## Read, write

```js
const rows = await pb.collection('items').getFullList({ sort: '-created' })
const one  = await pb.collection('items').getOne(id)
await pb.collection('items').create({ title, owner: pb.authStore.record.id })
await pb.collection('items').update(id, { done: true })
await pb.collection('items').delete(id)
```

- Use `getList(page, perPage, { skipTotal: true })` past a few hundred rows (`skipTotal` saves a count query when the screen shows no total).
- Ask only for the fields the screen shows: `fields: 'id,title,done'`. Use the same `fields` on the Live subscription.
- `filter` and `sort` strings go through `pb.filter('owner = {:id}', { id })` so user input cannot change the query.
- Expand only what the screen shows: `expand: 'owner'` returns `record.expand.owner`. Expanded rows follow that collection's view rule.
- Photos: send a `FormData` or a `File` in the record. URL: `pb.files.getURL(record, record.photo)`. Private files are marked Protected and need `pb.files.getToken()` (`pb-audit/references/checks.md`).

## Refused writes

Rules return **404** on a refused update or delete and **400** on a refused create. The screen keeps the old value, shows a short reason, and never drops typed text. Every write uses the starter helper:

```js
try {
  const rec = await pb.collection('items').update(id, { title })
  rows.set(rec.id, rec)
  render()
} catch (err) {
  toast(errorMessage(err), 'error')   // old value stays in rows; the input keeps the typed text
  return
}
toast('Saved')   // after the try/catch, so a toast problem never looks like a failed save
```

## Render

Keep the screen's rows in a `Map` keyed by id. One `render()` reads that map and patches the DOM by `data-id`: insert a missing node, update a changed one, remove a gone one. Never rebuild the list with `innerHTML`; it kills focus and in-progress edits.

```js
const rows = new Map()

async function load() {
  const list = await pb.collection('items').getFullList({
    filter: pb.filter('owner = {:id}', { id: me }),
    fields: 'id,title',
    requestKey: null,   // a reload on reconnect may overlap the first load; let both finish
  })
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
