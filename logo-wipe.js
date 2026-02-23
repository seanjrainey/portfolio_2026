/**
 * logo-wipe.js — Logo hover wipe animation
 *
 * The white panel always travels upward:
 *   HOVER IN  → white slides up from bottom, covers the box
 *   HOVER OUT → white continues upward, exits top; dark returns from below
 *
 * Uses JS-toggled classes. Never sets inline styles — all positions
 * are controlled via CSS classes to avoid animation conflicts.
 */
(function () {
  'use strict';

  var DURATION = 550; // ms — matches CSS animation duration

  document.querySelectorAll('.logo-lockup').forEach(function (lockup) {
    var mark = lockup.querySelector('.logo-mark');
    if (!mark) return;

    var timer = null;
    var state = 'idle'; // idle | in | white | out

    function clearTimer() {
      if (timer) { clearTimeout(timer); timer = null; }
    }

    function setState(cls) {
      mark.classList.remove('is-wiping-in', 'is-white', 'is-wiping-out');
      if (cls) mark.classList.add(cls);
    }

    /* Force CSS animation to restart by briefly removing it */
    function restartAnimation(cls) {
      mark.classList.remove('is-wiping-in', 'is-white', 'is-wiping-out');
      /* Trigger reflow so removing the class takes effect */
      void mark.offsetWidth;
      mark.classList.add(cls);
    }

    lockup.addEventListener('mouseenter', function () {
      clearTimer();

      if (state === 'idle') {
        state = 'in';
        restartAnimation('is-wiping-in');
        timer = setTimeout(function () {
          state = 'white';
          setState('is-white');
        }, DURATION);

      } else if (state === 'out') {
        /* Mouse re-entered while wipe-out was playing —
           restart the wipe-in cleanly from the bottom */
        state = 'in';
        restartAnimation('is-wiping-in');
        timer = setTimeout(function () {
          state = 'white';
          setState('is-white');
        }, DURATION);
      }
      /* Already 'in' or 'white' — nothing to do */
    });

    lockup.addEventListener('mouseleave', function () {
      clearTimer();

      if (state === 'white' || state === 'in') {
        state = 'out';
        restartAnimation('is-wiping-out');
        timer = setTimeout(function () {
          /* Animation finished — snap back to idle (no inline styles) */
          state = 'idle';
          setState(null);
          /* Force the light/dark panels back to their CSS default positions
             by briefly disabling animations, then removing the class */
          mark.classList.add('logo-mark--reset');
          void mark.offsetWidth;
          mark.classList.remove('logo-mark--reset');
        }, DURATION);
      }
    });
  });

}());
