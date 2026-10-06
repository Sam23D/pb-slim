// install.js — registers the service worker and drives the in-site "Install app" button.
// Markup:
//   <button id="install-app" class="btn" hidden>Install app</button>
//   <p id="install-help" hidden>On iPhone: tap Share, then "Add to Home Screen".</p>
(function () {
  if ('serviceWorker' in navigator) {
    var hadController = !!navigator.serviceWorker.controller;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').then(function (reg) {
        // Hash-route tabs never navigate: check for a new release when the tab comes back.
        document.addEventListener('visibilitychange', function () { if (!document.hidden) reg.update(); });
        setInterval(function () { reg.update(); }, 30 * 60 * 1000);
      });
    });
    // A new release took over: reload once so this tab runs the new code (data is in IndexedDB).
    var reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!hadController) { hadController = true; return; }
      if (reloading) return;
      reloading = true;
      location.reload();
    });
  }

  var button = document.getElementById('install-app');
  var help = document.getElementById('install-help');
  var installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  var ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  var deferred = null;

  if (!button || installed) return;

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferred = event;
    button.hidden = false;
  });

  window.addEventListener('appinstalled', function () {
    deferred = null;
    button.hidden = true;
    if (help) help.hidden = true;
  });

  if (ios) button.hidden = false; // iOS has no prompt; the button shows the steps

  button.addEventListener('click', function () {
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; button.hidden = true; });
      return;
    }
    if (help) help.hidden = false;
  });
})();
