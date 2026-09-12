/* ============================================================
   plate.js — the plant as this lab's plate.
   The drawing and the lighting are the shared js/plant-draw.js; this file decides
   what the lab does with them: a station lights the parts it is about, runs the sap
   or the water vapour if it is about those, and flies the camera to the part; a part
   you click on the plant opens the station that teaches it.
   ============================================================ */
(function (global) {
  'use strict';

  var P = global.PLANT || { parts: [], scene: { w: 1600, h: 1120, horizon: 700, plantX: 560 } };
  var plant = null, svg, map, tag, said, whole, hint, col, bench, sim;
  var onPick = function () {};
  var current = null;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function say(name, note, c) {
    if (!said) return;
    if (c) said.style.setProperty('--c', c); else said.style.removeProperty('--c');
    said.innerHTML = '<span class="said__name">' + esc(name) + '</span><span class="said__note">' + esc(note) + '</span>';
  }

  /* the window the lab shows at rest: the plant and its ground, not the whole wide scene */
  var REST = { x: 130, y: 0, w: 860, h: P.scene.h };
  var WIDE = { x: 80, y: 360, w: 1160, h: 620 };

  function init(opts) {
    svg = document.getElementById('plant'); map = document.getElementById('map'); tag = document.getElementById('tag');
    said = document.getElementById('said'); whole = document.getElementById('tWhole'); hint = document.getElementById('plateHint');
    col = document.querySelector('.platecol'); bench = document.getElementById('benchHost');
    sim = document.getElementById('simHost');
    onPick = (opts && opts.onPick) || onPick;
    if (!svg || !global.PlantDraw) return;
    plant = global.PlantDraw(svg, P, {
      map: map, tag: tag, full: REST,
      onEnter: function (kind, id) {
        var g = plant.G[id]; if (!g) return;
        plant.pin(plant.elFor(id), g.label, g.colour);
      },
      onLeave: function () { if (tag) tag.classList.remove('on'); },
      onClick: function (kind, id) { if (id === 'sun' && current && spec(current).bend) { flipSun(); return; } onPick(id); }   /* on the tropisms station the sun is a lamp: click it to move the light */
    });
    if (whole) whole.addEventListener('click', function () { flyHome(); });
    if (hint) hint.textContent = 'Click a part of the plant to open its station';
    window.addEventListener('resize', function () { if (tag) tag.classList.remove('on'); });
  }

  function spec(st) { return (st && st.plate) || {}; }

  /* the light can be on either side of the plant; the plant grows towards it */
  var bendDir = 1;
  function flipSun() {
    bendDir = -bendDir;
    plant.sunSide(bendDir); plant.bend(true, bendDir);
    if (current) say(current.name, 'the light is now on the ' + (bendDir < 0 ? 'left' : 'right') + ' — the shoot grows towards it', null);
  }

  /* what a station does to the plant: light its parts, run its sap, fly to it */
  function showStation(st) {
    if (!plant) return;
    current = st;
    /* Clear the simulation FIRST, before anything measures the column. frame() reads
       map.getBoundingClientRect() and falls back to the full scene when it is 0x0, so a camera
       computed while the plant is hidden is framed to the wrong aspect — with no error, just a
       wrong shot when the plant comes back. */
    if (col) col.classList.remove('is-sim');
    if (sim) sim.hidden = true;
    var s = spec(st), ids = s.light || [];
    /* a station may stand something else on the bench — the potometer — in place of the plant */
    var onBench = !!s.bench;
    if (col) col.classList.toggle('is-bench', onBench);
    if (bench) { bench.hidden = !onBench; bench.innerHTML = ''; }
    if (!s.bend && bendDir < 0) { bendDir = 1; plant.sunSide(1); }   /* the sun goes back where it is drawn */
    if (hint) hint.textContent = s.bend ? 'Click the sun to move the light' : 'Click a part of the plant to open its station';
    if (onBench) { plant.clear(); plant.flow(null); plant.breathe(false); plant.bend(false); if (tag) tag.classList.remove('on'); return; }
    plant.flow(s.flow || null); plant.breathe(!!s.breathe); plant.bend(!!s.bend, bendDir);
    /* the lower flower is the one that becomes the pod, in the same place, so the plate shows that node in
       flower or in fruit, never both: a station about the fruit (or the sinks the sugar goes to) sees the
       petals fallen and the pod hanging; every other station sees both flowers open */
    var fruiting = ids.indexOf('fruit') >= 0;
    plant.showParts(s.show ? s.show : plant.ALL.filter(function (p) { return fruiting || p !== 'fruit'; }).concat(fruiting ? [] : ['flower']));   /* a station may stand only some parts: the tropisms station shows the seedling */
    var r = ids.length ? plant.lightMany(ids, plant.G[ids[0]] ? plant.G[ids[0]].colour : null) : (plant.clear(), { colour: null });
    var names = ids.map(function (id) { return plant.G[id] ? plant.G[id].label.toLowerCase() : id; });
    say(st.name, names.length ? names.join(' · ') : 'the whole plant', r.colour);
    var box = s.fly === 'wide' ? plant.frame(WIDE, 20) : s.fly ? plant.boxOf(s.fly, 60) : plant.FULL;
    plant.flyTo(box, function () { if (whole) whole.hidden = !plant.isZoomed(); });
    if (whole) whole.hidden = false;
    setTimeout(function () { if (whole) whole.hidden = !plant.isZoomed(); }, still ? 0 : 780);
  }

  /* one part, named and framed: the student clicked it on the plant or in the text */
  function focus(id) {
    if (!plant || !plant.G[id]) return;
    var g = plant.G[id];
    var r = plant.light(id, true);
    say(g.label, g.note || '', r.colour);
    plant.flyTo(plant.boxOf(id, 60), function () { plant.pin(plant.elFor(id), g.label, r.colour); if (whole) whole.hidden = !plant.isZoomed(); });
    if (whole) whole.hidden = false;
  }

  /* "Whole plant" pulls the camera all the way back and leaves the station's parts lit */
  function flyHome() {
    if (!plant) return;
    if (tag) tag.classList.remove('on');
    plant.flyTo(plant.FULL, function () { if (whole) whole.hidden = !plant.isZoomed(); });
    if (whole) whole.hidden = true;
    if (current) {
      var ids = spec(current).light || [];
      say(current.name, ids.length ? 'the whole plant · ' + ids.length + (ids.length === 1 ? ' part lit' : ' parts lit') : 'the whole plant', null);
    }
  }

  /* Stand a simulation where the plant is, or put the plant back. Plate owns the CLASS and the
     hidden flag only — app.js owns the widget node itself, because the node has to survive being
     re-parented and must not be rebuilt every time the panel repaints. Putting the plant back goes
     through showStation, the one function that knows the whole contract: light, flow, breathe,
     bend, hint, the said line and the zoom button. */
  /* The scroll-driven swap: show the drawing or the plant, and nothing else. showSim() below
     rebuilds the whole station when it puts the plant back, which is right when a student closes
     a simulation but far too much to do on every scroll. Nothing about the plant changed while
     it was hidden, so there is nothing to rebuild. */
  function stageSim(on) {
    if (col) col.classList.toggle('is-sim', !!on);
    if (sim) sim.hidden = !on;
    if (on && bench) bench.hidden = true;
    if (on && tag) tag.classList.remove('on');
    if (global.PlateFold) global.PlateFold.lend(!!on);   /* on a phone the strip may be folded away */
  }

  function showSim(on) {
    if (col) col.classList.toggle('is-sim', !!on);
    if (sim) sim.hidden = !on;
    if (on) { if (bench) bench.hidden = true; if (tag) tag.classList.remove('on'); }
    else if (current) showStation(current);
  }

  /* Show or hide the bench without touching what is standing on it. showStation also empties
     #benchHost, which is right when the station changes and fatal when it does not: the
     potometer mounts its apparatus there while the panel is being built, and anything that
     re-runs showStation afterwards deletes it. */
  function showBench(on) { if (bench) bench.hidden = !on; }

  global.Plate = { init: init, showStation: showStation, focus: focus, home: flyHome, showSim: showSim, stageSim: stageSim,
                   showBench: showBench,
                   partsOf: function (st) { return spec(st).light || []; }, plant: function () { return plant; } };
})(window);
