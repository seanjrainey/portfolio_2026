/**
 * reveal.js — Scroll-triggered reveal animations
 *
 * Watches elements with [data-reveal] and [data-reveal="img"].
 * When they enter the viewport, adds .is-visible which triggers
 * CSS transitions defined in styles.css.
 *
 * Stagger: siblings within the same [data-reveal-group] parent
 * get incrementally larger --reveal-delay values so they
 * animate in sequence rather than all at once.
 *
 * Works with IntersectionObserver (all modern browsers).
 * Degrades gracefully: elements remain visible if JS fails.
 */
(function () {
  'use strict';

  /* Skip if reduced motion is preferred */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Collect all reveal targets ─────────────────────────── */
  var targets = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!targets.length) return;

  /* ── Apply stagger delays within groups ──────────────────── */
  /*
   * A "group" is a direct parent marked with [data-reveal-group],
   * or automatically: siblings that share the same parent and are
   * all [data-reveal] elements (e.g. cards in a work-row).
   */
  var seenParents = new Set();

  targets.forEach(function (el) {
    var parent = el.parentElement;
    if (!parent) return;

    /* Only stagger if parent hasn't been processed */
    if (seenParents.has(parent)) return;
    seenParents.add(parent);

    var siblings = Array.from(parent.querySelectorAll(':scope > [data-reveal]'));
    if (siblings.length <= 1) return; /* no stagger needed */

    siblings.forEach(function (sib, i) {
      sib.style.setProperty('--reveal-delay', (i * 0.1) + 's');
    });
  });

  /* ── IntersectionObserver ────────────────────────────────── */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); /* only trigger once */
    });
  }, {
    threshold: 0.12,        /* reveal when 12% is in view */
    rootMargin: '0px 0px -3% 0px' /* slight bottom offset */
  });

  targets.forEach(function (el) { observer.observe(el); });

  /* Expose so dynamically-injected elements (e.g. archive grid) can register */
  window.__revealObserver = observer;

})();
