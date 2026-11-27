'use strict';
/* Tests für src/ui.js. ui.js setzt beim Laden bereits Namen aus app.js
   voraus (z. B. "let gridLimit = MAX_GRID"), genau wie im Browser, wo
   beide Dateien im selben <script> landen. Deshalb werden app.js und
   ui.js hier über vm in einen gemeinsamen Scope geladen, statt einzeln
   mit require() zu laden. Aufruf: node test/test-ui.js */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const THREE = require('./three-stub.js');
const DOMParser = require('./xml-stub.js').DOMParser;

let pass = 0, fail = 0;
async function test(name, fn) {
  try {
    await fn();
    pass++;
    console.log('  ok   ' + name);
  } catch (e) {
    fail++;
    console.log('  FEHL ' + name);
    console.log('        ' + e.stack.split('\n').slice(0, 2).join('\n        '));
  }
}

/* ---------- Minimales, nachsichtiges DOM ---------- */

function makeElement() {
  let ownText = '';
  const el = {
    style: { setProperty: function () {}, removeProperty: function () {} },
    dataset: {},
    className: '',
    value: '',
    title: '',
    children: [],
    classList: {
      toggle: function () {}, add: function () {}, remove: function () {},
      contains: function () { return false; }
    },
    appendChild: function (c) { this.children.push(c); c.parentNode = this; return c; },
    removeChild: function (c) { this.children = this.children.filter(function (x) { return x !== c; }); c.parentNode = null; return c; },
    setAttribute: function (k, v) { this['attr_' + k] = v; },
    focus: function () {},
    _listeners: {},
    addEventListener: function (type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); },
    removeEventListener: function () {},
    fire: function (type) { (this._listeners[type] || []).forEach(function (fn) { fn({ target: el }); }); },
    getElementsByTagName: function () { return []; },
    click: function () {}
  };
  // Wie im echten DOM: textContent eines Elements mit Kindern ist die
  // Verkettung der Kind-textContent, nicht ein eigenes Feld.
  // innerHTML = '' leert die Kinder wie im echten DOM (sonst bleiben alte Zeilen stehen)
  Object.defineProperty(el, 'innerHTML', {
    get: function () { return ''; },
    set: function (v) { if (v === '') { el.children = []; ownText = ''; } }
  });
  Object.defineProperty(el, 'textContent', {
    get: function () {
      if (!el.children.length) return ownText;
      return el.children.map(function (c) { return c.textContent || ''; }).join('');
    },
    set: function (v) { ownText = v; el.children = []; }
  });
  return el;
}

function makeDocument() {
  const byId = {};
  return {
    getElementById: function (id) {
      if (!byId[id]) byId[id] = makeElement();
      return byId[id];
    },
    createElement: function () { return makeElement(); },
    querySelectorAll: function () { return []; },
    documentElement: makeElement(),
    body: makeElement(),
    _byId: byId
  };
}

/* Bildet gerade so viel von geotiff.js nach, wie readTiffTile() aufruft -
   ein flaches Raster mit fester Georeferenz reicht für die Tests. */
function fakeGeoTIFF(w, h, value, originE, originN) {
  const pixels = new Float32Array(w * h).fill(value);
  return {
    fromArrayBuffer: function () {
      return Promise.resolve({
        getImage: function () {
          return Promise.resolve({
            getWidth: function () { return w; },
            getHeight: function () { return h; },
            readRasters: function () { return Promise.resolve([pixels]); },
            getOrigin: function () { return [originE, originN]; },
            getResolution: function () { return [1, 1]; },
            getFileDirectory: function () { return {}; },
            getGeoKeys: function () { return { ProjectedCSTypeGeoKey: 25832 }; }
          });
        }
      });
    }
  };
}

function fakeFile(name, content) {
  return {
    name: name,
    arrayBuffer: function () { return Promise.resolve(new ArrayBuffer(0)); },
    text: function () { return Promise.resolve(content); }
  };
}

/* ---------- Gemeinsamen Scope aufbauen (wie der Browser) ---------- */

/* laz-perf für die Tests: dieselbe Datei wie im Browser (lib/laz-perf.js), mit dem wasm direkt übergeben statt per Netzwerk */
const LAZ_SANDBOX = (function () {
  const sb = { window: {}, document: { currentScript: null }, location: { href: 'http://x/' }, console: console, WebAssembly: WebAssembly, TextDecoder: TextDecoder,
               URL: URL, setTimeout: setTimeout, clearTimeout: clearTimeout, performance: performance, Promise: Promise };
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../lib/laz-perf.js'), 'utf8'), sb);
  return sb;
})();
const LAZ_WASM = fs.readFileSync(path.join(__dirname, '../lib/laz-perf.wasm'));
function createLazPerfForTests(opts) { return LAZ_SANDBOX.createLazPerf(Object.assign({ wasmBinary: LAZ_WASM }, opts)); }

function newScope() {
  const document = makeDocument();
  const sandbox = {
    console: console,
    Math: Math, JSON: JSON, Object: Object, Array: Array, Error: Error,
    isFinite: isFinite, isNaN: isNaN, parseFloat: parseFloat, parseInt: parseInt,
    Float32Array: Float32Array, Float64Array: Float64Array, Uint32Array: Uint32Array,
    Uint8Array: Uint8Array, DataView: DataView, TextDecoder: TextDecoder, ArrayBuffer: ArrayBuffer, Map: Map,
    Date: Date, RegExp: RegExp, String: String, Number: Number, Boolean: Boolean,
    THREE: THREE,
    DOMParser: DOMParser,
    GeoTIFF: fakeGeoTIFF(20, 20, 500, 692000, 5336020),
    createLazPerf: createLazPerfForTests,
    Blob: function (parts, opts) { this.parts = parts; this.type = opts && opts.type; },
    URL: { createObjectURL: function () { return 'blob:fake'; }, revokeObjectURL: function () {} },
    document: document,
    window: {
      innerWidth: 1024, innerHeight: 768, devicePixelRatio: 1,
      location: { search: '' },
      addEventListener: function () {},
      removeEventListener: function () {}
    },
    setTimeout: function () { return 0; },
    clearTimeout: function () {},
    requestAnimationFrame: function () {},
    fetch: function () { return global.fetch.apply(null, arguments); },
    AbortController: AbortController
  };
  vm.createContext(sandbox);

  const appSrc = fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8');
  const uiSrc = fs.readFileSync(path.join(__dirname, '../src/ui.js'), 'utf8');
  vm.runInContext(appSrc, sandbox, { filename: 'app.js' });
  vm.runInContext(uiSrc, sandbox, { filename: 'ui.js' });

  // Im Test gibt es kein Zeichnen: die Pause vor dem Lesen/Rendern entfällt (requestAnimationFrame ruft nie zurück)
  sandbox.yieldToPaint = function () { return Promise.resolve(); };
  sandbox.initScene({ appendChild: function () {} });
  sandbox.initSharedResources();
  sandbox.document = document;

  // const/let auf oberster Ebene hängen nicht am Sandbox-Objekt (Node-vm-
  // Eigenheit) - deshalb hier gezielt herausreichen, was die Tests lesen
  // müssen. Die Funktionen selbst (function-Deklarationen) sind bereits
  // direkt als sandbox.<name> erreichbar. raycaster/controls erst NACH
  // initScene() greifen, sonst wird nur der Ausgangswert "undefined"
  // eingefangen statt der später zugewiesenen echten Objekte.
  vm.runInContext(
    'var __bridge = { STRINGS: STRINGS, TOOL_INFO: TOOL_INFO, FIELD_ORDER: FIELD_ORDER, ' +
    'SETTINGS: SETTINGS, DRAG_TOLERANCE: DRAG_TOLERANCE, ' +
    'REPEAT_GUARD: REPEAT_GUARD, DEMO_ATTRIBUTION: DEMO_ATTRIBUTION, raycaster: raycaster, ' +
    'controls: controls, renderer: renderer, camera: camera, objects: objects };',
    sandbox
  );

  return sandbox;
}

/* ---------- Sprachen ---------- */

async function main() {

await test('STRINGS: Deutsch und Englisch haben dieselben Schlüssel', function () {
  const s = newScope().__bridge.STRINGS;
  const de = Object.keys(s.de).sort();
  const en = Object.keys(s.en).sort();
  assert.deepStrictEqual(de, en);
});

/* ---------- Formulare: die FIELD_ORDER-Falle ---------- */

await test('fieldRank: "select" hat Rang 0, kein ||-Kurzschluss macht daraus 9', function () {
  const s = newScope();
  assert.strictEqual(s.fieldRank('select'), 0);
  assert.strictEqual(s.fieldRank('range'), 1);
  assert.strictEqual(s.fieldRank('unbekannt'), 9);
});

await test('sortFields: sortiert nach fieldRank, select vor allem anderen', function () {
  const s = newScope();
  const fields = [
    { key: 'a', type: 'checkbox' },
    { key: 'b', type: 'select' },
    { key: 'c', type: 'number' },
    { key: 'd', type: 'range' }
  ];
  const sorted = s.sortFields(fields.slice());
  assert.deepStrictEqual(sorted.map(function (f) { return f.key; }), ['b', 'd', 'c', 'a']);
});

/* ---------- Detailstufe "Original" ---------- */

/* ---------- Esc: erst der Stützpunkt, dann erst die Objektauswahl ---------- */

await test('Esc mit aktivem Stützpunkt löst nur den Knoten, die Objektauswahl bleibt', function () {
  const s = newScope();
  const p = s.defaultRoadParams();
  p.points = [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 10 }];
  const obj = s.addObject('road', 0, 0, p);
  s.selectObjects([obj.id], false);
  s.setActiveNode(1);

  s.onKeyDown({ key: 'Escape' });

  assert.strictEqual(s.activeRoadNode(), null, 'der Stützpunkt sollte gelöst sein');
  assert.ok(s.isSelected(obj.id), 'die Objektauswahl darf dabei nicht verloren gehen');
});

/* ---------- Übersicht: Gruppierung über Kran- und Modellnamen (app.js) ---------- */

await test('groupKeyFor/buildGroups gruppieren Turmdrehkrane alle unter demselben generischen Namen', function () {
  const s = newScope();
  const p1 = s.defaultTowerParams();
  const p2 = s.defaultTowerParams();
  s.addObject('tower', 0, 0, p1);
  s.addObject('tower', 20, 0, p2);
  const groups = s.buildGroups();
  assert.strictEqual(groups.length, 1);
  assert.strictEqual(groups[0].key, 'Turmdrehkran');
  assert.strictEqual(groups[0].ids.length, 2);
});

await test('groupKeyFor/buildGroups gruppieren alle Mobilkrane unter einem Eintrag, auch bei verschiedenen Modellen', function () {
  const s = newScope();
  const p1 = s.defaultMobileParams();
  const p2 = s.defaultMobileParams();
  p1.model = 'ltm1030';
  p2.model = 'ltm1040';
  s.addObject('mobile', 0, 0, p1);
  s.addObject('mobile', 20, 0, p2);
  const groups = s.buildGroups();
  assert.strictEqual(groups.length, 1);
  assert.strictEqual(groups[0].key, 'Mobilkran');
  assert.strictEqual(groups[0].ids.length, 2);
});

/* ---------- Zeigerbedienung: Toleranz und Wiederholungssperre ---------- */

await test('Platzierung: Loslassen weit vom Startpunkt entfernt löst keinen Klick aus', function () {
  const s = newScope();
  let clicks = 0;
  s.onCanvasClick = function () { clicks++; };
  s.onCanvasPointerDown({ button: 0, clientX: 100, clientY: 100, pointerId: 1 });
  s.onCanvasPointerUp({ clientX: 100 + s.__bridge.DRAG_TOLERANCE + 1, clientY: 100, pointerId: 1 });
  assert.strictEqual(clicks, 0);
});

await test('Platzierung: Loslassen innerhalb der Toleranz löst einen Klick aus', function () {
  const s = newScope();
  let clicks = 0;
  s.onCanvasClick = function () { clicks++; };
  s.onCanvasPointerDown({ button: 0, clientX: 100, clientY: 100, pointerId: 1 });
  s.onCanvasPointerUp({ clientX: 100 + s.__bridge.DRAG_TOLERANCE, clientY: 100, pointerId: 1 });
  assert.strictEqual(clicks, 1);
});

await test('Platzierung: nur die linke Maustaste löst einen Druckvorgang aus', function () {
  const s = newScope();
  let clicks = 0;
  s.onCanvasClick = function () { clicks++; };
  s.onCanvasPointerDown({ button: 2, clientX: 100, clientY: 100, pointerId: 1 });
  s.onCanvasPointerUp({ clientX: 100, clientY: 100, pointerId: 1 });
  assert.strictEqual(clicks, 0);
});

await test('Platzierung: Wiederholungssperre verhindert zwei Klicks innerhalb von 250 ms', function () {
  const s = newScope();
  let clicks = 0;
  s.onCanvasClick = function () { clicks++; };
  s.onCanvasPointerDown({ button: 0, clientX: 0, clientY: 0, pointerId: 1 });
  s.onCanvasPointerUp({ clientX: 0, clientY: 0, pointerId: 1 });
  s.onCanvasPointerDown({ button: 0, clientX: 0, clientY: 0, pointerId: 1 });
  s.onCanvasPointerUp({ clientX: 0, clientY: 0, pointerId: 1 });
  assert.strictEqual(clicks, 1, 'der zweite, unmittelbar folgende Klick muss gesperrt sein');
});

/* ---------- Namensnennung: CC-BY-4.0-Beispieldaten ---------- */

await test('showAttribution(true) zeigt Herausgeber und Lizenz mit Verweisen an', function () {
  const s = newScope();
  s.showAttribution(true);
  const el = s.document.getElementById('attribution');
  assert.strictEqual(el.style.display, 'flex');
  const links = el.children.filter(function (c) { return c.href; });
  assert.strictEqual(links.length, 2, 'Herausgeber- und Lizenzlink erwartet');
  assert.strictEqual(links[0].href, s.__bridge.DEMO_ATTRIBUTION.url);
  assert.strictEqual(links[0].textContent, s.__bridge.DEMO_ATTRIBUTION.publisher);
  assert.strictEqual(links[1].href, s.__bridge.DEMO_ATTRIBUTION.licenseUrl);
  assert.strictEqual(links[1].textContent, s.__bridge.DEMO_ATTRIBUTION.license);
});

await test('showAttribution(false) blendet die Namensnennung wieder aus', function () {
  const s = newScope();
  s.showAttribution(true);
  s.showAttribution(false);
  assert.strictEqual(s.document.getElementById('attribution').style.display, 'none');
});

await test('Namensnennung bleibt getrennt für Gelände und Gebäude bestehen', async function () {
  const s = newScope();
  assert.strictEqual(s.isAttributionShown(), false, 'ohne geladene Daten darf nichts angezeigt werden');

  await s.handleDemFiles([fakeFile('demo_dgm.tif')], true);
  assert.strictEqual(s.isAttributionShown(), true, 'Beispielgelände muss die Namensnennung zeigen');

  const gml =
    '<CityModel xmlns:gml="http://www.opengis.net/gml"><gml:Polygon><gml:exterior><gml:LinearRing>' +
    '<gml:posList>691995 5336005 500 692005 5336005 500 692005 5336015 500</gml:posList>' +
    '</gml:LinearRing></gml:exterior></gml:Polygon></CityModel>';
  await s.handleGmlFiles([fakeFile('demo_lod2.gml', gml)], true);
  assert.strictEqual(s.isAttributionShown(), true);

  // Eigenes Gelände ersetzt nur das Gelände - die Gebäude sind weiterhin die Beispieldaten.
  await s.handleDemFiles([fakeFile('eigenes.tif')]);
  assert.strictEqual(s.isAttributionShown(), true,
    'die Namensnennung für die Beispielgebäude darf beim Ersetzen des Geländes nicht verschwinden');

  // Eigene Gebäude ersetzen die Beispielgebäude - jetzt darf gar nichts mehr angezeigt werden.
  await s.handleGmlFiles([fakeFile('eigenes.gml', gml)]);
  assert.strictEqual(s.isAttributionShown(), false,
    'nachdem beide Quellen ersetzt sind, darf keine Namensnennung mehr stehen');
});

await test('Namensnennung wechselt mit der Sprache mit', async function () {
  const s = newScope();
  await s.handleDemFiles([fakeFile('demo_dgm.tif')], true);
  assert.strictEqual(s.document.getElementById('attribution').textContent.indexOf('Beispieldaten:'), 0);

  s.setLanguage('en');

  assert.strictEqual(
    s.document.getElementById('attribution').textContent.indexOf('Sample data:'), 0,
    'refreshTexts() muss refreshAttribution() aufrufen, sonst bleibt das Label in der alten Sprache stehen'
  );
});

/* ---------- IFC-Export: Rechteckwerkzeug ---------- */

function setTerrainHit(s, x, y, z) {
  s.__bridge.raycaster._results = [{ point: { x: x, y: y, z: z } }];
}

async function scopeWithTerrain() {
  const s = newScope();
  await s.handleDemFiles([fakeFile('t.tif')], true);
  return s;
}

function dragRect(s, ax, az, bx, bz) {
  s.__bridge.camera.position.set(0, 300, 0.001);              // Norden oben: das Rechteck ist achsenparallel wie bisher
  s.__bridge.controls.target.set(0, 0, 0);
  s.startRectExport();
  setTerrainHit(s, ax, 0, az);
  s.onCanvasPointerDown({ button: 0, clientX: 0, clientY: 0, pointerId: 1 });
  setTerrainHit(s, bx, 0, bz);
  s.onCanvasPointerUp({ clientX: 0, clientY: 0, pointerId: 1 });
}

await test('IFC-Auswahl: Das Rechteck richtet sich nach der Ansicht, bei Norden oben achsenparallel, bei gedrehter Ansicht gedreht; Export schneidet genau diese Fläche', async function () {
  const s = await scopeWithTerrain();
  const geoOf = function () { return s.getExportGeometry(); };
  // Norden oben: wie bisher
  dragRect(s, -5, -4, 5, 4);
  let r = s.getExportRect();
  assert.ok(Math.abs(r.ux - 1) < 1e-9 && Math.abs(r.uz) < 1e-9, 'u = Ost');
  assert.ok(Math.abs(r.minX + 5) < 1e-9 && Math.abs(r.maxX - 5) < 1e-9 && Math.abs(r.minZ + 4) < 1e-9 && Math.abs(r.maxZ - 4) < 1e-9);
  // Ansicht gedreht (Kamera östlich vom Ziel, blickt nach Westen): u zeigt nach Süden (Bildschirm rechts = Süd)
  const cam = s.__bridge.camera, ctl = s.__bridge.controls;
  ctl.target.set(0, 0, 0);
  cam.position.set(300, 300, 0.001);
  s.startRectExport();
  setTerrainHit(s, -6, 0, -2);
  s.onCanvasPointerDown({ button: 0, clientX: 0, clientY: 0, pointerId: 1 });
  setTerrainHit(s, 6, 0, 2);
  s.onCanvasPointerUp({ clientX: 0, clientY: 0, pointerId: 1 });
  r = s.getExportRect();
  assert.ok(r, 'Rechteck gesetzt: ' + s.document.getElementById('status').textContent);
  assert.ok(Math.abs(r.ux) < 1e-4 && Math.abs(r.uz + 1) < 1e-4, 'Kamera im Osten: Bildschirm rechts = Nord, u = (0, -1): ' + r.ux + ' / ' + r.uz);
  // Ecken sind im Rahmen ein Rechteck, der umschließende Kasten ist größer als die Auswahl
  assert.ok(Math.abs((r.u1 - r.u0) - 4) < 1e-3 && Math.abs((r.v1 - r.v0) - 12) < 1e-3, 'Maße im Rahmen: ' + (r.u1 - r.u0) + ' x ' + (r.v1 - r.v0));
  // alle Geländedreiecke liegen innerhalb des gedrehten Rechtecks
  const inside = function (p) { const u = p[0] * r.ux + p[2] * r.uz, v = -p[0] * r.uz + p[2] * r.ux; return u >= r.u0 - 1e-6 && u <= r.u1 + 1e-6 && v >= r.v0 - 1e-6 && v <= r.v1 + 1e-6; };
  const g = geoOf();
  assert.ok(g.terrain.length > 0 && g.terrain.every(function (t) { return inside(t.a) && inside(t.b) && inside(t.c); }), 'Gelände nur innerhalb des gedrehten Rechtecks');
  assert.strictEqual(s.document.getElementById('ifc-extent').textContent, '4 × 12 m', 'Maße im Panel aus dem gedrehten Rechteck');
});

await test('Ausschnitt wählen: aktiviert den Rechteckmodus und sperrt Drehen/Verschieben, nicht das Zoomen', async function () {
  const s = await scopeWithTerrain();
  s.startRectExport();
  assert.strictEqual(s.isRectSelectActive(), true);
  assert.strictEqual(s.__bridge.controls.enableRotate, false);
  assert.strictEqual(s.__bridge.controls.enablePan, false);
  assert.strictEqual(s.__bridge.controls.enableZoom, true, 'Zoomen muss beim Rechteck ziehen weiter möglich sein');
});

await test('Esc während des Ziehens bricht die Rechteckauswahl ab, Drehen/Verschieben wieder frei', async function () {
  const s = await scopeWithTerrain();
  s.startRectExport();
  s.onKeyDown({ key: 'Escape' });
  assert.strictEqual(s.isRectSelectActive(), false);
  assert.strictEqual(s.__bridge.controls.enableRotate, true);
  assert.strictEqual(s.__bridge.controls.enablePan, true);
});

await test('Rechteck ziehen: Panel zeigt Ausdehnung und den Koordinatenbezug des Geländes (keine EPSG-Wahl)', async function () {
  const s = await scopeWithTerrain();
  dragRect(s, -10, -10, 10, 10);
  assert.strictEqual(s.isRectSelectActive(), false);
  assert.strictEqual(s.isIfcPanelOpen(), true);
  assert.strictEqual(s.document.getElementById('ifc-extent').textContent, '20 × 20 m');
  assert.strictEqual(s.document.getElementById('ifc-crs').textContent, s.crsLabel(25832));
});

await test('Esc nach gezogenem Rechteck schließt das Panel und entfernt die Vorschau', async function () {
  const s = await scopeWithTerrain();
  dragRect(s, -10, -10, 10, 10);
  assert.strictEqual(s.isIfcPanelOpen(), true);
  s.onKeyDown({ key: 'Escape' });
  assert.strictEqual(s.isIfcPanelOpen(), false);
  assert.strictEqual(s.getExportRect(), null);
});

await test('"Abbrechen" schließt das Panel ebenso wie Esc', async function () {
  const s = await scopeWithTerrain();
  dragRect(s, -10, -10, 10, 10);
  s.clearExportPreview();
  assert.strictEqual(s.isIfcPanelOpen(), false);
});

await test('Exportieren löst den Download aus und meldet Erfolg', async function () {
  const s = await scopeWithTerrain();
  dragRect(s, -10, -10, 10, 10);
  s.runIfcExport();
  assert.strictEqual(s.document.getElementById('ifc-error').textContent, '');
  assert.strictEqual(s.document.getElementById('status').textContent, s.T('msgIfcExported'));
});

await test('IFC-Panel: Bezugssystem der Datei wählbar, anderes System sperrt "lokal", Bessel-Hinweis, Bausteine abwählbar', async function () {
  const s = await scopeWithTerrain();
  const g = function (id) { return s.document.getElementById(id); };
  dragRect(s, -10, -10, 10, 10);
  const opts = g('ifc-target').children.map(function (o) { return o.value; });
  assert.strictEqual(opts[0], '', 'erste Wahl: wie Gelände');
  assert.ok(opts.indexOf('25833') >= 0 && opts.indexOf('31467') >= 0 && opts.indexOf('25832') < 0, 'das eigene System fehlt in der Liste: ' + opts.join(','));
  const labels = g('ifc-target').children.map(function (o) { return o.textContent; });
  assert.ok(labels[opts.indexOf('31467')].indexOf('≈') > 0 && labels[opts.indexOf('25833')].indexOf('≈') < 0, 'Bessel mit ≈ markiert');
  // anderes System: Koordinaten absolut und gesperrt
  g('ifc-target').value = '25833';
  s.updateIfcTargetUi();
  assert.strictEqual(g('ifc-coords').disabled, true);
  assert.strictEqual(g('ifc-coords').value, 'abs');
  assert.ok(g('ifc-target-note').textContent.indexOf('umgerechnet') >= 0 && g('ifc-target-note').textContent.indexOf('genau{') < 0 && g('ifc-target-note').textContent.indexOf('etwa 3 m') < 0);
  g('ifc-target').value = '31467';
  s.updateIfcTargetUi();
  assert.ok(g('ifc-target-note').textContent.indexOf('etwa 3 m') > 0, 'Bessel ohne Gitter: Genauigkeitshinweis ' + g('ifc-target-note').textContent);
  let saved = null;
  s.downloadText = function (t) { saved = t; };
  s.runIfcExport();
  assert.strictEqual(g('ifc-error').textContent, '');
  assert.ok(saved && saved.indexOf("'EPSG:31467'") > 0, 'Datei im Zielsystem');
  // zurück auf "wie Gelände"
  g('ifc-target').value = '';
  s.updateIfcTargetUi();
  assert.strictEqual(g('ifc-coords').disabled, false);
  assert.strictEqual(g('ifc-target-note').textContent, '');
  s.runIfcExport();
  assert.ok(saved.indexOf("'EPSG:25832'") > 0);
});

/* ---------- Messen ---------- */

const rulerOf = function (s) { return vm.runInContext('({ active: rulerActive, done: rulerDone, pts: rulerPts, labels: rulerAllLabels() })', s); };

await test('Messen: Karte in der Leiste, Punkte anklicken, Strecken mit zwei Nachkommastellen, Panel mit Summen, Rücktaste, Neustart, Esc', async function () {
  const s = await scopeWithTerrain();
  s.initUI();
  const g = function (id) { return s.document.getElementById(id); };
  const card = Array.prototype.slice.call(g('palette').children).filter(function (c) { return c.dataset.tool === 'ruler'; })[0];
  assert.strictEqual(card.children[1].textContent, 'Messen');
  s.startRuler();
  assert.strictEqual(rulerOf(s).active, true);
  assert.strictEqual(g('ruler-hint').style.display, 'block');
  assert.ok(g('ruler-hint').textContent.indexOf('ersten Punkt') >= 0);
  assert.strictEqual(g('ruler-panel').style.display, 'none', 'ohne zwei Punkte kein Panel');
  const click = function (x, y, z) { setTerrainHit(s, x, y, z); s.rulerClick({ clientX: 10, clientY: 10 }); };
  click(0, 5, 0);
  assert.ok(g('ruler-hint').textContent.indexOf('weitere Punkte') >= 0);
  click(30, 9, 40);                                       // waagerecht 50, 4 m höher
  const st = rulerOf(s);
  assert.strictEqual(st.pts.length, 2);
  assert.strictEqual(g('ruler-panel').style.display, 'block');
  assert.strictEqual(g('ruler-h').textContent, '50.00 m');
  assert.strictEqual(g('ruler-s').textContent, '50.16 m');
  assert.strictEqual(g('ruler-dz').textContent, '+4.00 m');
  assert.strictEqual(g('ruler-slope').textContent, '+8.00 %');
  assert.strictEqual(g('ruler-n').textContent, '2');
  assert.strictEqual(st.labels.length, 1);
  assert.strictEqual(st.labels[0].text, '50.00 m · Δ +4.00 m');
  // dritter Punkt: Summen über alle Strecken, Höhenunterschied und Gefälle zwischen Start und Ende
  click(30, 2, 100);
  assert.strictEqual(g('ruler-h').textContent, '110.00 m');
  assert.strictEqual(g('ruler-dz').textContent, '−3.00 m');
  assert.strictEqual(rulerOf(s).labels.length, 2);
  // Rücktaste nimmt den letzten Punkt zurück
  s.onKeyDown({ key: 'Backspace', target: {} });
  assert.strictEqual(rulerOf(s).pts.length, 2);
  // Rechtsklick/Leertaste beendet; ein weiterer Klick beginnt eine neue Messung
  s.onKeyDown({ key: ' ', target: {} });
  assert.strictEqual(rulerOf(s).done, true);
  assert.ok(g('ruler-hint').textContent.indexOf('beendet') >= 0);
  click(1, 1, 1);
  assert.strictEqual(rulerOf(s).done, false);
  assert.strictEqual(rulerOf(s).pts.length, 1, 'neue Messung beginnt mit dem Klickpunkt');
  // anderes Werkzeug beendet das Messen, Esc ebenso
  s.selectTool('road');
  assert.strictEqual(rulerOf(s).active, false);
  s.startRuler();
  click(0, 0, 0);
  s.onKeyDown({ key: 'Escape', target: {} });
  assert.strictEqual(rulerOf(s).active, false);
  assert.strictEqual(g('ruler-panel').style.display, 'none');
  assert.strictEqual(g('ruler-hint').style.display, 'none');
  // ohne Gelände nicht möglich
  const s0 = newScope();
  s0.initUI();
  s0.startRuler();
  assert.strictEqual(rulerOf(s0).active, false);
});

