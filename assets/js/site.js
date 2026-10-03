// Theme: follows the device by default; a manual choice is remembered.
// Menu: collapsible navigation on small screens.
// Loaded synchronously in <head> so the saved theme applies before the first paint.
(function () {
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) {}
  root.classList.add('js');

  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
      var sync = function () {
        var dark = isDark();
        themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
        themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        themeBtn.title = themeBtn.getAttribute('aria-label');
      };
      sync();
      themeBtn.addEventListener('click', function () {
        var next = isDark() ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
        sync();
      });
    }

    var menuBtn = document.querySelector('.menu-toggle');
    var nav = document.getElementById('site-nav');
    if (menuBtn && nav) {
      var setOpen = function (open) {
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        nav.classList.toggle('open', open);
      };
      menuBtn.addEventListener('click', function () {
        setOpen(menuBtn.getAttribute('aria-expanded') !== 'true');
      });
      nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
      });
    }
  });
})();
