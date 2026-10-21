# Realtime

Think like LiveView: the server owns truth, the browser is a projector, clicks become writes, the socket patches only what changed. The live pipe is PocketBase **SSE** (`/api/realtime`), not a second WebSocket server.

Use it only on a screen the spec names as live. If a refresh is enough, do not subscribe.

## Rules

- Collection subscribe (`'*'`) uses the **ListRule**; single-record subscribe uses the **ViewRule**. `filter` / `expand` / `fields` on subscribe are query options, **not security**.
- JS hooks **cannot subscribe**. They can **send** custom topics with `SubscriptionMessage`.
- One user can have many clients (tabs). Presence counts connections unless you dedupe by `auth.id`.
- Sign in first, then subscribe.

## Procedure

1. **Name the record.** One collection is the source of truth for the widget. Typing, carets, "who is here" are not durable rows.
2. **Rules before socket.** A stranger's subscribe is empty or denied, not merely filtered in JS.
3. **Same query twice.** The first load and the subscribe share `filter`, `expand`, `fields`.
4. **Patch by id.** Insert, replace one node, remove one node. Never `innerHTML` the whole list; it kills focus and in-progress edits. Key nodes by `data-id`, not array index.
5. **Reconnect → reload.** On `PB_CONNECT`, fetch the list again. Events sent while the pipe was down are gone.
6. **Leave → unsubscribe.** Call the returned unsubscribe on `pagehide`.

## Client (online, the default)

```js
const rows = new Map()

async function load() {
  const list = await pb.collection('items').getFullList({ filter: pb.filter('list = {:id}', { id: listId }) })
  rows.clear()
  for (const r of list) rows.set(r.id, r)
  render()
}

const unsub = await pb.collection('items').subscribe('*', (e) => {
  if (e.action === 'delete') rows.delete(e.record.id)
  else rows.set(e.record.id, e.record)
  render()
}, { filter: pb.filter('list = {:id}', { id: listId }) })

pb.realtime.subscribe('PB_CONNECT', load)
window.addEventListener('pagehide', () => unsub())
await load()
```

`render` patches by `data-id`:

```js
function render() {
  const list = document.getElementById('list')
  const seen = new Set()
  for (const rec of rows.values()) {
    seen.add(rec.id)
    let el = list.querySelector(`[data-id="${rec.id}"]`)
    if (!el) { el = document.createElement('li'); el.dataset.id = rec.id; list.append(el) }
    el.textContent = rec.title
  }
  for (const el of list.querySelectorAll('[data-id]')) if (!seen.has(el.dataset.id)) el.remove()
}
```

**Offline variant** (only when they asked for offline): the event goes to `Local.applyRemote(col, e.action, e.record)` and `render` reads `Local.all(col)` on `local:change`. On `PB_CONNECT`, run `sync()` instead of `load()` (`offline-first.md`).

## Custom topic (ephemeral: presence, typing)

Hook side (send only):

```js
function pushTopic(name, data, keep) {
  const message = new SubscriptionMessage({ name: name, data: JSON.stringify(data) })
  const clients = $app.subscriptionsBroker().clients()
  for (const id in clients) {
    const c = clients[id]
    if (c.hasSubscription(name) && keep(c)) c.send(message)
  }
}

onRealtimeSubscribeRequest((e) => {
  for (const sub of e.subscriptions) {
    if (String(sub).startsWith('admin_') && !e.client.get('auth')) {
      throw new ForbiddenError('unauthorized subscription')
    }
  }
  e.next()
})
```

Browser: `pb.realtime.subscribe('lists/' + id + '/presence', (data) => { /* patch a presence strip */ })`.

Durable data (messages, cards, bills) belongs in a collection, not a custom topic: then rules, admin, and backups come free.

## Presence ("who is here now") — what works (checked on 0.40)

- Topic per room: `presence/<roomId>`. In `onRealtimeSubscribeRequest`, broadcast the room's online list (before and after `e.next()`) to clients that hold the topic **and** are members (`c.get("auth")` + a membership lookup). Strangers who subscribe get nothing and are not counted.
- **Never hold `e.next()` in `onRealtimeConnectRequest` to detect disconnects.** It parks a JS runtime per open connection; with the default pool (15) the hooks starve.
- Closing the app: the browser drops the SSE connection *before* a pagehide `POST /api/realtime` lands. Use a custom route instead: `routerAdd("POST", "/api/<app>/leave", …, $apis.requireAuth("<auth>"))` called with `fetch(…, {keepalive: true})` on `pagehide`; broadcast excluding that auth id.
- Lost signal / killed app: `cronAdd("presence_sweep", "* * * * *", …)` rebroadcasts every watched room; dead connections are gone from `subscriptionsBroker().clients()` by then (Away within ~1 min).
- Client: subscribe only while the screen that shows presence is open; unsubscribe on leave.
- **A failed subscribe sticks.** The JS SDK keeps the listener even when the subscribe POST failed, and only resends subscriptions on a full reconnect. Fix: on a failed `pb.realtime.subscribe(topic, …)`, call `pb.realtime.unsubscribe(topic)`; remember the wanted topic and retry on `PB_CONNECT` and when the tab becomes visible.
- Test with a raw-socket SSE client: `urllib` keeps the socket alive after `close()`, so a "disconnect" test passes or fails for the wrong reason.
- The one-minute sweep can resend an unchanged list at any moment. A test that expects "no message in this second" flakes; expect "no change".

## Antipatterns

- Realtime everywhere; subscribe `'*'` with no filter on a large collection.
- JS filter as access control.
- Flash or toast for incoming events the user did not cause.
- No reload on reconnect; no unsubscribe on leave.
- Business rules only in browser JS.
- Multi-server PocketBase: events only exist on the instance that took the write.
