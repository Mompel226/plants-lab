/* ============================================================
   sw.template.js — the offline worker both labs share.

   tools/build.mjs fills in the four placeholders below — the lab's name, this build's
   version, the list of stamped files, and a hash per picture — and writes the result to that
   lab's repo root as sw.js. Its scope is therefore exactly /<lab>/ on Pages:
   the most a worker gets by default, this lab and nothing above it. Never edit sw.js.

   ---------------------------------------------------------------------------
   THE ONE DECISION THAT MATTERS: the HTML document is fetched NETWORK-FIRST.

   A service worker on GitHub Pages is the one change that cannot be undone by pushing a fix,
   because we cannot set response headers. The way that goes wrong is always the same: the
   worker serves a cached index.html forever, and every later deploy is invisible. The usual
   defence is a version banner and a kill switch, and the usual result is that a class sits on
   a stale page for a lesson while someone works out why.

   So this worker never prefers the cache for the document while the network is reachable. It
   asks the network first, with a short timeout, and only falls back to what it holds when
   that fails. Online, a student sees exactly what they see today. Offline, they get the lab.

   Everything else IS cache-first, and safely so, because every other URL is immutable by
   construction: index.html carries a ?v= stamp on every script and stylesheet, and the stamp
   changes whenever the file does, so a cached ?v=1 file can never stand in for ?v=2. Pictures
   are keyed by a hash of their own bytes for the same reason.

   The cost is one 12 KB document fetch per online load. That is the price of making the
   unrecoverable failure impossible, and it is worth paying.
   ---------------------------------------------------------------------------

   Cache names are prefixed with the lab, because both labs — and the hubs, and the other
   sims — share the origin mompel226.github.io and therefore share one CacheStorage.
   ============================================================ */
