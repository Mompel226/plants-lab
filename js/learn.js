/* ============================================================
   learn.js — the Learn tab's widgets for the plant topics: nothing here is only read.

   The generic ones — finder, table, photo — are the shared js/widgets.js. What this
   file adds is the plant's own:
     video        one of Dr Mompel's lesson videos, with its poster, played on demand
     germinate    four tubes of seeds: say what each lacks, then see what germinated
     equation     the word equation, and the balanced one behind it
     limiting     three sliders, one rate: find the factor in shortest supply
     starchtest   the starch test, step by step, with the reason for each step
     indicator    hydrogencarbonate indicator: what goes in the tube decides its colour
     potometer    the potometer practical: set the shoot's conditions, time it, read the bubble, record, graph
     sourcesink   the same plant in two seasons, every part labelled source or sink
     auxin        move the light and watch the auxin, then the shoot, move
     diagram      the lab's own labelled drawings, part by part (the half-flower)
     pollentube   the pollen tube growing down the style to the ovule
     adapt        two plants built for hard places, feature by feature
   Also exported for the questions: svgFor (the drawings), so a hotspot can use one.
   ============================================================ */
(function (global) {
  'use strict';
  var W = global.Widgets;
  var h = W.h, esc = W.esc, mk = W.mk, head = W.head;
  function svgEl(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }

  /* ---------- video: a lesson clip, on demand ---------- */
  function video(spec) {
    var f = h('figure', 'media media--video');
    var v = document.createElement('video');
    v.className = 'media__el';
    v.src = 'assets/video/' + spec.src + '.mp4';
    v.poster = 'assets/video/' + spec.src + '.jpg';
    v.controls = true; v.playsInline = true; v.preload = 'none';
    var wh = (global.PHOTO_SIZE || {})['video/' + spec.src + '.jpg'];
    if (wh) { v.width = wh[0]; v.height = wh[1]; }
    v.setAttribute('aria-label', spec.kind || 'Video');
    f.appendChild(v);
    f.appendChild(h('figcaption', 'media__cap', '<span class="kindtag">' + esc(spec.kind || 'Video') + '</span> ' + mk(spec.cap || '') +
      (spec.credit ? ' <span class="media__credit">' + esc(spec.credit) + '</span>' : '')));
    return f;
  }

  /* ---------- germinate: four tubes ---------- */
  var TUBES = [
    { name: 'Tube A', has: ['water', 'oxygen', 'warm'], lacks: null, result: 'Germinated', why: 'It had all three: moist cotton wool, air, and the bench at 20 °C.' },
    { name: 'Tube B', has: ['oxygen', 'warm'], lacks: 'water', result: 'Nothing', why: 'Dry cotton wool. Without water the seed coat stays hard and the enzymes inside cannot work.' },
    { name: 'Tube C', has: ['water', 'warm'], lacks: 'oxygen', result: 'Nothing', why: 'The seeds were under boiled water with oil on top: no oxygen, so no aerobic respiration to release the energy for growth.' },
    { name: 'Tube D', has: ['water', 'oxygen'], lacks: 'warm', result: 'Nothing', why: 'In a fridge at 4 °C the enzyme-controlled reactions of germination are far too slow.' }
  ];
  var ICON = { water: '💧 water', oxygen: '🫧 oxygen', warm: '🌡 warm' };
  function germinate(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Which tubes germinate?', spec.ask, 'Press the tubes'));
    var row = h('div', 'tubes'), n = 0, done = null;
    TUBES.forEach(function (t) {
      var c = h('button', 'tube'); c.type = 'button';
      c.innerHTML = '<span class="tube__glass"><span class="tube__seeds"></span></span>' +
        '<b>' + esc(t.name) + '</b><span class="tube__has">' + ['water', 'oxygen', 'warm'].map(function (k) {
          return '<i class="' + (t.has.indexOf(k) >= 0 ? 'on' : 'off') + '">' + ICON[k] + '</i>';
        }).join('') + '</span><span class="tube__out"></span>';
      c.addEventListener('click', function () {
        if (c.classList.contains('is-open')) return;
        c.classList.add('is-open'); c.classList.add(t.lacks ? 'is-no' : 'is-yes');
        c.querySelector('.tube__out').innerHTML = '<b>' + esc(t.result) + '</b>' + (t.lacks ? ' — no ' + esc(t.lacks === 'warm' ? 'suitable temperature' : t.lacks) : '') + '<small>' + esc(t.why) + '</small>';
        n++;
        if (n === TUBES.length && !done) { done = h('p', 'widget__done', 'Water, oxygen and a suitable temperature — take any one away and nothing happens. Light was never on the list.'); box.appendChild(done); }
      });
      row.appendChild(c);
    });
    box.appendChild(row);
    return box;
  }

  /* ---------- equation ---------- */
  function equation(spec) {
    var box = h('div', 'widget');
    box.appendChild(head('The equation', 'Click each word to see where it comes from or where it goes. Then turn over the balanced equation.', 'Click the words'));
    var NOTES = {
      'carbon dioxide': 'From the air, in through the stomata, along the air spaces, into the mesophyll cells. About 0.04 % of the air — which is why it is so often the limiting factor.',
      'water': 'From the soil, in through the root hairs by osmosis, up the xylem, into the mesophyll cells.',
      'glucose': 'Made in the chloroplasts. Used in respiration, stored as starch, built into cellulose, converted to sucrose for the phloem, made into nectar.',
      'oxygen': 'The waste product: out through the stomata by diffusion. In the light a leaf gives out far more than it uses.',
      'light': 'The energy source. Absorbed by chlorophyll in the chloroplasts and transferred into energy in chemicals — the glucose.',
      'chlorophyll': 'The green pigment in the chloroplasts. Not used up: it captures the light, over and over.'
    };
    var eq = h('div', 'eq');
    function chip(t, cls) { var b = h('button', 'eq__w' + (cls ? ' ' + cls : ''), esc(t)); b.type = 'button'; b.addEventListener('click', function () { show(t, b); }); return b; }
    var note = h('p', 'eq__note'); note.hidden = true;
    function show(t, b) {
      eq.querySelectorAll('.eq__w').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      note.hidden = false; note.innerHTML = '<b>' + esc(t) + '</b> — ' + esc(NOTES[t] || '');
    }
    eq.appendChild(chip('carbon dioxide')); eq.appendChild(h('span', 'eq__op', '+')); eq.appendChild(chip('water'));
    var arrow = h('span', 'eq__arrow'); arrow.innerHTML = '<span>→</span>';
    var over = h('span', 'eq__over'); over.appendChild(chip('light', 'eq__w--cond')); over.appendChild(chip('chlorophyll', 'eq__w--cond'));
    arrow.insertBefore(over, arrow.firstChild);
    eq.appendChild(arrow);
    eq.appendChild(chip('glucose')); eq.appendChild(h('span', 'eq__op', '+')); eq.appendChild(chip('oxygen'));
    box.appendChild(eq); box.appendChild(note);
    var bal = h('div', 'eq__bal'); bal.hidden = true;
    bal.innerHTML = '<span class="sup tip" tabindex="0" data-tip="Supplement — Paper 4 (Extended) only">S</span> <span class="eq__f">6CO<sub>2</sub> + 6H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub></span>' +
      '<small>Check it balances: 6 carbons, 12 hydrogens and 18 oxygens on each side.</small>';
    var bt = h('button', 'wbtn wbtn--quiet', 'Show the balanced equation'); bt.type = 'button';
    bt.addEventListener('click', function () { bal.hidden = !bal.hidden; bt.textContent = bal.hidden ? 'Show the balanced equation' : 'Hide the balanced equation'; });
    box.appendChild(bt); box.appendChild(bal);
    return box;
  }

  /* ---------- limiting: three sliders, one rate ---------- */
  function limiting(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Which factor is limiting?', spec.ask, 'Move the sliders'));
    var F = [
      { id: 'light', label: 'Light intensity', min: 0, max: 100, v: 30, unit: '%', f: function (x) { return 1 - Math.exp(-3.2 * x / 100); } },
      { id: 'co2', label: 'Carbon dioxide concentration', min: 0, max: 100, v: 80, unit: '%', f: function (x) { return 1 - Math.exp(-3.2 * x / 100); } },
      { id: 'temp', label: 'Temperature', min: 0, max: 50, v: 25, unit: ' °C', f: function (t) { return t <= 35 ? Math.max(0, t / 35) : Math.max(0, 1 - (t - 35) / 10); } }
    ];
    var wrap = h('div', 'lim'), out = h('div', 'lim__out');
    var rows = F.map(function (fc) {
      var r = h('label', 'lim__row');
      r.innerHTML = '<span class="lim__lab">' + esc(fc.label) + '<b></b></span>';
      var inp = document.createElement('input'); inp.type = 'range'; inp.min = fc.min; inp.max = fc.max; inp.value = fc.v; inp.step = 1;
      inp.setAttribute('aria-label', fc.label);
      r.appendChild(inp);
      var bar = h('span', 'lim__bar'); bar.innerHTML = '<i></i>'; r.appendChild(bar);
      inp.addEventListener('input', paint);
      wrap.appendChild(r);
      return { fc: fc, inp: inp, r: r, bar: bar.firstChild, val: r.querySelector('b') };
    });
    function paint() {
      var caps = rows.map(function (x) { return x.fc.f(+x.inp.value); });
      var rate = Math.min.apply(null, caps), who = caps.indexOf(rate);
      rows.forEach(function (x, i) {
        x.val.textContent = x.inp.value + x.fc.unit;
        x.bar.style.width = (caps[i] * 100).toFixed(0) + '%';
        x.r.classList.toggle('is-limiting', i === who && rate < .98);
      });
      var t = +rows[2].inp.value;
      var why = rate >= .98 ? 'Nothing is holding it back much now: every factor is near its best. Real leaves stop here because their enzymes can work no faster.'
        : who === 2 && t > 35 ? 'Too hot: the enzymes of photosynthesis are being denatured, so the rate falls however much light and carbon dioxide there is.'
        : who === 2 ? 'Temperature is limiting: the enzyme-controlled reactions are slow in the cold. Warm it up and the rate rises — until something else runs short.'
        : who === 0 ? 'Light intensity is limiting: chlorophyll is capturing energy as fast as the light arrives. Raise it and the rate rises, until carbon dioxide or temperature takes over.'
        : 'Carbon dioxide concentration is limiting: the raw material is in short supply. Raise it and the rate rises, until light or temperature takes over.';
      out.innerHTML = '<span class="lim__rate"><i style="width:' + (rate * 100).toFixed(0) + '%"></i></span>' +
        '<b>Rate of photosynthesis: ' + (rate * 100).toFixed(0) + ' %</b>' +
        '<span class="lim__who">' + (rate >= .98 ? 'No single limiting factor' : 'Limiting factor now: <b>' + esc(F[who].label.toLowerCase()) + '</b>') + '</span>' +
        '<small>' + esc(why) + '</small>';
    }
    box.appendChild(wrap); box.appendChild(out); paint();
    box.appendChild(h('p', 'widget__note', 'A model, not a measurement: the shapes are the exam’s — light and carbon dioxide level off, temperature peaks and falls.'));
    return box;
  }

  /* ---------- starchtest ---------- */
  function starchtest(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'The starch test', spec.ask, 'Press the steps'));
    var STEPS = [
      { t: 'Boil the leaf in water', why: 'Kills the leaf and stops its reactions, breaks the cell membranes so the iodine can get in later, and softens it.', leaf: 'limp' },
      { t: 'Boil it in ethanol, in a water bath', why: 'Ethanol dissolves the chlorophyll out of the leaf, so the colour change can be seen. A water bath, because ethanol catches fire — never over a flame.', leaf: 'white' },
      { t: 'Rinse in warm water', why: 'Ethanol makes the leaf brittle; warm water softens it so it can be spread flat.', leaf: 'white' },
      { t: 'Add iodine solution', why: 'Iodine is orange-brown. Where there is starch it turns blue-black.', leaf: 'iodine' }
    ];
    var wrap = h('div', 'st'), left = h('div', 'st__leaf'), right = h('ol', 'st__steps');
    left.innerHTML = '<svg viewBox="0 0 200 160" class="st__svg" aria-hidden="true"><path class="st__blade" d="M20 140 C30 60 100 20 180 22 C180 90 120 145 20 140 Z"/><path class="st__vein" d="M22 138 C70 100 130 60 178 24"/><path class="st__vein" d="M60 110 C80 96 100 90 118 92 M80 96 C90 80 104 66 122 60 M108 78 C120 70 138 62 152 58" opacity=".7"/><text class="st__state" x="100" y="156" text-anchor="middle">a leaf, taken from a plant in the light</text></svg>';
    var svg = left.firstChild, blade = svg.querySelector('.st__blade'), state = svg.querySelector('.st__state');
    var at = 0, done = null;
    STEPS.forEach(function (s, i) {
      var li = h('li', 'st__step'); var b = h('button', 'st__btn', '<span class="n">' + (i + 1) + '</span>' + esc(s.t)); b.type = 'button';
      var why = h('small', 'st__why', esc(s.why)); why.hidden = true;
      b.addEventListener('click', function () {
        if (i !== at) { if (i < at) return; toast('Do step ' + (at + 1) + ' first.'); return; }
        at = i + 1; li.classList.add('is-done'); why.hidden = false;
        svg.setAttribute('data-leaf', s.leaf);
        state.textContent = s.leaf === 'limp' ? 'soft and limp, reactions stopped' : s.leaf === 'white' && i === 1 ? 'pale: the chlorophyll is in the ethanol' : s.leaf === 'white' ? 'softened again, ready to spread out' : 'blue-black: starch was there, so it had been photosynthesising';
        if (at === STEPS.length && !done) { done = h('p', 'widget__done', 'Blue-black means starch, and starch means the leaf was photosynthesising. Every "is it needed?" experiment ends with this test.'); box.appendChild(done); }
      });
      li.appendChild(b); li.appendChild(why); right.appendChild(li);
    });
    wrap.appendChild(left); wrap.appendChild(right); box.appendChild(wrap);
    return box;
  }
  function toast(m) { var t = document.getElementById('toast'); if (!t) return; t.textContent = m; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 2200); }

  /* ---------- indicator: three tubes ---------- */
  function indicator(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Hydrogencarbonate indicator', spec.ask, 'Set the tubes'));
    var row = h('div', 'ind');
    function result(what, where) {
      if (what === 'none') return ['orange', 'Orange-red: no plant, so nothing changed the carbon dioxide. This is the control.'];
      if (where === 'light') return ['purple', 'Purple: in bright light photosynthesis is faster than respiration, so carbon dioxide was taken out of the solution.'];
      if (where === 'dark') return ['yellow', 'Yellow: in the dark there is no photosynthesis, only respiration, so carbon dioxide was added.'];
      return ['orange', 'Orange-red: in dim light photosynthesis and respiration are running at the same rate, so there is no net change in carbon dioxide.'];
    }
    [['pondweed', 'light'], ['pondweed', 'dark'], ['none', 'light']].forEach(function (init, i) {
      var t = h('div', 'ind__tube');
      t.innerHTML = '<span class="ind__glass"><span class="ind__liq"></span><span class="ind__weed"></span></span>' +
        '<label>In the tube <select class="ind__what"><option value="pondweed">pondweed</option><option value="none">nothing (a control)</option></select></label>' +
        '<label>Kept in <select class="ind__where"><option value="light">bright light</option><option value="dim">dim light</option><option value="dark">the dark</option></select></label>' +
        '<p class="ind__say"></p>';
      var what = t.querySelector('.ind__what'), where = t.querySelector('.ind__where'), say = t.querySelector('.ind__say');
      what.value = init[0]; where.value = init[1];
      function paint() {
        var r = result(what.value, where.value);
        t.setAttribute('data-colour', r[0]); t.classList.toggle('has-weed', what.value === 'pondweed'); t.classList.toggle('is-dark', where.value === 'dark');
        say.textContent = r[1];
      }
      what.addEventListener('change', paint); where.addEventListener('change', paint); paint();
      row.appendChild(t);
    });
    box.appendChild(row);
    box.appendChild(h('p', 'widget__note', 'The indicator starts orange-red, the colour it has with the carbon dioxide in ordinary air. It answers only one question: has the carbon dioxide gone up or down?'));
    return box;
  }

  /* ---------- potometer: the practical, set up and run as many times as you like ----------
     A bubble potometer drawn as the bench has it — the shoot in an airtight joint, the
     capillary tube on its scale, the reservoir with its tap, the beaker at the far end — with
     the conditions round the shoot set one at a time or together, a clock you set, a bubble
     that moves the distance the shoot's uptake gives it while you watch, a table that fills
     as you record runs, a mean whenever a condition is repeated, and a graph that picks its
     own x-axis from whichever factor you changed. The rates are a model built to be fair to
     the biology (the widget says so), not measured data. */
  var PO_SPECIES = [
    { id: 'bean',      name: 'French bean',   base: 3.2, note: 'broad, thin leaves with plenty of stomata: a fast transpirer',
      leaf: { kind: 'heart', scale: 1.05, fill: '#5DBF6E', stroke: '#2A6B3B' } },
    { id: 'sunflower', name: 'Sunflower',     base: 4.4, note: 'very large leaves — a huge surface — and the fastest here',
      leaf: { kind: 'heart', scale: 1.3, fill: '#4FAE5E', stroke: '#245B33', rough: true } },
    { id: 'geranium',  name: 'Geranium',      base: 2.6, note: 'hairy leaves that hold a layer of still, humid air',
      leaf: { kind: 'round', scale: .9, fill: '#7CC46A', stroke: '#3F7F3A' } },
    { id: 'privet',    name: 'Privet',        base: 1.7, note: 'small waxy leaves with a thick cuticle',
      leaf: { kind: 'oval', scale: .72, fill: '#3F8F4E', stroke: '#1F5A2C', gloss: true } },
    { id: 'ivy',       name: 'Ivy',           base: 1.5, note: 'tough leaves, a waxy cuticle and fewer stomata',
      leaf: { kind: 'lobed', scale: .95, fill: '#3E8A4A', stroke: '#1F5A2C', gloss: true, paleVeins: true } },
    { id: 'marram',    name: 'Marram grass',  base: 0.5, note: 'a xerophyte: rolled leaves with the stomata inside — see the last station',
      leaf: { kind: 'grass', scale: 1.2, fill: '#9DB884', stroke: '#5E7A4B' } }
  ];
  var PO_WIND = ['still air', 'a gentle breeze', 'fan on low', 'fan on high'];
  var PO_WINDF = [1, 1.4, 1.9, 2.5];
  var PO_GREASE = [['none', 'no grease', 1], ['upper', 'grease on the upper surface', .9], ['lower', 'grease on the lower surface', .2], ['both', 'grease on both surfaces', .05]];
  var PO_MM = 4.2, PO_X0 = 108, PO_STEM = 574, PO_BORE_R = 0.5;   /* the scale's 0 mark, and the shoot's stem, in the drawing's units */
  var PO_STATE = { runs: [], pos: 0, set: null, shoot: 1, shootF: 1 };            /* kept while the lab is open: a trip to Practise and back keeps the table */              /* px per mm on the scale; the 0 mm mark; the capillary's radius, mm */

  function poLightF(L) { return .15 + .85 * (1 - Math.exp(-L / 35)) / (1 - Math.exp(-100 / 35)); }
  function poTempF(T) { return Math.pow(2, (T - 20) / 10); }
  function poHumF(H) { return Math.max(.05, (100 - H) / 50); }

  function potometer(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Run the potometer', spec.ask, 'Set it up and press start'));
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* ----- the controls ----- */
    var ctl = h('div', 'po__ctl');
    function sel(label, id, opts, v) {
      var lab = h('label', 'po__row', '<span>' + esc(label) + '</span>');
      var s = document.createElement('select'); s.setAttribute('data-k', id);
      opts.forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); });
      s.value = v; lab.appendChild(s); ctl.appendChild(lab); return s;
    }
    function range(label, id, min, max, v, unit, step) {
      var lab = h('label', 'po__row po__row--range', '<span>' + esc(label) + '<b></b></span>');
      var r = document.createElement('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step || 1; r.value = v; r.setAttribute('data-k', id); r.setAttribute('aria-label', label);
      lab.appendChild(r); ctl.appendChild(lab);
      return { inp: r, val: lab.querySelector('b'), unit: unit };
    }
    var species = sel('Plant', 'species', PO_SPECIES.map(function (s) { return [s.id, s.name]; }), 'bean');
    var speciesNote = h('small', 'po__snote'); ctl.appendChild(speciesNote);
    var leaves = range('Leaves on the shoot', 'leaves', 1, 6, 5, '');
    var light = range('Light', 'light', 0, 100, 60, ' %', 5);
    var temp = range('Temperature', 'temp', 5, 35, 20, ' °C');
    var hum = range('Humidity', 'hum', 20, 100, 50, ' %', 5);
    var wind = range('Wind', 'wind', 0, 3, 0, '');
    var grease = sel('Petroleum jelly on the leaves', 'grease', PO_GREASE.map(function (g) { return [g[0], g[1]]; }), 'none');
    var joint = sel('The joint at the bung', 'joint', [['sealed', 'sealed with petroleum jelly'], ['open', 'not sealed']], 'sealed');
    var time = sel('Measure for', 'time', [['1', '1 minute'], ['2', '2 minutes'], ['3', '3 minutes'], ['5', '5 minutes'], ['10', '10 minutes']], '5');
    if (PO_STATE.set) { var S0 = PO_STATE.set; species.value = S0.sp.id; leaves.inp.value = S0.leaves; light.inp.value = S0.light; temp.inp.value = S0.temp; hum.inp.value = S0.hum; wind.inp.value = S0.wind; grease.value = S0.grease; joint.value = S0.joint || 'sealed'; time.value = String(S0.time); }

    /* ----- the bench ----- */
    var stage = h('div', 'po__stage');
    function ticks() {
      var s = '';
      for (var mm = 0; mm <= 100; mm += 5) {
        var x = PO_X0 + mm * PO_MM, tall = mm % 10 === 0;
        s += '<line x1="' + x.toFixed(1) + '" y1="314" x2="' + x.toFixed(1) + '" y2="' + (tall ? 326 : 321) + '"/>';
        if (tall) s += '<text x="' + x.toFixed(1) + '" y="338" text-anchor="middle">' + mm + '</text>';
      }
      return s;
    }
    var LEAVES = [[136, -1, .15, 86, 40], [118, 1, -.05, 80, 38], [100, -1, -.2, 84, 40], [84, 1, -.3, 74, 36], [66, -1, -.3, 64, 32], [50, 1, -.42, 52, 26]];
    /* marram grass is a tuft, not a stem with leaves: long blades fanning up from the bung */
    var GRASS = [[156, -1, -1.9, 150, 14], [154, 1, -2.1, 160, 14], [158, -1, -1.1, 140, 13], [156, 1, -1.2, 150, 13], [160, -1, -.6, 120, 12], [158, 1, -.7, 128, 12]];
    /* a leaf's outline in its own frame: the base at 0,0, the tip along +x at L, half-width W.
       Each plant has the leaf it really has, simplified to one outline and its veins. */
    function outline(kind, L, W, rough) {
      var f = function (v) { return v.toFixed(1); };
      if (kind === 'heart') {          /* bean, sunflower: heart-shaped, widest near the base */
        var d = 'M0 0 C' + f(-L * .06) + ' ' + f(-W * .7) + ' ' + f(L * .3) + ' ' + f(-W * 1.15) + ' ' + f(L * .5) + ' ' + f(-W * .95) + ' C' + f(L * .72) + ' ' + f(-W * .75) + ' ' + f(L * .92) + ' ' + f(-W * .32) + ' ' + f(L) + ' 0';
        d += ' C' + f(L * .92) + ' ' + f(W * .32) + ' ' + f(L * .72) + ' ' + f(W * .75) + ' ' + f(L * .5) + ' ' + f(W * .95) + ' C' + f(L * .3) + ' ' + f(W * 1.15) + ' ' + f(-L * .06) + ' ' + f(W * .7) + ' 0 0 Z';
        return d;
      }
      if (kind === 'oval') {           /* privet: a small blunt oval */
        return 'M0 0 C' + f(L * .1) + ' ' + f(-W * .9) + ' ' + f(L * .7) + ' ' + f(-W * .95) + ' ' + f(L) + ' 0 C' + f(L * .7) + ' ' + f(W * .95) + ' ' + f(L * .1) + ' ' + f(W * .9) + ' 0 0 Z';
      }
      if (kind === 'round') {          /* geranium: a scalloped disc on its stalk, the stalk joining near the middle */
        var pts = [], n = 9, cx = L * .5, r = L * .5;
        for (var i = 0; i < n; i++) { var a = -Math.PI + i * 2 * Math.PI / n, a2 = a + Math.PI / n, r1 = r * .9, r2 = r * 1.16; pts.push([cx + Math.cos(a) * r1, Math.sin(a) * r1 * (W / (L * .5)), cx + Math.cos(a2) * r2, Math.sin(a2) * r2 * (W / (L * .5))]); }
        var d2 = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
        for (var k = 0; k < n; k++) { var p = pts[k], q = pts[(k + 1) % n]; d2 += ' Q' + f(p[2]) + ' ' + f(p[3]) + ' ' + f(q[0]) + ' ' + f(q[1]); }
        return d2 + ' Z';
      }
      if (kind === 'lobed') {          /* ivy: five rounded lobes, the middle one longest, on a broad blade */
        var pt = function (a, rr) { var t = a * Math.PI / 180; return [Math.cos(t) * L * rr, Math.sin(t) * W * 1.9 * rr]; };
        var lobes = [[-66, .56], [-33, .8], [0, 1], [33, .8], [66, .56]], sin = .46, d3 = 'M0 0';
        var first = pt(-88, .3); d3 += ' L' + f(first[0]) + ' ' + f(first[1]);
        lobes.forEach(function (lb, i) {
          var a = lb[0], rr = lb[1], s1 = pt(a - 15, sin), c1 = pt(a - 13, rr * 1.06), c2 = pt(a + 13, rr * 1.06), s2 = pt(a + 15, sin);
          if (i) { var pv = lobes[i - 1]; var mid = pt((pv[0] + a) / 2, sin * .92); d3 += ' Q' + f(mid[0]) + ' ' + f(mid[1]) + ' ' + f(s1[0]) + ' ' + f(s1[1]); } else d3 += ' L' + f(s1[0]) + ' ' + f(s1[1]);
          d3 += ' C' + f(c1[0]) + ' ' + f(c1[1]) + ' ' + f(c2[0]) + ' ' + f(c2[1]) + ' ' + f(s2[0]) + ' ' + f(s2[1]);
        });
        var last = pt(88, .3); d3 += ' L' + f(last[0]) + ' ' + f(last[1]);
        return d3 + ' Z';
      }
      /* grass: a long narrow blade, tapering to a point, that bends back a little at the tip */
      return 'M0 ' + f(-W * .5) + ' C' + f(L * .45) + ' ' + f(-W * .7) + ' ' + f(L * .85) + ' ' + f(-W * .1) + ' ' + f(L) + ' ' + f(W * .9) + ' C' + f(L * .82) + ' ' + f(W * .25) + ' ' + f(L * .45) + ' ' + f(W * .1) + ' 0 ' + f(W * .5) + ' Z';
    }
    function veins(kind, L, W, pale) {
      var f = function (v) { return v.toFixed(1); }, cls = 'po__vein' + (pale ? ' po__vein--pale' : ''), v = '';
      if (kind === 'grass') { v += '<path class="' + cls + '" d="M0 0 C' + f(L * .4) + ' ' + f(-W * .05) + ' ' + f(L * .8) + ' 0 ' + f(L * .96) + ' ' + f(W * .06) + '"/><path class="' + cls + '" d="M0 ' + f(-W * .14) + ' C' + f(L * .4) + ' ' + f(-W * .2) + ' ' + f(L * .7) + ' ' + f(-W * .1) + ' ' + f(L * .85) + ' 0"/>'; return v; }
      if (kind === 'round' || kind === 'lobed') { [-58, -30, 0, 30, 58].forEach(function (a) { var t = a * Math.PI / 180, r = kind === 'round' ? L * .78 : L * (Math.abs(a) > 40 ? .5 : Math.abs(a) > 10 ? .72 : .9); v += '<path class="' + cls + '" d="M' + (kind === 'round' ? f(L * .25) + ' 0' : '0 0') + ' L' + f((kind === 'round' ? L * .25 : 0) + Math.cos(t) * r) + ' ' + f(Math.sin(t) * (kind === 'round' ? W * .8 : W * 1.5) * (r / L)) + '"/>'; }); return v; }
      v += '<path class="' + cls + '" d="M0 0 L' + f(L * .94) + ' 0"/>';
      var pairs = kind === 'heart' ? [.16, .36, .56, .74] : [.3, .55];
      pairs.forEach(function (t) { var reach = W * (kind === 'heart' ? .8 : .7) * (1 - Math.abs(t - .4) * 1.1); v += '<path class="' + cls + '" d="M' + f(L * t) + ' 0 Q' + f(L * (t + .06)) + ' ' + f(-reach * .45) + ' ' + f(L * (t + .14)) + ' ' + f(-reach) + ' M' + f(L * t) + ' 0 Q' + f(L * (t + .06)) + ' ' + f(reach * .45) + ' ' + f(L * (t + .14)) + ' ' + f(reach) + '"/>'; });
      return v;
    }
    function leafPath(y, dx, dy, len, wid, spec) {
      var bx = PO_STEM, by = y, m = Math.sqrt(dx * dx + dy * dy), ux = dx / m, uy = dy / m;
      var lf = spec || PO_SPECIES[0].leaf, L = len * lf.scale, W = (wid / 2) * lf.scale;
      if (lf.kind === 'grass') { L = len; W = wid * .5; }
      var ang = Math.atan2(uy, ux) * 180 / Math.PI;
      var tipX = bx + ux * L, tipY = by + uy * L;
      return '<g class="po__leaf" transform="translate(' + bx + ' ' + by + ') rotate(' + ang.toFixed(1) + ')">' +
        '<path class="po__blade" d="' + outline(lf.kind, L, W, lf.rough) + '" fill="' + lf.fill + '" stroke="' + lf.stroke + '"/>' +
        (lf.gloss ? '<path class="po__gloss" d="M' + (L * .12).toFixed(1) + ' ' + (-W * .35).toFixed(1) + ' Q' + (L * .45).toFixed(1) + ' ' + (-W * .7).toFixed(1) + ' ' + (L * .8).toFixed(1) + ' ' + (-W * .25).toFixed(1) + '"/>' : '') +
        veins(lf.kind, L, W, lf.paleVeins) +
        '<circle class="po__vap" cx="' + (L * .86).toFixed(1) + '" cy="' + (-W * .6 - 4).toFixed(1) + '" r="3.4" transform="rotate(' + (-ang).toFixed(1) + ' ' + (L * .86).toFixed(1) + ' ' + (-W * .6 - 4).toFixed(1) + ')"/></g>';
    }
    /* The bench, drawn in the order things really stand: the fan and the lamp at the back, then
       the stand, then the tubing as one continuous tube — an outer glass line, a lighter glass
       body and the water inside, all on the same path, so the capillary, its bend into the beaker
       and the reservoir's T-junction fill without a gap — then the beaker's water over the part
       of the tube that dips into it, the beaker's glass in front, then the scale and the shoot,
       and the words last. Nothing stands behind the tube or the scale. The reservoir is open at
       the top, as it is on the bench. */
    var TUBE = 'M70 392 V312 Q70 300 82 300 H574';                 /* the capillary meets the shoot's tube at its centre line */
    var WIDE = 'M574 150 V293';                                     /* the shoot's tube: the same tubing, drawn wide */                 /* the capillary: up out of the beaker, along the scale, into the shoot's tube */
    var RES = 'M420 300 V140';                                      /* the reservoir, joined to it from above; its water stands at 140 */
    stage.innerHTML = '<svg viewBox="0 0 960 440" class="po__svg" role="img" aria-label="A bubble potometer on a bench: a leafy shoot held in an airtight rubber bung on a clamp stand, its tube joined to a capillary tube that lies along a millimetre scale and dips into a beaker of water at the far end, with an open reservoir and a tap rising from the capillary. A thermometer hangs on the stand; a fan and a lamp stand beyond the shoot.">' +
      '<rect x="0" y="0" width="960" height="440" fill="#F7F4EC"/>' +
      '<path d="M0 414 H960" stroke="#C9BFA6" stroke-width="3"/>' +
      /* the fan, on its stand, beyond the shoot */
      '<g class="po__fan"><rect x="795" y="396" width="50" height="10" rx="3" fill="#4A4F55"/><rect x="817" y="206" width="6" height="190" fill="#6B7178"/>' +
      '<rect x="813" y="202" width="14" height="18" rx="4" fill="#5B6167"/>' +
      '<circle cx="820" cy="176" r="33" fill="#F4F6F7" stroke="#7F94A2" stroke-width="2"/>' +
      '<g class="po__blades" fill="#9AA6AE">' + [0, 90, 180, 270].map(function (a) { return '<path transform="rotate(' + a + ' 820 176)" d="M820 176 C828 168 844 160 848 171 C851 179 836 186 820 176 Z"/>'; }).join('') + '</g>' +
      '<g class="po__grille">' + (function () { var g = ''; for (var i = 0; i < 12; i++) { var t = i * Math.PI / 6; g += '<line x1="' + (820 + Math.cos(t) * 11).toFixed(1) + '" y1="' + (176 + Math.sin(t) * 11).toFixed(1) + '" x2="' + (820 + Math.cos(t) * 32).toFixed(1) + '" y2="' + (176 + Math.sin(t) * 32).toFixed(1) + '"/>'; } return g; })() + '<circle cx="820" cy="176" r="24"/><circle cx="820" cy="176" r="11" fill="#C9D0D5"/></g>' +
      '<circle cx="820" cy="176" r="4" fill="#4A4F55"/>' +
      '<g class="po__air"><path d="M782 160 H752"/><path d="M780 176 H746"/><path d="M782 192 H752"/></g></g>' +
      /* the lamp, on the bench beyond the fan, shining back over the shoot */
      '<g class="po__lamp"><rect x="902" y="396" width="48" height="10" rx="3" fill="#4A4F55"/><path d="M926 396 L922 74 L890 62" stroke="#6B7178" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<path d="M896 42 L856 36 L850 86 L892 80 Z" fill="#6B7178"/><path class="po__bulb" d="M856 38 L850 84 L836 62 Z" fill="#FFE99A"/></g>' +
      '<path class="po__beam" d="M846 50 L470 30 L470 214 L846 76 Z" fill="#FFE99A"/><ellipse class="po__glow" cx="' + PO_STEM + '" cy="112" rx="130" ry="100" fill="#FFE99A"/>' +
      '<path class="po__bag" d="M486 26 H664 Q680 26 680 42 V208 Q680 224 664 224 H486 Q470 224 470 208 V42 Q470 26 486 26 Z"/>' +
      /* the clamp stand, right of the shoot, with a thermometer hung on it */
      '<rect x="610" y="402" width="170" height="12" rx="3" fill="#4A4F55"/><rect x="700" y="54" width="9" height="350" fill="#6B7178"/>' +
      '<rect x="684" y="168" width="34" height="24" rx="3" fill="#4A4F55"/><rect x="620" y="176" width="66" height="8" fill="#4A4F55"/>' +
      '<path d="M588 168 v24 M622 168 v24" stroke="#4A4F55" stroke-width="6" stroke-linecap="round"/>' +
      '<g class="po__therm"><path d="M709 64 H740" stroke="#6B7178" stroke-width="3"/><rect x="734" y="56" width="12" height="120" rx="6" fill="#fff" stroke="#7F94A2" stroke-width="2"/><rect class="po__merc" x="738" y="120" width="4" height="50" fill="#D64545"/><circle cx="740" cy="182" r="8" fill="#D64545"/>' +
      '<text class="po__read po__tread" x="740" y="224" text-anchor="middle">20 °C</text><text class="po__read po__hread" x="30" y="32">50 % humidity</text></g>' +
      /* the beaker's back, so the tube shows inside it */
      '<path d="M30 330 V408 Q30 412 34 412 H126 Q130 412 130 408 V330" fill="#EAF4FA" stroke="none"/>' +
      /* the shoot's tube: wider glass, full of water, closed by the bung */
      /* the tubing, as one tube: glass outside, glass body, water inside — the capillary, the reservoir and the shoot's wide tube each layer at a time, so every join merges */
      '<path class="po__tube-out" d="' + TUBE + ' ' + RES + ' V122"/><path class="po__tube-out po__tube--wide" d="' + WIDE + '"/>' +
      '<path class="po__tube-glass" d="' + TUBE + ' ' + RES + ' V122"/><path class="po__tube-glass po__tube--wide" d="' + WIDE + '"/>' +
      '<path class="po__tube-water" d="' + TUBE + ' ' + RES + '"/><path class="po__tube-water po__tube--wide" d="' + WIDE + '"/>' +
      /* the reservoir's funnel, open at the top */
      '<path class="po__glass" d="M396 100 L414 122 V128 M444 100 L426 122 V128"/>' +
      '<g class="po__tap"><rect x="404" y="232" width="32" height="14" rx="3" fill="#6B7178"/><rect x="392" y="235" width="12" height="8" rx="2" fill="#9AA1A8"/><circle cx="388" cy="239" r="5" fill="#4A4F55"/></g>' +
      /* the beaker's water over the dipped end, then its glass in front */
      '<rect x="32" y="350" width="96" height="60" fill="#BFE0F5" opacity=".62"/>' +
      '<path d="M30 330 V408 Q30 412 34 412 H126 Q130 412 130 408 V330" fill="none" stroke="#7F94A2" stroke-width="2.5" stroke-linejoin="round"/><path d="M30 350 H130" stroke="#8FB3C7" stroke-width="1.2" opacity=".8"/>' +
      /* the rubber bung, and the shoot in it */
      '<rect x="558" y="150" width="32" height="26" rx="4" fill="#6E4A33"/>' +
      '<path d="M' + PO_STEM + ' 262 V28" stroke="#3E9A57" stroke-width="7" stroke-linecap="round"/><path d="M' + PO_STEM + ' 262 V178" stroke="#2F7D46" stroke-width="7" stroke-linecap="round" opacity=".55"/>' +
      '<g class="po__leaves">' + LEAVES.map(function (L) { return leafPath(L[0], L[1], L[2], L[3], L[4], PO_SPECIES[0].leaf); }).join('') + '</g>' +
      /* the scale under the capillary */
      '<rect x="98" y="310" width="440" height="36" rx="3" fill="#FFF9E6" stroke="#C9B77A" stroke-width="1.2"/>' +
      '<g class="po__ticks">' + ticks() + '</g>' +
      '<ellipse class="po__bubble" cx="' + PO_X0 + '" cy="300" rx="6" ry="3.4"/>' +
      '<g class="po__names"><text x="30" y="434">beaker of water</text><text x="160" y="284" text-anchor="middle">air bubble</text><text x="300" y="284" text-anchor="middle">capillary tube</text><text x="318" y="368" text-anchor="middle">scale, in mm</text>' +
      '<text x="388" y="112" text-anchor="end">reservoir</text><text x="378" y="246" text-anchor="end">tap</text><text x="436" y="198">rubber bung,</text><text x="436" y="226">airtight</text>' +
      '<text x="650" y="434">clamp stand</text><text x="862" y="182">fan</text><text x="900" y="30">lamp</text></g>' +
      '</svg>';
    var svg = stage.firstChild, bubble = svg.querySelector('.po__bubble'), leavesG = svg.querySelector('.po__leaves'), leafEls = svg.querySelectorAll('.po__leaf'), leafKind = 'bean';
    function growLeaves(sp) {
      if (sp.id === leafKind) return; leafKind = sp.id;
      leavesG.innerHTML = (sp.leaf.kind === 'grass' ? GRASS : LEAVES).map(function (L) { return leafPath(L[0], L[1], L[2], L[3], L[4], sp.leaf); }).join('');
      leafEls = svg.querySelectorAll('.po__leaf');
    }
    var tread = svg.querySelector('.po__tread'), hread = svg.querySelector('.po__hread'), merc = svg.querySelector('.po__merc'), glow = svg.querySelector('.po__glow');

    /* ----- the clock and the reading ----- */
    var clock = h('div', 'po__clock', '<b>0:00</b><span>of <i></i> · runs at ×30</span>');
    var clockB = clock.querySelector('b'), clockOf = clock.querySelector('i');
    var read = h('div', 'po__reading', '<span class="po__at">bubble at <b>0</b> mm</span>'); read.setAttribute('aria-live', 'polite');
    var atB = read.querySelector('b');
    var btns = h('div', 'po__btns');
    var bStart = h('button', 'wbtn po__start', '▶ Start the clock'), bReset = h('button', 'wbtn wbtn--quiet', 'Open the tap: bubble back to 0'), bRecord = h('button', 'wbtn po__rec', 'Record this run'), bNew = h('button', 'wbtn wbtn--quiet', 'Use a new shoot');
    bNew.title = 'Another shoot of the same kind, from another plant: its own leaves, its own rate';
    [bStart, bReset, bRecord, bNew].forEach(function (b) { b.type = 'button'; btns.appendChild(b); });
    bRecord.disabled = true;
    var result = h('div', 'po__result'); result.hidden = true; result.setAttribute('aria-live', 'polite');
    var say = h('p', 'po__say');

    /* ----- the model ----- */
    function settings() {
      var sp = PO_SPECIES.filter(function (s) { return s.id === species.value; })[0];
      return { sp: sp, leaves: +leaves.inp.value, light: +light.inp.value, temp: +temp.inp.value, hum: +hum.inp.value, wind: +wind.inp.value, grease: grease.value, joint: joint.value, time: +time.value, shoot: PO_STATE.shoot };
    }
    function rateOf(s) {
      var g = PO_GREASE.filter(function (x) { return x[0] === s.grease; })[0][2];
      return s.sp.base * (s.leaves / 5) * poLightF(s.light) * poTempF(s.temp) * poHumF(s.hum) * PO_WINDF[s.wind] * g;
    }
    var pos = 0, run = null, raf = null, lastRun = null;
    function remember() { PO_STATE.set = settings(); PO_STATE.pos = pos; PO_STATE.runs = runs; }   /* the shoot and its factor already live in PO_STATE */
    function paintConditions() {
      var s = settings();
      speciesNote.textContent = s.sp.note; growLeaves(s.sp);
      leaves.val.textContent = s.leaves; light.val.textContent = s.light + ' %'; temp.val.textContent = s.temp + ' °C'; hum.val.textContent = s.hum + ' %'; wind.val.textContent = PO_WIND[s.wind];
      clockOf.textContent = s.time + ' min';
      leafEls.forEach(function (l, i) { l.classList.toggle('is-off', i >= s.leaves); });
      glow.style.opacity = (s.light / 100 * .55).toFixed(2);
      svg.querySelector('.po__bulb').style.opacity = (.25 + s.light / 100 * .75).toFixed(2);
      merc.setAttribute('y', (172 - (s.temp - 5) / 30 * 104).toFixed(1)); merc.setAttribute('x', 738); merc.setAttribute('height', ((s.temp - 5) / 30 * 104 + 4).toFixed(1));
      svg.querySelector('.po__beam').style.opacity = (s.light / 100 * .22).toFixed(2);
      tread.textContent = s.temp + ' °C'; hread.textContent = s.hum + ' % humidity';
      svg.classList.toggle('is-bagged', s.hum >= 85);
      svg.classList.toggle('is-dark', s.light <= 10);
      svg.setAttribute('data-wind', s.wind);
      svg.classList.toggle('is-greased', s.grease !== 'none');
      var r = rateOf(s);
      remember();
      svg.style.setProperty('--vap', (2.6 / Math.max(.15, r / 2.5)).toFixed(2) + 's');
      if (!run) {
        var expected = r * s.time;
        say.innerHTML = expected > 100
          ? 'At these settings the bubble would travel about <b>' + Math.round(expected) + ' mm</b> in ' + s.time + ' min — past the end of the scale. Measure for less time, or slow the shoot down.'
          : 'Change what you like, then start the clock. Every setting is one factor; change one at a time if you want to see what it does.';
      }
    }
    [leaves, light, temp, hum, wind].forEach(function (r) { r.inp.addEventListener('input', paintConditions); });
    [species, grease, joint, time].forEach(function (s) { s.addEventListener('change', paintConditions); });

    function setBubble(mm) { pos = mm; PO_STATE.pos = mm; bubble.setAttribute('cx', (PO_X0 + mm * PO_MM).toFixed(1)); atB.textContent = mm.toFixed(mm < 10 ? 1 : 0); }
    function fmt(sec) { var m = Math.floor(sec / 60), s2 = Math.floor(sec % 60); return m + ':' + (s2 < 10 ? '0' : '') + s2; }

    function start() {
      if (run) { finish(); return; }                       /* a second press skips to the end */
      var s = settings(), rate = rateOf(s) * PO_STATE.shootF * (1 + (Math.random() - .5) * .2);   /* repeats on a real bench differ by a few per cent: hand timing, a bubble that hesitates */
      var d = rate * s.time, from = pos, capped = false, leak = s.joint === 'open', stuck = false;
      if (leak) { d *= .35 + Math.random() * .5; if (Math.random() < .25) { d *= .3; stuck = true; } }   /* air drawn in at the joint instead of water: the bubble moves less, and by a different amount each time */
      if (from + d > 100) { d = 100 - from; capped = true; }
      run = { s: s, rate: rate, d: d, from: from, capped: capped, leak: leak, stuck: stuck, t0: null, T: s.time * 2000 };
      result.hidden = true; bRecord.disabled = true; bStart.textContent = 'Skip to the end';
      ctl.classList.add('is-locked'); ctl.querySelectorAll('input,select').forEach(function (e) { e.disabled = true; });
      svg.classList.add('is-running');
      say.textContent = 'Running. The bubble moves as fast as the shoot takes water in — which is as fast as its leaves lose it.';
      if (still) { finish(); return; }
      raf = requestAnimationFrame(tick);
    }
    function tick(now) {
      if (!run) return;
      if (!stage.isConnected) { raf = null; run = null; return; }
      if (run.t0 == null) run.t0 = now;
      var k = Math.min(1, (now - run.t0) / run.T);
      setBubble(run.from + run.d * k);
      clockB.textContent = fmt(k * run.s.time * 60);
      if (k < 1) raf = requestAnimationFrame(tick); else finish();
    }
    function finish() {
      if (raf) cancelAnimationFrame(raf); raf = null;
      var r = run; run = null;
      setBubble(r.from + r.d); clockB.textContent = fmt(r.s.time * 60);
      svg.classList.remove('is-running');
      ctl.classList.remove('is-locked'); ctl.querySelectorAll('input,select').forEach(function (e) { e.disabled = false; });
      bStart.textContent = '▶ Start the clock';
      var distance = Math.round(r.from + r.d) - Math.round(r.from), mins = r.s.time, rate = distance / mins, vol = Math.PI * PO_BORE_R * PO_BORE_R * rate;   /* read to the nearest millimetre, as the scale allows */
      lastRun = { s: r.s, distance: distance, rate: rate, leak: r.leak };
      result.hidden = false;
      result.innerHTML = '<div class="po__stat"><span>Distance moved</span><b>' + distance + ' mm</b><small>from ' + Math.round(r.from) + ' to ' + Math.round(r.from + r.d) + ' on the scale, read to the nearest mm (± 0.5)</small></div>' +
        '<div class="po__stat"><span>Rate of uptake</span><b>' + rate.toFixed(2) + ' mm/min</b><small>' + distance + ' mm ÷ ' + mins + ' min</small></div>' +
        '<div class="po__stat"><span>Volume taken up</span><b>' + vol.toFixed(2) + ' mm³/min</b><small>π × 0.5² × ' + rate.toFixed(2) + ', for a 1 mm bore</small></div>' +
        (r.capped ? '<p class="po__warn">The bubble reached the end of the scale before the time was up, so this reading is too small. Open the tap, and measure for less time or slow the shoot down.</p>' : '') +
        (r.leak ? '<p class="po__warn">The joint at the bung was not sealed. Air was drawn in there instead of water from the tube, so the bubble moved less than the shoot took up' + (r.stuck ? ' — and stuck for part of the run' : '') + '. Every leaking reading is too small (a systematic error) and by a different amount each time (a random one on top). Seal the joint with petroleum jelly.</p>' : '');
      bRecord.disabled = !!r.capped;
      say.textContent = r.capped ? 'Not a fair reading — the bubble ran out of scale.' : r.leak ? 'You can record it — a leaking reading in the table is worth seeing next to a sealed one.' : 'Read the scale, then record the run. Repeat it to get a mean, or change one factor and run again.';
    }
    function resetBubble() {
      if (run) return;
      svg.classList.add('is-tapping');
      var from = pos, t0 = null;
      function back(now) {
        if (t0 == null) t0 = now;
        var k = still ? 1 : Math.min(1, (now - t0) / 600);
        setBubble(from * (1 - k)); clockB.textContent = '0:00';
        if (k < 1 && stage.isConnected) requestAnimationFrame(back); else svg.classList.remove('is-tapping');
      }
      requestAnimationFrame(back);
      result.hidden = true; bRecord.disabled = true;
      say.textContent = 'Tap opened: water from the reservoir pushed the bubble back to the start. Close it and you are ready to go again.';
    }
    bStart.addEventListener('click', start);
    bReset.addEventListener('click', resetBubble);
    bNew.addEventListener('click', function () {
      if (run) return;
      PO_STATE.shoot = (PO_STATE.shoot || 1) + 1; PO_STATE.shootF = .84 + Math.random() * .32;
      resetBubble();
      say.textContent = 'Shoot ' + String.fromCharCode(64 + PO_STATE.shoot) + ': another plant of the same kind, with its own leaves and its own rate. Repeats on one shoot are technical replicates; different shoots are true replicates — only they say something about the species.';
    });

    /* ----- the table, the means, the graph ----- */
    var runs = PO_STATE.runs;
    var tableBox = h('div', 'po__data'); tableBox.hidden = true;
    var tableWrap = h('div', 'po__tablewrap'), table = h('table', 'po__table'), means = h('div', 'po__means'), chart = h('div', 'po__chart');
    var tools = h('div', 'po__tools');
    var bCopy = h('button', 'wbtn wbtn--quiet', 'Copy the table'), bClear = h('button', 'wbtn wbtn--quiet', 'Clear the table');
    [bCopy, bClear].forEach(function (b) { b.type = 'button'; tools.appendChild(b); });
    tableWrap.appendChild(table); tableBox.appendChild(tableWrap); tableBox.appendChild(means); tableBox.appendChild(chart); tableBox.appendChild(tools);
    var COLS = [['n', 'Run'], ['plant', 'Plant'], ['shoot', 'Shoot'], ['leaves', 'Leaves'], ['light', 'Light / %'], ['temp', 'Temp / °C'], ['hum', 'Humidity / %'], ['wind', 'Wind'], ['grease', 'Grease'], ['joint', 'Joint'], ['time', 'Time / min'], ['distance', 'Distance / mm'], ['rate', 'Rate / mm min⁻¹']];
    function rowOf(r, i) {
      return { n: i + 1, plant: r.s.sp.name, shoot: String.fromCharCode(64 + (r.s.shoot || 1)), leaves: r.s.leaves, light: r.s.light, temp: r.s.temp, hum: r.s.hum, wind: PO_WIND[r.s.wind], grease: r.s.grease === 'none' ? '—' : r.s.grease, joint: r.s.joint === 'open' ? 'leaking' : 'sealed', time: r.s.time, distance: String(r.distance), rate: r.rate.toFixed(2) };
    }
    function keyOf(r) { return [r.s.sp.id, r.s.leaves, r.s.light, r.s.temp, r.s.hum, r.s.wind, r.s.grease, r.s.joint, r.s.time].join('|'); }
    bRecord.addEventListener('click', function () {
      if (!lastRun) return;
      runs.push(lastRun); lastRun = null; bRecord.disabled = true;
      paintData();
      say.textContent = 'Recorded as run ' + runs.length + '. Open the tap to reset the bubble before the next one.';
    });
    bClear.addEventListener('click', function () { runs.length = 0; paintData(); });
    bCopy.addEventListener('click', function () {
      var tsv = [COLS.map(function (c) { return c[1]; }).join('\t')].concat(runs.map(function (r, i) { var o = rowOf(r, i); return COLS.map(function (c) { return o[c[0]]; }).join('\t'); })).join('\n');
      var done = function () { bCopy.textContent = 'Copied — paste into a spreadsheet'; setTimeout(function () { bCopy.textContent = 'Copy the table'; }, 2200); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tsv).then(done, function () { fallback(); });
      else fallback();
      function fallback() { var ta = document.createElement('textarea'); ta.value = tsv; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} document.body.removeChild(ta); }
    });
    function paintData() {
      tableBox.hidden = !runs.length;
      if (!runs.length) { table.innerHTML = ''; means.innerHTML = ''; chart.innerHTML = ''; return; }
      table.innerHTML = '<thead><tr>' + COLS.map(function (c) { return '<th>' + c[1] + '</th>'; }).join('') + '<th></th></tr></thead><tbody>' +
        runs.map(function (r, i) { var o = rowOf(r, i); return '<tr>' + COLS.map(function (c) { return '<td>' + esc(String(o[c[0]])) + '</td>'; }).join('') + '<td><button type="button" class="po__del" aria-label="Delete run ' + (i + 1) + '" data-i="' + i + '">✕</button></td></tr>'; }).join('') + '</tbody>';
      table.querySelectorAll('.po__del').forEach(function (b) { b.addEventListener('click', function () { runs.splice(+b.getAttribute('data-i'), 1); paintData(); }); });
      /* means of repeated conditions */
      var groups = {}, order = [];
      runs.forEach(function (r) { var k = keyOf(r); if (!groups[k]) { groups[k] = []; order.push(k); } groups[k].push(r); });
      var reps = order.filter(function (k) { return groups[k].length > 1; });
      means.innerHTML = reps.length ? '<b>Means of repeated runs</b>' + reps.map(function (k) {
        var g = groups[k], rs = g.map(function (r) { return r.rate; }), mean = rs.reduce(function (a, b) { return a + b; }, 0) / rs.length;
        var s = g[0].s, shoots = {}; g.forEach(function (r) { shoots[r.s.shoot || 1] = 1; }); var ns = Object.keys(shoots).length;
        return '<div class="po__mean">' + esc(s.sp.name) + ', ' + s.leaves + ' leaves, ' + s.light + ' % light, ' + s.temp + ' °C, ' + s.hum + ' % humidity, ' + esc(PO_WIND[s.wind]) + (s.grease === 'none' ? '' : ', grease ' + esc(s.grease)) + (s.joint === 'open' ? ', joint leaking' : '') + ', ' + s.time + ' min: <b>' + mean.toFixed(2) + ' mm / min</b> <small>(' + g.length + ' runs on ' + ns + (ns === 1 ? ' shoot — technical replicates' : ' shoots') + ', ' + Math.min.apply(null, rs).toFixed(2) + '–' + Math.max.apply(null, rs).toFixed(2) + ')</small></div>';
      }).join('') : (runs.length >= 2 ? '<small>Repeat a run with the same settings and its mean appears here.</small>' : '');
      chart.innerHTML = graph(groups, order);
    }
    /* the graph picks its x-axis: the one factor that changed between runs */
    var FACT = [['leaves', 'Leaves on the shoot', true], ['light', 'Light / %', true], ['temp', 'Temperature / °C', true], ['hum', 'Humidity / %', true], ['wind', 'Wind', false], ['time', 'Time / min', true], ['sp', 'Plant', false], ['grease', 'Grease', false], ['joint', 'Joint at the bung', false]];
    function fval(r, f) { return f === 'sp' ? r.s.sp.name : f === 'wind' ? PO_WIND[r.s.wind] : f === 'joint' ? (r.s.joint === 'open' ? 'not sealed' : 'sealed') : r.s[f]; }
    function graph(groups, order) {
      if (runs.length < 2) return '<small class="po__gnote">Record a second run and the graph draws itself.</small>';
      var varying = FACT.filter(function (F) { var vals = {}; runs.forEach(function (r) { vals[fval(r, F[0])] = 1; }); return Object.keys(vals).length > 1; });
      var W = 560, H = 230, L = 54, R = 16, T = 18, B = 54;
      var pts, xlab, numeric = false, note = '';
      if (varying.length === 1) {
        var F = varying[0]; xlab = F[1]; numeric = F[2];
        var byX = {}; runs.forEach(function (r) { var x = fval(r, F[0]); (byX[x] = byX[x] || []).push(r.rate); });
        pts = Object.keys(byX).map(function (x) { var rs = byX[x]; return { x: numeric ? +x : x, mean: rs.reduce(function (a, b) { return a + b; }, 0) / rs.length, all: rs }; });
        var ORDER = { wind: PO_WIND, sp: PO_SPECIES.map(function (q) { return q.name; }), grease: PO_GREASE.map(function (q) { return q[0]; }), joint: ['sealed', 'not sealed'] }[F[0]];
        pts.sort(function (a, b) { return numeric ? a.x - b.x : ORDER.indexOf(a.x) - ORDER.indexOf(b.x); });
        note = 'Rate of uptake against ' + F[1].toLowerCase().replace(/ \/ .*/, '') + ' — the one factor you changed' + (pts.some(function (p) { return p.all.length > 1; }) ? '; a point is the mean of its repeats' : '') + '.';
      } else {
        xlab = 'Run'; pts = runs.map(function (r, i) { return { x: i + 1, mean: r.rate, all: [r.rate] }; });
        note = varying.length ? 'More than one factor changed between runs (' + varying.map(function (F) { return F[1].toLowerCase().replace(/ \/ .*/, ''); }).join(', ') + '), so this is rate by run. Change one thing at a time to see what it does.' : 'Every run had the same settings: rate by run, with the mean above.';
        numeric = false;
      }
      var ymax = Math.max.apply(null, pts.map(function (p) { return Math.max.apply(null, p.all); })) * 1.15 || 1;
      var ystep = ymax > 10 ? 5 : ymax > 4 ? 2 : ymax > 2 ? 1 : ymax > 1 ? .5 : .25;
      function Y(v) { return T + (H - T - B) * (1 - v / ymax); }
      var xs = pts.map(function (p) { return p.x; });
      function X(i, v) {
        if (numeric) { var lo = Math.min.apply(null, xs), hi = Math.max.apply(null, xs); return lo === hi ? (L + W - R) / 2 : L + (W - L - R) * (v - lo) / (hi - lo); }
        return L + (W - L - R) * (i + .5) / pts.length;
      }
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="po__gsvg" role="img" aria-label="' + esc(note) + '">';
      for (var v = 0; v <= ymax; v += ystep) s += '<line class="po__grid" x1="' + L + '" y1="' + Y(v).toFixed(1) + '" x2="' + (W - R) + '" y2="' + Y(v).toFixed(1) + '"/><text class="po__gt" x="' + (L - 6) + '" y="' + (Y(v) + 3.5).toFixed(1) + '" text-anchor="end">' + (ystep < 1 ? v.toFixed(2) : v) + '</text>';
      s += '<line class="po__axis" x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (H - B) + '"/><line class="po__axis" x1="' + L + '" y1="' + (H - B) + '" x2="' + (W - R) + '" y2="' + (H - B) + '"/>';
      s += '<text class="po__gl" transform="rotate(-90)" x="' + (-(T + H - B) / 2) + '" y="14" text-anchor="middle">Rate / mm min⁻¹</text><text class="po__gl" x="' + ((L + W - R) / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(xlab) + '</text>';
      if (numeric && pts.length > 1) s += '<polyline class="po__line" points="' + pts.map(function (p, i) { return X(i, p.x).toFixed(1) + ',' + Y(p.mean).toFixed(1); }).join(' ') + '"/>';
      pts.forEach(function (p, i) {
        var x = X(i, p.x);
        if (!numeric) s += '<rect class="po__gbar" x="' + (x - 14).toFixed(1) + '" y="' + Y(p.mean).toFixed(1) + '" width="28" height="' + (H - B - Y(p.mean)).toFixed(1) + '"/>';
        p.all.forEach(function (v) { s += '<circle class="po__dot' + (p.all.length > 1 ? ' po__dot--rep' : '') + '" cx="' + x.toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3"/>'; });
        if (p.all.length > 1) s += '<circle class="po__dotmean" cx="' + x.toFixed(1) + '" cy="' + Y(p.mean).toFixed(1) + '" r="4.5"/>';
        var every = pts.length > 8 ? Math.ceil(pts.length / 8) : 1;
        if (i % every === 0 || i === pts.length - 1) s += '<text class="po__gt" x="' + x.toFixed(1) + '" y="' + (H - B + 14) + '" text-anchor="middle">' + esc(String(p.x)) + '</text>';
      });
      s += '</svg><small class="po__gnote">' + esc(note) + '</small>';
      return s;
    }

    /* ----- put it together -----
       On a wide screen the bench and its live numbers stand in the plate column on the left
       (plate.js empties and shows #benchHost for this station), and this widget keeps the
       controls, the buttons and the data. On a phone everything stacks inside the widget. */
    var live = h('div', 'po__live'); live.appendChild(clock); live.appendChild(read); live.appendChild(result);
    var slot = h('div', 'po__slot');
    var wrap2 = h('div', 'po');
    var right = h('div', 'po__right'); right.appendChild(ctl); right.appendChild(btns); right.appendChild(say);
    wrap2.appendChild(slot); wrap2.appendChild(right);
    box.appendChild(wrap2); box.appendChild(tableBox);
    box.appendChild(h('p', 'widget__note', 'A model, scaled to published class results rather than measured here: a leafy shoot in still room air moves the bubble about 2–4 mm a minute in a 1 mm bore tube, a fan or a warm dry room multiplies that, the dark almost stops it; the plants are ranked by the leaf rates in the literature — a sunflower leaf transpires several times faster than an ivy or privet leaf, and marram grass with its rolled leaves far less. Every run starts where the last one left the bubble unless you open the tap. Sources: assets/photos/CREDITS.md.'));
    var wideQ = window.matchMedia('(min-width: 1001px)');
    function mount() {
      var host = document.getElementById('benchHost');
      var wide = wideQ.matches && host && !host.hidden;
      var target = wide ? host : slot;
      if (stage.parentNode !== target) {
        if (wide) host.innerHTML = '';
        target.appendChild(stage); target.appendChild(live);
      }
      box.classList.toggle('po--split', !!wide);
    }
    var onWide = function () { if (box.isConnected) mount(); else wideQ.removeEventListener('change', onWide); };
    wideQ.addEventListener('change', onWide);
    mount();
    setBubble(PO_STATE.pos || 0); paintConditions(); paintData();
    return box;
  }

  /* ---------- sourcesink: two seasons ---------- */
  function sourcesink(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Source or sink?', spec.ask, 'Pick a season'));
    var SEASONS = {
      summer: { label: 'Summer — leaves in full sun', parts: [
        ['Leaves', 'source', 'making glucose all day and loading sucrose into the phloem'], ['Roots', 'sink', 'growing, and storing some sugar as starch'],
        ['Shoot tip', 'sink', 'dividing cells need sucrose for respiration and growth'], ['Flower', 'sink', 'makes no food of its own; every petal was built from translocated sugar'],
        ['Fruit and seeds', 'sink', 'filling up: the sugar in a fruit came from the leaves'], ['Potato tuber', 'sink', 'swelling as it stores starch']] },
      spring: { label: 'Spring — a tuber sprouting', parts: [
        ['Potato tuber', 'source', 'its starch is converted back to sucrose and sent up to the new shoot'], ['New shoot', 'sink', 'growing fast, and no leaves big enough to feed itself yet'],
        ['Young leaves', 'sink', 'still unfolding: they use more than they make until they are full size'], ['New roots', 'sink', 'growing down into the soil'],
        ['Seed, germinating', 'source', 'its stored food is digested and sent to the seedling'], ['Seedling', 'sink', 'living on the seed’s store until its leaves open']] }
    };
    var tabs = h('div', 'ss__tabs'), list = h('ul', 'ss__list'), say = h('p', 'ss__say');
    function show(k) {
      tabs.querySelectorAll('button').forEach(function (b) { b.classList.toggle('is-on', b.dataset.k === k); });
      list.innerHTML = SEASONS[k].parts.map(function (p) {
        return '<li class="ss__part ss__part--' + p[1] + '"><b>' + esc(p[0]) + '</b><span class="ss__tag">' + p[1] + '</span><small>' + esc(p[2]) + '</small></li>';
      }).join('');
      say.textContent = k === 'summer' ? 'Sucrose moves from the leaves to everything else: down to the roots and tubers, up to the flowers and fruit. Both directions at once, in different phloem tubes.'
        : 'The store is the source now, and the new growth the sink. The same tuber that was a sink in summer is feeding the plant in spring.';
    }
    Object.keys(SEASONS).forEach(function (k) { var b = h('button', 'wbtn', esc(SEASONS[k].label)); b.type = 'button'; b.dataset.k = k; b.addEventListener('click', function () { show(k); }); tabs.appendChild(b); });
    box.appendChild(tabs); box.appendChild(list); box.appendChild(say); show('summer');
    return box;
  }

  /* ---------- auxin: move the light ---------- */
  function auxin(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Move the light', spec.ask, 'Click a lamp'));
    var wrap = h('div', 'ax');
    wrap.innerHTML = '<div class="ax__lamps"><button type="button" class="ax__lamp" data-side="left" aria-label="Light from the left">☀ left</button><button type="button" class="ax__lamp is-on" data-side="top" aria-label="Light from above">☀ above</button><button type="button" class="ax__lamp" data-side="right" aria-label="Light from the right">☀ right</button></div>' +
      '<svg viewBox="0 0 300 220" class="ax__svg" aria-label="A shoot tip, and the auxin inside it">' +
      '<rect x="0" y="0" width="300" height="220" fill="#F7F4EC"/><path d="M0 200 H300" stroke="#8A5A2A" stroke-width="3"/>' +
      '<g class="ax__shoot"><path class="ax__stem" d="M132 200 L132 70 Q132 40 150 40 Q168 40 168 70 L168 200 Z"/>' +
      '<g class="ax__dots"></g><text class="ax__l" x="150" y="118" text-anchor="middle">shoot tip</text></g>' +
      '<text class="ax__say" x="150" y="214" text-anchor="middle"></text></svg>';
    var svg = wrap.querySelector('svg'), shoot = svg.querySelector('.ax__shoot'), dots = svg.querySelector('.ax__dots'), say = svg.querySelector('.ax__say');
    var explain = h('p', 'ax__why');
    function paint(side) {
      wrap.querySelectorAll('.ax__lamp').forEach(function (b) { b.classList.toggle('is-on', b.dataset.side === side); });
      var s = '';
      for (var i = 0; i < 26; i++) {
        var y = 52 + (i % 13) * 11, left = i < 13;
        var x = side === 'top' ? (left ? 141 : 159) : side === 'left' ? (left ? 161 : 163 + (i % 3) * 2) : (left ? 137 - (i % 3) * 2 : 139);
        s += '<circle cx="' + x + '" cy="' + y + '" r="2.6"/>';
      }
      dots.innerHTML = s;
      shoot.style.transform = side === 'top' ? 'none' : side === 'left' ? 'rotate(-14deg)' : 'rotate(14deg)';
      say.textContent = side === 'top' ? 'auxin spread evenly: straight up' : 'auxin on the shaded side: it bends to the light';
      explain.innerHTML = side === 'top'
        ? 'Light from above: the auxin made in the tip diffuses down both sides equally, both sides elongate at the same rate, and the shoot grows straight.'
        : 'Light from the ' + side + ': the auxin moves to the <b>shaded</b> side. More auxin there stimulates more cell elongation on that side, so it grows faster than the lit side and the shoot bends <b>towards the light</b>. That is positive phototropism, and 14.5.5 in four steps.';
    }
    wrap.querySelectorAll('.ax__lamp').forEach(function (b) { b.addEventListener('click', function () { paint(b.dataset.side); }); });
    box.appendChild(wrap); box.appendChild(explain); paint('top');
    return box;
  }

  /* ---------- the drawings ---------- */
  function flowerSvg(labelled) {
    /* a half-flower, drawn to the drawing rules: one outline per part, no shading, ruled
       labels in a column. The geometry is fixed so the hotspot question can use the same
       drawing without labels. viewBox 0 0 500 340. */
    var parts =
      '<path data-part="receptacle" class="fl__stalk" d="M244 340 V262 Q250 250 256 262 V340 Z"/>' +
      '<path data-part="sepal" class="fl__sepal" d="M236 256 C200 246 140 232 96 246 C140 262 200 268 236 262 Z"/>' +
      '<path data-part="sepal" class="fl__sepal" d="M264 256 C300 246 360 232 404 246 C360 262 300 268 264 262 Z"/>' +
      '<path data-part="petal" class="fl__petal" d="M238 250 C170 230 80 190 60 92 C130 96 210 160 238 250 Z"/>' +
      '<path data-part="petal" class="fl__petal" d="M262 250 C330 230 420 190 440 92 C370 96 290 160 262 250 Z"/>' +
      '<path data-part="filament" class="fl__filament" d="M212 248 C196 200 176 160 166 124"/>' +
      '<path data-part="filament" class="fl__filament" d="M288 248 C304 200 324 160 334 124"/>' +
      '<ellipse data-part="anther" class="fl__anther" cx="164" cy="110" rx="12" ry="17"/>' +
      '<ellipse data-part="anther" class="fl__anther" cx="336" cy="110" rx="12" ry="17"/>' +
      '<path data-part="nectary" class="fl__nectary" d="M232 252 a5 5 0 1 0 -10 0 a5 5 0 1 0 10 0 M278 252 a5 5 0 1 0 -10 0 a5 5 0 1 0 10 0"/>' +
      '<ellipse data-part="ovary" class="fl__ovary" cx="250" cy="224" rx="38" ry="44"/>' +
      '<circle data-part="ovule" class="fl__ovule" cx="232" cy="230" r="9"/><circle data-part="ovule" class="fl__ovule" cx="256" cy="206" r="9"/><circle data-part="ovule" class="fl__ovule" cx="262" cy="240" r="9"/>' +
      '<path data-part="style" class="fl__style" d="M244 182 C244 150 245 120 246 84 H254 C255 120 256 150 256 182 Z"/>' +
      '<ellipse data-part="stigma" class="fl__stigma" cx="250" cy="72" rx="17" ry="10"/>';
    var labels = '';
    if (labelled) {
      /* two columns, each ordered by the height of what it names, so no two lines cross:
         the parts on the flower's axis and its right side read to the right, the petal and
         the sepal to the left */
      var R = [[250, 72, 'stigma'], [336, 110, 'anther'], [251, 130, 'style'], [312, 176, 'filament'], [286, 224, 'ovary'], [262, 240, 'ovule'], [274, 252, 'nectary', true]];
      var Lf = [[120, 126, 'petal'], [130, 250, 'sepal']];
      var ysR = [44, 82, 120, 158, 196, 234, 272], ysL = [126, 250];
      R.forEach(function (l, i) {
        var y = ysR[i], x2 = 452;
        labels += '<line class="fl__lead' + (l[3] ? ' fl__lead--extra' : '') + '" x1="' + l[0] + '" y1="' + l[1] + '" x2="' + (x2 - 6) + '" y2="' + y + '"/>' +
          '<circle class="fl__dot" cx="' + l[0] + '" cy="' + l[1] + '" r="2.2"/>' +
          '<text class="fl__lab' + (l[3] ? ' fl__lab--extra' : '') + '" x="' + x2 + '" y="' + (y + 4) + '">' + l[2] + '</text>';
      });
      Lf.forEach(function (l, i) {
        var y = ysL[i], x2 = 48;
        labels += '<line class="fl__lead" x1="' + l[0] + '" y1="' + l[1] + '" x2="' + (x2 + 6) + '" y2="' + y + '"/>' +
          '<circle class="fl__dot" cx="' + l[0] + '" cy="' + l[1] + '" r="2.2"/>' +
          '<text class="fl__lab" x="' + x2 + '" y="' + (y + 4) + '" text-anchor="end">' + l[2] + '</text>';
      });
      labels += '<text class="fl__title" x="8" y="332">An insect-pollinated flower, cut in half</text>';
    }
    return '<svg viewBox="0 0 500 340" class="fl__svg" role="img" aria-label="A labelled drawing of an insect-pollinated flower cut in half">' + parts + labels + '</svg>';
  }
  var PART_INFO = {
    sepal: ['Sepal', 'Protects the flower while it is a bud. Green, leaf-like, outside the petals.'],
    petal: ['Petal', 'Attracts insects: large, brightly coloured and often scented in an insect-pollinated flower.'],
    stamen: ['Stamen', 'The male part: a filament holding up an anther.'],
    filament: ['Filament', 'The stalk of a stamen. Holds the anther up where a visiting insect brushes against it.'],
    anther: ['Anther', 'Makes pollen grains, each carrying the male gamete.'],
    carpel: ['Carpel', 'The female part: stigma, style and ovary together.'],
    stigma: ['Stigma', 'Receives pollen grains. Sticky in an insect-pollinated flower.'],
    style: ['Style', 'Holds the stigma up above the ovary. The pollen tube grows down through it.'],
    ovary: ['Ovary', 'Contains the ovules. After fertilisation it becomes the fruit.'],
    ovule: ['Ovule', 'Contains the female gamete. After fertilisation it becomes a seed.'],
    nectary: ['Nectary', 'Makes nectar, the sugary reward that keeps insects visiting. Not one of the ten names 0610 asks for.'],
    receptacle: ['Receptacle', 'The top of the flower stalk, which all the parts are attached to. Not asked for in 0610.']
  };
  var DIAGRAMS = {
    'flower': { svg: flowerSvg(true) },
    'flower-blank': { svg: flowerSvg(false) }
  };
  function svgFor(name) { return DIAGRAMS[name] ? DIAGRAMS[name].svg : ''; }

  function diagram(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'A drawing', spec.ask, 'Click the parts'));
    var wrap = h('div', 'fl'), stage = h('div', 'fl__stage'); stage.innerHTML = svgFor(spec.name || 'flower');
    var info = h('div', 'fl__info', '<b>Click any part</b><small>Ten names on the syllabus: sepals, petals, stamens (filament and anther), carpel (stigma, style, ovary and ovules).</small>');
    var seen = {}, done = null;
    stage.querySelectorAll('[data-part]').forEach(function (el) {
      el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
      var p = el.getAttribute('data-part');
      var pi = PART_INFO[p]; if (pi) el.setAttribute('aria-label', pi[0]);
      function pick() {
        stage.querySelectorAll('[data-part]').forEach(function (x) { x.classList.toggle('is-on', x.getAttribute('data-part') === p); });
        var group = p === 'filament' || p === 'anther' ? ' <span class="fl__group">part of the stamen</span>' : (p === 'stigma' || p === 'style' || p === 'ovary' || p === 'ovule') ? ' <span class="fl__group">part of the carpel</span>' : '';
        info.innerHTML = '<b>' + esc(pi[0]) + '</b>' + group + '<small>' + esc(pi[1]) + '</small>';
        seen[p] = 1;
        var need = ['sepal', 'petal', 'filament', 'anther', 'stigma', 'style', 'ovary', 'ovule'];
        if (need.every(function (k) { return seen[k]; }) && !done) { done = h('p', 'widget__done', 'All eight — with stamen and carpel as the two groups, that is the ten names.'); box.appendChild(done); }
      }
      el.addEventListener('click', pick);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    wrap.appendChild(stage); wrap.appendChild(info); box.appendChild(wrap);
    return box;
  }

  /* ---------- pollentube ---------- */
  function pollentube(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Grow the pollen tube', spec.ask, 'Press play'));
    var wrap = h('div', 'pt');
    wrap.innerHTML = '<svg viewBox="0 0 300 300" class="pt__svg" aria-label="A carpel: pollen grain on the stigma, the pollen tube growing down the style into the ovule">' +
      '<rect x="0" y="0" width="300" height="300" fill="#F7F4EC"/>' +
      '<ellipse class="pt__ovary" cx="150" cy="230" rx="60" ry="56"/><circle class="pt__ovule" cx="150" cy="236" r="26"/><circle class="pt__egg" cx="150" cy="240" r="7"/>' +
      '<path class="pt__style" d="M138 176 C138 130 140 90 142 52 H158 C160 90 162 130 162 176 Z"/><ellipse class="pt__stigma" cx="150" cy="44" rx="26" ry="12"/>' +
      '<circle class="pt__grain" cx="150" cy="36" r="8"/>' +
      '<path class="pt__tube" d="M150 44 C148 90 152 140 150 176 C149 200 150 216 150 230"/>' +
      '<circle class="pt__nucleus" cx="150" cy="36" r="4"/>' +
      '<text class="pt__t" x="8" y="292"></text></svg>';
    var svg = wrap.firstChild, tube = svg.querySelector('.pt__tube'), nuc = svg.querySelector('.pt__nucleus'), egg = svg.querySelector('.pt__egg'), txt = svg.querySelector('.pt__t');
    var steps = h('ol', 'pt__steps');
    var STEPS = ['A pollen grain lands on the stigma — pollination.', 'It grows a pollen tube down through the style.', 'The tube grows into the ovary and enters an ovule.', 'The pollen nucleus travels down the tube and fuses with the nucleus of the female gamete — fertilisation.'];
    STEPS.forEach(function (s, i) { steps.appendChild(h('li', 'pt__step', esc(s))); });
    var len = 0; try { len = tube.getTotalLength(); } catch (e) { len = 200; }
    var play = h('button', 'wbtn', 'Play'); play.type = 'button';
    var raf = null, t0 = null;
    function setStep(i) { steps.querySelectorAll('li').forEach(function (li, k) { li.classList.toggle('is-on', k === i); li.classList.toggle('is-done', k < i); }); txt.textContent = STEPS[i] ? STEPS[i].replace(/ — .*/, '') : ''; }
    function frame(now) {
      if (t0 == null) t0 = now;
      var k = Math.min(1, (now - t0) / 5200);
      var grow = Math.min(1, k / .55), travel = Math.max(0, (k - .6) / .4);
      tube.style.strokeDasharray = len; tube.style.strokeDashoffset = len * (1 - grow);
      if (k < .1) setStep(0); else if (k < .55) setStep(1); else if (k < .6) setStep(2); else setStep(3);
      if (travel > 0) {
        var p = tube.getPointAtLength(len * travel); nuc.setAttribute('cx', p.x); nuc.setAttribute('cy', p.y);
        if (travel >= 1) { egg.classList.add('is-fused'); nuc.classList.add('is-fused'); txt.textContent = 'Fertilisation: the two nuclei have fused.'; }
      }
      if (k < 1 && wrap.isConnected) raf = requestAnimationFrame(frame); else { raf = null; play.textContent = 'Play again'; }
    }
    play.addEventListener('click', function () {
      if (raf) cancelAnimationFrame(raf); t0 = null;
      egg.classList.remove('is-fused'); nuc.classList.remove('is-fused'); nuc.setAttribute('cx', 150); nuc.setAttribute('cy', 36);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { tube.style.strokeDashoffset = 0; nuc.setAttribute('cy', 236); egg.classList.add('is-fused'); setStep(3); txt.textContent = 'Fertilisation: the two nuclei have fused.'; return; }
      tube.style.strokeDasharray = len; tube.style.strokeDashoffset = len; raf = requestAnimationFrame(frame);
    });
    tube.style.strokeDasharray = len; tube.style.strokeDashoffset = len; setStep(0); txt.textContent = 'A pollen grain on the stigma';
    wrap.appendChild(steps);
    box.appendChild(wrap); box.appendChild(play);
    return box;
  }

  /* ---------- adapt: two plants, feature by feature ---------- */
  function adapt(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Read the plant', spec.ask, 'Click the features'));
    var PLANTS = [
      { name: 'A cactus, in a desert', kind: 'xerophyte', problem: 'Too little water; fierce sun; a downpour now and then.', feats: [
        ['Leaves reduced to spines', 'a tiny surface area', 'so almost no water is lost by transpiration — and the spines keep animals off'],
        ['Thick, fleshy stem', 'stores water, and holds the chloroplasts', 'so photosynthesis happens in the stem and the store lasts through the dry season'],
        ['Thick waxy cuticle', 'waterproofs the whole surface', 'so water cannot evaporate through it'],
        ['Few stomata, sunk in pits', 'trap a pocket of humid air over each pore', 'so the concentration gradient out of the plant is small and little water vapour diffuses away'],
        ['Roots spread wide, just under the surface', 'catch rain as soon as it falls', 'before it soaks away or evaporates']] },
      { name: 'A water lily, in a pond', kind: 'hydrophyte', problem: 'Water everywhere; little oxygen in the mud; light only at the surface.', feats: [
        ['Large, flat leaves that float', 'catch light at the surface and touch the air', 'so it can photosynthesise and exchange gases above the water'],
        ['Stomata on the upper surface', 'open onto the air, not the water', 'so carbon dioxide can get in and oxygen out'],
        ['Large air spaces in leaves and stems', 'give buoyancy and carry oxygen down', 'so the leaves float and the roots in the airless mud can respire'],
        ['Thin cuticle', 'there is no water to save', 'so nothing is spent on waterproofing'],
        ['Long, thin, flexible stem', 'the water holds it up', 'so it bends in a current instead of snapping'],
        ['Small roots', 'water and mineral ions come in over the whole surface', 'so a big root system is not needed']] }
    ];
    var wrap = h('div', 'ad');
    PLANTS.forEach(function (p) {
      var col = h('div', 'ad__plant ad__plant--' + p.kind);
      col.innerHTML = '<h4>' + esc(p.name) + '<small>' + esc(p.problem) + '</small></h4>';
      var chips = h('div', 'ad__chips'), say = h('p', 'ad__say', '<i>Click a feature.</i>');
      p.feats.forEach(function (f) {
        var b = h('button', 'ad__chip', esc(f[0])); b.type = 'button';
        b.addEventListener('click', function () {
          chips.querySelectorAll('.ad__chip').forEach(function (x) { x.classList.toggle('is-on', x === b); });
          say.innerHTML = '<span class="ad__f">' + esc(f[0]) + '</span> <span class="ad__arrow">→</span> <span class="ad__d">' + esc(f[1]) + '</span> <span class="ad__arrow">→</span> <span class="ad__w">' + esc(f[2]) + '</span>';
        });
        chips.appendChild(b);
      });
      col.appendChild(chips); col.appendChild(say); wrap.appendChild(col);
    });
    box.appendChild(wrap);
    box.appendChild(h('p', 'widget__note', 'Feature → what it does → why that matters here. An answer with only the first part earns nothing.'));
    return box;
  }

  [['video', video], ['germinate', germinate], ['equation', equation], ['limiting', limiting], ['starchtest', starchtest], ['indicator', indicator],
   ['potometer', potometer], ['sourcesink', sourcesink], ['auxin', auxin], ['diagram', diagram], ['pollentube', pollentube], ['adapt', adapt]]
    .forEach(function (m) { W.register(m[0], m[1]); });

  global.Learn = { widget: W.widget, reap: W.reap, svgFor: svgFor, DIAGRAMS: DIAGRAMS, PART_INFO: PART_INFO };
})(window);
