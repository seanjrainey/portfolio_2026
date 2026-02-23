/**
 * transitions.js — Page transition curtain
 *
 * Sequence:
 *   EXIT  — curtain slides UP from bottom, covering the page (0.55s)
 *           → browser navigates
 *   ENTER — curtain is already covering; slides UP out of view (0.65s)
 *           → main content gently lifts in beneath it
 *
 * The site header is position:fixed with z-index above the curtain,
 * so the logo lockup remains visible throughout the transition.
 *
 * Flag: sessionStorage 'sr-nav' = '1' tells the incoming page
 *       that it should play the reveal animation.
 */
(function () {
  'use strict';

  /* ── Inject curtain ──────────────────────────────────────── */
  var curtain = document.createElement('div');
  curtain.className = 'page-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(curtain);

  /* ── Helpers ─────────────────────────────────────────────── */
  function isInternal(anchor) {
    if (!anchor || !anchor.href) return false;
    if (anchor.target === '_blank') return false;
    if (anchor.hasAttribute('download')) return false;
    if (/^(mailto:|tel:|#)/.test(anchor.getAttribute('href') || '')) return false;
    // Hash-only on same page — let browser handle
    if (anchor.pathname === location.pathname && anchor.hash) return false;
    try {
      return new URL(anchor.href).origin === location.origin;
    } catch (e) {
      return false;
    }
  }

  /* ── EXIT: intercept internal link clicks ────────────────── */
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a');
    if (!isInternal(anchor)) return;

    e.preventDefault();
    var dest = anchor.href;

    // Mark so the incoming page knows to play the reveal
    try { sessionStorage.setItem('sr-nav', '1'); } catch (_) {}

    // Restart curtain-in animation cleanly
    curtain.className = 'page-curtain';            // strip modifier classes
    void curtain.offsetWidth;                       // force reflow
    curtain.classList.add('page-curtain--entering');

    // Navigate once curtain fully covers (animation is 0.55s)
    setTimeout(function () {
      location.href = dest;
    }, 530);
  });

  /* ── ENTER: reveal on page load if flagged ───────────────── */
  var arriving = false;
  try {
    arriving = sessionStorage.getItem('sr-nav') === '1';
    if (arriving) sessionStorage.removeItem('sr-nav');
  } catch (_) {}

  if (arriving) {
    // Curtain starts fully covering (translateY(0) via CSS exiting state)
    curtain.classList.add('page-curtain--exiting');

    // Stagger: wait one frame so paint is complete, then reveal content
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var main = document.querySelector('main');
        if (main) {
          main.classList.add('page-content-reveal');
          main.addEventListener('animationend', function () {
            main.classList.remove('page-content-reveal');
          }, { once: true });
        }
      });
    });
  }

})();
