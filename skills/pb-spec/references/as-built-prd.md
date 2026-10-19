# As-built PRD (describe an existing app)

Use when they ask what an app *does* today. It is a description, not a wish list. Save as `specs/<slug>-prd.md`. Link the living spec as the forward plan instead of copying it.

## Read, in this order

1. `README.md`, `PRODUCT.md`, existing specs. Intent and vocabulary.
2. `pb_migrations/*.js` in filename order. The order is the feature history; the final rules and fields are the truth.
3. `pb_hooks/*.pb.js`. The automations, plus any `onBootstrap` that re-applies rules (it wins over migrations).
4. Screen calls:
   `grep -noE 'collection\(["'\''][a-z_]+["'\'']\)\.(getFullList|getList|getOne|create|update|delete|authWithPassword)' pb_public/js/*.js`
   → reads and writes per screen. Then take titles, headings, labels and buttons from the HTML for the user-visible verbs.
5. Row counts from a **copy** of the database (see `pb-build/references/local-dev.md`). Never query the live file.

## Shape

One-liner + an "as built" note with links → Who (visitor / member / staff) → What a member can do, grouped by job → Happy path → **Rules table** (read / create / edit / delete per collection, from the server rules) → How numbers are counted, in plain words → **Automations table** (when → what → file) → Screens table (purpose / reads / writes) → Not in the product today → **Risks found while reading** (loose rules, silent hook failures, two sources of truth) → Smoke test → Open questions with recommendations → Appendix of fields.

Derive permission findings from the **server rules**, not the screens. A hidden Edit button is not a lock. `updateRule = authed` means any member can rewrite any row; say that in human terms.

## After the user answers

Add each yes as a "Next floor — <rule>" section in the living spec (demo clicks, defaults, acceptance, not-in-this-floor, build notes). Add phases only if that app is Offline: on. Mark the question decided in the PRD. Ask before building.
