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
  var plant = null, svg, map, tag, said, whole, hint;
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
    onPick = (opts && opts.onPick) || onPick;
    if (!svg || !global.PlantDraw) return;
    plant = global.PlantDraw(svg, P, {
      map: map, tag: tag, full: REST,
      onEnter: function (kind, id) {
        var g = plant.G[id]; if (!g) return;
        plant.pin(plant.elFor(id), g.label, g.colour);
      },
      onLeave: function () { if (tag) tag.classList.remove('on'); },
      onClick: function (kind, id) { onPick(id); }
    });
    if (whole) whole.addEventListener('click', function () { flyHome(); });
    if (hint) hint.textContent = 'Click a part of the plant to open its station';
    window.addEventListener('resize', function () { if (tag) tag.classList.remove('on'); });
  }

  function spec(st) { return (st && st.plate) || {}; }

  /* what a station does to the plant: light its parts, run its sap, fly to it */
  function showStation(st) {
    if (!plant) return;
    current = st;
    var s = spec(st), ids = s.light || [];
    plant.flow(s.flow || null); plant.breathe(!!s.breathe); plant.bend(!!s.bend);
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

  global.Plate = { init: init, showStation: showStation, focus: focus, home: flyHome,
                   partsOf: function (st) { return spec(st).light || []; }, plant: function () { return plant; } };
})(window);
