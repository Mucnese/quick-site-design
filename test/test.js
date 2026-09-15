'use strict';
/* Tests für src/app.js: reine Berechnungen sowie die Bausteine über
   three-stub.js. Kein Browser nötig. Aufruf: node test/test.js */

global.window = { innerWidth: 1024, innerHeight: 768, devicePixelRatio: 1 };
global.THREE = require('./three-stub.js');
global.DOMParser = require('./xml-stub.js').DOMParser;

const assert = require('assert');
const app = require('../src/app.js');

let pass = 0, fail = 0;
function test(name, fn) {
  try {
    fn();
    pass++;
    console.log('  ok   ' + name);
  } catch (e) {
    fail++;
    console.log('  FEHL ' + name);
    console.log('        ' + e.message);
  }
}

function freshScene() {
  app.initScene({ appendChild: function () {} });
  app.initSharedResources();
  app.resetState();
}

/* ---------- Achsen: +x = Ost, -z = Nord ---------- */

test('worldToUTM ohne Gelände: +x = Ost, -z = Nord', function () {
  app.resetState();
  assert.deepStrictEqual(app.worldToUTM(10, -5), { e: 10, n: 5 });
});

test('worldToUTM/utmToWorld sind zueinander invers, sobald ein Gelände geladen ist', function () {
  freshScene();
  const t = app.terrainFromEmbedded({
    n: 4, heights: new Array(16).fill(1000), scale: 100,
    zmin: 500, zmax: 520, width: 40, depth: 40,
    originE: 692000, originN: 5336000, epsg: 25832
  });
  app.buildTerrain(t);
  const utm = app.worldToUTM(12, -7);
  assert.deepStrictEqual(utm, { e: 692012, n: 5336007 });
  const back = app.utmToWorld(utm.e, utm.n);
  assert.strictEqual(back.x, 12);
  assert.strictEqual(back.z, -7);
});

/* ---------- Gelände: Verschmelzen, Lücken, Detailstufe "Original" ---------- */

function makeTile(opts) {
  const W = opts.W, H = opts.H;
  const band = new Float32Array(W * H);
  for (let i = 0; i < band.length; i++) band[i] = opts.value === undefined ? 500 + (i % 7) : opts.value;
  return Object.assign({
    originX: 0, originY: H * (opts.resY || 1),
    W: W, H: H, resX: opts.resX || 1, resY: opts.resY || 1,
    band: band, nodata: null, epsg: 25832, name: opts.name || 'test.tif'
  }, opts.overrides || {});
}

test('gridTiles: maxGrid === 0 verwendet die Originalauflösung, kein "||"-Fallback auf MAX_GRID', function () {
  const tile = makeTile({ W: 500, H: 500 });
  const full = app.gridTiles([tile], 0);
  assert.strictEqual(full.nx, 500, 'bei 0 darf nicht vereinfacht werden');
  assert.strictEqual(full.simplified, false);

  const reduced = app.gridTiles([tile], 100);
  assert.ok(reduced.nx < 500, 'bei einer echten Zahl > 0 muss vereinfacht werden');
});

test('gridTiles: zwei überlappende Kacheln unterschiedlicher Auflösung verschmelzen', function () {
  const a = makeTile({ W: 100, H: 100, resX: 1, resY: 1, value: 500 });
  const b = makeTile({ W: 50, H: 50, resX: 2, resY: 2, value: 520,
    overrides: { originX: 20, originY: 100 } });
  const merged = app.gridTiles([a, b], 0);
  assert.ok(merged.nx > 0 && merged.nz > 0);
  assert.ok(merged.zmin <= 500 && merged.zmax >= 500);
});

test('fillGaps: isolierte Lücke wird aus den Nachbarn gemittelt, unerreichbare Zellen bekommen den Fallback', function () {
  const nx = 3, nz = 3;
  const arr = new Float32Array([
    1, 2, 3,
    4, NaN, 6,
    7, 8, 9
  ]);
  const filled = app.fillGaps(arr, nx, nz, -1);
  assert.strictEqual(filled, 1);
  assert.strictEqual(arr[4], (2 + 4 + 6 + 8 + 1 + 3 + 7 + 9) / 8);

  const allGap = new Float32Array(nx * nz).fill(NaN);
  app.fillGaps(allGap, nx, nz, -42);
  assert.ok(allGap.every(function (v) { return v === -42; }));
});

