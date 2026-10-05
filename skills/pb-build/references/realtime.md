# Realtime (phase 2)

Think like LiveView: the server owns truth, the browser is a projector, clicks become writes, the socket patches only what changed. In this stack the projector is the **local IndexedDB copy**: realtime events update `Local`, then the screen re-renders from `Local`.

The live pipe is PocketBase **SSE** (`/api/realtime`), not a second WebSocket server.

## Rules

- Collection subscribe (`'*'`) uses the **ListRule**; single-record subscribe uses the **ViewRule**. `filter` / `expand` / `fields` on subscribe are query options, **not security**.
- JS hooks **cannot subscribe**. They can **send** custom topics with `SubscriptionMessage`.
- One user can have many clients (tabs). Presence counts connections unless you dedupe by `auth.id`.
- Sign in first, then subscribe.

## Procedure

1. **Need live?** If a refresh is enough, do not subscribe.
2. **Name the record.** One collection is the source of truth for the widget. Typing, carets, "who is here" are not durable rows.
3. **Rules before socket.** A stranger's subscribe is empty or denied, not merely filtered in JS.
4. **Same query twice.** Pull and subscribe share `filter`, `expand`, `fields`.
5. **Write through `Local`.** Clicks never invent shared state in memory only.
6. **Patch by id.** Insert, replace one node, remove one node. Never `innerHTML` the whole list; it kills focus and in-progress edits. Key nodes by `data-id`, not array index.
7. **Reconnect → sync.** On `PB_CONNECT`, flush the outbox and pull.
8. **Leave → unsubscribe.** Call the returned unsubscribe on `pagehide`.

## Client island

```js
const unsub = await pb.collection('items').subscribe('*', (e) => {
  Local.applyRemote('items', e.action, e.record)   // skips records with pending local edits
}, { filter: pb.filter('list = {:id}', { id: listId }) })

window.addEventListener('local:change', render)    // render reads Local.all('items')
window.addEventListener('pagehide', () => unsub())
```

`render` patches by `data-id`:

```js
async function render() {
  const list = document.getElementById('list')
  const rows = await Local.all('items')
  const seen = new Set()
  for (const rec of rows) {
    seen.add(rec.id)
    let el = list.querySelector(`[data-id="${rec.id}"]`)
    if (!el) { el = document.createElement('li'); el.dataset.id = rec.id; list.append(el) }
    el.textContent = rec.title
  }
  for (const el of list.querySelectorAll('[data-id]')) if (!seen.has(el.dataset.id)) el.remove()
}
```

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

## Antipatterns

- Realtime everywhere; subscribe `'*'` with no filter on a large collection.
- JS filter as access control.
- Flash or toast for incoming events the user did not cause.
- No refetch on reconnect; no unsubscribe on leave.
- Business rules only in browser JS.
- Multi-server PocketBase: events only exist on the instance that took the write.
