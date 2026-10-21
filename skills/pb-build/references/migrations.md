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
- Owner-only rows: pin the owner on create, freeze it on update (above).
- Shared rows (a team, a household): list/view through a membership relation, write by owner or a named role. Add an owner clause so the creator can see the row before any membership row exists.
- Staff-only writes: `null`, never `""`.
- Public sign-up: `users.createRule = ""`. Roster for members: list/view `@request.auth.id != ""` and request `fields: "id,name"` so emails stay off the page.
- Changing a rule later: a new migration that loads the collection, sets the rule, saves. If a boot hook re-applies rules, change both or the hook reverts it.