/* ---------- Baustraße: Eigenschaftsfenster ---------- */

function roadObject(s, slope) {
  const p = s.defaultRoadParams();
  p.points = [{ x: -25, z: 0 }, { x: 25, z: 0 }];
  p.width = 6;
  p.slope = slope;
  return s.addObject('road', 0, 0, p);
}

await test('Baustraße: Längsneigung nur im Eigenschaftsfenster, Zahl im Kopf des Reglers, Einheit %', function () {
  const s = newScope();
  const p = s.defaultRoadParams();
  assert.strictEqual(s.buildForm('road', p, function () {}, false).refs.slope, undefined,
    'vor dem Setzen gibt es keine Neigung zum Einstellen');
  p.slope = 5;
  const ref5 = s.buildForm('road', p, function () {}, true).refs.slope;
  assert.strictEqual(ref5.num.value, 5);
  assert.strictEqual(ref5.out.textContent, '%');
  p.slope = -2.5;
  const ref = s.buildForm('road', p, function () {}, true).refs.slope;
  assert.strictEqual(ref.num.value, -2.5);
  assert.strictEqual(ref.input.min, -30);
  assert.strictEqual(ref.input.max, 30);
});

function threePointRoadUi(s, slopes) {
  const p = s.defaultRoadParams();
  p.points = [{ x: -40, z: 0 }, { x: 0, z: 0 }, { x: 30, z: 0 }];
  p.width = 6; p.radius = 1;
  if (slopes) p.sectionSlopes = slopes; else p.slope = 1;
  return s.addObject('road', 0, 0, p);
}

await test('Baustraße: verschiedene Neigungen je Abschnitt - das Feld zeigt "variabel", gleiche Neigungen zeigen die Zahl', function () {
  const s = newScope();
  const obj = threePointRoadUi(s, [4, -2]);
  const form = s.buildForm('road', obj.params, function () {}, true);
  s.markRoadSlope(obj, form.refs);
  assert.strictEqual(form.refs.slope.num.value, '', 'kein Zahlenwert');
  assert.strictEqual(form.refs.slope.num.placeholder, s.T('slopeVariable'));
  s.setRoadSectionSlope(obj, 1, 4);
  s.markRoadSlope(obj, form.refs);
  assert.strictEqual(form.refs.slope.num.value, 4);
  assert.strictEqual(form.refs.slope.input.value, 4);
  assert.strictEqual(s.T('slopeVariable'), 'variabel');
});

function startMapScope() {
  const s = newScope();
  s.initUI();
  return s;
}

await test('Startkarte: ohne Gelände sichtbar, aber ohne Kachelanfrage vor dem Klick auf "Karte laden"', function () {
  const s = startMapScope();
  assert.strictEqual(s.document.getElementById('startmap').style.display, 'block');
  assert.strictEqual(s.document.getElementById('sm-consent').style.display, 'block', 'Hinweis mit Knopf');
  assert.strictEqual(s.document.getElementById('sm-tiles').children.length, 0, 'noch keine Kachel angefragt');
  assert.strictEqual(s.document.getElementById('sm-tools').style.display, 'none');
  assert.ok(s.T('smConsent').indexOf('tile.openstreetmap.org') >= 0 && s.T('smConsent').indexOf('IP') >= 0);
  assert.strictEqual(s.T('smTitle'), 'Lade OpenStreetMap', 'Titel des Hinweises');
});

