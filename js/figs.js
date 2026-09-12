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

  /* ---------------- 1. xylem vessel ---------------- */
  F['xylem-vessel'] = svg('0 0 120 100',
    '<defs>' +
    '<linearGradient id="xvW" x1="0" x2="1" y1="0" y2="0">' +
    '<stop offset="0" stop-color="#7E683D"/><stop offset=".45" stop-color="#D6C6A5"/><stop offset="1" stop-color="#947C4D"/></linearGradient>' +
    '<linearGradient id="xvL" x1="0" x2="1" y1="0" y2="0">' +
    '<stop offset="0" stop-color="#94BAD7"/><stop offset=".45" stop-color="#EBF4FA"/><stop offset="1" stop-color="#A6C7DE"/></linearGradient>' +
    '</defs>' +
    /* the open lumen: the inside of the pipe, with no living contents in it */
    '<rect x="44" y="13" width="44" height="79" fill="url(#xvL)"/>' +
    /* the lignin rings, seen running round the far side of the pipe */
    '<g stroke="#BFA876" stroke-width="2.4" fill="none" opacity=".42">' +
    '<path d="M44 22 Q66 11 88 22"/><path d="M44 34 Q66 23 88 34"/><path d="M44 46 Q66 35 88 46"/>' +
    '<path d="M44 58 Q66 47 88 58"/><path d="M44 70 Q66 59 88 70"/><path d="M44 82 Q66 71 88 82"/></g>' +
    /* the two cut walls, thickened with lignin */
    '<g fill="url(#xvW)" stroke="' + SD + '" stroke-width="1.5">' +
    '<rect x="30" y="13" width="14" height="79"/><rect x="88" y="13" width="14" height="79"/></g>' +
    '<g fill="#6B5629">' +
    '<rect x="30" y="19.5" width="14" height="5"/><rect x="30" y="31.5" width="14" height="5"/>' +
    '<rect x="30" y="43.5" width="14" height="5"/><rect x="30" y="55.5" width="14" height="5"/>' +
    '<rect x="30" y="67.5" width="14" height="5"/><rect x="30" y="79.5" width="14" height="5"/>' +
    '<rect x="88" y="19.5" width="14" height="5"/><rect x="88" y="31.5" width="14" height="5"/>' +
    '<rect x="88" y="43.5" width="14" height="5"/><rect x="88" y="55.5" width="14" height="5"/>' +
    '<rect x="88" y="67.5" width="14" height="5"/><rect x="88" y="79.5" width="14" height="5"/></g>' +
    '<g fill="#EFE4CA" opacity=".8">' +
    '<rect x="30" y="18.3" width="14" height="1.4"/><rect x="30" y="30.3" width="14" height="1.4"/>' +
    '<rect x="30" y="42.3" width="14" height="1.4"/><rect x="30" y="54.3" width="14" height="1.4"/>' +
    '<rect x="30" y="66.3" width="14" height="1.4"/><rect x="30" y="78.3" width="14" height="1.4"/>' +
    '<rect x="88" y="18.3" width="14" height="1.4"/><rect x="88" y="30.3" width="14" height="1.4"/>' +
    '<rect x="88" y="42.3" width="14" height="1.4"/><rect x="88" y="54.3" width="14" height="1.4"/>' +
    '<rect x="88" y="66.3" width="14" height="1.4"/><rect x="88" y="78.3" width="14" height="1.4"/></g>' +
    /* all that is left of the end walls between the cells: broken stumps */
    '<g fill="#CDB78C" stroke="#6E5A30" stroke-width="1.4" stroke-linejoin="round">' +
    '<path d="M44 37 H52 l2 2 l-2 2 l2 2 H44 Z"/><path d="M88 37 H80 l-2 2 l2 2 l-2 2 H88 Z"/>' +
    '<path d="M44 61 H52 l2 2 l-2 2 l2 2 H44 Z"/><path d="M88 61 H80 l-2 2 l2 2 l-2 2 H88 Z"/></g>' +
    /* the cut mouth: the pipe is open all the way through */
    '<ellipse cx="66" cy="13" rx="36" ry="6.8" fill="url(#xvW)" stroke="' + SD + '" stroke-width="1.5"/>' +
    '<ellipse cx="66" cy="13" rx="22" ry="4" fill="#D5E6F2" stroke="' + SD + '" stroke-width="1.2"/>' +
    /* water rising the whole way up and out */
    arr(60, 89, 60, 8, W, 3.6) +
    pin(22, 46, 1) + pin(70, 64, 2) + pin(60, 33, 3),
    'A xylem vessel drawn as a cut-open pipe. Its thick walls are banded with rings of lignin. Only broken stumps are left where the end walls between the cells used to be, so the pipe is one continuous open tube, empty of any living contents, with water rising straight up it.');

  /* ---------------- 2. phloem sieve tube ---------------- */
  F['phloem-tube'] = svg('0 0 120 100',
    '<defs>' +
    '<linearGradient id="ptS" x1="0" x2="1" y1="0" y2="0">' +
    '<stop offset="0" stop-color="#EDE3F3"/><stop offset=".45" stop-color="#FCFAFD"/><stop offset="1" stop-color="#EFE6F4"/></linearGradient>' +
    '<linearGradient id="ptC" x1="0" x2="1" y1="0" y2="0">' +
    '<stop offset="0" stop-color="#B893CC"/><stop offset=".5" stop-color="#D3B6E2"/><stop offset="1" stop-color="#A87FC0"/></linearGradient>' +
    '</defs>' +
    /* the sieve tube: two living elements end to end, almost empty inside */
    '<rect x="20" y="8" width="46" height="84" rx="3" fill="url(#ptS)" stroke="#7A5C8E" stroke-width="2.4"/>' +
    /* a thin lining of cytoplasm hugging the wall, and no nucleus anywhere */
    '<g fill="none" stroke="#C7AAD8" stroke-width="2.2" opacity=".95">' +
    '<path d="M22.9 11 V46 M63.1 11 V46 M22.9 89 V58 M63.1 89 V58"/></g>' +
    '<g fill="#B79ACA" opacity=".75"><circle cx="24" cy="24" r="1.4"/><circle cx="62" cy="33" r="1.4"/>' +
    '<circle cx="24" cy="69" r="1.4"/><circle cx="62" cy="80" r="1.4"/></g>' +
    /* the sieve plate, with pores through it */
    '<rect x="20" y="47" width="46" height="10" fill="#7A5C8E"/>' +
    '<rect x="20" y="47" width="46" height="1.6" fill="#BFA3D0" opacity=".85"/>' +
    '<g fill="#F5F0F8" stroke="#4E3660" stroke-width=".9">' +
    '<rect x="24.5" y="48.8" width="7" height="6.4" rx="1.2"/><rect x="34" y="48.8" width="7" height="6.4" rx="1.2"/>' +
    '<rect x="43.5" y="48.8" width="7" height="6.4" rx="1.2"/><rect x="53" y="48.8" width="7" height="6.4" rx="1.2"/></g>' +
    /* sucrose travelling along the tube and through a pore */
    dots([[33, 20], [46, 27], [32, 34], [54, 20], [33, 66], [53, 68], [32, 80], [36, 88]], A) +
    arr(47, 14, 47, 88, AD, 3.2) +
    /* the companion cell: packed with cytoplasm, and it keeps its nucleus */
    '<rect x="70" y="23" width="34" height="54" rx="4" fill="url(#ptC)" stroke="#7A5C8E" stroke-width="2.2"/>' +
    '<g fill="#7B5B92" opacity=".85"><circle cx="76" cy="31" r="1.8"/><circle cx="86" cy="28" r="1.8"/>' +
    '<circle cx="97" cy="32" r="1.8"/><circle cx="100" cy="43" r="1.8"/><circle cx="75" cy="44" r="1.8"/>' +
    '<circle cx="76" cy="57" r="1.8"/><circle cx="88" cy="64" r="1.8"/><circle cx="99" cy="57" r="1.8"/>' +
    '<circle cx="96" cy="70" r="1.8"/><circle cx="80" cy="70" r="1.8"/><circle cx="99" cy="24" r="1.8"/></g>' +
    '<ellipse cx="87" cy="44" rx="9.6" ry="8" fill="#5E4176" stroke="#3E2A50" stroke-width="1.4"/>' +
    '<ellipse cx="84" cy="41.6" rx="3.2" ry="2.5" fill="#AE92C4"/>' +
    /* the strands that join the companion cell to the sieve tube */
    '<g stroke="#7A5C8E" stroke-width="2.6" stroke-linecap="round"><path d="M66 33 H70 M66 44 H70 M66 66 H70"/></g>' +
    pin(11, 52, 1) + pin(87, 66, 2) + pin(57, 78, 3),
    'A phloem sieve tube: two living sieve tube elements end to end with only a thin lining of cytoplasm and no nucleus, a sieve plate with pores across the join between them, sucrose moving along the tube through those pores, and a companion cell beside it packed with cytoplasm and holding a nucleus.');

  /* ---------------- 3. root hair cell ---------------- */
  F['root-hair'] = svg('0 0 120 100',
    '<defs>' +
    '<radialGradient id="rhP" cx=".36" cy=".28" r=".85">' +
    '<stop offset="0" stop-color="#F4EAD3"/><stop offset="1" stop-color="#BCA778"/></radialGradient>' +
    '<linearGradient id="rhV" x1="0" x2="1" y1="0" y2="1">' +
    '<stop offset="0" stop-color="#D9EAF4"/><stop offset="1" stop-color="#9BC3DE"/></linearGradient>' +
    '</defs>' +
    '<rect x="0" y="0" width="120" height="100" fill="#D5C6A1"/>' +
    /* films of water in the gaps, and the soil particles the hair threads between */
    '<g fill="#A2C8E2"><path d="M103 38 q10 8 6 17 q-13 -5 -6 -17 Z"/><path d="M82 58 q9 7 8 17 q-14 -5 -8 -17 Z"/>' +
    '<path d="M60 24 q9 5 9 13 q-13 -2 -9 -13 Z"/></g>' +
    '<g fill="url(#rhP)" stroke="#6B5526" stroke-width="1.5">' +
    '<circle cx="88" cy="10" r="16"/><circle cx="46" cy="8" r="12"/><circle cx="116" cy="25" r="12"/>' +
    '<circle cx="102" cy="66" r="15"/><circle cx="62" cy="89" r="18"/><circle cx="112" cy="94" r="14"/></g>' +
    /* one epidermal cell: wall, a thin layer of cytoplasm, a big vacuole, a nucleus */
    '<path d="M50 44.5 V29 a5 5 0 0 0 -5 -5 H9 a5 5 0 0 0 -5 5 V75 a5 5 0 0 0 5 5 H45 a5 5 0 0 0 5 -5 V54.5" ' +
    'fill="#EFE2C4" stroke="#6B5526" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M45.5 45.5 V32 a3.5 3.5 0 0 0 -3.5 -3.5 H12 a3.5 3.5 0 0 0 -3.5 3.5 V72 a3.5 3.5 0 0 0 3.5 3.5 H42 a3.5 3.5 0 0 0 3.5 -3.5 V53.5" ' +
    'fill="#FCF8EE" stroke="#CBB78A" stroke-width="1.1"/>' +
    '<ellipse cx="26" cy="47" rx="16.5" ry="14" fill="url(#rhV)" stroke="#6E9DBE" stroke-width="1.3"/>' +
    /* the hair: the same cell wall, drawn out into one long fine thread */
    '<path d="M50 49.4 C62 47.7 71 38.2 86 36 S104 44 114 39" fill="none" stroke="#6B5526" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M44 50 C59 48.1 70.5 38.2 86 36 S104 44 114 39" fill="none" stroke="#EFE2C4" stroke-width="6.2" stroke-linecap="round"/>' +
    '<path d="M44 50 C59 48.1 70.5 38.2 86 36 S103 43.7 112 39.3" fill="none" stroke="#FCF8EE" stroke-width="3.2" stroke-linecap="round"/>' +
    '<ellipse cx="34" cy="68.5" rx="7.6" ry="6.2" fill="#9A7A38" stroke="#5E4B1C" stroke-width="1.3"/>' +
    '<ellipse cx="31.6" cy="66.6" rx="2.5" ry="2" fill="#D8C48C"/>' +
    /* water entering all along the hair */
    arr(56, 68, 58, 56, W, 2.3) + arr(74, 64, 73, 49, W, 2.3) +
    arr(82, 18, 84, 28, W, 2.3) + arr(108, 58, 106, 49, W, 2.3) +
    pin(66, 33, 1) + pin(22, 44, 2) + pin(74, 74, 3),
    'A single root hair cell: one epidermal cell of the root with a cell wall, a thin layer of cytoplasm, a large vacuole and a nucleus, drawn out at one side into a long fine hair that threads between the soil particles. Short arrows show water entering all along the hair.');

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

  /* ---------------- 4. source and sink ---------------- */
  F['source-sink'] = svg('0 0 120 100',
    '<defs>' +
    '<linearGradient id="ssL" x1="0" x2="1" y1="0" y2="1">' +
    '<stop offset="0" stop-color="#86C98D"/><stop offset="1" stop-color="#3B8544"/></linearGradient>' +
    '<linearGradient id="ssT" x1="0" x2="0" y1="0" y2="1">' +
    '<stop offset="0" stop-color="#E0D0AA"/><stop offset="1" stop-color="#A38954"/></linearGradient>' +
    '<linearGradient id="ssP" x1="0" x2="1" y1="0" y2="0">' +
    '<stop offset="0" stop-color="#C09FD3"/><stop offset=".5" stop-color="#EDE2F4"/><stop offset="1" stop-color="#C09FD3"/></linearGradient>' +
    '<linearGradient id="ssX" x1="0" x2="1" y1="0" y2="0">' +
    '<stop offset="0" stop-color="#A9CBE3"/><stop offset=".5" stop-color="#E4F0F8"/><stop offset="1" stop-color="#A9CBE3"/></linearGradient>' +
    '</defs>' +
    /* the soil, and the store buried in it */
    '<rect x="0" y="74" width="120" height="26" fill="' + SOIL + '" opacity=".8"/>' +
    '<path d="M0 74 H120" stroke="' + SD + '" stroke-width="1.3" opacity=".55"/>' +
    /* two leaves: sucrose is made here */
    '<path d="M48 30 q-20 -20 -42 -11 q15 20 42 11 Z" fill="url(#ssL)" stroke="' + G + '" stroke-width="1.7"/>' +
    '<path d="M74 30 q20 -20 42 -11 q-15 20 -42 11 Z" fill="url(#ssL)" stroke="' + G + '" stroke-width="1.7"/>' +
    '<g stroke="#DFF0DC" stroke-width="1.3" opacity=".85" fill="none">' +
    '<path d="M46 26.5 q-18 -9 -34 -8 M76 26.5 q18 -9 34 -8"/></g>' +
    dots([[26, 21], [37, 25], [15, 16], [94, 21], [83, 25], [105, 16]], A) +
    /* the stem, cut open: phloem on one side, xylem on the other */
    '<rect x="45" y="26" width="32" height="52" fill="#F0F6EB" stroke="' + G + '" stroke-width="1.8"/>' +
    '<rect x="46" y="26" width="15" height="52" fill="url(#ssP)" stroke="#7A5C8E" stroke-width="1.6"/>' +
    '<rect x="64.5" y="26" width="11" height="52" fill="url(#ssX)" stroke="' + W + '" stroke-width="1.4"/>' +
    dots([[48.8, 38], [58.2, 50], [48.8, 64]], A) +
    arr(53.5, 30, 53.5, 76, AD, 3.4) +
    arr(70, 74, 70, 32, W, 1.8) +
    /* the store: sucrose is used or kept here */
    '<path d="M60 74 c20 0 30 5 30 12 s-14 12 -30 12 s-30 -5 -30 -12 s10 -12 30 -12 Z" fill="url(#ssT)" stroke="' + SD + '" stroke-width="1.9"/>' +
    dots([[52, 84], [66, 82], [74, 88], [60, 91], [44, 87]], AD) +
    pin(26, 21, 1) + pin(38, 88, 2) + pin(39, 52, 3),
    'A plant with its leaves at the top and a swollen store below the soil. The stem is cut open to show two tissues side by side: sucrose made in the leaves travels down the phloem to the store, while water travels up the xylem beside it.');

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
