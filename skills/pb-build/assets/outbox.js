// outbox.js — local-first data for PB Slim apps. No dependencies.
// Phase 1: Local.all / get / save / remove / pending (works with no network).
// Phase 2: Local.flush(pb) / pull(pb, col, query) / applyRemote(col, action, record).
(function () {
  var DB_NAME = 'app';          // one per app
  var DB_VERSION = 1;           // bump when COLLECTIONS changes
  var COLLECTIONS = ['items'];  // collections kept on the device
  var SYSTEM = ['collectionId', 'collectionName', 'created', 'updated', 'expand'];

  var dbPromise = null;
  var flushing = false;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        COLLECTIONS.forEach(function (c) {
          if (!db.objectStoreNames.contains(c)) db.createObjectStore(c, { keyPath: 'id' });
        });
        if (!db.objectStoreNames.contains('outbox')) {
          db.createObjectStore('outbox', { keyPath: 'seq', autoIncrement: true });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbPromise;
  }

  function result(req) {
    return new Promise(function (resolve, reject) {
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function done(tx) {
    return new Promise(function (resolve, reject) {
      tx.oncomplete = function () { resolve(); };
      tx.onerror = tx.onabort = function () { reject(tx.error); };
    });
  }

  function emit() {
    window.dispatchEvent(new CustomEvent('local:change'));
  }

  // PocketBase-compatible id: 15 chars, a-z0-9. Same id on the device and the server.
  function newId() {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var bytes = crypto.getRandomValues(new Uint8Array(15));
    return Array.prototype.map.call(bytes, function (b) { return chars[b % 36]; }).join('');
  }

  function payload(rec) {
    var out = {};
    Object.keys(rec).forEach(function (k) {
      if (k === 'id' || k.charAt(0) === '_' || SYSTEM.indexOf(k) !== -1) return;
      out[k] = rec[k];
    });
    return out;
  }

  async function outboxItems() {
    var db = await open();
    return result(db.transaction('outbox').objectStore('outbox').getAll());
  }

  // ---------- Phase 1 ----------

  async function all(col) {
    var db = await open();
    return result(db.transaction(col).objectStore(col).getAll());
  }

  async function get(col, id) {
    var db = await open();
    return result(db.transaction(col).objectStore(col).get(id));
  }

  async function save(col, data) {
    var db = await open();
    var rec = Object.assign({}, data);
    var op = rec.id ? 'update' : 'create';
    if (!rec.id) rec.id = newId();
    rec._localAt = new Date().toISOString();
    var tx = db.transaction([col, 'outbox'], 'readwrite');
    tx.objectStore(col).put(rec);
    tx.objectStore('outbox').add({ op: op, col: col, id: rec.id, data: payload(rec), at: rec._localAt });
    await done(tx);
    emit();
    return rec;
  }

  async function remove(col, id) {
    var db = await open();
    var tx = db.transaction([col, 'outbox'], 'readwrite');
    tx.objectStore(col).delete(id);
    tx.objectStore('outbox').add({ op: 'delete', col: col, id: id, at: new Date().toISOString() });
    await done(tx);
    emit();
  }

  async function pending() {
    var items = await outboxItems();
    return items.filter(function (i) { return !i.failed; }).length;
  }

  async function failed() {
    var items = await outboxItems();
    return items.filter(function (i) { return i.failed; });
  }

  // ---------- Phase 2 ----------

  function idTaken(err) {
    return err && err.status === 400 && err.response && err.response.data && err.response.data.id;
  }

  async function push(pb, item) {
    var c = pb.collection(item.col);
    if (item.op === 'delete') {
      try { await c.delete(item.id); } catch (err) { if (err.status !== 404) throw err; }
      return;
    }
    if (item.op === 'create') {
      try { await c.create(Object.assign({ id: item.id }, item.data)); return; }
      catch (err) { if (!idTaken(err)) throw err; }   // created before, response lost
      await c.update(item.id, item.data);
      return;
    }
    try { await c.update(item.id, item.data); }
    catch (err) {
      if (err.status !== 404) throw err;              // server never saw it
      await c.create(Object.assign({ id: item.id }, item.data));
    }
  }

  async function flush(pb) {
    if (flushing || !navigator.onLine) return;
    flushing = true;
    try {
      var db = await open();
      var items = await outboxItems();
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.failed) continue;
        try {
          await push(pb, item);
        } catch (err) {
          if (!err || !err.status) break;            // network: stop, retry later
          item.failed = (err.response && err.response.message) || err.message || String(err.status);
          var ftx = db.transaction('outbox', 'readwrite');
          ftx.objectStore('outbox').put(item);       // keep it; show it to the user
          await done(ftx);
          continue;
        }
        var tx = db.transaction('outbox', 'readwrite');
        tx.objectStore('outbox').delete(item.seq);
        await done(tx);
      }
    } finally {
      flushing = false;
      emit();
    }
  }

  async function retry(seq) {
    var db = await open();
    var item = await result(db.transaction('outbox').objectStore('outbox').get(seq));
    if (!item) return;
    delete item.failed;
    var tx = db.transaction('outbox', 'readwrite');
    tx.objectStore('outbox').put(item);
    await done(tx);
  }

  async function discard(seq) {
    var db = await open();
    var tx = db.transaction('outbox', 'readwrite');
    tx.objectStore('outbox').delete(seq);
    await done(tx);
    emit();
  }

  // Replace the local copy with the server list, keeping records that still have pending edits.
  async function pull(pb, col, query) {
    var rows = await pb.collection(col).getFullList(query || {});
    var busy = new Set((await outboxItems()).filter(function (i) { return i.col === col; }).map(function (i) { return i.id; }));
    var db = await open();
    var local = await result(db.transaction(col).objectStore(col).getAll());
    var tx = db.transaction(col, 'readwrite');
    var store = tx.objectStore(col);
    store.clear();
    rows.forEach(function (r) { if (!busy.has(r.id)) store.put(r); });
    local.forEach(function (r) { if (busy.has(r.id)) store.put(r); });
    await done(tx);
    emit();
  }

  // Realtime event → local copy. Local edits not yet synced win until they sync.
  async function applyRemote(col, action, record) {
    var busy = (await outboxItems()).some(function (i) { return i.col === col && i.id === record.id; });
    if (busy) return;
    var db = await open();
    var tx = db.transaction(col, 'readwrite');
    if (action === 'delete') tx.objectStore(col).delete(record.id);
    else tx.objectStore(col).put(record);
    await done(tx);
    emit();
  }

  window.Local = {
    newId: newId,
    all: all, get: get, save: save, remove: remove, pending: pending, failed: failed,
    flush: flush, retry: retry, discard: discard, pull: pull, applyRemote: applyRemote,
  };
})();
