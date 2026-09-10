/* ============================================================
   The plant — the register.  SHARED: labs-shared/plant/plant.js is the source; the
   Plants Hub syncs it in (tools/sync-shared.mjs) and the Plants Lab's build copies it.

   One plant, drawn once by plant-draw.js, stands on both pages: a bean plant in a
   section of ground, seed to fruit, with a cactus on the dry side and a water lily on
   the wet side. This file says what the drawing is made of and what a page may point
   at; the words a student reads about each part live with each page.

   parts    what can be lit. Each one:
     id       the drawing's own name for it (matches data-part in the SVG)
     label    what the pill says when it is lit
     note     the small line under the label
     colour   the glow it is lit in — the same on the hub and on the lab's plate
     box      the camera frame for it, in the drawing's coordinates (x y w h)
   stages   the growth stages the hub walks, in order — seed to fruit and then the
            two plants built for hard places. Each says which parts are on the page
            and which are lit; the drawing does the rest. Two flowering nodes: 'flower' is
            the lower, older flower whose petals fall and whose cup ('flower-spent': stalk,
            sepals, receptacle) the pod grows out of; 'flower-2' is the next flower above it,
            which stays open — so at rest the plant carries a flower and a pod, in two places.
   scene    the drawing's size and the horizon, so a page can plan around it
   ============================================================ */
window.PLANT = {
  scene: { w: 1600, h: 1120, horizon: 700, plantX: 560 },

  parts: [
    { id: 'seed',       label: 'Seed',            note: 'where it starts',                  colour: '#E7B96A', box: { x: 380, y: 600, w: 360, h: 300 } },
    { id: 'roots',      label: 'Roots',           note: 'water and mineral ions come in',   colour: '#F2D8A8', box: { x: 300, y: 660, w: 520, h: 420 } },
    { id: 'stem',       label: 'Stem',            note: 'xylem up, phloem to every sink',   colour: '#8CE0A6', box: { x: 300, y: 180, w: 520, h: 600 } },
    { id: 'leaf',       label: 'Leaf',            note: 'where the food is made',           colour: '#B8F08E', box: { x: 280, y: 380, w: 400, h: 300 } },
    { id: 'leaves',     label: 'Leaves',          note: 'the food factory',                 colour: '#B8F08E', box: { x: 260, y: 160, w: 600, h: 540 } },
    { id: 'flower',     label: 'Flower',          note: 'pollination, then fertilisation',  colour: '#FFB3D1', box: { x: 430, y: 210, w: 280, h: 400 } },
    { id: 'fruit',      label: 'Fruit and seeds', note: 'the ovary, after fertilisation',   colour: '#FFD27A', box: { x: 540, y: 470, w: 220, h: 220 } },
    { id: 'sun',        label: 'Light',           note: 'what the shoot grows towards',     colour: '#FFE08A', box: { x: 560, y: -20, w: 420, h: 300 } },
    { id: 'seedling',   label: 'Seedling',        note: 'the shoot finds the light',        colour: '#B8F08E', box: { x: 400, y: 540, w: 480, h: 320 } },
    { id: 'tropism',    label: 'The shoot and the light', note: 'it grows towards the light', colour: '#FFE08A', box: { x: 280, y: 40, w: 600, h: 800 } },
    { id: 'xerophyte',  label: 'A xerophyte',     note: 'built for dry ground',             colour: '#FFD27A', box: { x: 120, y: 480, w: 300, h: 300 } },
    { id: 'hydrophyte', label: 'A hydrophyte',    note: 'built for the water',              colour: '#9FDCFF', box: { x: 860, y: 540, w: 360, h: 300 } },
    { id: 'plant',      label: 'The whole plant', note: 'root to fruit',                    colour: '#B8F08E', box: { x: 240, y: 0, w: 640, h: 1100 } }
  ],

  /* the hub's growth stages: the drawing shows what has grown so far and lights the part
     the stage is about. `flow` runs the sap; `breathe` puffs water vapour off the leaves;
     `bend` leans the shoot towards the light. */
  stages: [
    { id: 'seed',      label: 'Seed',          show: ['seed'],                                        lit: ['seed'] },
    { id: 'root',      label: 'Root',          show: ['seed', 'roots'],                               lit: ['roots'] },
    { id: 'shoot',     label: 'Shoot',         show: ['seed', 'roots', 'seedling'],                   lit: ['seedling', 'sun'], bend: true },
    { id: 'stem',      label: 'Stem',          show: ['seed', 'roots', 'stem', 'leaf-1', 'leaf-2'],   lit: ['stem'], flow: 'both' },
    { id: 'leaf',      label: 'Leaf',          show: ['seed', 'roots', 'stem', 'leaf-1', 'leaf-2', 'leaf-3', 'leaf-4'], lit: ['leaves'] },
    { id: 'water',     label: 'Water',         show: ['seed', 'roots', 'stem', 'leaf-1', 'leaf-2', 'leaf-3', 'leaf-4'], lit: ['roots', 'stem', 'leaves'], flow: 'xylem', breathe: true },
    { id: 'flower',    label: 'Flower',        show: ['seed', 'roots', 'stem', 'leaf-1', 'leaf-2', 'leaf-3', 'leaf-4', 'flower-spent', 'flower', 'flower-2'], lit: ['flower'] },
    { id: 'fruit',     label: 'Fruit',         show: ['seed', 'roots', 'stem', 'leaf-1', 'leaf-2', 'leaf-3', 'leaf-4', 'flower-spent', 'fruit', 'flower-2'], lit: ['fruit'] },
    { id: 'adapted',   label: 'Adapted',       show: ['seed', 'roots', 'stem', 'leaf-1', 'leaf-2', 'leaf-3', 'leaf-4', 'flower-spent', 'fruit', 'flower-2', 'xerophyte', 'hydrophyte'], lit: ['xerophyte', 'hydrophyte'] }
  ]
};
