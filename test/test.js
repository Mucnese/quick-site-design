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

test('Kranmodelle: 24 Mobilkrane, Turmdrehkran ist ein generisches Modell ohne Katalog', function () {
  assert.strictEqual(app.CRANE_MODELS.length, 24);
  assert.strictEqual(app.TOWER_MODELS, undefined, 'kein Modellkatalog mehr für den Turmdrehkran');
});

test('CRANE_MODELS: axles stimmt mit der Achszahl aus der Modellbezeichnung überein (z. B. "-9.1" = 9 Achsen)', function () {
  app.CRANE_MODELS.forEach(function (m) {
    const match = m.name.match(/-(\d+)\.\d+$/);
    assert.ok(match, m.name + ': keine "-N.M"-Achsbezeichnung gefunden');
    assert.strictEqual(m.axles, parseInt(match[1], 10), m.name + ': axles passt nicht zur Bezeichnung');
  });
});

test('buildMobileCrane: Anzahl der Räder folgt der echten Achszahl, nicht der alten chassisL/3,2-Schätzung', function () {
  freshScene();
  // Die alte Schätzformel ergab für LTM 1750-9.1 (chassisL≈21,75) nur 7
  // Achsen statt der echten 9 - genau der vom Nutzer gemeldete Fehler.
  const m = app.CRANE_MODELS.find(function (x) { return x.id === 'ltm1750'; });
  const p = app.defaultMobileParams();
  p.model = m.id;
  const g = app.buildMobileCrane(p);
  const wheels = g.children.find(function (c) { return c.count === m.axles * 2; });
  assert.ok(wheels, 'InstancedMesh mit ' + (m.axles * 2) + ' Rädern (9 Achsen) nicht gefunden');
});

test('TOWER_LIMITS: Radius/Hakenhöhe bis 0 herunterregelbar, Hakenhöhe bis 120 m, Turmbreite 1–3,5 m (auf Wunsch angepasst)', function () {
  // radius.max stammt weiterhin aus den 34 früheren Herstellermodellen
  // (siehe Git-Historie); die übrigen Grenzen wurden auf ausdrücklichen
  // Wunsch erweitert (min auf 0, hookHeight.max auf 120, mastWidth auf
  // den ganzen Bereich 1–3,5 m statt nur 1,6–1,8 m).
  assert.deepStrictEqual(app.TOWER_LIMITS.radius, { min: 0, max: 91.4, def: 69.7 });
  assert.deepStrictEqual(app.TOWER_LIMITS.hookHeight, { min: 0, max: 120, def: 69.5 });
  assert.deepStrictEqual(app.TOWER_LIMITS.mastWidth, { min: 1, max: 3.5, def: 1.7 });
  ['radius', 'hookHeight', 'mastWidth'].forEach(function (key) {
    const l = app.TOWER_LIMITS[key];
    assert.ok(l.min <= l.def && l.def <= l.max, key + ': def liegt nicht zwischen min und max');
  });
});

test('defaultTowerParams: keine Modellwahl mehr, Vorgabewerte kommen aus TOWER_LIMITS', function () {
  const p = app.defaultTowerParams();
  assert.strictEqual(p.model, undefined);
  assert.strictEqual(p.hookHeight, app.TOWER_LIMITS.hookHeight.def);
  assert.strictEqual(p.radius, app.TOWER_LIMITS.radius.def);
  assert.strictEqual(p.mastWidth, app.TOWER_LIMITS.mastWidth.def);
});

