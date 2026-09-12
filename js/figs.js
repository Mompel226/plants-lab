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

  /* "Auxin is made in the shoot tip." A drawing of that is worth nothing; this is a photograph
     of real seedlings with their growing tips at the top of each shoot, and the pin is on one. */
  F['auxin-chain'] = photo('seedlings-pot',
    'Young sunflower seedlings in a pot, their shoots hooked over as they push up out of the soil, with the growing tip at the top of each shoot.',
    [[47, 25, 1]]);

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

  /* a xylem vessel: dead cells stacked into one open pipe, no end walls, lignin rings */
  F['xylem-vessel'] = svg('0 0 120 100',
    '<rect x="38" y="6" width="44" height="88" rx="4" fill="#EAF2F8" stroke="#6B8FA8" stroke-width="2.4"/>' +
    '<g stroke="#6B8FA8" stroke-width="2.2" fill="none" opacity=".85">' +
    '<path d="M38 22 q22 7 44 0 M38 46 q22 7 44 0 M38 70 q22 7 44 0"/></g>' +
    '<g stroke="' + W + '" stroke-width="3" stroke-linecap="round" opacity=".55">' +
    '<path d="M50 88 V16 M70 88 V16"/></g>' +
    arr(60, 84, 60, 14, W, 3),
    'A xylem vessel drawn as one continuous open pipe with thickened rings around it and no walls across it, and an arrow showing water moving upwards.');

  /* a phloem sieve tube, with its sieve plate and a companion cell */
  F['phloem-tube'] = svg('0 0 120 100',
    '<rect x="30" y="6" width="34" height="88" fill="#F3EAF6" stroke="#7A5C8E" stroke-width="2"/>' +
    '<g stroke="#7A5C8E" stroke-width="2.6"><path d="M30 34 H64 M30 62 H64"/></g>' +
    '<g stroke="#F7F2FA" stroke-width="1.6"><path d="M36 34 v0 M44 34 v0"/></g>' +
    '<g fill="#F7F2FA"><circle cx="37" cy="34" r="1.7"/><circle cx="47" cy="34" r="1.7"/><circle cx="57" cy="34" r="1.7"/>' +
    '<circle cx="37" cy="62" r="1.7"/><circle cx="47" cy="62" r="1.7"/><circle cx="57" cy="62" r="1.7"/></g>' +
    '<rect x="68" y="18" width="20" height="64" fill="#E6D7EE" stroke="#7A5C8E" stroke-width="1.8"/>' +
    '<circle cx="78" cy="44" r="5" fill="#7A5C8E" opacity=".5"/>' +
    arr(47, 12, 47, 88, '#7A5C8E', 2.4),
    'A phloem sieve tube with two sieve plates across it, each with pores, a companion cell alongside it, and an arrow showing sucrose moving down the tube.');

  /* a root hair cell reaching between soil particles */
  F['root-hair'] = svg('0 0 120 100',
    '<rect x="0" y="0" width="120" height="100" fill="' + SOIL + '"/>' +
    '<g fill="#D6C6A0" opacity=".85"><circle cx="86" cy="22" r="11"/><circle cx="104" cy="48" r="9"/>' +
    '<circle cx="80" cy="62" r="8"/><circle cx="98" cy="82" r="10"/><circle cx="64" cy="88" r="7"/></g>' +
    '<rect x="6" y="26" width="34" height="48" rx="5" fill="#F3EAD6" stroke="' + SD + '" stroke-width="2"/>' +
    '<circle cx="17" cy="40" r="4.4" fill="' + SD + '" opacity=".55"/>' +
    '<path d="M40 50 C58 46 72 42 92 40" fill="none" stroke="#F3EAD6" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M40 50 C58 46 72 42 92 40" fill="none" stroke="' + SD + '" stroke-width="9.6" stroke-linecap="round" opacity=".35"/>' +
    arr(92, 66, 56, 56, W, 2.2),
    'A root hair cell: a box of cytoplasm with its nucleus, drawn out into a long thread that reaches between round soil particles, and an arrow showing water entering it.');

  /* evaporation inside the leaf, then diffusion out through a stoma */
  F['transpiration'] = svg('0 0 120 100',
    '<rect x="8" y="16" width="104" height="54" rx="5" fill="#EDF6E6" stroke="' + G + '" stroke-width="2"/>' +
    '<g fill="' + GP + '" stroke="' + G + '" stroke-width="1.2">' +
    '<rect x="14" y="22" width="13" height="22" rx="2"/><rect x="30" y="22" width="13" height="22" rx="2"/>' +
    '<rect x="46" y="22" width="13" height="22" rx="2"/><rect x="62" y="22" width="13" height="22" rx="2"/>' +
    '<rect x="78" y="22" width="13" height="22" rx="2"/><rect x="94" y="22" width="12" height="22" rx="2"/></g>' +
    '<g fill="' + GL + '" opacity=".8"><circle cx="22" cy="56" r="6"/><circle cx="44" cy="58" r="7"/>' +
    '<circle cx="70" cy="55" r="6"/><circle cx="94" cy="58" r="6"/></g>' +
    '<g fill="' + WL + '"><circle cx="33" cy="54" r="2.4"/><circle cx="57" cy="57" r="2.4"/><circle cx="82" cy="54" r="2.4"/></g>' +
    '<path d="M8 70 H50 M70 70 H112" stroke="' + G + '" stroke-width="3"/>' +
    '<path d="M50 70 q5 8 10 0 M70 70 q-5 8 -10 0" fill="' + GL + '" stroke="' + G + '" stroke-width="2"/>' +
    arr(60, 82, 60, 94, W, 2.2) + arr(45, 62, 56, 74, W, 1.6),
    'A slice through a leaf: a row of palisade cells at the top, rounded spongy cells with air spaces below, water evaporating into those spaces, and an arrow carrying water vapour out through a stoma between two guard cells.');

  /* the four layers of a leaf */
  F['leaf-layers'] = svg('0 0 120 100',
    '<rect x="6" y="14" width="108" height="6" fill="#E7E0C9" stroke="' + SD + '" stroke-width="1"/>' +
    '<rect x="6" y="20" width="108" height="12" fill="#EDF6E6" stroke="' + G + '" stroke-width="1.2"/>' +
    '<g fill="' + GP + '" stroke="' + G + '" stroke-width="1.1">' +
    '<rect x="9" y="33" width="14" height="24" rx="2"/><rect x="25" y="33" width="14" height="24" rx="2"/>' +
    '<rect x="41" y="33" width="14" height="24" rx="2"/><rect x="57" y="33" width="14" height="24" rx="2"/>' +
    '<rect x="73" y="33" width="14" height="24" rx="2"/><rect x="89" y="33" width="22" height="24" rx="2"/></g>' +
    '<g fill="' + GL + '" opacity=".75"><circle cx="18" cy="68" r="6"/><circle cx="38" cy="70" r="7"/>' +
    '<circle cx="60" cy="67" r="6"/><circle cx="82" cy="70" r="7"/><circle cx="102" cy="67" r="6"/></g>' +
    '<rect x="6" y="80" width="108" height="10" fill="#EDF6E6" stroke="' + G + '" stroke-width="1.2"/>' +
    '<path d="M52 80 q5 8 10 0" fill="' + GL + '" stroke="' + G + '" stroke-width="1.6"/>',
    'A slice down through a leaf showing, from the top: a waxy cuticle, the upper epidermis, a row of tall palisade cells, rounded spongy cells with air spaces, and the lower epidermis with a stoma in it.');

  /* a rate curve that rises then flattens: something else has become limiting */
  F['limiting-factor'] = svg('0 0 120 100',
    '<path d="M18 84 H110 M18 84 V10" stroke="#8A8A8A" stroke-width="2" fill="none"/>' +
    '<path d="M18 84 C42 84 52 40 74 34 C88 31 98 31 108 31" fill="none" stroke="' + G + '" stroke-width="3.2" stroke-linecap="round"/>' +
    '<path d="M74 34 H108" stroke="' + A + '" stroke-width="2" stroke-dasharray="4 3"/>' +
    '<circle cx="74" cy="34" r="4" fill="' + A + '" stroke="' + AD + '" stroke-width="1.4"/>',
    'A graph of rate against one factor: the line rises steeply, then levels off at a plateau marked with a dot, where a different factor has become the limiting one.');

  /* sucrose moving from a source to a sink */
  F['source-sink'] = svg('0 0 120 100',
    '<path d="M60 20 V86" stroke="' + GL + '" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M60 30 q-22 -12 -34 2 q20 12 34 -2 Z" fill="' + GL + '" stroke="' + G + '" stroke-width="1.6"/>' +
    '<path d="M60 30 q22 -12 34 2 q-20 12 -34 -2 Z" fill="' + GL + '" stroke="' + G + '" stroke-width="1.6"/>' +
    '<ellipse cx="60" cy="90" rx="20" ry="9" fill="' + S + '" stroke="' + SD + '" stroke-width="1.8"/>' +
    dots([[38, 30], [30, 34], [82, 30], [90, 34]], A) +
    arr(60, 40, 60, 76, AD, 2.6) +
    dots([[54, 88], [62, 91], [68, 87]], AD),
    'A plant with two leaves at the top and a swollen store at the bottom. Sugar made in the leaves, the source, moves down the stem to the store, the sink.');

  /* germination: the radicle first, then the plumule */
  F['germination'] = svg('0 0 120 100',
    '<rect x="0" y="40" width="120" height="60" fill="' + SOIL + '"/>' +
    '<path d="M0 40 H120" stroke="' + SD + '" stroke-width="1.4" opacity=".6"/>' +
    '<ellipse cx="34" cy="60" rx="16" ry="12" fill="' + S + '" stroke="' + SD + '" stroke-width="1.8"/>' +
    '<path d="M34 72 C34 82 38 88 44 94" fill="none" stroke="#EFE4C9" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M34 72 C34 82 38 88 44 94" fill="none" stroke="' + SD + '" stroke-width="6" stroke-linecap="round" opacity=".3"/>' +
    '<ellipse cx="86" cy="62" rx="14" ry="11" fill="' + S + '" stroke="' + SD + '" stroke-width="1.8"/>' +
    '<path d="M86 73 C86 84 90 90 96 96" fill="none" stroke="#EFE4C9" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M86 51 C86 38 82 30 78 22" fill="none" stroke="' + GL + '" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M78 22 q-2 -8 5 -10 q3 9 -3 11 Z" fill="' + GL + '" stroke="' + G + '" stroke-width="1.2"/>' +
    arr(56, 30, 68, 30, GREY, 1.8),
    'Two stages side by side. On the left a seed under the soil with only its root growing downwards. On the right the same seed later, its shoot now growing upwards and out of the ground.');

  global.FIGS = F;
})(window);
