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
    appendChild: function (c) { this.children.push(c); return c; },
    _listeners: {},
    addEventListener: function (type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); },
    removeEventListener: function () {},
    fire: function (type) { (this._listeners[type] || []).forEach(function (fn) { fn({ target: el }); }); },
    getElementsByTagName: function () { return []; },
    click: function () {}
  };
  // Wie im echten DOM: textContent eines Elements mit Kindern ist die
  // Verkettung der Kind-textContent, nicht ein eigenes Feld.
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

function newScope() {
  const document = makeDocument();
  const sandbox = {
    console: console,
    Math: Math, JSON: JSON, Object: Object, Array: Array, Error: Error,
    isFinite: isFinite, isNaN: isNaN, parseFloat: parseFloat, parseInt: parseInt,
    Float32Array: Float32Array, Float64Array: Float64Array, Uint32Array: Uint32Array,
    Date: Date, RegExp: RegExp, String: String, Number: Number, Boolean: Boolean,
    THREE: THREE,
    DOMParser: DOMParser,
    GeoTIFF: fakeGeoTIFF(20, 20, 500, 692000, 5336020),
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
    requestAnimationFrame: function () {}
  };
  vm.createContext(sandbox);

  const appSrc = fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8');
  const uiSrc = fs.readFileSync(path.join(__dirname, '../src/ui.js'), 'utf8');
  vm.runInContext(appSrc, sandbox, { filename: 'app.js' });
  vm.runInContext(uiSrc, sandbox, { filename: 'ui.js' });

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
    'DETAIL_STEPS: DETAIL_STEPS, SETTINGS: SETTINGS, DRAG_TOLERANCE: DRAG_TOLERANCE, ' +
    'REPEAT_GUARD: REPEAT_GUARD, DEMO_ATTRIBUTION: DEMO_ATTRIBUTION, raycaster: raycaster, ' +
    'controls: controls, renderer: renderer, camera: camera };',
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

await test('detailLimit: die letzte Stufe ist maxGrid=0 ("Original"), kein Fallback auf die Voreinstellung', function () {
  const s = newScope();
  s.__bridge.SETTINGS.detail = s.__bridge.DETAIL_STEPS.length - 1;
  assert.strictEqual(s.detailLimit(), 0);
  assert.strictEqual(s.detailLabel(), s.T('original'));
});

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

await test('groupKeyFor/buildGroups gruppieren Mobilkrane weiterhin nach echtem Modellnamen aus app.js', function () {
  const s = newScope();
  const p1 = s.defaultMobileParams();
  const p2 = s.defaultMobileParams();
  s.addObject('mobile', 0, 0, p1);
  s.addObject('mobile', 20, 0, p2);
  const groups = s.buildGroups();
  assert.strictEqual(groups.length, 1);
  assert.strictEqual(groups[0].key, s.getModel(p1.model).name);
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
  s.startRectExport();
  setTerrainHit(s, ax, 0, az);
  s.onCanvasPointerDown({ button: 0, clientX: 0, clientY: 0, pointerId: 1 });
  setTerrainHit(s, bx, 0, bz);
  s.onCanvasPointerUp({ clientX: 0, clientY: 0, pointerId: 1 });
}

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

/* ---------- Baustraße: Eigenschaftsfenster ---------- */

function roadObject(s, slope) {
  const p = s.defaultRoadParams();
  p.points = [{ x: -25, z: 0 }, { x: 25, z: 0 }];
  p.width = 6;
  p.slope = slope;
  return s.addObject('road', 0, 0, p);
}

await test('Baustraße: Längsneigung nur im Eigenschaftsfenster, in % und mit Vorzeichen', function () {
  const s = newScope();
  const p = s.defaultRoadParams();
  assert.strictEqual(s.buildForm('road', p, function () {}, false).refs.slope, undefined,
    'vor dem Setzen gibt es keine Neigung zum Einstellen');
  p.slope = 5;
  assert.strictEqual(s.buildForm('road', p, function () {}, true).refs.slope.out.textContent, '+5 %');
  p.slope = -2.5;
  const ref = s.buildForm('road', p, function () {}, true).refs.slope;
  assert.strictEqual(ref.out.textContent, '-2.5 %');
  assert.strictEqual(ref.input.min, -30);
  assert.strictEqual(ref.input.max, 30);
});

await test('Baustraße: der Hinweis nennt neben der Länge auch die Fläche', function () {
  const s = newScope();
  const obj = roadObject(s, 0);
  const hint = s.roadHintText(obj);
  assert.ok(hint.indexOf('50 m ') === 0, hint);
  assert.ok(hint.indexOf(s.T('area') + ' 300 m²') > 0, hint);
});

await test('Baustraße: Auftrag und Abtrag samt Böschungshinweis stehen im Eigenschaftsfenster', function () {
  const s = newScope();
  const obj = roadObject(s, 5);
  const el = s.document.createElement('div');
  s.renderRoadEarth(obj, el);
  const txt = el.textContent;
  assert.ok(txt.indexOf(s.T('fill')) >= 0 && txt.indexOf(s.T('cut')) >= 0, txt);
  assert.ok(txt.indexOf('m³') > 0, txt);
  assert.ok(txt.indexOf(s.T('embankment')) >= 0, txt);
  assert.ok(obj.group.userData.earthworks.fill > 0, 'bei +5 % auf ebenem Gelände muss Auftrag entstehen');
});

await test('formatVolume: unter 10 m³ eine Nachkommastelle, darüber ganze Kubikmeter', function () {
  const s = newScope();
  assert.strictEqual(s.formatVolume(4.26), '4.3 m³');
  assert.strictEqual(s.formatVolume(1234.6), '1235 m³');
});

/* ---------- Detailstufe nach Zoom ---------- */

await test('Detailstufe nach Zoom: standardmäßig an, Schalter reicht an das Gelände-LOD durch', async function () {
  const s = newScope();
  s.initUI();
  assert.strictEqual(s.__bridge.SETTINGS.autoDetail, true);
  assert.strictEqual(s.isTerrainLodAuto(), true);
  const box = s.document.getElementById('auto-detail');
  box.checked = false;
  box.fire('change');
  assert.strictEqual(s.__bridge.SETTINGS.autoDetail, false);
  assert.strictEqual(s.isTerrainLodAuto(), false);
  box.checked = true;
  box.fire('change');
  assert.strictEqual(s.isTerrainLodAuto(), true);
});

await test('Detailstufe: Standard ist die höchste Stufe unterhalb von "Original" (900 Punkte), weil ferne Kacheln ohnehin gröber werden', function () {
  const s = newScope();
  assert.strictEqual(s.detailLimit(), 900);
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
  assert.strictEqual(r.out.textContent, '9 m');
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
