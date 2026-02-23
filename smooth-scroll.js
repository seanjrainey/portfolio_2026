/**
 * smooth-scroll.js — Mouse-wheel ease (Lenis-style)
 *
 * Only applies to mouse wheel (large discrete deltaY steps).
 * Trackpads are left completely alone — they have native momentum.
 *
 * Detection: trackpads produce many small fractional events;
 * mouse wheels produce a few large integer-step events (~100–120px).
 *
 * On mouse wheel: intercepts the event, accumulates a target,
 * and lerps window.scrollY toward it each frame.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;

  var ease    = 0.10;
  var target  = window.scrollY;
  var current = window.scrollY;
  var running = false;

  /* Sliding window of recent deltaY magnitudes for input detection */
  var samples     = [];
  var SAMPLE_SIZE = 8;

  function isMouseWheel(e) {
    samples.push(Math.abs(e.deltaY));
    if (samples.length > SAMPLE_SIZE) samples.shift();
    if (samples.length < 3) return false;
    /* Mice: deltaY is always a multiple of the line/page size,
       typically 100–120 per notch, never fractional */
    var allLarge = samples.every(function (v) { return v === 0 || v >= 80; });
    var avg = samples.reduce(function (a, b) { return a + b; }, 0) / samples.length;
    return allLarge && avg >= 80;
  }

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

  function step() {
    var delta = target - current;
    if (Math.abs(delta) < 0.3) {
      current = target;
      window.scrollTo(0, current);
      running = false;
      return;
    }
    current += delta * ease;
    window.scrollTo(0, current);
    requestAnimationFrame(step);
  }

  window.addEventListener('wheel', function (e) {
    if (!isMouseWheel(e)) return; /* trackpad — let browser handle */

    e.preventDefault();

    var delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 32;
    if (e.deltaMode === 2) delta *= window.innerHeight;

    target = clamp(target + delta, 0, maxScroll());

    if (!running) {
      running = true;
      /* Sync current to actual scroll position in case user
         moved via keyboard / scrollbar since last wheel event */
      current = window.scrollY;
      requestAnimationFrame(step);
    }
  }, { passive: false });

  /* Keep target in sync when scroll happens via keyboard/scrollbar */
  window.addEventListener('scroll', function () {
    if (!running) {
      current = window.scrollY;
      target  = window.scrollY;
    }
  }, { passive: true });

  window.addEventListener('resize', function () {
    var max = maxScroll();
    target  = clamp(target,  0, max);
    current = clamp(current, 0, max);
  });

}());