/* ---------- CityGML ---------- */

test('parseCityGML: Polygon/exterior/posList wird zu einem Ring', function () {
  const gml =
    '<CityModel xmlns:gml="http://www.opengis.net/gml">' +
    '<gml:Polygon><gml:exterior><gml:LinearRing>' +
    '<gml:posList>692000 5336000 500 692010 5336000 500 692010 5336010 500</gml:posList>' +
    '</gml:LinearRing></gml:exterior></gml:Polygon>' +
    '</CityModel>';
  const rings = app.parseCityGML(gml);
  assert.strictEqual(rings.length, 1);
  assert.deepStrictEqual(rings[0], [692000, 5336000, 500, 692010, 5336000, 500, 692010, 5336010, 500]);
});

test('parseCityGML: ohne Polygon greift der LinearRing-Fallback', function () {
  const gml = '<Surface><gml:LinearRing><gml:posList>0 0 0 1 0 0 1 1 0</gml:posList></gml:LinearRing></Surface>';
  const rings = app.parseCityGML(gml);
  assert.strictEqual(rings.length, 1);
});

test('parseCityGML: fehlerhaftes XML wirft eine verständliche Meldung', function () {
  assert.throws(function () { app.parseCityGML('<a><b></a>'); }, /gültiges XML/);
});

test('parseCityGML: ohne Gebäudeflächen wirft eine verständliche Meldung', function () {
  assert.throws(function () { app.parseCityGML('<CityModel></CityModel>'); }, /Gebäudeflächen/);
});

test('detectAxisOrder: erkennt vertauschte Rechts-/Hochwerte', function () {
  const originE = 692000, originN = 5336000;
  const direct = [[692005, 5336005, 500]];
  const swapped = [[5336005, 692005, 500]];
  assert.strictEqual(app.detectAxisOrder(direct, originE, originN).swap, false);
  assert.strictEqual(app.detectAxisOrder(swapped, originE, originN).swap, true);
});

/* ---------- Bausteine ---------- */

test('containerLayout: eine Reihe hat keinen Verbindungsbau, zwei Reihen schon', function () {
  const one = app.containerLayout(Object.assign(app.defaultContainerParams(), { rows: 1 }));
  assert.strictEqual(one.link, null);
  const two = app.containerLayout(Object.assign(app.defaultContainerParams(), { rows: 2 }));
  assert.ok(two.link !== null);
  assert.strictEqual(two.count, 2 * app.defaultContainerParams().cols * app.defaultContainerParams().levels);
});

test('Kranmodelle: 34 Turmdrehkrane (18 Liebherr, 16 WOLFFKRAN), 9 Mobilkrane', function () {
  assert.strictEqual(app.TOWER_MODELS.length, 34);
  const liebherr = app.TOWER_MODELS.filter(function (m) { return m.maker === 'Liebherr'; });
  const wolff = app.TOWER_MODELS.filter(function (m) { return m.maker === 'WOLFFKRAN'; });
  assert.strictEqual(liebherr.length, 18);
  assert.strictEqual(wolff.length, 16);
  assert.strictEqual(app.CRANE_MODELS.length, 9);
});

test('Kranmodelle: nicht belegte Felder stehen auf null, nicht auf einem erfundenen Wert', function () {
  const wolffOhneHookMax = app.TOWER_MODELS.filter(function (m) {
    return m.maker === 'WOLFFKRAN' && m.hookMax === null;
  });
  assert.ok(wolffOhneHookMax.length > 0, 'mindestens ein WOLFFKRAN-Modell sollte hookMax=null haben');
  app.TOWER_MODELS.forEach(function (m) {
    assert.ok(m.hookMax === null || (typeof m.hookMax === 'number' && isFinite(m.hookMax)),
      m.id + ': hookMax ist weder null noch eine Zahl');
  });
});

test('Baustraße: filletPath rundet Ecken und meldet den engsten Radius', function () {
  const pts = [{ x: 0, z: 0 }, { x: 20, z: 0 }, { x: 20, z: 20 }];
  const res = app.filletPath(pts, 5);
  assert.ok(res.minRadius <= 5 + 1e-6);
  assert.ok(res.path.length >= 3);
});

/* ---------- Szene: Krandrehung, Gebäude-Material, Auswahlrahmen, Stützpunkte ---------- */

