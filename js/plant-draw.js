/* ============================================================
   plant-draw.js — the plant, drawn and lit.  SHARED: labs-shared/plant/plant-draw.js
   is the source; the Plants Hub syncs it in and the Plants Lab's build copies it.

   A bean plant in a section of ground, from the seed under the surface to the fruit
   at the top, with a cactus on the dry side and a water lily on the wet side. It is
   drawn once, here, so the hub and the lab show the same plant; each page decides
   what to do with it. The hub grows it stage by stage (grow); the lab lights the
   part a station is about and flies the camera to it (light, flyTo).

     PlantDraw(svg, PLANT, { map, tag, full, onEnter, onLeave, onClick })

   returns { G, FULL, light, lightMany, clear, grow, flow, breathe, bend, pin, elFor,
             flyTo, boxOf, boxOfLit, isZoomed, view }.

   Nothing here is a photograph: the plant is line and flat colour, drawn to the
   drawing rules the labs teach — one outline per part, no shading for effect.
   ============================================================ */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function f(v) { return Math.round(v * 10) / 10; }
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  /* a small deterministic scatter, so the root hairs and stones land in the same
     places on every page and every load */
  function rnd(seed) { var s = seed >>> 0; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }

  /* the drawing's own stylesheet travels with it, so both pages light and grow it the
     same way. Colours a page may want to change are variables with defaults. */
  var STYLE =
    '.pl-part{transition:opacity .3s,filter .3s}' +
    'svg.lit .pl-part{opacity:.34}' +
    'svg.lit .pl-part.is-on{opacity:1;filter:drop-shadow(0 0 7px var(--c,#B8F08E)) drop-shadow(0 0 20px color-mix(in srgb,var(--c,#B8F08E) 60%,transparent))}' +
    'svg.lit .pl-ground{opacity:.8}' +
    /* growing: a part not yet grown is folded down to nothing at its base */
    '.pl-grows{transition:transform .9s cubic-bezier(.2,.7,.2,1),opacity .55s ease}' +
    '.pl-grows:not(.is-shown){opacity:0;transform:scale(.02)}' +
    '.pl-grows--up:not(.is-shown){transform:scale(1,.02)}' +
    /* the sap: dashed lines that only show when asked for */
    '.pl-flow{fill:none;stroke-width:4;stroke-linecap:round;stroke-dasharray:6 12;opacity:0;transition:opacity .4s}' +
    '.pl-flow--xylem{stroke:#4FB3E8}.pl-flow--phloem{stroke:#F2A93B}' +
    'svg.flow-xylem .pl-flow--xylem,svg.flow-both .pl-flow--xylem{opacity:1;animation:pl-run 1.1s linear infinite}' +
    'svg.flow-phloem .pl-flow--phloem,svg.flow-both .pl-flow--phloem{opacity:1;animation:pl-run 1.1s linear infinite}' +
    '@keyframes pl-run{from{stroke-dashoffset:36}to{stroke-dashoffset:0}}' +
    /* water vapour leaving the leaves */
    '.pl-vap{fill:#D8EEFA;opacity:0}' +
    'svg.is-breathing .pl-vap{animation:pl-vap 2.6s ease-out infinite}' +
    'svg.is-breathing .pl-vap:nth-child(2){animation-delay:.8s}svg.is-breathing .pl-vap:nth-child(3){animation-delay:1.6s}' +
    '@keyframes pl-vap{0%{opacity:0;transform:translateY(0) scale(.6)}20%{opacity:.95}100%{opacity:0;transform:translateY(-70px) scale(1.7)}}' +
    /* the shoot leaning to the light */
    '.pl-bends{transition:transform 1.4s cubic-bezier(.3,.6,.2,1)}' +
    'svg.is-bent .pl-bends{transform:rotate(9deg)}' +
    '.pl-hot{fill:transparent;cursor:pointer;outline:none}' +
    '.pl-hit:focus-visible .pl-hot{stroke:var(--c,#B8F08E);stroke-width:2;stroke-dasharray:4 4}' +
    '@media (prefers-reduced-motion:reduce){.pl-part,.pl-grows,.pl-bends{transition:none}.pl-flow,.pl-vap{animation:none!important}svg.flow-xylem .pl-flow--xylem,svg.flow-both .pl-flow--xylem,svg.flow-phloem .pl-flow--phloem,svg.flow-both .pl-flow--phloem{opacity:1}svg.is-breathing .pl-vap{opacity:.6}}';

  function PlantDraw(svg, P, opts) {
    opts = opts || {};
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var map = opts.map || svg.parentNode, tag = opts.tag || null;
    var hooks = { enter: opts.onEnter || function () {}, leave: opts.onLeave || function () {}, click: opts.onClick || function () {} };
    var S = P.scene, FULL = opts.full || { x: 0, y: 0, w: S.w, h: S.h };
    var G = {}; (P.parts || []).forEach(function (p) { G[p.id] = p; });
    var X = S.plantX, H = 760;      /* the soil line in the drawing's own coordinates */

    /* what each lit-able name means in the drawing */
    var MEMBERS = {
      seed: ['seed'], roots: ['roots'], stem: ['stem'], leaf: ['leaf-1'],
      leaves: ['leaf-1', 'leaf-2', 'leaf-3', 'leaf-4'], flower: ['flower', 'flower-spent'], fruit: ['fruit'],
      sun: ['sun'], xerophyte: ['xerophyte'], hydrophyte: ['hydrophyte'], seedling: ['seedling'],
      plant: ['seed', 'roots', 'stem', 'leaf-1', 'leaf-2', 'leaf-3', 'leaf-4', 'flower', 'flower-spent', 'fruit']
    };

    /* ---------- defs and style ---------- */
    var defs = svg.querySelector('defs') || el('defs', {}, svg);
    if (!svg.querySelector('style.pl-style')) { var st = el('style', { 'class': 'pl-style' }, defs); st.textContent = STYLE; }
    function grad(id, stops, radial) {
      var g = el(radial ? 'radialGradient' : 'linearGradient', radial ? { id: id, cx: '50%', cy: '50%', r: '50%' } : { id: id, x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
      stops.forEach(function (s) { el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] == null ? 1 : s[2] }, g); });
    }
    grad('pl-soil', [[0, '#B6824F'], [.12, '#8E5F36'], [.35, '#5B3B21'], [1, '#4A3019']]);
    grad('pl-sun', [[0, '#FFE7A1', .9], [.5, '#FFD86E', .25], [1, '#FFD86E', 0]], true);
    grad('pl-water', [[0, '#A9DBF5'], [1, '#5FA9DC']]);

    /* the drawing is laid out with its soil line at 760; the register may put the horizon
       higher, so the whole drawing is shifted to match and every box is read in scene units */
    var DY = (S.horizon || 760) - 760;
    var root = el('g', { 'class': 'pl-root', transform: 'translate(0 ' + f(DY) + ')' }, svg);
    function part(id, cls, grows, origin) {
      var g = el('g', { 'class': 'pl-part' + (cls ? ' ' + cls : '') + (grows ? ' pl-grows' + (grows === 'up' ? ' pl-grows--up' : '') : ''), 'data-part': id }, root);
      if (origin) g.style.transformOrigin = f(origin[0]) + 'px ' + f(origin[1]) + 'px';
      return g;
    }

    /* ---------- the ground ---------- */
    var ground = el('g', { 'class': 'pl-ground' }, root);
    el('circle', { cx: 760, cy: 150, r: 130, fill: 'url(#pl-sun)' }, ground);
    var sunG = part('sun', 'pl-sun');
    el('circle', { cx: 760, cy: 150, r: 46, fill: '#F7CF5A', stroke: '#E4B43C', 'stroke-width': 2 }, sunG);
    /* the pond, cut into the ground on the wet side */
    el('ellipse', { cx: 1010, cy: H + 34, rx: 150, ry: 44, fill: '#4E3A25' }, ground);
    /* the soil, in section */
    /* the ground runs far past the scene on both sides and well below it, so a window of
       any shape — a wide screen, a tall phone — never finds its edge */
    var edge = 'M-4000 ' + H + ' L0 ' + H + ' C200 ' + (H - 12) + ' 400 ' + (H + 12) + ' 560 ' + H + ' C760 ' + (H - 12) + ' 860 ' + (H + 8) + ' 1600 ' + H + ' L5600 ' + H;
    el('path', { d: edge + ' L5600 ' + (S.h - DY + 1600) + ' L-4000 ' + (S.h - DY + 1600) + ' Z', fill: 'url(#pl-soil)' }, ground);
    el('path', { d: edge, fill: 'none', stroke: '#6B462A', 'stroke-width': 5, opacity: .55 }, ground);
    var r1 = rnd(7);
    for (var i = 0; i < 26; i++) {
      var sx = 40 + r1() * 1520, sy = H + 60 + r1() * 330, sr = 3 + r1() * 7;
      if (sx > 470 && sx < 660) continue;                       /* not through the roots */
      el('ellipse', { cx: f(sx), cy: f(sy), rx: f(sr), ry: f(sr * .65), fill: r1() > .5 ? '#7B5535' : '#A47A52', opacity: .7 }, ground);
    }
    /* dry ground for the cactus */
    el('ellipse', { cx: 250, cy: H + 2, rx: 165, ry: 20, fill: '#E7D3A3' }, ground);
    /* the water, over the mud */
    el('ellipse', { cx: 1010, cy: H + 24, rx: 150, ry: 34, fill: 'url(#pl-water)', stroke: '#3F8FC4', 'stroke-width': 1.5 }, ground);
    el('ellipse', { cx: 1010, cy: H + 18, rx: 120, ry: 12, fill: '#CDEBFA', opacity: .55 }, ground);

    /* ---------- the roots, in the soil ---------- */
    var roots = part('roots', 'pl-roots', true, [X, 830]);
    el('path', { d: 'M' + (X - 8) + ' 830 C' + (X - 14) + ' 900 ' + (X - 4) + ' 980 ' + (X - 8) + ' 1060 L' + X + ' 1096 L' + (X + 8) + ' 1060 C' + (X + 12) + ' 980 ' + (X + 14) + ' 900 ' + (X + 8) + ' 830 Z',
               fill: '#EADFC6', stroke: '#B9A67E', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, roots);
    var LATERALS = [
      ['M' + (X - 6) + ' 862 C' + (X - 60) + ' 872 ' + (X - 100) + ' 902 ' + (X - 130) + ' 952', [X - 130, 952]],
      ['M' + (X + 6) + ' 898 C' + (X + 62) + ' 908 ' + (X + 100) + ' 950 ' + (X + 130) + ' 992', [X + 130, 992]],
      ['M' + (X - 5) + ' 950 C' + (X - 50) + ' 960 ' + (X - 80) + ' 1000 ' + (X - 92) + ' 1044', [X - 92, 1044]],
      ['M' + (X + 5) + ' 988 C' + (X + 50) + ' 998 ' + (X + 76) + ' 1036 ' + (X + 88) + ' 1072', [X + 88, 1072]],
      ['M' + (X - 4) + ' 1010 C' + (X - 30) + ' 1030 ' + (X - 40) + ' 1060 ' + (X - 44) + ' 1088', [X - 44, 1088]]
    ];
    LATERALS.forEach(function (L) {
      el('path', { d: L[0], fill: 'none', stroke: '#E4D6B6', 'stroke-width': 6, 'stroke-linecap': 'round' }, roots);
      el('path', { d: L[0], fill: 'none', stroke: '#B9A67E', 'stroke-width': .8, 'stroke-linecap': 'round', opacity: .7 }, roots);
    });
    /* root hairs: a fuzz near the tip of every lateral — the surface area that takes water in */
    var hairs = el('g', { 'class': 'pl-roothairs', stroke: '#F5EEDD', 'stroke-width': 1.3, 'stroke-linecap': 'round', opacity: .95 }, roots);
    /* a fuzz of root hairs along the young part of every root, just behind the tip, each one
       standing out from the root's own direction — that is where the water comes in */
    function bez(P0, P1, P2, P3, t) {
      var u = 1 - t;
      return [u * u * u * P0[0] + 3 * u * u * t * P1[0] + 3 * u * t * t * P2[0] + t * t * t * P3[0],
              u * u * u * P0[1] + 3 * u * u * t * P1[1] + 3 * u * t * t * P2[1] + t * t * t * P3[1]];
    }
    function fuzz(P0, P1, P2, P3, from, to, n, seed2) {
      var r = rnd(seed2);
      for (var i = 0; i < n; i++) {
        var t = from + (to - from) * (i + r() * .6) / n, p = bez(P0, P1, P2, P3, t), q = bez(P0, P1, P2, P3, Math.min(1, t + .02));
        var dx = q[0] - p[0], dy = q[1] - p[1], m = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / m, ny = dx / m;
        var len = 8 + r() * 11, side = r() > .5 ? 1 : -1, wobble = (r() - .5) * .5;
        el('line', { x1: f(p[0]), y1: f(p[1]), x2: f(p[0] + (nx + wobble * dx / m) * len * side), y2: f(p[1] + (ny + wobble * dy / m) * len * side) }, hairs);
      }
    }
    LATERALS.forEach(function (L, i) {
      var m = L[0].match(/-?[\d.]+/g).map(Number);
      fuzz([m[0], m[1]], [m[2], m[3]], [m[4], m[5]], [m[6], m[7]], .55, .98, 26, 20 + i);
    });
    fuzz([X, 900], [X, 960], [X, 1020], [X, 1090], .3, .95, 22, 31);

    /* ---------- the seed, just under the surface ---------- */
    var seed = part('seed', 'pl-seed', true, [X, 800]);
    el('path', { d: 'M' + (X - 36) + ' 796 C' + (X - 36) + ' 776 ' + (X - 14) + ' 770 ' + X + ' 776 C' + (X + 16) + ' 770 ' + (X + 38) + ' 778 ' + (X + 38) + ' 798 C' + (X + 38) + ' 820 ' + (X + 16) + ' 828 ' + X + ' 824 C' + (X - 14) + ' 828 ' + (X - 36) + ' 818 ' + (X - 36) + ' 796 Z',
               fill: '#C99A5B', stroke: '#7E5227', 'stroke-width': 1.8 }, seed);
    el('path', { d: 'M' + (X - 30) + ' 794 C' + (X - 10) + ' 800 ' + (X + 12) + ' 800 ' + (X + 32) + ' 794', fill: 'none', stroke: '#8A5A2A', 'stroke-width': 1.2, opacity: .8 }, seed);
    el('ellipse', { cx: X + 24, cy: 810, rx: 5, ry: 3, fill: '#7E5227' }, seed);   /* the hilum, where it hung in the pod */

    /* ---------- the plant above ground: one group so it can lean to the light ---------- */
    var shoot = el('g', { 'class': 'pl-shoot pl-bends' }, root);
    shoot.style.transformOrigin = f(X) + 'px 805px';

    /* the seedling: what the seed sends up first — a hooked shoot and two seed leaves */
    var seedling = part('seedling', 'pl-seedling', true, [X, 800]);
    shoot.appendChild(seedling);
    el('path', { d: 'M' + (X - 2) + ' 782 C' + (X - 6) + ' 740 ' + (X + 8) + ' 710 ' + (X + 26) + ' 690', fill: 'none', stroke: '#7CC97A', 'stroke-width': 9, 'stroke-linecap': 'round' }, seedling);
    el('ellipse', { cx: X + 4, cy: 672, rx: 26, ry: 15, transform: 'rotate(-28 ' + (X + 4) + ' 672)', fill: '#8FD48A', stroke: '#3F9A55', 'stroke-width': 1.5 }, seedling);
    el('ellipse', { cx: X + 46, cy: 668, rx: 26, ry: 15, transform: 'rotate(22 ' + (X + 46) + ' 668)', fill: '#8FD48A', stroke: '#3F9A55', 'stroke-width': 1.5 }, seedling);

    /* the stem */
    var stem = part('stem', 'pl-stem', 'up', [X, 805]);
    shoot.appendChild(stem);
    el('path', { d: 'M' + (X - 9) + ' 805 C' + (X - 13) + ' 690 ' + (X - 5) + ' 560 ' + (X - 9) + ' 430 C' + (X - 11) + ' 340 ' + (X - 5) + ' 290 ' + (X - 5) + ' 250 L' + (X + 5) + ' 250 C' + (X + 5) + ' 290 ' + (X + 11) + ' 340 ' + (X + 9) + ' 430 C' + (X + 5) + ' 560 ' + (X + 13) + ' 690 ' + (X + 9) + ' 805 Z',
               fill: '#3E9A57', stroke: '#2F7D46', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, stem);
    el('path', { d: 'M' + (X - 3) + ' 790 C' + (X - 6) + ' 690 ' + (X + 1) + ' 560 ' + (X - 3) + ' 430 C' + (X - 5) + ' 340 ' + (X - 1) + ' 300 ' + (X - 1) + ' 262', fill: 'none', stroke: '#6FC482', 'stroke-width': 2, opacity: .7 }, stem);

    /* a leaf: base, direction, length and width; midrib and a net of veins */
    function leaf(id, bx, by, dx, dy, len, wid, petiole) {
      var m = Math.sqrt(dx * dx + dy * dy), ux = dx / m, uy = dy / m, nx = -uy, ny = ux;
      var g = part(id, 'pl-leaf', true, [bx, by]);
      shoot.appendChild(g);
      if (petiole) el('path', { d: 'M' + f(petiole[0]) + ' ' + f(petiole[1]) + ' Q' + f((petiole[0] + bx) / 2 + nx * 6) + ' ' + f((petiole[1] + by) / 2 + ny * 6) + ' ' + f(bx) + ' ' + f(by), fill: 'none', stroke: '#2F7D46', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      var tx = bx + ux * len, ty = by + uy * len;
      var c1x = bx + ux * len * .38 + nx * wid * .62, c1y = by + uy * len * .38 + ny * wid * .62;
      var c2x = bx + ux * len * .38 - nx * wid * .62, c2y = by + uy * len * .38 - ny * wid * .62;
      el('path', { d: 'M' + f(bx) + ' ' + f(by) + ' Q' + f(c1x) + ' ' + f(c1y) + ' ' + f(tx) + ' ' + f(ty) + ' Q' + f(c2x) + ' ' + f(c2y) + ' ' + f(bx) + ' ' + f(by) + ' Z',
                 fill: '#5DBF6E', stroke: '#2A6B3B', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
      var veins = el('g', { fill: 'none', stroke: '#2A6B3B', 'stroke-width': 1.1, opacity: .75, 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M' + f(bx) + ' ' + f(by) + ' L' + f(tx - ux * 8) + ' ' + f(ty - uy * 8), 'stroke-width': 1.8 }, veins);
      [.18, .34, .5, .66, .8].forEach(function (t, i) {
        var sx2 = bx + ux * len * t, sy2 = by + uy * len * t, reach = wid * .5 * (1 - Math.abs(t - .42) * 1.3), ahead = len * .13;
        el('path', { d: 'M' + f(sx2) + ' ' + f(sy2) + ' Q' + f(sx2 + ux * ahead * .6 + nx * reach * .55) + ' ' + f(sy2 + uy * ahead * .6 + ny * reach * .55) + ' ' + f(sx2 + ux * ahead + nx * reach) + ' ' + f(sy2 + uy * ahead + ny * reach) }, veins);
        el('path', { d: 'M' + f(sx2) + ' ' + f(sy2) + ' Q' + f(sx2 + ux * ahead * .6 - nx * reach * .55) + ' ' + f(sy2 + uy * ahead * .6 - ny * reach * .55) + ' ' + f(sx2 + ux * ahead - nx * reach) + ' ' + f(sy2 + uy * ahead - ny * reach) }, veins);
      });
      return g;
    }
    leaf('leaf-1', X - 14, 604, -1, .42, 232, 118, [X - 4, 596]);      /* the big leaf, low on the left */
    leaf('leaf-2', X + 14, 522, 1, -.34, 196, 100, [X + 4, 514]);      /* right, reaching up a little */
    leaf('leaf-3', X - 12, 436, -1, -.28, 152, 78, [X - 4, 430]);      /* upper left */
    leaf('leaf-4', X + 12, 356, 1, -.2, 128, 66, [X + 4, 350]);        /* upper right */

    /* the flower, face on, at the top of the stem */
    function petals(g, cx, cy, n, rIn, rx, ry, fill, stroke) {
      for (var i = 0; i < n; i++) {
        var a = -90 + i * 360 / n, rad = a * Math.PI / 180, px = cx + Math.cos(rad) * rIn, py = cy + Math.sin(rad) * rIn;
        el('ellipse', { cx: f(px), cy: f(py), rx: rx, ry: ry, transform: 'rotate(' + (a + 90) + ' ' + f(px) + ' ' + f(py) + ')', fill: fill, stroke: stroke, 'stroke-width': 1.6 }, g);
      }
    }
    var flower = part('flower', 'pl-flower', true, [X, 252]);
    shoot.appendChild(flower);
    petals(flower, X, 222, 5, 36, 15, 7, '#6DB56A', '#3F9A55');                 /* sepals behind */
    petals(flower, X, 222, 5, 30, 24, 37, '#F5A3C3', '#D97CA6');                /* five petals */
    var stam = el('g', { stroke: '#8A5A0E', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, flower);
    for (var s2 = 0; s2 < 8; s2++) {
      var a3 = s2 * 45 * Math.PI / 180;
      el('line', { x1: f(X + Math.cos(a3) * 7), y1: f(222 + Math.sin(a3) * 7), x2: f(X + Math.cos(a3) * 19), y2: f(222 + Math.sin(a3) * 19) }, stam);
      el('circle', { cx: f(X + Math.cos(a3) * 21), cy: f(222 + Math.sin(a3) * 21), r: 3.2, fill: '#F3C844', stroke: 'none' }, stam);
    }
    el('circle', { cx: X, cy: 222, r: 6, fill: '#7AA35A', stroke: '#4E7A3A', 'stroke-width': 1.2 }, flower);   /* the stigma, in the middle */

    /* the same flower once the petals have fallen: sepals, the old stamens, and the ovary swelling */
    var spent = part('flower-spent', 'pl-flower-spent', true, [X, 252]);
    shoot.appendChild(spent);
    petals(spent, X, 232, 5, 24, 13, 6, '#8DBF63', '#4E8A3A');
    el('ellipse', { cx: X, cy: 226, rx: 13, ry: 17, fill: '#9BC76A', stroke: '#4E8A3A', 'stroke-width': 1.6 }, spent);
    el('line', { x1: X, y1: 210, x2: X, y2: 198, stroke: '#7AA35A', 'stroke-width': 2 }, spent);
    el('circle', { cx: X, cy: 196, r: 4, fill: '#7AA35A' }, spent);

    /* the fruit: a pod on a side stalk, cut open so the seeds show */
    var fruit = part('fruit', 'pl-fruit', true, [X + 8, 306]);
    shoot.appendChild(fruit);
    el('path', { d: 'M' + (X + 8) + ' 306 C' + (X + 40) + ' 298 ' + (X + 80) + ' 312 ' + (X + 116) + ' 336', fill: 'none', stroke: '#2F7D46', 'stroke-width': 4, 'stroke-linecap': 'round' }, fruit);
    var podX = X + 158, podY = 356;
    el('ellipse', { cx: podX, cy: podY, rx: 64, ry: 25, transform: 'rotate(24 ' + podX + ' ' + podY + ')', fill: '#8DBF63', stroke: '#4E8A3A', 'stroke-width': 1.8 }, fruit);
    el('ellipse', { cx: podX, cy: podY, rx: 54, ry: 16, transform: 'rotate(24 ' + podX + ' ' + podY + ')', fill: '#C7E3A6', stroke: 'none' }, fruit);
    [-34, -11, 12, 35].forEach(function (d) {
      var rad = 24 * Math.PI / 180, sx3 = podX + Math.cos(rad) * d, sy3 = podY + Math.sin(rad) * d;
      el('ellipse', { cx: f(sx3), cy: f(sy3), rx: 9.5, ry: 7.5, transform: 'rotate(24 ' + f(sx3) + ' ' + f(sy3) + ')', fill: '#B7864B', stroke: '#7E5227', 'stroke-width': 1.2 }, fruit);
    });

    /* ---------- the two plants built for hard places ---------- */
    var xero = part('xerophyte', 'pl-xero', 'up', [250, H]);
    el('path', { d: 'M198 ' + H + ' C192 700 200 622 250 616 C300 622 308 700 302 ' + H + ' Z', fill: '#5E9E4E', stroke: '#3F7A33', 'stroke-width': 1.8 }, xero);
    [-26, -9, 9, 26].forEach(function (d) {
      el('path', { d: 'M' + (250 + d) + ' ' + (H - 2) + ' C' + (250 + d * 1.1) + ' 700 ' + (250 + d * .9) + ' 640 ' + (250 + d * .5) + ' 622', fill: 'none', stroke: '#7DBA69', 'stroke-width': 1.4, opacity: .9 }, xero);
    });
    var spines = el('g', { stroke: '#F4ECD2', 'stroke-width': 1.3, 'stroke-linecap': 'round' }, xero);
    [-26, -9, 9, 26].forEach(function (d) {
      for (var yy = 636; yy < H - 8; yy += 22) {
        var cx2 = 250 + d * (1 - (H - yy) / 520);
        el('line', { x1: f(cx2 - 5), y1: f(yy - 3), x2: f(cx2 + 5), y2: f(yy + 3) }, spines);
        el('line', { x1: f(cx2 + 5), y1: f(yy - 3), x2: f(cx2 - 5), y2: f(yy + 3) }, spines);
      }
    });
    petals(xero, 250, 612, 6, 9, 5, 9, '#F3C844', '#C9962A');
    el('circle', { cx: 250, cy: 612, r: 4, fill: '#8A5A0E' }, xero);

    var hydro = part('hydrophyte', 'pl-hydro', 'up', [1010, H + 30]);
    /* a long weak stem from the mud, and roots in it */
    el('path', { d: 'M1012 ' + (H + 60) + ' C1024 ' + (H + 40) + ' 1040 ' + (H + 26) + ' 1052 ' + (H + 10), fill: 'none', stroke: '#4F9F5A', 'stroke-width': 3, 'stroke-linecap': 'round' }, hydro);
    el('path', { d: 'M1012 ' + (H + 60) + ' C1000 ' + (H + 44) + ' 990 ' + (H + 34) + ' 986 ' + (H + 22), fill: 'none', stroke: '#4F9F5A', 'stroke-width': 3, 'stroke-linecap': 'round' }, hydro);
    var mudroots = el('g', { stroke: '#E4D6B6', 'stroke-width': 2, 'stroke-linecap': 'round' }, hydro);
    [[-20, 12], [-8, 18], [8, 18], [22, 12]].forEach(function (d) { el('line', { x1: 1012, y1: H + 60, x2: 1012 + d[0], y2: H + 60 + d[1] }, mudroots); });
    /* a floating pad with its notch, and the flower open on the surface */
    el('path', { d: 'M986 ' + (H + 24) + ' C930 ' + (H + 24) + ' 926 ' + (H + 2) + ' 972 ' + (H + 2) + ' L986 ' + (H + 12) + ' L1000 ' + (H + 2) + ' C1046 ' + (H + 2) + ' 1042 ' + (H + 24) + ' 986 ' + (H + 24) + ' Z', fill: '#4F9F5A', stroke: '#2F7D46', 'stroke-width': 1.6 }, hydro);
    el('ellipse', { cx: 1052, cy: H + 12, rx: 22, ry: 6, fill: '#3F8A4A' }, hydro);
    petals(hydro, 1052, H + 2, 8, 10, 6, 15, '#FFFFFF', '#CFCFC4');
    el('circle', { cx: 1052, cy: H + 2, r: 6, fill: '#F3C844', stroke: '#C9962A', 'stroke-width': 1 }, hydro);

    /* ---------- the sap: drawn over the stem, shown only when asked ---------- */
    var flows = el('g', { 'class': 'pl-flows' }, root);
    /* xylem: from the root tip up the stem and out into the big leaf — drawn root-first so the dashes run upward */
    el('path', { 'class': 'pl-flow pl-flow--xylem', d: 'M' + (X - 4) + ' 1060 C' + (X - 10) + ' 980 ' + (X - 2) + ' 900 ' + (X - 4) + ' 805 C' + (X - 8) + ' 690 ' + X + ' 560 ' + (X - 4) + ' 430 C' + (X - 6) + ' 340 ' + X + ' 290 ' + X + ' 250' }, flows);
    el('path', { 'class': 'pl-flow pl-flow--xylem', d: 'M' + (X - 4) + ' 600 C' + (X - 60) + ' 610 ' + (X - 140) + ' 640 ' + (X - 210) + ' 690' }, flows);
    /* phloem: from the leaves down to the roots, and up to the fruit — drawn leaf-first so the dashes run away from the source */
    el('path', { 'class': 'pl-flow pl-flow--phloem', d: 'M' + (X + 150) + ' 452 C' + (X + 100) + ' 470 ' + (X + 40) + ' 500 ' + (X + 8) + ' 520 C' + (X + 12) + ' 640 ' + (X + 6) + ' 720 ' + (X + 6) + ' 805 C' + (X + 8) + ' 900 ' + (X + 12) + ' 980 ' + (X + 8) + ' 1060' }, flows);
    el('path', { 'class': 'pl-flow pl-flow--phloem', d: 'M' + (X + 8) + ' 520 C' + (X + 10) + ' 440 ' + (X + 8) + ' 360 ' + (X + 10) + ' 306 C' + (X + 40) + ' 300 ' + (X + 80) + ' 316 ' + (X + 116) + ' 336' }, flows);

    /* ---------- water vapour off the leaves ---------- */
    var vap = el('g', { 'class': 'pl-vapour' }, root);
    [[X - 110, 560], [X + 130, 480], [X + 60, 330]].forEach(function (p2) {
      var c = el('circle', { 'class': 'pl-vap', cx: p2[0], cy: p2[1], r: 9 }, vap);
      c.style.transformOrigin = p2[0] + 'px ' + p2[1] + 'px';
    });

    /* ---------- what can be pointed at ---------- */
    var hits = el('g', { 'class': 'pl-hits' }, root);
    var HIT = [
      ['plant', 'rect', { x: X - 300, y: 100, width: 600, height: 1000 }],
      ['roots', 'rect', { x: X - 160, y: 820, width: 320, height: 300 }],
      ['stem', 'rect', { x: X - 26, y: 250, width: 52, height: 560 }],
      ['leaf-1', 'ellipse', { cx: X - 128, cy: 656, rx: 130, ry: 70 }],
      ['leaf-2', 'ellipse', { cx: X + 112, cy: 488, rx: 110, ry: 58 }],
      ['leaf-3', 'ellipse', { cx: X - 88, cy: 412, rx: 88, ry: 46 }],
      ['leaf-4', 'ellipse', { cx: X + 76, cy: 342, rx: 74, ry: 40 }],
      ['fruit', 'ellipse', { cx: X + 150, cy: 350, rx: 84, ry: 48 }],
      ['flower', 'circle', { cx: X, cy: 222, r: 78 }],
      ['seed', 'ellipse', { cx: X, cy: 800, rx: 52, ry: 40 }],
      ['sun', 'circle', { cx: 760, cy: 150, r: 70 }],
      ['xerophyte', 'rect', { x: 180, y: 590, width: 140, height: 190 }],
      ['hydrophyte', 'rect', { x: 900, y: H - 60, width: 220, height: 130 }]
    ];
    var HITID = { 'leaf-1': 'leaf', 'leaf-2': 'leaves', 'leaf-3': 'leaves', 'leaf-4': 'leaves' };
    HIT.forEach(function (h) {
      if (opts.hits && opts.hits.indexOf(HITID[h[0]] || h[0]) < 0) return;
      var id = HITID[h[0]] || h[0];
      var g = el('g', { 'class': 'pl-hit', 'data-hit': id, tabindex: 0, role: 'button', 'aria-label': (G[id] || {}).label || id }, hits);
      var a = {}; for (var k3 in h[2]) a[k3] = h[2][k3]; a['class'] = 'pl-hot';
      el(h[1], a, g);
      ['mouseenter', 'focus'].forEach(function (ev) { g.addEventListener(ev, function () { hooks.enter('part', id); }); });
      ['mouseleave', 'blur'].forEach(function (ev) { g.addEventListener(ev, function () { hooks.leave('part', id); }); });
      g.addEventListener('click', function (ev) { ev.stopPropagation(); hooks.click('part', id); });
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); hooks.click('part', id); } });
    });

    /* ---------- lighting ---------- */
    function partEls(id) {
      return (MEMBERS[id] || [id]).map(function (m) { return root.querySelector('.pl-part[data-part="' + m + '"]'); }).filter(Boolean);
    }
    function clear() {
      svg.classList.remove('lit');
      root.querySelectorAll('.is-on').forEach(function (e) { e.classList.remove('is-on'); });
      if (tag) tag.classList.remove('on');
      svg.style.removeProperty('--c');
    }
    function lightMany(ids, colour) {
      clear(); svg.classList.add('lit');
      ids = [].concat(ids || []);
      var c = colour || (ids.length && G[ids[0]] ? G[ids[0]].colour : '#B8F08E');
      svg.style.setProperty('--c', c);
      ids.forEach(function (id) { partEls(id).forEach(function (e) { e.classList.add('is-on'); }); });
      return { colour: c };
    }
    function light(id, noPin) {
      var g = G[id]; if (!g) return null;
      var r = lightMany([id], g.colour);
      if (!noPin) pin(elFor(id), g.label, r.colour);
      return r;
    }
    function elFor(id) {
      return root.querySelector('.pl-hit[data-hit="' + id + '"] .pl-hot') || partEls(id)[0] || null;
    }
    function pin(elm, text, c) {
      if (!tag) return;
      if (!elm) { tag.classList.remove('on'); return; }
      var o = elm.getBoundingClientRect(), fr = map.getBoundingClientRect();
      tag.style.setProperty('--c', c);
      tag.querySelector('.tag__pill').textContent = text;
      tag.style.left = (o.left + o.width / 2 - fr.left) + 'px';
      tag.style.top = (o.top - fr.top - 8) + 'px';
      tag.classList.add('on');
    }

    /* ---------- growing, the sap, the vapour, the lean ---------- */
    var ALL_SHOW = ['seed', 'roots', 'stem', 'leaf-1', 'leaf-2', 'leaf-3', 'leaf-4', 'flower', 'fruit', 'xerophyte', 'hydrophyte'];
    function show(list) {
      root.querySelectorAll('.pl-grows').forEach(function (e) {
        e.classList.toggle('is-shown', list.indexOf(e.getAttribute('data-part')) >= 0);
      });
    }
    function flow(kind) {
      svg.classList.remove('flow-xylem', 'flow-phloem', 'flow-both');
      if (kind) svg.classList.add('flow-' + kind);
    }
    function breathe(on) { svg.classList.toggle('is-breathing', !!on); }
    function bend(on) { svg.classList.toggle('is-bent', !!on); }
    function grow(stageId) {
      var st = null;
      (P.stages || []).forEach(function (s) { if (s.id === stageId) st = s; });
      svg.setAttribute('data-stage', st ? st.id : '');
      if (!st) { show(ALL_SHOW); flow(null); breathe(false); bend(false); clear(); return null; }
      show(st.show || []);
      flow(st.flow || null); breathe(!!st.breathe); bend(!!st.bend);
      var r = lightMany(st.lit || [], st.lit && st.lit.length && G[st.lit[0]] ? G[st.lit[0]].colour : null);
      return { stage: st, colour: r.colour };
    }
    show(ALL_SHOW);

    /* ---------- the flight ---------- */
    var view = { x: FULL.x, y: FULL.y, w: FULL.w, h: FULL.h }, anim = null;
    function setView(v) { svg.setAttribute('viewBox', f(v.x) + ' ' + f(v.y) + ' ' + f(v.w) + ' ' + f(v.h)); }
    setView(view);
    function flyTo(to, done) {
      to = to || FULL;
      var zoomed = to.w < FULL.w - 1 || to.h < FULL.h - 1;
      map.classList.toggle('is-zoomed', zoomed);
      if (still) { view = { x: to.x, y: to.y, w: to.w, h: to.h }; setView(view); if (done) done(); return; }
      if (anim) cancelAnimationFrame(anim);
      var from = { x: view.x, y: view.y, w: view.w, h: view.h }, t0 = null, D = 720;
      map.classList.add('is-flying');
      if (tag) tag.classList.remove('on');
      function tick(now) {
        if (t0 === null) t0 = now;
        var k = Math.min(1, (now - t0) / D), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        view = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e };
        setView(view);
        if (k < 1) anim = requestAnimationFrame(tick);
        else { anim = null; map.classList.remove('is-flying'); if (done) done(); }
      }
      anim = requestAnimationFrame(tick);
    }
    /* a frame with the same shape as the window it is shown in, so nothing is letterboxed */
    function frame(b, pad) {
      pad = pad == null ? 40 : pad;
      var r = map.getBoundingClientRect(), asp = r.width && r.height ? r.width / r.height : FULL.w / FULL.h;
      var w = b.w + pad * 2, h = b.h + pad * 2;
      if (w / h < asp) w = h * asp; else h = w / asp;
      return { x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - h / 2, w: w, h: h };
    }
    function boxOf(id, pad) { var g = G[id]; return g && g.box ? frame(g.box, pad) : FULL; }
    function boxOfLit(pad) {
      var b = null;
      root.querySelectorAll('.pl-part.is-on').forEach(function (e) {
        var id = e.getAttribute('data-part'), pid = id;
        if (/^leaf-/.test(id)) pid = id === 'leaf-1' ? 'leaf' : 'leaves';
        if (id === 'flower-spent') pid = 'flower';
        var g = G[pid]; if (!g || !g.box) return;
        var bx = g.box;
        b = b ? { x: Math.min(b.x, bx.x), y: Math.min(b.y, bx.y), X: Math.max(b.X, bx.x + bx.w), Y: Math.max(b.Y, bx.y + bx.h) }
              : { x: bx.x, y: bx.y, X: bx.x + bx.w, Y: bx.y + bx.h };
      });
      if (!b) return FULL;
      return frame({ x: b.x, y: b.y, w: b.X - b.x, h: b.Y - b.y }, pad);
    }

    return {
      G: G, FULL: FULL, MEMBERS: MEMBERS,
      light: light, lightMany: lightMany, clear: clear, grow: grow, flow: flow, breathe: breathe, bend: bend,
      pin: pin, elFor: elFor, flyTo: flyTo, boxOf: boxOf, boxOfLit: boxOfLit, frame: frame,
      view: function () { return view; }, isZoomed: function () { return view.w < FULL.w - 1 || view.h < FULL.h - 1; }
    };
  }

  global.PlantDraw = PlantDraw;
})(window);
