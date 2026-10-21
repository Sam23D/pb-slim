# Pages: one HTML per screen, public pages as files

The app is multi-page. One URL is one screen. No client router, no single `index.html` that swaps views.

## Signed-in screens

- One file per screen: `index.html` (home), `lists.html`, `list.html?id=…`, `settings.html`. Plain `<a href>` between them.
- Every page loads the same head: `theme.css`, `app.css`, the vendor files, `js/app.js` (the SDK client and the auth guard), `js/install.js`. Then its own `js/<page>.js` with that screen's `rows` Map and `render()` (`data.md`).
- The auth guard in `app.js` sends a signed-out visitor to `index.html`. Do it before the first paint: `if (!pb.authStore.isValid && location.pathname !== '/') location.replace('/')`.
- The query string carries the record id. Read it once: `const id = new URLSearchParams(location.search).get('id')`. If it is missing or the record 404s, show a short message with a link home. Do not redirect in a loop.
- A Live screen subscribes in its own `js/<page>.js`. The page going away ends the subscription; still call unsubscribe on `pagehide` (`realtime.md`).
- Add every page to `SHELL` in `sw.js`, so each opens with no signal. The `navigate` fallback stays `/index.html`.

## Public pages

A public page is one that anyone can open with no sign-in and that search engines may index. The spec marks it **Public** in the Screens table. Everything else needs sign-in.

Two shapes. Both are files in `pb_public/`; nothing renders at request time.

### 1. Static HTML (the default)

Landing, about, pricing, help. Write the file. It is the same for everyone and the crawler gets the full page. No JS needed; the Install button script is optional here.

### 2. A hook writes the file (public records)

A shareable record page, a public catalog, a public profile. The data changes rarely and many people read it. A hook renders the HTML with a template literal and writes it under `pb_public/p/`. The file is served as a plain file.

```js
// pb_hooks/pages.js
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) }

module.exports = {
  writeItemPage: function (app, record) {
    // Only fields the spec marks public. Never email, phone, notes, owner, files that are Protected.
    const html = `<!doctype html>
<html lang="en" data-ui="basecoat"><head><meta charset="utf-8">
<title>${esc(record.get('title'))}</title>
<meta name="description" content="${esc(record.get('summary'))}">
<link rel="stylesheet" href="/vendor/basecoat-1.0.2/basecoat.cdn.min.css">
<link rel="stylesheet" href="/css/theme.css"></head>
<body><main class="container"><h1>${esc(record.get('title'))}</h1><p>${esc(record.get('summary'))}</p></main></body></html>`
    const dir = `${__hooks}/../pb_public/p`
    $os.mkdirAll(dir, 0o755)
    $os.writeFile(`${dir}/${record.id}.html`, html, 0o644)
  },
  removeItemPage: function (record) {
    try { $os.remove(`${__hooks}/../pb_public/p/${record.id}.html`) } catch (_) {}
  },
}
```

```js
// pb_hooks/pages.pb.js
onRecordAfterCreateSuccess((e) => { if (e.record.get('public')) require(`${__hooks}/pages.js`).writeItemPage(e.app, e.record); e.next() }, 'items')
onRecordAfterUpdateSuccess((e) => {
  const p = require(`${__hooks}/pages.js`)
  if (e.record.get('public')) p.writeItemPage(e.app, e.record); else p.removeItemPage(e.record)
  e.next()
}, 'items')
onRecordAfterDeleteSuccess((e) => { require(`${__hooks}/pages.js`).removeItemPage(e.record); e.next() }, 'items')
```

Rules for this shape:

- The hook runs as a superuser. It writes **only the fields the spec marks public**. Escape every value. `pb-audit` checks this.
- A `public` boolean (or a status) on the record decides whether the file exists. Turning it off removes the file.
- The file is served at `/p/<id>.html`. Link to it from the signed-in screen with a "Share" button.
- Do not put these pages in `SHELL`. They are public and many; the browser cache is enough.
- Boot repair: an `onBootstrap` pass that rewrites every public record's file is fine. Make it idempotent.

## Not this

- A server template engine (EJS, PocketPages) rendering signed-in screens. The rules stop being the lock, the shell cannot be cached, and Live needs a second mechanism. If a signed-in page must be indexable, say so in the spec and stop; that is the one case outside this stack.
- A client router that fakes pages inside one HTML file.
- A hook route (`routerAdd`) that renders HTML per request for a public page. Write the file instead.