await test('Startkarte: nach dem Klick lädt sie nur OSM-Kacheln, Zoom und Ort holen neue, die Auswahl bleibt im Hinweis', function () {
  const s = startMapScope();
  s.document.getElementById('sm-load')._listeners.click[0]();
  const box = s.document.getElementById('sm-tiles');
  assert.ok(box.children.length >= 6, String(box.children.length));
  box.children.forEach(function (im) { assert.ok(/^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/.test(im.src), im.src); });
  assert.ok(box.children.filter(function (im) { return /\/6\//.test(im.src); }).length >= 6, 'Kacheln der Ansichtsstufe');
  assert.ok(box.children.some(function (im) { return /\/3\//.test(im.src); }), 'grobe Unterlage drei Stufen darunter');
  assert.strictEqual(s.document.getElementById('sm-consent').style.display, 'none');
  assert.strictEqual(s.document.getElementById('sm-tools').style.display, 'flex');
  s.smFlyTo(48.1374, 11.5755, 16);
  assert.ok(box.children.every(function (im) { return /\/(16|13|10)\//.test(im.src); }), 'Kacheln der Stufe 16 und die Unterlagen der Stufen 13 und 10');
  assert.ok(box.children.some(function (im) { return /\/16\/34\d\d\d\/22\d\d\d\.png/.test(im.src); }), 'München');
  s.document.getElementById('sm-in')._listeners.click[0]();
  s.smFinishZoom();
  assert.ok(vm.runInContext('smView.z', s) === 17, 'Zoom +1');
  const at = function (z) { return box.children.filter(function (im) { return new RegExp('/' + z + '/').test(im.src); }); };
  assert.ok(at(17).length >= 6, 'Kacheln der neuen Stufe');
  assert.ok(at(16).length > 0, 'die alten Kacheln bleiben stehen, bis die neuen geladen sind (kein leerer Bildschirm)');
  at(17).forEach(function (im) { im.complete = true; im.naturalWidth = 256; });
  s.smRender();
  assert.ok(at(16).length > 0, 'gerade geladen, noch nicht eingeblendet: die alten bleiben (sonst blitzt der Hintergrund durch)');
  vm.runInContext('smSettleAt = 1', s);                    // das Einblenden ist vorbei
  s.smRender();
  assert.strictEqual(at(16).length, 0, 'neue Stufe fertig und eingeblendet: alte Kacheln weg');
  assert.ok(at(17).length >= 6);
  assert.strictEqual(s.document.getElementById('sm-marker').style.display, 'block');
});

await test('Startkarte: stufenloses Zoomen - der Punkt unter dem Mauszeiger bleibt, Kacheln der nächsten ganzen Stufe werden skaliert', function () {
  const s = startMapScope();
  s.document.getElementById('sm-load')._listeners.click[0]();
  s.smFlyTo(48.7, 11.5, 14);
  const before = s.smFromClient(700, 150);
  s.smZoomBy(0.6, 700, 150);
  s.smFinishZoom();
  const z = vm.runInContext('smView.z', s);
  assert.ok(Math.abs(z - 14.6) < 1e-9, String(z));
  const after = s.smFromClient(700, 150);
  assert.ok(Math.abs(after.lon - before.lon) < 1e-7 && Math.abs(after.lat - before.lat) < 1e-7, 'Anker bleibt unter dem Zeiger');
  const imgs = s.document.getElementById('sm-tiles').children.filter(function (im) { return /\/15\//.test(im.src); });
  assert.ok(imgs.length > 0, 'Stufe 15 (nächste ganze Stufe zu 14,6)');
  assert.ok(/scale\(0\.757/.test(imgs[0].style.transform), imgs[0].style.transform);        // 2^(14,6-15)
  s.smZoomBy(50);                                          // nicht über die größte Stufe hinaus
  s.smFinishZoom();
  assert.strictEqual(vm.runInContext('smView.z', s), 19);
  s.smWheel({ deltaY: -100, deltaMode: 0, clientX: 400, clientY: 300, preventDefault: function () {} });
  s.smZoomBy(-60); s.smFinishZoom();
  assert.strictEqual(vm.runInContext('smView.z', s), 3, 'nicht unter die kleinste Stufe');
});

await test('Startkarte: Mittel- und rechte Taste verschieben die Karte wie die linke', function () {
  const s = startMapScope();
  s.document.getElementById('sm-load')._listeners.click[0]();
  s.smFlyTo(48.7, 11.5, 14);
  const box = s.document.getElementById('sm-tiles');
  [[1, 4], [2, 2]].forEach(function (b) {
    const lon0 = vm.runInContext('smView.lon', s);
    box._listeners.pointerdown[0]({ button: b[0], clientX: 300, clientY: 200, preventDefault: function () {} });
    s.smPointerMove({ clientX: 360, clientY: 230, buttons: b[1] });
    s.smPointerUp({ clientX: 360, clientY: 230 });
    assert.ok(vm.runInContext('smView.lon', s) < lon0, 'Taste ' + b[0] + ' verschiebt');
  });
  box._listeners.pointerdown[0]({ button: 2, clientX: 300, clientY: 200, preventDefault: function () {} });
  s.smPointerMove({ clientX: 330, clientY: 200, buttons: 0 });          // Taste längst oben: Geste endet
  assert.strictEqual(vm.runInContext('smDrag', s), null);
});

await test('Startkarte: ein Klick ohne Ziehen setzt einen Punkt, Ziehen verschiebt die Karte', function () {
  const s = startMapScope();
  s.document.getElementById('sm-load')._listeners.click[0]();
  s.smFlyTo(48.7, 11.5, 14);
  const box = s.document.getElementById('sm-tiles');
  const lon0 = vm.runInContext('smView.lon', s);
  box._listeners.pointerdown[0]({ button: 0, clientX: 300, clientY: 200, preventDefault: function () {} });
  s.smPointerMove({ clientX: 360, clientY: 200, buttons: 1 });
  s.smPointerUp({ clientX: 360, clientY: 200 });
  assert.ok(vm.runInContext('smView.lon', s) < lon0, 'Karte nach rechts gezogen: Mitte wandert nach Westen');
  box._listeners.pointerdown[0]({ button: 0, clientX: 300, clientY: 200, preventDefault: function () {} });
  s.smPointerUp({ clientX: 300, clientY: 200 });
  assert.strictEqual(s.document.getElementById('sm-marker').style.display, 'block', 'Pin gesetzt');
  assert.strictEqual(s.document.getElementById('sm-pop').style.display, 'block', 'Fenster am Pin');
  assert.ok(/^\d+\.\d+, \d+\.\d+/.test(s.document.getElementById('sm-pop-body').textContent), s.document.getElementById('sm-pop-body').textContent);
});

await test('Startkarte: Pin setzen öffnet ein Fenster mit den Links zu den Geoportalen, es folgt dem Pin, schließt mit × und Esc', async function () {
  const s = startMapScope();
  s.document.getElementById('sm-load')._listeners.click[0]();
  await s.chooseAddrItem({ main: 'Marienplatz', sub: 'München', lat: 48.1374, lon: 11.5755, country: 'DE', state: 'Bayern' }, {});
  const pop = s.document.getElementById('sm-pop');
  assert.strictEqual(pop.style.display, 'block');
  const txt = s.document.getElementById('sm-pop-body').textContent;
  assert.ok(txt.indexOf('Marienplatz') >= 0, txt);
  assert.ok(txt.indexOf(s.T('addrDem')) >= 0 && txt.indexOf(s.T('addrBldg')) >= 0, 'beide Gruppen von Links');
  assert.ok(txt.indexOf('geodaten.bayern.de') >= 0, 'Link des Landes: ' + txt);
  assert.ok(/EPSG:25832 · Rechts 691\d{3} · Hoch 5334\d{3}/.test(txt), txt);
  assert.ok(/^panel (above|below)$/.test(pop.className), pop.className);
  const left0 = pop.style.left;
  s.smZoomBy(0.4, 100, 100); s.smFinishZoom();                         // Zoomen um einen anderen Punkt: der Pin wandert, das Fenster mit
  assert.ok(pop.style.display === 'block');
  s.document.getElementById('sm-pop-close')._listeners.click[0]();
  assert.strictEqual(pop.style.display, 'none', '× schließt');
  assert.strictEqual(s.document.getElementById('sm-marker').style.display, 'block', 'der Pin bleibt');
  await s.chooseAddrItem({ main: 'Odeonsplatz', sub: 'München', lat: 48.1425, lon: 11.5775, country: 'DE', state: 'Bayern' }, {});
  assert.strictEqual(pop.style.display, 'block', 'neuer Ort öffnet es wieder');
  s.onKeyDown({ key: 'Escape', target: {} });
  assert.strictEqual(pop.style.display, 'none', 'Esc schließt');
});

await test('Startkarte: Orte in der EU zeigen die Links ihres Landes, Länder ohne offenes Geländemodell einen Hinweis statt eines Links', async function () {
  const s = startMapScope();
  s.document.getElementById('sm-load')._listeners.click[0]();
  const body = s.document.getElementById('sm-pop-body');
  await s.chooseAddrItem({ main: 'Dam', sub: 'Amsterdam', lat: 52.373, lon: 4.893, country: 'NL', state: 'Noord-Holland' }, {});
  assert.ok(body.textContent.indexOf('ahn.nl') >= 0 && body.textContent.indexOf('3dbag.nl') >= 0, body.textContent);
  assert.ok(body.textContent.indexOf(s.T('geoNote_euBldgNotCityGml')) >= 0, '3DBAG: kein CityGML');
  await s.chooseAddrItem({ main: 'Sofia', sub: 'Bulgarien', lat: 42.697, lon: 23.322, country: 'BG', state: '' }, {});
  assert.ok(body.textContent.indexOf(s.T('geoNote_euNoOpenDem')) >= 0 && body.textContent.indexOf(s.T('geoNote_noEuBldg')) >= 0, body.textContent);
  assert.ok(body.textContent.indexOf('http') < 0, 'kein geratener Link');
  await s.chooseAddrItem({ main: 'Madrid', sub: 'Spanien', lat: 40.4168, lon: -3.7038, country: 'ES', state: '' }, {});
  assert.ok(body.textContent.indexOf('cnig.es') >= 0 && body.textContent.indexOf(s.T('geoFmtTif')) >= 0, body.textContent);
});

await test('Startkarte: Ort ohne Daten (nicht in der EU) nennt das im Fenster', async function () {
  const s = startMapScope();
  s.document.getElementById('sm-load')._listeners.click[0]();
  await s.chooseAddrItem({ main: 'Zürich', sub: 'Schweiz', lat: 47.3769, lon: 8.5417, country: 'CH', state: 'Zürich' }, {});
  assert.ok(s.document.getElementById('sm-pop-body').textContent.indexOf(s.T('addrOnlyDeAt')) >= 0);
});

await test('Stadtgeoportale: Pin und Adresse in Wien nennen zusätzlich die Links der Stadt, außerhalb einer Stadt der Tabelle nicht', async function () {
  const s = startMapScope();
  const g = function (id) { return s.document.getElementById(id); };
  g('sm-load')._listeners.click[0]();
  await s.chooseAddrItem({ main: 'Rathausplatz', sub: '1010 Wien', lat: 48.2105, lon: 16.3588, country: 'AT', state: 'Wien', city: 'Wien' }, {});
  const body = g('sm-pop-body');
  assert.ok(body.textContent.indexOf(s.T('addrCity').replace('{c}', 'Wien')) >= 0, body.textContent);
  assert.ok(body.textContent.indexOf('wien.gv.at') >= 0 && body.textContent.indexOf(s.T('cityKind_map')) >= 0 && body.textContent.indexOf(s.T('cityKind_data')) >= 0, body.textContent);
  assert.ok(body.textContent.indexOf('data.gv.at') >= 0, 'Landes- und Bundeslinks bleiben');
  const hrefs = [];
  (function walk(n) { if (n.href) hrefs.push(n.href); (n.children || []).forEach(walk); })(body);
  assert.ok(hrefs.indexOf('https://www.wien.gv.at/ma41datenviewer/public/start.aspx') >= 0, hrefs.join(' '));
  // Adressleiste: dieselbe Gruppe
  await s.chooseAddrItem({ main: 'Marienplatz', sub: 'München', lat: 48.1374, lon: 11.5755, country: 'DE', state: 'Bayern', city: 'München' }, {});
  assert.ok(g('addr-result').textContent.indexOf(s.T('addrCity').replace('{c}', 'München')) >= 0, g('addr-result').textContent);
  assert.ok(g('addr-result').textContent.indexOf('geoportal-muenchen') >= 0 || g('addr-result').textContent.indexOf('stadt.muenchen.de') >= 0);
  // Ort ohne Stadteintrag: keine Gruppe
  await s.chooseAddrItem({ main: 'Dorf', sub: 'Hinterdorf', lat: 48.0, lon: 11.0, country: 'DE', state: 'Bayern', city: 'Hinterdorf' }, {});
  assert.strictEqual(g('addr-result').textContent.indexOf(s.T('addrCity').split('{c}')[0]), -1, 'keine Stadtgruppe');
  // Englisch
  assert.ok(s.__bridge.STRINGS.de.addrCity.indexOf('{c}') > 0 && s.__bridge.STRINGS.en.addrCity.indexOf('{c}') > 0);
});

/* ---------- Gebäude aus 2D-Daten (GeoJSON, Shapefile, GeoPackage) ---------- */

const FX_DIR = path.join(__dirname, 'fixtures');
function fxFile(name, rename) {
  const buf = fs.readFileSync(path.join(FX_DIR, name));
  const ab = function (b) { return b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
  return {
    name: rename || name, size: buf.length, reads: 0,
    arrayBuffer: function () { return Promise.resolve(ab(buf)); },
    text: function () { return Promise.resolve(buf.toString('utf8')); },
    slice: function (a, e) { const part = buf.subarray(a, Math.min(e, buf.length)); return { arrayBuffer: function () { return Promise.resolve(ab(part)); }, text: function () { return Promise.resolve(part.toString('utf8')); } }; }
  };
}

/* Gelände 200 x 200 m um (692050, 5336040), EPSG:25832: die Testgebäude liegen in x 10..100, y 10..70 */
async function scopeWith2dTerrain() {
  const s = await scopeWithTerrain();
  vm.runInContext('TERRAIN.w = 200; TERRAIN.d = 200; TERRAIN.originE = 692050; TERRAIN.originN = 5336040;', s);
  return s;
}
const fpOpts = function (g, h, extra) { return Object.assign({ ground: g, height: h, fallback: 8 }, extra || {}); };
const zRange = function (rings) { let lo = Infinity, hi = -Infinity; rings.forEach(function (r) { for (let i = 2; i < r.length; i += 3) { if (r[i] < lo) lo = r[i]; if (r[i] > hi) hi = r[i]; } }); return [lo, hi]; };
const triArea = function (r) { return Math.abs((r[3] - r[0]) * (r[7] - r[1]) - (r[6] - r[0]) * (r[4] - r[1])) / 2; };

await test('2D-Gebäude: GeoJSON, Shapefile und GeoPackage liefern dieselben Gebäude, Attribute und Bezugssystem', async function () {
  const s = newScope();
  const gj = s.parseGeoJsonFootprints(fs.readFileSync(path.join(FX_DIR, 'buildings25832.geojson'), 'utf8'), 'a');
  assert.strictEqual(gj.feats.length, 4);
  assert.strictEqual(gj.epsg, 25832);
  assert.strictEqual(gj.fields.map(function (f) { return f.name + ':' + f.numeric; }).join(), 'name:false,hoehe:true,gelaende:true,geschosse:true');
  assert.strictEqual(gj.feats[2].polys[0].holes.length, 1, 'Innenhof');
  assert.strictEqual(gj.feats[3].polys.length, 2, 'MultiPolygon');
  assert.strictEqual(s.fpNum('8,5'), 8.5, 'Komma als Dezimalzeichen');
  const buf = function (n) { return fs.readFileSync(path.join(FX_DIR, n)); };
  const sh = s.parseShapefileSet(buf('buildings25832.shp'), buf('buildings25832.dbf'), buf('buildings25832.prj').toString(), 'UTF-8', 'b');
  assert.strictEqual(sh.feats.length, 4);
  assert.strictEqual(sh.epsg, 25832, 'aus der .prj-Datei');
  assert.strictEqual(sh.feats[2].polys[0].holes.length, 1, 'Loch im Shapefile (Ring gegen den Uhrzeigersinn)');
  assert.strictEqual(sh.feats[1].props.name, 'Haus L');
  assert.strictEqual(s.fpNum(sh.feats[1].props.hoehe), 8.5);
  const f = fxFile('buildings25832.gpkg');
  const g = await s.readGpkgFootprints(function (o, l) { return f.slice(o, o + l).arrayBuffer().then(function (b) { return new Uint8Array(b); }); }, f.size, 'g', null);
  assert.strictEqual(g.feats.length, 4);
  assert.strictEqual(g.epsg, 25832);
  assert.strictEqual(g.table, 'gebaeude');
  assert.strictEqual(g.feats[0].props.name, 'Haus A');
  assert.strictEqual(g.feats[2].polys[0].holes.length, 1);
  assert.ok(Math.abs(g.feats[0].polys[0].outer[0][0] - 692010) < 1e-6);
  assert.strictEqual([gj, sh, g].map(function (x) { return x.feats.map(function (y) { return y.polys.length; }).join(); }).join('|'), '1,1,1,2|1,1,1,2|1,1,1,2');
});

await test('2D-Gebäude: GeoPackage mit R-Baum liest nur das Fenster, große Tabelle mit mehreren B-Baum-Ebenen vollständig', async function () {
  const s = newScope();
  const f = fxFile('many25832.gpkg');
  let reads = 0;
  const rd = function (o, l) { reads++; return f.slice(o, o + l).arrayBuffer().then(function (b) { return new Uint8Array(b); }); };
  const all = await s.readGpkgFootprints(rd, f.size, 'm', null);
  assert.strictEqual(all.feats.length, 1600);
  assert.strictEqual(all.feats[1599].props.name, 'Gebäude 1599');
  const win = await s.readGpkgFootprints(rd, f.size, 'm', function (epsg) { assert.strictEqual(epsg, 25832); return [692000, 5336000, 692099, 5336099]; });
  assert.strictEqual(win.feats.length, 16, 'Gitter 25 m: 4 x 4 Gebäude im Fenster 100 x 100 m');
  assert.ok(win.feats.every(function (x) { const p = x.polys[0].outer[0]; return p[0] >= 692000 && p[0] <= 692099 && p[1] >= 5336000 && p[1] <= 5336099; }));
  await assert.rejects(s.readGpkgFootprints(rd, f.size, 'm', function () { return [0, 0, 1, 1]; }), /fpNoPolygons/, 'Fenster ohne Gebäude');
  await assert.rejects(s.readGpkgFootprints(function () { return Promise.resolve(new Uint8Array(200)); }, 200, 'x', null), /sqliteBad/, 'keine SQLite-Datei');
});

await test('2D-Gebäude: .prj erkennt das Bezugssystem (AUTHORITY, ESRI-Namen, MGI, LAEA), sonst null', function () {
  const s = newScope();
  assert.strictEqual(s.fpPrjEpsg('PROJCS["ETRS89 / UTM zone 32N",GEOGCS["ETRS89"],AUTHORITY["EPSG","25832"]]'), 25832);
  assert.strictEqual(s.fpPrjEpsg('PROJCRS["x",ID["EPSG",25833]]'), 25833);
  assert.strictEqual(s.fpPrjEpsg('PROJCS["ETRS_1989_UTM_Zone_33N",GEOGCS["GCS_ETRS_1989"]]'), 25833);
  assert.strictEqual(s.fpPrjEpsg('PROJCS["MGI_Austria_GK_M34",GEOGCS["GCS_MGI"]]'), 31256);
  assert.strictEqual(s.fpPrjEpsg('PROJCS["ETRS_1989_LAEA",GEOGCS["GCS_ETRS_1989"]]'), 3035);
  assert.strictEqual(s.fpPrjEpsg('GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984"]]'), 4326);
  assert.strictEqual(s.fpPrjEpsg('PROJCS["Irgendwas",GEOGCS["x"]]'), null);
  assert.strictEqual(s.fpPrjEpsg(null), null);
});

await test('2D-Gebäude: Quader aus Gelände- und Gebäudehöhe der Attribute, Innenhof bleibt frei, Höhe als Text mit Komma', async function () {
  const s = await scopeWith2dTerrain();
  const gj = s.parseGeoJsonFootprints(fs.readFileSync(path.join(FX_DIR, 'buildings25832.geojson'), 'utf8'), 'a');
  const r = s.footprintRings(gj, fpOpts({ src: 'attr', attr: 'gelaende' }, { src: 'attr', attr: 'hoehe', ref: 'rel', factor: 1 }));
  assert.strictEqual(r.used, 5, '4 Gebäude, ein MultiPolygon mit 2 Teilen');
  assert.strictEqual(r.noHeight, 2, 'die zwei Hütten ohne Höhe bekommen die Ersatzhöhe');
  // Haus A: Boden 500, Höhe 12 über Grund
  const hausA = s.footprintRings({ feats: [gj.feats[0]], epsg: 25832 }, fpOpts({ src: 'attr', attr: 'gelaende' }, { src: 'attr', attr: 'hoehe', ref: 'rel', factor: 1 }));
  assert.deepStrictEqual(zRange(hausA.rings), [500, 512]);
  assert.strictEqual(hausA.rings.length, 4 + 2, '4 Wände und 2 Dachdreiecke');
  // Haus L: Höhe "8,5" über 501,5; konkaler Grundriss: Dachfläche = 20*10 + 10*15 = 350 m²
  const haus = s.footprintRings({ feats: [gj.feats[1]], epsg: 25832 }, fpOpts({ src: 'attr', attr: 'gelaende' }, { src: 'attr', attr: 'hoehe', ref: 'rel', factor: 1 }));
  assert.deepStrictEqual(zRange(haus.rings), [501.5, 510]);
  const roof = haus.rings.filter(function (x) { return x.length === 9; });
  assert.ok(Math.abs(roof.reduce(function (a, x) { return a + triArea(x); }, 0) - 350) < 1e-6, 'Dachfläche des L');
  // Block mit Innenhof: Dach 30*30 - 10*10 = 800 m², Wände außen und innen
  const blk = s.footprintRings({ feats: [gj.feats[2]], epsg: 25832 }, fpOpts({ src: 'attr', attr: 'gelaende' }, { src: 'attr', attr: 'hoehe', ref: 'rel', factor: 1 }));
  const roofB = blk.rings.filter(function (x) { return x.length === 9; });
  assert.ok(Math.abs(roofB.reduce(function (a, x) { return a + triArea(x); }, 0) - 800) < 1e-6, 'Innenhof ist ausgespart');
  assert.strictEqual(blk.rings.filter(function (x) { return x.length === 12; }).length, 8, '4 Außen- und 4 Innenwände');
  // Faktor (Geschosse x 3 m), feste Gelände- und Gebäudehöhe, absolute Höhe
  assert.deepStrictEqual(zRange(s.footprintRings({ feats: [gj.feats[0]], epsg: 25832 }, fpOpts({ src: 'fixed', fixed: 100 }, { src: 'attr', attr: 'geschosse', ref: 'rel', factor: 3 })).rings), [100, 112]);
  assert.deepStrictEqual(zRange(s.footprintRings({ feats: [gj.feats[0]], epsg: 25832 }, fpOpts({ src: 'fixed', fixed: 100 }, { src: 'fixed', fixed: 20 })).rings), [100, 120]);
  assert.deepStrictEqual(zRange(s.footprintRings({ feats: [gj.feats[0]], epsg: 25832 }, fpOpts({ src: 'fixed', fixed: 400 }, { src: 'attr', attr: 'gelaende', ref: 'abs', factor: 1 })).rings), [400, 500], 'absolute Oberkante');
  // Gelände aus dem Modell: tiefster Punkt des Grundrisses
  const tr = s.footprintRings({ feats: [gj.feats[0]], epsg: 25832 }, fpOpts({ src: 'terrain' }, { src: 'fixed', fixed: 10 }));
  assert.ok(Math.abs(zRange(tr.rings)[1] - zRange(tr.rings)[0] - 10) < 1e-9, 'Gebäude ist 10 m hoch');
  assert.throws(function () { s.footprintRings(gj, fpOpts({ src: 'terrain' }, { src: 'fixed', fixed: 10 }, { epsg: 99999 })); }, /fpCrsUnknown/);
});

await test('2D-Gebäude: Daten in WGS84 (GeoJSON RFC 7946, GeoPackage) landen auf demselben Fleck wie in EPSG:25832', async function () {
  const s = await scopeWith2dTerrain();
  const a = s.parseGeoJsonFootprints(fs.readFileSync(path.join(FX_DIR, 'buildings25832.geojson'), 'utf8'), 'a');
  const b = s.parseGeoJsonFootprints(fs.readFileSync(path.join(FX_DIR, 'buildings4326.geojson'), 'utf8'), 'b');
  assert.strictEqual(b.epsg, 4326, 'ohne crs-Angabe gilt WGS84');
  const f = fxFile('buildings4326.gpkg');
  const g = await s.readGpkgFootprints(function (o, l) { return f.slice(o, o + l).arrayBuffer().then(function (x) { return new Uint8Array(x); }); }, f.size, 'g', null);
  assert.strictEqual(g.epsg, 4326);
  const o = fpOpts({ src: 'fixed', fixed: 0 }, { src: 'fixed', fixed: 10 });
  const ra = s.footprintRings(a, o).rings, rb = s.footprintRings(b, o).rings, rg = s.footprintRings(g, o).rings;
  assert.strictEqual(ra.length, rb.length);
  assert.strictEqual(ra.length, rg.length);
  const walls = function (r) { return r.filter(function (x) { return x.length === 12; }); };
  const roofArea = function (r) { return r.filter(function (x) { return x.length === 9; }).reduce(function (a2, x) { return a2 + triArea(x); }, 0); };
  walls(ra).forEach(function (ring, i) {
    ring.forEach(function (v, k) { assert.ok(Math.abs(v - walls(rb)[i][k]) < 0.05, 'GeoJSON (7 Nachkommastellen, rund 1 cm) Wand ' + i + '/' + k); assert.ok(Math.abs(v - walls(rg)[i][k]) < 0.01, 'GeoPackage Wand ' + i + '/' + k); });
  });
  assert.ok(Math.abs(roofArea(ra) - roofArea(rb)) < 0.5 && Math.abs(roofArea(ra) - roofArea(rg)) < 0.05, 'gleiche Dachfläche: ' + roofArea(ra) + ' / ' + roofArea(rb) + ' / ' + roofArea(rg));
  // Fenster in WGS84 für das GeoPackage: Gelände samt Rand in Länge/Breite
  const w = s.fpWindowFor(4326);
  assert.ok(w[0] < w[2] && w[1] < w[3] && w[0] > 7 && w[0] < 15 && w[1] > 47 && w[1] < 50, JSON.stringify(w));
  const w2 = s.fpWindowFor(25832);
  assert.ok(Math.abs(w2[0] - (692050 - 120)) < 1e-6 && Math.abs(w2[3] - (5336040 + 120)) < 1e-6, 'gleiches System: Gelände mit 20 % Rand');
});

await test('2D-Gebäude: Datei wählen -> Auswahlfelder erscheinen mit sinnvoller Voreinstellung, Änderungen bauen die Gebäude neu', async function () {
  const s = await scopeWith2dTerrain();
  s.initUI();
  const g = function (id) { return s.document.getElementById(id); };
  await s.handleGmlFiles([fxFile('buildings25832.geojson')]);
  assert.strictEqual(g('fp-panel').style.display, 'block');
  assert.ok(g('gml-status').textContent.indexOf('GeoJSON') > 0 && g('gml-status').className.indexOf('ok') > 0, g('gml-status').textContent);
  assert.strictEqual(g('fp-h-src').value, 'attr');
  assert.strictEqual(g('fp-h-attr').value, 'hoehe', 'Höhenfeld nach dem Namen erkannt');
  assert.strictEqual(g('fp-ground-src').value, 'terrain', 'Gelände aus dem Modell, bis der Nutzer ein Attribut wählt');
  assert.ok(g('fp-h-attr').children.length === 3 && g('fp-h-attr').children.every(function (o) { return o.value !== 'name'; }), 'nur Zahlenfelder zur Wahl: ' + g('fp-h-attr').children.map(function (o) { return o.value; }));
  assert.ok(g('fp-crs').children[0].textContent.indexOf('EPSG:25832') >= 0, 'Bezugssystem aus der Datei');
  assert.ok(g('fp-info').textContent.indexOf('5 Gebäude') === 0 && g('fp-info').textContent.indexOf('2 ohne') > 0, g('fp-info').textContent);
  assert.ok(vm.runInContext('buildingsMesh', s), 'Gebäude gebaut');
  const faces1 = vm.runInContext('buildingsMesh.userData.faces', s);
  // Gelände aus dem Attribut, Gebäudehöhe fest
  g('fp-ground-src').value = 'attr'; g('fp-ground-attr').value = 'gelaende';
  g('fp-h-src').value = 'fixed'; g('fp-h-fixed').value = '25';
  s.onFpChanged();
  assert.strictEqual(g('fp-ground-attr').style.display, '', 'Attributfeld sichtbar');
  assert.strictEqual(g('fp-h-attr').style.display, 'none');
  assert.strictEqual(g('fp-ref-row').style.display, 'none', 'ohne Attribut keine Frage nach dem Bezug');
  assert.ok(g('fp-info').textContent.indexOf('0 ohne') > 0, 'feste Höhe: alle haben eine Höhe: ' + g('fp-info').textContent);
  const rings = vm.runInContext('lastGmlRings', s);
  assert.ok(Math.abs(zRange(rings)[1] - 527) < 1e-9, 'höchstes Dach: 502 + 25: ' + zRange(rings));
  assert.strictEqual(vm.runInContext('buildingsMesh.userData.faces', s), faces1, 'dieselben Flächen, andere Höhen');
  // falsches Bezugssystem: Meldung statt leerer Szene
  g('fp-crs').value = '3035';
  s.onFpChanged();
  assert.ok(g('gml-status').className.indexOf('err') > 0, g('gml-status').textContent);
  assert.strictEqual(vm.runInContext('buildingsMesh', s), null);
  g('fp-crs').value = '';
  s.onFpChanged();
  assert.ok(vm.runInContext('buildingsMesh', s), 'zurück auf das Bezugssystem der Datei: Gebäude wieder da');
  // Entfernen
  g('gml-clear')._listeners.click[0]();
  assert.strictEqual(g('fp-panel').style.display, 'none');
  assert.strictEqual(vm.runInContext('lastFootprints', s), null);
});

await test('2D-Gebäude: INSPIRE-GML (ČÚZK, EPSG:4258 mit Breite/Länge-Reihenfolge) wird als Grundriss erkannt, nicht als CityGML', async function () {
  const s = await scopeWith2dTerrain();
  s.initUI();
  const g = function (id) { return s.document.getElementById(id); };
  const text = fs.readFileSync(path.join(FX_DIR, 'inspire_bu2d.xml'), 'utf8');
  assert.strictEqual(s.fpLooksLikeInspireGml(text.slice(0, 6000)), true);
  assert.strictEqual(s.fpLooksLikeInspireGml('<core:CityModel xmlns:core="http://www.opengis.net/citygml/2.0"/>'), false);
  const set = s.parseInspireBuildings(text, 'x.xml');
  assert.strictEqual(set.feats.length, 4, 'vier Gebäude mit Polygon');
  assert.strictEqual(set.skippedPoints, 1, 'der Gebäudeteil mit Punktgeometrie wird übersprungen');
  assert.strictEqual(set.epsg, 4258);
  const p0 = set.feats[0].polys[0].outer[0];
  assert.ok(p0[0] > 11 && p0[0] < 13 && p0[1] > 49 && p0[1] < 51, 'Länge zuerst, dann Breite: ' + p0);
  assert.strictEqual(set.feats[1].props.geschosse, 3);
  assert.strictEqual(set.feats[2].props.hoehe, 12.5, 'Höhe aus HeightAboveGround/value');
  assert.strictEqual(set.feats[0].props.geschosse, null, 'nicht befüllt (xsi:nil)');
  assert.ok(set.fields.some(function (f) { return f.name === 'geschosse' && f.numeric; }) && set.fields.some(function (f) { return f.name === 'hoehe' && f.numeric; }));
  // Gelände dorthin legen (UTM 33N, EPSG:25833), Gebäude laden
  const c = s.lonLatToCrs(s.crsGeoDefinition(25833), p0[1], p0[0]);
  vm.runInContext('TERRAIN.epsg = 25833; TERRAIN.originE = ' + c.e + '; TERRAIN.originN = ' + c.n + '; TERRAIN.w = 150000; TERRAIN.d = 150000;', s);
  await s.handleGmlFiles([fxFile('inspire_bu2d.xml')]);
  assert.strictEqual(g('fp-panel').style.display, 'block', g('gml-status').textContent);
  assert.ok(g('gml-status').textContent.indexOf('INSPIRE-GML') > 0 && g('gml-status').className.indexOf('ok') > 0, g('gml-status').textContent);
  assert.strictEqual(g('fp-h-src').value, 'attr', 'Höhenfeld gefunden');
  assert.strictEqual(g('fp-h-attr').value, 'hoehe');
  assert.ok(g('fp-info').textContent.indexOf('4 Gebäude') === 0 && g('fp-info').textContent.indexOf('3 ohne') > 0, g('fp-info').textContent);
  assert.ok(vm.runInContext('buildingsMesh', s), 'Gebäude gebaut');
  assert.ok(g('fp-crs').children[0].textContent.indexOf('EPSG:4258') >= 0, 'Bezugssystem aus der Datei');
});

await test('2D-Gebäude: Shapefile mit .dbf/.prj und GeoPackage über den Datei-Dialog, .dbf ohne .shp und fehlendes Gelände geben Meldungen', async function () {
  const s = await scopeWith2dTerrain();
  const g = function (id) { return s.document.getElementById(id); };
  await s.handleGmlFiles([fxFile('buildings25832.shp'), fxFile('buildings25832.dbf'), fxFile('buildings25832.prj'), fxFile('buildings25832.cpg'), fxFile('buildings25832.shx')]);
  assert.ok(g('gml-status').textContent.indexOf('Shapefile') > 0 && g('gml-status').className.indexOf('ok') > 0, g('gml-status').textContent);
  assert.strictEqual(g('fp-h-attr').value, 'hoehe');
  assert.strictEqual(g('fp-table-row').style.display, 'none', 'nur ein Gebäudetyp: keine Tabellenwahl');
  await s.handleGmlFiles([fxFile('buildings25832.gpkg')]);
  assert.ok(g('gml-status').textContent.indexOf('GeoPackage') > 0, g('gml-status').textContent);
  assert.strictEqual(g('fp-h-attr').value, 'hoehe');
  assert.ok(g('fp-h-attr').children.some(function (o) { return o.value === 'fid'; }), 'fid ist ein Zahlenfeld');
  await s.handleGmlFiles([fxFile('buildings25832.dbf')]);
  assert.strictEqual(g('gml-status').textContent, s.T('fpNeedShp'));
  // Große Tabelle: nur das Gelände (200 x 200 m) wird gelesen
  await s.handleGmlFiles([fxFile('many25832.gpkg')]);
  assert.ok(vm.runInContext('lastFootprints.set.feats.length', s) < 100, 'nur Gebäude im Gelände: ' + vm.runInContext('lastFootprints.set.feats.length', s));
  assert.strictEqual(g('fp-h-attr').value, 'hoehe');
  // ohne Gelände
  const s2 = newScope();
  await s2.handleGmlFiles([fxFile('buildings25832.geojson')]);
  assert.strictEqual(s2.document.getElementById('gml-status').textContent, s2.T('fpNeedTerrain'));
  // keine Flächen im Gelände
  vm.runInContext('TERRAIN.originE = 100000; TERRAIN.originN = 100000;', s);
  await s.handleGmlFiles([fxFile('buildings25832.geojson')]);
  assert.ok(g('gml-status').className.indexOf('err') > 0, g('gml-status').textContent);
  // CityJSON/CityGML danach: das 2D-Feld verschwindet
  const s3 = await scopeWithTerrain();
  await s3.handleGmlFiles([fxFile('buildings25832.geojson')]);
  assert.strictEqual(vm.runInContext('!!lastFootprints', s3), true);
  const tr = { scale: [0.001, 0.001, 0.001], translate: [692005, 5336005, 500] };
  const P = [[0, 0, 0], [10000, 0, 0], [10000, 8000, 0], [0, 8000, 0], [0, 0, 5000], [10000, 0, 5000], [10000, 8000, 5000], [0, 8000, 5000]];
  const doc = { type: 'CityJSON', version: '2.0', transform: tr, vertices: P, CityObjects: { h: { type: 'Building', geometry: [{ type: 'Solid', lod: '2.2',
    boundaries: [[[[0, 3, 2, 1]], [[4, 5, 6, 7]], [[0, 1, 5, 4]], [[1, 2, 6, 5]], [[2, 3, 7, 6]], [[3, 0, 4, 7]]]] }] } } };
  await s3.handleGmlFiles([{ name: 'haus.city.json', size: 100, text: function () { return Promise.resolve(JSON.stringify(doc)); } }]);
  assert.strictEqual(vm.runInContext('lastFootprints', s3), null);
  assert.strictEqual(s3.document.getElementById('fp-panel').style.display, 'none');
});

/* ---------- Punktwolken (LAS, LAZ) als Geländemodell ---------- */

/* Gelände der Testwolken: z = 500 + 0,05 * (E - 692000) + 3 * sin((N - 5336000) / 20) */
const lasTruth = function (e, n) { return 500 + 0.05 * (e - 692000) + 3 * Math.sin((n - 5336000) / 20); };
function lasBytes(name) { const b = fs.readFileSync(path.join(FX_DIR, name)); return b.buffer.slice(b.byteOffset, b.byteOffset + b.length); }
function lasCheckTile(t, tol, label) {
  // Mitte jeder Zelle gegen die bekannte Fläche (Rand und Lücken auslassen)
  let n = 0, worst = 0;
  for (let r = 2; r < t.H - 2; r += 3) for (let c = 2; c < t.W - 2; c += 3) {
    const v = t.band[r * t.W + c];
    if (v === t.nodata) continue;
    const e = t.originX + (c + 0.5) * t.resX, nn = t.originY - (r + 0.5) * t.resY;
    worst = Math.max(worst, Math.abs(v - lasTruth(e, nn))); n++;
  }
  assert.ok(n > 25, label + ': genug Zellen gelesen: ' + n);
  assert.ok(worst < tol, label + ': größte Abweichung ' + worst.toFixed(3) + ' m');
}

await test('LAS/LAZ: Kopf nennt Format, Anzahl und Bezugssystem (GeoKey), auch bei LAS 1.4 und ohne Bezugssystem', function () {
  const s = newScope();
  const h = function (n) { return s.lasHeader(new Uint8Array(lasBytes(n))); };
  const a = h('cloud_f1.las'), b = h('cloud_f1.laz'), c = h('cloud_f6.laz'), d = h('cloud_nocrs.las');
  assert.strictEqual(a.version + '/' + a.format + '/' + a.compressed + '/' + a.count + '/' + a.epsg, '1.2/1/false/3860/25832');
  assert.strictEqual(b.compressed + '/' + b.count + '/' + b.epsg, 'true/24100/25832');
  assert.strictEqual(c.version + '/' + c.format + '/' + c.compressed + '/' + c.count + '/' + c.epsg, '1.4/6/true/24100/25832');
  assert.strictEqual(d.epsg, null, 'ohne GeoKeys: kein Bezugssystem');
  assert.ok(Math.abs(b.scale[0] - 0.01) < 1e-12 && Math.abs(b.min[0] - 692000) < 0.1 && b.max[0] > 692099);
  assert.throws(function () { s.lasHeader(new Uint8Array(300)); }, /lasBad/);
  assert.throws(function () { s.lasHeader(new Uint8Array(5)); }, /lasBad/);
});

await test('LAS/LAZ: Geländepunkte werden zu einem Raster, Vegetation und Rauschen fallen weg (LAS, LAZ 1.2 und LAZ 1.4)', async function () {
  const s = newScope();
  for (const f of ['cloud_f1.las', 'cloud_f1.laz', 'cloud_f6.laz']) {
    const t = await s.readLasTile(lasBytes(f), f, null, 0, null);
    assert.strictEqual(t.epsg, 25832, f);
    assert.ok(t.pointCloud.classified, f + ': klassifiziert');
    assert.strictEqual(t.resX, 1, f + ': Rasterweite aus Punktdichte und Geländeanteil (2,4 Punkte je m², davon 83 % Gelände: 1 m)');
    lasCheckTile(t, 0.3, f);                                   // Vegetation (6 bis 15 m darüber) und Rauschen (150 m) wären weit daneben
    assert.ok(t.pointCloud.ground > 0 && t.pointCloud.used >= t.pointCloud.ground, f);
  }
  const t = await s.readLasTile(lasBytes('cloud_f1.laz'), 'x.laz', null, 0, null);
  assert.ok(t.W === 100 && t.H === 100 && t.nodata === -9999, t.W + ' x ' + t.H);
  assert.ok(Math.abs(t.originX - 692000) < 0.5 && Math.abs(t.originY - 5336100) < 0.5, 'Ecke: ' + t.originX + ' / ' + t.originY);
});

await test('LAS/LAZ: nicht klassifizierte Wolke nimmt den tiefsten Punkt je Zelle, Datei ohne Bezugssystem braucht die Wahl, kaputte Datei meldet lasBad', async function () {
  const s = newScope();
  const u = await s.readLasTile(lasBytes('cloud_unclassified.laz'), 'u.laz', null, 0, null);
  assert.strictEqual(u.pointCloud.classified, false);
  lasCheckTile(u, 0.6, 'unklassifiziert');
  await assert.rejects(s.readLasTile(lasBytes('cloud_nocrs.las'), 'n.las', null, 0, null), /Bezugssystem/);
  const t = await s.readLasTile(lasBytes('cloud_nocrs.las'), 'n.las', 25832, 0, null);
  assert.strictEqual(t.epsg, 25832, 'gewähltes Bezugssystem');
  await assert.rejects(s.readLasTile(new ArrayBuffer(400), 'k.las', 25832, 0, null), /lasBad/);
  // Lücken werden aus den Nachbarn gefüllt, weit entfernte bleiben NoData
  const band = new Float32Array([1, -9999, 3, -9999, -9999, -9999, -9999, -9999, -9999, -9999, -9999, 9]);
  const f = s.lasFillGaps(band, 4, 3, -9999, 1);
  assert.strictEqual(f[1], 2, 'Mittel der Nachbarn 1 und 3');
  assert.strictEqual(f[7], -9999 === f[7] ? -9999 : f[7]);
  assert.strictEqual(s.lasFillGaps(band, 4, 3, -9999, 0)[1], -9999, 'ohne Durchgänge bleibt alles');
});

await test('LAS/LAZ: dünne Wolke nur aus Klasse 8 (Modell-Schlüsselpunkte, wie in NRW) zählt als Gelände; die Rasterweite folgt dem Geländeanteil', async function () {
  const s = newScope();
  const t = await s.readLasTile(lasBytes('cloud_class8.laz'), 'k8.laz', 25832, 0, null);
  assert.strictEqual(t.pointCloud.classified, true);
  assert.strictEqual(t.pointCloud.keyPoints, true, 'Klasse 8 als Gelände erkannt');
  assert.strictEqual(t.resX, 2, '0,5 Punkte je m², alle Gelände: 2 m');
  lasCheckTile(t, 0.35, 'Klasse 8');
  // mit Klasse 2 daneben bleibt Klasse 8 außen vor
  const m = await s.readLasTile(lasBytes('cloud_f1.laz'), 'm.laz', null, 0, null);
  assert.strictEqual(m.pointCloud.keyPoints, false);
  // Tschechien: DMR 5G als LAZ mit Hinweis
  const cz = s.geoSourcesFor({ country: 'CZ', state: '', city: 'Praha' });
  assert.strictEqual(cz.dem[0].fmt, 'laz');
  assert.ok(cz.dem[0].url.indexOf('CZ-CUZK-DMR5G-ETRS89-V') > 0 && cz.dem[0].url.indexOf('(S(') < 0, 'ohne Sitzungskennung');
  assert.strictEqual(cz.dem[0].note, 'czLaz');
});

await test('LAS/LAZ: sehr große Wolke braucht einen Pin und wird auf den Ausschnitt begrenzt; liegt der Pin daneben, kommt null', async function () {
  const s = newScope();
  const ab = lasBytes('cloud_f1.las');
  const dv = new DataView(ab);
  dv.setFloat64(179, 692000 + 20000, true);                    // MaxX und MaxY des Kopfes auf 20 km dehnen (Punkte bleiben, wo sie sind)
  dv.setFloat64(195, 5336000 + 20000, true);
  await assert.rejects(s.readLasTile(ab, 'g.las', null, 0, null), /lasBigNoPin/);
  const g = s.crsToLonLat(25832, 692020, 5336020);
  const t = await s.readLasTile(ab, 'g.las', null, 0, { lon: g.lon, lat: g.lat, size: 30 });
  assert.strictEqual(t.windowed, true);
  assert.ok(t.W * t.resX <= 31 && t.W * t.resX >= 29, 'Ausschnitt ca. 30 m: ' + t.W * t.resX);
  assert.ok(Math.abs(t.originX - (692020 - 15)) < 1e-6, 'Ausschnitt um den Pin');
  const far = s.crsToLonLat(25832, 900000, 5500000);
  assert.strictEqual(await s.readLasTile(ab, 'g.las', null, 0, { lon: far.lon, lat: far.lat, size: 30 }), null);
});

await test('LAS/LAZ: über den Datei-Dialog wird daraus das Gelände; ohne Bezugssystem erst nach der Wahl, danach neu mit anderem System', async function () {
  const s = newScope();
  const g = function (id) { return s.document.getElementById(id); };
  s.buildXyzCrsOptions();
  await s.handleDemFiles([fxFile('cloud_f1.laz')]);
  const t = vm.runInContext('TERRAIN', s);
  assert.ok(t && t.epsg === 25832, g('dem-status').textContent);
  assert.ok(g('dem-status').textContent.indexOf('Punktwolke') > 0 && g('dem-status').className.indexOf('ok') > 0, g('dem-status').textContent);
  // Höhe in der Mitte stimmt mit der Fläche überein
  const mid = s.worldToUTM(0, 0);
  assert.ok(Math.abs(s.getAbsoluteHeightAt(0, 0) - lasTruth(mid.e, mid.n)) < 0.5, 'Mitte ' + s.getAbsoluteHeightAt(0, 0) + ' / ' + lasTruth(mid.e, mid.n));
  // ohne Bezugssystem: vorgemerkt, wie bei XYZ
  const s2 = newScope();
  const g2 = function (id) { return s2.document.getElementById(id); };
  s2.buildXyzCrsOptions();
  await s2.handleDemFiles([fxFile('cloud_nocrs.las')]);
  assert.strictEqual(g2('dem-status').textContent, s2.T('xyzNeedCrs'));
  assert.strictEqual(vm.runInContext('TERRAIN', s2), null);
  g2('xyz-crs').value = '25832';
  s2.onXyzCrsChanged();
  for (let i = 0; i < 8; i++) await new Promise(function (r) { setImmediate(r); });
  assert.ok(vm.runInContext('TERRAIN', s2) && vm.runInContext('TERRAIN.epsg', s2) === 25832, g2('dem-status').textContent);
  g2('xyz-crs').value = '25833';
  s2.onXyzCrsChanged();
  for (let i = 0; i < 8; i++) await new Promise(function (r) { setImmediate(r); });
  assert.strictEqual(vm.runInContext('TERRAIN.epsg', s2), 25833, 'LAS ohne Bezugssystem lässt sich neu lesen');
  // kaputte Datei: Meldung auf Deutsch statt Schlüssel
  await s2.handleDemFiles([{ name: 'x.las', size: 400, arrayBuffer: function () { return Promise.resolve(new ArrayBuffer(400)); }, slice: function (a, b) { return { arrayBuffer: function () { return Promise.resolve(new ArrayBuffer(Math.min(400, b - a))); } }; } }]);
  assert.strictEqual(g2('dem-status').textContent, s2.T('lasBad'));
  assert.ok(g2('dem-status').className.indexOf('err') > 0);
  assert.ok(g('dem-status') && s.__bridge.STRINGS.en.lasBad && s.__bridge.STRINGS.de.lasLibFail);
});

await test('Datenfenster: geladene Abschnitte klappen zu, Fehler und leere bleiben offen, Klick auf die Überschrift klappt auf; die Bezugssystem-Zeile erscheint nur bei Bedarf', async function () {
  const s = newScope();
  s.initUI();
  const g = function (id) { return s.document.getElementById(id); };
  const col = function (id) { return /(^|\s)collapsed(\s|$)/.test(String(g(id).className || '')); };
  assert.strictEqual(col('row-dem'), false, 'am Anfang offen');
  s.setFileStatus('dem', 'x.tif', 'ok');
  assert.strictEqual(col('row-dem'), true, 'geladen: zugeklappt');
  assert.strictEqual(g('dem-status').textContent, 'x.tif', 'die Statuszeile bleibt');
  s.setFileStatus('dem', 'kaputt', 'err');
  assert.strictEqual(col('row-dem'), false, 'Fehler: offen');
  s.setFileStatus('dem', 'x.tif', 'ok');
  s.toggleFileRow('row-dem');
  assert.strictEqual(col('row-dem'), false, 'Klick klappt auf');
  s.toggleFileRow('row-dem');
  assert.strictEqual(col('row-dem'), true, 'noch ein Klick klappt zu');
  s.setFileStatus('dem', 'Keine Datei');
  assert.strictEqual(col('row-dem'), false, 'ohne Datei offen');
  // Gebäude: mit 2D-Einstellungen bleibt der Abschnitt offen, ohne klappt er zu
  vm.runInContext('lastFootprints = { set: { feats: [], fields: [] } }', s);
  s.setFileStatus('gml', '5 Gebäude', 'ok');
  assert.strictEqual(col('row-gml'), false, '2D-Einstellungen bleiben sichtbar');
  vm.runInContext('lastFootprints = null', s);
  s.setFileStatus('gml', '6 Flächen', 'ok');
  assert.strictEqual(col('row-gml'), true);
  // Bezugssystem-Zeile
  const s2 = await scopeWithTerrain();
  s2.initUI();
  s2.buildXyzCrsOptions();
  const g2 = function (id) { return s2.document.getElementById(id); };
  await s2.handleDemFiles([fxFile('cloud_nocrs.las')]);
  assert.strictEqual(g2('xyz-crs-row').style.display, 'flex', 'wartet auf das Bezugssystem: Zeile da');
  g2('xyz-crs').value = '25832';
  s2.onXyzCrsChanged();
  for (let i = 0; i < 8; i++) await new Promise(function (r) { setImmediate(r); });
  assert.strictEqual(g2('xyz-crs-row').style.display, 'flex', 'nach der Wahl noch da: ändern und neu lesen');
  await s2.handleDemFiles([fxFile('cloud_f1.laz')]);
  assert.strictEqual(g2('xyz-crs-row').style.display, 'none', 'Datei mit Bezugssystem: Zeile weg');
});

await test('Leeren und Reset fragen vor dem Löschen nach; Abbrechen, Esc und Klick daneben lassen alles, wie es ist', async function () {
  const s = await scopeWithTerrain();
  s.initUI();
  const g = function (id) { return s.document.getElementById(id); };
  const click = function (id) { g(id)._listeners.click[0]({ target: g(id) }); };
  // ohne Bausteine: nur ein Hinweis, kein Dialog
  click('clear-all');
  assert.notStrictEqual(g('confirm-wrap').style.display, 'flex');
  assert.strictEqual(g('status').textContent, s.T('msgNothingToClear'));
  s.addObject('tower', 0, 0, s.defaultTowerParams());
  s.addObject('container', 5, 5, s.defaultContainerParams());
  const count = function () { return vm.runInContext('objects.length', s); };
  assert.strictEqual(count(), 2);
  // Leeren: Dialog mit Anzahl, Abbrechen löscht nichts
  click('clear-all');
  assert.strictEqual(g('confirm-wrap').style.display, 'flex');
  assert.ok(g('confirm-text').textContent.indexOf('2 Bausteine') >= 0, g('confirm-text').textContent);
  assert.strictEqual(g('confirm-yes').textContent, s.T('confirmClearYes'));
  assert.strictEqual(count(), 2, 'noch nichts gelöscht');
  click('confirm-no');
  assert.strictEqual(g('confirm-wrap').style.display, 'none');
  assert.strictEqual(count(), 2);
  // Esc schließt, Entf bei offenem Dialog löscht nichts
  click('clear-all');
  s.onKeyDown({ key: 'Delete', target: {} });
  assert.strictEqual(count(), 2, 'Tastenkürzel ruhen bei offenem Dialog');
  assert.strictEqual(g('confirm-wrap').style.display, 'flex');
  s.onKeyDown({ key: 'Escape', target: {} });
  assert.strictEqual(g('confirm-wrap').style.display, 'none');
  // Klick auf den Hintergrund schließt, Klick in den Kasten nicht
  click('clear-all');
  g('confirm-wrap')._listeners.click[0]({ target: g('confirm-box') });
  assert.strictEqual(g('confirm-wrap').style.display, 'flex');
  g('confirm-wrap')._listeners.click[0]({ target: g('confirm-wrap') });
  assert.strictEqual(g('confirm-wrap').style.display, 'none');
  // Bestätigen löscht alle Bausteine, das Gelände bleibt
  click('clear-all');
  click('confirm-yes');
  assert.strictEqual(count(), 0);
  assert.strictEqual(g('confirm-wrap').style.display, 'none');
  assert.ok(vm.runInContext('TERRAIN', s), 'Gelände bleibt beim Leeren');
  // Reset: Dialog, Abbrechen tut nichts, Bestätigen lädt die Seite ohne Zusätze neu
  const calls = [];
  s.window.location = { pathname: '/app/', search: '?demo=1', replace: function (u) { calls.push(u); }, reload: function () { calls.push('reload'); } };
  click('reset-all');
  assert.strictEqual(g('confirm-wrap').style.display, 'flex');
  assert.ok(g('confirm-text').textContent.indexOf('nichts ist geladen') >= 0, g('confirm-text').textContent);
  assert.strictEqual(g('confirm-yes').textContent, s.T('confirmResetYes'));
  click('confirm-no');
  assert.strictEqual(calls.length, 0, 'Abbrechen: nichts passiert');
  click('reset-all');
  click('confirm-yes');
  assert.deepStrictEqual(calls.slice(), ['/app/'], 'Seite ohne ?demo=1 neu laden');
  assert.ok(s.__bridge.STRINGS.en.confirmReset && s.__bridge.STRINGS.en.confirmClear.indexOf('{n}') > 0 && s.__bridge.STRINGS.de.resetAll === 'Reset');
});

await test('Frankreich und Spanien: genaue Hinweise statt "nicht überall", Kanaren (REGCAN95) stimmen mit GDAL überein', async function () {
  const s = newScope();
  const fr = s.geoSourcesFor({ country: 'FR', state: 'Île-de-France', city: 'Paris' });
  assert.strictEqual(fr.dem[0].note, 'frLidar');
  assert.ok(fr.dem.some(function (x) { return x.url.indexOf('carte-du-lidar-hd') >= 0; }), 'Link zur Abdeckung nach Gemeinde');
  assert.ok(s.__bridge.STRINGS.de.geoNote_frLidar.indexOf('78 %') >= 0 && s.__bridge.STRINGS.en.geoNote_frLidar.indexOf('78 %') >= 0);
  const es = s.geoSourcesFor({ country: 'ES', state: 'Madrid', city: 'Madrid' });
  assert.strictEqual(es.dem[0].note, 'esMdt');
  assert.ok(es.dem.every(function (x) { return x.note !== 'euPartial'; }), 'Spanien: kein pauschales "nicht überall" mehr');
  // REGCAN95 / UTM 28N = EPSG:4083 und UTM 27N = 4082; Referenz: gdaltransform (Las Palmas, Hierro)
  const a = s.lonLatToCrs(s.crsGeoDefinition(4083), 28.1235, -15.4363), b = s.lonLatToCrs(s.crsGeoDefinition(4082), 28.7, -18.0);
  assert.ok(Math.abs(a.e - 457150.659) < 0.001 && Math.abs(a.n - 3110960.125) < 0.001, a.e + ' / ' + a.n);
  assert.ok(Math.abs(b.e - 793112.179) < 0.001 && Math.abs(b.n - 3178436.161) < 0.001, b.e + ' / ' + b.n);
  assert.ok(s.crsLabel(4083).indexOf('REGCAN95') > 0);
});

await test('Stadtmodell in der Stadt (Prag): das 3D-Modell steht bei den Gebäudemodellen, der Hinweis "kein Modell geprüft" entfällt', async function () {
  const s = startMapScope();
  const g = function (id) { return s.document.getElementById(id); };
  g('sm-load')._listeners.click[0]();
  await s.chooseAddrItem({ main: 'Wenzelsplatz', sub: 'Prag', lat: 50.0813, lon: 14.4274, country: 'CZ', state: '', city: 'Prag' }, {});
  const txt = g('sm-pop-body').textContent;
  const iB = txt.indexOf(s.T('addrBldg')), iC = txt.indexOf(s.T('addrCity').replace('{c}', 'Prag'));
  assert.ok(iB >= 0 && iC > iB, 'Gruppe Gebäudemodell vor den Stadtlinks');
  assert.ok(txt.slice(iB, iC).indexOf('Prag · 3D-Modell') >= 0, txt.slice(iB, iC));
  assert.strictEqual(txt.indexOf(s.T('geoNote_noEuBldg')), -1, 'kein Hinweis, weil die Stadt ein Modell hat');
  assert.ok(txt.slice(iC).indexOf('3D-Modell') < 0, 'nicht doppelt in den Stadtlinks');
  await s.chooseAddrItem({ main: 'Bratislava', sub: 'Slowakei', lat: 48.15, lon: 17.1, country: 'SK', state: '', city: 'Bratislava' }, {});
  assert.ok(g('sm-pop-body').textContent.indexOf(s.T('geoNote_noEuBldg')) >= 0, 'ohne Stadtmodell bleibt der Hinweis');
});

await test('Gebäude als CityJSON laden: Dateiauswahl nennt .json/.jsonl, Status zählt die Flächen, Fehler nennt die Datei', async function () {
  const s = await scopeWithTerrain();
  const tr = { scale: [0.001, 0.001, 0.001], translate: [692005, 5336005, 500] };
  const P = [[0, 0, 0], [10000, 0, 0], [10000, 8000, 0], [0, 8000, 0], [0, 0, 5000], [10000, 0, 5000], [10000, 8000, 5000], [0, 8000, 5000]];
  const doc = { type: 'CityJSON', version: '2.0', transform: tr, vertices: P, CityObjects: { h: { type: 'Building', geometry: [{ type: 'Solid', lod: '2.2',
    boundaries: [[[[0, 3, 2, 1]], [[4, 5, 6, 7]], [[0, 1, 5, 4]], [[1, 2, 6, 5]], [[2, 3, 7, 6]], [[3, 0, 4, 7]]]] }] } } };
  await s.handleGmlFiles([fakeFile('haus.city.json', JSON.stringify(doc))], false);
  const st = s.document.getElementById('gml-status');
  assert.ok(/^6 Flächen/.test(st.textContent), st.textContent);
  assert.ok(s.__bridge.STRINGS.de.buildingFile.indexOf('CityJSON') >= 0 && s.__bridge.STRINGS.en.buildingFile.indexOf('CityJSON') >= 0);
  await s.handleGmlFiles([fakeFile('kaputt.json', '{ nope')], false);
  assert.ok(/kein gültiges CityJSON/.test(st.textContent), st.textContent);
  assert.ok(s.document.getElementById('status').textContent.indexOf(s.T('gmlUnreadable')) === 0, s.document.getElementById('status').textContent);
});

await test('Startkarte: ein Pin zeigt die Links nur im Fenster am Pin; die Adressleiste zeigt sie erst, wenn dort etwas eingegeben wird', async function () {
  const s = startMapScope();
  s.document.getElementById('sm-load')._listeners.click[0]();
  s.smFlyTo(48.1374, 11.5755, 16);
  s.document.getElementById('addr-input').value = '';
  const box = s.document.getElementById('sm-tiles');
  box._listeners.pointerdown[0]({ button: 0, clientX: 300, clientY: 200, preventDefault: function () {} });
  s.smPointerUp({ clientX: 300, clientY: 200 });
  assert.strictEqual(s.document.getElementById('sm-pop').style.display, 'block', 'Fenster am Pin');
  assert.strictEqual(s.document.getElementById('addr-result').style.display, 'none', 'nicht noch einmal unter der Adresseingabe');
  assert.strictEqual(s.document.getElementById('addr-input').value, '', 'das Eingabefeld bleibt leer');
  assert.ok(vm.runInContext('addrPlace', s).fromMap);
  // Etwas in der Adressleiste gewählt: dort erscheinen die Links
  await s.chooseAddrItem({ main: 'Marienplatz', sub: 'München', lat: 48.1374, lon: 11.5755, country: 'DE', state: 'Bayern' }, {});
  assert.strictEqual(s.document.getElementById('addr-result').style.display, 'block');
  assert.ok(s.document.getElementById('addr-result').textContent.indexOf('geodaten.bayern.de') >= 0);
  assert.strictEqual(s.document.getElementById('addr-input').value, 'Marienplatz, München');
  // und danach wieder ein Pin: die Liste links verschwindet
  box._listeners.pointerdown[0]({ button: 0, clientX: 320, clientY: 210, preventDefault: function () {} });
  s.smPointerUp({ clientX: 320, clientY: 210 });
  assert.strictEqual(s.document.getElementById('addr-result').style.display, 'none');
});

await test('Startkarte: für Österreich nennt das Fenster einen Befehl zum Zuschneiden großer Dateien, mit Kopieren; sonst nicht', async function () {
  const s = startMapScope();
  s.document.getElementById('sm-load')._listeners.click[0]();
  await s.chooseAddrItem({ main: 'Salzburg', sub: 'Österreich', lat: 47.8095, lon: 13.055, country: 'AT', state: 'Salzburg' }, {});
  const body = s.document.getElementById('sm-pop-body');
  const txt = body.textContent;
  assert.ok(txt.indexOf(s.T('smCutToggle')) >= 0, 'Schalter für Fortgeschrittene');
  assert.ok(txt.indexOf(s.T('smBigHint')) >= 0 && txt.indexOf('liest nur den Ausschnitt') > 0, 'Hinweis: große Datei direkt wählen');
  assert.ok(txt.indexOf(s.T('smCutTitle')) >= 0 && txt.indexOf('1000 × 1000 m um den Pin') >= 0, txt);
  const findCls = function (n, c) { let r = null; (function walk(e) { if (e.className && String(e.className).indexOf(c) >= 0) r = e; (e.children || []).forEach(walk); })(n); return r; };
  const inner = findCls(body, 'sm-cut-body'), tog = findCls(body, 'sm-cut-toggle');
  assert.strictEqual(inner.style.display, 'none', 'zunächst zugeklappt');
  tog._listeners.click[0]();
  assert.strictEqual(inner.style.display, 'block', 'aufgeklappt');
  const cmd = /gdal_translate [^\n]*ausschnitt\.tif/.exec(txt);
  assert.ok(cmd && cmd[0].indexOf('-projwin 13.0') >= 0 || cmd && /-projwin 1[23]\.\d+ 47\.\d+ 1[34]\.\d+ 47\.\d+/.test(cmd[0]), cmd && cmd[0]);
  let copied = null;
  s.navigator = { clipboard: { writeText: function (t) { copied = t; return { then: function (f) { f(); } }; } } };
  const find = function (n) { let r = null; (function walk(e) { if (e.className && String(e.className).indexOf('sm-copy') >= 0) r = e; (e.children || []).forEach(walk); })(n); return r; };
  const btn = find(body);
  assert.ok(btn, 'Kopieren-Knopf');
  btn._listeners.click[0]();
  assert.ok(copied && /^gdal_translate -projwin_srs EPSG:4326/.test(copied), String(copied));
  assert.strictEqual(btn.textContent, s.T('smCutDone'));
  await s.chooseAddrItem({ main: 'München', sub: 'Bayern', lat: 48.1374, lon: 11.5755, country: 'DE', state: 'Bayern' }, {});
  assert.ok(body.textContent.indexOf(s.T('smCutToggle')) < 0, 'nur Österreich: ' + body.textContent.slice(0, 200));
});

await test('Startkarte: nach einer eingetippten Adresse nennt der Kasten den Ort, der Knopf heißt "Karte am Ort laden", ein Klick zeigt den Ort', async function () {
  const s = startMapScope();
  const g = function (id) { return s.document.getElementById(id); };
  assert.strictEqual(g('sm-consent-place').style.display, 'none', 'ohne Ort kein Ortsname');
  assert.strictEqual(g('sm-load').textContent, s.T('smLoad'));
  await s.chooseAddrItem({ main: 'Marienplatz', sub: '80331 München, Bayern', lat: 48.1374, lon: 11.5755, country: 'DE', state: 'Bayern' }, {});
  assert.strictEqual(g('sm-consent').style.display, 'block', 'der Kasten bleibt (Einwilligung vor den OSM-Kacheln)');
  assert.strictEqual(g('sm-tiles').children.length, 0, 'noch keine Kachel angefragt');
  assert.strictEqual(g('sm-consent-place').style.display, 'block');
  assert.ok(g('sm-consent-place').textContent.indexOf('Marienplatz') >= 0 && g('sm-consent-place').textContent.indexOf('München') >= 0, g('sm-consent-place').textContent);
  assert.strictEqual(g('sm-load').textContent, s.T('smLoadAt'));
  assert.strictEqual(s.T('smLoadAt'), 'Karte am Ort laden');
  g('sm-load')._listeners.click[0]();
  const imgs = g('sm-tiles').children;
  assert.ok(imgs.some(function (im) { return /\/15\/17\d{3}\/11\d{3}\.png$/.test(im.src); }), 'Kacheln der Stufe 15 bei München: ' + (imgs[0] && imgs[0].src));
  assert.strictEqual(g('sm-pop').style.display, 'block', 'Pin und Fenster stehen am Ort');
  // eine zweite Adresse bei geladener Karte: die Karte springt mit
  await s.chooseAddrItem({ main: 'Rathausplatz', sub: '1010 Wien', lat: 48.2105, lon: 16.3588, country: 'AT', state: 'Wien' }, {});
  const v = vm.runInContext('smView', s);
  assert.ok(Math.abs(v.lat - 48.2105) < 1e-9 && Math.abs(v.lon - 16.3588) < 1e-9 && v.z === 15, JSON.stringify(v));
});

await test('Startkarte: Beschriftung des Kastens folgt der Sprache, auch mit gewähltem Ort', async function () {
  const s = startMapScope();
  const g = function (id) { return s.document.getElementById(id); };
  await s.chooseAddrItem({ main: 'Marienplatz', sub: 'München', lat: 48.1374, lon: 11.5755, country: 'DE', state: 'Bayern' }, {});
  s.__bridge.SETTINGS.language = 'en';
  s.applyLanguage();
  assert.strictEqual(g('sm-load').textContent, 'Load map at the place');
  assert.ok(g('sm-consent-place').textContent.indexOf('Place: Marienplatz') === 0, g('sm-consent-place').textContent);
  s.__bridge.SETTINGS.language = 'de';
  s.applyLanguage();
  assert.strictEqual(g('sm-load').textContent, 'Karte am Ort laden');
});

await test('Startkarte: sobald ein Gelände geladen ist, verschwindet sie; ohne Gelände kommt sie zurück', async function () {
  const s = await scopeWithTerrain();
  assert.strictEqual(s.document.getElementById('startmap').style.display, 'none');
  vm.runInContext('TERRAIN = null', s);
  s.updateTerrainInfo();
  assert.strictEqual(s.document.getElementById('startmap').style.display, 'block');
});

await test('Startkarte bei geladenem Gelände (z. B. Demo): ein Ort außerhalb öffnet die Karte dort, ein Ort im Gelände nicht; Zurück und Esc schließen sie', async function () {
  const s = await scopeWithTerrain();
  s.initUI();
  const g = function (id) { return s.document.getElementById(id); };
  const t = vm.runInContext('TERRAIN', s);
  const mid = s.crsToLonLat(t.epsg, t.originE, t.originN);
  // Ort mitten im Gelände: nur die Links, keine Karte
  await s.chooseAddrItem({ main: 'Mitte', sub: 'Gelände', lat: mid.lat, lon: mid.lon, country: 'DE', state: 'Bayern' }, {});
  assert.strictEqual(g('startmap').style.display, 'none', 'im Gelände bleibt die 3D-Ansicht');
  // andere Stadt: die Karte öffnet sich, mit Zurück-Knopf und dem Ort im Kasten
  await s.chooseAddrItem({ main: 'Rathausplatz', sub: '1010 Wien', lat: 48.2105, lon: 16.3588, country: 'AT', state: 'Wien' }, {});
  assert.strictEqual(g('startmap').style.display, 'block');
  assert.strictEqual(g('sm-consent').style.display, 'block', 'erst die Einwilligung');
  assert.ok(g('sm-consent-place').textContent.indexOf('Rathausplatz') >= 0, g('sm-consent-place').textContent);
  assert.strictEqual(g('sm-back').style.display, 'block', 'Zurück zum Gelände ist erreichbar, auch vor "Karte laden"');
  assert.strictEqual(g('sm-tools').style.display, 'flex');
  assert.strictEqual(g('sm-zoom').style.display, 'none', 'ohne Einwilligung nur der Zurück-Knopf');
  g('sm-load')._listeners.click[0]();
  assert.ok(g('sm-tiles').children.length > 0, 'Kacheln nach dem Klick');
  assert.strictEqual(g('sm-zoom').style.display, 'flex');
  assert.strictEqual(g('sm-pop').style.display, 'block', 'Pin und Links der neuen Stadt');
  // Zurück
  g('sm-back')._listeners.click[0]();
  assert.strictEqual(g('startmap').style.display, 'none');
  assert.ok(vm.runInContext('TERRAIN', s), 'das Gelände ist unverändert da');
  // wieder öffnen und mit Esc schließen (erst das Fenster am Pin, dann die Karte)
  await s.chooseAddrItem({ main: 'Marienplatz', sub: 'München', lat: 48.1374, lon: 11.5755, country: 'DE', state: 'Bayern' }, {});
  const outside = !s.placeInsideTerrain(48.1374, 11.5755);
  if (outside) {
    assert.strictEqual(g('startmap').style.display, 'block');
    s.onKeyDown({ key: 'Escape', target: {} });
    assert.strictEqual(g('sm-pop').style.display, 'none', 'Esc schließt zuerst das Fenster');
    assert.strictEqual(g('startmap').style.display, 'block');
    s.onKeyDown({ key: 'Escape', target: {} });
    assert.strictEqual(g('startmap').style.display, 'none', 'dann die Karte');
  }
});

await test('Startkarte bei geladenem Gelände: ein neues Gelände schließt die Karte; mit ?demo=1 öffnet sie sich trotzdem für einen anderen Ort', async function () {
  const s = await scopeWithTerrain();
  s.initUI();
  const g = function (id) { return s.document.getElementById(id); };
  s.window.location.search = '?demo=1';
  await s.chooseAddrItem({ main: 'Rathausplatz', sub: '1010 Wien', lat: 48.2105, lon: 16.3588, country: 'AT', state: 'Wien' }, {});
  assert.strictEqual(g('startmap').style.display, 'block', 'auch im Demo-Modus');
  s.updateTerrainInfo();                                   // ein Gelände wird geladen
  assert.strictEqual(g('startmap').style.display, 'none');
  assert.strictEqual(vm.runInContext('smForced', s), false);
});

await test('Startkarte: eine gewählte Adresse setzt die Karte dorthin, auch vor "Karte laden" (ohne Kachelanfrage)', async function () {
  const s = startMapScope();
  await s.chooseAddrItem({ main: 'Marienplatz', sub: 'München', lat: 48.1374, lon: 11.5755, country: 'DE', state: 'Bayern' }, {});
  const v = vm.runInContext('smView', s);
  assert.ok(Math.abs(v.lat - 48.1374) < 1e-9 && v.z === 15);
  assert.strictEqual(s.document.getElementById('sm-tiles').children.length, 0, 'ohne Einwilligung keine Kachel');
  s.document.getElementById('sm-load')._listeners.click[0]();
  assert.ok(s.document.getElementById('sm-tiles').children.length > 0);
});

await test('Achslinie: Felder über (Neigung) und unter (Länge) der Mittellinie, Eingabe ändert den Abschnitt', function () {
  const s = newScope();
  s.initUI();
  const obj = threePointRoadUi(s, [4, -2]);
  const cam = s.__bridge.camera;
  cam.position.set(0, 40, 30);
  s.updateAxisLabels();
  const els = s.document.getElementById('axis-labels').children;
  assert.strictEqual(els.length, 4, 'zwei Abschnitte, je ein Feld oben und unten');
  const inputOf = function (i) { return els[i].children[0]; };
  assert.strictEqual(inputOf(0).value, '4');
  assert.strictEqual(inputOf(1).value, '40.00');
  assert.strictEqual(inputOf(2).value, '-2');
  assert.strictEqual(inputOf(3).value, '30.00');
  assert.strictEqual(inputOf(1).style.width, '6ch', 'Breite nach dem Text (5 Zeichen plus Rand), damit die Einheit frei bleibt');
  assert.strictEqual(inputOf(0).style.width, '4ch');
  assert.strictEqual(els[0].className, 'axis-label up');
  assert.strictEqual(els[1].className, 'axis-label down');

  inputOf(0).value = '6,5';                                // Komma wie in der deutschen Schreibweise
  inputOf(0).fire('change');
  assert.deepStrictEqual(s.roadSlopeList(obj.params), [6.5, -2]);

  inputOf(3).value = '45';
  inputOf(3).fire('change');
  assert.ok(Math.abs(obj.group.userData.parts[1].len - 45) < 0.02, String(obj.group.userData.parts[1].len));
  assert.ok(Math.abs(obj.params.points[2].x - 45) < 0.02, 'Endpunkt rückt mit');

  inputOf(0).value = 'abc';
  inputOf(0).fire('change');
  assert.deepStrictEqual(s.roadSlopeList(obj.params), [6.5, -2], 'Unsinn ändert nichts');
});

await test('Achslinie: beim Herauszoomen verschwinden alle Felder einer Straße gleichzeitig, auch die langer Abschnitte', function () {
  const s = newScope();
  s.initUI();
  const p = s.defaultRoadParams();
  p.points = [{ x: -60, z: 0 }, { x: 40, z: 0 }, { x: 45, z: 0 }];     // Abschnitte von 100 m und 5 m
  p.width = 6; p.radius = 1; p.slope = 1;
  s.addObject('road', 0, 0, p);
  const els = s.document.getElementById('axis-labels').children;
  const shown = function () { return els.filter(function (e) { return e.style.display === 'block'; }).length; };
  s.__bridge.camera.position.set(42, 10, 5);                          // dicht am kurzen Abschnitt
  s.updateAxisLabels();
  assert.strictEqual(shown(), 4, 'nah: alle vier Felder');
  s.__bridge.camera.position.set(0, 150, 100);                          // der lange Abschnitt wäre noch groß genug
  s.updateAxisLabels();
  assert.strictEqual(shown(), 0, 'weit weg: kein einziges Feld, nicht nur die des kurzen Abschnitts');
});

await test('Achslinie: beim Zeichnen und Messen sind die Felder ausgeblendet', function () {
  const s = newScope();
  s.initUI();
  threePointRoadUi(s, [4, -2]);
  s.__bridge.camera.position.set(0, 40, 30);
  s.updateAxisLabels();
  const els = s.document.getElementById('axis-labels').children;
  assert.strictEqual(els[0].style.display, 'block');
  s.selectTool('road');
  s.updateAxisLabels();
  assert.strictEqual(els[0].style.display, 'none', 'Straße zeichnen');
});

await test('Mindestradius: tatsächlich erreichter Wert steht neben dem Feld, der Wunschwert im Feld bleibt', function () {
  const s = newScope();
  const p = s.defaultRoadParams();
  p.points = [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 10 }];   // kurze Schenkel, Radius 40 passt nicht
  p.radius = 40;
  const obj = s.addObject('road', 0, 0, p);
  const form = s.buildForm('road', obj.params, function () {}, true);
  assert.strictEqual(s.markRoadRadius(obj, form.refs), true);
  assert.ok(form.refs.radius.eff.textContent.indexOf('→') === 0, form.refs.radius.eff.textContent);
  assert.strictEqual(form.refs.radius.num.value, 40);
  obj.params.radius = 3;
  assert.strictEqual(s.markRoadRadius(obj, form.refs), false);
  assert.strictEqual(form.refs.radius.eff.textContent, '');
});

await test('Baustraße: der Hinweis nennt neben der Länge auch die Fläche', function () {
  const s = newScope();
  const obj = roadObject(s, 0);
  const hint = s.roadHintText(obj);
  assert.ok(hint.indexOf('50 m ') === 0, hint);
  assert.ok(hint.indexOf(s.T('area') + ' 300 m²') > 0, hint);
});

await test('Baustraße: Schleppkurve Sattelzug - Schalter im Formular, Ergebnis im Eigenschaftsfenster', function () {
  const s = newScope();
  const tool = s.buildForm('road', s.defaultRoadParams(), function () {}, false);
  assert.ok(tool.refs.showSwept, 'Schalter fehlt');
  assert.strictEqual(tool.refs.showSwept.input.checked, false, 'standardmäßig aus');
  const p = s.defaultRoadParams();
  p.points = [{ x: -60, z: -10 }, { x: -10, z: -10 }, { x: -10, z: 50 }];
  p.radius = 10; p.width = 4.5; p.slope = 0;
  const obj = s.addObject('road', 0, 0, p);
  const el = s.document.createElement('div');
  s.renderRoadEarth(obj, el);
  assert.ok(el.textContent.indexOf('Sattelzug') < 0, 'ohne Schalter kein Hinweis');
  obj.params.showSwept = true; s.rebuildObject(obj);
  s.renderRoadEarth(obj, el);
  const txt = el.textContent;
  assert.ok(txt.indexOf('Sattelzug 16,50 m braucht') >= 0, txt);
  assert.ok(txt.indexOf('Passt nicht') >= 0, txt);
  assert.ok(txt.indexOf('Vehicle Tracking') < 0, 'Quelle steht nicht im Fenster');
  obj.params.width = 9; s.rebuildObject(obj);
  s.renderRoadEarth(obj, el);
  assert.ok(el.textContent.indexOf(s.T('sweptOk')) >= 0 && el.textContent.indexOf('Passt nicht') < 0, el.textContent);
});

await test('Baustraße: Auftrag und Abtrag samt Böschungshinweis stehen im Eigenschaftsfenster', function () {
  const s = newScope();
  const obj = roadObject(s, 5);
  const el = s.document.createElement('div');
  s.renderRoadEarth(obj, el);
  const txt = el.textContent;
  assert.ok(txt.indexOf(s.T('fill')) >= 0 && txt.indexOf(s.T('cut')) >= 0, txt);
  assert.ok(txt.indexOf('m³') > 0, txt);
  assert.ok(txt.indexOf(s.T('embankment').replace('{r}', '1:1')) >= 0, txt);
  assert.ok(obj.group.userData.earthworks.fill > 0, 'bei +5 % auf ebenem Gelände muss Auftrag entstehen');
});

await test('Böschung: Auswahlliste 1:1, 1:1.5, 1:2 im Straßen-Editor, liefert Zahlen und steht hinter den Reglern', function () {
  const s = newScope(), calls = [];
  const p = s.defaultRoadParams();
  const form = s.buildForm('road', p, function (k, v) { calls.push([k, v]); }, true);
  const r = form.refs.embank;
  assert.ok(r, 'Feld "embank" fehlt');
  assert.deepStrictEqual(r.input.children.map(function (o) { return o.textContent; }), ['1 : 1', '1 : 1.5', '1 : 2']);
  r.input.value = '1.5';
  r.input.fire('change');
  assert.deepStrictEqual(calls, [['embank', 1.5]]);
  const kids = form.element.children;
  assert.ok(kids.indexOf(r.row) > kids.indexOf(form.refs.slope.row), 'Auswahl gehört hinter die Regler, nicht davor');
  // auch im Werkzeugfenster vor dem Setzen
  assert.ok(s.buildForm('road', p, function () {}, false).refs.embank);
});

await test('Böschung: der Hinweis im Eigenschaftsfenster nennt die gewählte Neigung', function () {
  const s = newScope();
  const obj = roadObject(s, 5);
  obj.params.embank = 2;
  s.rebuildObject(obj);
  const el = s.document.createElement('div');
  s.renderRoadEarth(obj, el);
  assert.ok(el.textContent.indexOf(s.T('embankment').replace('{r}', '1:2')) >= 0, el.textContent);
});

await test('formatVolume: unter 10 m³ eine Nachkommastelle, darüber ganze Kubikmeter', function () {
  const s = newScope();
  assert.strictEqual(s.formatVolume(4.26), '4.3 m³');
  assert.strictEqual(s.formatVolume(1234.6), '1235 m³');
});

/* ---------- IFC Export als Karte in der Werkzeugleiste ---------- */

function ifcCard(s) {
  return Array.prototype.slice.call(s.document.getElementById('palette').children).filter(function (c) {
    return c.dataset.tool === 'ifc';
  })[0];
}

await test('IFC Export: Karte in der Werkzeugleiste (hinter Baustraße und Baugrube), kein Knopf mehr oben', async function () {
  const s = newScope();
  s.initUI();
  const tools = Array.prototype.slice.call(s.document.getElementById('palette').children).map(function (c) { return c.dataset.tool; });
  assert.deepStrictEqual(tools, ['container', 'tower', 'mobile', 'road', 'pit', 'ifc', 'ruler']);
  const card = ifcCard(s);
  assert.strictEqual(card.children[0].className, 'pal-icon ifc');
  assert.strictEqual(card.children[1].textContent, 'IFC Export');
  assert.strictEqual(s.document._byId['rect-export-btn'], undefined, 'der alte Knopf darf nicht mehr angesprochen werden');
});

await test('IFC Export: Klick auf die Karte startet die Rechteckauswahl und leuchtet, erneuter Klick bricht ab', async function () {
  const s = await scopeWithTerrain();
  s.initUI();
  const card = ifcCard(s);
  const toggles = [];
  card.classList.toggle = function (name, on) { toggles.push([name, on]); };
  card.fire('click');
  assert.strictEqual(s.isRectSelectActive(), true);
  assert.deepStrictEqual(toggles[toggles.length - 1], ['active', true]);
  card.fire('click');
  assert.strictEqual(s.isRectSelectActive(), false);
  assert.deepStrictEqual(toggles[toggles.length - 1], ['active', false]);
});

await test('IFC Export: ohne Gelände meldet die Karte den Datenmangel statt zu starten', async function () {
  const s = newScope();
  s.initUI();
  ifcCard(s).fire('click');
  assert.strictEqual(s.isRectSelectActive(), false);
  assert.strictEqual(s.document.getElementById('status').textContent, s.T('msgNeedTerrain'));
});

/* ---------- Gelände-Detailstufe: automatisch, kein Regler mehr ---------- */

await test('Detailstufe: kein Regler und kein Schalter mehr, das Gelände nutzt die höchste Rasterstufe (GRID_MAX)', async function () {
  const s = newScope();
  s.initUI();
  assert.strictEqual(s.document._byId['detail-slider'], undefined);
  assert.strictEqual(s.document._byId['auto-detail'], undefined);
  assert.strictEqual(s.__bridge.SETTINGS.detail, undefined);
  assert.strictEqual(s.detailLimit, undefined);
});

/* ---------- Darstellung: Fensterbreite ab 150 px, keine Anordnungswahl ---------- */

function allInputs(el, out) {
  (el.children || []).forEach(function (c) { if (c.type) out.push(c); allInputs(c, out); });
  return out;
}

await test('Darstellung: Fensterbreite reicht von 220 bis 400 px (Standard 220), die Anordnung (Werkzeuge links/rechts) gibt es nicht mehr', function () {
  const s = newScope();
  s.toggleTweak(true);
  const body = s.document.getElementById('tweak-body');
  const ranges = allInputs(body, []).filter(function (i) { return i.type === 'range'; });
  const width = ranges.filter(function (i) { return i.className === 'tw-slider' && i.max === 400; })[0];
  assert.ok(width, 'Regler für die Fensterbreite fehlt');
  assert.strictEqual(width.min, 220);
  assert.strictEqual(s.__bridge.SETTINGS.width, 220);
  assert.strictEqual(s.T('tweak'), 'Darstellung');
  assert.strictEqual(s.__bridge.SETTINGS.layout, undefined);
  const txt = body.textContent;
  assert.ok(txt.indexOf('Werkzeuge links') < 0 && txt.indexOf('Anordnung') < 0, txt);
});

/* ---------- Geoportale-Link im Datenfenster ---------- */

await test('Geoportale: Link neben "Daten" führt auf die Tabelle im README der jeweiligen Sprache', function () {
  const s = newScope();
  s.applyLanguage();
  const a = s.document.getElementById('geoportal-link');
  assert.strictEqual(a.href, 'https://github.com/Mucnese/quick-site-design#datenquellen');
  assert.strictEqual(a.title, s.T('geoportalsTip'));
  s.__bridge.SETTINGS.language = 'en';
  s.applyLanguage();
  assert.strictEqual(a.href, 'https://github.com/Mucnese/quick-site-design/blob/main/README.en.md#where-to-get-the-data');
});

/* ---------- Zeichnen: Rechtsklick oder Leertaste schließt ab (Baustraße und Baugrube) ---------- */

async function drawingScope(tool, pts) {
  const s = await scopeWithTerrain();
  s.initUI();
  s.selectTool(tool);
  pts.forEach(function (q) {
    setTerrainHit(s, q[0], 0, q[1]);
    s.onCanvasClick({ clientX: 0, clientY: 0 });
  });
  return s;
}

function rightClick(s, moveBy) {
  s.onCanvasPointerDown({ button: 2, clientX: 100, clientY: 100, pointerId: 1 });
  s.onCanvasPointerUp({ clientX: 100 + (moveBy || 0), clientY: 100, pointerId: 1 });
}

const PIT_PTS = [[-10, -10], [10, -10], [10, 10], [-10, 10]];

await test('Baugrube zeichnen: Leertaste schließt das Polygon, Standardtiefe -5 m', async function () {
  const s = await drawingScope('pit', PIT_PTS);
  s.onKeyDown({ key: ' ', code: 'Space' });
  assert.strictEqual(s.__bridge.objects.length, 1);
  assert.strictEqual(s.__bridge.objects[0].type, 'pit');
  assert.strictEqual(s.__bridge.objects[0].params.depth, -5);
  assert.strictEqual(s.__bridge.objects[0].params.points.length, 4);
});

await test('Baugrube zeichnen: Rechtsklick schließt das Polygon; Ziehen mit rechts (Ansicht verschieben) schließt nicht', async function () {
  const s = await drawingScope('pit', PIT_PTS);
  rightClick(s, 40);                                  // gezogen: Verschieben der Ansicht
  assert.strictEqual(s.__bridge.objects.length, 0, 'Rechtsziehen darf nicht abschließen');
  rightClick(s);
  assert.strictEqual(s.__bridge.objects.length, 1);
  assert.strictEqual(s.__bridge.objects[0].type, 'pit');
});

await test('Baustraße zeichnen: Rechtsklick und Leertaste schließen ab (ab zwei Punkten)', async function () {
  const a = await drawingScope('road', [[0, 0], [30, 0]]);
  rightClick(a);
  assert.strictEqual(a.__bridge.objects.length, 1);
  assert.strictEqual(a.__bridge.objects[0].type, 'road');
  const b = await drawingScope('road', [[0, 0], [30, 0]]);
  b.onKeyDown({ key: ' ', code: 'Space' });
  assert.strictEqual(b.__bridge.objects.length, 1);
});

await test('Zeichnen: zu wenige Punkte erzeugen nichts und melden es (Straße 2, Baugrube 3), die Punkte bleiben', async function () {
  const road = await drawingScope('road', [[0, 0]]);
  rightClick(road);
  assert.strictEqual(road.__bridge.objects.length, 0);
  assert.strictEqual(road.document.getElementById('status').textContent, road.T('msgMinTwo'));
  const pit = await drawingScope('pit', [[0, 0], [10, 0]]);
  pit.onKeyDown({ key: ' ', code: 'Space' });
  assert.strictEqual(pit.__bridge.objects.length, 0);
  assert.strictEqual(pit.document.getElementById('status').textContent, pit.T('msgMinThree'));
  setTerrainHit(pit, 10, 0, 10); pit.onCanvasClick({ clientX: 0, clientY: 0 });
  pit.onKeyDown({ key: ' ', code: 'Space' });
  assert.strictEqual(pit.__bridge.objects.length, 1, 'mit dem dritten Punkt klappt es');
});

await test('Rechtsklick ohne Zeichenwerkzeug tut nichts; Esc bricht das Zeichnen ab', async function () {
  const s = await scopeWithTerrain();
  s.initUI();
  rightClick(s);
  assert.strictEqual(s.__bridge.objects.length, 0);
  s.selectTool('pit');
  setTerrainHit(s, 0, 0, 0); s.onCanvasClick({ clientX: 0, clientY: 0 });
  s.onKeyDown({ key: 'Escape' });
  s.onKeyDown({ key: ' ', code: 'Space' });
  assert.strictEqual(s.__bridge.objects.length, 0);
});

await test('Baugrube: höchstens 32 Eckpunkte, danach Hinweis', async function () {
  const pts = [];
  for (let i = 0; i < 34; i++) pts.push([Math.cos(i) * 30, Math.sin(i) * 30]);
  const s = await drawingScope('pit', pts);
  s.onKeyDown({ key: ' ', code: 'Space' });
  assert.strictEqual(s.__bridge.objects[0].params.points.length, 32);
  assert.strictEqual(s.document.getElementById('status').textContent.indexOf('Baugrube angelegt') >= 0, true);
});

await test('Baugrube: Werkzeugfenster zeigt nur die Tiefe (Standard -5), der Editor zusätzlich die Höhe der Unterkante', async function () {
  const s = newScope();
  const tool = s.buildForm('pit', s.defaultPitParams(), function () {}, false).refs;
  assert.ok(tool.depth && !tool.bottomAbs);
  assert.strictEqual(tool.depth.num.value, -5);
  assert.strictEqual(tool.depth.input.min, -100);
  assert.strictEqual(tool.depth.input.max, 10);
});

function pitEditor(s) {
  const p = s.defaultPitParams();
  p.points = [{ x: -10, z: -10 }, { x: 10, z: -10 }, { x: 10, z: 10 }, { x: -10, z: 10 }];
  const obj = s.addObject('pit', 0, 0, p);
  const form = s.buildForm('pit', s.pitFormValues(obj), function () {}, true);
  s.setPitRanges(obj, form.refs);
  return { obj: obj, refs: form.refs };
}

await test('Baugrube: beide Regler überdecken dieselbe Spanne um das mittlere Gelände und zeigen denselben Wert', function () {
  const s = newScope();
  const e = pitEditor(s);
  const info = e.obj.group.userData.pit;
  assert.ok(Math.abs(e.refs.bottomAbs.input.min - (info.refAbs - 100)) < 0.06);
  assert.ok(Math.abs(e.refs.bottomAbs.input.max - (info.refAbs + 10)) < 0.06);
  assert.ok(Math.abs(e.refs.bottomAbs.num.value - (info.refAbs - 5)) < 0.01, 'Unterkante = Bezug - 5');
  assert.strictEqual(e.refs.depth.num.value, -5);
});

await test('Baugrube: Beschriftung, Hinweis und Mengenanzeige im Eigenschaftsfenster', function () {
  const s = newScope();
  const e = pitEditor(s);
  const el = s.document.createElement('div');
  s.renderPitInfo(e.obj, el);
  const txt = el.textContent;
  assert.ok(txt.indexOf(s.T('pitCut')) >= 0 && txt.indexOf(s.T('pitFill')) >= 0 && txt.indexOf('m³') > 0, txt);
  assert.ok(txt.indexOf(s.T('pitBottom')) >= 0 && txt.indexOf('m ü. NHN') > 0, txt);
  assert.ok(s.pitHintText(e.obj).indexOf('400 m²') >= 0, s.pitHintText(e.obj));
});

await test('Baugrube im Editor: Tiefe und Höhe der Unterkante sind verknüpft (Regler und Zahlenfeld)', async function () {
  const s = newScope();
  const p = s.defaultPitParams();
  p.points = [{ x: -10, z: -10 }, { x: 10, z: -10 }, { x: 10, z: 10 }, { x: -10, z: 10 }];
  const obj = s.addObject('pit', 0, 0, p);
  s.showObjectEditor(obj.id);
  const refs = s.getFormRefs();
  const ref = obj.group.userData.pit.refAbs;
  // Tiefe ändern -> Höhe folgt
  refs.depth.input.value = '-8';
  refs.depth.input.fire('input');
  assert.strictEqual(obj.params.depth, -8);
  assert.ok(Math.abs(refs.bottomAbs.num.value - (ref - 8)) < 0.01);
  // Höhe ändern -> Tiefe folgt
  refs.bottomAbs.input.value = String(ref - 2);
  refs.bottomAbs.input.fire('input');
  assert.ok(Math.abs(obj.params.depth - (-2)) < 0.01, 'Tiefe ' + obj.params.depth);
  assert.ok(Math.abs(refs.depth.num.value - (-2)) < 0.01);
  // Zahlenfeld der Höhe
  refs.bottomAbs.num.value = String(ref + 3);
  refs.bottomAbs.num.fire('change');
  assert.ok(Math.abs(obj.params.depth - 3) < 0.01, 'Aufschüttung +3: ' + obj.params.depth);
});

/* ---------- Punkt hinzufügen: Knopf im Editor, nächster Klick fügt ein ---------- */

function findButton(el, text) {
  if (el.textContent === text && el.addEventListener && el.className && el.className.indexOf('btn') >= 0) return el;
  const kids = el.children || [];
  for (let i = 0; i < kids.length; i++) { const f = findButton(kids[i], text); if (f) return f; }
  return null;
}

async function nodeEditorScope(type) {
  const s = await scopeWithTerrain();
  s.initUI();
  const params = type === 'pit' ? s.defaultPitParams() : s.defaultRoadParams();
  params.points = type === 'pit' ? [{ x: 0, z: 0 }, { x: 20, z: 0 }, { x: 20, z: 20 }, { x: 0, z: 20 }] : [{ x: 0, z: 0 }, { x: 40, z: 0 }];
  const obj = s.addObject(type, 10, 10, params);
  s.showObjectEditor(obj.id);
  return { s: s, obj: obj };
}

await test('Punkt hinzufügen: Knopf bei Straße und Baugrube, nächster Klick fügt den Punkt ein, einmalig', async function () {
  for (const type of ['road', 'pit']) {
    const k = await nodeEditorScope(type);
    const btn = findButton(k.s.document.getElementById('param-panel'), k.s.T('addNode'));
    assert.ok(btn, type + ': Knopf "Punkt hinzufügen" fehlt');
    const n0 = k.obj.params.points.length;
    btn.fire('click');
    assert.strictEqual(k.s.isAddNodeMode(), true);
    assert.strictEqual(k.s.document.getElementById('status').textContent, k.s.T('nodeAddHint'));
    setTerrainHit(k.s, 20, 0, -3);
    k.s.onCanvasClick({ clientX: 0, clientY: 0 });
    assert.strictEqual(k.obj.params.points.length, n0 + 1, type);
    assert.strictEqual(k.s.isAddNodeMode(), false, 'nur ein Punkt je Klick auf den Knopf');
    assert.strictEqual(k.s.document.getElementById('status').textContent, k.s.T('nodeAdded'));
  }
});

await test('Punkt hinzufügen: Esc bricht ab, andere Objekttypen haben den Knopf nicht', async function () {
  const k = await nodeEditorScope('road');
  findButton(k.s.document.getElementById('param-panel'), k.s.T('addNode')).fire('click');
  k.s.onKeyDown({ key: 'Escape' });
  assert.strictEqual(k.s.isAddNodeMode(), false);
  const s = await scopeWithTerrain();
  s.initUI();
  const c = s.addObject('container', 0, 0, s.defaultContainerParams());
  s.showObjectEditor(c.id);
  assert.strictEqual(findButton(s.document.getElementById('param-panel'), s.T('addNode')), null);
});

await test('Punkt hinzufügen: Klick im Modus trifft keinen vorhandenen Stützpunkt, sondern fügt ein', async function () {
  const k = await nodeEditorScope('road');
  findButton(k.s.document.getElementById('param-panel'), k.s.T('addNode')).fire('click');
  k.s.__bridge.raycaster._results = [{ point: { x: 20, y: 0, z: 1 }, object: { userData: { __nodeIndex: 0 } } }];
  k.s.onCanvasClick({ clientX: 0, clientY: 0 });
  assert.strictEqual(k.obj.params.points.length, 3);
});

await test('Stützpunkt verschieben: danach verschiebt ein Klick irgendwo nicht die ganze Straße (auch nicht nach "Verschieben")', async function () {
  const k = await nodeEditorScope('road');
  const before = JSON.parse(JSON.stringify(k.obj.params.points));
  // "Verschieben" (ganzes Objekt) war angeklickt, dann wird stattdessen ein Stützpunkt gewählt und versetzt
  findButton(k.s.document.getElementById('param-panel'), k.s.T('move')).fire('click');
  k.s.__bridge.raycaster._results = [{ point: { x: before[0].x, y: 0, z: before[0].z }, object: { userData: { __nodeIndex: 0 } } }];
  k.s.onCanvasClick({ clientX: 0, clientY: 0 });
  k.s.__bridge.raycaster._results = [{ point: { x: before[0].x + 5, y: 0, z: before[0].z + 7 }, object: { userData: {} } }];
  k.s.onCanvasClick({ clientX: 1, clientY: 1 });
  const afterNode = JSON.parse(JSON.stringify(k.obj.params.points));
  assert.ok(Math.abs(afterNode[0].x - (before[0].x + 5)) < 1e-6, 'Stützpunkt versetzt');
  assert.ok(Math.abs(afterNode[1].x - before[1].x) < 1e-6 && Math.abs(afterNode[1].z - before[1].z) < 1e-6, 'andere Punkte bleiben');
  // Klick irgendwo auf die Karte: die Straße bleibt stehen
  k.s.__bridge.raycaster._results = [{ point: { x: 80, y: 0, z: -60 }, object: { userData: {} } }];
  k.s.onCanvasClick({ clientX: 2, clientY: 2 });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(k.obj.params.points)), afterNode, 'die ganze Straße darf nicht mitwandern');
});

/* ---------- Baugrube: Böschungswinkel im Fenster ---------- */

await test('Baugrube: Winkel-Regler (20 bis 90°, Standard 90°) im Werkzeug- und im Editorfenster', function () {
  const s = newScope();
  const tool = s.buildForm('pit', s.defaultPitParams(), function () {}, false).refs;
  assert.ok(tool.angle, 'Regler fehlt im Werkzeugfenster');
  assert.strictEqual(tool.angle.input.min, 20);
  assert.strictEqual(tool.angle.input.max, 90);
  assert.strictEqual(tool.angle.num.value, 90);
  assert.strictEqual(tool.angle.out.textContent, '°');
  const e = pitEditor(s);
  assert.strictEqual(e.refs.angle.num.value, 90);
});

await test('Baugrube im Editor: Winkel ändern baut neu, Sohlfläche wird angezeigt, Tiefe und Höhe bleiben', async function () {
  const s = newScope();
  const p = s.defaultPitParams();
  p.points = [{ x: -10, z: -10 }, { x: 10, z: -10 }, { x: 10, z: 10 }, { x: -10, z: 10 }];
  const obj = s.addObject('pit', 0, 0, p);
  s.showObjectEditor(obj.id);
  const refs = s.getFormRefs();
  const bottomBefore = obj.group.userData.pit.bottomAbs;
  refs.angle.input.value = '45';
  refs.angle.input.fire('input');
  assert.strictEqual(obj.params.angle, 45);
  assert.ok(obj.group.userData.pit.floorArea < 400, 'Sohle muss kleiner sein');
  assert.strictEqual(obj.params.depth, -5, 'Tiefe bleibt');
  assert.strictEqual(obj.group.userData.pit.bottomAbs, bottomBefore);
  const el = s.document.createElement('div');
  s.renderPitInfo(obj, el);
  assert.ok(el.textContent.indexOf(s.T('pitFloor')) >= 0, el.textContent);
  // senkrecht: keine Sohlfläche im Hinweis
  obj.params.angle = 90; s.rebuildObject(obj); s.renderPitInfo(obj, el);
  assert.ok(el.textContent.indexOf(s.T('pitFloor')) < 0);
});

await test('Baugrube: zu schmal für den Winkel - Hinweis mit wirksamem Winkel', function () {
  const s = newScope();
  const p = s.defaultPitParams();
  p.points = [{ x: -3, z: -10 }, { x: 3, z: -10 }, { x: 3, z: 10 }, { x: -3, z: 10 }];
  p.angle = 45;
  const obj = s.addObject('pit', 0, 0, p);
  assert.strictEqual(obj.group.userData.pit.clamped, true);
  const el = s.document.createElement('div');
  s.renderPitInfo(obj, el);
  assert.ok(el.textContent.indexOf(s.T('pitClamped')) >= 0, el.textContent);
});

await test('Baugrube zu schmal: Winkelregler springt auf den Mindestwinkel und folgt der Tiefe', function () {
  const s = newScope();
  const p = s.defaultPitParams();
  p.points = [{ x: -3, z: -10 }, { x: 3, z: -10 }, { x: 3, z: 10 }, { x: -3, z: 10 }];
  p.angle = 45;
  const obj = s.addObject('pit', 0, 0, p);
  s.showObjectEditor(obj.id);
  const refs = s.getFormRefs();
  const info = obj.group.userData.pit;
  const min1 = refs.angle.num.value;
  assert.ok(info.clamped && min1 > 45 && min1 >= info.angleEff, 'Regler zeigt Mindestwinkel ' + min1 + ' statt 45');
  // flacher ziehen geht nicht: Regler springt zurück
  refs.angle.input.value = '30';
  refs.angle.input.fire('input');
  assert.strictEqual(refs.angle.num.value, min1);
  // flachere Grube (Tiefe -1 m): Mindestwinkel sinkt, Regler folgt
  refs.depth.input.value = '-1';
  refs.depth.input.fire('input');
  assert.ok(refs.angle.num.value < min1, 'Mindestwinkel muss mit der Tiefe sinken');
});

await test('Übersicht: Baustraße mit Abtrag/Auftrag, Baugrube mit Aushub/Aufschüttung als Unterzeile', function () {
  const s = newScope();
  const list = s.document.getElementById('overview-list');
  s.renderOverview();
  assert.strictEqual(list.textContent.indexOf(s.T('pitCut')), -1, 'ohne Objekte keine Unterzeilen');
  const road = roadObject(s, 5);
  const pp = s.defaultPitParams();
  pp.points = [{ x: 30, z: 30 }, { x: 50, z: 30 }, { x: 50, z: 50 }, { x: 30, z: 50 }];
  const pit1 = s.addObject('pit', 0, 0, pp);
  s.addObject('pit', 0, 0, JSON.parse(JSON.stringify(pp)));
  const groups = s.buildGroups();
  const gr = groups.filter(function (g) { return g.type === 'road'; })[0];
  const gp = groups.filter(function (g) { return g.type === 'pit'; })[0];
  const ew = road.group.userData.earthworks, pi = pit1.group.userData.pit;
  assert.ok(Math.abs(gr.cut - ew.cut) < 1e-9 && Math.abs(gr.fill - ew.fill) < 1e-9);
  assert.strictEqual(gp.ids.length, 2);
  assert.ok(Math.abs(gp.cut - 2 * pi.cut) < 1e-6 && Math.abs(gp.fill - 2 * pi.fill) < 1e-6);
  s.renderOverview();
  const txt = list.textContent;
  assert.ok(txt.indexOf(s.T('cut') + ' ' + s.formatVolume(gr.cut)) >= 0, txt);
  assert.ok(txt.indexOf(s.T('fill') + ' ' + s.formatVolume(gr.fill)) >= 0, txt);
  assert.ok(txt.indexOf(s.T('pitCut') + ' ' + s.formatVolume(gp.cut)) >= 0, txt);
  assert.ok(txt.indexOf(s.T('pitFill') + ' ' + s.formatVolume(gp.fill)) >= 0, txt);
});

await test('Karte (OpenStreetMap): Schalter nur mit Gelände, Hinweis zur IP-Adresse, Fehler bei unbekanntem Bezugssystem', async function () {
  const s = newScope();
  const g = function (id) { return s.document.getElementById(id); };
  s.renderOsmUi();
  assert.strictEqual(g('osm-toggle').disabled, true, 'ohne Gelände gesperrt');
  assert.ok(g('osm-status').textContent.indexOf('IP-Adresse') > 0, g('osm-status').textContent);
  assert.ok(g('osm-status').textContent.indexOf('tile.openstreetmap.org') > 0);
  const terr = s.terrainFromEmbedded({ n: 3, heights: new Array(9).fill(1000), scale: 100, zmin: 500, zmax: 510, width: 100, depth: 100 });
  s.buildTerrain(terr);
  s.updateTerrainInfo();
  assert.strictEqual(g('osm-toggle').disabled, false, 'mit Gelände freigegeben');
  // Bezugssystem, das sich nicht umrechnen lässt: kein Netzzugriff, Schalter springt zurück, Fehlertext
  terr.epsg = 12345;
  g('osm-toggle').checked = true;
  await s.onOsmToggle();
  assert.strictEqual(g('osm-toggle').checked, false);
  assert.ok(g('osm-status').textContent.indexOf('EPSG:12345') >= 0, g('osm-status').textContent);
  assert.strictEqual(g('osm-status').className.indexOf('err') > 0, true);
  // Sprache: Statustext folgt
  s.setOsmStatus('osmLoaded', 'ok', { n: 36 });
  assert.strictEqual(g('osm-status').textContent, 'Karte geladen (36 Kacheln).');
  s.__bridge.SETTINGS.language = 'en';
  s.renderOsmUi();
  assert.strictEqual(g('osm-status').textContent, 'Map loaded (36 tiles).');
});

/* Künstliches BEV-Raster (50001 x 50001, EPSG:3035); fromBlob liefert nur das angeforderte Fenster, Zellwert = Spalte + Zeile/1000 */
function fakeBevGeoTIFF(state) {
  const W = 50001, H = 50001;
  return {
    fromBlob: function () {
      return Promise.resolve({ getImage: function () {
        return Promise.resolve({
          getWidth: function () { return W; }, getHeight: function () { return H; },
          getOrigin: function () { return [4749999.5, 2850000.5, 0]; }, getResolution: function () { return [1, -1, 0]; },
          getFileDirectory: function () { return { GDAL_NODATA: '-9999' }; }, getGeoKeys: function () { return { ProjectedCSTypeGeoKey: 3035 }; },
          readRasters: function (o) {
            state.windows = (state.windows || []).concat([o && o.window]);
            const w = o && o.window ? o.window : [0, 0, W, H], cw = w[2] - w[0], ch = w[3] - w[1], band = new Float32Array(cw * ch);
            for (let r = 0; r < ch; r++) for (let c = 0; c < cw; c++) band[r * cw + c] = 150 + ((w[0] + c) % 100) / 10 + ((w[1] + r) % 100) / 10;
            return Promise.resolve([band]);
          }
        });
      } });
    }
  };
}

function bigBevFile(name) {
  const f = fakeFile(name, '');
  f.size = 7.9e9;
  f.arrayBuffer = function () { throw new Error('die ganze Datei darf nicht gelesen werden'); };
  return f;
}

await test('GeoTIFF riesig (BEV 7,9 GB): ohne Ort klare Meldung, das bestehende Gelände bleibt', async function () {
  const s = newScope();
  s.GeoTIFF = fakeBevGeoTIFF({});
  await s.handleDemFiles([bigBevFile('ALS_DTM_CRS3035.tif')]);
  const txt = s.document.getElementById('dem-status').textContent;
  assert.ok(txt.indexOf('ALS_DTM_CRS3035.tif') >= 0 && txt.indexOf('zu viel für den Browser') > 0 && txt.indexOf('Wähle zuerst auf der Karte einen Ort') > 0, txt);
  assert.strictEqual(s.document.getElementById('dem-status').className.indexOf('err') > 0, true);
  assert.strictEqual(vm.runInContext('TERRAIN', s), null);
});

await test('GeoTIFF riesig (BEV 7,9 GB): mit Pin wird nur der Ausschnitt gelesen und als Gelände gebaut', async function () {
  const s = newScope();
  s.initUI();
  const st = {};
  s.GeoTIFF = fakeBevGeoTIFF(st);
  s.smFlyTo(48.2082, 16.3725, 15);                        // Pin in Wien (liegt in der Kachel E4750000 N2800000)
  await s.handleDemFiles([bigBevFile('ALS_DTM_CRS3035.tif')]);
  const t = vm.runInContext('TERRAIN', s);
  assert.ok(t, s.document.getElementById('dem-status').textContent);
  assert.strictEqual(t.epsg, 3035);
  assert.ok(t.w >= 1000 && t.w <= 1004 && t.d >= 1000 && t.d <= 1004, t.w + ' x ' + t.d);
  assert.strictEqual(st.windows.length, 1);
  const w = st.windows[0];
  assert.ok(w[2] - w[0] <= 1004 && w[3] - w[1] <= 1004, 'nur ein Fenster von rund 1000 Pixeln');
  const status = s.document.getElementById('dem-status').textContent;
  assert.ok(status.indexOf('ALS_DTM_CRS3035.tif') >= 0 && status.indexOf(s.T('demWindow')) > 0 && s.document.getElementById('dem-status').className.indexOf('ok') > 0, status);
  assert.strictEqual(s.document.getElementById('startmap').style.display, 'none', 'die Startkarte verschwindet');
});

await test('GeoTIFF riesig: liegt der Pin nicht in der Datei, nennt die Meldung das; kleine Dateien laden wie bisher ganz', async function () {
  const s = newScope();
  s.initUI();
  s.GeoTIFF = fakeBevGeoTIFF({});
  s.smFlyTo(47.8095, 13.055, 15);                          // Salzburg: nicht in der Wiener Kachel
  await s.handleDemFiles([bigBevFile('ALS_DTM_CRS3035.tif')]);
  const txt = s.document.getElementById('dem-status').textContent;
  assert.ok(/liegt in keiner der Datei|in keiner/.test(txt) && s.document.getElementById('dem-status').className.indexOf('err') > 0, txt);
  const small = await scopeWithTerrain();
  assert.ok(vm.runInContext('TERRAIN', small), 'eine kleine Datei (Größe 0) geht den alten Weg über arrayBuffer');
});

function xyzFile(name, n) {
  let t = '';
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) t += (692000 + i + 0.5) + ' ' + (5336020 - j - 0.5) + ' ' + (520 + i + j) + '\n';
  const buf = new Uint8Array(Buffer.from(t, 'utf8')).buffer;
  return { name: name, size: buf.byteLength, arrayBuffer: function () { return Promise.resolve(buf); } };
}

await test('XYZ-Datei: ohne Bezugssystem vorgemerkt, mit gewähltem System oder eingetipptem EPSG-Code gelesen', async function () {
  const s = newScope();
  const g = function (id) { return s.document.getElementById(id); };
  s.buildXyzCrsOptions();
  assert.ok(g('xyz-crs').children.length >= 5, 'Auswahl fehlt');
  const first = g('xyz-crs').children[1];
  assert.strictEqual(first.value, '25832');
  // ohne Wahl: vorgemerkt, Hinweis, kein Gelände
  await s.handleDemFiles([xyzFile('hh.xyz', 4)]);
  assert.ok(g('dem-status').textContent.indexOf('Bezugssystem') >= 0, g('dem-status').textContent);
  assert.strictEqual(g('tile-label').textContent === 'Testkachel', false);
  // Wahl getroffen: die vorgemerkte Datei wird gelesen
  g('xyz-crs').value = '25832';
  s.onXyzCrsChanged();
  await new Promise(function (r) { setImmediate(r); });
  await new Promise(function (r) { setImmediate(r); });
  assert.ok(g('dem-status').className.indexOf('ok') > 0, g('dem-status').textContent);
  // manueller Code
  const s2 = newScope();
  const g2 = function (id) { return s2.document.getElementById(id); };
  s2.buildXyzCrsOptions();
  g2('xyz-crs').value = 'other';
  g2('xyz-epsg').value = '12';
  await s2.handleDemFiles([xyzFile('a.xyz', 4)]);
  assert.ok(g2('dem-status').textContent.indexOf('Ungültiger') >= 0, g2('dem-status').textContent);
  g2('xyz-epsg').value = '25832';
  assert.strictEqual(s2.getXyzEpsg(), 25832);
  await s2.handleDemFiles([xyzFile('a.xyz', 4)]);
  assert.ok(g2('dem-status').className.indexOf('ok') > 0, g2('dem-status').textContent);
});

await test('XYZ-Datei: ein anderes Bezugssystem nach dem Laden liest die Datei neu, das Gelände wandert; Zwischenschritte bleiben stabil', async function () {
  const s = newScope();
  const g = function (id) { return s.document.getElementById(id); };
  const tick = async function () { for (let i = 0; i < 6; i++) await new Promise(function (r) { setImmediate(r); }); };
  s.buildXyzCrsOptions();
  g('xyz-crs').value = '25832';
  await s.handleDemFiles([xyzFile('hh.xyz', 4)]);
  const t1 = vm.runInContext('TERRAIN', s);
  assert.strictEqual(t1.epsg, 25832);
  const g1 = vm.runInContext('crsToLonLat(TERRAIN.epsg, TERRAIN.originE, TERRAIN.originN)', s);
  g('xyz-crs').value = '25833';                     // zweite Wahl nach dem Laden
  s.onXyzCrsChanged();
  await tick();
  const t2 = vm.runInContext('TERRAIN', s);
  assert.strictEqual(t2.epsg, 25833, 'das Gelände liegt jetzt im neuen System');
  const g2 = vm.runInContext('crsToLonLat(TERRAIN.epsg, TERRAIN.originE, TERRAIN.originN)', s);
  assert.ok(Math.abs(g2.lon - g1.lon) > 1, 'der Ort wandert: ' + g1.lon.toFixed(2) + ' -> ' + g2.lon.toFixed(2));
  g('xyz-crs').value = '31468';                     // und noch einmal
  s.onXyzCrsChanged();
  await tick();
  assert.strictEqual(vm.runInContext('TERRAIN', s).epsg, 31468);
  g('xyz-crs').value = 'other'; g('xyz-epsg').value = '25832';
  s.onXyzCrsChanged();
  await tick();
  assert.strictEqual(vm.runInContext('TERRAIN', s).epsg, 25832, 'auch über das Eingabefeld');
  // ein GeoTIFF danach: keine XYZ-Neulesung mehr
  vm.runInContext('lastXyzLoad = null', s);
  g('xyz-crs').value = '25833';
  s.onXyzCrsChanged();
  await tick();
  assert.strictEqual(vm.runInContext('TERRAIN', s).epsg, 25832, 'ohne vorgemerkte XYZ-Dateien bleibt es');
});

await test('Mausrad: feste Schritte in Metern, nahe wie fern gleich lang (nicht prozentual)', async function () {
  const s = await scopeWithTerrain();
  const cam = s.__bridge.camera, ctl = s.__bridge.controls;
  const step = s.wheelStepMeters();
  const after = function (dist, dy) {
    const f = Math.pow(0.95, s.linearZoomSpeed(dist, dy, 0));
    return dy < 0 ? dist * f : dist / f;           // so wendet OrbitControls den Faktor an
  };
  [400, 100, 40].forEach(function (d) {
    assert.ok(Math.abs((d - after(d, -100)) - step) < 1e-9, 'heran um ' + step + ' m bei Abstand ' + d);
    assert.ok(Math.abs((after(d, 100) - d) - step) < 1e-9, 'weg um ' + step + ' m bei Abstand ' + d);
  });
  assert.ok(Math.abs((200 - after(200, -50)) - step / 2) < 1e-9, 'halber Ausschlag, halber Schritt');
  assert.ok(Math.abs((200 - after(200, -1000)) - step * 3) < 1e-9, 'höchstens drei Schritte auf einmal');
  assert.ok(after(ctl.minDistance + 1, -100) >= ctl.minDistance - 1e-9, 'nie über die kleinste Entfernung hinaus');
  // der Handler setzt zoomSpeed aus dem aktuellen Abstand
  ctl.target.set(0, 0, 0);
  cam.position.set(0, 0, 300);
  s.onCanvasWheel({ buttons: 0, deltaY: -100, deltaMode: 0 });
  assert.ok(Math.abs(300 * Math.pow(0.95, ctl.zoomSpeed) - (300 - step)) < 1e-9);
});

await test('XYZ-Datei: ein Code, der die Koordinaten weit außerhalb Europas legt, bekommt eine Warnung', async function () {
  const s = newScope();
  const g = function (id) { return s.document.getElementById(id); };
  s.buildXyzCrsOptions();
  g('xyz-crs').value = 'other';
  g('xyz-epsg').value = '32660';                  // UTM 60N: Zone am anderen Ende der Welt
  await s.handleDemFiles([xyzFile('x.xyz', 4)]);
  assert.ok(g('dem-status').textContent.indexOf('außerhalb Europas') >= 0, g('dem-status').textContent);
});

await test('Adressleiste: Platzhalter, Vorschläge, Wahl zeigt Links zu DGM und Gebäudemodell, Hinweis zur Übertragung', async function () {
  const s = newScope();
  const g = function (id) { return s.document.getElementById(id); };
  s.renderAddrUi();
  assert.strictEqual(g('addr-input').placeholder, 'Wo ist deine Baustelle?');
  assert.ok(g('addr-note').textContent.indexOf('photon.komoot.io') >= 0 && g('addr-note').textContent.indexOf('IP-Adresse') > 0);
  global.fetch = function () { return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ features: [
    { geometry: { coordinates: [11.57, 48.13] }, properties: { name: 'Marienplatz', postcode: '80331', city: 'München', state: 'Bayern', countrycode: 'DE' } },
    { geometry: { coordinates: [11.39, 47.26] }, properties: { street: 'Maria-Theresien-Straße', housenumber: '4', city: 'Innsbruck', state: 'Tirol', countrycode: 'AT' } }] }); } }); };
  const ul = g('addr-list');
  await s.runAddrSearch('Marienplatz');
  assert.strictEqual(ul.style.display, 'block');
  assert.ok(ul.textContent.indexOf('Marienplatz') >= 0 && ul.textContent.indexOf('80331 München, Bayern') > 0, ul.textContent);
  s.chooseAddr(0);
  const res = g('addr-result');
  assert.strictEqual(res.style.display, 'block');
  assert.ok(res.textContent.indexOf(s.T('addrDem')) >= 0 && res.textContent.indexOf(s.T('addrBldg')) >= 0, res.textContent);
  assert.ok(res.textContent.indexOf('geodaten.bayern.de') >= 0, res.textContent);
  assert.ok(res.textContent.indexOf('GeoTIFF') >= 0);
  assert.strictEqual(ul.style.display, 'none');
  // Österreich: Bund (BEV) und Hinweis zum Gebäudemodell
  await s.runAddrSearch('Maria');
  s.chooseAddr(1);
  assert.ok(g('addr-result').textContent.indexOf('www.bev.gv.at') >= 0, g('addr-result').textContent);
  assert.ok(g('addr-result').textContent.indexOf('kein landesweites') >= 0 || g('addr-result').textContent.indexOf('Gebäudemodell') > 0);
  // Englisch
  s.__bridge.SETTINGS.language = 'en';
  s.renderAddrUi();
  assert.strictEqual(g('addr-input').placeholder, 'Where is your construction site?');
  assert.ok(g('addr-result').textContent.indexOf('Terrain model') >= 0);
  // Fehler der Suche
  global.fetch = function () { return Promise.reject(new Error('offline')); };
  await s.runAddrSearch('Berlin');
  assert.ok(ul.textContent.indexOf('not reachable') >= 0, ul.textContent);
  delete global.fetch;
});

await test('Adressleiste: findet die Suche nichts Passendes, folgt die Nachfrage mit dem Namensstamm und der Hinweis steht über der Liste', async function () {
  const s = newScope();
  const g = function (id) { return s.document.getElementById(id); };
  const queries = [];
  global.fetch = function (url) {
    queries.push(decodeURIComponent(url.split('q=')[1].split('&')[0]));
    const features = queries.length === 1
      ? [{ geometry: { coordinates: [9.49, 49.2] }, properties: { name: 'Ohrntalbrücke', city: 'Öhringen', state: 'Baden-Württemberg', countrycode: 'DE' } }]
      : [{ geometry: { coordinates: [13.47, 48.78] }, properties: { name: 'Ohetal', city: 'Perlesreut', state: 'Bayern', countrycode: 'DE' } }];
    return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ features: features }); } });
  };
  await s.runAddrSearch('Ohetalbrücke');
  assert.deepStrictEqual(queries, ['Ohetalbrücke', 'Ohetal']);
  const txt = g('addr-list').textContent;
  assert.ok(txt.indexOf('Nichts zu „Ohetalbrücke“ gefunden') >= 0 && txt.indexOf('Perlesreut') > 0 && txt.indexOf('Ohrntal') < 0, txt);
  delete global.fetch;
});

