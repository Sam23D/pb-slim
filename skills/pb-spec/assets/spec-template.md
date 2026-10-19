# <Product name>

<One line: what this is and who it is for.>

**Offline:** off.

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

## Happy path

1. …

## Not now

- App store listing.
- …

## Risks

- If the server is off, you cannot save. Live lists freeze.
- A refused write shows the old value and a short reason. Typed text is not dropped.

## Acceptance

1. Install the app.
2. Do the happy path.
3. Refresh. Expect the changes to still show.
4. Turn the network off. Expect the installed app to open. Edits can wait until the network is back.

## Open questions

1. <Question>? **Recommended:** <answer>.

---

## Build notes

- **Collections:** <name>: <fields>.
- **Rules:** <collection>: members read; owner edits (`owner = @request.auth.id`).
- **Screens:** `pb_public/<page>.html`, `pb_public/js/<page>.js`.
- **Install:** manifest; service worker caches shell + vendor; Install button.
- **Data:** PocketBase directly. No outbox.
- **Live updates:** <screens, or none>.
- **Tasks:**
  - …
