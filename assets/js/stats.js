// Visit statistics (Google Analytics), only with the visitor's permission
// (owner's decision, 12 October 2026). Nothing from Google loads until
// "Allow"; the choice is kept in this browser (localStorage, not a cookie)
// and can be changed from "Visit statistics" in the footer. "No thanks"
// after allowing turns the statistics off and removes their cookies.
(function () {
  'use strict';
  var KEY = 'stats-consent';
  var bar, id;

  function get() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function set(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private browsing: ask again next time */ }
  }

  function gtag() { window.dataLayer.push(arguments); }

  function load() {
    if (window.dataLayer && window.statsLoaded) {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }
    window.statsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    // Statistics only: no advertising features or signals.
    gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
    gtag('js', new Date());
    gtag('config', id, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
  }

  function stop() {
    if (window.statsLoaded) gtag('consent', 'update', { analytics_storage: 'denied' });
    // Remove Google Analytics' cookies (_ga, _ga_<id>) for this host and its parent domain.
    var host = location.hostname, parent = host.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^_ga(_|$)/.test(name)) return;
      [host, '.' + parent, ''].forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  function choose(v) {
    set(v);
    bar.hidden = true;
    if (v === 'yes') load(); else stop();
  }

  function init() {
    bar = document.getElementById('consent');
    if (!bar) return;
    id = bar.getAttribute('data-ga');
    if (!/^G-[A-Z0-9]+$/.test(id || '')) return;
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]');
      if (b) choose(b.getAttribute('data-consent'));
    });
    var open = document.querySelector('[data-consent-open]');
    if (open) {
      open.hidden = false;
      open.addEventListener('click', function () { bar.hidden = false; bar.querySelector('button').focus(); });
    }
    var c = get();
    if (c === 'yes') load();
    else if (c !== 'no') bar.hidden = false;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
