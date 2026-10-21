# Security checks

Load this from `pb-audit`. Official rule meanings: PocketBase API rules docs. File URLs: PocketBase files docs.

## Rule values

| Value | Who can do it |
|---|---|
| `null` (unset) | Superuser only. Safe default. |
| `""` | Anyone, including guests. |
| an expression | Only when the filter matches. List rules hide non-matches as an empty 200, not an error. |

Superusers skip every rule. A token for `_superusers` in the browser is a full leak.

## Rules worth copying

Owner-only rows (field name may be `owner` or `created_by`):

- list / view: `owner = @request.auth.id`
- create: `@request.auth.id != "" && @request.body.owner = @request.auth.id`
- update: `owner = @request.auth.id && @request.body.owner:changed = false`
- delete: `owner = @request.auth.id`

Staff-only writes: create / update / delete `null`. Do not use `""`.

Share-by-code: `code = @request.query.code` on view, and nothing else. A rule that is only "the query is set" is public.

Auth `manageRule`: leave `null` unless a named staff role must change another user's email or password.

## Two-client proof (run with `terminal`)

Needs a running server and two throwaway members, `ZZ Test A` (owns a row) and `ZZ Test B`. Ask before creating them on live data. Replace `items`, `owner`, the ids, and the password.

```sh
PB=http://127.0.0.1:8090
# 1. Guest list: expect 200 and "totalItems":0. Anything else is a leak.
curl -s "$PB/api/collections/items/records"
# 2. Member B token.
TOKEN_B=$(curl -s -X POST "$PB/api/collections/users/auth-with-password" \
  -H 'content-type: application/json' \
  -d '{"identity":"zz-test-b@example.com","password":"<B password>"}' | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')
# 3. B lists: expect only B's rows (none if B has no rows).
curl -s "$PB/api/collections/items/records" -H "Authorization: $TOKEN_B"
# 4. B views A's row: expect 404.
curl -s -o /dev/null -w '%{http_code}\n' "$PB/api/collections/items/records/<A row id>" -H "Authorization: $TOKEN_B"
# 5. B creates a row as A: expect 400.
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$PB/api/collections/items/records" \
  -H "Authorization: $TOKEN_B" -H 'content-type: application/json' \
  -d '{"title":"x","owner":"<A user id>"}'
# 6. B updates A's row: expect 404.
curl -s -o /dev/null -w '%{http_code}\n' -X PATCH "$PB/api/collections/items/records/<A row id>" \
  -H "Authorization: $TOKEN_B" -H 'content-type: application/json' -d '{"title":"y"}'
# 7. Guest file URL on a private field: expect 404 if Protected. 200 means anyone with the URL can read it.
curl -s -o /dev/null -w '%{http_code}\n' "$PB/api/files/items/<A row id>/<filename>"
# 8. B expands the roster: expect no email field in the output.
curl -s "$PB/api/collections/users/records?fields=id,name,email" -H "Authorization: $TOKEN_B"
```

Record each number next to the expected one. A match is a pass. Anything else is a finding. Remove the test members afterwards.

## What to search in files the browser loads

Search `pb_public/` and any release script that copies files into it. Flag a hit. Do not print the value.

- `_superusers`, `authWithPassword` with a literal password, `admins.auth`
- `smtp`, `s3`, `secret`, `api_key`, `apiKey`, `token`, `BEGIN PRIVATE KEY`, `AKIA`, `sk-`
- A `.env` file, `pb_data/`, or a `*.db` file under `pb_public/`
- Service worker cache list containing `/api/` or `/_/`

Skip: the PocketBase SDK file itself, a Turnstile or similar **site** key, the signed-in user's own token in localStorage.

## Files

Unprotected file URL:

`/api/files/COLLECTION/RECORD_ID/FILENAME`

It works for anyone who has the URL, even if the view rule is tight. Private files need the field marked Protected. Protected files still follow the view rule. If that rule is `""`, they are public.

## Hooks

Hooks use the app as a superuser. `findRecordById` / `findRecordsByFilter` do not apply API rules. If the result is sent to the browser, check the caller's view or list rule first, or return only the fields the spec allows.

A boot hook that sets rules overwrites a migration on every start. Read both.
