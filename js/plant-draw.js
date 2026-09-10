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
    /* the flower opens when it arrives. When it goes because the pod is coming (svg.is-fruiting), its
       petals fall one by one and only then does it fade; at any other time it goes as fast as everything else */
    '@keyframes pl-bloom{from{transform:scale(.12)}}' +
    '.pl-flower.is-shown{animation:pl-bloom .9s cubic-bezier(.2,.7,.2,1)}' +
    'svg.is-fruiting .pl-flower.pl-grows:not(.is-shown){transform:none;opacity:0;transition:opacity .4s ease 1.4s}' +
    '.pl-petal{transform-box:fill-box;transform-origin:50% 100%}' +
    'svg.is-fruiting .pl-flower:not(.is-shown) .pl-petal{transform:translateY(96px) rotate(24deg);opacity:0;transition:transform 1.5s cubic-bezier(.5,0,.9,.5),opacity 1.35s ease-in}' +
    'svg.is-fruiting .pl-flower:not(.is-shown) .pl-petal:nth-child(2){transition-delay:.14s}svg.is-fruiting .pl-flower:not(.is-shown) .pl-petal:nth-child(3){transition-delay:.3s}' +
    'svg.is-fruiting .pl-flower:not(.is-shown) .pl-petal:nth-child(4){transition-delay:.08s}svg.is-fruiting .pl-flower:not(.is-shown) .pl-petal:nth-child(5){transition-delay:.22s}' +
    /* the pod waits for the petals, then grows out of the cup the flower left */
    'svg.is-fruiting .pl-fruit.pl-grows.is-shown{transition:transform 1.3s cubic-bezier(.2,.7,.2,1) 1.2s,opacity .5s ease 1.2s}' +
    '.pl-fruit.pl-grows:not(.is-shown){transition:transform .5s,opacity .35s}' +
    /* the sap: dashed lines that only show when asked for */
    '.pl-flow{fill:none;stroke-width:4;stroke-linecap:round;stroke-dasharray:6 12;opacity:0;transition:opacity .4s}' +
    '.pl-flow--xylem{stroke:#4FB3E8}.pl-flow--phloem{stroke:#F2A93B}' +
    '.pl-flow--branch{stroke-width:3;stroke-dasharray:5 10}.pl-flow[data-for]:not(.is-shown){display:none}' +
    'svg.flow-xylem .pl-flow--xylem,svg.flow-both .pl-flow--xylem{opacity:1;animation:pl-run 1.1s linear infinite}' +
    'svg.flow-phloem .pl-flow--phloem,svg.flow-both .pl-flow--phloem{opacity:1;animation:pl-run 1.1s linear infinite}' +
    '@keyframes pl-run{from{stroke-dashoffset:36}to{stroke-dashoffset:0}}' +
    /* water vapour leaving the leaves */
    '.pl-vap{fill:#D8EEFA;opacity:0}' +
    'svg.is-breathing .pl-vap{animation:pl-vap 2.6s ease-out infinite}' +
    'svg.is-breathing .pl-vap:nth-child(2){animation-delay:.8s}svg.is-breathing .pl-vap:nth-child(3){animation-delay:1.6s}' +
    '@keyframes pl-vap{0%{opacity:0;transform:translateY(0) scale(.6)}20%{opacity:.95}100%{opacity:0;transform:translateY(-70px) scale(1.7)}}' +
    /* the shoot leaning to the light */
    '.pl-hot{fill:transparent;cursor:pointer;outline:none}' +
    '.pl-hit:focus-visible .pl-hot{stroke:var(--c,#B8F08E);stroke-width:2;stroke-dasharray:4 4}' +
    '@media (prefers-reduced-motion:reduce){.pl-part,.pl-grows,.pl-bends,.pl-petal{transition:none}.pl-flower.is-shown{animation:none}.pl-flow,.pl-vap{animation:none!important}svg.flow-xylem .pl-flow--xylem,svg.flow-both .pl-flow--xylem,svg.flow-phloem .pl-flow--phloem,svg.flow-both .pl-flow--phloem{opacity:1}svg.is-breathing .pl-vap{opacity:.6}}';

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
      leaves: ['leaf-1', 'leaf-2', 'leaf-3', 'leaf-4'], flower: ['flower', 'flower-2'], fruit: ['fruit', 'flower-spent'],
      sun: ['sun'], xerophyte: ['xerophyte'], hydrophyte: ['hydrophyte'], seedling: ['seedling'],
      plant: ['seed', 'roots', 'stem', 'leaf-1', 'leaf-2', 'leaf-3', 'leaf-4', 'flower', 'flower-2', 'flower-spent', 'fruit']
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
    var sunGlow = el('circle', { cx: 760, cy: 150, r: 130, fill: 'url(#pl-sun)' }, ground);
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
    /* the hypocotyl: an outline round a curved centre line, thick at the soil and slender at the top — its shape is
       drawn afresh whenever it bends (see paintSeedling). The seed leaves are the two halves of the bean, lifted into
       the light, each with the crease where they parted; the first true leaves unfold between them. */
    var seedStem = el('path', { fill: '#8AD087', stroke: '#3F9A55', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, seedling);
    var cotyls = el('g', { 'class': 'pl-cotyls' }, seedling);
    [[X + 2, 674, -30], [X + 48, 670, 24]].forEach(function (c) {
      var g2 = el('g', { transform: 'rotate(' + c[2] + ' ' + c[0] + ' ' + c[1] + ')' }, cotyls);
      el('path', { d: 'M' + (c[0] - 27) + ' ' + c[1] + ' C' + (c[0] - 27) + ' ' + (c[1] - 19) + ' ' + (c[0] + 27) + ' ' + (c[1] - 19) + ' ' + (c[0] + 27) + ' ' + c[1] + ' C' + (c[0] + 27) + ' ' + (c[1] + 17) + ' ' + (c[0] - 27) + ' ' + (c[1] + 17) + ' ' + (c[0] - 27) + ' ' + c[1] + ' Z', fill: '#9BD98F', stroke: '#3F9A55', 'stroke-width': 1.5 }, g2);
      el('path', { d: 'M' + (c[0] - 22) + ' ' + (c[1] + 1) + ' Q' + c[0] + ' ' + (c[1] - 4) + ' ' + (c[0] + 22) + ' ' + (c[1] + 1), fill: 'none', stroke: '#5FAE66', 'stroke-width': 1.2, opacity: .9 }, g2);
    });

    /* ---------- the bend: how a whole plant grows towards the light ----------
       A shoot bends by growing, not by tilting: the cells on the shaded side elongate more than the lit side's,
       most in the young stem near the tip, so the stem curves increasingly towards the light and everything it
       carries turns with it. Here every point of the stem above the pivot is carried sideways by an amount that
       grows with the square of its height above the pivot — a curve, steepest at the tip — and each part above
       the pivot (the upper leaves, the next flower, the growing tip) is carried and turned by the stem's lean at
       the node it grows from. The base and everything below the pivot never move. */
    var PV = 560, TOP = 248, BEND_D = 96, bendDir = 1, bendT = 0, bendRaf = null;
    function warpS(y) { return Math.max(0, Math.min(1.15, (PV - y) / (PV - TOP))); }
    function warpDx(y, t) { var q = warpS(y); return bendDir * BEND_D * t * q * q; }
    function warpAng(y, t) { return bendDir * Math.atan2(2 * BEND_D * t * warpS(y), PV - TOP) * 180 / Math.PI; }
    function warpP(p, t) { return [p[0] + warpDx(p[1], t), p[1]]; }
    function rigidP(p, ny, t) {   /* carried and turned with the node at (X, ny) */
      var a = warpAng(ny, t) * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a), dx = p[0] - X, dy = p[1] - ny;
      return [X + dx * c - dy * sn + warpDx(ny, t), ny + dx * sn + dy * c];
    }
    function buildPath(tpl, t) { return tpl.map(function (q) { if (typeof q === 'string') return q; var p = warpP(q, t); return f(p[0]) + ' ' + f(p[1]); }).join(' '); }
    var WARPED = [], BRANCHES = [], HITWARP = [], leafEls = {};
    function warpPart(g, ny) { var w = el('g', { 'class': 'pl-warp' }); while (g.firstChild) w.appendChild(g.firstChild); g.appendChild(w); WARPED.push([w, ny]); }

    /* the stem */
    var stem = part('stem', 'pl-stem', 'up', [X, 805]);
    shoot.appendChild(stem);
    var STEM_T = ['M', [X - 9, 805], 'C', [X - 13, 690], [X - 5, 560], [X - 9, 430], 'C', [X - 11, 340], [X - 4, 290], [X - 2, 248], 'L', [X + 2, 248], 'C', [X + 4, 290], [X + 11, 340], [X + 9, 430], 'C', [X + 5, 560], [X + 13, 690], [X + 9, 805], 'Z'];
    var STEMHL_T = ['M', [X - 3, 790], 'C', [X - 6, 690], [X + 1, 560], [X - 3, 430], 'C', [X - 5, 340], [X - 1, 300], [X - 1, 262]];
    var stemPath = el('path', { d: buildPath(STEM_T, 0), fill: '#3E9A57', stroke: '#2F7D46', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, stem);
    var stemLine = el('path', { d: buildPath(STEMHL_T, 0), fill: 'none', stroke: '#6FC482', 'stroke-width': 2, opacity: .7 }, stem);

    /* a leaf: base, direction, length and width; midrib and a net of veins. The blade is
       two quadratic curves whose control points sit 38% along and 62% of the width out,
       so its half-width at any point along the midrib can be worked out exactly — and
       every side vein is made to end inside that edge, not through it. */
    var LEAVES = {};
    var K = .38, W = .62;
    function halfWidth(a, wid) {                     /* a = 0..1 along the midrib */
      var s = (-K + Math.sqrt(K * K + (1 - 2 * K) * a)) / (1 - 2 * K);
      return 2 * (1 - s) * s * W * wid;
    }
    /* a blade into any group: the outline, the midrib, and unless it is a young leaf the net of veins */
    function blade(g, bx, by, dx, dy, len, wid, young) {
      var m = Math.sqrt(dx * dx + dy * dy), ux = dx / m, uy = dy / m, nx = -uy, ny = ux;
      var tx = bx + ux * len, ty = by + uy * len;
      var c1x = bx + ux * len * K + nx * wid * W, c1y = by + uy * len * K + ny * wid * W;
      var c2x = bx + ux * len * K - nx * wid * W, c2y = by + uy * len * K - ny * wid * W;
      el('path', { d: 'M' + f(bx) + ' ' + f(by) + ' Q' + f(c1x) + ' ' + f(c1y) + ' ' + f(tx) + ' ' + f(ty) + ' Q' + f(c2x) + ' ' + f(c2y) + ' ' + f(bx) + ' ' + f(by) + ' Z',
                 fill: young ? '#8FD48A' : '#5DBF6E', stroke: young ? '#3F9A55' : '#2A6B3B', 'stroke-width': young ? 1.4 : 1.8, 'stroke-linejoin': 'round' }, g);
      var veins = el('g', { fill: 'none', stroke: young ? '#3F9A55' : '#2A6B3B', 'stroke-width': 1.1, opacity: .75, 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M' + f(bx) + ' ' + f(by) + ' L' + f(tx - ux * 8) + ' ' + f(ty - uy * 8), 'stroke-width': young ? 1.2 : 1.8 }, veins);
      if (young) return { ux: ux, uy: uy, nx: nx, ny: ny };
      /* side veins: each leaves the midrib, sweeps forward and ends at 84% of the blade's
         half-width where it lands, so the tips sit just inside the edge on every leaf */
      [.1, .22, .34, .46, .58, .7, .81].forEach(function (t) {
        var a2 = Math.min(.95, t + .11), reach = halfWidth(a2, wid) * .84, ahead = (a2 - t) * len;
        var sx2 = bx + ux * len * t, sy2 = by + uy * len * t;
        [1, -1].forEach(function (side) {
          el('path', { d: 'M' + f(sx2) + ' ' + f(sy2) + ' Q' + f(sx2 + ux * ahead * .45 + nx * reach * .3 * side) + ' ' + f(sy2 + uy * ahead * .45 + ny * reach * .3 * side) +
                          ' ' + f(sx2 + ux * ahead + nx * reach * side) + ' ' + f(sy2 + uy * ahead + ny * reach * side) }, veins);
        });
      });
      return { ux: ux, uy: uy, nx: nx, ny: ny };
    }
    function leaf(id, bx, by, dx, dy, len, wid, petiole, sink) {
      var m = Math.sqrt(dx * dx + dy * dy), ux = dx / m, uy = dy / m, nx = -uy, ny = ux;
      LEAVES[id] = { bx: bx, by: by, ux: ux, uy: uy, nx: nx, ny: ny, len: len, wid: wid, petiole: petiole, sink: !!sink };
      var g = part(id, 'pl-leaf', true, [bx, by]); leafEls[id] = g;
      shoot.appendChild(g);
      if (petiole) el('path', { d: 'M' + f(petiole[0]) + ' ' + f(petiole[1]) + ' Q' + f((petiole[0] + bx) / 2 + nx * 6) + ' ' + f((petiole[1] + by) / 2 + ny * 6) + ' ' + f(bx) + ' ' + f(by), fill: 'none', stroke: '#2F7D46', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      blade(g, bx, by, dx, dy, len, wid, false);
      return g;
    }
    /* the growing tip: a bud with two young leaves folded up round it, part of the stem */
    var apex = el('g', { 'class': 'pl-warp' }, stem);
    blade(apex, X - 2, 254, -.42, -1, 46, 24, true);
    blade(apex, X + 2, 254, .42, -1, 42, 22, true);
    el('ellipse', { cx: X, cy: 241, rx: 4.5, ry: 8.5, fill: '#8FD48A', stroke: '#3F9A55', 'stroke-width': 1.4 }, apex);
    WARPED.push([apex, 254]);
    blade(cotyls, X + 22, 678, -.5, -1, 26, 14, true);   /* the seedling's first true leaves, between its seed leaves */
    blade(cotyls, X + 30, 678, .5, -1, 24, 13, true);

    leaf('leaf-1', X - 14, 604, -1, .42, 232, 118, [X - 4, 596]);      /* the big leaf, low on the left */
    leaf('leaf-2', X + 14, 522, 1, -.34, 196, 100, [X + 4, 514]);      /* right, reaching up a little */
    leaf('leaf-3', X - 12, 436, -1, -.28, 152, 78, [X - 4, 430]);      /* upper left */
    leaf('leaf-4', X + 12, 356, 1, -.2, 128, 66, [X + 4, 350]);        /* upper right */

    /* Two flowering nodes, so the plant can carry a flower and a pod at the same time without
       confusion. The lower one, in the axil of the second leaf on a stalk that droops under
       the leaf, is the older: it is the one whose petals fall and whose ovary grows into the
       pod, in the same place. The upper one, in the axil of the third leaf, is the next flower
       and stays open. Each flower is petals on a cup of sepals; the lower cup — stalk, sepals,
       receptacle — is its own part, 'flower-spent', because it stays when the petals fall. */
    function petals(g, cx, cy, n, rIn, rx, ry, fill, stroke, cls) {
      for (var i = 0; i < n; i++) {
        var a = -90 + i * 360 / n, rad = a * Math.PI / 180, px = cx + Math.cos(rad) * rIn, py = cy + Math.sin(rad) * rIn;
        var w = cls ? el('g', { 'class': cls }, g) : g;
        el('ellipse', { cx: f(px), cy: f(py), rx: rx, ry: ry, transform: 'rotate(' + (a + 90) + ' ' + f(px) + ' ' + f(py) + ')', fill: fill, stroke: stroke, 'stroke-width': 1.6 }, w);
      }
    }
    function cup(g, from, ctrl, cx, cy) {                 /* the stalk, the sepals, the receptacle */
      el('path', { d: 'M' + f(from[0]) + ' ' + f(from[1]) + ' Q' + f(ctrl[0]) + ' ' + f(ctrl[1]) + ' ' + f(cx) + ' ' + f(cy), fill: 'none', stroke: '#2F7D46', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      petals(g, cx, cy, 5, 26, 11, 5, '#6DB56A', '#3F9A55');
      el('circle', { cx: cx, cy: cy, r: 8, fill: '#9BC76A', stroke: '#4E8A3A', 'stroke-width': 1.4 }, g);
    }
    function bloom(g, cx, cy) {                            /* five petals, each its own piece so it can fall; stamens; stigma */
      petals(g, cx, cy, 5, 22, 17, 27, '#F5A3C3', '#D97CA6', 'pl-petal');
      var stam = el('g', { stroke: '#8A5A0E', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, g);
      for (var s2 = 0; s2 < 8; s2++) {
        var a3 = s2 * 45 * Math.PI / 180;
        el('line', { x1: f(cx + Math.cos(a3) * 6), y1: f(cy + Math.sin(a3) * 6), x2: f(cx + Math.cos(a3) * 14), y2: f(cy + Math.sin(a3) * 14) }, stam);
        el('circle', { cx: f(cx + Math.cos(a3) * 16), cy: f(cy + Math.sin(a3) * 16), r: 2.7, fill: '#F3C844', stroke: 'none' }, stam);
      }
      el('circle', { cx: cx, cy: cy, r: 5, fill: '#7AA35A', stroke: '#4E7A3A', 'stroke-width': 1.2 }, g);
    }
    var FB = [X + 64, 588], NB = [X + 5, 508];             /* the lower flower's centre, and the node its stalk leaves */
    var spent = part('flower-spent', 'pl-flower-spent', true, NB);
    shoot.appendChild(spent);
    cup(spent, NB, [X + 36, 528], FB[0], FB[1]);
    var flower = part('flower', 'pl-flower', true, FB);
    shoot.appendChild(flower);
    bloom(flower, FB[0], FB[1]);
    var FA = [X - 56, 330], NA = [X - 5, 424];             /* the upper flower, the next one, which stays open */
    var flower2 = part('flower-2', 'pl-flower pl-flower-2', true, NA);
    shoot.appendChild(flower2);
    cup(flower2, NA, [X - 40, 386], FA[0], FA[1]);
    bloom(flower2, FA[0], FA[1]);

    /* the fruit: the ovary grown into a bean pod, hanging from the cup where the flower was,
       down the free side of the stem. Its width follows a profile along a bent centre line — a
       narrow neck, a full middle, a pointed tip that still carries the dried style — and the
       four seeds inside show as bumps. */
    var POD = [[FB[0], FB[1] + 6], [FB[0] + 3, 636], [FB[0] + 11, 676], [FB[0] + 24, 712]];
    function podAt(t) { return bez(POD[0], POD[1], POD[2], POD[3], t); }
    function podWidth(t) { return 14 * Math.pow(Math.sin(Math.PI * Math.min(1, t * .92 + .04)), .75) * (t < .12 ? .55 + t * 3.75 : 1); }
    function podNormal(t) {
      var p = podAt(Math.max(0, t - .01)), q = podAt(Math.min(1, t + .01)), dx = q[0] - p[0], dy = q[1] - p[1], m = Math.sqrt(dx * dx + dy * dy) || 1;
      return [-dy / m, dx / m, dx / m, dy / m];
    }
    var fruit = part('fruit', 'pl-fruit', true, POD[0]);
    shoot.appendChild(fruit);
    var left = [], right = [], N = 28;
    for (var pi = 0; pi <= N; pi++) {
      var pt = pi / N, pp = podAt(pt), pn = podNormal(pt), pw = podWidth(pt);
      left.push([pp[0] + pn[0] * pw, pp[1] + pn[1] * pw]);
      right.push([pp[0] - pn[0] * pw, pp[1] - pn[1] * pw]);
    }
    var podPath = 'M' + left.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L') + ' L' + right.reverse().map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L') + ' Z';
    el('path', { d: podPath, fill: '#7CC46A', stroke: '#3F8A3A', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, fruit);
    /* the seam down the pod, on the side that catches the light */
    el('path', { d: 'M' + [.06, .25, .5, .75, .95].map(function (t) { var p = podAt(t), n = podNormal(t), w = podWidth(t) * .55; return f(p[0] - n[0] * w) + ' ' + f(p[1] - n[1] * w); }).join(' L'),
               fill: 'none', stroke: '#C9E9B0', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: .9 }, fruit);
    /* the seeds, as bumps under the wall */
    [.2, .4, .6, .79].forEach(function (t) {
      var p = podAt(t), n = podNormal(t), w = podWidth(t), ang = Math.atan2(n[3], n[2]) * 180 / Math.PI;
      el('ellipse', { cx: f(p[0]), cy: f(p[1]), rx: f(w * .92), ry: f(w * .68), transform: 'rotate(' + f(ang) + ' ' + f(p[0]) + ' ' + f(p[1]) + ')', fill: '#98D482', stroke: '#4E8A3A', 'stroke-width': 1.1, opacity: .95 }, fruit);
    });
    /* the dried style at the tip, where the stigma was */
    var tipP = podAt(1), tipN = podNormal(1);
    el('line', { x1: f(tipP[0]), y1: f(tipP[1]), x2: f(tipP[0] + tipN[2] * 9), y2: f(tipP[1] + tipN[3] * 9), stroke: '#6B4F2A', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, fruit);

    /* what the bend carries, each turned about the node it grows from */
    [[leafEls['leaf-2'], 514], [leafEls['leaf-3'], 430], [leafEls['leaf-4'], 350], [flower2, 424], [spent, NB[1]], [flower, NB[1]], [fruit, NB[1]]].forEach(function (p) { warpPart(p[0], p[1]); });

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

    /* ---------- the sap: drawn over the stem, shown only when asked ----------
       Two trunks run the stem — xylem up the left of it, phloem down the right — and a
       branch of each follows every leaf's own midrib, so the sap runs exactly where the
       leaf is; a branch is drawn only once its leaf (or the pod) has grown. Each path is
       drawn source-first, so the moving dashes run the way the sap does: water from the
       roots out to the leaf tips, sugar from the leaves down to the roots and up into the
       pod. */
    var flows = el('g', { 'class': 'pl-flows' }, root);
    var XY_T = ['M', [X - 4, 1060], 'C', [X - 10, 980], [X - 2, 900], [X - 4, 805], 'C', [X - 8, 690], [X, 560], [X - 4, 430], 'C', [X - 6, 340], [X - 3, 290], [X - 3, 262]];
    var PH_T = ['M', [X + 4, 350], 'C', [X + 8, 440], [X + 6, 520], [X + 6, 640], 'C', [X + 6, 720], [X + 6, 805], [X + 6, 805], 'C', [X + 8, 900], [X + 12, 980], [X + 8, 1060]];
    var xylemTrunk = el('path', { 'class': 'pl-flow pl-flow--xylem', d: buildPath(XY_T, 0) }, flows);
    var phloemTrunk = el('path', { 'class': 'pl-flow pl-flow--phloem', d: buildPath(PH_T, 0) }, flows);
    Object.keys(LEAVES).forEach(function (id) {
      var L = LEAVES[id], o = 3, y0 = L.petiole ? L.petiole[1] : L.by;
      var b1 = [L.bx + L.nx * o, L.by + L.ny * o], e1 = [L.bx + L.ux * L.len * .84 + L.nx * o, L.by + L.uy * L.len * .84 + L.ny * o];
      var b2 = [L.bx - L.nx * o, L.by - L.ny * o], e2 = [L.bx + L.ux * L.len * .84 - L.nx * o, L.by + L.uy * L.len * .84 - L.ny * o];
      var P = function (p) { return f(p[0]) + ' ' + f(p[1]); }, ny = y0;
      var bx1 = function (t) { return 'M' + P(warpP([X - 4, y0], t)) + ' L' + P(rigidP(b1, ny, t)) + ' L' + P(rigidP(e1, ny, t)); };
      var bp2 = function (t) { return 'M' + P(rigidP(e2, ny, t)) + ' L' + P(rigidP(b2, ny, t)) + ' L' + P(warpP([X + 4, y0], t)); };
      var xb = el('path', { 'class': 'pl-flow pl-flow--xylem pl-flow--branch', 'data-for': id, d: bx1(0) }, flows);
      if (y0 < PV) BRANCHES.push([xb, bx1]);
      if (!L.sink) { var pb = el('path', { 'class': 'pl-flow pl-flow--phloem pl-flow--branch', 'data-for': id, d: bp2(0) }, flows); if (y0 < PV) BRANCHES.push([pb, bp2]); }
    });
    /* sugar into the pod: down the trunk to its node, out along the drooping stalk, and down the pod's centre line */
    var fruitBranch = function (t) { var P = function (p) { return f(p[0]) + ' ' + f(p[1]); }, R = function (p) { return P(rigidP(p, NB[1], t)); }; return 'M' + P(warpP([X + 4, NB[1]], t)) + ' Q' + R([X + 36, 528]) + ' ' + R(FB) + ' C' + R(POD[1]) + ' ' + R(POD[2]) + ' ' + R(podAt(.72)); };
    BRANCHES.push([el('path', { 'class': 'pl-flow pl-flow--phloem pl-flow--branch', 'data-for': 'fruit', d: fruitBranch(0) }, flows), fruitBranch]);

    /* ---------- water vapour off the leaves ---------- */
    var vap = el('g', { 'class': 'pl-vapour' }, root);
    [[X - 110, 560], [X + 140, 470], [X + 70, 320]].forEach(function (p2) {
      var c = el('circle', { 'class': 'pl-vap', cx: p2[0], cy: p2[1], r: 9 }, vap);
      c.style.transformOrigin = p2[0] + 'px ' + p2[1] + 'px';
    });

    /* ---------- what can be pointed at ---------- */
    var hits = el('g', { 'class': 'pl-hits' }, root), stemHit = null;
    var HIT = [
      ['plant', 'rect', { x: X - 300, y: 100, width: 600, height: 1000 }],
      ['roots', 'rect', { x: X - 160, y: 820, width: 320, height: 300 }],
      ['stem', 'rect', { x: X - 26, y: 250, width: 52, height: 560 }],
      ['leaf-1', 'ellipse', { cx: X - 128, cy: 656, rx: 130, ry: 70 }],
      ['leaf-2', 'ellipse', { cx: X + 112, cy: 488, rx: 110, ry: 58 }],
      ['leaf-3', 'ellipse', { cx: X - 88, cy: 412, rx: 88, ry: 46 }],
      ['leaf-4', 'ellipse', { cx: X + 76, cy: 342, rx: 74, ry: 40 }],
      ['flower', 'circle', { cx: X - 56, cy: 330, r: 54 }],
      ['flower', 'circle', { cx: X + 64, cy: 588, r: 54 }],
      ['fruit', 'ellipse', { cx: X + 76, cy: 655, rx: 28, ry: 70, transform: 'rotate(-10 ' + (X + 76) + ' 655)' }],
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
      var hot = el(h[1], a, g);
      var HN = { 'leaf-2': 514, 'leaf-3': 430, 'leaf-4': 350 }[h[0]] || (h[0] === 'flower' && h[2].cy === 330 ? 424 : null);
      if (HN) HITWARP.push([g, HN]);
      if (h[0] === 'stem') stemHit = hot;
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
    /* at rest the plant carries the next flower and the first pod — never a flower and a pod in one place */
    var ALL_SHOW = ['seed', 'roots', 'stem', 'leaf-1', 'leaf-2', 'leaf-3', 'leaf-4', 'flower-2', 'flower-spent', 'fruit', 'xerophyte', 'hydrophyte'];
    function show(list) {
      svg.classList.toggle('is-fruiting', list.indexOf('fruit') >= 0);   /* the pod is coming: the flower's petals fall, and the pod waits for them */
      root.querySelectorAll('.pl-grows').forEach(function (e) {
        e.classList.toggle('is-shown', list.indexOf(e.getAttribute('data-part')) >= 0);
      });
      root.querySelectorAll('.pl-flow[data-for]').forEach(function (e) {
        e.classList.toggle('is-shown', list.indexOf(e.getAttribute('data-for')) >= 0);
      });
    }
    function flow(kind) {
      svg.classList.remove('flow-xylem', 'flow-phloem', 'flow-both');
      if (kind) svg.classList.add('flow-' + kind);
    }
    function breathe(on) { svg.classList.toggle('is-breathing', !!on); }
    var SEED_STRAIGHT = [[X - 2, 782], [X - 6, 740], [X + 8, 710], [X + 26, 690]], SEED_BENT = [[X - 2, 782], [X - 4, 748], [X + 16, 712], [X + 52, 694]];
    function paintSeedling(t) {
      var p = SEED_STRAIGHT.map(function (q, i) { return [q[0] + (SEED_BENT[i][0] - q[0]) * t, q[1] + (SEED_BENT[i][1] - q[1]) * t]; });
      var L = [], R = [], n = 14;
      for (var i = 0; i <= n; i++) {
        var u = i / n, c = bez(p[0], p[1], p[2], p[3], u), c2 = bez(p[0], p[1], p[2], p[3], Math.min(1, u + .01)), dx = c2[0] - c[0], dy = c2[1] - c[1], m = Math.sqrt(dx * dx + dy * dy) || 1, w = 6.8 - 2.8 * u;
        L.push([c[0] - dy / m * w, c[1] + dx / m * w]); R.push([c[0] + dy / m * w, c[1] - dx / m * w]);
      }
      var tip = bez(p[0], p[1], p[2], p[3], 1), d = 'M' + L.map(function (q) { return f(q[0]) + ' ' + f(q[1]); }).join(' L') + ' Q' + f(tip[0] + (tip[0] - p[2][0]) * .12) + ' ' + f(tip[1] + (tip[1] - p[2][1]) * .12) + ' ' + f(R[n][0]) + ' ' + f(R[n][1]) + ' L' + R.reverse().map(function (q) { return f(q[0]) + ' ' + f(q[1]); }).join(' L') + ' Z';
      seedStem.setAttribute('d', d);
      cotyls.setAttribute('transform', 'translate(' + f((SEED_BENT[3][0] - SEED_STRAIGHT[3][0]) * t) + ' ' + f((SEED_BENT[3][1] - SEED_STRAIGHT[3][1]) * t) + ') rotate(' + f(16 * t) + ' ' + f(SEED_STRAIGHT[3][0]) + ' ' + f(SEED_STRAIGHT[3][1]) + ')');
    }
    function paintBend(t) {
      bendT = t;
      stemPath.setAttribute('d', buildPath(STEM_T, t)); stemLine.setAttribute('d', buildPath(STEMHL_T, t));
      xylemTrunk.setAttribute('d', buildPath(XY_T, t)); phloemTrunk.setAttribute('d', buildPath(PH_T, t));
      WARPED.concat(HITWARP).forEach(function (w) { var y = w[1]; w[0].setAttribute('transform', t ? 'translate(' + f(warpDx(y, t)) + ' 0) rotate(' + f(warpAng(y, t)) + ' ' + f(X) + ' ' + f(y) + ')' : ''); });
      BRANCHES.forEach(function (b) { b[0].setAttribute('d', b[1](t)); });
      if (stemHit) { stemHit.setAttribute('x', f(X - 26 - (bendDir < 0 ? BEND_D * t : 0))); stemHit.setAttribute('width', f(52 + BEND_D * t)); }
      paintSeedling(t);
    }
    function animateBend(target, then) {
      if (bendRaf) cancelAnimationFrame(bendRaf); bendRaf = null;
      if (still || bendT === target) { paintBend(target); if (then) then(); return; }
      var from = bendT, t0 = null;
      bendRaf = requestAnimationFrame(function step(now) {
        if (t0 == null) t0 = now;
        var k = Math.min(1, (now - t0) / 1400), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        paintBend(from + (target - from) * e);
        if (k < 1) bendRaf = requestAnimationFrame(step); else { bendRaf = null; if (then) then(); }
      });
    }
    /* bend(on, dir): towards the light on the right (dir 1, the sun where it is drawn) or the left (−1). A plant
       already bent one way and asked to bend the other straightens first, then grows the new way. */
    function bend(on, dir) {
      var want = dir ? (dir < 0 ? -1 : 1) : bendDir;
      svg.classList.toggle('is-bent', !!on);
      if (on && want !== bendDir && bendT > 0) { animateBend(0, function () { bendDir = want; animateBend(1); }); return; }
      bendDir = want; animateBend(on ? 1 : 0);
    }
    /* the sun on the right, as drawn, or moved to the same height on the left of the plant */
    function sunSide(dir) {
      var tx = dir < 0 ? 2 * X - 1520 : 0, tr = tx ? 'translate(' + tx + ' 0)' : '';
      [sunGlow, sunG, root.querySelector('.pl-hit[data-hit="sun"]')].forEach(function (e) { if (e) e.setAttribute('transform', tr); });
    }
    paintBend(0);
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
        if (id === 'flower-2') pid = 'flower';
        if (id === 'flower-spent') pid = 'fruit';
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
      light: light, lightMany: lightMany, clear: clear, grow: grow, flow: flow, breathe: breathe, bend: bend, sunSide: sunSide,
      pin: pin, elFor: elFor, flyTo: flyTo, boxOf: boxOf, boxOfLit: boxOfLit, frame: frame,
      showParts: show, ALL: ALL_SHOW.slice(),
      view: function () { return view; }, isZoomed: function () { return view.w < FULL.w - 1 || view.h < FULL.h - 1; }
    };
  }

  global.PlantDraw = PlantDraw;
})(window);
