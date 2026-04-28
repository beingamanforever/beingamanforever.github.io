// Mobile nav toggle — the only JS needed on this page.
(function () {
  'use strict';

  const btn = document.getElementById('menu-btn');
  const drawer = document.getElementById('mobile-nav');
  if (!btn || !drawer) return;

  btn.addEventListener('click', function () {
    const open = drawer.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.setAttribute('aria-hidden', String(!open));
  });

  // Close drawer when a link inside it is tapped.
  drawer.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      drawer.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      drawer.setAttribute('aria-hidden', 'true');
    }
  });
}());
