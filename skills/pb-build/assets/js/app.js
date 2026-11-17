// app.js — loaded on every signed-in page, after the SDK. One client, the auth guard,
// refused-write copy, and a safe toast. Screen code lives in js/<page>.js.
// Online only. Do not add outbox.js unless they asked to work with no signal.

const pb = new PocketBase(location.origin) // same origin; no base URL to configure
window.pb = pb

// Signed-out visitors go home, where the sign-in form is. Static public pages do not load this file.
const HOME = ['/', '/index.html']
if (!pb.authStore.isValid && !HOME.includes(location.pathname)) location.replace('/')

// One message for every refused or failed write. The caller keeps the old value and the typed text.
function errorMessage(err) {
  const status = err?.status ?? 0
  if (status === 0) return 'No connection. Your text is still here. Try again when you are back online.'
  if (status === 401 || status === 403) return 'Please sign in again.'
  if (status === 404) return 'You cannot change this, or it was removed.'
  const fields = err?.response?.data || {}
  const first = Object.keys(fields)[0]
  if (first) return `${first}: ${fields[first].message}`
  return err?.response?.message || 'Something went wrong. Try again.'
}

// Basecoat initializes any .toast added to #toaster. Built with textContent, so user data is never markup.
function toast(title, category = 'success') {
  const toaster = document.getElementById('toaster')
  if (!toaster) return
  const el = document.createElement('div')
  el.className = 'toast'
  el.setAttribute('role', category === 'error' ? 'alert' : 'status')
  el.dataset.category = category
  const content = document.createElement('div')
  content.className = 'toast-content'
  const section = document.createElement('section')
  const h2 = document.createElement('h2')
  h2.textContent = title
  section.append(h2)
  content.append(section)
  el.append(content)
  toaster.append(el)
}

window.errorMessage = errorMessage
window.toast = toast
