# Changing an app that already has data

Load this from `pb-build` when the approved spec changes a collection that already has rows, or when bumping the PocketBase server. A new collection is `migrations.md`. Every snippet here was run on 0.40.

## Before any change

1. **Back up.** Local: `docker compose down`, copy `pb_data/` somewhere, start again. Live server: Dashboard → Settings → Backups → **Create backup**, then download it. Say where the copy is.
2. **One migration per change**, with a real `down` (the reverse). `pocketbase migrate down 1` must undo it; try that locally before you ship (ask first on shared data).
3. Say the product effect in one line before you write the file: "Every recipe gets 4 servings; nothing else changes."

## Add a field, fill old rows

```js
// pb_migrations/1700000100_items_servings.js
migrate((app) => {
  const items = app.findCollectionByNameOrId("items")
  items.fields.add(new NumberField({ name: "servings", min: 1 }))
  app.save(items)
  // Old rows get the zero value. Fill them in the same migration.
  app.db().newQuery("UPDATE items SET servings = 4 WHERE servings = 0 OR servings IS NULL").execute()
}, (app) => {
  const items = app.findCollectionByNameOrId("items")
  items.fields.removeByName("servings")
  app.save(items)
})
```

- Field types: `TextField`, `NumberField`, `BoolField`, `DateField`, `SelectField`, `RelationField`, `FileField`, `JSONField`, `EmailField`, `URLField`, `AutodateField`.
- A new **required** field on a table with rows: add it optional, fill it, then set `required: true` in a later migration.

## Rename a field

`items.fields.getByName("title").name = "name"`, then `app.save(items)`. The column is renamed; the data stays. Then, in the same release:

- Update every rule that names the field (rules are strings; nothing renames them for you).
- Update every screen: `grep -rn "title" pb_public/js pb_hooks`.
- A renamed field is a breaking change for any open tab: bump `VERSION` in `sw.js`.

Rename a **collection** the same way (`collection.name = "…"`). URLs under `/api/collections/<name>/` change with it.

## Remove a field or a collection

Data loss. Ask with the exact words "This deletes <what> for every <row>. The backup is at <where>. OK?" and wait for yes. The `down` can bring the field back, not the data.

## Change a rule

A new migration that loads the collection, sets the rule, saves (`migrations.md`). Re-run the two-client proof for that collection (`pb-audit/references/checks.md`).

## Bump the PocketBase server

1. Read the release notes between the pinned and the new version. Look for "breaking" and for JS hook API changes.
2. Change `server` in `pb-build/assets/vendor/VERSIONS.json` and the `PB_VERSION` + `PB_SHA256_*` ARGs in the `Dockerfile` (from the release's `checksums.txt`).
3. Back up, `docker compose up -d --build`, confirm `docker compose exec pb /pb/pocketbase --version`.
4. Run the demo script and each Live screen test. Report what passed on the new version only.

## On the live server

Migrations run when the new release starts. So: back up, deploy, run the demo script. If it fails, roll back to the previous image and restore the backup; do not hand-edit the live database.
