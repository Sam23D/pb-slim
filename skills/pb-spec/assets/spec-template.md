# <Product name>

<One line: what this is and who it is for.>

## v1 (floor)

Time to demo: <10> minutes.

1. Open <url>. Tap **Install app**.
2. Sign up with email and password.
3. <Click> …
4. <Expected result> …

## Phases

- **After phase 1 (offline):** <what the user can do with no signal>.
- **After phase 2 (online):** <what syncs; what appears live>.

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

- Two people edit the same item offline. The last one to sync wins.
- <Screen> needs a live connection. It does not work offline because <reason>.

## Acceptance

### Phase 1 — offline

1. Install the app. Turn on airplane mode.
2. <Do the happy path>. Expect "Saved on this device".
3. Close and reopen the app. Expect the changes to still show.

### Phase 2 — online

1. Use two devices with two members.
2. Device A goes offline and edits <item>. Device A goes online.
3. Expect device B to show the edit without a refresh.

## Open questions

1. <Question>? **Recommended:** <answer>.

---

## Build notes

- **Collections:** <name>: <fields>.
- **Rules:** <collection>: members read; owner edits (`owner = @request.auth.id`).
- **Screens:** `pb_public/<page>.html`, `pb_public/js/<page>.js`.
- **Phase 1:** IndexedDB stores <…>; service worker caches shell + vendor; outbox; manifest; Install button.
- **Phase 2:** sync order <…>; conflict rule <…>; live updates on <screens>.
- **Tasks:**
  - Phase 1: …
  - Phase 2: …