const LAB        = 'plants-lab';
const VERSION    = '1789050595';
const SHELL      = LAB + '-shell-v' + VERSION;
const MEDIA      = LAB + '-media';
const PRECACHE   = ["./css/app.css?v=1789050595","./js/config.js?v=1789050595","./js/data/glossary.js?v=1789050595","./js/data/syllabus.js?v=1789050595","./js/data/stations.js?v=1789050595","./js/data/photos.js?v=1789050595","./js/plant.js?v=1789050595","./js/plant-draw.js?v=1789050595","./js/terms.js?v=1789050595","./js/marking.js?v=1789050595","./js/sync.js?v=1789050595","./js/engine.js?v=1789050595","./js/syllabus.js?v=1789050595","./js/widgets.js?v=1789050595","./js/learn.js?v=1789050595","./js/engine-ext.js?v=1789050595","./js/plate.js?v=1789050595","./js/app.js?v=1789050595"];      /* every stamped .js and .css, taken from the HTML the build just stamped */
const MEDIA_REV  = {"photos/apple-section-900.jpg":"7cab9e33","photos/apple-section-900.webp":"f28e3728","photos/auxin-elongation-900.jpg":"5489d9fb","photos/auxin-elongation-900.webp":"af49b9ff","photos/bee-pollen-900.jpg":"ca09491d","photos/bee-pollen-900.webp":"39d6f0e3","photos/bee-rose-900.jpg":"1b547b51","photos/bee-rose-900.webp":"8664caa3","photos/bundle-drawing-900.jpg":"10b06475","photos/bundle-drawing-900.webp":"102d7edb","photos/cohesion-900.jpg":"e04d268b","photos/cohesion-900.webp":"70ec1d46","photos/curled-leaf-900.jpg":"b1f22c81","photos/curled-leaf-900.webp":"c81007f0","photos/deficiency-yellow-900.jpg":"79d3f146","photos/deficiency-yellow-900.webp":"d1a27702","photos/elodea-lamp-900.jpg":"4563dd18","photos/elodea-lamp-900.webp":"18d151cb","photos/epidermis-stomata-1400.jpg":"8930872d","photos/epidermis-stomata-1400.webp":"c77b7208","photos/epidermis-stomata-900.jpg":"150a3998","photos/epidermis-stomata-900.webp":"72dfca21","photos/grass-anthers-900.jpg":"28e56338","photos/grass-anthers-900.webp":"fa607067","photos/guard-cells-900.jpg":"e8e7722d","photos/guard-cells-900.webp":"89d2c15a","photos/hydrophyte-leaf-900.jpg":"77273190","photos/hydrophyte-leaf-900.webp":"a404422c","photos/leaf-diagram-900.jpg":"4493a997","photos/leaf-diagram-900.webp":"e7188549","photos/leaf-diagram-beige-900.jpg":"74f45246","photos/leaf-diagram-beige-900.webp":"9d17eaf1","photos/leaf-diagram-blank-900.jpg":"7a52935b","photos/leaf-diagram-blank-900.webp":"e96cc5c1","photos/leaf-micrograph-900.jpg":"92482579","photos/leaf-micrograph-900.webp":"cf04da1f","photos/leaf-section-1400.jpg":"bb2e57f5","photos/leaf-section-1400.webp":"484d1085","photos/leaf-section-900.jpg":"8cbb0da2","photos/leaf-section-900.webp":"a59e5cbe","photos/leaf-stoma-1400.jpg":"0f49b197","photos/leaf-stoma-1400.webp":"449586f9","photos/leaf-stoma-900.jpg":"58302c6e","photos/leaf-stoma-900.webp":"0d215ead","photos/leaf-tissue-map-1400.jpg":"7b8d88a1","photos/leaf-tissue-map-1400.webp":"df4fe310","photos/leaf-tissue-map-900.jpg":"61f7cd72","photos/leaf-tissue-map-900.webp":"9168c775","photos/leaf-veins-1400.jpg":"708af0dd","photos/leaf-veins-1400.webp":"ec8d3f5a","photos/leaf-veins-900.jpg":"f320b8c8","photos/leaf-veins-900.webp":"c1996eb4","photos/leaf-water-path-900.jpg":"7898aa58","photos/leaf-water-path-900.webp":"c99a9e9f","photos/leaf-x120-1400.jpg":"d441ecc4","photos/leaf-x120-1400.webp":"a179afb8","photos/leaf-x120-900.jpg":"12d67b7c","photos/leaf-x120-900.webp":"7cd7e8ea","photos/light-graph-900.jpg":"82315237","photos/light-graph-900.webp":"890b9a17","photos/lily-anthers-900.jpg":"c57f2991","photos/lily-anthers-900.webp":"c23c7056","photos/limiting-ceilings-1400.jpg":"000ad1a9","photos/limiting-ceilings-1400.webp":"a30341ae","photos/limiting-ceilings-900.jpg":"6898d727","photos/limiting-ceilings-900.webp":"9e90f5c1","photos/limiting-graphs-1400.jpg":"76234958","photos/limiting-graphs-1400.webp":"9ef9722e","photos/limiting-graphs-900.jpg":"f1cd06ec","photos/limiting-graphs-900.webp":"0ab66a9a","photos/limiting-stomata-1400.jpg":"32279c5f","photos/limiting-stomata-1400.webp":"47f0b808","photos/limiting-stomata-900.jpg":"b0400c1a","photos/limiting-stomata-900.webp":"50201488","photos/marram-close-900.jpg":"84fa88b5","photos/marram-close-900.webp":"db2d940b","photos/marram-dunes-1400.jpg":"6db0ab20","photos/marram-dunes-1400.webp":"7e06f47d","photos/marram-dunes-900.jpg":"dc460d08","photos/marram-dunes-900.webp":"c9e175f2","photos/ovary-fruit-900.jpg":"e17c472c","photos/ovary-fruit-900.webp":"ed6d1272","photos/ovary-ovules-900.jpg":"8d4a20d7","photos/ovary-ovules-900.webp":"b57cdf3b","photos/plant-cell-900.jpg":"6662d22a","photos/plant-cell-900.webp":"5bb89abe","photos/plant-on-side-900.jpg":"7fb0fdcc","photos/plant-on-side-900.webp":"1dde692d","photos/plant-on-side-grown-900.jpg":"33c7de04","photos/plant-on-side-grown-900.webp":"603c946d","photos/plantain-2-1400.jpg":"387ff118","photos/plantain-2-1400.webp":"e1ad2d35","photos/plantain-2-900.jpg":"1ac91632","photos/plantain-2-900.webp":"3ffec9c3","photos/plantain-flower-1400.jpg":"3027b8cd","photos/plantain-flower-1400.webp":"108a5f01","photos/plantain-flower-900.jpg":"2a400f9f","photos/plantain-flower-900.webp":"25e1c3d8","photos/pollen-mixed-900.jpg":"7cd14326","photos/pollen-mixed-900.webp":"2bf1600f","photos/pollen-spiky-1400.jpg":"fc72d149","photos/pollen-spiky-1400.webp":"6d083139","photos/pollen-spiky-900.jpg":"2273b525","photos/pollen-spiky-900.webp":"fab876d6","photos/pollen-tube-900.jpg":"3375f385","photos/pollen-tube-900.webp":"31268c25","photos/pollen-tube-path-1400.jpg":"355ed0ea","photos/pollen-tube-path-1400.webp":"90e28ef1","photos/pollen-tube-path-900.jpg":"86ec88b1","photos/pollen-tube-path-900.webp":"67cd9cdc","photos/rolled-leaf-900.jpg":"17f179b9","photos/rolled-leaf-900.webp":"e35ebf35","photos/root-hair-cell-900.jpg":"91e07c71","photos/root-hair-cell-900.webp":"6899306a","photos/root-hairs-900.jpg":"a8cd31e8","photos/root-hairs-900.webp":"3235f1d3","photos/root-networks-900.jpg":"c3c8b906","photos/root-networks-900.webp":"b602b623","photos/root-pathway-900.jpg":"e4824c61","photos/root-pathway-900.webp":"c2582273","photos/root-section-1400.jpg":"60da64ed","photos/root-section-1400.webp":"8326e073","photos/root-section-900.jpg":"14e3ab29","photos/root-section-900.webp":"06c81bfd","photos/root-sections-900.jpg":"47949c95","photos/root-sections-900.webp":"04a86df4","photos/root-stele-1400.jpg":"7e7d0573","photos/root-stele-1400.webp":"7f72e9aa","photos/root-stele-900.jpg":"8ce2402b","photos/root-stele-900.webp":"ae16432c","photos/root-structure-900.jpg":"d5b9e7f5","photos/root-structure-900.webp":"908a5982","photos/root-tip-900.jpg":"a6180312","photos/root-tip-900.webp":"a3748cfb","photos/saguaro-desert-1400.jpg":"b9e9a60d","photos/saguaro-desert-1400.webp":"aad75b21","photos/saguaro-desert-900.jpg":"47cc1b59","photos/saguaro-desert-900.webp":"253cff3f","photos/sections-outline-900.jpg":"b93d0af4","photos/sections-outline-900.webp":"30622d3d","photos/seed-graph-bars-1400.jpg":"5aa6549f","photos/seed-graph-bars-1400.webp":"d2138745","photos/seed-graph-bars-900.jpg":"394ffacf","photos/seed-graph-bars-900.webp":"7e0549b4","photos/seed-graph-line-1400.jpg":"cf5a4c3f","photos/seed-graph-line-1400.webp":"074dbfac","photos/seed-graph-line-900.jpg":"a5ee472e","photos/seed-graph-line-900.webp":"433f5bc0","photos/seed-radicle-900.jpg":"e2ad5c19","photos/seed-radicle-900.webp":"7e48aaaa","photos/seed-stages-900.jpg":"ca6bcd04","photos/seed-stages-900.webp":"db450fcc","photos/seed-structure-900.jpg":"48e4ca8c","photos/seed-structure-900.webp":"a8560d39","photos/seedling-900.jpg":"032edaa7","photos/seedling-900.webp":"f10c9f62","photos/seedlings-pot-900.jpg":"724539a7","photos/seedlings-pot-900.webp":"515d8ade","photos/sieve-tube-900.jpg":"38ffc7cf","photos/sieve-tube-900.webp":"0153a92a","photos/starch-boil-1400.jpg":"4ebf6a7a","photos/starch-boil-1400.webp":"0e7ebd43","photos/starch-boil-900.jpg":"2c8df49d","photos/starch-boil-900.webp":"9e7ae17e","photos/starch-decolourised-1400.jpg":"309c87eb","photos/starch-decolourised-1400.webp":"56c094d8","photos/starch-decolourised-900.jpg":"92027cb4","photos/starch-decolourised-900.webp":"e8f6dd77","photos/starch-family-900.jpg":"8fb7d53e","photos/starch-family-900.webp":"56d3a07a","photos/starch-iodine-1400.jpg":"b8ba0df0","photos/starch-iodine-1400.webp":"450ac672","photos/starch-iodine-900.jpg":"5554bbb2","photos/starch-iodine-900.webp":"1c712b9f","photos/starch-leaves-1400.jpg":"9474bfb5","photos/starch-leaves-1400.webp":"9af3cd59","photos/starch-leaves-900.jpg":"9c26b3d2","photos/starch-leaves-900.webp":"5e0d8122","photos/stem-block-900.jpg":"c3aadea1","photos/stem-block-900.webp":"3987b2b6","photos/stem-bundle-900.jpg":"e2d9baa4","photos/stem-bundle-900.webp":"12f0ec85","photos/stem-section-1400.jpg":"0445c210","photos/stem-section-1400.webp":"1b592ece","photos/stem-section-900.jpg":"f01aad4e","photos/stem-section-900.webp":"a4ede84c","photos/stomata-open-closed-1400.jpg":"000186dd","photos/stomata-open-closed-1400.webp":"22058e87","photos/stomata-open-closed-900.jpg":"9f1ed973","photos/stomata-open-closed-900.webp":"2e0f0776","photos/stomata-safranin-1400.jpg":"9940a27e","photos/stomata-safranin-1400.webp":"4f953a3f","photos/stomata-safranin-900.jpg":"a9b5a663","photos/stomata-safranin-900.webp":"53571e9b","photos/succulents-900.jpg":"0924e833","photos/succulents-900.webp":"c91c006e","photos/tissues-map-1400.jpg":"d8bb15d2","photos/tissues-map-1400.webp":"bdc62cd3","photos/tissues-map-900.jpg":"6c841e5a","photos/tissues-map-900.webp":"4f2135f4","photos/tropism-cartoon-900.jpg":"6a727bb4","photos/tropism-cartoon-900.webp":"1f636cd3","photos/variegated-diagram-1400.jpg":"4180537b","photos/variegated-diagram-1400.webp":"89a19a2e","photos/variegated-diagram-900.jpg":"9775be59","photos/variegated-diagram-900.webp":"00016c6c","photos/variegated-leaves-900.jpg":"13dd8ce3","photos/variegated-leaves-900.webp":"e1889f04","photos/water-lily-drawing-900.jpg":"59bcc9f3","photos/water-lily-drawing-900.webp":"c06cb860","photos/water-pathway-1400.jpg":"017a0310","photos/water-pathway-1400.webp":"d424378c","photos/water-pathway-900.jpg":"a8d73691","photos/water-pathway-900.webp":"f365cb77","photos/wilted-plant-900.jpg":"6ef1d62d","photos/wilted-plant-900.webp":"8936b610","photos/xylem-vessel-900.jpg":"6869f049","photos/xylem-vessel-900.webp":"9ce39ec8","video/dye-flowers.jpg":"9e88b332","video/germination.jpg":"fa41133d","video/photosynthesis.jpg":"e4b3c46b","video/potometer.jpg":"9f99bfb7","video/transport-animation.jpg":"cd80fb70","video/tropism-timelapse.jpg":"5c878f89","video/water-absorption.jpg":"ee14be9b","video/water-transport.jpg":"022b9746"};     /* 'photos/x.jpg' -> a short hash of its bytes */
const DOC_TIMEOUT = 3000;

