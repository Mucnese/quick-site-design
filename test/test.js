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
  const geo = { terrain: [{ a: p, b: p, c: p }], buildings: [] };
  const ifc = app.buildIfc(geo, 0, 0, 25832);
  const line = ifc.split('\n').find(function (l) { return l.indexOf('IFCCARTESIANPOINTLIST3D') >= 0; });
  assert.ok(line.indexOf('(5.,2.,3.)') >= 0,
    'erwartet (Ost=5, Nord=2, Höhe=3): ' + line);
});

test('buildIfc: leerer Ausschnitt wirft eine verständliche Meldung', function () {
  terrainForExportTests();
  assert.throws(function () { app.buildIfc({ terrain: [], buildings: [] }, 0, 0, 25832); }, /Geometrie/);
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