test('Krandrehung (Turmdrehkran): g.rotation.y = baseRot, slew.rotation.y = rot - baseRot', function () {
  freshScene();
  const p = app.defaultTowerParams();
  p.baseRot = 30; p.rot = 100;
  const g = app.buildTowerCrane(p);
  assert.strictEqual(g.rotation.y, 30 * Math.PI / 180);
  const slew = g.children.find(function (c) { return c.name === 'slew'; });
  assert.ok(slew, 'slew-Gruppe fehlt');
  assert.strictEqual(slew.rotation.y, (100 - 30) * Math.PI / 180);
});

test('Krandrehung (Mobilkran): g.rotation.y = baseRot, slew.rotation.y = rot - baseRot', function () {
  freshScene();
  const p = app.defaultMobileParams();
  p.baseRot = 15; p.rot = 200;
  const g = app.buildMobileCrane(p);
  assert.strictEqual(g.rotation.y, 15 * Math.PI / 180);
  const slew = g.children.find(function (c) { return c.name === 'slew'; });
  assert.ok(slew, 'slew-Gruppe fehlt');
  assert.strictEqual(slew.rotation.y, (200 - 15) * Math.PI / 180);
});

test('Gebäude: MAT.building steht auf THREE.DoubleSide', function () {
  freshScene();
  const t = app.terrainFromEmbedded({
    n: 4, heights: new Array(16).fill(1000), scale: 100,
    zmin: 500, zmax: 520, width: 40, depth: 40,
    originE: 692000, originN: 5336000, epsg: 25832
  });
  app.buildTerrain(t);
  const e0 = 692000, n0 = 5336000;
  const ring = [e0 - 3, n0 - 3, 0, e0 + 3, n0 - 3, 0, e0 + 3, n0 + 3, 0];
  const mesh = app.buildBuildingsMesh([ring]);
  assert.strictEqual(mesh.material.side, global.THREE.DoubleSide);
});

test('Auswahlrahmen: aus userData.selBox aufgebaut, nicht aus einem BoxHelper', function () {
  freshScene();
  const obj = app.addObject('tower', 5, 5, app.defaultTowerParams());
  assert.ok(obj.group.userData.selBox, 'buildTowerCrane muss userData.selBox setzen');
  app.selectObjects([obj.id], false);
  app.updateSelectionBoxes();
  const box = app.getScene().children.find(function (c) { return c.name === '__selection'; });
  assert.ok(box, 'Auswahlrahmen wurde nicht zur Szene hinzugefügt');
  assert.strictEqual(box.kind, undefined); // LineSegments/Object3D, kein Geometrie-Objekt
});

test('showRoadNodes ruft dropNodeGroup auf: die Knotenauswahl bleibt beim Neuaufbau erhalten', function () {
  freshScene();
  const p = app.defaultRoadParams();
  p.points = [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 10 }];
  const obj = app.addObject('road', 0, 0, p);
  app.setActiveNode(1);
  app.showRoadNodes(obj);
  assert.strictEqual(app.activeRoadNode(), 1);
  app.showRoadNodes(obj); // erneuter Aufbau, z. B. nach dem Verschieben eines Punkts
  assert.strictEqual(app.activeRoadNode(), 1, 'dropNodeGroup darf die Knotenauswahl nicht löschen');
});

test('clearRoadNodes (anders als showRoadNodes) setzt die Knotenauswahl zurück', function () {
  freshScene();
  const p = app.defaultRoadParams();
  p.points = [{ x: 0, z: 0 }, { x: 10, z: 0 }];
  const obj = app.addObject('road', 0, 0, p);
  app.setActiveNode(0);
  app.showRoadNodes(obj);
  app.clearRoadNodes();
  assert.strictEqual(app.activeRoadNode(), null);
});

test('radiusConflicts: zwei Kräne mit sich überschneidenden Arbeitsradien werden gemeldet', function () {
  freshScene();
  const a = app.addObject('tower', 0, 0, app.defaultTowerParams());
  const b = app.addObject('tower', 5, 0, app.defaultTowerParams());
  const conflicts = app.radiusConflicts();
  assert.strictEqual(conflicts.length, 1);
  assert.deepStrictEqual([conflicts[0].a, conflicts[0].b].sort(), [a.id, b.id].sort());
});

console.log(pass + ' bestanden, ' + fail + ' fehlgeschlagen');
process.exit(fail ? 1 : 0);
