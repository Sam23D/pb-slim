# PocketBase JS hooks and migrations (0.23+; checked on 0.40)

## Helpers: CommonJS modules, not globals

Top-level `function foo()` in a `pb_hooks/*.pb.js` file is **not** in scope inside `onBootstrap` / `onRecord*` callbacks. PocketBase runs hooks in a pool of separate JS runtimes, so a `globalThis.x = …` stash made in `onBootstrap` exists in only one of them and silently skips elsewhere.

Put helpers in a module **without** `.pb.` in the name and `require` it **inside each handler**:

```js
// pb_hooks/shares.js
module.exports = { writeShares: function (app, record) { /* ... */ } }

// pb_hooks/bills.pb.js
onRecordAfterCreateSuccess((e) => {
  require(`${__hooks}/shares.js`).writeShares(e.app, e.record)
  e.next()
}, "bills")
```

## Collections and rules

`new Collection({ ..., listRule })` may ignore rule fields on the first save. Save, then set rules, then save again:

```js
const items = new Collection({ type: "base", name: "items", fields: [/* ... */] })
app.save(items)
const authed = '@request.auth.id != ""'
items.listRule = authed
items.viewRule = authed
items.createRule = authed
items.updateRule = 'owner = @request.auth.id'
items.deleteRule = 'owner = @request.auth.id'
app.save(items)
```

- Public register: `users.createRule = ""`. Staff-only: `null`. Roster for members: list/view `authed`, and request `fields: "id,name"` so emails stay off the page.
- Author-only rows: create `@request.body.owner = @request.auth.id`; update `owner = @request.auth.id && (@request.body.owner:isset = false || @request.body.owner = @request.auth.id)`.
- If an `onBootstrap` hook re-applies rules on every start, a rule change needs **both** that hook and a migration, or the hook silently reverts it. Grep `pb_hooks` before changing rules.

## Offline fields (only when they asked for offline)

- Client-made ids: PocketBase accepts an `id` on create (15 chars, `[a-z0-9]`). The outbox uses this so the same id works on the device and the server.

## Every collection

- Add `created` / `updated` **autodate** fields to every collection you create with a custom field list. Without them, `sort=-created` returns 400 and pages hang on "Loading…". Full migration shape: `migrations.md`.

## Gotchas

- List rules are **filters**: a guest list returns 200 + empty items, not 401. Test with a member token.
- A refused update/delete returns **404**, not 403. Map it to plain copy.
- Empty relations: omit the field. Do not send `""`.
- Delete hooks that need related rows: use `onRecordDelete` before `e.next()`. By after-delete, non-cascade relations are already blanked.
- `app.save(record)` inside after-create can fire after-update hooks. Guard against loops (skip if the derived row already exists).
- `findRecordsByFilter(collection, filter, sort, limit, offset, params)`: sort is a string, params last.
- Boot-time repair of derived rows is fine, but make it idempotent so restarts do not duplicate or spam reversals.

## No-signup apps (guest per device)

- An auth collection `guests`; the device makes the id + a random secret, signs up once, then signs in. Nobody types anything.
- Share one sign-in promise. The first screen and the background sync both call it at startup; two parallel sign-ups make the second fail with "Value must be unique". Treat a 400 on create as "already made" and sign in.
- "Find by link" rule: `code = @request.query.code` lets anyone with the exact code see one record, and nothing else.
- Rules that check membership through another collection (`players_via_lobby.device ?= @request.auth.id`) fail for the creator until their own membership row syncs. Add an owner clause (`host_device = @request.auth.id`).
- Status fields: let them only move forward in a hook (waiting → playing → closed), so a late offline sync cannot reopen a closed record.
