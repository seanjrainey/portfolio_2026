// ── Card border: keeps chamfer at exactly 50×50px (true 45°) ──
// Sets each .card-border SVG's viewBox to the card's live pixel
// dimensions, so the fixed 50-unit chamfer = 50px always.
(function () {
  var CHAMFER = 50;  // px — matches Figma spec
  var RADIUS  = 4;   // px — 4px corner radius on other 3 corners

  function buildPath(w, h) {
    var c = CHAMFER;
    var r = RADIUS;
    // M = start at chamfer point on top edge
    // straight lines with quadratic curves at the 3 rounded corners
    return [
      'M', c, '0.5',
      'L', w - r, '0.5',
      'Q', w - 0.5, '0.5', w - 0.5, r,
      'L', w - 0.5, h - r,
      'Q', w - 0.5, h - 0.5, w - r, h - 0.5,
      'L', r, h - 0.5,
      'Q', '0.5', h - 0.5, '0.5', h - r,
      'L', '0.5', c,
      'Z'
    ].join(' ');
  }

  function updateSVG(svg) {
    var card = svg.parentElement;
    if (!card) return;
    var w = card.offsetWidth;
    var h = card.offsetHeight;
    if (!w || !h) return;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var path = svg.querySelector('path');
    if (path) path.setAttribute('d', buildPath(w, h));
  }

  function init() {
    var svgs = document.querySelectorAll('.card-border');
    if (!svgs.length) return;

    // Set on load
    svgs.forEach(updateSVG);

    // Update on resize
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) {
          var card = entry.target;
          var svg = card.querySelector('.card-border');
          if (svg) updateSVG(svg);
        });
      });
      svgs.forEach(function (svg) {
        if (svg.parentElement) ro.observe(svg.parentElement);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