/* ---------- install: take a complete, self-consistent copy ---------- */
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const c = await caches.open(SHELL);
    /* cache:'reload' is not optional. A Request built from a plain string uses the default
       cache mode, so './' would come from the browser's own HTTP cache — which Pages lets it
       hold for ten minutes — while the never-before-seen ?v= urls come from the network. That
       pairs an old document with new files, which is the exact failure this worker exists to
       avoid. */
    const doc = await fetch('./', { cache: 'reload' });
    if (!doc.ok) throw new Error('index responded ' + doc.status);
    await c.put('./', doc.clone());
    await c.addAll(PRECACHE);
    /* And then check what is ACTUALLY in the cache, not what the server said. If the document
       we hold does not name this worker's own version, throw: a failed install simply never
       activates, and the lab goes on behaving exactly as it does without a worker. */
    const held = await (await c.match('./')).text();
    const m = held.match(/stations\.js\?v=(\d+)/);
    if (!m || m[1] !== VERSION) {
      await caches.delete(SHELL);
      throw new Error('cached index is v' + (m && m[1]) + ' but this worker is v' + VERSION);
    }
  })());
});

/* ---------- activate: drop this lab's old shells, and only this lab's ---------- */
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys())
      if (k.indexOf(LAB + '-shell-v') === 0 && k !== SHELL) await caches.delete(k);
    /* forget pictures that are no longer in the build */
    const media = await caches.open(MEDIA);
    const want = new Set(Object.keys(MEDIA_REV).map(p => p + '?r=' + MEDIA_REV[p]));
    for (const req of await media.keys()) {
      const u = new URL(req.url);
      const rel = u.pathname.split('/assets/')[1];
      if (rel && !want.has(rel + u.search)) await media.delete(req);
    }
    /* clients.matchAll is scoped to the ORIGIN, not to this worker: both labs live on
       mompel226.github.io, so an unfiltered broadcast would pop a "newer version" banner in
       the OTHER lab's tab, whose Reload button would then do nothing for ever. */
    const cs = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const c of cs)
      if (c.url.indexOf(self.registration.scope) === 0)
        c.postMessage({ type: 'VERSION', lab: LAB, version: VERSION });
  })());
});

