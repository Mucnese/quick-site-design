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
function test(name, fn) {
  try {
    fn();
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
  const el = {
    style: {},
    dataset: {},
    className: '',
    textContent: '',
    value: '',
    title: '',
    children: [],
    classList: {
      toggle: function () {}, add: function () {}, remove: function () {},
      contains: function () { return false; }
    },
    appendChild: function (c) { this.children.push(c); return c; },
    addEventListener: function () {},
    removeEventListener: function () {},
    getElementsByTagName: function () { return []; }
  };
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
    _byId: byId
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
    document: document,
    window: {
      innerWidth: 1024, innerHeight: 768, devicePixelRatio: 1,
      location: { search: '' },
      addEventListener: function () {}
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

  // const/let auf oberster Ebene hängen nicht am Sandbox-Objekt (Node-vm-
  // Eigenheit) - deshalb hier gezielt herausreichen, was die Tests lesen
  // müssen. Die Funktionen selbst (function-Deklarationen) sind bereits
  // direkt als sandbox.<name> erreichbar.
  vm.runInContext(
    'var __bridge = { STRINGS: STRINGS, TOOL_INFO: TOOL_INFO, FIELD_ORDER: FIELD_ORDER, ' +
    'DETAIL_STEPS: DETAIL_STEPS, SETTINGS: SETTINGS, DRAG_TOLERANCE: DRAG_TOLERANCE, ' +
    'REPEAT_GUARD: REPEAT_GUARD };',
    sandbox
  );

  sandbox.initScene({ appendChild: function () {} });
  sandbox.initSharedResources();
  sandbox.document = document;
  return sandbox;
}

/* ---------- Sprachen ---------- */

test('STRINGS: Deutsch und Englisch haben dieselben Schlüssel', function () {
  const s = newScope().__bridge.STRINGS;
  const de = Object.keys(s.de).sort();
  const en = Object.keys(s.en).sort();
  assert.deepStrictEqual(de, en);
});

/* ---------- Formulare: die FIELD_ORDER-Falle ---------- */

test('fieldRank: "select" hat Rang 0, kein ||-Kurzschluss macht daraus 9', function () {
  const s = newScope();
  assert.strictEqual(s.fieldRank('select'), 0);
  assert.strictEqual(s.fieldRank('range'), 1);
  assert.strictEqual(s.fieldRank('unbekannt'), 9);
});

test('sortFields: sortiert nach fieldRank, select vor allem anderen', function () {
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

test('detailLimit: die letzte Stufe ist maxGrid=0 ("Original"), kein Fallback auf die Voreinstellung', function () {
  const s = newScope();
  s.__bridge.SETTINGS.detail = s.__bridge.DETAIL_STEPS.length - 1;
  assert.strictEqual(s.detailLimit(), 0);
  assert.strictEqual(s.detailLabel(), s.T('original'));
});

/* ---------- Esc: erst der Stützpunkt, dann erst die Objektauswahl ---------- */

test('Esc mit aktivem Stützpunkt löst nur den Knoten, die Objektauswahl bleibt', function () {
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

test('groupKeyFor/buildGroups gruppieren Turmdrehkrane nach Modellnamen aus app.js', function () {
  const s = newScope();
  const p1 = s.defaultTowerParams();
  const p2 = s.defaultTowerParams();
  s.addObject('tower', 0, 0, p1);
  s.addObject('tower', 20, 0, p2);
  const groups = s.buildGroups();
  assert.strictEqual(groups.length, 1);
  assert.strictEqual(groups[0].key, s.getTowerModel(p1.model).name);
  assert.strictEqual(groups[0].ids.length, 2);
});

/* ---------- Zeigerbedienung: Toleranz und Wiederholungssperre ---------- */

test('Platzierung: Loslassen weit vom Startpunkt entfernt löst keinen Klick aus', function () {
  const s = newScope();
  let clicks = 0;
  s.onCanvasClick = function () { clicks++; };
  s.onCanvasPointerDown({ button: 0, clientX: 100, clientY: 100, pointerId: 1 });
  s.onCanvasPointerUp({ clientX: 100 + s.__bridge.DRAG_TOLERANCE + 1, clientY: 100, pointerId: 1 });
  assert.strictEqual(clicks, 0);
});

test('Platzierung: Loslassen innerhalb der Toleranz löst einen Klick aus', function () {
  const s = newScope();
  let clicks = 0;
  s.onCanvasClick = function () { clicks++; };
  s.onCanvasPointerDown({ button: 0, clientX: 100, clientY: 100, pointerId: 1 });
  s.onCanvasPointerUp({ clientX: 100 + s.__bridge.DRAG_TOLERANCE, clientY: 100, pointerId: 1 });
  assert.strictEqual(clicks, 1);
});

test('Platzierung: nur die linke Maustaste löst einen Druckvorgang aus', function () {
  const s = newScope();
  let clicks = 0;
  s.onCanvasClick = function () { clicks++; };
  s.onCanvasPointerDown({ button: 2, clientX: 100, clientY: 100, pointerId: 1 });
  s.onCanvasPointerUp({ clientX: 100, clientY: 100, pointerId: 1 });
  assert.strictEqual(clicks, 0);
});

test('Platzierung: Wiederholungssperre verhindert zwei Klicks innerhalb von 250 ms', function () {
  const s = newScope();
  let clicks = 0;
  s.onCanvasClick = function () { clicks++; };
  s.onCanvasPointerDown({ button: 0, clientX: 0, clientY: 0, pointerId: 1 });
  s.onCanvasPointerUp({ clientX: 0, clientY: 0, pointerId: 1 });
  s.onCanvasPointerDown({ button: 0, clientX: 0, clientY: 0, pointerId: 1 });
  s.onCanvasPointerUp({ clientX: 0, clientY: 0, pointerId: 1 });
  assert.strictEqual(clicks, 1, 'der zweite, unmittelbar folgende Klick muss gesperrt sein');
});

console.log(pass + ' bestanden, ' + fail + ' fehlgeschlagen');
process.exit(fail ? 1 : 0);