await test('Adressleiste: Koordinaten - ein Vorschlag ohne Suche, beim Wählen kommen Ort und Bundesland von der Rückwärtssuche', async function () {
  const s = newScope();
  const g = function (id) { return s.document.getElementById(id); };
  let calls = 0;
  global.fetch = function (url) {
    calls++;
    return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ features: [{ properties: { countrycode: 'DE', state: 'Bayern', city: 'Perlesreut', postcode: '94157' } }] }); } });
  };
  g('addr-input').value = '48.7844, 13.4717';
  s.onAddrInput();
  assert.strictEqual(calls, 0, 'Koordinaten lösen keine Suche aus');
  assert.ok(g('addr-list').textContent.indexOf('48.78440, 13.47170') >= 0, g('addr-list').textContent);
  await s.chooseAddr(0);
  const res = g('addr-result').textContent;
  assert.strictEqual(calls, 1);
  assert.ok(res.indexOf('94157 Perlesreut Bayern') >= 0 && res.indexOf('geodaten.bayern.de') >= 0, res);
  // Rückwärtssuche scheitert: Hinweis statt Links
  global.fetch = function () { return Promise.reject(new Error('offline')); };
  g('addr-input').value = '48.7844, 13.4717';
  s.onAddrInput();
  await s.chooseAddr(0);
  assert.ok(g('addr-result').textContent.indexOf('konnte nicht ermittelt werden') >= 0, g('addr-result').textContent);
  delete global.fetch;
});