self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });

/* ---------- fetch ---------- */
function inScope(url) { return url.href.indexOf(self.registration.scope) === 0; }

async function fromNetworkFirst(request) {
  /* the document. Online it is always the live one; offline it is the last one we held. */
  const cache = await caches.open(SHELL);
  try {
    const net = await Promise.race([
      fetch(request, { cache: 'no-store' }),
      new Promise((_, no) => setTimeout(() => no(new Error('slow')), DOC_TIMEOUT))
    ]);
    if (net && net.ok) { cache.put('./', net.clone()); return net; }
    throw new Error('document responded ' + (net && net.status));
  } catch (e) {
    const held = await cache.match('./');
    if (held) return held;
    throw e;
  }
}

async function cacheFirst(request, cacheName) {
  /* Anything unexpected in here — CacheStorage refused in a private window, quota, a bug —
     must end in an ordinary network fetch. A respondWith that rejects does not fall back to
     the network: it fails the request outright, which would be a blank lab. */
  try {
    const cache = await caches.open(cacheName);
    const hit = await cache.match(request);
    if (hit) return hit;
    const net = await fetch(request);
    if (net && net.ok && net.type === 'basic') cache.put(request, net.clone());
    return net;
  } catch (e) {
    return fetch(request);
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  /* A Range request is how Safari on iOS plays and scrubs a video. Answering one from a whole
     cached body breaks playback silently on exactly that browser, so never touch them. */
  if (req.headers.has('range')) return;
  const url = new URL(req.url);
  /* cross-origin — the Google sign-in client, the font stylesheet — is never this worker's
     business. Letting it through untouched is what keeps sign-in working. */
  if (url.origin !== location.origin || !inScope(url)) return;

  if (req.mode === 'navigate') { event.respondWith(fromNetworkFirst(req)); return; }

  const rel = url.pathname.slice(new URL(self.registration.scope).pathname.length);

  /* stamped code: the url changes whenever the file does, so the cache can never be stale */
  if (url.search.indexOf('v=') >= 0 && /\.(js|css)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(req, SHELL)); return;
  }
  /* pictures, video posters, silhouettes: keyed by a hash of their own bytes */
  if (rel.indexOf('assets/') === 0) {
    const key = rel.slice('assets/'.length);
    const rev = MEDIA_REV[key];
    if (rev) {
      const keyed = new Request(url.origin + url.pathname + '?r=' + rev, { mode: 'same-origin' });
      event.respondWith((async () => {
        try {
          const cache = await caches.open(MEDIA);
          const hit = await cache.match(keyed);
          if (hit) return hit;
          const net = await fetch(req);
          /* the put has to be held open by the event: mobile Chrome and iOS Safari stop the
             worker the moment respondWith settles, so a detached put is dropped on exactly
             the devices this is for, while working every time on a Mac. */
          if (net && net.ok && net.type === 'basic') event.waitUntil(cache.put(keyed, net.clone()));
          return net;
        } catch (e) { return fetch(req); }
      })());
      return;
    }
  }
  /* version.txt above all: it is how the page learns a deploy has happened */
  /* everything else goes straight to the network */
});
