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
  assert.ok(txt.indexOf('Luzern') < 0, 'Quelle steht nicht im Fenster');
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
  assert.deepStrictEqual(tools, ['container', 'tower', 'mobile', 'road', 'pit', 'ifc']);
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
  assert.strictEqual(tool.depth.input.min, -30);
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
  assert.ok(Math.abs(e.refs.bottomAbs.input.min - (info.refAbs - 30)) < 0.06);
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

await test('GeoTIFF zu groß: klare Meldung im Datenfenster, bestehendes Gelände bleibt', async function () {
  const s = newScope();
  const f = fakeFile('bev_als_dtm.tif', '');
  f.size = 2.4e9;
  await s.handleDemFiles([f]);
  const txt = s.document.getElementById('dem-status').textContent;
  assert.ok(txt.indexOf('bev_als_dtm.tif') >= 0 && txt.indexOf('zu groß') > 0 && txt.indexOf('gdal_translate') > 0, txt);
  assert.strictEqual(s.document.getElementById('dem-status').className.indexOf('err') > 0, true);
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

await test('XYZ-Datei: ein Code, der die Koordinaten weit außerhalb Europas legt, bekommt eine Warnung', async function () {
  const s = newScope();
  const g = function (id) { return s.document.getElementById(id); };
  s.buildXyzCrsOptions();
  g('xyz-crs').value = 'other';
  g('xyz-epsg').value = '32660';                  // UTM 60N: Zone am anderen Ende der Welt
  await s.handleDemFiles([xyzFile('x.xyz', 4)]);
  assert.ok(g('dem-status').textContent.indexOf('außerhalb Europas') >= 0, g('dem-status').textContent);
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
