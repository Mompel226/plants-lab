/* ============================================================
   terms.js — the colour language of the Learn tab, for the plant topics.

   · Four inks, one per thing the plant is doing: WATER (blue) for everything the
     xylem and the leaves do with water; FOOD (amber) for photosynthesis and the
     sugar the phloem carries; REPRODUCTION (rose) for the flower, pollen, seed and
     fruit; GROWTH (violet) for tropisms, hormones and adaptive features.
   · Green is the app's own colour and means nothing in the text.
   · A word with a definition but no colour of its own carries the quiet dotted rule.
   Same API as the other labs' terms.js, so app.js is the same code.

   What a mark promises — Daniel's rule, the same in every lab:
     a magnifying glass   a picture opens where you are
     a faint dotted rule  the definition opens where you are
     an arrow             you are taken to another station
   The arrow is only for a journey with something at the other end; one arrow per
   destination per station; never a word inside a negative.
   ============================================================ */
(function (global) {
  'use strict';

  var CATS = {
    water: { n: '', label: 'Water and transport', chip: false },
    food:  { n: '', label: 'Photosynthesis and food', chip: false },
    repro: { n: '', label: 'Reproduction', chip: false },
    grow:  { n: '', label: 'Growth and adaptation', chip: false },
    plain: { n: '', label: 'Words used across the labs', chip: false }
  };

  var CHIP_WORDS = {};

  var PLAIN_WORDS = {
    water: ['xylem', 'xylem vessel', 'xylem vessels', 'phloem', 'vascular bundle', 'vascular bundles', 'root hair cell', 'root hair cells', 'root hair', 'root hairs',
            'root cortex', 'cortex', 'transpiration', 'transpiration pull', 'transpiration stream', 'wilting', 'wilt', 'wilts', 'wilted', 'turgid', 'flaccid', 'humidity', 'potometer',
            'lignin', 'osmosis', 'active transport', 'mineral ion', 'mineral ions', 'nitrate ion', 'nitrate ions', 'nitrate', 'magnesium ion', 'magnesium ions', 'magnesium',
            'water vapour', 'stoma', 'stomata', 'guard cell', 'guard cells', 'air space', 'air spaces', 'cuticle', 'epidermis', 'upper epidermis', 'lower epidermis'],
    food:  ['photosynthesis', 'photosynthesise', 'photosynthesises', 'chlorophyll', 'chloroplast', 'chloroplasts', 'glucose', 'starch', 'cellulose', 'sucrose', 'nectar',
            'carbohydrate', 'carbohydrates', 'limiting factor', 'limiting factors', 'palisade mesophyll', 'spongy mesophyll', 'mesophyll', 'mesophyll cell', 'mesophyll cells', 'palisade cell', 'palisade cells', 'palisade layer',
            'translocation', 'source', 'sources', 'sink', 'sinks', 'amino acid', 'amino acids', 'iodine solution', 'variegated leaf', 'variegated', 'de-starching', 'de-starched', 'hydrogencarbonate indicator',
            'respiration', 'respire', 'respires', 'enzyme', 'enzymes'],
    repro: ['flower', 'flowers', 'sepal', 'sepals', 'petal', 'petals', 'stamen', 'stamens', 'filament', 'filaments', 'anther', 'anthers', 'carpel', 'carpels', 'stigma', 'stigmas', 'style', 'ovary', 'ovaries',
            'ovule', 'ovules', 'pollen', 'pollen grain', 'pollen grains', 'pollination', 'pollinated', 'self-pollination', 'cross-pollination', 'fertilisation', 'fertilised', 'pollen tube',
            'seed', 'seeds', 'fruit', 'fruits', 'germination', 'germinate', 'germinates', 'germinating', 'radicle', 'plumule', 'testa', 'seed coat', 'cotyledon', 'cotyledons', 'embryo',
            'gamete', 'gametes', 'male gamete', 'female gamete', 'insect-pollinated', 'wind-pollinated'],
    grow:  ['tropism', 'tropisms', 'gravitropism', 'phototropism', 'auxin', 'auxins', 'shoot tip', 'shoot tips', 'cell elongation', 'elongation', 'stimulus', 'stimuli', 'adaptive feature', 'adaptive features',
            'xerophyte', 'xerophytes', 'hydrophyte', 'hydrophytes', 'adaptation', 'adaptations', 'sensitivity'],
    plain: ['diffusion', 'diffuse', 'diffuses', 'concentration gradient', 'partially permeable', 'cell membrane', 'cell wall', 'cell walls', 'vacuole', 'vacuoles', 'nucleus', 'nuclei', 'mitochondrion', 'mitochondria', 'surface area',
            'dry mass', 'organ', 'organs', 'tissue', 'tissues', 'dicotyledon', 'dicotyledons', 'monocotyledon', 'monocotyledons', 'species', 'population', 'populations', 'variation', 'variations', 'natural selection',
            'standard deviation', 'standard error', '95 % confidence interval', 'confidence interval']
  };

  /* --------- what happens when you click a term ---------
     peek : a small picture appears where you clicked — for a thing you need to SEE
     jump : go to the station where the word is properly explained
     Every picture here is a close-up of the thing named, from the lab's own pictures. */
  var PEEK = {};
  [
    ['root hairs', 'root-hairs-900.jpg', '<b>Root hairs</b>: the white fuzz along the root of this radish seedling. Each hair is one cell drawn out into a thread, and together they give the root a huge surface area for taking in water and mineral ions.', 'From the 8.2 lesson slides'],
    ['root hair', 'root-hairs-900.jpg', 'A <b>root hair</b>: one cell of the root surface drawn out into a thread — thousands of them make the white fuzz on this seedling.', 'From the 8.2 lesson slides'],
    ['root hair cells', 'root-hairs-900.jpg', '<b>Root hair cells</b>: the cells that make the white fuzz on this radish root, each one drawn out into a thread that reaches between the soil particles.', 'From the 8.2 lesson slides'],
    ['stomata', 'stomata-safranin-900.jpg', '<b>Stomata</b>: the pores in a leaf’s epidermis. At ×450 one shows its pore between two guard cells; at ×100 you can see how many there are.', 'Safranin-stained epidermis, from the 6.2 lesson slides'],
    ['stoma', 'stomata-safranin-900.jpg', 'A <b>stoma</b> at ×450: the pore between its two curved guard cells, which are the only cells of the epidermis with chloroplasts.', 'Safranin-stained epidermis, from the 6.2 lesson slides'],
    ['guard cells', 'guard-cells-900.jpg', '<b>Guard cells</b>, drawn: turgid and curved apart with the stoma open, then flaccid and closed. The inner wall is thicker, which is why taking in water bends them outwards.', 'From the 6.2 lesson slides'],
    ['xylem vessel', 'xylem-vessel-900.jpg', 'A <b>xylem vessel</b>: dead cells joined end to end with no cross walls, thick walls stiffened with lignin, and one-way flow of water and mineral ions upwards.', 'From the Topic 6–8 revision slides'],
    ['xylem vessels', 'xylem-vessel-900.jpg', '<b>Xylem vessels</b>: continuous tubes of dead, lignified cells with no cross walls, carrying water and mineral ions up.', 'From the Topic 6–8 revision slides'],
    ['pollen grains', 'pollen-spiky-900.jpg', 'A <b>pollen grain</b> under the electron microscope. The spikes are for hooking into an insect’s hairs; the grains of a wind-pollinated flower are smooth and far smaller.', 'From the 16.3 lesson slides'],
    ['pollen grain', 'pollen-spiky-900.jpg', 'A <b>pollen grain</b>, magnified thousands of times: spiky, so it hooks into a visiting insect. It carries the male gamete.', 'From the 16.3 lesson slides'],
    ['pollen', 'lily-anthers-900.jpg', '<b>Pollen</b>: the dark dust on these lily anthers. Each grain carries a male gamete, and the anther holds them up where an insect must brush past.', 'From the 16.3 lesson slides'],
    ['anthers', 'lily-anthers-900.jpg', '<b>Anthers</b>: the dark, pollen-covered tips of these lily stamens, each on its long filament.', 'From the 16.3 lesson slides'],
    ['ovules', 'ovary-ovules-900.jpg', '<b>Ovules</b>: the pale beads inside this ovary, cut open. Each holds a female gamete, and each becomes a seed after fertilisation.', 'From the 16.3 lesson slides'],
    ['ovule', 'ovary-ovules-900.jpg', 'An <b>ovule</b>, one of the pale beads inside this cut-open ovary: it holds the female gamete and becomes a seed after fertilisation.', 'From the 16.3 lesson slides'],
    ['radicle', 'seed-radicle-900.jpg', 'The <b>radicle</b>, the embryo root, is the thicker of the two and the first out of the seed; the thinner plumule beside it becomes the shoot.', 'From the 16.3 germination slides'],
    ['plumule', 'seed-radicle-900.jpg', 'The <b>plumule</b>, the embryo shoot: the thinner of the two, coming out after the radicle.', 'From the 16.3 germination slides'],
    ['wilted', 'wilted-plant-900.jpg', '<b>Wilted</b>: the cells have lost water and gone flaccid, so nothing is holding the leaves up.', 'From the 8.3 lesson slides'],
    ['wilting', 'wilted-plant-900.jpg', '<b>Wilting</b>: transpiration outran uptake, the cells lost water and went flaccid, and the leaves droop. Water it and they rise.', 'From the 8.3 lesson slides'],
    ['palisade cells', 'leaf-x120-900.jpg', 'The <b>palisade cells</b> in a real leaf section: the tall cells standing side by side just under the upper epidermis, packed with chloroplasts.', 'Photomicrograph ×120, from the Topic 6 questions lesson'],
    ['xerophyte', 'saguaro-desert-900.jpg', 'A <b>xerophyte</b>: a saguaro cactus. Leaves reduced to spines, a thick water-storing stem that does the photosynthesis, a waxy skin, and roots spread just under the surface.', 'From the 18.2 lesson slides'],
    ['xerophytes', 'marram-dunes-900.jpg', '<b>Xerophytes</b>: marram grass on a dune, where the sand holds almost no water. Its leaves roll into tubes with the stomata inside.', 'From the 18.2 lesson slides'],
    ['hydrophyte', 'water-lily-drawing-900.jpg', 'A <b>hydrophyte</b>: a water lily, with large flat leaves floating on the surface, long weak stems the water holds up, and roots in the mud.', 'From the 18.2 lesson slides'],
    ['potometer', 'potometer-poster', 'A <b>potometer</b>: a cut shoot in a water-filled tube. As it transpires it draws water in, and an air bubble in the capillary tube moves along; the distance it moves in a set time is the measure.', 'From the 8.3 lesson folder']
  ].forEach(function (e) { PEEK[e[0]] = [e[1], e[2], e[3]]; });

  /* the same word, different station: a picture that is right in one place can be wrong in another */
  var CONTEXT = {};

  /* the statistics of the potometer's table: bold every time, and a click shows what each is and how it is worked out */
  var STAT = { 'standard deviation': 'sd', 'standard error': 'se', '95 % confidence interval': 'ci', 'confidence interval': 'ci' };

  var JUMP = {};
  function jump(list, st) { list.forEach(function (w) { JUMP[w] = st; }); }
  jump(['germination', 'germinate', 'germinates', 'germinating', 'radicle', 'plumule', 'testa', 'seed coat', 'cotyledon', 'cotyledons', 'dry mass'], 'seed');
  jump(['root hair cell', 'root hair cells', 'root hair', 'root hairs', 'root cortex', 'cortex', 'mineral ion', 'mineral ions', 'nitrate ion', 'nitrate ions', 'nitrate', 'magnesium ion', 'magnesium ions', 'magnesium', 'osmosis', 'active transport'], 'root');
  jump(['xylem', 'xylem vessel', 'xylem vessels', 'phloem', 'vascular bundle', 'vascular bundles', 'lignin'], 'stem');
  jump(['stoma', 'stomata', 'guard cell', 'guard cells', 'air space', 'air spaces', 'cuticle', 'epidermis', 'upper epidermis', 'lower epidermis', 'palisade mesophyll', 'spongy mesophyll', 'mesophyll', 'mesophyll cell', 'mesophyll cells', 'palisade cell', 'palisade cells', 'palisade layer', 'surface area'], 'leaf');
  jump(['photosynthesis', 'photosynthesise', 'photosynthesises', 'chlorophyll', 'chloroplast', 'chloroplasts', 'glucose', 'starch', 'cellulose', 'nectar', 'carbohydrate', 'carbohydrates', 'limiting factor', 'limiting factors', 'iodine solution', 'variegated leaf', 'variegated', 'de-starching', 'de-starched', 'hydrogencarbonate indicator'], 'photosynthesis');
  jump(['transpiration', 'transpiration pull', 'transpiration stream', 'wilting', 'wilt', 'wilts', 'wilted', 'turgid', 'flaccid', 'humidity', 'potometer', 'water vapour'], 'transpiration');
  jump(['translocation', 'source', 'sources', 'sink', 'sinks', 'sucrose', 'amino acid', 'amino acids'], 'translocation');
  jump(['tropism', 'tropisms', 'gravitropism', 'phototropism', 'auxin', 'auxins', 'shoot tip', 'shoot tips', 'cell elongation', 'elongation', 'stimulus', 'stimuli', 'sensitivity'], 'tropisms');
  jump(['flower', 'flowers', 'sepal', 'sepals', 'petal', 'petals', 'stamen', 'stamens', 'filament', 'filaments', 'anther', 'anthers', 'carpel', 'carpels', 'stigma', 'stigmas', 'style', 'ovary', 'ovaries', 'pollen', 'pollen grain', 'pollen grains',
        'pollination', 'pollinated', 'self-pollination', 'cross-pollination', 'insect-pollinated', 'wind-pollinated', 'gamete', 'gametes', 'male gamete', 'female gamete'], 'flower');
  jump(['fertilisation', 'fertilised', 'pollen tube', 'ovule', 'ovules', 'seed', 'seeds', 'fruit', 'fruits', 'embryo'], 'fruit');
  jump(['adaptive feature', 'adaptive features', 'xerophyte', 'xerophytes', 'hydrophyte', 'hydrophytes', 'adaptation', 'adaptations'], 'adapted');

  /* --------- build one matcher, longest phrase first --------- */
  var ENTRIES = [];
  Object.keys(CHIP_WORDS).forEach(function (cat) { CHIP_WORDS[cat].forEach(function (w) { ENTRIES.push([w, cat, true]); }); });
  Object.keys(PLAIN_WORDS).forEach(function (cat) { PLAIN_WORDS[cat].forEach(function (w) { ENTRIES.push([w, cat, false]); }); });
  ENTRIES.sort(function (a, b) { return b[0].length - a[0].length; });

  var DEFINED = {};
  (global.GLOSSARY || []).forEach(function (e) { DEFINED[e.term.toLowerCase()] = e.term; });
  /* a plural or an inflection opens the singular's definition */
  function defined(low) {
    if (DEFINED[low]) return DEFINED[low];
    var F = global.GLOSSARY_FORMS || {}; if (F[low]) return F[low];   /* the plural, the singular, the verb, an alias: worked out at build time */
    var tries = [low.replace(/ies$/, 'y'), low.replace(/ata$/, 'a'), low.replace(/s$/, ''), low.replace(/es$/, ''), low.replace(/ed$/, ''), low.replace(/ing$/, 'e'), low.replace(/ing$/, '')];
    for (var i = 0; i < tries.length; i++) if (tries[i] !== low && DEFINED[tries[i]]) return DEFINED[tries[i]];
    return null;
  }

  var KNOWN = {};
  var KNOWN_KEY = 'labs.knownWords.v1';
  try { (JSON.parse(localStorage.getItem(KNOWN_KEY) || '[]') || []).forEach(function (w) { KNOWN[w] = 1; }); } catch (e) {}
  function saveKnown() { try { localStorage.setItem(KNOWN_KEY, JSON.stringify(Object.keys(KNOWN))); } catch (e) {} }
  function setKnown(term, yes) { var low = String(term).toLowerCase(); if (yes) KNOWN[low] = 1; else delete KNOWN[low]; saveKnown(); }
  function isKnown(term) { return !!KNOWN[String(term).toLowerCase()]; }
  function forgetAll() { KNOWN = {}; saveKnown(); }
  function knownCount() { return Object.keys(KNOWN).length; }

  var INFO = {};
  ENTRIES.forEach(function (e) { if (!INFO[e[0].toLowerCase()]) INFO[e[0].toLowerCase()] = e; });

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var RE = new RegExp('(?<![A-Za-z0-9-])(' + ENTRIES.map(function (e) { return escRe(e[0]); }).join('|') + ')(?![A-Za-z0-9-])', 'gi');

  /* the words with something at the other end worth the journey: a table, a widget, a
     picture, the part itself. Everything else with a definition opens it in place. */
  var GOES_THERE = {};
  ['germination', 'radicle', 'plumule', 'root hair cell', 'root hair cells', 'root hairs', 'osmosis', 'active transport', 'nitrate ions', 'magnesium ions',
   'xylem', 'phloem', 'vascular bundle', 'vascular bundles', 'xylem vessel', 'xylem vessels',
   'stomata', 'stoma', 'guard cells', 'palisade mesophyll', 'spongy mesophyll', 'cuticle',
   'photosynthesis', 'limiting factor', 'limiting factors', 'iodine solution', 'hydrogencarbonate indicator', 'starch',
   'transpiration', 'transpiration pull', 'potometer', 'wilting',
   'translocation', 'source', 'sink', 'sources', 'sinks', 'sucrose',
   'tropism', 'tropisms', 'gravitropism', 'phototropism', 'auxin',
   'flower', 'pollination', 'self-pollination', 'cross-pollination', 'insect-pollinated', 'wind-pollinated', 'stamen', 'carpel',
   'fertilisation', 'pollen tube', 'seed', 'fruit',
   'adaptive feature', 'adaptive features', 'xerophyte', 'hydrophyte'].forEach(function (w) { GOES_THERE[w] = true; });

  var here = null, seen = null, quiet = false, wentTo = null;
  function setStation(id) { here = id; seen = Object.create(null); quiet = false; wentTo = Object.create(null); }
  function setQuiet(v) { quiet = !!v; }

  var U0 = '', U1 = '';
  function underlineMarks(escaped) { return escaped.replace(/_([^_\n]{1,240})_/g, U0 + '$1' + U1); }
  function underlineTags(html) {
    return html.replace(new RegExp(U0 + '([\\s\\S]*?)' + U1, 'g'), function (m, inner) {
      return '<u class="syl-u">' + inner.replace(/<i class="tc__n">[^<]*<\/i>/g, '').replace(/<\/?[bi][^>]*>/g, '') + '</u>';
    });
  }

  /* a word inside a negative is a word about something that is NOT there */
  var NEGATED = /(?:^|[\s(—-])(?:no|not|non|never|without|neither|nor|lack|lacks|lacking|nothing)\s+(?:[a-z]+\s+){0,2}$/i;

  function mark(text) {
    return underlineTags(underlineMarks(esc(text)).replace(RE, function (m, _g, at, whole) {
      var low = m.toLowerCase(), e = INFO[low];
      if (!e) return m;
      if (STAT[low]) return '<b class="t t--plain is-stat" data-stat="' + STAT[low] + '" data-term="' + esc(m) + '" tabindex="0" role="button">' + m + '</b>';
      var before = String(whole).slice(0, at).replace(/<[^>]*>/g, '');
      if (NEGATED.test(before)) return m;
      var cat = e[1], act = '', cls = '';
      var first = !quiet && !(seen && seen[low]);
      if (seen) seen[low] = true;
      if (!first) return m;
      var ctx = (CONTEXT[here] || {})[low];
      var def = defined(low);
      if (ctx || PEEK[low]) {
        var pk = ctx || PEEK[low];
        act = ' data-peek="' + pk[0] + '" data-note="' + esc(pk[1]) + '"' + (pk[2] ? ' data-credit="' + esc(pk[2]) + '"' : '') + ' tabindex="0" role="button"';
        cls = ' is-peek';
      } else if (JUMP[low] === here) {
        return '<b class="t t--' + cat + '">' + m + '</b>';
      } else if (JUMP[low] && GOES_THERE[low] && !(wentTo && wentTo[JUMP[low]])) {
        if (wentTo) wentTo[JUMP[low]] = true;
        act = ' data-jump="' + JUMP[low] + '" tabindex="0" role="button"';
        cls = ' is-jump';
      } else if (def && !KNOWN[def.toLowerCase()]) {
        act = ' data-gloss="' + esc(def) + '" tabindex="0" role="button"';
        cls = ' is-gloss';
      } else if (JUMP[low] && !(wentTo && wentTo[JUMP[low]])) {
        if (wentTo) wentTo[JUMP[low]] = true;
        act = ' data-jump="' + JUMP[low] + '" tabindex="0" role="button"';
        cls = ' is-jump';
      }
      return '<b class="t t--' + cat + cls + '"' + act + (act ? ' data-term="' + esc(m) + '"' : '') + '>' + m + '</b>';
    }));
  }

  function legend() {
    var out = '<p class="legend__intro">Each ink is one thing the plant is doing. The colour on the page is the colour the plant lights.</p><div class="legend">';
    ['water', 'food', 'repro', 'grow'].forEach(function (c) {
      out += '<span class="legend__i"><b class="t t--' + c + '">' + CATS[c].label + '</b></span>';
    });
    out += '</div>';
    return out;
  }

  global.Terms = { setKnown: setKnown, isKnown: isKnown, forgetAll: forgetAll, knownCount: knownCount, mark: mark, legend: legend,
                   CATS: CATS, setStation: setStation, setQuiet: setQuiet, PEEK: PEEK, JUMP: JUMP };
})(window);
