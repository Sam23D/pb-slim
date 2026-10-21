# Basecoat on no-build PocketBase apps

Basecoat = shadcn-style components as plain CSS classes plus small vanilla JS. No npm app, no bundler. Pins checked against npm `latest`: Basecoat **1.0.2**, Tailwind browser build **4.3.3**, PocketBase JS SDK **0.28.1**. Copy from the tarball. Do not scrape a CDN. If `latest` has moved, use the newer version and say so.

## Get and pin the files

A new app copies `pb-build/assets/vendor/` as-is. Do not re-download.

To bump a library later:

1. Read `pb-build/assets/vendor/VERSIONS.json`.
2. Download that npm tarball and replace only its versioned folder. Keep the license file.
3. Change the version in `VERSIONS.json`, `index.html`, and `sw.js` together. The folder name is the version.
4. If `latest` has moved, use the newer version and say so. Do not scrape a CDN.

## Page `<head>` order

1. Tailwind browser script.
2. Inline `<style type="text/tailwindcss">@theme { … }</style>`. The browser build reads `@theme` **only from inline blocks**, not linked files.
3. `vendor/basecoat-<v>/basecoat.cdn.min.css`
4. `css/theme.css` — token overrides (`pb-design`).
5. `css/app.css` — app-only parts (signature, lists, charts).

Scripts get `defer`: `basecoat.min.js` first, then component scripts.

The Basecoat CDN CSS ships components only, not general utilities (`grid`, `gap-4`, `text-muted-foreground`). Those come from the Tailwind browser build.

## Theme tokens

Override in `:root` after Basecoat: `--background --foreground --card(-foreground) --popover(-foreground) --primary(-foreground) --secondary(-foreground) --muted(-foreground) --accent(-foreground) --destructive --border --input --ring --radius --font-sans --font-heading --chart-1..5`.

- Keep app meanings (e.g. `--owed`, `--owes`) in the same file. Charts read colors from tokens, not hex in JS.
- No-shadow look: cards use `ring-1` + `shadow-xs` by default; override with `box-shadow: none` + `border: 1px solid var(--border)`.
- Default button is 36px tall. For phones, set `.btn { min-height: 2.5rem }`.
- The toaster sits bottom-right. Top-right: `.toaster { top: 0; bottom: auto; flex-direction: column }`.

## Do not mix with old CSS

- Never load element-wide rules (`button {}`, `input {}`, `a.btn`) next to Basecoat. Unlayered CSS beats Basecoat's `@layer components`.
- If an old stylesheet also uses `.btn`, never load both on one page.

## Markup

- **Button:** `.btn` with `data-variant` = `primary` | `secondary` | `outline` | `ghost` | `link` | `destructive`, `data-size` = `xs` | `sm` | `lg` | `icon`.
- **Card:** `.card > header (h2, p) / section / footer`.
- **Field:** `.field > label + input|select|textarea`. Standalone: `.input`, `select.select`.
- **Checkbox:** `input.input[type=checkbox]` inside a `.label`.
- **Table:** `.table-container > table.table`.
- **Tabs:** `.tabs > nav[role=tablist] > button[role=tab][aria-selected][aria-controls]` + `[role=tabpanel]`; `data-variant="line"` for underline tabs.
- **Badge:** `.badge[data-variant]`. **Alert:** `.alert[data-variant=destructive] > svg + h2 + section`.
- **Button group:** `.button-group`.
- **Dropdown:** `.dropdown-menu > button[aria-haspopup=menu][aria-controls] + [data-popover][aria-hidden=true][data-align=end] > [role=menu] > [role=group] > [role=heading] + a[role=menuitem]`; `hr[role=separator]` between groups.
- **Toast:** `#toaster.toaster > .toast[data-category=success|error|info|warning][data-duration] > .toast-content > svg + section > h2 (+ p)`.

## JS behaviour

- `basecoat.min.js` initialises on DOMContentLoaded and watches the body, so menus and toasts added later still work.
- The dropdown script owns the keyboard, outside-click close, and `aria-expanded`. Do not add your own handlers.
- Build toasts with DOM nodes and `textContent`. `toaster.toast({title, description})` assembles HTML from strings — user data in it is markup injection.
- Show a toast **after** the write's try/catch, so a broken toast helper never looks like a failed save.

## Rolling a restyle across screens

- Mark migrated pages `<html data-ui="basecoat">`; shared scripts branch on it during the rollout.
- Keep every `id`, `name`, and `data-*` the screen JS reads. Change classes and wrappers only.
- Never reuse one `id` for a display node and a form control.
- Pilot 3 high-traffic screens, stop for the PM's look, then do the rest.
