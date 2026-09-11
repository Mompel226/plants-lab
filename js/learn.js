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
      (spec.credit ? (spec.url ? ' <a class="media__credit" href="' + esc(spec.url) + '" target="_blank" rel="noopener">' + esc(spec.credit) + '</a>' : ' <span class="media__credit">' + esc(spec.credit) + '</span>') : '')));
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
  /* the seeds in a tube: three broad beans on a pad of cotton wool, each with a seedling folded to nothing inside it —
     a cream radicle to grow down and a green hooked shoot with two seed leaves to grow up */
  function tubeSvg() {
    var seed = function (x, y, k) {
      return '<g transform="translate(' + x + ' ' + y + ')"><g class="sprout" transform="scale(0)">' +
        '<path d="M0 1.6 C' + (-1.2 * k) + ' 4.5 ' + (-3 * k) + ' 6.5 ' + (-2.2 * k) + ' 10" fill="none" stroke="#EFE3C4" stroke-width="1.3" stroke-linecap="round"/>' +
        '<path d="M0 -1.6 C0 -7 ' + (-2.4 * k) + ' -11 ' + (1.2 * k) + ' -15.5" fill="none" stroke="#5DBF6E" stroke-width="1.7" stroke-linecap="round"/>' +
        '<ellipse cx="' + (-1.2 * k) + '" cy="-15.6" rx="2.6" ry="1.4" transform="rotate(' + (-32 * k) + ' ' + (-1.2 * k) + ' -15.6)" fill="#8FD48A" stroke="#3F9A55" stroke-width=".6"/>' +
        '<ellipse cx="' + (3.2 * k) + '" cy="-16.2" rx="2.6" ry="1.4" transform="rotate(' + (26 * k) + ' ' + (3.2 * k) + ' -16.2)" fill="#8FD48A" stroke="#3F9A55" stroke-width=".6"/></g>' +
        '<ellipse rx="3.6" ry="2.4" fill="#B7864B" stroke="#7E5227" stroke-width=".6"/><path d="M-1.8 -.6 Q0 .4 1.8 -.6" fill="none" stroke="#8A5A2A" stroke-width=".5" opacity=".8"/></g>';
    };
    return '<svg class="tube__svg" viewBox="0 0 30 60" aria-hidden="true"><ellipse cx="15" cy="55" rx="12.5" ry="4.5" fill="#F4F2EC" stroke="#E2DED2" stroke-width=".6"/>' + seed(8, 52, 1) + seed(15.5, 53.5, -1) + seed(22.5, 51.5, 1) + '</svg>';
  }
  /* the seedlings grow out over a second and a half, one a little after the other */
  function sprout(c) {
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches, gs = c.querySelectorAll('.sprout');
    gs.forEach(function (g, i) {
      if (still) { g.setAttribute('transform', 'scale(1)'); return; }
      var t0 = null, delay = i * 260;
      requestAnimationFrame(function step(now) {
        if (t0 == null) t0 = now;
        var k = Math.max(0, Math.min(1, (now - t0 - delay) / 1300)), e = 1 - Math.pow(1 - k, 3);
        g.setAttribute('transform', 'scale(' + e.toFixed(3) + ')');
        if (k < 1 && c.isConnected) requestAnimationFrame(step);
      });
    });
  }
  function germinate(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Which tubes germinate?', spec.ask, 'Press the tubes'));
    var row = h('div', 'tubes'), n = 0, done = null;
    TUBES.forEach(function (t) {
      var c = h('button', 'tube'); c.type = 'button';
      c.innerHTML = '<span class="tube__glass">' + tubeSvg() + '</span>' +
        '<b>' + esc(t.name) + '</b><span class="tube__has">' + ['water', 'oxygen', 'warm'].map(function (k) {
          return '<i class="' + (t.has.indexOf(k) >= 0 ? 'on' : 'off') + '">' + ICON[k] + '</i>';
        }).join('') + '</span><span class="tube__out"></span>';
      c.addEventListener('click', function () {
        if (c.classList.contains('is-open')) return;
        c.classList.add('is-open'); c.classList.add(t.lacks ? 'is-no' : 'is-yes');
        if (!t.lacks) sprout(c);
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
    { id: 'bean',      name: 'French bean',   base: 3.2, lower: .7, note: 'broad, thin leaves',
      leaf: { kind: 'heart', scale: 1.05, fill: '#5DBF6E', stroke: '#2A6B3B' } },
    { id: 'sunflower', name: 'Sunflower',     base: 4.4, lower: .6, note: 'very large leaves',
      leaf: { kind: 'heart', scale: 1.3, fill: '#4FAE5E', stroke: '#245B33', rough: true } },
    { id: 'geranium',  name: 'Geranium',      base: 2.6, lower: .75, note: 'soft, hairy, rounded leaves',
      leaf: { kind: 'round', scale: .9, fill: '#7CC46A', stroke: '#3F7F3A' } },
    { id: 'privet',    name: 'Privet',        base: 1.7, lower: .97, note: 'small, glossy, waxy leaves',
      leaf: { kind: 'oval', scale: .72, fill: '#3F8F4E', stroke: '#1F5A2C', gloss: true } },
    { id: 'ivy',       name: 'Ivy',           base: 1.5, lower: .97, note: 'tough, waxy, lobed leaves',
      leaf: { kind: 'lobed', scale: .95, fill: '#3E8A4A', stroke: '#1F5A2C', gloss: true, paleVeins: true } },
    { id: 'marram',    name: 'Marram grass',  base: 0.5, lower: .03, note: 'narrow leaves, rolled into tubes',
      leaf: { kind: 'grass', scale: 1.2, fill: '#9DB884', stroke: '#5E7A4B' } }
  ];
  var PO_WIND = ['still air', 'a gentle breeze', 'fan on low', 'fan on high'];
  var PO_WINDF = [1, 1.5, 1.85, 2.05];   /* a rise that levels off: a fan thins the still air round the leaf; a stronger fan has little left to thin */
  var PO_GREASE = [['none', 'no grease'], ['upper', 'grease on the upper surface'], ['lower', 'grease on the lower surface'], ['both', 'grease on both surfaces']];
  /* a greased surface keeps only the other surface's share of the stomata (`lower` is the share underneath: nearly all on privet and ivy,
     two thirds or so on bean, sunflower and geranium, almost none on marram, whose stomata line the inside of the rolled leaf), plus a little loss through the cuticle */
  function poGreaseF(sp, g) { var lower = sp.lower == null ? .95 : sp.lower, cut = .05; return g === 'upper' ? cut + (1 - cut) * lower : g === 'lower' ? cut + (1 - cut) * (1 - lower) : g === 'both' ? cut : 1; }
  var PO_MM = 4.2, PO_X0 = 108, PO_STEM = 574, PO_BORE_R = 0.5;   /* the scale's 0 mark, and the shoot's stem, in the drawing's units */
  var PO_STATE = { runs: [], pos: 0, set: null, shoot: 1, shootF: 1, unlocked: false, line: 0, lineNames: [], hidden: [], dots: true };
  try { if (sessionStorage.getItem('plants-lab.potometer.unlocked') === '1') PO_STATE.unlocked = true; } catch (e) {}
  /* the bench, the table and the shoot survive a reload (the tab's own storage; closing the tab clears it) */
  function poSpecies(id) { return PO_SPECIES.filter(function (q) { return q.id === id; })[0]; }
  try {
    var PO_SAVED = JSON.parse(sessionStorage.getItem('plants-lab.potometer') || 'null');
    if (PO_SAVED && PO_SAVED.runs) {
      PO_SAVED.runs = PO_SAVED.runs.filter(function (r) { return r && r.s && poSpecies(r.s.sp && r.s.sp.id); });
      PO_SAVED.runs.forEach(function (r) { r.s.sp = poSpecies(r.s.sp.id); });
      if (PO_SAVED.set) { PO_SAVED.set.sp = poSpecies(PO_SAVED.set.sp && PO_SAVED.set.sp.id); if (!PO_SAVED.set.sp) PO_SAVED.set = null; }
      PO_STATE.runs = PO_SAVED.runs; PO_STATE.set = PO_SAVED.set; PO_STATE.pos = +PO_SAVED.pos || 0; PO_STATE.shoot = +PO_SAVED.shoot || 1; PO_STATE.shootF = +PO_SAVED.shootF || 1; PO_STATE.err = PO_SAVED.err || 'none'; PO_STATE.line = +PO_SAVED.line || 0; PO_STATE.lineNames = PO_SAVED.lineNames || []; PO_STATE.hidden = PO_SAVED.hidden || []; PO_STATE.dots = PO_SAVED.dots !== false;
    }
  } catch (e) {}
  function poPersist() {
    try { sessionStorage.setItem('plants-lab.potometer', JSON.stringify({ runs: PO_STATE.runs, pos: PO_STATE.pos, set: PO_STATE.set, shoot: PO_STATE.shoot, shootF: PO_STATE.shootF, err: PO_STATE.err, line: PO_STATE.line, lineNames: PO_STATE.lineNames, hidden: PO_STATE.hidden, dots: PO_STATE.dots })); } catch (e) {}
  }
  function sha256hex(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); });
  }            /* kept while the lab is open: a trip to Practise and back keeps the table */              /* px per mm on the scale; the 0 mm mark; the capillary's radius, mm */

  function poLightF(L) { return .15 + .85 * (1 - Math.exp(-L / 35)) / (1 - Math.exp(-100 / 35)); }
  /* temperature: a straight rise as evaporation and diffusion speed up — next to nothing at 0 °C, twice the 20 °C rate at
     40 °C — and then a fall, because above about 40 °C the stomata close and the leaf begins to wilt */
  function poTempF(T) { return T <= 40 ? Math.max(.03, T / 20) : Math.max(.2, 2 * (1 - (T - 40) / 25)); }
  function poHumF(H) { return Math.max(.05, (100 - H) / 50); }

  /* ----- the statistics of the results table, shared by the table and by the Learn text -----
     What each one is, in plain words, and how it is worked out — with the student's own trials when
     there are repeats, and with a fixed set of five otherwise. The Learn text's bold words and the
     table's headings and toggle all open the same pop-up. */
  /* the lines of the graph: each is a table of its own, in its own colour, so one factor can be compared across lines */
  var PO_LINE = ['#1F6FB2', '#D9772B', '#6E43A8', '#C23B3B', '#188F8F', '#7A5A1E'], PO_LINE_WORD = ['blue', 'orange', 'purple', 'red', 'teal', 'brown'];
  function poLineColour(i) { return PO_LINE[i % PO_LINE.length]; }
  function poLineName(i) { return (PO_STATE.lineNames[i] || '').trim() || 'Line ' + (i + 1); }
  /* the random error of a real reading — the watch started a moment early or late, a bubble that hesitates, a reading
     taken a little off the mark: about a millimetre either way, bell-shaped, never more than two and a half. It is what
     makes repeats differ, and so what gives a standard deviation something to measure. */
  function poJitter() { var u = Math.random() || 1e-9, v = Math.random(); var g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); return Math.max(-2.5, Math.min(2.5, g * .9)); }
  var PO_T95 = { 2: 12.71, 3: 4.30, 4: 3.18, 5: 2.78 };
  function poStats(vals) {
    var n = vals.length, mean = vals.reduce(function (a, b) { return a + b; }, 0) / n;
    if (n < 2) return { n: n, mean: mean };
    var sd = Math.sqrt(vals.reduce(function (a, v) { return a + (v - mean) * (v - mean); }, 0) / (n - 1)), se = sd / Math.sqrt(n), t = PO_T95[n] || 2.78;
    return { n: n, mean: mean, sd: sd, se: se, t: t, ci: t * se };
  }
  function poKeyOf(s) { return [s.sp.id, s.leaves, s.light, s.temp, s.hum, s.wind, s.grease, s.joint, s.time].join('|'); }
  function poCondText(s) {
    return esc(s.sp.name) + ' · ' + s.leaves + ' leaves · light ' + s.light + ' % · ' + s.temp + ' °C · humidity ' + s.hum + ' % · ' + esc(PO_WIND[s.wind]) +
      (s.grease === 'none' ? '' : ' · grease on the ' + esc(s.grease === 'both' ? 'two surfaces' : s.grease + ' surface')) + (s.joint === 'open' ? ' · <b>joint leaking</b>' : '') + ' · ' + s.time + ' min';
  }
  function poGroups(runs) {   /* one row per set of conditions, within each line; lines in order, rows in the order first recorded */
    var G = {}, order = [];
    runs.forEach(function (r, i) { var ln = r.line || 0, k = ln + '|' + poKeyOf(r.s); if (!G[k]) { G[k] = { key: k, line: ln, s: r.s, trials: [] }; order.push(k); } G[k].trials.push({ r: r, i: i }); });
    order.sort(function (a, b) { return G[a].line - G[b].line; });
    return order.map(function (k) { return G[k]; });
  }

  var PO_TERMS = {
    mean: { name: 'Mean', ib: false, what: 'Add the trials up and divide by how many there are. It is your best single answer for that set of conditions — the number to plot.' },
    sd:   { name: 'Standard deviation (SD)', ib: true, what: 'How spread out the trials are around their mean. A small SD means the repeats agree with one another — good precision. It has the same unit as the trials.' },
    se:   { name: 'Standard error (SE)', ib: true, what: 'How well you know the mean itself, not how spread the trials are. More trials make it smaller, because a mean of many repeats settles down even when the repeats themselves do not.' },
    ci:   { name: '95 % confidence interval', ib: true, what: 'The range the true mean is likely to be in, given your trials. Few trials give a wide interval; more trials narrow it. If the intervals for two sets of conditions do not overlap, the difference between them is statistically significant — very unlikely to be chance alone; intervals that overlap do not prove there is no difference. It is the interval for the mean of that row: if the row mixes shoots, it takes in the difference between plants too. On the graph it is drawn as a band round the mean.' }
  };
  /* the formulae, set as a mathematician would set them */
  var PO_FM = {
    mean: '<i>x̄</i> = <span class="fm__frac"><span class="fm__num">Σ <i>x</i></span><span class="fm__den"><i>n</i></span></span>',
    sd: '<i>s</i> = <span class="fm__sqrt">√</span><span class="fm__rad"><span class="fm__frac"><span class="fm__num">Σ (<i>x</i> − <i>x̄</i>)²</span><span class="fm__den"><i>n</i> − 1</span></span></span>',
    se: 'SE = <span class="fm__frac"><span class="fm__num"><i>s</i></span><span class="fm__den">√<i>n</i></span></span>',
    ci: '95 % CI = <i>x̄</i> ± <i>t</i> × SE'
  };
  var PO_KEY = {
    mean: '<i>x</i> one trial · Σ add them all up · <i>n</i> how many trials · <i>x̄</i> the mean',
    sd: '<i>x</i> one trial · <i>x̄</i> the mean · Σ add them all up · <i>n</i> how many trials · <i>s</i> the standard deviation',
    se: '<i>s</i> the standard deviation · <i>n</i> how many trials',
    ci: '<i>x̄</i> the mean · SE the standard error · <i>t</i> a number from a table: 12.71 for 2 trials, 4.30 for 3, 3.18 for 4, 2.78 for 5'
  };
  /* the working, one step a line, with these trials */
  function poSteps(term, st, vals) {
    var f2 = function (v) { return v.toFixed(2); }, f3 = function (v) { return v.toFixed(3); }, n = st.n, sum = vals.reduce(function (a, b) { return a + b; }, 0), steps = [], table = '';
    if (term === 'mean') {
      steps.push('Add the trials up: ' + vals.map(f2).join(' + ') + ' = ' + f2(sum));
      steps.push('Divide by how many there are, ' + n + ': ' + f2(sum) + ' ÷ ' + n + ' = <b>' + f2(st.mean) + ' mm/min</b>');
    } else if (term === 'sd') {
      var sq = vals.map(function (v) { return (v - st.mean) * (v - st.mean); }), ssq = sq.reduce(function (a, b) { return a + b; }, 0), v1 = ssq / (n - 1);
      table = '<table class="po__pop__tbl"><thead><tr><th>Trial<br><i>x</i></th><th>Distance from the mean<br><i>x</i> − <i>x̄</i></th><th>Squared<br>(<i>x</i> − <i>x̄</i>)²</th></tr></thead><tbody>' +
        vals.map(function (v, k) { var d = v - st.mean; return '<tr><td>' + f2(v) + '</td><td>' + (d < 0 ? '−' : '+') + f2(Math.abs(d)) + '</td><td>' + f3(sq[k]) + '</td></tr>'; }).join('') + '</tbody></table>';
      steps.push('The mean of the trials: <i>x̄</i> = ' + f2(st.mean) + ' mm/min');
      steps.push('Each trial\'s distance from the mean, then that distance squared — the table');
      steps.push('Add the squares up: Σ (<i>x</i> − <i>x̄</i>)² = ' + f3(ssq));
      steps.push('Divide by one less than the number of trials: ' + f3(ssq) + ' ÷ ' + (n - 1) + ' = ' + f3(v1));
      steps.push('Take the square root: √' + f3(v1) + ' = <b>' + f2(st.sd) + ' mm/min</b>');
    } else if (term === 'se') {
      steps.push('The standard deviation of the trials: <i>s</i> = ' + f2(st.sd) + ' mm/min');
      steps.push('The square root of the number of trials: √' + n + ' = ' + f2(Math.sqrt(n)));
      steps.push('Divide: ' + f2(st.sd) + ' ÷ ' + f2(Math.sqrt(n)) + ' = <b>' + f2(st.se) + ' mm/min</b>');
    } else {
      steps.push('The standard error of the mean: SE = ' + f3(st.se) + ' mm/min');
      steps.push('The number from the table for ' + n + ' trials: <i>t</i> = ' + st.t);
      steps.push('Multiply: ' + st.t + ' × ' + f3(st.se) + ' = <b>± ' + f2(st.ci) + ' mm/min</b>');
      steps.push('The interval: ' + f2(st.mean) + ' − ' + f2(st.ci) + ' to ' + f2(st.mean) + ' + ' + f2(st.ci) + ' = <b>' + f2(st.mean - st.ci) + ' to ' + f2(st.mean + st.ci) + ' mm/min</b> — the true mean is probably in there');
    }
    return table + '<ol class="po__pop__steps">' + steps.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>';
  }
  var PO_EXAMPLE = [2.1, 2.4, 2.0, 2.3, 2.2];
  function poPopHTML(term, runs) {
    var T = PO_TERMS[term]; if (!T) return '';
    var ex = poGroups(runs || []).filter(function (g) { return g.trials.length >= 2; })[0], worked;
    if (ex) {
      var vals = ex.trials.map(function (t) { return t.r.rate; }), st = poStats(vals);
      worked = '<div class="po__pop__how"><p><b>Worked out for your first row with repeats</b> (' + poCondText(ex.s) + '): ' + st.n + ' trials, ' + vals.map(function (v) { return v.toFixed(2); }).join(', ') + ' mm/min; mean ' + st.mean.toFixed(2) + '.</p>' + poSteps(term, st, vals) + '</div>';
      if (term !== 'mean' && st.sd === 0) worked += '<p class="po__pop__note">Your trials are identical to the millimetre, so their spread is 0. The scale reads to 1 mm, and a difference smaller than that is hidden by it — measure for longer, and the trials will show their spread.</p>';   /* resolution, seen */
    } else {
      var st2 = poStats(PO_EXAMPLE);
      worked = '<div class="po__pop__how"><p><b>Worked example</b> — five trials on one shoot at 20 °C in still air: ' + PO_EXAMPLE.map(function (v) { return v.toFixed(2); }).join(', ') + ' mm/min; mean 2.20.</p>' + poSteps(term, st2, PO_EXAMPLE) + '</div>' +
               '<p class="po__pop__note">Record two trials of your own under the same conditions and the working is done with your numbers instead.</p>';
    }
    return '<div class="po__pop__h"><span>' + esc(T.name) + (T.ib ? ' <span class="po__pop__ib">IB content · not asked at IGCSE</span>' : '') + '</span><button type="button" class="po__pop__x" aria-label="Close">✕</button></div>' +
           '<p>' + esc(T.what) + '</p>' +
           '<div class="po__pop__fm">' + PO_FM[term] + '</div><p class="po__pop__key">' + PO_KEY[term] + '</p>' +
           worked +
           (T.ib ? '<p class="po__pop__note">This is IB Biology content: standard deviation, standard error and confidence intervals are not asked for in IGCSE 0610, which wants the mean. They are what a scientist would put on this graph.</p>' : '');
  }
  /* a bold statistic in the Learn text opens its pop-up under the sentence it is in */
  global.PoStats = { show: function (term, anchor) {
    var html = poPopHTML(term, PO_STATE.runs); if (!html) return;
    var old = document.querySelector('.po__pop--inline'); if (old) old.parentNode.removeChild(old);
    var host = anchor.closest('li, p, .exam-part, .card') || anchor.parentNode;
    var pop = h('div', 'po__pop po__pop--inline', html);
    if (host.tagName === 'LI' || host.tagName === 'P') host.parentNode.insertBefore(pop, host.nextSibling); else host.appendChild(pop);
    pop.querySelector('.po__pop__x').addEventListener('click', function () { if (pop.parentNode) pop.parentNode.removeChild(pop); });
    if (pop.scrollIntoView) pop.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  } };

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
    var temp = range('Temperature', 'temp', 0, 50, 20, ' °C');
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
    var GRASS = [[150, -.55, -1, 132, 13], [150, .38, -1, 136, 13], [150, -.1, -1, 138, 12], [150, .8, -1, 122, 13], [150, -1, -1.05, 116, 12], [150, .16, -1, 128, 12]];   /* fanned from the sheath, the third one upright where a stem would be */
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
      '<g class="po__stem"><path d="M' + PO_STEM + ' 262 V28" stroke="#3E9A57" stroke-width="7" stroke-linecap="round"/><path d="M' + PO_STEM + ' 262 V178" stroke="#2F7D46" stroke-width="7" stroke-linecap="round" opacity=".55"/></g>' +
      /* a grass has no stem: the cut leaf bases stand in the water, and a short sheath at the bung holds the tuft */
      '<g class="po__tuft" style="display:none"><path d="M' + (PO_STEM - 5) + ' 262 L' + (PO_STEM - 3) + ' 178 M' + PO_STEM + ' 262 V178 M' + (PO_STEM + 5) + ' 262 L' + (PO_STEM + 3) + ' 178" stroke="#8FAA76" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>' +
      '<path d="M' + (PO_STEM - 9) + ' 152 Q' + PO_STEM + ' 126 ' + (PO_STEM + 9) + ' 152 Z" fill="#C9D9A6" stroke="#5E7A4B" stroke-width="1.2"/></g>' +
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
      svg.querySelector('.po__stem').style.display = sp.leaf.kind === 'grass' ? 'none' : '';
      svg.querySelector('.po__tuft').style.display = sp.leaf.kind === 'grass' ? '' : 'none';
      leafEls = svg.querySelectorAll('.po__leaf');
    }
    var tread = svg.querySelector('.po__tread'), hread = svg.querySelector('.po__hread'), merc = svg.querySelector('.po__merc'), glow = svg.querySelector('.po__glow');

    /* ----- the clock and the reading ----- */
    var clock = h('div', 'po__clock', '<b>0:00</b><span>of <i></i> · runs at ×30</span>');
    var clockB = clock.querySelector('b'), clockOf = clock.querySelector('i');
    var read = h('div', 'po__reading', '<span class="po__at">bubble at <b>0</b> mm</span>'); read.setAttribute('aria-live', 'polite');
    var atB = read.querySelector('b');
    var btns = h('div', 'po__btns');
    var bStart = h('button', 'wbtn po__start', '▶ Start the clock'), bReset = h('button', 'wbtn wbtn--quiet po__tapbtn', 'Open the tap'), bRecord = h('button', 'wbtn po__rec', 'Record this run'), bNew = h('button', 'wbtn wbtn--quiet po__newshoot', 'Use a shoot from another plant');
    var bLine = h('button', 'wbtn wbtn--quiet po__newline', '＋ New line on the graph');
    var bSet = h('button', 'wbtn wbtn--quiet po__resetset', '↺ Reset the settings'), bAll = h('button', 'wbtn po__resetall', '↺ Reset the practical');
    bSet.setAttribute('data-tip', 'The settings back to the start — the plant, the leaves, the light, the temperature, the humidity, the wind, the grease, the joint and the time. Your recorded runs are kept.');
    /* what each button is for, shown at once on hover or keyboard focus */
    bStart.setAttribute('data-tip', 'Starts the clock. The bubble moves as fast as the shoot takes water in, at 30 times real speed.');
    bReset.setAttribute('data-tip', 'Opens the reservoir tap: water pushes the bubble back to the 0 mark, ready for the next run.');
    bRecord.setAttribute('data-tip', 'Keeps this run as a trial of these conditions, in the table — up to five trials a row.');
    bNew.setAttribute('data-tip', 'A shoot cut from a different plant of the same kind: a true replicate. Repeating on one shoot is a technical replicate — it shows how steady your measuring is, not how plants differ.');
    bLine.setAttribute('data-tip', 'Keeps what you have and starts a new line on the graph, in its own colour and with its own table, so you can compare: another plant, the fan on, the dark…');
    bAll.setAttribute('data-tip', 'Everything back to the start: the settings, the bubble, the shoot, the tables and the graph. When there is a table to lose it asks first: press it twice.');
    /* two rows: the run — start, tap, record — with the settings reset at its end; the comparisons — another plant, a new
       line — with the practical's reset at its end */
    var rowA = h('div', 'po__brow'), rowB = h('div', 'po__brow');
    [bStart, bReset, bRecord, bSet].forEach(function (b) { b.type = 'button'; rowA.appendChild(b); });
    [bNew, bLine, bAll].forEach(function (b) { b.type = 'button'; rowB.appendChild(b); });
    btns.appendChild(rowA); btns.appendChild(rowB);
    bRecord.disabled = true;
    var result = h('div', 'po__result'); result.hidden = true; result.setAttribute('aria-live', 'polite');
    var say = h('p', 'po__say');

    /* ----- the model ----- */
    function settings() {
      var sp = PO_SPECIES.filter(function (s) { return s.id === species.value; })[0];
      return { sp: sp, leaves: +leaves.inp.value, light: +light.inp.value, temp: +temp.inp.value, hum: +hum.inp.value, wind: +wind.inp.value, grease: grease.value, joint: joint.value, time: +time.value, shoot: PO_STATE.shoot };
    }
    function rateOf(s) {
      var g = poGreaseF(s.sp, s.grease);
      return s.sp.base * (s.leaves / 5) * poLightF(s.light) * poTempF(s.temp) * poHumF(s.hum) * PO_WINDF[s.wind] * g;
    }
    global.PoModel = { rateOf: rateOf, species: PO_SPECIES, wind: PO_WIND };   /* for the audits: the curve each factor gives */
    var pos = 0, run = null, raf = null, lastRun = null;
    function remember() { PO_STATE.set = settings(); PO_STATE.pos = pos; PO_STATE.runs = runs; poPersist(); }   /* the shoot and its factor already live in PO_STATE */
    function paintConditions() {
      var s = settings();
      speciesNote.textContent = s.sp.note; growLeaves(s.sp);
      leaves.val.textContent = s.leaves; light.val.textContent = s.light + ' %'; temp.val.textContent = s.temp + ' °C'; hum.val.textContent = s.hum + ' %'; wind.val.textContent = PO_WIND[s.wind];
      clockOf.textContent = s.time + ' min';
      leafEls.forEach(function (l, i) { l.classList.toggle('is-off', i >= s.leaves); });
      glow.style.opacity = (s.light / 100 * .55).toFixed(2);
      svg.querySelector('.po__bulb').style.opacity = (.25 + s.light / 100 * .75).toFixed(2);
      merc.setAttribute('y', (172 - s.temp / 50 * 104).toFixed(1)); merc.setAttribute('x', 738); merc.setAttribute('height', (s.temp / 50 * 104 + 4).toFixed(1));
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

    function setBubble(mm) { pos = mm; PO_STATE.pos = mm; bubble.setAttribute('cx', (PO_X0 + mm * PO_MM).toFixed(1)); atB.textContent = String(Math.round(mm)); }   /* read as the scale is read: to the nearest millimetre */
    function fmt(sec) { var m = Math.floor(sec / 60), s2 = Math.floor(sec % 60); return m + ':' + (s2 < 10 ? '0' : '') + s2; }

    function start() {
      if (run) { finish(); return; }                       /* a second press skips to the end */
      var s = settings(), rate = rateOf(s) * PO_STATE.shootF * (1 + (Math.random() - .5) * .2);   /* repeats on a real bench differ by a few per cent: hand timing, a bubble that hesitates */
      var d = rate * s.time, from = pos, capped = false, leak = s.joint === 'open', stuck = false;
      if (leak) { d *= .35 + Math.random() * .5; if (Math.random() < .25) { d *= .3; stuck = true; } }
      d += poJitter(); if (d < .6) d = .6 + Math.random() * .4;   /* the bench's own random error, on top of the shoot's few per cent */   /* air drawn in at the joint instead of water: the bubble moves less, and by a different amount each time */
      if (from + d > 100) { d = 100 - from; capped = true; }
      run = { s: s, rate: rate, d: d, from: from, capped: capped, leak: leak, stuck: stuck, notReset: from >= .5, t0: null, T: s.time * 2000 };
      result.hidden = true; bRecord.disabled = true; bStart.textContent = 'Skip to the end';
      ctl.classList.add('is-locked'); ctl.querySelectorAll('input,select').forEach(function (e) { e.disabled = true; });
      svg.classList.add('is-running');
      say.textContent = 'Running. The bubble moves as fast as the shoot takes water in — almost as fast as its leaves lose it.';
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
      /* the bubble settles on the millimetre mark it will be read at, so the drawing and the numbers agree exactly */
      var start = Math.round(r.from), end = Math.round(r.from + r.d);
      setBubble(end); clockB.textContent = fmt(r.s.time * 60);
      svg.classList.remove('is-running');
      ctl.classList.remove('is-locked'); ctl.querySelectorAll('input,select').forEach(function (e) { e.disabled = false; });
      bStart.textContent = '▶ Start the clock';
      var distance = r.notReset ? end : end - start, mins = r.s.time, rate = distance / mins, vol = Math.PI * PO_BORE_R * PO_BORE_R * +rate.toFixed(2);   /* from the rate as printed, so checking the line gives the same number */   /* without the tap the scale is read from 0 */
      lastRun = { s: r.s, distance: distance, rate: rate, leak: r.leak };
      result.hidden = false;
      result.innerHTML = '<div class="po__stat"><span>Distance moved</span><b>' + distance + ' mm</b><small>' + (r.notReset ? 'read from 0 to ' + end + ' on the scale — but the bubble started at ' + start : 'from ' + start + ' to ' + end + ' on the scale, read to the nearest mm (± 0.5)') + '</small></div>' +
        '<div class="po__stat"><span>Rate of uptake</span><b>' + rate.toFixed(2) + ' mm/min</b><small>' + distance + ' mm ÷ ' + mins + ' min</small></div>' +
        '<div class="po__stat"><span>Volume taken up</span><b>' + vol.toFixed(2) + ' mm³/min</b><small>π × 0.5² × ' + rate.toFixed(2) + ', for a 1 mm bore</small></div>' +
        (r.notReset ? '<p class="po__warn">The scale was read from 0, but the bubble started at ' + start + ' mm, so this distance is ' + start + ' mm too long and the rate is wrong. A reading is where the bubble ended minus where it started: ' + end + ' − ' + start + ' = ' + (end - start) + ' mm. This bench reads from 0, so open the tap before every run — then run again.</p>' : '') +
        (r.capped ? '<p class="po__warn">The bubble reached the end of the scale before the time was up, so this reading is too small. Open the tap, and measure for less time or slow the shoot down.</p>' : '') +
        (r.leak ? '<p class="po__warn">The joint at the bung was not sealed. Air was drawn in there instead of water from the tube, so the bubble moved less than the shoot took up' + (r.stuck ? ' — and stuck for part of the run' : '') + '. Every leaking reading is too small (a systematic error) and by a different amount each time (a random one on top). Seal the joint with petroleum jelly.</p>' : '');
      var full = trialsFor(r.s) >= MAX_TRIALS;
      bRecord.disabled = !!r.capped || !!r.notReset || full;
      remember();
      say.textContent = r.notReset ? 'Not recorded: the run did not start from 0. Open the tap, then run again.' : r.capped ? 'Not a fair reading — the bubble ran out of scale.' : full ? 'Five trials for these conditions already: change something for the next row.' : r.leak ? 'You can record it — a leaking reading in the table is worth seeing next to a sealed one.' : 'Read the scale, then record the run as a trial. Repeat it for a mean, or change one factor for a new row.';
    }
    function resetBubble() {
      if (run) return;
      svg.classList.add('is-tapping');
      var from = pos, t0 = null;
      function back(now) {
        if (t0 == null) t0 = now;
        var k = still ? 1 : Math.min(1, (now - t0) / 600);
        setBubble(from * (1 - k)); clockB.textContent = '0:00';
        if (k < 1 && stage.isConnected) requestAnimationFrame(back); else { svg.classList.remove('is-tapping'); remember(); }
      }
      if (still) back(0); else requestAnimationFrame(back);   /* without motion the bubble is back at once, so a run can start straight after */
      result.hidden = true; bRecord.disabled = true;
      say.textContent = 'Tap opened: water from the reservoir pushed the bubble back to the start. Close it and you are ready to go again.';
    }
    /* the whole practical back to its first state — a run in progress dropped, the settings as they were, the bubble at 0,
       shoot A, the table empty. The teacher's word, once given, holds for the session. */
    /* the settings alone, back to the start: the runs, the lines and the shoot stay */
    function resetSettings() {
      if (run) return;
      species.value = 'bean'; leaves.inp.value = 5; light.inp.value = 60; temp.inp.value = 20; hum.inp.value = 50; wind.inp.value = 0; grease.value = 'none'; joint.value = 'sealed'; time.value = '5';
      paintConditions();
      say.textContent = 'Settings back to the start: French bean, 5 leaves, 60 % light, 20 °C, 50 % humidity, still air, no grease, joint sealed, 5 minutes. Your runs and lines are kept.';
    }
    function resetAll() {
      if (raf) cancelAnimationFrame(raf); raf = null; run = null; lastRun = null;
      svg.classList.remove('is-running'); svg.classList.remove('is-tapping');
      ctl.classList.remove('is-locked'); ctl.querySelectorAll('input,select').forEach(function (e) { e.disabled = false; });
      bStart.textContent = '▶ Start the clock';
      species.value = 'bean'; leaves.inp.value = 5; light.inp.value = 60; temp.inp.value = 20; hum.inp.value = 50; wind.inp.value = 0; grease.value = 'none'; joint.value = 'sealed'; time.value = '5';
      PO_STATE.shoot = 1; PO_STATE.shootF = 1;
      runs.length = 0; errK = 'none'; PO_STATE.err = 'none'; PO_STATE.line = 0; PO_STATE.lineNames = []; PO_STATE.hidden = []; PO_STATE.dots = true; bDots.setAttribute('aria-pressed', 'true');
      errBar.querySelectorAll('button:not(.po__dots)').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-k') === 'none' ? 'true' : 'false'); });
      pop.hidden = true; popTerm = null;
      result.hidden = true; bRecord.disabled = true; clockB.textContent = '0:00';
      setBubble(0); paintConditions(); paintData();
      say.textContent = 'Back to the start: the settings as they were, the bubble at 0, shoot A, and the table cleared.';
    }
    /* a button that would lose recorded work asks first: pressed once it becomes the question and waits five seconds
       for the second press; left alone, it forgets. With nothing to lose it just does the thing. */
    function armed(b, question, sure, doIt) {
      var timer = null, label = b.textContent;
      function disarm() { clearTimeout(timer); timer = null; b.classList.remove('is-armed'); b.textContent = label; }
      b.addEventListener('click', function () {
        if (!sure()) { doIt(); return; }
        if (b.classList.contains('is-armed')) { disarm(); doIt(); return; }
        b.classList.add('is-armed'); b.textContent = question;
        say.textContent = 'That would lose the runs you have recorded. Press it again to go ahead, or leave it and it forgets in a few seconds.';
        timer = setTimeout(disarm, 5000);
      });
    }
    bStart.addEventListener('click', start);
    bReset.addEventListener('click', resetBubble);
    bSet.addEventListener('click', resetSettings);
    armed(bAll, 'Sure? Press again to reset', function () { return runs.length > 0; }, resetAll);
    bNew.addEventListener('click', function () {
      if (run) return;
      PO_STATE.shoot = (PO_STATE.shoot || 1) + 1; PO_STATE.shootF = .84 + Math.random() * .32;
      resetBubble(); remember();
      say.textContent = 'Shoot ' + String.fromCharCode(64 + PO_STATE.shoot) + ', cut from another plant of the same kind: its own leaves, its own rate. Trials on one shoot are technical replicates; shoots from different plants are true replicates — only they say something about the species.';
    });

    /* ----- the results table: one row per set of conditions, up to five trials, and what the trials say -----
       A run is recorded as a trial of its conditions (everything set, the shoot aside); five is the
       most for one row. From two trials on, the row shows the mean, the standard deviation, the
       standard error and a 95 % confidence interval, each with a plain-words note on what it is
       and how it was worked out. The graph plots the means, with the error you choose: whiskers for
       the SD or the SE, a band for the confidence interval. */
    var runs = PO_STATE.runs;
    var MAX_TRIALS = 5, T95 = PO_T95;
    var tableBox = h('div', 'po__data'); tableBox.hidden = true;
    /* the reveal: a word from the teacher shows the table and the graph the page has kept */
    var NEED = (global.LAB_CONFIG && global.LAB_CONFIG.potometerUnlock) || '';
    var unlocked = !NEED || PO_STATE.unlocked;
    var gate = h('div', 'po__gate');
    gate.innerHTML = '<span class="po__kept"></span><form class="po__unlock"><label>The page has kept every run you recorded. Your teacher has the word that shows its table and graph: <input type="password" autocomplete="off" aria-label="The word" placeholder="the word"></label><button type="submit" class="wbtn">Show them</button><span class="po__gatesay" role="status"></span></form>';
    var kept = gate.querySelector('.po__kept'), gateForm = gate.querySelector('form'), gateIn = gate.querySelector('input'), gateSay = gate.querySelector('.po__gatesay');
    gateForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var word = gateIn.value.trim().toLowerCase(); if (!word) return;
      sha256hex(word).then(function (hex) {
        if (hex === NEED) { unlocked = true; PO_STATE.unlocked = true; try { sessionStorage.setItem('plants-lab.potometer.unlocked', '1'); } catch (e) {} gateIn.value = ''; gateSay.textContent = ''; paintData(); }
        else { gateSay.textContent = 'Not that word.'; gateIn.select(); }
      });
    });
    var tableWrap = h('div', 'po__tablewrap'), tabsEl = h('div', 'po__linetabs'), pop = h('div', 'po__pop'), chart = h('div', 'po__chart'), popTerm = null;
    pop.hidden = true;
    var tools = h('div', 'po__tools');
    var errK = PO_STATE.err || 'none';
    var errBar = h('div', 'po__errbar', '<span class="po__errbar__l">Error bars</span>');
    [['none', 'none'], ['sd', 'standard deviation'], ['se', 'standard error'], ['ci', '95 % confidence interval']].forEach(function (o) {
      var b = h('button', 'po__errbar__b', esc(o[1])); b.type = 'button'; b.setAttribute('data-k', o[0]); b.setAttribute('aria-pressed', o[0] === errK ? 'true' : 'false');
      b.addEventListener('click', function () { errK = o[0]; PO_STATE.err = errK; errBar.querySelectorAll('button:not(.po__dots)').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-k') === errK ? 'true' : 'false'); }); paintData(); });   /* the ? on the column heading explains the statistic; choosing one only draws it */
      errBar.appendChild(b);
    });
    /* the trials themselves can be hidden, so the means and their error bars stand clear */
    var bDots = h('button', 'po__errbar__b po__dots', '· every trial'); bDots.type = 'button'; bDots.setAttribute('data-k', 'dots'); bDots.setAttribute('aria-pressed', PO_STATE.dots ? 'true' : 'false'); bDots.title = 'Show or hide the single trials behind each mean';
    bDots.addEventListener('click', function () { PO_STATE.dots = !PO_STATE.dots; bDots.setAttribute('aria-pressed', PO_STATE.dots ? 'true' : 'false'); poPersist(); paintData(); });
    errBar.appendChild(h('span', 'po__errbar__l po__errbar__l2', 'Points')); errBar.appendChild(bDots);
    var bCopy = h('button', 'wbtn wbtn--quiet', 'Copy the table'), bClear = h('button', 'wbtn wbtn--quiet', 'Clear the table');
    [bCopy, bClear].forEach(function (b) { b.type = 'button'; tools.appendChild(b); });
    tableBox.appendChild(errBar); tableBox.appendChild(tabsEl); tableBox.appendChild(tableWrap); tableBox.appendChild(pop); tableBox.appendChild(chart); tableBox.appendChild(tools);

    var keyOf = poKeyOf, condText = poCondText;
    function groups() { return poGroups(runs); }
    function trialsFor(s) { var k = keyOf(s); return runs.filter(function (r) { return keyOf(r.s) === k && (r.line || 0) === PO_STATE.line; }).length; }
    var stats = poStats;
    var TERMS = PO_TERMS;
    function showTerm(term) {
      if (!PO_TERMS[term]) return;
      popTerm = term;
      pop.innerHTML = poPopHTML(term, runs);
      pop.hidden = false;
      pop.querySelector('.po__pop__x').addEventListener('click', function () { pop.hidden = true; popTerm = null; });
    }
    bRecord.addEventListener('click', function () {
      if (!lastRun) return;
      if (trialsFor(lastRun.s) >= MAX_TRIALS) { say.textContent = 'Five trials for these conditions already. Change something for the next row, or clear the table.'; bRecord.disabled = true; return; }
      lastRun.line = PO_STATE.line; runs.push(lastRun); var n = trialsFor(lastRun.s); lastRun = null; bRecord.disabled = true;
      paintData();
      say.textContent = 'Recorded as trial ' + n + ' of these conditions. Open the tap before the next run.' + (n >= MAX_TRIALS ? ' That is five — enough for a mean; change something for the next row.' : '');
    });
    armed(bClear, 'Sure? Press again to clear', function () { return runs.length > 0; }, function () { runs.length = 0; PO_STATE.line = 0; PO_STATE.lineNames = []; PO_STATE.hidden = []; paintData(); });
    bLine.addEventListener('click', function () {
      if (run) return;
      var have = runs.some(function (r) { return (r.line || 0) === PO_STATE.line; });
      if (!have) { say.textContent = poLineName(PO_STATE.line) + ' has no runs yet: record a run first, then start the next line.'; return; }
      var next = 0; runs.forEach(function (r) { next = Math.max(next, (r.line || 0) + 1); });
      PO_STATE.line = next; remember(); paintData();
      say.textContent = poLineName(next) + ' started, in ' + PO_LINE_WORD[next % PO_LINE_WORD.length] + '. The runs you record now go on it. Change the one thing you want to compare — another plant, the fan on, the dark — keep the rest the same, and run.';
    });
    bCopy.addEventListener('click', function () {
      var head = ['Line', 'Conditions'].concat([1, 2, 3, 4, 5].map(function (i) { return 'Trial ' + i + ' / mm min⁻¹'; })).concat(['Mean', 'SD', 'SE', '95 % CI']);
      var lines = [head.join('\t')].concat(groups().map(function (g) {
        var vals = g.trials.map(function (t) { return t.r.rate; }), st = stats(vals), cells = [poLineName(g.line), condText(g.s).replace(/<[^>]+>/g, '')];
        for (var i = 0; i < MAX_TRIALS; i++) cells.push(vals[i] != null ? vals[i].toFixed(2) : '');
        cells.push(st.mean.toFixed(2), st.sd != null ? st.sd.toFixed(2) : '', st.se != null ? st.se.toFixed(2) : '', st.ci != null ? '±' + st.ci.toFixed(2) : '');
        return cells.join('\t');
      }));
      var tsv = lines.join('\n');
      var done = function () { bCopy.textContent = 'Copied — paste into a spreadsheet'; setTimeout(function () { bCopy.textContent = 'Copy the table'; }, 2200); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tsv).then(done, function () { fallback(); });
      else fallback();
      function fallback() { var ta = document.createElement('textarea'); ta.value = tsv; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} document.body.removeChild(ta); }
    });
    function rowHtml(g) {
      var vals = g.trials.map(function (t) { return t.r.rate; }), st = stats(vals), cells = '';
      for (var i = 0; i < MAX_TRIALS; i++) {
        var t = g.trials[i];
        cells += t ? '<td class="po__trial' + (t.r.leak ? ' po__trial--leak' : '') + '">' + t.r.rate.toFixed(2) + '<small title="' + t.r.distance + ' mm on shoot ' + String.fromCharCode(64 + (t.r.s.shoot || 1)) + '">' + t.r.distance + ' mm · ' + String.fromCharCode(64 + (t.r.s.shoot || 1)) + '</small><button type="button" class="po__del" data-i="' + t.i + '" aria-label="Delete this trial">✕</button></td>' : '<td class="po__trial po__trial--empty">—</td>';
      }
      return '<tr><td class="po__cond">' + condText(g.s) + '</td>' + cells +
        '<td class="po__statcell"><b>' + st.mean.toFixed(2) + '</b></td>' + (errK === 'none' ? '' : '<td class="po__statcell">' + (st[errK] != null ? (errK === 'ci' ? '± ' : '') + st[errK].toFixed(2) : '—') + '</td>') + '</tr>';
    }
    /* the tabs above the table are the lines of the graph, one table each; the tab you are on is where runs are recorded */
    function paintData() {
      var G = groups(), lines = [];
      G.forEach(function (g) { if (lines.indexOf(g.line) < 0) lines.push(g.line); });
      if (lines.indexOf(PO_STATE.line) < 0) lines.push(PO_STATE.line);
      lines.sort(function (a, b) { return a - b; });
      kept.textContent = runs.length ? runs.length + (runs.length === 1 ? ' run recorded' : ' runs recorded') + (lines.length > 1 ? ' on ' + lines.length + ' lines' : '') + ' — write each one in your own table as you go.' : 'Nothing recorded yet.';
      gate.hidden = unlocked || !NEED;
      tableBox.hidden = !runs.length || !unlocked;
      poPersist();
      if (!runs.length) { tabsEl.innerHTML = ''; tableWrap.innerHTML = ''; chart.innerHTML = ''; pop.hidden = true; popTerm = null; return; }
      tabsEl.innerHTML = lines.map(function (ln) {
        var rows = G.filter(function (g) { return g.line === ln; }), n = rows.reduce(function (a, g) { return a + g.trials.length; }, 0);
        return '<button type="button" class="po__linetab" data-line="' + ln + '" data-rows="' + rows.length + '" data-n="' + n + '" aria-pressed="' + (ln === PO_STATE.line ? 'true' : 'false') + '" style="--lc:' + poLineColour(ln) + '" title="' + esc(poLineName(ln)) + ': ' + n + (n === 1 ? ' run' : ' runs') + '"><span class="po__swatch"></span>' + (ln + 1) + '<small>' + esc(poLineName(ln)) + '</small></button>';
      }).join('');
      var cur = PO_STATE.line, rows = G.filter(function (g) { return g.line === cur; });
      var headRow = '<thead><tr><th>Conditions</th>' + [1, 2, 3, 4, 5].map(function (i) { return '<th>Trial ' + i + '<small>mm/min</small></th>'; }).join('') +
        ['mean'].concat(errK === 'none' ? [] : [errK]).map(function (t) { return '<th><button type="button" class="po__term" data-term="' + t + '" title="What this is, and how it was worked out">' + (t === 'mean' ? 'Mean' : t === 'sd' ? 'SD' : t === 'se' ? 'SE' : '95 % CI') + ' <i>?</i></button></th>'; }).join('') + '</tr></thead>';
      tableWrap.innerHTML = '<div class="po__linehead" style="--lc:' + poLineColour(cur) + '"><span class="po__swatch"></span><input class="po__linename" value="' + esc(PO_STATE.lineNames[cur] || '') + '" placeholder="' + esc(poLineName(cur)) + ' — name it: privet, fan on, dark…" aria-label="Name of this line"><small>' + (rows.length ? 'the runs you record now go on this line' : 'no runs yet — record one and it appears here') + '</small>' + (rows.length && lines.length > 1 ? '<button type="button" class="wbtn wbtn--quiet po__delline">Delete this line</button>' : '') + '</div>' +
        (rows.length ? '<table class="po__table">' + headRow + '<tbody>' + rows.map(rowHtml).join('') + '</tbody></table>' : '');
      tabsEl.querySelectorAll('.po__linetab').forEach(function (b) { b.addEventListener('click', function () { PO_STATE.line = +b.getAttribute('data-line'); remember(); paintData(); say.textContent = 'On ' + poLineName(PO_STATE.line) + ': the runs you record now go on it.'; }); });
      var nameIn = tableWrap.querySelector('.po__linename');
      nameIn.addEventListener('change', function () { PO_STATE.lineNames[cur] = nameIn.value.trim(); poPersist(); paintData(); });
      tableWrap.querySelectorAll('.po__del').forEach(function (b) { b.addEventListener('click', function () { runs.splice(+b.getAttribute('data-i'), 1); paintData(); }); });
      tableWrap.querySelectorAll('.po__term').forEach(function (b) { b.addEventListener('click', function () { showTerm(b.getAttribute('data-term')); }); });
      var del = tableWrap.querySelector('.po__delline');
      if (del) armed(del, 'Sure? Press again to delete', function () { return true; }, function () {
        for (var k = runs.length - 1; k >= 0; k--) if ((runs[k].line || 0) === cur) runs.splice(k, 1);
        PO_STATE.hidden = PO_STATE.hidden.filter(function (x) { return x !== cur; });
        var left = []; runs.forEach(function (r) { if (left.indexOf(r.line || 0) < 0) left.push(r.line || 0); });
        PO_STATE.line = left.length ? Math.max.apply(null, left) : 0;
        paintData();
      });
      chart.innerHTML = graph(G);
      wireLegend();
      function wireLegend() { chart.querySelectorAll('.po__legend__b').forEach(function (b) { b.addEventListener('click', function () { var ln = +b.getAttribute('data-line'), at = PO_STATE.hidden.indexOf(ln); if (at < 0) PO_STATE.hidden.push(ln); else PO_STATE.hidden.splice(at, 1); poPersist(); chart.innerHTML = graph(G); wireLegend(); }); }); }
      if (popTerm && (popTerm === 'mean' || popTerm === errK)) showTerm(popTerm); else { pop.hidden = true; popTerm = null; }   /* the pop-up is re-worked from the table as it now is */
    }
    /* the graph plots one point per row of the table — its mean — and picks its x-axis: the one factor that changed */
    var FACT = [['leaves', 'Leaves on the shoot', true], ['light', 'Light / %', true], ['temp', 'Temperature / °C', true], ['hum', 'Humidity / %', true], ['wind', 'Wind', false], ['time', 'Time / min', true], ['sp', 'Plant', false], ['grease', 'Grease', false], ['joint', 'Joint at the bung', false]];
    function fval(s, f) { return f === 'sp' ? s.sp.name : f === 'wind' ? PO_WIND[s.wind] : f === 'joint' ? (s.joint === 'open' ? 'not sealed' : 'sealed') : s[f]; }
    function graph(G) {
      var all = []; G.forEach(function (g) { if (all.indexOf(g.line) < 0) all.push(g.line); }); all.sort(function (a, b) { return a - b; });
      var shown = all.filter(function (ln) { return PO_STATE.hidden.indexOf(ln) < 0; });
      var legend = all.length > 1 ? '<div class="po__legend">' + all.map(function (ln) { var vis = shown.indexOf(ln) >= 0; return '<button type="button" class="po__legend__b" data-line="' + ln + '" aria-pressed="' + (vis ? 'true' : 'false') + '" style="--lc:' + poLineColour(ln) + '" title="' + (vis ? 'Hide' : 'Show') + ' this line on the graph"><span class="po__swatch"></span>' + esc(poLineName(ln)) + '</button>'; }).join('') + '<small>click a line to hide or show it</small></div>' : '';
      var GS = G.filter(function (g) { return shown.indexOf(g.line) >= 0; }), multi = shown.filter(function (ln) { return GS.some(function (g) { return g.line === ln; }); }).length > 1;
      if (!GS.length) return legend + '<small class="po__gnote">Every line is hidden. Click one in the list to show it.</small>';
      if (!multi && GS.length < 2 && !(GS.length === 1 && GS[0].trials.length >= 2)) return legend + '<small class="po__gnote">Record a second trial, or a second set of conditions, and the graph draws itself.</small>';
      var varyOf = function (rows) { return FACT.filter(function (F) { var vals = {}; rows.forEach(function (g) { vals[fval(g.s, F[0])] = 1; }); return Object.keys(vals).length > 1; }); };
      var byLine = shown.map(function (ln) { return { ln: ln, rows: GS.filter(function (g) { return g.line === ln; }) }; }).filter(function (l) { return l.rows.length; });
      /* the x-axis: the one factor that changes along a line — the same one on every line, or the graph falls back to rows */
      var counts = {}; byLine.forEach(function (l) { var v = varyOf(l.rows); if (v.length === 1) counts[v[0][0]] = (counts[v[0][0]] || 0) + 1; });
      var bestKey = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];
      var F = bestKey ? FACT.filter(function (x) { return x[0] === bestKey; })[0] : null;
      var mode = F && byLine.every(function (l) { var v = varyOf(l.rows); return v.length === 0 || (v.length === 1 && v[0][0] === F[0]); }) ? 'factor' : (!multi && varyOf(GS).length === 0 ? 'trials' : 'row');
      var W = 560, H = 240, L = 54, R = 16, T = 18, B = 54;
      var mk = function (g, x) { var vals = g.trials.map(function (t) { return t.r.rate; }), st = stats(vals); var e = errK === 'sd' ? st.sd : errK === 'se' ? st.se : errK === 'ci' ? st.ci : null; return { x: x, mean: st.mean, all: vals, err: e == null || isNaN(e) ? null : e }; };
      var numeric = mode === 'factor' ? !!F[2] : false;
      var ORDER = mode === 'factor' ? ({ wind: PO_WIND, sp: PO_SPECIES.map(function (q) { return q.name; }), grease: PO_GREASE.map(function (q) { return q[0]; }), joint: ['sealed', 'not sealed'] })[F[0]] : null;
      var series = byLine.map(function (l) {
        var pts;
        if (mode === 'factor') { pts = l.rows.map(function (g) { return mk(g, numeric ? +fval(g.s, F[0]) : fval(g.s, F[0])); }); pts.sort(function (a, b) { return numeric ? a.x - b.x : ORDER.indexOf(a.x) - ORDER.indexOf(b.x); }); }
        else if (mode === 'trials') pts = l.rows[0].trials.map(function (t, i) { return { x: i + 1, mean: t.r.rate, all: [t.r.rate], err: null }; });
        else pts = l.rows.map(function (g, i) { return mk(g, i + 1); });
        return { ln: l.ln, colour: poLineColour(l.ln), name: poLineName(l.ln), pts: pts };
      });
      var xlab = mode === 'factor' ? F[1] : mode === 'trials' ? 'Trial' : 'Row';
      var note = mode === 'factor' ? 'Mean rate of uptake against ' + F[1].toLowerCase().replace(/ \/ .*/, '') + (multi ? ', one line a table, each in its own colour; each point is the mean of its trials.' : ' — the one factor you changed; each point is the mean of its trials.')
        : mode === 'trials' ? 'One set of conditions so far: its trials, one by one. Change a factor and run again for a graph of means.'
        : multi ? 'The lines do not change the same one factor, so this is the mean by row of each table. Change one thing at a time — the same thing on every line — to compare them.'
        : 'More than one factor changed between rows (' + varyOf(GS).map(function (Fx) { return Fx[1].toLowerCase().replace(/ \/ .*/, ''); }).join(', ') + '), so this is the mean by row. Change one thing at a time to see what it does.';
      var allPts = []; series.forEach(function (sr) { allPts = allPts.concat(sr.pts); });
      var top = Math.max.apply(null, allPts.map(function (p) { return Math.max(Math.max.apply(null, p.all), p.err != null ? p.mean + p.err : 0); }));
      var ymax = top * 1.15 || 1;
      var ystep = ymax > 10 ? 5 : ymax > 4 ? 2 : ymax > 2 ? 1 : ymax > 1 ? .5 : .25;
      function Y(v) { return T + (H - T - B) * (1 - Math.max(0, v) / ymax); }
      var cats = [], lo = 0, hi = 0, slot = 0;
      if (numeric) { var xs = allPts.map(function (p) { return p.x; }); lo = Math.min.apply(null, xs); hi = Math.max.apply(null, xs); }
      else { allPts.forEach(function (p) { if (cats.indexOf(p.x) < 0) cats.push(p.x); }); cats.sort(function (a, b) { return mode === 'factor' ? ORDER.indexOf(a) - ORDER.indexOf(b) : a - b; }); slot = (W - L - R) / cats.length; }
      function XN(v) { return lo === hi ? (L + W - R) / 2 : L + (W - L - R) * (v - lo) / (hi - lo); }
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="po__gsvg" role="img" aria-label="' + esc(note) + '">';
      for (var v = 0; v <= ymax; v += ystep) s += '<line class="po__grid" x1="' + L + '" y1="' + Y(v).toFixed(1) + '" x2="' + (W - R) + '" y2="' + Y(v).toFixed(1) + '"/><text class="po__gt" x="' + (L - 6) + '" y="' + (Y(v) + 3.5).toFixed(1) + '" text-anchor="end">' + (ystep < 1 ? v.toFixed(2) : v) + '</text>';
      s += '<line class="po__axis" x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (H - B) + '"/><line class="po__axis" x1="' + L + '" y1="' + (H - B) + '" x2="' + (W - R) + '" y2="' + (H - B) + '"/>';
      s += '<text class="po__gl" transform="rotate(-90)" x="' + (-(T + H - B) / 2) + '" y="14" text-anchor="middle">Rate / mm min⁻¹</text><text class="po__gl" x="' + ((L + W - R) / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(xlab) + '</text>';
      var nS = series.length, withErrAny = false;
      series.forEach(function (sr, k) {
        var c = sr.colour, bw = numeric ? 0 : Math.min(28, slot * .8 / nS);
        var xOf = function (p) { return numeric ? XN(p.x) : L + slot * (cats.indexOf(p.x) + .5) + (k - (nS - 1) / 2) * bw; };
        var withErr = sr.pts.filter(function (p) { return p.err != null; }); if (withErr.length) withErrAny = true;
        if (errK === 'ci' && numeric && withErr.length >= 2) {
          var up = withErr.map(function (p) { return xOf(p).toFixed(1) + ',' + Y(p.mean + p.err).toFixed(1); }), dn = withErr.slice().reverse().map(function (p) { return xOf(p).toFixed(1) + ',' + Y(p.mean - p.err).toFixed(1); });
          s += '<polygon class="po__band" style="fill:' + c + '" points="' + up.concat(dn).join(' ') + '"/>';
        }
        if (numeric && sr.pts.length > 1) s += '<polyline class="po__line" style="stroke:' + c + '" points="' + sr.pts.map(function (p) { return xOf(p).toFixed(1) + ',' + Y(p.mean).toFixed(1); }).join(' ') + '"/>';
        sr.pts.forEach(function (p) {
          var x = xOf(p);
          if (!numeric) s += '<rect class="po__gbar" style="fill:' + c + '" x="' + (x - bw / 2).toFixed(1) + '" y="' + Y(p.mean).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (H - B - Y(p.mean)).toFixed(1) + '"/>';
          if (p.err != null) {
            if (errK === 'ci' && !numeric) s += '<rect class="po__band" style="fill:' + c + '" x="' + (x - bw * .7).toFixed(1) + '" y="' + Y(p.mean + p.err).toFixed(1) + '" width="' + (bw * 1.4).toFixed(1) + '" height="' + (Y(p.mean - p.err) - Y(p.mean + p.err)).toFixed(1) + '"/>';
            if (errK !== 'ci') s += '<path class="po__whisker" style="stroke:' + c + '" d="M' + x.toFixed(1) + ' ' + Y(p.mean + p.err).toFixed(1) + ' V' + Y(p.mean - p.err).toFixed(1) + ' M' + (x - 6).toFixed(1) + ' ' + Y(p.mean + p.err).toFixed(1) + ' h12 M' + (x - 6).toFixed(1) + ' ' + Y(p.mean - p.err).toFixed(1) + ' h12"/>';
          }
          if (PO_STATE.dots) p.all.forEach(function (v2) { s += '<circle class="po__dot' + (p.all.length > 1 ? ' po__dot--rep' : '') + '" style="fill:' + c + '" cx="' + x.toFixed(1) + '" cy="' + Y(v2).toFixed(1) + '" r="3"/>'; });
          s += '<circle class="po__dotmean" style="fill:' + c + '" cx="' + x.toFixed(1) + '" cy="' + Y(p.mean).toFixed(1) + '" r="' + (p.all.length > 1 ? 4.5 : 3.5) + '"/>';   /* every row keeps its mean marker; the trials behind it can be hidden */
        });
      });
      var ticks = numeric ? allPts.map(function (p) { return p.x; }).filter(function (v2, i2, a) { return a.indexOf(v2) === i2; }).sort(function (a, b) { return a - b; }) : cats;
      var every = ticks.length > 8 ? Math.ceil(ticks.length / 8) : 1;
      ticks.forEach(function (tv, i2) { if (i2 % every === 0 || i2 === ticks.length - 1) s += '<text class="po__gt" x="' + (numeric ? XN(tv) : L + slot * (i2 + .5)).toFixed(1) + '" y="' + (H - B + 14) + '" text-anchor="middle">' + esc(String(tv)) + '</text>'; });
      var errNote = errK === 'none' ? '' : errK === 'ci' ? ' The band is the 95 % confidence interval of each mean; where two bands do not overlap, the difference is statistically significant; where they overlap, nothing is proved either way.' : ' The whiskers are one ' + (errK === 'sd' ? 'standard deviation' : 'standard error') + ' either side of each mean.';
      s += '</svg>' + legend + '<small class="po__gnote">' + esc(note + (withErrAny ? errNote : '')) + '</small>';
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
    box.appendChild(wrap2); box.appendChild(gate); box.appendChild(tableBox);
    box.appendChild(h('p', 'widget__note', 'A model, scaled to published class results rather than measured here (the sources are in the lab\'s credits file). Every run starts where the last one left the bubble unless you open the tap. Each run carries the small random errors of a real bench — hand timing, a bubble that hesitates, a reading to the nearest millimetre — so repeats differ, as they should.'));
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

  /* ---------- auxin: move the light ----------
     The shoot is drawn as a stack of cells. Light from one side sends the auxin to the shaded side, the cells there
     elongate more than the lit side's, and the geometry does the rest: a band whose outer edge is longer than its
     inner edge can only curve — towards the light. The base stays put; the bend is growth, in the zone below the tip. */
  function auxin(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Move the light', spec.ask, 'Click a lamp'));
    var wrap = h('div', 'ax');
    wrap.innerHTML = '<div class="ax__lamps"><button type="button" class="ax__lamp" data-side="left" aria-label="Light from the left">☀ left</button><button type="button" class="ax__lamp is-on" data-side="top" aria-label="Light from above">☀ above</button><button type="button" class="ax__lamp" data-side="right" aria-label="Light from the right">☀ right</button></div>' +
      '<svg viewBox="0 0 300 220" class="ax__svg" aria-label="A shoot, its cells, and the auxin inside it">' +
      '<rect x="0" y="0" width="300" height="220" fill="#F7F4EC"/><path d="M0 200 H300" stroke="#8A5A2A" stroke-width="3"/>' +
      '<g class="ax__shoot"><path class="ax__stem"/><path class="ax__shade"/><path class="ax__cells"/><g class="ax__dots"></g><text class="ax__l" text-anchor="middle">shoot tip</text></g>' +
      '<text class="ax__say" x="150" y="214" text-anchor="middle"></text></svg>';
    var svg = wrap.querySelector('svg'), stem = svg.querySelector('.ax__stem'), shade = svg.querySelector('.ax__shade'), cells = svg.querySelector('.ax__cells'), dots = svg.querySelector('.ax__dots'), lab = svg.querySelector('.ax__l'), say = svg.querySelector('.ax__say');
    var explain = h('p', 'ax__why');
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var CX = 150, Y0 = 200, Y1 = 128, LEN = 88, WID = 36, N = 6, MAX = 35 * Math.PI / 180;
    /* theta: how far the upper stem has curved; mirror: bending to the left. m: how far the auxin has moved (0 even, 1 all on the shaded side) */
    function paint(theta, mirror, m) {
      var th = Math.max(theta, .002), Rin = LEN / th, R = Rin + WID / 2, Rout = Rin + WID, C0 = CX + R;
      var f2 = function (v) { return (mirror ? 300 - v : v).toFixed(1); }, fy = function (v) { return v.toFixed(1); };
      var P = function (r, a) { return [C0 - r * Math.cos(a), Y1 - r * Math.sin(a)]; };
      var pt = function (p) { return f2(p[0]) + ' ' + fy(p[1]); };
      var K = 14, outer = [], inner = [], mid = [];
      for (var i = 0; i <= K; i++) { var a = th * i / K; outer.push(P(Rout, a)); inner.push(P(Rin, a)); mid.push(P(R, a)); }
      var tan = [Math.sin(th), -Math.cos(th)], tipC = P(R, th), cap = [tipC[0] + tan[0] * WID * .62, tipC[1] + tan[1] * WID * .62];
      var d = 'M' + f2(CX - WID / 2) + ' ' + fy(Y0) + ' L' + pt(outer[0]);
      outer.forEach(function (p) { d += ' L' + pt(p); });
      d += ' Q' + pt(cap) + ' ' + pt(inner[K]);
      for (var k = K; k >= 0; k--) d += ' L' + pt(inner[k]);
      d += ' L' + f2(CX + WID / 2) + ' ' + fy(Y0) + ' Z';
      stem.setAttribute('d', d);
      /* the shaded half of the elongation zone, tinted as the auxin arrives */
      var sd = 'M' + pt(outer[0]); outer.forEach(function (p) { sd += ' L' + pt(p); }); for (var k2 = K; k2 >= 0; k2--) sd += ' L' + pt(mid[k2]); sd += ' Z';
      shade.setAttribute('d', sd); shade.style.opacity = (m * .9).toFixed(2);
      /* the cell walls: four equal rows below, six rows in the zone that bends, and the line down the middle */
      var w = '';
      for (var r = 1; r <= 4; r++) { var yy = Y0 - r * (Y0 - Y1) / 4; w += 'M' + f2(CX - WID / 2) + ' ' + fy(yy) + ' L' + f2(CX + WID / 2) + ' ' + fy(yy) + ' '; }
      for (var n = 1; n <= N; n++) { var an = th * n / N; w += 'M' + pt(P(Rout, an)) + ' L' + pt(P(Rin, an)) + ' '; }
      w += 'M' + f2(CX) + ' ' + fy(Y0) + ' L' + pt(mid[0]); mid.forEach(function (p) { w += ' L' + pt(p); });
      cells.setAttribute('d', w);
      /* the auxin: twelve dots, six a side when the light is above; all on the shaded side when it comes from one side */
      var s = '';
      for (var q = 0; q < 12; q++) {
        var row = q % 6, lit = q < 6, o0 = lit ? -WID / 4 : WID / 4, o1 = lit ? WID / 8 : WID * 3 / 8, o = o0 + (o1 - o0) * m;
        var pd = P(R + o, th * (row + .5) / N);
        s += '<circle cx="' + f2(pd[0]) + '" cy="' + fy(pd[1]) + '" r="2.6" data-o="' + o.toFixed(1) + '"/>';   /* data-o: which side of the centreline, for the tests */
      }
      dots.innerHTML = s;
      var lp = [cap[0] + tan[0] * 12, cap[1] + tan[1] * 12];
      lab.setAttribute('x', f2(lp[0])); lab.setAttribute('y', fy(lp[1]));
    }
    var cur = { theta: 0, mirror: false, m: 0 }, raf = null;
    function go(side) {
      wrap.querySelectorAll('.ax__lamp').forEach(function (b) { b.classList.toggle('is-on', b.dataset.side === side); });
      var target = side === 'top' ? 0 : MAX, mirror = side === 'left';
      if (side !== 'top') cur.mirror = mirror;   /* straightening keeps its direction */
      if (raf) cancelAnimationFrame(raf); raf = null;
      var from = cur.theta, fromM = cur.m, toM = side === 'top' ? 0 : 1, t0 = null;
      if (still) { cur.theta = target; cur.m = toM; paint(cur.theta, cur.mirror, cur.m); }
      else raf = requestAnimationFrame(function step(now) {
        if (t0 == null) t0 = now;
        var k = Math.min(1, (now - t0) / 1300), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        cur.m = fromM + (toM - fromM) * Math.min(1, k * 1.6);   /* the auxin moves first; the growth follows */
        cur.theta = from + (target - from) * e;
        paint(cur.theta, cur.mirror, cur.m);
        raf = k < 1 && wrap.isConnected ? requestAnimationFrame(step) : null;
      });
      say.textContent = side === 'top' ? 'auxin spread evenly: both sides grow the same, straight up' : 'auxin on the shaded side: those cells grow longer, and the tip turns to the light';
      explain.innerHTML = side === 'top'
        ? 'Light from above: the auxin made in the tip diffuses down both sides equally, both sides elongate at the same rate, and the shoot grows straight.'
        : 'Light from the ' + side + ': the auxin moves to the <b>shaded</b> side. More auxin there stimulates more cell elongation on that side, so it grows faster than the lit side and the shoot bends <b>towards the light</b>. Look at the cells in the zone below the tip: the shaded side\'s are longer, and a stem whose one side is longer than the other can only curve. Nothing tilts at the base — the bend is growth. That is positive phototropism, and 14.5.5 in four steps.';
    }
    wrap.querySelectorAll('.ax__lamp').forEach(function (b) { b.addEventListener('click', function () { go(b.dataset.side); }); });
    box.appendChild(wrap); box.appendChild(explain); paint(0, false, 0); go('top');
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

  /* ---------- water: where the charges come from, a polar molecule, hydrogen bonds, cohesion and adhesion
     (opens from the words in the text) ---------- */
  function waterSvg() {
    var R = 21, r = 12.5, L = 29, HALF = 52.25 * Math.PI / 180;
    function pt(x, y, d, a) { return [x + d * Math.cos(a), y + d * Math.sin(a)]; }
    function f(n) { return (+n).toFixed(1); }
    function txt(x, y, t, size, weight, fill, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" font-size="' + size + '"' + (weight ? ' font-weight="' + weight + '"' : '') + ' fill="' + fill + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + t + '</text>'; }
    function delta(p, sign) { return txt(p[0], p[1] + 5, 'δ' + sign, 14.5, 700, sign === '−' ? '#9E2F2B' : '#2F5F8F', 'middle'); }
    function title(y, t) { return txt(16, y, t, 16.5, 700, '#3D7A54'); }
    function note(x, y, t, anchor) { return txt(x, y, t, 13.2, 0, '#5B6B63', anchor); }
    function hb(a, b) { return '<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="#2F6FB3" stroke-width="2.2" stroke-dasharray="5 4" stroke-linecap="round"/>'; }
    /* a space-filling molecule: the oxygen at (x, y), its hydrogens 104.5° apart about the direction phi (degrees).
       h: the hydrogens; beyond(i): a spot clear of hydrogen i; back(off): a spot behind the oxygen, off px to one side */
    function mol(x, y, phi) {
      var p = phi * Math.PI / 180, angs = [p - HALF, p + HALF], hs = angs.map(function (a) { return pt(x, y, L, a); });
      var s = '<g>';
      hs.forEach(function (h) { s += '<line x1="' + x + '" y1="' + y + '" x2="' + f(h[0]) + '" y2="' + f(h[1]) + '" stroke="#B9C2C8" stroke-width="7" stroke-linecap="round"/>'; });
      s += '<circle cx="' + x + '" cy="' + y + '" r="' + R + '" fill="#D9534F" stroke="#9E2F2B" stroke-width="1.4"/>' + txt(x, y + 5, 'O', 14, 700, '#fff', 'middle');
      hs.forEach(function (h) { s += '<circle cx="' + f(h[0]) + '" cy="' + f(h[1]) + '" r="' + r + '" fill="#F5F7F8" stroke="#7F8F9A" stroke-width="1.3"/>' + txt(h[0], h[1] + 4.5, 'H', 12, 700, '#33414A', 'middle'); });
      return { svg: s + '</g>', h: hs, edge: function (a) { return pt(x, y, R, a); },
               beyond: function (i) { return pt(x, y, L + r + 14, angs[i]); },
               back: function (off) { var b = pt(x, y, R + 16, p + Math.PI); return [b[0] - Math.sin(p) * (off || 0), b[1] + Math.cos(p) * (off || 0)]; } };
    }
    var s = '<svg viewBox="0 0 440 684" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Four drawings: a dot-and-cross diagram of water with the shared electrons nearer the oxygen; a polar molecule with its δ− and δ+ ends; water molecules hydrogen-bonded to one another (cohesion); a water molecule hydrogen-bonded to the cellulose of the xylem wall (adhesion)">';
    /* ---- 1. dot and cross: the shared electrons sit nearer the oxygen ---- */
    s += title(24, 'Where the charges come from');
    var ox = 104, oy = 104, RO = 36, RH = 17, DH = 42;
    s += '<circle cx="' + ox + '" cy="' + oy + '" r="' + RO + '" fill="#FBEBEA" stroke="#9E2F2B" stroke-width="1.4"/>';
    [-1, 1].forEach(function (sg) {
      var a = sg * HALF, hc = pt(ox, oy, DH, a), u = [Math.cos(a), Math.sin(a)], n = [-Math.sin(a) * sg, Math.cos(a) * sg];
      s += '<circle cx="' + f(hc[0]) + '" cy="' + f(hc[1]) + '" r="' + RH + '" fill="#EEF3F7" fill-opacity=".9" stroke="#7F8F9A" stroke-width="1.3"/>';
      var hl = pt(ox, oy, DH + 7, a); s += txt(hl[0], hl[1] + 4.5, 'H', 12.5, 700, '#33414A', 'middle');
      /* the shared pair, drawn nearer the oxygen than the middle of the overlap */
      var c = pt(ox, oy, 28, a), perp = [-Math.sin(a), Math.cos(a)], d = [c[0] + perp[0] * 4.5, c[1] + perp[1] * 4.5], x = [c[0] - perp[0] * 4.5, c[1] - perp[1] * 4.5];
      s += '<circle cx="' + f(d[0]) + '" cy="' + f(d[1]) + '" r="2.7" fill="#9E2F2B"/>';
      s += '<path d="M' + f(x[0] - 3) + ' ' + f(x[1] - 3) + 'L' + f(x[0] + 3) + ' ' + f(x[1] + 3) + 'M' + f(x[0] - 3) + ' ' + f(x[1] + 3) + 'L' + f(x[0] + 3) + ' ' + f(x[1] - 3) + '" stroke="#2F5F8F" stroke-width="1.7" stroke-linecap="round"/>';
      /* the pull: an arrow alongside the bond, from the hydrogen towards the oxygen */
      var a1 = pt(ox, oy, 50, a), a2 = pt(ox, oy, 27, a); a1 = [a1[0] + n[0] * 15, a1[1] + n[1] * 15]; a2 = [a2[0] + n[0] * 15, a2[1] + n[1] * 15];
      s += '<line x1="' + f(a1[0]) + '" y1="' + f(a1[1]) + '" x2="' + f(a2[0] + u[0] * 5) + '" y2="' + f(a2[1] + u[1] * 5) + '" stroke="#2F6FB3" stroke-width="1.6"/>';
      s += '<path d="M' + f(a2[0]) + ' ' + f(a2[1]) + 'L' + f(a2[0] + u[0] * 7 + perp[0] * 3.5) + ' ' + f(a2[1] + u[1] * 7 + perp[1] * 3.5) + 'L' + f(a2[0] + u[0] * 7 - perp[0] * 3.5) + ' ' + f(a2[1] + u[1] * 7 - perp[1] * 3.5) + 'Z" fill="#2F6FB3"/>';
      s += delta(pt(ox, oy, DH + RH + 13, a), '+');
    });
    /* the two lone pairs, on the back of the oxygen's shell */
    [Math.PI - 0.5, Math.PI + 0.5].forEach(function (a) { var c = pt(ox, oy, RO, a), t = [-Math.sin(a), Math.cos(a)]; [-4, 4].forEach(function (k) { s += '<circle cx="' + f(c[0] + t[0] * k) + '" cy="' + f(c[1] + t[1] * k) + '" r="2.7" fill="#9E2F2B"/>'; }); });
    s += txt(ox, oy + 6, 'O', 16, 700, '#9E2F2B', 'middle');
    s += delta([ox - RO - 15, oy], '−');
    s += note(176, 62, 'Oxygen has 6 outer electrons (•),') + note(176, 78, 'each hydrogen 1 (×). Two shared') + note(176, 94, 'pairs make the two bonds.');
    s += note(176, 118, 'Oxygen attracts the shared electrons') + note(176, 134, 'more strongly than hydrogen does,') + note(176, 150, 'so they sit nearer the oxygen (the') + note(176, 166, 'arrows): δ− there, δ+ on each hydrogen.');
    /* ---- 2. the result: a polar molecule ---- */
    s += title(214, 'The result: a polar molecule');
    var A = mol(70, 278, 0); s += A.svg;
    s += delta(A.back(), '−') + delta(A.beyond(0), '+') + delta(A.beyond(1), '+');
    s += note(132, 262, 'Slightly negative at the back of the') + note(132, 278, 'oxygen (δ−), slightly positive at each') + note(132, 294, 'hydrogen (δ+): a polar molecule.');
    /* ---- 3. cohesion: a chain ---- */
    s += title(366, 'Cohesion — water holds on to water');
    var B = mol(62, 422, 0), C = mol(178, 448, -18), D = mol(300, 422, -30);
    s += hb(B.h[1], C.edge(162 * Math.PI / 180)) + hb(C.h[1], D.edge(150 * Math.PI / 180));
    s += B.svg + C.svg + D.svg;
    s += delta(B.beyond(1), '+') + delta(C.back(14), '−') + delta(C.beyond(1), '+') + delta(D.back(14), '−');
    s += note(112, 500, 'hydrogen bond', 'middle') + '<line x1="114" y1="488" x2="120" y2="452" stroke="#2F6FB3" stroke-width="1"/>';
    s += note(385, 400, 'and so on,', 'middle') + note(385, 416, 'up the xylem', 'middle');
    s += note(228, 496, 'δ+ H to δ− O, again and again:') + note(228, 512, 'one continuous column.');
    /* ---- 4. adhesion: the wall ---- */
    s += title(548, 'Adhesion — water holds on to the xylem wall');
    s += '<rect x="16" y="558" width="38" height="104" rx="3" fill="#D8C39A" stroke="#9A7B4F" stroke-width="1.2"/>';
    for (var i = 0; i < 6; i++) s += '<line x1="20" y1="' + (566 + i * 16) + '" x2="50" y2="' + (570 + i * 16) + '" stroke="#B89A62" stroke-width="1"/>';
    s += '<text transform="translate(40 610) rotate(-90)" text-anchor="middle" font-size="11.5" font-weight="700" fill="#5B4425">cellulose</text>';
    /* two –OH groups on the cellulose, the oxygen δ− */
    [584, 638].forEach(function (y) {
      s += '<line x1="54" y1="' + y + '" x2="84" y2="' + y + '" stroke="#B9C2C8" stroke-width="6" stroke-linecap="round"/><line x1="84" y1="' + y + '" x2="100" y2="' + (y - 12) + '" stroke="#B9C2C8" stroke-width="6" stroke-linecap="round"/>';
      s += '<circle cx="84" cy="' + y + '" r="13" fill="#D9534F" stroke="#9E2F2B" stroke-width="1.2"/>' + txt(84, y + 4.5, 'O', 12, 700, '#fff', 'middle');
      s += '<circle cx="100" cy="' + (y - 12) + '" r="9" fill="#F5F7F8" stroke="#7F8F9A" stroke-width="1.2"/>' + txt(100, y - 8.5, 'H', 10, 700, '#33414A', 'middle');
      s += delta([84, y + 23], '−');
    });
    var E = mol(170, 611, 180);
    s += hb([97, 586], E.h[1]) + hb([97, 636], E.h[0]) + E.svg;
    s += delta(E.back(), '−') + delta(E.beyond(1), '+') + delta(E.beyond(0), '+');
    s += note(226, 586, '–OH groups on the cellulose') + note(226, 602, 'are polar too, so the same') + note(226, 618, 'hydrogen bonds form between') + note(226, 634, 'water and the wall: the column') + note(226, 650, 'clings to the xylem and does') + note(226, 666, 'not slip back.');
    return s + '</svg>';
  }

  /* ---------- trunk: a tree cut across — cork, phloem, cambium, and the rings of xylem it makes (opens from the words) ---------- */
  function trunkSvg() {
    var cx = 132, cy = 196, s = '<svg viewBox="0 0 484 372" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A tree trunk cut across: cork on the outside, then a thin layer of phloem, the cambium, and ring after ring of xylem, the oldest at the centre">';
    function ring(r, fill, stroke) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="1"' : '') + '/>'; }
    function txt(x, y, t, size, weight, fill, anchor) { return '<text x="' + x + '" y="' + y + '" font-size="' + size + '"' + (weight ? ' font-weight="' + weight + '"' : '') + ' fill="' + fill + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + t + '</text>'; }
    function lead(ang, r, x, y) { var a = ang * Math.PI / 180, px = cx + r * Math.cos(a), py = cy + r * Math.sin(a); return '<line x1="' + px.toFixed(1) + '" y1="' + py.toFixed(1) + '" x2="' + x + '" y2="' + y + '" stroke="#1F2A24" stroke-width="1"/><circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="2.6" fill="#1F2A24"/>'; }
    s += txt(16, 24, 'A tree trunk, cut across', 16.5, 700, '#3D7A54');
    s += ring(124, '#5B3E27');                                  /* bark: cork on the outside */
    s += ring(112, '#8FB08A', '#5F7F5A');                       /* phloem: a thin living layer */
    s += ring(103, '#2E6B3E');                                  /* cambium: one layer of dividing cells */
    var r = 100, k = 0;                                         /* the rings: pale, wide spring wood, then darker, narrow summer wood — one pair a year */
    while (r > 34) { var w = 9 - k * 0.35, sw = 3; s += ring(r, '#E8D6B0') + ring(r - w + sw, '#B9895A'); r -= w; k++; }
    s += ring(r, '#9A6A45') + ring(4, '#5B3E27');               /* heartwood: old xylem, then the pith */
    /* The label column must start clear of the bark. The trunk is centred at x=132 with an
       outer radius of 124, so it reaches x=256; the labels used to begin at 250 and every one
       of them sat on the bark. LABEL_X is the one number that governs it, and the viewBox is
       wide enough for the longest line ("Xylem = wood, a ring a year:", bold) beside it. */
    var LABEL_X = 268;
    var L = [
      [-38, 121, LABEL_X, 60, ['Cork: the outer bark —', 'dead, waterproof cells']],
      [-20, 108, LABEL_X, 114, ['Phloem: a thin living layer', 'just under the bark']],
      [-4, 103, LABEL_X, 168, ['Cambium: one layer of', 'dividing cells — new xylem', 'inwards, new phloem outwards']],
      [22, 78, LABEL_X, 236, ['Xylem = wood, a ring a year:', 'pale wide spring wood, then', 'darker narrow summer wood']],
      [48, 22, LABEL_X, 300, ['Heartwood: old xylem, no', 'longer carrying water']]
    ];
    L.forEach(function (e) { s += lead(e[0], e[1], e[2] - 6, e[3] - 4); e[4].forEach(function (t, i) { s += txt(e[2], e[3] + i * 16, t, 13.2, i === 0 ? 700 : 0, i === 0 ? '#1F2A24' : '#5B6B63'); }); });
    s += txt(16, 344, 'Each year the cambium adds one ring of xylem: that is how a trunk', 13.2, 0, '#5B6B63') + txt(16, 360, 'thickens, and why the rings count its years.', 13.2, 0, '#5B6B63');
    return s + '</svg>';
  }
  var DIAGRAMS = {
    'flower': { svg: flowerSvg(true) },
    'flower-blank': { svg: flowerSvg(false) },
    'water': { svg: waterSvg() },
    'trunk': { svg: trunkSvg() }
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
