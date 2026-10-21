# <Product name>

<One line: what this is and who it is for.>

## v1 (floor)

Time to demo: <10> minutes.

1. Open <url>. Tap **Install app**.
2. Sign up with email and password.
3. <Click> …
4. <Expected result> …

## Look & feel

- Three words: <calm, practical, warm>.
- Must not look like: <a bank dashboard>.
- Signature: <one element only this product has>.

## Later (ceiling)

| Item | Why it can wait | What v1 must not block |
|---|---|---|
| | | |

## Who

| Role | Can see | Can do |
|---|---|---|
| Visitor | | |
| Member | | |
| Staff | | |

## Screens

| Screen | Who looks at it | Public or signed-in | Static or Live | Live: watches / who else writes it |
|---|---|---|---|---|
| <Landing> | Visitor | Public | Static | |
| <Home> | Member | Signed-in | Static | |
| <Shared list> | Member | Signed-in | Live | `items` where `list = this list` / other members of the list |
| <Share page `/p/<id>`> | Visitor | Public (fields: title, summary) | Static | |

## Happy path

1. …

## Not now

- App store listing.
- …

## Risks

- If the server is off, you cannot save. Live screens freeze.
- A refused write shows the old value and a short reason. Typed text is not dropped.

## Acceptance

1. Install the app.
2. Do the happy path.
3. Refresh. Expect the changes to still show.
4. Turn the network off. Expect the installed app to open. Edits can wait until the network is back.
5. For each Live screen: two members, two devices. A changes <item>. Expect B to see it without touching the page, within a second. B reloads. Expect the same.

## Open questions

1. <Question>? **Recommended:** <answer>.

---

## Build notes

- **Collections:** <name>: <fields>.
- **Rules:** <collection>: members read; owner edits (`owner = @request.auth.id`).
- **Screens:** `pb_public/<page>.html`, `pb_public/js/<page>.js`.
- **Install:** manifest; service worker caches shell + vendor; Install button.
- **Data:** PocketBase directly. No outbox.
- **Live:** <screen>: subscribe `items` filter `list = {:id}`, gated by the `items` list rule. <Or: none.>
- **Live signals:** <presence topic `presence/<room>`, members only. Or: none.>
- **Public pages:** <`index.html` static. `/p/<id>.html` written by a hook from `items` where `public = true`; fields: title, summary. Or: none.>
- **Tasks:**
  - …