await test('Adressleiste: Enter wählt nichts aus einer veralteten Liste, solange die neue Eingabe noch nicht beantwortet ist', async function () {
  const s = newScope();
  const g = function (id) { return s.document.getElementById(id); };
  global.fetch = function () { return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ features: [
    { geometry: { coordinates: [13.47, 48.78] }, properties: { name: 'Ohetal', city: 'Perlesreut', state: 'Bayern', countrycode: 'DE' } }] }); } }); };
  await s.runAddrSearch('Ohetal');
  g('addr-input').value = 'Marienplatz';
  s.onAddrInput();                                   // neue Eingabe, Antwort steht aus (Entprellung)
  let prevented = false;
  s.onAddrKey({ key: 'Enter', preventDefault: function () { prevented = true; } });
  assert.strictEqual(g('addr-result').style.display === 'block', false, 'der alte Vorschlag darf nicht gewählt werden');
  assert.strictEqual(prevented, true);
  delete global.fetch;
});

/* ---------- IFC-Import ---------- */

/* Minimaler Ersatz für web-ifc: ein Quader 10 x 6 x 8 m (y oben), optional mit IfcMapConversion */
function fakeWebIfc(conv, opts) {
  opts = opts || {};
  const v = function (x) { return { value: x }; };
  const vec = function (a) { return { size: function () { return a.length; }, get: function (i) { return a[i]; } }; };
  const W = { IFCMAPCONVERSION: 1, IFCSIUNIT: 2, IFCPROJECT: 3 };
  const verts = new Float32Array(8 * 6), idx = new Uint32Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 2, 3, 7, 2, 7, 6, 1, 2, 6, 1, 6, 5, 0, 3, 7, 0, 7, 4]);
  [[0, 0, 0], [10, 0, 0], [10, 0, 8], [0, 0, 8], [0, 6, 0], [10, 6, 0], [10, 6, 8], [0, 6, 8]].forEach(function (p, i) { verts.set([p[0], p[1], p[2], 0, 1, 0], i * 6); });
  W.IfcAPI = function () {
    this.SetWasmPath = function () {};
    this.Init = function () { return opts.initFails ? Promise.reject(new Error('ifcLibFail')) : Promise.resolve(); };
    this.OpenModel = function () { return 1; };
    this.CloseModel = function () { W.closed = (W.closed || 0) + 1; };
    this.GetLineIDsWithType = function (id, t) {
      if (opts.ids && opts.ids[t]) return vec(opts.ids[t]);                 // eigene Zeilen eines Tests
      return vec(t === 1 && conv ? [10] : t === 2 ? [30] : []);
    };
    this.GetLine = function (id, eid) {
      if (opts.lines && opts.lines[eid]) return opts.lines[eid];
      if (eid === 10) return { Eastings: v(conv.E), Northings: v(conv.N), OrthogonalHeight: v(conv.H), XAxisAbscissa: v(1), XAxisOrdinate: v(0), Scale: v(1), TargetCRS: v(20) };
      if (eid === 20) return { Name: v('EPSG:' + conv.epsg), Description: null, MapUnit: null };
      return { UnitType: v('LENGTHUNIT'), Prefix: null, Name: v('METRE') };
    };
    this.StreamAllMeshes = function (id, cb) {
      const pg = { geometryExpressID: 5, color: { x: 0.8, y: 0.6, z: 0.5, w: 1 }, flatTransformation: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] };
      cb({ geometries: vec(opts.empty ? [] : [pg]) });
    };
    this.GetGeometry = function () { return { GetVertexData: function () { return 0; }, GetVertexDataSize: function () { return verts.length; }, GetIndexData: function () { return 0; }, GetIndexDataSize: function () { return idx.length; } }; };
    this.GetVertexArray = function () { return verts; };
    this.GetIndexArray = function () { return idx; };
    this.GetCoordinationMatrix = function () { const c = opts.coord || [0, 0, 0]; return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, c[0], c[1], c[2], 1]; };
  };
  return W;
}

