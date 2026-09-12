/* Small figures that sit beside a sentence, with the text running round them.
   Not illustrations of a whole station — one idea each, at about the size of a
   postage stamp, for a reader who takes a picture in faster than a clause.
   Every one is stroke-and-fill only: no text inside, because at 120 px nothing
   readable fits, and the sentence beside it is the caption. */
(function (global) {
  var SHC = ['#C6E2AC', '#A8D98C', '#2C6E36'];   /* shoot cell, stretched shoot cell, its outline */
  var RTC = ['#F0E7D2', '#D3EAC8', '#9A8459'];   /* the same three for a root */
  var G = '#2C6E36', GL = '#54AC5C', GP = '#C6E2AC', A = '#F5A623', AD = '#B9761A',
      S = '#C9B896', SD = '#8A7346', SOIL = '#E4D9C3', W = '#4E93C9', WL = '#BFD8E8', GREY = '#7A7A7A';

  function svg(vb, body, label) {
    return '<svg viewBox="' + vb + '" class="minifig__svg" role="img" aria-label="' + label + '">' + body + '</svg>';
  }
  /* a small arrow, from (x1,y1) to (x2,y2) */
  function arr(x1, y1, x2, y2, col, w) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    var hx = x2 - ux * 5, hy = y2 - uy * 5, px = -uy * 2.6, py = ux * 2.6;
    return '<path d="M' + x1 + ' ' + y1 + ' L' + hx.toFixed(1) + ' ' + hy.toFixed(1) + '" stroke="' + col +
           '" stroke-width="' + (w || 2) + '" stroke-linecap="round" fill="none"/>' +
           '<path d="M' + x2 + ' ' + y2 + ' L' + (hx + px).toFixed(1) + ' ' + (hy + py).toFixed(1) +
           ' L' + (hx - px).toFixed(1) + ' ' + (hy - py).toFixed(1) + ' Z" fill="' + col + '"/>';
  }
  /* A numbered pin on the drawing. The same number appears in the sentence as (1), so the word
     and the part it names are tied together without the label being written out twice — which at
     this size there is no room for anyway. */
  function pin(x, y, n) {
    return '<g><circle cx="' + x + '" cy="' + y + '" r="7.4" fill="#FFFFFF" stroke="#3C3C3C" stroke-width="1.5" opacity=".96"/>' +
           '<text x="' + x + '" y="' + (y + 3.7) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="#3C3C3C">' + n + '</text></g>';
  }
  function dots(pts, col) {
    return pts.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.1" fill="' + (col || A) + '"/>'; }).join('');
  }

  /* An organ drawn as a curved band, so the two flanks are honestly unequal: the cell divisions
     are drawn perpendicular to the centre line, and the outer edge of a curve simply IS longer
     than the inner one. Fudging it with two rows of hand-placed boxes was what made the first
     attempt look like a diagram of nothing. */
  function band(p0, p1, p2, hw) {
    function at(t) { var m = 1 - t; return [m * m * p0[0] + 2 * m * t * p1[0] + t * t * p2[0],
                                            m * m * p0[1] + 2 * m * t * p1[1] + t * t * p2[1]]; }
    function nrm(t) { var m = 1 - t,
      dx = 2 * m * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]),
      dy = 2 * m * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]), L = Math.hypot(dx, dy) || 1;
      return [-dy / L, dx / L]; }
    function pt(t, u) { var c = at(t), n = nrm(t); return [c[0] + n[0] * u, c[1] + n[1] * u]; }
    function edge(u, n) { var a = [], i; for (i = 0; i <= n; i++) a.push(pt(i / n, u)); return a; }
    function poly(a) { return a.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' L'); }
    return {
      pt: pt,
      body: function (grad, col) {
        var up = edge(-hw, 16), lo = edge(hw, 16).reverse();
        return '<path d="M' + poly(up) + ' L' + poly(lo) + ' Z" fill="' + grad + '" stroke="' + (col || G) +
               '" stroke-width="1.6" stroke-linejoin="round"/>';
      },
      /* The cells, drawn the way the simulation draws them: a strip of boxes down EACH flank with
         an empty lumen between, not a ladder of rungs across the whole organ. A student who has
         just used the widget should recognise the same shoot. `grow` says which flank is the one
         elongating, and gets the deeper fill the widget gives a stretched cell. */
      flanks: function (n, cw, cols, grow) {
        var s = '', i, k;
        for (k = 0; k < 2; k++) {
          var sg = k ? 1 : -1, fill = (sg === grow) ? cols[1] : cols[0];
          for (i = 0; i < n; i++) {
            var t0 = i / n, t1 = (i + 1) / n;
            var a = pt(t0, sg * hw), b = pt(t1, sg * hw),
                c = pt(t1, sg * (hw - cw)), d = pt(t0, sg * (hw - cw));
            s += '<path d="M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) +
                 ' L' + c[0].toFixed(1) + ' ' + c[1].toFixed(1) + ' L' + d[0].toFixed(1) + ' ' + d[1].toFixed(1) +
                 ' Z" fill="' + fill + '" stroke="' + cols[2] + '" stroke-width="1.1"/>';
          }
        }
        return s;
      },
      tip: function () {
        var c = pt(1, 0), l = pt(1, -hw), r = pt(1, hw), n = [c[0] - (l[0] + r[0]) / 2, c[1] - (l[1] + r[1]) / 2];
        var d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
        var ux = (p2[0] - p1[0]) / d, uy = (p2[1] - p1[1]) / d;
        return '<path d="M' + l[0].toFixed(1) + ' ' + l[1].toFixed(1) + ' Q' + (c[0] + ux * hw * 1.15).toFixed(1) + ' ' +
               (c[1] + uy * hw * 1.15).toFixed(1) + ' ' + r[0].toFixed(1) + ' ' + r[1].toFixed(1) +
               ' Z" fill="' + G + '" stroke="' + G + '" stroke-width="1.4" stroke-linejoin="round"/>';
      }
    };
  }

  /* Some claims are not worth drawing. "Auxin is made in the shoot tip" wants a real shoot with
     a real tip on it, not a green rectangle with a dome. A figure may therefore be a photograph,
     with the same numbered pins laid over it in per-cent coordinates. */
  function photo(name, alt, pins) {
    var s = '<span class="minifig__ph">' +
            '<picture><source srcset="assets/photos/' + name + '-900.webp" type="image/webp">' +
            '<img src="assets/photos/' + name + '-900.jpg" alt="' + alt + '" class="minifig__img" loading="lazy"></picture>';
    (pins || []).forEach(function (p) {
      s += '<i class="minifig__pin" style="left:' + p[0] + '%;top:' + p[1] + '%">' + p[2] + '</i>';
    });
    return s + '</span>';
  }

  var F = {};

  /* THE SENTENCE: "Lay a shoot on its side and the auxin collects along the LOWER side. Those
     cells elongate more than the ones on top, so the shoot bends UPWARDS."  So the picture is
     not a seedling portrait: it is the auxin on the lower flank, the lower cells drawn longer,
     and the shoot turning up because of it. */
  F['gravity-side'] = (function () {
    var b = band([16, 74], [58, 74], [98, 34], 13), s = '', i;
    s += '<defs><linearGradient id="fgS1" x1="0" y1="0" x2="0" y2="1">' +
         '<stop offset="0" stop-color="#3E8F46"/><stop offset=".45" stop-color="#54AC5C"/>' +
         '<stop offset="1" stop-color="#3E8F46"/></linearGradient></defs>';
    s += '<path d="M2 92 H118" stroke="' + SD + '" stroke-width="1.4" opacity=".45"/>';
    s += b.body('url(#fgS1)') + b.flanks(6, 4.6, SHC, 1) + b.tip();
    /* auxin on the LOWER flank only */
    for (i = 0; i < 16; i++) {
      var tt = 0.08 + (i % 8) / 9.6, uu = 0.5 + (i < 8 ? 0 : 3.4) + (i % 3) * 1.2;
      var q = b.pt(tt, uu);
      s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="1.9" fill="#F0900E"/>';
    }
    var g1 = b.pt(0.28, 23), g2 = b.pt(0.76, 23);
    s += arr(112, 56, 112, 80, GREY, 2);
    s += '<text x="7" y="14" font-size="11" font-weight="700" fill="' + G + '">shoot</text>';
    s += pin(g1[0], g1[1], 1) + pin(g2[0], g2[1], 2);
    return svg('0 0 120 100', s,
      'A shoot lying on its side. Auxin grains are gathered along its lower flank. The cell divisions show the lower flank is longer than the upper one, and the shoot is curving upwards. An arrow shows gravity acting downwards.');
  })();

  /* THE SENTENCE: "Light shines from one side. The auxin moves to the SHADED side. That side now
     has more auxin, so its cells elongate more than the cells on the lit side, and the bend
     points TOWARDS the light." */
  F['phototropism'] = (function () {
    var b = band([74, 94], [74, 50], [44, 18], 12), s = '', i;
    s += '<defs><linearGradient id="fgS2" x1="0" y1="0" x2="1" y2="0">' +
         '<stop offset="0" stop-color="#3E8F46"/><stop offset=".45" stop-color="#54AC5C"/>' +
         '<stop offset="1" stop-color="#3E8F46"/></linearGradient></defs>';
    s += '<path d="M2 94 H118" stroke="' + SD + '" stroke-width="1.4" opacity=".45"/>';
    s += '<circle cx="17" cy="20" r="10" fill="#FFD34E" stroke="#E8A31C" stroke-width="1.4"/>';
    s += '<g stroke="#E8A31C" stroke-width="1.8" stroke-linecap="round">' +
         '<path d="M17 5 v-3 M4 20 h-3 M27 10 l2 -2 M27 30 l2 2 M17 35 v3"/></g>';
    s += arr(28, 26, 52, 40, '#EFA82B', 1.7) + arr(28, 38, 52, 58, '#EFA82B', 1.7);
    s += b.body('url(#fgS2)') + b.flanks(6, 4.4, SHC, 1) + b.tip();
    /* auxin on the SHADED flank: +u, which is the right-hand side of a shoot drawn going up */
    for (i = 0; i < 16; i++) {
      var tt = 0.07 + (i % 8) / 9.6, uu = 0.4 + (i < 8 ? 0 : 3.2) + (i % 3) * 1.2;
      var q = b.pt(tt, uu);
      s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="1.9" fill="#F0900E"/>';
    }
    /* One pin below the light, one on the shaded flank. A third for "the cells elongate more"
       pointed at the same flank as the second and only made the reader look twice. */
    var q1 = b.pt(0.42, 23);
    s += '<text x="7" y="88" font-size="11" font-weight="700" fill="' + G + '">shoot</text>';
    s += pin(17, 42, 1) + pin(q1[0], q1[1], 2);
    return svg('0 0 120 100', s,
      'A shoot growing upwards with the sun at the top left. Auxin grains are gathered along the shaded right-hand flank. The cell divisions show that flank is longer, and the shoot is curving to the left, towards the light.');
  })();

  /* "Auxin is made in the shoot tip." There is no photograph of a shoot tip in this lab, and the
     nearest one showed a seed coat rather than a growing point — so it is drawn, in the same
     language as the simulation: the tip is its own region above a dashed line, the auxin is made
     inside it, and an arrow carries it down into the stem below. */
  F['auxin-chain'] = (function () {
    var b = band([60, 96], [60, 62], [60, 30], 15), s = '', i;
    s += '<defs><linearGradient id="fgA1" x1="0" y1="0" x2="1" y2="0">' +
         '<stop offset="0" stop-color="#3E8F46"/><stop offset=".45" stop-color="#54AC5C"/>' +
         '<stop offset="1" stop-color="#3E8F46"/></linearGradient></defs>';
    s += '<path d="M4 96 H116" stroke="' + SD + '" stroke-width="1.4" opacity=".45"/>';
    s += b.body('url(#fgA1)') + b.flanks(4, 5, SHC, 0) + b.tip();
    /* the tip region: the part that makes it, marked off as the simulation marks it */
    var tl = b.pt(0.62, -15), tr = b.pt(0.62, 15);
    s += '<path d="M' + tl[0].toFixed(1) + ' ' + tl[1].toFixed(1) + ' L' + tr[0].toFixed(1) + ' ' + tr[1].toFixed(1) +
         ' L' + tr[0].toFixed(1) + ' 28 L' + tl[0].toFixed(1) + ' 28 Z" fill="#2F7D46" opacity=".5"/>';
    s += '<path d="M' + tl[0].toFixed(1) + ' ' + tl[1].toFixed(1) + ' L' + tr[0].toFixed(1) + ' ' + tr[1].toFixed(1) +
         '" stroke="#1F5A31" stroke-width="1.8" stroke-dasharray="4 3"/>';
    /* auxin being made, inside the tip */
    for (i = 0; i < 9; i++) {
      var q = b.pt(0.70 + (i % 3) * 0.085, (i % 3 - 1) * 7 + (i < 5 ? -3 : 3));
      s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="1.9" fill="#F0900E"/>';
    }
    /* and travelling down into the stem */
    for (i = 0; i < 8; i++) {
      var r = b.pt(0.12 + i * 0.06, ((i % 3) - 1) * 5);
      s += '<circle cx="' + r[0].toFixed(1) + '" cy="' + r[1].toFixed(1) + '" r="1.9" fill="#F0900E" opacity=".85"/>';
    }
    var aTop = b.pt(0.6, 0), aBot = b.pt(0.16, 0);
    s += arr(aTop[0], aTop[1] + 3, aBot[0], aBot[1], AD, 2.6);
    var p1 = b.pt(0.82, 28), p2 = b.pt(0.34, 27);
    s += pin(p1[0], p1[1], 1) + pin(p2[0], p2[1], 2);
    return svg('0 0 120 100', s,
      'A shoot standing upright. Its tip is shaded as its own region above a dashed line, with auxin grains being made inside it, and an arrow carries the auxin down the middle of the shoot into the stem below.');
  })();

  /* THE SENTENCE: "In a root auxin INHIBITS cell elongation: those cells elongate LESS. So when
     a root lies on its side, auxin collects along the lower side, the cells there elongate less
     than the ones on the upper side, and the root bends downwards."
     Drawn with the same band as the two shoot figures, so the pair can be compared directly —
     the only differences are that the auxin side is the SHORT one here, and that the organ is
     underground. It is labelled in a word, because two rows of rectangles do not say "root". */
  F['root-inversion'] = (function () {
    var b = band([12, 36], [56, 36], [96, 76], 12), s = '', i;
    s += '<defs><linearGradient id="fgR1" x1="0" y1="0" x2="0" y2="1">' +
         '<stop offset="0" stop-color="#CFBC93"/><stop offset=".42" stop-color="#EFE4C9"/>' +
         '<stop offset="1" stop-color="#CFBC93"/></linearGradient></defs>';
    s += '<rect x="0" y="0" width="120" height="100" fill="' + SOIL + '"/>';
    s += '<g fill="#D6C6A0" opacity=".5"><circle cx="16" cy="86" r="6"/><circle cx="40" cy="92" r="5"/>' +
         '<circle cx="70" cy="94" r="6"/><circle cx="104" cy="88" r="5"/><circle cx="108" cy="60" r="4"/>' +
         '<circle cx="24" cy="66" r="4"/></g>';
    /* the root cap: a blunt thimble over the very end */
    s += b.body('url(#fgR1)', '#9A8459') + b.flanks(6, 4.2, RTC, -1);   /* the UPPER flank stretches */
    /* the root cap, over the end rather than under it */
    var c0 = b.pt(1, -12.4), c1 = b.pt(1, 12.4), cd = b.pt(1.16, 0);
    s += '<path d="M' + c0[0].toFixed(1) + ' ' + c0[1].toFixed(1) + ' Q' + cd[0].toFixed(1) + ' ' + cd[1].toFixed(1) +
         ' ' + c1[0].toFixed(1) + ' ' + c1[1].toFixed(1) + ' Z" fill="#BFA478" stroke="#8A7346" stroke-width="1.6" stroke-linejoin="round"/>';
    /* auxin along the LOWER flank — which on a downward curve is the INNER, shorter one */
    for (i = 0; i < 15; i++) {
      var tt = 0.07 + (i % 8) / 9.8, uu = 0.4 + (i < 8 ? 0 : 3.2) + (i % 3) * 1.2;
      var q = b.pt(tt, uu);
      s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="1.9" fill="#F0900E"/>';
    }
    s += '<text x="8" y="14" font-size="11" font-weight="700" fill="' + SD + '">root</text>';
    s += arr(112, 8, 112, 30, GREY, 2);
    var r1 = b.pt(0.26, 22), r2 = b.pt(0.66, 22);
    s += pin(r1[0], r1[1], 1) + pin(r2[0], r2[1], 2);
    return svg('0 0 120 100', s,
      'A root underground, labelled root, curving downwards with its root cap at the end. Auxin grains lie along its lower flank, and the cell divisions show that flank is shorter than the upper one.');
  })();

  /* ---------- 2. transpiration: the large internal surface ---------- */
  F['transpiration'] = svg('0 0 120 100',
    '<defs>' +
    '<linearGradient id="trPal" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#E2F1CE"/><stop offset="1" stop-color="#A6D28B"/></linearGradient>' +
    '<radialGradient id="trCell" cx=".36" cy=".3" r=".82">' +
    '<stop offset="0" stop-color="#95D083"/><stop offset="1" stop-color="#4F9E53"/></radialGradient>' +
    '<linearGradient id="trGdL" x1="0" y1="0" x2="1" y2="0">' +
    '<stop offset="0" stop-color="#6FBF72"/><stop offset="1" stop-color="#2F7A38"/></linearGradient>' +
    '<linearGradient id="trGdR" x1="1" y1="0" x2="0" y2="0">' +
    '<stop offset="0" stop-color="#6FBF72"/><stop offset="1" stop-color="#2F7A38"/></linearGradient>' +
    '<linearGradient id="trAir" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EFF7F1"/></linearGradient>' +
    '<linearGradient id="trPlume" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>' +
    '</defs>' +
    '<rect x="0" y="0" width="120" height="100" fill="#E8EEF1"/>' +
    '<rect x="2" y="3" width="116" height="77" fill="url(#trAir)"/>' +
    '<rect x="2" y="3" width="116" height="6" fill="#F4FAEE" stroke="' + G + '" stroke-width="1.1"/>' +
    '<g fill="url(#trPal)" stroke="' + G + '" stroke-width="1"><rect x="3" y="9" width="13.6" height="13" rx="2"/>' +
    '<rect x="17.4" y="9" width="13.6" height="13" rx="2"/><rect x="31.8" y="9" width="13.6" height="13" rx="2"/>' +
    '<rect x="46.2" y="9" width="13.6" height="13" rx="2"/><rect x="60.6" y="9" width="13.6" height="13" rx="2"/>' +
    '<rect x="75" y="9" width="13.6" height="13" rx="2"/><rect x="89.4" y="9" width="13.6" height="13" rx="2"/>' +
    '<rect x="103.8" y="9" width="13.2" height="13" rx="2"/></g>' +
    /* every cell wears a film of water: all that wet outline IS the internal surface */
    '<g fill="none" stroke="' + W + '" stroke-width="4.6" opacity=".28">' +
    '<circle cx="11" cy="33" r="6.5"/><circle cx="28" cy="33" r="6"/><circle cx="45" cy="33" r="6.5"/>' +
    '<circle cx="62" cy="33" r="6"/><circle cx="79" cy="33" r="6.5"/><circle cx="96" cy="33" r="6"/>' +
    '<circle cx="112" cy="33" r="5.5"/>' +
    '<circle cx="12" cy="58" r="6.5"/><circle cx="29" cy="58" r="6"/><circle cx="45" cy="58" r="6"/>' +
    '<circle cx="75" cy="58" r="6"/><circle cx="92" cy="58" r="6"/><circle cx="108" cy="58" r="6"/></g>' +
    '<g fill="url(#trCell)" stroke="' + W + '" stroke-width="1.8">' +
    '<circle cx="11" cy="33" r="6.5"/><circle cx="28" cy="33" r="6"/><circle cx="45" cy="33" r="6.5"/>' +
    '<circle cx="62" cy="33" r="6"/><circle cx="79" cy="33" r="6.5"/><circle cx="96" cy="33" r="6"/>' +
    '<circle cx="112" cy="33" r="5.5"/>' +
    '<circle cx="12" cy="58" r="6.5"/><circle cx="29" cy="58" r="6"/><circle cx="45" cy="58" r="6"/>' +
    '<circle cx="75" cy="58" r="6"/><circle cx="92" cy="58" r="6"/><circle cx="108" cy="58" r="6"/></g>' +
    /* water evaporating off those wet surfaces into the air spaces */
    arr(92, 52, 92, 40, W, 2.3) + arr(33, 51, 35, 41, W, 1.8) +
    arr(45, 51, 49, 42, W, 1.8) + arr(79, 40, 76, 50, W, 1.8) +
    /* the lower surface with one open pore, and the air spreading out of it */
    '<path d="M52 78 L68 78 L86 100 L34 100 Z" fill="url(#trPlume)"/>' +
    '<rect x="2" y="68" width="27" height="12" fill="#F4FAEE" stroke="' + G + '" stroke-width="1.2"/>' +
    '<rect x="91" y="68" width="27" height="12" fill="#F4FAEE" stroke="' + G + '" stroke-width="1.2"/>' +
    '<path d="M29 67 C41 67 51 69.5 51 74 C51 78.5 41 81 29 81 C23 78 23 70 29 67 Z" fill="url(#trGdL)" stroke="' + G + '" stroke-width="1.5"/>' +
    '<path d="M91 67 C79 67 69 69.5 69 74 C69 78.5 79 81 91 81 C97 78 97 70 91 67 Z" fill="url(#trGdR)" stroke="' + G + '" stroke-width="1.5"/>' +
    arr(60, 46, 60, 96, W, 2.8) +
    pin(20, 45, 1) + pin(103, 46, 2) + pin(30, 74, 3),
    'A slice through the inside of a leaf: many rounded cells, each wearing a film of water, with connected air spaces between them, water evaporating from those wet surfaces and the vapour travelling down through the air spaces and out through a pore.');

  /* ---------- 1. leaf-layers: the compromise ---------- */
  F['leaf-layers'] = svg('0 0 120 100',
    '<defs>' +
    '<linearGradient id="clPal" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#E2F1CE"/><stop offset="1" stop-color="#9CCD81"/></linearGradient>' +
    '<radialGradient id="clSpg" cx=".36" cy=".3" r=".82">' +
    '<stop offset="0" stop-color="#92CE80"/><stop offset="1" stop-color="#4F9E53"/></radialGradient>' +
    '<linearGradient id="clGdL" x1="0" y1="0" x2="1" y2="0">' +
    '<stop offset="0" stop-color="#6FBF72"/><stop offset="1" stop-color="#2F7A38"/></linearGradient>' +
    '<linearGradient id="clGdR" x1="1" y1="0" x2="0" y2="0">' +
    '<stop offset="0" stop-color="#6FBF72"/><stop offset="1" stop-color="#2F7A38"/></linearGradient>' +
    '<linearGradient id="clAir" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EFF7F1"/></linearGradient>' +
    '<linearGradient id="clPlume" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>' +
    '</defs>' +
    /* the air outside, so the leaf reads as a slab and the pore as a hole through it */
    '<rect x="0" y="0" width="120" height="100" fill="#E8EEF1"/>' +
    '<rect x="3" y="4" width="114" height="66" fill="url(#clAir)"/>' +
    '<rect x="3" y="4" width="114" height="4.5" fill="#EFE7CF" stroke="' + SD + '" stroke-width="1.1"/>' +
    '<rect x="3" y="8.5" width="114" height="7" fill="#F4FAEE" stroke="' + G + '" stroke-width="1.2"/>' +
    /* palisade: tall, packed, at the top */
    '<g fill="url(#clPal)" stroke="' + G + '" stroke-width="1.1">' +
    '<rect x="4" y="15.5" width="13.3" height="21" rx="2.4"/><rect x="18.1" y="15.5" width="13.3" height="21" rx="2.4"/>' +
    '<rect x="32.2" y="15.5" width="13.3" height="21" rx="2.4"/><rect x="46.3" y="15.5" width="13.3" height="21" rx="2.4"/>' +
    '<rect x="60.4" y="15.5" width="13.3" height="21" rx="2.4"/><rect x="74.5" y="15.5" width="13.3" height="21" rx="2.4"/>' +
    '<rect x="88.6" y="15.5" width="13.3" height="21" rx="2.4"/><rect x="102.7" y="15.5" width="13.3" height="21" rx="2.4"/></g>' +
    /* spongy cells, rounded, air all round them and a clear space over the pore */
    '<g fill="url(#clSpg)" stroke="' + G + '" stroke-width="1.2">' +
    '<circle cx="11" cy="47" r="6"/><circle cx="26" cy="46" r="5.5"/><circle cx="41" cy="48" r="6"/>' +
    '<circle cx="79" cy="47" r="6"/><circle cx="94" cy="46" r="5.5"/><circle cx="109" cy="48" r="6"/></g>' +
    /* air spreading out of the open pore, so the pore reads as a hole */
    '<path d="M50 68 L70 68 L88 100 L32 100 Z" fill="url(#clPlume)"/>' +
    /* the lower surface, stopping either side of that one open pore */
    '<rect x="3" y="58" width="25" height="12" fill="#F4FAEE" stroke="' + G + '" stroke-width="1.2"/>' +
    '<rect x="92" y="58" width="25" height="12" fill="#F4FAEE" stroke="' + G + '" stroke-width="1.2"/>' +
    '<path d="M28 57 C40 57 50 59.5 50 64 C50 68.5 40 71 28 71 C22 68 22 60 28 57 Z" fill="url(#clGdL)" stroke="' + G + '" stroke-width="1.5"/>' +
    '<path d="M92 57 C80 57 70 59.5 70 64 C70 68.5 80 71 92 71 C98 68 98 60 92 57 Z" fill="url(#clGdR)" stroke="' + G + '" stroke-width="1.5"/>' +
    /* the whole point: in one way and out the other, through the same hole */
    arr(55, 94, 55, 42, AD, 2.8) + arr(65, 42, 65, 94, W, 2.8) +
    pin(42, 87, 1) + pin(24, 64, 2) + pin(78, 87, 3),
    'A slice through a leaf. Carbon dioxide moves in through the one open pore in the lower surface while water vapour moves out through the same pore, with the air spaces between the rounded cells leading down to it.');

  /* ---------- 3. limiting-factor: rise, then plateau ---------- */
  F['limiting-factor'] = svg('0 0 120 100',
    '<defs>' +
    '<linearGradient id="lmZa" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#CFE9B6" stop-opacity=".18"/><stop offset="1" stop-color="#9CCD81" stop-opacity=".62"/></linearGradient>' +
    '<linearGradient id="lmZb" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#D8D8D2" stop-opacity=".18"/><stop offset="1" stop-color="#B4B4AC" stop-opacity=".58"/></linearGradient>' +
    '</defs>' +
    '<rect x="17" y="14" width="53" height="72" fill="url(#lmZa)"/>' +
    '<rect x="70" y="14" width="42" height="72" fill="url(#lmZb)"/>' +
    arr(17, 86, 114, 86, '#A6A6A6', 1.8) + arr(17, 86, 17, 10, '#A6A6A6', 1.8) +
    '<path d="M17 86 C30 68 40 48 52 38 C58 33 63 30 70 30" fill="none" stroke="' + G + '" stroke-width="3.6" stroke-linecap="round"/>' +
    '<path d="M70 30 H110" fill="none" stroke="#6E6E6E" stroke-width="3.6" stroke-linecap="round"/>' +
    '<path d="M70 35 V85" stroke="' + AD + '" stroke-width="1.6" stroke-dasharray="3.5 3" fill="none"/>' +
    '<circle cx="70" cy="30" r="4.6" fill="' + A + '" stroke="' + AD + '" stroke-width="1.6"/>' +
    pin(44, 63, 1) + pin(94, 17, 2),
    'A graph of rate against one factor. The line climbs steeply while that factor is in short supply, then stops climbing at a marked point and runs flat, because a different factor has become the limit.');

  /* ---------- 4. germination: the order ---------- */
  F['germination'] = svg('0 0 120 100',
    '<defs>' +
    '<linearGradient id="gmSoil" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#EBE2CF"/><stop offset="1" stop-color="#CEBD9A"/></linearGradient>' +
    '<radialGradient id="gmSeed" cx=".34" cy=".28" r=".85">' +
    '<stop offset="0" stop-color="#E7DAB9"/><stop offset="1" stop-color="#AD9769"/></radialGradient>' +
    '<linearGradient id="gmLeaf" x1="0" y1="1" x2="1" y2="0">' +
    '<stop offset="0" stop-color="#5CB565"/><stop offset="1" stop-color="#B6DE9C"/></linearGradient>' +
    '<linearGradient id="gmRoot" x1="0" y1="0" x2="1" y2="0">' +
    '<stop offset="0" stop-color="#FBF5E6"/><stop offset="1" stop-color="#D5C49E"/></linearGradient>' +
    '</defs>' +
    '<rect x="0" y="48" width="120" height="52" fill="url(#gmSoil)"/>' +
    '<g fill="#B9A57C" opacity=".3"><circle cx="9" cy="86" r="4"/><circle cx="40" cy="70" r="3.4"/>' +
    '<circle cx="47" cy="93" r="4.4"/><circle cx="78" cy="60" r="3.2"/><circle cx="84" cy="76" r="4"/>' +
    '<circle cx="115" cy="88" r="3.6"/><circle cx="27" cy="95" r="3"/></g>' +
    '<path d="M0 48 H120" stroke="' + SD + '" stroke-width="1.6" opacity=".8"/>' +
    /* (a) water soaks in, the seed swells, the coat cracks open */
    '<ellipse cx="18" cy="62" rx="12.5" ry="11" fill="url(#gmSeed)" stroke="' + SD + '" stroke-width="1.8"/>' +
    '<path d="M8 56 C13 52.5 23 52.5 28 56" fill="none" stroke="#FBF4E4" stroke-width="1.4" opacity=".8"/>' +
    '<path d="M20 73 L17.5 66 L22.5 61 L19.5 53" fill="none" stroke="#FBF4E4" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M18 73 L15.5 66 L20.5 61 L17.5 53" fill="none" stroke="#5E4C29" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    arr(1, 52, 8, 57, W, 1.8) + arr(1, 76, 8, 70, W, 1.8) + arr(35, 52, 28, 57, W, 1.8) +
    /* (b) the radicle out through that split and heading down, nothing above ground */
    '<ellipse cx="58" cy="62" rx="12.5" ry="11" fill="url(#gmSeed)" stroke="' + SD + '" stroke-width="1.8"/>' +
    '<path d="M48 56 C53 52.5 63 52.5 68 56" fill="none" stroke="#FBF4E4" stroke-width="1.4" opacity=".8"/>' +
    '<path d="M57 70 C57 77 59 81 60 85" fill="none" stroke="#967D50" stroke-width="8" stroke-linecap="round" opacity=".38"/>' +
    '<path d="M60 84 C60 89 59 92 59 95" fill="none" stroke="#967D50" stroke-width="6" stroke-linecap="round" opacity=".38"/>' +
    '<path d="M57 70 C57 77 59 81 60 85" fill="none" stroke="url(#gmRoot)" stroke-width="6.2" stroke-linecap="round"/>' +
    '<path d="M60 84 C60 89 59 92 59 95" fill="none" stroke="url(#gmRoot)" stroke-width="4.4" stroke-linecap="round"/>' +
    '<g stroke="#BFAC85" stroke-width="1.4" stroke-linecap="round"><path d="M54 79 l-5 -2 M63 84 l5 -1 M56 90 l-5 2"/></g>' +
    arr(77, 90, 68, 87, W, 1.8) +
    /* (c) the plumule up through the surface, first leaves open */
    '<ellipse cx="98" cy="63" rx="11.5" ry="10" fill="url(#gmSeed)" stroke="' + SD + '" stroke-width="1.8"/>' +
    '<path d="M97 71 C97 78 99 82 100 86" fill="none" stroke="#967D50" stroke-width="8" stroke-linecap="round" opacity=".38"/>' +
    '<path d="M100 85 C100 90 99 93 99 96" fill="none" stroke="#967D50" stroke-width="6" stroke-linecap="round" opacity=".38"/>' +
    '<path d="M97 71 C97 78 99 82 100 86" fill="none" stroke="url(#gmRoot)" stroke-width="6.2" stroke-linecap="round"/>' +
    '<path d="M100 85 C100 90 99 93 99 96" fill="none" stroke="url(#gmRoot)" stroke-width="4.4" stroke-linecap="round"/>' +
    '<path d="M100 83 q8 3 10 11" fill="none" stroke="#D5C49E" stroke-width="3.2" stroke-linecap="round"/>' +
    '<path d="M98 55 C97 46 95 38 96 31" fill="none" stroke="' + G + '" stroke-width="7" stroke-linecap="round" opacity=".28"/>' +
    '<path d="M98 55 C97 46 95 38 96 31" fill="none" stroke="' + GL + '" stroke-width="5.2" stroke-linecap="round"/>' +
    '<path d="M96 31 q-11 -4 -15 -10 q11 -2 15 8 Z" fill="url(#gmLeaf)" stroke="' + G + '" stroke-width="1.2"/>' +
    '<path d="M96 31 q11 -5 15 -10 q-10 -3 -15 7 Z" fill="url(#gmLeaf)" stroke="' + G + '" stroke-width="1.2"/>' +
    /* the order, read left to right */
    arr(30, 10, 44, 10, GREY, 1.8) + arr(70, 10, 84, 10, GREY, 1.8) +
    pin(18, 10, 1) + pin(58, 10, 2) + pin(98, 10, 3),
    'Three stages of a germinating seed side by side. First the seed takes in water and its coat cracks open, then the root grows downwards with nothing above ground, then the shoot grows up through the soil surface and opens its first leaves.');

  global.FIGS = F;
})(window);
