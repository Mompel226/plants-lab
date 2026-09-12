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
      'carbon dioxide': 'From the air. It <b>diffuses</b> in through the stomata, down a concentration gradient, along the air spaces and into the mesophyll cells. About 0.04 % of the air — which is why it is so often the limiting factor.',
      'water': 'From the soil. It enters the root hair cells by <b>osmosis</b>, then travels up the xylem in the <b>transpiration stream</b>, into the mesophyll cells.',
      'glucose': 'Made in the chloroplasts. Used in <b>respiration</b>, stored as <b>starch</b>, built into <b>cellulose</b>, converted to <b>sucrose</b> for <b>translocation</b> in the phloem, made into nectar.',
      'oxygen': 'The waste product. It <b>diffuses</b> out through the stomata, down a concentration gradient. In the light a leaf produces far more than it uses in respiration.',
      'light': 'The energy source. Absorbed by chlorophyll in the chloroplasts and transferred into energy in chemicals — the glucose.',
      'chlorophyll': 'The green pigment in the chloroplasts. Not used up: it captures the light, over and over.'
    };
    var eq = h('div', 'eq');
    function chip(t, cls) { var b = h('button', 'eq__w' + (cls ? ' ' + cls : ''), esc(t)); b.type = 'button'; b.addEventListener('click', function () { show(t, b); }); return b; }
    var note = h('p', 'eq__note'); note.hidden = true;
    function show(t, b) {
      eq.querySelectorAll('.eq__w').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      /* the notes carry <b> round the words a student must actually write, so they are not escaped */
      note.hidden = false; note.innerHTML = '<b>' + esc(t) + '</b> — ' + (NOTES[t] || '');
    }
    eq.appendChild(chip('carbon dioxide')); eq.appendChild(h('span', 'eq__op', '+')); eq.appendChild(chip('water'));
    /* light above the arrow, chlorophyll below it — the way every textbook and every mark scheme
       draws it. Both were stacked above it, which crowded one side and left the other empty. */
    var arrow = h('span', 'eq__arrow');
    var over = h('span', 'eq__over'); over.appendChild(chip('light', 'eq__w--cond'));
    var under = h('span', 'eq__under'); under.appendChild(chip('chlorophyll', 'eq__w--cond'));
    arrow.appendChild(over);
    arrow.appendChild(h('span', 'eq__line', '→'));
    arrow.appendChild(under);
    eq.appendChild(arrow);
    eq.appendChild(chip('glucose')); eq.appendChild(h('span', 'eq__op', '+')); eq.appendChild(chip('oxygen'));
    box.appendChild(eq); box.appendChild(note);
    var bal = h('div', 'eq__bal'); bal.hidden = true;
    bal.innerHTML = '<span class="sup tip" tabindex="0" data-tip="Supplement — Paper 4 (Extended) only">S</span> <span class="eq__f">6CO<sub>2</sub> + 6H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub></span>' +
      '<small>Six of each on the left; one glucose and six oxygen on the right. Check it balances: 6 carbons, 12 hydrogens and 18 oxygens on each side.</small>';
    var bt = h('button', 'wbtn wbtn--quiet', 'Show the balanced equation'); bt.type = 'button';
    bt.addEventListener('click', function () { bal.hidden = !bal.hidden; bt.textContent = bal.hidden ? 'Show the balanced equation' : 'Hide the balanced equation'; });
    box.appendChild(bt); box.appendChild(bal);
    return box;
  }



  /* ---------- limitgraph: the student plots the curves, then works out what happened ----------
     The model is the SAME one the sliders above use — Blackman's: the rate is set by whichever
     factor is in shortest supply, rate = min(fLight, fCO2, fTemp). That is what gives the exam's
     shape: a smooth rise while the factor on the x-axis is the limiting one, then a flat plateau
     from the moment something else becomes the limit. Raise the fixed factor and the whole
     plateau lifts — which is the two-curve diagram 0610 asks candidates to explain.

     Temperature is the odd axis, and deliberately so: its own response rises to about 35 °C and
     then falls, because the reactions are enzyme-controlled and enzymes are denatured above their
     optimum. So a temperature curve can rise, plateau AND fall, and the fall happens however much
     light and carbon dioxide there is.

     Nothing is explained until it is asked for. Where the curve does something worth noticing, a
     small "?" is left on it; the reader is meant to work out why first, and press it to check. */
  function limitgraph(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Plot the curves yourself',
      spec.ask || 'Choose what goes along the bottom, set the other two, and plot. Plot again with one of them changed, and compare the two curves. Where the curve does something worth noticing it is marked — work out why before you press it.',
      'Plot and compare'));

    /* the three responses, 0–1. Identical to the slider widget's, so the two never disagree. */
    function fL(x) { return 1 - Math.exp(-3.2 * x / 100); }
    function fC(x) { return 1 - Math.exp(-3.2 * x / 100); }
    function fT(t) { return t <= 35 ? Math.max(0, t / 35) : Math.max(0, 1 - (t - 35) / 10); }

    var AX = {
      light: { key: 'light', name: 'Light intensity', unit: '%', min: 0, max: 100, f: fL,
               others: ['co2', 'temp'] },
      co2:   { key: 'co2', name: 'Carbon dioxide concentration', unit: '%', min: 0, max: 100, f: fC,
               others: ['light', 'temp'] },
      temp:  { key: 'temp', name: 'Temperature', unit: ' °C', min: 0, max: 50, f: fT,
               others: ['light', 'co2'] }
    };
    var NAME = { light: 'light intensity', co2: 'carbon dioxide concentration', temp: 'temperature' };
    var COL = ['#1F6FB2', '#D9772B', '#6E43A8', '#2E8B57'];
    var COLW = ['blue', 'orange', 'purple', 'green'];

    var state = { axis: 'light', light: 30, co2: 80, temp: 25, curves: [] };

    /* rate at one point, as a percentage */
    function rateAt(v) {
      var a = state.axis;
      var L = a === 'light' ? v : state.light;
      var C = a === 'co2' ? v : state.co2;
      var T = a === 'temp' ? v : state.temp;
      return Math.min(fL(L), fC(C), fT(T)) * 100;
    }
    /* the same, for a SAVED curve (its own fixed values) */
    function rateFor(cv, v) {
      var L = cv.axis === 'light' ? v : cv.light;
      var C = cv.axis === 'co2' ? v : cv.co2;
      var T = cv.axis === 'temp' ? v : cv.temp;
      return Math.min(fL(L), fC(C), fT(T)) * 100;
    }

    /* ---- the controls ---- */
    var ctl = h('div', 'lg__ctl');
    var axisRow = h('div', 'lg__axis');
    axisRow.appendChild(h('span', 'lg__axlab', 'Along the bottom:'));
    var axBtns = {};
    ['light', 'co2', 'temp'].forEach(function (k) {
      var b = h('button', 'lg__ax', AX[k].name); b.type = 'button';
      b.addEventListener('click', function () { state.axis = k; paint(); });
      axBtns[k] = b; axisRow.appendChild(b);
    });
    ctl.appendChild(axisRow);

    var sliders = h('div', 'lg__sliders');
    var srow = {};
    ['light', 'co2', 'temp'].forEach(function (k) {
      var a = AX[k];
      var r = h('label', 'lg__row');
      r.innerHTML = '<span class="lg__lab">' + esc(a.name) + '<b></b></span>';
      var inp = document.createElement('input');
      inp.type = 'range'; inp.min = a.min; inp.max = a.max; inp.step = 1; inp.value = state[k];
      inp.setAttribute('aria-label', a.name);
      inp.addEventListener('input', function () { state[k] = +inp.value; paint(); });
      r.appendChild(inp);
      sliders.appendChild(r);
      srow[k] = { row: r, inp: inp, val: r.querySelector('b') };
    });
    ctl.appendChild(sliders);
    box.appendChild(ctl);

    /* ---- the plot ---- */
    var W = 560, H = 330, P = { l: 56, r: 16, t: 14, b: 46 };
    /* the plot and, standing on its top right corner, the button that plots the curve — beside
       the graph it acts on, not below the sliders where it was easy to miss */
    var stage = h('div', 'lg__stage');
    var plot = h('div', 'lg__plot');
    stage.appendChild(plot);
    box.appendChild(stage);

    var read = h('div', 'lg__read');
    box.appendChild(read);

    var note = h('div', 'lg__note'); note.hidden = true;
    box.appendChild(note);

    var btns = h('div', 'lg__btns');
    var bPlot = h('button', 'wbtn', 'Plot this curve'); bPlot.type = 'button';
    var bClear = h('button', 'wbtn wbtn--quiet', 'Clear the curves'); bClear.type = 'button';
    bPlot.addEventListener('click', function () {
      if (state.curves.length >= 4) { note.hidden = false; note.innerHTML = '<b>Four is enough to compare.</b> Clear them and start again.'; return; }
      state.curves.push({ axis: state.axis, light: state.light, co2: state.co2, temp: state.temp, i: state.curves.length });
      note.hidden = true; paint();
    });
    bClear.addEventListener('click', function () { state.curves = []; note.hidden = true; paint(); });
    btns.appendChild(bPlot); btns.appendChild(bClear);
    stage.appendChild(btns);

    var legend = h('div', 'lg__legend');
    box.appendChild(legend);

    function x2px(v, a) { return P.l + (v - a.min) / (a.max - a.min) * (W - P.l - P.r); }
    function y2px(r) { return H - P.b - (r / 100) * (H - P.t - P.b); }

    /* where a curve stops climbing: the first point at which the factor on the x-axis has
       stopped being the limiting one. Returns null when it never plateaus. */
    function elbowOf(cv) {
      var a = AX[cv.axis];
      if (cv.axis === 'temp') return null;             /* handled by peakOf */
      var ceil = Math.min(
        cv.axis === 'light' ? fC(cv.co2) : fL(cv.light),
        fT(cv.temp)) * 100;
      if (ceil >= 99.5) return null;                   /* nothing else is limiting: no elbow */
      for (var v = a.min; v <= a.max; v += 0.5) {
        if (rateFor(cv, v) >= ceil - 0.15) return { v: v, r: ceil, ceil: ceil };
      }
      return null;
    }
    /* the turn on a temperature curve: the rate falling while the temperature still rises */
    function peakOf(cv) {
      if (cv.axis !== 'temp') return null;
      var ceil = Math.min(fL(cv.light), fC(cv.co2)) * 100;
      var r35 = rateFor(cv, 35);
      if (r35 <= 0.5) return null;
      var v = 42, r = rateFor(cv, v);
      if (r >= r35 - 0.5) return null;                 /* never falls within the axis */
      return { v: v, r: r, ceil: ceil };
    }

    var marks = [];
    function paint() {
      var a = AX[state.axis];
      ['light', 'co2', 'temp'].forEach(function (k) {
        axBtns[k].classList.toggle('is-on', k === state.axis);
        srow[k].row.classList.toggle('is-x', k === state.axis);
        srow[k].val.textContent = state[k] + AX[k].unit + (k === state.axis ? ' — along the bottom' : '');
      });

      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Rate of photosynthesis against ' + esc(a.name.toLowerCase()) + '">';
      /* grid */
      for (var g = 0; g <= 100; g += 25) {
        var y = y2px(g);
        s += '<line x1="' + P.l + '" y1="' + y.toFixed(1) + '" x2="' + (W - P.r) + '" y2="' + y.toFixed(1) + '" stroke="#E6E4DC" stroke-width="1"/>';
        s += '<text x="' + (P.l - 8) + '" y="' + (y + 4).toFixed(1) + '" font-size="11" fill="#8A8A82" text-anchor="end">' + g + '</text>';
      }
      /* axes */
      s += '<line x1="' + P.l + '" y1="' + P.t + '" x2="' + P.l + '" y2="' + (H - P.b) + '" stroke="#1F2A24" stroke-width="1.4"/>';
      s += '<line x1="' + P.l + '" y1="' + (H - P.b) + '" x2="' + (W - P.r) + '" y2="' + (H - P.b) + '" stroke="#1F2A24" stroke-width="1.4"/>';
      /* x ticks */
      var step = (a.max - a.min) / 5;
      for (var t = a.min; t <= a.max + 0.01; t += step) {
        var xp = x2px(t, a);
        s += '<line x1="' + xp.toFixed(1) + '" y1="' + (H - P.b) + '" x2="' + xp.toFixed(1) + '" y2="' + (H - P.b + 5) + '" stroke="#1F2A24" stroke-width="1"/>';
        s += '<text x="' + xp.toFixed(1) + '" y="' + (H - P.b + 18) + '" font-size="11" fill="#5B6B63" text-anchor="middle">' + Math.round(t) + '</text>';
      }
      s += '<text x="' + ((P.l + W - P.r) / 2) + '" y="' + (H - 8) + '" font-size="12.5" fill="#3C3C3C" text-anchor="middle">' + esc(a.name) + ' /' + esc(a.unit.trim() || '%') + '</text>';
      s += '<text transform="translate(15,' + ((P.t + H - P.b) / 2) + ') rotate(-90)" font-size="12.5" fill="#3C3C3C" text-anchor="middle">Rate of photosynthesis / %</text>';

      /* saved curves */
      marks = [];
      state.curves.forEach(function (cv) {
        if (cv.axis !== state.axis) return;            /* a curve belongs to its own axis */
        var ax = AX[cv.axis], d = '';
        for (var v = ax.min; v <= ax.max + 0.01; v += (ax.max - ax.min) / 160) {
          var px = x2px(v, ax), py = y2px(rateFor(cv, v));
          d += (d ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
        }
        s += '<path d="' + d + '" fill="none" stroke="' + COL[cv.i % 4] + '" stroke-width="2.4" stroke-linejoin="round"/>';
        var e = elbowOf(cv); if (e) marks.push({ cv: cv, kind: 'elbow', x: x2px(e.v, ax), y: y2px(e.r), e: e });
        var pk = peakOf(cv); if (pk) marks.push({ cv: cv, kind: 'peak', x: x2px(pk.v, ax), y: y2px(pk.r), e: pk });
      });
      /* the live curve, dashed, before it is plotted */
      var dl = '';
      for (var v2 = a.min; v2 <= a.max + 0.01; v2 += (a.max - a.min) / 160) {
        var px2 = x2px(v2, a), py2 = y2px(rateAt(v2));
        dl += (dl ? 'L' : 'M') + px2.toFixed(1) + ',' + py2.toFixed(1);
      }
      s += '<path d="' + dl + '" fill="none" stroke="#9AA39C" stroke-width="1.8" stroke-dasharray="5 4"/>';
      /* where the three sliders are standing now, on that dashed curve */
      var hx = x2px(state[state.axis], a), hy = y2px(rateAt(state[state.axis]));
      s += '<line x1="' + hx.toFixed(1) + '" y1="' + hy.toFixed(1) + '" x2="' + hx.toFixed(1) + '" y2="' + (H - P.b) + '" stroke="#9AA39C" stroke-width="1" stroke-dasharray="2 3"/>';
      s += '<circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="5.5" fill="#fff" stroke="#3C3C3C" stroke-width="2"/>';
      /* the marks, last so they sit on top */
      marks.forEach(function (m, i) {
        s += '<circle class="lg__mk" data-m="' + i + '" cx="' + m.x.toFixed(1) + '" cy="' + m.y.toFixed(1) + '" r="10" fill="#fff" stroke="' + COL[m.cv.i % 4] + '" stroke-width="2"/>' +
             '<text class="lg__mkt" data-m="' + i + '" x="' + m.x.toFixed(1) + '" y="' + (m.y + 4).toFixed(1) + '" font-size="12" font-weight="700" fill="' + COL[m.cv.i % 4] + '" text-anchor="middle">?</text>';
      });
      s += '</svg>';
      plot.innerHTML = s;
      plot.querySelectorAll('[data-m]').forEach(function (el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', function () { explain(marks[+el.getAttribute('data-m')]); });
      });

      /* the reading at the dot: the rate, and which factor is holding it back there */
      var caps = [fL(state.light), fC(state.co2), fT(state.temp)];
      var rate = Math.min.apply(null, caps), who = caps.indexOf(rate);
      var why = rate >= 0.98 ? 'Nothing is holding it back much here: all three are near their best. Real leaves stop about here, because their enzymes can work no faster.'
        : who === 2 && state.temp > 35 ? 'Too hot. The enzymes of photosynthesis are being denatured, so the rate falls however much light and carbon dioxide there is.'
        : who === 2 ? 'Temperature is limiting: the enzyme-controlled reactions are slow in the cold. Warm it and the rate rises — until something else runs short.'
        : who === 0 ? 'Light intensity is limiting: chlorophyll is capturing energy as fast as the light arrives. Raise it and the rate rises, until carbon dioxide or temperature takes over.'
        : 'Carbon dioxide concentration is limiting: the raw material is in short supply. Raise it and the rate rises, until light or temperature takes over.';
      read.innerHTML = '<span class="lg__rate"><i style="width:' + (rate * 100).toFixed(0) + '%"></i></span>' +
        '<b>Rate of photosynthesis: ' + (rate * 100).toFixed(0) + ' %</b>' +
        '<span class="lg__who">' + (rate >= 0.98 ? 'No single limiting factor' : 'Limiting factor here: <b>' + esc(NAME[['light', 'co2', 'temp'][who]]) + '</b>') + '</span>' +
        '<small>' + esc(why) + '</small>';

      legend.innerHTML = state.curves.map(function (cv) {
        var other = AX[cv.axis].others.map(function (k) { return NAME[k] + ' ' + cv[k] + AX[k].unit; }).join(', ');
        return '<span class="lg__key"' + (cv.axis === state.axis ? '' : ' data-off="1"') + '>' +
          '<i style="background:' + COL[cv.i % 4] + '"></i>' + esc(COLW[cv.i % 4]) + ' — ' + esc(other) +
          (cv.axis === state.axis ? '' : ' <em>(drawn against ' + esc(NAME[cv.axis]) + ')</em>') + '</span>';
      }).join('');
    }

    function explain(m) {
      var cv = m.cv, txt;
      if (m.kind === 'elbow') {
        var otherLim = fT(cv.temp) < (cv.axis === 'light' ? fC(cv.co2) : fL(cv.light)) ? 'temp' : (cv.axis === 'light' ? 'co2' : 'light');
        txt = '<b>The curve has levelled off.</b> Up to here, ' + NAME[cv.axis] + ' was the limiting factor: every increase raised the rate. ' +
              'From this point it is not — raising it further changes nothing, because <b>' + NAME[otherLim] + '</b> is now in shortest supply and setting the ceiling. ' +
              'Plot a second curve with ' + NAME[otherLim] + ' raised and you will see the whole plateau lift.';
      } else {
        txt = '<b>The rate is falling although the temperature is still rising.</b> Nothing has run short: the reactions of photosynthesis are controlled by enzymes, ' +
              'and above about 35 °C those enzymes are being <b>denatured</b> — their active sites change shape and stop working. ' +
              'That is why temperature is the odd one out: light and carbon dioxide level off, temperature peaks and falls.';
      }
      note.hidden = false;
      note.innerHTML = txt;
      note.scrollIntoView({ block: 'nearest' });
    }

    paint();
    box.appendChild(h('p', 'widget__note', 'A model, not a measurement — but the shapes are the ones the exam draws, and the rule behind them is the exam’s too: the rate is set by whichever factor is in shortest supply.'));
    box.__onReset = function () { state = { axis: 'light', light: 30, co2: 80, temp: 25, curves: [] }; };
    return box;
  }


  /* ---------- pondweed: the rate practical, judged on whether the data is any good ----------
     "More light, more bubbles" is the one thing every student already knows, so it is not what
     this teaches. What costs marks is everything around it, and each of those is here as
     something the reader can DO wrong and then be shown:

       · acclimation — change a condition and the plant takes minutes to settle. Count at once
         and the reading is partly of the old conditions.
       · the heat shield — a bare lamp warms the beaker. Move it closer and the temperature rises
         with the light, so two variables change together and neither result means anything.
       · false bubbles — warm water holds less dissolved gas, and bubbles come out of solution and
         off the leaf surface. They look identical to oxygen and inflate the count.
       · bubble size — bubbles are not all the same size, so a count is a rough measure of volume.
         Two identical runs differ; that is the apparatus, not the plant.

     Nothing is lectured. A finding appears only when the reader's own run has just demonstrated
     it, states WHAT happened in one line, and keeps the reason behind a press. Each is shown
     once — after that the reader is expected to know. */
  function pondweed(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Count the bubbles',
      spec.ask || 'Set the apparatus up, let it settle, then count the oxygen for a minute. The number is the easy part — the question is whether it means anything.',
      'Run it properly'));

    var S = { d: 30, hco3: 2, bath: 20, shield: false, measureTo: 'beaker', settleMs: 5200, changedAt: Date.now() - 99999,
              prev: null, running: false, t: 0, n: 0, rows: [], found: {}, bubbles: [], gas: 0 };

    /* A 1 dm³ beaker is about 10.5 cm across, so its near face is about 5 cm short of the sprig
       at its centre. Measure to the glass and every reading is short by that same 5 cm — the
       light that actually reaches the plant is always less than the reading says, and always by
       a predictable amount. That is a SYSTEMATIC error: unlike the random scatter in each count,
       repeating the run and taking a mean does not touch it. */
    /* ONE SCALE for the ruler: 8 px to the centimetre. The beaker is drawn 136 px across, so
       its near face is 68 px — 8.5 cm — in front of the sprig at the centre.

       S.d is where the LAMP IS, measured from the plant, and moving a ruler does not move a lamp.
       What changes is the READING: held against the glass it is 8.5 cm short, every time. The
       rate is worked out from S.d; the table records the reading. */
    var PX_PER_CM = 8, BEAKER_OFFSET_CM = 8.5;

    /* THE GEOMETRY, IN ONE PLACE. The bubbles used to carry their own copies of these numbers,
       so when the apparatus moved right the drawing followed and the animation did not: they
       went on rising from x=354 — where the beaker used to be — and were funnelled to a point
       180 px from the plant. Both the drawing and the run read these now, so they cannot drift
       apart again. */
    var G = (function () {
      var BX = 466, BW = 136, BH = 176, BBOT = 322, BTOP = BBOT - BH, WTOP = BTOP + 20;
      var FX = BX + BW / 2;
      var FMOUTH = BBOT - 5, FRIM = 46, FNECK = 7, FSHOULDER = FMOUTH - 62, FSTEM_TOP = FSHOULDER - 46;
      var TW = 23, TTOP = WTOP + 8, TBOT = FSTEM_TOP + 26;
      return { W: 840, H: 366, BENCH: 330,
               BX: BX, BW: BW, BH: BH, BBOT: BBOT, BTOP: BTOP, WTOP: WTOP, FX: FX,
               FMOUTH: FMOUTH, FRIM: FRIM, FNECK: FNECK, FSHOULDER: FSHOULDER, FSTEM_TOP: FSTEM_TOP,
               TW: TW, TX: FX - TW / 2, TTOP: TTOP, TBOT: TBOT,
               CUT: FMOUTH - 6,                 /* the cut end of the stem: where bubbles are born */
               GATHER: TTOP + 15 };             /* just inside the tube's closed end: collected */
    })();
    function trueD() { return S.d; }
    function reading() { return S.measureTo === 'beaker' ? S.d - BEAKER_OFFSET_CM : S.d; }
    function I(d) { return Math.pow(10 / d, 2); }
    function fI(i) { return i / (i + 0.55); }
    function fC(c) { return c / (c + 1.1); }
    function fT(t) { return t <= 32 ? Math.max(0.04, t / 32) : Math.max(0, 1 - (t - 32) / 12); }
    /* the lamp's heat reaches the beaker only when nothing is in the way */
    function heatGain() { return S.shield ? 0 : Math.min(13, 13 * I(trueD()) / 1.05); }
    function waterTemp() { return S.bath + heatGain(); }
    var MAXB = 58;
    function realRate(st) {                       /* oxygen actually made, bubbles a minute */
      st = st || S;
      /* the light that reaches the PLANT, not the light the reading implies */
      var dd = st.d;                              /* the light travels to the plant, always */
      var temp = st.shield ? st.bath : st.bath + Math.min(13, 13 * I(dd) / 1.05);
      return Math.min(fI(I(dd)), fC(st.hco3), fT(temp)) * MAXB;
    }
    /* bubbles that are NOT oxygen: dissolved gas leaving warm water, and gas off the leaf */
    function falseRate() {
      var t = waterTemp();
      return t <= 28 ? 0 : Math.min(16, (t - 28) * 1.7);
    }
    function settleFrac() { return Math.min(1, (Date.now() - S.changedAt) / S.settleMs); }

    function touched() {                          /* any change unsettles the plant */
      if (!S.running) { S.prev = S.prev || { d: S.d, hco3: S.hco3, bath: S.bath, shield: S.shield }; S.changedAt = Date.now(); }
    }

    /* ---- controls ---- */
    var ctl = h('div', 'pw__ctl');
    var C = [
      { k: 'd', label: 'Lamp distance', min: 18, max: 50, step: 2, unit: ' cm' },
      { k: 'hco3', label: 'Sodium hydrogencarbonate', min: 0, max: 5, step: 0.5, unit: ' %' },
      { k: 'bath', label: 'Water bath set to', min: 5, max: 40, step: 1, unit: ' °C' }
    ];
    var rows = {};
    C.forEach(function (c) {
      var r = h('label', 'pw__row');
      r.innerHTML = '<span class="pw__lab">' + esc(c.label) + '<b></b></span>';
      var inp = document.createElement('input');
      inp.type = 'range'; inp.min = c.min; inp.max = c.max; inp.step = c.step; inp.value = S[c.k];
      inp.setAttribute('aria-label', c.label);
      inp.addEventListener('input', function () { if (S.running) return; var was = realRate(); S[c.k] = +inp.value; S.prev = { r: was }; S.changedAt = Date.now(); paint(); });
      r.appendChild(inp);
      ctl.appendChild(r);
      rows[c.k] = { inp: inp, val: r.querySelector('b') };
    });
    var measRow = h('div', 'pw__row pw__row--pick');
    measRow.innerHTML = '<span class="pw__lab">Measure the distance to</span>';
    var measBtns = {};
    [['beaker', 'the front of the beaker'], ['weed', 'the pondweed']].forEach(function (m) {
      var b = h('button', 'pw__pick', m[1]); b.type = 'button';
      b.addEventListener('click', function () { if (S.running) return; var was = realRate(); S.measureTo = m[0]; S.prev = { r: was }; S.changedAt = Date.now(); paint(); });
      measBtns[m[0]] = b; measRow.appendChild(b);
    });
    ctl.appendChild(measRow);

    var shieldRow = h('label', 'pw__row pw__row--check');
    var chk = document.createElement('input'); chk.type = 'checkbox';
    chk.addEventListener('change', function () { if (S.running) { chk.checked = S.shield; return; } var was = realRate(); S.shield = chk.checked; S.prev = { r: was }; S.changedAt = Date.now(); paint(); });
    shieldRow.appendChild(chk);
    shieldRow.appendChild(h('span', 'pw__lab', 'Heat shield — a tank of water between the lamp and the beaker'));
    ctl.appendChild(shieldRow);
    box.appendChild(ctl);

    var stage = h('div', 'pw__stage');
    box.appendChild(stage);

    var live = h('div', 'pw__live');
    box.appendChild(live);

    var finds = h('div', 'pw__finds');
    box.appendChild(finds);

    var btns = h('div', 'pw__btns');
    var bRun = h('button', 'wbtn', 'Count for one minute'); bRun.type = 'button';
    var bKeep = h('button', 'wbtn wbtn--quiet', 'Record this run'); bKeep.type = 'button'; bKeep.disabled = true;
    var bClear = h('button', 'wbtn wbtn--quiet', 'Clear'); bClear.type = 'button';
    btns.appendChild(bRun); btns.appendChild(bKeep); btns.appendChild(bClear);
    box.appendChild(btns);

    var table = h('div', 'pw__table');
    box.appendChild(table);

    /* ---- a finding: one line, and the reason behind a press. Shown once each. ---- */
    var FIND = {
      settle: ['You started counting before the plant had settled.',
        'After any change the rate takes several minutes to reach its new steady value. Count straight away and part of what you measure still belongs to the old conditions. In the lab you wait — and you wait the SAME time after every change, or the wait becomes a variable of its own.'],
      heat: ['The water is warmer than you set it.',
        'The lamp is heating the beaker. Move it closer and you raise the light AND the temperature together, so neither result tells you what the light did. Put a tank of water between the lamp and the beaker: it lets the light through and absorbs the heat.'],
      fake: ['Some of what you counted was not oxygen.',
        'Warm water holds less dissolved gas, so bubbles come out of solution and off the leaf surface. They look exactly like the oxygen ones and they inflate the count. With the heat shield in place the water stays at the bath temperature and they stop.'],
      size: ['Two runs at the same settings, two different numbers.',
        'Bubbles are not all the same size, so counting them measures volume only roughly. Repeats and a mean are the least you can do; collecting the gas and measuring its VOLUME in a syringe or a capillary is the better method, and worth saying so in an evaluation question.'],
      ruler: ['Your light values do not fit the counts you are getting.',
        'You measured to the front of the beaker. The light has to reach the <b>pondweed</b>, 8.5 cm further back, so every reading is short by the same 8.5 cm and every light value you calculate is too high. Notice what did NOT change when you moved the ruler: the lamp, and the number of bubbles. The plant does not care where you hold your ruler — only your data does. Being wrong by the same amount every time is a <b>systematic error</b>: unlike the scatter between repeats, taking a mean does not remove it, and no number of repeats will. Measure to the plant.'],
      dark: ['Almost nothing, even with the lamp right there.',
        'Check the other two before blaming the plant. Carbon dioxide is the raw material — without hydrogencarbonate there is little of it in the water — and below about 10 °C the enzymes are too slow. A control variable set wrong looks exactly like a dead plant.']
    };
    function found(k) {
      if (S.found[k]) return;
      S.found[k] = 1;
      var f = FIND[k], el0 = h('div', 'pw__find');
      el0.innerHTML = '<span class="pw__findq">!</span><b>' + esc(f[0]) + '</b> <button type="button" class="pw__why">Why?</button>';
      el0.querySelector('.pw__why').addEventListener('click', function () {
        el0.innerHTML = '<span class="pw__findq">!</span><b>' + esc(f[0]) + '</b> <span class="pw__findw">' + f[1] + '</span>';
      });
      finds.appendChild(el0);
    }

    /* ---- the apparatus ----
       Drawn to ONE scale, which is what was wrong before: a bench lamp is roughly two and a half
       times the height of a 1 dm³ beaker, a boiling tube is about a sixth of the beaker's width,
       and a filter funnel is about two thirds of it. Everything here is set from those ratios,
       so nothing towers over or shrinks against anything else.

       Three things that must be physically true and were not: the water bath SITS ON the bench;
       the funnel's mouth rests on the floor of the beaker with no gap and no platform under it;
       and the funnel covers the whole sprig, so every bubble it releases is caught. */
    function paintStage() {
      var W = G.W, H = G.H, BENCH = G.BENCH;
      var BW = G.BW, BH = G.BH, BX = G.BX, BBOT = G.BBOT, BTOP = G.BTOP, WTOP = G.WTOP, FX = G.FX;
      var BATH_W = 190, BATH_H = 36, BATH_X = FX - BATH_W / 2, BATH_BOT = BENCH, BATH_TOP = BENCH - BATH_H;
      /* the ruler runs from the lamp to whichever point is measured to, at 8 px to the cm, so
         its drawn length always IS the reading — and the lamp does not move when the ruler does */
      var rulerEnd = S.measureTo === 'beaker' ? BX : FX;
      var lampX = FX - S.d * PX_PER_CM;
      var temp = waterTemp(), hot = temp > S.bath + 1.5;
      var LBL = 650;
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Labelled apparatus: a sprig of pondweed under an inverted funnel in a large beaker of water standing in a water bath, an inverted boiling tube over the funnel stem collecting oxygen, a thermometer in the beaker, and a bench lamp ' + S.d + ' centimetres away' + (S.shield ? ' with a tank of water between them as a heat shield' : '') + '">';

      s += '<defs>' +
        '<linearGradient id="pwGlass" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".14" stop-color="#fff" stop-opacity=".05"/>' +
          '<stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".24"/></linearGradient>' +
        '<linearGradient id="pwWater" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + (hot ? '#CBE0EA' : '#CFE7F5') + '"/>' +
          '<stop offset="1" stop-color="' + (hot ? '#8FB6C4' : '#8CBFDC') + '"/></linearGradient>' +
        '<linearGradient id="pwBath" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#DCEAF2"/><stop offset="1" stop-color="#BCD6E4"/></linearGradient>' +
        '<radialGradient id="pwGlow" cx=".5" cy=".5" r=".5">' +
          '<stop offset="0" stop-color="#FFE6A0" stop-opacity=".9"/><stop offset="1" stop-color="#FFE08A" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="pwBeam" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#FFE08A" stop-opacity=".45"/><stop offset="1" stop-color="#FFE08A" stop-opacity="0"/></linearGradient>' +
        '<linearGradient id="pwShade" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#E6E3D8"/><stop offset="1" stop-color="#AFAB9D"/></linearGradient>' +
        '<filter id="pwSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>' +
      '</defs>';

      s += '<rect x="0" y="' + BENCH + '" width="' + W + '" height="' + (H - BENCH) + '" fill="#E9E5DA"/>';
      s += '<line x1="0" y1="' + BENCH + '" x2="' + W + '" y2="' + BENCH + '" stroke="#C7C2B4" stroke-width="1.4"/>';

      var glow = Math.min(1, fI(I(S.d)) + 0.12);
      var beamEnd = S.shield ? lampX + 116 : BX;
      s += '<path d="M' + (lampX + 12) + ' 128 L' + beamEnd + ' ' + (BTOP + 6) + ' L' + beamEnd + ' ' + (BBOT - 8) + ' L' + (lampX + 12) + ' 188 Z" fill="url(#pwBeam)" opacity="' + (glow * 0.5).toFixed(2) + '"/>';

      /* the water bath, standing ON the bench */
      s += '<ellipse cx="' + FX + '" cy="' + (BENCH - 1) + '" rx="' + (BATH_W / 2 + 12) + '" ry="6" fill="#000" opacity=".09" filter="url(#pwSoft)"/>';
      s += '<path d="M' + BATH_X + ' ' + BATH_TOP + ' L' + BATH_X + ' ' + (BATH_BOT - 8) + ' Q' + BATH_X + ' ' + BATH_BOT + ' ' + (BATH_X + 10) + ' ' + BATH_BOT +
           ' L' + (BATH_X + BATH_W - 10) + ' ' + BATH_BOT + ' Q' + (BATH_X + BATH_W) + ' ' + BATH_BOT + ' ' + (BATH_X + BATH_W) + ' ' + (BATH_BOT - 8) +
           ' L' + (BATH_X + BATH_W) + ' ' + BATH_TOP + '" fill="url(#pwBath)" stroke="#89A9BA" stroke-width="2"/>';

      /* the beaker, standing in it */
      var beaker = 'M' + BX + ' ' + BTOP + ' L' + BX + ' ' + (BBOT - 12) + ' Q' + BX + ' ' + BBOT + ' ' + (BX + 13) + ' ' + BBOT +
                   ' L' + (BX + BW - 13) + ' ' + BBOT + ' Q' + (BX + BW) + ' ' + BBOT + ' ' + (BX + BW) + ' ' + (BBOT - 12) + ' L' + (BX + BW) + ' ' + BTOP;
      s += '<path d="' + beaker + '" fill="#F7FBFD" stroke="#7BA0B3" stroke-width="2.4" stroke-linejoin="round"/>';
      s += '<path d="M' + (BX + 2) + ' ' + WTOP + ' Q' + (BX + 11) + ' ' + (WTOP - 4.5) + ' ' + (BX + 22) + ' ' + (WTOP + 1) +
           ' L' + (BX + BW - 22) + ' ' + (WTOP + 1) + ' Q' + (BX + BW - 11) + ' ' + (WTOP - 4.5) + ' ' + (BX + BW - 2) + ' ' + WTOP +
           ' L' + (BX + BW - 2) + ' ' + (BBOT - 14) + ' Q' + (BX + BW - 2) + ' ' + (BBOT - 3) + ' ' + (BX + BW - 15) + ' ' + (BBOT - 3) +
           ' L' + (BX + 15) + ' ' + (BBOT - 3) + ' Q' + (BX + 2) + ' ' + (BBOT - 3) + ' ' + (BX + 2) + ' ' + (BBOT - 14) + ' Z" fill="url(#pwWater)"/>';
      [0.3, 0.52, 0.74].forEach(function (g) {
        var gy = WTOP + (BBOT - WTOP) * g;
        s += '<line x1="' + (BX + 8) + '" y1="' + gy.toFixed(0) + '" x2="' + (BX + 24) + '" y2="' + gy.toFixed(0) + '" stroke="#7BA0B3" stroke-width="1.1" opacity=".45"/>';
      });

      /* ---- the funnel: mouth flat on the floor of the beaker, no feet, no gap ---- */
      var FMOUTH = BBOT - 5, FRIM = 46, FNECK = 7, FSHOULDER = FMOUTH - 62, FSTEM_TOP = FSHOULDER - 46;
      s += '<path d="M' + (FX - FRIM) + ' ' + FMOUTH + ' L' + (FX - FNECK) + ' ' + FSHOULDER + ' L' + (FX + FNECK) + ' ' + FSHOULDER + ' L' + (FX + FRIM) + ' ' + FMOUTH + '" fill="#EAF5FA" fill-opacity=".28" stroke="#6E97AC" stroke-width="1.8" stroke-linejoin="round"/>';
      s += '<path d="M' + (FX - FRIM) + ' ' + FMOUTH + ' L' + (FX + FRIM) + ' ' + FMOUTH + '" stroke="#6E97AC" stroke-width="2.2" stroke-linecap="round"/>';
      s += '<rect x="' + (FX - FNECK) + '" y="' + FSTEM_TOP + '" width="' + (FNECK * 2) + '" height="' + (FSHOULDER - FSTEM_TOP) + '" fill="#EAF5FA" fill-opacity=".28" stroke="#6E97AC" stroke-width="1.8"/>';

      /* ---- the pondweed, wholly beneath the funnel ---- */
      var wb = G.CUT, wt = FSHOULDER + 8;
      s += '<path d="M' + (FX - 1) + ' ' + wb + ' C' + (FX - 10) + ' ' + (wb - 12) + ' ' + (FX + 7) + ' ' + (wb - 22) + ' ' + (FX - 2) + ' ' + (wb - 32) +
           ' C' + (FX - 9) + ' ' + (wb - 40) + ' ' + (FX + 4) + ' ' + (wb - 44) + ' ' + (FX - 1) + ' ' + wt + '" fill="none" stroke="#33804A" stroke-width="2.6" stroke-linecap="round"/>';
      for (var nI = 0; nI < 6; nI++) {
        var ny = wb - 5 - nI * ((wb - wt) / 6.5), nx = FX + (nI % 2 ? 3 : -4);
        [-1, 1].forEach(function (dir) {
          var L = 7.5, ex = nx + dir * L * 0.75, ey = ny - 1.2;
          s += '<ellipse cx="' + ex.toFixed(1) + '" cy="' + ey.toFixed(1) + '" rx="' + L + '" ry="2.3" fill="' + (nI % 2 ? '#4C9A55' : '#59A962') + '" transform="rotate(' + (dir * 24) + ' ' + ex.toFixed(1) + ' ' + ey.toFixed(1) + ')"/>';
        });
      }
      s += '<line x1="' + (FX - 1) + '" y1="' + wb + '" x2="' + (FX - 1) + '" y2="' + (wb + 5) + '" stroke="#7E5A2A" stroke-width="2.6" stroke-linecap="round"/>';

      S.bubbles.forEach(function (b) {
        s += '<circle cx="' + b.x.toFixed(1) + '" cy="' + b.y.toFixed(1) + '" r="' + b.r.toFixed(1) + '" fill="' + (b.fake ? '#FBEEDF' : '#EFFAFF') + '" fill-opacity=".92" stroke="' + (b.fake ? '#D5A36F' : '#68A3C2') + '" stroke-width=".9"/>';
        s += '<circle cx="' + (b.x - b.r * 0.32).toFixed(1) + '" cy="' + (b.y - b.r * 0.34).toFixed(1) + '" r="' + (b.r * 0.27).toFixed(1) + '" fill="#fff"/>';
      });

      /* ---- the boiling tube: narrow, inverted, mouth over the funnel stem ---- */
      var TW = G.TW, TX = G.TX, TTOP = G.TTOP, TBOT = G.TBOT;
      s += '<path d="M' + TX + ' ' + TBOT + ' L' + TX + ' ' + (TTOP + 10) + ' Q' + TX + ' ' + TTOP + ' ' + (TX + TW / 2) + ' ' + TTOP +
           ' Q' + (TX + TW) + ' ' + TTOP + ' ' + (TX + TW) + ' ' + (TTOP + 10) + ' L' + (TX + TW) + ' ' + TBOT + '" fill="#E8F5FB" fill-opacity=".6" stroke="#6E97AC" stroke-width="1.8"/>';
      var gasH = Math.min(TBOT - TTOP - 16, S.gas * 0.8);
      if (gasH > 0) {
        s += '<path d="M' + (TX + 1.8) + ' ' + (TTOP + 11 + gasH).toFixed(1) + ' L' + (TX + 1.8) + ' ' + (TTOP + 10) + ' Q' + (TX + 1.8) + ' ' + (TTOP + 1.8) + ' ' + (TX + TW / 2) + ' ' + (TTOP + 1.8) +
             ' Q' + (TX + TW - 1.8) + ' ' + (TTOP + 1.8) + ' ' + (TX + TW - 1.8) + ' ' + (TTOP + 10) + ' L' + (TX + TW - 1.8) + ' ' + (TTOP + 11 + gasH).toFixed(1) + ' Z" fill="#FCFEFF"/>';
        s += '<line x1="' + (TX + 1.8) + '" y1="' + (TTOP + 11 + gasH).toFixed(1) + '" x2="' + (TX + TW - 1.8) + '" y2="' + (TTOP + 11 + gasH).toFixed(1) + '" stroke="#6E97AC" stroke-width="1.1"/>';
      }
      for (var v = 0; v < 5; v++) {
        var vy = TTOP + 16 + v * 11;
        if (vy < TBOT - 6) s += '<line x1="' + (TX + TW - 7) + '" y1="' + vy + '" x2="' + (TX + TW - 1.8) + '" y2="' + vy + '" stroke="#6E97AC" stroke-width=".85" opacity=".75"/>';
      }
      s += '<path d="M' + (TX - 2.5) + ' ' + TBOT + ' L' + (TX + TW + 2.5) + ' ' + TBOT + '" stroke="#6E97AC" stroke-width="2.2" stroke-linecap="round"/>';
      s += '<path d="M' + (TX + 5.5) + ' ' + (TTOP + 16) + ' L' + (TX + 5.5) + ' ' + (TBOT - 10) + '" stroke="#fff" stroke-width="2.2" opacity=".6" stroke-linecap="round"/>';

      /* the thermometer, clear of the bath and wholly visible */
      var THX = BX + BW - 24;
      s += '<rect x="' + (THX - 3.2) + '" y="' + (BTOP - 26) + '" width="6.4" height="' + (BBOT - 16 - (BTOP - 26)) + '" rx="3.2" fill="#FBFDFE" stroke="#7E9EAF" stroke-width="1.3"/>';
      for (var tk = 0; tk < 6; tk++) s += '<line x1="' + (THX + 3.2) + '" y1="' + (BTOP - 8 + tk * 17) + '" x2="' + (THX + 7.6) + '" y2="' + (BTOP - 8 + tk * 17) + '" stroke="#7E9EAF" stroke-width=".9"/>';
      var mercMax = BBOT - 26 - (BTOP - 20);
      var merc = Math.max(4, Math.min(mercMax, (temp - 2) / 48 * mercMax));
      s += '<rect x="' + (THX - 1.4) + '" y="' + (BBOT - 22 - merc).toFixed(1) + '" width="2.8" height="' + merc.toFixed(1) + '" fill="' + (hot ? '#C4552F' : '#D2492A') + '"/>';
      s += '<circle cx="' + THX + '" cy="' + (BBOT - 18) + '" r="5.4" fill="' + (hot ? '#C4552F' : '#D2492A') + '"/>';

      s += '<path d="' + beaker + '" fill="url(#pwGlass)" stroke="none"/>';
      s += '<path d="M' + (BX - 5) + ' ' + BTOP + ' L' + (BX + BW + 5) + ' ' + BTOP + '" stroke="#7BA0B3" stroke-width="3" stroke-linecap="round"/>';
      s += '<path d="M' + (BX + 16) + ' ' + (BTOP + 14) + ' L' + (BX + 16) + ' ' + (BBOT - 34) + '" stroke="#fff" stroke-width="3.2" opacity=".6" stroke-linecap="round"/>';

      /* the bath's front wall, over the beaker's foot */
      s += '<path d="M' + BATH_X + ' ' + (BATH_TOP + 12) + ' L' + BATH_X + ' ' + (BATH_BOT - 8) + ' Q' + BATH_X + ' ' + BATH_BOT + ' ' + (BATH_X + 10) + ' ' + BATH_BOT +
           ' L' + (BATH_X + BATH_W - 10) + ' ' + BATH_BOT + ' Q' + (BATH_X + BATH_W) + ' ' + BATH_BOT + ' ' + (BATH_X + BATH_W) + ' ' + (BATH_BOT - 8) +
           ' L' + (BATH_X + BATH_W) + ' ' + (BATH_TOP + 12) + ' Z" fill="#CFE2EC" fill-opacity=".6" stroke="#89A9BA" stroke-width="2"/>';
      s += '<path d="M' + (BATH_X + 2) + ' ' + (BATH_TOP + 12) + ' Q' + (BATH_X + 28) + ' ' + (BATH_TOP + 7) + ' ' + (BATH_X + 56) + ' ' + (BATH_TOP + 12) + ' T' + (BATH_X + 112) + ' ' + (BATH_TOP + 12) + ' T' + (BATH_X + 168) + ' ' + (BATH_TOP + 12) + ' L' + (BATH_X + BATH_W - 2) + ' ' + (BATH_TOP + 12) + '" fill="none" stroke="#8FB7CB" stroke-width="1.3" opacity=".8"/>';
      s += '<path d="M' + (BATH_X - 3) + ' ' + BATH_TOP + ' L' + (BATH_X + BATH_W + 3) + ' ' + BATH_TOP + '" stroke="#89A9BA" stroke-width="2.6" stroke-linecap="round"/>';

      /* ---- the heat shield ---- */
      if (S.shield) {
        /* a tank of water standing between the lamp and the beaker, so it travels with the lamp */
        var SHX = Math.min(lampX + 104, BX - 40);
        s += '<ellipse cx="' + SHX + '" cy="' + (BENCH - 1) + '" rx="28" ry="5" fill="#000" opacity=".09" filter="url(#pwSoft)"/>';
        s += '<path d="M' + (SHX - 18) + ' 176 L' + (SHX - 18) + ' ' + (BENCH - 4) + ' Q' + (SHX - 18) + ' ' + BENCH + ' ' + (SHX - 13) + ' ' + BENCH +
             ' L' + (SHX + 13) + ' ' + BENCH + ' Q' + (SHX + 18) + ' ' + BENCH + ' ' + (SHX + 18) + ' ' + (BENCH - 4) + ' L' + (SHX + 18) + ' 176" fill="url(#pwBath)" fill-opacity=".92" stroke="#7BA0B3" stroke-width="2"/>';
        s += '<path d="M' + (SHX - 16) + ' 192 Q' + (SHX - 8) + ' 188 ' + SHX + ' 192 Q' + (SHX + 8) + ' 196 ' + (SHX + 16) + ' 192 L' + (SHX + 16) + ' ' + (BENCH - 6) + ' L' + (SHX - 16) + ' ' + (BENCH - 6) + ' Z" fill="#CFE6F3" opacity=".8"/>';
        s += '<path d="M' + (SHX - 21) + ' 176 L' + (SHX + 21) + ' 176" stroke="#7BA0B3" stroke-width="2.6" stroke-linecap="round"/>';
        s += '<path d="M' + (SHX + 11) + ' 188 L' + (SHX + 11) + ' ' + (BENCH - 14) + '" stroke="#fff" stroke-width="2.6" opacity=".6" stroke-linecap="round"/>';
        s += '<text x="' + SHX + '" y="168" font-size="10" font-weight="600" fill="#2A2A26" text-anchor="middle">heat shield</text>';
      }

      /* ---- the bench lamp: about two and a half beakers tall, as it is on a bench ---- */
      var SHADE_BOT = 150, SHADE_TOP = 74, SHW = 46;
      s += '<ellipse cx="' + lampX + '" cy="' + (BENCH - 1) + '" rx="36" ry="6" fill="#000" opacity=".11" filter="url(#pwSoft)"/>';
      s += '<path d="M' + (lampX - 34) + ' ' + (BENCH - 2) + ' q34 -11 68 0 z" fill="#8C8A80"/>';
      s += '<rect x="' + (lampX - 34) + '" y="' + (BENCH - 13) + '" width="68" height="11" rx="5.5" fill="#AAA89D" stroke="#7C7A70" stroke-width="1.3"/>';
      s += '<rect x="' + (lampX - 3.5) + '" y="' + SHADE_BOT + '" width="7" height="' + (BENCH - 13 - SHADE_BOT) + '" rx="3.5" fill="#AAA89D" stroke="#7C7A70" stroke-width="1.1"/>';
      s += '<path d="M' + (lampX - SHW) + ' ' + SHADE_BOT + ' L' + (lampX + SHW) + ' ' + SHADE_BOT + ' L' + (lampX + SHW * 0.5) + ' ' + SHADE_TOP + ' L' + (lampX - SHW * 0.5) + ' ' + SHADE_TOP + ' Z" fill="url(#pwShade)" stroke="#6F6D64" stroke-width="1.9" stroke-linejoin="round"/>';
      s += '<path d="M' + (lampX - SHW + 2) + ' ' + (SHADE_BOT - 1) + ' L' + (lampX + SHW - 2) + ' ' + (SHADE_BOT - 1) + '" stroke="#6F6D64" stroke-width="1.6"/>';
      s += '<circle cx="' + lampX + '" cy="' + (SHADE_BOT - 8) + '" r="10" fill="#FFF6D8" stroke="#D9B860" stroke-width="1.3"/>';
      s += '<path d="M' + (lampX - 4) + ' ' + (SHADE_BOT - 5) + ' l4 -7 l4 7" fill="none" stroke="#C99A2E" stroke-width="1.2"/>';
      s += '<circle cx="' + lampX + '" cy="' + (SHADE_BOT - 8) + '" r="32" fill="url(#pwGlow)" opacity="' + (glow * 0.7).toFixed(2) + '"/>';
      s += '<text x="' + lampX + '" y="' + (SHADE_TOP - 10) + '" font-size="11.5" font-weight="600" fill="#2A2A26" text-anchor="middle">lamp</text>';

      /* ---- the ruler ---- */
      var RY = BENCH + 8, rw = rulerEnd - lampX;
      s += '<rect x="' + lampX + '" y="' + RY + '" width="' + rw + '" height="13" rx="2" fill="#F7E9C0" stroke="#C7A64B" stroke-width="1.2"/>';
      for (var t2 = 0; t2 <= rw; t2 += 10) s += '<line x1="' + (lampX + t2) + '" y1="' + RY + '" x2="' + (lampX + t2) + '" y2="' + (RY + (t2 % 50 === 0 ? 9 : 5)) + '" stroke="#AC8D3A" stroke-width="1"/>';
      s += '<text x="' + ((lampX + rulerEnd) / 2) + '" y="' + (RY - 4) + '" font-size="11.5" font-weight="700" fill="#3C3C3C" text-anchor="middle">' + reading().toFixed(1) + ' cm</text>';
      s += '<line x1="' + rulerEnd + '" y1="' + (RY - 2) + '" x2="' + rulerEnd + '" y2="' + (BENCH - 6) + '" stroke="#AC8D3A" stroke-width="1" stroke-dasharray="2 3"/>';

      /* ---- the labels ---- */
      var LAB = [
        { y: 150, to: [TX + TW, TTOP + 12],             t: 'boiling tube', sub: 'inverted — read the volume' },
        { y: 192, to: [THX + 7.6, BTOP + 46],           t: 'thermometer', sub: 'the water’s true temperature' },
        { y: 234, to: [FX + FNECK + 2, FSHOULDER + 4],  t: 'inverted funnel', sub: 'covers the whole sprig' },
        { y: 276, to: [FX + 20, FMOUTH - 30],           t: 'pondweed', sub: 'cut end down' },
        { y: 318, to: [BATH_X + BATH_W, BATH_TOP + 14], t: 'water bath', sub: 'holds temperature steady' }
      ];
      LAB.forEach(function (L) {
        s += '<path d="M' + L.to[0] + ' ' + L.to[1] + ' L' + (LBL - 14) + ' ' + L.y + ' L' + (LBL - 5) + ' ' + L.y + '" fill="none" stroke="#8A8A82" stroke-width="1"/>';
        s += '<circle cx="' + L.to[0] + '" cy="' + L.to[1] + '" r="2.2" fill="#8A8A82"/>';
        s += '<text x="' + LBL + '" y="' + (L.y + 3) + '" font-size="11.5" font-weight="600" fill="#2A2A26">' + esc(L.t) + '</text>';
        s += '<text x="' + LBL + '" y="' + (L.y + 16) + '" font-size="10" fill="#6B6B63">' + esc(L.sub) + '</text>';
      });
      s += '</svg>';
      stage.innerHTML = s;
    }

    function paint() {
      C.forEach(function (c) { rows[c.k].val.textContent = (c.k === 'd' ? reading().toFixed(1) : S[c.k]) + c.unit; rows[c.k].inp.disabled = S.running; });
      chk.disabled = S.running; chk.checked = S.shield;
      ['beaker', 'weed'].forEach(function (k) { measBtns[k].classList.toggle('is-on', S.measureTo === k); measBtns[k].disabled = S.running; });
      paintStage();
      var sf = settleFrac(), temp = waterTemp();
      live.innerHTML =
        '<span class="pw__settle' + (sf < 1 ? ' is-wait' : '') + '">' +
          (sf < 1 ? 'Settling — ' + Math.round(sf * 100) + '%' : 'Settled, ready to count') +
          '<i style="width:' + (sf * 100).toFixed(0) + '%"></i></span>' +
        '<span class="pw__clock">' + (S.running ? S.t + ' s' : (S.t ? 'finished' : 'not started')) + '</span>' +
        '<b>' + S.n + ' bubbles</b>' +
        '<span class="pw__int">light from your reading <b>' + I(reading()).toFixed(2) + '</b> units · water <b class="' + (temp > S.bath + 1.5 ? 'is-hot' : '') + '">' + temp.toFixed(0) + ' °C</b></span>';
      bKeep.disabled = S.running || !S.t;
      bRun.disabled = S.running;
    }

    /* ---- the run ---- */
    var timer = null, RUN_MS = 3000;
    bRun.addEventListener('click', function () {
      if (S.running) return;
      var sfAtStart = settleFrac();
      S.running = true; S.t = 0; S.n = 0; S.gas = 0; S.bubbles = []; paint();
      /* counting before it has settled measures partly the conditions you have just left */
      var blend = sfAtStart < 1 && S.prev && typeof S.prev.r === 'number'
        ? S.prev.r + (realRate() - S.prev.r) * sfAtStart : realRate();
      var err = 1 + (Math.random() - 0.5) * 0.18;
      var oxy = Math.max(0, blend * err);
      var fake = falseRate() * (0.8 + Math.random() * 0.4);
      var target = Math.round(oxy + fake);
      var fakeShare = target > 0 ? fake / (oxy + fake) : 0;
      var t0 = Date.now(), spawned = 0;
      timer = setInterval(function () {
        var frac = Math.min(1, (Date.now() - t0) / RUN_MS);
        S.t = Math.round(frac * 60);
        S.n = Math.round(target * frac);
        /* A STEADY STREAM, not a clump. Spawning one bubble per counted bubble each tick put
           eight or ten at the stem in the same frame, which looked like a blob rather than a
           plant. One bubble every RUN_MS/target milliseconds gives the even procession a real
           piece of pondweed produces, and each is born at its own moment so they stay spaced. */
        var now = Date.now();
        var gap = target > 0 ? RUN_MS / target : 1e9;
        while (spawned < S.n && now - t0 >= (spawned + 1) * gap && S.bubbles.length < 30) {
          spawned++;
          S.bubbles.push({ x: G.FX + (Math.random() * 8 - 4), y: G.CUT, r: 2.1 + Math.random() * 1.7,
                           v: 46 + Math.random() * 14, fake: Math.random() < fakeShare,
                           born: t0 + spawned * gap });
        }
        S.bubbles = S.bubbles.filter(function (b) {
          b.y = G.CUT - (now - b.born) / 1000 * b.v;
          if (b.y < G.FSHOULDER) { b.x += (G.FX - b.x) * 0.22; }  /* funnelled into the neck */
          if (b.y < G.GATHER) { S.gas += 1; return false; }        /* collected in the tube */
          return true;
        });
        if (frac >= 1) { clearInterval(timer); timer = null; S.t = 60; S.n = target; S.running = false; paint(); finish(sfAtStart, fake, target); return; }
        paint();
      }, 40);
    });

    function finish(sfAtStart, fake, target) {
      if (sfAtStart < 0.92) found('settle');
      if (heatGain() > 1.5) found('heat');
      if (fake >= 2.5) found('fake');
      if (S.measureTo === 'beaker') found('ruler');
      if (target <= 3 && I(trueD()) > 0.5) found('dark');
      var same = S.rows.filter(function (r) { return r.d === S.d && r.hco3 === S.hco3 && r.bath === S.bath && r.shield === S.shield; });
      if (same.length && Math.abs(same[same.length - 1].n - target) >= 3) found('size');
    }

    bKeep.addEventListener('click', function () {
      S.rows.push({ d: +reading().toFixed(1), i: I(reading()), hco3: S.hco3, bath: S.bath, shield: S.shield, temp: waterTemp(), n: S.n, meas: S.measureTo });
      paintTable();
    });
    bClear.addEventListener('click', function () { S.rows = []; paintTable(); });

    function paintTable() {
      if (!S.rows.length) { table.innerHTML = ''; return; }
      var by = {};
      S.rows.forEach(function (r) { var k = [r.d, r.hco3, r.bath, r.shield, r.meas].join('|'); (by[k] = by[k] || []).push(r); });
      var body = Object.keys(by).map(function (k) {
        var g = by[k], r0 = g[0];
        var mean = g.reduce(function (a, x) { return a + x.n; }, 0) / g.length;
        var drift = r0.temp - r0.bath;
        return '<tr><td>' + r0.d + '</td><td>' + r0.i.toFixed(2) + '</td><td>' + r0.hco3 + '</td>' +
               '<td>' + r0.bath + (drift > 1.5 ? ' <span class="pw__warn" title="the lamp warmed the water: two variables changed at once">→ ' + r0.temp.toFixed(0) + '</span>' : '') + '</td>' +
               '<td>' + (r0.shield ? 'yes' : '<span class="pw__warn">no</span>') + '</td>' +
               '<td>' + (r0.meas === 'weed' ? 'plant' : '<span class="pw__warn">glass</span>') + '</td>' +
               '<td>' + g.map(function (x) { return x.n; }).join(', ') + '</td><td><b>' + mean.toFixed(1) + '</b></td></tr>';
      }).join('');
      table.innerHTML = '<table class="ctable"><thead><tr><th>Lamp / cm</th><th>Light / units</th><th>NaHCO₃ / %</th>' +
        '<th>Water / °C</th><th>Shield</th><th>Measured to</th><th>Counts</th><th>Mean</th></tr></thead><tbody>' + body + '</tbody></table>' +
        '<p class="pw__hint">A row is only comparable with another if everything except the one variable is the same — including the column you were not watching.</p>';
    }

    paint(); paintTable();
    var tick = setInterval(function () { if (!S.running && settleFrac() < 1) paint(); }, 220);
    box.__onReset = function () { if (timer) clearInterval(timer); clearInterval(tick); };
    return box;
  }


  /* ---------- watch: an embedded YouTube film ----------
     These films are not ours, so they are not copied into the repository — they play from
     YouTube, in the page, like any other video on the station.

     Two details that are deliberate. The player is not loaded until somebody presses play: what
     sits on the page is the film's own still with a play button over it, and the iframe is built
     on the click. So a station with three films on it still loads three images rather than three
     copies of YouTube's player, and a reader who never presses play is never handed to Google.
     And when it does load it loads from youtube-nocookie.com, which is YouTube's own no-tracking
     host — same film, no cookie until they choose to watch. */
  function watch(spec) {
    var id = spec.id || (String(spec.url || '').match(/[?&]v=([A-Za-z0-9_-]+)/) || [])[1] || '';
    var f = h('figure', 'ytv');
    var frame = h('div', 'ytv__frame');

    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'ytv__poster';
    btn.setAttribute('aria-label', 'Play: ' + (spec.title || 'video') + ' (on YouTube)');
    var still = new Image();
    still.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    still.alt = ''; still.loading = 'lazy'; still.className = 'ytv__still';
    still.addEventListener('error', function () { btn.classList.add('is-bare'); });
    btn.appendChild(still);
    btn.appendChild(h('span', 'ytv__btn', '▶'));
    btn.appendChild(h('span', 'ytv__over', esc(spec.title || '')));
    btn.addEventListener('click', function () {
      var ifr = document.createElement('iframe');
      ifr.className = 'ytv__ifr';
      ifr.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      ifr.title = spec.title || 'Video';
      ifr.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
      ifr.setAttribute('allowfullscreen', '');
      ifr.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      frame.innerHTML = ''; frame.appendChild(ifr);
    });
    frame.appendChild(btn);
    f.appendChild(frame);

    f.appendChild(h('figcaption', 'media__cap',
      '<span class="kindtag">' + esc(spec.kind || 'Video') + '</span> ' + mk(spec.text || '') +
      ' <a class="media__credit" href="' + esc(spec.url) + '" target="_blank" rel="noopener">' +
      esc(spec.by || '') + ', on YouTube</a>'));
    return f;
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

  /* ---------- indicator: two tubes, and whether the pair is a fair test ----------
     Four tubes that each had their own settings was incoherent — nothing stopped a reader making
     all four identical, and then there was nothing to compare. Two tubes, set freely, is the real
     shape of the experiment: you choose ONE comparison and you have to be able to say what it
     shows.

     So the verdict is on the PAIR, not on the tubes. Change one thing between them and it names
     what that pair proves. Change two and it says so, because a pair differing in two ways proves
     nothing whichever way the colours come out — which is the whole idea of a controlled
     comparison, and much harder to teach from a sentence than from a reader doing it. */
  function indicator(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'Hydrogencarbonate indicator',
      spec.ask || 'Two tubes. Set each one, then read what the pair does — and does not — prove.',
      'Compare two tubes'));

    var COL = { purple: '#8E63B8', orange: '#E2733A', yellow: '#E3C63C' };
    var WHERE = { light: 'bright light', dim: 'dim light', dark: 'the dark' };
    var T = [{ what: 'algae', where: 'light' }, { what: 'none', where: 'light' }];

    function readOf(t) {
      if (t.what === 'none') return { c: 'orange', name: 'orange-red', say: 'no change' };
      if (t.where === 'light') return { c: 'purple', name: 'purple', say: 'carbon dioxide down' };
      if (t.where === 'dark') return { c: 'yellow', name: 'yellow', say: 'carbon dioxide up' };
      return { c: 'orange', name: 'orange-red', say: 'no NET change' };
    }

    /* what the pair, taken together, is evidence for */
    function verdict() {
      var a = T[0], b = T[1];
      var sameWhat = a.what === b.what, sameWhere = a.where === b.where;
      if (sameWhat && sameWhere) return { ok: false, head: 'The two tubes are identical.',
        body: 'There is nothing to compare. A comparison needs exactly one thing to differ between them.' };
      if (!sameWhat && !sameWhere) return { ok: false, head: 'Two things differ at once.',
        body: 'The tubes have different contents AND stand in different light. If the colours come out different you cannot say which of the two caused it. Change one thing only — that is what makes it a <b>fair test</b>.' };
      if (a.what === 'none' && b.what === 'none') return { ok: false, head: 'Neither tube has anything living in it.',
        body: 'Nothing can add or remove carbon dioxide, so neither tube can change. You need algae in at least one of them.' };
      if (sameWhere) {                                   /* plant against no plant */
        var w = WHERE[a.where];
        return { ok: true, head: 'A fair test: algae against no algae, both in ' + w + '.',
          body: 'This is the pair that shows the colour change was caused by the <b>algae</b> and not by the light, the warmth or the glass. The tube with nothing in it is the <b>control</b>, and every version of this experiment needs one.' };
      }
      /* same contents, different light */
      if (a.what === 'none') return { ok: false, head: 'Two empty tubes in different light.',
        body: 'Neither can change, so the pair shows only that light alone does not affect the indicator. True, but not what the experiment is for — put algae in them.' };
      var pair = [a.where, b.where].sort().join('+');
      if (pair === 'dark+light') return { ok: true, head: 'A fair test: the same algae, bright light against darkness.',
        body: 'Purple against yellow. In the light photosynthesis outruns respiration and carbon dioxide falls; in the dark there is no photosynthesis at all, only <b>respiration</b>, so carbon dioxide rises. The dark tube is the one that proves plants respire — the part students forget.' };
      if (pair === 'dim+light') return { ok: true, head: 'A fair test: the same algae, bright light against dim.',
        body: 'Purple against orange-red. Both tubes are photosynthesising and respiring; only the rate of photosynthesis differs. The dim tube has reached its <b>compensation point</b> — the two processes are equal, so there is no NET change. "No colour change" is not "nothing happening".' };
      return { ok: true, head: 'A fair test: the same algae, dim light against darkness.',
        body: 'Orange-red against yellow. In the dark only respiration runs, so carbon dioxide rises. In dim light photosynthesis has caught up with respiration exactly — the <b>compensation point</b> — so the concentration holds steady. The difference between the two tubes is photosynthesis.' };
    }

    var stage = h('div', 'ind__stage');
    box.appendChild(stage);
    var grid = h('div', 'ind__grid');
    box.appendChild(grid);
    var sayEl = h('div', 'ind__verdict');
    box.appendChild(sayEl);

    function paintStage() {
      var W = 460, H = 248, xs = [150, 310];
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Two boiling tubes of hydrogencarbonate indicator, one holding algal balls">';
      s += '<defs><linearGradient id="indGlass" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".2" stop-color="#fff" stop-opacity=".04"/>' +
        '<stop offset=".82" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".26"/></linearGradient>' +
        '<filter id="indSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.6"/></filter></defs>';
      T.forEach(function (t, i) {
        var cx = xs[i], r = readOf(t);
        var TW = 52, TX = cx - TW / 2, TTOP = 42, TBOT = 202, LIQ = 74;
        s += '<ellipse cx="' + cx + '" cy="' + (TBOT + 7) + '" rx="25" ry="4.5" fill="#000" opacity=".08" filter="url(#indSoft)"/>';
        s += '<path d="M' + TX + ' ' + TTOP + ' L' + TX + ' ' + (TBOT - 20) + ' Q' + TX + ' ' + TBOT + ' ' + cx + ' ' + TBOT +
             ' Q' + (TX + TW) + ' ' + TBOT + ' ' + (TX + TW) + ' ' + (TBOT - 20) + ' L' + (TX + TW) + ' ' + TTOP + '" fill="#F4FAFD" stroke="#7BA0B3" stroke-width="2.4"/>';
        s += '<path d="M' + (TX + 2) + ' ' + LIQ + ' Q' + cx + ' ' + (LIQ - 5) + ' ' + (TX + TW - 2) + ' ' + LIQ +
             ' L' + (TX + TW - 2) + ' ' + (TBOT - 21) + ' Q' + (TX + TW - 2) + ' ' + (TBOT - 2) + ' ' + cx + ' ' + (TBOT - 2) +
             ' Q' + (TX + 2) + ' ' + (TBOT - 2) + ' ' + (TX + 2) + ' ' + (TBOT - 21) + ' Z" fill="' + COL[r.c] + '" fill-opacity=".82"/>';
        if (t.what === 'algae') {
          [[cx - 13, 182], [cx + 1, 186], [cx + 15, 181], [cx - 5, 172], [cx + 10, 169], [cx - 16, 169], [cx + 2, 174]].forEach(function (b, k) {
            s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="6.6" fill="' + (k % 2 ? '#4F9E56' : '#5CB165') + '" stroke="#2F7040" stroke-width="1"/>';
            s += '<circle cx="' + (b[0] - 2.1) + '" cy="' + (b[1] - 2.3) + '" r="1.9" fill="#BFE8C2" opacity=".8"/>';
          });
        }
        s += '<path d="M' + (TX - 4) + ' ' + TTOP + ' L' + (TX + TW + 4) + ' ' + TTOP + ' L' + (TX + TW) + ' ' + (TTOP - 18) + ' L' + TX + ' ' + (TTOP - 18) + ' Z" fill="#D8C3A0" stroke="#A88C5F" stroke-width="1.6" stroke-linejoin="round"/>';
        s += '<path d="M' + TX + ' ' + TTOP + ' L' + TX + ' ' + (TBOT - 20) + ' Q' + TX + ' ' + TBOT + ' ' + cx + ' ' + TBOT +
             ' Q' + (TX + TW) + ' ' + TBOT + ' ' + (TX + TW) + ' ' + (TBOT - 20) + ' L' + (TX + TW) + ' ' + TTOP + '" fill="url(#indGlass)"/>';
        s += '<path d="M' + (TX + 9) + ' ' + (LIQ + 14) + ' L' + (TX + 9) + ' ' + (TBOT - 42) + '" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>';
        if (t.where === 'dark') {
          s += '<rect x="' + (TX - 4) + '" y="88" width="' + (TW + 8) + '" height="82" rx="2" fill="#C9CCD1" stroke="#93989F" stroke-width="1.5"/>';
          for (var f = 0; f < 6; f++) s += '<line x1="' + (TX + f * 10) + '" y1="90" x2="' + (TX - 2 + f * 10) + '" y2="168" stroke="#AEB2B8" stroke-width="1"/>';
          s += '<text x="' + cx + '" y="81" font-size="9.5" fill="#6B6F75" text-anchor="middle" font-family="ui-monospace,monospace">FOIL</text>';
        } else {
          var lum = t.where === 'light' ? 1 : 0.34;
          s += '<circle cx="' + cx + '" cy="16" r="12" fill="#FFE9A8" opacity="' + lum.toFixed(2) + '"/>';
          for (var a2 = 0; a2 < 8; a2++) {
            var an = a2 * 45 * Math.PI / 180;
            s += '<line x1="' + (cx + Math.cos(an) * 14).toFixed(1) + '" y1="' + (16 + Math.sin(an) * 14).toFixed(1) + '" x2="' + (cx + Math.cos(an) * (t.where === 'light' ? 21 : 17)).toFixed(1) + '" y2="' + (16 + Math.sin(an) * (t.where === 'light' ? 21 : 17)).toFixed(1) + '" stroke="#E8B94A" stroke-width="1.8" opacity="' + lum.toFixed(2) + '" stroke-linecap="round"/>';
          }
        }
        s += '<text x="' + cx + '" y="' + (H - 16) + '" font-size="12.5" font-weight="700" fill="' + COL[r.c] + '" text-anchor="middle">' + esc(r.name) + '</text>';
        s += '<text x="' + cx + '" y="' + (H - 3) + '" font-size="10" fill="#6B6B63" text-anchor="middle">' + esc(r.say) + '</text>';
      });
      stage.innerHTML = s;
    }

    function paintGrid() {
      grid.innerHTML = '';
      T.forEach(function (t, i) {
        var card = h('div', 'ind__card');
        card.innerHTML = '<span class="ind__n">Tube ' + (i + 1) + '</span>' +
          '<label>In it <select data-k="what"><option value="algae">algal balls</option><option value="none">nothing</option></select></label>' +
          '<label>Kept in <select data-k="where"><option value="light">bright light</option><option value="dim">dim light</option><option value="dark">the dark</option></select></label>';
        card.querySelector('[data-k="what"]').value = t.what;
        card.querySelector('[data-k="where"]').value = t.where;
        card.querySelectorAll('select').forEach(function (sel) {
          sel.addEventListener('change', function () { t[sel.getAttribute('data-k')] = sel.value; paintAll(); });
        });
        grid.appendChild(card);
      });
    }

    function paintVerdict() {
      var v = verdict();
      sayEl.className = 'ind__verdict' + (v.ok ? ' is-ok' : ' is-no');
      sayEl.innerHTML = '<b>' + esc(v.head) + '</b> <span class="ind__vbody">' + v.body + '</span>';
    }

    function paintAll() { paintStage(); paintVerdict(); }
    paintGrid(); paintAll();
    box.appendChild(h('p', 'widget__note', 'The indicator starts orange-red, the colour it takes with the carbon dioxide in ordinary air, and answers one question only: has the carbon dioxide gone up, down, or not changed? Try to build a pair that shows the algae photosynthesise; then one that shows they respire; then one that proves the algae caused it.'));
    box.__onReset = function () { T[0] = { what: 'algae', where: 'light' }; T[1] = { what: 'none', where: 'light' }; };
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
      var host = document.getElementById('benchHost'), sim = document.getElementById('simHost');
      /* When the whole widget has been moved into the simulation column its apparatus must stay
         with its controls; otherwise mount() keeps pulling the stage and the readout back to the
         bench and the student is left with controls that drive something they cannot see. */
      var inSim = !!(sim && sim.contains(box));
      var wide = wideQ.matches && host && !host.hidden && !inSim;
      var target = wide ? host : slot;
      if (stage.parentNode !== target) {
        if (wide) host.innerHTML = '';
        target.appendChild(stage); target.appendChild(live);
      }
      box.classList.toggle('po--split', !!wide);
    }
    box.__onMove = mount;     /* app.js re-runs this after re-parenting the widget */
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

  /* ---------- auxin: the tip, the classic experiments, and the two organs ----------
     This is not a lookup table of outcomes. The state of the apparatus feeds a model —
     how much auxin is made, whether the tip can see the light, how it splits left and
     right, what reaches the elongation zone down each side — and the bend FALLS OUT of
     the difference in cell length. So combinations nobody planned for still answer
     correctly, and a student who reasons from the mechanism is rewarded rather than
     having to guess which button the author anticipated.

     Two things the old version had wrong and which the literature settles:
     light REDISTRIBUTES auxin, it does not destroy it (Briggs, Tocher and Wilson 1957 recovered the same
     total from lit and dark coleoptiles, split about 2:1 towards the shade); and in a
     ROOT the same auxin INHIBITS elongation, so the side with more of it grows less. */
  function auxin(spec) {
    var box = h('div', 'widget');
    box.appendChild(head(spec.title || 'The auxin experiments', spec.ask, 'Run an experiment'));

    var S = { organ: 'shoot', lay: 'up', light: 'left', top: 'intact', layer: 'gel',
              cover: 'none', mica: 'none', block: 'none', cap: 'intact', p: 0, t: null };

    var wrap = h('div', 'ax');
    var panel = h('div', 'ax__panel');
    var acts  = h('div', 'ax__acts');
    var slot  = h('div', 'ax__slot');
    var pack  = h('div', 'ax__pack');
    var stage = h('div', 'ax__stage');
    var key   = h('div', 'ax__key');
    var capt  = h('p', 'ax__cap');
    var why   = h('div', 'ax__why');
    var pins = h('ol', 'ax__pins');
    pack.appendChild(stage); pack.appendChild(pins); pack.appendChild(key); pack.appendChild(capt); pack.appendChild(why);
    slot.appendChild(pack);
    wrap.appendChild(panel); wrap.appendChild(acts); wrap.appendChild(slot);
    box.appendChild(wrap);

    /* ----- the controls ----- */
    var GROUPS = [
      { key: 'organ', label: 'Organ', opts: [['shoot', 'Shoot'], ['root', 'Root']] },
      { key: 'lay', label: 'How it is standing', opts: [['up', 'upright'], ['side', 'laid on its side']],
        when: function () { return S.organ === 'shoot'; } },
      { key: 'light', label: 'Light', opts: [['left', '☀ from the left'], ['top', '☀ from above'], ['right', '☀ from the right'], ['dark', '🌙 darkness']],
        when: function () { return S.organ === 'shoot' && S.lay === 'up'; } },
      /* Once it is on its side its flanks are the upper and lower ones, so light from the
         left or right would strike the tip end-on and mean nothing. Above or dark are the
         two that say something — and only the dark one says it cleanly. */
      { key: 'light', label: 'Light', opts: [['top', '☀ from above'], ['dark', '🌙 darkness']],
        when: function () { return S.organ === 'shoot' && S.lay === 'side'; } },
      { key: 'top', label: 'The shoot tip', opts: [['intact', 'left on'], ['cut', 'cut off'], ['replaced', 'cut off, put back'], ['shiftL', 'put back, shifted left'], ['shiftR', 'put back, shifted right']],
        when: function () { return S.organ === 'shoot' && S.lay === 'up'; } },
      { key: 'top', label: 'The shoot tip', opts: [['intact', 'left on'], ['cut', 'cut off']],
        when: function () { return S.organ === 'shoot' && S.lay === 'side'; } },
      { key: 'layer', label: 'Between tip and stump', opts: [['gel', 'gelatin (lets auxin through)'], ['mica', 'mica (lets nothing through)']],
        when: function () { return S.organ === 'shoot' && S.top.indexOf('replaced') === 0 || S.organ === 'shoot' && S.top.indexOf('shift') === 0; } },
      { key: 'cover', label: 'Cover', opts: [['none', 'nothing'], ['opaque', 'opaque cap on the tip'], ['clear', 'clear cap on the tip'], ['collar', 'opaque collar lower down']],
        when: function () { return S.organ === 'shoot' && S.top !== 'cut'; } },
      { key: 'mica', label: 'Mica plate under half the tip', opts: [['none', 'none'], ['left', 'under the left half'], ['right', 'under the right half']],
        when: function () { return S.organ === 'shoot' && S.lay === 'up' && S.top !== 'cut' && (S.light === 'left' || S.light === 'right'); } },
      { key: 'block', label: 'Agar block on the stump', opts: [['none', 'none'], ['plainL', 'plain, left'], ['plainR', 'plain, right'], ['auxinL', 'soaked in auxin, left'], ['auxinR', 'soaked in auxin, right']],
        when: function () { return S.organ === 'shoot' && S.lay === 'up' && S.top === 'cut'; } },
      { key: 'cap', label: 'The root cap', opts: [['intact', 'left on'], ['cut', 'cut off']],
        when: function () { return S.organ === 'root'; } }
    ];

    function buildPanel() {
      panel.innerHTML = '';
      GROUPS.forEach(function (g) {
        if (g.when && !g.when()) return;
        var row = h('div', 'ax__grp');
        row.appendChild(h('b', 'ax__grpl', g.label));
        var pills = h('div', 'ax__pills');
        g.opts.forEach(function (o) {
          var b = h('button', 'ax__lamp' + (S[g.key] === o[0] ? ' is-on' : ''), o[1]);
          b.type = 'button';
          b.addEventListener('click', function () {
            S[g.key] = o[0];
            /* a control that has just become meaningless should not keep an odd value */
            if (g.key === 'top' && o[0] !== 'cut') S.block = 'none';
            if (g.key === 'top' && o[0] === 'cut') { S.cover = 'none'; S.mica = 'none'; }
            /* a sideways shoot has no left or right flank to light */
            if (g.key === 'lay' && o[0] === 'side') {
              if (S.light === 'left' || S.light === 'right') S.light = 'dark';
              if (S.top !== 'intact' && S.top !== 'cut') S.top = 'intact';   /* the off-centre replacements are upright experiments */
              S.block = 'none'; S.mica = 'none';
            }
            if (g.key === 'light' && o[0] !== 'left' && o[0] !== 'right') S.mica = 'none';
            buildPanel(); run();
          });
          pills.appendChild(b);
        });
        row.appendChild(pills); panel.appendChild(row);
      });
    }

    /* ----- the model: apparatus in, biology out ----- */
    function model() {
      var made = 0, offset = 0, sees = false, note = '', who = '', thru = 1;

      if (S.organ === 'root') {
        made = 1;                                  /* auxin arrives from the shoot above */
      } else {
        if (S.top === 'intact') made = 1;
        else if (S.top === 'cut') {
          if (S.block.indexOf('auxin') === 0) { made = 1; offset = S.block.slice(-1) === 'L' ? -1 : 1; }
          else if (S.block.indexOf('plain') === 0) { made = 0; offset = S.block.slice(-1) === 'L' ? -1 : 1; }
        } else {
          /* A tip put back on mica goes on MAKING auxin — cutting a shoot does not stop its tip
             working. What the mica stops is the auxin getting down into the stump. Setting made
             to zero drew a tip that had stopped producing, which is a different experiment and a
             wrong one: the whole point of Boysen-Jensen's plate is that the auxin is there and
             cannot pass. */
          made = 1;
          if (S.layer === 'mica') thru = 0;
          if (S.top === 'shiftL') offset = -1;
          if (S.top === 'shiftR') offset = 1;
        }
      }

      /* One number carries every stimulus: which flank the auxin is pushed towards, where
         +1 is the flank at +u — the RIGHT of an upright shoot, the LOWER side of anything
         lying down. Writing it once means light and gravity can act together, or disagree,
         without a branch for each pairing. */
      var HI = 0.67, bias = 0, lit = false, grav = false;   /* Briggs measured roughly two to one */
      if (S.organ === 'root') {
        grav = S.cap === 'intact';                 /* the CAP is the gravity detector, not the tip */
        if (grav) bias += 1;
      } else {
        grav = S.lay === 'side';                   /* gravity acts on it with or without a tip */
        var canSee = S.cover !== 'opaque';         /* an opaque cap blinds the tip; a collar below it does not */
        if (made <= 0 || S.top === 'cut') { /* no auxin to move */ }
        else if (S.lay === 'side') {
          bias += 1;                               /* gravity needs no window to get in */
          /* light from overhead falls on the UPPER flank of a shoot that is lying down, so it
             shades the lower one — pushing the auxin the same way gravity already is */
          if (S.light === 'top' && canSee) { lit = true; bias += 1; }
        } else if (canSee && (S.light === 'left' || S.light === 'right')) {
          lit = true; bias += (S.light === 'left' ? 1 : -1);
        }
      }
      bias = Math.max(-1, Math.min(1, bias));
      sees = lit || grav;
      var fR = 0.5 + (HI - 0.5) * bias, fL = 1 - fR;

      if (offset !== 0 && made > 0) {              /* a tip or block set to one side feeds that side */
        var strong = 0.85;
        fL = offset < 0 ? strong : 1 - strong;
        fR = 1 - fL;
      }

      var dL = made * fL * thru, dR = made * fR * thru;   /* what actually reaches the cells */
      /* A sheet pushed down one side stops the auxin travelling down THAT side. Where it
         blocks the side that was carrying more, the difference never reaches the cells that
         would have stretched, and the observed result is no curvature at all. */
      if (S.organ === 'shoot' && S.mica === 'left')  { note = 'mica-left';  dL = Math.min(dL, dR); }
      if (S.organ === 'shoot' && S.mica === 'right') { note = 'mica-right'; dR = Math.min(dL, dR); }

      /* the inversion: more auxin stretches a shoot cell and holds back a root cell */
      var gL = S.organ === 'root' ? (1 - dL) : dL,
          gR = S.organ === 'root' ? (1 - dR) : dR;
      if (S.organ === 'shoot' && made === 0) { gL = 0; gR = 0; }

      var bend = (gL - gR) * 54 * Math.PI / 180;   /* + bends right, − bends left */

      /* Whose experiment is on the bench. Each clause has to name the WHOLE arrangement,
         stimulus included: a cap with the lamp off is nobody's experiment, and crediting it to
         Darwin taught a student that the cap alone was the point. */
      var lateral = S.light === 'left' || S.light === 'right';
      if (S.organ === 'shoot' && S.lay === 'up') {
        var replaced = S.top === 'replaced' || S.top.indexOf('shift') === 0;
        if (S.top === 'intact' && lateral && S.cover === 'opaque') who = 'Darwin, 1880';
        else if (S.top === 'intact' && lateral && S.cover === 'collar') who = 'Darwin, 1880';
        else if (S.top === 'intact' && lateral && S.cover === 'clear') who = 'Darwin, 1880';
        else if (S.top === 'cut' && lateral && S.block === 'none') who = 'Darwin, 1880';
        else if (S.top === 'cut' && S.block.indexOf('auxin') === 0) who = 'Went, 1928';
        else if (S.top === 'cut' && S.block.indexOf('plain') === 0) who = 'Went, 1928 — the control';
        else if (S.top.indexOf('shift') === 0 && S.light === 'dark' && S.layer !== 'mica') who = 'Paál, 1919';
        else if (replaced && S.layer === 'mica') who = 'Boysen-Jensen, 1913';
        else if (replaced && S.layer === 'gel' && lateral) who = 'Boysen-Jensen, 1913';
        else if (S.mica !== 'none' && lateral) who = 'Boysen-Jensen, 1913';
      }

      return { made: made, sees: sees, lit: lit, grav: grav, fL: fL, fR: fR, dL: dL, dR: dR,
               gL: gL, gR: gR, bend: bend, offset: offset, note: note, who: who, thru: thru };
    }

    /* ----- geometry -----
       A growing organ is a beam. It leaves its base on a fixed heading, curves only where
       the cells are actually elongating, and runs straight again above that. Writing it as
       an integral of the heading keeps the base planted and stops the whole thing collapsing
       to a point as the curvature goes to zero, which is what wrecked the first attempt. */
    var GEO = {
      shoot:     { W: 640, H: 400, BX: 300, BY: 330, phi0: 0,           LEN: 200, HW: 32, ELO: [92, 158], TIP: 166 },
      shootSide: { W: 640, H: 400, BX: 138, BY: 210, phi0: Math.PI / 2, LEN: 200, HW: 32, ELO: [92, 158], TIP: 166 },
      root:      { W: 640, H: 400, BX: 172, BY: 150, phi0: Math.PI / 2, LEN: 230, HW: 29, ELO: [110, 184], TIP: 196 }
    };
    function geoFor() {
      return S.organ === 'root' ? GEO.root : S.lay === 'side' ? GEO.shootSide : GEO.shoot;
    }

    function beam(g, bend) {
      var A = g.ELO[0], B = g.ELO[1], k = bend / (B - A), p0 = g.phi0;
      var cA = [g.BX + A * Math.sin(p0), g.BY - A * Math.cos(p0)];
      var PHI = p0 + bend;
      var cB = Math.abs(k) < 1e-6
        ? [cA[0] + (B - A) * Math.sin(p0), cA[1] - (B - A) * Math.cos(p0)]
        : [cA[0] + (Math.cos(p0) - Math.cos(PHI)) / k, cA[1] - (Math.sin(PHI) - Math.sin(p0)) / k];
      return function (s, u) {
        var phi, cx, cy;
        if (s <= A)      { phi = p0;  cx = g.BX + s * Math.sin(p0);       cy = g.BY - s * Math.cos(p0); }
        else if (s <= B) {
          phi = p0 + k * (s - A);
          if (Math.abs(k) < 1e-6) { cx = cA[0] + (s - A) * Math.sin(p0); cy = cA[1] - (s - A) * Math.cos(p0); }
          else { cx = cA[0] + (Math.cos(p0) - Math.cos(phi)) / k; cy = cA[1] - (Math.sin(phi) - Math.sin(p0)) / k; }
        } else           { phi = PHI; cx = cB[0] + (s - B) * Math.sin(PHI); cy = cB[1] - (s - B) * Math.cos(PHI); }
        return [cx + u * Math.cos(phi), cy + u * Math.sin(phi), phi];
      };
    }

    function f1(p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }

    /* Labels are collected while the drawing is built and only placed once it is finished.
       Hand-placed coordinates were clipping off the canvas and landing on top of each other
       as soon as the apparatus changed; a layout pass cannot do either. Every leader ends in
       a horizontal run into the words, which is how a candidate is expected to label a figure. */
    var LAB = [];
    function ruled(px, py, tx, ty, text) { LAB.push({ px: px, py: py, text: text }); return ''; }

    function wrapText(t, max) {
      var words = t.split(' '), out = [], line = '';
      words.forEach(function (w) {
        if (!line.length) line = w;
        else if ((line + ' ' + w).length <= max) line += ' ' + w;
        else { out.push(line); line = w; }
      });
      if (line.length) out.push(line);
      return out;
    }

    /* Below about 470 px there is no room for a column of words beside the drawing: the
       column falls outside the visible box and the words shrink to five pixels. So the labels
       become numbered pins on the drawing and a numbered list under it — the same thing the
       finder widget does, and the same thing a printed figure does when it runs out of margin. */
    /* A number on the drawing and its words somewhere below is a lookup, and a lookup the
       reader has to scroll for is a lookup they will not make. The words go ON the drawing, in
       the corner, with the numbers tying each line to its pin. */
    /* How tall a band the words need above the drawing. Hunting for an empty corner does not
       work: on a narrow box the drawing fills it, and whichever corner is free in one state is
       occupied in the next — the sun moves, the pot is on one side, the wavy path runs off the
       other. So the words are given a band of their own ABOVE the drawing and the box is made
       taller to hold it. Then nothing can be covered, in any state. */
    function pinBand(vw) {
      if (!LAB.length) return 0;
      var n = 0;
      LAB.forEach(function (L) { n += wrapText(L.text, Math.max(28, Math.floor((vw - 26) / 5.1))).length; });
      return n * 12.6 + 12;
    }

    function pinLabels(g, vx, vw, band) {
      pins.innerHTML = '';
      if (!LAB.length) return '';
      var out = '', lines = [];
      LAB.forEach(function (L, i) {
        wrapText(L.text, Math.max(28, Math.floor((vw - 26) / 5.1))).forEach(function (ln, k) {
          lines.push((k ? '   ' : (i + 1) + '. ') + ln);
        });
      });
      lines.forEach(function (ln, i) {
        out += '<text class="ax__pintxt" x="' + (vx + 9) + '" y="' + (-band + 13 + i * 12.6).toFixed(1) + '">' + ln + '</text>';
      });
      out += '<path d="M' + (vx + 6) + ' -3 H' + (vx + vw - 6) + '" stroke="#E0DAC9" stroke-width="1"/>';
      LAB.forEach(function (L, i) {
        /* The disc sits OUTSIDE the organ with a short leader back to the feature. Centred on the
           anchor it covered the very cells, arrows and starch grains its own words were naming. */
        var away = Math.abs(g.phi0) < 0.1
          ? [L.px >= g.BX ? 19 : -19, 0]      /* an upright organ: push the disc sideways */
          : [0, L.py >= g.BY ? 19 : -19];     /* one lying down: push it up or down */
        var dx2 = L.px + away[0], dy2 = L.py + away[1];
        var n = i + 1;
        out += '<path d="M' + L.px.toFixed(1) + ' ' + L.py.toFixed(1) + ' L' + dx2.toFixed(1) + ' ' + dy2.toFixed(1) + '" stroke="#5A5A5A" stroke-width="1.2"/>';
        out += '<circle cx="' + dx2.toFixed(1) + '" cy="' + dy2.toFixed(1) + '" r="9" fill="#FFFFFF" stroke="#5A5A5A" stroke-width="1.5"/>';
        out += '<text class="ax__pin" x="' + dx2.toFixed(1) + '" y="' + (dy2 + 4).toFixed(1) + '" text-anchor="middle">' + n + '</text>';
      });
      return out;
    }

    function placeLabels(g, right) {
      pins.innerHTML = '';
      if (!LAB.length) return '';
      var x = right ? g.W - 150 : 150, out = '';
      var rows = LAB.map(function (L) { return { px: L.px, py: L.py, lines: wrapText(L.text, 25) }; })
                    .sort(function (a, b) { return a.py - b.py; });
      var y = 30;
      rows.forEach(function (r) {
        var hgt = r.lines.length * 12.5;
        y = Math.max(y, Math.min(r.py - hgt / 2, g.H - hgt - 14));
        r.y = y;
        y += hgt + 12;
      });
      /* if the stack ran off the bottom, slide the whole column up rather than clip it */
      var over = y - 12 - (g.H - 10);
      if (over > 0) rows.forEach(function (r) { r.y -= over; });
      rows.forEach(function (r) {
        var mid = r.y + r.lines.length * 12.5 / 2 - 4;
        out += '<path d="M' + r.px.toFixed(1) + ' ' + r.py.toFixed(1) + ' L' + (right ? x - 14 : x + 14) + ' ' + mid.toFixed(1) +
               ' L' + x + ' ' + mid.toFixed(1) + '" fill="none" stroke="#9A9A9A" stroke-width="1.1"/>';
        out += '<circle cx="' + r.px.toFixed(1) + '" cy="' + r.py.toFixed(1) + '" r="2.2" fill="#9A9A9A"/>';
        r.lines.forEach(function (ln, i) {
          out += '<text class="ax__l" x="' + (right ? x + 5 : x - 5) + '" y="' + (r.y + i * 12.5 + 4).toFixed(1) +
                 '" text-anchor="' + (right ? 'start' : 'end') + '">' + ln + '</text>';
        });
      });
      return out;
    }

    /* ----- the drawing ----- */
    var narrow = false, capNow = '';
    function gauge() { var w2 = stage.clientWidth || 0; if (w2) narrow = w2 < 470; }

    function draw(M, p) {
      var base = geoFor(), root = S.organ === 'root';
      LAB = [];
      var made   = clamp(p / 0.18),
          detect = clamp((p - 0.18) / 0.18),
          lat    = clamp((p - 0.36) / 0.22),
          down   = clamp((p - 0.58) / 0.20),
          grow   = clamp((p - 0.78) / 0.22);

      /* Elongation is the whole point, so it has to be visible as LENGTH, not only as a bend.
         The zone lengthens by what the auxin reaching it has earned, which is why a shoot with
         its tip cut off now sits there and does nothing while an intact one climbs. */
      var ext = (M.gL + M.gR) / 2 * 54 * grow;
      var g = { W: base.W, H: base.H, BX: base.BX, BY: base.BY, phi0: base.phi0, HW: base.HW,
                LEN: base.LEN + ext, TIP: base.TIP + ext, ELO: [base.ELO[0], base.ELO[1] + ext],
                ZONE0: base.ELO[0], ZONE1: base.ELO[1] + ext };
      var bend = M.bend * grow, at = beam(g, bend);

      /* A frame riding the organ. Its origin sits on the centre line at distance s, its x axis
         runs ACROSS the organ (the u direction) and its y axis runs back down it. Anything drawn
         inside is therefore drawn in the organ's own coordinates and stays seated on it however
         the organ is turned or bent. Everything except the mica plate used to be composed from
         g.BX / g.BY, which silently assumed the organ stood upright and unbent: laid on its side
         the whole apparatus was left behind, 200 px away, and some of it off the canvas. */
      function rider(s0) {
        var q = at(s0, 0);
        return '<g transform="translate(' + q[0].toFixed(2) + ',' + q[1].toFixed(2) +
               ') rotate(' + (q[2] * 180 / Math.PI).toFixed(2) + ')">';
      }
      /* One column, and every anchor that has a choice of flank takes the one on its side, so a
         leader never crosses the drawing to reach its words. */
      /* On an organ lying down the label column is still to the right, so an anchor on the LOWER
         flank sends its leader straight along the body. Anchoring on the upper flank lets it rise
         clear of the drawing before it turns for the words. */
      var labRight = root ? true : S.light !== 'right';
      var labU = (root || S.lay === 'side') ? -g.HW : (labRight ? g.HW : -g.HW);
      var HW = g.HW, K = 9, CW = 11;

      /* With the words underneath, the column they used to occupy is dead space. Cropping it at
         a fixed 500 still left the organ off to one side, because the geometry was laid out to
         leave room for that column. So the window is centred on what is actually drawn, which
         both centres the drawing and makes it bigger in the same move. */
      var vx = 0, vw = g.W;
      if (narrow) {
        if (root) { vx = 80; vw = 450; }
        else if (S.lay === 'side') { vx = 40; vw = 420; }
        else { vw = 330; vx = g.BX - vw / 2; }
      }
      var s = '';
      s += '<defs><linearGradient id="axBody" x1="0" y1="0" x2="1" y2="0">' +
           '<stop offset="0" stop-color="' + (root ? '#C9B896' : '#3E8F46') + '"/>' +
           '<stop offset=".45" stop-color="' + (root ? '#E4D6B8' : '#54AC5C') + '"/>' +
           '<stop offset="1" stop-color="' + (root ? '#C9B896' : '#3E8F46') + '"/></linearGradient>' +
           '<radialGradient id="axSun" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="#FFE07A"/><stop offset="1" stop-color="#F3AC16"/></radialGradient></defs>';
      var bg = '#FBFAF6';

      /* soil, or the bench the seedling lies on */
      if (root) {
        bg = '#F3EDE0';
        s += '<path d="M0 96 H' + g.W + '" stroke="#D8CBB0" stroke-width="1.2" stroke-dasharray="5 5"/>';
        /* On a phone the window starts at vx, so words anchored near x=0 are cropped away
           before they are read: both of these sat off the canvas in every root state. The soil
           label moves to the free end of the line it names, and the shoot label to the open
           side of the shoot. */
        s += narrow ? '<text class="ax__s" x="' + (vx + vw - 8) + '" y="90" text-anchor="end">soil surface</text>'
                    : '<text class="ax__s" x="10" y="90">soil surface</text>';
        s += '<path d="M150 122 q-34 -34 -30 -66" fill="none" stroke="#6FAE63" stroke-width="4.5" stroke-linecap="round"/>';
        s += narrow ? '<text class="ax__s" x="158" y="48">shoot, growing up</text>'
                    : '<text class="ax__s" x="74" y="48">shoot, growing up</text>';
        s += '<ellipse cx="150" cy="142" rx="33" ry="25" fill="#E8DCC0" stroke="#B79E74" stroke-width="1.8"/>';
        s += '<text class="ax__s" x="150" y="186" text-anchor="middle">seed</text>';
      }

      /* the beam first: the light needs to know where the flank it is lighting actually is */
      function edge(u) { var a = []; for (var i = 0; i <= K; i++) a.push(at(g.LEN * i / K, u)); return a; }
      /* the light, and which flank of the organ it falls on */
      var lit = null;
      if (!root && S.light !== 'dark') {
        var sx = S.light === 'left' ? (narrow ? vx + 46 : 62)
               : S.light === 'right' ? (narrow ? vx + vw - 46 : g.W - 62)
               : (S.lay === 'side' ? (narrow ? vx + vw - 70 : 390) : g.BX),
            sy = S.light === 'top' ? 48 : 104;
        for (var ry = 0; ry < 12; ry++) {
          var an = ry * 30 * Math.PI / 180;
          s += '<line x1="' + (sx + Math.cos(an) * 24).toFixed(1) + '" y1="' + (sy + Math.sin(an) * 24).toFixed(1) +
               '" x2="' + (sx + Math.cos(an) * 33).toFixed(1) + '" y2="' + (sy + Math.sin(an) * 33).toFixed(1) +
               '" stroke="#F3AC16" stroke-width="3" stroke-linecap="round"/>';
        }
        s += '<circle cx="' + sx + '" cy="' + sy + '" r="20" fill="url(#axSun)"/>';
        /* rays that start at the sun and stop ON the flank they are lighting — floating bars
           that ended in mid-air read as stray lines rather than as light arriving */
        /* An overhead lamp is a SIDE stimulus for a shoot that is lying down: it falls on the
           upper flank and shades the lower one. That is the confound the dark run removes. */
        lit = (S.cover === 'opaque' || S.top === 'cut') ? null
            : S.lay === 'side' ? (S.light === 'top' ? -1 : null)
            : S.light === 'left' ? -1 : S.light === 'right' ? 1 : null;
        if (lit !== null) {
          var op = (0.3 + 0.55 * detect).toFixed(2);
          for (var b2 = 0; b2 < 4; b2++) {
            var sAt = g.LEN - 26 - b2 * 34, hit = at(Math.max(30, sAt), lit < 0 ? -HW : HW);
            var dx = hit[0] - sx, dy = hit[1] - sy, dl = Math.hypot(dx, dy) || 1;
            var x2 = sx + dx / dl * 34, y2 = sy + dy / dl * 34;
            var x3 = hit[0] - dx / dl * 5, y3 = hit[1] - dy / dl * 5;
            s += '<line x1="' + x2.toFixed(1) + '" y1="' + y2.toFixed(1) + '" x2="' + x3.toFixed(1) + '" y2="' + y3.toFixed(1) +
                 '" stroke="#F2A72E" stroke-width="2.6" stroke-linecap="round" opacity="' + op + '"/>';
            var ah = Math.atan2(dy, dx);
            s += '<path d="M' + x3.toFixed(1) + ' ' + y3.toFixed(1) +
                 ' L' + (x3 - Math.cos(ah - 0.42) * 9).toFixed(1) + ' ' + (y3 - Math.sin(ah - 0.42) * 9).toFixed(1) +
                 ' L' + (x3 - Math.cos(ah + 0.42) * 9).toFixed(1) + ' ' + (y3 - Math.sin(ah + 0.42) * 9).toFixed(1) +
                 ' Z" fill="#F2A72E" opacity="' + op + '"/>';
          }
        }
      }
      if (root) {                                   /* the stimulus is gravity: show it as such */
        var rgx = narrow ? vx + vw - 40 : 300;
        s += '<g opacity="' + (0.3 + 0.7 * detect).toFixed(2) + '"><line x1="' + rgx + '" y1="52" x2="' + rgx + '" y2="102" stroke="#7A7A7A" stroke-width="2.4"/>' +
             '<path d="M' + rgx + ' 108 l-6 -10 h12 Z" fill="#7A7A7A"/><text class="ax__s" x="' + rgx + '" y="42" text-anchor="middle">gravity</text></g>';
      }

      /* the body */
      var R = edge(HW), L = edge(-HW), tipP = at(g.LEN, 0);
      var cut = S.organ === 'shoot' && S.top !== 'intact';
      var flat = cut || (root && S.cap === 'cut');  /* a cut end is square; only an intact tip is domed */
      var bodyTop = cut ? g.TIP - 8 : root && S.cap === 'cut' ? g.TIP : g.LEN;
      /* WHERE THE TIP ACTUALLY IS. A tip cut off and put back sits on the cut face, and a
         shifted one sits off to one side of it. Everything that has to agree with that tip —
         its cap, the collar below it, a plate slid in under it, and the auxin it makes — is
         built from these numbers instead of from the organ's own apex. Built from the apex,
         a cap hung in the air beside a shifted tip and left the tip bare, which is the one
         thing Paal's experiment must not show. */
      var putBack = !root && S.top !== 'intact' && S.top !== 'cut';
      var tipOff  = S.top === 'shiftL' ? -13 : S.top === 'shiftR' ? 13 : 0;   /* across the stump */
      var tipApex = bodyTop + 51;                  /* the crown of a tip that has been put back */

      var d = 'M' + f1(at(0, HW));
      for (var i4 = 1; i4 <= K; i4++) { var ss = bodyTop * i4 / K; d += ' L' + f1(at(ss, HW)); }
      var topR = at(bodyTop, HW), topL = at(bodyTop, -HW);
      if (flat) d += ' L' + f1(topL);
      else {
        var pTip = at(bodyTop, 0), phiT = pTip[2];
        d += ' Q' + (pTip[0] + Math.sin(phiT) * HW * 0.95).toFixed(1) + ' ' + (pTip[1] - Math.cos(phiT) * HW * 0.95).toFixed(1) + ' ' + f1(topL);
      }
      for (var i5 = K - 1; i5 >= 0; i5--) d += ' L' + f1(at(bodyTop * i5 / K, -HW));
      d += ' Z';
      s += '<path d="' + d + '" fill="url(#axBody)" stroke="' + (root ? '#9A8459' : '#2C6E36') + '" stroke-width="2" stroke-linejoin="round"/>';

      /* the cells. In the elongation zone the boxes on each flank are drawn to the length
         that flank's auxin has earned it, so the curve above is the sum of what is drawn
         here rather than a shape imposed on top of it. */
      /* Cells outside the zone keep the length they started with; the four inside it are
         redrawn longer as the zone extends. Dividing the whole flank into equal boxes, as
         this did before, made every cell grow — which is the one thing that is not happening. */
      var CELL = 19;                                  /* the length of a cell before it stretches */
      function cellBounds() {
        var z0 = Math.max(0, Math.min(g.ZONE0, bodyTop)), z1 = Math.max(z0, Math.min(g.ZONE1, bodyTop));
        var b = [0], v;
        for (v = CELL; v < z0 - 5; v += CELL) b.push(v);
        if (z0 > 0.5) b.push(z0);
        for (var i = 1; i <= 4; i++) b.push(z0 + (z1 - z0) * i / 4);
        for (v = z1 + CELL; v < bodyTop - 5; v += CELL) b.push(v);
        if (bodyTop > z1 + 0.5) b.push(bodyTop);
        return b;
      }
      function chain(sign) {
        var gth = sign < 0 ? M.gL : M.gR, out = '', B = cellBounds();
        for (var i = 0; i < B.length - 1; i++) {
          var s0 = B[i], s1 = B[i + 1];
          var mid = (s0 + s1) / 2, inZone = mid >= g.ZONE0 - 0.5 && mid <= g.ZONE1 + 0.5;
          var stretched = inZone ? gth * grow : 0;
          /* What decides whether a cell is drawn as elongating is whether it IS longer than it
             started, not whether its share of the auxin beat a fixed number. The old cut-off at
             0.42 left the lit flank pale and arrowless while the same frame drew it 28% longer,
             and with a plate on the shaded side it silenced BOTH flanks of a shoot that had
             visibly grown — the key saying "this cell is elongating" against a drawing that
             showed none. */
          var grew = inZone && (s1 - s0) > CELL + 0.6;
          var p1 = at(s0, sign * HW), p2 = at(s1, sign * HW), p3 = at(s1, sign * (HW - CW)), p4 = at(s0, sign * (HW - CW));
          var fill = !inZone ? (root ? '#EFE6D0' : '#C6E2AC')
                   : root ? (grew ? '#CFE8C4' : '#E9DCC0')
                          : (grew ? '#A8D98C' : '#D9E9CC');
          out += '<path d="M' + f1(p1) + ' L' + f1(p2) + ' L' + f1(p3) + ' L' + f1(p4) + ' Z" fill="' + fill +
                 '" stroke="' + (root ? '#9A8459' : '#2C6E36') + '" stroke-width="1.3"/>';
          /* the divider between cells fades as the cell stretches: a stretched cell is longer,
             so its neighbours are further apart */
          /* the arrow says "this cell is elongating"; its length says by how much */
          if (grew) {
            var am = Math.min(5.5, (s1 - s0) * 0.16);
            out += dblArrow(at(s0 + am, sign * (HW - CW / 2)), at(s1 - am, sign * (HW - CW / 2)), root ? '#6B5A33' : '#1F5A31');
          }
        }
        return out;
      }
      s += chain(1) + chain(-1);

      /* the tip: the part that makes the auxin and reads the light, drawn as its own region
         because "the shoot" bending is never the answer — it is the TIP that detects */
      if (!root && S.top === 'intact') {
        var td = 'M' + f1(at(g.TIP, HW));
        for (var i6 = 1; i6 <= 4; i6++) td += ' L' + f1(at(g.TIP + (g.LEN - g.TIP) * i6 / 4, HW));
        var pT = at(g.LEN, 0), phT = pT[2];
        td += ' Q' + (pT[0] + Math.sin(phT) * HW * 0.95).toFixed(1) + ' ' + (pT[1] - Math.cos(phT) * HW * 0.95).toFixed(1) + ' ' + f1(at(g.LEN, -HW));
        for (var i7 = 3; i7 >= 0; i7--) td += ' L' + f1(at(g.TIP + (g.LEN - g.TIP) * i7 / 4, -HW));
        td += ' Z';
        s += '<path d="' + td + '" fill="#2F7D46" opacity=".55"/>';
        s += '<path d="M' + f1(at(g.TIP, HW)) + ' L' + f1(at(g.TIP, -HW)) + '" stroke="#1F5A31" stroke-width="1.8" stroke-dasharray="4 3"/>';
      }

      /* a detached tip, sitting back on the stump with something between it and the stump */
      if (putBack) {
        s += rider(bodyTop);
        s += '<rect x="' + (-HW) + '" y="-9" width="' + (HW * 2) + '" height="8" rx="2" fill="' +
             (S.layer === 'mica' ? '#B9BFC7' : '#F2E7C8') + '" stroke="' + (S.layer === 'mica' ? '#6C7681' : '#C9B77E') + '" stroke-width="1.5"/>';
        s += '<path d="M' + (tipOff - HW) + ' -9 v-26 q0 -16 ' + HW + ' -16 q' + HW + ' 0 ' + HW + ' 16 v26 Z" fill="#2F7D46" opacity=".72" stroke="#1F5A31" stroke-width="1.6"/>';
        s += '</g>';
        var tA = at(bodyTop + 30, tipOff), tB = at(bodyTop + 5, labU);
        s += ruled(tA[0], tA[1], 0, 0, 'the cut tip, put back');
        s += ruled(tB[0], tB[1], 0, 0, S.layer === 'mica' ? 'mica: nothing crosses' : 'gelatin: auxin crosses');
      }

      /* an agar block on a decapitated stump */
      if (!root && S.top === 'cut' && S.block !== 'none') {
        var bl = S.block.slice(-1) === 'L', hasA = S.block.indexOf('auxin') === 0;
        var bx0 = bl ? -HW : 0;
        s += rider(bodyTop);
        s += '<rect x="' + bx0 + '" y="-16" width="' + HW + '" height="16" rx="2" fill="' + (hasA ? '#F6DFAE' : '#EFEFE6') + '" stroke="' + (hasA ? '#C2921F' : '#B8B8AC') + '" stroke-width="1.6"/>';
        if (hasA) for (var q2 = 0; q2 < 4; q2++)
          s += '<circle cx="' + (bx0 + 6 + (q2 % 2) * 12) + '" cy="' + (-11 + Math.floor(q2 / 2) * 7) + '" r="2.6" fill="#F5A623" stroke="#B9761A" stroke-width=".8"/>';
        s += '</g>';
        var aA = at(bodyTop + 16, bx0 + HW / 2);
        s += ruled(aA[0], aA[1], 0, 0, hasA ? 'agar block soaked in auxin' : 'plain agar block (the control)');
      }

      /* Caps, collars and the plate are solid things wrapped round the outside of the organ,
         so they are collected here and laid down AFTER the auxin. Drawn in place, the grains
         inside a capped tip and the queue held up against the plate were painted over the top
         of them, and an opaque cap you could see the auxin through says the opposite of what
         an opaque cap is for. */
      var sOver = '';

      /* caps and collars */
      if (!root && S.top !== 'cut' && S.cover !== 'none') {
        if (S.cover === 'collar') {
          /* below the tip, not across it: the point of Darwin's control is that the TIP is bare */
          var sC = Math.max(24, (putBack ? bodyTop : g.TIP) - 24);
          sOver += rider(sC) + '<rect x="' + (-HW - 4) + '" y="-17" width="' + (HW * 2 + 8) + '" height="34" rx="3" fill="#4A4A4A" opacity=".95"/></g>';
          var cA = at(sC, labU < 0 ? -(HW + 4) : HW + 4);
          sOver += ruled(cA[0], cA[1], 0, 0, 'opaque collar; the tip is still bare');
        } else {
          /* The cap goes over whatever tip is up there: the organ's own apex, or the cut tip
             sitting on the stump — and it is deep enough to cover that tip and no deeper. On an
             intact shoot that is the whole shaded tip region plus a little of the stem below it;
             on a tip put back it stops flush with the joint, so the gelatin or the mica under it
             stays in plain sight. Built from the shoot's own apex at a fixed depth, it hung in
             the air beside a shifted tip and left the tip it was meant to blind uncovered. */
          var kS = putBack ? tipApex : g.LEN, kU = putBack ? tipOff : 0;
          var kD = putBack ? 42 : (g.LEN - g.TIP) + 5;
          sOver += rider(kS) + '<path d="M' + (kU - HW - 3) + ' ' + kD + ' v-' + kD + ' q0 -20 ' + (HW + 3) + ' -20 q' + (HW + 3) + ' 0 ' + (HW + 3) + ' 20 v' + kD + ' Z" fill="' +
               (S.cover === 'opaque' ? '#3A3A3A' : '#BFD8E8') + '" opacity="' + (S.cover === 'opaque' ? '.9' : '.55') + '" stroke="' + (S.cover === 'opaque' ? '#222' : '#7FA8C4') + '" stroke-width="1.6"/></g>';
          var kA = at(kS + 8, kU + (labU < 0 ? -(HW + 3) : HW + 3));   /* on the cap's crown, clear of the tip's own leader */
          sOver += ruled(kA[0], kA[1], 0, 0, S.cover === 'opaque' ? 'opaque cap: the tip is blind'
            : M.lit ? 'clear cap: the tip still sees' : 'clear cap: it lets light through');
        }
      }

      /* a mica sheet pushed down into one flank */
      /* Boysen-Jensen slit the shoot just below the tip and slid the plate in HORIZONTALLY,
         halfway across. It blocks what comes down that half. Drawn as a vertical slice down
         the flank it was not his experiment and did not match what the model was doing. */
      if (!root && S.top !== 'cut' && S.mica !== 'none') {
        var sgn = S.mica === 'left' ? -1 : 1, sM = Math.max(6, (putBack ? bodyTop : g.TIP) - 4);   /* under the tip */
        var m0 = at(sM, sgn * -2), m1 = at(sM, sgn * (HW + 16));
        sOver += '<path d="M' + f1(m0) + ' L' + f1(m1) + '" stroke="#6C7681" stroke-width="5.5" stroke-linecap="round"/>';
        var mid = at(sM, sgn * HW * 0.6);
        sOver += ruled(mid[0], mid[1], 0, 0, 'mica plate under half the tip: it holds this half back');
      }

      /* the root cap and its statoliths — the detector, and the thing that does the detecting */
      if (root) {
        if (S.cap === 'intact') {
          /* A root cap is blunt. A quadratic stretched far enough to cover the body's own tip
             came to a point instead, so it is a cubic: two controls out beyond the apex hold the
             curve wide, and the cap covers the root end without turning into a wedge. */
          var c1 = at(g.LEN + 30, HW * 0.85), c2 = at(g.LEN + 30, -HW * 0.85);
          s += '<path d="M' + f1(at(g.TIP, HW)) + ' C' + f1(c1) + ' ' + f1(c2) + ' ' + f1(at(g.TIP, -HW)) +
               ' Z" fill="#B59B6A" stroke="#8A7346" stroke-width="1.8"/>';
          for (var q3 = 0; q3 < 7; q3++) {
            var sss = g.TIP + 8 + Math.floor(q3 / 4) * 9;
            /* They must finish on the LOWER side — that is the whole observation. A fixed offset
               could not carry the grain that starts highest past the axis, so two of the seven
               settled above the centre line and the cap appeared to detect nothing. */
            var uFrom = -HW * 0.55 + (q3 % 4) * HW * 0.34;
            var uTo = HW * (0.26 + 0.14 * ((q3 % 4) / 3));
            var ps = at(sss, uFrom + (uTo - uFrom) * detect);
            s += '<circle cx="' + ps[0].toFixed(1) + '" cy="' + ps[1].toFixed(1) + '" r="3" fill="#6B5A33" opacity=".9"/>';
          }
          s += ruled(at(g.LEN - 12, 0)[0], at(g.LEN - 12, 0)[1], 396, 300, 'root cap: starch grains sink to the lower side', true);
        } else {
          s += '<path d="M' + f1(at(g.TIP, HW)) + ' L' + f1(at(g.TIP, -HW)) + '" stroke="#8A7346" stroke-width="2" stroke-dasharray="4 3"/>';
          s += ruled(at(g.TIP, 0)[0], at(g.TIP, 0)[1], 396, 300, 'root cap removed: nothing detects gravity', true);
        }
      }

      /* The concentration, as depth of colour. Twenty-six dots in a narrow lumen cannot show a
         two-to-one difference on their own — the eye reads two sparse clouds as one. A wash down
         each flank, as deep as that flank's share, says at a glance where the auxin is. */
      if (M.made > 0 && down > 0.02) {
        [[-1, M.dL], [1, M.dR]].forEach(function (fk) {
          var sg = fk[0], share = fk[1] / (M.made || 1);
          if (share <= 0.02) return;
          var lo = g.ZONE0 - 6, hi = Math.min(bodyTop, g.ZONE1 + 10), a = [], i2;
          for (i2 = 0; i2 <= 8; i2++) a.push(at(lo + (hi - lo) * i2 / 8, sg * (HW - CW + 1)));
          for (i2 = 8; i2 >= 0; i2--) a.push(at(lo + (hi - lo) * i2 / 8, sg * 1.5));
          s += '<path d="M' + a.map(f1).join(' L') + ' Z" fill="#F5A623" opacity="' +
               (share * 0.30 * down).toFixed(3) + '"/>';
        });
      }

      /* the auxin. Made evenly across the tip, spread sideways only if the tip has read a
         one-sided stimulus, then carried down. Nothing is destroyed on the way: the count
         of grains never changes, only where they end up, which is the point Briggs settled. */
      if (M.made > 0) {
        /* Many small grains rather than a few large ones. Nine against seventeen is a count
           you have to make; twenty-six against fifty is a density you simply see. */
        var N = 130, nL = Math.round(N * M.fL);
        /* A concentration is a GRADIENT across the tissue, not two separate groups with a gap
           down the middle. Two bands read as two clumps, and they say something false: auxin is
           everywhere in the shoot, just denser on one side. So each grain's position across the
           organ is drawn from a density that leans towards the fuller flank — the inverse of a
           linear distribution, which for a two-to-one split means twice as many grains arriving
           at one edge as at the other, with every value in between filled. */
        /* lean on what ARRIVES (dL/dR), not on what left the tip (fL/fR): with a plate holding
           one flank back, the cloud in the zone is even, and the difference is the queue above
           the plate rather than a gradient below it. */
        var mk = M.made || 1, lean = M.thru === 0 ? 0 : (M.dR - M.dL) / mk;
        /* The real split is about two to one, and two to one is not a difference the eye reads
           across a narrow shoot — it looks like scatter. So the DRAWING is deliberately steeper
           than the biology: roughly nine to one, which is unmistakable. The sentences and the
           verdict still say two to one, which is the number a student writes; the widget's own
           note says the picture leans harder than that on purpose. */
        /* A straight-line density cannot lean far enough: even at its limit it only puts three
           quarters of the grains on one side, which still reads as scatter. A power curve can put
           nine tenths of them there while still filling the whole width, so there is no gap and
           no second group — just a cloud heavily piled to one side. */
        var want = 0.5 + 0.4 * Math.min(1, Math.abs(lean) / 0.34);          /* 0.5 even, 0.9 leaning */
        var kSign = lean < 0 ? -1 : 1;
        var kExp = Math.abs(lean) < 0.02 ? 1 : Math.log(0.5) / Math.log(1 - want);
        /* Declared BEFORE the surplus that reads them: below it, both were still undefined
           when the queue was sized, so nQueue was always zero and the auxin waiting above the
           plate — the whole point of the plate — was never drawn. */
        var blockL = S.mica === 'left', blockR = S.mica === 'right';
        var surplus = blockL ? Math.max(0, M.fL * M.made - M.dL)
                    : blockR ? Math.max(0, M.fR * M.made - M.dR) : 0;
        var nQueue = Math.round(N * surplus / mk), queued = 0;
        function across(u01) {
          var x = 2 * Math.pow(u01, kExp) - 1;
          return kSign * (x < -1 ? -1 : x > 1 ? 1 : x);
        }
        /* Auxin is made WHERE THE SOURCE IS, and the source is not always the organ's own tip:
           a replaced tip sits above the cut face, and an agar block sits on it. Starting every
           grain at the stump's own height put the auxin below the very thing that made it, and
           in the replaced-tip states it began life already inside the elongation zone. */
        var srcLo, srcHi, srcU = 0;
        if (putBack) { srcLo = bodyTop + 12; srcHi = bodyTop + 46; srcU = tipOff; }
        else if (S.organ === 'shoot' && S.top === 'cut') { srcLo = bodyTop - 14; srcHi = bodyTop - 2; }
        else { srcLo = g.TIP + 4; srcHi = g.LEN - 8; }     /* the tip region itself */
        for (var q = 0; q < N; q++) {
          /* The R2 sequence — the plastic number's two reciprocals — which is built to spread
             points evenly in TWO dimensions. The golden ratio paired with something else is not:
             it laid the grains along visible diagonal chains, which read as structure that is not
             there. */
          var a1 = frac(0.5 + q * 0.7548776662), b1 = frac(0.5 + q * 0.5698402910);
          /* spread THROUGH the source region, not along one line across it: born on a single
             height, twenty-six grains read as a bar rather than as auxin being made */
          var sTop = srcLo + frac(b1 * 1.7 + a1 * 0.5) * (srcHi - srcLo);
          /* A tip or a block set to one side makes its auxin on that side. Starting even and
             sliding across would show a redistribution that never happened. */
          /* A block on half a stump makes its auxin in that half; a tip put back makes it
             across the whole of ITSELF, which for a shifted tip is not the middle of the
             stump. Reading only M.offset, a shifted tip made half its auxin in the air
             beside it. */
          var uEven = putBack ? srcU + (a1 * 2 - 1) * HW * 0.5
            : M.offset !== 0 ? M.offset * HW * (0.18 + 0.34 * b1)
            : (a1 * 2 - 1) * HW * 0.54;
          /* A low-discrepancy pair packed this densely starts to look like a lattice, which reads
             as pattern rather than as scattered grains. A small fixed offset per grain breaks it
             without making anything jump between frames. Declared BEFORE it is used: read one
             line too early it was undefined on the first grain, which put that grain at NaN — and
             every grain after it silently borrowed its predecessor's offset. */
          var js = (frac(a1 * 43.7 + b1 * 17.3) - 0.5) * 5.5, ju = (frac(a1 * 11.9 + b1 * 31.1) - 0.5) * 3.4;
          /* Where it ends up across the organ. With mica between tip and stump nothing gets
             down, so it settles inside the TIP — which for a shifted tip is off to one side. */
          var uSide = (M.thru === 0 ? srcU : 0) + across(b1) * HW * (M.thru === 0 ? 0.5 : 0.58) + ju;
          var side = uSide < 0 ? -1 : 1;
          /* The plate does not empty a flank; it holds that flank back to what the other one is
             carrying. The cloud already shows what ARRIVES, because the gradient is drawn from
             the delivered shares; what is left over is the surplus the plate is holding up, and
             it queues above the plate where a reader can see it waiting. */
          var plated = (side < 0 && blockL) || (side > 0 && blockR);
          var stopped = plated && queued < nQueue;
          if (stopped) queued++;
          var sEnd = M.thru === 0 ? srcLo + a1 * (srcHi - srcLo)   /* nothing crosses: it stays in the tip */
                   : stopped ? g.ZONE1 + 10 + b1 * 24              /* held up above the plate, in a queue */
                   : g.ZONE0 + 5 + a1 * (g.ZONE1 - g.ZONE0 - 10) + js;

          /* ONE continuous journey per grain, not three stages for all of them together. Staged,
             the whole cloud sat at the tip, then split into two groups, then slid down — which is
             where the robotic, stepping look came from, and it showed a separation happening in
             one place at one moment. Each grain now appears at its own moment and drifts sideways
             WHILE it travels down, so what you see is a stream leaving the tip and fanning to one
             side: the same biology, told as a flow. */
          var born = frac(a1 * 3.1 + b1 * 0.7) * 0.34;
          var age = clamp((p - born) / Math.max(0.2, 0.86 - born));
          if (age > 0) {
            var es = age < 0.5 ? 2 * age * age : 1 - Math.pow(-2 * age + 2, 2) / 2;   /* along the shoot */
            var eu = clamp(age * 1.6); eu = eu * eu * (3 - 2 * eu);                   /* across it, settling sooner */
            var s2 = sTop + (sEnd - sTop) * es;
            var u2 = uEven + (uSide - uEven) * eu;
            var pg = at(Math.max(4, s2), u2);
            var opa = Math.min(1, age * 7);
            s += '<circle cx="' + pg[0].toFixed(1) + '" cy="' + pg[1].toFixed(1) + '" r="1.55" fill="#F0900E" opacity="' + opa.toFixed(2) + '"/>';
          }
        }
      }

      s += sOver;                                  /* the apparatus, over the auxin it contains */

      /* the ruled labels for the parts that are always there */
      if (!root) {
        if (S.top === 'intact') {
          /* the second clause has to follow the state: a capped tip detects nothing, and a shoot
             lying in the dark is reading gravity, not light */
          var tipSays = 'shoot tip: makes the auxin'
            + (M.lit ? ', and detects the light'
               : S.cover === 'opaque' ? ''            /* the cap's own label says it is blind */
               : S.lay === 'side' ? ', and reads which way is down' : '');
          var tp = at(S.cover === 'none' ? g.LEN - 16 : g.TIP + 8, labU);
          s += ruled(tp[0], tp[1], 0, 0, tipSays);
        }
        else {
          var sp = at(bodyTop - 12, labU);
          s += ruled(sp[0], sp[1], 0, 0, S.top === 'cut'
            ? 'the stump: no tip, so no auxin of its own'
            : S.layer === 'mica' ? 'the stump: the mica keeps the tip\'s auxin out'
            : 'the stump: the tip\'s auxin passes into it');
        }
        var pe = at((g.ZONE0 + g.ZONE1) / 2, labU);
        s += ruled(pe[0], pe[1], 0, 0, 'zone of elongation');
        if (S.lay === 'side') {
          s += '<rect x="0" y="0" width="' + g.BX + '" height="' + g.H + '" fill="#E4D9C3"/>';
          s += '<line x1="' + g.BX + '" y1="0" x2="' + g.BX + '" y2="' + g.H + '" stroke="#B79E74" stroke-width="2"/>';
          /* On a phone the window is cropped to x >= vx, and these words were centred on a strip
             of pot that is mostly outside it, so the label sat off the canvas in every sideways
             state. The short form fits the piece of pot that is actually showing. */
          var potX = narrow ? vx + (g.BX - vx) / 2 : g.BX / 2;
          s += '<text class="ax__s" x="' + potX + '" y="22" text-anchor="middle">' +
               (narrow ? 'the pot' : 'the pot, on its side') + '</text>';
          var gx = narrow ? vx + vw - 44 : 560;
          s += '<g opacity="' + (0.3 + 0.7 * detect).toFixed(2) + '"><line x1="' + gx + '" y1="300" x2="' + gx + '" y2="352" stroke="#7A7A7A" stroke-width="2.4"/>' +
               '<path d="M' + gx + ' 358 l-6 -10 h12 Z" fill="#7A7A7A"/><text class="ax__s" x="' + gx + '" y="290" text-anchor="middle">gravity</text></g>';
        } else {
          s += '<rect x="0" y="' + g.BY + '" width="' + g.W + '" height="' + (g.H - g.BY) + '" fill="#E4D9C3"/>';
          s += '<line x1="0" y1="' + g.BY + '" x2="' + g.W + '" y2="' + g.BY + '" stroke="#B79E74" stroke-width="2"/>';
        }
      } else {
        var pr = at((g.ZONE0 + g.ZONE1) / 2, labU);
        s += ruled(pr[0], pr[1], 0, 0, 'zone of elongation');
        /* Correcting towards the vertical overshoots, and the tip is knocked aside by stones.
           Both are real, and together they are why a root in soil follows a wavy path. */
        if (grow > 0.85 && M.sees) {
          /* The path has to leave the tip pointing where the tip points, and start beyond the cap
             rather than inside it. Built in screen coordinates with a fixed downward step it left
             the root at 26 degrees off its own heading, out of the middle of the cap. */
          var e0 = at(g.LEN, 0), ph0 = e0[2], DOWN = Math.PI;
          var off0 = HW * 1.7;                /* start beyond the cap, not inside it */
          var cx = e0[0] + Math.sin(ph0) * off0, cy = e0[1] - Math.cos(ph0) * off0;
          var pts = [[cx, cy]];
          /* It goes on turning towards the vertical, which is what a correcting root does — and
             it keeps the path in the empty soil below rather than running it out to the right
             through the words. */
          for (var wv = 1; wv <= 22; wv++) {
            var ph = ph0 + (DOWN - ph0) * Math.min(1, wv / 22 * 2.2);
            cx += Math.sin(ph) * 5; cy -= Math.cos(ph) * 5;
            var across = Math.sin(wv / 2.8) * 9;
            pts.push([cx + Math.cos(ph) * across, cy + Math.sin(ph) * across]);
          }
          s += '<path d="M' + pts.map(f1).join(' L') + '" fill="none" stroke="#9A8459" stroke-width="2.4" stroke-dasharray="5 4" opacity=".65"/>';
          var wLab = pts[narrow ? 8 : 13];   /* a pin must sit inside the cropped box */
          s += ruled(wLab[0], wLab[1], 0, 0, 'it overshoots and corrects, so the path waves');
        }
      }

      /* NOW the labels are known, so the band they need can be measured and the box opened to
         hold it. Measured before they were collected it was always zero, and the words landed on
         the drawing they were describing. */
      var band = narrow ? pinBand(vw) : 0;
      /* a fixed strip below the drawing for the narration: fixed, because a band that grew and
         shrank with each sentence would resize the drawing five times a run */
      var capH = (narrow && capNow) ? 46 : 0;
      if (capH) {
        var cw = Math.max(30, Math.floor((vw - 24) / 5.0));
        wrapText(capNow, cw).slice(0, 3).forEach(function (ln, i) {
          s += '<text class="ax__pintxt" x="' + (vx + 10) + '" y="' + (g.H + 15 + i * 13).toFixed(1) + '">' + ln + '</text>';
        });
        s += '<path d="M' + (vx + 6) + ' ' + (g.H + 3) + ' H' + (vx + vw - 6) + '" stroke="#E0DAC9" stroke-width="1"/>';
      }
      var head = '<svg viewBox="' + vx + ' ' + (-band) + ' ' + vw + ' ' + (g.H + band + capH) +
                 '" role="img" aria-label="' + verdictPlain(M) + '">' +
                 '<rect x="' + (vx - 4) + '" y="' + (-band - 4) + '" width="' + (vw + 8) +
                 '" height="' + (g.H + band + capH + 8) + '" fill="' + bg + '"/>';
      stage.innerHTML = head + s + (narrow ? pinLabels(g, vx, vw, band) : placeLabels(g, labRight)) + '</svg>';
    }

    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function frac(v) { return v - Math.floor(v); }

    /* A double-headed arrow lying along a cell, drawn only inside cells that are actually
       elongating. It is the elongation itself made visible: each arrow is as long as the cell
       it sits in, so the flank that stretched more carries visibly longer arrows than the one
       that did not. A label can only assert that; this shows it. */
    function dblArrow(pA, pB, col) {
      var dx = pB[0] - pA[0], dy = pB[1] - pA[1], L = Math.hypot(dx, dy) || 1;
      if (L < 11) return '';
      var ux = dx / L, uy = dy / L, hd = Math.min(4.4, L * 0.26);
      var o = '<line x1="' + pA[0].toFixed(1) + '" y1="' + pA[1].toFixed(1) +
              '" x2="' + pB[0].toFixed(1) + '" y2="' + pB[1].toFixed(1) +
              '" stroke="' + col + '" stroke-width="1.5" stroke-linecap="round"/>';
      [[pA, 1], [pB, -1]].forEach(function (e) {
        var q = e[0], sg = e[1];
        var bx = q[0] + ux * hd * sg, by = q[1] + uy * hd * sg;
        var nx = -uy * hd * 0.62, ny = ux * hd * 0.62;
        o += '<path d="M' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + ' L' + (bx + nx).toFixed(1) + ' ' + (by + ny).toFixed(1) +
             ' M' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + ' L' + (bx - nx).toFixed(1) + ' ' + (by - ny).toFixed(1) +
             '" stroke="' + col + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
      });
      return o;
    }

    /* ----- what the student is told, built from the model and not from a table ----- */
    var STEPS = [
      [0.00, function (M) { return S.organ === 'root'
        ? 'Auxin travels down and gathers at the root tip.'
        : M.made <= 0 ? 'There is no auxin here to move.'
        : S.top === 'cut' ? 'Auxin passes from the block into the side it stands on.'
        : S.top !== 'intact' ? 'Auxin is made in the cut tip, which is sitting back on the stump.'
        : 'Auxin is made in the shoot tip — in the light or in the dark.'; }],
      [0.18, function (M) { return S.organ === 'root'
        ? (M.sees ? 'In the root cap, heavy starch grains sink. That is how the root feels gravity.'
                  : 'With the cap gone there is nothing to detect gravity.')
        : S.lay === 'side'
          ? (M.made === 0 ? 'Lying down, so gravity acts. But with no tip there is no auxin for it to move.'
             : M.lit ? 'Lying down, and lit from above. Gravity and light push the same way, so this run cannot tell you which did it.'
             : S.light === 'dark' ? 'Lying down, in the dark. Gravity is the only stimulus.'
             : 'The cap keeps light off the tip, so gravity is the only stimulus.')
        : (M.sees ? 'The tip detects light coming from one side.'
                  : (S.cover === 'opaque' ? 'The cap blocks the light, so the tip detects nothing.'
                     : S.light === 'dark' ? 'It is dark. There is nothing to detect.'
                     : S.light === 'top' ? 'Light from straight above falls on both sides equally.'
                     : 'Nothing one-sided is detected.')); }],
      [0.36, function (M) { return M.made === 0 ? 'Nothing to move.'
        : M.offset !== 0 ? 'The auxin can only enter the side it is sitting on.'
        : M.sees ? (S.organ === 'root' || S.lay === 'side' ? 'Auxin is carried across to the LOWER side. None is destroyed.'
                    : 'Auxin is carried across to the shaded side. None is destroyed.')
        : 'The auxin stays evenly spread.'; }],
      [0.58, function (M) { return M.made === 0 ? 'No auxin travels down.'
        : M.note ? 'The plate holds that side back.'
        : 'The auxin travels down to the zone of elongation.'; }],
      [0.78, function (M) {
        var diff = Math.abs(M.gL - M.gR) > 0.04;
        if (M.made === 0 && S.organ === 'shoot') return 'No auxin reaches the cells, so nothing elongates.';
        if (!diff) return S.organ === 'root'
          ? 'Both sides get the same, so the root grows straight.'
          : 'Both sides get the same, so the shoot grows straight.';
        var more = M.gL > M.gR ? 'left' : 'right';
        if (S.organ === 'root') return 'More auxin below. In a root that HOLDS CELLS BACK, so the upper side stretches and the root bends down.';
        if (S.lay === 'side') return M.bend < 0
          ? 'More auxin below. In a shoot that means MORE elongation, so the lower side stretches and the shoot turns up.'
          : 'Both flanks get the same, so it goes on lying where it is.';
        return 'The ' + (M.dL > M.dR ? 'left' : 'right') + ' side has more auxin, so those cells elongate more. That flank is now longer, so the shoot bends ' +
            (M.sees && M.offset === 0 ? 'towards the light.' : 'the other way, to the ' + (M.gL > M.gR ? 'right.' : 'left.')); }]
    ];

    function verdictPlain(M) {
      var diff = Math.abs(M.gL - M.gR) > 0.04;
      if (S.organ === 'root') return diff ? 'A root bending downwards' : 'A root growing straight';
      if (M.made === 0) return 'A shoot that is not growing';
      if (S.lay === 'side') return diff ? 'A shoot lying on its side, turning upwards' : 'A shoot lying on its side, growing straight on';
      return diff ? 'A shoot bending to the ' + (M.gL > M.gR ? 'right' : 'left') : 'A shoot growing straight up';
    }

    function paintKey(M) {
      var it = [], hasAuxin = !M || M.made > 0;
      var hasArrows = !M || (M.made > 0 && (M.gL > 0.02 || M.gR > 0.02));
      function sw(inner) { return '<svg class="ax__sw" viewBox="0 0 16 16" aria-hidden="true">' + inner + '</svg>'; }
      if (hasAuxin) it.push([sw('<circle cx="8" cy="8" r="5" fill="#F5A623" stroke="#B9761A" stroke-width="1.4"/><circle cx="6.4" cy="6.4" r="1.7" fill="#FFE7B5"/>'), 'auxin']);
      it.push([sw('<rect x="2" y="3" width="12" height="10" rx="1.5" fill="' + (S.organ === 'root' ? '#E9DCC0' : '#C6E2AC') + '" stroke="' + (S.organ === 'root' ? '#9A8459' : '#2C6E36') + '" stroke-width="1.6"/>'), 'one cell']);
      if (hasArrows) it.push([sw('<g stroke="' + (S.organ === 'root' ? '#6B5A33' : '#1F5A31') + '" stroke-width="1.6" fill="none" stroke-linecap="round">' +
                  '<line x1="3" y1="8" x2="13" y2="8"/><path d="M3 8 L6 5 M3 8 L6 11 M13 8 L10 5 M13 8 L10 11"/></g>'),
               'this cell is elongating — the longer the arrow, the more it has stretched']);
      if (S.organ === 'root' && S.cap === 'intact')
        it.push([sw('<circle cx="8" cy="8" r="4.4" fill="#6B5A33"/>'), 'starch grain (statolith)']);
      if (S.organ === 'shoot' && S.mica !== 'none')
        it.push([sw('<rect x="1" y="6.5" width="14" height="3.4" rx="1.7" fill="#6C7681"/>'), 'mica — nothing crosses it']);
      if (S.organ === 'shoot' && S.top !== 'intact' && S.top !== 'cut')
        it.push([sw('<rect x="1.5" y="5.5" width="13" height="5.5" rx="1.2" fill="' + (S.layer === 'mica' ? '#B9BFC7' : '#F2E7C8') + '" stroke="' + (S.layer === 'mica' ? '#6C7681' : '#C9B77E') + '" stroke-width="1.4"/>'), S.layer === 'mica' ? 'mica layer' : 'gelatin — auxin crosses it']);
      if (S.organ === 'shoot' && S.top === 'cut' && S.block !== 'none')
        it.push([sw('<rect x="1.5" y="3" width="13" height="10" rx="1.2" fill="' + (S.block.indexOf('auxin') === 0 ? '#F6DFAE' : '#EFEFE6') + '" stroke="' + (S.block.indexOf('auxin') === 0 ? '#C2921F' : '#B8B8AC') + '" stroke-width="1.4"/>'), S.block.indexOf('auxin') === 0 ? 'agar block with auxin' : 'plain agar block']);
      key.innerHTML = it.map(function (x) { return '<span class="ax__keyi">' + x[0] + x[1] + '</span>'; }).join('');
    }

    function verdict(M) {
      var diff = Math.abs(M.gL - M.gR) > 0.04, out = '';
      var line = S.organ === 'root'
        ? (diff ? 'The root bends <b>downwards</b>.' : 'The root grows <b>straight</b>.')
        : M.made === 0 ? 'The shoot <b>does not grow and does not bend</b>.'
        : S.lay === 'side'
          ? (diff && M.bend < 0 ? 'The shoot turns <b>upwards</b> — <b>negative gravitropism</b>.'
             : diff ? 'The shoot curves <b>downwards</b>.'
             : 'The shoot grows straight on, <b>still lying down</b>.')
        : diff ? 'The shoot bends <b>' + (M.gL > M.gR ? 'to the right' : 'to the left') + '</b>' +
                 (M.sees && M.offset === 0 ? ' — <b>towards the light</b>.' : '.')
               : 'The shoot grows <b>straight</b>.';
      out += '<p class="ax__res">' + line + '</p>';

      var pts = [];
      if (S.organ === 'root') {
        pts.push(M.sees ? 'The root cap detects gravity: starch grains sink to the lower side.'
                        : 'With no root cap, gravity is not detected, so the auxin stays even.');
        if (M.sees) {
          pts.push('Auxin is carried to the lower side of the root.');
          pts.push('In a <b>root</b>, a high auxin concentration <b>inhibits</b> cell elongation — the opposite of its effect in a shoot.');
          pts.push('So the lower cells elongate less, the upper cells elongate more, and the root curves down.');
          pts.push('The correction overshoots slightly and stones knock the tip off course, which is why a real root follows a wavy path rather than a straight one.');
        }
      } else {
        if (S.lay === 'side' && M.made > 0) {
          pts.push('Lying down, the tip reads gravity and sends auxin to the LOWER flank.');
          if (M.lit) pts.push('The lamp overhead also shades the lower flank, so light and gravity are pushing the auxin the same way. Run it again in the dark and only gravity is left — that is the control that makes the result mean something.');
          else if (S.light === 'dark') pts.push('In the dark there is no light to confuse it, so the turn upwards can only be a response to gravity.');
          else pts.push('The cap keeps the light off the tip, so although the lamp is on, gravity is the only stimulus the shoot can read.');
          pts.push('More auxin on the lower flank makes those cells <b>elongate</b> more, so the lower side becomes longer and the shoot curves up. A shoot is <b>negatively gravitropic</b>.');
        }
        else if (S.lay === 'side') {
          pts.push('Gravity is still acting on it, and with its tip it would answer. Auxin is made in the tip, so with the tip gone there is none to send to the lower flank.');
          pts.push('Nothing elongates, so it stays where it was laid. The tip is needed for gravitropism just as it is for phototropism.');
        }
        else if (M.made === 0) pts.push(S.top === 'cut' && S.block.indexOf('plain') === 0
          ? 'Plain agar carries no auxin, so there is still no source. This is the control that shows it is the auxin in the block that matters, not the block.'
          : S.layer === 'mica' && S.top !== 'cut' ? 'Mica lets nothing through, so no auxin reaches the stump from the tip above it.'
          : 'Auxin is made in the tip. With the tip gone there is no auxin, so no cells elongate.');
        else if (S.lay !== 'side') {
          pts.push(M.offset !== 0
            ? 'The auxin can only enter the side it sits on, so that side gets nearly all of it.'
            : M.sees ? 'The tip detects the light and carries auxin across to the shaded side, about two parts to one. The total is unchanged: light moves auxin, it does not destroy it.'
            : S.cover === 'opaque' ? 'The cap stops light reaching the tip, so no side is favoured and the auxin stays even.'
            : S.cover === 'collar' ? 'The collar covers the stem but not the tip. The tip is the detector, so the response happens anyway.'
            : 'Nothing one-sided reaches the tip, so the auxin stays evenly spread.');
          if (M.note && Math.abs(M.gL - M.gR) < 0.04) pts.push('The plate stops the extra auxin travelling down that flank, so the difference never reaches the elongating cells and there is no curvature. That is the result Boysen-Jensen got with the plate on the shaded side.');
          else if (M.note) pts.push('The plate is on the lit flank, which was carrying less auxin anyway, so it holds nothing back that mattered and the shoot bends as it would have done. That is the control for the other arrangement.');
          else if (Math.abs(M.gL - M.gR) > 0.04) pts.push('More auxin on one side makes those cells take in more water and <b>elongate</b> more. One flank longer than the other can only be a curve.');
          else pts.push('Both flanks elongate equally, so there is nothing to bend it.');
        }
      }
      out += '<ul class="ax__pts">' + pts.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
      if (M.who) out += '<p class="ax__who">This is the arrangement used by <b>' + M.who + '</b>.</p>';
      return out;
    }

    function run() {
      var M = model();
      if (S.t) { clearInterval(S.t); S.t = null; }
      paintKey(M);
      why.innerHTML = '';
      var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (still) { S.p = 1; capNow = ''; draw(M, 1); capt.textContent = ''; capt.hidden = true; why.innerHTML = verdict(M); return; }
      /* Five sentences in 4.6 seconds is under a second each — unreadable, and most of the
         class is reading in their second language. Nearly ten seconds gives about two seconds a
         line, and the button re-runs it. */
      var t0 = Date.now(), MS = 9600, shown = -1;
      capt.hidden = false;
      S.p = 0; draw(M, 0);
      S.t = setInterval(function () {
        var p = Math.min(1, (Date.now() - t0) / MS);
        S.p = p; draw(M, p);
        for (var i = STEPS.length - 1; i >= 0; i--) {
          if (p >= STEPS[i][0]) {
            if (shown !== i) {
              shown = i; capNow = STEPS[i][1](M);
              /* on a narrow box the words go INSIDE the drawing, under it, so they are read at the
                 same eye level as the thing they are describing instead of somewhere below it */
              capt.textContent = narrow ? '' : capNow; capt.hidden = narrow;
              if (narrow) draw(M, p);
            }
            break;
          }
        }
        if (p >= 1) {
          clearInterval(S.t); S.t = null;
          capt.textContent = ''; capt.hidden = true; capNow = ''; draw(M, 1);   /* the narration is done; the result speaks for itself */
          why.innerHTML = verdict(M);
        }
      }, 40);
    }

    /* Start and Reset sit directly under the controls, where the settings are made — not in
       the header. You set the apparatus up and then start it, which is the order the experiment
       happens in, and it is the difference between watching the run and scrolling past it. */
    var goBtn = h('button', 'ax__go', '↻ Run it again');
    goBtn.type = 'button';
    goBtn.addEventListener('click', run);
    var resetBtn = h('button', 'ax__rst', '↺ Reset');
    resetBtn.type = 'button';
    resetBtn.addEventListener('click', function () {
      if (S.t) { clearInterval(S.t); S.t = null; }
      S.organ = 'shoot'; S.lay = 'up'; S.light = 'left'; S.top = 'intact'; S.layer = 'gel';
      S.cover = 'none'; S.mica = 'none'; S.block = 'none'; S.cap = 'intact';
      buildPanel(); run();
    });
    acts.appendChild(goBtn); acts.appendChild(resetBtn);

    /* On the station page the drawing stands in the plant's column, so a change to the controls
       is seen at once instead of being scrolled past. In the Practise column the whole widget is
       already there, so it stays where it is. */
    /* The drawing takes the plant's column while the student is looking at this widget, and
       gives it back when they have scrolled past. Moving it OUT of the text for good would be
       simpler, but then the page would be a different height while it was away and the scroll
       position would jump under the reader's hand. So on a wide screen the block lives in the
       column from the start and only its VISIBILITY follows the scroll: the page geometry never
       changes, so nothing can flap. */
    var wideQ = window.matchMedia('(min-width: 1001px)');
    /* below that the plant is a sticky strip across the top of the page rather than a column
       beside it — the same place, just turned through ninety degrees */
    var stripQ = window.matchMedia('(max-width: 1000px) and (min-height: 561px)');
    var staged = null, tick = 0;

    function host() { return document.getElementById('simHost'); }
    function owned() { var hs = host(); return !!(hs && hs.contains(box)); }   /* the Practise column has the lot */

    /* Where the drawing lives: in the plant's column beside the text, in the sticky strip above
       it, or inline in the text. In the column there is room for the words that read the drawing
       to go with it; the strip is only about a third of a phone screen, so the drawing goes there
       alone and its words stay in the text below, where there is room to read them. */
    function mode() {
      if (!spec.onStage || owned() || !host()) return 'flow';
      if (wideQ.matches) return 'column';
      if (stripQ.matches) return 'strip';
      return 'flow';
    }

    function mount() {
      var hs = host(), m = mode();
      if (m === 'column') {
        if (pack.parentNode !== hs) { hs.innerHTML = ''; hs.appendChild(pack); }
      } else {
        if (pack.parentNode !== slot) slot.appendChild(pack);
        if (m === 'strip') { if (stage.parentNode !== hs) { hs.innerHTML = ''; hs.appendChild(stage); } }
        else if (stage.parentNode !== pack) pack.insertBefore(stage, pack.firstChild);
      }
      box.classList.toggle('ax--split', m === 'column');
      box.classList.toggle('ax--strip', m === 'strip');
      if (m === 'flow' && staged !== null) { staged = null; if (global.Plate && global.Plate.stageSim) global.Plate.stageSim(false); }
      if (m !== 'flow') { staged = null; look(); }
      watch();
      var was = narrow; gauge();
      if (narrow !== was) run();          /* the label style changed, so the drawing must be remade */
    }
    box.__onMove = mount;

    /* Which box actually scrolls changes with the layout: the notes column on a wide screen,
       the whole stage on a phone. Naming one of them by class worked on the desktop and meant the
       swap never fired on a phone, because the element being listened to never moved. */
    function scrollerOf(el) {
      var n = el && el.parentNode;
      while (n && n.nodeType === 1) {
        var st = window.getComputedStyle(n);
        if (/(auto|scroll)/.test(st.overflowY) && n.scrollHeight > n.clientHeight + 4) return n;
        n = n.parentNode;
      }
      return null;
    }
    function reading() {
      var r = panel.getBoundingClientRect(), sc = scrollerOf(box) || scroller;
      var t = 0, b = window.innerHeight || 800;
      if (sc) { var q = sc.getBoundingClientRect(); t = q.top; b = q.bottom; }
      /* in the strip the drawing sits ABOVE the text, so the band that counts as "level with it"
         has to start below the strip, not at the top of the scrolling box */
      var hs = host(), lead = (mode() === 'strip' && hs) ? hs.getBoundingClientRect().height : 0;
      return r.bottom > t + lead + 40 && r.top < b - 40;
    }
    /* Staging can change the height of the strip — most of all when it has to open a fold the
       reader had closed — and that moves the page under them. The widget then finds itself
       outside the band that put it there, unstages, the strip shrinks back, and it is inside
       again: the flicker. Measuring the widget before and after and correcting the scroll by the
       difference removes the shift, and with it the loop. */
    function say(v) {
      if (v === staged) return;
      staged = v;
      var sc = scrollerOf(box), before = box.getBoundingClientRect().top;
      if (global.Plate && global.Plate.stageSim) global.Plate.stageSim(v);
      if (sc) {
        var moved = box.getBoundingClientRect().top - before;
        if (Math.abs(moved) > 1) sc.scrollTop += moved;
      }
    }
    function look() {
      if (!box.isConnected) { detach(); return; }
      if (mode() === 'flow') return;
      say(reading());
    }

    /* An observer rather than a scroll handler: it is told when the widget comes level with the
       reader whatever box is doing the scrolling, and it is told at layout changes too, which a
       scroll listener never hears. The band it watches starts BELOW the strip, because on a phone
       the strip covers the top of the page and anything under it is not being read. */
    var io = null;
    function watch() {
      if (io) { io.disconnect(); io = null; }
      var m = mode(); if (m === 'flow' || !window.IntersectionObserver) return;
      var col = document.querySelector('.platecol');
      var lead = (m === 'strip' && col) ? Math.round(col.getBoundingClientRect().height) : 0;
      /* One band, fixed. Making it depend on whether the widget was already staged meant
         rebuilding the observer every time the state changed, and the rebuilt observer answered
         the boundary case differently from the one that had just fired — so at a scroll position
         right on the edge it turned on, rebuilt, turned off, rebuilt, on again. That was the
         flicker: not the scrolling, but the widget arguing with itself. */
      var edge = 30;
      try {
        io = new IntersectionObserver(function (es) {
          if (!es || !es.length) return;
          say(!!es[es.length - 1].isIntersecting);
        }, { root: scrollerOf(box) || null, rootMargin: (-lead - edge) + 'px 0px ' + (-edge) + 'px 0px', threshold: 0 });
        /* Watch the CONTROLS, not the whole widget. Staging lifts the drawing out of the widget,
           which makes the widget about 260 px shorter — so a widget observed whole would leave the
           band the instant it was staged, come back the instant it was not, and flicker all the
           way down the page. The controls never move and never change size, and they are the part
           a reader is actually working with. */
        io.observe(panel);
      } catch (e) { io = null; }
    }
    /* The observer decides whether the drawing is staged, and NOTHING else does. A scroll
       handler testing the same thing with a band of its own disagreed with the observer near the
       edges, and the two of them took turns setting the state — on, off, on, off, all the way
       down the page. That was the flicker. This only re-measures the box, for the label style. */
    function onScroll() {
      if (tick) return;
      tick = requestAnimationFrame(function () {
        tick = 0;
        var was = narrow; gauge();
        if (narrow !== was) { run(); watch(); }
      });
    }
    var scroller = null;
    /* Scroll events do not bubble, but they DO capture, so one listener at the document catches
       whichever box is scrolling. Resolving the scroller once at startup was fragile: on a phone
       the element that scrolls is not the one that scrolls on a desktop, and at the moment the
       widget is built the layout may not have settled enough to tell which it is. */
    function attach() {
      scroller = scrollerOf(box);
      document.addEventListener('scroll', onScroll, { passive: true, capture: true });
      window.addEventListener('resize', onScroll, { passive: true });
    }
    function detach() {
      if (io) { io.disconnect(); io = null; }
      if (tick) { cancelAnimationFrame(tick); tick = 0; }
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      wideQ.removeEventListener('change', onWide);
      stripQ.removeEventListener('change', onWide);
    }
    var onWide = function () { if (box.isConnected) mount(); else detach(); };
    wideQ.addEventListener('change', onWide);
    stripQ.addEventListener('change', onWide);

    buildPanel();
    requestAnimationFrame(function () { attach(); gauge(); mount(); run(); });
    box.appendChild(h('p', 'widget__note', 'The bend is not drawn on. Each flank of the elongation zone is drawn to the length its own auxin has earned it, and a column whose one side is longer than the other can only be a curve. Change the apparatus and the biology, not a stored answer, decides what happens. One thing is drawn harder than it happens: the real split is about two parts to one, and the picture leans nearer nine to one, because two to one across a shoot this narrow is not a difference an eye can read. Write two to one.'));
    box.__onReset = function () { if (S.t) clearInterval(S.t); detach(); };
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
      '<ellipse data-part="ovary" class="fl__ovary" cx="250" cy="224" rx="38" ry="44"/>' +
      /* At (227,252) and (273,252) both nectaries fell INSIDE the ovary ellipse, which is painted
         after them — so every click on a nectary hit the ovary and the part could not be chosen
         at all. Moved down to the base of the ovary, where a nectary sits anyway, and drawn after
         it so nothing can bury them again. */
      '<path data-part="nectary" class="fl__nectary" d="M223 264 a5 5 0 1 0 -10 0 a5 5 0 1 0 10 0 M297 264 a5 5 0 1 0 -10 0 a5 5 0 1 0 10 0"/>' +
      '<circle data-part="ovule" class="fl__ovule" cx="232" cy="230" r="9"/><circle data-part="ovule" class="fl__ovule" cx="256" cy="206" r="9"/><circle data-part="ovule" class="fl__ovule" cx="262" cy="240" r="9"/>' +
      '<path data-part="style" class="fl__style" d="M244 182 C244 150 245 120 246 84 H254 C255 120 256 150 256 182 Z"/>' +
      '<ellipse data-part="stigma" class="fl__stigma" cx="250" cy="72" rx="17" ry="10"/>';
    var labels = '';
    if (labelled) {
      /* two columns, each ordered by the height of what it names, so no two lines cross:
         the parts on the flower's axis and its right side read to the right, the petal and
         the sepal to the left */
      var R = [[250, 72, 'stigma'], [336, 110, 'anther'], [251, 130, 'style'], [312, 176, 'filament'], [286, 224, 'ovary'], [262, 240, 'ovule'], [292, 264, 'nectary', true]];
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
  /* A drawing may be several panels tall. "water#cohesion" crops the viewBox to that panel, so
     a reader who clicked "cohesion" is shown cohesion rather than the top of the sheet and a
     scrollbar they may not notice. The panels are declared beside the drawing. */
  var PANELS = {
    water: { charges: [0, 0, 440, 198], polar: [0, 196, 440, 154],
             cohesion: [0, 348, 440, 182], adhesion: [0, 530, 440, 154] }
  };
  function svgFor(name) {
    var part = null, i = String(name).indexOf('#');
    if (i > 0) { part = name.slice(i + 1); name = name.slice(0, i); }
    var d = DIAGRAMS[name]; if (!d) return '';
    var box = part && PANELS[name] && PANELS[name][part];
    if (!box) return d.svg;
    return d.svg.replace(/viewBox="[^"]*"/, 'viewBox="' + box.join(' ') + '"');
  }

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

  [['video', video], ['germinate', germinate], ['equation', equation], ['limitgraph', limitgraph], ['watch', watch], ['pondweed', pondweed], ['starchtest', starchtest], ['indicator', indicator],
   ['potometer', potometer], ['sourcesink', sourcesink], ['auxin', auxin], ['diagram', diagram], ['pollentube', pollentube], ['adapt', adapt]]
    .forEach(function (m) { W.register(m[0], m[1]); });

  global.Learn = { widget: W.widget, reap: W.reap, svgFor: svgFor, DIAGRAMS: DIAGRAMS, PART_INFO: PART_INFO };
})(window);