function ifcScope(conv, opts) {
  const s = newScope();
  s.setTimeout = function (fn) { fn(); return 0; };          // die kurze Pause vor dem Lesen entfällt im Test
  s.WebIFC = fakeWebIfc(conv, opts);
  // Gelände wie im Demo-Fall: 100 x 100 m, Mitte bei E 692500 / N 5336500, EPSG:25832
  const terr = s.terrainFromEmbedded({ n: 5, heights: new Array(25).fill(1000), scale: 100, zmin: 500, zmax: 520, width: 100, depth: 100, originE: 692500, originN: 5336500, epsg: 25832 });
  s.buildTerrain(terr);
  s.updateTerrainInfo();
  return s;
}
const ifcFile = function (name, size) { return { name: name, size: size || 1000, arrayBuffer: function () { return Promise.resolve(new ArrayBuffer(8)); } }; };
const ifcModelOf = function (s) { return vm.runInContext('ifcModel', s); };
const ifcPickOf = function (s) { return vm.runInContext('ifcPick', s); };

await test('IFC-Import: gleiches Bezugssystem - automatisch platziert, Lage aus der IfcMapConversion', async function () {
  const s = ifcScope({ E: 692480, N: 5336520, H: 501, epsg: 25832 });
  const g = function (id) { return s.document.getElementById(id); };
  await s.handleIfcFile(ifcFile('haus.ifc'));
  const m = ifcModelOf(s);
  assert.ok(m, 'Modell fehlt');
  assert.strictEqual(m.how, 'auto');
  assert.ok(g('ifc-status').textContent.indexOf('Automatisch platziert (EPSG:25832)') === 0, g('ifc-status').textContent);
  assert.strictEqual(g('ifc-tools').style.display, 'block');
  // Ursprung des Bauwerks (Gruppe) bei E 692480 -> x = -20, N 5336520 -> z = -20, Höhe 501 - zmin(500) = 1
  assert.ok(Math.abs(m.group.position.x - (-20)) < 1e-6 && Math.abs(m.group.position.z - (-20)) < 1e-6 && Math.abs(m.group.position.y - 1) < 1e-6,
            JSON.stringify(m.group.position));
  assert.strictEqual(ifcPickOf(s), null, 'keine manuelle Platzierung');
  assert.strictEqual(m.group.children.length, 1, 'ein Netz je Farbe');
  assert.strictEqual(s.WebIFC.closed || 0, 0, 'Modell bleibt für die Bauteilangaben offen');
  // Höhenversatz
  s.applyIfcDz('2.5');
  assert.ok(Math.abs(m.group.position.y - 3.5) < 1e-6);
  s.removeIfc();
  assert.strictEqual(s.WebIFC.closed, 1, 'beim Entfernen geschlossen');
});

await test('IFC-Import: Längeneinheit des Projekts aus IfcProject.UnitsInContext, nicht aus der ersten IfcSIUnit', async function () {
  const v = function (x) { return { value: x }; };
  const si = function (type, prefix, name) { return { UnitType: v(type), Prefix: prefix ? v(prefix) : null, Name: v(name) }; };
  const read = async function (project, assigned) {
    const lines = {
      31: si('LENGTHUNIT', 'DECI', 'METRE'),              // falsche Einheit an erster Stelle
      32: si('PLANEANGLEUNIT', null, 'RADIAN'),
      33: si('LENGTHUNIT', null, 'METRE'),
      34: si('LENGTHUNIT', 'MILLI', 'METRE'),
      35: { UnitType: v('LENGTHUNIT'), Name: v('FOOT'), ConversionFactor: v(36) },
      40: project,
      41: { Units: [v(32), v(assigned)] }
    };
    const s = ifcScope({ E: 692480, N: 5336520, H: 501, epsg: 25832 }, { ids: { 2: [31, 32, 33, 34], 3: [40] }, lines: lines });
    await s.handleIfcFile(ifcFile('haus.ifc'));
    return ifcModelOf(s);
  };
  const m = await read({ UnitsInContext: v(41) }, 33);
  assert.strictEqual(m.georef.projUnit, 1);
  assert.strictEqual(m.group.scale.x, 1, 'mit der Dezimeter-Einheit wäre das Bauwerk zehnfach zu groß');
  assert.strictEqual((await read({ UnitsInContext: v(41) }, 34)).georef.projUnit, 0.001);
  // Rückfall auf die erste IfcSIUnit: keine Einheiten am Projekt, keine Längeneinheit darin, oder Fuß (wird nicht ausgewertet)
  assert.strictEqual((await read({ UnitsInContext: null }, 33)).georef.projUnit, 0.1);
  assert.strictEqual((await read({ UnitsInContext: v(41) }, 32)).georef.projUnit, 0.1);
  assert.strictEqual((await read({ UnitsInContext: v(41) }, 35)).georef.projUnit, 0.1);
});

await test('IFC-Import: anderes Bezugssystem oder keine Georeferenz - Platzierung von Hand mit vier Schritten', async function () {
  const s = ifcScope({ E: 500000, N: 5400000, H: 501, epsg: 25833 });
  const g = function (id) { return s.document.getElementById(id); };
  await s.handleIfcFile(ifcFile('haus.ifc'));
  let pick = ifcPickOf(s);
  assert.ok(pick && pick.step === 0, 'manueller Modus');
  assert.ok(g('ifc-status').textContent.indexOf('EPSG:25833') >= 0 && g('ifc-status').textContent.indexOf('EPSG:25832') >= 0, g('ifc-status').textContent);
  assert.strictEqual(g('ifc-hint').style.display, 'block');
  assert.ok(g('ifc-hint').textContent.indexOf('Punkt A am Bauwerk') >= 0);
  // Reihenfolge abwechselnd: A Bauwerk, A Gelände, B Bauwerk, B Gelände
  const hintAt = function (n) { s.showIfcHint(n); return g('ifc-hint').textContent; };
  assert.ok(hintAt(1).indexOf('im Gelände den Punkt') >= 0 && hintAt(1).indexOf('A am Bauwerk') >= 0);
  assert.ok(hintAt(2).indexOf('Punkt B am Bauwerk') >= 0);
  assert.ok(hintAt(3).indexOf('Gelände den Punkt') >= 0 && hintAt(3).indexOf('B entspricht') >= 0);
  s.showIfcHint(0);
  // vier Punkte (Bauwerkskoordinaten, Gelände) wie nach vier Klicks; Gelände ist eben bei Höhe 10 m über zmin
  pick.p = [{ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }];
  pick.t = [{ x: -20, y: 0, z: 10 }, { x: -20, y: 0, z: 0 }];     // Richtung +x des Bauwerks zeigt nach Norden (-z)
  pick.markers = []; pick.step = 4;
  s.finishIfcPick();
  const m = ifcModelOf(s);
  assert.strictEqual(m.how, 'manual');
  assert.strictEqual(ifcPickOf(s), null);
  assert.strictEqual(g('ifc-hint').style.display, 'none');
  assert.ok(Math.abs(m.placement.rotY - Math.PI / 2) < 1e-9, 'um 90 Grad gedreht');
  assert.ok(g('ifc-status').textContent.indexOf('Abstand A–B: Bauwerk 10.00 m, Gelände 10.00 m') >= 0, g('ifc-status').textContent);
  assert.ok(g('ifc-status').textContent.indexOf('weichen um') < 0, 'Abstände passen: keine Abstandswarnung');
  assert.ok(g('ifc-status').textContent.indexOf('Warnung: Das Bauwerk liegt in EPSG:25833, das Gelände in EPSG:25832') > 0, g('ifc-status').textContent);
  assert.strictEqual(g('ifc-status').className, 'file-status err', 'anderes Bezugssystem: bleibt rot');
  // Abstände weichen stark ab: Warnung
  s.startIfcManual(false);
  const p2 = ifcPickOf(s);
  p2.p = [{ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }]; p2.t = [{ x: 0, y: 0, z: 0 }, { x: 25, y: 0, z: 0 }]; p2.markers = []; p2.step = 4;
  s.finishIfcPick();
  assert.ok(g('ifc-status').textContent.indexOf('weichen um 15.00 m ab') >= 0 && g('ifc-status').className.indexOf('err') > 0, g('ifc-status').textContent);
});

await test('IFC verschieben mit drei Achsen: Ziehen am Pfeil verschiebt nur entlang dieser Achse, Felder und Esc', async function () {
  const s = ifcScope({ E: 692480, N: 5336520, H: 501, epsg: 25832 });
  const g = function (id) { return s.document.getElementById(id); };
  s.initUI();
  await s.handleIfcFile(ifcFile('haus.ifc'));
  const m = ifcModelOf(s);
  const p0 = { x: m.group.position.x, y: m.group.position.y, z: m.group.position.z };
  s.startIfcMove();
  assert.strictEqual(g('ifc-move-btn').className, 'btn-block accent');
  assert.strictEqual(g('ifc-hint').style.display, 'block');
  assert.strictEqual(g('gizmo-labels').children.length, 4);
  const rc = vm.runInContext('raycaster', s);
  const drag = function (axis, from, to) {
    rc._results = [{ object: { userData: { ifcAxis: axis } } }];
    rc.ray = from;
    assert.strictEqual(s.startIfcGizmoDrag({ button: 0, clientX: 1, clientY: 1 }), true);
    rc.ray = to;
    s.onIfcGizmoMove({ clientX: 2, clientY: 2, buttons: 1 });
    s.endIfcGizmoDrag();
  };
  const c = s.ifcCenterWorld(m);
  // senkrecht von oben auf die Achse Ost bzw. Nord
  const down = function (dx, dz) { return { origin: { x: c.x + dx, y: c.y + 100, z: c.z + dz }, direction: { x: 0, y: -1, z: 0 } }; };
  drag('e', down(2, 0), down(9, 3));
  assert.deepStrictEqual([m.de, m.dn, m.dz], [7, 0, 0]);
  assert.ok(Math.abs(m.group.position.x - p0.x - 7) < 1e-9 && m.group.position.z === p0.z);
  assert.strictEqual(g('ifc-dx').value, '7');
  const c2 = s.ifcCenterWorld(m);
  const downN = function (dz) { return { origin: { x: c2.x, y: c2.y + 100, z: c2.z + dz }, direction: { x: 0, y: -1, z: 0 } }; };
  drag('n', downN(0), downN(-4));                                // nach Norden = -z
  assert.deepStrictEqual([m.de, m.dn, m.dz], [7, 4, 0]);
  assert.ok(Math.abs(m.group.position.z - p0.z + 4) < 1e-9);
  const c3 = s.ifcCenterWorld(m);
  const side = function (dy) { return { origin: { x: c3.x, y: c3.y + dy, z: c3.z + 100 }, direction: { x: 0, y: 0, z: -1 } }; };
  drag('z', side(1), side(3.5));
  assert.deepStrictEqual([m.de, m.dn, m.dz], [7, 4, 2.5]);
  assert.ok(Math.abs(m.group.position.y - p0.y - 2.5) < 1e-9);
  // entlang der Höhenachse geblickt: keine Bewegung
  drag('z', down(0, 0), down(5, 5));
  assert.strictEqual(m.dz, 2.5);
  // Feld und Esc
  s.applyIfcShift('e', '-1.5');
  assert.ok(Math.abs(m.group.position.x - p0.x + 1.5) < 1e-9);
  s.onKeyDown({ key: 'Escape', target: {} });
  assert.strictEqual(g('ifc-move-btn').className, 'btn-block');
  assert.strictEqual(g('gizmo-labels').children.length, 0);
  rc._results = [{ object: { userData: { ifcAxis: 'e' } } }];
  assert.strictEqual(s.startIfcGizmoDrag({ button: 0 }), false, 'ohne Pfeile kein Ziehen');
  // Vier Punkte abbrechen behält die Verschiebung
  s.startIfcManual(false);
  s.onKeyDown({ key: 'Escape', target: {} });
  assert.ok(Math.abs(m.group.position.x - p0.x + 1.5) < 1e-9 && m.dn === 4 && m.dz === 2.5);
});

