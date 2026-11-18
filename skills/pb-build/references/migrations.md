# Migrations: one collection, five rules

Files in `pb_migrations/` run in filename order on process start, and on the next hook reload. Writing one is a data change on a running local server. Write it only after the yes. Undo: `pocketbase migrate down 1` (ask first).

Rule meanings: `null` = superuser only, `""` = anyone, an expression = a filter. Full list and copy-ready rules: `pb-audit/references/checks.md`.

## Shape

```js
// pb_migrations/1700000000_create_items.js
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")

  const items = new Collection({
    type: "base",
    name: "items",
    fields: [
      { name: "title", type: "text", required: true, max: 200 },
      { name: "done", type: "bool" },
      { name: "owner", type: "relation", collectionId: users.id, required: true, maxSelect: 1, cascadeDelete: true },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    // Index every field the rules or the screens filter or sort on.
    indexes: ["CREATE INDEX idx_items_owner ON items (owner)"],
  })
  app.save(items)

  // Rules may be ignored on the first save. Set them, then save again.
  items.listRule = 'owner = @request.auth.id'
  items.viewRule = 'owner = @request.auth.id'
  items.createRule = '@request.auth.id != "" && @request.body.owner = @request.auth.id'
  items.updateRule = 'owner = @request.auth.id && @request.body.owner:changed = false'
  items.deleteRule = 'owner = @request.auth.id'
  app.save(items)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("items"))
})
```

## Rules of thumb

- Always add the two `autodate` fields. Without them `sort=-created` returns 400 and pages hang on "Loading…".
- Index what rules and screens filter or sort on (`owner`, `household`, `status`). A slow list is almost always a missing index. A unique pair (one membership per user per household) is `CREATE UNIQUE INDEX … ON memberships (household, user)`.
- Owner-only rows: pin the owner on create, freeze it on update (above).
- Shared rows (a team, a household): see "Shared rows" below. Add an owner clause where the creator must see a row before any membership row exists.
- Staff-only writes: `null`, never `""`.
- Public sign-up: `users.createRule = ""`. Roster for members: list/view `@request.auth.id != ""` and request `fields: "id,name"` so emails stay off the page.
- Changing a field or a rule on a collection with rows: `changes.md`. A rule change is a new migration that loads the collection, sets the rule, saves. If a boot hook re-applies rules, change both or the hook reverts it.

## Shared rows: a household (checked on 0.42)

Three collections: `households`, `memberships` (`household`, `user`, unique pair), `bills` (`household`, `owner`). Members of a household see and edit its bills; nobody else sees them.

```js
// rules on bills — a back-relation: one path, one join
const member = 'household.memberships_via_household.user ?= @request.auth.id'
bills.listRule = member
bills.viewRule = member
bills.createRule = '@request.auth.id != "" && @request.body.owner = @request.auth.id && @request.body.household.memberships_via_household.user ?= @request.auth.id'
bills.updateRule = member + ' && @request.body.household:changed = false && @request.body.owner:changed = false'
bills.deleteRule = 'owner = @request.auth.id'
```

- `<collection>_via_<field>` walks back from the household to its memberships. Use it instead of two `@collection.memberships…` clauses: it reads as one sentence and cannot be split into two unrelated rows.
- The create rule checks the household **in the request body**, so a member cannot add a bill to someone else's household.
- Freeze `household` on update, or a member could move a bill into a household they do not belong to.
- Prove it with the two-client proof (`pb-audit/references/checks.md`): a member of another household gets an empty list, 404 on view and update, 400 on create.

## Totals: a view collection

A view collection is a read-only SQL `SELECT` (balances, counts, sums). Give it the same list/view rule idea as the rows it sums. It gets **no realtime events**, so a Live screen cannot watch it: watch the underlying collection and reload the view on each event.
