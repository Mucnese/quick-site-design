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

test('buildIfc: absolute Koordinaten - Rechtswert, Hochwert und Höhe ü. NHN stehen in der Geometrie, IfcMapConversion ist Nullversatz', function () {
  terrainForExportTests();
  const e0 = 692000, n0 = 5336000;
  const ring = [e0 - 3, n0 - 3, 505, e0 + 3, n0 - 3, 505, e0 + 3, n0 + 3, 512, e0 - 3, n0 + 3, 512];
  const geo = app.collectExportGeometry([ring], -10, -10, 10, 10);
  const abs = app.buildIfc(geo, -10, -10, 25832, { coords: 'abs' });
  const loc = app.buildIfc(geo, -10, -10, 25832, { coords: 'local' });
  const pointLists = function (ifc) { return ifc.split('\n').filter(function (l) { return /IFCCARTESIANPOINTLIST3D/.test(l); }); };
  const nums = function (line) { return line.slice(line.indexOf('LIST3D(') + 7).match(/-?\d+\.?\d*/g).map(Number); };
  const absPts = nums(pointLists(abs)[0]);
  const xs = absPts.filter(function (v, i) { return i % 3 === 0; }), ys = absPts.filter(function (v, i) { return i % 3 === 1; });
  assert.ok(Math.min.apply(null, xs) > 691900 && Math.max.apply(null, xs) < 692100, 'Rechtswerte absolut');
  assert.ok(Math.min.apply(null, ys) > 5335900 && Math.max.apply(null, ys) < 5336100, 'Hochwerte absolut');
  const locPts = nums(pointLists(loc)[0]);
  assert.ok(Math.max.apply(null, locPts.filter(function (v, i) { return i % 3 === 0; })) < 100, 'lokal bleibt klein');
  assert.ok(/IFCMAPCONVERSION\(#\d+,#\d+,0\.,0\.,0\.,1\.,0\.,1\.\)/.test(abs), 'Nullversatz in IfcMapConversion');
  assert.ok(/IFCMAPCONVERSION\(#\d+,#\d+,691990\.,5336010\.,500\./.test(loc), 'lokal trägt den Versatz');
});

test('buildIfc: IfcProjectedCRS nennt Beschreibung, Datum, Abbildung und Zone, IfcSite trägt Breite, Länge und Höhe', function () {
  const { ifc } = ifcForFormatTests();
  const crs = ifc.split('\n').filter(function (l) { return /IFCPROJECTEDCRS/.test(l); })[0];
  assert.ok(crs.indexOf("'EPSG:25832'") > 0 && crs.indexOf("'ETRS89 / UTM 32N'") > 0 && crs.indexOf("'ETRS89'") > 0 &&
            crs.indexOf("'TransverseMercator'") > 0 && crs.indexOf("'32N'") > 0, crs);
  const site = ifc.split('\n').filter(function (l) { return /IFCSITE/.test(l); })[0];
  assert.ok(/\.ELEMENT\.,\(48,\d+,\d+,\d+\),\(11,\d+,\d+,\d+\),500\./.test(site), site);
  const unknown = app.buildIfc(app.collectExportGeometry([[692000, 5336000, 505, 692003, 5336000, 505, 692003, 5336003, 505]], -10, -10, 10, 10), -10, -10, 12345);
  const site2 = unknown.split('\n').filter(function (l) { return /IFCSITE/.test(l); })[0];
  assert.ok(site2.indexOf('.ELEMENT.,$,$,$') > 0, 'ohne umrechenbares System bleiben Breite und Länge leer');
  const crs2 = unknown.split('\n').filter(function (l) { return /IFCPROJECTEDCRS/.test(l); })[0];
  assert.ok(crs2.indexOf("'EPSG:12345',$,$,$,$,$,") > 0, crs2);
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

test('Gelände-LOD: nah volle Auflösung, weit weg gröber', function () {
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

test('Böschung wählbar: 1:1, 1:1.5 und 1:2 ergeben das nachgerechnete Volumen (Querschnitt = Breite*H + n*H²)', function () {
  roadTerrain(0);
  assert.deepStrictEqual(app.EMBANKMENT_CHOICES, [1, 1.5, 2]);
  const L = 100, w = 6;
  [1, 1.5, 2].forEach(function (n) {
    const p = roadAlongX(5); p.embank = n;
    const rd = app.computeRoad(p);
    const expected = w * 0.05 * L * L / 2 + n * 0.0025 * L * L * L / 3;
    assert.ok(Math.abs(rd.earthworks.fill - expected) / expected < 0.01,
      '1:' + n + ': Auftrag ' + rd.earthworks.fill.toFixed(1) + ' statt ' + expected.toFixed(1));
    assert.ok(Math.abs(rd.earthworks.maxReach - n * 5) < 0.4, '1:' + n + ': Reichweite ' + rd.earthworks.maxReach);
    assert.strictEqual(rd.earthworks.embank, n);
  });
});

test('Böschung: flachere Neigung braucht mehr Material und reicht weiter (Auftrag und Abtrag)', function () {
  roadTerrain(0);
  [5, -5].forEach(function (slope) {
    const vol = [1, 1.5, 2].map(function (n) {
      const p = roadAlongX(slope); p.embank = n;
      const ew = app.computeRoad(p).earthworks;
      return { v: slope > 0 ? ew.fill : ew.cut, reach: ew.maxReach };
    });
    assert.ok(vol[0].v < vol[1].v && vol[1].v < vol[2].v, 'Menge nicht monoton bei ' + slope + ' %: ' + JSON.stringify(vol));
    assert.ok(vol[0].reach < vol[1].reach && vol[1].reach < vol[2].reach);
  });
});

test('Böschung: ohne oder mit ungültigem Wert gilt 1:1 (alte Straßen, kaputte Eingaben)', function () {
  roadTerrain(0);
  assert.strictEqual(app.defaultRoadParams().embank, 1);
  const ref = app.computeRoad(roadAlongX(5)).earthworks.fill;
  [undefined, null, 0, -2, 'x', NaN].forEach(function (bad) {
    const p = roadAlongX(5); p.embank = bad;
    assert.strictEqual(app.computeRoad(p).earthworks.fill, ref, String(bad));
  });
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

/* ---------- Kamera bleibt stehen, wo der Nutzer sie hingedreht hat ---------- */

function settle(n) { for (let i = 0; i < (n || 200); i++) app.updateControls(); }
function viewState() {
  const c = app.getCamera().position, t = app.getControls().target;
  return [c.x, c.y, c.z, t.x, t.y, t.z].map(function (v) { return +v.toFixed(6); });
}
function viewDir() {
  const c = app.getCamera().position, t = app.getControls().target;
  const dx = c.x - t.x, dy = c.y - t.y, dz = c.z - t.z, l = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return [dx / l, dy / l, dz / l];
}

test('Verschieben: Kamera und Drehzentrum bleiben stehen (kein Anfahren, keine Drehung der Ansicht)', function () {
  roadTerrain(0);
  const obj = app.addObject('container', 10, 10, app.defaultContainerParams());
  app.selectObject(obj.id);
  settle();
  const cam = app.getCamera();
  cam.position.set(180, 90, 220);
  app.getControls().target.set(10, 5, 10);
  const before = viewState();
  app.moveObject(obj, -60, 40);
  settle();
  assert.deepStrictEqual(viewState(), before);
});

test('Straße verschieben und Stützpunkt versetzen: Ansicht bleibt, auch wenn der Editor danach neu aufgebaut wird', function () {
  roadTerrain(0);
  const obj = app.addObject('road', 0, 0, roadAlongX(0));
  app.selectObject(obj.id);
  settle();
  app.getCamera().position.set(-150, 80, 160);
  app.getControls().target.set(0, 3, 0);
  const before = viewState();
  app.moveRoadNode(obj, 1, 60, 30);
  app.selectObject(obj.id);                 // so ruft showObjectEditor() auf
  app.moveObject(obj, 5, 5);
  app.selectObject(obj.id);
  settle();
  assert.deepStrictEqual(viewState(), before);
});

test('Neue Auswahl fährt weiterhin an, dieselbe Auswahl erneut nicht', function () {
  roadTerrain(0);
  const a = app.addObject('container', 0, 0, app.defaultContainerParams());
  const b = app.addObject('container', 80, 80, app.defaultContainerParams());
  app.selectObject(a.id); settle();
  const atA = viewState();
  app.selectObject(b.id); settle();
  assert.notDeepStrictEqual(viewState(), atA, 'anderes Objekt muss angefahren werden');
  const atB = viewState();
  app.selectObject(b.id); settle();
  assert.deepStrictEqual(viewState(), atB);
});

test('frameObjects mitten in einer Kamerafahrt: Blickrichtung bleibt die des Ziels, nicht die eines Zwischenstands', function () {
  roadTerrain(0);
  const pa = roadAlongX(0); pa.points = [{ x: 300, z: 300 }, { x: 400, z: 300 }];   // weit vom Zentrum entfernt
  const a = app.addObject('road', 0, 0, pa);
  const p2 = roadAlongX(0); p2.points = [{ x: -250, z: -200 }, { x: -200, z: -260 }];
  const b = app.addObject('road', 0, 0, p2);
  app.getCamera().position.set(300, 200, 100);
  app.getControls().target.set(0, 0, 0);
  const dir0 = viewDir();
  app.frameObjects([a]);
  settle(3);                                 // Fahrt läuft noch
  app.frameObjects([b]);
  settle(400);
  const d = viewDir();
  assert.ok(Math.abs(d[0] - dir0[0]) < 1e-3 && Math.abs(d[2] - dir0[2]) < 1e-3, 'Blickrichtung hat sich gedreht: ' + dir0 + ' -> ' + d);
});

/* ---------- Baugrube ---------- */

function square(x0, z0, w, d) { return [{ x: x0, z: z0 }, { x: x0 + w, z: z0 }, { x: x0 + w, z: z0 + d }, { x: x0, z: z0 + d }]; }
function lShape() { return [{ x: 0, z: 0 }, { x: 20, z: 0 }, { x: 20, z: 10 }, { x: 10, z: 10 }, { x: 10, z: 20 }, { x: 0, z: 20 }]; }
function triArea(pts, t) {
  const a = pts[t[0]], b = pts[t[1]], c = pts[t[2]];
  return Math.abs((b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x)) / 2;
}
function pitParams(points, depth) { const p = app.defaultPitParams(); p.points = points; if (depth !== undefined) p.depth = depth; return p; }

test('Polygon: Fläche, Punkt-im-Polygon (auch konkav)', function () {
  assert.strictEqual(app.polygonArea(square(0, 0, 20, 20)), 400);
  assert.strictEqual(app.polygonArea(lShape()), 300);
  assert.strictEqual(app.polygonArea(square(0, 0, 20, 20).reverse()), 400, 'Umlaufsinn darf nichts ändern');
  const L = lShape();
  assert.ok(app.pointInPolygon(L, 5, 15));
  assert.ok(app.pointInPolygon(L, 15, 5));
  assert.ok(!app.pointInPolygon(L, 15, 15), 'Einbuchtung der L-Form liegt außerhalb');
  assert.ok(!app.pointInPolygon(L, -1, 5));
});

test('triangulatePolygon: Quadrat 2, L-Form 4 Dreiecke, Flächen summieren sich, alle zeigen nach oben', function () {
  [[square(0, 0, 20, 20), 2], [lShape(), 4], [lShape().reverse(), 4]].forEach(function (c) {
    const pts = c[0], tris = app.triangulatePolygon(pts);
    assert.strictEqual(tris.length, c[1]);
    assert.ok(Math.abs(tris.reduce(function (a, t) { return a + triArea(pts, t); }, 0) - app.polygonArea(pts)) < 1e-9, 'Flächensumme');
    tris.forEach(function (t) {
      const a = pts[t[0]], b = pts[t[1]], d = pts[t[2]];
      assert.ok((b.x - a.x) * (d.z - a.z) - (b.z - a.z) * (d.x - a.x) <= 0, 'Dreieck zeigt nach unten');
    });
  });
  assert.deepStrictEqual(app.triangulatePolygon(square(0, 0, 1, 1).slice(0, 2)), []);
});

test('triangulatePolygon: sich selbst schneidendes Polygon liefert trotzdem Dreiecke (Notlösung Fächer)', function () {
  const bow = [{ x: 0, z: 0 }, { x: 10, z: 10 }, { x: 10, z: 0 }, { x: 0, z: 10 }];
  assert.ok(app.triangulatePolygon(bow).length >= 2);
});

test('Baugrube: Standardtiefe -5 m; ebene Grube 20 x 20 m ergibt genau 2000 m³ Aushub, keine Aufschüttung', function () {
  roadTerrain(0);
  assert.strictEqual(app.defaultPitParams().depth, -5);
  const info = app.computePit(pitParams(square(-10, -10, 20, 20)));
  assert.ok(Math.abs(info.cut - 2000) < 1, 'Aushub ' + info.cut);
  assert.ok(info.fill < 1e-6);
  assert.strictEqual(info.area, 400);
  assert.ok(Math.abs(info.bottom - (info.ref - 5)) < 1e-9);
});

test('Baugrube: Sohle über dem Gelände = Aufschüttung (+2 m: 800 m³), auf Geländehöhe nichts', function () {
  roadTerrain(0);
  const up = app.computePit(pitParams(square(-10, -10, 20, 20), 2));
  assert.ok(Math.abs(up.fill - 800) < 1 && up.cut < 1e-6, up.fill + ' / ' + up.cut);
  const zero = app.computePit(pitParams(square(-10, -10, 20, 20), 0));
  assert.ok(zero.cut < 1e-6 && zero.fill < 1e-6);
});

test('Baugrube am Hang: Aushub und Aufschüttung zugleich; Aushub minus Aufschüttung = -Tiefe * Fläche', function () {
  roadTerrain(0.1);                                   // 10 % Gefälle in x
  const pts = square(-20, -20, 40, 40);
  // Gelände schwankt um +-2 m um den Mittelwert; mit -1 m liegt ein Streifen darunter (Aufschüttung)
  const info = app.computePit(pitParams(pts, -1));
  assert.ok(info.cut > 100 && info.fill > 100, 'beides erwartet: ' + info.cut + ' / ' + info.fill);
  const net = info.cut - info.fill, expected = 1 * 1600;
  assert.ok(Math.abs(net - expected) / expected < 0.01, 'Netto ' + net + ' statt ' + expected);
});

test('Baugrube: absolute Höhe der Unterkante = zmin + mittleres Gelände + Tiefe, Bezugshöhe unabhängig von der Tiefe', function () {
  roadTerrain(0);
  const a = app.computePit(pitParams(square(-10, -10, 20, 20), -5)), b = app.computePit(pitParams(square(-10, -10, 20, 20), -8));
  assert.strictEqual(a.refAbs, b.refAbs);
  assert.ok(Math.abs(a.bottomAbs - (a.refAbs - 5)) < 1e-9 && Math.abs(b.bottomAbs - (a.refAbs - 8)) < 1e-9);
  assert.ok(Math.abs(a.refAbs - (500 + 10)) < 1e-6, 'zmin 500 + 10 m: ' + a.refAbs);
});

test('buildPit: Sohle auf Unterkantenhöhe, Wände, Ober- und Unterkante; Polygone unter 3 Punkten bleiben leer', function () {
  roadTerrain(0);
  const g = app.buildPit(pitParams(square(-10, -10, 20, 20)));
  const kinds = g.children.map(function (c) { return c.userData.kind; }).sort();
  assert.deepStrictEqual(kinds, ['pitBottomLine', 'pitFloor', 'pitRim', 'pitWalls']);
  const floor = g.children.filter(function (c) { return c.userData.kind === 'pitFloor'; })[0];
  const pos = floor.geometry.attributes.position.array;
  for (let i = 1; i < pos.length; i += 3) assert.ok(Math.abs(pos[i] - g.userData.pit.bottom) < 1e-6, 'Sohle nicht eben');
  assert.strictEqual(floor.geometry.indices.length, 6, 'Quadrat = 2 Dreiecke');
  assert.ok(g.userData.bbox.w === 20 && g.userData.bbox.d === 20);
  assert.strictEqual(app.buildPit(pitParams([{ x: 0, z: 0 }, { x: 5, z: 0 }])).children.length, 0);
});

test('buildPit: Wände reichen von der Geländeoberfläche bis zur Sohle (am Hang unterschiedlich hoch)', function () {
  roadTerrain(0.1);
  const g = app.buildPit(pitParams(square(-20, -20, 40, 40), -3));
  const walls = g.children.filter(function (c) { return c.userData.kind === 'pitWalls'; })[0];
  const pos = walls.geometry.attributes.position.array, bottom = g.userData.pit.bottom;
  let minTop = Infinity, maxTop = -Infinity;
  for (let i = 0; i < pos.length; i += 6) {
    assert.ok(Math.abs(pos[i + 4] - bottom) < 1e-6, 'unterer Wandpunkt liegt nicht auf der Sohle');
    minTop = Math.min(minTop, pos[i + 1]); maxTop = Math.max(maxTop, pos[i + 1]);
  }
  assert.ok(maxTop - minTop > 3, 'am Hang müssen die Oberkanten unterschiedlich hoch liegen');
});

test('Loch im Gelände: Baugrube trägt ihr Polygon in die Shader-Uniforms ein, Entfernen und Verschieben aktualisieren sie', function () {
  roadTerrain(0);
  const u = app.getPitUniforms();
  assert.strictEqual(u.uPitCount.value, 0);
  const obj = app.addObject('pit', 0, 0, pitParams(square(-10, -10, 20, 20)));
  assert.strictEqual(u.uPitCount.value, 1);
  assert.strictEqual(u.uPitN.value[0], 4);
  assert.deepStrictEqual(Array.from(u.uPitEdges.value.slice(0, 4)), [-10, -10, 10, -10], 'erste Kante (ax, az, bx, bz)');
  assert.ok(app.pitHoleContains(0, 0) && !app.pitHoleContains(30, 0));
  app.moveObject(obj, 40, 0);
  assert.ok(app.pitHoleContains(40, 0) && !app.pitHoleContains(0, 0), 'Loch muss mit der Grube wandern');
  app.removeObject(obj.id);
  assert.strictEqual(u.uPitCount.value, 0);
  assert.ok(!app.pitHoleContains(40, 0));
  assert.ok(Array.from(u.uPitEdges.value).every(function (v) { return v === 0; }), 'Kanten müssen zurückgesetzt sein');
});

test('Loch im Gelände: höchstens 32 Ecken je Grube und 6 Gruben gleichzeitig', function () {
  roadTerrain(0);
  const many = [];
  for (let i = 0; i < 40; i++) many.push({ x: 20 * Math.cos(i / 40 * 2 * Math.PI), z: 20 * Math.sin(i / 40 * 2 * Math.PI) });
  app.addObject('pit', 0, 0, pitParams(many));
  assert.strictEqual(app.getPitUniforms().uPitN.value[0], app.PIT_MAX_POINTS);
  for (let k = 0; k < 8; k++) app.addObject('pit', 0, 0, pitParams(square(-90 + k * 20, 60, 10, 10)));
  assert.strictEqual(app.getPitUniforms().uPitCount.value, app.PIT_MAX_HOLES);
});

test('Loch im Gelände: Shader verwirft Fragmente im Polygon (Uniforms, Schleife, discard eingespritzt)', function () {
  const sh = {
    uniforms: {},
    vertexShader: '#include <common>\nvoid main() {\n#include <begin_vertex>\n}',
    fragmentShader: '#include <common>\nvoid main() {\n#include <clipping_planes_fragment>\n}'
  };
  app.pitHoleShader(sh);
  assert.ok(sh.uniforms.uPitCount && sh.uniforms.uPitN && sh.uniforms.uPitEdges);
  assert.ok(sh.vertexShader.indexOf('varying vec2 vPitXZ') >= 0 && sh.vertexShader.indexOf('vPitXZ = position.xz') >= 0);
  assert.ok(sh.fragmentShader.indexOf('uniform vec4 uPitEdges[' + (app.PIT_MAX_HOLES * app.PIT_MAX_POINTS) + ']') >= 0);
  assert.ok(sh.fragmentShader.indexOf('if (pitInside()) discard;') > sh.fragmentShader.indexOf('#include <clipping_planes_fragment>'));
});

test('Klicks im Loch: weggeschnittene Geländestücke werden übersprungen, die Sohle wird getroffen', function () {
  roadTerrain(0);
  app.addObject('pit', 0, 0, pitParams(square(-10, -10, 20, 20)));
  const terrainInside = { point: { x: 0, y: 10, z: 0 }, object: { userData: { isTerrain: true } } };
  const floor = { point: { x: 0, y: 5, z: 0 }, object: { userData: { kind: 'pitFloor' } } };
  const terrainOutside = { point: { x: 50, y: 10, z: 0 }, object: { userData: { isTerrain: true } } };
  assert.strictEqual(app.firstVisibleHit([terrainInside, floor]), floor);
  assert.strictEqual(app.firstVisibleHit([terrainOutside, floor]), terrainOutside);
  assert.strictEqual(app.firstVisibleHit([terrainInside]), null);
  assert.strictEqual(app.firstVisibleHit([]), null);
});

test('Baugrube: Stützpunkte bearbeiten wie bei der Straße (versetzen, mindestens drei bleiben), Gelände-Loch folgt', function () {
  roadTerrain(0);
  const obj = app.addObject('pit', 0, 0, pitParams(square(-10, -10, 20, 20)));
  assert.ok(app.hasNodes(obj));
  assert.ok(app.moveRoadNode(obj, 2, 30, 30));
  assert.ok(app.pitHoleContains(25, 25), 'Loch muss dem versetzten Eckpunkt folgen');
  assert.strictEqual(app.getPitHoles()[0].length, 4);
  assert.ok(app.removeRoadNode(obj, 3), 'von vier auf drei Punkte');
  assert.strictEqual(app.removeRoadNode(obj, 0), false, 'unter drei Punkten bleibt alles');
  assert.strictEqual(obj.params.slope, undefined, 'Baugruben haben keine Längsneigung');
});

/* ---------- Punkt hinzufügen (Baustraße, Baugrube) ---------- */

function openRoad() {
  const p = roadAlongX(0); p.points = [{ x: 0, z: 0 }, { x: 100, z: 0 }, { x: 100, z: 100 }]; return p;
}

test('Punkt hinzufügen (Straße): wird in die nächstgelegene Strecke an der Klickstelle eingefügt', function () {
  roadTerrain(0);
  const obj = app.addObject('road', 0, 0, openRoad());
  assert.strictEqual(app.addRoadNode(obj, 50, 10), 1);
  assert.deepStrictEqual(obj.params.points, [{ x: 0, z: 0 }, { x: 50, z: 10 }, { x: 100, z: 0 }, { x: 100, z: 100 }]);
  assert.strictEqual(app.addRoadNode(obj, 108, 60), 3, 'liegt nahe der letzten Strecke (x = 100), davor eingefügt');
  assert.strictEqual(obj.params.points[3].x, 108);
  assert.strictEqual(obj.params.points.length, 5);
});

test('Punkt hinzufügen (Straße): jenseits von Anfang oder Ende wird vorn oder hinten angehängt', function () {
  roadTerrain(0);
  const a = app.addObject('road', 0, 0, openRoad());
  assert.strictEqual(app.addRoadNode(a, -30, -5), 0);
  assert.strictEqual(a.params.points[0].x, -30);
  const b = app.addObject('road', 0, 0, openRoad());
  assert.strictEqual(app.addRoadNode(b, 100, 140), 3);
  assert.strictEqual(b.params.points[3].z, 140);
  assert.strictEqual(b.params.points.length, 4);
});

test('Punkt hinzufügen (Straße): Geometrie wird neu gebaut, Neigung neu eingepasst, Auswahl der Stützpunkte gelöst', function () {
  roadTerrain(0.1);
  const obj = app.addObject('road', 0, 0, openRoad());
  obj.params.slope = 1;
  const lenBefore = obj.group.userData.length;
  app.addRoadNode(obj, 50, 40);                          // Umweg: Strecke wird länger
  assert.ok(obj.group.userData.length > lenBefore, 'Straße muss neu gebaut sein');
  assert.notStrictEqual(obj.params.slope, 1, 'Neigung wird aus dem Gelände neu abgeleitet');
  assert.strictEqual(app.activeRoadNode(), null);
});

test('Punkt hinzufügen (Baugrube): auch die Schlusskante zählt; Loch im Gelände folgt', function () {
  roadTerrain(0);
  const obj = app.addObject('pit', 0, 0, pitParams(square(0, 0, 20, 20)));
  assert.strictEqual(app.addRoadNode(obj, 2, 10), 4, 'Schlusskante (links, vom letzten zum ersten Punkt): ans Ende');
  assert.strictEqual(obj.params.points.length, 5);
  assert.deepStrictEqual(obj.params.points[4], { x: 2, z: 10 });
  assert.strictEqual(app.getPitUniforms().uPitN.value[0], 5, 'Loch hat jetzt fünf Kanten');
  assert.strictEqual(app.addRoadNode(obj, 10, -4), 1, 'obere Kante: zwischen Punkt 0 und 1');
  assert.strictEqual(obj.params.slope, undefined);
});

test('Punkt hinzufügen (Baugrube): bei 32 Ecken gibt es -1, sonst wächst nichts; Nicht-Punktobjekte ebenso', function () {
  roadTerrain(0);
  const pts = [];
  for (let i = 0; i < app.PIT_MAX_POINTS; i++) pts.push({ x: 20 * Math.cos(i / 32 * 2 * Math.PI), z: 20 * Math.sin(i / 32 * 2 * Math.PI) });
  const obj = app.addObject('pit', 0, 0, pitParams(pts));
  assert.strictEqual(app.addRoadNode(obj, 0, 0), -1);
  assert.strictEqual(obj.params.points.length, app.PIT_MAX_POINTS);
  const c = app.addObject('container', 0, 0, app.defaultContainerParams());
  assert.strictEqual(app.addRoadNode(c, 1, 1), -1);
});

/* ---------- Baugrube: Böschungswinkel ---------- */

function frustum(h, a1, a2) { return h / 3 * (a1 + a2 + Math.sqrt(a1 * a2)); }
function pitAt(points, depth, angle) { const p = pitParams(points, depth); p.angle = angle; return p; }

test('Böschungswinkel: Standard senkrecht (90°), Winkel wird auf 20..90 begrenzt, fehlender Wert gilt als senkrecht', function () {
  roadTerrain(0);
  assert.strictEqual(app.defaultPitParams().angle, 90);
  const sq = square(-10, -10, 20, 20);
  assert.strictEqual(app.computePit(pitAt(sq, -5, 10)).angle, 20, 'unter 20° wird auf 20° gesetzt');
  assert.strictEqual(app.computePit(pitAt(sq, -5, 120)).angle, 90);
  const old = pitParams(sq, -5); delete old.angle;
  assert.strictEqual(app.computePit(old).angle, 90, 'ältere Gruben ohne Winkel bleiben senkrecht');
  assert.ok(Math.abs(app.computePit(pitAt(sq, -5, 90)).cut - 2000) < 1);
});

test('Böschungswinkel: Oberkante bleibt, Sohle wird kleiner - 45° bei 5 m Tiefe: Sohle 10 x 10, Aushub = Pyramidenstumpf', function () {
  roadTerrain(0);
  const info = app.computePit(pitAt(square(-10, -10, 20, 20), -5, 45));
  assert.ok(Math.abs(info.floorArea - 100) < 0.01, 'Sohle ' + info.floorArea);
  const expected = frustum(5, 400, 100);
  assert.ok(Math.abs(info.cut - expected) / expected < 0.01, 'Aushub ' + info.cut + ' statt ' + expected);
  assert.ok(info.fill < 1e-6 && !info.clamped);
  info.floor.forEach(function (q) { assert.ok(Math.abs(Math.abs(q.x) - 5) < 1e-9 && Math.abs(Math.abs(q.z) - 5) < 1e-9, 'Sohlecke ' + q.x + ',' + q.z); });
});

test('Böschungswinkel: 60° (Versatz 5/tan 60°) und flacher = mehr Platz verbraucht, weniger Aushub', function () {
  roadTerrain(0);
  const sq = square(-10, -10, 20, 20);
  const a60 = app.computePit(pitAt(sq, -5, 60));
  const inset = 5 / Math.tan(60 * Math.PI / 180), side = 20 - 2 * inset;
  assert.ok(Math.abs(a60.floorArea - side * side) < 0.01);
  const expected = frustum(5, 400, side * side);
  assert.ok(Math.abs(a60.cut - expected) / expected < 0.01, 'Aushub ' + a60.cut + ' statt ' + expected);
  const v = [90, 75, 60, 45, 30].map(function (a) { return app.computePit(pitAt(sq, -5, a)).cut; });
  for (let i = 1; i < v.length; i++) assert.ok(v[i] < v[i - 1], 'Aushub muss mit flacherem Winkel sinken: ' + v);
});

test('Böschungswinkel bei Aufschüttung: die Platte verjüngt sich nach oben, Menge = Pyramidenstumpf', function () {
  roadTerrain(0);
  const info = app.computePit(pitAt(square(-10, -10, 20, 20), 2, 45));
  assert.ok(Math.abs(info.floorArea - 256) < 0.01, 'Plattenoberseite 16 x 16: ' + info.floorArea);
  const expected = frustum(2, 400, 256);
  assert.ok(Math.abs(info.fill - expected) / expected < 0.01 && info.cut < 1e-6, 'Aufschüttung ' + info.fill + ' statt ' + expected);
});

test('Böschungswinkel: zu schmale Grube - Sohle läuft nicht zusammen, wirksamer Winkel ist steiler und Mengen passen dazu', function () {
  roadTerrain(0);
  const narrow = square(-3, -10, 6, 20);
  const info = app.computePit(pitAt(narrow, -5, 45));
  assert.strictEqual(info.clamped, true);
  assert.ok(info.angleEff > 45 && info.angleEff < 90, 'wirksamer Winkel ' + info.angleEff);
  assert.ok(info.floorArea > 0 && info.floorArea < info.area);
  assert.ok(app.insetValid(narrow, info.floor), 'Sohle muss ein gültiges Polygon sein');
  // Gegenprobe: dieselbe Grube mit dem wirksamen Winkel von vornherein rechnet dasselbe
  const same = app.computePit(pitAt(narrow, -5, info.angleEff));
  assert.ok(Math.abs(same.cut - info.cut) / info.cut < 0.02, same.cut + ' vs ' + info.cut);
  assert.ok(info.cut < 600, 'weniger als senkrecht (600 m³)');
});

test('Böschungswinkel: Sohle einer L-förmigen Grube bleibt gültig und liegt innerhalb der Oberkante', function () {
  roadTerrain(0);
  const L = lShape();
  const info = app.computePit(pitAt(L, -3, 50));
  assert.strictEqual(info.clamped, false);
  assert.ok(app.insetValid(L, info.floor));
  assert.ok(info.floorArea < app.polygonArea(L));
  info.floor.forEach(function (q) { assert.ok(app.pointInPolygon(L, q.x, q.z), 'Sohlecke außerhalb: ' + q.x + ',' + q.z); });
});

test('Böschungswinkel am Hang: der Versatz richtet sich nach der örtlichen Tiefe (höheres Gelände = größerer Versatz)', function () {
  roadTerrain(0.1);                                   // Gelände steigt nach +x
  const info = app.computePit(pitAt(square(-20, -20, 40, 40), -3, 45));
  const east = info.floor.filter(function (q) { return q.x > 0; }).map(function (q) { return 20 - q.x; });
  const west = info.floor.filter(function (q) { return q.x < 0; }).map(function (q) { return q.x + 20; });
  assert.ok(Math.min.apply(null, east) > Math.max.apply(null, west), 'Ost (tiefer) ' + east + ' / West ' + west);
});

test('buildPit mit Böschung: Sohle auf Unterkantenhöhe und verkleinert, Wände verbinden Oberkante und Sohlkante', function () {
  roadTerrain(0);
  const g = app.buildPit(pitAt(square(-10, -10, 20, 20), -5, 45));
  const floor = g.children.filter(function (c) { return c.userData.kind === 'pitFloor'; })[0];
  const fpos = floor.geometry.attributes.position.array;
  for (let i = 0; i < fpos.length; i += 3) {
    assert.ok(Math.abs(fpos[i + 1] - g.userData.pit.bottom) < 1e-6);
    assert.ok(Math.abs(Math.abs(fpos[i]) - 5) < 1e-6 && Math.abs(Math.abs(fpos[i + 2]) - 5) < 1e-6, 'Sohle muss 10 x 10 sein');
  }
  const walls = g.children.filter(function (c) { return c.userData.kind === 'pitWalls'; })[0];
  const w = walls.geometry.attributes.position.array;
  for (let i = 0; i < w.length; i += 6) {
    const onRim = Math.abs(Math.abs(w[i]) - 10) < 1e-6 || Math.abs(Math.abs(w[i + 2]) - 10) < 1e-6;
    assert.ok(onRim, 'oberer Wandpunkt liegt nicht auf der Oberkante');
    const onFloor = Math.abs(Math.abs(w[i + 3]) - 5) < 1e-6 || Math.abs(Math.abs(w[i + 5]) - 5) < 1e-6;
    assert.ok(onFloor && Math.abs(w[i + 3]) <= 5 + 1e-6 && Math.abs(w[i + 5]) <= 5 + 1e-6, 'unterer Wandpunkt liegt nicht auf der Sohlkante');
    assert.ok(Math.abs(w[i + 4] - g.userData.pit.bottom) < 1e-6);
  }
});

test('Böschungswinkel: das Loch im Gelände folgt der Oberkante (nicht der Sohle)', function () {
  roadTerrain(0);
  app.addObject('pit', 0, 0, pitAt(square(-10, -10, 20, 20), -5, 45));
  assert.ok(app.pitHoleContains(9, 9), 'Ecke der Oberkante gehört zum Loch');
  assert.deepStrictEqual(Array.from(app.getPitUniforms().uPitEdges.value.slice(0, 4)), [-10, -10, 10, -10]);
});

test('Baugrube: Beschriftung nennt Fläche und Tiefe', function () {
  assert.strictEqual(app.labelFor('pit', pitParams(square(0, 0, 20, 20), -5)), 'Baugrube 400 m² · -5.0 m');
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

/* ---------- Schleppkurve Sattelzug ---------- */

/* Leitlinie wie auf dem Luzerner Blatt: gerade nach Osten, Bogen R rechtsrum um
   (0,0) mit Winkel alpha, danach gerade weiter. Welt: Norden = -z. */
function turnPath(R, alphaDeg, run, post) {
  const a = alphaDeg * Math.PI / 180, pts = [];
  for (let s = -run; s < 0; s += 1) pts.push({ x: s, z: -R });
  const n = Math.max(2, Math.ceil(a / 0.05));
  for (let i = 0; i <= n; i++) { const t = a * i / n; pts.push({ x: R * Math.sin(t), z: -R * Math.cos(t) }); }
  const e = pts[pts.length - 1], hx = Math.cos(a), hz = Math.sin(a);
  for (let s = 1; s <= post; s += 1) pts.push({ x: e.x + hx * s, z: e.z + hz * s });
  return pts;
}

test('Sattelzug: Gesamtlänge 16,50 m und Breite 2,55 m laut Blatt 736.107.2', function () {
  assert.ok(Math.abs(app.semiTruckLength() - 16.5) < 1e-9);
  assert.strictEqual(app.SEMI_TRUCK.width, 2.55);
  assert.strictEqual(app.SEMI_TRUCK.front, 1.25);
  assert.strictEqual(app.SEMI_TRUCK.wheelbase, 3.95);
  assert.strictEqual(app.SEMI_TRUCK.kingpinToFront, 2.07);
});

test('Sattelzug: gerade Straße - das Fahrzeug braucht genau seine Breite, 1,275 m je Seite', function () {
  const path = []; for (let x = 0; x <= 100; x += 2.5) path.push({ x: x, z: 0 });
  const r = app.checkSemiTruck(path, 6);
  assert.ok(Math.abs(r.left - 1.275) < 1e-6 && Math.abs(r.right - 1.275) < 1e-6, r.left + ' / ' + r.right);
  assert.ok(Math.abs(r.need - 2.55) < 1e-6);
  assert.strictEqual(r.fits, true);
  assert.strictEqual(r.over, 0);
});

test('Sattelzug: Kreisfahrt im eingeschwungenen Zustand - Radien von Hinterachse, Sattelzapfen und Anhängerachse', function () {
  const R = 15, pts = [];
  for (let i = 0; i <= 720; i++) { const t = i * Math.PI / 180 * 3; pts.push({ x: R * Math.sin(t), z: -R * Math.cos(t) }); }
  const v = app.SEMI_TRUCK;
  const sw = app.sweepSemiTruck(pts, v, 1);
  const st = sw.steps[sw.steps.length - 200];
  // Mittelpunkt des Kreises ist (0,0); Vorderachse läuft auf R
  const rr = Math.hypot(st.r[0], st.r[1]), rk = Math.hypot(st.k[0], st.k[1]), rt = Math.hypot(st.t[0], st.t[1]);
  const eR = Math.sqrt(R * R - v.wheelbase * v.wheelbase);
  const eK = Math.sqrt(eR * eR + v.kingpinAhead * v.kingpinAhead);
  const eT = Math.sqrt(eK * eK - v.kingpinToAxle * v.kingpinToAxle);
  assert.ok(Math.abs(rr - eR) < 0.01, 'Hinterachse ' + rr + ' statt ' + eR);
  assert.ok(Math.abs(rk - eK) < 0.01, 'Sattelzapfen ' + rk + ' statt ' + eK);
  assert.ok(Math.abs(rt - eT) < 0.02, 'Anhängerachse ' + rt + ' statt ' + eT);
});

test('Sattelzug: engere Kurve braucht mehr Breite, die Prüfung kippt mit der Fahrbahnbreite', function () {
  const need = function (R) { return app.checkSemiTruck(turnPath(R, 90, 30, 30), 20).need; };
  const n10 = need(10), n20 = need(20), n60 = need(60);
  assert.ok(n10 > n20 && n20 > n60 && n60 > 2.55, n10 + ' ' + n20 + ' ' + n60);
  const tight = app.checkSemiTruck(turnPath(10, 90, 30, 30), 5);
  assert.strictEqual(tight.fits, false);
  assert.ok(tight.over > 0.2, 'Überstand ' + tight.over);
  const wide = app.checkSemiTruck(turnPath(10, 90, 30, 30), 14);
  assert.strictEqual(wide.fits, true);
  assert.strictEqual(app.checkSemiTruck([{ x: 0, z: 0 }], 6), null);
});

test('Sattelzug: Ränder stimmen mit den Kurven des Luzerner Blatts überein (R = 10 m, 22,5 bis 180 Grad)', function () {
  // Aus dem Blatt gemessen (Vektorzeichnung, Maßstab 1:200): Höhe der Außenkante über der
  // Leitlinie im Bogeneintritt; Leitlinie liegt bei y = 10 m, Norden oben.
  const sheet = [[-10, 11.58], [-6, 12.04], [-3, 12.18], [0, 11.91], [3, 11.06]];
  const outlines = [22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180].map(function (a) {
    return app.sweptOutlines(app.sweepSemiTruck(turnPath(10, a, 40, 45), app.SEMI_TRUCK, 2), 0.1, 0.02);
  });
  sheet.forEach(function (row) {
    let top = -Infinity;
    outlines.forEach(function (loops) {
      loops.forEach(function (lp) { lp.forEach(function (q) { if (Math.abs(q.x - row[0]) < 0.12 && -q.z > top) top = -q.z; }); });
    });
    assert.ok(Math.abs(top - row[1]) < 0.12, 'x=' + row[0] + ': ' + top.toFixed(2) + ' statt ' + row[1]);
  });
});

test('Sattelzug: Umriss der überstrichenen Fläche ist eine geschlossene Schleife um das Fahrzeug', function () {
  const path = []; for (let x = 0; x <= 40; x += 2.5) path.push({ x: x, z: 0 });
  const loops = app.sweptOutlines(app.sweepSemiTruck(path, app.SEMI_TRUCK, 2), 0.2);
  assert.ok(loops.length >= 1);
  const big = loops.sort(function (a, b) { return b.length - a.length; })[0];
  let lo = Infinity, hi = -Infinity;
  big.forEach(function (q) { lo = Math.min(lo, q.z); hi = Math.max(hi, q.z); });
  assert.ok(Math.abs((hi - lo) - 2.55) < 0.45, 'Breite ' + (hi - lo));
});

test('Schleppkurve in der Baustraße: ohne Schalter nichts, mit Schalter Fläche und Rand; zu schmal gibt roten Rand', function () {
  roadTerrain(0);
  const base = function (width, on) {
    const p = app.defaultRoadParams();
    p.points = [{ x: -60, z: -10 }, { x: -10, z: -10 }, { x: -10, z: 50 }];
    p.radius = 10; p.width = width; p.slope = 0; p.showSwept = on;
    return app.buildRoad(p);
  };
  const off = base(6, false);
  assert.strictEqual(off.userData.swept, undefined);
  assert.ok(overlayKinds(off).indexOf('sweptFill') < 0);
  const ok = base(9, true);
  assert.ok(ok.userData.swept && ok.userData.swept.fits, JSON.stringify(ok.userData.swept));
  assert.deepStrictEqual(overlayKinds(ok).filter(function (k) { return k.indexOf('swept') === 0; }), ['sweptFill', 'sweptLine']);
  const narrow = base(4.5, true);
  assert.strictEqual(narrow.userData.swept.fits, false);
  assert.ok(narrow.userData.swept.over > 0.3);
  assert.ok(overlayKinds(narrow).indexOf('sweptOver') >= 0, 'roter Rand fehlt');
  assert.strictEqual(app.defaultRoadParams().showSwept, false);
});

/* ---------- Karte (OpenStreetMap) ---------- */

test('Karte: Umrechnung ins Längen-/Breitengrad stimmt mit PROJ (pyproj 3.8) überein', function () {
  // [EPSG, Rechts, Hoch, Länge, Breite] - Referenzwerte aus pyproj; Bessel-Systeme (DHDN, MGI) hängen vom
  // Datumsübergang ab und werden auf 1 m verglichen, alle anderen auf 5 cm.
  const ref = [
    [25832, 713500, 5420500, 11.9133363, 48.9006176], [25832, 500000, 5400000, 9.0, 48.753013],
    [25833, 380000, 5800000, 13.2386841, 52.3371646], [25831, 420000, 5600000, 1.8708633, 50.5464582],
    [4647, 32501000, 5300000, 9.0133678, 47.8533412], [32632, 700000, 5000000, 11.5431235, 45.1251538],
    [3857, 1288000, 6130000, 11.5703009, 48.1389358],
    [31467, 3502000, 5400000, 9.0261611, 48.7375361], [31466, 2600000, 5600000, 7.4096916, 50.5271955],
    [31468, 4400000, 5700000, 10.5607137, 51.4258267],
    [31255, 60000, 340000, 14.1396154, 48.1955024], [31255, -20000, 300000, 13.0654009, 47.8382504],
    [31254, -100000, 230000, 9.0132367, 47.2012429], [31256, 50000, 330000, 17.0035377, 48.1065382]
  ];
  ref.forEach(function (r) {
    const g = app.crsToLonLat(r[0], r[1], r[2]);
    const dm = Math.hypot((g.lon - r[3]) * 111320 * Math.cos(r[4] * Math.PI / 180), (g.lat - r[4]) * 110540);
    const tol = (r[0] >= 31254 && r[0] <= 31469) ? 1 : 0.05;
    assert.ok(dm < tol, 'EPSG:' + r[0] + ' weicht ' + dm.toFixed(3) + ' m ab');
  });
  assert.strictEqual(app.crsToLonLat(99999, 1, 1), null);
  assert.strictEqual(app.crsGeoDefinition(4326), null, 'Grad-Systeme gehen nicht als Geländebezug durch');
});

test('Karte: Kachelplan für ein 1000-m-Gelände in EPSG:25832 - höchstens 36 Kacheln, Abbildung trifft die Mitte', function () {
  const t = { w: 1000, d: 1000, originE: 713500, originN: 5420500, epsg: 25832 };
  const plan = app.osmMapPlan(t);
  assert.ok(plan.tiles.length >= 1 && plan.tiles.length <= app.OSM_MAX_TILES, plan.tiles.length + ' Kacheln');
  assert.ok(plan.z >= 16 && plan.z <= 19, 'Zoom ' + plan.z);
  assert.ok(Math.abs(plan.center.lon - 11.9133363) < 1e-6 && Math.abs(plan.center.lat - 48.9006176) < 1e-6);
  assert.ok(plan.tiles[0].url.indexOf('https://tile.openstreetmap.org/' + plan.z + '/') === 0, plan.tiles[0].url);
  // Mitte des Geländes (0,0) liegt im Bild und genau dort, wo die Mercator-Rechnung sie hinlegt
  const u = plan.u[2], v = plan.v[2];
  assert.ok(u > 0 && u < 1 && v > 0 && v < 1, u + ' ' + v);
  const lat = plan.center.lat * Math.PI / 180;
  const mx = (plan.center.lon + 180) / 360 * Math.pow(2, plan.z), my = (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2 * Math.pow(2, plan.z);
  assert.ok(Math.abs((mx - plan.tx0) * 256 / plan.W - u) < 0.5 / plan.W, 'u der Mitte');
  assert.ok(Math.abs(1 - (my - plan.ty0) * 256 / plan.H - v) < 0.5 / plan.H, 'v der Mitte');
  // Norden ist oben im Bild: -z (Norden) vergrößert v
  assert.ok(plan.v[1] < 0, 'Süd (+z) liegt im Bild unten');
  assert.ok(plan.affineError < 0.5, 'affine Abweichung ' + plan.affineError + ' m');
});

test('Karte: sehr großes Gelände bekommt eine niedrigere Zoomstufe, unbekanntes Bezugssystem gibt null', function () {
  const small = app.osmMapPlan({ w: 1000, d: 1000, originE: 500000, originN: 5400000, epsg: 25832 });
  const big = app.osmMapPlan({ w: 40000, d: 40000, originE: 500000, originN: 5400000, epsg: 25832 });
  assert.ok(big.z < small.z && big.tiles.length <= app.OSM_MAX_TILES, big.z + ' / ' + small.z);
  assert.strictEqual(app.osmMapPlan({ w: 1000, d: 1000, originE: 0, originN: 0, epsg: 12345 }), null);
  assert.strictEqual(app.osmMapPlan(null), null);
});

test('Karte: Shader färbt das Gelände nach der Karte und behält das Baugruben-Loch', function () {
  const shader = {
    uniforms: {},
    vertexShader: '#include <common>\n#include <begin_vertex>',
    fragmentShader: '#include <common>\n#include <clipping_planes_fragment>\n#include <color_fragment>'
  };
  app.mapShader(shader);
  assert.ok(shader.fragmentShader.indexOf('uniform sampler2D uMapTex') >= 0);
  assert.ok(shader.fragmentShader.indexOf('texture2D(uMapTex, muv).rgb * uMapScale') > shader.fragmentShader.indexOf('#include <color_fragment>'), 'Karte wird gegen die Überbelichtung durch die Szenenlichter abgedunkelt');
  ['uMapOn', 'uMapScale', 'uMapTex', 'uMapU', 'uMapV'].forEach(function (k) { assert.ok(shader.uniforms[k], k); });
  const both = { uniforms: {}, vertexShader: shader.vertexShader.replace(/[\s\S]*/, '#include <common>\n#include <begin_vertex>'),
                 fragmentShader: '#include <common>\n#include <clipping_planes_fragment>\n#include <color_fragment>' };
  app.pitHoleShader(both); app.mapShader(both);
  assert.ok(both.fragmentShader.indexOf('discard') > 0 && both.fragmentShader.indexOf('uMapOn') > 0);
});

/* ---------- Größengrenzen beim Einlesen von GeoTIFFs ---------- */

function fakeTiffOf(w, h, onRead) {
  return {
    fromArrayBuffer: function () {
      return Promise.resolve({
        getImage: function () {
          return Promise.resolve({
            getWidth: function () { return w; }, getHeight: function () { return h; },
            readRasters: function () { onRead(); return Promise.resolve([new Float32Array(4)]); },
            getOrigin: function () { return [0, 0]; }, getResolution: function () { return [1, 1]; },
            getFileDirectory: function () { return {}; }, getGeoKeys: function () { return { ProjectedCSTypeGeoKey: 25832 }; }
          });
        }
      });
    }
  };
}

test('GeoTIFF: Dateien über 1 GB oder zusammen über 2 GB werden vor dem Lesen abgelehnt', function () {
  app.checkTiffFiles([{ name: 'a.tif', size: 50e6 }, { name: 'b.tif', size: 900e6 }]);
  assert.throws(function () { app.checkTiffFiles([{ name: 'gross.tif', size: 1.9e9 }]); },
    function (e) { return /gross\.tif/.test(e.message) && /1\.9 GB/.test(e.message) && /gdal_translate/.test(e.message); });
  assert.throws(function () { app.checkTiffFiles([{ name: 'a', size: 900e6 }, { name: 'b', size: 900e6 }, { name: 'c', size: 900e6 }]); },
    function (e) { return /zusammen/.test(e.message); });
  app.checkTiffFiles([{ name: 'ohne-groesse.tif' }]);
});

test('GeoTIFF: zu große Kachel wird nach den Kopfdaten abgelehnt, ohne das Raster zu entpacken', async function () {
  let reads = 0;
  global.GeoTIFF = fakeTiffOf(20000, 6000, function () { reads++; });      // 120 Mio. Pixel
  await assert.rejects(app.readTiffTile(new ArrayBuffer(0), 'bev.tif'),
    function (e) { return /120 Mio\./.test(e.message) && /gdal_translate/.test(e.message); });
  assert.strictEqual(reads, 0, 'readRasters darf nicht aufgerufen werden');
  global.GeoTIFF = fakeTiffOf(8000, 8000, function () { reads++; });       // 64 Mio. Pixel: erlaubt
  const t = await app.readTiffTile(new ArrayBuffer(0), 'ok.tif');
  assert.strictEqual(t.W, 8000);
  assert.strictEqual(reads, 1);
  delete global.GeoTIFF;
});

test('GeoTIFF: die Gesamtgrenze für mehrere Kacheln greift, bevor die dritte entpackt wird', async function () {
  let reads = 0;
  global.GeoTIFF = fakeTiffOf(8000, 8000, function () { reads++; });       // je 64 Mio., Grenze gesamt 150 Mio.
  await assert.rejects(app.readTiffTiles([
    { buffer: new ArrayBuffer(0), name: 'k1.tif' }, { buffer: new ArrayBuffer(0), name: 'k2.tif' }, { buffer: new ArrayBuffer(0), name: 'k3.tif' }]),
    function (e) { return /k3\.tif/.test(e.message) && /192 Mio\./.test(e.message); });
  assert.strictEqual(reads, 2);
  delete global.GeoTIFF;
});

/* ---------- XYZ-Textdateien ---------- */

function xyzBuf(text) { return new Uint8Array(Buffer.from(text, 'utf8')); }

test('XYZ: Kopfzeile, CRLF, Tabulator, Komma, Semikolon und Exponent werden gelesen, Textzeilen übersprungen', function () {
  const p = app.parseXyz(xyzBuf('Rechts Hoch Hoehe\r\n500000.5\t5400000.5\t100.25\r\n500001.5,5400000.5,101\r\n\r\n500002.5;5400000.5;1.5e2\r\n# Kommentar\r\n  500003.5   5400000.5   -2.5  \r\n'), 'a.xyz');
  assert.strictEqual(p.n, 4);
  assert.deepStrictEqual([p.xs[0], p.ys[0], p.zs[0]], [500000.5, 5400000.5, 100.25]);
  assert.strictEqual(p.zs[2], 150);
  assert.strictEqual(p.zs[3], -2.5);
});

test('XYZ: regelmäßiges Raster wird zur Kachel - Zellmitten, Ursprung oben links, Lücken als NoData, beliebige Reihenfolge', function () {
  // 3 Spalten (Abstand 2 m) x 2 Zeilen (Abstand 1 m), Spalte für Spalte sortiert, ein Punkt fehlt
  const pts = [[500000, 5400001, 1], [500000, 5400000, 2], [500002, 5400001, 3], [500004, 5400001, 5], [500004, 5400000, 6]];
  const t = app.readXyzTile(xyzBuf(pts.map(function (q) { return q.join(' '); }).join('\n')), 'b.xyz', 25832, 0);
  assert.strictEqual(t.W, 3); assert.strictEqual(t.H, 2);
  assert.strictEqual(t.resX, 2); assert.strictEqual(t.resY, 1);
  assert.strictEqual(t.originX, 499999);          // linke Kante = erste Zellmitte - halbe Zelle
  assert.strictEqual(t.originY, 5400001.5);
  assert.deepStrictEqual(Array.from(t.band), [1, 3, 5, 2, -9999, 6]);
  assert.strictEqual(t.nodata, -9999);
  assert.strictEqual(t.epsg, 25832);
});

test('XYZ: Fehler - kein EPSG, ESRI-ASCII-Raster, Streupunkte ohne Raster, zu viele Zeilen', function () {
  assert.throws(function () { app.readXyzTile(xyzBuf('1 2 3\n2 2 3\n1 3 3\n2 3 3\n'), 'c.xyz', null, 0); }, /Bezugssystem/);
  assert.throws(function () { app.readXyzTile(xyzBuf('ncols 4\nnrows 3\nxllcorner 1\n'), 'd.xyz', 25832, 0); }, /ESRI-ASCII/);
  let txt = ''; for (let i = 0; i < 40; i++) txt += (500000 + i * 7.3 + (i * i) % 11) + ' ' + (5400000 + i * 13.1) + ' ' + i + '\n';
  assert.throws(function () { app.readXyzTile(xyzBuf(txt), 'e.xyz', 25832, 0); }, /kein regelmäßiges Raster/);
  assert.throws(function () { app.parseXyz(new Uint8Array(Buffer.alloc(app.XYZ_MAX_POINTS + 2000, 10)), 'f.xyz'); }, /Mio\. Zeilen/);
  assert.strictEqual(app.isXyzName('A.XYZ'), true);
  assert.strictEqual(app.isXyzName('kachel.tif'), false);
});

test('XYZ: zwei Kacheln werden verschmolzen und tragen den gewählten EPSG-Code, GeoTIFF und XYZ lassen sich mischen', async function () {
  const grid = function (x0, n) { let t = ''; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) t += (x0 + i + 0.5) + ' ' + (5400000 - j - 0.5) + ' ' + (100 + i + j) + '\n'; return t; };
  const items = [{ name: 'k1.xyz', buffer: xyzBuf(grid(500000, 4)).buffer }, { name: 'k2.xyz', buffer: xyzBuf(grid(500004, 4)).buffer }];
  const tiles = await app.readTiffTiles(items, 25833);
  const t = app.gridTiles(tiles, 0);
  assert.strictEqual(t.epsg, 25833);
  assert.strictEqual(Math.round(t.w), 8);
  assert.strictEqual(Math.round(t.d), 4);
  await assert.rejects(app.readTiffTiles(items, null), /Bezugssystem/);
});

/* ---------- Standortsuche ---------- */

const photonSample = { features: [
  { geometry: { coordinates: [11.5771547, 48.1366223] }, properties: { name: 'Marienplatz', street: undefined, postcode: '80331', city: 'München', state: 'Bayern', countrycode: 'DE' } },
  { geometry: { coordinates: [11.5759, 48.137] }, properties: { name: 'Marienplatz', postcode: '80331', city: 'München', state: 'Bayern', countrycode: 'DE' } },
  { geometry: { coordinates: [8.5, 47.3] }, properties: { name: 'Marienplatz', city: 'Zürich', state: 'Zürich', countrycode: 'CH' } },
  { geometry: { coordinates: [11.39, 47.26] }, properties: { street: 'Maria-Theresien-Straße', housenumber: '4', postcode: '6020', city: 'Innsbruck', state: 'Tirol', countrycode: 'AT' } }
] };

test('Standortsuche: Photon-Antwort wird zu Vorschlägen - nur Deutschland und Österreich, ohne Doppelte, mit Adresse und Ort', function () {
  const r = app.parsePhoton(photonSample);
  assert.strictEqual(r.length, 2, JSON.stringify(r.map(function (x) { return x.main; })));
  assert.strictEqual(r[0].main, 'Marienplatz');
  assert.strictEqual(r[0].sub, '80331 München, Bayern');
  assert.strictEqual(r[0].state, 'Bayern');
  assert.ok(Math.abs(r[0].lat - 48.1366223) < 1e-9 && Math.abs(r[0].lon - 11.5771547) < 1e-9);
  assert.strictEqual(r[1].main, 'Maria-Theresien-Straße 4');
  assert.strictEqual(r[1].country, 'AT');
  assert.deepStrictEqual(app.parsePhoton(null), []);
});

test('Standortsuche: photonSearch fragt nur mit Suchtext, Sprache, Rahmen und Grenze - und bricht bei Fehlern ab', async function () {
  const calls = [];
  global.fetch = function (url, opt) { calls.push(url); return Promise.resolve({ ok: true, json: function () { return Promise.resolve(photonSample); } }); };
  const r = await app.photonSearch('Marienplatz München');
  assert.strictEqual(r.length, 2);
  assert.strictEqual(calls.length, 1);
  assert.ok(calls[0].indexOf('https://photon.komoot.io/api/?q=Marienplatz%20M%C3%BCnchen') === 0, calls[0]);
  assert.ok(/lang=de/.test(calls[0]) && /limit=10/.test(calls[0]) && /bbox=/.test(calls[0]));
  global.fetch = function () { return Promise.resolve({ ok: false, status: 429 }); };
  await assert.rejects(app.photonSearch('x'), /429/);
  delete global.fetch;
});

test('Standortsuche: Datenquellen je Land - alle 16 Länder, Links stehen in der README-Tabelle, Österreich mit Bund', function () {
  const fs = require('fs');
  const readme = fs.readFileSync(require('path').join(__dirname, '../README.md'), 'utf8');
  const states = Object.keys(app.GEO_ENTRIES);
  assert.strictEqual(states.length, 16);
  // README nennt die Hauptlinks; Ausnahmen sind Tiefenlinks, die nur hier stehen
  const onlyHere = ['https://data.geobasis-bb.de/geobasis/daten/dgm/', 'https://data.geobasis-bb.de/geobasis/daten/dgm/tif/'];
  states.forEach(function (st) {
    const e = app.GEO_ENTRIES[st];
    [e.dem, e.bldg].forEach(function (x) {
      if (x && onlyHere.indexOf(x.url) < 0) assert.ok(readme.indexOf(x.url) >= 0, st + ': ' + x.url + ' fehlt in der README');
    });
  });
  const by = app.geoSourcesFor({ country: 'DE', state: 'Bayern' });
  assert.strictEqual(by.dem[0].fmt, 'tif');
  assert.ok(by.bldg[0].url.indexOf('pn=lod2') > 0);
  assert.strictEqual(app.geoSourcesFor({ country: 'DE', state: 'Hamburg' }).dem[0].fmt, 'xyz');
  const sl = app.geoSourcesFor({ country: 'DE', state: 'Saarland' });
  assert.deepStrictEqual(sl.bldg, []);
  assert.strictEqual(sl.bldgNote, 'servicesOnly');
  const wien = app.geoSourcesFor({ country: 'AT', state: 'Wien', city: 'Wien' });
  assert.strictEqual(wien.dem.length, 3);
  assert.strictEqual(wien.bldg.length, 1);
  const tirol = app.geoSourcesFor({ country: 'AT', state: 'Tirol', city: 'Innsbruck' });
  assert.strictEqual(tirol.bldg.length, 0);
  assert.strictEqual(tirol.bldgNote, 'noAtBldg');
  assert.strictEqual(tirol.dem[tirol.dem.length - 1].note === undefined, true);
  const linz = app.geoSourcesFor({ country: 'AT', state: 'Oberösterreich', city: 'Linz' });
  assert.strictEqual(linz.bldg[0].label, 'Linz');
  assert.strictEqual(app.geoSourcesFor({ country: 'CH', state: 'Zürich' }), null);
  assert.strictEqual(app.geoSourcesFor({ country: 'DE', state: 'Atlantis' }), null);
});

console.log(pass + ' bestanden, ' + fail + ' fehlgeschlagen');
process.exit(fail ? 1 : 0);