await test('Datenfenster: Gelände, Gebäude und Bauwerk haben je „Entfernen“; beim Gelände fragt es nach, Abbrechen behält alles', async function () {
  const html = require('fs').readFileSync(require('path').join(__dirname, '../src/shell_head.html'), 'utf8');
  ['dem-clear', 'gml-clear', 'ifc-clear'].forEach(function (id) { assert.ok(new RegExp('class="act" id="' + id + '" data-i18n="remove"').test(html), id); });
  const s = await scopeWithTerrain();
  s.initUI();
  const g = function (id) { return s.document.getElementById(id); };
  g('dem-clear').fire('click');
  assert.strictEqual(g('confirm-wrap').style.display, 'flex');
  assert.ok(g('confirm-text').textContent.indexOf('Gelände entfernen?') === 0);
  s.onKeyDown({ key: 'Escape', target: {} });
  assert.strictEqual(g('confirm-wrap').style.display, 'none');
  assert.ok(s.hasTerrain());
  const leer = newScope();
  leer.initUI();
  leer.document.getElementById('dem-clear').fire('click');
  assert.ok(leer.document.getElementById('confirm-wrap').style.display !== 'flex');
  assert.strictEqual(leer.document.getElementById('status').textContent, leer.T('msgNoDem'));
});

