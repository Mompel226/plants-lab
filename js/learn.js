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
     transpire    a potometer whose bubble runs as fast as the conditions allow
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

  /* ---------- transpire: a potometer that runs as fast as the conditions allow ---------- */
  function transpire(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'What changes the rate?', spec.ask, 'Change the conditions'));
    var wrap = h('div', 'tp');
    var C = [
      { id: 'temp', label: 'Temperature', opts: [['cold', 'cold, 10 °C', .55], ['warm', 'warm, 20 °C', 1], ['hot', 'hot, 30 °C', 1.7]], v: 1,
        why: { cold: 'Cold: water evaporates slowly from the mesophyll cells and the vapour diffuses slowly.', warm: 'Warm: a moderate rate of evaporation and diffusion.', hot: 'Hot: water evaporates faster from the mesophyll cells and the vapour diffuses out faster.' } },
      { id: 'wind', label: 'Wind', opts: [['still', 'still air', .7], ['breeze', 'a breeze', 1], ['fan', 'a fan on the leaves', 1.8]], v: 1,
        why: { still: 'Still air: water vapour builds up round the leaf, so the concentration gradient out of the stomata is small.', breeze: 'A breeze moves some of the vapour away.', fan: 'Moving air carries the water vapour away from the leaf, keeping the concentration gradient out of the stomata steep.' } },
      { id: 'hum', label: 'Humidity', opts: [['dry', 'dry air', 1.5], ['normal', 'ordinary air', 1], ['humid', 'humid — a bag over the shoot', .35]], v: 1,
        why: { dry: 'Dry air holds little water vapour, so the gradient from inside the leaf to outside is steep.', normal: 'Ordinary air: a moderate gradient.', humid: 'Humid air already holds a lot of water vapour, so the concentration gradient out of the leaf is small and diffusion is slow.' } },
      { id: 'light', label: 'Light', opts: [['dark', 'dark', .25], ['light', 'light', 1]], v: 1,
        why: { dark: 'In the dark the stomata close, so very little water vapour can get out at all.', light: 'In the light the stomata are open for photosynthesis, and water vapour leaves through them.' } }
    ];
    var ctl = h('div', 'tp__ctl'), sayBox = h('ul', 'tp__why');
    var sel = {};
    C.forEach(function (c) {
      var lab = h('label', 'tp__row', '<span>' + esc(c.label) + '</span>');
      var s = document.createElement('select');
      c.opts.forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); });
      s.value = c.opts[c.v][0]; sel[c.id] = s; lab.appendChild(s); ctl.appendChild(lab);
      s.addEventListener('change', paint);
    });
    var stage = h('div', 'tp__stage');
    stage.innerHTML = '<svg viewBox="0 0 420 200" class="tp__svg" aria-label="A potometer: a shoot in a tube, a capillary tube with an air bubble, a beaker of water">' +
      '<rect x="0" y="0" width="420" height="200" fill="#F7F4EC"/>' +
      '<path d="M40 150 H330" stroke="#5B6B72" stroke-width="7" fill="none"/><path d="M40 150 H330" stroke="#CFE8F7" stroke-width="4" fill="none"/>' +
      '<rect x="318" y="120" width="70" height="60" fill="#BFE0F5" stroke="#5B6B72" stroke-width="2"/><path d="M330 110 V150" stroke="#5B6B72" stroke-width="7"/><path d="M330 110 V150" stroke="#CFE8F7" stroke-width="4"/>' +
      '<g class="tp__ticks">' + (function () { var s = ''; for (var i = 0; i <= 10; i++) s += '<line x1="' + (60 + i * 24) + '" y1="156" x2="' + (60 + i * 24) + '" y2="' + (i % 5 ? 162 : 166) + '" stroke="#5B6B72" stroke-width="1"/>'; return s; })() + '</g>' +
      '<path d="M40 150 V60 Q40 40 60 40 H70" stroke="#5B6B72" stroke-width="7" fill="none"/><path d="M40 150 V60 Q40 40 60 40 H70" stroke="#CFE8F7" stroke-width="4" fill="none"/>' +
      '<rect x="62" y="30" width="22" height="20" fill="#8A5A2A" rx="3"/>' +
      '<path d="M84 40 C120 40 140 30 170 32" stroke="#3E9A57" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M110 38 C100 20 118 6 138 12 C136 30 122 42 110 38Z" fill="#5DBF6E" stroke="#2A6B3B" stroke-width="1.5"/><path d="M140 36 C136 14 156 4 176 10 C172 30 156 44 140 36Z" fill="#5DBF6E" stroke="#2A6B3B" stroke-width="1.5"/><path d="M160 34 C170 18 190 16 204 24 C194 38 176 44 160 34Z" fill="#5DBF6E" stroke="#2A6B3B" stroke-width="1.5"/>' +
      '<g class="tp__vap"><circle cx="128" cy="6" r="3"/><circle cx="168" cy="2" r="3"/><circle cx="200" cy="16" r="3"/></g>' +
      '<circle class="tp__bubble" cx="80" cy="150" r="4.5"/>' +
      '<text x="60" y="184" class="tp__lab">0</text><text x="292" y="184" class="tp__lab">100 mm</text><text x="352" y="196" class="tp__lab" text-anchor="middle">water</text></svg>';
    var svg = stage.firstChild, bubble = svg.querySelector('.tp__bubble'), vap = svg.querySelector('.tp__vap');
    var out = h('p', 'tp__out');
    var rate = 1, x = 80, last = null, raf = null;
    function paint() {
      rate = 1; sayBox.innerHTML = '';
      C.forEach(function (c) { var o = c.opts.filter(function (q) { return q[0] === sel[c.id].value; })[0]; rate *= o[2]; sayBox.appendChild(h('li', null, esc(c.why[o[0]]))); });
      var mm = Math.round(rate * 12);
      out.innerHTML = '<b>' + mm + ' mm per minute</b> along the capillary tube — the bubble moves as fast as the shoot takes water up, which is as fast as it loses it.' +
        (rate > 1.6 ? ' Fast: warm, dry, moving air and open stomata.' : rate < .5 ? ' Slow: little is leaving the leaves.' : '');
      svg.classList.toggle('is-dark', sel.light.value === 'dark');
      vap.style.animationDuration = (2.4 / Math.max(.25, rate)).toFixed(2) + 's';
    }
    function tick(now) {
      if (last == null) last = now;
      var dt = Math.min(50, now - last); last = now;
      if (!stage.isConnected) { raf = null; return; }
      x += rate * dt * 0.02;
      if (x > 300) x = 80;
      bubble.setAttribute('cx', x.toFixed(1));
      raf = requestAnimationFrame(tick);
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) raf = requestAnimationFrame(tick);
    wrap.appendChild(ctl); wrap.appendChild(stage);
    box.appendChild(wrap); box.appendChild(out); box.appendChild(sayBox); paint();
    box.appendChild(h('p', 'widget__note', 'Light is here because it is real; the syllabus names temperature, wind speed and humidity. Every joint sealed, the shoot cut under water, the leaves dried — or the bubble measures the leaks.'));
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
   ['transpire', transpire], ['sourcesink', sourcesink], ['auxin', auxin], ['diagram', diagram], ['pollentube', pollentube], ['adapt', adapt]]
    .forEach(function (m) { W.register(m[0], m[1]); });

  global.Learn = { widget: W.widget, reap: W.reap, svgFor: svgFor, DIAGRAMS: DIAGRAMS, PART_INFO: PART_INFO };
})(window);
