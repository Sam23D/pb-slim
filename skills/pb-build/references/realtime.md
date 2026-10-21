# Realtime

Think like LiveView: the server owns truth, the browser is a projector, clicks become writes, the socket patches only what changed. The live pipe is PocketBase **SSE** (`/api/realtime`), not a second WebSocket server.

**Only on a screen the spec marks Live.** A static screen gets no subscription, even if adding one is easy. If the spec does not say who else writes the data, it is static. Do not upgrade a screen to Live on your own; propose it in the spec and stop.

## Rules

- Collection subscribe (`'*'`) uses the **ListRule**; single-record subscribe uses the **ViewRule**. The rule is the lock. `filter` / `expand` / `fields` on subscribe are query options, **not security**.
- JS hooks **cannot subscribe**. They can **send** custom topics with `SubscriptionMessage`.
- One user can have many clients (tabs). Presence counts connections unless you dedupe by `auth.id`.
- Sign in first, then subscribe. The SDK authorizes the SSE client on the first subscribe.
- The server drops a client that hears nothing for 5 minutes and the SDK reconnects. `PB_CONNECT` fires on every (re)connect. Events sent while the pipe was down are gone.

## Procedure

1. **Name the record.** One collection (or one record) is the source of truth for the screen. Typing, carets, "who is here" are not durable rows; they are a live signal (below).
2. **Rules before socket.** A stranger's subscribe is empty or denied by the rule, not merely filtered in JS.
3. **One subscription per screen,** filtered to what the screen shows. The first load and the subscribe share `filter`, `expand`, `fields`. Never `'*'` without a filter on a collection that grows.
4. **Subscribe, then load.** Open the subscription first, then fetch the list. No event lands in the gap.
5. **Patch by id.** The event writes one row into the same `Map` that `load()` fills, then the same `render()` runs (`data.md`). No second render path.
6. **Reconnect → reload.** On `PB_CONNECT`, run `load()` again.
7. **Leave → unsubscribe.** Call the returned unsubscribe on `pagehide` and when the screen is swapped out.
8. **Quiet.** No toast or flash for a change the user did not make. The row just updates.

## Client (online, the default)

```js
const rows = new Map()
const filter = pb.filter('list = {:id}', { id: listId })

async function load() {
  const list = await pb.collection('items').getFullList({ filter })
  rows.clear()
  for (const r of list) rows.set(r.id, r)
  render()
}

const unsub = await pb.collection('items').subscribe('*', (e) => {
  if (e.action === 'delete') rows.delete(e.record.id)
  else rows.set(e.record.id, e.record)
  render()
}, { filter })

pb.realtime.subscribe('PB_CONNECT', load)
window.addEventListener('pagehide', () => unsub())
await load()
```

`render()` is the one from `data.md`: patch by `data-id`, never `innerHTML` the list.

**Offline variant** (only when they asked for offline): the event goes to `Local.applyRemote(col, e.action, e.record)` and `render` reads `Local.all(col)` on `local:change`. On `PB_CONNECT`, run `sync()` instead of `load()` (`offline-first.md`).

## Live signal: custom topic (presence, typing)

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

## Test (you run it)

Two browser sessions, two members, both on the Live screen. A creates, edits, and deletes a row. B sees each change without touching the page, within a second. B reloads and sees the same list. Then B's network drops and returns: B's list matches A's after `PB_CONNECT`. A guest or a non-member on the same URL sees nothing arrive.

## Antipatterns

- A subscription on a screen the spec did not mark Live.
- Subscribe `'*'` with no filter on a collection that grows.
- JS filter as access control.
- A second render path for events instead of the one `render()`.
- Flash or toast for incoming events the user did not cause.
- No reload on reconnect; no unsubscribe on leave.
- Business rules only in browser JS.
- Multi-server PocketBase: events only exist on the instance that took the write.