test('buildTowerCrane: Hakenhöhe und Ausladung folgen dem Regler bis nahe 0, statt heimlich bei einem alten Mindestwert zu bleiben', function () {
  freshScene();
  const p = app.defaultTowerParams();
  p.hookHeight = 0;
  p.radius = 0;
  const g = app.buildTowerCrane(p);
  assert.ok(g.userData.hookHeight < 1, 'Hakenhöhe sollte der Vorgabe 0 sichtbar folgen, nicht bei 8 m verharren');
  assert.ok(g.userData.radius < 1, 'Ausladung sollte der Vorgabe 0 sichtbar folgen, nicht bei 10 m verharren');
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

/* ---------- IFC-Export: Rechteckauswahl, Georeferenz, STEP-Struktur ---------- */

function terrainForExportTests() {
  freshScene();
  const t = app.terrainFromEmbedded({
    n: 40, heights: new Array(1600).fill(1000), scale: 100,
    zmin: 500, zmax: 520, width: 200, depth: 200,
    originE: 692000, originN: 5336000, epsg: 25832
  });
  app.buildTerrain(t);
  return t;
}

/* Sammelt alle in einem IFC-STEP-Text definierten #IDs und prüft, dass
   jede Referenz (#123) auf eine davon zeigt – deckt kaputte Verweise
   zuverlässig auf, ohne eine echte Schema-Validierung zu sein. */
function checkStepReferencesResolve(ifcText) {
  const defined = new Set();
  ifcText.split('\n').forEach(function (line) {
    const m = line.match(/^#(\d+)=/);
    if (m) defined.add(parseInt(m[1], 10));
  });
  const refs = Array.from(ifcText.matchAll(/#(\d+)/g)).map(function (m) { return parseInt(m[1], 10); });
  const missing = refs.filter(function (r) { return !defined.has(r); });
  return { definedCount: defined.size, missing: missing };
}

test('terrainGridInRect: Punkte liegen innerhalb des angefragten Rechtecks', function () {
  terrainForExportTests();
  const tris = app.terrainGridInRect(-20, -15, 20, 15);
  assert.ok(tris.length > 0);
  tris.forEach(function (tri) {
    [tri.a, tri.b, tri.c].forEach(function (p) {
      assert.ok(p[0] >= -20.01 && p[0] <= 20.01, 'x außerhalb: ' + p[0]);
      assert.ok(p[2] >= -15.01 && p[2] <= 15.01, 'z außerhalb: ' + p[2]);
    });
  });
});

test('terrainGridInRect: Rechteck außerhalb des Geländes wirft eine verständliche Meldung', function () {
  terrainForExportTests();
  assert.throws(function () { app.terrainGridInRect(1000, 1000, 1010, 1010); }, /außerhalb/);
});

test('trianglesInRect: Filterung über den Dreiecksschwerpunkt', function () {
  const inside = { a: [1, 0, 1], b: [2, 0, 1], c: [1, 0, 2] };
  const outside = { a: [100, 0, 100], b: [101, 0, 100], c: [100, 0, 101] };
  const res = app.trianglesInRect([inside, outside], 0, 0, 10, 10);
  assert.deepStrictEqual(res, [inside]);
});

test('triangulateBuildingRings: erkennt Dach (annähernd waagerecht) und Wand', function () {
  terrainForExportTests();
  const e0 = 692000, n0 = 5336000;
  // Wand: senkrechte Fläche (zwei Höhen an derselben Position)
  const wall = [e0, n0, 505, e0 + 5, n0, 505, e0 + 5, n0, 515];
  // Dach: waagerechte Fläche
  const roof = [e0, n0, 515, e0 + 5, n0, 515, e0, n0 + 5, 515];
  const res = app.triangulateBuildingRings([wall, roof]);
  assert.strictEqual(res.triangles.length, 2);
  assert.strictEqual(res.triangles[0].isRoof, false);
  assert.strictEqual(res.triangles[1].isRoof, true);
});

test('collectExportGeometry: Gelände immer dabei, Gebäude nur innerhalb des Rechtecks', function () {
  terrainForExportTests();
  const e0 = 692000, n0 = 5336000;
  const near = [e0 - 3, n0 - 3, 505, e0 + 3, n0 - 3, 505, e0 + 3, n0 + 3, 505];
  const far = [e0 + 90, n0 + 90, 505, e0 + 96, n0 + 90, 505, e0 + 96, n0 + 96, 505];
  const geo = app.collectExportGeometry([near, far], -10, -10, 10, 10);
  assert.ok(geo.terrain.length > 0);
  assert.strictEqual(geo.buildings.length, 1, 'nur der nahe Ring sollte im Rechteck liegen');
});

test('buildIfc: erzeugt ein strukturell gültiges STEP-Dokument (alle Referenzen lösen auf)', function () {
  terrainForExportTests();
  const geo = app.collectExportGeometry(null, -10, -10, 10, 10);
  const ifc = app.buildIfc(geo, -10, -10, 25832);
  assert.ok(ifc.startsWith('ISO-10303-21;'));
  assert.ok(ifc.trim().endsWith('END-ISO-10303-21;'));
  assert.ok(ifc.indexOf('FILE_SCHEMA((\'IFC4\'))') >= 0);
  assert.ok(ifc.indexOf('IFCMAPCONVERSION') >= 0);
  const check = checkStepReferencesResolve(ifc);
  assert.deepStrictEqual(check.missing, [], 'nicht auflösbare Referenzen: ' + check.missing.join(','));
  assert.ok(check.definedCount > 0);
});

test('buildIfc: IfcMapConversion trägt die UTM-Koordinaten der Rechteck-Nordwestecke (minZ = am weitesten nördlich)', function () {
  terrainForExportTests();
  const geo = app.collectExportGeometry(null, -10, -10, 10, 10);
  const ifc = app.buildIfc(geo, -10, -10, 25832);
  const line = ifc.split('\n').find(function (l) { return l.indexOf('IFCMAPCONVERSION') >= 0; });
  // worldToUTM(-10,-10) bei originE=692000/originN=5336000
  assert.ok(line.indexOf('691990.') >= 0 && line.indexOf('5336010.') >= 0, line);
  assert.ok(ifc.indexOf('EPSG:25832') >= 0, 'IFCPROJECTEDCRS sollte den Quell-EPSG des Geländes tragen');
});

test('buildIfc: IfcMapConversion.OrthogonalHeight ist TERRAIN.zmin, nicht 0 (lokal Z=0 ist zmin, nicht 0 m ü. NHN)', function () {
  const t = terrainForExportTests(); // zmin = 500
  const geo = app.collectExportGeometry(null, -10, -10, 10, 10);
  const ifc = app.buildIfc(geo, -10, -10, 25832);
  const line = ifc.split('\n').find(function (l) { return l.indexOf('IFCMAPCONVERSION') >= 0; });
  assert.ok(line.indexOf(',' + t.zmin + '.,1.,0.,1.)') >= 0, line);
});

test('buildIfc: Achsen wie in IFC üblich - X=Ost, Y=Norden, Z=Höhe (im Szenengraphen: +x=Ost, -z=Nord, y=Höhe)', function () {
  terrainForExportTests();
  // ein einzelner Punkt reicht, um die Achszuordnung zu prüfen: 5 m Ost,
  // 3 m Höhe, 2 m nördlich (z=-2, da im Szenengraphen -z=Nord)
  const p = [5, 3, -2];
  const geo = { terrain: [{ a: p, b: [6, 3, -2], c: [5, 3, -3] }], buildings: [] };
  const ifc = app.buildIfc(geo, 0, 0, 25832);
  const line = ifc.split('\n').find(function (l) { return l.indexOf('IFCCARTESIANPOINTLIST3D') >= 0; });
  assert.ok(line.indexOf('(5.,2.,3.)') >= 0,
    'erwartet (Ost=5, Nord=2, Höhe=3): ' + line);
});

/* Zerlegt die Argumentliste einer STEP-Zeile auf oberster Ebene (Klammern
   und Zeichenketten werden respektiert). */
function stepArgs(line) {
  const body = line.slice(line.indexOf('(') + 1, line.lastIndexOf(')'));
  const args = [];
  let depth = 0, inStr = false, cur = '';
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (inStr) {
      cur += c;
      if (c === "'") { if (body[i + 1] === "'") { cur += "'"; i++; } else inStr = false; }
      continue;
    }
    if (c === "'") { inStr = true; cur += c; continue; }
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (c === ',' && depth === 0) { args.push(cur); cur = ''; continue; }
    cur += c;
  }
  args.push(cur);
  return args;
}

function ifcForFormatTests() {
  terrainForExportTests();
  const e0 = 692000, n0 = 5336000;
  const ring = [e0 - 3, n0 - 3, 505, e0 + 3, n0 - 3, 505, e0 + 3, n0 + 3, 512, e0 - 3, n0 + 3, 512];
  const geo = app.collectExportGeometry([ring], -10, -10, 10, 10);
  return { geo: geo, ifc: app.buildIfc(geo, -10, -10, 25832) };
}

test('buildIfc: Datei ist reines ASCII, Umlaute stehen als \\X2\\-Escape (sonst gilt die Datei vielen Lesern als beschädigt)', function () {
  const ifc = ifcForFormatTests().ifc;
  for (let i = 0; i < ifc.length; i++) {
    assert.ok(ifc.charCodeAt(i) < 128, 'Nicht-ASCII-Zeichen an Stelle ' + i + ': ' + ifc.slice(Math.max(0, i - 20), i + 5));
  }
  assert.ok(ifc.indexOf('\\X2\\00E4\\X0\\') >= 0, 'ä muss als \\X2\\00E4\\X0\\ geschrieben sein');
});

test('buildIfc: GUIDs sind gültige 22-Zeichen-Kompressionen (erstes Zeichen 0-3) und eindeutig', function () {
  const ifc = ifcForFormatTests().ifc;
  const alphabet = /^[0-9A-Za-z_$]{22}$/;
  const guids = [];
  ifc.split('\n').forEach(function (l) {
    if (!/^#\d+=IFC(PROJECT|SITE|RELAGGREGATES|RELCONTAINEDINSPATIALSTRUCTURE|GEOGRAPHICELEMENT|BUILDINGELEMENTPROXY)\(/.test(l)) return;
    guids.push(stepArgs(l)[0].replace(/'/g, ''));
  });
  assert.ok(guids.length >= 6);
  guids.forEach(function (g) {
    assert.ok(alphabet.test(g), 'ungültiges Zeichen/Länge: ' + g);
    assert.ok('0123'.indexOf(g[0]) >= 0, 'erstes Zeichen muss 0-3 sein: ' + g);
  });
  assert.strictEqual(new Set(guids).size, guids.length, 'GUIDs müssen eindeutig sein');
});

test('buildIfc: Attributanzahl der Entitäten passt zum IFC4-Schema (IfcGeographicElement fehlte das Tag)', function () {
  const ifc = ifcForFormatTests().ifc;
  const expected = {
    IFCGEOGRAPHICELEMENT: 9, IFCBUILDINGELEMENTPROXY: 9, IFCSITE: 14, IFCPROJECT: 9,
    IFCRELAGGREGATES: 6, IFCRELCONTAINEDINSPATIALSTRUCTURE: 6, IFCMAPCONVERSION: 8,
    IFCPROJECTEDCRS: 7, IFCTRIANGULATEDFACESET: 5, IFCOWNERHISTORY: 8,
    IFCGEOMETRICREPRESENTATIONSUBCONTEXT: 10
  };
  const seen = {};
  ifc.split('\n').forEach(function (l) {
    const m = l.match(/^#\d+=([A-Z0-9]+)\(/);
    if (!m || !expected[m[1]]) return;
    seen[m[1]] = true;
    assert.strictEqual(stepArgs(l).length, expected[m[1]], m[1] + ' hat ' + stepArgs(l).length + ' statt ' + expected[m[1]] + ' Attributen');
  });
  Object.keys(expected).forEach(function (k) { assert.ok(seen[k], k + ' fehlt in der Datei'); });
});

test('buildIfc: Eckpunkte werden zusammengefasst, nicht je Dreieck wiederholt', function () {
  const r = ifcForFormatTests();
  const line = r.ifc.split('\n').find(function (l) { return l.indexOf('IFCCARTESIANPOINTLIST3D') >= 0; });
  const pointCount = (line.match(/\),\(|\(\(/g) || []).length;
  assert.ok(pointCount < r.geo.terrain.length * 3 * 0.6, 'zu viele Punkte: ' + pointCount + ' für ' + r.geo.terrain.length + ' Dreiecke');
});

test('terrainGridInRect: Dreiecke zeigen nach oben (sonst blenden IFC-Betrachter das Gelände aus)', function () {
  terrainForExportTests();
  const tris = app.terrainGridInRect(-20, -15, 20, 15);
  tris.forEach(function (t) {
    const ux = t.b[0] - t.a[0], uy = t.b[1] - t.a[1], uz = t.b[2] - t.a[2];
    const vx = t.c[0] - t.a[0], vy = t.c[1] - t.a[1], vz = t.c[2] - t.a[2];
    const ny = uz * vx - ux * vz;   // y-Komponente von u x v
    assert.ok(ny > 0, 'Normale zeigt nicht nach oben: ' + ny);
  });
});

test('buildIfc: leerer Ausschnitt wirft eine verständliche Meldung', function () {
  terrainForExportTests();
  assert.throws(function () { app.buildIfc({ terrain: [], buildings: [] }, 0, 0, 25832); }, /Geometrie/);
});

/* ---------- Gelände: Kacheln mit Detailstufe nach Zoom ---------- */

function lodTerrain(cells) {
  freshScene();
  const n = (cells || 200) + 1, h = [];                       // 200 x 200 Zellen -> 4 x 4 Kacheln (64, 64, 64, 8)
  for (let iz = 0; iz < n; iz++) for (let ix = 0; ix < n; ix++) h.push((Math.sin(ix / 9) * 3 + Math.cos(iz / 7) * 2 + ix * 0.05) * 100 + 1000);
  const t = app.terrainFromEmbedded({
    n: n, heights: h, scale: 100, zmin: 500, zmax: 520, width: 2000, depth: 2000,
    originE: 692000, originN: 5336000, epsg: 25832
  });
  app.buildTerrain(t);
  return t;
}

function levels() { return app.getTerrainChunks().map(function (c) { return c.level; }); }

test('Gelände-LOD: Kacheln decken das Raster lückenlos ab (64er-Kacheln, Rest in der letzten)', function () {
  lodTerrain();
  const ch = app.getTerrainChunks();
  assert.strictEqual(ch.length, 16);
  assert.strictEqual(ch.filter(function (c) { return c.z0 === 0; }).reduce(function (a, c) { return a + c.cx; }, 0), 200);
  assert.strictEqual(ch.filter(function (c) { return c.x0 === 0; }).reduce(function (a, c) { return a + c.cz; }, 0), 200);
});

test('Gelände-LOD: nah volle Auflösung, weit weg gröber, bei ausgeschaltetem Automatikmodus überall voll', function () {
  lodTerrain();
  const cam = app.getCamera();
  cam.position.set(0, 20, 0);
  app.updateTerrainLod(true);
  const near = levels();
  cam.position.set(0, 4000, 0);
  app.updateTerrainLod(true);
  const far = levels();
  assert.ok(near.some(function (l) { return l === 0; }), 'in Bodennähe muss es Kacheln mit voller Auflösung geben');
  assert.ok(far.every(function (l, i) { return l >= near[i]; }), 'weiter weg darf nie feiner werden');
  assert.ok(Math.max.apply(null, far) > 0, 'weit weg muss gröber werden: ' + far);
  app.setTerrainLodAuto(false);
  assert.ok(levels().every(function (l) { return l === 0; }));
  app.setTerrainLodAuto(true);
  assert.ok(Math.max.apply(null, levels()) > 0);
});

test('Gelände-LOD: nahe Kacheln sind feiner als ferne (Abstand zur Kamera)', function () {
  lodTerrain(600);                                    // 3,3 m Zellen: die ferne Ecke wird merklich gröber
  const cam = app.getCamera();
  cam.position.set(-900, 60, -900);                  // über der Nordwest-Ecke
  app.updateTerrainLod(true);
  const ch = app.getTerrainChunks();
  const first = ch[0], last = ch[ch.length - 1];
  assert.ok(first.level < last.level, 'NW-Kachel ' + first.level + ' sollte feiner sein als SO-Kachel ' + last.level);
});

test('Gelände-LOD: Hysterese - kleine Kamerabewegungen lassen die Stufen unverändert (kein Flackern)', function () {
  lodTerrain();
  const cam = app.getCamera();
  cam.position.set(300, 500, 300);
  app.updateTerrainLod(true);
  const before = levels();
  cam.position.set(300.8, 500.4, 300.6);
  app.updateTerrainLod(false);
  assert.deepStrictEqual(levels(), before);
});

test('Gelände-LOD: Höhenabfragen hängen nicht von der Stufe ab, die Eckpunkte liegen auf dem Datenraster', function () {
  const t = lodTerrain();
  const cam = app.getCamera();
  const h0 = app.getHeightAt(123.4, -456.7);
  cam.position.set(0, 6000, 0);
  app.updateTerrainLod(true);
  assert.strictEqual(app.getHeightAt(123.4, -456.7), h0);
  const c = app.getTerrainChunks()[5];
  const g = c.mesh.geometry, pos = g.attributes.position.array;
  const seg = t.w / (t.nx - 1);
  for (let i = 0; i < 20; i++) {                               // erste Eckpunkte der Kachel
    const gx = Math.round((pos[i * 3] + t.w / 2) / seg), gz = Math.round((pos[i * 3 + 2] + t.d / 2) / seg);
    if (i >= (g.attributes.position.array.length / 3) - 1) break;
    assert.ok(Math.abs(pos[i * 3 + 1] - t.rel[gz * t.nx + gx]) < 1e-4 || pos[i * 3 + 1] < t.rel[gz * t.nx + gx], 'Eckpunkt weicht vom Datenraster ab');
  }
});

test('Gelände-LOD: jede Stufe liefert gültige Indizes, keine NaN, Gelände zeigt nach oben', function () {
  lodTerrain();
  const cam = app.getCamera();
  [20, 300, 1500, 8000].forEach(function (y) {
    cam.position.set(0, y, 0);
    app.updateTerrainLod(true);
    app.getTerrainChunks().forEach(function (c) {
      const g = c.mesh.geometry, pos = g.attributes.position.array, nv = pos.length / 3, idx = g.indices;
      for (let i = 0; i < pos.length; i++) assert.ok(isFinite(pos[i]), 'NaN in Kachel');
      idx.forEach(function (k) { assert.ok(k >= 0 && k < nv, 'Index außerhalb: ' + k + ' von ' + nv); });
      // Gitterdreiecke (vor den Schürzen) zeigen nach oben
      for (let k = 0; k + 2 < idx.length; k += 3) {
        const a = idx[k] * 3, b = idx[k + 1] * 3, d = idx[k + 2] * 3;
        const ny = (pos[b + 2] - pos[a + 2]) * (pos[d] - pos[a]) - (pos[b] - pos[a]) * (pos[d + 2] - pos[a + 2]);
        if (Math.abs(pos[a + 1] - pos[b + 1]) < 1e5 && ny < -1e-6 && Math.abs(pos[a] - pos[b]) + Math.abs(pos[a + 2] - pos[b + 2]) > 0) {
          // Schürzen stehen senkrecht (ny ~ 0); alles mit deutlich negativem ny wäre ein nach unten gewendetes Gelände
          assert.ok(false, 'Dreieck zeigt nach unten (' + ny + ') bei Kamerahöhe ' + y);
        }
      }
    });
  });
});

test('Gelände-LOD: Randschürzen liegen unter der Oberfläche (verdecken Spalten zwischen Stufen)', function () {
  lodTerrain();
  app.getCamera().position.set(0, 20, 0);
  app.updateTerrainLod(true);
  const g = app.getTerrainChunks()[0].mesh.geometry, pos = g.attributes.position.array;
  const nSurface = (65) * (65);
  let lowered = 0;
  for (let i = nSurface; i < pos.length / 3; i++) {
    const hSurf = pos[i * 3 + 1];
    assert.ok(hSurf < 25, 'Schürze müsste abgesenkt sein');
    lowered++;
  }
  assert.strictEqual(lowered, 4 * 65);
});

test('Gelände-LOD: buildTerrain räumt die alten Kachelgeometrien auf', function () {
  lodTerrain();
  const old = app.getTerrainChunks().map(function (c) { return c.mesh.geometry; });
  lodTerrain();
  assert.ok(old.every(function (g) { return g.disposed === true; }));
});

/* ---------- Baustraße: Längsneigung, Böschung 1:1, Auftrag/Abtrag ---------- */

function roadTerrain(ramp) {
  // 200 x 200 m, 21 x 21 Punkte; ramp = Anstieg in m je m in +x (0 = eben)
  freshScene();
  const n = 21, h = [];
  for (let iz = 0; iz < n; iz++) for (let ix = 0; ix < n; ix++) h.push(ix * 10 * ramp * 100 + 1000);
  const t = app.terrainFromEmbedded({
    n: n, heights: h, scale: 100, zmin: 500, zmax: 520, width: 200, depth: 200,
    originE: 692000, originN: 5336000, epsg: 25832
  });
  app.buildTerrain(t);
}

function roadAlongX(slope) {
  const p = app.defaultRoadParams();
  p.points = [{ x: -50, z: 0 }, { x: 50, z: 0 }];
  p.width = 6;
  if (slope !== undefined) p.slope = slope;
  return p;
}

test('autoRoadSlope: Straße entlang einer 10-%-Rampe bekommt 10 % (Anfangs- und Endhöhe auf dem Gelände)', function () {
  roadTerrain(0.1);
  assert.ok(Math.abs(app.autoRoadSlope(roadAlongX()) - 10) < 0.2, String(app.autoRoadSlope(roadAlongX())));
});

test('autoRoadSlope: eben = 0, gegen die Rampe = negativ, begrenzt auf ±ROAD_SLOPE_MAX', function () {
  roadTerrain(0);
  assert.strictEqual(app.autoRoadSlope(roadAlongX()), 0);
  roadTerrain(0.1);
  const p = roadAlongX();
  p.points.reverse();
  assert.ok(app.autoRoadSlope(p) < -9.5);
  roadTerrain(1);                                    // 100 %
  assert.strictEqual(app.autoRoadSlope(roadAlongX()), app.ROAD_SLOPE_MAX);
});

test('addObject(road): die Neigung wird automatisch eingetragen, nicht dem Zufall überlassen', function () {
  roadTerrain(0.1);
  const obj = app.addObject('road', 0, 0, roadAlongX());
  assert.ok(Math.abs(obj.params.slope - 10) < 0.2);
  assert.ok(Math.abs(obj.group.userData.slope - obj.params.slope) < 1e-9);
});

test('Baustraße folgt der Rampe mit passender Neigung: kein Auftrag, kein Abtrag', function () {
  roadTerrain(0.1);
  const rd = app.computeRoad(Object.assign(roadAlongX(), { slope: app.autoRoadSlope(roadAlongX()) }));
  assert.ok(rd.earthworks.fill < 5 && rd.earthworks.cut < 5,
    'Auftrag ' + rd.earthworks.fill + ', Abtrag ' + rd.earthworks.cut);
});

test('Baustraße: Fläche = Länge × Breite', function () {
  roadTerrain(0);
  const rd = app.computeRoad(roadAlongX(0));
  assert.ok(Math.abs(rd.length - 100) < 1e-6);
  assert.ok(Math.abs(rd.area - 600) < 1e-6);
  assert.ok(Math.abs(app.roadInfo(roadAlongX(0)).area - 600) < 1e-6);
});

test('Auftrag: +5 % auf ebenem Gelände ergibt genau das erwartete Volumen mit Böschung 1:1', function () {
  roadTerrain(0);
  const rd = app.computeRoad(roadAlongX(5));
  // Höhe über Gelände H(s) = 0,05 s; Querschnitt = Breite*H + 2 * H²/2 (zwei 1:1-Dreiecke)
  const L = 100, w = 6;
  const expected = w * 0.05 * L * L / 2 + 0.0025 * L * L * L / 3;
  assert.ok(Math.abs(rd.earthworks.fill - expected) / expected < 0.01,
    'Auftrag ' + rd.earthworks.fill.toFixed(1) + ' statt ' + expected.toFixed(1));
  assert.ok(rd.earthworks.cut < 1e-6, 'kein Abtrag erwartet: ' + rd.earthworks.cut);
});

test('Abtrag: -5 % auf ebenem Gelände spiegelt den Auftrag (gleiche Menge, anderes Material)', function () {
  roadTerrain(0);
  const up = app.computeRoad(roadAlongX(5)), down = app.computeRoad(roadAlongX(-5));
  assert.ok(Math.abs(down.earthworks.cut - up.earthworks.fill) / up.earthworks.fill < 0.01);
  assert.ok(down.earthworks.fill < 1e-6);
});

test('Böschung 1:1: die Böschungsbreite am Streckenende entspricht der Höhe über dem Gelände', function () {
  roadTerrain(0);
  const rd = app.computeRoad(roadAlongX(5));
  const H = 0.05 * 100;
  assert.ok(Math.abs(rd.earthworks.maxReach - H) < 0.3, 'Reichweite ' + rd.earthworks.maxReach + ' statt ' + H);
  assert.strictEqual(rd.earthworks.unreached, 0);
});

test('Straße genau auf dem Gelände: keine Böschung, Mengen null', function () {
  roadTerrain(0);
  const g = app.buildRoad(roadAlongX(0));
  assert.ok(g.userData.earthworks.fill < 1e-9 && g.userData.earthworks.cut < 1e-9);
  assert.strictEqual(g.userData.earthworks.maxReach, 0);
});

test('Neigungsregler: stärkere Neigung -> mehr Auftrag (monoton)', function () {
  roadTerrain(0);
  const a = app.computeRoad(roadAlongX(2)).earthworks.fill;
  const b = app.computeRoad(roadAlongX(4)).earthworks.fill;
  const c = app.computeRoad(roadAlongX(8)).earthworks.fill;
  assert.ok(a < b && b < c);
});

test('Straße am Hang quer zur Fahrtrichtung: Auftrag auf der Talseite, Abtrag auf der Bergseite', function () {
  // Gelände steigt nach +x; Straße läuft in z-Richtung auf Höhe des Hangs, eben
  roadTerrain(0.1);
  const p = app.defaultRoadParams();
  p.points = [{ x: 0, z: -50 }, { x: 0, z: 50 }];
  p.width = 6;
  p.slope = 0;
  const rd = app.computeRoad(p);
  assert.ok(rd.earthworks.fill > 10, 'Auftrag fehlt: ' + rd.earthworks.fill);
  assert.ok(rd.earthworks.cut > 10, 'Abtrag fehlt: ' + rd.earthworks.cut);
});

test('Straße verschieben oder Stützpunkt ändern: Neigung wird neu aus dem Gelände abgeleitet', function () {
  roadTerrain(0.1);
  const obj = app.addObject('road', 0, 0, roadAlongX());
  obj.params.slope = 0;
  app.moveRoadNode(obj, 1, 0, 0);          // Endpunkt 50 m zurück -> kürzer, aber auch bergauf
  assert.ok(obj.params.slope > 8, 'Neigung nicht neu eingepasst: ' + obj.params.slope);
});

function overlayKinds(g) {
  return g.children.map(function (c) { return c.userData && c.userData.kind; }).filter(Boolean).sort();
}

test('Abtrag: Böschung, eingegrabene Fahrbahn und Oberkante werden über dem Gelände sichtbar gemacht', function () {
  roadTerrain(0);
  const g = app.buildRoad(roadAlongX(-5));                  // sinkt unter das Gelände
  assert.deepStrictEqual(overlayKinds(g), ['cutCrest', 'cutOverlay', 'roadOverlay']);
});

test('Auftrag und ebene Straße brauchen keine Überlagerung (liegen über dem Gelände)', function () {
  roadTerrain(0);
  assert.deepStrictEqual(overlayKinds(app.buildRoad(roadAlongX(5))), []);
  assert.deepStrictEqual(overlayKinds(app.buildRoad(roadAlongX(0))), []);
});

test('measureScreenPos: Kameramatrizen werden VOR dem Projizieren aktualisiert (sonst hinkt die Beschriftung ein Bild hinterher)', function () {
  freshScene();
  app.setMeasureMarker(1, 2, 3);
  const cam = app.getCamera();
  const order = [];
  cam.updateMatrixWorld = function () { order.push('matrix'); };
  const origProject = THREE.Vector3.prototype.project;
  THREE.Vector3.prototype.project = function () { order.push('project'); return this; };
  try { app.measureScreenPos(); } finally { THREE.Vector3.prototype.project = origProject; }
  assert.deepStrictEqual(order, ['matrix', 'project']);
});

/* ---------- Kamera: Drehen um einen angeklickten Punkt ---------- */

function camSetup(pos, tgt) {
  freshScene();
  const cam = app.getCamera();
  cam.position.set(pos[0], pos[1], pos[2]);
  app.getControls().target.set(tgt[0], tgt[1], tgt[2]);
  app.getControls().maxPolarAngle = Math.PI * 0.492;
  return { cam: cam, ctl: app.getControls() };
}

function angleBetween(a, b) {
  const d = a.x * b.x + a.y * b.y + a.z * b.z;
  return Math.acos(d / Math.sqrt((a.x * a.x + a.y * a.y + a.z * a.z) * (b.x * b.x + b.y * b.y + b.z * b.z)));
}

test('orbitAround: Abstand zum Drehpunkt und zum Drehzentrum bleiben, der Punkt bleibt an seiner Stelle im Bild', function () {
  const k = camSetup([0, 120, 140], [0, 10, 0]);
  const pivot = { x: 40, y: 6, z: -25 };
  const dir = function (p) { return { x: p.x - k.cam.position.x, y: p.y - k.cam.position.y, z: p.z - k.cam.position.z }; };
  const angBefore = angleBetween(dir(k.ctl.target), dir(pivot));
  const dPivot = k.cam.position.distanceTo(new THREE.Vector3(pivot.x, pivot.y, pivot.z));
  const dTarget = k.cam.position.distanceTo(k.ctl.target);

  app.orbitAround(pivot, 0.7, -0.2);

  const dPivot2 = k.cam.position.distanceTo(new THREE.Vector3(pivot.x, pivot.y, pivot.z));
  assert.ok(Math.abs(dPivot - dPivot2) < 1e-6, 'Abstand zum Pivot geändert');
  assert.ok(Math.abs(dTarget - k.cam.position.distanceTo(k.ctl.target)) < 1e-6, 'Abstand zum Ziel geändert');
  assert.ok(Math.abs(angBefore - angleBetween(dir(k.ctl.target), dir(pivot))) < 1e-9,
    'der Pivot ist im Bild verrutscht (Ansicht würde springen)');
});

test('orbitAround: reine Azimutdrehung ändert die Kamerahöhe nicht, der Pivot selbst bleibt unverändert', function () {
  const k = camSetup([0, 80, 100], [0, 0, 0]);
  const y0 = k.cam.position.y;
  app.orbitAround({ x: 10, y: 0, z: 10 }, Math.PI / 2, 0);
  assert.ok(Math.abs(k.cam.position.y - y0) < 1e-9);
  // Relativ zum Pivot (-10, 80, 90) -> nach +90° um Y (90, 80, 10), absolut (100, 80, 20)
  assert.ok(Math.abs(k.cam.position.x - 100) < 1e-6 && Math.abs(k.cam.position.z - 20) < 1e-6,
    'erwartet (100, 20), war (' + k.cam.position.x + ', ' + k.cam.position.z + ')');
});

test('orbitAround: Kippen wird wie in OrbitControls auf maxPolarAngle begrenzt', function () {
  const k = camSetup([0, 50, 50], [0, 0, 0]);
  app.orbitAround({ x: 0, y: 0, z: 0 }, 0, 10);          // weit unter die Horizontale
  const o = { x: k.cam.position.x, y: k.cam.position.y, z: k.cam.position.z };
  const phi = Math.acos(o.y / Math.sqrt(o.x * o.x + o.y * o.y + o.z * o.z));
  assert.ok(phi <= Math.PI * 0.492 + 1e-9, 'Kippwinkel über Grenze: ' + phi);
  assert.ok(k.cam.position.y > 0, 'Kamera darf nicht unter den Pivot tauchen');
  app.orbitAround({ x: 0, y: 0, z: 0 }, 0, -10);         // weit über die Senkrechte
  assert.ok(k.cam.position.y > 0);
});

/* ---------- Dicke Vorschaulinien (Rechteckauswahl, Baustraße zeichnen) ---------- */

test('thickLine: eine Box je Segment, geschlossen eine mehr als offen', function () {
  freshScene();
  const pts = [
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0),
    new THREE.Vector3(10, 0, 10), new THREE.Vector3(0, 0, 10)
  ];
  const open = app.thickLine(pts, 1, {}, false);
  assert.strictEqual(open.children.length, 3, 'offene Linie: eine Box weniger als Punkte');
  const closed = app.thickLine(pts, 1, {}, true);
  assert.strictEqual(closed.children.length, 4, 'geschlossene Linie: eine Box je Kante');
});

test('thickLine: Boxrichtung folgt dem Segment (kein linewidth-Trick, echte Geometrie)', function () {
  const along = app.thickLine([new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 0, 0)], 1, {}, false);
  assert.ok(Math.abs(along.children[0].rotation.y) < 1e-9, 'entlang +x: keine Drehung nötig');

  const across = app.thickLine([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 5)], 1, {}, false);
  assert.ok(Math.abs(across.children[0].rotation.y - (-Math.PI / 2)) < 1e-9, 'entlang +z: 90° gedreht');
});

/* ---------- Draufsicht: keine Trägheitsdrehung ---------- */

test('Draufsicht schaltet die OrbitControls-Trägheit aus, sonst dreht sich die Ansicht nach einer Drehgeste von selbst weiter', function () {
  terrainForExportTests(); // frameTerrain() unten braucht ein geladenes Gelände
  const controls = app.getControls();
  assert.strictEqual(controls.enableDamping, true, 'zu Beginn wie gewohnt an');

  app.setTopView();
  app.updateControls();
  assert.strictEqual(controls.enableDamping, false,
    'in der Draufsicht liegt der Polarwinkel nahe 0 - dort ist die Kugelkoordinaten-Dämpfung instabil');

  app.frameTerrain();
  app.updateControls();
  assert.strictEqual(app.isTopView(), false);
  assert.strictEqual(controls.enableDamping, true, 'außerhalb der Draufsicht wieder wie gewohnt an');
});

console.log(pass + ' bestanden, ' + fail + ' fehlgeschlagen');
process.exit(fail ? 1 : 0);
