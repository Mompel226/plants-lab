/* Small figures that sit beside a sentence, with the text running round them.
   Not illustrations of a whole station — one idea each, at about the size of a
   postage stamp, for a reader who takes a picture in faster than a clause.
   Every one is stroke-and-fill only: no text inside, because at 120 px nothing
   readable fits, and the sentence beside it is the caption. */
(function (global) {
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
  function dots(pts, col) {
    return pts.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.1" fill="' + (col || A) + '"/>'; }).join('');
  }

  var F = {};

  /* a shoot laid on its side: the shoot turns up, the root turns down */
  F['gravity-side'] = svg('0 0 120 100',
    '<rect x="0" y="52" width="120" height="48" fill="' + SOIL + '"/>' +
    '<path d="M0 52 H120" stroke="' + SD + '" stroke-width="1.4" opacity=".6"/>' +
    '<ellipse cx="34" cy="62" rx="17" ry="12" fill="' + S + '" stroke="' + SD + '" stroke-width="1.6"/>' +
    '<path d="M49 58 C66 56 78 52 84 36" fill="none" stroke="' + GL + '" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M84 36 q3 -9 11 -11 q1 10 -8 13 Z" fill="' + GL + '" stroke="' + G + '" stroke-width="1.2"/>' +
    '<path d="M49 68 C66 72 80 76 88 90" fill="none" stroke="' + S + '" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M88 90 l4 6" stroke="' + SD + '" stroke-width="5" stroke-linecap="round"/>' +
    arr(106, 18, 106, 40, GREY, 2),
    'A seed lying on its side under the soil: the shoot curves upwards and out of the ground, the root curves downwards, with an arrow showing the direction of gravity.');

  /* a shoot bending towards the sun */
  F['phototropism'] = svg('0 0 120 100',
    '<rect x="0" y="80" width="120" height="20" fill="' + SOIL + '"/>' +
    '<circle cx="20" cy="24" r="11" fill="#FFD34E" stroke="#E8A31C" stroke-width="1.4"/>' +
    '<g stroke="#E8A31C" stroke-width="2" stroke-linecap="round"><path d="M20 7 v-4 M7 24 h-4 M31 13 l3 -3 M31 35 l3 3 M20 41 v4"/></g>' +
    arr(34, 30, 60, 40, '#EFA82B', 1.8) + arr(34, 44, 60, 52, '#EFA82B', 1.8) +
    '<path d="M86 80 C86 62 82 52 70 46" fill="none" stroke="' + GL + '" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M86 80 C86 62 82 52 70 46" fill="none" stroke="' + G + '" stroke-width="11" stroke-linecap="round" opacity=".22"/>' +
    '<path d="M70 46 q-4 -9 3 -14 q7 7 1 14 Z" fill="' + GL + '" stroke="' + G + '" stroke-width="1.2"/>',
    'A shoot growing out of the soil and curving towards a sun drawn at the left, with light rays reaching it.');

  /* the four steps: made at the tip, carried down, gathers on one side, those cells elongate */
  F['auxin-chain'] = svg('0 0 120 100',
    '<path d="M40 26 q20 -16 40 0 V34 H40 Z" fill="' + G + '"/>' +
    dots([[52, 22], [64, 19], [71, 25], [58, 26]]) +
    '<g fill="' + GP + '" stroke="' + G + '" stroke-width="1.3">' +
    '<rect x="40" y="36" width="13" height="17" rx="2"/><rect x="40" y="55" width="13" height="17" rx="2"/>' +
    '<rect x="40" y="74" width="13" height="17" rx="2"/>' +
    '<rect x="67" y="36" width="13" height="11" rx="2"/><rect x="67" y="49" width="13" height="11" rx="2"/>' +
    '<rect x="67" y="62" width="13" height="11" rx="2"/><rect x="67" y="75" width="13" height="11" rx="2"/></g>' +
    '<rect x="53" y="36" width="14" height="55" fill="#F6FAF2" stroke="' + G + '" stroke-width="1.1"/>' +
    dots([[46, 42], [45, 60], [47, 80], [44, 50], [46, 70], [45, 88]]) +
    arr(60, 32, 60, 44, AD, 1.6),
    'A shoot tip with auxin grains in it and an arrow carrying them down into the shoot. The cells drawn down the left side, where the auxin has gathered, are taller than the cells down the right side.');

  /* the inversion: in a root, MORE auxin means LESS elongation, so it bends down */
  F['root-inversion'] = svg('0 0 120 100',
    '<rect x="0" y="0" width="120" height="100" fill="' + SOIL + '"/>' +
    '<g fill="#EFE4C9" stroke="' + SD + '" stroke-width="1.3">' +
    '<rect x="10" y="30" width="22" height="14" rx="2"/><rect x="34" y="31" width="22" height="14" rx="2"/>' +
    '<rect x="58" y="34" width="21" height="14" rx="2"/><rect x="81" y="40" width="18" height="14" rx="2"/></g>' +
    '<g fill="#EFE4C9" stroke="' + SD + '" stroke-width="1.3">' +
    '<rect x="10" y="46" width="13" height="14" rx="2"/><rect x="25" y="47" width="13" height="14" rx="2"/>' +
    '<rect x="40" y="49" width="13" height="14" rx="2"/><rect x="55" y="53" width="13" height="14" rx="2"/>' +
    '<rect x="70" y="59" width="12" height="14" rx="2"/></g>' +
    '<path d="M99 47 q9 5 7 14 q-9 -2 -7 -14 Z" fill="' + S + '" stroke="' + SD + '" stroke-width="1.4"/>' +
    dots([[16, 55], [30, 56], [45, 58], [60, 62], [73, 68], [24, 57], [38, 58], [52, 60], [66, 65]]) +
    arr(108, 12, 108, 32, GREY, 2),
    'A root drawn as two rows of cells with its tip at the lower right. The cells along the top are long; the cells along the bottom, where the auxin grains lie, are short. An arrow shows the direction of gravity.');

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