await test('BeTA2007-Gitter: Umrechnung DHDN nach UTM stimmt mit PROJ überein, ohne Gitter gilt die Helmert-Umrechnung (wenige Meter daneben)', async function () {
  const s = newScope();
  const helmert = s.crsTransformer(31468, 25832)(4468000, 5333000);
  assert.strictEqual(JSON.stringify(s.crsAccuracy(31468, 25832)), JSON.stringify({ m: 3, grid: false }));
  if (typeof global.Worker === 'undefined') global.Worker = class {};
  s.GeoTIFF = require('../lib/geotiff.js');
  const file = require('fs').readFileSync(require('path').join(__dirname, '../lib/de_adv_BETA2007.tif'));
  await s.parseBeta2007(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
  assert.strictEqual(JSON.stringify(s.crsAccuracy(31468, 25832)), JSON.stringify({ m: 1, grid: true }));
  assert.strictEqual(s.crsAccuracy(31467, 31468), null);
  assert.strictEqual(s.crsAccuracy(25832, 25833), null);
  // Vergleichswerte: PROJ (cct: tmerc invers, hgridshift mit de_adv_BETA2007.tif, UTM 32)
  const p = s.crsTransformer(31468, 25832)(4468000, 5333000);
  assert.ok(Math.hypot(p.e - 691104.0987, p.n - 5334410.7909) < 0.002, p.e + ' ' + p.n);
  [[31467, 3500000, 5600000, 499925.4934, 5598199.7808], [31466, 2570000, 5650000, 359340.2349, 5649617.8281]].forEach(function (c) {
    const q = s.crsTransformer(c[0], 25832)(c[1], c[2]);
    assert.ok(Math.hypot(q.e - c[3], q.n - c[4]) < 0.002, c[0] + ': ' + q.e + ' ' + q.n);
  });
  const back = s.crsTransformer(25832, 31468)(p.e, p.n);
  assert.ok(Math.hypot(back.e - 4468000, back.n - 5333000) < 0.01);
  const diff = Math.hypot(p.e - helmert.e, p.n - helmert.n);
  assert.ok(diff > 0.05 && diff < 6, 'Helmert weicht um ' + diff + ' m ab');
});

await test('Bezugssystem wählen: Gelände und Gebäude werden umgerechnet und wieder zurück; Bausteine nur nach Rückfrage', async function () {
  const s = newScope();
  s.initUI();
  const g = function (id) { return s.document.getElementById(id); };
  let xyz = '';
  for (let r = 0; r < 41; r++) for (let c = 0; c < 41; c++) xyz += (691800 + c * 10) + ' ' + (5336200 - r * 10) + ' ' + (500 + c * 0.1) + '\n';
  g('xyz-crs').value = '25832';
  const bytes = new TextEncoder().encode(xyz);
  await s.handleDemFiles([{ name: 'dgm.xyz', size: bytes.length, arrayBuffer: function () { return Promise.resolve(bytes.slice().buffer); } }]);
  const t = function () { return vm.runInContext('TERRAIN', s); };
  assert.strictEqual(t().epsg, 25832);
  const gml = '<CityModel xmlns:gml="http://www.opengis.net/gml"><gml:Polygon><gml:exterior><gml:LinearRing>' +
    '<gml:posList>691995 5335995 500 692005 5335995 500 692005 5336005 500 691995 5336005 500</gml:posList>' +
    '</gml:LinearRing></gml:exterior></gml:Polygon></CityModel>';
  await s.handleGmlFiles([fakeFile('g.gml', gml)]);
  const rings = function () { return vm.runInContext('lastGmlRings', s); };
  assert.strictEqual(rings()[0][0], 691995);
  g('project-crs').value = '31468';
  await s.onProjectCrsChange();
  assert.strictEqual(t().epsg, 31468);
  assert.strictEqual(t().srcEpsg, 25832);
  const exp = s.crsTransformer(25832, 31468)(691995, 5335995);
  assert.ok(Math.abs(rings()[0][0] - exp.e) < 1e-6 && Math.abs(rings()[0][1] - exp.n) < 1e-6);
  assert.ok(g('project-crs-note').textContent.indexOf('EPSG:25832 → 31468') === 0 && g('project-crs-note').textContent.indexOf('etwa 3 m') > 0, g('project-crs-note').textContent);
  assert.strictEqual(g('project-crs-note').className, 'file-status err', 'Genauigkeitswarnung in Rot');
  // mit Baustein: erst die Rückfrage, Abbrechen behält alles
  s.placeObject ? null : null;
  vm.runInContext("objects.push({ id: 99, type: 'x', group: new THREE.Group() })", s);
  g('project-crs').value = '';
  s.onProjectCrsChange();
  assert.strictEqual(g('confirm-wrap').style.display, 'flex');
  s.onKeyDown({ key: 'Escape', target: {} });
  assert.strictEqual(t().epsg, 31468);
  assert.strictEqual(g('project-crs').value, '31468');
  vm.runInContext('objects.length = 0', s);
  g('project-crs').value = '';
  await s.onProjectCrsChange();
  assert.strictEqual(t().epsg, 25832);
  assert.strictEqual(rings()[0][0], 691995);
  assert.strictEqual(g('project-crs-note').textContent, '');
  // Bauwerk in Gauß-Krüger auf UTM-Gelände: Meldung mit Vorschlag, nach dem Wechsel setzt es sich selbst
  s.setTimeout = function (fn) { fn(); return 0; };
  const mid = s.crsTransformer(25832, 31468)(692000, 5336000);
  s.WebIFC = fakeWebIfc({ E: mid.e, N: mid.n, H: 501, epsg: 31468 });
  await s.handleIfcFile(ifcFile('gk.ifc'));
  assert.ok(ifcPickOf(s), 'erst von Hand');
  assert.ok(g('ifc-status').textContent.indexOf('Warnung: Das Bauwerk liegt in EPSG:31468') === 0 && g('ifc-status').textContent.indexOf('EPSG:31468 wählen') > 0, g('ifc-status').textContent);
  assert.strictEqual(g('ifc-status').className, 'file-status err');
  s.startIfcMove();                                           // Umsteigen aufs Schieben: die Warnung bleibt
  assert.ok(g('ifc-status').textContent.indexOf('Warnung:') > 0 && g('ifc-status').className === 'file-status err', g('ifc-status').textContent);
  s.stopIfcMove(true);
  // Gauß-Krüger-Koordinaten ohne Georeferenz auf UTM-Gelände: auch eine Warnung
  s.removeIfc();
  s.WebIFC = fakeWebIfc(null, { coord: [-mid.e, -501, mid.n] });
  vm.runInContext('webIfcApi = null; webIfcLoading = null', s);
  await s.handleIfcFile(ifcFile('roh.ifc'));
  assert.ok(g('ifc-status').textContent.indexOf('sehen nach EPSG:31468 aus') > 0 && g('ifc-status').className === 'file-status err', g('ifc-status').textContent);
  s.removeIfc();
  s.WebIFC = fakeWebIfc({ E: mid.e, N: mid.n, H: 501, epsg: 31468 });
  vm.runInContext('webIfcApi = null; webIfcLoading = null', s);
  await s.handleIfcFile(ifcFile('gk.ifc'));
  g('project-crs').value = '31468';
  await s.onProjectCrsChange();
  assert.strictEqual(ifcPickOf(s), null);
  assert.strictEqual(ifcModelOf(s).how, 'auto');
  assert.ok(Math.abs(ifcModelOf(s).group.position.x - (mid.e - t().originE)) < 1e-6);
  s.removeIfc();
  // ohne Georeferenz, aber mit Gauß-Krüger-Koordinaten in der Datei: direkt platziert
  s.WebIFC = fakeWebIfc(null, { coord: [-mid.e, -501, mid.n] });
  vm.runInContext('webIfcApi = null; webIfcLoading = null', s);
  await s.handleIfcFile(ifcFile('roh.ifc'));
  assert.strictEqual(ifcPickOf(s), null, g('ifc-status').textContent);
  assert.ok(g('ifc-status').textContent.indexOf('Koordinaten der Datei passen') > 0, g('ifc-status').textContent);
  s.removeIfc();
  g('project-crs').value = '';
  await s.onProjectCrsChange();
  g('project-crs').value = 'other';
  g('project-epsg').value = '4326';
  await s.onProjectCrsChange();
  assert.strictEqual(t().epsg, 25832);
  assert.ok(g('project-crs-note').textContent.indexOf('4326') > 0);
});

await test('IFC-Import: mehrere Dateien zugleich werden ein Bauwerk; eine kaputte wird genannt und weggelassen', async function () {
  const s = ifcScope({ E: 692480, N: 5336520, H: 501, epsg: 25832 });
  const g = function (id) { return s.document.getElementById(id); };
  await s.handleIfcFile([ifcFile('ueberbau.ifc'), ifcFile('unterbau.ifc')]);
  const m = ifcModelOf(s);
  assert.strictEqual(m.group.children.length, 2);
  assert.strictEqual(m.how, 'auto');
  assert.ok(g('ifc-status').textContent.indexOf('2 IFC-Dateien') > 0, g('ifc-status').textContent);
  assert.ok(Math.abs(m.group.position.x + m.group.children[0].position.x - (692480 - 692500)) < 1e-6, 'wie eine einzelne Datei');
  const bad = { name: 'kaputt.ifc', size: 5, arrayBuffer: function () { return Promise.reject(new Error('x')); } };
  await s.handleIfcFile([ifcFile('a.ifc'), bad]);
  assert.ok(g('ifc-status').textContent.indexOf('Weggelassen: kaputt.ifc (nicht lesbar)') > 0 && g('ifc-status').className === 'file-status err', g('ifc-status').textContent);
  assert.ok(ifcModelOf(s));
  await s.handleIfcFile([ifcFile('g1.ifc', 200e6), ifcFile('g2.ifc', 200e6)]);
  assert.ok(g('ifc-status').textContent.indexOf('400 MB') > 0, g('ifc-status').textContent);
});

await test('Ansicht verschieben: die Geschwindigkeit richtet sich nach dem Punkt unter dem Mauszeiger, nicht nach dem nahen Drehzentrum', async function () {
  const s = await scopeWithTerrain();
  s.initUI();
  const cam = s.__bridge.camera || vm.runInContext("camera", s), ctr = vm.runInContext("controls", s);
  cam.position.set(0, 10, 12); ctr.target.set(0, 10, 0); ctr.minDistance = 1;
  setTerrainHit(s, 0, 10, 12 - 4);                              // etwas in 4 m Entfernung unter dem Zeiger
  s.adjustPanSpeed({ button: 2, clientX: 5, clientY: 5 });
  assert.ok(Math.abs(ctr.panSpeed - 2.2 * 4 / 12) < 1e-9, String(ctr.panSpeed));
  ctr.target.set(0, 10, 11);                                    // Drehzentrum 1 m vor der Kamera
  s.adjustPanSpeed({ button: 1, clientX: 5, clientY: 5 });
  assert.ok(Math.abs(ctr.panSpeed - 2.2 * 4) < 1e-9, 'vierfach: ' + ctr.panSpeed);
  s.adjustPanSpeed({ button: 0, shiftKey: true, clientX: 5, clientY: 5 });
  assert.ok(ctr.panSpeed > 2.2, 'Umschalt+links verschiebt auch');
  s.adjustPanSpeed({ button: 0, clientX: 5, clientY: 5 });
  assert.strictEqual(ctr.panSpeed, 2.2, 'Drehen: unverändert');
});

await test('Mausrad: am Ende des Zoomwegs wandert das Drehzentrum mit, bis kurz vor das, was in der Bildmitte steht', async function () {
  const s = await scopeWithTerrain();
  s.initUI();
  const cam = vm.runInContext('camera', s), ctr = vm.runInContext('controls', s);
  ctr.minDistance = 12;
  const set = function () { cam.position.set(0, 50, 12); ctr.target.set(0, 50, 0); };
  const dist = function () { return cam.position.distanceTo(ctr.target); };
  const step = s.wheelStepMeters();
  set(); setTerrainHit(s, 0, 50, -300);                       // weit entfernt
  s.pushZoomTarget(-100, 0);
  assert.ok(Math.abs(dist() - (12 + step)) < 1e-9 && ctr.target.x === 0 && ctr.target.y === 50 && ctr.target.z < 0, dist() + ' ' + step);
  set(); setTerrainHit(s, 0, 50, 8);                          // 4 m vor der Kamera: nur noch 1 m
  s.pushZoomTarget(-100, 0);
  assert.ok(Math.abs(dist() - 13) < 1e-9, String(dist()));
  set(); s.pushZoomTarget(100, 0);                            // wegzoomen: nichts
  assert.strictEqual(dist(), 12);
  cam.position.set(0, 50, 500); ctr.target.set(0, 50, 0); s.pushZoomTarget(-100, 0);
  assert.strictEqual(ctr.target.z, 0, 'mit Platz bleibt das Zentrum');
});

await test('IFC dazulegen: eine zweite Auswahl kommt zum Bauwerk, das Vorhandene bleibt auch nach Schieben und Drehen stehen; doppelte Datei wird genannt', async function () {
  const s = ifcScope({ E: 692480, N: 5336520, H: 501, epsg: 25832 });
  const g = function (id) { return s.document.getElementById(id); };
  await s.handleIfcFile(ifcFile('unterbau.ifc'));
  const first = ifcModelOf(s);
  const partGroup = first.group;
  s.applyIfcShift('e', '7'); s.applyIfcShift('n', '-3'); s.applyIfcShift('z', '2'); s.applyIfcShift('r', '40');
  // Weltlage eines Eckpunkts der ersten Datei vor dem Dazulegen
  const world = function (m, p) {
    const a = m.group.rotation.y, c = Math.cos(a), sn = Math.sin(a), k = m.group.scale.x;
    return [m.group.position.x + k * (c * p[0] + sn * p[2]), m.group.position.y + k * p[1], m.group.position.z + k * (-sn * p[0] + c * p[2])];
  };
  const before = world(first, [3, 1, 2]);
  s.WebIFC = fakeWebIfc({ E: 692560, N: 5336520, H: 501, epsg: 25832 });
  vm.runInContext('webIfcApi = null; webIfcLoading = null', s);
  await s.handleIfcFile(ifcFile('ueberbau.ifc'));
  const m = ifcModelOf(s);
  assert.strictEqual(m.parts.length, 2);
  assert.strictEqual(m.parts[0].group, partGroup, 'dieselbe erste Datei, nicht neu gelesen');
  assert.strictEqual(m.group.children.length, 2);
  assert.ok(m.rot === 40, 'Drehung bleibt: ' + m.rot);
  const after = world(m, [3, 1, 2]);
  after.forEach(function (v, i) { assert.ok(Math.abs(v - before[i]) < 1e-6, i + ': ' + before + ' / ' + after); });
  assert.ok(g('ifc-status').textContent.indexOf('1 Datei(en) dazugeladen') === 0 && g('ifc-status').textContent.indexOf('2 IFC-Dateien') > 0, g('ifc-status').textContent);
  await s.handleIfcFile(ifcFile('ueberbau.ifc'));
  assert.strictEqual(ifcModelOf(s).parts.length, 2);
  assert.ok(g('ifc-status').textContent.indexOf('ueberbau.ifc (schon geladen)') > 0, g('ifc-status').textContent);
  s.removeIfc();
  assert.strictEqual(ifcModelOf(s), null);
});

await test('IFC-Bauteil anklicken: Dreieck -> Bauteil, Fenster mit Klasse, Material und Eigenschaftssätzen; Esc schließt', async function () {
  const s = ifcScope({ E: 692480, N: 5336520, H: 501, epsg: 25832 });
  const g = function (id) { return s.document.getElementById(id); };
  s.initUI();
  await s.handleIfcFile(ifcFile('haus.ifc'));
  const m = ifcModelOf(s), mesh = m.group.children[0];
  assert.strictEqual(JSON.stringify(mesh.userData.ranges), JSON.stringify([{ end: 12, id: undefined }]));
  mesh.userData.ranges = [{ end: 4, id: 100 }, { end: 12, id: 200 }];
  assert.strictEqual(s.ifcElementAt({ object: mesh, faceIndex: 3 }).id, 100);
  assert.strictEqual(s.ifcElementAt({ object: mesh, faceIndex: 4 }).id, 200);
  const v = function (x) { return { value: x }; };
  const lines = {
    200: { type: 1, Name: v('Pfeiler 3'), GlobalId: v('abc'), Tag: v('P3') },
    10: { RelatedObjects: [v(200)], RelatingPropertyDefinition: v(11) },
    11: { Name: v('Pset_Pfeiler'), HasProperties: [v(12), v(13)] },
    12: { Name: v('Beton'), NominalValue: v('C35/45') },
    13: { Name: v('Tragend'), NominalValue: { value: 'T', name: 'IFCBOOLEAN' } },
    20: { RelatedElements: [v(200)], RelatingStructure: v(21) }, 21: { Name: v('Achse 30') },
    30: { RelatedObjects: [v(200)], RelatingMaterial: v(31) }, 31: { Name: v('<b>Stahlbeton</b>') }
  };
  const api = vm.runInContext('webIfcApi', s);
  const types = { R1: [10], R3: [20], R4: [30] };
  s.WebIFC.IFCRELDEFINESBYPROPERTIES = 'R1'; s.WebIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE = 'R3'; s.WebIFC.IFCRELASSOCIATESMATERIAL = 'R4';
  api.GetLineIDsWithType = function (id, t) { const a = types[t] || []; return { size: function () { return a.length; }, get: function (i) { return a[i]; } }; };
  api.GetLine = function (id, eid) { return lines[eid]; };
  api.GetNameFromTypeCode = function () { return 'IFCCOLUMN'; };
  const rc = vm.runInContext('raycaster', s);
  rc.intersectObject = function () { return [{ object: mesh, faceIndex: 7, distance: 10 }]; };
  rc.intersectObjects = function () { return []; };
  assert.strictEqual(s.clickIfcElement({ clientX: 1, clientY: 1 }), true);
  assert.strictEqual(g('ifc-element').style.display, 'block');
  assert.strictEqual(g('col-right').style.display, 'flex', 'die rechte Spalte ist sichtbar');
  assert.strictEqual(g('param-wrap').style.display, 'none');
  const all = function (el) { return (el.textContent || '') + (el.children || []).map(all).join('|'); };
  const txt = all(g('ifc-element-body'));
  ['Pfeiler 3', 'IFCCOLUMN', 'abc', 'P3', 'Pset_Pfeiler', 'C35/45', 'ja', 'Achse 30', '<b>Stahlbeton</b>', 'haus.ifc'].forEach(function (k) { assert.ok(txt.indexOf(k) >= 0, k + ' fehlt: ' + txt); });
  assert.strictEqual(m.parts[0].group.children.length, 2, 'Hervorhebung liegt in der Gruppe der Datei');
  s.selectTool('container');                                  // Werkzeug wählen: Fenster weicht den Parametern
  assert.strictEqual(g('ifc-element').style.display, 'none');
  assert.strictEqual(g('col-right').style.display, 'flex');
  assert.strictEqual(g('param-wrap').style.display, '');
  s.selectTool(null);
  s.showIfcElement(m.parts[0], 200);
  s.onKeyDown({ key: 'Escape', target: {} });
  assert.strictEqual(g('ifc-element').style.display, 'none');
  assert.strictEqual(g('col-right').style.display, 'none');
  assert.strictEqual(m.parts[0].group.children.length, 1);
  // etwas davor (Gelände oder Baustein): kein Bauteil
  rc.intersectObjects = function () { return [{ object: { userData: {} }, point: { x: 0, y: 0, z: 0 }, distance: 5 }]; };
  assert.strictEqual(s.clickIfcElement({ clientX: 1, clientY: 1 }), false);
});

await test('IFC-Bauteil: Filter (Zeile oder von Hand), Isolieren und Ausblenden je Bauteil oder Datei, Alles anzeigen; Fenster schließen behält den Zustand', async function () {
  const s = ifcScope({ E: 692480, N: 5336520, H: 501, epsg: 25832 });
  const g = function (id) { return s.document.getElementById(id); };
  s.initUI();
  await s.handleIfcFile(ifcFile('haus.ifc'));
  const m = ifcModelOf(s), full = m.group.children[0];
  full.userData.ranges = [{ end: 4, id: 100 }, { end: 8, id: 200 }, { end: 12, id: 300 }];
  const v = function (x) { return { value: x }; };
  const lines = { 100: { Name: v('Pfeiler Nord'), ObjectType: v('P') }, 200: { Name: v('Pfeiler Süd'), ObjectType: v('P') }, 300: { Name: v('Platte'), ObjectType: v('D') } };
  const api = vm.runInContext('webIfcApi', s);
  api.GetLineIDsWithType = function () { return { size: function () { return 0; } }; };
  api.GetLine = function (id, eid) { return lines[eid]; };
  s.yieldToPaint = function () { return Promise.resolve(); };
  const body = function () { return g('ifc-element-body'); };
  const all = function (el) { return (el.textContent || '') + (el.children || []).map(all).join('|'); };
  const find = function (el, cls) {
    if (String(el.className || '').split(' ').indexOf(cls) >= 0) return el;
    for (const c of el.children || []) { const r = find(c, cls); if (r) return r; }
    return null;
  };
  const shown = function () {
    const meshes = m.group.children.filter(function (c) { return c.userData.ranges; });
    return meshes.length ? meshes[0].userData.ranges.map(function (r) { return r.id; }).join(',') : '';
  };
  s.showIfcElement(m.parts[0], 100);
  assert.ok(find(body(), 'ifc-filter'), 'Filter steht im Fenster');
  const labels = find(body(), 'ifc-f-attr').children.map(function (o) { return o.textContent; });
  assert.strictEqual(labels.join(','), 'Datei,Name,Objekttyp', 'Attribute von A bis Z');
  assert.strictEqual(body().children[0], find(body(), 'ifc-filter'), 'ganz oben');
  assert.strictEqual(g('ifc-show-all').style.display, 'none');
  // Zeile anklicken (Filter nach Objekttyp)
  await s.applyIfcFilter({ kind: 'objType', value: 'P' });
  assert.strictEqual(shown(), '100,200');
  assert.ok(all(body()).indexOf('Bauteile|2') >= 0, all(body()));
  assert.strictEqual(find(body(), 'ifc-f-value').value, 'P');
  // von Hand: Attribut Name, „enthält“, eigener Wert
  const attr = find(body(), 'ifc-f-attr'), op = find(body(), 'ifc-f-op'), value = find(body(), 'ifc-f-value');
  const nameIndex = attr.children.findIndex(function (o) { return o.textContent === 'Name'; });
  attr.value = String(nameIndex); attr.fire('change');
  op.value = 'has'; op.fire('change');
  value.value = 'süd'; value.fire('input');
  await s.applyIfcEditor();
  assert.strictEqual(shown(), '200');
  // Filter zurücksetzen: alles wieder da, Felder neu vorbelegt
  await s.resetIfcFilter();
  assert.strictEqual(shown(), '100,200,300');
  assert.strictEqual(find(body(), 'ifc-f-op').value, 'is');
  assert.strictEqual(g('ifc-show-all').style.display, 'none');
  // Ausgeblendetes bleibt beim Filtern und beim Zurücksetzen ausgeblendet
  s.showIfcElement(m.parts[0], 100);
  await s.ifcHideSelected('element');
  await s.applyIfcFilter({ kind: 'objType', value: 'P' });
  assert.strictEqual(shown(), '200');
  await s.resetIfcFilter();
  assert.strictEqual(shown(), '200,300');
  // Alles anzeigen
  s.resetIfcView();
  assert.strictEqual(m.group.children.filter(function (c) { return c.userData.ranges; })[0], full, 'volles Netz zurück');
  assert.strictEqual(g('ifc-show-all').style.display, 'none');
  // Ausblenden: Bauteil, dann ein weiteres
  s.showIfcElement(m.parts[0], 100);
  await s.ifcHideSelected('element');
  assert.strictEqual(shown(), '200,300');
  s.showIfcElement(m.parts[0], 300);
  await s.ifcHideSelected('element');
  assert.strictEqual(shown(), '200');
  assert.strictEqual(g('ifc-show-all').style.display, '');
  // Fenster schließen: der Zustand bleibt, „Alles anzeigen“ steht im Datenfenster
  s.hideIfcElement();
  assert.strictEqual(shown(), '200');
  s.resetIfcView();
  // Isolieren: Bauteil und Datei; ausgeblendete Datei zeigt nichts
  s.showIfcElement(m.parts[0], 300);
  await s.ifcIsolateSelected('element');
  assert.strictEqual(shown(), '300');
  await s.ifcIsolateSelected('file');
  assert.strictEqual(shown(), '100,200,300');
  await s.ifcHideSelected('file');
  assert.strictEqual(shown(), '');
  // Esc: erst alles zeigen, dann Fenster schließen
  s.onKeyDown({ key: 'Escape', target: {} });
  assert.strictEqual(shown(), '100,200,300');
  assert.strictEqual(g('ifc-element').style.display, 'block');
  s.onKeyDown({ key: 'Escape', target: {} });
  assert.strictEqual(g('ifc-element').style.display, 'none');
  s.showIfcElement(m.parts[0], 100);
  await s.ifcHideSelected('element');
  s.removeIfc();
  assert.strictEqual(ifcModelOf(s), null);
  assert.strictEqual(g('ifc-show-all').style.display, 'none');
});

await test('Mit IFC-Bauwerk lässt sich die Ansicht unter das Bauteil drehen; ohne bleibt die Grenze an der Waagerechten', async function () {
  const s = ifcScope({ E: 692480, N: 5336520, H: 501, epsg: 25832 });
  s.initUI();
  const ctr = vm.runInContext('controls', s), cam = vm.runInContext('camera', s);
  const before = ctr.maxPolarAngle;
  await s.handleIfcFile(ifcFile('haus.ifc'));
  assert.ok(ctr.maxPolarAngle > Math.PI * 0.9, String(ctr.maxPolarAngle));
  // um einen Punkt kippen: die Kamera kommt unter das Drehzentrum
  cam.position.set(0, 10, 40); ctr.target.set(0, 10, 0);
  s.orbitAround({ x: 0, y: 10, z: 0 }, 0, 1.0);
  const low1 = cam.position.y;
  s.orbitAround({ x: 0, y: 10, z: 0 }, 0, -2.0);
  assert.ok(Math.min(low1, cam.position.y) < 10, low1 + ' / ' + cam.position.y);
  const mat = ifcModelOf(s).group.children[0].material;
  const lit = [];
  mat.emissive = { copy: function () { return { multiplyScalar: function (k) { lit.push(k); } }; } };
  cam.position.set(0, -5, 40); ctr.target.set(0, 20, 0); s.updateIfcFill(); s.updateIfcFill();
  cam.position.set(0, 60, 40); s.updateIfcFill();
  assert.strictEqual(lit.join(','), '0.35,0', 'nur beim Blick von unten, nur das IFC-Netz, einmal je Wechsel');
  const plinth = vm.runInContext('plinthMesh', s);
  cam.position.set(0, -5, 40); s.updatePlinthVisibility();
  assert.strictEqual(plinth.visible, false, 'unter dem Gelände kein Sockel im Weg');
  cam.position.set(0, 50, 40); s.updatePlinthVisibility();
  assert.strictEqual(plinth.visible, true);
  s.removeIfc();
  assert.ok(ctr.maxPolarAngle < Math.PI / 2 && ctr.maxPolarAngle <= (before || Math.PI));
});

await test('IFC drehen: der Ring dreht um die Hochachse durch die Mitte, Feld, Abbrechen und neue Vier-Punkte-Lage', async function () {
  const s = ifcScope({ E: 692480, N: 5336520, H: 501, epsg: 25832 });
  const g = function (id) { return s.document.getElementById(id); };
  s.initUI();
  await s.handleIfcFile(ifcFile('haus.ifc'));
  const m = ifcModelOf(s);
  // Mitte des Quaders aus der Mitte rücken, damit eine Drehung um den falschen Punkt auffiele
  m.bbox.minX += 6; m.bbox.maxX += 6;
  s.ifcSetShift(m, 0, 0, 0);
  const r0 = m.group.rotation.y;
  const mid = function () {
    const a = m.group.rotation.y, b = m.bbox, x = (b.minX + b.maxX) / 2, z = (b.minZ + b.maxZ) / 2;
    return [m.group.position.x + Math.cos(a) * x + Math.sin(a) * z, m.group.position.z - Math.sin(a) * x + Math.cos(a) * z];
  };
  const c0 = mid();
  s.startIfcMove();
  const rc = vm.runInContext('raycaster', s);
  const c = s.ifcCenterWorld(m);
  const down = function (dx, dz) { return { origin: { x: c.x + dx, y: c.y + 100, z: c.z + dz }, direction: { x: 0, y: -1, z: 0 } }; };
  rc._results = [{ object: { userData: { ifcAxis: 'r' } } }];
  rc.ray = down(10, 0);                                       // Osten
  assert.strictEqual(s.startIfcGizmoDrag({ button: 0, clientX: 1, clientY: 1 }), true);
  rc.ray = down(0, -10);                                      // nach Norden gezogen: 90 Grad gegen den Uhrzeigersinn
  s.onIfcGizmoMove({ clientX: 2, clientY: 2, buttons: 1 });
  s.endIfcGizmoDrag();
  assert.strictEqual(m.rot, 90);
  assert.strictEqual(g('ifc-dr').value, '90');
  assert.ok(Math.abs(m.group.rotation.y - r0 - Math.PI / 2) < 1e-9);
  const c1 = mid();
  assert.ok(Math.abs(c1[0] - c0[0]) < 1e-9 && Math.abs(c1[1] - c0[1]) < 1e-9, 'die Mitte bleibt: ' + c0 + ' / ' + c1);
  s.applyIfcShift('r', '-30');
  s.applyIfcShift('e', '5');
  assert.strictEqual(m.rot, -30);
  assert.ok(Math.abs(mid()[0] - c0[0] - 5) < 1e-9 && Math.abs(mid()[1] - c0[1]) < 1e-9);
  // Vier Punkte abbrechen behält die Drehung, neu ausrichten setzt sie zurück
  s.startIfcManual(false);
  s.onKeyDown({ key: 'Escape', target: {} });
  assert.ok(m.rot === -30 && Math.abs(m.group.rotation.y - r0 + Math.PI / 6) < 1e-9);
  s.startIfcManual(false);
  const pick = ifcPickOf(s);
  pick.p = [{ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }]; pick.t = [{ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }]; pick.markers = []; pick.step = 4;
  s.finishIfcPick();
  assert.ok(m.rot === 0 && m.de === 0 && Math.abs(m.group.rotation.y) < 1e-9);
  assert.strictEqual(g('ifc-dr').value, '0');
});

await test('IFC verschieben: aus den vier Punkten umsteigen platziert ein neues Bauwerk; Entfernen beendet das Verschieben', async function () {
  const s = ifcScope(null);
  const g = function (id) { return s.document.getElementById(id); };
  s.initUI();
  await s.handleIfcFile(ifcFile('haus.ifc'));
  assert.ok(ifcPickOf(s));
  s.startIfcMove();
  assert.strictEqual(ifcPickOf(s), null);
  assert.strictEqual(ifcModelOf(s).how, 'manual');
  assert.ok(g('ifc-status').textContent.indexOf('von Hand platziert') >= 0);
  s.updateIfcGizmo();
  s.removeIfc();
  assert.strictEqual(vm.runInContext('ifcGizmo', s), null);
  assert.strictEqual(g('gizmo-labels').children.length, 0);
});

await test('Großes Gebäudemodell: Hinweis "wird verarbeitet/gerendert" erscheint während der Arbeit und verschwindet danach, auch bei Fehlern', async function () {
  const s = await scopeWithTerrain();
  const busy = s.document.getElementById('busy-hint');
  const seen = [];
  s.yieldToPaint = function () { seen.push([busy.style.display, busy.textContent]); return Promise.resolve(); };
  const gml =
    '<CityModel xmlns:gml="http://www.opengis.net/gml"><gml:Polygon><gml:exterior><gml:LinearRing>' +
    '<gml:posList>691995 5336005 500 692005 5336005 500 692005 5336015 500</gml:posList>' +
    '</gml:LinearRing></gml:exterior></gml:Polygon></CityModel>';
  await s.handleGmlFiles([fakeFile('gross.gml', gml)]);
  assert.ok(seen.length >= 2, 'mehrmals Zeit zum Zeichnen: ' + seen.length);
  assert.strictEqual(seen[0][0], 'block');
  assert.ok(seen[0][1].indexOf('verarbeitet') >= 0, seen[0][1]);
  assert.ok(seen.some(function (x) { return x[1].indexOf('gerendert') >= 0; }), 'zweite Stufe: gerendert');
  assert.strictEqual(busy.style.display, 'none', 'danach wieder weg');
  // Fehler: Hinweis verschwindet trotzdem
  await s.handleGmlFiles([{ name: 'kaputt.gml', text: function () { return Promise.reject(new Error('kaputt')); } }]);
  assert.strictEqual(busy.style.display, 'none');
  s.STRINGS_CHECK = s.__bridge.STRINGS;
  ['busyGml', 'busyGmlRender', 'busyIfc'].forEach(function (k) {
    assert.ok(s.__bridge.STRINGS.de[k] && s.__bridge.STRINGS.en[k], 'Text in beiden Sprachen: ' + k);
  });
});

await test('Messen: die Vorschau zur Maus verschiebt dieselben Objekte, statt bei jeder Bewegung neue zu bauen (sonst ruckelt es)', async function () {
  const s = await scopeWithTerrain();
  s.initUI();
  s.startRuler();
  setTerrainHit(s, 0, 5, 0);
  s.rulerClick({ clientX: 1, clientY: 1 });
  s.rulerMove({ clientX: 2, clientY: 2 }, { x: 10, y: 5, z: 0 });
  const sceneKids = s.__bridge.scene ? s.__bridge.scene.children.length : null;
  const labels1 = rulerOf(s);
  assert.strictEqual(labels1.labels.length, 1, 'ein Schild zur Maus');
  assert.strictEqual(labels1.labels[0].text, '10.00 m · Δ 0.00 m');
  for (let i = 0; i < 50; i++) s.rulerMove({ clientX: 2, clientY: 2 }, { x: 10 + i, y: 5 + i * 0.1, z: i });
  if (sceneKids !== null) assert.strictEqual(s.__bridge.scene.children.length, sceneKids, 'keine neuen Objekte pro Bewegung');
  const l = rulerOf(s).labels;
  assert.strictEqual(l.length, 1);
  assert.strictEqual(l[0].text, Math.hypot(59, 49).toFixed(2) + ' m · Δ +4.90 m');
  assert.strictEqual(l[0].live, true);
  // Klick macht daraus ein festes Schild, die Vorschau ist weg
  setTerrainHit(s, 20, 5, 0);
  s.rulerClick({ clientX: 3, clientY: 3 });
  const after = rulerOf(s);
  assert.strictEqual(after.labels.length, 1);
  assert.strictEqual(after.labels[0].live, false);
});

await test('CityGML: zu große Dateien werden vor dem Lesen abgelehnt, mit Meldung in beiden Sprachen', async function () {
  const s = await scopeWithTerrain();
  const g = function (id) { return s.document.getElementById(id); };
  let read = false;
  await s.handleGmlFiles([{ name: 'riesig.gml', size: 400e6, text: function () { read = true; return Promise.resolve(''); } }]);
  assert.strictEqual(read, false, 'nichts wird gelesen');
  assert.ok(g('gml-status').textContent.indexOf('400 MB') >= 0 && g('gml-status').textContent.indexOf('300 MB') >= 0, g('gml-status').textContent);
  assert.strictEqual(g('gml-status').className.indexOf('err') > 0, true);
  assert.ok(s.__bridge.STRINGS.en.gmlTooBig.indexOf('{s}') > 0 && s.__bridge.STRINGS.en.gmlTooBig.indexOf('{m}') > 0);
});

await test('IFC-Import: Abbrechen mit Esc entfernt ein neues Bauwerk, ein schon platziertes behält seine Lage', async function () {
  const s = ifcScope(null);                                    // ohne Georeferenz
  const g = function (id) { return s.document.getElementById(id); };
  await s.handleIfcFile(ifcFile('haus.ifc'));
  assert.ok(g('ifc-status').textContent.indexOf('nicht georeferenziert') >= 0);
  assert.ok(ifcModelOf(s));
  s.onKeyDown({ key: 'Escape', target: {} });
  assert.strictEqual(ifcModelOf(s), null, 'neues Bauwerk ohne Lage wird entfernt');
  assert.strictEqual(g('ifc-tools').style.display, 'none');
  // platziertes Bauwerk: Neuplatzierung abbrechen lässt die Lage unverändert
  const s2 = ifcScope({ E: 692480, N: 5336520, H: 501, epsg: 25832 });
  await s2.handleIfcFile(ifcFile('haus.ifc'));
  const before = JSON.stringify(ifcModelOf(s2).group.position);
  s2.startIfcManual(false);
  assert.notStrictEqual(JSON.stringify(ifcModelOf(s2).group.position), before, 'Vorschau steht woanders');
  s2.onKeyDown({ key: 'Escape', target: {} });
  assert.strictEqual(JSON.stringify(ifcModelOf(s2).group.position), before);
  s2.removeIfc();
  assert.strictEqual(ifcModelOf(s2), null);
});

await test('IFC-Import: Fehler - kein Gelände, zu große Datei, leere Geometrie, Bibliothek lädt nicht', async function () {
  const s0 = newScope();
  s0.setTimeout = function (fn) { fn(); return 0; };
  s0.WebIFC = fakeWebIfc(null);
  await s0.handleIfcFile(ifcFile('a.ifc'));
  assert.ok(s0.document.getElementById('ifc-status').textContent.indexOf('Geländemodell laden') >= 0);
  const s = ifcScope(null);
  await s.handleIfcFile(ifcFile('riesig.ifc', 400e6));
  assert.ok(s.document.getElementById('ifc-status').textContent.indexOf('zu groß') > 0 && ifcModelOf(s) === null);
  const se = ifcScope(null, { empty: true });
  await se.handleIfcFile(ifcFile('leer.ifc'));
  assert.ok(se.document.getElementById('ifc-status').textContent.indexOf('keine darstellbare Geometrie') >= 0);
  const sl = ifcScope(null, { initFails: true });
  await sl.handleIfcFile(ifcFile('x.ifc'));
  assert.ok(sl.document.getElementById('ifc-status').textContent.indexOf('IFC-Bibliothek') >= 0, sl.document.getElementById('ifc-status').textContent);
});

await test('IFC-Import: neues Gelände - automatisch platziertes Bauwerk wird neu eingepasst, von Hand platziertes entfernt', async function () {
  const s = ifcScope({ E: 692480, N: 5336520, H: 501, epsg: 25832 });
  await s.handleIfcFile(ifcFile('haus.ifc'));
  const m = ifcModelOf(s);
  // anderes Gelände mit verschobenem Ursprung
  const t2 = s.terrainFromEmbedded({ n: 5, heights: new Array(25).fill(1000), scale: 100, zmin: 500, zmax: 520, width: 100, depth: 100, originE: 692400, originN: 5336500, epsg: 25832 });
  s.buildTerrain(t2);
  s.refreshIfcAfterTerrain();
  assert.ok(Math.abs(ifcModelOf(s).group.position.x - 80) < 1e-6, 'x = 692480 - 692400');
  ifcModelOf(s).how = 'manual';
  s.refreshIfcAfterTerrain();
  assert.strictEqual(ifcModelOf(s), null);
});

await test('Hilfe: Knopf öffnet das Hilfefenster mit sieben Abschnitten und Link zur Anleitung, schließt Darstellung, folgt der Sprache', function () {
  const s = newScope();
  const g = function (id) { return s.document.getElementById(id); };
  s.toggleTweak(true);
  assert.strictEqual(g('tweak-panel').style.display, 'block');
  s.toggleHelp(true);
  assert.strictEqual(g('help-panel').style.display, 'block');
  assert.strictEqual(g('tweak-panel').style.display, 'none', 'Darstellung schließt sich');
  const txt = g('help-body').textContent;
  ['Loslegen', 'Ansicht steuern', 'Bausteine setzen', 'Bearbeiten', 'Mengen und Prüfungen', 'Karte und Export', 'Tastatur', 'Wo ist deine Baustelle?', 'ersetzt keine Statik'].forEach(function (k) {
    assert.ok(txt.indexOf(k) >= 0, k + ' fehlt');
  });
  const link = [].concat.apply([], g('help-body').children.map(function (c) { return c.children || []; })).filter(function (c) { return c.href; })[0];
  assert.ok(link && link.href.indexOf('BENUTZERANLEITUNG.md') > 0, 'Link zur Anleitung fehlt');
  s.__bridge.SETTINGS.language = 'en';
  s.buildHelpPanel();
  assert.ok(g('help-body').textContent.indexOf('Getting started') >= 0);
  s.toggleHelp(false);
  assert.strictEqual(g('help-panel').style.display, 'none');
  assert.strictEqual(s.T('helpBtn'), 'Help');
});

/* ---------- Punktkoordinaten-Fenster ---------- */

await test('Punktfenster: Position per transform (kein left/top), 14 px neben dem Punkt, ohne Punkt versteckt', function () {
  const s = newScope();
  s.setMeasureMarker(0, 0, 0);
  s.updatePointLabel();
  const el = s.document.getElementById('point-label');
  assert.strictEqual(el.style.display, 'block');
  assert.strictEqual(el.style.transform, 'translate(526px, 384px) translateY(-50%)');
  assert.strictEqual(el.style.left, undefined, 'left darf nicht mehr pro Bild gesetzt werden');
  s.clearMeasureMarker();
  s.updatePointLabel();
  assert.strictEqual(el.style.display, 'none');
});

/* ---------- Alle Editoren lassen sich aufbauen (Fehler beim Umbau der Regler-Köpfe) ---------- */

await test('Editor aller Bausteintypen baut sich auf, auch Zahlenfelder ohne Regler (Container)', function () {
  const s = newScope();
  const defaults = {
    container: s.defaultContainerParams(), tower: s.defaultTowerParams(), mobile: s.defaultMobileParams(),
    road: (function () { const p = s.defaultRoadParams(); p.points = [{ x: 0, z: 0 }, { x: 30, z: 0 }]; return p; })(),
    pit: (function () { const p = s.defaultPitParams(); p.points = [{ x: 0, z: 0 }, { x: 20, z: 0 }, { x: 20, z: 20 }, { x: 0, z: 20 }]; return p; })()
  };
  Object.keys(defaults).forEach(function (type) {
    const obj = s.addObject(type, 0, 0, defaults[type]);
    s.showObjectEditor(obj.id);                      // wirft, wenn ein Feldtyp nicht darstellbar ist
    const form = s.buildForm(type, obj.params, function () {}, true);
    assert.ok(Object.keys(form.refs).length > 0, type);
  });
  assert.strictEqual(s.formatVal(2.456, 'm'), '2.46 m');
});

/* ---------- Tastenbefehle gelten nicht beim Tippen in Feldern ---------- */

function selectedRoadScope() {
  const s = newScope();
  const p = s.defaultRoadParams();
  p.points = [{ x: 0, z: 0 }, { x: 30, z: 0 }];
  const obj = s.addObject('road', 0, 0, p);
  s.selectObjects([obj.id], false);
  return { s: s, obj: obj };
}

await test('Backspace/Entf im Eingabefeld löscht das Objekt nicht (Zahl im Parameterfenster korrigieren)', function () {
  ['INPUT', 'TEXTAREA', 'SELECT'].forEach(function (tag) {
    ['Backspace', 'Delete'].forEach(function (key) {
      const k = selectedRoadScope();
      k.s.onKeyDown({ key: key, target: { tagName: tag } });
      assert.ok(k.s.findObject(k.obj.id), key + ' in ' + tag + ' hat das Objekt gelöscht');
      assert.ok(k.s.isSelected(k.obj.id), 'Auswahl darf nicht verloren gehen');
    });
  });
  const k = selectedRoadScope();
  k.s.onKeyDown({ key: 'Backspace', target: { tagName: 'DIV', isContentEditable: true } });
  assert.ok(k.s.findObject(k.obj.id), 'auch in contenteditable darf nichts gelöscht werden');
});

await test('Backspace/Entf außerhalb von Feldern löscht das ausgewählte Objekt weiterhin', function () {
  [{ key: 'Backspace', target: { tagName: 'BODY' } }, { key: 'Delete', target: { tagName: 'CANVAS' } }, { key: 'Delete' }].forEach(function (ev) {
    const k = selectedRoadScope();
    k.s.onKeyDown(ev);
    assert.strictEqual(k.s.findObject(k.obj.id), null, JSON.stringify(ev));
  });
});

await test('Leertaste im Feld schließt die Baustraße nicht ab, Esc im Feld wirkt weiter', function () {
  const s = newScope();
  s.selectTool('road');
  let prevented = false;
  s.onKeyDown({ key: ' ', code: 'Space', target: { tagName: 'INPUT' }, preventDefault: function () { prevented = true; } });
  assert.strictEqual(prevented, false, 'Leertaste im Feld darf nicht abgefangen werden (Abstand tippen)');
  const k = selectedRoadScope();
  k.s.setActiveNode(1);
  k.s.onKeyDown({ key: 'Escape', target: { tagName: 'INPUT' } });
  assert.strictEqual(k.s.activeRoadNode(), null, 'Esc soll auch im Feld den Knoten lösen');
});

/* ---------- Zahlenfeld neben jedem Schieberegler ---------- */

function widthRow(s, calls) {
  const p = s.defaultRoadParams();
  return s.buildForm('road', p, function (k, v) { calls.push([k, v]); }, true).refs.width;
}

await test('Zahlenfeld: Schieberegler bekommen ein Eingabefeld mit Reglerbereich, Checkbox und Auswahl nicht', function () {
  const s = newScope();
  const refs = s.buildForm('road', s.defaultRoadParams(), function () {}, true).refs;
  ['width', 'radius', 'slope'].forEach(function (k) {
    assert.ok(refs[k].num, k + ' hat kein Zahlenfeld');
    assert.strictEqual(refs[k].num.type, 'number');
    assert.strictEqual(refs[k].num.min, refs[k].input.min);
  });
  assert.strictEqual(refs.showEdge.num, null);
});

await test('Zahlenfeld: Tippen und Bestätigen setzt Wert, Regler und Anzeige', function () {
  const s = newScope(), calls = [];
  const r = widthRow(s, calls);
  r.num.value = '9';
  r.num.fire('change');
  assert.deepStrictEqual(calls, [['width', 9]]);
  assert.strictEqual(r.input.value, 9);
  assert.strictEqual(r.num.value, 9);
  assert.strictEqual(r.out.textContent, 'm');
});

await test('Zahlenfeld: Werte außerhalb des Bereichs werden begrenzt, Unsinn fällt auf den Reglerwert zurück', function () {
  const s = newScope(), calls = [];
  const r = widthRow(s, calls);
  r.num.value = '99'; r.num.fire('change');
  assert.deepStrictEqual(calls[0], ['width', 14]);
  assert.strictEqual(r.num.value, 14);
  r.num.value = '-3'; r.num.fire('change');
  assert.deepStrictEqual(calls[1], ['width', 3]);
  const before = calls.length;
  r.num.value = ''; r.num.fire('change');
  assert.strictEqual(calls.length, before, 'leere Eingabe darf nichts setzen');
  assert.strictEqual(r.num.value, r.input.value);
});

await test('Zahlenfeld: Tippen wirkt schon während der Eingabe, aber nur innerhalb des Bereichs; Kommawerte bleiben erhalten', function () {
  const s = newScope(), calls = [];
  const r = widthRow(s, calls);
  r.num.value = '1'; r.num.fire('input');       // unter dem Minimum 3: noch nichts
  assert.strictEqual(calls.length, 0);
  r.num.value = '7.25'; r.num.fire('input');
  assert.deepStrictEqual(calls, [['width', 7.25]]);
});

await test('Zahlenfeld: Bewegen des Reglers aktualisiert das Zahlenfeld', function () {
  const s = newScope(), calls = [];
  const r = widthRow(s, calls);
  r.input.value = '11';
  r.input.fire('input');
  assert.strictEqual(r.num.value, 11);
});

await test('Zahlenfeld: syncForm führt Zahlenfeld und Reglerbereich mit (Kranmodellwechsel)', function () {
  const s = newScope();
  const refs = s.buildForm('road', s.defaultRoadParams(), function () {}, true).refs;
  refs.width.input.max = 10;
  s.syncForm(refs, { width: 8, radius: 15, slope: 0, showEdge: true });
  assert.strictEqual(refs.width.num.value, 8);
  assert.strictEqual(refs.width.num.max, 10);
});

/* ---------- Kamera: Umkreisen um den angeklickten Punkt ---------- */

function orbitEvent(s, over) {
  return Object.assign({ target: s.__bridge.renderer.domElement, button: 0, clientX: 100, clientY: 100, pointerType: 'mouse' }, over || {});
}

await test('Maussteuerung: links drehen, rechts und Mitte verschieben, Rad zoomt', async function () {
  const s = newScope();
  const mb = s.__bridge.controls.mouseButtons;
  assert.strictEqual(mb.LEFT, THREE.MOUSE.ROTATE);
  assert.strictEqual(mb.MIDDLE, THREE.MOUSE.PAN);
  assert.strictEqual(mb.RIGHT, THREE.MOUSE.PAN);
  assert.strictEqual(s.__bridge.controls.enableZoom, true);
});

await test('Linke Taste auf einen Punkt: OrbitControls pausiert, die Kamera dreht um genau diesen Punkt', async function () {
  const s = await scopeWithTerrain();
  const cam = s.__bridge.camera;
  s.__bridge.controls.target.set(0, 0, 0);
  cam.position.set(0, 100, 100);
  setTerrainHit(s, 30, 5, -20);
  const dBefore = cam.position.distanceTo(new THREE.Vector3(30, 5, -20));

  s.onOrbitPointerDown(orbitEvent(s));
  assert.strictEqual(s.isPivotDragging(), true);
  assert.strictEqual(s.__bridge.controls.enabled, false, 'OrbitControls muss pausieren, sonst drehen beide');

  s.onOrbitPointerMove({ clientX: 160, clientY: 100 });
  const dAfter = cam.position.distanceTo(new THREE.Vector3(30, 5, -20));
  assert.ok(Math.abs(dBefore - dAfter) < 1e-6, 'Abstand zum Drehpunkt muss gleich bleiben');
  assert.ok(Math.abs(cam.position.x) > 1e-3 || Math.abs(cam.position.z - 100) > 1e-3, 'Kamera hat sich nicht bewegt');

  s.endOrbitDrag();
  assert.strictEqual(s.isPivotDragging(), false);
  assert.strictEqual(s.__bridge.controls.enabled, true);
});

await test('Mausrad nach einem Klick: ein verlorenes Loslassen sperrt OrbitControls nicht, und die Kamerafahrt zum Punkt hält das Zoomen nicht auf', async function () {
  const s = await scopeWithTerrain();
  const cam = s.__bridge.camera, ctl = s.__bridge.controls;
  ctl.target.set(0, 0, 0);
  cam.position.set(0, 100, 100);
  setTerrainHit(s, 30, 5, -20);
  s.onOrbitPointerDown(orbitEvent(s));
  assert.strictEqual(ctl.enabled, false);
  s.onCanvasWheel({ buttons: 0 });                 // Taste ist längst oben, pointerup kam nie an
  assert.strictEqual(ctl.enabled, true, 'Zoomen muss wieder möglich sein');
  assert.strictEqual(s.isPivotDragging(), false);

  s.focusOnPoint(30, 5, -20);
  s.onCanvasWheel({ buttons: 0 });
  assert.deepStrictEqual({ cam: vm.runInContext("camGoal", s), focus: vm.runInContext("focusGoal", s) }, { cam: null, focus: null }, 'laufende Fahrt endet');
});

await test('Klick mit zitternder Hand: wenige Pixel Weg drehen die Ansicht nicht, erst größere Bewegung dreht ohne Sprung', async function () {
  const s = await scopeWithTerrain();
  const cam = s.__bridge.camera;
  s.__bridge.controls.target.set(0, 0, 0);
  cam.position.set(0, 100, 100);
  setTerrainHit(s, 30, 5, -20);
  s.onOrbitPointerDown(orbitEvent(s));                       // Start bei (100, 100)
  const before = [cam.position.x, cam.position.y, cam.position.z];
  s.onOrbitPointerMove({ clientX: 102, clientY: 101 });
  s.onOrbitPointerMove({ clientX: 98, clientY: 99 });
  assert.deepStrictEqual([cam.position.x, cam.position.y, cam.position.z], before, 'Zittern dreht nicht');
  s.onOrbitPointerMove({ clientX: 160, clientY: 100 });      // echte Bewegung: 60 px, voller Weg ab dem Start
  const moved = Math.hypot(cam.position.x - before[0], cam.position.z - before[2]);
  s.endOrbitDrag();
  const s2 = await scopeWithTerrain();
  const cam2 = s2.__bridge.camera;
  s2.__bridge.controls.target.set(0, 0, 0);
  cam2.position.set(0, 100, 100);
  setTerrainHit(s2, 30, 5, -20);
  s2.onOrbitPointerDown(orbitEvent(s2));
  s2.onOrbitPointerMove({ clientX: 160, clientY: 100 });     // gleich weit ohne Zittern davor
  s2.endOrbitDrag();
  assert.ok(Math.abs(moved - Math.hypot(cam2.position.x - 0, cam2.position.z - 100)) < 1e-6, 'gleicher Drehwinkel mit und ohne Zittern davor');
});

await test('Verlorenes Loslassen: ohne gedrückte linke Taste beendet die nächste Mausbewegung die Drehung, statt weiterzudrehen', async function () {
  const s = await scopeWithTerrain();
  const cam = s.__bridge.camera;
  cam.position.set(0, 100, 100);
  s.__bridge.controls.target.set(0, 0, 0);
  setTerrainHit(s, 30, 5, -20);
  s.onOrbitPointerDown(orbitEvent(s));
  assert.strictEqual(s.isPivotDragging(), true);
  const before = cam.position.x;
  s.onOrbitPointerMove({ clientX: 160, clientY: 100, buttons: 0 });
  assert.strictEqual(s.isPivotDragging(), false);
  assert.strictEqual(s.__bridge.controls.enabled, true);
  assert.strictEqual(cam.position.x, before, 'die Kamera darf sich ohne gedrückte Taste nicht mehr bewegen');
});

await test('Linke Taste auf den Hintergrund: keine eigene Drehung, OrbitControls dreht das Ganze um sein Zentrum', async function () {
  const s = await scopeWithTerrain();
  s.__bridge.raycaster._results = [];
  s.onOrbitPointerDown(orbitEvent(s));
  assert.strictEqual(s.isPivotDragging(), false);
  assert.strictEqual(s.__bridge.controls.enabled, true);
});

await test('Rechte/mittlere Taste, Strg/Umschalt und Rechteckauswahl lösen keine Pivot-Drehung aus', async function () {
  const s = await scopeWithTerrain();
  setTerrainHit(s, 1, 1, 1);
  [{ button: 2 }, { button: 1 }, { ctrlKey: true }, { shiftKey: true }].forEach(function (o) {
    s.onOrbitPointerDown(orbitEvent(s, o));
    assert.strictEqual(s.isPivotDragging(), false, JSON.stringify(o));
  });
  s.startRectExport();
  s.onOrbitPointerDown(orbitEvent(s));
  assert.strictEqual(s.isPivotDragging(), false, 'beim Rechteckziehen bleibt das Drehen gesperrt');
});

console.log(pass + ' bestanden, ' + fail + ' fehlgeschlagen');
process.exit(fail ? 1 : 0);

}

main();
