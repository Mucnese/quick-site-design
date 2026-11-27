// SPDX-License-Identifier: GPL-3.0-or-later
/* =========================================================
   Quick-Site-Design  –  Kernlogik
   Einheiten: 1 Three.js-Einheit = 1 Meter
   ========================================================= */

/* ---------- Stammdaten Mobilkrane (Richtwerte Liebherr LTM) ---------- */
/* ---------- Mobilkrane (Liebherr LTM) ----------
   Aufgenommen sind nur Modelle, für die Hersteller- oder Vermieterangaben
   vorliegen. Nicht belegte Felder stehen auf null; die Oberfläche gibt
   dann keinen Höchstwert vor. Abstützmaße dienen ausschließlich der
   Darstellung und sind schematisch.

   axles kommt aus der Modellbezeichnung selbst (z. B. "-9.1" = 9 Achsen)
   und wird nicht mehr aus chassisL geschätzt – die alte Schätzformel
   (chassisL / 3,2 m) lag bei den größeren Modellen daneben (z. B. 1750-9.1
   kam als 6-achsig statt 9-achsig heraus).

   chassisL/chassisW sind von der "Maße"-Seite der Original-Datenblätter
   (Ordner 2016_Technische Daten_Mobilkrane): jeweils die größte dort
   dokumentierte Längs- bzw. Querabmessung (bei chassisW meist die voll
   ausgefahrene Abstützbreite). Zwei Modellbezeichnungen dabei korrigiert,
   die nicht mit den Datenblättern übereinstimmten: LTM 1090-4.2 → 4.1,
   LTM 1250-6.1 → 5.1 (beide tatsächlich mit einer Achse weniger).

   boomTele ist über die Zeile "Auslegerlänge: MIN m – MAX m" im
   Ausrüstungsteil der Datenblätter geprüft; bei ltm1090 (60 → 50) und
   ltm1250 (72 → 60) stimmte der bisherige Wert nicht.

   24 Modelle insgesamt: die ursprünglichen 9 plus 15 weitere LTM-Mobilkrane
   (1030 bis 11200), nach denselben Regeln aus den Original-Datenblättern
   entnommen. cap kommt vom Traglastwert bei kleinstem Radius/größtem
   Gegengewicht auf der ersten Traglasttabelle des Hauptauslegers (T-System),
   nicht blind aus dem Modellnamen – bei der LTM 1030-2.1 etwa 35 t statt der
   im Namen anklingenden 30 t. hookMax stammt von der Hubhöhen-Tafel für die
   größte Auslegerlänge, radiusMax vom am weitesten reichenden noch belegten
   Feld derselben Traglasttabelle (dabei zählt die Tabelle mit dem größten
   Gegengewicht, nicht zwangsläufig die zuletzt im Heft stehende). hookDef/
   radiusDef sind reine Vorgabewerte für den Regler (kein Datenblattwert) im
   selben Verhältnis wie bei den ursprünglichen 9 Modellen. Die LTM 1120-4.1
   fehlt bewusst: von ihr lag nur eine einzelne Traglasttabellen-Seite vor,
   ohne Maße, Auslegerlängen-Angabe oder Hubhöhen-Tafel.

   Liste nach cap aufsteigend sortiert, weil die Modellauswahl im UI genau
   in dieser Reihenfolge erscheint (kein eigener Sortierschritt in ui.js). */
const CRANE_MODELS = [
  { id: 'ltm1030',    name: 'LTM 1030-2.1',  maker: 'Liebherr', cap: 35,  boomTele: 30,  hookMax: 40,  radiusMax: 26,  hookDef: 24, radiusDef: 10, outL: 6.3,    outW: 6.0,    chassisL: 10.158, chassisW: 6.028,  axles: 2 },
  { id: 'ltm1040',    name: 'LTM 1040-2.1',  maker: 'Liebherr', cap: 40,  boomTele: 35,  hookMax: 39,  radiusMax: 31,  hookDef: 24, radiusDef: 12, outL: 6.3,    outW: 6.0,    chassisL: 10.605, chassisW: 6.028,  axles: 2 },
  { id: 'ltm1050',    name: 'LTM 1050-3.1',  maker: 'Liebherr', cap: 50,  boomTele: 38,  hookMax: 54,  radiusMax: 44,  hookDef: 36, radiusDef: 18, outL: 6.3,    outW: 6.0,    chassisL: 11.613, chassisW: 6.4,    axles: 3 },
  { id: 'ltm1055',    name: 'LTM 1055-3.2',  maker: 'Liebherr', cap: 55,  boomTele: 40,  hookMax: 44,  radiusMax: 36,  hookDef: 26, radiusDef: 14, outL: 7.3,    outW: 6.3,    chassisL: 11.042, chassisW: 6.3,    axles: 3 },
  { id: 'ltm1060',    name: 'LTM 1060-3.1',  maker: 'Liebherr', cap: 60,  boomTele: 48,  hookMax: 50,  radiusMax: 40,  hookDef: 30, radiusDef: 16, outL: 7.3,    outW: 6.3,    chassisL: 11.175, chassisW: 6.3,    axles: 3 },
  { id: 'ltm1070',    name: 'LTM 1070-4.2',  maker: 'Liebherr', cap: 70,  boomTele: 50,  hookMax: 52,  radiusMax: 40,  hookDef: 32, radiusDef: 16, outL: 8.0,    outW: 6.3,    chassisL: 12.392, chassisW: 6.3,    axles: 4 },
  { id: 'ltm1090',    name: 'LTM 1090-4.1',  maker: 'Liebherr', cap: 90,  boomTele: 50,  hookMax: 76,  radiusMax: 62,  hookDef: 56, radiusDef: 26, outL: 7.4,    outW: 6.8,    chassisL: 12.739, chassisW: 7.009,  axles: 4 },
  { id: 'ltm1095',    name: 'LTM 1095-5.1',  maker: 'Liebherr', cap: 95,  boomTele: 58,  hookMax: 60,  radiusMax: 54,  hookDef: 36, radiusDef: 22, outL: 7.3,    outW: 6.8,    chassisL: 13.776, chassisW: 7.0,    axles: 5 },
  { id: 'ltm1100_42', name: 'LTM 1100-4.2',  maker: 'Liebherr', cap: 100, boomTele: 60,  hookMax: 62,  radiusMax: 44,  hookDef: 38, radiusDef: 18, outL: 8.5,    outW: 6.8,    chassisL: 12.949, chassisW: 7.0,    axles: 4 },
  { id: 'ltm1100_52', name: 'LTM 1100-5.2',  maker: 'Liebherr', cap: 100, boomTele: 52,  hookMax: 54,  radiusMax: 50,  hookDef: 32, radiusDef: 20, outL: 7.4,    outW: 6.8,    chassisL: 13.340, chassisW: 7.0,    axles: 5 },
  { id: 'ltm1130',    name: 'LTM 1130-5.1',  maker: 'Liebherr', cap: 130, boomTele: 60,  hookMax: 63,  radiusMax: 56,  hookDef: 38, radiusDef: 22, outL: 8.0,    outW: 7.2,    chassisL: 14.500, chassisW: 7.5,    axles: 5 },
  { id: 'ltm1150',    name: 'LTM 1150-5.3',  maker: 'Liebherr', cap: 150, boomTele: 66,  hookMax: 92,  radiusMax: 72,  hookDef: 60, radiusDef: 30, outL: 8.07,   outW: 7.90,   chassisL: 14.48,  chassisW: 6.518,  axles: 5 },
  { id: 'ltm1160',    name: 'LTM 1160-5.2',  maker: 'Liebherr', cap: 160, boomTele: 62,  hookMax: 65,  radiusMax: 60,  hookDef: 40, radiusDef: 24, outL: 9.2,    outW: 8.0,    chassisL: 15.668, chassisW: 8.306,  axles: 5 },
  { id: 'ltm1200',    name: 'LTM 1200-5.1',  maker: 'Liebherr', cap: 200, boomTele: 72,  hookMax: 74,  radiusMax: 66,  hookDef: 44, radiusDef: 26, outL: 8.9,    outW: 7.8,    chassisL: 15.370, chassisW: 8.3,    axles: 5 },
  { id: 'ltm11200',   name: 'LTM 11200-9.1', maker: 'Liebherr', cap: 213, boomTele: 100, hookMax: 102, radiusMax: 74,  hookDef: 62, radiusDef: 30, outL: 13.016, outW: 13.010, chassisL: 19.945, chassisW: 13.030, axles: 9 },
  { id: 'ltm1220',    name: 'LTM 1220-5.2',  maker: 'Liebherr', cap: 220, boomTele: 60,  hookMax: 62,  radiusMax: 56,  hookDef: 38, radiusDef: 22, outL: 8.9,    outW: 7.8,    chassisL: 15.600, chassisW: 8.3,    axles: 5 },
  { id: 'ltm1250',    name: 'LTM 1250-5.1',  maker: 'Liebherr', cap: 250, boomTele: 60,  hookMax: 108, radiusMax: 92,  hookDef: 66, radiusDef: 34, outL: 8.9,    outW: 8.2,    chassisL: 15.965, chassisW: 6.894,  axles: 5 },
  { id: 'ltm1300',    name: 'LTM 1300-6.2',  maker: 'Liebherr', cap: 300, boomTele: 78,  hookMax: 80,  radiusMax: 74,  hookDef: 48, radiusDef: 30, outL: 8.9,    outW: 8.0,    chassisL: 17.298, chassisW: 8.532,  axles: 6 },
  { id: 'ltm1350',    name: 'LTM 1350-6.1',  maker: 'Liebherr', cap: 350, boomTele: 70,  hookMax: 108, radiusMax: 96,  hookDef: 66, radiusDef: 36, outL: 9.4,    outW: 8.8,    chassisL: 17.743, chassisW: 8.53,   axles: 6 },
  { id: 'ltm1400',    name: 'LTM 1400-7.1',  maker: 'Liebherr', cap: 400, boomTele: 60,  hookMax: 63,  radiusMax: 58,  hookDef: 38, radiusDef: 24, outL: 10.0,   outW: 9.0,    chassisL: 18.533, chassisW: 9.510,  axles: 7 },
  { id: 'ltm1450',    name: 'LTM 1450-8.1',  maker: 'Liebherr', cap: 450, boomTele: 85,  hookMax: 145, radiusMax: 108, hookDef: 80, radiusDef: 40, outL: 10.0,   outW: 9.5,    chassisL: 19.995, chassisW: 9.6,    axles: 8 },
  { id: 'ltm1500',    name: 'LTM 1500-8.1',  maker: 'Liebherr', cap: 500, boomTele: 84,  hookMax: 145, radiusMax: 108, hookDef: 80, radiusDef: 42, outL: 10.6,   outW: 9.6,    chassisL: 20.48,  chassisW: 9.6,    axles: 8 },
  { id: 'ltm1650',    name: 'LTM 1650-8.1',  maker: 'Liebherr', cap: 700, boomTele: 80,  hookMax: 152, radiusMax: 112, hookDef: 85, radiusDef: 46, outL: 10.6,   outW: 9.6,    chassisL: 20.717, chassisW: 9.578,  axles: 8 },
  { id: 'ltm1750',    name: 'LTM 1750-9.1',  maker: 'Liebherr', cap: 750, boomTele: 52,  hookMax: 154, radiusMax: 116, hookDef: 90, radiusDef: 50, outL: 12.0,   outW: 12.0,   chassisL: 21.75,  chassisW: 12.009, axles: 9 }
];

/* ---------- Turmdrehkran ----------
   Ein einziges generisches Modell statt einer Herstellerliste; alle
   Parameter bleiben frei einstellbar. Ursprünglich waren die Grenzen
   Minimum und Maximum aus den 34 zuvor hier gepflegten Herstellermodellen
   (18 Liebherr, 16 WOLFFKRAN, siehe Git-Historie vor dieser Änderung):
     radius (Auslegerlänge)  aus jibMax      48,0 – 91,4 m
     hookHeight (Hakenhöhe)  aus hookMax     41,9 – 97,1 m (nur die 18
       Modelle mit Angabe; bei WOLFFKRAN hing sie von der Turmkombination
       ab und stand deshalb auf null)
     mastWidth (Turmbreite)  aus mast        1,6 – 1,8 m
   Auf ausdrücklichen Wunsch angepasst: radius und hookHeight lassen sich
   jetzt bis auf 0 herunterregeln, hookHeight zusätzlich bis 120 statt nur
   97,1 m herauf, mastWidth reicht von 1 bis 3,5 m statt nur über die im
   Katalog vorgekommenen 1,6–1,8 m. Vorgabewert bleibt jeweils der alte,
   weiterhin innerhalb des Bereichs liegende Wert. kind bleibt fest auf
   "flat" (spitzenloser Obendreher, kommt ohne Turmkopf aus) - das war mit
   23 von 34 Modellen die häufigste Bauart. */
const TOWER_LIMITS = {
  radius:     { min: 0,   max: 91.4, def: 69.7 },
  hookHeight: { min: 0,   max: 120,  def: 69.5 },
  mastWidth:  { min: 1,   max: 3.5,  def: 1.7 }
};

/* Anlaufstelle für die Liebherr-Mobilkran-Übersicht (Original-Datenblätter) */
const SHEET_URLS = {
  liebherrLTM: 'https://www.liebherr.com'
};

function sheetUrlFor(m) {
  if (!m) return null;
  return SHEET_URLS.liebherrLTM;
}

const MAT = {};
const GEO = {};

let scene, camera, renderer, controls, raycaster, pointer;
let terrainMesh, plinthMesh;
let buildingsMesh = null;

/* Geländezustand – wird beim Laden einer Datei ersetzt */
let TERRAIN = null;   // erst nach dem Laden einer Datei gesetzt

let objects = [];
let nextId = 1;
let activeTool = null;
let selectedIds = [];
let moveMode = false;
let ghost = null;
let selectionBoxes = [];
let focusGoal = null;
let camGoal = null;
let measureMarker = null;
let measurePoint = null;
let roadNodes = null;        // sichtbare Stützpunkte der ausgewählten Baustraße
let roadNodeObj = null;      // zugehöriges Objekt
let activeNode = null;       // gerade zur Bearbeitung gewählter Stützpunkt

/* =========================================================
   Szene
   ========================================================= */
function initScene(container) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1013);
  // Kein Nebel: weit herausgezoomt soll das Gelände nicht ausblassen

  camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(420, 300, 460);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.target.set(0, 20, 0);
  controls.maxDistance = 6000;
  controls.minDistance = 12;
  controls.maxPolarAngle = POLAR_GROUND;       // knapp unter die Horizontale, Draufsicht bleibt erlaubt; mit IFC auch von unten
  // Links drehen, rechts UND Mitte verschieben, Rad zoomt. (Standard von
  // OrbitControls ist Mitte = Zoomen; das Rad macht das ohnehin.)
  controls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
  controls.panSpeed = 2.2;   // Verschieben mit Mitte/Rechts war zu zäh (beim Drücken nach dem Abstand angepasst, adjustPanSpeed)

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  scene.add(new THREE.HemisphereLight(0xa8d8ee, 0x2a2218, 0.55));

  const sun = new THREE.DirectionalLight(0xfff0d8, 1.25);
  sun.position.set(-420, 620, 380);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 4000;
  sun.shadow.bias = -0.0006;
  scene.add(sun);
  scene.add(sun.target);
  MAT.__sun = sun;

  // Licht von unten, nur beim Blick von unten an (Untersichten wären sonst fast schwarz); Stärke 0 statt unsichtbar,
  // damit die Materialien nicht neu übersetzt werden
  const under = new THREE.DirectionalLight(0xe8eefc, 0);
  under.position.set(180, -420, 260);
  scene.add(under);
  MAT.__under = under;

  const fill = new THREE.DirectionalLight(0x6fa8c8, 0.22);
  fill.position.set(300, 180, -300);
  scene.add(fill);
}

function initSharedResources() {
  GEO.box = new THREE.BoxGeometry(1, 1, 1);
  GEO.cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
  GEO.sphere = new THREE.SphereGeometry(1, 16, 12);

  MAT.container   = new THREE.MeshLambertMaterial({ color: 0xffffff });
  MAT.linkBlock   = new THREE.MeshLambertMaterial({ color: 0xbfb8ab });
  MAT.steelDark   = new THREE.MeshLambertMaterial({ color: 0x4a5258 });
  MAT.craneYellow = new THREE.MeshLambertMaterial({ color: 0xe8b23c });
  MAT.craneRed    = new THREE.MeshLambertMaterial({ color: 0xc4472e });
  MAT.glass       = new THREE.MeshLambertMaterial({ color: 0x1e3a45 });
  MAT.rubber      = new THREE.MeshLambertMaterial({ color: 0x22262a });
  // DoubleSide: LOD2-Wandpolygone sind uneinheitlich gewickelt, sonst fehlen Flächen
  MAT.building    = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, side: THREE.DoubleSide });
  MAT.outline     = new THREE.LineBasicMaterial({ color: 0x11181c, transparent: true, opacity: 0.55 });
  MAT.radiusMax   = new THREE.LineBasicMaterial({ color: 0xff7043, transparent: true, opacity: 0.6 });
  MAT.radiusWork  = new THREE.LineBasicMaterial({ color: 0x5fd4c4, transparent: true, opacity: 0.95 });
  MAT.hookLine    = new THREE.LineBasicMaterial({ color: 0xf0f0f0, transparent: true, opacity: 0.6 });
  MAT.ghost       = new THREE.LineBasicMaterial({ color: 0x5fd4c4, transparent: true, opacity: 0.8 });
  MAT.selection   = new THREE.LineBasicMaterial({ color: 0x5fd4c4 });
  MAT.road        = new THREE.MeshLambertMaterial({ color: 0x8b8377, side: THREE.DoubleSide });
  MAT.roadEdge    = new THREE.LineBasicMaterial({ color: 0xf2e6c8, transparent: true, opacity: 0.7 });
  MAT.road        = new THREE.MeshLambertMaterial({ color: 0x6f6a60, side: THREE.DoubleSide });
  MAT.roadEdge    = new THREE.LineBasicMaterial({ color: 0xe8e2d2, transparent: true, opacity: 0.75 });
  MAT.roadAxis    = new THREE.MeshBasicMaterial({ color: 0xffd23f, side: THREE.DoubleSide });
  // Böschungen: Auftrag hell (aufgeschüttet), Abtrag dunkel (angeschnitten)
  MAT.roadFill    = new THREE.MeshLambertMaterial({ color: 0xc9a45c, side: THREE.DoubleSide });
  MAT.roadCut     = new THREE.MeshLambertMaterial({ color: 0x9a5a44, side: THREE.DoubleSide });
  // Baugrube: Sohle und Wände; ohne Schattenempfang (das Gelände darüber würde sie sonst beschatten)
  MAT.pitFloor    = new THREE.MeshLambertMaterial({ color: 0xa5977f, side: THREE.DoubleSide });
  MAT.pitWall     = new THREE.MeshLambertMaterial({ color: 0x84735c, side: THREE.DoubleSide });
  MAT.pitEdge     = new THREE.LineBasicMaterial({ color: 0xffd24a });
  // Abtrag liegt unter dem Gelände: Überlagerung ohne Tiefentest, damit man ihn sieht
  MAT.cutOverlay  = new THREE.MeshBasicMaterial({ color: 0x9a5a44, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
  MAT.roadOverlay = new THREE.MeshBasicMaterial({ color: 0x6f6a60, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
  MAT.cutCrest    = new THREE.LineBasicMaterial({ color: 0xffd24a, depthTest: false });
  MAT.sweptFill   = new THREE.MeshBasicMaterial({ color: 0x4aa3ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
  MAT.sweptLine   = new THREE.MeshBasicMaterial({ color: 0x2f8cff, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
  MAT.sweptOver   = new THREE.MeshBasicMaterial({ color: 0xff4d3d, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
  // Immer sichtbar, damit der Punkt nicht im Gelände verschwindet
  MAT.measure     = new THREE.MeshBasicMaterial({ color: 0x6cff8a, depthTest: false });
  MAT.node        = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false });
  MAT.nodeActive  = new THREE.MeshBasicMaterial({ color: 0xff8a3c, depthTest: false });
  // IFC-Export-Vorschau: liegt genau auf Gelände/Gebäuden, deshalb polygonOffset
  // gegen Z-Fighting statt eines eigenen Höhenversatzes in der Geometrie –
  // die Vorschau soll exakt dieselben Koordinaten zeigen, die exportiert werden.
  MAT.exportHighlight = new THREE.MeshLambertMaterial({
    color: 0x5fd4c4, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4
  });
  // Rot wie --danger im CSS: Rechteckauswahl im IFC-Export und die
  // Baustraßen-Vorschau beim Zeichnen. Echte Boxen statt LineBasicMaterial
  // (siehe thickLine()), damit "dicker" auch tatsächlich sichtbar ist.
  MAT.drawPreview = new THREE.MeshBasicMaterial({
    color: 0xd9534f, transparent: true, opacity: 0.9, depthTest: false
  });
}

/* =========================================================
   Gelände
   ========================================================= */

/* Wandelt das eingebettete Kompaktformat in den Geländezustand um */
function terrainFromEmbedded(d) {
  const n = d.n;
  const rel = new Float32Array(n * n);
  for (let i = 0; i < n * n; i++) rel[i] = d.heights[i] / d.scale;
  return {
    nx: n, nz: n,
    w: d.width || 1000, d: d.depth || 1000,
    originE: d.originE || 713500,
    originN: d.originN || 5420500,
    zmin: d.zmin, zmax: d.zmax,
    rel: rel,
    cell: (d.width || 1000) / (n - 1),
    srcRes: (d.width || 1000) / (n - 1),
    crs: crsLabel(d.epsg || 25832),
    simplified: false,
    cell: (d.width || 1000) / n, srcRes: (d.width || 1000) / n, simplified: false,
    epsg: 25832, crs: crsLabel(25832),
    label: d.label || 'Testkachel'
  };
}

function hasTerrain() { return TERRAIN !== null; }

/* ---------- Gelände in Kacheln mit Detailstufe nach Bildschirmgröße ----------
   Die Höhendaten (TERRAIN.rel) bleiben unverändert in der gewählten
   Detailstufe - Höhenabfragen, Objekte, Messpunkte und IFC-Export sehen
   immer dieselben Werte, nichts springt beim Zoomen. Nur das gezeichnete
   Mesh wird in Kacheln zu je LOD_CHUNK Zellen zerlegt, und jede Kachel
   wird mit Schrittweite 1, 2, 4, ... über dem Datenraster gezeichnet: so
   grob, wie es ihre Zellen auf dem Bildschirm erlauben (LOD_TARGET_PX).
   Nahe Kacheln zeigen alle Daten, ferne weniger. Die Normalen kommen aus dem
   feinen Raster, deshalb ändert sich die Schattierung beim Wechsel kaum.
   Zwischen Kacheln unterschiedlicher Stufe entstehen Spalten; sie werden von
   Randschürzen (nach unten gezogene Wände) verdeckt. */
const LOD_CHUNK = 64;          // Zellen je Kachelkante bei voller Auflösung
const LOD_TARGET_PX = 6;       // gröbste Zelle, die auf dem Bildschirm noch erlaubt ist
const LOD_MAX_REBUILDS = 16;   // Kacheln, die pro Bild neu aufgebaut werden dürfen
let terrainChunks = [];        // { x0, z0, cx, cz, minY, maxY, level, mesh }
let terrainMat = null;
let lodStamp = '';

function lodAxis(count, step) {
  const out = [];
  for (let i = 0; i < count; i += step) out.push(i);
  out.push(count);
  return out;
}

function chunkGeometry(c, level) {
  const t = TERRAIN;
  const step = Math.pow(2, level);
  const xs = lodAxis(c.cx, step), zs = lodAxis(c.cz, step);
  const nxv = xs.length, nzv = zs.length;
  const segX = t.w / (t.nx - 1), segZ = t.d / (t.nz - 1);
  const span = Math.max(t.zmax - t.zmin, 0.0001);
  const skirt = step * Math.max(segX, segZ) + 0.5;
  const total = nxv * nzv + 2 * (nxv + nzv);

  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  function h(gx, gz) {
    gx = Math.max(0, Math.min(t.nx - 1, gx));
    gz = Math.max(0, Math.min(t.nz - 1, gz));
    return t.rel[gz * t.nx + gx];
  }

  for (let jz = 0; jz < nzv; jz++) {
    for (let jx = 0; jx < nxv; jx++) {
      const gx = c.x0 + xs[jx], gz = c.z0 + zs[jz];
      const i = (jz * nxv + jx) * 3;
      const y = h(gx, gz);
      pos[i] = -t.w / 2 + gx * segX; pos[i + 1] = y; pos[i + 2] = -t.d / 2 + gz * segZ;
      // Normale aus dem feinen Raster (zentrale Differenzen)
      let nx = (h(gx - 1, gz) - h(gx + 1, gz)) / (2 * segX);
      let nz = (h(gx, gz - 1) - h(gx, gz + 1)) / (2 * segZ);
      const nl = Math.sqrt(nx * nx + 1 + nz * nz);
      nor[i] = nx / nl; nor[i + 1] = 1 / nl; nor[i + 2] = nz / nl;
      const cc = colorAt((y) / span);
      col[i] = cc[0]; col[i + 1] = cc[1]; col[i + 2] = cc[2];
    }
  }

  const idx = [];
  for (let jz = 0; jz + 1 < nzv; jz++) {
    for (let jx = 0; jx + 1 < nxv; jx++) {
      const a = jz * nxv + jx, b = a + 1, d = a + nxv + 1, cI = a + nxv;
      idx.push(a, cI, d, a, d, b);          // von oben gegen den Uhrzeigersinn: Normale zeigt nach oben
    }
  }

  // Randschürzen: Rand-Eckpunkte noch einmal, um skirt abgesenkt
  let o = nxv * nzv;
  function addEdge(surfaceIdx, reverse) {
    const low = [];
    surfaceIdx.forEach(function (si) {
      for (let k = 0; k < 3; k++) {
        pos[o * 3 + k] = pos[si * 3 + k]; nor[o * 3 + k] = nor[si * 3 + k]; col[o * 3 + k] = col[si * 3 + k];
      }
      pos[o * 3 + 1] -= skirt;
      low.push(o++);
    });
    for (let k = 0; k + 1 < surfaceIdx.length; k++) {
      const p0 = surfaceIdx[k], p1 = surfaceIdx[k + 1], q0 = low[k], q1 = low[k + 1];
      if (reverse) idx.push(p1, p0, q0, p1, q0, q1);
      else idx.push(p0, p1, q1, p0, q1, q0);
    }
  }
  const north = [], south = [], west = [], east = [];
  for (let jx = 0; jx < nxv; jx++) { north.push(jx); south.push((nzv - 1) * nxv + jx); }
  for (let jz = 0; jz < nzv; jz++) { west.push(jz * nxv); east.push(jz * nxv + nxv - 1); }
  addEdge(north, false);
  addEdge(south, true);
  addEdge(west, true);
  addEdge(east, false);

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  return g;
}

/* Kürzester Abstand der Kamera zum Quader der Kachel */
function chunkDistance(c) {
  const t = TERRAIN, p = camera.position;
  const segX = t.w / (t.nx - 1), segZ = t.d / (t.nz - 1);
  const x0 = -t.w / 2 + c.x0 * segX, x1 = x0 + c.cx * segX;
  const z0 = -t.d / 2 + c.z0 * segZ, z1 = z0 + c.cz * segZ;
  const dx = Math.max(x0 - p.x, 0, p.x - x1);
  const dy = Math.max(c.minY - p.y, 0, p.y - c.maxY);
  const dz = Math.max(z0 - p.z, 0, p.z - z1);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/* Pro Bild aufgerufen, rechnet aber nur nach, wenn sich die Kamera bewegt hat.
   Eine Kachel wechselt die Stufe erst mit etwas Abstand zur Schwelle
   (Hysterese), sonst flackert sie an der Grenze hin und her. */
function updateTerrainLod(force) {
  if (!terrainChunks.length || !camera || !TERRAIN) return;
  const p = camera.position;
  const key = p.x.toFixed(1) + ',' + p.y.toFixed(1) + ',' + p.z.toFixed(1) + ',' + window.innerHeight;
  if (!force && key === lodStamp) return;
  lodStamp = key;

  const t = TERRAIN;
  const focal = (window.innerHeight / 2) / Math.tan(camera.fov * Math.PI / 360);
  const cell = Math.min(t.w / (t.nx - 1), t.d / (t.nz - 1));
  let rebuilt = 0;
  for (let i = 0; i < terrainChunks.length; i++) {
    const c = terrainChunks[i];
    const maxLevel = Math.floor(Math.log2(Math.max(c.cx, c.cz)));
    const L = Math.log2(LOD_TARGET_PX * Math.max(chunkDistance(c), 1) / (cell * focal));
    let want;
    if (c.level < 0) want = Math.floor(L);
    else if (L >= c.level + 1.25) want = Math.floor(L);
    else if (L < c.level - 0.25) want = Math.floor(L);
    else want = c.level;
    want = Math.max(0, Math.min(maxLevel, want));
    if (want === c.level) continue;
    if (!force && rebuilt >= LOD_MAX_REBUILDS) { lodStamp = ''; continue; }
    const old = c.mesh.geometry;
    c.mesh.geometry = chunkGeometry(c, want);
    if (old && old.dispose) old.dispose();
    c.level = want;
    rebuilt++;
  }
}

function disposeTerrainChunks() {
  terrainChunks.forEach(function (c) { if (c.mesh.geometry && c.mesh.geometry.dispose) c.mesh.geometry.dispose(); });
  terrainChunks = [];
  if (terrainMat && terrainMat.dispose) terrainMat.dispose();
  terrainMat = null;
}

function buildTerrain(t) {
  TERRAIN = t;

  if (terrainMesh) {
    scene.remove(terrainMesh);
    disposeTerrainChunks();
    terrainMesh = null;
  }
  if (plinthMesh) {
    scene.remove(plinthMesh);
    plinthMesh.geometry.dispose();
    plinthMesh = null;
  }

  terrainMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  terrainMat.onBeforeCompile = terrainShader;
  terrainMesh = new THREE.Group();
  terrainMesh.name = 'terrain';
  const segX = t.w / (t.nx - 1), segZ = t.d / (t.nz - 1);
  for (let z0 = 0; z0 < t.nz - 1; z0 += LOD_CHUNK) {
    for (let x0 = 0; x0 < t.nx - 1; x0 += LOD_CHUNK) {
      const c = { x0: x0, z0: z0, cx: Math.min(LOD_CHUNK, t.nx - 1 - x0), cz: Math.min(LOD_CHUNK, t.nz - 1 - z0),
                  minY: Infinity, maxY: -Infinity, level: -1, mesh: null };
      for (let gz = z0; gz <= z0 + c.cz; gz++) {
        for (let gx = x0; gx <= x0 + c.cx; gx++) {
          const v = t.rel[gz * t.nx + gx];
          if (v < c.minY) c.minY = v;
          if (v > c.maxY) c.maxY = v;
        }
      }
      c.mesh = new THREE.Mesh(new THREE.BufferGeometry(), terrainMat);
      c.mesh.receiveShadow = true;
      c.mesh.castShadow = true;
      c.mesh.userData.isTerrain = true;
      terrainMesh.add(c.mesh);
      terrainChunks.push(c);
    }
  }
  scene.add(terrainMesh);
  updateTerrainLod(true);
  updatePitHoles();
  refreshOsmMap();

  const plinthH = Math.max((t.zmax - t.zmin) * 0.6, 12);
  // Auch der Sockel bekommt das Baugruben-Loch: reicht eine Grube unter das tiefste
  // Gelände, läge ihre Sohle sonst im Sockel und wäre nicht zu sehen
  const plinthMat = new THREE.MeshLambertMaterial({ color: 0x151c20 });
  plinthMat.onBeforeCompile = pitHoleShader;
  // Die Oberseite des Sockels liegt nur wenig unter dem tiefsten Gelände. Aus der Ferne reicht die Tiefenauflösung nicht (bei 3 km etwa 0,5 m),
  // und Gelände und Sockel flimmern am Rand gegeneinander. Darum liegt der Sockel nach Kachelgröße tiefer, und polygonOffset schiebt ihn
  // in der Tiefe nach hinten: das Gelände gewinnt immer.
  plinthMat.polygonOffset = true;
  plinthMat.polygonOffsetFactor = 4;
  plinthMat.polygonOffsetUnits = 8;
  const plinthGap = Math.max(0.2, Math.max(t.w, t.d) * 0.0005);
  plinthMesh = new THREE.Mesh(new THREE.BoxGeometry(t.w, plinthH, t.d), plinthMat);
  plinthMesh.position.y = -plinthH / 2 - plinthGap;
  plinthMesh.receiveShadow = true;
  scene.add(plinthMesh);

  // Schattenkamera, Nebel und Kameragrenzen an die Kachelgröße anpassen
  const span = Math.max(t.w, t.d);
  const sc = MAT.__sun.shadow.camera;
  sc.left = -span * 0.62; sc.right = span * 0.62;
  sc.top = span * 0.62; sc.bottom = -span * 0.62;
  sc.far = span * 4;
  MAT.__sun.position.set(-span * 0.42, span * 0.62, span * 0.38);
  controls.maxDistance = span * 3;

  return { mesh: terrainMesh, material: terrainMat };
}

let topView = false;

function isTopView() { return topView; }

/* Setzt die Ansicht senkrecht von oben. Kein Sperrzustand: sobald gedreht
   wird, kippt die Kamera wieder frei in den Raum. */
function setTopView(keepHeading) {
  const t = controls.target;
  const span = TERRAIN ? Math.max(TERRAIN.w, TERRAIN.d) : 500;
  let d = camera.position.distanceTo(t);
  if (!(d > 1)) d = span * 0.6;
  // Standard: Norden oben. Mit keepHeading bleibt die Blickrichtung um die Hochachse, wie sie ist (der Versatz von 1 mm
  // zeigt weiter in dieselbe Richtung wie die Kamera, die Ansicht dreht sich nicht).
  let ox = 0, oz = 0.001;
  if (keepHeading) {
    const dx = camera.position.x - t.x, dz = camera.position.z - t.z, h = Math.sqrt(dx * dx + dz * dz);
    if (h > 1e-6) { ox = dx / h * 0.001; oz = dz / h * 0.001; }
  }
  camGoal = new THREE.Vector3(t.x + ox, t.y + d, t.z + oz);
  focusGoal = new THREE.Vector3(t.x, t.y, t.z);
  topView = true;
  return topView;
}

/* Neigung der Kamera gegen die Senkrechte in Grad */
function cameraTilt() {
  const t = controls.target;
  const dx = camera.position.x - t.x;
  const dy = camera.position.y - t.y;
  const dz = camera.position.z - t.z;
  const horiz = Math.sqrt(dx * dx + dz * dz);
  return Math.atan2(horiz, Math.abs(dy)) * 180 / Math.PI;
}

/* Wird pro Bild geprüft: verlässt der Nutzer die Draufsicht, erlischt der
   Zustand von selbst. */
function refreshTopView() {
  if (topView && !camGoal && cameraTilt() > 3) topView = false;
  return topView;
}

/* ---------- 7: Nordrichtung ---------- */

/* Winkel der Kamera um die Hochachse; 0 heißt Norden oben im Bild */
function northAngle() {
  const dx = camera.position.x - controls.target.x;
  const dz = camera.position.z - controls.target.z;
  if (Math.abs(dx) < 1e-9 && Math.abs(dz) < 1e-9) return 0;
  return Math.atan2(dx, dz) * 180 / Math.PI;
}

/* Dreht die Ansicht so, dass Norden oben liegt */
function faceNorth() {
  const t = controls.target;
  const dx = camera.position.x - t.x;
  const dy = camera.position.y - t.y;
  const dz = camera.position.z - t.z;
  const horiz = Math.sqrt(dx * dx + dz * dz);
  camGoal = new THREE.Vector3(t.x, t.y + dy, t.z + (horiz > 0.001 ? horiz : 1));
  focusGoal = new THREE.Vector3(t.x, t.y, t.z);
}

function frameTerrain() {
  if (!TERRAIN) return;
  topView = false;
  const span = Math.max(TERRAIN.w, TERRAIN.d);
  camera.position.set(span * 0.42, span * 0.32, span * 0.46);
  controls.target.set(0, (TERRAIN.zmax - TERRAIN.zmin) * 0.3, 0);
  focusGoal = null;
}

const COLOR_STOPS = [
  { t: 0.00, c: [0.16, 0.36, 0.42] },
  { t: 0.28, c: [0.25, 0.48, 0.37] },
  { t: 0.52, c: [0.56, 0.68, 0.31] },
  { t: 0.76, c: [0.79, 0.63, 0.31] },
  { t: 1.00, c: [0.72, 0.35, 0.24] }
];

function colorAt(t) {
  if (!(t > 0)) return COLOR_STOPS[0].c;
  if (t >= 1) return COLOR_STOPS[COLOR_STOPS.length - 1].c;
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const a = COLOR_STOPS[i], b = COLOR_STOPS[i + 1];
    if (t >= a.t && t <= b.t) {
      const f = (t - a.t) / (b.t - a.t);
      return [
        a.c[0] + (b.c[0] - a.c[0]) * f,
        a.c[1] + (b.c[1] - a.c[1]) * f,
        a.c[2] + (b.c[2] - a.c[2]) * f
      ];
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1].c;
}

function getHeightAt(x, z) {
  const t = TERRAIN;
  if (!t) return 0;
  const segX = t.w / (t.nx - 1);
  const segZ = t.d / (t.nz - 1);
  let fx = (x + t.w / 2) / segX;
  let fz = (z + t.d / 2) / segZ;
  fx = Math.min(Math.max(fx, 0), t.nx - 1.0001);
  fz = Math.min(Math.max(fz, 0), t.nz - 1.0001);
  const ix = Math.floor(fx), iz = Math.floor(fz);
  const tx = fx - ix, tz = fz - iz;
  const ix1 = Math.min(ix + 1, t.nx - 1);
  const iz1 = Math.min(iz + 1, t.nz - 1);
  const h0 = t.rel[iz * t.nx + ix] * (1 - tx) + t.rel[iz * t.nx + ix1] * tx;
  const h1 = t.rel[iz1 * t.nx + ix] * (1 - tx) + t.rel[iz1 * t.nx + ix1] * tx;
  return h0 * (1 - tz) + h1 * tz;
}

function getAbsoluteHeightAt(x, z) {
  if (!TERRAIN) return 0;
  return getHeightAt(x, z) + TERRAIN.zmin;
}

/* Konvention: +x = Ost, -z = Nord (Blick von oben ergibt ein lagerichtiges Kartenbild) */
function worldToUTM(x, z) {
  if (!TERRAIN) return { e: x, n: -z };
  return { e: TERRAIN.originE + x, n: TERRAIN.originN - z };
}

function utmToWorld(e, n) {
  return { x: e - TERRAIN.originE, z: TERRAIN.originN - n };
}

/* =========================================================
   GeoTIFF einlesen (Browser, via geotiff.js)
   ========================================================= */
const MAX_GRID = 260;     // Voreinstellung der Stützpunkte je Achse
const GRID_MIN = 80;
const GRID_MAX = 1400;
const GRID_CELL_CAP = 2500000;   // Obergrenze für die Originalauflösung    // darüber wird die Darstellung im Browser zäh

/* Gängige Bezugssysteme für deutsche Geobasisdaten */
const EPSG_NAMES = {
  4082: 'REGCAN95 / UTM 27N', 4083: 'REGCAN95 / UTM 28N', 25831: 'ETRS89 / UTM 31N', 25832: 'ETRS89 / UTM 32N', 25833: 'ETRS89 / UTM 33N',
  5650: 'ETRS89 / UTM 33N (Zone)', 4647: 'ETRS89 / UTM 32N (Zone)',
  31466: 'DHDN / GK 2', 31467: 'DHDN / GK 3', 31468: 'DHDN / GK 4', 31469: 'DHDN / GK 5',
  31254: 'MGI / Austria GK West', 31255: 'MGI / Austria GK Central', 31256: 'MGI / Austria GK East',
  3035: 'ETRS89-extended / LAEA Europe',
  3006: 'SWEREF99 TM', 3067: 'ETRS-TM35FIN', 2180: 'ETRF2000-PL / CS92', 2176: 'ETRF2000-PL / CS2000 Zone 5', 2177: 'ETRF2000-PL / CS2000 Zone 6',
  2178: 'ETRF2000-PL / CS2000 Zone 7', 2179: 'ETRF2000-PL / CS2000 Zone 8', 3794: 'Slovenia 1996 / Slovene National Grid', 2169: 'Luxembourg 1930 / Gauss',
  3763: 'ETRS89 / Portugal TM06', 3059: 'LKS92 / Latvia TM', 3346: 'LKS94 / Lithuania TM', 2100: 'GGRS87 / Greek Grid', 3765: 'HTRS96 / Croatia TM',
  2157: 'IRENET95 / Irish Transverse Mercator', 2154: 'RGF93 v1 / Lambert-93', 3812: 'ETRS89 / Belgian Lambert 2008', 3301: 'Estonian Coordinate System of 1997',
  31370: 'Belgian Lambert 72', 28992: 'Amersfoort / RD New', 7415: 'Amersfoort / RD New + NAP height', 5514: 'S-JTSK / Krovak East North',
  4326: 'WGS 84', 4258: 'ETRS89', 3857: 'Web Mercator'
};

function crsLabel(code) {
  if (!code) return 'unbekannt';
  const n = EPSG_NAMES[code];
  return n ? 'EPSG:' + code + ' · ' + n : 'EPSG:' + code;
}

/* =========================================================
   Standortsuche: Adresse -> Datenquellen
   Die Anwendung lädt nichts herunter. Sie schlägt zu einer Adresse Orte vor
   (Photon, photon.komoot.io, OpenStreetMap-Daten - nur auf Eingabe, siehe
   Datenschutzerklärung) und nennt für das Bundesland bzw. Österreich die Seite
   für das Geländemodell (DGM) und das Gebäudemodell (LoD2). Die Links entsprechen
   der Tabelle in README.md (Stand November 2026).
   fmt: 'tif' = GeoTIFF, 'xyz' = XYZ-Text (wird direkt geladen), 'unclear' = unklar.
   note: Schlüssel für einen Hinweis (siehe STRINGS: geoNote_...). */
const GEO_ENTRIES = {
  'Baden-Württemberg': {
    dem: { url: 'https://opengeodata.lgl-bw.de/', fmt: 'xyz', note: 'dgm025' },
    bldg: { url: 'https://opengeodata.lgl-bw.de/' }
  },
  'Bayern': {
    dem: { url: 'https://geodaten.bayern.de/opengeodata/OpenDataDetail.html?pn=dgm1', fmt: 'tif' },
    bldg: { url: 'https://geodaten.bayern.de/opengeodata/OpenDataDetail.html?pn=lod2' }
  },
  'Berlin': {
    dem: { url: 'https://data.geobasis-bb.de/geobasis/daten/dgm/', fmt: 'tif', note: 'berlin' },
    bldg: { url: 'https://gdi.berlin.de/geonetwork/srv/api/records/3c7c49af-00a4-3bcd-bc00-20e7f0f1b7bf' }
  },
  'Brandenburg': {
    dem: { url: 'https://data.geobasis-bb.de/geobasis/daten/dgm/tif/', fmt: 'tif' },
    bldg: { url: 'https://data.geobasis-bb.de/geobasis/daten/3d_gebaeude/' }
  },
  'Bremen': {
    dem: { url: 'https://gdk.gdi-de.org/geonetwork/srv/api/records/C448202A-0F15-413A-99E6-F22F10E190C9', fmt: 'xyz', note: 'catalog' },
    bldg: { url: 'https://www.geo.bremen.de/produkte/3d-produkte/3d-gebaeudemodelle-11892' }
  },
  'Hamburg': {
    dem: { url: 'https://metaver.de/trefferanzeige?docuuid=A39B4E86-15E2-4BF7-BA82-66F9913D5640', fmt: 'xyz' },
    bldg: { url: 'https://metaver.de/trefferanzeige?docuuid=1F6E48EB-3B7B-4F61-AE3C-C03079ECCAEA' }
  },
  'Hessen': {
    dem: { url: 'https://hvbg.hessen.de/landesvermessung/geotopographie/3d-daten/digitale-gelaendemodelle', fmt: 'tif' },
    bldg: { url: 'https://hvbg.hessen.de/landesvermessung/geotopographie/3d-daten/3d-gebaeudemodelle' }
  },
  'Mecklenburg-Vorpommern': {
    dem: { url: 'https://laiv.geodaten-mv.de/afgvk/Geotopographie/Download?produkt=DGM1', fmt: 'tif' },
    bldg: { url: 'https://laiv.geodaten-mv.de/afgvk/Geotopographie/Beschreibung?produkt=3DGbm' }
  },
  'Niedersachsen': {
    dem: { url: 'https://ni-lgln-opengeodata.hub.arcgis.com/pages/digitales-gel-ndemodell-dgm1', fmt: 'tif' },
    bldg: { url: 'https://ni-lgln-opengeodata.hub.arcgis.com/pages/3d-geb-udemodell-lod2' }
  },
  'Nordrhein-Westfalen': {
    dem: { url: 'https://www.opengeodata.nrw.de/produkte/geobasis/hm/dgm1_tiff/', fmt: 'tif' },
    bldg: { url: 'https://www.opengeodata.nrw.de/produkte/geobasis/3dg/lod2_gml/' }
  },
  'Rheinland-Pfalz': {
    dem: { url: 'https://geoshop.rlp.de/opendata-dgm1.html', fmt: 'xyz' },
    bldg: { url: 'https://geoshop.rlp.de/opendata-geb3dlo.html' }
  },
  'Saarland': {
    dem: { url: 'https://www.saarland.de/lvgl/DE/themen-aufgaben/themen/geotopographie/digitalegelaendemodelle/digitalegelaendemodelle', fmt: 'unclear', note: 'saarland' },
    bldg: null, bldgNote: 'servicesOnly'
  },
  'Sachsen': {
    dem: { url: 'https://www.geodaten.sachsen.de/downloadbereich-digitale-hoehenmodelle-4851.html', fmt: 'tif' },
    bldg: { url: 'https://www.geodaten.sachsen.de/downloadbereich-digitale-3d-stadtmodelle-4875.html' }
  },
  'Sachsen-Anhalt': {
    dem: { url: 'https://www.lvermgeo.sachsen-anhalt.de/de/gdp-dgm-dom-lsa.html', fmt: 'tif' },
    bldg: { url: 'https://www.lvermgeo.sachsen-anhalt.de/de/gdp-3d-gebaeudemodell.html' }
  },
  'Schleswig-Holstein': {
    dem: { url: 'https://opendata.schleswig-holstein.de/dataset/digitales-gelandemodell-1-dgm1', fmt: 'xyz' },
    bldg: { url: 'https://www.schleswig-holstein.de/DE/landesregierung/ministerien-behoerden/LVERMGEOSH/Themen/themaOpenGbd', note: 'unverified' }
  },
  'Thüringen': {
    dem: { url: 'https://tlbg.thueringen.de/geobasisdaten/3d-informationen/digitale-gelaendemodelle', fmt: 'tif' },
    bldg: { url: 'https://tlbg.thueringen.de/geobasisdaten/3d-informationen/3d-gebaeudemodelle' }
  }
};

// Österreich: Bund (BEV) für alle, dazu Länder bzw. Städte mit eigenem Angebot
const GEO_AT_FEDERAL = [
  { url: 'https://www.bev.gv.at/Services/Produkte/Digitales-Gelaendehoehenmodell/ALS-Hoehenraster.html', fmt: 'tif', note: 'epsg3035', label: 'BEV 1 m' },
  { url: 'https://www.data.gv.at/katalog/dataset/d88a1246-9684-480b-a480-ff63286b35b7', fmt: 'tif', label: 'Österreich 10 m' }
];
const GEO_AT_STATES = {
  'Wien': {
    dem: { url: 'https://www.data.gv.at/katalog/dataset/1eda4b16-05e3-43c3-b5b0-ef8276df0701', fmt: 'tif' },
    bldg: { url: 'https://www.data.gv.at/katalog/dataset/86d88cae-ad97-4476-bae5-73488a12776d' }
  },
  'Tirol': { dem: { url: 'https://www.data.gv.at/katalog/dataset/0454f5f3-1d8c-464e-847d-541901eb021a', fmt: 'tif' } },
  'Salzburg': { dem: { url: 'https://www.data.gv.at/katalog/dataset/093d4dec-8397-4faf-b690-b8cbe9a9dc31', fmt: 'tif', note: 'asc' } },
  'Oberösterreich': { dem: { url: 'https://www.data.gv.at/katalog/dataset/68cfe491-7cdf-4781-a1f1-603cd0738abd', fmt: 'tif' } },
  'Burgenland': { dem: { url: 'https://geodaten.bgld.gv.at/de/downloads/hoehenmodelle-orthofotos.html', fmt: 'unclear', note: 'unverified' } }
};
/* Bund: DLM Bauwerke des BEV, österreichweit als Blockmodell LoD1 (Polygone mit Höhen), GeoPackage, CC BY 4.0 (Metadaten bei data.bev.gv.at, Stichtag 23.03.2026) */
const GEO_AT_FEDERAL_BLDG = [
  { url: 'https://data.bev.gv.at/geonetwork/srv/ger/catalog.search#/metadata/b7f4843a-83d1-419a-bc87-bc2aaa83976d', label: 'BEV DLM Bauwerke · LoD1', note: 'atGpkg' }
];
const GEO_AT_LINZ_BLDG = { url: 'https://www.data.gv.at/katalog/dataset/5f4440ca-90b7-4875-a0e4-bce7f8abb13e' };

/* Europäische Union ohne Deutschland und Österreich: je Land die Seiten für Geländemodell (dem) und Gebäudemodell (bldg).
   Zusammengestellt im November 2026 nach den Angaben der Landesvermessungen und der Übersicht von maps3d.io/dataset;
   jeder Link antwortete bei der Prüfung. fmt 'tif' steht nur, wo die Seite selbst GeoTIFF nennt, sonst 'unclear'.
   Länder ohne bekanntes offenes Geländemodell tragen demNote 'euNoOpenDem' statt eines geratenen Links.
   note: Schlüssel eines Hinweises (STRINGS geoNote_...). Die Links stehen auch in README.md (Test vergleicht beides). */
const GEO_EU = {
  BE: { name: 'Belgien',
    dem: [
      { label: 'Flandern · 1 m', url: 'https://www.vlaanderen.be/datavindplaats/catalogus/digitaal-hoogtemodel-vlaanderen-ii-dtm-raster-1-m', fmt: 'tif',
        only: { state: ['Flandern', 'Flanders', 'Vlaanderen', 'Antwerpen', 'Antwerp', 'Limburg', 'Ostflandern', 'East Flanders', 'Oost-Vlaanderen', 'Westflandern', 'West Flanders', 'West-Vlaanderen', 'Flämisch-Brabant', 'Flemish Brabant', 'Vlaams-Brabant'] } },
      { label: 'Wallonien · 0,5 m', url: 'https://geoportail.wallonie.be/catalogue/a004e570-99d6-4fe5-b83d-49b774409278.html', fmt: 'tif',
        only: { state: ['Wallonien', 'Wallonia', 'Wallonie', 'Hennegau', 'Hainaut', 'Lüttich', 'Liège', 'Luik', 'Luxemburg', 'Luxembourg', 'Namur', 'Namen', 'Wallonisch-Brabant', 'Walloon Brabant', 'Brabant wallon'] } }
    ],
    bldg: [{ label: '3D GRB · LoD1 (Flandern)', url: 'https://www.vlaanderen.be/digitaal-vlaanderen/onze-diensten-en-platformen/basiskaart-vlaanderen-grb/3d-grb', note: 'bldgShp',
             only: { state: ['Flandern', 'Flanders', 'Vlaanderen', 'Antwerpen', 'Antwerp', 'Limburg', 'Ostflandern', 'East Flanders', 'Oost-Vlaanderen', 'Westflandern', 'West Flanders', 'West-Vlaanderen', 'Flämisch-Brabant', 'Flemish Brabant', 'Vlaams-Brabant'] } }],
    bldgNote: 'noEuBldg' },
  BG: { name: 'Bulgarien', dem: [], demNote: 'euNoOpenDem', bldg: [], bldgNote: 'noEuBldg' },
  HR: { name: 'Kroatien',
    dem: [{ label: 'DGU Digitalni model reljefa (WMS)', url: 'https://data.gov.hr/ckan/en/dataset/digitalni-model-reljefa', fmt: 'unclear', note: 'servicesOnly' }],
    bldg: [], bldgNote: 'noEuBldg' },
  CY: { name: 'Zypern',
    dem: [{ label: 'Zypern · 1 m', url: 'https://www.data.gov.cy/el/dataset/ypsometria-inspire', fmt: 'unclear', note: 'euCheckFormat' }],
    bldg: [], bldgNote: 'noEuBldg' },
  CZ: { name: 'Tschechien',
    dem: [
      { label: 'ČÚZK DMR 5G (ETRS89) · Punktwolke', url: 'https://geoportal.cuzk.cz/Default.aspx?mode=TextMeta&side=vyskopis&metadataID=CZ-CUZK-DMR5G-ETRS89-V&head_tab=sekce-02-gp&menu=3021', fmt: 'laz', note: 'czLaz' },
      { label: 'ČÚZK DMR 4G · 5 m', url: 'https://geoportal.cuzk.cz/', fmt: 'unclear', note: 'euCheckFormat' }
    ],
    bldg: [], bldgNote: 'noEuBldg' },
  DK: { name: 'Dänemark',
    dem: [{ label: 'Højdemodel Terræn · 0,4 m', url: 'https://dataforsyningen.dk/data/930', fmt: 'tif' }],
    bldg: [], bldgNote: 'noEuBldg' },
  EE: { name: 'Estland',
    dem: [{ label: 'Maa-amet · 1 m', url: 'https://geoportaal.maaruum.ee/eng/spatial-data/elevation-data-p308.html', fmt: 'tif' }],
    bldg: [{ label: 'Maa- ja Ruumiamet · LoD2 (ganz Estland)', url: 'https://geoportaal.maaruum.ee/eng/Download-3D-data-p837.html' }] },
  FI: { name: 'Finnland',
    dem: [{ label: 'Maanmittauslaitos · 2 m', url: 'https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/product-descriptions/elevation-model-2-m', fmt: 'tif' }],
    bldg: [{ label: 'Maanmittauslaitos Buildings 3D · LoD2', url: 'https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/product-descriptions/buildings-3d', note: 'euPartial' }] },
  FR: { name: 'Frankreich',
    dem: [
      { label: 'MNT LiDAR HD · 0,5 m', url: 'https://www.data.gouv.fr/datasets/mnt-lidar-hd', fmt: 'tif', note: 'frLidar' },
      { label: 'LiDAR HD: Abdeckung nach Gemeinde', url: 'https://www.data.gouv.fr/datasets/carte-du-lidar-hd-de-lign-par-commune-date-du-vol-et-couverture-en-france' },
      { label: 'RGE ALTI · 1 m', url: 'https://geoservices.ign.fr/rgealti', fmt: 'unclear', note: 'euCheckFormat' }
    ],
    bldg: [{ label: 'IGN LiDAR HD, Gebäude 3D (LoD2, Beta)', url: 'https://www.ign.fr/institut/programme-lidar-hd-vers-une-nouvelle-cartographie-3d-du-territoire', note: 'euPartial' }] },
  GR: { name: 'Griechenland', dem: [], demNote: 'euNoOpenDem', bldg: [], bldgNote: 'noEuBldg' },
  HU: { name: 'Ungarn', dem: [], demNote: 'euNoOpenDem', bldg: [], bldgNote: 'noEuBldg' },
  IE: { name: 'Irland',
    dem: [{ label: 'GSI Open LiDAR · 0,13 bis 2 m', url: 'https://data.gov.ie/en_GB/dataset/open-topographic-lidar-data', fmt: 'tif', note: 'euPartial' }],
    bldg: [], bldgNote: 'noEuBldg' },
  IT: { name: 'Italien',
    dem: [
      { label: 'TINITALY · 10 m', url: 'https://tinitaly.pi.ingv.it/Download_Area1_1.html', fmt: 'unclear', note: 'euCheckFormat' },
      { label: 'Südtirol · 2,5 m', url: 'https://natur-raum.provinz.bz.it/de/digitale-hohenmodelle', fmt: 'unclear', note: 'euCheckFormat',
        only: { county: ['Bozen', 'Bolzano', 'Südtirol', 'Alto Adige'] } }
    ], bldg: [], bldgNote: 'noEuBldg' },
  LV: { name: 'Lettland',
    dem: [{ label: 'LĢIA · 20 m', url: 'https://www.lgia.gov.lv/en/Digit%C4%81lais%20reljefa%20modelis', fmt: 'unclear', note: 'euCheckFormat' }],
    bldg: [], bldgNote: 'noEuBldg' },
  LT: { name: 'Litauen', dem: [], demNote: 'euNoOpenDem', bldg: [], bldgNote: 'noEuBldg' },
  LU: { name: 'Luxemburg',
    dem: [{ label: 'LiDAR 2019 · 0,5 m', url: 'https://data.public.lu/fr/datasets/lidar-2019-modele-numerique-de-terrain-mnt/', fmt: 'tif' }],
    bldg: [{ label: 'BD-L-BATI3D (LoD2, CityGML)', url: 'https://data.public.lu/en/datasets/base-de-donnees-nationale-des-batiments-3d-2023/' }] },
  MT: { name: 'Malta',
    dem: [{ label: 'DTM 2018 · 1 m', url: 'https://portal.data.gov.mt/dataset/digital-terrain-model-2018', fmt: 'unclear', note: 'euCheckFormat' }],
    bldg: [], bldgNote: 'noEuBldg' },
  NL: { name: 'Niederlande',
    dem: [
      { label: 'AHN · 0,5 m (COG)', url: 'https://www.ahn.nl/dataroom', fmt: 'tif' },
      { label: 'PDOK-Download DTM · 0,5 m', url: 'https://service.pdok.nl/rws/ahn/atom/dtm_05m.xml', fmt: 'tif' }
    ],
    bldg: [{ label: '3DBAG (LoD2.2)', url: 'https://3dbag.nl/en/download', note: 'euBldgNotCityGml' }] },
  PL: { name: 'Polen',
    dem: [{ label: 'GUGiK NMT · 1 m und 5 m', url: 'https://www.geoportal.gov.pl/', fmt: 'unclear', note: 'euCheckFormat' }],
    bldg: [{ label: 'GUGiK Modele 3D budynków · LoD1 (ganz Polen), LoD2', url: 'https://www.geoportal.gov.pl/en/data/other-data/3d-models-of-building/', note: 'plLod2' }] },
  PT: { name: 'Portugal',
    dem: [{ label: 'DGT LiDAR, Festland · 0,5 m', url: 'https://cdd.dgterritorio.gov.pt/dgt-fe/catalogos/colecoes?filter=LiDAR+-+Modelos+Digitais+do+Relevo&language=en', fmt: 'unclear', note: 'euCheckFormat' }],
    bldg: [], bldgNote: 'noEuBldg' },
  RO: { name: 'Rumänien',
    dem: [{ label: 'ANCPI LAKI II · 0,5 m (teilweise)', url: 'https://geoportal.ancpi.ro/portal/apps/webappviewer/index.html?id=3f34ee5af71c400396dda574f0d53274', fmt: 'unclear', note: 'euUnreachable' }],
    bldg: [], bldgNote: 'noEuBldg' },
  SK: { name: 'Slowakei',
    dem: [{ label: 'ÚGKK DMR 5.0 · 1 m', url: 'https://geoportal.gov.sk/gallery/datasets/detail/c310bf1e-68a0-43b9-9955-c7dad13a93aa', fmt: 'unclear', note: 'euCheckFormat' }],
    bldg: [], bldgNote: 'noEuBldg' },
  SI: { name: 'Slowenien',
    dem: [{ label: 'ARSO DMR · 1 m', url: 'https://gis.arso.gov.si/evode/', fmt: 'unclear', note: 'euCheckFormat' }],
    bldg: [], bldgNote: 'noEuBldg' },
  ES: { name: 'Spanien',
    dem: [
      { label: 'CNIG MDT02 · 2 m', url: 'https://centrodedescargas.cnig.es/CentroDescargas/modelo-digital-terreno-mdt02-segunda-cobertura', fmt: 'tif', note: 'esMdt' },
      { label: 'CNIG MDT05 · 5 m', url: 'https://centrodedescargas.cnig.es/CentroDescargas/modelo-digital-terreno-mdt05-primera-cobertura', fmt: 'tif' }
    ], bldg: [], bldgNote: 'noEuBldg' },
  SE: { name: 'Schweden',
    dem: [{ label: 'Lantmäteriet · 1 m', url: 'https://www.lantmateriet.se/sv/geodata/vara-produkter/produktlista/markhojdmodell-nedladdning/', fmt: 'unclear', note: 'euCheckFormat' }],
    bldg: [], bldgNote: 'noEuBldg' }
};

/* Stadtgeoportale: für Großstädte der EU (Hauptstädte und weitere Städte, soweit ein Geoportal oder Open-Data-Portal der Stadt gefunden wurde).
   Eine eigene Tabelle neben den Ländern: sie ergänzt die Seiten des Landes. Zusammengestellt im November 2026; jeder Link wurde aufgerufen
   (drei Seiten antworten Skripten nur mit einer Bot-Sperre: Tallinn, Vilnius, Den Haag; dort belegt eine Suche die Adresse).
   Städte ohne belegbaren Link stehen nicht darin, statt einen zu raten. kind: 'map' Karte/Geoportal, 'data' offene Daten, '3d' 3D-Stadtmodell.
   names: Schreibweisen, wie Photon die Stadt liefert (deutsch, englisch, Landessprache); verglichen wird ohne Akzente (addrNorm).
   Die Links stehen auch in README.md und README.en.md (Test vergleicht beides). */
const GEO_CITIES = [
  { cc: 'AT', name: 'Wien', names: ['Wien', 'Vienna'], links: [
    { kind: 'map', label: 'Geodatenviewer der Stadtvermessung Wien', url: 'https://www.wien.gv.at/ma41datenviewer/public/start.aspx' },
    { kind: 'data', label: 'Geodaten der MA 41', url: 'https://www.wien.gv.at/stadtplanung/ma41-geodaten' },
    { kind: 'data', label: 'Open Government Data Wien', url: 'https://www.data.gv.at/auftritte/stadt-wien' }
  ] },
  { cc: 'AT', name: 'Graz', names: ['Graz'], links: [
    { kind: 'data', label: 'Open Government Data Graz', url: 'https://www.data.gv.at/auftritte/stadt-graz' }
  ] },
  { cc: 'AT', name: 'Linz', names: ['Linz'], links: [
    { kind: 'map', label: 'WebGIS Linz', url: 'https://www.linz.at/stadtentwicklung/webgis.php' },
    { kind: 'data', label: 'Open Government Data Linz', url: 'https://www.data.gv.at/auftritte/stadt-linz' }
  ] },
  { cc: 'AT', name: 'Salzburg', names: ['Salzburg'], links: [
    { kind: 'map', label: 'Stadtplan Salzburg', url: 'https://maps.stadt-salzburg.at/' },
    { kind: '3d', label: '3D-Stadtmodell Salzburg', url: 'https://maps.stadt-salzburg.at/3d/' }
  ] },
  { cc: 'AT', name: 'Innsbruck', names: ['Innsbruck'], links: [
    { kind: 'map', label: 'geoHub Innsbruck', url: 'https://geohub-1-magibk.hub.arcgis.com/' }
  ] },
  { cc: 'BE', name: 'Brüssel', names: ['Brüssel', 'Brussel', 'Bruxelles', 'Brussels', 'Brussels Capital', 'Bruxelles Brussel'], links: [
    { kind: 'map', label: 'Geoportal der Stadt Brüssel', url: 'https://www.brussels.be/geoportal' },
    { kind: 'data', label: 'UrbIS (Region Brüssel-Hauptstadt)', url: 'https://be.brussels/en/about-region/urbis-data' },
    { kind: 'data', label: 'Datastore Brussels', url: 'https://datastore.brussels/' },
    { kind: 'data', label: 'opendata.brussels.be', url: 'https://opendata.brussels.be/pages/home/' }
  ] },
  { cc: 'BE', name: 'Antwerpen', names: ['Antwerpen', 'Antwerp', 'Anvers'], links: [
    { kind: 'data', label: 'Stad Antwerpen', url: 'https://portaal-stadantwerpen.opendata.arcgis.com/' }
  ] },
  { cc: 'BE', name: 'Gent', names: ['Gent', 'Ghent', 'Gand'], links: [
    { kind: 'data', label: 'Open Data Stad Gent', url: 'https://data.stad.gent/explore/' }
  ] },
  { cc: 'BG', name: 'Sofia', names: ['Sofia', 'Sofija', 'София'], links: [
    { kind: 'map', label: 'Sofiaplan', url: 'https://sofiaplan.bg/' }
  ] },
  { cc: 'HR', name: 'Zagreb', names: ['Zagreb'], links: [
    { kind: 'map', label: 'GeoPortal Zagreb', url: 'https://geoportal.zagreb.hr/' },
    { kind: 'data', label: 'Portal otvorenih podataka', url: 'https://data.zagreb.hr/' }
  ] },
  { cc: 'CZ', name: 'Prag', names: ['Prag', 'Praha', 'Prague'], links: [
    { kind: 'map', label: 'Geoportal Praha', url: 'https://geoportalpraha.cz/' },
    { kind: '3d', label: '3D-Modell der Gebäude und Brücken (IPR Praha)', url: 'https://geoportalpraha.cz/en/data-and-services/articles-and-projects/3d-model/3d-model-budovy-mosty' },
    { kind: 'data', label: 'Otevřená data Praha', url: 'https://lkod.cz/catalog/praha' }
  ] },
  { cc: 'CZ', name: 'Brünn', names: ['Brünn', 'Brno', 'Brunn'], links: [
    { kind: 'map', label: 'Mapový portál Brno', url: 'https://gis.brno.cz/' },
    { kind: 'data', label: 'data.Brno', url: 'https://data.brno.cz/' }
  ] },
  { cc: 'DK', name: 'Kopenhagen', names: ['Kopenhagen', 'København', 'Copenhagen'], links: [
    { kind: 'map', label: 'KBHkort', url: 'https://kbhkort.kk.dk/' },
    { kind: 'data', label: 'Københavns Kommune (opendata.dk)', url: 'https://www.opendata.dk/city-of-copenhagen' }
  ] },
  { cc: 'DK', name: 'Aarhus', names: ['Aarhus', 'Århus'], links: [
    { kind: 'data', label: 'Aarhus Kommune (opendata.dk)', url: 'https://www.opendata.dk/city-of-aarhus' }
  ] },
  { cc: 'EE', name: 'Tallinn', names: ['Tallinn', 'Reval'], links: [
    { kind: 'map', label: 'Tallinn Geoportal', url: 'https://www.tallinn.ee/en/tallinn-geoportal' }
  ] },
  { cc: 'FI', name: 'Helsinki', names: ['Helsinki', 'Helsingfors'], links: [
    { kind: 'map', label: 'Karttapalvelu Helsinki', url: 'https://kartta.hel.fi/' },
    { kind: '3d', label: '3D-Stadtmodell Helsinki', url: 'https://kartta.hel.fi/3d/' },
    { kind: 'data', label: 'Helsinki Region Infoshare', url: 'https://hri.fi/fi/' },
    { kind: '3d', label: 'Helsingin 3D-kaupunkimallit (LoD2, CityGML)', url: 'https://avoindata.suomi.fi/data/en_GB/dataset/helsingin-3d-kaupunkimalli' }
  ] },
  { cc: 'FI', name: 'Espoo', names: ['Espoo', 'Esbo'], links: [
    { kind: 'map', label: 'Espoon karttapalvelu', url: 'https://kartat.espoo.fi/ims' }
  ] },
  { cc: 'FI', name: 'Tampere', names: ['Tampere', 'Tammerfors'], links: [
    { kind: 'data', label: 'Tampere Region Infoshare', url: 'https://data.tampere.fi/fi/' }
  ] },
  { cc: 'FR', name: 'Paris', names: ['Paris'], links: [
    { kind: 'data', label: 'Paris Data', url: 'https://opendata.paris.fr/pages/home/' }
  ] },
  { cc: 'FR', name: 'Marseille', names: ['Marseille', 'Marseilles'], links: [
    { kind: 'data', label: 'Open Data Métropole Aix-Marseille-Provence', url: 'https://data.ampmetropole.fr/pages/accueil/' }
  ] },
  { cc: 'FR', name: 'Lyon', names: ['Lyon'], links: [
    { kind: 'data', label: 'data.grandlyon.com', url: 'https://data.grandlyon.com/portail/fr/' }
  ] },
  { cc: 'FR', name: 'Toulouse', names: ['Toulouse'], links: [
    { kind: 'data', label: 'Toulouse Métropole Open Data', url: 'https://data.toulouse-metropole.fr/pages/accueil/' }
  ] },
  { cc: 'FR', name: 'Nizza', names: ['Nizza', 'Nice'], links: [
    { kind: 'data', label: 'OpenData Nice Côte d’Azur', url: 'https://opendata.nicecotedazur.org/site' }
  ] },
  { cc: 'FR', name: 'Nantes', names: ['Nantes'], links: [
    { kind: 'data', label: 'Open Data Nantes Métropole', url: 'https://data.nantesmetropole.fr/pages/home/' }
  ] },
  { cc: 'FR', name: 'Straßburg', names: ['Straßburg', 'Strasbourg', 'Strassburg'], links: [
    { kind: 'data', label: 'data.strasbourg.eu', url: 'https://data.strasbourg.eu/pages/accueil/' }
  ] },
  { cc: 'FR', name: 'Bordeaux', names: ['Bordeaux'], links: [
    { kind: 'data', label: 'Bordeaux Métropole Open Data', url: 'https://opendata.bordeaux-metropole.fr/pages/accueil/' },
    { kind: '3d', label: 'Modélisation Agglo 3D (LoD2, CityGML)', url: 'https://www.data.gouv.fr/datasets/modelisation-agglo-3d-non-texturee-1' }
  ] },
  { cc: 'FR', name: 'Lille', names: ['Lille'], links: [
    { kind: 'data', label: 'dataMEL (Métropole Européenne de Lille)', url: 'https://data.lillemetropole.fr/accueil/' }
  ] },
  { cc: 'FR', name: 'Clermont-Ferrand', names: ['Clermont-Ferrand', 'Clermont Ferrand'], links: [
    { kind: '3d', label: 'Maquette 3D des bâtiments (LoD2.2, CityGML)', url: 'https://www.data.gouv.fr/datasets/maquette-3d-batiments-clermont-ferrand-2024' }
  ] },
  { cc: 'FR', name: 'Rennes', names: ['Rennes'], links: [
    { kind: 'data', label: 'Open Data Rennes Métropole', url: 'https://data.rennesmetropole.fr/explore/' }
  ] },
  { cc: 'FR', name: 'Montpellier', names: ['Montpellier'], links: [
    { kind: 'data', label: 'Montpellier Méditerranée Métropole', url: 'https://data.montpellier3m.fr/' }
  ] },
  { cc: 'DE', name: 'Berlin', names: ['Berlin'], links: [
    { kind: 'map', label: 'Geoportal Berlin', url: 'https://gdi.berlin.de/viewer/main/' },
    { kind: '3d', label: '3D-Downloadportal Berlin', url: 'https://www.businesslocationcenter.de/berlin3d-downloadportal/' },
    { kind: 'data', label: 'Geoinformation (Senatsverwaltung)', url: 'https://www.berlin.de/sen/stadt/stadtdaten/geoinformation/' }
  ] },
  { cc: 'DE', name: 'Hamburg', names: ['Hamburg'], links: [
    { kind: 'map', label: 'Geoportal Hamburg', url: 'https://geoportal-hamburg.de/' },
    { kind: 'data', label: 'Transparenzportal Hamburg', url: 'https://transparenz.hamburg.de/' }
  ] },
  { cc: 'DE', name: 'München', names: ['München', 'Munich', 'Muenchen'], links: [
    { kind: 'map', label: 'GeoPortal München', url: 'https://stadt.muenchen.de/infos/geoportal-muenchen.html' },
    { kind: 'data', label: 'Open Data Portal München', url: 'https://opendata.muenchen.de/' }
  ] },
  { cc: 'DE', name: 'Köln', names: ['Köln', 'Cologne', 'Koeln'], links: [
    { kind: 'map', label: 'Geoportal Köln', url: 'https://geoportal.stadt-koeln.de/' }
  ] },
  { cc: 'DE', name: 'Frankfurt am Main', names: ['Frankfurt am Main', 'Frankfurt'], links: [
    { kind: 'map', label: 'Geoportal Frankfurt', url: 'https://geoportal.frankfurt.de/karte/' },
    { kind: 'data', label: 'Offene Daten Frankfurt', url: 'https://offenedaten.frankfurt.de/' }
  ] },
  { cc: 'DE', name: 'Stuttgart', names: ['Stuttgart'], links: [
    { kind: 'map', label: 'Geoportal Stuttgart', url: 'https://www.stuttgart.de/leben/bauen/geoportal/' },
    { kind: 'data', label: 'OpenData@Stuttgart', url: 'https://opendata.stuttgart.de/' }
  ] },
  { cc: 'DE', name: 'Düsseldorf', names: ['Düsseldorf', 'Duesseldorf', 'Dusseldorf'], links: [
    { kind: 'map', label: 'Geoportal Düsseldorf', url: 'https://www.duesseldorf.de/geoportal/' }
  ] },
  { cc: 'DE', name: 'Leipzig', names: ['Leipzig'], links: [
    { kind: 'map', label: 'Stadtplan Leipzig', url: 'https://www.leipzig.de/stadtplan' },
    { kind: 'data', label: 'Open Data Leipzig', url: 'https://opendata.leipzig.de/' }
  ] },
  { cc: 'DE', name: 'Dortmund', names: ['Dortmund'], links: [
    { kind: 'map', label: 'Geoportal Dortmund', url: 'https://www.dortmund.de/allgemeines/geoportal-stadtplan/' },
    { kind: 'data', label: 'Open Data Dortmund', url: 'https://open-data.dortmund.de/pages/start/' }
  ] },
  { cc: 'DE', name: 'Essen', names: ['Essen'], links: [
    { kind: 'map', label: 'Geoportal Essen', url: 'https://geoportal.essen.de/' }
  ] },
  { cc: 'DE', name: 'Bremen', names: ['Bremen'], links: [
    { kind: 'map', label: 'GeoPortal Bremen', url: 'https://geoportal.bremen.de/geoportal/' }
  ] },
  { cc: 'DE', name: 'Dresden', names: ['Dresden'], links: [
    { kind: 'map', label: 'Themenstadtplan Dresden', url: 'https://stadtplan.dresden.de/' },
    { kind: 'data', label: 'Open Data Dresden', url: 'https://opendata.dresden.de/' }
  ] },
  { cc: 'DE', name: 'Hannover', names: ['Hannover', 'Hanover'], links: [
    { kind: 'data', label: 'Open GeoData Hannover', url: 'https://www.hannover.de/Leben-in-der-Region-Hannover/Verwaltungen-Kommunen/Die-Verwaltung-der-Landeshauptstadt-Hannover/Dezernate-und-Fachbereiche-der-LHH/Stadtentwicklung-und-Bauen/Fachbereich-Planen-und-Stadtentwicklung/Geoinformation/Open-GeoData' }
  ] },
  { cc: 'DE', name: 'Nürnberg', names: ['Nürnberg', 'Nuremberg', 'Nuernberg'], links: [
    { kind: 'map', label: 'GeoPortal Nürnberg', url: 'https://www.nuernberg.de/internet/geoinformation_bodenordnung/geoportal_landingpage.html' }
  ] },
  { cc: 'GR', name: 'Athen', names: ['Athen', 'Athens', 'Athína', 'Αθήνα'], links: [
    { kind: 'map', label: 'Athens Maps', url: 'https://maps.cityofathens.gr/' }
  ] },
  { cc: 'IE', name: 'Dublin', names: ['Dublin', 'Baile Átha Cliath'], links: [
    { kind: 'data', label: 'Dublin’s Open Data Portal', url: 'https://data.smartdublin.ie/' }
  ] },
  { cc: 'IT', name: 'Rom', names: ['Rom', 'Roma', 'Rome'], links: [
    { kind: 'map', label: 'Geoportale di Roma Capitale', url: 'https://geoportale.comune.roma.it/' }
  ] },
  { cc: 'IT', name: 'Mailand', names: ['Mailand', 'Milano', 'Milan'], links: [
    { kind: 'map', label: 'Geoportale Comune di Milano', url: 'https://gisportal.comune.milano.it/' },
    { kind: 'data', label: 'Portale del Dato Milano', url: 'https://dati.comune.milano.it/web/portale-del-dato' }
  ] },
  { cc: 'IT', name: 'Turin', names: ['Turin', 'Torino'], links: [
    { kind: 'map', label: 'Geoportale Città di Torino', url: 'http://geoportale.comune.torino.it/' }
  ] },
  { cc: 'IT', name: 'Neapel', names: ['Neapel', 'Napoli', 'Naples'], links: [
    { kind: 'map', label: 'Visore urbanistico Napoli', url: 'https://servizionline.comune.napoli.it/web/napoli/visore-urbanistico' }
  ] },
  { cc: 'IT', name: 'Genua', names: ['Genua', 'Genova', 'Genoa'], links: [
    { kind: 'map', label: 'Cartografia Comune di Genova', url: 'https://www.comune.genova.it/tutti-gli-argomenti/cartografia' }
  ] },
  { cc: 'IT', name: 'Bologna', names: ['Bologna'], links: [
    { kind: 'data', label: 'Open Data Comune di Bologna', url: 'https://opendata.comune.bologna.it/pages/home/' }
  ] },
  { cc: 'IT', name: 'Florenz', names: ['Florenz', 'Firenze', 'Florence'], links: [
    { kind: 'data', label: 'Open Data Comune di Firenze', url: 'https://opendata.comune.fi.it/' }
  ] },
  { cc: 'IT', name: 'Palermo', names: ['Palermo'], links: [
    { kind: 'data', label: 'Portale Open Data Palermo', url: 'https://opendata.comune.palermo.it/' }
  ] },
  { cc: 'LV', name: 'Riga', names: ['Riga', 'Rīga'], links: [
    { kind: 'map', label: 'GEO RĪGA', url: 'https://georiga.eu/' }
  ] },
  { cc: 'LT', name: 'Vilnius', names: ['Vilnius', 'Wilna'], links: [
    { kind: 'map', label: 'Interaktive Karten Vilnius', url: 'https://maps.vilnius.lt/en' }
  ] },
  { cc: 'LT', name: 'Kaunas', names: ['Kaunas', 'Kowno'], links: [
    { kind: 'map', label: 'Kauno žemėlapiai', url: 'https://zemelapiai.kaunas.lt/' }
  ] },
  { cc: 'NL', name: 'Amsterdam', names: ['Amsterdam'], links: [
    { kind: 'map', label: 'Maps Amsterdam', url: 'https://maps.amsterdam.nl/' },
    { kind: 'data', label: 'Data Amsterdam', url: 'https://data.amsterdam.nl/' }
  ] },
  { cc: 'NL', name: 'Rotterdam', names: ['Rotterdam'], links: [
    { kind: 'map', label: 'Rotterdam op de kaart', url: 'https://kaartlaag.rotterdam.nl/' },
    { kind: '3d', label: '3D Rotterdam', url: 'https://www.3drotterdam.nl/' },
    { kind: 'data', label: 'Rotterdam Open Data', url: 'https://data.rotterdam.nl/pages/home/' }
  ] },
  { cc: 'NL', name: 'Den Haag', names: ['Den Haag', 'The Hague', 's Gravenhage', 'Haag'], links: [
    { kind: 'data', label: 'Den Haag en open data', url: 'https://www.denhaag.nl/opendata' }
  ] },
  { cc: 'NL', name: 'Utrecht', names: ['Utrecht'], links: [
    { kind: 'data', label: 'Open Utrecht', url: 'https://open.utrecht.nl/' }
  ] },
  { cc: 'PL', name: 'Warschau', names: ['Warschau', 'Warszawa', 'Warsaw'], links: [
    { kind: 'map', label: 'Serwis Mapowy Warszawa', url: 'https://mapa.um.warszawa.pl/' }
  ] },
  { cc: 'PL', name: 'Krakau', names: ['Krakau', 'Kraków', 'Krakow', 'Cracow'], links: [
    { kind: 'map', label: 'MSIP Kraków', url: 'https://msip.um.krakow.pl/' }
  ] },
  { cc: 'PL', name: 'Łódź', names: ['Łódź', 'Lodz', 'Lodsch'], links: [
    { kind: 'map', label: 'InterSIT Łódź', url: 'https://nowa.mapa.lodz.pl/' }
  ] },
  { cc: 'PL', name: 'Breslau', names: ['Breslau', 'Wrocław', 'Wroclaw'], links: [
    { kind: 'map', label: 'SIP Wrocław', url: 'https://geoportal.wroclaw.pl/' }
  ] },
  { cc: 'PL', name: 'Posen', names: ['Posen', 'Poznań', 'Poznan'], links: [
    { kind: 'map', label: 'Geoportal Poznań', url: 'https://www.poznan.pl/mim/info/geoportal/' }
  ] },
  { cc: 'PT', name: 'Lissabon', names: ['Lissabon', 'Lisboa', 'Lisbon'], links: [
    { kind: 'data', label: 'Geodados da Câmara Municipal de Lisboa', url: 'https://geodados-cml.hub.arcgis.com/' }
  ] },
  { cc: 'PT', name: 'Porto', names: ['Porto', 'Oporto'], links: [
    { kind: 'data', label: 'Portal de Dados Abertos Porto', url: 'https://dadosabertos.cm-porto.pt/' }
  ] },
  { cc: 'SK', name: 'Bratislava', names: ['Bratislava', 'Pressburg'], links: [
    { kind: 'data', label: 'OpenData Bratislava', url: 'https://data.bratislava.sk/' }
  ] },
  { cc: 'SI', name: 'Ljubljana', names: ['Ljubljana', 'Laibach'], links: [
    { kind: 'data', label: 'Odprti podatki Mestne občine Ljubljana', url: 'https://mol-ljubljana.hub.arcgis.com/' }
  ] },
  { cc: 'ES', name: 'Madrid', names: ['Madrid'], links: [
    { kind: 'map', label: 'Geoportal Ayuntamiento de Madrid', url: 'https://geoportal.madrid.es/IDEAM_WBGEOPORTAL/index.iam' },
    { kind: 'data', label: 'Portal de datos abiertos Madrid', url: 'https://datos.madrid.es/' }
  ] },
  { cc: 'ES', name: 'Barcelona', names: ['Barcelona'], links: [
    { kind: 'map', label: 'CartoBCN', url: 'https://w20.bcn.cat/cartobcn/' },
    { kind: 'data', label: 'Open Data BCN', url: 'https://opendata-ajuntament.barcelona.cat/' }
  ] },
  { cc: 'ES', name: 'Valencia', names: ['Valencia', 'València'], links: [
    { kind: 'map', label: 'GeoportalHome Valencia', url: 'https://geoportal.valencia.es/apps/GeoportalHome/es/inicio/' }
  ] },
  { cc: 'ES', name: 'Saragossa', names: ['Saragossa', 'Zaragoza'], links: [
    { kind: 'map', label: 'IDEZar Zaragoza', url: 'https://www.zaragoza.es/sede/portal/espacio-de-datos/conoce-idezar' }
  ] },
  { cc: 'ES', name: 'Málaga', names: ['Málaga', 'Malaga'], links: [
    { kind: 'data', label: 'Datos abiertos Málaga', url: 'https://datosabiertos.malaga.eu/' }
  ] },
  { cc: 'SE', name: 'Stockholm', names: ['Stockholm'], links: [
    { kind: 'data', label: 'Dataportalen Stockholm', url: 'https://dataportalen.stockholm.se/dataportalen/srv/swe/catalog.search' }
  ] },
  { cc: 'SE', name: 'Göteborg', names: ['Göteborg', 'Gothenburg', 'Goteborg'], links: [
    { kind: 'data', label: 'Göteborgs Stad öppna data', url: 'https://data.goteborg.se/' }
  ] }
];

/* Datenquellen zu einem Ort ({country: 'DE'|'AT'|..., state, city}); liefert
   {country, region, dem: [...], bldg: [...], bldgNote} oder null, wenn nichts hinterlegt ist */
function geoSourcesFor(place) {
  if (!place) return null;
  const cc = String(place.country || '').toUpperCase();
  if (cc === 'DE') {
    const e = GEO_ENTRIES[place.state];
    if (!e) return null;
    return { country: 'DE', region: place.state, dem: [e.dem], bldg: e.bldg ? [e.bldg] : [], bldgNote: e.bldgNote || null };
  }
  if (cc === 'AT') {
    const e = GEO_AT_STATES[place.state] || {};
    const dem = [];
    if (e.dem) dem.push(Object.assign({ label: place.state }, e.dem));
    GEO_AT_FEDERAL.forEach(function (f) { dem.push(f); });
    const bldg = [];
    if (e.bldg) bldg.push(Object.assign({ label: place.state }, e.bldg));
    if (place.city === 'Linz') bldg.push(Object.assign({ label: 'Linz' }, GEO_AT_LINZ_BLDG));
    GEO_AT_FEDERAL_BLDG.forEach(function (f) { bldg.push(f); });
    return { country: 'AT', region: place.state || 'Österreich', dem: dem, bldg: bldg, bldgNote: null };
  }
  const eu = GEO_EU[cc];
  if (eu) {
    const dem = eu.dem.filter(function (x) { return placeMatchesOnly(x.only, place); });
    // Gelten alle Links nur für Teile des Landes und keiner passt (zum Beispiel Brüssel in Belgien): Hinweis statt einer falschen Region
    const bldg = eu.bldg.filter(function (x) { return placeMatchesOnly(x.only, place); });
    const demNote = eu.demNote || (eu.dem.length && !dem.length ? 'euNoOpenDem' : null);
    return { country: cc, region: eu.name, dem: dem, demNote: demNote,
             bldg: bldg, bldgNote: bldg.length ? null : (eu.bldgNote || null) };
  }
  return null;
}

/* Gilt ein Link nur für einen Teil des Landes, muss der Ort dazu passen. Photon nennt Landkreis (county, bei Südtirol "Bozen") und
   Bundesland bzw. Provinz (state, in Belgien die Provinz, zum Beispiel "Lüttich"). Fehlt die Angabe, wird der Link nicht gezeigt, statt ihn
   überall zu zeigen.
     only: { county: [...] }  der Landkreis enthält einen der Namen (Südtirol in Italien)
     only: { state: [...] }   das Bundesland bzw. die Provinz ist genau einer der Namen (Flandern und Wallonien in Belgien) */
function placeMatchesOnly(only, place) {
  if (!only) return true;
  if (only.county) {
    const county = addrNorm(place && place.county);
    return !!county && only.county.some(function (n) { return county.indexOf(addrNorm(n)) >= 0; });
  }
  if (only.state) {
    const state = addrNorm(place && place.state);
    return !!state && only.state.some(function (n) { return state === addrNorm(n); });
  }
  return true;
}

/* Stadtgeoportale zu einem Ort: Eintrag aus GEO_CITIES, wenn Land und Stadtname passen, sonst null */
function cityPortalsFor(place) {
  if (!place || !place.city) return null;
  const cc = String(place.country || '').toUpperCase(), c = addrNorm(place.city);
  if (!c) return null;
  for (let i = 0; i < GEO_CITIES.length; i++) {
    const e = GEO_CITIES[i];
    if (e.cc === cc && e.names.some(function (n) { return addrNorm(n) === c; })) return e;
  }
  return null;
}

const PHOTON_URL = 'https://photon.komoot.io/api/';
const PHOTON_BBOX = '-10.6,34.5,34.7,71.3';       // Festland der EU samt Zypern, Malta und Nordkap

/* Bundesland für die Zuordnung: Stadtstaaten (Berlin, Hamburg, Wien) haben bei Photon kein Feld `state`,
   Bremen heißt dort "Freie Hansestadt Bremen"; Zusätze wie "Freistaat" fallen weg */
function normalizeState(state, city, country) {
  let st = String(state || '').replace(/^(Freie und Hansestadt|Freie Hansestadt|Freistaat|Land)\s+/i, '').trim();
  if (!st) {
    const c = String(city || '').trim();
    if ((String(country).toUpperCase() === 'DE' && (c === 'Berlin' || c === 'Hamburg')) ||
        (String(country).toUpperCase() === 'AT' && c === 'Wien')) st = c;
    else if (c === 'Bremerhaven') st = 'Bremen';
  }
  return st;
}

/* Länder der Suche: Deutschland, Österreich und die übrigen Länder der EU (GEO_EU) */
function isSearchCountry(cc) { return cc === 'DE' || cc === 'AT' || Object.prototype.hasOwnProperty.call(GEO_EU, cc); }

/* Wandelt die Antwort von Photon in Vorschläge um; nur Länder der EU */
function parsePhoton(json) {
  const out = [];
  const feats = (json && json.features) || [];
  feats.forEach(function (f) {
    const p = f.properties || {}, g = f.geometry && f.geometry.coordinates;
    const cc = String(p.countrycode || '').toUpperCase();
    if (!g || g.length < 2 || !isSearchCountry(cc)) return;
    const street = p.street ? p.street + (p.housenumber ? ' ' + p.housenumber : '') : '';
    const main = p.name && p.name !== p.street ? p.name + (street ? ', ' + street : '') : (street || p.name || p.city || '');
    const city0 = p.city || p.town || p.village || '';
    const state = normalizeState(p.state, city0, cc);
    const place = [p.postcode, city0 || p.district || ''].filter(Boolean).join(' ');
    const sub = [place, state && state !== city0 ? state : ''].filter(Boolean).join(', ');
    if (!main) return;
    const key = main + '|' + sub;
    if (out.some(function (o) { return o.key === key; })) return;
    out.push({ key: key, main: main, sub: sub, lon: g[0], lat: g[1],
               country: cc, state: state, city: city0, county: p.county || '' });
  });
  return out.slice(0, 5);
}

/* Vergleichsform: Kleinbuchstaben, ohne Akzente und Umlautpunkte, ß = ss, nur Buchstaben und Ziffern */
function addrNorm(s) {
  return String(s || '').toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

/* Passt mindestens ein Vorschlag zur Eingabe? Jedes Wort der Eingabe muss im Text eines Vorschlags vorkommen
   (als Teilwort, damit "Münch" auch "München" trifft). Photon liefert sonst auch bei Unbekanntem ähnlich klingende Treffer. */
function addrHasMatch(items, q) {
  const words = addrNorm(q).split(' ').filter(Boolean);
  if (!words.length) return true;
  return items.some(function (it) {
    const text = addrNorm(it.main + ' ' + it.sub);
    return words.every(function (w) { return text.indexOf(w) >= 0; });
  });
}

const ADDR_SUFFIXES = ['bruecke', 'brucke', 'strasse', 'str', 'weg', 'platz', 'allee', 'gasse', 'tunnel', 'ring', 'damm', 'steg'];

/* Namensstamm: hängt an einem Wort ein Endstück wie "brücke" oder "straße", wird es abgeschnitten
   ("Ohetalbrücke" -> "Ohetal"). Gibt null zurück, wenn sich nichts abschneiden lässt. */
function addrStem(q) {
  const words = String(q || '').trim().split(/\s+/);
  let changed = false;
  const out = words.map(function (w) {
    const n = addrNorm(w).replace(/ /g, '');
    for (let i = 0; i < ADDR_SUFFIXES.length; i++) {
      const suf = ADDR_SUFFIXES[i];
      if (n.length - suf.length >= 3 && n.slice(-suf.length) === suf) {
        // am Originalwort abschneiden: so viele Zeichen, wie das normalisierte Endstück lang ist (ü/ß ändern die Länge nicht)
        const cut = suf === 'bruecke' ? 7 : (suf === 'strasse' ? 7 : suf.length);
        const wl = w.length;
        const origCut = /brücke$/i.test(w) ? 6 : (/straße$/i.test(w) ? 6 : cut);
        if (wl - origCut >= 3) { changed = true; return w.slice(0, wl - origCut); }
      }
    }
    return w;
  });
  return changed ? out.join(' ') : null;
}

/* Erkennt Koordinaten in der Eingabe. Geografisch: "48.1366, 11.5771" (auch mit ° und N/E, Komma als
   Dezimalzeichen bei Semikolon-Trennung, Länge zuerst wird erkannt). Projiziert: "32 692000 5336000" (UTM-Zone),
   "EPSG:25832 692000 5336000", Gauß-Krüger "3500000 5400000" (Streifen aus der ersten Ziffer); bei zwei
   großen Zahlen ohne Angabe gilt das Bezugssystem des geladenen Geländes. Liefert {lat, lon, epsg?} oder null. */
function parseCoordinates(text, defaultEpsg) {
  let s = String(text || '').trim().replace(/[°º]/g, ' ').replace(/\b[NSEOWnseow]\b/g, ' ').replace(/\s+/g, ' ').trim();
  if (!s) return null;
  let epsg = null;
  let m = s.match(/^EPSG\s*:?\s*(\d{4,5})\s+(.*)$/i);
  if (m) { epsg = parseInt(m[1], 10); s = m[2]; }
  else if ((m = s.match(/^(?:UTM\s*)?(\d{2})\s*[A-Za-z]?\s+(\d{5,7}(?:[.,]\d+)?)\s+(\d{6,8}(?:[.,]\d+)?)$/i)) && +m[1] >= 28 && +m[1] <= 38) {
    epsg = 25800 + parseInt(m[1], 10); s = m[2] + ' ' + m[3];
  }
  // Zahlen: bei Semikolon gilt Komma als Dezimalzeichen, sonst trennt das Komma
  const semicolon = s.indexOf(';') >= 0;
  const parts = (semicolon ? s.split(';') : s.split(/[,\s]+/)).map(function (p) { return p.trim(); }).filter(Boolean);
  if (parts.length !== 2) return null;
  const nums = parts.map(function (p) {
    if (!/^[+-]?\d+([.,]\d+)?$/.test(p)) return NaN;
    return parseFloat(semicolon || p.indexOf('.') < 0 ? p.replace(',', '.') : p);
  });
  if (!nums.every(isFinite)) return null;
  const a = nums[0], b = nums[1];
  if (Math.abs(a) < 1000 && Math.abs(b) < 1000) {
    let lat = a, lon = b;
    if (lat < 20 && lon > 40) { lat = b; lon = a; }                 // Länge zuerst
    if (lat < 34 || lat > 72 || lon < -11 || lon > 35) return null;   // nur die EU (Festland)
    return { lat: lat, lon: lon };
  }
  // projizierte Koordinaten
  let e = a, n = b;
  if (!epsg) {
    if (e > 2e6 && e < 6e6 && n > 4.9e6 && n < 6.3e6) {
      const strip = Math.floor(e / 1e6);
      if (strip >= 2 && strip <= 5) epsg = 31464 + strip;
    } else if (defaultEpsg) epsg = defaultEpsg;
  }
  if (!epsg) return null;
  const g = crsToLonLat(epsg, e, n);
  if (!g || !isFinite(g.lat) || !isFinite(g.lon) || g.lat < 34 || g.lat > 72 || g.lon < -11 || g.lon > 35) return null;
  return { lat: g.lat, lon: g.lon, epsg: epsg };
}

/* Fragt Photon zu Koordinaten nach Ort und Land (für das Bundesland); liefert einen Vorschlag oder null */
async function photonReverse(lat, lon, signal) {
  const url = PHOTON_URL.replace('/api/', '/reverse') + '?lon=' + lon + '&lat=' + lat + '&lang=de&limit=1';
  const res = await fetch(url, signal ? { signal: signal } : undefined);
  if (!res.ok) throw new Error('Photon: HTTP ' + res.status);
  const json = await res.json();
  const f = (json.features || [])[0];
  if (!f) return null;
  const p = f.properties || {};
  const cc = String(p.countrycode || '').toUpperCase(), city = p.city || p.town || p.village || p.district || '';
  return { country: cc, state: normalizeState(p.state, p.city || p.town || p.village || '', cc), city: city, county: p.county || '', postcode: p.postcode || '' };
}

/* Fragt Photon nach Vorschlägen; signal: AbortSignal zum Abbrechen veralteter Anfragen */
async function photonSearch(query, signal) {
  const url = PHOTON_URL + '?q=' + encodeURIComponent(query) + '&lang=de&limit=10&bbox=' + PHOTON_BBOX;
  const res = await fetch(url, signal ? { signal: signal } : undefined);
  if (!res.ok) throw new Error('Photon: HTTP ' + res.status);
  return parsePhoton(await res.json());
}

/* =========================================================
   Karte (OpenStreetMap) als Grundlage
   Nur auf Wunsch (Schalter, Standard aus): lädt Kartenkacheln von
   tile.openstreetmap.org und legt sie als Farbe über das Gelände. Dabei
   gehen IP-Adresse und der ungefähre Standort des Geländes an OpenStreetMap -
   die Datenschutzerklärung nennt das.
   Die Kacheln liegen in Web Mercator; das Gelände in seinem Bezugssystem
   (UTM, Gauß-Krüger, Österreich GK). Über Längen-/Breitengrad der Ecken wird
   eine affine Abbildung Welt -> Kartenbild bestimmt; sie weicht bei 1 km
   Kantenlänge um etwa 0,2 m von der strengen Rechnung ab (plan.affineError).
   Bei Bezugssystemen auf Bessel (DHDN, MGI) kommt eine Helmert-Transformation
   nach WGS 84 dazu; die Lage stimmt dann auf etwa 1 bis 3 m.
   ========================================================= */
const GEO_ELL = {
  grs80: { a: 6378137, f: 1 / 298.257222101 },
  wgs84: { a: 6378137, f: 1 / 298.257223563 },
  bessel: { a: 6377397.155, f: 1 / 299.1528128 },
  intl: { a: 6378388, f: 1 / 297 }                       // Internationales Ellipsoid 1924 (Hayford): Luxemburg, Belgien
};
// dx, dy, dz in m; rx, ry, rz in Bogensekunden; Maßstab in ppm (Position-Vector-Konvention)
const HELMERT_DHDN = [598.1, 73.7, 418.2, 0.202, 0.045, -2.455, 6.7];
const HELMERT_MGI = [577.326, 90.129, 463.919, 5.137, 1.474, 5.297, 2.4232];
// Nationale Systeme der EU (Parameter wie in PROJ/EPSG; wo PROJ ein Netz nutzt, ist das Ergebnis hier auf etwa 1 m genau)
const HELMERT_LUREF = [-189.6806, 18.3463, -42.7695, -0.33746, -3.09264, 2.53861, 0.4598];       // Luxemburg 1930 -> ETRS89
const HELMERT_RD = [565.4171, 50.3319, 465.5524, -0.398957388243134, 0.343987817378283, -1.87740163998045, 4.0725];   // Amersfoort -> ETRS89
const HELMERT_GGRS87 = [-199.87, 74.79, 246.62, 0, 0, 0, 0];
const HELMERT_BD72 = [-106.8686, 52.2978, -103.7239, 0.3366, -0.457, 1.8422, -1.2747];            // Belgien 1972 -> ETRS89
// S-JTSK -> WGS 84: Tschechien (PROJ "S-JTSK to WGS 84 (5)", Drehungen in Positionsvektor-Schreibweise) und Slowakei ("(4)"), je etwa 1 m genau
const HELMERT_SJTSK_CZ = [572.213, 85.334, 461.94, 4.9732, 1.529, 5.2484, 3.5378];
const HELMERT_SJTSK_SK = [485, 169.5, 483.8, 7.786, 4.398, 4.103, 0];
function helmertSjtsk(lat, lon) {
  // Grenzlinie Slowakei/Tschechien grob von (16,95 E; 48,7 N) nach (18,85 E; 49,55 N); südlich davon gilt der slowakische Satz
  return (lon > 18.87 || lat < 48.7 + 0.4474 * (lon - 16.95)) && lon > 16.84 ? HELMERT_SJTSK_SK : HELMERT_SJTSK_CZ;
}
/* ---------- BeTA2007-Gitter (AdV): Lageverschiebung DHDN -> ETRS89 für Deutschland ----------
   Genauer als die 7-Parameter-Umrechnung (etwa 1 m statt etwa 3 m, EPSG:15948 statt EPSG:1777). Die Datei
   lib/de_adv_BETA2007.tif (24 KB, GeoTIFF aus PROJ-data) enthält je Stützpunkt die Verschiebung in Bogensekunden
   (Breite; Länge, positiv nach Osten). Sie wird beim Start nachgeladen; fehlt sie oder liegt ein Punkt außerhalb,
   rechnet die Helmert-Transformation. */
const BETA2007_URL = 'lib/de_adv_BETA2007.tif';
let betaGrid = null;            // { w, h, lon0, lat0 (erster Stützpunkt, Nordwest), dLon, dLat, lat, lon }
let betaLoading = null;

async function parseBeta2007(buffer) {
  const tiff = await GeoTIFF.fromArrayBuffer(buffer);
  const img = await tiff.getImage();
  const tie = img.getTiePoints()[0], scale = img.getFileDirectory().ModelPixelScale;
  const bands = await img.readRasters();
  betaGrid = { w: img.getWidth(), h: img.getHeight(), lon0: tie.x, lat0: tie.y, dLon: scale[0], dLat: scale[1], lat: bands[0], lon: bands[1] };
  return betaGrid;
}

function ensureBeta2007() {
  if (betaGrid) return Promise.resolve(true);
  if (typeof fetch !== 'function' || typeof GeoTIFF === 'undefined') return Promise.resolve(false);
  if (!betaLoading) {
    betaLoading = Promise.resolve()
      .then(function () { return fetch(BETA2007_URL); })
      .then(function (r) { if (!r.ok) throw new Error('beta'); return r.arrayBuffer(); })
      .then(parseBeta2007)
      .then(function () { return true; })
      .catch(function () { betaLoading = null; return false; });
  }
  return betaLoading;
}

function hasBeta2007() { return betaGrid !== null; }

/* Verschiebung DHDN -> ETRS89 an der Stelle (Grad) in Grad, bilinear; null außerhalb des Gitters oder ohne Gitter */
function betaShift(lat, lon) {
  const g = betaGrid;
  if (!g) return null;
  const x = (lon - g.lon0) / g.dLon, y = (g.lat0 - lat) / g.dLat;
  if (!(x >= 0 && y >= 0 && x <= g.w - 1 && y <= g.h - 1)) return null;
  const i = Math.min(Math.floor(x), g.w - 2), j = Math.min(Math.floor(y), g.h - 2), fx = x - i, fy = y - j;
  const at = function (band) {
    const k = j * g.w + i;
    return (band[k] * (1 - fx) + band[k + 1] * fx) * (1 - fy) + (band[k + g.w] * (1 - fx) + band[k + g.w + 1] * fx) * fy;
  };
  return { lat: at(g.lat) / 3600, lon: at(g.lon) / 3600 };
}

/* Geografische Koordinaten des Datums einer Definition nach WGS 84 / ETRS89 und zurück */
function datumToWgs84(d, lat, lon) {
  if (d.helmert === HELMERT_DHDN) {
    const s = betaShift(lat, lon);
    if (s) return { lat: lat + s.lat, lon: lon + s.lon };
  }
  return helmertToWgs84(lat, lon, d.ell, helmertOf(d, lat, lon));
}
function datumFromWgs84(d, lat, lon) {
  if (d.helmert === HELMERT_DHDN) {
    let s = betaShift(lat, lon);
    if (s) {
      let g = { lat: lat, lon: lon };
      for (let i = 0; i < 4; i++) {                          // das Gitter ist in DHDN angegeben: schrittweise annähern
        g = { lat: lat - s.lat, lon: lon - s.lon };
        s = betaShift(g.lat, g.lon) || s;
      }
      return g;
    }
  }
  return helmertFromWgs84(lat, lon, d.ell, helmertOf(d, lat, lon));
}

/* helmert einer Definition ist eine Parameterliste oder eine Funktion (Breite, Länge) -> Liste (je nach Lage verschieden) */
function helmertOf(d, lat, lon) { return typeof d.helmert === 'function' ? d.helmert(lat, lon) : d.helmert; }

/* Nationale Bezugssysteme der EU (Stand der Prüfung: Parameter aus PROJ/EPSG, Ergebnis gegen GDAL verglichen).
   tm: Gauß-Krüger/UTM mit Breitenursprung lat0; lcc: Lambert-Kegel (2 Standardparallelen); sterea: schiefe stereographische
   Abbildung (Niederlande); krovak: Krovak (Tschechien, Slowakei). helmert: Datumswechsel auf ETRS89/WGS 84 (genau auf etwa 1 m). */
const EU_NATIONAL_CRS = {
  3006: { ell: GEO_ELL.grs80, lon0: 15, k0: 0.9996, fe: 500000, fn: 0 },                     // SWEREF 99 TM (Schweden)
  3067: { ell: GEO_ELL.grs80, lon0: 27, k0: 0.9996, fe: 500000, fn: 0 },                     // ETRS-TM35FIN (Finnland)
  2180: { ell: GEO_ELL.grs80, lon0: 19, k0: 0.9993, fe: 500000, fn: -5300000 },              // PL-1992 (Polen)
  2176: { ell: GEO_ELL.grs80, lon0: 15, k0: 0.999923, fe: 5500000, fn: 0 },                  // PL-2000 Zone 5 bis 8
  2177: { ell: GEO_ELL.grs80, lon0: 18, k0: 0.999923, fe: 6500000, fn: 0 },
  2178: { ell: GEO_ELL.grs80, lon0: 21, k0: 0.999923, fe: 7500000, fn: 0 },
  2179: { ell: GEO_ELL.grs80, lon0: 24, k0: 0.999923, fe: 8500000, fn: 0 },
  3794: { ell: GEO_ELL.grs80, lon0: 15, k0: 0.9999, fe: 500000, fn: -5000000 },              // D96/TM (Slowenien)
  2169: { ell: GEO_ELL.intl, lat0: 49 + 50 / 60, lon0: 6 + 10 / 60, k0: 1, fe: 80000, fn: 100000, helmert: HELMERT_LUREF },   // LUREF (Luxemburg)
  3763: { ell: GEO_ELL.grs80, lat0: 39.668258333333333, lon0: -8.133108333333333, k0: 1, fe: 0, fn: 0 },   // PT-TM06 (Portugal)
  3059: { ell: GEO_ELL.grs80, lon0: 24, k0: 0.9996, fe: 500000, fn: -6000000 },              // LKS-92 (Lettland)
  3346: { ell: GEO_ELL.grs80, lon0: 24, k0: 0.9998, fe: 500000, fn: 0 },                     // LKS94 (Litauen)
  2100: { ell: GEO_ELL.grs80, lon0: 24, k0: 0.9996, fe: 500000, fn: 0, helmert: HELMERT_GGRS87 },     // GGRS87 (Griechenland)
  3765: { ell: GEO_ELL.grs80, lon0: 16.5, k0: 0.9999, fe: 500000, fn: 0 },                   // HTRS96/TM (Kroatien)
  2157: { ell: GEO_ELL.grs80, lat0: 53.5, lon0: -8, k0: 0.99982, fe: 600000, fn: 750000 },   // ITM (Irland)
  2154: { lcc: true, ell: GEO_ELL.grs80, lat1: 49, lat2: 44, lat0: 46.5, lon0: 3, fe: 700000, fn: 6600000 },                          // Lambert-93 (Frankreich)
  3812: { lcc: true, ell: GEO_ELL.grs80, lat1: 49 + 50 / 60, lat2: 51 + 10 / 60, lat0: 50.797815, lon0: 4.359215833333333, fe: 649328, fn: 665262 },   // Lambert 2008 (Belgien)
  3301: { lcc: true, ell: GEO_ELL.grs80, lat1: 59 + 20 / 60, lat2: 58, lat0: 57.517553930555556, lon0: 24, fe: 500000, fn: 6375000 },  // L-EST97 (Estland)
  31370: { lcc: true, ell: GEO_ELL.intl, lat1: 51.1666672333333, lat2: 49.8333339, lat0: 90, lon0: 4.36748666666667, fe: 150000.013, fn: 5400088.438, helmert: HELMERT_BD72 },   // Lambert 72 (Belgien)
  28992: { sterea: true, ell: GEO_ELL.bessel, lat0: 52.1561605555556, lon0: 5.38763888888889, k0: 0.9999079, fe: 155000, fn: 463000, helmert: HELMERT_RD },   // RD New (Niederlande)
  7415: { sterea: true, ell: GEO_ELL.bessel, lat0: 52.1561605555556, lon0: 5.38763888888889, k0: 0.9999079, fe: 155000, fn: 463000, helmert: HELMERT_RD },    // RD + NAP (3DBAG)
  5514: { krovak: true, ell: GEO_ELL.bessel, helmert: helmertSjtsk }                         // S-JTSK Krovak (Tschechien, Slowakei)
};

/* Beschreibt, wie ein EPSG-Code in Längen-/Breitengrad umgerechnet wird, oder null */
/* Alte, abgekündigte Nummern derselben Gauß-Krüger-Systeme (31462 bis 31465, laut EPSG durch 31466 bis 31469 ersetzt) und
   deren Fassungen „E-N“ (5676 bis 5679): Die Anwendung rechnet immer mit Rechtswert und Hochwert, also sind sie gleich. */
const EPSG_ALIASES = { 31462: 31466, 31463: 31467, 31464: 31468, 31465: 31469, 5676: 31466, 5677: 31467, 5678: 31468, 5679: 31469 };
function canonicalEpsg(code) { return EPSG_ALIASES[code] || code; }

function crsGeoDefinition(epsg) {
  epsg = canonicalEpsg(epsg);
  if (epsg === 4083) epsg = 25828;                                      // REGCAN95 / UTM 28N (Kanaren): wie ETRS89 / UTM 28N
  if (epsg === 4082) return { ell: GEO_ELL.grs80, lon0: -21, k0: 0.9996, fe: 500000, fn: 0 };   // REGCAN95 / UTM 27N (West-Hierro)
  if (epsg >= 25828 && epsg <= 25838) return { ell: GEO_ELL.grs80, lon0: (epsg - 25800) * 6 - 183, k0: 0.9996, fe: 500000, fn: 0 };
  if (epsg >= 32601 && epsg <= 32660) return { ell: GEO_ELL.wgs84, lon0: (epsg - 32600) * 6 - 183, k0: 0.9996, fe: 500000, fn: 0 };
  if (epsg === 4647) return { ell: GEO_ELL.grs80, lon0: 9, k0: 0.9996, fe: 32500000, fn: 0 };
  if (epsg === 5650) return { ell: GEO_ELL.grs80, lon0: 15, k0: 0.9996, fe: 33500000, fn: 0 };
  if (epsg >= 31466 && epsg <= 31469) {
    const z = epsg - 31464;
    return { ell: GEO_ELL.bessel, lon0: z * 3, k0: 1, fe: z * 1e6 + 500000, fn: 0, helmert: HELMERT_DHDN };
  }
  if (epsg >= 31254 && epsg <= 31256) {
    return { ell: GEO_ELL.bessel, lon0: [10 + 1 / 3, 13 + 1 / 3, 16 + 1 / 3][epsg - 31254], k0: 1, fe: 0, fn: -5000000, helmert: HELMERT_MGI };
  }
  const nat = EU_NATIONAL_CRS[epsg];
  if (nat) return nat;
  if (epsg === 3035) return { laea: true, ell: GEO_ELL.grs80, lat0: 52, lon0: 10, fe: 4321000, fn: 3210000 };   // BEV-Höhenraster, EU-weite Karten
  if (epsg === 3857) return { merc: true };
  return null;
}

/* Nordwert-Abzug für einen Breitenursprung lat0 (Gauß-Krüger/UTM haben ihn bei 0). Bei lat0 = 0 oder fehlend: 0. */
function tmLat0Offset(d) {
  if (!d.lat0) return 0;
  if (d._n0 === undefined) d._n0 = transverseMercatorForward(d.lat0, d.lon0, { ell: d.ell, lon0: d.lon0, k0: d.k0, fe: 0, fn: 0 }).n;
  return d._n0;
}

/* Umkehrung der Transversalen Mercator-Abbildung (Krüger-Reihe), Ergebnis in Grad */
function transverseMercatorInverse(e, n, d) {
  const f = d.ell.f, a = d.ell.a, nn = f / (2 - f);
  const n2 = nn * nn, n3 = n2 * nn, n4 = n3 * nn;
  const A = a / (1 + nn) * (1 + n2 / 4 + n4 / 64);
  const beta = [nn / 2 - 2 * n2 / 3 + 37 * n3 / 96 - n4 / 360, n2 / 48 + n3 / 15 - 437 * n4 / 1440,
                17 * n3 / 480 - 37 * n4 / 840, 4397 * n4 / 161280];
  const delta = [2 * nn - 2 * n2 / 3 - 2 * n3 + 116 * n4 / 45, 7 * n2 / 3 - 8 * n3 / 5 - 227 * n4 / 45,
                 56 * n3 / 15 - 136 * n4 / 35, 4279 * n4 / 630];
  const xi0 = (n - d.fn + tmLat0Offset(d)) / (d.k0 * A), eta0 = (e - d.fe) / (d.k0 * A);
  let xi = xi0, eta = eta0;
  for (let j = 1; j <= 4; j++) {
    xi -= beta[j - 1] * Math.sin(2 * j * xi0) * Math.cosh(2 * j * eta0);
    eta -= beta[j - 1] * Math.cos(2 * j * xi0) * Math.sinh(2 * j * eta0);
  }
  const chi = Math.asin(Math.sin(xi) / Math.cosh(eta));
  let lat = chi;
  for (let j = 1; j <= 4; j++) lat += delta[j - 1] * Math.sin(2 * j * chi);
  const lon = d.lon0 * Math.PI / 180 + Math.atan2(Math.sinh(eta), Math.cos(xi));
  return { lat: lat * 180 / Math.PI, lon: lon * 180 / Math.PI };
}

/* Datumswechsel Bessel -> WGS 84 mit Helmert-Parametern (Höhe 0) */
function helmertToWgs84(lat, lon, ell, h) {
  const rad = Math.PI / 180, as = Math.PI / 648000;
  const e2 = ell.f * (2 - ell.f);
  const phi = lat * rad, lam = lon * rad;
  const N = ell.a / Math.sqrt(1 - e2 * Math.sin(phi) * Math.sin(phi));
  const X = N * Math.cos(phi) * Math.cos(lam), Y = N * Math.cos(phi) * Math.sin(lam), Z = N * (1 - e2) * Math.sin(phi);
  const rx = h[3] * as, ry = h[4] * as, rz = h[5] * as, s = 1 + h[6] * 1e-6;
  const x2 = s * (X - rz * Y + ry * Z) + h[0];
  const y2 = s * (rz * X + Y - rx * Z) + h[1];
  const z2 = s * (-ry * X + rx * Y + Z) + h[2];
  const w = GEO_ELL.wgs84, we2 = w.f * (2 - w.f);
  const p = Math.hypot(x2, y2);
  let ph = Math.atan2(z2, p * (1 - we2));
  for (let i = 0; i < 6; i++) {
    const Nw = w.a / Math.sqrt(1 - we2 * Math.sin(ph) * Math.sin(ph));
    ph = Math.atan2(z2 + we2 * Nw * Math.sin(ph), p);
  }
  return { lat: ph / rad, lon: Math.atan2(y2, x2) / rad };
}

/* Transversale Mercator-Abbildung (Krüger-Reihe), Breite/Länge in Grad -> {e, n} */
function transverseMercatorForward(lat, lon, d) {
  const f = d.ell.f, a = d.ell.a, nn = f / (2 - f);
  const n2 = nn * nn, n3 = n2 * nn, n4 = n3 * nn;
  const A = a / (1 + nn) * (1 + n2 / 4 + n4 / 64);
  const alpha = [nn / 2 - 2 * n2 / 3 + 5 * n3 / 16 + 41 * n4 / 180, 13 * n2 / 48 - 3 * n3 / 5 + 557 * n4 / 1440,
                 61 * n3 / 240 - 103 * n4 / 140, 49561 * n4 / 161280];
  const rad = Math.PI / 180, phi = lat * rad, dl = lon * rad - d.lon0 * rad;
  const c = 2 * Math.sqrt(nn) / (1 + nn);
  const sp = Math.sin(phi);
  const t = Math.sinh(Math.atanh(sp) - c * Math.atanh(c * sp));
  const xi0 = Math.atan2(t, Math.cos(dl)), eta0 = Math.atanh(Math.sin(dl) / Math.sqrt(1 + t * t));
  let xi = xi0, eta = eta0;
  for (let j = 1; j <= 4; j++) {
    xi += alpha[j - 1] * Math.sin(2 * j * xi0) * Math.cosh(2 * j * eta0);
    eta += alpha[j - 1] * Math.cos(2 * j * xi0) * Math.sinh(2 * j * eta0);
  }
  return { e: d.fe + d.k0 * A * eta, n: d.fn + d.k0 * A * xi - tmLat0Offset(d) };
}

/* Umkehrung von helmertToWgs84: WGS 84 -> Datum der Ellipsoids ell (Höhe 0). Die Drehungen sind
   klein, daher genügt es, die Parameter umzukehren (Fehler weit unter einem Millimeter). */
function helmertFromWgs84(lat, lon, ell, h) {
  const rad = Math.PI / 180, as = Math.PI / 648000;
  const w = GEO_ELL.wgs84, we2 = w.f * (2 - w.f);
  const phi = lat * rad, lam = lon * rad;
  const N = w.a / Math.sqrt(1 - we2 * Math.sin(phi) * Math.sin(phi));
  const X = N * Math.cos(phi) * Math.cos(lam), Y = N * Math.cos(phi) * Math.sin(lam), Z = N * (1 - we2) * Math.sin(phi);
  const rx = -h[3] * as, ry = -h[4] * as, rz = -h[5] * as, s = 1 - h[6] * 1e-6;
  const X0 = X - h[0], Y0 = Y - h[1], Z0 = Z - h[2];
  const x2 = s * (X0 - rz * Y0 + ry * Z0), y2 = s * (rz * X0 + Y0 - rx * Z0), z2 = s * (-ry * X0 + rx * Y0 + Z0);
  const e2 = ell.f * (2 - ell.f), p = Math.hypot(x2, y2);
  let ph = Math.atan2(z2, p * (1 - e2));
  for (let i = 0; i < 6; i++) {
    const Nb = ell.a / Math.sqrt(1 - e2 * Math.sin(ph) * Math.sin(ph));
    ph = Math.atan2(z2 + e2 * Nb * Math.sin(ph), p);
  }
  return { lat: ph / rad, lon: Math.atan2(y2, x2) / rad };
}

/* Lambert-Azimutal-Flächentreue Abbildung (ellipsoidisch, schräg), EPSG:3035 ETRS89-LAEA. Formeln nach Snyder, "Map Projections",
   Gl. 3-12 bis 3-14, 24-27 bis 24-35 und 3-18; geprüft gegen GDAL (gdaltransform) in den Tests. */
function laeaConstants(d) {
  if (d._k) return d._k;
  const a = d.ell.a, f = d.ell.f, e2 = f * (2 - f), e = Math.sqrt(e2), rad = Math.PI / 180;
  const q = function (phi) {
    const s = Math.sin(phi);
    return (1 - e2) * (s / (1 - e2 * s * s) - (1 / (2 * e)) * Math.log((1 - e * s) / (1 + e * s)));
  };
  const phi0 = d.lat0 * rad, qp = q(Math.PI / 2), q0 = q(phi0);
  const beta0 = Math.asin(q0 / qp), Rq = a * Math.sqrt(qp / 2);
  const D = a * (Math.cos(phi0) / Math.sqrt(1 - e2 * Math.sin(phi0) * Math.sin(phi0))) / (Rq * Math.cos(beta0));
  d._k = { a: a, e2: e2, e: e, q: q, qp: qp, beta0: beta0, Rq: Rq, D: D, lam0: d.lon0 * rad };
  return d._k;
}

function laeaForward(lat, lon, d) {
  const k = laeaConstants(d), rad = Math.PI / 180;
  const beta = Math.asin(Math.max(-1, Math.min(1, k.q(lat * rad) / k.qp)));
  const dl = lon * rad - k.lam0;
  const B = k.Rq * Math.sqrt(2 / (1 + Math.sin(k.beta0) * Math.sin(beta) + Math.cos(k.beta0) * Math.cos(beta) * Math.cos(dl)));
  return {
    e: d.fe + B * k.D * Math.cos(beta) * Math.sin(dl),
    n: d.fn + (B / k.D) * (Math.cos(k.beta0) * Math.sin(beta) - Math.sin(k.beta0) * Math.cos(beta) * Math.cos(dl))
  };
}

function laeaInverse(e, n, d) {
  const k = laeaConstants(d), x = e - d.fe, y = n - d.fn;
  const rho = Math.sqrt((x / k.D) * (x / k.D) + (k.D * y) * (k.D * y));
  if (rho < 1e-9) return { lat: d.lat0, lon: d.lon0 };
  const C = 2 * Math.asin(Math.min(1, rho / (2 * k.Rq)));
  const sC = Math.sin(C), cC = Math.cos(C);
  const betap = Math.asin(Math.max(-1, Math.min(1, cC * Math.sin(k.beta0) + (k.D * y * sC * Math.cos(k.beta0)) / rho)));
  const lam = k.lam0 + Math.atan2(x * sC, k.D * rho * Math.cos(k.beta0) * cC - k.D * k.D * y * Math.sin(k.beta0) * sC);
  const e2 = k.e2, e4 = e2 * e2, e6 = e4 * e2;
  const phi = betap + (e2 / 3 + 31 * e4 / 180 + 517 * e6 / 5040) * Math.sin(2 * betap) +
              (23 * e4 / 360 + 251 * e6 / 3780) * Math.sin(4 * betap) + (761 * e6 / 45360) * Math.sin(6 * betap);
  return { lat: phi * 180 / Math.PI, lon: lam * 180 / Math.PI };
}

/* Lambert-Kegelprojektion mit zwei Standardparallelen (ellipsoidisch), Snyder Gl. 14-15 bis 15-11. Mit lat0 = 90 (Belgien, Lambert 72) liegt
   die Kegelspitze am Pol. */
function lccConstants(d) {
  if (d._k) return d._k;
  const a = d.ell.a, f = d.ell.f, e2 = f * (2 - f), e = Math.sqrt(e2), rad = Math.PI / 180;
  const m = function (phi) { return Math.cos(phi) / Math.sqrt(1 - e2 * Math.sin(phi) * Math.sin(phi)); };
  const t = function (phi) { return Math.tan(Math.PI / 4 - phi / 2) / Math.pow((1 - e * Math.sin(phi)) / (1 + e * Math.sin(phi)), e / 2); };
  const p1 = d.lat1 * rad, p2 = d.lat2 * rad, p0 = d.lat0 * rad;
  const n = (Math.log(m(p1)) - Math.log(m(p2))) / (Math.log(t(p1)) - Math.log(t(p2)));
  const F = m(p1) / (n * Math.pow(t(p1), n));
  d._k = { a: a, e: e, n: n, F: F, rho0: a * F * Math.pow(t(p0), n), lam0: d.lon0 * rad };
  return d._k;
}

function lccForward(lat, lon, d) {
  const k = lccConstants(d), phi = lat * Math.PI / 180, s = Math.sin(phi);
  const t = Math.tan(Math.PI / 4 - phi / 2) / Math.pow((1 - k.e * s) / (1 + k.e * s), k.e / 2);
  const rho = k.a * k.F * Math.pow(t, k.n), th = k.n * (lon * Math.PI / 180 - k.lam0);
  return { e: d.fe + rho * Math.sin(th), n: d.fn + k.rho0 - rho * Math.cos(th) };
}

function lccInverse(e, n, d) {
  const k = lccConstants(d), x = e - d.fe, y = k.rho0 - (n - d.fn);
  const sg = k.n > 0 ? 1 : -1;
  const rho = sg * Math.sqrt(x * x + y * y), th = Math.atan2(sg * x, sg * y);
  const t = Math.pow(rho / (k.a * k.F), 1 / k.n);
  let phi = Math.PI / 2 - 2 * Math.atan(t);
  for (let i = 0; i < 8; i++) {
    const s = Math.sin(phi);
    phi = Math.PI / 2 - 2 * Math.atan(t * Math.pow((1 - k.e * s) / (1 + k.e * s), k.e / 2));
  }
  return { lat: phi * 180 / Math.PI, lon: (th / k.n + k.lam0) * 180 / Math.PI };
}

/* Schiefe stereographische Abbildung (doppelt, EPSG 9809; RD New, Niederlande) */
function stereaConstants(d) {
  if (d._k) return d._k;
  const a = d.ell.a, f = d.ell.f, e2 = f * (2 - f), e = Math.sqrt(e2), p0 = d.lat0 * Math.PI / 180, s0 = Math.sin(p0);
  const rho0 = a * (1 - e2) / Math.pow(1 - e2 * s0 * s0, 1.5), nu0 = a / Math.sqrt(1 - e2 * s0 * s0);
  const R = Math.sqrt(rho0 * nu0), n = Math.sqrt(1 + e2 * Math.pow(Math.cos(p0), 4) / (1 - e2));
  const S1 = (1 + s0) / (1 - s0), S2 = (1 - e * s0) / (1 + e * s0), w1 = Math.pow(S1 * Math.pow(S2, e), n);
  const sinChi00 = (w1 - 1) / (w1 + 1);
  const c = (n + s0) * (1 - sinChi00) / ((n - s0) * (1 + sinChi00));
  const w2 = c * w1, chi0 = Math.asin((w2 - 1) / (w2 + 1));
  d._k = { e: e, R: R, n: n, c: c, chi0: chi0, lam0: d.lon0 * Math.PI / 180 };
  return d._k;
}

function stereaForward(lat, lon, d) {
  const k = stereaConstants(d), phi = lat * Math.PI / 180, s = Math.sin(phi);
  const w = k.c * Math.pow(((1 + s) / (1 - s)) * Math.pow((1 - k.e * s) / (1 + k.e * s), k.e), k.n);
  const chi = Math.asin((w - 1) / (w + 1));
  const L = k.n * (lon * Math.PI / 180 - k.lam0) + k.lam0, dl = L - k.lam0;
  const B = 1 + Math.sin(chi) * Math.sin(k.chi0) + Math.cos(chi) * Math.cos(k.chi0) * Math.cos(dl);
  return {
    e: d.fe + 2 * k.R * d.k0 * Math.cos(chi) * Math.sin(dl) / B,
    n: d.fn + 2 * k.R * d.k0 * (Math.sin(chi) * Math.cos(k.chi0) - Math.cos(chi) * Math.sin(k.chi0) * Math.cos(dl)) / B
  };
}

function stereaInverse(e, n, d) {
  const k = stereaConstants(d), x = e - d.fe, y = n - d.fn;
  const g = 2 * k.R * d.k0 * Math.tan(Math.PI / 4 - k.chi0 / 2), h = 4 * k.R * d.k0 * Math.tan(k.chi0) + g;
  const i = Math.atan(x / (h + y)), j = Math.atan(x / (g - y)) - i;
  const chi = k.chi0 + 2 * Math.atan((y - x * Math.tan(j / 2)) / (2 * k.R * d.k0));
  const L = j + 2 * i + k.lam0, lam = (L - k.lam0) / k.n + k.lam0;
  const psi = 0.5 * Math.log((1 + Math.sin(chi)) / (k.c * (1 - Math.sin(chi)))) / k.n;
  let phi = chi;
  for (let it = 0; it < 8; it++) {
    const s = Math.sin(phi);
    phi = 2 * Math.atan(Math.exp(psi) * Math.pow((1 + k.e * s) / (1 - k.e * s), k.e / 2)) - Math.PI / 2;
  }
  return { lat: phi * 180 / Math.PI, lon: lam * 180 / Math.PI };
}

/* Krovak (EPSG 9819), S-JTSK in Tschechien und der Slowakei. Wie PROJ/GDAL: Rechtswert = -Westwert, Hochwert = -Südwert (beide negativ). */
function krovakConstants(d) {
  if (d._k) return d._k;
  const a = d.ell.a, f = d.ell.f, e2 = f * (2 - f), e = Math.sqrt(e2), rad = Math.PI / 180;
  const phiC = 49.5 * rad, lam0 = (24 + 50 / 60) * rad, alphaC = 30.2881397527778 * rad, phiP = 78.5 * rad, kP = 0.9999;
  const sC = Math.sin(phiC);
  const A = a * Math.sqrt(1 - e2) / (1 - e2 * sC * sC), B = Math.sqrt(1 + e2 * Math.pow(Math.cos(phiC), 4) / (1 - e2));
  const g0 = Math.asin(sC / B);
  const t0 = Math.tan(Math.PI / 4 + g0 / 2) * Math.pow((1 + e * sC) / (1 - e * sC), e * B / 2) / Math.pow(Math.tan(Math.PI / 4 + phiC / 2), B);
  d._k = { e: e, A: A, B: B, t0: t0, lam0: lam0, ca: Math.cos(alphaC), sa: Math.sin(alphaC), phiP: phiP, n: Math.sin(phiP), r0: kP * A / Math.tan(phiP) };
  return d._k;
}

function krovakForward(lat, lon, d) {
  const k = krovakConstants(d), phi = lat * Math.PI / 180, s = Math.sin(phi);
  const U = 2 * (Math.atan(k.t0 * Math.pow(Math.tan(phi / 2 + Math.PI / 4), k.B) / Math.pow((1 + k.e * s) / (1 - k.e * s), k.e * k.B / 2)) - Math.PI / 4);
  const V = k.B * (k.lam0 - lon * Math.PI / 180);
  const S = Math.asin(k.ca * Math.sin(U) + k.sa * Math.cos(U) * Math.cos(V));
  const D = Math.asin(Math.cos(U) * Math.sin(V) / Math.cos(S));
  const th = k.n * D, r = k.r0 * Math.pow(Math.tan(Math.PI / 4 + k.phiP / 2), k.n) / Math.pow(Math.tan(S / 2 + Math.PI / 4), k.n);
  return { e: -(r * Math.sin(th)), n: -(r * Math.cos(th)) };
}

function krovakInverse(e, n, d) {
  const k = krovakConstants(d), XP = -n, YP = -e;
  const r = Math.sqrt(XP * XP + YP * YP), th = Math.atan2(YP, XP), D = th / k.n;
  const S = 2 * (Math.atan(Math.pow(k.r0 / r, 1 / k.n) * Math.tan(Math.PI / 4 + k.phiP / 2)) - Math.PI / 4);
  const U = Math.asin(k.ca * Math.sin(S) - k.sa * Math.cos(S) * Math.cos(D));
  const V = Math.asin(Math.cos(S) * Math.sin(D) / Math.cos(U));
  let phi = U;
  for (let i = 0; i < 8; i++) {
    const s = Math.sin(phi);
    phi = 2 * (Math.atan(Math.pow(k.t0, -1 / k.B) * Math.pow(Math.tan(U / 2 + Math.PI / 4), 1 / k.B) * Math.pow((1 + k.e * s) / (1 - k.e * s), k.e / 2)) - Math.PI / 4);
  }
  return { lat: phi * 180 / Math.PI, lon: (k.lam0 - V / k.B) * 180 / Math.PI };
}

/* Abbildung einer Definition aus crsGeoDefinition: Rechts-/Hochwert <-> Breite/Länge */
function projInverse(d, e, n) {
  if (d.laea) return laeaInverse(e, n, d);
  if (d.lcc) return lccInverse(e, n, d);
  if (d.sterea) return stereaInverse(e, n, d);
  if (d.krovak) return krovakInverse(e, n, d);
  return transverseMercatorInverse(e, n, d);
}
function projForward(d, lat, lon) {
  if (d.laea) return laeaForward(lat, lon, d);
  if (d.lcc) return lccForward(lat, lon, d);
  if (d.sterea) return stereaForward(lat, lon, d);
  if (d.krovak) return krovakForward(lat, lon, d);
  return transverseMercatorForward(lat, lon, d);
}

/* Zielsysteme für die Umrechnung der Koordinaten im IFC-Export (Reihenfolge wie in der Auswahl) */
const IFC_TARGET_CRS = [25832, 25833, 25831, 4647, 5650, 31466, 31467, 31468, 31469, 31254, 31255, 31256,
  // nationale Systeme der EU (Reihenfolge nach der Ländertabelle in der README)
  28992, 3812, 31370, 3301, 3067, 2154, 2100, 3765, 2157, 3059, 3346, 2169, 2180, 3763, 3006, 3794, 5514];

/* Rechnet Rechts-/Hochwerte von einem Bezugssystem in ein anderes um: Funktion (e, n) -> {e, n},
   oder null, wenn eines der beiden Systeme nicht bekannt ist. Der Weg führt über Breite/Länge
   (WGS 84 gleich ETRS89 auf Dezimeter genau); bei Bessel-Systemen (DHDN, MGI) kommt die
   Helmert-Transformation dazu, die Lage stimmt dann auf etwa 1 bis 3 m. Höhen bleiben unverändert. */
function crsTransformer(fromEpsg, toEpsg) {
  const from = crsGeoDefinition(fromEpsg), to = crsGeoDefinition(toEpsg);
  if (!from || !to || from.merc || to.merc) return null;
  if (fromEpsg === toEpsg) return function (e, n) { return { e: e, n: n }; };
  const same = from.helmert && from.helmert === to.helmert;          // gleiches Datum: nur die Abbildung wechselt
  return function (e, n) {
    let g = projInverse(from, e, n);
    if (same) return projForward(to, g.lat, g.lon);
    if (from.helmert) g = datumToWgs84(from, g.lat, g.lon);
    if (to.helmert) g = datumFromWgs84(to, g.lat, g.lon);
    return projForward(to, g.lat, g.lon);
  };
}

/* Lagegenauigkeit einer Umrechnung: null ohne Datumswechsel (praktisch genau), sonst { m: etwa so viele Meter, grid: mit BeTA2007 } */
function crsAccuracy(fromEpsg, toEpsg) {
  const a = crsGeoDefinition(fromEpsg), b = crsGeoDefinition(toEpsg);
  if (!a || !b || fromEpsg === toEpsg || a.helmert === b.helmert) return null;
  const list = [a.helmert, b.helmert].filter(Boolean);
  const dhdn = list.indexOf(HELMERT_DHDN) >= 0, grid = dhdn && hasBeta2007();
  if (list.length === 1 && dhdn) return { m: grid ? 1 : 3, grid: grid };
  return { m: dhdn && !grid ? 3 : 2, grid: grid };
}

/* Gibt es bei dieser Umrechnung einen Datumswechsel (Lage nur auf etwa 1 bis 3 m genau)? */
function crsTransformIsApprox(fromEpsg, toEpsg) {
  const a = crsGeoDefinition(fromEpsg), b = crsGeoDefinition(toEpsg);
  return !!((a && a.helmert) || (b && b.helmert)) && fromEpsg !== toEpsg;
}

/* Koordinaten im Bezugssystem des Geländes (Rechts-/Hochwert) -> {lat, lon} in Grad, oder null */
function crsToLonLat(epsg, e, n) {
  const d = crsGeoDefinition(epsg);
  if (!d) return null;
  if (d.merc) {
    const R = 6378137;
    return { lon: e / R * 180 / Math.PI, lat: (2 * Math.atan(Math.exp(n / R)) - Math.PI / 2) * 180 / Math.PI };
  }
  const g = projInverse(d, e, n);
  return d.helmert ? datumToWgs84(d, g.lat, g.lon) : g;
}

/* ---------- Startkarte (Web-Mercator, Kacheln 256 px) ----------
   Reine Rechnung für die Karte vor dem Laden des Geländes: Breite/Länge <-> Weltpixel einer Zoomstufe,
   die sichtbaren Kacheln und die Maße eines aufgezogenen Rechtecks. Die Darstellung steht in ui.js. */
const SM_TILE = 256;
const SM_MIN_ZOOM = 3, SM_MAX_ZOOM = 19;
const SM_MAX_LAT = 85.0511287798;

function smWorldPx(lon, lat, z) {
  const n = SM_TILE * Math.pow(2, z);
  const la = Math.max(-SM_MAX_LAT, Math.min(SM_MAX_LAT, lat)) * Math.PI / 180;
  return { x: (lon + 180) / 360 * n, y: (1 - Math.log(Math.tan(la) + 1 / Math.cos(la)) / Math.PI) / 2 * n };
}

function smLonLat(x, y, z) {
  const n = SM_TILE * Math.pow(2, z);
  const t = Math.PI * (1 - 2 * y / n);
  return { lon: x / n * 360 - 180, lat: Math.atan(Math.sinh(t)) * 180 / Math.PI };
}

/* Meter je Pixel bei Breite lat und Zoomstufe z */
function smMetersPerPx(lat, z) {
  return 2 * Math.PI * 6378137 * Math.cos(lat * Math.PI / 180) / (SM_TILE * Math.pow(2, z));
}

/* Sichtbare Kacheln für eine Ansicht {lon, lat, z} (z darf gebrochen sein) in einem Fenster w x h: Liste
   {z, x, y, tx, left, top, scale}. Die Kacheln stammen von der nächsten ganzen Stufe z und erscheinen mit
   scale = 2^(Ansicht - z) verkleinert oder vergrößert; tx läuft ohne Umbruch, x um die Erde herum (Rest);
   y außerhalb 0..n-1 entfällt. Höchstens `cap` Kacheln. Mit `level` kommt die Liste für diese Stufe. */
function smTileList(view, w, h, cap, level) {
  const zt = level !== undefined ? Math.max(SM_MIN_ZOOM, Math.min(SM_MAX_ZOOM, level))
                                 : Math.max(SM_MIN_ZOOM, Math.min(SM_MAX_ZOOM, Math.round(view.z)));
  const sc = Math.pow(2, view.z - zt);
  const c = smWorldPx(view.lon, view.lat, zt);
  const n = Math.pow(2, zt);
  const hw = w / (2 * sc), hh = h / (2 * sc);
  const out = [];
  const tx0 = Math.floor((c.x - hw) / SM_TILE), tx1 = Math.floor((c.x + hw) / SM_TILE);
  const ty0 = Math.floor((c.y - hh) / SM_TILE), ty1 = Math.floor((c.y + hh) / SM_TILE);
  for (let ty = ty0; ty <= ty1; ty++) {
    if (ty < 0 || ty >= n) continue;
    for (let tx = tx0; tx <= tx1; tx++) {
      out.push({ z: zt, x: ((tx % n) + n) % n, y: ty, tx: tx, scale: sc,
                 left: (tx * SM_TILE - c.x) * sc + w / 2, top: (ty * SM_TILE - c.y) * sc + h / 2 });
      if (out.length >= (cap || 120)) return out;
    }
  }
  return out;
}

/* Ausschnitt einer großen Rasterdatei: Fenster um einen Punkt (Seitenlänge `size` m), in
   Länge/Breite. Daraus der gdal_translate-Befehl; -projwin_srs EPSG:4326 macht ihn unabhängig vom Bezugssystem der Datei
   (BEV-Raster liegen in EPSG:3035). */
const SM_CUT_SIZE = 1000;

function smCutWindow(anchor, size) {
  const half = (size || SM_CUT_SIZE) / 2;
  const dLat = half / 111132, dLon = half / (111320 * Math.cos(anchor.lat * Math.PI / 180));
  return { w: anchor.lon - dLon, e: anchor.lon + dLon, s: anchor.lat - dLat, n: anchor.lat + dLat };
}

function gdalCutCommand(win) {
  const f = function (v) { return v.toFixed(6); };
  return 'gdal_translate -projwin_srs EPSG:4326 -projwin ' + f(win.w) + ' ' + f(win.n) + ' ' + f(win.e) + ' ' + f(win.s) +
         ' -co COMPRESS=DEFLATE eingabe.tif ausschnitt.tif';
}

const OSM_TILE = 256;
// höchstens 12 x 12 Kacheln, das Bild bleibt unter 3100 px. Je feiner die Stufe, desto kleiner erscheint die
// Beschriftung der Karte auf dem Gelände (die Schrift ist in jeder Kachel gleich groß in Pixeln).
const OSM_MAX_TILES = 144;
const OSM_MAX_ZOOM = 19;
const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/* Welche Kacheln das Gelände abdecken und wie Weltkoordinaten ins Kartenbild fallen.
   Liefert null, wenn das Bezugssystem unbekannt ist. Die Zoomstufe ist die höchste
   mit höchstens OSM_MAX_TILES Kacheln. u,v sind affine Koeffizienten (a*x + b*z + c)
   auf 0..1 im Bild (v von unten, wie in WebGL-Texturen). */
function osmMapPlan(t) {
  if (!t || !crsGeoDefinition(t.epsg)) return null;
  const hw = t.w / 2, hd = t.d / 2;
  const pts = [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd], [0, 0]].map(function (c) {
    const g = crsToLonLat(t.epsg, t.originE + c[0], t.originN - c[1]);
    const lat = Math.max(-85.05, Math.min(85.05, g.lat)) * Math.PI / 180;
    return { mx: (g.lon + 180) / 360, my: (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2, lat: g.lat, lon: g.lon };
  });
  let plan = null;
  for (let z = OSM_MAX_ZOOM; z >= 3 && !plan; z--) {
    const n2 = Math.pow(2, z);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    pts.slice(0, 4).forEach(function (p) {
      x0 = Math.min(x0, p.mx * n2); x1 = Math.max(x1, p.mx * n2);
      y0 = Math.min(y0, p.my * n2); y1 = Math.max(y1, p.my * n2);
    });
    const tx0 = Math.floor(x0), tx1 = Math.floor(x1), ty0 = Math.floor(y0), ty1 = Math.floor(y1);
    const nx = tx1 - tx0 + 1, ny = ty1 - ty0 + 1;
    if (nx * ny <= OSM_MAX_TILES || z === 3) plan = { z: z, tx0: tx0, ty0: ty0, nx: nx, ny: ny };
  }
  const n2 = Math.pow(2, plan.z), W = plan.nx * OSM_TILE, H = plan.ny * OSM_TILE;
  // Bildpunkt (px, py) jeder Ecke; Ecken: 0 = NW (-w/2,-d/2), 1 = NO, 2 = SW
  const px = pts.map(function (p) { return (p.mx * n2 - plan.tx0) * OSM_TILE; });
  const py = pts.map(function (p) { return (p.my * n2 - plan.ty0) * OSM_TILE; });
  const ax = (px[1] - px[0]) / t.w, bx = (px[2] - px[0]) / t.d, cx = px[0] + ax * hw + bx * hd;
  const ay = (py[1] - py[0]) / t.w, by = (py[2] - py[0]) / t.d, cy = py[0] + ay * hw + by * hd;
  plan.W = W; plan.H = H;
  plan.u = [ax / W, bx / W, cx / W];
  plan.v = [-ay / H, -by / H, 1 - cy / H];
  plan.center = { lat: pts[4].lat, lon: pts[4].lon };
  // Prüfung der vierten Ecke: Abweichung der affinen Abbildung von der strengen Rechnung in m
  const e4 = [px[3], py[3]], a4 = [ax * hw + bx * hd + cx, ay * hw + by * hd + cy];
  const mPerPx = t.w / Math.hypot(px[1] - px[0], py[1] - py[0]);
  plan.affineError = Math.hypot(e4[0] - a4[0], e4[1] - a4[1]) * mPerPx;
  plan.tiles = [];
  for (let j = 0; j < plan.ny; j++) for (let i = 0; i < plan.nx; i++) {
    plan.tiles.push({ x: plan.tx0 + i, y: plan.ty0 + j, col: i, row: j,
                      url: OSM_TILE_URL.replace('{z}', plan.z).replace('{x}', plan.tx0 + i).replace('{y}', plan.ty0 + j) });
  }
  return plan;
}

/* Zustand der Karte (nur Sitzung) und Shader-Werte. Die Werte liegen als einfache
   Objekte vor ({x,y,z}); three.js liest sie als vec3. */
const mapUniforms = {
  uMapOn: { value: 0 },
  uMapScale: { value: 0.7 },
  uMapTex: { value: null },
  uMapU: { value: { x: 0, y: 0, z: 0 } },
  uMapV: { value: { x: 0, y: 0, z: 0 } }
};
const osmMap = { on: false, plan: null, texture: null, token: 0, onChange: null };

/* Färbt das Gelände nach der Karte: nach der Vertexfarbe wird sie durch den
   Kartenpunkt ersetzt (die Beleuchtung bleibt). Die Lichter der Szene summieren sich
   auf flachem Boden auf etwa das 1,35-fache; deshalb wird die Karte mit uMapScale
   (0,7) abgedunkelt, sonst brennt sie im Sonnenlicht aus. */
function mapShader(shader) {
  shader.uniforms.uMapOn = mapUniforms.uMapOn;
  shader.uniforms.uMapScale = mapUniforms.uMapScale;
  shader.uniforms.uMapTex = mapUniforms.uMapTex;
  shader.uniforms.uMapU = mapUniforms.uMapU;
  shader.uniforms.uMapV = mapUniforms.uMapV;
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nuniform float uMapOn;\nuniform float uMapScale;\nuniform sampler2D uMapTex;\nuniform vec3 uMapU;\nuniform vec3 uMapV;')
    .replace('#include <color_fragment>', '#include <color_fragment>\n' +
      'if (uMapOn > 0.5) {\n' +
      '  vec2 muv = vec2(dot(uMapU.xy, vPitXZ) + uMapU.z, dot(uMapV.xy, vPitXZ) + uMapV.z);\n' +
      '  if (muv.x >= 0.0 && muv.x <= 1.0 && muv.y >= 0.0 && muv.y <= 1.0) diffuseColor.rgb = texture2D(uMapTex, muv).rgb * uMapScale;\n' +
      '}');
}

function terrainShader(shader) {
  pitHoleShader(shader);
  mapShader(shader);
}

function loadOsmImage(url) {
  return new Promise(function (resolve, reject) {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = function () { resolve(im); };
    im.onerror = function () { reject(new Error(url)); };
    im.src = url;
  });
}

/* Lädt die Kacheln eines Plans und setzt sie zu einem Bild zusammen */
async function loadOsmCanvas(plan) {
  const canvas = document.createElement('canvas');
  canvas.width = plan.W; canvas.height = plan.H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#dfe3e0';
  ctx.fillRect(0, 0, plan.W, plan.H);
  let loaded = 0;
  await Promise.all(plan.tiles.map(function (t) {
    return loadOsmImage(t.url).then(function (im) {
      ctx.drawImage(im, t.col * OSM_TILE, t.row * OSM_TILE, OSM_TILE, OSM_TILE);
      loaded++;
    }, function () { /* einzelne fehlende Kachel: bleibt grau */ });
  }));
  return { canvas: canvas, loaded: loaded, total: plan.tiles.length };
}

function osmNotify(state) {
  if (osmMap.onChange) osmMap.onChange(state);
}

/* Schaltet die Karte ein oder aus. Liefert {tiles, failed}; wirft bei Fehlern (kein
   Gelände, Bezugssystem unbekannt, keine Kachel geladen). */
async function setOsmMap(on) {
  const token = ++osmMap.token;
  if (!on) {
    osmMap.on = false;
    mapUniforms.uMapOn.value = 0;
    mapUniforms.uMapTex.value = null;
    if (osmMap.texture) { osmMap.texture.dispose(); osmMap.texture = null; }
    osmMap.plan = null;
    osmNotify({ on: false });
    return { tiles: 0, failed: 0 };
  }
  if (!TERRAIN) { const e = new Error('noTerrain'); e.code = 'noTerrain'; throw e; }
  const plan = osmMapPlan(TERRAIN);
  if (!plan) { const e = new Error('noCrs'); e.code = 'noCrs'; throw e; }
  const res = await loadOsmCanvas(plan);
  if (token !== osmMap.token) return { tiles: res.loaded, failed: res.total - res.loaded, stale: true };
  if (!res.loaded) { const e = new Error('noTiles'); e.code = 'noTiles'; throw e; }
  const tex = new THREE.CanvasTexture(res.canvas);
  tex.anisotropy = 4;
  if (osmMap.texture) osmMap.texture.dispose();
  osmMap.texture = tex;
  osmMap.plan = plan;
  osmMap.on = true;
  mapUniforms.uMapTex.value = tex;
  mapUniforms.uMapU.value = { x: plan.u[0], y: plan.u[1], z: plan.u[2] };
  mapUniforms.uMapV.value = { x: plan.v[0], y: plan.v[1], z: plan.v[2] };
  mapUniforms.uMapOn.value = 1;
  osmNotify({ on: true, tiles: res.loaded, failed: res.total - res.loaded });
  return { tiles: res.loaded, failed: res.total - res.loaded };
}

/* Nach einem neuen Gelände: ist die Karte an, wird sie neu geladen; schlägt das
   fehl, geht sie aus */
function refreshOsmMap() {
  if (!osmMap.on) return;
  setOsmMap(true).catch(function (e) {
    osmMap.on = false;
    mapUniforms.uMapOn.value = 0;
    osmNotify({ on: false, error: e.code || 'noTiles' });
  });
}

/* Grenzen für das Einlesen. Das Tool liest jede Datei vollständig in den Speicher
   und entpackt das ganze Raster (4 Byte je Pixel), alle gewählten Kacheln bleiben
   dabei zugleich im Speicher. Die Werte sind Schätzungen für einen Rechner mit
   etwa 8 GB RAM; was darüber liegt, wird vor dem Einlesen mit klarer Meldung
   abgelehnt, statt den Browser hängen zu lassen. */
const TIFF_MAX_FILE_BYTES = 1e9;           // je Datei
const TIFF_MAX_TOTAL_BYTES = 2e9;          // alle Dateien zusammen
const TIFF_MAX_PIXELS = 100e6;             // je Kachel
const TIFF_MAX_TOTAL_PIXELS = 150e6;       // alle Kacheln zusammen
const TIFF_CUT_HINT = ' Bitte vorher einen Ausschnitt schneiden, z. B. mit gdal_translate -projwin.';

/* Prüft Dateigrößen, bevor etwas gelesen wird; files = [{name, size}] */
function checkTiffFiles(files) {
  let total = 0;
  (files || []).forEach(function (f) {
    const size = f && f.size;
    if (!(size > 0)) return;
    total += size;
    if (size > TIFF_MAX_FILE_BYTES) {
      throw new Error(f.name + ': ' + (size / 1e9).toFixed(1) + ' GB sind zu groß für den Browser (Grenze ' +
        (TIFF_MAX_FILE_BYTES / 1e9) + ' GB je Datei).' + TIFF_CUT_HINT);
    }
  });
  if (total > TIFF_MAX_TOTAL_BYTES) {
    throw new Error('Die Dateien sind zusammen ' + (total / 1e9).toFixed(1) + ' GB groß, mehr als ' +
      (TIFF_MAX_TOTAL_BYTES / 1e9) + ' GB gehen nicht. Bitte weniger Kacheln auf einmal wählen.');
  }
}

/* Prüft die Pixelzahl einer Kachel anhand der Kopfdaten, vor dem Entpacken */
function checkTiffPixels(fileName, W, H, soFar) {
  const px = W * H;
  if (px > TIFF_MAX_PIXELS) {
    throw new Error(fileName + ': ' + W + ' × ' + H + ' Pixel (' + Math.round(px / 1e6) + ' Mio.) sind zu viel für den ' +
      'Browser (Grenze ' + Math.round(TIFF_MAX_PIXELS / 1e6) + ' Mio. je Kachel).' + TIFF_CUT_HINT);
  }
  if ((soFar || 0) + px > TIFF_MAX_TOTAL_PIXELS) {
    throw new Error(fileName + ': mit dieser Kachel kämen ' + Math.round(((soFar || 0) + px) / 1e6) +
      ' Mio. Pixel zusammen, mehr als ' + Math.round(TIFF_MAX_TOTAL_PIXELS / 1e6) + ' Mio. gehen nicht.' +
      ' Bitte weniger oder kleinere Kacheln wählen.' );
  }
}

/* Liest eine einzelne Kachel ein und liefert Raster samt Georeferenz.
   soFarPixels: bereits eingelesene Pixel der anderen Kacheln (für die Gesamtgrenze) */
async function readTiffTile(arrayBuffer, fileName, soFarPixels) {
  const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();

  const W = image.getWidth();
  const H = image.getHeight();
  if (!W || !H) throw new Error(fileName + ': kein lesbares Raster.');
  checkTiffPixels(fileName, W, H, soFarPixels);

  const rasters = await image.readRasters();
  const band = rasters[0];
  if (!band || !band.length) throw new Error(fileName + ': keine Höhenwerte.');

  const g = tiffGeoInfo(image);
  return {
    name: fileName, W: W, H: H, band: band,
    originX: g.originX, originY: g.originY, resX: g.resX, resY: g.resY,
    nodata: g.nodata, epsg: g.epsg, srcRes: Math.min(g.resX, g.resY)
  };
}

/* Ursprung (obere linke Ecke), Zellgröße, NoData-Wert und EPSG-Code aus dem Kopf eines GeoTIFF-Bilds */
function tiffGeoInfo(image) {
  let originX = 0, originY = 0, resX = 1, resY = 1;
  try {
    const o = image.getOrigin();
    const r = image.getResolution();
    originX = o[0]; originY = o[1];
    resX = Math.abs(r[0]); resY = Math.abs(r[1]);
  } catch (e) { /* ohne Georeferenz weiterarbeiten */ }
  if (!isFinite(resX) || resX <= 0) resX = 1;
  if (!isFinite(resY) || resY <= 0) resY = 1;
  if (!isFinite(originX)) originX = 0;
  if (!isFinite(originY)) originY = 0;

  let nodata = null;
  try {
    const fd = image.getFileDirectory();
    if (fd && fd.GDAL_NODATA !== undefined) {
      const v = parseFloat(fd.GDAL_NODATA);
      if (isFinite(v)) nodata = v;
    }
  } catch (e) { /* ohne NoData weiterarbeiten */ }

  let epsg = null;
  try {
    const gk = image.getGeoKeys ? image.getGeoKeys() : null;
    if (gk) epsg = canonicalEpsg(gk.ProjectedCSTypeGeoKey || gk.GeographicTypeGeoKey || null);
  } catch (e) { /* ohne GeoKeys weiterarbeiten */ }

  return { originX: originX, originY: originY, resX: resX, resY: resY, nodata: nodata, epsg: epsg };
}

function tileIsNoData(tile, v) {
  if (!isFinite(v)) return true;
  if (tile.nodata !== null && Math.abs(v - tile.nodata) < 1e-6) return true;
  return v < -1000 || v > 9000;
}

/* ---------- Ausschnitt aus einer sehr großen GeoTIFF-Datei ----------
   Dateien über TIFF_BLOB_BYTES werden nicht ganz in den Speicher gelesen: GeoTIFF.fromBlob liest nur den Kopf und die Blöcke, die das
   Fenster berühren (bei einem COG wie dem BEV-Höhenraster: wenige MB aus mehreren GB). Das Fenster kommt vom gewählten Ort:
   {lon, lat, size} = Quadrat von size Metern im Bezugssystem der Datei um den Punkt, oder {w, e, s, n} = Rechteck in Länge/Breite
   (die Ecken werden ins Bezugssystem der Datei umgerechnet, es zählt der umschließende Kasten). Ohne Fenster wird nur gelesen, was
   ohnehin unter die Pixelgrenze passt. */
const TIFF_BLOB_BYTES = 300e6;

/* Breite/Länge (WGS 84 / ETRS89) -> Rechts-/Hochwert im System einer Definition aus crsGeoDefinition */
function lonLatToCrs(def, lat, lon) {
  let g = { lat: lat, lon: lon };
  if (def.helmert) g = datumFromWgs84(def, lat, lon);
  return projForward(def, g.lat, g.lon);
}

async function readTiffTileWindow(blob, fileName, win, soFarPixels) {
  if (typeof GeoTIFF === 'undefined' || !GeoTIFF.fromBlob) throw new Error('Die Datei lib/geotiff.js fehlt oder ist zu alt. Siehe lib/LIESMICH.txt.');
  const tiff = await GeoTIFF.fromBlob(blob);
  const image = await tiff.getImage();
  const W = image.getWidth(), H = image.getHeight();
  if (!W || !H) throw new Error(fileName + ': kein lesbares Raster.');
  const g = tiffGeoInfo(image);

  let x0 = 0, y0 = 0, x1 = W, y1 = H;
  if (win) {
    const def = crsGeoDefinition(g.epsg);
    if (!def || def.merc) {
      throw new Error(fileName + ': Das Bezugssystem ' + (g.epsg ? 'EPSG:' + g.epsg : '(unbekannt)') +
        ' kennt die Anwendung nicht, der Ausschnitt lässt sich daraus nicht bestimmen.' + TIFF_CUT_HINT);
    }
    let minE, maxE, minN, maxN;
    if (win.size) {
      const c = lonLatToCrs(def, win.lat, win.lon), h = win.size / 2;
      minE = c.e - h; maxE = c.e + h; minN = c.n - h; maxN = c.n + h;
    } else {
      const pts = [[win.s, win.w], [win.s, win.e], [win.n, win.w], [win.n, win.e]].map(function (p) { return lonLatToCrs(def, p[0], p[1]); });
      minE = Math.min.apply(null, pts.map(function (p) { return p.e; })); maxE = Math.max.apply(null, pts.map(function (p) { return p.e; }));
      minN = Math.min.apply(null, pts.map(function (p) { return p.n; })); maxN = Math.max.apply(null, pts.map(function (p) { return p.n; }));
    }
    // Pixelgrenzen (die Datei ist nicht gedreht: Ursprung oben links, y nach unten); ein Pixel Rand
    x0 = Math.max(0, Math.floor((minE - g.originX) / g.resX) - 1);
    x1 = Math.min(W, Math.ceil((maxE - g.originX) / g.resX) + 1);
    y0 = Math.max(0, Math.floor((g.originY - maxN) / g.resY) - 1);
    y1 = Math.min(H, Math.ceil((g.originY - minN) / g.resY) + 1);
    if (x1 <= x0 || y1 <= y0) return null;                   // der Ausschnitt liegt nicht in dieser Datei
  } else if (W * H > TIFF_MAX_PIXELS) {
    throw new Error(fileName + ': ' + W + ' × ' + H + ' Pixel (' + Math.round(W * H / 1e6) + ' Mio.) sind zu viel für den Browser. ' +
      'Wähle zuerst auf der Karte einen Ort (Pin) oder ein Rechteck, oder gib eine Adresse ein: Dann liest die Anwendung nur diesen ' +
      'Ausschnitt aus der Datei.');
  }

  checkTiffPixels(fileName + ' (Ausschnitt)', x1 - x0, y1 - y0, soFarPixels);
  const rasters = await image.readRasters(win ? { window: [x0, y0, x1, y1], samples: [0] } : { samples: [0] });
  const band = rasters[0];
  if (!band || !band.length) throw new Error(fileName + ': keine Höhenwerte.');
  return {
    name: fileName, W: x1 - x0, H: y1 - y0, band: band,
    originX: g.originX + x0 * g.resX, originY: g.originY - y0 * g.resY, resX: g.resX, resY: g.resY,
    nodata: g.nodata, epsg: g.epsg, srcRes: Math.min(g.resX, g.resY), windowed: !!win, fileW: W, fileH: H
  };
}

/* Mehrere GeoTIFF-Kacheln zu einem Gelände verschmelzen.
   Die Pixel aller Kacheln werden in ein gemeinsames Zielraster gemittelt;
   dadurch spielen unterschiedliche Auflösungen und Überlappungen keine Rolle. */
async function readTiffTiles(items, xyzEpsg) {
  if (!items || !items.length) throw new Error('Keine Datei ausgewählt.');
  const hasTiff = items.some(function (it) { return !isXyzName(it.name) && !isLasName(it.name); });
  if (hasTiff && typeof GeoTIFF === 'undefined') {
    throw new Error('Die Datei lib/geotiff.js fehlt. Siehe lib/LIESMICH.txt.');
  }
  const tiles = [];
  let pixels = 0, outside = 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const t = isXyzName(it.name)
      ? readXyzTile(it.buffer, it.name, xyzEpsg, pixels)
      : isLasName(it.name)
      ? await readLasTile(it.buffer, it.name, xyzEpsg, pixels, it.window)
      : (it.blob ? await readTiffTileWindow(it.blob, it.name, it.window, pixels) : await readTiffTile(it.buffer, it.name, pixels));
    if (!t) { outside++; continue; }                           // der gewählte Ausschnitt liegt nicht in dieser Datei
    pixels += t.W * t.H;
    tiles.push(t);
  }
  if (!tiles.length && outside) {
    throw new Error('Der gewählte Ausschnitt liegt in keiner der ' + (outside === 1 ? 'Datei' : outside + ' Dateien') +
      '. Prüfe, ob Ort (Pin oder Rechteck) und Datei zusammenpassen.');
  }
  return tiles;
}

/* ---------- XYZ-Textdateien ----------
   Zeilen aus Rechtswert, Hochwert und Höhe auf einem regelmäßigen Raster (Punkte
   = Zellmitten), getrennt durch Leerzeichen, Tabulator, Komma oder Semikolon;
   Dezimalzeichen ist der Punkt. Das Raster wird aus den Koordinatenabständen
   bestimmt und wie eine GeoTIFF-Kachel behandelt. Eine XYZ-Datei enthält kein
   Bezugssystem - der EPSG-Code kommt vom Nutzer. */
const XYZ_MAX_POINTS = 30e6;          // 20 Byte je Punkt im Speicher, die Datei selbst kommt dazu
const XYZ_NODATA = -9999;

function isXyzName(name) {
  return /\.(xyz|txt|csv)$/i.test(name || '');
}

/* Liest alle Zeilen mit mindestens drei Zahlen; Kopfzeilen und Leerzeilen werden übersprungen */
function parseXyz(bytes, fileName) {
  const len = bytes.length;
  let lines = 1;
  for (let i = 0; i < len; i++) if (bytes[i] === 10) lines++;
  if (lines > XYZ_MAX_POINTS + 1000) {
    throw new Error(fileName + ': ' + Math.round(lines / 1e6) + ' Mio. Zeilen sind zu viel für den Browser (Grenze ' +
      Math.round(XYZ_MAX_POINTS / 1e6) + ' Mio. Punkte).' + TIFF_CUT_HINT);
  }
  const xs = new Float64Array(lines), ys = new Float64Array(lines), zs = new Float32Array(lines);
  let n = 0, p = 0;
  const val = [0, 0, 0];
  while (p < len) {
    // eine Zeile: bis zu drei Zahlen lesen
    let got = 0, bad = false;
    while (p < len && bytes[p] !== 10) {
      let c = bytes[p];
      if (c === 32 || c === 9 || c === 44 || c === 59 || c === 13) { p++; continue; }
      // Zahl: [+-]ziffern[.ziffern][e[+-]ziffern]
      let sign = 1, num = 0, digits = 0, frac = 0, fracDigits = 0;
      if (c === 45 || c === 43) { if (c === 45) sign = -1; p++; c = bytes[p]; }
      while (p < len && bytes[p] >= 48 && bytes[p] <= 57) { num = num * 10 + (bytes[p] - 48); digits++; p++; }
      if (p < len && bytes[p] === 46) {
        p++;
        while (p < len && bytes[p] >= 48 && bytes[p] <= 57) { frac = frac * 10 + (bytes[p] - 48); fracDigits++; digits++; p++; }
      }
      let v = digits ? num + (fracDigits ? frac / Math.pow(10, fracDigits) : 0) : NaN;
      if (digits && p < len && (bytes[p] === 101 || bytes[p] === 69)) {
        let q = p + 1, es = 1, ev = 0, ed = 0;
        if (bytes[q] === 45 || bytes[q] === 43) { if (bytes[q] === 45) es = -1; q++; }
        while (q < len && bytes[q] >= 48 && bytes[q] <= 57) { ev = ev * 10 + (bytes[q] - 48); ed++; q++; }
        if (ed) { v *= Math.pow(10, es * ev); p = q; }
      }
      // das Zahlende muss ein Trenner sein, sonst ist die Zeile keine Zahlenzeile (z. B. Kopfzeile)
      if (!digits || (p < len && bytes[p] !== 10 && bytes[p] !== 32 && bytes[p] !== 9 && bytes[p] !== 44 && bytes[p] !== 59 && bytes[p] !== 13)) {
        bad = true; while (p < len && bytes[p] !== 10) p++; break;
      }
      if (got < 3) val[got] = sign * v;
      got++;
    }
    if (!bad && got >= 3) { xs[n] = val[0]; ys[n] = val[1]; zs[n] = val[2]; n++; }
    p++;
  }
  if (n < 4) throw new Error(fileName + ': keine XYZ-Zeilen gefunden (erwartet: Rechtswert Hochwert Höhe).');
  return { xs: xs, ys: ys, zs: zs, n: n };
}

/* Rasterweite einer Koordinatenfolge: häufigster Abstand benachbarter Werte (auf mm gerundet) */
function xyzStep(values, n) {
  const seen = new Set();
  const lim = Math.min(n, 200000);
  for (let i = 0; i < lim; i++) seen.add(Math.round(values[i] * 1000));
  const u = Array.from(seen).sort(function (a, b) { return a - b; });
  const counts = new Map();
  for (let i = 1; i < u.length; i++) {
    const d = u[i] - u[i - 1];
    if (d > 0) counts.set(d, (counts.get(d) || 0) + 1);
  }
  let best = 0, bestN = 0;
  counts.forEach(function (c, d) { if (c > bestN || (c === bestN && d < best)) { best = d; bestN = c; } });
  return best / 1000;
}

/* Wandelt eine XYZ-Datei in eine Kachel wie bei GeoTIFF; epsg: Code des Nutzers */
function readXyzTile(arrayBuffer, fileName, epsg, soFarPixels) {
  const bytes = new Uint8Array(arrayBuffer);
  // ESRI-ASCII-Raster erkennen und verständlich ablehnen
  let head = '';
  for (let i = 0; i < Math.min(bytes.length, 200); i++) head += String.fromCharCode(bytes[i]);
  if (/^\s*ncols\b/i.test(head)) {
    throw new Error(fileName + ': ESRI-ASCII-Raster (ncols, nrows ...) wird nicht gelesen. Bitte als GeoTIFF umwandeln, etwa mit gdal_translate.');
  }
  if (!(epsg > 0)) throw new Error(fileName + ': für XYZ-Dateien fehlt das Bezugssystem (EPSG-Code).');
  const pts = parseXyz(bytes, fileName);
  const stepX = xyzStep(pts.xs, pts.n), stepY = xyzStep(pts.ys, pts.n);
  if (!(stepX > 0) || !(stepY > 0)) {
    throw new Error(fileName + ': kein regelmäßiges Raster erkennbar (Punkte liegen nicht in Zeilen und Spalten).');
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < pts.n; i++) {
    const x = pts.xs[i], y = pts.ys[i];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const W = Math.round((maxX - minX) / stepX) + 1, H = Math.round((maxY - minY) / stepY) + 1;
  if (W * H > 4 * pts.n + 1000) {
    throw new Error(fileName + ': kein regelmäßiges Raster erkennbar (' + pts.n + ' Punkte füllen ' + W + ' × ' + H + ' Zellen nur zu einem kleinen Teil).');
  }
  checkTiffPixels(fileName, W, H, soFarPixels);
  const band = new Float32Array(W * H).fill(XYZ_NODATA);
  for (let i = 0; i < pts.n; i++) {
    const c = Math.round((pts.xs[i] - minX) / stepX), r = Math.round((maxY - pts.ys[i]) / stepY);
    band[r * W + c] = pts.zs[i];
  }
  return {
    name: fileName, W: W, H: H, band: band,
    originX: minX - stepX / 2, originY: maxY + stepY / 2, resX: stepX, resY: stepY,
    nodata: XYZ_NODATA, epsg: epsg, srcRes: Math.min(stepX, stepY)
  };
}

/* ---------- Punktwolken (LAS, LAZ) als Geländemodell ----------
   Aus den Geländepunkten (Klasse 2, dazu Wasser, Klasse 9) wird ein Höhenraster gemittelt, kleine Lücken werden gefüllt.
   LAS liest ein eigener Leser, LAZ (komprimiert) entpackt laz-perf (lib/laz-perf.js, Apache-2.0), das erst beim ersten LAZ nachgeladen wird.
   Das Bezugssystem steht meist in der Datei (GeoKey-Verzeichnis oder WKT); sonst gilt die Wahl des Nutzers wie bei XYZ. */
const LAS_MAX_BYTES = 300e6;          // die Datei liegt im Speicher, LAZ zusätzlich entpackt im WebAssembly-Speicher
const LAS_MAX_CELLS = 16e6;           // Zellen des Rasters (je Zelle 10 Byte Arbeitsspeicher)
const LAS_WINDOW_EXTENT = 3000;       // größere Wolken werden auf den Ausschnitt um den Pin begrenzt (m)
const LAS_LIB_SCRIPT = 'lib/laz-perf.js';
let lazPerfModule = null;             // Modul nach dem Laden
let lazPerfLoading = null;            // laufendes Laden

function isLasName(name) {
  return /\.(las|laz)$/i.test(name || '');
}

/* Lädt laz-perf aus lib/ (nur im Browser, nur einmal) */
function getLazPerf() {
  if (lazPerfModule) return Promise.resolve(lazPerfModule);
  if (lazPerfLoading) return lazPerfLoading;
  lazPerfLoading = new Promise(function (resolve, reject) {
    function init() {
      try { Promise.resolve(createLazPerf()).then(function (m) { lazPerfModule = m; resolve(m); }, reject); } catch (e) { reject(e); }
    }
    if (typeof createLazPerf !== 'undefined') { init(); return; }
    const s = document.createElement('script');
    s.src = LAS_LIB_SCRIPT;
    s.onload = init;
    s.onerror = function () { lazPerfLoading = null; reject(new Error('lasLibFail')); };
    document.head.appendChild(s);
  }).catch(function (e) { lazPerfLoading = null; throw e; });
  return lazPerfLoading;
}

/* Variable Längenangaben (VLR/EVLR) lesen: liefert das Bezugssystem (EPSG) aus GeoKeys oder WKT, sonst null */
function lasVlrEpsg(b, dv, pos, count, extended) {
  let epsg = null;
  const hdr = extended ? 60 : 54;
  for (let i = 0; i < count; i++) {
    if (pos + hdr > b.length) break;
    let uid = '';
    for (let k = 0; k < 16 && b[pos + 2 + k]; k++) uid += String.fromCharCode(b[pos + 2 + k]);
    const rid = dv.getUint16(pos + 18, true);
    const len = extended ? dv.getUint32(pos + 20, true) + dv.getUint32(pos + 24, true) * 4294967296 : dv.getUint16(pos + 20, true);
    const d = pos + hdr;
    if (d + len > b.length) break;
    if (uid === 'LASF_Projection' && rid === 34735 && len >= 8) {
      const nKeys = dv.getUint16(d + 6, true);
      for (let k = 0; k < nKeys && d + 8 + 8 * (k + 1) <= d + len; k++) {
        const o = d + 8 + 8 * k;
        if (dv.getUint16(o, true) === 3072 && dv.getUint16(o + 2, true) === 0) {
          const v = dv.getUint16(o + 6, true);
          if (v > 0 && v < 32767) epsg = epsg || v;
        }
      }
    } else if (uid === 'LASF_Projection' && (rid === 2112 || rid === 2111) && len > 0 && !epsg) {
      let wkt = '';
      for (let k = 0; k < len && b[d + k]; k++) wkt += String.fromCharCode(b[d + k]);
      epsg = fpPrjEpsg(wkt) || null;
    }
    pos = d + len;
  }
  return epsg ? canonicalEpsg(epsg) : null;
}

/* Kopf einer LAS/LAZ-Datei (b: mindestens der Kopf samt VLRs, bei LAS 1.4 gern auch die EVLRs am Dateiende ab evlrStart) */
function lasHeader(b) {
  if (!b || b.length < 227 || b[0] !== 0x4c || b[1] !== 0x41 || b[2] !== 0x53 || b[3] !== 0x46) throw new Error('lasBad');
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const major = b[24], minor = b[25], headerSize = dv.getUint16(94, true), offset = dv.getUint32(96, true), nVlr = dv.getUint32(100, true);
  const raw = b[104];
  let count = dv.getUint32(107, true), evlrStart = 0, evlrCount = 0;
  if (major === 1 && minor >= 4 && headerSize >= 375 && b.length >= 375) {
    const lo = dv.getUint32(247, true), hi = dv.getUint32(251, true);
    if (lo || hi) count = hi * 4294967296 + lo;
    evlrStart = dv.getUint32(235, true) + dv.getUint32(239, true) * 4294967296;
    evlrCount = dv.getUint32(243, true);
  }
  const h = {
    version: major + '.' + minor, headerSize: headerSize, offset: offset, format: raw & 0x3f, compressed: !!(raw & 0x80), recLen: dv.getUint16(105, true),
    count: count, scale: [dv.getFloat64(131, true), dv.getFloat64(139, true), dv.getFloat64(147, true)],
    off: [dv.getFloat64(155, true), dv.getFloat64(163, true), dv.getFloat64(171, true)],
    max: [dv.getFloat64(179, true), dv.getFloat64(195, true), dv.getFloat64(211, true)],
    min: [dv.getFloat64(187, true), dv.getFloat64(203, true), dv.getFloat64(219, true)],
    evlrStart: evlrStart, evlrCount: evlrCount, epsg: null
  };
  if (h.format > 10 || !(h.recLen >= 20) || !(h.scale[0] > 0)) throw new Error('lasBad');
  h.epsg = lasVlrEpsg(b, dv, headerSize, nVlr, false);
  return h;
}

/* Bezugssystem einer Datei lesen, ohne sie ganz zu laden: Kopf samt VLRs, bei LAS 1.4 notfalls die EVLRs am Ende.
   file: { size, slice(a, b).arrayBuffer() }. Liefert die EPSG-Zahl oder null. */
async function lasPeekEpsg(file) {
  const head = new Uint8Array(await file.slice(0, Math.min(file.size, 1 << 20)).arrayBuffer());
  const h = lasHeader(head);
  if (h.epsg || !(h.evlrCount > 0) || !(h.evlrStart > 0) || h.evlrStart >= file.size) return h.epsg;
  const tail = new Uint8Array(await file.slice(h.evlrStart, Math.min(file.size, h.evlrStart + (1 << 20))).arrayBuffer());
  return lasVlrEpsg(tail, new DataView(tail.buffer, tail.byteOffset, tail.byteLength), 0, h.evlrCount, true);
}

/* Alle Punkte der Datei nacheinander: fn(x, y, z, klasse, zurückgehalten) in Koordinaten des Bezugssystems; fn liefert false zum Abbrechen.
   Unkomprimiert direkt aus dem Puffer, LAZ über laz-perf (ein Punkt je Aufruf). */
async function lasForEachPoint(bytes, h, fn) {
  const sx = h.scale[0], sy = h.scale[1], sz = h.scale[2], ox = h.off[0], oy = h.off[1], oz = h.off[2];
  const wide = h.format >= 6;
  if (!h.compressed) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const n = Math.min(h.count, Math.floor((bytes.length - h.offset) / h.recLen));
    for (let i = 0, p = h.offset; i < n; i++, p += h.recLen) {
      const cls = wide ? bytes[p + 16] : bytes[p + 15] & 31;
      const hold = wide ? (bytes[p + 15] & 4) !== 0 : (bytes[p + 15] & 128) !== 0;
      if (fn(dv.getInt32(p, true) * sx + ox, dv.getInt32(p + 4, true) * sy + oy, dv.getInt32(p + 8, true) * sz + oz, cls, hold) === false) break;
    }
    return;
  }
  const lp = await getLazPerf();
  const size = bytes.length;
  const ptr = lp._malloc(size);
  lp.HEAPU8.set(bytes, ptr);
  const lz = new lp.LASZip();
  let dest = 0;
  try {
    lz.open(ptr, size);
    const n = lz.getCount(), len = lz.getPointLength();
    dest = lp._malloc(len);
    for (let i = 0; i < n; i++) {
      lz.getPoint(dest);
      const heap = lp.HEAPU8, dv = new DataView(heap.buffer, dest, len);
      const f = heap[dest + 15];
      if (fn(dv.getInt32(0, true) * sx + ox, dv.getInt32(4, true) * sy + oy, dv.getInt32(8, true) * sz + oz,
             wide ? heap[dest + 16] : f & 31, wide ? (f & 4) !== 0 : (f & 128) !== 0) === false) break;
    }
  } finally {
    lz.delete();
    if (dest) lp._free(dest);
    lp._free(ptr);
  }
}

/* Fehlende Zellen aus den gefüllten Nachbarn auffüllen (mehrere Durchgänge, höchstens `passes`); Rest bleibt NoData */
function lasFillGaps(band, W, H, nodata, passes) {
  let cur = band;
  for (let p = 0; p < passes; p++) {
    const next = cur.slice();
    let changed = false;
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const i = r * W + c;
        if (cur[i] !== nodata) continue;
        let s = 0, k = 0;
        for (let dr = -1; dr <= 1; dr++) {
          const rr = r + dr;
          if (rr < 0 || rr >= H) continue;
          for (let dc = -1; dc <= 1; dc++) {
            const cc = c + dc;
            if (cc < 0 || cc >= W || (!dr && !dc)) continue;
            const v = cur[rr * W + cc];
            if (v !== nodata) { s += v; k++; }
          }
        }
        if (k) { next[i] = s / k; changed = true; }
      }
    }
    cur = next;
    if (!changed) break;
  }
  return cur;
}

/* Eine LAS/LAZ-Datei zu einer Geländekachel rastern (Format wie bei GeoTIFF und XYZ).
   epsg: Wahl des Nutzers, gilt nur, wenn die Datei kein Bezugssystem nennt. window: {lon, lat, size} (Pin), nur für große Wolken. */
async function readLasTile(arrayBuffer, fileName, epsg, soFarPixels, window) {
  const bytes = new Uint8Array(arrayBuffer);
  let h;
  try { h = lasHeader(bytes); } catch (e) { throw new Error(e.message === 'lasBad' ? 'lasBad' : e.message); }
  if (h.count < 1) throw new Error('lasNoPoints');
  // LAS 1.4: Bezugssystem steht oft in den EVLRs am Dateiende
  if (!h.epsg && h.evlrCount > 0 && h.evlrStart > 0 && h.evlrStart < bytes.length) {
    const tail = bytes.subarray(h.evlrStart);
    h.epsg = lasVlrEpsg(tail, new DataView(tail.buffer, tail.byteOffset, tail.byteLength), 0, h.evlrCount, true);
  }
  const crs = h.epsg || epsg;
  if (!(crs > 0)) throw new Error(fileName + ': für LAS-Dateien ohne Bezugssystem fehlt der EPSG-Code.');
  let x0 = h.min[0], x1 = h.max[0], y0 = h.min[1], y1 = h.max[1];
  let windowed = false;
  if (x1 - x0 > LAS_WINDOW_EXTENT || y1 - y0 > LAS_WINDOW_EXTENT) {
    const def = window && crsGeoDefinition(crs);
    if (!def || def.merc || !window.size) throw new Error('lasBigNoPin');
    const c = lonLatToCrs(def, window.lat, window.lon), half = window.size / 2;
    if (c.e + half < x0 || c.e - half > x1 || c.n + half < y0 || c.n - half > y1) return null;     // der Pin liegt nicht in dieser Datei
    x0 = Math.max(x0, c.e - half); x1 = Math.min(x1, c.e + half); y0 = Math.max(y0, c.n - half); y1 = Math.min(y1, c.n + half);
    windowed = true;
  }
  // Rasterweite: im Mittel etwa zwei Geländepunkte je Zelle. Den Geländeanteil schätzt eine Stichprobe der ersten Punkte
  // (Klassen 2, 8, 9 zählen als Gelände); die Weite wird auf die nächste Stufe gerundet.
  const area = Math.max(1, (h.max[0] - h.min[0]) * (h.max[1] - h.min[1]));
  let sampled = 0, sGround = 0;
  await lasForEachPoint(bytes, h, function (x, y, z, cls, hold) {
    if (hold || cls === 7 || cls === 18) return true;
    sampled++;
    if (cls === 2 || cls === 8 || cls === 9) sGround++;
    return sampled < 100000;
  });
  const gFrac = Math.max(0.1, sampled ? sGround / sampled : 0.5);
  const want = Math.sqrt(2 / Math.max(1e-6, gFrac * h.count / area));
  let cell = [0.5, 1, 2, 3, 4, 5, 6, 8, 10].reduce(function (best, s) { return Math.abs(Math.log(s / want)) < Math.abs(Math.log(best / want)) ? s : best; }, 10);
  let W, H;
  for (;;) {
    W = Math.max(1, Math.ceil((x1 - x0) / cell)); H = Math.max(1, Math.ceil((y1 - y0) / cell));
    if (W * H <= LAS_MAX_CELLS) break;
    cell *= 2;
  }
  checkTiffPixels(fileName, W, H, soFarPixels);
  const z0 = h.min[2];
  const n = W * H;
  const sum = new Float32Array(n), cnt = new Uint16Array(n), sum8 = new Float32Array(n), cnt8 = new Uint16Array(n), low = new Float32Array(n).fill(Infinity);
  let nGround = 0, nUsed = 0;
  await lasForEachPoint(bytes, h, function (x, y, z, cls, hold) {
    if (hold || cls === 7 || cls === 18) return;                    // zurückgehaltene Punkte und Rauschen
    if (x < x0 || x > x1 || y < y0 || y > y1) return;
    const c = Math.min(W - 1, Math.floor((x - x0) / cell)), r = Math.min(H - 1, Math.floor((y1 - y) / cell)), i = r * W + c;
    const zr = z - z0;
    nUsed++;
    if (zr < low[i]) low[i] = zr;
    if (cls === 2 || cls === 9) { if (cnt[i] < 65535) { sum[i] += zr; cnt[i]++; } nGround++; }
    else if (cls === 8) { if (cnt8[i] < 65535) { sum8[i] += zr; cnt8[i]++; } }          // Klasse 8: Modell-Schlüsselpunkte (zum Beispiel NRW), nur wenn es keine Klasse 2 gibt
  });
  if (!nUsed) throw new Error('lasNoPoints');
  // Geländepunkte vorhanden und flächig genug? Sonst (nicht klassifizierte Wolke) der tiefste Punkt je Zelle
  let withGround = 0, withKey = 0, withAny = 0;
  for (let i = 0; i < n; i++) { if (cnt[i]) withGround++; if (cnt8[i]) withKey++; if (low[i] !== Infinity) withAny++; }
  const useKey = withGround < 0.1 * withAny && withKey >= 0.1 * withAny;
  const classified = withGround >= 0.1 * withAny || useKey;
  const sA = useKey ? sum8 : sum, cA = useKey ? cnt8 : cnt;
  let band = new Float32Array(n);
  for (let i = 0; i < n; i++) band[i] = classified ? (cA[i] ? sA[i] / cA[i] + z0 : XYZ_NODATA) : (low[i] !== Infinity ? low[i] + z0 : XYZ_NODATA);
  band = lasFillGaps(band, W, H, XYZ_NODATA, Math.max(2, Math.min(12, Math.ceil(10 / cell))));
  return {
    name: fileName, W: W, H: H, band: band, originX: x0, originY: y1, resX: cell, resY: cell,
    nodata: XYZ_NODATA, epsg: crs, srcRes: cell, windowed: windowed,
    pointCloud: { points: h.count, ground: nGround, used: nUsed, cell: cell, classified: classified, keyPoints: useKey, laz: h.compressed }
  };
}

async function terrainFromGeoTIFFs(items, maxGrid) {
  return gridTiles(await readTiffTiles(items), maxGrid);
}

/* Bringt die eingelesenen Kacheln auf ein gemeinsames Raster.
   Getrennt vom Einlesen, damit die Auflösung ohne erneutes
   Lesen der Dateien geändert werden kann. */
function gridTiles(tiles, maxGrid) {
  if (!tiles || !tiles.length) throw new Error('Keine Kacheln übergeben.');

  // Gemeinsame Ausdehnung bestimmen
  let minE = Infinity, maxE = -Infinity, minN = Infinity, maxN = -Infinity, finest = Infinity;
  tiles.forEach(function (t) {
    const e0 = t.originX, e1 = t.originX + t.W * t.resX;
    const n1 = t.originY, n0 = t.originY - t.H * t.resY;
    if (e0 < minE) minE = e0;
    if (e1 > maxE) maxE = e1;
    if (n0 < minN) minN = n0;
    if (n1 > maxN) maxN = n1;
    const r = Math.min(t.resX, t.resY);
    if (r < finest) finest = r;
  });

  const widthM = maxE - minE;
  const depthM = maxN - minN;
  if (!(widthM > 0) || !(depthM > 0)) throw new Error('Die Kacheln haben keine gültige Ausdehnung.');

  // Zellgröße: so fein wie die beste Kachel, aber begrenzt auf MAX_GRID
  // maxGrid === 0 bedeutet ausdrücklich: keine Vereinfachung
  let cell;
  if (maxGrid === 0) {
    cell = finest;
    const nxFull = Math.round(widthM / cell), nzFull = Math.round(depthM / cell);
    if (nxFull * nzFull > GRID_CELL_CAP) {
      throw new Error('Originalauflösung wären ' + nxFull + ' × ' + nzFull +
        ' Stützpunkte. Das ist zu viel für den Browser, bitte eine niedrigere Detailstufe wählen.');
    }
  } else {
    const want = (maxGrid && maxGrid > 0) ? maxGrid : MAX_GRID;
    const limit = Math.max(GRID_MIN, Math.min(want, GRID_MAX));
    cell = Math.max(finest, widthM / limit, depthM / limit);
  }
  const nx = Math.max(2, Math.round(widthM / cell));
  const nz = Math.max(2, Math.round(depthM / cell));

  const sum = new Float64Array(nx * nz);
  const cnt = new Uint32Array(nx * nz);

  tiles.forEach(function (t) {
    for (let row = 0; row < t.H; row++) {
      const n = t.originY - (row + 0.5) * t.resY;
      const iz = Math.floor((maxN - n) / depthM * nz);
      if (iz < 0 || iz >= nz) continue;
      const base = row * t.W;
      const rowOff = iz * nx;
      for (let col = 0; col < t.W; col++) {
        const v = t.band[base + col];
        if (tileIsNoData(t, v)) continue;
        const e = t.originX + (col + 0.5) * t.resX;
        const ix = Math.floor((e - minE) / widthM * nx);
        if (ix < 0 || ix >= nx) continue;
        sum[rowOff + ix] += v;
        cnt[rowOff + ix]++;
      }
    }
  });

  const abs = new Float32Array(nx * nz);
  let vmin = Infinity, vmax = -Infinity, valid = 0;
  for (let i = 0; i < abs.length; i++) {
    if (cnt[i]) {
      const v = sum[i] / cnt[i];
      abs[i] = v; valid++;
      if (v < vmin) vmin = v;
      if (v > vmax) vmax = v;
    } else {
      abs[i] = NaN;
    }
  }

  if (!valid) throw new Error('Die Kacheln enthalten ausschließlich NoData-Werte.');
  if (vmax - vmin < 0.001) vmax = vmin + 0.001;

  const gaps = fillGaps(abs, nx, nz, (vmin + vmax) / 2);

  const rel = new Float32Array(nx * nz);
  for (let i = 0; i < abs.length; i++) rel[i] = abs[i] - vmin;

  const label = tiles.length === 1
    ? tiles[0].name + (tiles[0].windowed ? ' · Ausschnitt ' : ' · ') + tiles[0].W + '×' + tiles[0].H + ' px · ' + tiles[0].resX.toFixed(1) + ' m'
    : tiles.length + ' Kacheln · ' + Math.round(widthM) + '×' + Math.round(depthM) + ' m · ' + cell.toFixed(1) + ' m Zelle';

  return {
    nx: nx, nz: nz,
    w: widthM, d: depthM,
    originE: (minE + maxE) / 2,
    originN: (minN + maxN) / 2,
    zmin: vmin, zmax: vmax,
    rel: rel,
    tiles: tiles.length,
    gaps: gaps,
    cell: cell,
    srcRes: finest,
    epsg: tiles[0].epsg,
    crs: crsLabel(tiles[0].epsg),
    simplified: cell > finest * 1.001,
    label: label
  };
}

/* Rechnet ein Geländeraster in ein anderes Bezugssystem um (Höhen unverändert). Das neue Raster liegt achsparallel
   im Zielsystem; weil die Systeme gegeneinander gedreht sein können, ist es das Rechteck innerhalb der alten Fläche
   (die schmalen Ränder fallen weg). Jede Zelle holt ihren Wert bilinear aus dem alten Raster. */
function reprojectTerrain(t, target) {
  const fwd = crsTransformer(t.epsg, target), back = crsTransformer(target, t.epsg);
  if (!fwd || !back) throw new Error('crsNoConvert');
  const minE = t.originE - t.w / 2, maxE = t.originE + t.w / 2, minN = t.originN - t.d / 2, maxN = t.originN + t.d / 2;
  const tl = fwd(minE, maxN), tr = fwd(maxE, maxN), bl = fwd(minE, minN), br = fwd(maxE, minN);
  const west = Math.max(tl.e, bl.e), east = Math.min(tr.e, br.e), south = Math.max(bl.n, br.n), north = Math.min(tl.n, tr.n);
  const width = east - west, depth = north - south;
  if (!(width > 0 && depth > 0)) throw new Error('crsNoConvert');
  const cell = Math.max(t.w / t.nx, t.d / t.nz);
  const nx = Math.max(2, Math.round(width / cell)), nz = Math.max(2, Math.round(depth / cell));

  // Die Abbildung ist sehr glatt: Quellkoordinaten nur auf einem 100-m-Gitter rechnen, dazwischen bilinear
  const gx = Math.max(1, Math.ceil(width / 100)), gz = Math.max(1, Math.ceil(depth / 100));
  const le = new Float64Array((gx + 1) * (gz + 1)), ln = new Float64Array((gx + 1) * (gz + 1));
  for (let j = 0; j <= gz; j++) {
    for (let i = 0; i <= gx; i++) {
      const p = back(west + width * i / gx, north - depth * j / gz);
      le[j * (gx + 1) + i] = p.e; ln[j * (gx + 1) + i] = p.n;
    }
  }
  const abs = new Float32Array(nx * nz);
  let vmin = Infinity, vmax = -Infinity;
  for (let iz = 0; iz < nz; iz++) {
    const v = (iz + 0.5) / nz * gz, j = Math.min(Math.floor(v), gz - 1), fv = v - j;
    for (let ix = 0; ix < nx; ix++) {
      const u = (ix + 0.5) / nx * gx, i = Math.min(Math.floor(u), gx - 1), fu = u - i, k = j * (gx + 1) + i;
      const lerp = function (a) {
        return (a[k] * (1 - fu) + a[k + 1] * fu) * (1 - fv) + (a[k + gx + 1] * (1 - fu) + a[k + gx + 2] * fu) * fv;
      };
      const sx = Math.max(0, Math.min(t.nx - 1, (lerp(le) - minE) / t.w * t.nx - 0.5));
      const sz = Math.max(0, Math.min(t.nz - 1, (maxN - lerp(ln)) / t.d * t.nz - 0.5));
      const x0 = Math.min(Math.floor(sx), t.nx - 2), z0 = Math.min(Math.floor(sz), t.nz - 2), fx = sx - x0, fz = sz - z0;
      const q = z0 * t.nx + x0;
      const h = t.zmin + (t.rel[q] * (1 - fx) + t.rel[q + 1] * fx) * (1 - fz) + (t.rel[q + t.nx] * (1 - fx) + t.rel[q + t.nx + 1] * fx) * fz;
      abs[iz * nx + ix] = h;
      if (h < vmin) vmin = h;
      if (h > vmax) vmax = h;
    }
  }
  if (vmax - vmin < 0.001) vmax = vmin + 0.001;
  const rel = new Float32Array(nx * nz);
  for (let i = 0; i < abs.length; i++) rel[i] = abs[i] - vmin;
  return Object.assign({}, t, {
    nx: nx, nz: nz, w: width, d: depth, originE: (west + east) / 2, originN: (south + north) / 2,
    zmin: vmin, zmax: vmax, rel: rel, cell: width / nx, epsg: target, srcEpsg: t.epsg, crs: crsLabel(target),
    label: t.label + ' · EPSG:' + t.epsg + ' → ' + target
  });
}

/* Einzeldatei als Sonderfall des Merges */
async function terrainFromGeoTIFF(arrayBuffer, fileName) {
  return terrainFromGeoTIFFs([{ buffer: arrayBuffer, name: fileName || 'GeoTIFF' }]);
}

/* Ersetzt NaN-Zellen iterativ durch den Mittelwert gültiger Nachbarn */
function fillGaps(arr, nx, nz, fallback) {
  let remaining = 0;
  for (let i = 0; i < arr.length; i++) if (!isFinite(arr[i])) remaining++;
  if (!remaining) return 0;
  const filled = remaining;

  for (let pass = 0; pass < 8 && remaining > 0; pass++) {
    for (let iz = 0; iz < nz; iz++) {
      for (let ix = 0; ix < nx; ix++) {
        const i = iz * nx + ix;
        if (isFinite(arr[i])) continue;
        let sum = 0, cnt = 0;
        for (let dz = -1; dz <= 1; dz++) {
          for (let dx = -1; dx <= 1; dx++) {
            const jx = ix + dx, jz = iz + dz;
            if (jx < 0 || jz < 0 || jx >= nx || jz >= nz) continue;
            const v = arr[jz * nx + jx];
            if (isFinite(v)) { sum += v; cnt++; }
          }
        }
        if (cnt) { arr[i] = sum / cnt; remaining--; }
      }
    }
  }
  for (let i = 0; i < arr.length; i++) if (!isFinite(arr[i])) arr[i] = fallback;
  return filled;
}

/* =========================================================
   CityGML LOD2 einlesen
   ========================================================= */
function parseCityGML(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');

  const err = doc.getElementsByTagName('parsererror');
  if (err && err.length) throw new Error('Die Datei ist kein gültiges XML.');

  const rings = [];
  const polygons = doc.getElementsByTagNameNS('*', 'Polygon');

  if (polygons.length) {
    for (let i = 0; i < polygons.length; i++) {
      const ext = polygons[i].getElementsByTagNameNS('*', 'exterior')[0];
      const ring = readRing(ext || polygons[i]);
      if (ring && ring.length >= 9) rings.push(ring);
    }
  } else {
    // Fallback für TriangulatedSurface o. Ä. ohne gml:Polygon
    const lrs = doc.getElementsByTagNameNS('*', 'LinearRing');
    for (let i = 0; i < lrs.length; i++) {
      const ring = readRing(lrs[i]);
      if (ring && ring.length >= 9) rings.push(ring);
    }
  }

  if (!rings.length) {
    throw new Error('Keine Gebäudeflächen gefunden. Enthält die Datei LOD1/LOD2-Geometrie?');
  }
  return rings;
}

/* =========================================================
   CityJSON einlesen (CityJSON 1.x/2.0, CityJSONSeq, Merkmalslisten wie die der 3DBAG-Schnittstelle)
   Ergebnis wie bei parseCityGML: eine Liste von Ringen, jeder als [x, y, z, x, y, z, ...] im Bezugssystem der Datei
   (x = Rechtswert, y = Hochwert). Je Bauteil gilt nur die höchste Detailstufe (LoD), sonst lägen LoD 1.2, 1.3 und 2.2 von
   3DBAG übereinander; Grundrisse (LoD unter 1) und Gelände, Pflanzen, Wasser, Landnutzung bleiben weg. Löcher in Flächen
   werden wie bei CityGML ignoriert.
   ========================================================= */
const CITYJSON_SKIP_TYPES = { TINRelief: 1, PlantCover: 1, SolitaryVegetationObject: 1, WaterBody: 1, LandUse: 1 };

function cityJsonLod(g) {
  const v = parseFloat(g && g.lod);
  return isFinite(v) ? v : 1;
}

/* Äußere Ringe (Indexlisten) einer Geometrie, je nach Typ verschieden tief verschachtelt */
function cityJsonRings(type, b, out) {
  if (!Array.isArray(b)) return;
  if (type === 'MultiSurface' || type === 'CompositeSurface') {
    b.forEach(function (surf) { if (Array.isArray(surf) && Array.isArray(surf[0])) out.push(surf[0]); });
  } else if (type === 'Solid') {
    b.forEach(function (shell) { cityJsonRings('MultiSurface', shell, out); });
  } else if (type === 'MultiSolid' || type === 'CompositeSolid') {
    b.forEach(function (solid) { cityJsonRings('Solid', solid, out); });
  }
}

function parseCityJSON(text) {
  const docs = [];
  const t = String(text || '');
  try {
    docs.push(JSON.parse(t));
  } catch (e) {
    // CityJSONSeq: eine JSON-Zeile je Gebäude
    const lines = t.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i].trim();
      if (!ln) continue;
      try { docs.push(JSON.parse(ln)); } catch (e2) { throw new Error('Die Datei ist kein gültiges CityJSON.'); }
    }
  }
  if (!docs.length) throw new Error('Die Datei ist kein gültiges CityJSON.');

  // Maßstab und Verschiebung: aus der Kopfzeile bzw. dem CityJSON-Dokument, bei Merkmalslisten aus metadata
  let transform = null;
  docs.forEach(function (d) {
    if (!transform && d && d.type === 'CityJSON' && d.transform) transform = d.transform;
    if (!transform && d && d.metadata && d.metadata.transform) transform = d.metadata.transform;
  });

  const units = [];
  docs.forEach(function (d) {
    if (!d || typeof d !== 'object') return;
    if (d.type === 'CityJSON' || d.type === 'CityJSONFeature') {
      if (d.CityObjects) units.push({ objs: d.CityObjects, verts: d.vertices || [], tr: d.type === 'CityJSON' ? (d.transform || transform) : transform });
    }
    if (Array.isArray(d.features)) {
      d.features.forEach(function (f) {
        if (f && f.CityObjects) units.push({ objs: f.CityObjects, verts: f.vertices || [], tr: transform });
      });
    }
  });

  const rings = [];
  units.forEach(function (u) {
    const sc = (u.tr && u.tr.scale) || [1, 1, 1], tl = (u.tr && u.tr.translate) || [0, 0, 0];
    Object.keys(u.objs).forEach(function (id) {
      const o = u.objs[id];
      if (!o || CITYJSON_SKIP_TYPES[o.type] || !Array.isArray(o.geometry)) return;
      let best = null, bestLod = -1;
      o.geometry.forEach(function (g) {
        const lod = cityJsonLod(g);
        if (lod >= 1 && lod > bestLod) { best = g; bestLod = lod; }
      });
      if (!best) return;
      const idx = [];
      cityJsonRings(best.type, best.boundaries, idx);
      idx.forEach(function (ring) {
        if (ring.length < 3) return;
        const flat = [];
        for (let i = 0; i < ring.length; i++) {
          const v = u.verts[ring[i]];
          if (!v) { flat.length = 0; break; }
          flat.push(v[0] * sc[0] + tl[0], v[1] * sc[1] + tl[1], v[2] * sc[2] + tl[2]);
        }
        if (flat.length >= 9) rings.push(flat);
      });
    });
  });

  if (!rings.length) throw new Error('Keine Gebäudeflächen gefunden. Enthält die Datei LoD1/LoD2-Geometrie?');
  return rings;
}

/* CityGML oder CityJSON? JSON beginnt mit { oder [ (Wasserzeichen und Leerraum davor zählen nicht) */
function parseBuildingText(text) {
  const head = String(text || '').slice(0, 64).replace(/^[﻿\s]+/, '');
  return (head[0] === '{' || head[0] === '[') ? parseCityJSON(text) : parseCityGML(text);
}

function readRing(node) {
  const pl = node.getElementsByTagNameNS('*', 'posList')[0];
  if (pl && pl.textContent) return parseNumbers(pl.textContent);

  const pos = node.getElementsByTagNameNS('*', 'pos');
  if (pos && pos.length) {
    const out = [];
    for (let i = 0; i < pos.length; i++) {
      const v = parseNumbers(pos[i].textContent);
      for (let k = 0; k < v.length; k++) out.push(v[k]);
    }
    return out;
  }
  return null;
}

function parseNumbers(s) {
  if (!s) return [];
  const parts = s.trim().split(/[\s,]+/);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const v = parseFloat(parts[i]);
    if (isFinite(v)) out.push(v);
  }
  return out;
}

/* Bezugssystem, das eine CityGML- oder CityJSON-Datei nennt (srsName bzw. referenceSystem), sonst null */
const BUILDING_COMPOUND_CRS = { 5554: 25831, 5555: 25832, 5556: 25833, 7415: 28992 };      // Lage + Höhe in einem Code
function buildingTextEpsg(text) {
  const m = String(text || '').slice(0, 300000).match(/(?:srsName\s*=\s*|"referenceSystem"\s*:\s*)["']([^"']+)["']/);
  if (!m) return null;
  const adv = m[1].match(/ETRS89_UTM(\d\d)/i), gk = m[1].match(/DHDN_3GK(\d)/i);
  let code = adv ? 25800 + Number(adv[1]) : gk ? 31464 + Number(gk[1]) : fpGmlEpsg(m[1]);
  code = BUILDING_COMPOUND_CRS[code] || code;
  const def = code ? crsGeoDefinition(code) : null;
  return def && !def.merc ? code : null;
}

/* Gebäuderinge [x, y, z, ...] vom System src in das System dst (Höhen unverändert); eine vertauschte Achsenfolge
   wird dabei bereinigt. originE/originN: Geländemitte im System dst. */
function reprojectRings(rings, src, dst, originE, originN) {
  const tr = crsTransformer(src, dst), back = crsTransformer(dst, src);
  if (!tr || !back) return rings;
  const o = back(originE, originN);
  const swap = detectAxisOrder(rings, o.e, o.n).swap;
  return rings.map(function (ring) {
    const out = [];
    for (let i = 0; i + 2 < ring.length; i += 3) {
      const p = tr(swap ? ring[i + 1] : ring[i], swap ? ring[i] : ring[i + 1]);
      out.push(p.e, p.n, ring[i + 2]);
    }
    return out;
  });
}

/* Mehrere Gebäudedateien (CityGML oder CityJSON) zu einer Ringliste zusammenführen */
function mergeCityGML(files) {
  if (!files || !files.length) throw new Error('Keine Datei ausgewählt.');
  let rings = [];
  const failed = [], parts = [];
  files.forEach(function (f) {
    try {
      const r = parseBuildingText(f.text);
      parts.push({ rings: r, epsg: buildingTextEpsg(f.text) });
      for (let i = 0; i < r.length; i++) rings.push(r[i]);
    } catch (e) {
      failed.push(f.name + ': ' + e.message);
    }
  });
  if (!rings.length) {
    throw new Error(failed.length ? failed.join(' | ') : 'Keine Gebäudeflächen gefunden.');
  }
  return { rings: rings, parts: parts, failed: failed, files: files.length };
}

/* Ermittelt, ob die erste Koordinate Rechts- oder Hochwert ist */
function detectAxisOrder(rings, originE, originN) {
  let sum0 = 0, sum1 = 0, n = 0;
  for (let r = 0; r < rings.length && n < 400; r++) {
    const ring = rings[r];
    for (let i = 0; i + 2 < ring.length && n < 400; i += 3) {
      sum0 += ring[i]; sum1 += ring[i + 1]; n++;
    }
  }
  if (!n) return { swap: false, meanA: 0, meanB: 0 };
  const m0 = sum0 / n, m1 = sum1 / n;
  const direct = Math.abs(m0 - originE) + Math.abs(m1 - originN);
  const swapped = Math.abs(m1 - originE) + Math.abs(m0 - originN);
  return { swap: swapped < direct, meanA: m0, meanB: m1 };
}

/* Baut aus den Ringen ein einzelnes Mesh (ein Draw-Call) */
/* Zerlegt die CityGML-Ringe in Dreiecke in Lokalkoordinaten (+x=Ost,
   -z=Nord, y=Höhe über TERRAIN.zmin) – von buildBuildingsMesh() (Darstellung)
   und vom IFC-Export (collectExportGeometry()) gemeinsam genutzt, damit
   beide garantiert dieselbe Geometrie sehen. */
function triangulateBuildingRings(rings) {
  const t = TERRAIN;
  if (!t) throw new Error('Bitte zuerst ein Geländemodell laden.');
  const order = detectAxisOrder(rings, t.originE, t.originN);
  const marginX = t.w / 2 + t.w * 0.15;
  const marginZ = t.d / 2 + t.d * 0.15;

  const triangles = [];
  let used = 0, skipped = 0;

  for (let r = 0; r < rings.length; r++) {
    const ring = rings[r];
    const pts = [];
    for (let i = 0; i + 2 < ring.length; i += 3) {
      const e  = order.swap ? ring[i + 1] : ring[i];
      const nn = order.swap ? ring[i] : ring[i + 1];
      pts.push([e - t.originE, ring[i + 2] - t.zmin, t.originN - nn]);
    }
    if (pts.length < 3) continue;

    const f = pts[0], l = pts[pts.length - 1];
    if (Math.abs(f[0] - l[0]) < 1e-6 && Math.abs(f[1] - l[1]) < 1e-6 && Math.abs(f[2] - l[2]) < 1e-6) {
      pts.pop();
    }
    if (pts.length < 3) continue;

    let inside = false;
    for (let i = 0; i < pts.length; i++) {
      if (Math.abs(pts[i][0]) <= marginX && Math.abs(pts[i][2]) <= marginZ) { inside = true; break; }
    }
    if (!inside) { skipped++; continue; }

    // Fächertriangulierung – LOD2-Flächen sind eben und meist konvex
    for (let i = 1; i + 1 < pts.length; i++) {
      const a = pts[0], b = pts[i], c = pts[i + 1];
      const nrm = triNormal(a, b, c);
      triangles.push({ a: a, b: b, c: c, isRoof: Math.abs(nrm[1]) > 0.55 });
    }
    used++;
  }

  return { triangles: triangles, used: used, skipped: skipped };
}

function buildBuildingsMesh(rings) {
  const res = triangulateBuildingRings(rings);
  if (!res.triangles.length) {
    throw new Error('Die Gebäude liegen außerhalb der geladenen Geländekachel.');
  }

  const wallCol = [0.82, 0.80, 0.76];
  const roofCol = [0.64, 0.35, 0.28];
  const positions = [];
  const colors = [];
  const baseY = [];

  res.triangles.forEach(function (tri) {
    const col = tri.isRoof ? roofCol : wallCol;
    const pts = [tri.a, tri.b, tri.c];
    for (let k = 0; k < 3; k++) {
      positions.push(pts[k][0], pts[k][1], pts[k][2]);
      baseY.push(pts[k][1]);
      colors.push(col[0], col[1], col[2]);
    }
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, MAT.building);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'buildings';
  mesh.userData.baseY = new Float32Array(baseY);
  mesh.userData.faces = res.used;
  mesh.userData.skipped = res.skipped;
  return mesh;
}

function triNormal(a, b, c) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  return [nx / len, ny / len, nz / len];
}

function setBuildings(mesh) {
  clearBuildings();
  buildingsMesh = mesh;
  if (mesh) scene.add(mesh);
}

function clearBuildings() {
  if (buildingsMesh) {
    scene.remove(buildingsMesh);
    buildingsMesh.geometry.dispose();
    buildingsMesh = null;
  }
}

/* =========================================================
   Gebäude aus 2D-Daten (GeoJSON, Shapefile, GeoPackage)
   Grundrisse mit Attributen werden zu Quadern mit Flachdach (LoD1). Gelände- und Gebäudehöhe wählt der Nutzer
   nach dem Laden aus den Attributen (oder gibt feste Werte an). Alles ohne Bibliothek: eigene Leser für
   Shapefile/DBF, GeoJSON und einen minimalen SQLite-Leser (nur Lesen) für GeoPackage.
   Datensatz: { name, epsg (Zahl oder null), feats: [{ polys: [{ outer: [[x, y], ...], holes: [[[x, y], ...]] }], props: {} }],
   fields: [{ name, numeric }], table (nur GeoPackage) }
   ========================================================= */

/* Zahl aus einem Attributwert: Zahl, Text mit Punkt oder Komma ("12,5"), sonst NaN */
function fpNum(v) {
  if (typeof v === 'number') return isFinite(v) ? v : NaN;
  if (typeof v === 'string') {
    const s = v.trim().replace(',', '.');
    return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN;
  }
  return NaN;
}

/* Attributliste eines Datensatzes: Name und ob (fast) alle gefüllten Werte Zahlen sind */
function fpFields(feats) {
  const order = [], info = {};
  const n = Math.min(feats.length, 3000);
  for (let i = 0; i < n; i++) {
    const p = feats[i].props || {};
    Object.keys(p).forEach(function (k) {
      if (!info[k]) { info[k] = { num: 0, other: 0 }; order.push(k); }
      const v = p[k];
      if (v === null || v === undefined || v === '') return;
      if (isFinite(fpNum(v))) info[k].num++; else info[k].other++;
    });
  }
  return order.map(function (k) { return { name: k, numeric: info[k].num > 0 && info[k].other <= info[k].num * 0.05 }; });
}

function fpRing(coords) {
  const out = [];
  for (let i = 0; i < coords.length; i++) out.push([+coords[i][0], +coords[i][1]]);
  if (out.length > 1) {
    const a = out[0], b = out[out.length - 1];
    if (a[0] === b[0] && a[1] === b[1]) out.pop();
  }
  return out;
}

function fpGeometryPolys(g, out) {
  if (!g) return;
  if (g.type === 'Polygon') {
    if (g.coordinates && g.coordinates.length) out.push({ outer: fpRing(g.coordinates[0]), holes: g.coordinates.slice(1).map(fpRing) });
  } else if (g.type === 'MultiPolygon') {
    (g.coordinates || []).forEach(function (c) { if (c && c.length) out.push({ outer: fpRing(c[0]), holes: c.slice(1).map(fpRing) }); });
  } else if (g.type === 'GeometryCollection') {
    (g.geometries || []).forEach(function (x) { fpGeometryPolys(x, out); });
  }
}

/* EPSG-Code aus einem CRS-Namen: "urn:ogc:def:crs:EPSG::25832", "EPSG:25832", CRS84 */
function fpEpsgFromName(name) {
  const s = String(name || '');
  if (/CRS84/i.test(s)) return 4326;
  const m = s.match(/EPSG:{1,2}(?:[0-9.]*:)?(\d{4,6})/i);
  return m ? parseInt(m[1], 10) : null;
}

/* Ist der Text ein GeoJSON (und kein CityJSON)? */
function fpLooksLikeGeoJson(text) {
  const head = String(text || '').slice(0, 2000);
  if (/"type"\s*:\s*"CityJSON/i.test(head)) return false;
  return /"type"\s*:\s*"(FeatureCollection|Feature|Polygon|MultiPolygon|GeometryCollection)"/.test(head);
}

function parseGeoJsonFootprints(text, name) {
  let doc;
  try { doc = JSON.parse(text); } catch (e) { throw new Error('fpBadJson'); }
  const set = { name: name || 'GeoJSON', epsg: 4326, feats: [], fields: [] };
  if (doc && doc.crs && doc.crs.properties) {
    const c = fpEpsgFromName(doc.crs.properties.name);
    if (c) set.epsg = c;
  }
  const feats = doc && doc.type === 'FeatureCollection' ? (doc.features || []) : (doc && doc.type === 'Feature' ? [doc] : (doc ? [{ geometry: doc, properties: {} }] : []));
  feats.forEach(function (f) {
    const polys = [];
    fpGeometryPolys(f && f.geometry, polys);
    if (polys.length) set.feats.push({ polys: polys, props: (f && f.properties) || {} });
  });
  if (!set.feats.length) throw new Error('fpNoPolygons');
  set.fields = fpFields(set.feats);
  return set;
}

/* ---------- Shapefile (.shp, .dbf, .prj, .cpg) ---------- */

/* Flächeninhalt mit Vorzeichen (Shoelace, positiv = gegen den Uhrzeigersinn bei Nord oben) */
function fpSignedArea(r) {
  let s = 0;
  for (let i = 0, n = r.length; i < n; i++) {
    const a = r[i], b = r[(i + 1) % n];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s / 2;
}

/* Liefert je Datensatz eine Liste von Polygonen (oder null bei leerer Form). Shapefile: Außenringe im Uhrzeigersinn, Löcher dagegen. */
function parseShp(buf) {
  const dv = new DataView(buf.buffer || buf, buf.byteOffset || 0, buf.byteLength);
  if (buf.byteLength < 100 || dv.getInt32(0, false) !== 9994) throw new Error('fpBadShp');
  const type = dv.getInt32(32, true);
  if ([5, 15, 25, 31].indexOf(type) < 0) throw new Error('fpShpNotPolygon');
  const shapes = [];
  let pos = 100;
  while (pos + 8 <= buf.byteLength) {
    const len = dv.getInt32(pos + 4, false) * 2;
    const start = pos + 8;
    pos = start + len;
    if (pos > buf.byteLength) break;
    const st = dv.getInt32(start, true);
    if (st === 0) { shapes.push(null); continue; }
    if ([5, 15, 25].indexOf(st) < 0) { shapes.push(null); continue; }       // MultiPatch u. a. werden nicht gelesen
    const nParts = dv.getInt32(start + 36, true), nPts = dv.getInt32(start + 40, true);
    const partsAt = start + 44, ptsAt = partsAt + 4 * nParts;
    const parts = [];
    for (let k = 0; k < nParts; k++) parts.push(dv.getInt32(partsAt + 4 * k, true));
    const rings = [];
    for (let k = 0; k < nParts; k++) {
      const a = parts[k], b = k + 1 < nParts ? parts[k + 1] : nPts;
      const r = [];
      for (let i = a; i < b; i++) r.push([dv.getFloat64(ptsAt + 16 * i, true), dv.getFloat64(ptsAt + 16 * i + 8, true)]);
      if (r.length > 1) { const f = r[0], l = r[r.length - 1]; if (f[0] === l[0] && f[1] === l[1]) r.pop(); }
      if (r.length >= 3) rings.push(r);
    }
    const polys = [];
    rings.forEach(function (r) {
      const cw = fpSignedArea(r) < 0;
      if (cw || !polys.length) polys.push({ outer: r, holes: [] });
      else polys[polys.length - 1].holes.push(r);
    });
    shapes.push(polys.length ? polys : null);
  }
  return shapes;
}

/* dBase-Tabelle: { fields: [{ name, type }], rows: [{ Feld: Wert }] }; encoding: Name nach TextDecoder (aus .cpg) oder null */
function parseDbf(buf, encoding) {
  const dv = new DataView(buf.buffer || buf, buf.byteOffset || 0, buf.byteLength);
  const u8 = new Uint8Array(buf.buffer || buf, buf.byteOffset || 0, buf.byteLength);
  if (buf.byteLength < 33) throw new Error('fpBadDbf');
  const nRec = dv.getUint32(4, true), hLen = dv.getUint16(8, true), rLen = dv.getUint16(10, true);
  const fields = [];
  let p = 32;
  while (p + 32 <= hLen && u8[p] !== 0x0d) {
    let nm = '';
    for (let i = 0; i < 11 && u8[p + i]; i++) nm += String.fromCharCode(u8[p + i]);
    fields.push({ name: nm, type: String.fromCharCode(u8[p + 11]), len: u8[p + 16], start: 0 });
    p += 32;
  }
  let off = 1;
  fields.forEach(function (f) { f.start = off; off += f.len; });
  let dec = null;
  const mk = function (label, fatal) { try { return new TextDecoder(label, { fatal: !!fatal }); } catch (e) { return null; } };
  if (encoding) dec = mk(encoding, false);
  const rows = [];
  for (let r = 0; r < nRec; r++) {
    const base = hLen + r * rLen;
    if (base + rLen > buf.byteLength) break;
    const rec = u8.subarray(base, base + rLen);
    const row = {};
    fields.forEach(function (f) {
      const raw = rec.subarray(f.start, f.start + f.len);
      if (f.type === 'C') row[f.name] = raw;
      else {
        let s = '';
        for (let i = 0; i < raw.length; i++) s += String.fromCharCode(raw[i]);
        s = s.trim();
        if (f.type === 'N' || f.type === 'F') row[f.name] = s === '' ? null : parseFloat(s);
        else if (f.type === 'L') row[f.name] = /^[TtYy]$/.test(s) ? true : (/^[FfNn]$/.test(s) ? false : null);
        else row[f.name] = s || null;
      }
    });
    rows.push(rec[0] === 0x2a ? null : row);
  }
  // Texte: nach .cpg, sonst UTF-8 (streng), sonst Windows-1252
  if (!dec) {
    const strict = mk('utf-8', true);
    let ok = !!strict;
    if (strict) {
      try {
        rows.forEach(function (row) { if (!row) return; fields.forEach(function (f) { if (f.type === 'C') strict.decode(row[f.name]); }); });
      } catch (e) { ok = false; }
    }
    dec = ok ? strict : (mk('windows-1252', false) || mk('iso-8859-1', false));
  }
  rows.forEach(function (row) {
    if (!row) return;
    fields.forEach(function (f) { if (f.type === 'C') row[f.name] = dec ? dec.decode(row[f.name]).replace(/[\0\s]+$/, '').replace(/^\s+/, '') : ''; });
  });
  return { fields: fields.map(function (f) { return { name: f.name, type: f.type }; }), rows: rows };
}

/* EPSG-Code aus einer .prj-Datei (WKT1 oder WKT2); sonst aus dem Namen gängiger Systeme; sonst null */
function fpPrjEpsg(wkt) {
  const s = String(wkt || '');
  let m = s.match(/(?:AUTHORITY\s*\[\s*"EPSG"\s*,\s*"?(\d+)"?\s*\]\s*\]\s*$|ID\s*\[\s*"EPSG"\s*,\s*(\d+)\s*\]\s*\]\s*$)/);
  if (m) return canonicalEpsg(parseInt(m[1] || m[2], 10));
  const name = (s.match(/^\s*(?:PROJCS|PROJCRS|GEOGCS|GEOGCRS|BASEGEOGCRS)\s*\[\s*"([^"]+)"/) || [])[1] || '';
  const n = name.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  if ((m = n.match(/^ETRS_?(?:89|1989)_(?:\w*_)?UTM_ZONE_(\d+)N/))) return 25800 + parseInt(m[1], 10);
  if ((m = n.match(/^WGS_?(?:1984|84)_UTM_ZONE_(\d+)N/))) return 32600 + parseInt(m[1], 10);
  if ((m = n.match(/^MGI_(?:AUSTRIA_)?GK_M(28|31|34)/))) return { 28: 31254, 31: 31255, 34: 31256 }[m[1]];
  if ((m = n.match(/^DHDN_(?:3_DEGREE_)?GAUSS_KRUGER_ZONE_(\d)/))) return 31464 + parseInt(m[1], 10);
  if (/^ETRS_?(89|1989)_(EXTENDED_)?LAEA/.test(n)) return 3035;
  if (/^(WGS_1984|GCS_WGS_1984)$/.test(n)) return 4326;
  if (/^(ETRS89|GCS_ETRS_1989)$/.test(n)) return 4258;
  return null;
}

/* Shapefile-Satz aus den Rohdaten: shp (Pflicht), dbf, prj-Text, cpg-Text */
function parseShapefileSet(shpBuf, dbfBuf, prjText, cpgText, name) {
  const shapes = parseShp(shpBuf);
  let table = null;
  if (dbfBuf) {
    const cp = String(cpgText || '').trim();
    const enc = /^(utf-?8|65001)$/i.test(cp) ? 'utf-8' : (/^(1252|cp1252|windows-1252|ansi)$/i.test(cp) ? 'windows-1252' : (/^(latin1|iso-?8859-1|88591)$/i.test(cp) ? 'iso-8859-1' : (cp || null)));
    table = parseDbf(dbfBuf, enc);
  }
  const set = { name: name || 'Shapefile', epsg: prjText ? fpPrjEpsg(prjText) : null, feats: [], fields: [] };
  for (let i = 0; i < shapes.length; i++) {
    if (!shapes[i]) continue;
    const row = table ? table.rows[i] : {};
    if (table && row === null) continue;                       // im DBF gelöscht
    set.feats.push({ polys: shapes[i], props: row || {} });
  }
  if (!set.feats.length) throw new Error('fpNoPolygons');
  set.fields = fpFields(set.feats);
  return set;
}

/* ---------- GeoPackage: minimaler SQLite-Leser ---------- */

/* readRange(offset, length) -> Promise<Uint8Array>; size: Dateigröße. Nur Lesen, nur UTF-8, nur Tabellen-B-Bäume. */
async function sqliteOpen(readRange, size) {
  const head = await readRange(0, Math.min(100, size));
  const magic = 'SQLite format 3\u0000';
  for (let i = 0; i < 16; i++) if (head[i] !== magic.charCodeAt(i)) throw new Error('sqliteBad');
  const hdv = new DataView(head.buffer, head.byteOffset, head.byteLength);
  let pageSize = hdv.getUint16(16, false);
  if (pageSize === 1) pageSize = 65536;
  const usable = pageSize - head[20];
  if (hdv.getUint32(56, false) !== 1) throw new Error('sqliteEncoding');
  const chunkPages = Math.max(1, Math.floor(131072 / pageSize));      // 128 KB: gut für Reihenlesen und für Einzelzugriffe über den R-Baum
  const chunks = new Map();
  const utf8 = new TextDecoder('utf-8');

  async function page(n) {
    if (!(n >= 1)) throw new Error('sqliteBad');
    const ci = Math.floor((n - 1) / chunkPages);
    let c = chunks.get(ci);
    if (c) { chunks.delete(ci); chunks.set(ci, c); }
    else {
      const off = ci * chunkPages * pageSize;
      if (off >= size) throw new Error('sqliteBad');
      c = await readRange(off, Math.min(chunkPages * pageSize, size - off));
      chunks.set(ci, c);
      if (chunks.size > 256) chunks.delete(chunks.keys().next().value);
    }
    const o = ((n - 1) - ci * chunkPages) * pageSize;
    return c.subarray(o, o + pageSize);
  }
  const u16 = function (p, o) { return (p[o] << 8) | p[o + 1]; };
  const u32 = function (p, o) { return ((p[o] * 16777216) + (p[o + 1] << 16) + (p[o + 2] << 8) + p[o + 3]); };
  function varint(p, o) {
    let v = 0;
    for (let i = 0; i < 8; i++) { const b = p[o + i]; v = v * 128 + (b & 0x7f); if (!(b & 0x80)) return [v, o + i + 1]; }
    return [v * 256 + p[o + 8], o + 9];
  }
  async function payload(p, pos, total) {
    const X = usable - 35;
    if (total <= X) return p.subarray(pos, pos + total);
    const M = Math.floor((usable - 12) * 32 / 255) - 23;
    const K = M + ((total - M) % (usable - 4));
    const local = K <= X ? K : M;
    const out = new Uint8Array(total);
    out.set(p.subarray(pos, pos + local), 0);
    let got = local, ov = u32(p, pos + local);
    while (got < total && ov) {
      const op = await page(ov);
      const take = Math.min(usable - 4, total - got);
      out.set(op.subarray(4, 4 + take), got);
      got += take;
      ov = u32(op, 0);
    }
    return out;
  }
  /* Satz (Record) in eine Werteliste zerlegen */
  function record(buf) {
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const h = varint(buf, 0);
    const hEnd = h[0];
    let p = h[1];
    const types = [];
    while (p < hEnd) { const t = varint(buf, p); types.push(t[0]); p = t[1]; }
    let d = hEnd;
    const vals = [];
    for (let i = 0; i < types.length; i++) {
      const t = types[i];
      let v = null;
      if (t === 0) v = null;
      else if (t === 1) { v = dv.getInt8(d); d += 1; }
      else if (t === 2) { v = dv.getInt16(d, false); d += 2; }
      else if (t === 3) { v = (buf[d] << 16) | (buf[d + 1] << 8) | buf[d + 2]; if (v & 0x800000) v -= 0x1000000; d += 3; }
      else if (t === 4) { v = dv.getInt32(d, false); d += 4; }
      else if (t === 5) { v = dv.getInt16(d, false) * 4294967296 + dv.getUint32(d + 2, false); d += 6; }
      else if (t === 6) { v = Number(dv.getBigInt64(d, false)); d += 8; }
      else if (t === 7) { v = dv.getFloat64(d, false); d += 8; }
      else if (t === 8) v = 0;
      else if (t === 9) v = 1;
      else if (t >= 12 && t % 2 === 0) { const n = (t - 12) / 2; v = buf.subarray(d, d + n); d += n; }
      else if (t >= 13) { const n = (t - 13) / 2; v = utf8.decode(buf.subarray(d, d + n)); d += n; }
      vals.push(v);
    }
    return vals;
  }
  /* Alle Zeilen einer Tabelle in Reihenfolge; cb(rowid, payload) liefert false zum Abbrechen */
  async function scan(root, cb) {
    async function walk(n) {
      const p = await page(n), hdr = n === 1 ? 100 : 0, type = p[hdr], cnt = u16(p, hdr + 3);
      if (type === 0x0d) {
        for (let i = 0; i < cnt; i++) {
          const ptr = u16(p, hdr + 8 + 2 * i);
          const a = varint(p, ptr), b = varint(p, a[1]);
          if ((await cb(b[0], await payload(p, b[1], a[0]))) === false) return false;
        }
        return true;
      }
      if (type === 0x05) {
        for (let i = 0; i < cnt; i++) { if ((await walk(u32(p, u16(p, hdr + 12 + 2 * i)))) === false) return false; }
        return walk(u32(p, hdr + 8));
      }
      throw new Error('sqliteBad');
    }
    return walk(root);
  }
  /* Eine Zeile über ihre Rowid holen (null, wenn es sie nicht gibt) */
  async function get(root, rowid) {
    let n = root;
    for (let guard = 0; guard < 40; guard++) {
      const p = await page(n), hdr = n === 1 ? 100 : 0, type = p[hdr], cnt = u16(p, hdr + 3);
      if (type === 0x05) {
        let next = u32(p, hdr + 8);
        for (let i = 0; i < cnt; i++) {
          const ptr = u16(p, hdr + 12 + 2 * i);
          if (rowid <= varint(p, ptr + 4)[0]) { next = u32(p, ptr); break; }
        }
        n = next;
      } else if (type === 0x0d) {
        let lo = 0, hi = cnt - 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1, ptr = u16(p, hdr + 8 + 2 * mid);
          const a = varint(p, ptr), b = varint(p, a[1]);
          if (b[0] === rowid) return payload(p, b[1], a[0]);
          if (b[0] < rowid) lo = mid + 1; else hi = mid - 1;
        }
        return null;
      } else throw new Error('sqliteBad');
    }
    return null;
  }
  /* sqlite_master: name -> { type, root, sql } */
  const master = {};
  await scan(1, function (rowid, pl) {
    const r = record(pl);
    if (r[0] === 'table') master[r[1]] = { root: r[3], sql: r[4] || '' };
  });
  /* Spaltennamen aus CREATE TABLE; pk: Index der INTEGER-PRIMARY-KEY-Spalte (steht im Satz als NULL, der Wert ist die Rowid) */
  function columns(name) {
    const m = master[name];
    if (!m) return null;
    const sql = m.sql, a = sql.indexOf('('), b = sql.lastIndexOf(')');
    if (a < 0 || b < a) return { names: [], pk: -1 };
    const parts = [];
    let depth = 0, cur = '', q = '';
    for (let i = a + 1; i < b; i++) {
      const ch = sql[i];
      if (q) { cur += ch; if (ch === q) q = ''; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { q = ch; cur += ch; continue; }
      if (ch === '[') { q = ']'; cur += ch; continue; }
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
    }
    parts.push(cur);
    const names = [];
    let pk = -1;
    parts.forEach(function (def) {
      const d = def.trim();
      if (/^(constraint|primary\s+key|unique|foreign\s+key|check)\b/i.test(d)) return;
      const mm = d.match(/^(?:"((?:[^"]|"")+)"|`([^`]+)`|\[([^\]]+)\]|'([^']+)'|(\S+))/);
      if (!mm) return;
      names.push((mm[1] || mm[2] || mm[3] || mm[4] || mm[5]).replace(/""/g, '"'));
      if (/^\S+\s+integer\b/i.test(d.replace(/^(?:"(?:[^"]|"")+"|`[^`]+`|\[[^\]]+\]|'[^']+')/, 'x')) && /\bprimary\s+key\b/i.test(d)) pk = names.length - 1;
    });
    return { names: names, pk: pk };
  }
  /* Zeilen als Objekte lesen: cb(rowObject, rowid) */
  async function rows(name, cb) {
    const m = master[name], cols = columns(name);
    if (!m || !cols) return;
    await scan(m.root, function (rowid, pl) {
      const v = record(pl), o = {};
      for (let i = 0; i < cols.names.length; i++) o[cols.names[i]] = (i === cols.pk && v[i] === null) ? rowid : (v[i] === undefined ? null : v[i]);
      return cb(o, rowid);
    });
  }
  return { master: master, columns: columns, rows: rows, scan: scan, get: get, record: record, page: page };
}

/* WKB (auch EWKB, mit Z/M) -> Polygone; Linien, Punkte usw. werden übersprungen */
function fpWkb(buf, pos, out) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const le = buf[pos] === 1;
  let type = dv.getUint32(pos + 1, le);
  pos += 5;
  let hasZ = false, hasM = false, t;
  if (type > 0xffff) {
    hasZ = !!(type & 0x80000000); hasM = !!(type & 0x40000000);
    if (type & 0x20000000) pos += 4;
    t = type & 0xff;
  } else {
    const k = Math.floor(type / 1000);
    hasZ = k === 1 || k === 3; hasM = k === 2 || k === 3;
    t = type % 1000;
  }
  const dim = 2 + (hasZ ? 1 : 0) + (hasM ? 1 : 0);
  if (t === 3) {
    const nr = dv.getUint32(pos, le); pos += 4;
    const rings = [];
    for (let r = 0; r < nr; r++) {
      const np = dv.getUint32(pos, le); pos += 4;
      const ring = [];
      for (let i = 0; i < np; i++) { ring.push([dv.getFloat64(pos, le), dv.getFloat64(pos + 8, le)]); pos += 8 * dim; }
      if (ring.length > 1) { const f = ring[0], l = ring[ring.length - 1]; if (f[0] === l[0] && f[1] === l[1]) ring.pop(); }
      rings.push(ring);
    }
    if (rings.length && rings[0].length >= 3) out.push({ outer: rings[0], holes: rings.slice(1).filter(function (x) { return x.length >= 3; }) });
    return pos;
  }
  if (t === 6 || t === 7) {
    const n = dv.getUint32(pos, le); pos += 4;
    for (let i = 0; i < n; i++) pos = fpWkb(buf, pos, out);
    return pos;
  }
  return buf.length;                                   // andere Typen: Rest dieser Geometrie überspringen
}

/* GeoPackage-Geometrie (Blob mit GP-Kopf) -> { polys, env: [minx, maxx, miny, maxy] | null } */
function fpGpkgGeometry(blob) {
  if (!blob || blob.length < 8 || blob[0] !== 0x47 || blob[1] !== 0x50) return null;
  const flags = blob[3];
  const le = !!(flags & 1), envKind = (flags >> 1) & 7;
  if (flags & 0x10) return null;                       // leere Geometrie
  const dv = new DataView(blob.buffer, blob.byteOffset, blob.byteLength);
  const envLen = [0, 32, 48, 48, 64][envKind] || 0;
  const env = envKind ? [dv.getFloat64(8, le), dv.getFloat64(16, le), dv.getFloat64(24, le), dv.getFloat64(32, le)] : null;
  const polys = [];
  fpWkb(blob, 8 + envLen, polys);
  return { polys: polys, env: env };
}

/* GeoPackage lesen. window: Funktion (epsg) -> [minx, miny, maxx, maxy] im Bezugssystem der Daten oder null (alles lesen) */
async function readGpkgFootprints(readRange, size, name, window, tableName) {
  const db = await sqliteOpen(readRange, size);
  if (!db.master.gpkg_geometry_columns) throw new Error('gpkgNone');
  const geoms = [];
  await db.rows('gpkg_geometry_columns', function (r) { geoms.push(r); });
  const ok = geoms.filter(function (g) { return /^(POLYGON|MULTIPOLYGON|GEOMETRY|SURFACE|MULTISURFACE|GEOMETRYCOLLECTION)$/i.test(String(g.geometry_type_name)); });
  if (!ok.length) throw new Error('gpkgNone');
  const pick = ok.filter(function (g) { return g.table_name === tableName; })[0] ||
               ok.filter(function (g) { return /bau|build|geb|haus|bldg/i.test(g.table_name); })[0] || ok[0];
  const table = pick.table_name, gcol = pick.column_name;
  let epsg = null;
  if (db.master.gpkg_spatial_ref_sys) {
    await db.rows('gpkg_spatial_ref_sys', function (r) {
      if (r.srs_id === pick.srs_id) {
        if (String(r.organization).toUpperCase() === 'EPSG') epsg = r.organization_coordsys_id;
        else if (r.srs_id > 0) epsg = r.srs_id;
      }
    });
  }
  const cols = db.columns(table);
  const win = window ? window(epsg) : null;
  const set = { name: name || table, epsg: epsg > 0 ? epsg : null, feats: [], fields: [], table: table, tables: ok.map(function (g) { return g.table_name; }) };
  const gi = cols.names.indexOf(gcol);
  const take = function (row) {
    const g = fpGpkgGeometry(row[gcol]);
    if (!g || !g.polys.length) return;
    if (win && g.env && (g.env[1] < win[0] || g.env[0] > win[2] || g.env[3] < win[1] || g.env[2] > win[3])) return;
    const props = {};
    cols.names.forEach(function (c, i) { if (i !== gi && c !== pick.column_name) { const v = row[c]; if (!ArrayBuffer.isView(v)) props[c] = v; } });
    set.feats.push({ polys: g.polys, props: props });
  };
  const rtree = 'rtree_' + table + '_' + gcol;
  if (win && db.master[rtree + '_node']) {
    // R-Baum: nur die Gebäude im Fenster holen (nötig bei riesigen Dateien)
    const nodeRoot = db.master[rtree + '_node'].root, featRoot = db.master[table].root;
    const ids = [];
    const nodeRow = async function (no) { const pl = await db.get(nodeRoot, no); return pl ? db.record(pl)[1] : null; };
    const root = await nodeRow(1);
    if (root) {
      const depth = (root[0] << 8) | root[1];
      const visit = async function (data, level) {
        const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
        const cnt = (data[2] << 8) | data[3];
        for (let i = 0; i < cnt; i++) {
          const o = 4 + i * 24;
          const id = dv.getUint32(o, false) * 4294967296 + dv.getUint32(o + 4, false);
          const x0 = dv.getFloat32(o + 8, false), x1 = dv.getFloat32(o + 12, false), y0 = dv.getFloat32(o + 16, false), y1 = dv.getFloat32(o + 20, false);
          if (x1 < win[0] || x0 > win[2] || y1 < win[1] || y0 > win[3]) continue;
          if (level === 0) ids.push(id);
          else { const child = await nodeRow(id); if (child) await visit(child, level - 1); }
        }
      };
      await visit(root, depth);
    }
    for (let i = 0; i < ids.length; i++) {
      const pl = await db.get(featRoot, ids[i]);
      if (!pl) continue;
      const v = db.record(pl), o = {};
      for (let k = 0; k < cols.names.length; k++) o[cols.names[k]] = (k === cols.pk && v[k] === null) ? ids[i] : (v[k] === undefined ? null : v[k]);
      take(o);
    }
  } else {
    await db.rows(table, function (row) { take(row); });
  }
  if (!set.feats.length) throw new Error('fpNoPolygons');
  set.fields = fpFields(set.feats);
  return set;
}

/* ---------- INSPIRE Gebäude 2D (GML: bu-core2d / bu-ext2d / bu-base), zum Beispiel ČÚZK (RÚIAN) ----------
   Grundrisse als gml:Polygon, dazu Merkmale wie Geschosszahl und Höhe (bei vielen Ländern nicht befüllt). Kein CityGML: die Polygone haben
   nur zwei Koordinaten je Punkt, bei Breite/Länge in der Reihenfolge Breite, Länge (INSPIRE-Achsenfolge). Gelesen wird mit Mustern statt DOM:
   die Dateien sind groß und sehr regelmäßig. */
function fpLooksLikeInspireGml(head) {
  const h = String(head || '').slice(0, 6000);
  return /inspire\.ec\.europa\.eu\/schemas\/bu-(core2d|ext2d|base)/.test(h) && !/citygml/i.test(h);
}

function fpGmlEpsg(srs) {
  const m = String(srs || '').match(/EPSG[/:]+(?:[0-9.]*[/:])?(\d{4,6})/i);
  return m ? canonicalEpsg(parseInt(m[1], 10)) : null;
}

function parseInspireBuildings(text, name) {
  const set = { name: name || 'INSPIRE-GML', epsg: null, feats: [], fields: [] };
  const docSrs = (String(text).match(/srsName="([^"]+)"/) || [])[1];
  const num = function (block, tag) {
    const m = block.match(new RegExp('<[a-z0-9-]+:' + tag + '\\b[^>]*>([^<]+)<'));
    const v = m ? fpNum(m[1]) : NaN;
    return isFinite(v) ? v : null;
  };
  const re = /<([a-z0-9-]+):(Building|BuildingPart)\b[^>]*?gml:id="([^"]*)"[^>]*>([\s\S]*?)<\/\1:\2>/g;
  let m, points = 0;
  while ((m = re.exec(text))) {
    const block = m[4];
    const polys = [];
    const pre = /<gml:Polygon\b([^>]*)>([\s\S]*?)<\/gml:Polygon>/g;
    let pm;
    while ((pm = pre.exec(block))) {
      const srs = (pm[1].match(/srsName="([^"]+)"/) || [])[1] || docSrs;
      const code = fpGmlEpsg(srs);
      const dim = parseInt((pm[1].match(/srsDimension="(\d)"/) || [])[1] || '2', 10) || 2;
      const swap = !!code && !!FP_GEOGRAPHIC[code] && /def[/:]crs|urn:ogc/i.test(srs || '');     // Breite, Länge -> Länge, Breite
      if (code && !set.epsg) set.epsg = code;
      const ring = function (s) {
        const v = fpGmlNumbersFromString(s), out = [];
        for (let i = 0; i + dim <= v.length; i += dim) out.push(swap ? [v[i + 1], v[i]] : [v[i], v[i + 1]]);
        if (out.length > 1) { const a = out[0], b = out[out.length - 1]; if (a[0] === b[0] && a[1] === b[1]) out.pop(); }
        return out;
      };
      const ext = pm[2].match(/<gml:exterior>[\s\S]*?<gml:posList[^>]*>([^<]*)<\/gml:posList>/);
      if (!ext) continue;
      const outer = ring(ext[1]);
      if (outer.length < 3) continue;
      const holes = [];
      const ire = /<gml:interior>[\s\S]*?<gml:posList[^>]*>([^<]*)<\/gml:posList>/g;
      let im;
      while ((im = ire.exec(pm[2]))) { const h = ring(im[1]); if (h.length >= 3) holes.push(h); }
      polys.push({ outer: outer, holes: holes });
    }
    if (!polys.length) { if (/<gml:Point\b/.test(block)) points++; continue; }
    const hb = (block.match(/<[a-z0-9-]+:heightAboveGround\b[^>]*>([\s\S]*?)<\/[a-z0-9-]+:heightAboveGround>/) || [])[1] || '';
    let height = hb ? num(hb, 'value') : null;
    if (height === null) height = num(block, 'heightAboveGround');
    const use = (block.match(/<[a-z0-9-]+:currentUse\b[^>]*xlink:title="([^"]+)"/) || [])[1] || null;
    set.feats.push({ polys: polys, props: {
      id: (m[3] || '').replace(/^(BU|BP)\./, ''), art: m[2] === 'Building' ? 'Gebäude' : 'Gebäudeteil',
      name: ((block.match(/<gn:text>([^<]*)<\/gn:text>/) || [])[1] || '').trim() || null,
      geschosse: num(block, 'numberOfFloorsAboveGround'), hoehe: height, hoehe_gelaende: num(block, 'elevation'),
      nutzung: use, baujahr: ((block.match(/<[a-z0-9-]+:anyPoint>(\d{4})/) || [])[1] || null) && parseInt(block.match(/<[a-z0-9-]+:anyPoint>(\d{4})/)[1], 10)
    } });
  }
  if (!set.feats.length) throw new Error('fpNoPolygons');
  set.fields = fpFields(set.feats);
  set.skippedPoints = points;
  return set;
}

function fpGmlNumbersFromString(s) {
  const p = String(s).trim().split(/\s+/), out = [];
  for (let i = 0; i < p.length; i++) { const v = parseFloat(p[i]); if (isFinite(v)) out.push(v); }
  return out;
}

/* ---------- Von den Grundrissen zu den Flächen (Quader mit Flachdach) ---------- */

const FP_GEOGRAPHIC = { 4326: 1, 4258: 1, 4979: 1, 4937: 1, 4269: 1, 4617: 1 };

/* Rechtecke-Test: Strecke a-b schneidet die Strecke c-d echt (ohne Endpunkte zu berühren) */
function fpSegCross(a, b, c, d) {
  const o = function (p, q, r) { return (q.x - p.x) * (r.z - p.z) - (q.z - p.z) * (r.x - p.x); };
  const d1 = o(a, b, c), d2 = o(a, b, d), d3 = o(c, d, a), d4 = o(c, d, b);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/* Löcher (Innenhöfe) über Brücken mit dem Außenring zu einem Ring verbinden (Punkte {x, z}); Außenring gegen den Uhrzeigersinn, Löcher im Uhrzeigersinn */
function fpBridgeHoles(outer, holes) {
  let ring = outer.slice();
  const hs = holes.map(function (h) { return { pts: h, maxX: Math.max.apply(null, h.map(function (p) { return p.x; })) }; }).sort(function (a, b) { return b.maxX - a.maxX; });
  for (let hi = 0; hi < hs.length; hi++) {
    const h = hs[hi].pts, others = hs.filter(function (x, i) { return i > hi; });
    const cand = [];
    for (let i = 0; i < h.length; i++) for (let j = 0; j < ring.length; j++) {
      const dx = h[i].x - ring[j].x, dz = h[i].z - ring[j].z;
      cand.push({ i: i, j: j, d: dx * dx + dz * dz });
    }
    cand.sort(function (a, b) { return a.d - b.d; });
    let best = null;
    for (let c = 0; c < cand.length && !best; c++) {
      const a = h[cand[c].i], b = ring[cand[c].j];
      let bad = false;
      const test = function (poly) {
        for (let k = 0; k < poly.length && !bad; k++) {
          const p = poly[k], q = poly[(k + 1) % poly.length];
          if (fpSegCross(a, b, p, q)) bad = true;
        }
      };
      test(ring); test(h); others.forEach(function (o) { if (!bad) test(o.pts); });
      if (!bad) best = cand[c];
    }
    if (!best) continue;
    const hr = [];
    for (let k = 0; k < h.length; k++) hr.push(h[(best.i + k) % h.length]);
    hr.push(h[best.i]);
    ring = ring.slice(0, best.j + 1).concat(hr, [ring[best.j]], ring.slice(best.j + 1));
  }
  return ring;
}

/* Mittelwert der Gelände- bzw. Gebäudehöhen für die Auswahl: Median eines numerischen Attributs */
function fpMedian(set, attr) {
  const v = [];
  const n = Math.min(set.feats.length, 3000);
  for (let i = 0; i < n; i++) { const x = fpNum(set.feats[i].props[attr]); if (isFinite(x)) v.push(x); }
  if (!v.length) return NaN;
  v.sort(function (a, b) { return a - b; });
  return v[v.length >> 1];
}

/* Fenster (Gelände samt Rand) im Bezugssystem der Daten: [minx, miny, maxx, maxy] oder null, wenn kein Gelände geladen ist */
function fpWindowFor(epsg) {
  const t = TERRAIN;
  if (!t) return null;
  const src = epsg || t.srcEpsg || t.epsg;
  const mx = t.w * 0.6, mz = t.d * 0.6;
  const corners = [[-mx, -mz], [mx, -mz], [mx, mz], [-mx, mz]].map(function (c) { return [t.originE + c[0], t.originN + c[1]]; });
  if (src === t.epsg) return [Math.min.apply(null, corners.map(function (c) { return c[0]; })), Math.min.apply(null, corners.map(function (c) { return c[1]; })),
                              Math.max.apply(null, corners.map(function (c) { return c[0]; })), Math.max.apply(null, corners.map(function (c) { return c[1]; }))];
  const out = [];
  for (let i = 0; i < corners.length; i++) {
    const g = crsToLonLat(t.epsg, corners[i][0], corners[i][1]);
    if (!g) return null;
    if (FP_GEOGRAPHIC[src]) out.push([g.lon, g.lat]);
    else {
      const d = crsGeoDefinition(src);
      if (!d || d.merc) return null;
      const p = lonLatToCrs(d, g.lat, g.lon);
      out.push([p.e, p.n]);
    }
  }
  return [Math.min.apply(null, out.map(function (c) { return c[0]; })), Math.min.apply(null, out.map(function (c) { return c[1]; })),
          Math.max.apply(null, out.map(function (c) { return c[0]; })), Math.max.apply(null, out.map(function (c) { return c[1]; }))];
}

/* Aus einem Grundriss-Datensatz die Flächenringe bauen (Format wie bei CityGML: [x, y, z, ...] mit absoluten Höhen).
   opts: { epsg: Bezugssystem der Daten oder null (dann aus der Datei, sonst das des Geländes),
           ground: { src: 'terrain' | 'attr' | 'fixed', attr, fixed },
           height: { src: 'attr' | 'fixed', attr, ref: 'rel' | 'abs', factor, fixed },
           fallback: Ersatzhöhe in m, wenn ein Gebäude keine brauchbare Höhe hat } */
function footprintRings(set, opts) {
  const t = TERRAIN;
  if (!t) throw new Error('Bitte zuerst ein Geländemodell laden.');
  const src = (opts && opts.epsg) || set.epsg || t.srcEpsg || t.epsg;
  let conv;
  if (src === t.epsg) conv = function (x, y) { return [x, y]; };
  else if (FP_GEOGRAPHIC[src]) {
    const td = crsGeoDefinition(t.epsg);
    if (!td || td.merc) throw new Error('fpCrsUnknown');
    conv = function (x, y) { const p = lonLatToCrs(td, y, x); return [p.e, p.n]; };
  } else {
    const tr = crsTransformer(src, t.epsg);
    if (!tr) throw new Error('fpCrsUnknown');
    conv = function (x, y) { const p = tr(x, y); return [p.e, p.n]; };
  }
  const gOpt = (opts && opts.ground) || { src: 'terrain' }, hOpt = (opts && opts.height) || { src: 'fixed', fixed: 10 };
  const fallback = opts && isFinite(opts.fallback) && opts.fallback > 0 ? opts.fallback : 8;
  const factor = hOpt.factor && isFinite(hOpt.factor) ? hOpt.factor : 1;
  const mX = t.w / 2 * 1.15, mZ = t.d / 2 * 1.15;
  const rings = [];
  let used = 0, outside = 0, noHeight = 0;

  set.feats.forEach(function (f) {
    const hv = hOpt.src === 'attr' ? fpNum(f.props[hOpt.attr]) * factor : (isFinite(hOpt.fixed) ? hOpt.fixed : fallback);
    const gv = gOpt.src === 'attr' ? fpNum(f.props[gOpt.attr]) : (gOpt.src === 'fixed' ? gOpt.fixed : NaN);
    f.polys.forEach(function (poly) {
      const toLocal = function (r) { return r.map(function (p) { const c = conv(p[0], p[1]); return { x: c[0] - t.originE, z: t.originN - c[1] }; }); };
      let outer = toLocal(poly.outer);
      if (outer.length < 3) return;
      if (!outer.some(function (p) { return Math.abs(p.x) <= mX && Math.abs(p.z) <= mZ; })) { outside++; return; }
      let holes = poly.holes.map(toLocal).filter(function (h) { return h.length >= 3; });
      // Ausrichtung: z zeigt nach Süden (z = -Nord); die Ear-Clipping-Funktion verlangt eine feste Reihenfolge nur intern
      const area = function (r) { let s = 0; for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; s += a.x * b.z - b.x * a.z; } return s / 2; };
      if (area(outer) < 0) outer = outer.slice().reverse();
      holes = holes.map(function (h) { return area(h) > 0 ? h.slice().reverse() : h; });
      // Gelände: tiefster Punkt des Grundrisses, sonst Attribut oder fester Wert
      let ground;
      if (gOpt.src === 'terrain' || !isFinite(gv)) {
        ground = Infinity;
        outer.forEach(function (p) { const h = getAbsoluteHeightAt(p.x, p.z); if (h < ground) ground = h; });
      } else ground = gv;
      let top;
      if (hOpt.src === 'attr' && hOpt.ref === 'abs') top = hv;
      else top = ground + hv;
      if (!isFinite(top) || !isFinite(hv) || top - ground < 0.5) { top = ground + fallback; noHeight++; }
      const E = function (p, y) { return [p.x + t.originE, t.originN - p.z, y]; };
      const wall = function (a, b) {
        const A = E(a, ground), B = E(b, ground), C = E(b, top), D = E(a, top);
        rings.push([A[0], A[1], A[2], B[0], B[1], B[2], C[0], C[1], C[2], D[0], D[1], D[2]]);
      };
      for (let i = 0; i < outer.length; i++) wall(outer[i], outer[(i + 1) % outer.length]);
      holes.forEach(function (h) { for (let i = 0; i < h.length; i++) wall(h[i], h[(i + 1) % h.length]); });
      const pts = holes.length ? fpBridgeHoles(outer, holes) : outer;
      triangulatePolygon(pts).forEach(function (tri) {
        const a = E(pts[tri[0]], top), b = E(pts[tri[1]], top), c = E(pts[tri[2]], top);
        rings.push([a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]]);
      });
      used++;
    });
  });
  return { rings: rings, used: used, outside: outside, noHeight: noHeight, epsg: src };
}

/* =========================================================
   Baustein: Containeranlage
   Container stehen mit der langen Seite nebeneinander.
   X-Achse = Containerlänge, Z-Achse = Containerbreite.
   ========================================================= */
function defaultContainerParams() {
  return { unitL: 6.06, unitB: 2.44, unitH: 2.60, cols: 6, rows: 1, levels: 2, rot: 0 };
}

const CONTAINER_GAP = 0.08;

/* Berechnet die Anordnung einer Containeranlage.
   Reihe 0 liegt hochkant (Länge in X). Jede weitere Reihe liegt quer dazu,
   wie der Querriegel einer Containeranlage. */
function containerLayout(p) {
  const gap = CONTAINER_GAP;
  const cols = Math.max(1, Math.round(p.cols));
  const rows = Math.min(2, Math.max(1, Math.round(p.rows)));
  const levels = Math.max(1, Math.round(p.levels));

  // Alle Container liegen längs: Länge in X, Breite in Z
  const depth = cols * p.unitB + (cols - 1) * gap;

  // Bei zwei Reihen bleibt dazwischen ein Gang von einer Containerbreite,
  // der von einem schlichten Verbindungsbau ausgefüllt wird.
  const link = rows === 2 ? p.unitB : 0;
  const totalW = rows * p.unitL + link;

  const items = [];
  for (let r = 0; r < rows; r++) {
    const cx = -totalW / 2 + p.unitL / 2 + r * (p.unitL + link);
    for (let lv = 0; lv < levels; lv++) {
      for (let i = 0; i < cols; i++) {
        items.push({
          x: cx,
          y: p.unitH / 2 + lv * p.unitH,
          z: -depth / 2 + p.unitB / 2 + i * (p.unitB + gap),
          quer: false,
          row: r,
          level: lv,
          idx: i
        });
      }
    }
  }

  return {
    items: items,
    count: items.length,
    w: totalW,
    d: depth,
    h: levels * p.unitH,
    rows: rows,
    levels: levels,
    // Maße des Verbindungsbaus; null, solange nur eine Reihe steht
    link: link ? { w: link, d: depth, h: levels * p.unitH, x: 0 } : null
  };
}

function buildContainer(p) {
  const g = new THREE.Group();
  const lay = containerLayout(p);

  const inst = new THREE.InstancedMesh(GEO.box, MAT.container, lay.count);
  inst.castShadow = true;
  inst.receiveShadow = true;
  inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const palette = [0xe8e4da, 0xd9d3c4, 0xc9d6d4, 0xe0d2bc, 0xd2dbe0];

  lay.items.forEach(function (it, i) {
    dummy.position.set(it.x, it.y, it.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(p.unitL, p.unitH, p.unitB);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
    color.setHex(palette[(it.idx * 7 + it.level * 23 + it.row * 11) % 5]);
    inst.setColorAt(i, color);
  });
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  g.add(inst);

  // Verbindungsbau zwischen den beiden Reihen
  if (lay.link) {
    const link = new THREE.Mesh(GEO.box, MAT.linkBlock);
    link.scale.set(lay.link.w, lay.link.h, lay.link.d);
    link.position.set(lay.link.x, lay.link.h / 2, 0);
    link.castShadow = true;
    link.receiveShadow = true;
    link.name = 'link';
    g.add(link);
  }

  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(lay.w, lay.h, lay.d)),
    MAT.outline
  );
  outline.position.y = lay.h / 2;
  g.add(outline);

  g.userData.bbox = { w: lay.w, d: lay.d, h: lay.h };
  g.userData.selBox = { w: lay.w, d: lay.d, h: lay.h, cy: lay.h / 2 };
  g.userData.count = lay.count;
  g.userData.link = lay.link;
  g.rotation.y = (p.rot || 0) * Math.PI / 180;
  return g;
}

/* =========================================================
   Baustein: Turmdrehkran
   Fundament und Turm stehen fest; nur der Oberbau dreht sich.
   ========================================================= */
function defaultTowerParams() {
  return {
    hookHeight: TOWER_LIMITS.hookHeight.def,
    radius: TOWER_LIMITS.radius.def,
    mastWidth: TOWER_LIMITS.mastWidth.def,
    rot: 0, baseRot: 0, showRadius: true
  };
}

function buildTowerCrane(p) {
  const g = new THREE.Group();
  // Nur ein winziger Sockel gegen entartete (Nullgrößen-)Geometrie - der
  // Regler darf bis 0 herunter, die Krangeometrie soll ihm dabei sichtbar
  // folgen statt heimlich auf einem alten Mindestwert (früher 8 bzw. 10 m)
  // zu verharren.
  const HH = Math.max(p.hookHeight, 0.1);
  const R  = Math.max(p.radius, 0.1);
  const mw = p.mastWidth || TOWER_LIMITS.mastWidth.def;

  /* ---- feststehender Unterbau ---- */
  const base = new THREE.Mesh(GEO.box, MAT.steelDark);
  base.scale.set(mw * 3.2, 1.2, mw * 3.2);
  base.position.y = 0.6;
  base.castShadow = true; base.receiveShadow = true;
  g.add(base);

  const half = mw / 2;
  [[half, half], [half, -half], [-half, half], [-half, -half]].forEach(function (c) {
    const post = new THREE.Mesh(GEO.box, MAT.craneYellow);
    post.scale.set(0.22, HH, 0.22);
    post.position.set(c[0], HH / 2 + 1.2, c[1]);
    post.castShadow = true;
    g.add(post);
  });

  const tieSpacing = 2.5;
  const levels = Math.max(Math.floor(HH / tieSpacing), 1);
  const ties = new THREE.InstancedMesh(GEO.box, MAT.craneYellow, levels * 4);
  ties.castShadow = true;
  const d = new THREE.Object3D();
  let ti = 0;
  for (let l = 0; l < levels; l++) {
    const y = 1.2 + (l + 1) * tieSpacing;
    d.rotation.set(0, 0, 0);
    d.position.set(0, y, half);  d.scale.set(mw, 0.14, 0.14); d.updateMatrix(); ties.setMatrixAt(ti++, d.matrix);
    d.position.set(0, y, -half); d.updateMatrix(); ties.setMatrixAt(ti++, d.matrix);
    d.position.set(half, y, 0);  d.scale.set(0.14, 0.14, mw); d.updateMatrix(); ties.setMatrixAt(ti++, d.matrix);
    d.position.set(-half, y, 0); d.updateMatrix(); ties.setMatrixAt(ti++, d.matrix);
  }
  ties.instanceMatrix.needsUpdate = true;
  g.add(ties);

  const topY = HH + 1.2;

  /* ---- drehbarer Oberbau: Kabine, Ausleger, Gegenausleger ---- */
  const slew = new THREE.Group();
  slew.name = 'slew';

  const cab = new THREE.Mesh(GEO.box, MAT.glass);
  cab.scale.set(2.2, 2.4, 2.0);
  cab.position.set(0, topY - 1.2, mw / 2 + 1.2);
  cab.castShadow = true;
  slew.add(cab);

  const jib = new THREE.Mesh(GEO.box, MAT.craneYellow);
  jib.scale.set(R, 1.3, 1.2);
  jib.position.set(R / 2, topY + 1.0, 0);
  jib.castShadow = true;
  slew.add(jib);

  const cLen = Math.max(R * 0.32, 8);
  const cjib = new THREE.Mesh(GEO.box, MAT.craneYellow);
  cjib.scale.set(cLen, 1.3, 1.2);
  cjib.position.set(-cLen / 2, topY + 1.0, 0);
  cjib.castShadow = true;
  slew.add(cjib);

  const bal = new THREE.Mesh(GEO.box, MAT.steelDark);
  bal.scale.set(2.6, 2.0, 3.0);
  bal.position.set(-cLen + 1.3, topY + 0.4, 0);
  bal.castShadow = true;
  slew.add(bal);

  // kind ist immer "flat" (spitzenloser Obendreher) - kein Turmkopf nötig

  const trolley = new THREE.Mesh(GEO.box, MAT.craneRed);
  trolley.scale.set(1.4, 0.7, 1.4);
  trolley.position.set(R, topY + 0.1, 0);
  slew.add(trolley);

  slew.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(R, topY - 0.4, 0),
      new THREE.Vector3(R, 1.5, 0)
    ]),
    MAT.hookLine
  ));

  // Der Oberbau haengt am gedrehten Unterbau; die Differenz haelt den
  // Auslegerwinkel absolut, unabhaengig vom Fundamentwinkel.
  const baseDeg = p.baseRot || 0;
  slew.rotation.y = ((p.rot || 0) - baseDeg) * Math.PI / 180;
  g.add(slew);

  /* ---- Arbeitsradius auf Hakenhöhe ---- */
  if (p.showRadius !== false) {
    g.add(makeCircle(R, MAT.radiusWork, topY));
    g.add(dropLines(R, topY, 4));
  }
  g.rotation.y = baseDeg * Math.PI / 180;

  g.userData.bbox = { w: R * 2, d: 4, h: topY + 8 };
  g.userData.selBox = { w: mw * 3.4, d: mw * 3.4, h: topY + 8, cy: (topY + 8) / 2 };
  g.userData.hookHeight = HH;
  g.userData.radius = R;
  g.userData.topY = topY;
  g.userData.slewDeg = p.rot || 0;
  g.userData.baseDeg = baseDeg;
  return g;
}

/* =========================================================
   Baustein: Mobilkran
   Unterwagen und Abstützung stehen fest; nur der Oberwagen dreht.
   ========================================================= */
function defaultMobileParams() {
  const m = getModel('ltm1150');
  return { model: m.id, hookHeight: m.hookDef, radius: m.radiusDef, rot: 0, baseRot: 0, showRadius: true };
}

function getModel(id) {
  for (let i = 0; i < CRANE_MODELS.length; i++) if (CRANE_MODELS[i].id === id) return CRANE_MODELS[i];
  return CRANE_MODELS[0];
}

function buildMobileCrane(p) {
  const m = getModel(p.model);
  const g = new THREE.Group();

  const HH = Math.max(p.hookHeight, 10);
  const R  = Math.max(p.radius, 3);

  const chassisL = m.chassisL;
  // Schmale, generische Fahrerhausbreite für die Darstellung - bewusst
  // NICHT m.chassisW: das ist von der Maße-Seite die größte dokumentierte
  // Querabmessung und damit praktisch immer die voll ausgefahrene
  // Abstützbreite, nicht die schmale Fahrzeugbreite selbst.
  const chassisW = 3.0;
  const slewX = -2.0;
  const slewY = 3.4;

  /* ---- feststehender Unterwagen samt Abstützung ---- */
  const pads = new THREE.InstancedMesh(GEO.box, MAT.steelDark, 4);
  const d = new THREE.Object3D();
  [[m.outL / 2, m.outW / 2], [m.outL / 2, -m.outW / 2],
   [-m.outL / 2, m.outW / 2], [-m.outL / 2, -m.outW / 2]].forEach(function (pp, i) {
    d.position.set(pp[0], 0.25, pp[1]);
    d.scale.set(2.2, 0.5, 2.2);
    d.rotation.set(0, 0, 0);
    d.updateMatrix();
    pads.setMatrixAt(i, d.matrix);
  });
  pads.instanceMatrix.needsUpdate = true;
  pads.castShadow = true; pads.receiveShadow = true;
  g.add(pads);

  g.add(new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3( m.outL / 2, 0.12,  m.outW / 2),
      new THREE.Vector3( m.outL / 2, 0.12, -m.outW / 2),
      new THREE.Vector3(-m.outL / 2, 0.12, -m.outW / 2),
      new THREE.Vector3(-m.outL / 2, 0.12,  m.outW / 2)
    ]),
    MAT.radiusMax
  ));

  const chassis = new THREE.Mesh(GEO.box, MAT.craneYellow);
  chassis.scale.set(chassisL, 1.5, chassisW);
  chassis.position.set(0, 1.75, 0);
  chassis.castShadow = true;
  g.add(chassis);

  // Echte Achszahl aus der Modellbezeichnung (m.axles), nicht mehr aus
  // chassisL geschätzt - die Schätzformel lag bei den großen Modellen
  // daneben (z. B. 1750-9.1 kam als 6-achsig statt 9-achsig heraus).
  const axles = m.axles || Math.max(2, Math.round(m.chassisL / 3.2));
  const wheels = new THREE.InstancedMesh(GEO.cyl, MAT.rubber, axles * 2);
  let wi = 0;
  for (let a = 0; a < axles; a++) {
    const wx = -chassisL / 2 + 2.0 + a * ((chassisL - 4.0) / (axles - 1));
    [1, -1].forEach(function (side) {
      d.position.set(wx, 0.85, side * (chassisW / 2 + 0.1));
      d.rotation.set(Math.PI / 2, 0, 0);
      d.scale.set(1.7, 0.7, 1.7);
      d.updateMatrix();
      wheels.setMatrixAt(wi++, d.matrix);
    });
  }
  wheels.instanceMatrix.needsUpdate = true;
  wheels.castShadow = true;
  g.add(wheels);

  const driverCab = new THREE.Mesh(GEO.box, MAT.glass);
  driverCab.scale.set(2.8, 1.8, 2.8);
  driverCab.position.set(chassisL / 2 - 1.8, 3.4, 0);
  driverCab.castShadow = true;
  g.add(driverCab);

  /* ---- drehbarer Oberwagen ---- */
  const slew = new THREE.Group();
  slew.name = 'slew';

  const upper = new THREE.Mesh(GEO.box, MAT.craneYellow);
  upper.scale.set(6.5, 2.2, 3.2);
  upper.position.set(slewX - 1.0, slewY + 0.3, 0);
  upper.castShadow = true;
  slew.add(upper);

  const ballast = new THREE.Mesh(GEO.box, MAT.steelDark);
  ballast.scale.set(3.0, 2.4, 5.2);
  ballast.position.set(slewX - 4.6, slewY + 0.6, 0);
  ballast.castShadow = true;
  slew.add(ballast);

  const opCab = new THREE.Mesh(GEO.box, MAT.glass);
  opCab.scale.set(2.4, 1.9, 1.6);
  opCab.position.set(slewX + 1.2, slewY + 1.0, 2.0);
  slew.add(opCab);

  // Ausleger vom Drehkranz zur Hakenposition
  const px = slewX, py = slewY + 1.6;
  const dx = R, dy = HH - py;
  const boomLen = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const boom = new THREE.Mesh(GEO.box, MAT.craneYellow);
  boom.scale.set(boomLen, 1.6, 1.5);
  boom.position.set(px + dx / 2, py + dy / 2, 0);
  boom.rotation.z = angle;
  boom.castShadow = true;
  slew.add(boom);

  slew.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(slewX + R, HH, 0),
      new THREE.Vector3(slewX + R, 1.5, 0)
    ]),
    MAT.hookLine
  ));

  const baseDeg = p.baseRot || 0;
  slew.rotation.y = ((p.rot || 0) - baseDeg) * Math.PI / 180;
  g.add(slew);

  /* ---- Arbeitsradius auf Hakenhöhe ---- */
  if (p.showRadius !== false) {
    const work = makeCircle(R, MAT.radiusWork, HH);
    work.position.x = slewX;
    g.add(work);
    const dl = dropLines(R, HH, 4);
    dl.position.x = slewX;
    g.add(dl);
  }

  g.userData.bbox = { w: R * 2, d: m.outW, h: HH };
  g.userData.selBox = { w: m.outL, d: m.outW, h: 5.5, cy: 2.75 };
  g.userData.boomLength = boomLen;
  g.userData.boomAngle = angle * 180 / Math.PI;
  g.userData.hookHeight = HH;
  g.userData.radius = R;
  g.userData.model = m;
  g.userData.slewDeg = p.rot || 0;
  g.userData.baseDeg = baseDeg;
  g.rotation.y = baseDeg * Math.PI / 180;
  return g;
}

/* ---------- Hilfsgeometrien ---------- */
function makeCircle(radius, material, y) {
  const pts = [];
  const seg = 72;
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, y || 0, Math.sin(a) * radius));
  }
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), material);
}

/* Senkrechte Hilfslinien vom Radiuskreis nach unten */
function dropLines(radius, y, count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const x = Math.cos(a) * radius, z = Math.sin(a) * radius;
    pts.push(new THREE.Vector3(x, y, z));
    pts.push(new THREE.Vector3(x, 0.2, z));
  }
  return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), MAT.radiusMax);
}

/* Baut eine sichtbar dicke Linie aus schmalen Boxen entlang der Segmente.
   LineBasicMaterial.linewidth wird von so gut wie jedem Browser ignoriert
   (WebGL/ANGLE-Beschränkung) – deshalb echte Geometrie statt linewidth.
   Jede Box dreht sich um die Hochachse und neigt sich (Reihenfolge Y, Z, X) mit
   der Steigung des Segments, damit beide Enden auf den Punkten liegen. */
function thickLine(points, width, material, closed) {
  const g = new THREE.Group();
  const n = closed ? points.length : points.length - 1;
  for (let i = 0; i < n; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const flat = Math.sqrt(dx * dx + dz * dz);
    if (flat < 1e-6) continue;
    const len = Math.sqrt(flat * flat + dy * dy);
    const seg = new THREE.Mesh(new THREE.BoxGeometry(len, width * 0.4, width), material);
    seg.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    seg.rotation.order = 'YZX';
    seg.rotation.y = -Math.atan2(dz, dx);
    seg.rotation.z = Math.atan2(dy, flat);
    g.add(seg);
  }
  return g;
}


/* =========================================================
   Baustein: Baustraße
   Der Nutzer setzt Stützpunkte; die Ecken werden mit dem
   gewünschten Mindestradius ausgerundet. Passt ein Radius
   nicht zwischen zwei Punkte, wird er dort so weit verkleinert
   wie nötig und das Ergebnis gemeldet.
   ========================================================= */
function defaultRoadParams() {
  // slope: einheitliche Längsneigung in % (null = aus Anfangs- und Endhöhe); sectionSlopes: eigene Neigung je Abschnitt
  // (Strecke zwischen zwei gesetzten Punkten), null = einheitlich
  return { points: [], width: 6.0, radius: 15, showEdge: true, slope: null, sectionSlopes: null, embank: 1, showSwept: false };
}

function dist2d(a, b) {
  const dx = a.x - b.x, dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/* Rundet die Ecken eines Polygonzugs aus */
function filletPath(pts, radius) {
  const n = pts.length;
  if (n < 2) return { path: pts.slice(), reduced: 0, minRadius: radius };
  if (n === 2) return { path: [pts[0], pts[1]], reduced: 0, minRadius: radius };

  const out = [{ x: pts[0].x, z: pts[0].z }];
  let reduced = 0;
  let minRadius = Infinity;

  for (let i = 1; i < n - 1; i++) {
    const A = pts[i - 1], B = pts[i], C = pts[i + 1];
    let v1x = A.x - B.x, v1z = A.z - B.z;
    let v2x = C.x - B.x, v2z = C.z - B.z;
    const l1 = Math.sqrt(v1x * v1x + v1z * v1z);
    const l2 = Math.sqrt(v2x * v2x + v2z * v2z);
    if (l1 < 1e-6 || l2 < 1e-6) continue;
    v1x /= l1; v1z /= l1; v2x /= l2; v2z /= l2;

    let cos = v1x * v2x + v1z * v2z;
    cos = Math.max(-1, Math.min(1, cos));
    const theta = Math.acos(cos);                 // Winkel zwischen den Schenkeln
    if (theta > Math.PI - 0.02 || theta < 0.02) { // nahezu gerade oder Kehrtwende
      out.push({ x: B.x, z: B.z });
      continue;
    }

    const half = theta / 2;
    let r = radius;
    let t = r / Math.tan(half);
    const maxT = Math.min(l1, l2) * 0.5;
    if (t > maxT) {
      t = maxT;
      r = t * Math.tan(half);
      reduced++;
    }
    if (r < minRadius) minRadius = r;

    const p1 = { x: B.x + v1x * t, z: B.z + v1z * t };
    const p2 = { x: B.x + v2x * t, z: B.z + v2z * t };

    let bx = v1x + v2x, bz = v1z + v2z;
    const bl = Math.sqrt(bx * bx + bz * bz);
    if (bl < 1e-9) { out.push({ x: B.x, z: B.z }); continue; }
    bx /= bl; bz /= bl;
    const d = r / Math.sin(half);
    const cx = B.x + bx * d, cz = B.z + bz * d;

    let a1 = Math.atan2(p1.z - cz, p1.x - cx);
    const a2 = Math.atan2(p2.z - cz, p2.x - cx);
    let da = a2 - a1;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;

    const steps = Math.max(2, Math.ceil(Math.abs(da) / 0.12));
    out.push(p1);
    for (let k = 1; k < steps; k++) {
      const a = a1 + da * k / steps;
      out.push({ x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r });
    }
    out.push(p2);
  }

  out.push({ x: pts[n - 1].x, z: pts[n - 1].z });
  return {
    path: out,
    reduced: reduced,
    minRadius: isFinite(minRadius) ? minRadius : radius
  };
}

/* Verdichtet den Weg, damit er dem Gelände folgen kann */
function densifyPath(path, step) {
  if (path.length < 2) return path.slice();
  const out = [path[0]];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i];
    const d = dist2d(a, b);
    const k = Math.max(1, Math.ceil(d / step));
    for (let j = 1; j <= k; j++) {
      out.push({ x: a.x + (b.x - a.x) * j / k, z: a.z + (b.z - a.z) * j / k });
    }
  }
  return out;
}

function pathLength(path) {
  let l = 0;
  for (let i = 1; i < path.length; i++) l += dist2d(path[i - 1], path[i]);
  return l;
}

/* ---------- Längsneigung, Böschung, Auftrag/Abtrag ----------
   Die Straße hat eine konstante Längsneigung (in %, positiv = steigt vom
   ersten zum letzten Punkt) und keine Querneigung. Sie beginnt auf der
   Geländehöhe des ersten Punkts; liegt die Fahrbahn über oder unter dem
   Gelände, schließt eine Böschung (1:1, 1:1,5 oder 1:2 - Höhe zu Breite,
   Standard 1:1 = 45°) vom Fahrbahnrand bis zum Gelände an - Auftrag, wenn
   die Straße darüber liegt, Abtrag darunter.
   Die Mengen sind das Mittel der Querschnittsflächen mal Abstand
   (Mittelflächenverfahren); in engen Kurven weicht der Innenrand davon ab. */
const ROAD_SLOPE_MAX = 30;      // einstellbare Längsneigung, ± Prozent
const EMBANKMENT_CHOICES = [1, 1.5, 2];   // Böschung 1:n: n m Breite je 1 m Höhe
function embankmentOf(p) {
  const n = p && p.embank;
  return (typeof n === 'number' && isFinite(n) && n > 0) ? n : 1;
}
const EMBANKMENT_REACH = 80;    // weiter sucht die Böschung nicht nach dem Gelände
const EMBANKMENT_STEP = 0.5;    // Suchschritt quer zur Straße
const ROAD_LIFT = 0.05;         // gegen Flimmern auf dem Gelände

function roadPathOf(p) {
  const fil = filletPath(p.points || [], Math.max(p.radius || 15, 1));
  return { fil: fil, path: densifyPath(fil.path, 2.5) };
}

/* Stationierung samt Querrichtung je Punkt des Wegs */
function roadFrames(path) {
  const out = [];
  let s = 0;
  for (let i = 0; i < path.length; i++) {
    if (i > 0) s += dist2d(path[i - 1], path[i]);
    const prev = path[Math.max(i - 1, 0)];
    const next = path[Math.min(i + 1, path.length - 1)];
    let tx = next.x - prev.x, tz = next.z - prev.z;
    const tl = Math.sqrt(tx * tx + tz * tz) || 1;
    tx /= tl; tz /= tl;
    out.push({ x: path[i].x, z: path[i].z, nx: -tz, nz: tx, s: s });
  }
  return out;
}

/* Neigung, mit der die Straße Anfangs- und Endpunkt auf dem Gelände verbindet */
function autoRoadSlope(p) {
  if (!p || !p.points || p.points.length < 2) return 0;
  const path = roadPathOf(p).path;
  const L = pathLength(path);
  if (!(L > 0.5)) return 0;
  const a = path[0], b = path[path.length - 1];
  const pct = (getHeightAt(b.x, b.z) - getHeightAt(a.x, a.z)) / L * 100;
  return Math.round(Math.max(-ROAD_SLOPE_MAX, Math.min(ROAD_SLOPE_MAX, pct)) * 10) / 10;
}

/* ---------- Abschnitte (Achslinie) ----------
   Ein Abschnitt ist die Strecke zwischen zwei gesetzten Punkten, gemessen entlang der ausgerundeten Straßenmitte. Jeder
   Abschnitt hat eine eigene Längsneigung; sind alle gleich, gilt die einheitliche params.slope. */

function isNum(v) { return typeof v === 'number' && isFinite(v); }

/* Eigene Neigungen je Abschnitt, falls gesetzt und passend zur Punktzahl, sonst null */
function roadOwnSlopes(p) {
  const n = Math.max(0, ((p && p.points) || []).length - 1);
  const a = p && p.sectionSlopes;
  return (Array.isArray(a) && a.length === n && n > 0 && a.every(isNum)) ? a : null;
}

/* Neigung je Abschnitt in % (immer n Werte) */
function roadSlopeList(p) {
  const n = Math.max(0, ((p && p.points) || []).length - 1);
  const own = roadOwnSlopes(p);
  if (own) return own.slice();
  const s = isNum(p && p.slope) ? p.slope : autoRoadSlope(p);
  const out = [];
  for (let i = 0; i < n; i++) out.push(s);
  return out;
}

/* Sind die Neigungen der Abschnitte verschieden? (Anzeige "variabel") */
function roadSlopeVariable(p) {
  const own = roadOwnSlopes(p);
  if (!own) return false;
  return own.some(function (v) { return Math.abs(v - own[0]) > 0.0005; });
}

/* Neigung eines Abschnitts setzen. Sind danach alle gleich, bleibt eine einheitliche Neigung. */
function setRoadSectionSlope(obj, index, value) {
  if (!obj || obj.type !== 'road') return false;
  const p = obj.params, n = (p.points || []).length - 1;
  if (index < 0 || index >= n || !isNum(value)) return false;
  const v = Math.round(Math.max(-ROAD_SLOPE_MAX, Math.min(ROAD_SLOPE_MAX, value)) * 100) / 100;
  const list = roadSlopeList(p);
  list[index] = v;
  if (list.every(function (x) { return Math.abs(x - list[0]) < 0.0005; })) {
    p.slope = list[0];
    p.sectionSlopes = null;
  } else {
    p.sectionSlopes = list;
    p.slope = null;
  }
  rebuildObject(obj);
  return true;
}

/* Einheitliche Neigung für alle Abschnitte (der Regler im Eigenschaftsfenster) */
function setRoadUniformSlope(obj, value) {
  if (!obj || obj.type !== 'road' || !isNum(value)) return false;
  obj.params.slope = Math.max(-ROAD_SLOPE_MAX, Math.min(ROAD_SLOPE_MAX, value));
  obj.params.sectionSlopes = null;
  rebuildObject(obj);
  return true;
}

/* Nach Änderungen an den Punkten: einheitliche Neigung wie bisher aus Anfangs- und Endhöhe neu bestimmen. Eigene
   Neigungen je Abschnitt bleiben stehen, solange die Punktzahl gleich ist (verschieben); sonst fallen sie weg. */
function resetRoadSlope(obj) {
  if (!obj || obj.type !== 'road') return;
  if (!roadOwnSlopes(obj.params)) {
    obj.params.sectionSlopes = null;
    obj.params.slope = autoRoadSlope(obj.params);
  }
}

/* Station (Weglänge ab Anfang) des Wegpunkts, der dem Punkt q am nächsten liegt */
function stationNear(frames, q) {
  let best = Infinity, st = 0;
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1], b = frames[i];
    const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz;
    if (l2 < 1e-12) continue;
    const t = Math.max(0, Math.min(1, ((q.x - a.x) * dx + (q.z - a.z) * dz) / l2));
    const ex = q.x - (a.x + dx * t), ez = q.z - (a.z + dz * t);
    const d = ex * ex + ez * ez;
    if (d < best) { best = d; st = a.s + t * (b.s - a.s); }
  }
  return st;
}

/* Stationen der gesetzten Punkte entlang der Straßenmitte (nicht abnehmend, erster 0, letzter = Länge) */
function nodeStations(pts, frames) {
  const L = frames.length ? frames[frames.length - 1].s : 0;
  const out = pts.map(function (q, i) {
    if (i === 0) return 0;
    if (i === pts.length - 1) return L;
    return stationNear(frames, q);
  });
  for (let i = 1; i < out.length; i++) if (out[i] < out[i - 1]) out[i] = out[i - 1];
  return out;
}

/* Punkt der Straßenmitte bei Station s */
function pointAtStation(frames, s) {
  if (!frames.length) return { x: 0, z: 0 };
  if (s <= 0) return { x: frames[0].x, z: frames[0].z };
  for (let i = 1; i < frames.length; i++) {
    if (s <= frames[i].s || i === frames.length - 1) {
      const a = frames[i - 1], b = frames[i], l = b.s - a.s;
      const t = l > 1e-9 ? Math.max(0, Math.min(1, (s - a.s) / l)) : 0;
      return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
    }
  }
  return { x: frames[frames.length - 1].x, z: frames[frames.length - 1].z };
}

/* Länge des Abschnitts i entlang der Straßenmitte (m), ohne Mesh-Aufbau */
function roadSectionLength(p, i) {
  const pts = p.points || [];
  if (i < 0 || i >= pts.length - 1) return 0;
  const fr = roadFrames(roadPathOf(p).path);
  const st = nodeStations(pts, fr);
  return st[i + 1] - st[i];
}

/* Länge des Abschnitts i ändern: der Endpunkt wandert in Richtung der Strecke, alle folgenden Punkte wandern
   um dasselbe Stück mit, damit ihre Lage zueinander bleibt. Die Länge zählt entlang der ausgerundeten
   Straßenmitte, deshalb wird sie in wenigen Schritten angenähert. */
function setRoadSectionLength(obj, index, target) {
  if (!obj || obj.type !== 'road' || !isNum(target)) return false;
  const pts = obj.params.points || [];
  if (index < 0 || index >= pts.length - 1) return false;
  const a = pts[index], b = pts[index + 1];
  let dx = b.x - a.x, dz = b.z - a.z;
  const d0 = Math.hypot(dx, dz);
  if (d0 < 1e-6) return false;
  dx /= d0; dz /= d0;
  const want = Math.max(1, Math.min(20000, target));
  let moved = 0;
  for (let k = 0; k < 8; k++) {
    const cur = roadSectionLength(obj.params, index);
    const err = want - cur;
    if (Math.abs(err) < 0.005) break;
    const step = Math.max(err, -(d0 + moved) + 0.5);     // der Endpunkt darf nicht hinter den Anfang rutschen
    for (let j = index + 1; j < pts.length; j++) pts[j] = { x: pts[j].x + dx * step, z: pts[j].z + dz * step };
    moved += step;
  }
  const c = roadCentroid(pts);
  obj.x = c.x; obj.z = c.z;
  resetRoadSlope(obj);
  rebuildObject(obj);
  return true;
}

/* Böschung einer Seite: sucht vom Fahrbahnrand nach außen den ersten
   Schnitt der 1:n-Linie mit dem Gelände (n m Breite je 1 m Höhe). */
function embankmentSide(f, sign, hr, half, n) {
  const ex = f.x + sign * f.nx * half, ez = f.z + sign * f.nz * half;
  const diff0 = hr - getHeightAt(ex, ez);
  const side = { type: 'none', ex: ex, ez: ez, ox: ex, oz: ez, oh: hr, reach: 0, area: 0, reached: true };
  if (Math.abs(diff0) < 0.01) return side;

  const fill = diff0 > 0;
  const dir = fill ? -1 : 1;                       // Auftrag fällt, Abtrag steigt nach außen
  side.type = fill ? 'fill' : 'cut';
  let prevD = 0, prevDiff = diff0, area = 0;
  side.reached = false;
  for (let d = EMBANKMENT_STEP; d <= EMBANKMENT_REACH + 1e-9; d += EMBANKMENT_STEP) {
    const qx = ex + sign * f.nx * d, qz = ez + sign * f.nz * d;
    const hs = hr + dir * d / n;
    const diff = hs - getHeightAt(qx, qz);
    const crossed = fill ? diff <= 0 : diff >= 0;
    if (crossed) {
      const t = prevDiff / (prevDiff - diff);      // Schnittpunkt im Schritt, linear
      const dEnd = prevD + t * (d - prevD);
      area += 0.5 * Math.abs(prevDiff) * (dEnd - prevD);
      side.reach = dEnd;
      side.reached = true;
      break;
    }
    area += 0.5 * (Math.abs(prevDiff) + Math.abs(diff)) * (d - prevD);
    prevD = d; prevDiff = diff;
    side.reach = d;
  }
  side.area = area;
  side.ox = ex + sign * f.nx * side.reach;
  side.oz = ez + sign * f.nz * side.reach;
  side.oh = hr + dir * side.reach / n;
  return side;
}

/* Alles Geometrische einer Baustraße in einem Durchgang: Fahrbahnhöhen,
   Böschungen und Mengen. */
function computeRoad(p) {
  const width = Math.max(p.width, 1), half = width / 2;
  const rp = roadPathOf(p);
  const frames = roadFrames(rp.path);
  const length = frames.length ? frames[frames.length - 1].s : 0;
  const h0 = getHeightAt(rp.path[0].x, rp.path[0].z);
  const embN = embankmentOf(p);

  // Höhenverlauf: zwischen den gesetzten Punkten linear, mit der Neigung des jeweiligen Abschnitts
  const slopes = roadSlopeList(p);
  const stations = nodeStations(p.points || [], frames);
  const nodeH = [h0];
  for (let i = 0; i < slopes.length; i++) nodeH.push(nodeH[i] + slopes[i] / 100 * (stations[i + 1] - stations[i]));
  function heightAtStation(s) {
    for (let i = 0; i < slopes.length; i++) {
      if (s <= stations[i + 1] || i === slopes.length - 1) return nodeH[i] + slopes[i] / 100 * (s - stations[i]);
    }
    return h0;
  }
  const variable = roadSlopeVariable(p);
  const slope = variable ? (length > 0.5 ? (nodeH[nodeH.length - 1] - h0) / length * 100 : 0)
                         : (slopes.length ? slopes[0] : (isNum(p.slope) ? p.slope : autoRoadSlope(p)));

  const sections = frames.map(function (f) {
    const hr = heightAtStation(f.s);
    const left = embankmentSide(f, 1, hr, half, embN);
    const right = embankmentSide(f, -1, hr, half, embN);

    // Fahrbahnstreifen: Über-/Unterschuss gegenüber dem Gelände quer abtasten
    const n = Math.max(2, Math.ceil(width / 0.5));
    let roadFill = 0, roadCut = 0, prev = null;
    for (let j = 0; j <= n; j++) {
      const u = -half + width * j / n;
      const diff = hr - getHeightAt(f.x + f.nx * u, f.z + f.nz * u);
      if (prev !== null) {
        roadFill += 0.5 * (Math.max(prev, 0) + Math.max(diff, 0)) * (width / n);
        roadCut += 0.5 * (Math.max(-prev, 0) + Math.max(-diff, 0)) * (width / n);
      }
      prev = diff;
    }
    const fillArea = roadFill + (left.type === 'fill' ? left.area : 0) + (right.type === 'fill' ? right.area : 0);
    const cutArea = roadCut + (left.type === 'cut' ? left.area : 0) + (right.type === 'cut' ? right.area : 0);
    return { f: f, hr: hr, left: left, right: right, fillArea: fillArea, cutArea: cutArea };
  });

  let fill = 0, cut = 0, maxReach = 0, unreached = 0;
  for (let i = 0; i < sections.length; i++) {
    [sections[i].left, sections[i].right].forEach(function (sd) {
      if (sd.reach > maxReach) maxReach = sd.reach;
      if (!sd.reached) unreached++;
    });
    if (i === 0) continue;
    const ds = sections[i].f.s - sections[i - 1].f.s;
    fill += 0.5 * (sections[i].fillArea + sections[i - 1].fillArea) * ds;
    cut += 0.5 * (sections[i].cutArea + sections[i - 1].cutArea) * ds;
  }

  return {
    fil: rp.fil, path: rp.path, width: width, half: half, length: length,
    area: length * width, slope: slope, h0: h0, sections: sections,
    slopes: slopes, slopeVariable: variable, stations: stations,
    parts: slopes.map(function (sl, i) {
      const sm = (stations[i] + stations[i + 1]) / 2, m = pointAtStation(frames, sm);
      return { i: i, s0: stations[i], s1: stations[i + 1], len: stations[i + 1] - stations[i], slope: sl,
               x: m.x, z: m.z, y: heightAtStation(sm) + ROAD_LIFT };
    }),
    earthworks: { fill: fill, cut: cut, maxReach: maxReach, unreached: unreached, embank: embN }
  };
}

/* Schleppkurve als blaue Fläche mit Rand über der Straße (ohne Tiefentest). Wo der
   Rand weiter als die halbe Fahrbahnbreite von der Straßenmitte entfernt ist, wird
   er rot. Nur Darstellung - der Prüfwert kommt aus checkSemiTruck. */
function addSweptOverlay(g, secs, chk) {
  const loops = sweptOutlines(chk.sweep, 0.1, 0.04);
  if (!loops.length || !secs.length) return;
  const half = chk.width / 2;
  function hr(x, z) {
    let best = Infinity, h = secs[0].hr;
    for (let i = 0; i < secs.length; i++) {
      const dx = secs[i].f.x - x, dz = secs[i].f.z - z, d = dx * dx + dz * dz;
      if (d < best) { best = d; h = secs[i].hr; }
    }
    return h + ROAD_LIFT + 0.12;
  }
  let main = loops[0], mainArea = 0;
  loops.forEach(function (lp) {
    const a = Math.abs(signedArea(lp));
    if (a > mainArea) { mainArea = a; main = lp; }
  });
  const fillPts = simplifyLoop(main, 0.15);
  const tri = triangulatePolygon(fillPts);
  if (tri.length) {
    const pos = [], idx = [];
    fillPts.forEach(function (q) { pos.push(q.x, hr(q.x, q.z), q.z); });
    tri.forEach(function (t) { idx.push(t[0], t[1], t[2]); });
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    fg.setIndex(idx);
    const fm = new THREE.Mesh(fg, MAT.sweptFill);
    fm.renderOrder = 8;
    fm.userData.kind = 'sweptFill';
    g.add(fm);
  }
  // Rand als flaches Band (0,3 m breit), damit er in jedem Abstand zu sehen ist
  const BAND = 0.3;
  const okPos = [], okIdx = [], badPos = [], badIdx = [];
  loops.forEach(function (lp) {
    for (let i = 0; i < lp.length; i++) {
      const a = lp[i], b = lp[(i + 1) % lp.length];
      const dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz);
      if (l < 1e-6) continue;
      const nx = -dz / l * BAND / 2, nz = dx / l * BAND / 2;
      const bad = Math.abs(lateralOffsetOnPath(chk.path, [a.x, a.z])) > half + 0.02 ||
                  Math.abs(lateralOffsetOnPath(chk.path, [b.x, b.z])) > half + 0.02;
      const pos = bad ? badPos : okPos, idx = bad ? badIdx : okIdx;
      const base = pos.length / 3, ya = hr(a.x, a.z) + 0.03, yb = hr(b.x, b.z) + 0.03;
      pos.push(a.x + nx, ya, a.z + nz, a.x - nx, ya, a.z - nz, b.x + nx, yb, b.z + nz, b.x - nx, yb, b.z - nz);
      idx.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
  });
  [[okPos, okIdx, MAT.sweptLine, 'sweptLine'], [badPos, badIdx, MAT.sweptOver, 'sweptOver']].forEach(function (e) {
    if (!e[1].length) return;
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(e[0]), 3));
    bg.setIndex(e[1]);
    const bm = new THREE.Mesh(bg, e[2]);
    bm.renderOrder = 9;
    bm.userData.kind = e[3];
    g.add(bm);
  });
}

/* Im Abtrag liegen Böschung und Fahrbahn unter dem Gelände und wären nicht
   zu sehen. Deshalb zusätzlich: Böschung und eingegrabene Fahrbahn als
   halbtransparente Fläche ohne Tiefentest über dem Gelände, dazu eine helle
   Linie an der Böschungsoberkante (dort, wo die Böschungslinie das Gelände
   schneidet). Das ist eine Darstellungshilfe - die Mengen bleiben unberührt. */
function addCutOverlay(g, secs, ePos, cutIdx) {
  if (cutIdx.length) {
    const og = new THREE.BufferGeometry();
    og.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ePos), 3));
    og.setIndex(cutIdx);
    const om = new THREE.Mesh(og, MAT.cutOverlay);
    om.renderOrder = 6;
    om.userData.kind = 'cutOverlay';
    g.add(om);
  }

  // Fahrbahnstücke, bei denen das Gelände in der Mitte über der Fahrbahn liegt
  const buried = secs.map(function (sc) {
    return getHeightAt(sc.f.x, sc.f.z) > sc.hr + ROAD_LIFT;
  });
  const rPos = [], rIdx = [];
  secs.forEach(function (sc, i) {
    rPos.push(sc.left.ex, sc.hr + ROAD_LIFT, sc.left.ez, sc.right.ex, sc.hr + ROAD_LIFT, sc.right.ez);
    if (i > 0 && buried[i] && buried[i - 1]) {
      const a = (i - 1) * 2, b = a + 1, c = i * 2, d = c + 1;
      rIdx.push(a, c, b, b, c, d);
    }
  });
  if (rIdx.length) {
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rPos), 3));
    rg.setIndex(rIdx);
    const rm = new THREE.Mesh(rg, MAT.roadOverlay);
    rm.renderOrder = 6;
    rm.userData.kind = 'roadOverlay';
    g.add(rm);
  }

  const seg = [];
  ['left', 'right'].forEach(function (side) {
    for (let i = 1; i < secs.length; i++) {
      const a = secs[i - 1][side], b = secs[i][side];
      if (a.type !== 'cut' || b.type !== 'cut') continue;
      seg.push(new THREE.Vector3(a.ox, a.oh + 0.1, a.oz), new THREE.Vector3(b.ox, b.oh + 0.1, b.oz));
    }
  });
  if (seg.length) {
    const lg = new THREE.BufferGeometry().setFromPoints(seg);
    const lm = new THREE.LineSegments(lg, MAT.cutCrest);
    lm.renderOrder = 7;
    lm.userData.kind = 'cutCrest';
    g.add(lm);
  }
}

/* Achslinie: gestrichelte Mittellinie der Straße mit Querstrichen an den gesetzten Punkten. Nur Darstellung,
   wird nicht in die IFC-Datei geschrieben. */
const AXIS_DASH = 2.4, AXIS_GAP = 1.6, AXIS_WIDTH = 0.25;

function addRoadAxis(g, rd) {
  const secs = rd.sections;
  if (secs.length < 2 || !(rd.length > 0.5)) return;
  function at(s) {
    for (let i = 1; i < secs.length; i++) {
      if (s <= secs[i].f.s || i === secs.length - 1) {
        const a = secs[i - 1], b = secs[i], l = b.f.s - a.f.s;
        const t = l > 1e-9 ? Math.max(0, Math.min(1, (s - a.f.s) / l)) : 0;
        return { x: a.f.x + (b.f.x - a.f.x) * t, z: a.f.z + (b.f.z - a.f.z) * t,
                 y: a.hr + (b.hr - a.hr) * t + ROAD_LIFT + 0.06, nx: b.f.nx, nz: b.f.nz };
      }
    }
    return null;
  }
  const lines = new THREE.Group();
  function add(a, b, w) {
    const piece = thickLine([new THREE.Vector3(a.x, a.y, a.z), new THREE.Vector3(b.x, b.y, b.z)], w, MAT.roadAxis, false);
    piece.children.forEach(function (m) { m.userData.kind = 'roadAxis'; });
    lines.add(piece);
  }
  for (let s = 0; s < rd.length; s += AXIS_DASH + AXIS_GAP) {
    add(at(s), at(Math.min(s + AXIS_DASH, rd.length)), AXIS_WIDTH);
  }
  // Querstriche an den gesetzten Punkten (Anfang, Ende und dazwischen)
  rd.stations.forEach(function (st) {
    const c = at(st), h = Math.min(rd.half, 1.2);
    add({ x: c.x - c.nx * h, y: c.y, z: c.z - c.nz * h }, { x: c.x + c.nx * h, y: c.y, z: c.z + c.nz * h }, AXIS_WIDTH);
  });
  lines.userData.kind = 'roadAxis';
  g.add(lines);
}

function buildRoad(p) {
  const g = new THREE.Group();
  const pts = p.points || [];

  if (pts.length < 2) {
    g.userData.bbox = { w: 4, d: 4, h: 1 };
    g.userData.selBox = { w: 4, d: 4, h: 1, cy: 0.5, cx: 0, cz: 0 };
    g.userData.length = 0;
    g.userData.reduced = 0;
    return g;
  }

  const rd = computeRoad(p);
  const secs = rd.sections;

  // Fahrbahn: flach quer, Höhe aus der konstanten Längsneigung
  const pos = [], idx = [];
  secs.forEach(function (sc, i) {
    pos.push(sc.left.ex, sc.hr + ROAD_LIFT, sc.left.ez);
    pos.push(sc.right.ex, sc.hr + ROAD_LIFT, sc.right.ez);
    if (i > 0) {
      const a = (i - 1) * 2, b = a + 1, c = i * 2, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, MAT.road);
  mesh.receiveShadow = true;
  g.add(mesh);

  // Böschungen: je Seite ein Band vom Fahrbahnrand zur Geländekante, getrennt
  // nach Auftrag und Abtrag (zwei Materialien)
  const ePos = [], fillIdx = [], cutIdx = [];
  [['left', 1], ['right', -1]].forEach(function (sideDef) {
    const base = ePos.length / 3;
    secs.forEach(function (sc, i) {
      const sd = sc[sideDef[0]];
      ePos.push(sd.ex, sc.hr + ROAD_LIFT, sd.ez);
      ePos.push(sd.ox, sd.oh + 0.02, sd.oz);
      if (i === 0) return;
      const prev = secs[i - 1][sideDef[0]];
      const type = sd.type !== 'none' ? sd.type : prev.type;
      if (type === 'none') return;
      const a = base + (i - 1) * 2, b = a + 1, c = base + i * 2, d = c + 1;
      (type === 'fill' ? fillIdx : cutIdx).push(a, c, b, b, c, d);
    });
  });
  [[fillIdx, MAT.roadFill], [cutIdx, MAT.roadCut]].forEach(function (e) {
    if (!e[0].length) return;
    const eg = new THREE.BufferGeometry();
    eg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ePos), 3));
    eg.setIndex(e[0]);
    eg.computeVertexNormals();
    const em = new THREE.Mesh(eg, e[1]);
    em.receiveShadow = true;
    g.add(em);
  });

  addCutOverlay(g, secs, ePos, cutIdx);

  // Schleppkurve des Sattelzugs (nur auf Wunsch)
  if (p.showSwept) {
    const chk = checkSemiTruck(rd.path, rd.width);
    if (chk) {
      addSweptOverlay(g, secs, chk);
      g.userData.swept = { need: chk.need, left: chk.left, right: chk.right, width: chk.width,
                           over: chk.over, fits: chk.fits, vehicle: chk.vehicle.name, source: chk.vehicle.source };
    }
  }

  if (p.showEdge !== false) {
    const left = [], right = [];
    secs.forEach(function (sc) {
      left.push(new THREE.Vector3(sc.left.ex, sc.hr + ROAD_LIFT + 0.02, sc.left.ez));
      right.push(new THREE.Vector3(sc.right.ex, sc.hr + ROAD_LIFT + 0.02, sc.right.ez));
    });
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(left), MAT.roadEdge));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(right), MAT.roadEdge));
  }

  addRoadAxis(g, rd);

  let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity;
  rd.path.forEach(function (q) {
    if (q.x < minx) minx = q.x;
    if (q.x > maxx) maxx = q.x;
    if (q.z < minz) minz = q.z;
    if (q.z > maxz) maxz = q.z;
  });
  const margin = rd.half + rd.earthworks.maxReach;

  g.userData.bbox = { w: maxx - minx + margin * 2, d: maxz - minz + margin * 2, h: 1 };
  g.userData.selBox = {
    w: maxx - minx + margin * 2 + 2, d: maxz - minz + margin * 2 + 2, h: 2,
    cy: 1, cx: (minx + maxx) / 2, cz: (minz + maxz) / 2
  };
  g.userData.length = rd.length;
  g.userData.area = rd.area;
  g.userData.slope = rd.slope;
  g.userData.slopeVariable = rd.slopeVariable;
  g.userData.parts = rd.parts;
  g.userData.earthworks = rd.earthworks;
  g.userData.reduced = rd.fil.reduced;
  g.userData.minRadius = rd.fil.minRadius;
  g.userData.path = rd.path;
  return g;
}

/* Kennzahlen einer Baustraße ohne Mesh-Aufbau. Auftrag/Abtrag stehen nach
   dem Aufbau in group.userData.earthworks (computeRoad ist dafür zu teuer). */
function roadInfo(p) {
  const pts = (p && p.points) || [];
  if (pts.length < 2) return { length: 0, area: 0, minRadius: (p && p.radius) || 0, reduced: 0 };
  const rp = roadPathOf(p);
  const length = pathLength(rp.path);
  return {
    length: length, area: length * Math.max(p.width || 0, 1),
    minRadius: rp.fil.minRadius, reduced: rp.fil.reduced
  };
}

/* =========================================================
   Schleppkurve Sattelzug
   Einspurmodell: die Mitte der Vorderachse folgt der Straßenmitte (Leitlinie),
   die Hinterachse der Zugmaschine und die Ersatzachse des Aufliegers laufen
   ohne Querschlupf nach. Zugmaschine und Auflieger sind Rechtecke; überstrichen
   wird, was sie dabei zusammen belegen.
   Fahrzeug: Sattelzug 16,50 m, Breite 2,55 m, ohne Sicherheitszuschlag. Die Maße stammen aus dem Export
   "Sattelzug 16,5" von Autodesk Vehicle Tracking (V26.00, Entwurfsgeschwindigkeit 5 km/h): Stoßfänger bis
   Vorderachse 1,43 m, Radstand 3,95 m, Sattelzapfen 4,65 m hinter dem Stoßfänger (also 0,73 m vor der
   Hinterachse), Zugmaschine 6,20 m lang, Auflieger 13,59 m lang und 1,74 m vor dem Sattelzapfen beginnend,
   drei starre Achsen 6,20 / 7,60 / 9,00 m hinter dem Sattelzapfen, Heck 2,85 m hinter der letzten Achse.
   Die drei Achsen des Aufliegers sind durch eine Ersatzachse in ihrer Mitte (7,60 m hinter dem Sattelzapfen)
   ersetzt. Das trifft die Wenderadien der Vorlage: äußere Karosserie 12,5 m, äußeres Rad 11,962 m und inneres
   Rad 5,277 m bei Hinterachse auf 10,0 m (hier 12,50 / 11,955 / 5,265), bei Vollausschlag äußeres Rad 7,028 m
   und Wand zu Wand 7,9 m. Nicht übernommen sind der Lenkeinschlag und der Knickwinkel (Vorlage: 90 Grad). Beim
   Einlenken schwingt das Heck in der Vorlage weiter nach außen aus als hier (0,42 m gegen 0,30 m bei R = 10 m).
   ========================================================= */
const SEMI_TRUCK = {
  name: 'Sattelzug 16,50 m',
  source: 'Autodesk Vehicle Tracking, Sattelzug 16,5 m',
  width: 2.55,            // Fahrzeugbreite
  front: 1.43,            // Stoßfänger bis Vorderachse
  wheelbase: 3.95,        // Radstand der Zugmaschine
  tailTractor: 0.82,      // Hinterachse bis Ende des Zugmaschinenrahmens
  kingpinAhead: 0.73,     // Sattelzapfen liegt so weit vor der Hinterachse
  kingpinToAxle: 7.60,    // Sattelzapfen bis Ersatzachse (Mitte der drei Achsen) des Aufliegers
  kingpinToFront: 1.74,   // Sattelzapfen bis Vorderkante des Aufliegers
  axleToRear: 4.25        // Ersatzachse bis Heck (letzte Achse 1,40 m dahinter, dann 2,85 m)
};
const SWEPT_STEP = 0.25;      // Schritt der Vorderachse in m
const SWEPT_RUN = 25;         // gerade Anfahrt vor dem ersten Punkt in m

/* Länge des Fahrzeugs von Stoßfänger bis Heck */
function semiTruckLength(v) {
  v = v || SEMI_TRUCK;
  return v.front + v.wheelbase - v.kingpinAhead + v.kingpinToAxle + v.axleToRear;
}

function sweptRect(p, u, ahead, behind, w) {
  const nx = -u[1], nz = u[0], h = w / 2;
  function P(s, q) { return [p[0] + u[0] * s + nx * q, p[1] + u[1] * s + nz * q]; }
  return [P(ahead, h), P(ahead, -h), P(-behind, -h), P(-behind, h)];
}

/* Fährt den Sattelzug mit der Vorderachse an `path` (Punkte {x,z}) entlang, mit
   gerader Anfahrt davor und Auslauf danach. Liefert je Schritt die Rechtecke von
   Zugmaschine (tr) und Auflieger (tl) sowie Hinterachse r, Sattelzapfen k und
   Ersatzachse t des Aufliegers. Jeder `keep`-te Schritt wird behalten. */
function sweepSemiTruck(path, veh, keep) {
  const v = veh || SEMI_TRUCK;
  keep = keep || 2;
  if (!path || path.length < 2) return null;
  const total = pathLength(path);
  if (!(total > 0.5)) return null;
  // Richtung am Anfang und am Ende des Wegs
  let a = path[0], b = path[1];
  for (let i = 1; i < path.length; i++) { b = path[i]; if (dist2d(a, b) > 0.05) break; }
  let l0 = dist2d(a, b) || 1;
  const d0 = [(b.x - a.x) / l0, (b.z - a.z) / l0];
  a = path[path.length - 2]; b = path[path.length - 1];
  for (let i = path.length - 2; i >= 0; i--) { a = path[i]; if (dist2d(a, b) > 0.05) break; }
  l0 = dist2d(a, b) || 1;
  const d1 = [(b.x - a.x) / l0, (b.z - a.z) / l0];
  const run = SWEPT_RUN, out = semiTruckLength(v) + 2;
  const P = [{ x: path[0].x - d0[0] * run, z: path[0].z - d0[1] * run }].concat(path);
  P.push({ x: b.x + d1[0] * out, z: b.z + d1[1] * out });

  // gleichmäßig verteilte Punkte der Vorderachse
  const Q = [[P[0].x, P[0].z, -run]];
  let need = SWEPT_STEP, base = -run;
  for (let i = 1; i < P.length; i++) {
    const A = P[i - 1], B = P[i];
    const seg = dist2d(A, B);
    if (seg < 1e-9) continue;
    let pos = 0;
    while (need <= seg - pos) {
      pos += need;
      Q.push([A.x + (B.x - A.x) * pos / seg, A.z + (B.z - A.z) * pos / seg, base + pos]);
      need = SWEPT_STEP;
    }
    need -= seg - pos;
    base += seg;
  }

  const e = v.kingpinAhead;
  let f = [Q[0][0], Q[0][1]];
  let r = [f[0] - d0[0] * v.wheelbase, f[1] - d0[1] * v.wheelbase];
  let k = [r[0] + d0[0] * e, r[1] + d0[1] * e];
  let t = [k[0] - d0[0] * v.kingpinToAxle, k[1] - d0[1] * v.kingpinToAxle];
  const steps = [];
  const SUB = 5;       // Teilschritte je Schritt der Vorderachse: Nachlauf genauer rechnen
  let u = [d0[0], d0[1]], w = [d0[0], d0[1]];
  for (let i = 0; i < Q.length; i++) {
    const from = f.slice();
    for (let m = 1; m <= SUB; m++) {
      const nf = [from[0] + (Q[i][0] - from[0]) * m / SUB, from[1] + (Q[i][1] - from[1]) * m / SUB];
      u = [f[0] - r[0], f[1] - r[1]];
      let l = Math.hypot(u[0], u[1]); u = [u[0] / l, u[1] / l];
      const pr = (nf[0] - f[0]) * u[0] + (nf[1] - f[1]) * u[1];
      f = nf;
      r = [r[0] + pr * u[0], r[1] + pr * u[1]];
      u = [f[0] - r[0], f[1] - r[1]]; l = Math.hypot(u[0], u[1]); u = [u[0] / l, u[1] / l];
      r = [f[0] - u[0] * v.wheelbase, f[1] - u[1] * v.wheelbase];
      const kn = [r[0] + u[0] * e, r[1] + u[1] * e];
      w = [k[0] - t[0], k[1] - t[1]];
      let lw = Math.hypot(w[0], w[1]); w = [w[0] / lw, w[1] / lw];
      const pk = (kn[0] - k[0]) * w[0] + (kn[1] - k[1]) * w[1];
      k = kn;
      t = [t[0] + pk * w[0], t[1] + pk * w[1]];
      w = [k[0] - t[0], k[1] - t[1]]; lw = Math.hypot(w[0], w[1]); w = [w[0] / lw, w[1] / lw];
      t = [k[0] - w[0] * v.kingpinToAxle, k[1] - w[1] * v.kingpinToAxle];
    }
    if (i % keep === 0) {
      steps.push({
        s: Q[i][2], f: f.slice(), r: r.slice(), k: k.slice(), t: t.slice(),
        tr: sweptRect(f, u, v.front, v.wheelbase + v.tailTractor, v.width),
        tl: sweptRect(k, w, v.kingpinToFront, v.kingpinToAxle + v.axleToRear, v.width)
      });
    }
  }
  return { steps: steps, length: total, vehicle: v };
}

/* Abstand eines Punkts von der Straßenmitte, mit Vorzeichen (links = +, wie die
   linke Fahrbahnkante der Straße), gemessen am verlängerten Weg */
function lateralOffsetOnPath(P, q) {
  let best = Infinity, off = 0;
  for (let i = 1; i < P.length; i++) {
    const A = P[i - 1], B = P[i];
    const dx = B.x - A.x, dz = B.z - A.z;
    const l2 = dx * dx + dz * dz;
    if (l2 < 1e-12) continue;
    let t = ((q[0] - A.x) * dx + (q[1] - A.z) * dz) / l2;
    // erstes und letztes Stück gelten als unendlich lange Strahlen (gerade Verlängerung)
    if (i > 1) t = Math.max(0, t);
    if (i < P.length - 1) t = Math.min(1, t);
    const ex = q[0] - (A.x + dx * t), ez = q[1] - (A.z + dz * t);
    const d2 = ex * ex + ez * ez;
    if (d2 < best) {
      best = d2;
      off = Math.sqrt(d2) * ((-dz * ex + dx * ez) >= 0 ? 1 : -1);
    }
  }
  return off;
}

/* Der um gerade Anfahrt und Auslauf verlängerte Weg (wie in sweepSemiTruck) */
function extendedPath(path, veh) {
  const v = veh || SEMI_TRUCK;
  let a = path[0], b = path[1];
  for (let i = 1; i < path.length; i++) { b = path[i]; if (dist2d(a, b) > 0.05) break; }
  let l = dist2d(a, b) || 1;
  const d0 = [(b.x - a.x) / l, (b.z - a.z) / l];
  a = path[path.length - 2]; b = path[path.length - 1];
  for (let i = path.length - 2; i >= 0; i--) { a = path[i]; if (dist2d(a, b) > 0.05) break; }
  l = dist2d(a, b) || 1;
  const d1 = [(b.x - a.x) / l, (b.z - a.z) / l];
  const out = semiTruckLength(v) + 2;
  const P = [{ x: path[0].x - d0[0] * SWEPT_RUN, z: path[0].z - d0[1] * SWEPT_RUN }].concat(path);
  P.push({ x: b.x + d1[0] * out, z: b.z + d1[1] * out });
  return P;
}

/* Prüft eine Straße (Weg und Fahrbahnbreite): größte Abweichung des Fahrzeugs von
   der Straßenmitte nach links und rechts, solange die Vorderachse auf der Straße
   fährt und danach, bis das Heck durch ist. Bei Fahrt auf der Mitte braucht die
   Straße 2 mal das Größere von beiden. */
function checkSemiTruck(path, width, veh) {
  const sw = sweepSemiTruck(path, veh, 2);
  if (!sw) return null;
  const P = extendedPath(path, veh);
  let left = 0, right = 0;
  const endS = sw.length + semiTruckLength(sw.vehicle);
  for (let i = 0; i < sw.steps.length; i++) {
    const st = sw.steps[i];
    if (st.s < 0 || st.s > endS) continue;
    [st.tr, st.tl].forEach(function (poly) {
      for (let c = 0; c < 4; c++) {
        const o = lateralOffsetOnPath(P, poly[c]);
        if (o > left) left = o;
        if (-o > right) right = -o;
      }
    });
  }
  const need = 2 * Math.max(left, right);
  const half = Math.max(width, 1) / 2;
  const over = Math.max(0, Math.max(left, right) - half);
  return { left: left, right: right, need: need, width: Math.max(width, 1), over: over,
           fits: over <= 0.005, vehicle: sw.vehicle, sweep: sw, path: P };
}

/* Rand der überstrichenen Fläche: Rechtecke in ein Raster (cell m) einzeichnen und
   die Umrisse der belegten Zellen verfolgen (Marching Squares). Liefert Schleifen
   aus {x,z}, vereinfacht auf `tol` m. Nur Darstellung, nicht für Prüfwerte. */
function sweptOutlines(sweep, cell, tol) {
  cell = cell || 0.1; tol = tol == null ? 0.06 : tol;
  let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity;
  sweep.steps.forEach(function (st) {
    [st.tr, st.tl].forEach(function (pl) {
      pl.forEach(function (p) {
        if (p[0] < minx) minx = p[0]; if (p[0] > maxx) maxx = p[0];
        if (p[1] < minz) minz = p[1]; if (p[1] > maxz) maxz = p[1];
      });
    });
  });
  // lange Straßen: Raster gröber, damit es nicht zu groß wird (höchstens ca. 2,5 Mio. Zellen)
  cell = Math.max(cell, Math.sqrt((maxx - minx + 1) * (maxz - minz + 1) / 2.5e6));
  const x0 = minx - 2 * cell, z0 = minz - 2 * cell;
  const nx = Math.ceil((maxx - x0) / cell) + 3, nz = Math.ceil((maxz - z0) / cell) + 3;
  const g = new Uint8Array(nx * nz);
  function fill(pl) {
    let lo = Infinity, hi = -Infinity;
    pl.forEach(function (p) { if (p[1] < lo) lo = p[1]; if (p[1] > hi) hi = p[1]; });
    for (let j = Math.max(0, Math.floor((lo - z0) / cell)); j <= Math.min(nz - 1, Math.ceil((hi - z0) / cell)); j++) {
      const z = z0 + (j + 0.5) * cell;
      const xs = [];
      for (let i = 0; i < 4; i++) {
        const A = pl[i], B = pl[(i + 1) % 4];
        if ((A[1] <= z) !== (B[1] <= z)) xs.push(A[0] + (z - A[1]) * (B[0] - A[0]) / (B[1] - A[1]));
      }
      if (xs.length < 2) continue;
      xs.sort(function (p, q) { return p - q; });
      const i0 = Math.max(0, Math.floor((xs[0] - x0) / cell)), i1 = Math.min(nx - 1, Math.ceil((xs[xs.length - 1] - x0) / cell));
      for (let i = i0; i <= i1; i++) g[j * nx + i] = 1;
    }
  }
  sweep.steps.forEach(function (st) { fill(st.tr); fill(st.tl); });

  // Segmente zwischen Kantenmitten; Kante: horizontal h(i,j) zwischen Knoten (i,j)-(i+1,j), vertikal v(i,j)
  const segs = new Map();
  function addSeg(a, b) {
    if (!segs.has(a)) segs.set(a, []);
    if (!segs.has(b)) segs.set(b, []);
    segs.get(a).push(b); segs.get(b).push(a);
  }
  const H = function (i, j) { return (j * nx + i) * 2; }, Vv = function (i, j) { return (j * nx + i) * 2 + 1; };
  for (let j = 0; j < nz - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const bl = g[j * nx + i], br = g[j * nx + i + 1], tl = g[(j + 1) * nx + i], tr = g[(j + 1) * nx + i + 1];
      const c = bl | (br << 1) | (tr << 2) | (tl << 3);
      if (c === 0 || c === 15) continue;
      const eB = H(i, j), eT = H(i, j + 1), eL = Vv(i, j), eR = Vv(i + 1, j);
      switch (c) {
        case 1: case 14: addSeg(eL, eB); break;
        case 2: case 13: addSeg(eB, eR); break;
        case 3: case 12: addSeg(eL, eR); break;
        case 4: case 11: addSeg(eR, eT); break;
        case 6: case 9: addSeg(eB, eT); break;
        case 7: case 8: addSeg(eL, eT); break;
        case 5: addSeg(eL, eT); addSeg(eB, eR); break;
        case 10: addSeg(eL, eB); addSeg(eR, eT); break;
      }
    }
  }
  // Rasterknoten liegen in den Zellmitten; H(i,j) verbindet (i,j)-(i+1,j), V(i,j) verbindet (i,j)-(i,j+1)
  function edgePoint(e) {
    const kind = e & 1, id = e >> 1, i = id % nx, j = (id - i) / nx;
    return kind === 0 ? { x: x0 + (i + 1) * cell, z: z0 + (j + 0.5) * cell } : { x: x0 + (i + 0.5) * cell, z: z0 + (j + 1) * cell };
  }
  const loops = [];
  const used = new Set();
  segs.forEach(function (nbrs, start) {
    if (used.has(start)) return;
    const loop = [start];
    used.add(start);
    let prev = -1, cur = start;
    for (let guard = 0; guard < 1e6; guard++) {
      const ns = segs.get(cur);
      let next = -1;
      for (let q = 0; q < ns.length; q++) { if (ns[q] !== prev && !used.has(ns[q])) { next = ns[q]; break; } }
      if (next < 0) break;
      used.add(next); loop.push(next); prev = cur; cur = next;
    }
    if (loop.length > 8) loops.push(loop.map(edgePoint));
  });
  return loops.map(function (lp) { return simplifyLoop(lp, tol); }).filter(function (lp) { return lp.length >= 4; });
}

function simplifyLoop(pts, tol) {
  if (pts.length < 5) return pts;
  function dp(a, b, out) {
    let md = -1, mi = -1;
    const A = pts[a], B = pts[b];
    const dx = B.x - A.x, dz = B.z - A.z, l = Math.hypot(dx, dz) || 1e-9;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((pts[i].x - A.x) * dz - (pts[i].z - A.z) * dx) / l;
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol) { dp(a, mi, out); out.push(pts[mi]); dp(mi, b, out); }
  }
  const half = Math.floor(pts.length / 2), out = [pts[0]];
  dp(0, half, out); out.push(pts[half]); dp(half, pts.length - 1, out); out.push(pts[pts.length - 1]);
  return out;
}

/* =========================================================
   Baugrube
   Ein Polygon im Gelände, eine Sohle auf konstanter Höhe, senkrechte Wände.
   Die Tiefe (params.depth, Standard -5 m) gilt zum MITTLEREN Gelände innerhalb
   des Polygons; die absolute Höhe der Unterkante folgt daraus und umgekehrt
   (zwei Regler, ein Wert). Liegt die Sohle teils unter, teils über dem
   Gelände, gibt es Aushub und Aufschüttung.
   ========================================================= */
const PIT_MAX_POINTS = 32;       // Eckpunkte je Polygon (Shader-Uniforms sind begrenzt)
const PIT_MAX_HOLES = 6;         // Baugruben, die gleichzeitig ein Loch ins Gelände schneiden
const PIT_DEPTH_MIN = -100;
const PIT_DEPTH_MAX = 10;
const PIT_SAMPLES = 40000;       // Obergrenze der Stichproben für die Mengen

function defaultPitParams() {
  return { points: [], depth: -5, angle: PIT_ANGLE_MAX };
}

/* Fläche eines Polygons (Gaußsche Trapezformel), immer positiv */
function polygonArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    a += p.x * q.z - q.x * p.z;
  }
  return Math.abs(a) / 2;
}

/* Punkt im Polygon (gerade-ungerade-Regel) */
function pointInPolygon(pts, x, z) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.z > z) !== (b.z > z) && x < (b.x - a.x) * (z - a.z) / (b.z - a.z) + a.x) inside = !inside;
  }
  return inside;
}

/* Zerlegt ein einfaches Polygon (auch konkav) in Dreiecke (Ear-Clipping). Gibt
   Indextripel zurück, jedes so gewendet, dass die Fläche von oben gesehen
   nach oben zeigt. Bei sich selbst schneidenden Polygonen greift ein Fächer
   als Notlösung, statt nichts zu zeigen. */
function triangulatePolygon(pts) {
  const n = pts.length;
  if (n < 3) return [];
  function cross(a, b, c) { return (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x); }
  let signed = 0;
  for (let i = 0; i < n; i++) signed += cross(pts[0], pts[i], pts[(i + 1) % n]);
  const dir = signed >= 0 ? 1 : -1;
  const idx = [];
  for (let i = 0; i < n; i++) idx.push(i);
  const out = [];

  function inTri(p, a, b, c) {
    const d1 = cross(p, a, b), d2 = cross(p, b, c), d3 = cross(p, c, a);
    const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(neg && pos);
  }
  function emit(a, b, c) {
    // Aufwärts gewendet: von oben gesehen (Nord oben) gegen den Uhrzeigersinn = negatives Kreuzprodukt
    if (cross(pts[a], pts[b], pts[c]) > 0) out.push([a, c, b]); else out.push([a, b, c]);
  }

  let guard = 0;
  while (idx.length > 3 && guard++ < 5000) {
    let clipped = false;
    for (let i = 0; i < idx.length; i++) {
      const a = idx[(i + idx.length - 1) % idx.length], b = idx[i], c = idx[(i + 1) % idx.length];
      if (dir * cross(pts[a], pts[b], pts[c]) <= 1e-9) continue;        // reflexe Ecke
      let blocked = false;
      for (let k = 0; k < idx.length; k++) {
        const j = idx[k];
        if (j === a || j === b || j === c) continue;
        const q = pts[j];
        if ((q.x === pts[a].x && q.z === pts[a].z) || (q.x === pts[b].x && q.z === pts[b].z) || (q.x === pts[c].x && q.z === pts[c].z)) continue;   // doppelter Punkt (Brücke zu einem Loch)
        if (inTri(q, pts[a], pts[b], pts[c])) { blocked = true; break; }
      }
      if (blocked) continue;
      emit(a, b, c);
      idx.splice(i, 1);
      clipped = true;
      break;
    }
    if (!clipped) {
      for (let i = 1; i + 1 < idx.length; i++) emit(idx[0], idx[i], idx[i + 1]);
      return out;
    }
  }
  if (idx.length === 3) emit(idx[0], idx[1], idx[2]);
  return out;
}

/* ---------- Böschung der Baugrube ----------
   Das gezeichnete Polygon ist die OBERKANTE (am Gelände) und bleibt, wie es ist.
   Die Wände laufen mit dem Böschungswinkel nach innen, die Sohle wird kleiner:
   horizontaler Versatz je Ecke = Höhenunterschied zwischen Gelände und Sohle /
   tan(Winkel). 90° heißt senkrecht (Verbau), der Standard. Liegt die Sohle über
   dem Gelände (Aufschüttung), verjüngt sich die Platte nach oben genauso.
   Ist die Grube zu schmal für den Winkel, würde die Sohle zusammenlaufen; dann
   wird der Versatz so weit verkleinert, wie nötig (die Böschung wirkt steiler,
   angleEff) - Darstellung und Mengen rechnen mit dieser tatsächlichen Neigung. */
const PIT_ANGLE_MIN = 20;
const PIT_ANGLE_MAX = 90;                       // 90° = senkrecht

function pitAngleOf(p) {
  const a = p && p.angle;
  return (typeof a === 'number' && isFinite(a)) ? Math.max(PIT_ANGLE_MIN, Math.min(PIT_ANGLE_MAX, a)) : PIT_ANGLE_MAX;
}

function signedArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    a += p.x * q.z - q.x * p.z;
  }
  return a / 2;
}

/* Polygon nach innen versetzt; dists = Versatz je Ecke in m (Gehrung an den Ecken) */
function polygonInset(pts, dists, scale) {
  const n = pts.length;
  const sign = signedArea(pts) >= 0 ? 1 : -1;
  function normal(a, b) {
    const dx = b.x - a.x, dz = b.z - a.z, l = Math.sqrt(dx * dx + dz * dz) || 1;
    return { x: sign * (-dz) / l, z: sign * dx / l };
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n], cur = pts[i], next = pts[(i + 1) % n];
    const n1 = normal(prev, cur), n2 = normal(cur, next);
    const denom = Math.max(1 + n1.x * n2.x + n1.z * n2.z, 0.2);      // sehr spitze Ecken nicht ins Unendliche
    const d = scale * dists[i] / denom;
    out.push({ x: cur.x + (n1.x + n2.x) * d, z: cur.z + (n1.z + n2.z) * d });
  }
  return out;
}

/* Ein Versatz-Polygon ist brauchbar, wenn es nicht umgeklappt ist (Umlaufsinn und
   Kantenrichtungen bleiben), noch Fläche hat und sich nicht selbst schneidet */
function insetValid(orig, off) {
  const a0 = signedArea(orig), a1 = signedArea(off);
  if (a0 * a1 <= 0 || Math.abs(a1) < 0.02 * Math.abs(a0)) return false;
  const n = orig.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ox = orig[j].x - orig[i].x, oz = orig[j].z - orig[i].z;
    const fx = off[j].x - off[i].x, fz = off[j].z - off[i].z;
    if (ox * fx + oz * fz <= 0) return false;
  }
  function cross(a, b, c) { return (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x); }
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const a = off[i], b = off[(i + 1) % n], c = off[j], d = off[(j + 1) % n];
      if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) return false;
    }
  }
  return true;
}

/* Alles Rechnerische einer Baugrube: Fläche, Bezugshöhe, Unterkante, Sohle samt
   Böschung, Aushub und Aufschüttung. Die Mengen kommen aus einem Raster von
   Stichproben im Polygon (Mittelpunktregel), hochgerechnet auf die exakte
   Fläche - dadurch stimmt eine ebene Grube unabhängig von der Rasterweite.
   Die Entwurfsfläche je Stichprobe: Sohlhöhe im Inneren, an den Wänden steigt sie
   mit dem Böschungswinkel vom Rand (Gelände dort) zur Sohle bzw. fällt bei
   Aufschüttung von der Sohle zum Rand. */
function computePit(p) {
  const pts = (p && p.points) || [];
  const depth = (p && isFinite(p.depth)) ? p.depth : -5;
  const angle = pitAngleOf(p);
  const out = {
    area: 0, ref: 0, refAbs: 0, bottom: 0, bottomAbs: 0, cut: 0, fill: 0, samples: 0,
    angle: angle, angleEff: angle, clamped: false, floor: pts.map(function (q) { return { x: q.x, z: q.z }; }), floorArea: 0
  };
  const zmin = TERRAIN ? TERRAIN.zmin : 0;
  if (pts.length < 3) return out;

  out.area = polygonArea(pts);
  out.floorArea = out.area;
  let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity;
  pts.forEach(function (q) {
    if (q.x < minx) minx = q.x; if (q.x > maxx) maxx = q.x;
    if (q.z < minz) minz = q.z; if (q.z > maxz) maxz = q.z;
  });
  const cell = TERRAIN && isFinite(TERRAIN.cell) ? TERRAIN.cell : 1;
  // Senkrechte Wände: die Entwurfsfläche ist überall die Sohle, die Rasterweite des Geländes
  // genügt. Mit Böschung muss auch das schmale Wandband aufgelöst werden: feiner, nur durch
  // die Obergrenze der Stichproben begrenzt.
  const sloped = angle < PIT_ANGLE_MAX - 0.01;
  const stepCap = Math.sqrt(Math.max(out.area, 1) / PIT_SAMPLES);
  const step = sloped ? Math.max(0.25, stepCap) : Math.max(0.5, cell * 0.5, stepCap);

  const xs = [], zs = [], hs = [];
  for (let z = minz + step / 2; z < maxz; z += step) {
    for (let x = minx + step / 2; x < maxx; x += step) {
      if (pointInPolygon(pts, x, z)) { xs.push(x); zs.push(z); hs.push(getHeightAt(x, z)); }
    }
  }
  if (!hs.length) {                                  // winziges Polygon: eine Stichprobe in der Mitte
    const c = roadCentroid(pts);
    xs.push(c.x); zs.push(c.z); hs.push(getHeightAt(c.x, c.z));
  }
  let sum = 0;
  hs.forEach(function (h) { sum += h; });
  out.ref = sum / hs.length;
  out.bottom = out.ref + depth;
  out.refAbs = zmin + out.ref;
  out.bottomAbs = zmin + out.bottom;
  out.samples = hs.length;

  // Sohle: Polygon nach innen versetzen
  let tanEff = Infinity;
  if (sloped) {
    const tanA = Math.tan(angle * Math.PI / 180);
    const dists = pts.map(function (q) { return Math.abs(getHeightAt(q.x, q.z) - out.bottom) / tanA; });
    let scale = 1;
    if (!insetValid(pts, polygonInset(pts, dists, 1))) {
      let lo = 0, hi = 1;
      for (let it = 0; it < 18; it++) {
        const mid = (lo + hi) / 2;
        if (insetValid(pts, polygonInset(pts, dists, mid))) lo = mid; else hi = mid;
      }
      scale = lo;
      out.clamped = true;
    }
    if (scale > 1e-6) {
      out.floor = polygonInset(pts, dists, scale);
      tanEff = tanA / scale;
      out.angleEff = Math.atan(tanEff) * 180 / Math.PI;
    } else {
      out.angleEff = PIT_ANGLE_MAX;                  // gar kein Platz: wie senkrecht behandeln
    }
    out.floorArea = polygonArea(out.floor);
  }

  let cut = 0, fill = 0;
  const n = pts.length;
  for (let k = 0; k < hs.length; k++) {
    let zd = out.bottom;
    if (isFinite(tanEff)) {
      // Abstand zur Oberkante und Gelände am nächsten Randpunkt
      let best = Infinity, qx = 0, qz = 0;
      for (let i = 0; i < n; i++) {
        const a = pts[i], b = pts[(i + 1) % n];
        const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz;
        const t = l2 > 0 ? Math.max(0, Math.min(1, ((xs[k] - a.x) * dx + (zs[k] - a.z) * dz) / l2)) : 0;
        const px = a.x + dx * t, pz = a.z + dz * t;
        const d2 = (xs[k] - px) * (xs[k] - px) + (zs[k] - pz) * (zs[k] - pz);
        if (d2 < best) { best = d2; qx = px; qz = pz; }
      }
      const tRim = getHeightAt(qx, qz), dist = Math.sqrt(best);
      zd = tRim >= out.bottom ? Math.max(out.bottom, tRim - dist * tanEff) : Math.min(out.bottom, tRim + dist * tanEff);
    }
    if (hs[k] > zd) cut += hs[k] - zd; else fill += zd - hs[k];
  }
  out.cut = cut / hs.length * out.area;
  out.fill = fill / hs.length * out.area;
  return out;
}

function buildPit(p) {
  const g = new THREE.Group();
  const pts = (p.points || []).slice(0, PIT_MAX_POINTS);

  if (pts.length < 3) {
    g.userData.bbox = { w: 4, d: 4, h: 1 };
    g.userData.selBox = { w: 4, d: 4, h: 1, cy: 0.5, cx: 0, cz: 0 };
    g.userData.pit = computePit({ points: [], depth: p.depth });
    return g;
  }

  const info = computePit({ points: pts, depth: p.depth, angle: p.angle });
  const bottom = info.bottom;
  const fl = info.floor;

  // Sohle (kleiner als die Oberkante, wenn die Wände geböscht sind)
  const tris = triangulatePolygon(fl);
  const fp = [], fi = [];
  fl.forEach(function (q) { fp.push(q.x, bottom, q.z); });
  tris.forEach(function (t) { fi.push(t[0], t[1], t[2]); });
  const fg = new THREE.BufferGeometry();
  fg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(fp), 3));
  fg.setIndex(fi);
  fg.computeVertexNormals();
  const floor = new THREE.Mesh(fg, MAT.pitFloor);
  floor.userData.kind = 'pitFloor';
  g.add(floor);

  // Wände: von der Geländekante (Oberkante) zur Sohlkante, Kanten alle 2 m abgetastet
  const wp = [], wi = [], top = [], bot = [];
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    const a = pts[i], b = pts[j], fa = fl[i], fb = fl[j];
    const len = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.z - a.z) * (b.z - a.z));
    const k = Math.max(1, Math.ceil(len / 2));
    for (let m = 0; m <= k; m++) {
      if (i > 0 && m === 0) continue;                // gemeinsame Ecke nicht doppeln
      const t = m / k;
      const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
      const fx = fa.x + (fb.x - fa.x) * t, fz = fa.z + (fb.z - fa.z) * t;
      const h = getHeightAt(x, z) + 0.05;
      wp.push(x, h, z, fx, bottom, fz);
      top.push(new THREE.Vector3(x, h + 0.03, z));
      bot.push(new THREE.Vector3(fx, bottom + 0.03, fz));
    }
  }
  const nCols = wp.length / 6;
  for (let c = 0; c + 1 < nCols; c++) {
    const a = c * 2, b = a + 1, d = a + 2, e = a + 3;
    wi.push(a, d, b, b, d, e);
  }
  const wg = new THREE.BufferGeometry();
  wg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(wp), 3));
  wg.setIndex(wi);
  wg.computeVertexNormals();
  const walls = new THREE.Mesh(wg, MAT.pitWall);
  walls.userData.kind = 'pitWalls';
  g.add(walls);

  // Oberkante und Unterkante als Linien
  top.push(top[0].clone()); bot.push(bot[0].clone());
  const tl = new THREE.Line(new THREE.BufferGeometry().setFromPoints(top), MAT.pitEdge);
  tl.userData.kind = 'pitRim';
  g.add(tl);
  const bl = new THREE.Line(new THREE.BufferGeometry().setFromPoints(bot), MAT.pitEdge);
  bl.userData.kind = 'pitBottomLine';
  g.add(bl);

  let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity;
  pts.forEach(function (q) {
    if (q.x < minx) minx = q.x; if (q.x > maxx) maxx = q.x;
    if (q.z < minz) minz = q.z; if (q.z > maxz) maxz = q.z;
  });
  const hh = Math.max(Math.abs(p.depth) + 2, 3);
  g.userData.bbox = { w: maxx - minx, d: maxz - minz, h: hh };
  g.userData.selBox = { w: maxx - minx, d: maxz - minz, h: hh, cy: (info.ref + bottom) / 2, cx: (minx + maxx) / 2, cz: (minz + maxz) / 2 };
  g.userData.pit = info;
  g.userData.area = info.area;
  return g;
}

/* ---------- Loch im Gelände über der Baugrube ----------
   Das Gelände ist eine geschlossene Fläche; die Sohle und die Wände der Baugrube
   liegen darunter und wären nicht zu sehen. Deshalb verwirft der Fragment-
   Shader des Geländes alles, was im Polygon einer Baugrube liegt. Die Höhendaten
   (getHeightAt) bleiben unberührt: Mengen, Objekte und IFC-Export sehen das
   unveränderte Gelände. Bis PIT_MAX_HOLES Baugruben mit je PIT_MAX_POINTS Ecken. */
const pitUniforms = {
  uPitCount: { value: 0 },
  uPitN: { value: new Float32Array(PIT_MAX_HOLES) },
  uPitEdges: { value: new Float32Array(PIT_MAX_HOLES * PIT_MAX_POINTS * 4) }
};
let pitHoles = [];                                   // Polygone der aktuellen Löcher

function pitHoleShader(shader) {
  shader.uniforms.uPitCount = pitUniforms.uPitCount;
  shader.uniforms.uPitN = pitUniforms.uPitN;
  shader.uniforms.uPitEdges = pitUniforms.uPitEdges;
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec2 vPitXZ;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPitXZ = position.xz;');
  const M = PIT_MAX_HOLES, E = PIT_MAX_POINTS;
  const fn = [
    'varying vec2 vPitXZ;',
    'uniform float uPitCount;',
    'uniform float uPitN[' + M + '];',
    'uniform vec4 uPitEdges[' + (M * E) + '];',
    'bool pitInside() {',
    '  vec2 p = vPitXZ;',
    '  for (int k = 0; k < ' + M + '; k++) {',
    '    if (float(k) >= uPitCount) break;',
    '    bool inside = false;',
    '    int n = int(uPitN[k]);',
    '    for (int e = 0; e < ' + E + '; e++) {',
    '      if (e >= n) break;',
    '      vec4 d = uPitEdges[k * ' + E + ' + e];',
    '      if (((d.y > p.y) != (d.w > p.y)) && (p.x < (d.z - d.x) * (p.y - d.y) / (d.w - d.y) + d.x)) inside = !inside;',
    '    }',
    '    if (inside) return true;',
    '  }',
    '  return false;',
    '}'
  ].join('\n');
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\n' + fn)
    .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (pitInside()) discard;');
}

/* Trägt die Polygone aller Baugruben in die Shader-Uniforms ein */
function updatePitHoles() {
  pitHoles = [];
  objects.forEach(function (o) {
    if (o.type !== 'pit') return;
    const pts = (o.params.points || []).slice(0, PIT_MAX_POINTS);
    if (pts.length >= 3 && pitHoles.length < PIT_MAX_HOLES) pitHoles.push(pts);
  });
  pitUniforms.uPitCount.value = pitHoles.length;
  pitUniforms.uPitN.value.fill(0);
  pitUniforms.uPitEdges.value.fill(0);
  pitHoles.forEach(function (pts, k) {
    pitUniforms.uPitN.value[k] = pts.length;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const o = (k * PIT_MAX_POINTS + i) * 4;
      pitUniforms.uPitEdges.value[o] = a.x; pitUniforms.uPitEdges.value[o + 1] = a.z;
      pitUniforms.uPitEdges.value[o + 2] = b.x; pitUniforms.uPitEdges.value[o + 3] = b.z;
    }
  });
}

function pitHoleContains(x, z) {
  for (let i = 0; i < pitHoles.length; i++) if (pointInPolygon(pitHoles[i], x, z)) return true;
  return false;
}

/* Erster Treffer, der nicht ein vom Loch weggeschnittenes Geländestück ist */
function firstVisibleHit(hits) {
  for (let i = 0; i < hits.length; i++) {
    const h = hits[i];
    if (h.object && h.object.userData && h.object.userData.isTerrain && pitHoleContains(h.point.x, h.point.z)) continue;
    return h;
  }
  return null;
}

/* Stützpunkte haben Straßen (mindestens 2) und Baugruben (mindestens 3) */
function hasNodes(obj) { return !!obj && (obj.type === 'road' || obj.type === 'pit'); }
function minNodes(obj) { return obj.type === 'pit' ? 3 : 2; }

function roadCentroid(pts) {
  if (!pts || !pts.length) return { x: 0, z: 0 };
  let sx = 0, sz = 0;
  pts.forEach(function (q) { sx += q.x; sz += q.z; });
  return { x: sx / pts.length, z: sz / pts.length };
}

/* ---------- Vorschau während des Setzens ---------- */
let roadPreview = null;
// Beschriftung der Strecken beim Zeichnen: Mitte (x, y, z) und waagerechte Länge in m; live = Strecke zur Maus
let roadPreviewLabels = [];

/* Waagerechte Länge der Strecken eines Linienzugs (nur x/z, die Neigung bleibt außen vor) */
function segmentLabels(all, close, liveLast) {
  const out = [];
  const count = close ? all.length : all.length - 1;
  for (let i = 0; i < count; i++) {
    const p = all[i], q = all[(i + 1) % all.length];
    const mx = (p.x + q.x) / 2, mz = (p.z + q.z) / 2;
    out.push({ x: mx, y: getHeightAt(mx, mz) + 0.4, z: mz, len: Math.hypot(q.x - p.x, q.z - p.z),
               live: !!liveLast && i === all.length - 2 });
  }
  return out;
}

function setRoadPreview(pts, hover, closed) {
  clearRoadPreview();
  if (!pts || !pts.length) return;
  const g = new THREE.Group();
  const all = hover ? pts.concat([hover]) : pts;
  roadPreviewLabels = segmentLabels(all, !!closed && all.length >= 3, !!hover);

  if (all.length >= 2) {
    // Linie dem Gelände folgen lassen: Zwischenpunkte alle 2 m, sonst schneidet die gerade
    // Strecke zwischen zwei Punkten über einen Hang durch das Gelände und wirkt versetzt
    const close = !!closed && all.length >= 3;
    const line = [];
    const count = close ? all.length : all.length - 1;
    for (let i = 0; i < count; i++) {
      const p = all[i], q = all[(i + 1) % all.length];
      const steps = Math.max(1, Math.min(200, Math.ceil(Math.hypot(q.x - p.x, q.z - p.z) / 2)));
      for (let k = 0; k < steps; k++) {
        const x = p.x + (q.x - p.x) * k / steps, z = p.z + (q.z - p.z) * k / steps;
        line.push(new THREE.Vector3(x, getHeightAt(x, z) + 0.4, z));
      }
    }
    const last = close ? all[0] : all[all.length - 1];
    line.push(new THREE.Vector3(last.x, getHeightAt(last.x, last.z) + 0.4, last.z));
    g.add(thickLine(line, 0.8, MAT.drawPreview, false));
  }
  pts.forEach(function (q) {
    const m = new THREE.Mesh(GEO.sphere, MAT.measure);
    m.position.set(q.x, getHeightAt(q.x, q.z) + 0.4, q.z);
    m.scale.set(0.7, 0.7, 0.7);
    g.add(m);
  });
  scene.add(g);
  roadPreview = g;
  return g;
}

function clearRoadPreview() {
  roadPreviewLabels = [];
  if (roadPreview) {
    disposeGroup(roadPreview);
    scene.remove(roadPreview);
    roadPreview = null;
  }
}


/* =========================================================
   Objektverwaltung
   ========================================================= */
function builderFor(type) {
  if (type === 'container') return buildContainer;
  if (type === 'tower') return buildTowerCrane;
  if (type === 'mobile') return buildMobileCrane;
  if (type === 'road') return buildRoad;
  if (type === 'pit') return buildPit;
  throw new Error('Unbekannter Typ: ' + type);
}

function defaultsFor(type) {
  if (type === 'container') return defaultContainerParams();
  if (type === 'tower') return defaultTowerParams();
  if (type === 'mobile') return defaultMobileParams();
  if (type === 'road') return defaultRoadParams();
  if (type === 'pit') return defaultPitParams();
  throw new Error('Unbekannter Typ: ' + type);
}

function labelFor(type, params) {
  if (type === 'container') {
    const lay = containerLayout(params);
    return 'Container ' + lay.count + '× · ' + params.cols + ' neben, ' +
           params.rows + ' Reihe(n), ' + params.levels + ' Eb.';
  }
  if (type === 'tower') return 'Turmdrehkran';
  if (type === 'mobile') return getModel(params.model).name;
  if (type === 'road') {
    return 'Baustraße ' + Math.round(roadInfo(params).length) + ' m · ' + params.width.toFixed(1) + ' m';
  }
  if (type === 'pit') {
    return 'Baugrube ' + Math.round(polygonArea(params.points || [])) + ' m² · ' + (isFinite(params.depth) ? params.depth : -5).toFixed(1) + ' m';
  }
  if (type === 'road') {
    const fil = filletPath(params.points || [], Math.max(params.radius, 1));
    const l = pathLength(densifyPath(fil.path, 2.5));
    return 'Baustraße ' + Math.round(l) + ' m · ' + params.width.toFixed(1) + ' m breit';
  }
  return type;
}

function placeGroup(obj) {
  if (hasNodes(obj)) {
    // Die Geometrie liegt bereits in Weltkoordinaten
    obj.group.position.set(0, 0, 0);
    const c = roadCentroid(obj.params.points);
    obj.x = c.x; obj.z = c.z;
  } else {
    obj.group.position.set(obj.x, getHeightAt(obj.x, obj.z), obj.z);
  }
}

function addObject(type, x, z, params) {
  const p = params || defaultsFor(type);
  // Konstante Längsneigung der Straße: zunächst die, mit der sie die
  // Geländehöhen von Anfangs- und Endpunkt verbindet; der Regler stellt sie danach ein.
  if (type === 'road' && (p.slope === null || p.slope === undefined)) p.slope = autoRoadSlope(p);
  const group = builderFor(type)(p);
  scene.add(group);

  const obj = { id: nextId++, type: type, params: p, group: group, x: x, z: z };
  placeGroup(obj);
  group.userData.__objId = obj.id;
  objects.push(obj);
  if (type === 'pit') updatePitHoles();
  return obj;
}

function rebuildObject(obj) {
  disposeGroup(obj.group);
  scene.remove(obj.group);
  obj.group = builderFor(obj.type)(obj.params);
  obj.group.userData.__objId = obj.id;
  scene.add(obj.group);
  placeGroup(obj);
  if (obj.type === 'pit') updatePitHoles();
  if (isSelected(obj.id)) updateSelectionBoxes();
}

function moveObject(obj, x, z) {
  if (hasNodes(obj)) {
    const dx = x - obj.x, dz = z - obj.z;
    obj.params.points = (obj.params.points || []).map(function (q) {
      return { x: q.x + dx, z: q.z + dz };
    });
    resetRoadSlope(obj);                                                  // anderes Gelände, neue Anfangs-/Endhöhe
    rebuildObject(obj);
    return;
  }
  obj.x = x; obj.z = z;
  obj.group.position.set(x, getHeightAt(x, z), z);
  // Keine Kamerafahrt: die Stelle wurde eben angeklickt und ist im Bild
  if (isSelected(obj.id)) updateSelectionBoxes();
}

function removeObject(id) {
  let idx = -1;
  for (let i = 0; i < objects.length; i++) if (objects[i].id === id) { idx = i; break; }
  if (idx < 0) return false;
  disposeGroup(objects[idx].group);
  scene.remove(objects[idx].group);
  const wasPit = objects[idx].type === 'pit';
  objects.splice(idx, 1);
  if (wasPit) updatePitHoles();
  const si = selectedIds.indexOf(id);
  if (si >= 0) { selectedIds.splice(si, 1); updateSelectionBoxes(); }
  return true;
}

function findObject(id) {
  for (let i = 0; i < objects.length; i++) if (objects[i].id === id) return objects[i];
  return null;
}

function disposeGroup(group) {
  group.traverse(function (child) {
    if (child.geometry && child.geometry !== GEO.box && child.geometry !== GEO.cyl) {
      child.geometry.dispose();
    }
  });
}

function reseatAllObjects() {
  for (let i = 0; i < objects.length; i++) {
    if (hasNodes(objects[i])) rebuildObject(objects[i]);
    else objects[i].group.position.y = getHeightAt(objects[i].x, objects[i].z);
  }
  if (selectedIds.length) updateSelectionBoxes();
}

/* Objekte entfernen, die außerhalb der neuen Kachel liegen */
function pruneObjectsOutside() {
  if (!TERRAIN) return 0;
  const mx = TERRAIN.w / 2, mz = TERRAIN.d / 2;
  let n = 0;
  objects.slice().forEach(function (o) {
    if (Math.abs(o.x) > mx || Math.abs(o.z) > mz) { removeObject(o.id); n++; }
  });
  return n;
}

/* =========================================================
   Auswahl und Kamerafokus
   ========================================================= */
function selectObject(id) {
  selectObjects(id === null ? [] : [id]);
}

/* Mehrere Objekte gleichzeitig auswählen und einrahmen */
function selectObjects(ids, frame) {
  const before = selectedIds;
  selectedIds = (ids || []).filter(function (i) { return findObject(i) !== null; });
  updateSelectionBoxes();
  if (!selectedIds.length) return;
  const objs = selectedIds.map(findObject);
  if (frame === false) return;
  // Wird der Editor nur neu aufgebaut (nach Verschieben, Parameteränderung), bleibt
  // die Kamera, wo sie ist - sonst dreht sich die Ansicht ungefragt zum Objekt
  if (before.length === selectedIds.length && before.every(function (i, k) { return i === selectedIds[k]; })) return;
  if (objs.length === 1) focusOnObject(objs[0]);
  else frameObjects(objs);
}

function getSelectedId() {
  return selectedIds.length === 1 ? selectedIds[0] : null;
}

function isSelected(id) {
  return selectedIds.indexOf(id) >= 0;
}

/* Angeklicktes Objekt wird zum Drehzentrum der Kamera */
function focusOnObject(obj) {
  const b = obj.group.userData.selBox || { cy: 5 };
  if (hasNodes(obj)) { frameObjects([obj]); return; }
  focusGoal = new THREE.Vector3(obj.x, getHeightAt(obj.x, obj.z) + b.cy, obj.z);
  camGoal = null;
}

/* Kamera und Drehzentrum, wie sie nach einer laufenden Fahrt stehen werden. Wer
   daraus eine Blickrichtung ableitet, bekommt keine verzerrte Richtung aus einem
   Zwischenstand (Kamera und Zentrum laufen mit unterschiedlicher Geschwindigkeit). */
function settledView() {
  return { pos: camGoal || camera.position, target: focusGoal || controls.target };
}

/* Kamera so setzen, dass alle übergebenen Objekte ins Bild passen */
function frameObjects(objs) {
  if (!objs || !objs.length) return;
  const sv = settledView();                 // vor dem Setzen der neuen Ziele lesen
  let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity, maxy = 0;
  objs.forEach(function (o) {
    const bb = o.group.userData.bbox || { w: 20, d: 20, h: 10 };
    const r = Math.max(bb.w, bb.d) / 2;
    if (o.x - r < minx) minx = o.x - r;
    if (o.x + r > maxx) maxx = o.x + r;
    if (o.z - r < minz) minz = o.z - r;
    if (o.z + r > maxz) maxz = o.z + r;
    const top = getHeightAt(o.x, o.z) + bb.h;
    if (top > maxy) maxy = top;
  });

  const cx = (minx + maxx) / 2, cz = (minz + maxz) / 2;
  const radius = Math.max(Math.max(maxx - minx, maxz - minz) / 2, maxy / 2, 20);
  focusGoal = new THREE.Vector3(cx, maxy * 0.4, cz);

  const fov = camera.fov * Math.PI / 180;
  const dist = (radius / Math.tan(fov / 2)) * 1.45 + radius;

  // Blickrichtung beibehalten, nur den Abstand anpassen
  let dx = sv.pos.x - sv.target.x;
  let dy = sv.pos.y - sv.target.y;
  let dz = sv.pos.z - sv.target.z;
  let len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (!(len > 0.001)) { dx = 0.6; dy = 0.55; dz = 0.6; len = Math.sqrt(0.36 + 0.3025 + 0.36); }
  dx /= len; dy /= len; dz /= len;
  if (dy < 0.25) { dy = 0.45; }

  camGoal = new THREE.Vector3(cx + dx * dist, focusGoal.y + dy * dist, cz + dz * dist);
}

/* Beendet eine laufende Kamerafahrt starr am Ziel: das Zentrum springt zum Fahrtziel, die Kamera
   verschiebt sich um denselben Betrag (Abstand und Blickrichtung bleiben). Wer währenddessen
   zoomt oder zieht, soll nicht gegen die Fahrt ankämpfen, die die Kamera sonst zurückzieht. */
function settleCameraFlight() {
  if (focusGoal) {
    camera.position.x += focusGoal.x - controls.target.x;
    camera.position.y += focusGoal.y - controls.target.y;
    camera.position.z += focusGoal.z - controls.target.z;
    controls.target.copy(focusGoal);
  }
  focusGoal = null;
  camGoal = null;
}

/* Pro Bild aufgerufen: weicher Übergang von Drehzentrum und Kamera */
function updateUnderLight() {
  if (MAT.__under) MAT.__under.intensity = camera.position.y < controls.target.y - 0.5 ? 0.6 : 0;
  // unter dem Gelände verdeckte der Sockelblock die Sicht auf Gründungen
  if (plinthMesh) plinthMesh.visible = camera.position.y >= 0;
}

function updateControls() {
  // Fahren Zentrum und Kamera gemeinsam (Klick auf einen Punkt, Einrahmen), mit demselben Schritt: dann
  // verschiebt sich die Ansicht starr. Mit unterschiedlichen Schritten kippte die Blickrichtung kurz
  // und schwang wieder zurück - die Karte "verdrehte" sich bei jedem Klick.
  const together = !!(focusGoal && camGoal);
  const step = together ? 0.15 : null;
  if (focusGoal) {
    controls.target.lerp(focusGoal, step || 0.16);
    if (controls.target.distanceTo(focusGoal) < 0.08 && !together) {
      controls.target.copy(focusGoal);
      focusGoal = null;
    }
  }
  updateMeasureScale();
  updateNodeScale();
  refreshTopView();
  // In der Draufsicht liegt der Polarwinkel nahe 0 - dort ist OrbitControls'
  // Kugelkoordinaten-Dämpfung numerisch instabil und lässt die Ansicht nach
  // einer Drehgeste minutenlang von selbst weiterdrehen. Direktes Ziehen
  // bleibt möglich, nur die Trägheit danach entfällt.
  controls.enableDamping = !topView;
  if (camGoal) {
    camera.position.lerp(camGoal, step || 0.14);
    if (camera.position.distanceTo(camGoal) < 0.2 && (!together || controls.target.distanceTo(focusGoal) < 0.2)) {
      camera.position.copy(camGoal);
      camGoal = null;
      if (together) { controls.target.copy(focusGoal); focusGoal = null; }
    }
  }
  controls.update();
  updateTerrainLod(false);
}

function updateSelectionBoxes() {
  clearSelectionBoxes();
  selectedIds.forEach(function (id) {
    const obj = findObject(id);
    if (!obj) return;
    const b = obj.group.userData.selBox || { w: 10, d: 10, h: 10, cy: 5 };
    const box = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(b.w + 1.5, b.h + 1.5, b.d + 1.5)),
      MAT.selection
    );
    box.name = '__selection';
    box.position.copy(obj.group.position);
    box.position.x += (b.cx || 0);
    box.position.z += (b.cz || 0);
    box.position.y += b.cy;
    box.rotation.y = obj.group.rotation.y;
    scene.add(box);
    selectionBoxes.push(box);
  });
}

function clearSelectionBoxes() {
  selectionBoxes.forEach(function (b) {
    scene.remove(b);
    if (b.geometry) b.geometry.dispose();
  });
  selectionBoxes = [];
}

/* ---------- Messpunkt ---------- */
const MEASURE_PIXELS = 9;   // Durchmesser der Kugel auf dem Bildschirm

/* Setzt den Messpunkt und macht ihn zum Dreh- und Zoomzentrum */
function focusOnPoint(x, y, z, zoom) {
  const sv = settledView();
  focusGoal = new THREE.Vector3(x, y, z);
  if (zoom === false) { camGoal = null; return; }
  let dx = sv.pos.x - sv.target.x;
  let dy = sv.pos.y - sv.target.y;
  let dz = sv.pos.z - sv.target.z;
  let len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (!(len > 0.001)) return;
  // Blickrichtung beibehalten, Abstand auf einen nahen Arbeitsabstand ziehen
  const span = TERRAIN ? Math.max(TERRAIN.w, TERRAIN.d) : 500;
  let want = Math.max(Math.min(len, span * 0.35), span * 0.12);
  // Außerhalb von minDistance/maxDistance schiebt OrbitControls die Kamera jedes Bild zurück,
  // die Fahrt käme nie an, und das Zoomen ginge nicht mehr
  want = Math.max(controls.minDistance, Math.min(controls.maxDistance, want));
  camGoal = new THREE.Vector3(x + dx / len * want, y + dy / len * want, z + dz / len * want);
}

function setMeasureMarker(x, y, z) {
  clearMeasureMarker();
  const m = new THREE.Mesh(GEO.sphere, MAT.measure);
  m.position.set(x, y, z);
  m.renderOrder = 999;
  m.name = '__measure';
  scene.add(m);
  measureMarker = m;
  measurePoint = new THREE.Vector3(x, y, z);
  updateMeasureScale();
  return m;
}

/* ---------- Messen ----------
   Rechnet einen Linienzug aus Punkten {x, y, z} (Szenenkoordinaten, y = m über TERRAIN.zmin) aus.
   h = waagerechte Länge, d3 = Länge im Raum, dz = Höhenunterschied (Ende minus Anfang der Strecke).
   Gesamtwerte: horizontal und slant (Summe über alle Strecken), dz und slopePct zwischen erstem und letztem
   Punkt (Gefälle in % = dz / waagerechter Abstand * 100, null bei senkrechter Messung). Höhen absolut (m ü. NHN)
   über zmin. Alle Längen in Metern, ungerundet - die Anzeige rundet auf zwei Nachkommastellen. */
function rulerStats(points) {
  const zmin = TERRAIN ? TERRAIN.zmin : 0;
  const segs = [];
  let horizontal = 0, slant = 0;
  for (let i = 1; i < points.length; i++) {
    const p = points[i - 1], q = points[i];
    const h = Math.hypot(q.x - p.x, q.z - p.z), dz = q.y - p.y;
    const d3 = Math.hypot(h, dz);
    segs.push({ h: h, d3: d3, dz: dz });
    horizontal += h; slant += d3;
  }
  const n = points.length;
  let dz = 0, directH = 0, slopePct = null, zStart = null, zEnd = null;
  if (n) { zStart = points[0].y + zmin; zEnd = points[n - 1].y + zmin; }
  if (n >= 2) {
    dz = points[n - 1].y - points[0].y;
    directH = Math.hypot(points[n - 1].x - points[0].x, points[n - 1].z - points[0].z);
    slopePct = directH > 1e-9 ? dz / directH * 100 : null;
  }
  return { n: n, segments: segs, horizontal: horizontal, slant: slant, dz: dz, directH: directH,
           slopePct: slopePct, zStart: zStart, zEnd: zEnd };
}

/* Hält die Kugel unabhängig vom Zoom gleich groß */
function updateMeasureScale() {
  if (!measureMarker) return;
  const d = camera.position.distanceTo(measureMarker.position);
  const fov = camera.fov * Math.PI / 180;
  const r = (d * Math.tan(fov / 2) * 2 / window.innerHeight) * (MEASURE_PIXELS / 2);
  measureMarker.scale.set(r, r, r);
}

function clearMeasureMarker() {
  if (measureMarker) {
    scene.remove(measureMarker);
    measureMarker = null;
  }
  measurePoint = null;
}

/* Rechnet den Messpunkt in Bildschirmkoordinaten um.
   Liefert null, wenn er hinter der Kamera liegt. */
function measureScreenPos() {
  if (!measurePoint) return null;
  // Der Renderer aktualisiert die Kameramatrizen erst beim Zeichnen. Ohne das
  // hier projiziert die Beschriftung mit denen des vorigen Bildes und hinkt
  // dem Punkt bei jeder Kamerabewegung ein Bild hinterher (sichtbares Zittern).
  camera.updateMatrixWorld();
  const v = measurePoint.clone();
  v.project(camera);
  if (v.z > 1) return null;
  return {
    x: (v.x * 0.5 + 0.5) * window.innerWidth,
    y: (-v.y * 0.5 + 0.5) * window.innerHeight
  };
}

/* =========================================================
   Stützpunkte einer Baustraße
   ========================================================= */
const NODE_PIXELS = 13;

function showRoadNodes(obj) {
  // Nur die Darstellung erneuern; die Knotenauswahl bleibt bestehen
  dropNodeGroup();
  if (!hasNodes(obj)) { clearRoadNodes(); return null; }
  const pts = obj.params.points || [];
  if (!pts.length) { clearRoadNodes(); return null; }

  const g = new THREE.Group();
  g.name = '__roadnodes';
  pts.forEach(function (p, i) {
    const m = new THREE.Mesh(GEO.sphere, i === activeNode ? MAT.nodeActive : MAT.node);
    m.position.set(p.x, getHeightAt(p.x, p.z) + 0.5, p.z);
    m.renderOrder = 998;
    m.userData.__nodeIndex = i;
    g.add(m);
  });
  scene.add(g);
  roadNodes = g;
  roadNodeObj = obj;
  updateNodeScale();
  return g;
}

function dropNodeGroup() {
  if (roadNodes) {
    scene.remove(roadNodes);
    roadNodes = null;
  }
}

function clearRoadNodes() {
  dropNodeGroup();
  roadNodeObj = null;
  activeNode = null;
}

function refreshRoadNodes() {
  if (roadNodeObj) showRoadNodes(findObject(roadNodeObj.id) || roadNodeObj);
}

/* Hält die Kugeln unabhängig vom Zoom gleich groß */
function updateNodeScale() {
  if (!roadNodes) return;
  const fov = camera.fov * Math.PI / 180;
  roadNodes.children.forEach(function (m) {
    const d = camera.position.distanceTo(m.position);
    const r = (d * Math.tan(fov / 2) * 2 / window.innerHeight) * (NODE_PIXELS / 2);
    m.scale.set(r, r, r);
  });
}

/* Liefert den Index des angeklickten Stützpunkts oder null */
function raycastRoadNode(event) {
  if (!roadNodes || !roadNodes.children.length) return null;
  pointerToNDC(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(roadNodes.children, false);
  if (!hits.length) return null;
  const i = hits[0].object.userData.__nodeIndex;
  return (i === undefined || i === null) ? null : i;
}

function activeRoadNode() { return activeNode; }

function setActiveNode(i) {
  activeNode = i;
  refreshRoadNodes();
  return activeNode;
}

/* Verschiebt einen Stützpunkt und baut die Trasse neu auf */
function moveRoadNode(obj, index, x, z) {
  if (!hasNodes(obj)) return false;
  const pts = obj.params.points;
  if (!pts || index < 0 || index >= pts.length) return false;
  pts[index] = { x: x, z: z };
  const c = roadCentroid(pts);
  obj.x = c.x; obj.z = c.z;
  resetRoadSlope(obj);
  rebuildObject(obj);
  refreshRoadNodes();
  return true;
}

/* Stützpunkt entfernen; unter dem Minimum (Straße 2, Baugrube 3) bleibt alles unverändert */
function removeRoadNode(obj, index) {
  if (!hasNodes(obj)) return false;
  const pts = obj.params.points;
  if (!pts || pts.length <= minNodes(obj) || index < 0 || index >= pts.length) return false;
  const own = obj.type === 'road' && roadOwnSlopes(obj.params) ? roadOwnSlopes(obj.params).slice() : null;
  pts.splice(index, 1);
  if (own) {                                  // zwei Abschnitte werden einer: der hintere Wert fällt weg (am Ende der vordere)
    own.splice(Math.min(index, own.length - 1), 1);
    obj.params.sectionSlopes = own;
  }
  const c = roadCentroid(pts);
  obj.x = c.x; obj.z = c.z;
  resetRoadSlope(obj);
  activeNode = null;
  rebuildObject(obj);
  refreshRoadNodes();
  return true;
}

/* Fügt einen Punkt an der angeklickten Stelle ein, und zwar in die nächstgelegene
   Strecke. Bei der Straße (offener Zug) hängt ein Klick jenseits des Anfangs oder
   Endes den Punkt vorn oder hinten an; bei der Baugrube zählt auch die
   Schlusskante vom letzten zum ersten Punkt. Liefert den Index des neuen Punkts
   oder -1 (kein Punktobjekt, zu viele Ecken). */
function addRoadNode(obj, x, z) {
  if (!hasNodes(obj)) return -1;
  const pts = obj.params.points;
  if (!pts || pts.length < 2) return -1;
  if (obj.type === 'pit' && pts.length >= PIT_MAX_POINTS) return -1;

  const closed = obj.type === 'pit';
  const nSeg = closed ? pts.length : pts.length - 1;
  let best = -1, bestD = Infinity, bestT = 0;
  for (let i = 0; i < nSeg; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz;
    const t = l2 > 0 ? ((x - a.x) * dx + (z - a.z) * dz) / l2 : 0;
    const tc = Math.max(0, Math.min(1, t));
    const px = a.x + dx * tc, pz = a.z + dz * tc;
    const d = (x - px) * (x - px) + (z - pz) * (z - pz);
    if (d < bestD) { bestD = d; best = i; bestT = t; }
  }

  let at;
  if (!closed && best === 0 && bestT < 0) at = 0;
  else if (!closed && best === nSeg - 1 && bestT > 1) at = pts.length;
  else at = best + 1;
  const own = obj.type === 'road' && roadOwnSlopes(obj.params) ? roadOwnSlopes(obj.params).slice() : null;
  pts.splice(at, 0, { x: x, z: z });
  if (own) {                                  // der Abschnitt wird geteilt, beide Hälften behalten seine Neigung
    if (at === 0) own.unshift(own[0]);
    else if (at >= own.length + 1) own.push(own[own.length - 1]);
    else own.splice(at - 1, 0, own[at - 1]);
    obj.params.sectionSlopes = own;
  }

  const c = roadCentroid(pts);
  obj.x = c.x; obj.z = c.z;
  resetRoadSlope(obj);
  activeNode = null;
  rebuildObject(obj);
  refreshRoadNodes();
  return at;
}

/* =========================================================
   Raycasting
   ========================================================= */
function pointerToNDC(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  return pointer;
}

/* Was beim Anklicken des Bodens getroffen werden darf: Gelände, Baugruben, optional Gebäude */
function groundTargets(withBuildings) {
  const t = [terrainMesh];
  objects.forEach(function (o) { if (o.type === 'pit') t.push(o.group); });
  if (withBuildings && buildingsMesh) t.push(buildingsMesh);
  return t;
}

function raycastTerrain(event) {
  if (!terrainMesh) return null;
  pointerToNDC(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = firstVisibleHit(raycaster.intersectObjects(groundTargets(false), true));
  return hit ? hit.point : null;
}

/* Trifft Gelände oder Gebäude; liefert Punkt und Quelle */
function raycastGround(event) {
  if (!terrainMesh) return null;
  pointerToNDC(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = firstVisibleHit(raycaster.intersectObjects(groundTargets(true), true));
  if (!hit) return null;
  return {
    point: hit.point,
    onBuilding: buildingsMesh ? hit.object === buildingsMesh : false
  };
}

function raycastObjects(event) {
  pointerToNDC(event);
  raycaster.setFromCamera(pointer, camera);
  const roots = objects.map(function (o) { return o.group; });
  if (!roots.length) return null;
  const hits = raycaster.intersectObjects(roots, true);
  if (!hits.length) return null;
  let node = hits[0].object;
  while (node && !node.userData.__objId) node = node.parent;
  return node ? findObject(node.userData.__objId) : null;
}

/* Punkt unter dem Mauszeiger auf Gelände, Gebäuden oder platzierten
   Bausteinen (der nächstliegende Treffer), oder null bei Hintergrund. Das
   ist der Drehpunkt für "um den angeklickten Punkt umkreisen". */
function raycastPivot(event) {
  pointerToNDC(event);
  raycaster.setFromCamera(pointer, camera);
  const roots = objects.map(function (o) { return o.group; });
  if (terrainMesh) roots.push(terrainMesh);
  if (buildingsMesh) roots.push(buildingsMesh);
  if (ifcModel) roots.push(ifcModel.group);
  if (!roots.length) return null;
  const hit = firstVisibleHit(raycaster.intersectObjects(roots, true));
  if (!hit) return null;
  const p = hit.point;
  return { x: p.x, y: p.y, z: p.z };
}

/* Dreht die Kamera samt Drehzentrum starr um einen beliebigen Punkt (Rodrigues).
   Anders als OrbitControls, das nur um sein eigenes Ziel dreht, bleibt der
   Punkt dabei an derselben Stelle im Bild - die Ansicht springt beim Anklicken
   nicht, und der Punkt unter dem Zeiger bleibt unter dem Zeiger. dAzimuth
   dreht um die Hochachse, dPolar kippt; der Kippwinkel wird wie in
   OrbitControls auf [minPolarAngle, maxPolarAngle] begrenzt. */
function rotateAround(v, pivot, ax, ay, az, angle) {
  const rx = v.x - pivot.x, ry = v.y - pivot.y, rz = v.z - pivot.z;
  const c = Math.cos(angle), s = Math.sin(angle);
  const dot = ax * rx + ay * ry + az * rz;
  const cx = ay * rz - az * ry, cy = az * rx - ax * rz, cz = ax * ry - ay * rx;
  v.set(
    pivot.x + rx * c + cx * s + ax * dot * (1 - c),
    pivot.y + ry * c + cy * s + ay * dot * (1 - c),
    pivot.z + rz * c + cz * s + az * dot * (1 - c)
  );
}

function orbitAround(pivot, dAzimuth, dPolar) {
  camGoal = null;
  focusGoal = null;
  const c = camera.position, t = controls.target;
  const ox = c.x - t.x, oy = c.y - t.y, oz = c.z - t.z;
  const r = Math.sqrt(ox * ox + oy * oy + oz * oz);
  if (r < 1e-6) return;
  const phi = Math.acos(Math.max(-1, Math.min(1, oy / r)));
  const theta = Math.atan2(ox, oz);
  const lo = Math.max(controls.minPolarAngle || 0, 1e-4);
  const hi = Math.min(controls.maxPolarAngle === undefined ? Math.PI : controls.maxPolarAngle, Math.PI - 1e-4);
  const dp = Math.max(lo, Math.min(hi, phi + dPolar)) - phi;

  // Kippen um die waagerechte Achse, die zum aktuellen Azimut gehört
  const kx = Math.cos(theta), kz = -Math.sin(theta);
  rotateAround(c, pivot, kx, 0, kz, dp);
  rotateAround(t, pivot, kx, 0, kz, dp);
  rotateAround(c, pivot, 0, 1, 0, dAzimuth);
  rotateAround(t, pivot, 0, 1, 0, dAzimuth);
}

/* =========================================================
   Ghost-Vorschau
   ========================================================= */
function makeGhost(type, params) {
  const g = new THREE.Group();
  if (type === 'road' || type === 'pit') return g;
  if (type === 'container') {
    const lay = containerLayout(params);
    const ls = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(lay.w, lay.h, lay.d)), MAT.ghost);
    ls.position.y = lay.h / 2;
    ls.rotation.y = (params.rot || 0) * Math.PI / 180;
    g.add(ls);
  } else if (type === 'tower') {
    const topY = Math.max(params.hookHeight, 8) + 1.2;
    g.add(makeCircle(Math.max(params.radius, 10), MAT.ghost, topY));
    const mast = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2, topY, 2)), MAT.ghost);
    mast.position.y = topY / 2;
    g.add(mast);
  } else {
    const m = getModel(params.model);
    g.add(makeCircle(Math.max(params.radius, 3), MAT.ghost, Math.max(params.hookHeight, 10)));
    const box = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(m.outL, 3, m.outW)), MAT.ghost);
    box.position.y = 1.5;
    box.rotation.y = (params.rot || 0) * Math.PI / 180;
    g.add(box);
  }
  return g;
}

function setGhost(type, params) {
  clearGhost();
  if (!type) return;
  ghost = makeGhost(type, params);
  ghost.visible = false;
  scene.add(ghost);
}

function clearGhost() {
  if (ghost) {
    disposeGroup(ghost);
    scene.remove(ghost);
    ghost = null;
  }
}

/* =========================================================
   Kennzahlen
   ========================================================= */
function computeStats() {
  let containers = 0, towers = 0, mobiles = 0, roadLength = 0;
  for (let i = 0; i < objects.length; i++) {
    const o = objects[i];
    if (o.type === 'container') {
      const lay = containerLayout(o.params);
      containers += lay.count;
    } else if (o.type === 'tower') towers++;
    else if (o.type === 'mobile') mobiles++;
    else if (o.type === 'road') roadLength += roadInfo(o.params).length;
  }
  return { containers: containers, towers: towers, mobiles: mobiles,
           roadLength: roadLength, total: objects.length };
}

function radiusConflicts() {
  const cranes = objects.filter(function (o) { return o.type === 'tower' || o.type === 'mobile'; });
  const out = [];
  for (let i = 0; i < cranes.length; i++) {
    for (let j = i + 1; j < cranes.length; j++) {
      const a = cranes[i], b = cranes[j];
      const dx = a.x - b.x, dz = a.z - b.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const sum = a.params.radius + b.params.radius;
      if (dist < sum) out.push({ a: a.id, b: b.id, dist: dist, overlap: sum - dist });
    }
  }
  return out;
}

/* =========================================================
   IFC-Export (Rechteckauswahl in der 2D-Ansicht)
   ========================================================= */

/* Rechteck im Rahmen der Ansicht: Die Auswahl richtet sich nach dem Bildschirm, nicht nach Norden. Der Rahmen hat die Achse u (auf dem
   Bildschirm nach rechts, als Richtung (ux, uz) im Grundriss) und v senkrecht dazu (auf dem Bildschirm nach unten, (-uz, ux)). Bei Norden oben
   ist u = Ost (1, 0) und v = Süd (0, 1): dann ist es das gewohnte achsenparallele Rechteck. */
function groundFrameFromCamera() {
  const t = controls.target, dx = camera.position.x - t.x, dz = camera.position.z - t.z, h = Math.sqrt(dx * dx + dz * dz);
  if (!(h > 1e-9)) return { ux: 1, uz: 0 };
  return { ux: dz / h, uz: -dx / h };
}

/* Rechteck aus zwei gegenüberliegenden Ecken a und b (Grundriss x/z) im Rahmen; frame fehlt: achsenparallel.
   Liefert { ux, uz, u0, u1, v0, v1, corners (4 Ecken im Umlaufsinn), minX, minZ, maxX, maxZ (umschließender Kasten) } */
function orientedRect(a, b, frame) {
  const ux = frame ? frame.ux : 1, uz = frame ? frame.uz : 0, vx = -uz, vz = ux;
  const pa = [a.x * ux + a.z * uz, a.x * vx + a.z * vz], pb = [b.x * ux + b.z * uz, b.x * vx + b.z * vz];
  const u0 = Math.min(pa[0], pb[0]), u1 = Math.max(pa[0], pb[0]), v0 = Math.min(pa[1], pb[1]), v1 = Math.max(pa[1], pb[1]);
  const corners = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(function (c) { return [c[0] * ux + c[1] * vx, c[0] * uz + c[1] * vz]; });
  const xs = corners.map(function (c) { return c[0]; }), zs = corners.map(function (c) { return c[1]; });
  return { ux: ux, uz: uz, u0: u0, u1: u1, v0: v0, v1: v1, corners: corners,
           minX: Math.min.apply(null, xs), maxX: Math.max.apply(null, xs), minZ: Math.min.apply(null, zs), maxZ: Math.max.apply(null, zs) };
}

/* Berührt der achsenparallele Kasten [x0, x1] x [z0, z1] das (gedrehte) Rechteck? Trennachsenprobe mit den vier Achsen beider Rechtecke. */
function frameTouchesBox(frame, x0, x1, z0, z1) {
  if (x1 < frame.minX || x0 > frame.maxX || z1 < frame.minZ || z0 > frame.maxZ) return false;
  const boxCorners = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  const axes = [[frame.ux, frame.uz, frame.u0, frame.u1], [-frame.uz, frame.ux, frame.v0, frame.v1]];
  for (let i = 0; i < axes.length; i++) {
    const ax = axes[i];
    let lo = Infinity, hi = -Infinity;
    boxCorners.forEach(function (c) { const p = c[0] * ax[0] + c[1] * ax[1]; if (p < lo) lo = p; if (p > hi) hi = p; });
    if (hi < ax[2] || lo > ax[3]) return false;
  }
  return true;
}

/* Tastet ein eigenes, regelmäßiges Raster über dem Rechteck ab –
   unabhängig von der internen Vertex-Reihenfolge von THREE.PlaneGeometry,
   die dafür nicht erneut nachgebildet werden muss – und liefert Dreiecke
   in Lokalkoordinaten. Das Rechteck wird auf die geladene Kachel begrenzt;
   die Zellgröße folgt der geladenen Geländeauflösung. */
function terrainGridInRect(minX, minZ, maxX, maxZ, frame) {
  const t = TERRAIN;
  if (!t) throw new Error('Bitte zuerst ein Geländemodell laden.');
  const x0 = Math.max(minX, -t.w / 2), x1 = Math.min(maxX, t.w / 2);
  const z0 = Math.max(minZ, -t.d / 2), z1 = Math.min(maxZ, t.d / 2);
  if (!(x1 - x0 > 0.01) || !(z1 - z0 > 0.01)) {
    throw new Error('Das Rechteck liegt außerhalb des geladenen Geländes.');
  }

  const cell = Math.max(t.cell || 1, 0.5);
  const nx = Math.max(2, Math.min(400, Math.round((x1 - x0) / cell) + 1));
  const nz = Math.max(2, Math.min(400, Math.round((z1 - z0) / cell) + 1));

  const grid = [];
  for (let iz = 0; iz < nz; iz++) {
    const z = z0 + (z1 - z0) * (iz / (nz - 1));
    const row = [];
    for (let ix = 0; ix < nx; ix++) {
      const x = x0 + (x1 - x0) * (ix / (nx - 1));
      row.push([x, getHeightAt(x, z), z]);
    }
    grid.push(row);
  }

  const triangles = [];
  for (let iz = 0; iz + 1 < nz; iz++) {
    for (let ix = 0; ix + 1 < nx; ix++) {
      const a = grid[iz][ix], b = grid[iz][ix + 1], c = grid[iz + 1][ix], d = grid[iz + 1][ix + 1];
      // Von oben gesehen (Nord oben) gegen den Uhrzeigersinn, damit die
      // Flächennormalen nach oben zeigen. Mit der umgekehrten Reihenfolge
      // blenden IFC-Betrachter mit Rückseitenausblendung das Gelände aus.
      triangles.push({ a: a, b: c, c: d });
      triangles.push({ a: a, b: d, c: b });
    }
  }
  if (frame) {                                               // gedrehtes Rechteck: das Raster des umschließenden Kastens an den Kanten sauber abschneiden
    const cut = clipTrianglesToRect(triangles, minX, minZ, maxX, maxZ, frame);
    if (!cut.length) throw new Error('Das Rechteck liegt außerhalb des geladenen Geländes.');
    return cut;
  }
  return triangles;
}

/* Schneidet Dreiecke exakt am Rechteck ab (Sutherland-Hodgman gegen die vier Kanten, Grundriss x/z; Höhen werden
   mitgeschnitten). Dreiecke ganz innen bleiben, ganz außen entfallen, die dazwischen werden an der Rechteckkante
   gekappt und als Fächer neu zerlegt, Umlaufsinn bleibt erhalten. Gebäude haben so eine glatte, gerade Schnittkante
   statt langer Dreiecke, die über den Rand hinausragen oder ganz fehlen. */
function clipTrianglesToRect(triangles, minX, minZ, maxX, maxZ, frame) {
  // Abstand eines Punkts von der jeweiligen Rechteckkante, innen positiv (mit frame: Kanten des gedrehten Rechtecks)
  const planes = frame ? [
    { d: function (p) { return p[0] * frame.ux + p[2] * frame.uz - frame.u0; } }, { d: function (p) { return frame.u1 - (p[0] * frame.ux + p[2] * frame.uz); } },
    { d: function (p) { return -p[0] * frame.uz + p[2] * frame.ux - frame.v0; } }, { d: function (p) { return frame.v1 - (-p[0] * frame.uz + p[2] * frame.ux); } }
  ] : [
    { d: function (p) { return p[0] - minX; } }, { d: function (p) { return maxX - p[0]; } },
    { d: function (p) { return p[2] - minZ; } }, { d: function (p) { return maxZ - p[2]; } }
  ];
  const out = [];
  triangles.forEach(function (tri) {
    let poly = [tri.a, tri.b, tri.c];
    let inside = true;
    for (let i = 0; i < 3; i++) {
      const p = poly[i];
      if (frame ? (planes[0].d(p) < 0 || planes[1].d(p) < 0 || planes[2].d(p) < 0 || planes[3].d(p) < 0)
                : (p[0] < minX || p[0] > maxX || p[2] < minZ || p[2] > maxZ)) { inside = false; break; }
    }
    if (inside) { out.push(tri); return; }
    for (let pi = 0; pi < planes.length && poly.length; pi++) {
      const d = planes[pi].d, next = [];
      for (let i = 0; i < poly.length; i++) {
        const p = poly[i], q = poly[(i + 1) % poly.length], dp = d(p), dq = d(q);
        if (dp >= 0) next.push(p);
        if ((dp >= 0) !== (dq >= 0)) {
          const t = dp / (dp - dq);
          next.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t]);
        }
      }
      poly = next;
    }
    for (let i = 1; i + 1 < poly.length; i++) {
      const A = poly[0], B = poly[i], C = poly[i + 1];
      // Entartete Splitter (Fläche null) weglassen
      const area = Math.abs((B[0] - A[0]) * (C[2] - A[2]) - (C[0] - A[0]) * (B[2] - A[2]));
      if (area > 1e-9) out.push({ a: A, b: B, c: C });
    }
  });
  return out;
}

/* Farben im IFC (Rot, Grün, Blau, 0 bis 1): Gelände und Gebäude einheitlich; Bausteine nehmen ihre Farben aus den Materialien */
const IFC_COLOR_TERRAIN = [0.56, 0.62, 0.42];
const IFC_COLOR_BUILDING = [0.82, 0.8, 0.76];
const IFC_COLOR_OBJECT = [0.65, 0.65, 0.65];

/* Darstellungshilfen der Straße (blaue Schleppkurve, Überlagerungen im Abtrag): kein Bauteil, nicht exportieren */
const IFC_SKIP_KINDS = { roadAxis: 1, sweptFill: 1, sweptLine: 1, sweptOver: 1, cutOverlay: 1, roadOverlay: 1, cutCrest: 1 };

/* Alle Dreiecke eines Bausteins (Straße, Baugrube, Kran, Container) in Weltkoordinaten [x, y, z].
   Linien (Kranradius, Kanten) und Darstellungshilfen bleiben draußen; bei Instanzen (Container, Kranteile)
   wird jede Instanz mit ihrer Matrix gesetzt. */
function objectTriangles(root) {
  root.updateMatrixWorld(true);
  const tris = [];
  const inst = new THREE.Matrix4(), full = new THREE.Matrix4();
  // Farbe = Materialfarbe mal Instanzfarbe (Container: weißes Material, Farbe je Instanz)
  function rgbOf(c) {
    if (!c) return [1, 1, 1];
    if (typeof c.r === 'number') return [c.r, c.g, c.b];
    const h = c.hex !== undefined ? c.hex : 0xffffff;
    return [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
  }
  function emit(geo, m, col) {
    const pos = geo && geo.attributes && geo.attributes.position;
    if (!pos || !pos.array) return;
    const idx = geo.index && geo.index.array ? geo.index.array : null;
    const P = pos.array, e = m.elements, count = idx ? idx.length : Math.floor(pos.array.length / 3);
    function at(i) {
      const k = (idx ? idx[i] : i) * 3, x = P[k], y = P[k + 1], z = P[k + 2];
      return [e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]];
    }
    for (let i = 0; i + 2 < count; i += 3) tris.push({ a: at(i), b: at(i + 1), c: at(i + 2), col: col });
  }
  root.traverse(function (o) {
    const isInst = o instanceof THREE.InstancedMesh;
    if (!(o instanceof THREE.Mesh) && !isInst) return;
    if (o.visible === false || (o.userData && IFC_SKIP_KINDS[o.userData.kind])) return;
    const base = rgbOf(o.material && o.material.color);
    if (isInst) {
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, inst);
        full.multiplyMatrices(o.matrixWorld, inst);
        let col = base;
        if (o.instanceColor && o.instanceColor.array) {
          const k = i * 3, ic = o.instanceColor.array;
          col = [base[0] * ic[k], base[1] * ic[k + 1], base[2] * ic[k + 2]];
        } else if (o.instanceColors && o.instanceColors[i] !== null && o.instanceColors[i] !== undefined) {
          const ic = rgbOf({ hex: o.instanceColors[i] });
          col = [base[0] * ic[0], base[1] * ic[1], base[2] * ic[2]];
        }
        emit(o.geometry, full, col);
      }
    } else emit(o.geometry, o.matrixWorld, base);
  });
  return tris;
}

/* Name eines Bausteins im IFC */
function objectIfcName(obj) {
  const names = { road: 'Baustraße', pit: 'Baugrube', container: 'Container', tower: 'Turmdrehkran', mobile: 'Mobilkran' };
  const base = names[obj.type] || obj.type;
  const sub = obj.type === 'mobile' && obj.params && obj.params.model ? ' (' + getModel(obj.params.model).name + ')' : '';
  return base + sub + ' ' + obj.id;
}

/* Bausteine, die das Rechteck berühren, mit ihren Dreiecken: [{ name, type, triangles }] */
function collectExportObjects(minX, minZ, maxX, maxZ, frame) {
  const out = [];
  (objects || []).forEach(function (obj) {
    const tris = objectTriangles(obj.group);
    if (!tris.length) return;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    tris.forEach(function (t) {
      [t.a, t.b, t.c].forEach(function (p) {
        if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
        if (p[2] < z0) z0 = p[2]; if (p[2] > z1) z1 = p[2];
      });
    });
    if (frame ? !frameTouchesBox(frame, x0, x1, z0, z1) : (x1 < minX || x0 > maxX || z1 < minZ || z0 > maxZ)) return;
    out.push({ name: objectIfcName(obj), type: obj.type, triangles: tris });
  });
  return out;
}

/* Geländeraster + Gebäude-Dreiecke innerhalb des Rechtecks, auf Wunsch (withObjects) auch die Bausteine.
   rings kommt vom Aufrufer (in ui.js liegt lastGmlRings), damit app.js wie überall
   sonst auch hier keine Kenntnis vom Dateiimport-Zustand braucht. */
function collectExportGeometry(rings, minX, minZ, maxX, maxZ, withObjects, frame) {
  const terrain = terrainGridInRect(minX, minZ, maxX, maxZ, frame);
  let buildings = [];
  if (rings && rings.length) {
    buildings = clipTrianglesToRect(triangulateBuildingRings(rings).triangles, minX, minZ, maxX, maxZ, frame);
  }
  return { terrain: terrain, buildings: buildings, objects: withObjects ? collectExportObjects(minX, minZ, maxX, maxZ, frame) : [] };
}

function trianglesToGeometry(triangles) {
  const positions = [];
  triangles.forEach(function (tri) {
    const pts = [tri.a, tri.b, tri.c];
    for (let k = 0; k < 3; k++) positions.push(pts[k][0], pts[k][1], pts[k][2]);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.computeVertexNormals();
  return geo;
}

/* Vorschau-Mesh aus genau den Dreiecken, die auch ins IFC wandern – "was
   man sieht" und "was exportiert wird" sind damit garantiert identisch. */
function buildExportPreview(geo) {
  const group = new THREE.Group();
  group.name = '__exportPreview';
  if (geo.terrain.length) {
    const m = new THREE.Mesh(trianglesToGeometry(geo.terrain), MAT.exportHighlight);
    m.renderOrder = 5;
    group.add(m);
  }
  if (geo.buildings.length) {
    const m = new THREE.Mesh(trianglesToGeometry(geo.buildings), MAT.exportHighlight);
    m.renderOrder = 5;
    group.add(m);
  }
  return group;
}

/* Kamera auf das Rechteck einrahmen, fest mit 45° Neigung (anders als
   frameObjects() wird die bisherige Blickrichtung NICHT beibehalten: aus
   der Draufsicht kommend zeigte sie sonst weiter senkrecht nach unten). */
function frameRect(minX, minZ, maxX, maxZ) {
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  let maxy = 0;
  [[minX, minZ], [maxX, minZ], [minX, maxZ], [maxX, maxZ], [cx, cz]].forEach(function (p) {
    const h = getHeightAt(p[0], p[1]);
    if (h > maxy) maxy = h;
  });
  const radius = Math.max(Math.max(maxX - minX, maxZ - minZ) / 2, 20);
  focusGoal = new THREE.Vector3(cx, maxy * 0.5, cz);

  const fov = camera.fov * Math.PI / 180;
  const dist = (radius / Math.tan(fov / 2)) * 1.45 + radius;

  const tilt = Math.PI / 4;
  // Blickrichtung um die Hochachse bleibt, wie sie ist (aus der Draufsicht kommend); ohne erkennbare Richtung die feste Diagonale
  let ux = 0.6, uz = 0.8;
  const hx = camera.position.x - controls.target.x, hz = camera.position.z - controls.target.z, hh = Math.sqrt(hx * hx + hz * hz);
  if (hh > 1e-9) { ux = hx / hh; uz = hz / hh; }
  camGoal = new THREE.Vector3(
    cx + ux * Math.cos(tilt) * dist,
    focusGoal.y + Math.sin(tilt) * dist,
    cz + uz * Math.cos(tilt) * dist
  );
  topView = false;
}

/* IFC-GUIDs sind 128 Bit in 22 Zeichen: das erste Zeichen trägt nur 2 Bit
   (also '0'..'3'), die restlichen 21 je 6 Bit. Zufällige Zeichen aus dem
   ganzen Alphabet sind formal ungültig, strengere Programme lehnen die
   Datei dann als beschädigt ab. */
const IFC_GUID_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
function ifcGuid() {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  let bits = '';
  for (let i = 0; i < 16; i++) bits += ('00000000' + bytes[i].toString(2)).slice(-8);
  let s = IFC_GUID_CHARS[parseInt(bits.slice(0, 2), 2)];
  for (let i = 2; i < 128; i += 6) s += IFC_GUID_CHARS[parseInt(bits.slice(i, i + 6), 2)];
  return s;
}

/* STEP-Text (ISO 10303-21): nur ASCII; alles andere als \X2\...\X0\
   (UTF-16-Einheiten). Rohe UTF-8-Bytes wie bei "Gelände" machen die Datei
   für viele Leser ungültig. */
function ifcString(s) {
  let out = '';
  let run = '';
  function flush() {
    if (run) { out += '\\X2\\' + run + '\\X0\\'; run = ''; }
  }
  const str = String(s);
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c >= 32 && c <= 126) {
      flush();
      const ch = str[i];
      out += ch === "'" ? "''" : (ch === '\\' ? '\\\\' : ch);
    } else {
      run += ('0000' + c.toString(16).toUpperCase()).slice(-4);
    }
  }
  flush();
  return "'" + out + "'";
}

/* Schreibt ein minimales, gültiges IFC4-STEP-Dokument von Hand (der
   benötigte Entity-Umfang ist klein genug, dass sich eine externe
   IFC-Bibliothek dafür nicht lohnt). Georeferenz über IfcProjectedCRS +
   IfcMapConversion, im EPSG-Code des geladenen Geländes oder (opts.targetEpsg) in einem
   anderen der Liste IFC_TARGET_CRS: dann werden alle Punkte mit crsTransformer umgerechnet
   (nur absolute Koordinaten). Bei Bessel-Systemen (DHDN, MGI) gilt eine Helmert-Transformation,
   die Lage stimmt auf etwa 1 bis 3 m - die Oberfläche sagt das dazu; ein Umrechnungsgitter
   (NTv2) liegt nicht bei.
   Bausteine (geo.objects: Straße, Baugrube, Kran, Container) kommen als eigene Bauteile mit.
   Zwei Arten der Koordinaten (opts.coords):
   'local' (Standard von buildIfc): Geometrie relativ zur Rechteck-Südwestecke,
   die Lage steckt in IfcMapConversion - übliche IFC4-Praxis, kleine Zahlen,
   viele Betrachter zeigen aber dann Werte nahe 0.
   'abs': die Koordinaten im Bezugssystem stehen direkt in der Geometrie
   (Rechtswert, Hochwert, Höhe ü. NHN); IfcMapConversion bleibt als Nullversatz
   erhalten, damit das Bezugssystem benannt ist, ohne doppelt zu verschieben.
   Die Oberfläche bietet 'abs' als Voreinstellung an, weil sonst "nicht
   georeferenziert" gemeldet wurde. */
function buildIfc(geo, rectMinX, rectMinZ, epsg, opts) {
  const outEpsg = opts && opts.targetEpsg ? opts.targetEpsg : epsg;
  // Anderes Zielsystem: nur absolute Koordinaten (jeder Punkt wird umgerechnet; die Drehung der
  // Achsen gegenüber dem Gelände steckt dann in den Koordinaten, nicht in einer Georeferenz)
  const absolute = !!(opts && opts.coords === 'abs') || outEpsg !== epsg;
  if (!TERRAIN) throw new Error('Bitte zuerst ein Geländemodell laden.');
  const objs = geo.objects || [];
  if (!geo.terrain.length && !geo.buildings.length && !objs.length) {
    throw new Error('Der Ausschnitt enthält keine Geometrie.');
  }
  const transform = outEpsg !== epsg ? crsTransformer(epsg, outEpsg) : null;
  if (outEpsg !== epsg && !transform) throw new Error('Diese Umrechnung ist nicht möglich: EPSG:' + epsg + ' nach EPSG:' + outEpsg + '.');

  const target = worldToUTM(rectMinX, rectMinZ);

  const lines = [];
  let nextId = 0;
  function num(n) {
    if (!isFinite(n)) return '0.';
    const s = (Math.round(n * 1000) / 1000).toString();
    return s.indexOf('.') === -1 ? s + '.' : s;
  }
  const str = ifcString;
  function add(type, args) {
    nextId++;
    lines.push('#' + nextId + '=' + type + '(' + args + ');');
    return '#' + nextId;
  }
  // IFC: Z ist oben, Y ist Norden (folgt aus IfcMapConversion unten:
  // XAxisAbscissa=1/XAxisOrdinate=0, also IFC-X ohne Drehung = Osten).
  // Im Szenengraphen ist es umgekehrt (+x=Ost, -z=Nord, y=Höhe) - beim
  // Schreiben ins IFC deshalb Höhe und Nord/Süd vertauschen, sonst liegt
  // das Modell auf der Seite. (x, y, z) -> (x, -z, y) ist eine echte
  // Drehung, die Dreiecksreihenfolge bleibt also erhalten.
  function localize(p) {
    if (transform) {
      const q = transform(TERRAIN.originE + p[0], TERRAIN.originN - p[2]);
      return [q.e, q.n, p[1] + TERRAIN.zmin];
    }
    if (absolute) return [TERRAIN.originE + p[0], TERRAIN.originN - p[2], p[1] + TERRAIN.zmin];
    return [p[0] - rectMinX, -(p[2] - rectMinZ), p[1]];
  }
  // Längen- oder Breitengrad als IfcCompoundPlaneAngleMeasure (Grad, Minuten, Sekunden, Millionstel; alle mit dem Vorzeichen)
  function dms(deg) {
    const sg = deg < 0 ? -1 : 1, v = Math.abs(deg);
    let d = Math.floor(v), m = Math.floor((v - d) * 60), s = Math.floor(((v - d) * 60 - m) * 60);
    let u = Math.round((((v - d) * 60 - m) * 60 - s) * 1e6);
    if (u >= 1e6) { u -= 1e6; s++; }
    if (s >= 60) { s -= 60; m++; }
    if (m >= 60) { m -= 60; d++; }
    return '(' + [d, m, s, u].map(function (x) { return sg * x; }).join(',') + ')';
  }

  // Der Besitzernachweis ist in IFC4 formal optional, die Referenz-
  // Anforderungen der gängigen Betrachter erwarten ihn aber.
  const organization = add('IFCORGANIZATION', "$," + str('Quick-Site-Design') + ',$,$,$');
  const person = add('IFCPERSON', '$,' + str('Quick-Site-Design') + ',$,$,$,$,$,$');
  const personOrg = add('IFCPERSONANDORGANIZATION', person + ',' + organization + ',$');
  const application = add('IFCAPPLICATION',
    organization + ',' + str('1.0') + ',' + str('Quick-Site-Design') + ',' + str('QSD'));
  const owner = add('IFCOWNERHISTORY',
    personOrg + ',' + application + ',$,.ADDED.,$,$,$,' + Math.floor(Date.now() / 1000));

  const lengthUnit = add('IFCSIUNIT', '*,.LENGTHUNIT.,$,.METRE.');
  const unitAssignment = add('IFCUNITASSIGNMENT', '(' + lengthUnit + ')');
  const originPoint = add('IFCCARTESIANPOINT', '(0.,0.,0.)');
  const worldPlacement = add('IFCAXIS2PLACEMENT3D', originPoint + ',$,$');
  const context = add('IFCGEOMETRICREPRESENTATIONCONTEXT',
    '$,' + str('Model') + ',3,1.E-5,' + worldPlacement + ',$');
  const bodyContext = add('IFCGEOMETRICREPRESENTATIONSUBCONTEXT',
    str('Body') + ',' + str('Model') + ',*,*,*,*,' + context + ',$,.MODEL_VIEW.,$');

  // Beschreibung, Datum, Abbildung und Zone nur, wo sie sich aus dem EPSG-Code ableiten lassen
  const crsDef = crsGeoDefinition(outEpsg);
  let datum = '$', zone = '$';
  if (crsDef && !crsDef.merc) {
    if (outEpsg >= 31466 && outEpsg <= 31469) datum = 'DHDN';
    else if (outEpsg >= 31254 && outEpsg <= 31256) datum = 'MGI';
    else if (outEpsg >= 32601 && outEpsg <= 32660) datum = 'WGS84';
    else datum = 'ETRS89';
    if (outEpsg >= 25828 && outEpsg <= 25838) zone = (outEpsg - 25800) + 'N';
    else if (outEpsg >= 32601 && outEpsg <= 32660) zone = (outEpsg - 32600) + 'N';
    else if (outEpsg === 4647) zone = '32N';
    else if (outEpsg === 5650) zone = '33N';
  }
  const projectedCrs = add('IFCPROJECTEDCRS',
    str('EPSG:' + outEpsg) + ',' + (EPSG_NAMES[outEpsg] ? str(EPSG_NAMES[outEpsg]) : '$') + ',' +
    (datum === '$' ? '$' : str(datum)) + ',$,' + (crsDef && !crsDef.merc ? str(crsDef.laea ? 'LambertAzimuthalEqualArea' : 'TransverseMercator') : '$') + ',' +
    (zone === '$' ? '$' : str(zone)) + ',' + lengthUnit);
  // OrthogonalHeight: die reale Höhe, die lokal Z=0 entspricht. Lokal Z=0
  // ist TERRAIN.zmin (dort setzt auch die Höhe im Szenengraphen auf 0),
  // nicht 0 m ü. NHN.
  add('IFCMAPCONVERSION',
    context + ',' + projectedCrs + ',' +
    (absolute ? '0.,0.,0.' : num(target.e) + ',' + num(target.n) + ',' + num(TERRAIN.zmin)) + ',1.,0.,1.');

  const siteLocalPlacement = add('IFCLOCALPLACEMENT', '$,' + worldPlacement);
  const project = add('IFCPROJECT',
    str(ifcGuid()) + ',' + owner + ',' + str('Quick-Site-Design Ausschnitt') + ',$,$,$,$,(' + context + '),' + unitAssignment);
  // Breite, Länge und Höhe der Baustelle für Programme, die nicht IfcMapConversion, sondern IfcSite auswerten
  const siteGeo = crsToLonLat(epsg, target.e, target.n);
  const site = add('IFCSITE',
    str(ifcGuid()) + ',' + owner + ',' + str('Baustelle') + ',$,$,' + siteLocalPlacement + ',$,$,.ELEMENT.,' +
    (siteGeo ? dms(siteGeo.lat) + ',' + dms(siteGeo.lon) + ',' + num(TERRAIN.zmin) : '$,$,$') + ',$,$');
  add('IFCRELAGGREGATES', str(ifcGuid()) + ',' + owner + ',$,$,' + project + ',(' + site + ')');

  const elements = [];

  // Gleiche Eckpunkte nur einmal schreiben: das Geländeraster teilt jeden
  // Punkt zwischen bis zu sechs Dreiecken, ohne Zusammenfassen wird die
  // Datei viermal so groß und die eine Zeile mit der Punktliste sprengt
  // manche Leser.
  // Je Farbe ein Oberflächenstil (IfcSurfaceStyle), gemeinsam für alle Bauteile mit dieser Farbe
  const styles = new Map();
  function styleFor(rgb) {
    const c = rgb.map(function (v) { return Math.max(0, Math.min(1, Math.round(v * 1000) / 1000)); });
    const key = c.join(',');
    if (!styles.has(key)) {
      const col = add('IFCCOLOURRGB', '$,' + c.map(function (v) { return num(v); }).join(','));
      const rend = add('IFCSURFACESTYLERENDERING', col + ',$,$,$,$,$,$,$,.NOTDEFINED.');
      styles.set(key, add('IFCSURFACESTYLE', '$,.BOTH.,(' + rend + ')'));
    }
    return styles.get(key);
  }
  // Ein Bauteil mit einer Fläche je Farbe (tri.col; fehlt sie, gilt defaultColor)
  function addGroup(triangles, name, entityType, predefinedType, defaultColor) {
    if (!triangles.length) return;
    const parts = new Map();
    triangles.forEach(function (tri) {
      const c = tri.col || defaultColor;
      const k = c.map(function (v) { return Math.round(v * 1000); }).join(',');
      if (!parts.has(k)) parts.set(k, { col: c, tris: [] });
      parts.get(k).tris.push(tri);
    });
    const faceSets = [];
    parts.forEach(function (part) {
      // Gleiche Eckpunkte nur einmal je Fläche
      const index = new Map();
      const pts = [];
      const faces = [];
      part.tris.forEach(function (tri) {
        const f = [];
        [tri.a, tri.b, tri.c].forEach(function (p) {
          const q = localize(p).map(function (v) { return num(v); });
          const key = q.join(',');
          let i = index.get(key);
          if (i === undefined) {
            pts.push('(' + key + ')');
            i = pts.length;
            index.set(key, i);
          }
          f.push(i);
        });
        if (f[0] !== f[1] && f[1] !== f[2] && f[0] !== f[2]) faces.push('(' + f.join(',') + ')');
      });
      if (!faces.length) return;
      const coordList = add('IFCCARTESIANPOINTLIST3D', '(' + pts.join(',') + ')');
      const faceSet = add('IFCTRIANGULATEDFACESET', coordList + ',$,.F.,(' + faces.join(',') + '),$');
      add('IFCSTYLEDITEM', faceSet + ',(' + styleFor(part.col) + '),$');
      faceSets.push(faceSet);
    });
    if (!faceSets.length) return;
    const shapeRep = add('IFCSHAPEREPRESENTATION', bodyContext + ',' + str('Body') + ',' + str('Tessellation') + ',(' + faceSets.join(',') + ')');
    const productShape = add('IFCPRODUCTDEFINITIONSHAPE', '$,$,(' + shapeRep + ')');
    const placement = add('IFCLOCALPLACEMENT', siteLocalPlacement + ',' + worldPlacement);
    // Beide Elementarten haben neun Attribute; das Tag steht vor dem
    // PredefinedType (beim Gelände fehlte es früher, der Typ verrutschte).
    const el = add(entityType,
      str(ifcGuid()) + ',' + owner + ',' + str(name) + ',$,$,' + placement + ',' + productShape +
      ',$,' + predefinedType);
    elements.push(el);
  }

  addGroup(geo.terrain, 'Gelände (Ausschnitt)', 'IFCGEOGRAPHICELEMENT', '.TERRAIN.', IFC_COLOR_TERRAIN);
  addGroup(geo.buildings, 'Gebäude (Ausschnitt)', 'IFCBUILDINGELEMENTPROXY', '.NOTDEFINED.', IFC_COLOR_BUILDING);
  objs.forEach(function (o) { addGroup(o.triangles, o.name, 'IFCBUILDINGELEMENTPROXY', '.NOTDEFINED.', IFC_COLOR_OBJECT); });

  if (elements.length) {
    add('IFCRELCONTAINEDINSPATIALSTRUCTURE', str(ifcGuid()) + ',' + owner + ',$,$,(' + elements.join(',') + '),' + site);
  }

  const header = [
    'ISO-10303-21;',
    'HEADER;',
    "FILE_DESCRIPTION(('ViewDefinition [ReferenceView_V1.2]'),'2;1');",
    "FILE_NAME('export.ifc','" + new Date().toISOString().slice(0, 19) + "',(''),('Quick-Site-Design'),'Quick-Site-Design','Quick-Site-Design','');",
    "FILE_SCHEMA(('IFC4'));",
    'ENDSEC;',
    'DATA;'
  ];
  const footer = ['ENDSEC;', 'END-ISO-10303-21;'];
  return header.concat(lines, footer).join('\n') + '\n';
}

/* =========================================================
   IFC-Import
   Ein Bauwerk als IFC-Datei auf dem Gelände platzieren. Gelesen wird mit
   web-ifc (lib/, MPL-2.0, erst beim ersten Import nachgeladen). web-ifc liefert
   die Geometrie in Metern und im Szenenformat dieser Anwendung (+x Ost, y oben,
   -z Nord), verschoben um eine "Koordinationsmatrix" (nur Verschiebung), damit
   große Koordinaten nicht die Genauigkeit der Fließkommazahlen sprengen.
   Platzierung:
   - automatisch, wenn das Bauwerk eine IfcMapConversion mit demselben EPSG-Code
     wie das Gelände trägt (ifcAutoPlacement);
   - sonst von Hand über zwei Punkte am Bauwerk und zwei Punkte im Gelände
     (ifcTwoPointPlacement). Das Bauwerk steht dabei immer waagerecht: es wird nur um
     die Hochachse gedreht und verschoben, nicht gekippt oder skaliert.
   ========================================================= */
const IFC_MAX_BYTES = 300e6;
const IFC_LIB_SCRIPT = 'lib/web-ifc-api-iife.js';
const IFC_LIB_DIR = 'lib/';
let webIfcApi = null;               // IfcAPI nach Init
let webIfcLoading = null;           // laufendes Laden der Bibliothek
/* Kippwinkel der Kamera (0 = senkrecht von oben): ohne Bauwerk nur bis zur Waagerechten, mit einem IFC-Bauwerk auch
   von unten (Untersicht einer Brücke, Gründungen) */
const POLAR_GROUND = Math.PI * 0.492;
const POLAR_BELOW = Math.PI * 0.95;
let ifcModel = null;                // { group, name, coord, georef, placement, de, dn, dz, rot, bbox }

const IFC_PREFIX = { MILLI: 0.001, CENTI: 0.01, DECI: 0.1, KILO: 1000 };

function ifcVal(x) { return x && typeof x === 'object' && 'value' in x ? x.value : x; }

/* Lädt web-ifc aus lib/ (nur im Browser, nur einmal) */
function getWebIfc() {
  if (webIfcApi) return Promise.resolve(webIfcApi);
  if (webIfcLoading) return webIfcLoading;
  webIfcLoading = new Promise(function (resolve, reject) {
    function init() {
      try {
        const api = new WebIFC.IfcAPI();
        let dir = IFC_LIB_DIR;
        try { dir = new URL(IFC_LIB_DIR, document.baseURI).href; } catch (e) { /* relativ lassen */ }
        api.SetWasmPath(dir, dir !== IFC_LIB_DIR);
        Promise.resolve(api.Init()).then(function () { webIfcApi = api; resolve(api); }, reject);
      } catch (e) { reject(e); }
    }
    if (typeof WebIFC !== 'undefined') { init(); return; }
    const s = document.createElement('script');
    s.src = IFC_LIB_SCRIPT;
    s.onload = init;
    s.onerror = function () { webIfcLoading = null; reject(new Error('ifcLibFail')); };
    document.head.appendChild(s);
  }).catch(function (e) { webIfcLoading = null; throw e; });
  return webIfcLoading;
}

/* Längeneinheit des Projekts in Metern. Maßgeblich ist IfcProject.UnitsInContext: eine Datei kann weitere IfcSIUnit mit
   LENGTHUNIT enthalten (MapUnit, Bestandteile abgeleiteter Einheiten), auch vor der des Projekts. Steht dort keine
   metrische Längeneinheit, gilt die erste IfcSIUnit mit LENGTHUNIT der Datei, sonst Meter. */
function ifcProjectUnit(api, modelId, W) {
  const isLength = function (u) { return !!u && String(ifcVal(u.UnitType)) === 'LENGTHUNIT'; };
  const factor = function (u) { return IFC_PREFIX[String(ifcVal(u.Prefix) || '').toUpperCase()] || 1; };
  const line = function (ref) { const r = ifcVal(ref); return r ? api.GetLine(modelId, r) : null; };
  try {
    const ps = api.GetLineIDsWithType(modelId, W.IFCPROJECT);
    const project = ps.size() ? api.GetLine(modelId, ps.get(0)) : null;
    const assignment = project ? line(project.UnitsInContext) : null;
    const units = (assignment && assignment.Units) || [];
    for (let i = 0; i < units.length; i++) {
      const u = line(units[i]);
      // Name METRE: nur IfcSIUnit; eine IfcConversionBasedUnit (z. B. Fuß) hat keinen Vorsatz und wird nicht ausgewertet
      if (isLength(u) && String(ifcVal(u.Name)) === 'METRE') return factor(u);
    }
  } catch (e) { /* unlesbare Zuordnung: Rückfall unten */ }
  try {
    const us = api.GetLineIDsWithType(modelId, W.IFCSIUNIT);
    for (let i = 0; i < us.size(); i++) {
      const u = api.GetLine(modelId, us.get(i));
      if (isLength(u)) return factor(u);
    }
  } catch (e) { /* Meter */ }
  return 1;
}

/* Lesen der Georeferenz: IfcMapConversion und IfcProjectedCRS. Liefert null, wenn keine da ist.
   Die Einheiten: web-ifc rechnet die Geometrie in Meter um; die Umrechnung der Karte
   (Eastings, Northings, Höhe) steht in der Kartenmaßeinheit des Koordinatensystems, Scale
   rechnet von den Projekteinheiten dorthin. Wirksamer Faktor von Geometrie-Metern in
   Kartenmeter: Scale * Kartenmeter je Karteneinheit / Meter je Projekteinheit. */
function ifcReadGeoref(api, modelId, W) {
  const ids = api.GetLineIDsWithType(modelId, W.IFCMAPCONVERSION);
  if (!ids || !ids.size || !ids.size()) return null;
  const l = api.GetLine(modelId, ids.get(0));
  const crs = l.TargetCRS ? api.GetLine(modelId, ifcVal(l.TargetCRS)) : null;
  let epsg = null, crsName = '';
  if (crs) {
    crsName = String(ifcVal(crs.Name) || '');
    const m = (crsName + ' ' + String(ifcVal(crs.Description) || '')).match(/EPSG\s*:?\s*(\d{4,5})/i);
    if (m) epsg = canonicalEpsg(parseInt(m[1], 10));
  }
  function unitFactor(unitRef) {
    const r = ifcVal(unitRef);
    if (!r) return 1;
    try {
      const u = api.GetLine(modelId, r);
      const pre = String(ifcVal(u.Prefix) || '').toUpperCase();
      return IFC_PREFIX[pre] || 1;
    } catch (e) { return 1; }
  }
  const mapUnit = crs && crs.MapUnit ? unitFactor(crs.MapUnit) : 1;
  const projUnit = ifcProjectUnit(api, modelId, W);
  const num = function (x, d) { const v = ifcVal(x); return (v === null || v === undefined || !isFinite(v)) ? d : Number(v); };
  return {
    epsg: epsg, crsName: crsName,
    E0: num(l.Eastings, 0), N0: num(l.Northings, 0), H0: num(l.OrthogonalHeight, 0),
    a: num(l.XAxisAbscissa, 1), b: num(l.XAxisOrdinate, 0), scale: num(l.Scale, 1),
    mapUnit: mapUnit, projUnit: projUnit
  };
}

/* Gruppen-Transformation (Drehung um die Hochachse, Maßstab, Position) aus der Georeferenz.
   coord = Verschiebung der Koordinationsmatrix [tx,ty,tz]; terrain = TERRAIN. */
function ifcAutoPlacement(g, coord, terrain) {
  const mag = Math.hypot(g.a, g.b) || 1;
  const ca = g.a / mag, sb = g.b / mag;
  const s = g.scale * g.mapUnit / g.projUnit;
  const E0 = g.E0 * g.mapUnit, N0 = g.N0 * g.mapUnit, H0 = g.H0 * g.mapUnit;
  const tx = coord[0], ty = coord[1], tz = coord[2];
  return {
    rotY: Math.atan2(sb, ca), scale: s,
    x: E0 - terrain.originE - s * (ca * tx + sb * tz),
    y: H0 - terrain.zmin - s * ty,
    z: terrain.originN - N0 + s * (sb * tx - ca * tz)
  };
}

/* Ohne Georeferenz: Stehen in der Datei selbst Landeskoordinaten (im System des Geländes), liegt die Mitte des Bauwerks
   im Gelände. Dann gilt die Lage aus der Datei, sonst null. */
function ifcRawPlacement(bbox, coord, terrain) {
  const pl = ifcAutoPlacement({ E0: 0, N0: 0, H0: 0, a: 1, b: 0, scale: 1, mapUnit: 1, projUnit: 1 }, coord, terrain);
  const x = pl.x + (bbox.minX + bbox.maxX) / 2, z = pl.z + (bbox.minZ + bbox.maxZ) / 2;
  return Math.abs(x) <= terrain.w / 2 && Math.abs(z) <= terrain.d / 2 ? pl : null;
}

/* Sehen die Koordinaten der Datei nach Gauß-Krüger (DHDN) in Deutschland aus? Liefert den EPSG-Code der Zone oder null */
function ifcGuessGk(bbox, coord) {
  const e = (bbox.minX + bbox.maxX) / 2 - coord[0], n = -((bbox.minZ + bbox.maxZ) / 2 - coord[2]);
  const zone = Math.floor(e / 1e6);
  const rest = e - zone * 1e6;
  return zone >= 2 && zone <= 5 && rest >= 150000 && rest <= 850000 && n >= 5.2e6 && n <= 6.2e6 ? 31464 + zone : null;
}

/* ---------- Mehrere IFC-Dateien ----------
   Ein Bauwerk liegt oft in mehreren Dateien (Überbau, Unterbau, Behelfe). Sie werden zu einem Modell zusammengefasst:
   Jede Datei bekommt aus ihrer Georeferenz (sonst gelten die Koordinaten der Datei) ihren Platz zu einem gemeinsamen
   Bezugspunkt, danach wirken Platzieren, Schieben und Entfernen auf alles zusammen. Dateien in einem anderen
   Bezugssystem oder weit weg (mehr als IFC_MAX_SPREAD) bleiben weg. */
const IFC_MAX_SPREAD = 20000;
const IFC_PLAIN_GEOREF = { E0: 0, N0: 0, H0: 0, a: 1, b: 0, scale: 1, mapUnit: 1, projUnit: 1 };

/* Ecken der Bounding-Box eines Netzes nach Drehung, Maßstab und Verschiebung */
function ifcBoxCorners(b, pl) {
  const c = Math.cos(pl.rotY), s = Math.sin(pl.rotY), out = [];
  [b.minX, b.maxX].forEach(function (x) {
    [b.minY, b.maxY].forEach(function (y) {
      [b.minZ, b.maxZ].forEach(function (z) {
        out.push({ x: pl.x + pl.scale * (c * x + s * z), y: pl.y + pl.scale * y, z: pl.z + pl.scale * (-s * x + c * z) });
      });
    });
  });
  return out;
}

/* Mitte einer Datei in Landeskoordinaten (Rechtswert, Hochwert, Höhe) */
function ifcMapCentre(part) {
  const pl = ifcAutoPlacement(part.georef || IFC_PLAIN_GEOREF, part.coord, { originE: 0, originN: 0, zmin: 0 });
  const list = ifcBoxCorners(ifcBox(part), pl);
  const sum = list.reduce(function (a, p) { return { x: a.x + p.x, y: a.y + p.y, z: a.z + p.z }; }, { x: 0, y: 0, z: 0 });
  return { e: sum.x / 8, n: -sum.z / 8, h: sum.y / 8 };
}

/* parts: gelesene Dateien wie aus ifcReadModel. anchor: Index der Datei, in deren Koordinaten das zusammengefasste
   Modell liegt (beim Dazulegen die schon geladene, dann bleibt sie genau an ihrer Stelle); ohne Angabe die erste mit
   genanntem Bezugssystem, sonst die mit den größten Koordinaten (Landeskoordinaten).
   Ergebnis { model (mit model.parts, Anker zuerst), used, skipped: [{ name, why: 'crs' | 'far' }] } */
function ifcCombine(parts, anchor) {
  if (parts.length === 1) {
    const only = parts[0];
    only.parts = [Object.assign({}, only, { parts: undefined })];
    return { model: only, used: 1, skipped: [] };
  }
  const centres = parts.map(ifcMapCentre);
  let a = anchor;
  if (a === undefined) {
    a = parts.findIndex(function (p) { return p.georef && p.georef.epsg; });
    if (a < 0) {
      a = 0;
      centres.forEach(function (c, i) { if (Math.abs(c.e) + Math.abs(c.n) > Math.abs(centres[a].e) + Math.abs(centres[a].n)) a = i; });
    }
  }
  const A = parts[a];
  const zero = { originE: 0, originN: 0, zmin: 0 };
  const ta = ifcAutoPlacement(A.georef || IFC_PLAIN_GEOREF, A.coord, zero);
  let epsg = A.georef && A.georef.epsg;
  if (!epsg) parts.some(function (p) { epsg = p.georef && p.georef.epsg; return !!epsg; });
  const group = new THREE.Group();
  const skipped = [], used = [];
  const empty = function () { return { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity }; };
  const box = empty(), core = empty();
  const grow = function (target, list) {
    list.forEach(function (q) {
      target.minX = Math.min(target.minX, q.x); target.maxX = Math.max(target.maxX, q.x);
      target.minY = Math.min(target.minY, q.y); target.maxY = Math.max(target.maxY, q.y);
      target.minZ = Math.min(target.minZ, q.z); target.maxZ = Math.max(target.maxZ, q.z);
    });
  };
  let triangles = 0;
  [a].concat(parts.map(function (p, i) { return i; }).filter(function (i) { return i !== a; })).forEach(function (i) {
    const p = parts[i];
    const other = p.georef && p.georef.epsg;
    const why = other && epsg && other !== epsg ? 'crs'
      : Math.hypot(centres[i].e - centres[a].e, centres[i].n - centres[a].n) > IFC_MAX_SPREAD ? 'far' : null;
    if (why && i !== a) { skipped.push({ name: p.name, why: why }); ifcClosePart(p); disposeGroup(p.group); return; }
    // Lage der Datei in Landeskoordinaten, zurückgerechnet in den Rahmen der Ankerdatei
    const tp = ifcAutoPlacement(p.georef || IFC_PLAIN_GEOREF, p.coord, zero);
    const c = Math.cos(ta.rotY), s = Math.sin(ta.rotY), dx = tp.x - ta.x, dz = tp.z - ta.z;
    const pl = {
      rotY: tp.rotY - ta.rotY, scale: tp.scale / ta.scale,
      x: (c * dx - s * dz) / ta.scale, y: (tp.y - ta.y) / ta.scale, z: (s * dx + c * dz) / ta.scale
    };
    p.group.rotation.y = pl.rotY;
    p.group.scale.set(pl.scale, pl.scale, pl.scale);
    p.group.position.set(pl.x, pl.y, pl.z);
    group.add(p.group);
    grow(box, ifcBoxCorners(p.bbox, pl));
    grow(core, ifcBoxCorners(ifcBox(p), pl));
    triangles += p.triangles;
    used.push(p);
  });
  let georef = A.georef;
  if (!georef && epsg) georef = Object.assign({}, IFC_PLAIN_GEOREF, { epsg: epsg, crsName: 'EPSG:' + epsg });
  return {
    model: { group: group, name: '', bbox: box, core: core, triangles: triangles, coord: A.coord, georef: georef, parts: used },
    used: used.length, skipped: skipped
  };
}

/* ---------- Filtern nach einem Attribut und Mengen ----------
   filter: { kind: 'class' | 'name' | 'desc' | 'objType' | 'tag' | 'guid' | 'typeName' | 'material' | 'container' | 'file' | 'prop',
   value, set und name (nur 'prop') } */
function ifcValuesOf(info, fileName, f) {
  if (f.kind === 'class') return [info.type];
  if (f.kind === 'name') return [info.name];
  if (f.kind === 'material') return [info.material];
  if (f.kind === 'container') return [info.container];
  if (f.kind === 'file') return [fileName];
  const out = [];
  if (f.kind === 'prop') {
    info.sets.forEach(function (s) { if (s.name === f.set) s.rows.forEach(function (r) { if (r[0] === f.name) out.push(r[1]); }); });
  } else {
    info.rows.forEach(function (r) { if (r[0] === f.kind) out.push(r[1]); });
  }
  return out;
}

/* op 'has': der Wert enthält den Text (ohne Groß-/Kleinschreibung), sonst muss er gleich sein */
function ifcMatches(info, fileName, f) {
  const want = String(f.value);
  return ifcValuesOf(info, fileName, f).some(function (v) {
    return f.op === 'has' ? String(v).toLowerCase().indexOf(want.toLowerCase()) >= 0 : v === want;
  });
}

/* Alle Bauteile (expressID) einer Datei, die ein Netz haben; die ausgeblendeten Netze eines Filters zählen mit */
function ifcElementIds(part) {
  const ids = new Set();
  (part.fullMeshes || part.group.children).forEach(function (mesh) {
    ((mesh.userData && mesh.userData.ranges) || []).forEach(function (r) { ids.add(r.id); });
  });
  return Array.from(ids);
}

/* Zeigt von einer Datei nur die Bauteile ids: neue Netze mit denselben Eckpunkten und nur deren Dreiecken ersetzen die
   vollen (three.js blendet beim Anklicken nichts aus, deshalb werden die vollen aus der Gruppe genommen) */
function ifcIsolate(part, ids) {
  ifcRestore(part);
  const full = part.group.children.filter(function (m) { return m.userData && m.userData.ranges; });
  full.forEach(function (mesh) {
    const index = mesh.geometry.index.array, idx = index.array || index;
    const picked = [], ranges = [];
    let start = 0, tris = 0;
    mesh.userData.ranges.forEach(function (r) {
      if (ids.has(r.id)) {
        for (let k = start * 3; k < r.end * 3; k++) picked.push(idx[k]);
        tris += r.end - start;
        ranges.push({ end: tris, id: r.id });
      }
      start = r.end;
    });
    part.group.remove(mesh);
    if (!picked.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', mesh.geometry.getAttribute('position'));
    const normal = mesh.geometry.getAttribute('normal');
    if (normal) g.setAttribute('normal', normal);
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(picked), 1));
    const sub = new THREE.Mesh(g, mesh.material);
    sub.castShadow = true;
    sub.userData.ranges = ranges;
    sub.userData.isFiltered = true;
    part.group.add(sub);
  });
  part.fullMeshes = full;
}

function ifcRestore(part) {
  if (!part.fullMeshes) return;
  part.group.children.filter(function (m) { return m.userData && m.userData.isFiltered; }).forEach(function (m) {
    part.group.remove(m);
    if (m.geometry.dispose) m.geometry.dispose();
  });
  part.fullMeshes.forEach(function (m) { part.group.add(m); });
  part.fullMeshes = null;
}

/* Oberfläche und Volumen je Bauteil aus den Dreiecken (Maßstab k). Ein Volumen hat nur ein geschlossener Körper: dann
   heben sich die gerichteten Flächen auf; sonst zählt das Bauteil nicht zum Volumen. */
function ifcGeometryQuantities(part, ids, k) {
  const perElement = new Map();
  (part.fullMeshes || part.group.children).forEach(function (mesh) {
    const ranges = mesh.userData && mesh.userData.ranges;
    if (!ranges) return;
    const p = mesh.geometry.getAttribute('position').array;
    const index = mesh.geometry.index.array, idx = index.array || index;
    let start = 0;
    ranges.forEach(function (r) {
      if (ids.has(r.id)) {
        let e = perElement.get(r.id);
        if (!e) { e = { area: 0, vol: 0, sx: 0, sy: 0, sz: 0, o: null }; perElement.set(r.id, e); }
        for (let t = start; t < r.end; t++) {
          const a = idx[t * 3] * 3, b = idx[t * 3 + 1] * 3, c = idx[t * 3 + 2] * 3;
          if (!e.o) e.o = [p[a], p[a + 1], p[a + 2]];                 // nahe Bezugsecke: weniger Rundungsfehler
          const ax = p[a] - e.o[0], ay = p[a + 1] - e.o[1], az = p[a + 2] - e.o[2];
          const bx = p[b] - e.o[0], by = p[b + 1] - e.o[1], bz = p[b + 2] - e.o[2];
          const cx = p[c] - e.o[0], cy = p[c + 1] - e.o[1], cz = p[c + 2] - e.o[2];
          const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
          const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
          e.area += Math.sqrt(nx * nx + ny * ny + nz * nz) / 2;
          e.sx += nx / 2; e.sy += ny / 2; e.sz += nz / 2;
          e.vol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
        }
      }
      start = r.end;
    });
  });
  const out = { area: 0, volume: 0, closed: 0, count: perElement.size };
  perElement.forEach(function (e) {
    out.area += e.area * k * k;
    if (e.area > 0 && Math.sqrt(e.sx * e.sx + e.sy * e.sy + e.sz * e.sz) <= 1e-3 * e.area) {
      out.volume += Math.abs(e.vol) * k * k * k;
      out.closed++;
    }
  });
  return out;
}

/* Summen der Mengen, die in der IFC selbst stehen (Mengensätze, dazu Eigenschaften mit Mengen-Namen).
   infos: Liste wie aus ifcElementProps. Ergebnis [{ label, sum, n }] */
const IFC_QUANTITY_NAMES = /volum|fl(ä|ae)che|area|l(ä|ae)nge|length|gewicht|weight|masse|\bmass|menge|anzahl|count/i;
function ifcSumQuantities(infos) {
  const sums = new Map();
  infos.forEach(function (info) {
    const seen = new Set();
    info.sets.forEach(function (set) {
      set.rows.forEach(function (r) {
        if (r[2] === null || r[2] === undefined || !(set.quantity || IFC_QUANTITY_NAMES.test(r[0]))) return;
        const label = set.name + ' · ' + r[0];
        if (seen.has(label)) return;                            // am Bauteil und am Typ: nur einmal
        seen.add(label);
        let e = sums.get(label);
        if (!e) { e = { label: label, sum: 0, n: 0 }; sums.set(label, e); }
        e.sum += r[2]; e.n++;
      });
    });
  });
  return Array.from(sums.values()).sort(function (a, b) { return a.label.localeCompare(b.label); });
}

/* ---------- Bauteil anklicken ---------- */

/* Schließt das offene web-ifc-Modell einer Datei */
function ifcClosePart(part) {
  if (webIfcApi && part && part.ifcId !== undefined && part.ifcId !== null) {
    try { webIfcApi.CloseModel(part.ifcId); } catch (e) { /* schon zu */ }
    part.ifcId = null;
    part.propIndex = null;
  }
}

/* Treffer eines Raycasts -> { part, id } (Datei und expressID des Bauteils) oder null */
function ifcElementAt(hit) {
  const mesh = hit && hit.object, ranges = mesh && mesh.userData && mesh.userData.ranges;
  const part = mesh && mesh.parent && mesh.parent.userData.ifcPart;
  if (!ranges || !part || hit.faceIndex === undefined || hit.faceIndex === null) return null;
  let lo = 0, hi = ranges.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (hit.faceIndex < ranges[m].end) hi = m; else lo = m + 1; }
  return { part: part, id: ranges[lo].id };
}

/* Alle Dreiecke eines Bauteils als hervorgehobenes Netz in der Gruppe seiner Datei (bewegt sich so mit) */
function ifcHighlight(part, id) {
  const pos = [];
  part.group.children.forEach(function (mesh) {
    const ranges = mesh.userData && mesh.userData.ranges;
    if (!ranges) return;
    const p = mesh.geometry.getAttribute('position').array, idx = mesh.geometry.index.array;
    let start = 0;
    ranges.forEach(function (r) {
      if (r.id === id) {
        for (let k = start * 3; k < r.end * 3; k++) { const v = (idx.array || idx)[k] * 3; pos.push(p[v], p[v + 1], p[v + 2]); }
      }
      start = r.end;
    });
  });
  if (!pos.length) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  const mat = new THREE.MeshBasicMaterial({ color: 0xffb000, side: THREE.DoubleSide, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const mesh = new THREE.Mesh(g, mat);
  mesh.renderOrder = 5;
  mesh.raycast = function () {};                    // nicht selbst anklickbar
  mesh.userData.isHighlight = true;
  part.group.add(mesh);
  return mesh;
}

/* Verknüpfungen einer Datei einmal einlesen: Bauteil -> Eigenschaftssätze, Typ, Geschoss, Material */
function ifcPropIndex(api, modelId, W) {
  const index = { sets: new Map(), type: new Map(), container: new Map(), material: new Map() };
  const each = function (typeCode, fn) {
    if (typeCode === undefined) return;
    const ids = api.GetLineIDsWithType(modelId, typeCode);
    for (let i = 0; i < ids.size(); i++) {
      try { fn(api.GetLine(modelId, ids.get(i))); } catch (e) { /* unlesbare Verknüpfung auslassen */ }
    }
  };
  const objects = function (list, fn) { [].concat(list || []).forEach(function (o) { const id = ifcVal(o); if (id) fn(id); }); };
  const push = function (map, key, value) { let list = map.get(key); if (!list) { list = []; map.set(key, list); } list.push(value); };
  each(W.IFCRELDEFINESBYPROPERTIES, function (r) {
    const def = ifcVal(r.RelatingPropertyDefinition);
    if (def) objects(r.RelatedObjects, function (id) { push(index.sets, id, def); });
  });
  each(W.IFCRELDEFINESBYTYPE, function (r) { objects(r.RelatedObjects, function (id) { index.type.set(id, ifcVal(r.RelatingType)); }); });
  each(W.IFCRELCONTAINEDINSPATIALSTRUCTURE, function (r) { objects(r.RelatedElements, function (id) { index.container.set(id, ifcVal(r.RelatingStructure)); }); });
  each(W.IFCRELAGGREGATES, function (r) { objects(r.RelatedObjects, function (id) { if (!index.container.has(id)) index.container.set(id, ifcVal(r.RelatingObject)); }); });
  each(W.IFCRELASSOCIATESMATERIAL, function (r) { objects(r.RelatedObjects, function (id) { index.material.set(id, ifcVal(r.RelatingMaterial)); }); });
  return index;
}

/* Wert einer Eigenschaft als Text; yesNo: [ja, nein] */
function ifcValueText(x, yesNo) {
  if (Array.isArray(x)) return x.map(function (v) { return ifcValueText(v, yesNo); }).filter(function (v) { return v !== ''; }).join(', ');
  let v = ifcVal(x);
  if (v === null || v === undefined) return '';
  const logical = x && typeof x === 'object' && /BOOLEAN|LOGICAL/i.test(String(x.name || ''));
  if (v === true || v === 'T' || v === '.T.' || (logical && v === 1)) return yesNo[0];
  if (v === false || v === 'F' || v === '.F.' || (logical && v === 0)) return yesNo[1];
  if (typeof v === 'number') return String(Math.round(v * 10000) / 10000);
  return String(v);
}

const IFC_MAX_ROWS = 300;           // je Eigenschaftssatz; Namen und Werte kommen aus der Datei

/* Angaben zu einem Bauteil: { type, name, rows: [[Schlüssel, Wert]], material, container, sets: [{ name, fromType, rows }] } */
function ifcElementProps(api, modelId, id, index, W, yesNo) {
  const line = function (ref) { const r = ifcVal(ref); if (!r) return null; try { return api.GetLine(modelId, r); } catch (e) { return null; } };
  const text = function (x) { const v = ifcVal(x); return v === null || v === undefined ? '' : String(v); };
  const el = line(id) || {};
  const out = {
    type: api.GetNameFromTypeCode ? String(api.GetNameFromTypeCode(el.type) || '') : '',
    name: text(el.Name),
    rows: [['desc', text(el.Description)], ['objType', text(el.ObjectType)], ['tag', text(el.Tag)], ['guid', text(el.GlobalId)]].filter(function (r) { return r[1]; }),
    material: '', container: '', sets: []
  };
  const type = line(index.type.get(id));
  if (type && text(type.Name)) out.rows.push(['typeName', text(type.Name)]);
  const box = line(index.container.get(id));
  if (box) out.container = text(box.Name) || text(box.LongName);

  const names = [];
  const material = function (ref, depth) {
    const m = line(ref);
    if (!m || depth > 4) return;
    let deeper = false;
    ['ForLayerSet', 'ForProfileSet', 'Material'].forEach(function (k) { if (m[k]) { deeper = true; material(m[k], depth + 1); } });
    ['MaterialLayers', 'Materials', 'MaterialProfiles', 'MaterialConstituents'].forEach(function (k) {
      if (m[k]) { deeper = true; [].concat(m[k]).forEach(function (x) { material(x, depth + 1); }); }
    });
    if (!deeper && text(m.Name) && names.indexOf(text(m.Name)) < 0) names.push(text(m.Name));
  };
  material(index.material.get(id) || (type && index.material.get(ifcVal(index.type.get(id)))), 0);
  out.material = names.join(', ');

  const rowsOf = function (list, rows, prefix, depth) {
    [].concat(list || []).forEach(function (ref) {
      const p = line(ref);
      if (!p || rows.length >= IFC_MAX_ROWS) return;
      const label = prefix + text(p.Name);
      if (p.HasProperties && depth < 3) { rowsOf(p.HasProperties, rows, label + ' · ', depth + 1); return; }
      let value = '', number = null;
      ['NominalValue', 'EnumerationValues', 'ListValues', 'LengthValue', 'AreaValue', 'VolumeValue', 'CountValue', 'WeightValue', 'TimeValue'].some(function (k) {
        if (p[k] === undefined || p[k] === null) return false;
        value = ifcValueText(p[k], yesNo);
        const raw = ifcVal(p[k]);
        if (typeof raw === 'number' && isFinite(raw) && !/BOOLEAN|LOGICAL/i.test(String((p[k] && p[k].name) || ''))) number = raw;
        return true;
      });
      rows.push([label, value, number]);
    });
  };
  const addSet = function (ref, fromType) {
    const set = line(ref);
    if (!set) return;
    const rows = [];
    rowsOf(set.HasProperties || set.Quantities, rows, '', 0);
    if (rows.length) out.sets.push({ name: text(set.Name), fromType: fromType, quantity: !!set.Quantities, rows: rows });
  };
  (index.sets.get(id) || []).forEach(function (ref) { addSet(ref, false); });
  if (type) [].concat(type.HasPropertySets || []).forEach(function (ref) { addSet(ref, true); });
  return out;
}

/* Drehung um die Hochachse in der Szene: der Winkel eines Vektors (vx, vz) ist atan2(-vz, vx) */
function ifcAngle(vx, vz) { return Math.atan2(-vz, vx); }

/* Zwei Punkte am Bauwerk (p1, p2 in den Koordinaten der Gruppe) auf zwei Punkte im Gelände (t1, t2) legen;
   die Höhe von p1 liegt auf der Geländehöhe bei t1. Liefert auch die beiden Abstände zur Kontrolle. */
function ifcTwoPointPlacement(p1, p2, t1, t2, heightAt) {
  const th = ifcAngle(t2.x - t1.x, t2.z - t1.z) - ifcAngle(p2.x - p1.x, p2.z - p1.z);
  const c = Math.cos(th), s = Math.sin(th);
  return {
    rotY: th, scale: 1,
    x: t1.x - (c * p1.x + s * p1.z),
    y: heightAt(t1.x, t1.z) - p1.y,
    z: t1.z - (-s * p1.x + c * p1.z),
    distModel: Math.hypot(p2.x - p1.x, p2.z - p1.z),
    distTerrain: Math.hypot(t2.x - t1.x, t2.z - t1.z)
  };
}

function ifcApplyPlacement(model, pl, dz, de, dn, rot) {
  model.group.scale.set(pl.scale, pl.scale, pl.scale);
  model.placement = pl;
  ifcSetShift(model, de || 0, dn || 0, dz || 0, rot || 0);
}

/* Abweichung von der Platzierung: Verschiebung in m (Ost, Nord, Höhe; in der Szene ist Norden -z) und Drehung in Grad
   um die Hochachse durch die Mitte des Bauwerks (positiv gegen den Uhrzeigersinn, von oben gesehen). */
function ifcSetShift(model, de, dn, dz, rot) {
  const pl = model.placement, b = ifcBox(model);
  if (rot !== undefined) model.rot = rot;
  model.de = de; model.dn = dn; model.dz = dz;
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  const a0 = pl.rotY, a1 = a0 + (model.rot || 0) * Math.PI / 180;
  const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
  model.group.rotation.y = a1;
  // die Mitte bleibt beim Drehen an ihrer Stelle
  model.group.position.set(
    pl.x + de + pl.scale * ((c0 - c1) * cx + (s0 - s1) * cz),
    pl.y + dz,
    pl.z - dn + pl.scale * ((s1 - s0) * cx + (c0 - c1) * cz));
}

/* Mitte des Bauwerks in Szenenkoordinaten */
function ifcCenterWorld(model) {
  const b = ifcBox(model), pl = model.placement, s = pl.scale;
  const cx = (b.minX + b.maxX) / 2, cy = ((b.minY + b.maxY) / 2) || 0, cz = (b.minZ + b.maxZ) / 2;
  const c = Math.cos(pl.rotY), n = Math.sin(pl.rotY);
  return {
    x: pl.x + (model.de || 0) + s * (c * cx + n * cz),
    y: pl.y + (model.dz || 0) + s * cy,
    z: pl.z - (model.dn || 0) + s * (-n * cx + c * cz)
  };
}

/* Stelle auf der Achse durch p0 (Einheitsrichtung a), die dem Blickstrahl (Ursprung o, Einheitsrichtung d) am nächsten
   liegt, als Abstand von p0 in m. null, wenn man fast entlang der Achse blickt (dann lässt sich nicht ziehen). */
function axisDragParam(o, d, p0, a) {
  const wx = p0.x - o.x, wy = p0.y - o.y, wz = p0.z - o.z;
  const b = a.x * d.x + a.y * d.y + a.z * d.z;
  const den = 1 - b * b;
  if (den < 0.01) return null;
  const aw = a.x * wx + a.y * wy + a.z * wz, dw = d.x * wx + d.y * wy + d.z * wz;
  return (b * dw - aw) / den;
}

/* Richtungswinkel (wie ifcAngle) des Punkts, in dem der Blickstrahl die waagerechte Ebene durch c trifft;
   null, wenn man fast waagerecht blickt oder die Ebene hinter der Kamera liegt. */
function ringDragAngle(o, d, c) {
  if (Math.abs(d.y) < 0.05) return null;
  const t = (c.y - o.y) / d.y;
  if (!(t > 0)) return null;
  return ifcAngle(o.x + t * d.x - c.x, o.z + t * d.z - c.z);
}

/* Winkel in Grad auf (-180, 180] bringen */
function normDeg(a) { const r = ((a % 360) + 360) % 360; return r > 180 ? r - 360 : r; }

/* Liegt der Mittelpunkt des Bauwerks (Gruppenkoordinaten) nach der Platzierung innerhalb des Geländes? */
function ifcInsideTerrain(model, terrain) {
  const m = ifcCenterWorld(model);
  return Math.abs(m.x) <= terrain.w / 2 && Math.abs(m.z) <= terrain.d / 2;
}

/* Ausdehnung ohne Ausreißer: Ein einzelnes Kleinteil weit weg (etwa ein Marker auf Höhe 0) würde sonst die Mitte des
   Bauwerks verschieben und damit die Pfeile, das Drehzentrum und die Kamera. arrays: Eckpunkte [x, y, z, ...]. Je Achse
   zählen die 0,2 % äußersten Punkte nicht, aber nur, wenn die Ausdehnung dadurch deutlich schrumpft; sonst gilt bbox.
   Am Modell selbst wird nichts weggelassen. */
function ifcCoreBox(arrays, bbox) {
  let total = 0;
  arrays.forEach(function (a) { total += a.length / 3; });
  const step = 3 * Math.max(1, Math.floor(total / 100000));
  const lists = [[], [], []];
  arrays.forEach(function (a) {
    for (let i = 0; i + 2 < a.length; i += step) { lists[0].push(a[i]); lists[1].push(a[i + 1]); lists[2].push(a[i + 2]); }
  });
  if (!lists[0].length) return bbox;
  const r = lists.map(function (v) {
    const s = Float64Array.from(v).sort();
    const k = Math.floor(s.length * 0.002);
    return [s[k], s[s.length - 1 - k]];
  });
  const full = [[bbox.minX, bbox.maxX], [bbox.minY, bbox.maxY], [bbox.minZ, bbox.maxZ]];
  const outlier = full.some(function (f, i) { return f[1] - f[0] > 1.3 * (r[i][1] - r[i][0]) + 5; });
  return outlier ? { minX: r[0][0], maxX: r[0][1], minY: r[1][0], maxY: r[1][1], minZ: r[2][0], maxZ: r[2][1] } : bbox;
}

/* Die für Mitte und Ausdehnung maßgebende Box */
function ifcBox(model) { return model.core || model.bbox; }

/* Netze je Farbe UND Raumblock: Beim Anklicken prüft three.js nur Netze, deren Box der Blickstrahl trifft. Mit einem
   Netz je Farbe müsste jeder Klick alle Dreiecke prüfen (bei 1,5 Millionen eine halbe Sekunde). pos: Eckpunkte eines
   Bauteils; sehr große Bauteile (über IFC_BIG m) bekommen ein eigenes Netz, damit sie die Blöcke nicht aufblähen. */
const IFC_CELL = 25;
const IFC_BIG = 50;
function ifcChunkKey(pos, running) {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let k = 0; k + 2 < pos.length; k += 3) {
    for (let a = 0; a < 3; a++) {
      if (pos[k + a] < lo[a]) lo[a] = pos[k + a];
      if (pos[k + a] > hi[a]) hi[a] = pos[k + a];
    }
  }
  if (hi[0] - lo[0] > IFC_BIG || hi[1] - lo[1] > IFC_BIG || hi[2] - lo[2] > IFC_BIG) return 'big' + running;
  return [0, 1, 2].map(function (a) { return Math.floor((lo[a] + hi[a]) / 2 / IFC_CELL); }).join('_');
}

/* Liest eine IFC-Datei und baut daraus eine Gruppe (je Farbe ein Netz). Gibt {group, coord, georef, bbox, count}
   zurück. Die Gruppe wird noch nicht in die Szene gesetzt. */
async function ifcReadModel(arrayBuffer, fileName) {
  const api = await getWebIfc();
  const W = WebIFC;
  const id = api.OpenModel(new Uint8Array(arrayBuffer), { COORDINATE_TO_ORIGIN: true });
  if (id < 0) throw new Error('ifcNoModel');
  try {
    const georef = ifcReadGeoref(api, id, W);
    const byChunk = new Map();
    let tris = 0, parts = 0;
    api.StreamAllMeshes(id, function (mesh) {
      const element = mesh.expressID;
      const gs = mesh.geometries;
      for (let i = 0; i < gs.size(); i++) {
        const pg = gs.get(i);
        const geo = api.GetGeometry(id, pg.geometryExpressID);
        const verts = api.GetVertexArray(geo.GetVertexData(), geo.GetVertexDataSize());
        const idx = api.GetIndexArray(geo.GetIndexData(), geo.GetIndexDataSize());
        const m = pg.flatTransformation;
        const col = pg.color || { x: 0.7, y: 0.7, z: 0.7, w: 1 };
        const colorKey = [col.x, col.y, col.z, col.w].map(function (v) { return Math.round(v * 255); }).join(',');
        const nv = verts.length / 6;
        const pos = new Float32Array(nv * 3), nrm = new Float32Array(nv * 3);
        for (let k = 0; k < nv; k++) {
          const x = verts[k * 6], y = verts[k * 6 + 1], z = verts[k * 6 + 2];
          pos[k * 3] = m[0] * x + m[4] * y + m[8] * z + m[12];
          pos[k * 3 + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
          pos[k * 3 + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
          const nx = verts[k * 6 + 3], ny = verts[k * 6 + 4], nz = verts[k * 6 + 5];
          nrm[k * 3] = m[0] * nx + m[4] * ny + m[8] * nz;
          nrm[k * 3 + 1] = m[1] * nx + m[5] * ny + m[9] * nz;
          nrm[k * 3 + 2] = m[2] * nx + m[6] * ny + m[10] * nz;
        }
        const key = colorKey + '|' + ifcChunkKey(pos, parts++);
        let e = byChunk.get(key);
        if (!e) { e = { color: col, colorKey: colorKey, pos: [], nrm: [], idx: [], base: 0, tris: 0, ranges: [] }; byChunk.set(key, e); }
        const ix = new Uint32Array(idx.length);
        for (let k = 0; k < idx.length; k++) ix[k] = idx[k] + e.base;
        e.pos.push(pos); e.nrm.push(nrm); e.idx.push(ix); e.base += nv;
        // welche Dreiecke zu welchem Bauteil gehören (für das Anklicken)
        e.tris += idx.length / 3;
        const last = e.ranges[e.ranges.length - 1];
        if (last && last.id === element) last.end = e.tris; else e.ranges.push({ end: e.tris, id: element });
        tris += idx.length / 3;
        if (geo.delete) geo.delete();
      }
      if (mesh.delete) mesh.delete();
    });
    if (!tris) throw new Error('ifcEmpty');
    const cm = api.GetCoordinationMatrix(id);
    const coord = [cm[12] || 0, cm[13] || 0, cm[14] || 0];
    const group = new THREE.Group();
    group.name = 'ifc-import';
    const bbox = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity };
    function cat(arrs, Type) {
      let n = 0; arrs.forEach(function (a) { n += a.length; });
      const out = new Type(n); let o = 0;
      arrs.forEach(function (a) { out.set(a, o); o += a.length; });
      return out;
    }
    const arrays = [], materials = new Map();
    byChunk.forEach(function (e) {
      const pos = cat(e.pos, Float32Array);
      arrays.push(pos);
      for (let k = 0; k < pos.length; k += 3) {
        if (pos[k] < bbox.minX) bbox.minX = pos[k]; if (pos[k] > bbox.maxX) bbox.maxX = pos[k];
        if (pos[k + 1] < bbox.minY) bbox.minY = pos[k + 1]; if (pos[k + 1] > bbox.maxY) bbox.maxY = pos[k + 1];
        if (pos[k + 2] < bbox.minZ) bbox.minZ = pos[k + 2]; if (pos[k + 2] > bbox.maxZ) bbox.maxZ = pos[k + 2];
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.BufferAttribute(cat(e.nrm, Float32Array), 3));
      g.setIndex(new THREE.BufferAttribute(cat(e.idx, Uint32Array), 1));
      if (g.computeBoundingBox) g.computeBoundingBox();             // für das schnelle Aussortieren beim Anklicken
      let mat = materials.get(e.colorKey);
      if (!mat) {
        const a = e.color.w === undefined ? 1 : e.color.w;
        mat = new THREE.MeshLambertMaterial({
          color: (Math.round(e.color.x * 255) << 16) | (Math.round(e.color.y * 255) << 8) | Math.round(e.color.z * 255),
          side: THREE.DoubleSide, transparent: a < 0.99, opacity: a, depthWrite: a >= 0.99
        });
        materials.set(e.colorKey, mat);
      }
      const mesh = new THREE.Mesh(g, mat);
      mesh.castShadow = true;
      mesh.userData.ranges = e.ranges;
      group.add(mesh);
    });
    // Das Modell bleibt offen, damit beim Anklicken die Eigenschaften gelesen werden können (ifcClosePart schließt es)
    const part = { group: group, name: fileName, coord: coord, georef: georef, bbox: bbox, core: ifcCoreBox(arrays, bbox), triangles: tris, ifcId: id };
    group.userData.ifcPart = part;
    return part;
  } catch (e) {
    api.CloseModel(id);
    throw e;
  }
}

function ifcRemoveModel() {
  if (!ifcModel) return;
  scene.remove(ifcModel.group);
  disposeGroup(ifcModel.group);
  (ifcModel.parts || []).forEach(ifcClosePart);
  ifcModel = null;
  if (controls) controls.maxPolarAngle = POLAR_GROUND;
}

/* Nimmt das Modell aus der Szene, ohne seine Dateien zu verwerfen (zum Dazulegen weiterer); liefert die Dateien,
   die Ankerdatei zuerst */
function ifcDetachParts() {
  if (!ifcModel) return [];
  const model = ifcModel;
  model.parts.forEach(ifcRestore);
  scene.remove(model.group);
  model.parts.forEach(function (p) { if (p.group !== model.group) model.group.remove(p.group); });
  ifcModel = null;
  return model.parts.slice();
}

/* Setzt ein gelesenes Modell in die Szene (ersetzt ein vorhandenes) */
function ifcSetModel(m) {
  ifcRemoveModel();
  ifcModel = { group: m.group, name: m.name, coord: m.coord, georef: m.georef, bbox: m.bbox, core: m.core, triangles: m.triangles,
               parts: m.parts || [Object.assign({}, m)], placement: null, de: 0, dn: 0, dz: 0, rot: 0, how: null };
  scene.add(ifcModel.group);
  if (controls) controls.maxPolarAngle = POLAR_BELOW;
  return ifcModel;
}

/* Vorläufige Lage für das Anklicken von Punkten am Bauwerk: Mitte des Blickzentrums, unten auf dem Gelände */
function ifcPreviewPlacement(model) {
  const b = ifcBox(model);
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  const tx = controls ? controls.target.x : 0, tz = controls ? controls.target.z : 0;
  ifcApplyPlacement(model, { rotY: 0, scale: 1, x: tx - cx, y: getHeightAt(tx, tz) - b.minY, z: tz - cz }, 0);
}


/* =========================================================
   Export für Tests
   ========================================================= */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Aufbau (für Tests: initScene(fakeContainer) statt echtem DOM-Element)
    initScene: initScene,
    initSharedResources: initSharedResources,
    getScene: function () { return scene; },
    smCutWindow: smCutWindow, gdalCutCommand: gdalCutCommand, SM_CUT_SIZE: SM_CUT_SIZE,
    smWorldPx: smWorldPx, smLonLat: smLonLat, smMetersPerPx: smMetersPerPx, smTileList: smTileList,
    focusOnPoint: focusOnPoint,
    settleCameraFlight: settleCameraFlight,
    setRoadSectionSlope: setRoadSectionSlope, setRoadUniformSlope: setRoadUniformSlope, setRoadSectionLength: setRoadSectionLength,
    roadSlopeVariable: roadSlopeVariable, roadSlopeList: roadSlopeList, IFC_SKIP_KINDS: IFC_SKIP_KINDS,
    getCameraGoals: function () { return { cam: camGoal, focus: focusGoal }; },
    groundFrameFromCamera: groundFrameFromCamera, orientedRect: orientedRect, frameTouchesBox: frameTouchesBox,
    getControls: function () { return controls; },
    getCamera: function () { return camera; },
    setTopView: setTopView,
    raycastPivot: raycastPivot,
    frameObjects: frameObjects,
    updateTerrainLod: updateTerrainLod,
    getTerrainChunks: function () { return terrainChunks; },
    LOD_CHUNK: LOD_CHUNK,
    setMeasureMarker: setMeasureMarker,
    measureScreenPos: measureScreenPos,
    orbitAround: orbitAround,
    isTopView: isTopView,
    frameTerrain: frameTerrain,
    updateControls: updateControls,

    // Kranmodelle und Datenblätter
    CRANE_MODELS: CRANE_MODELS,
    TOWER_LIMITS: TOWER_LIMITS,
    sheetUrlFor: sheetUrlFor,
    getModel: getModel,

    // Gelände: Achsen, Höhen, Raster
    worldToUTM: worldToUTM,
    utmToWorld: utmToWorld,
    hasTerrain: hasTerrain,
    buildTerrain: buildTerrain,
    terrainFromEmbedded: terrainFromEmbedded,
    getHeightAt: getHeightAt,
    rulerStats: rulerStats,
    segmentLabels: segmentLabels,
    getRoadPreviewLabels: function () { return roadPreviewLabels; },
    setRoadPreview: setRoadPreview,
    clearRoadPreview: clearRoadPreview,
    getAbsoluteHeightAt: getAbsoluteHeightAt,
    colorAt: colorAt,
    crsLabel: crsLabel,
    MAX_GRID: MAX_GRID,
    GRID_MIN: GRID_MIN,
    GRID_MAX: GRID_MAX,
    GRID_CELL_CAP: GRID_CELL_CAP,

    // GeoTIFF-Verschmelzung
    gridTiles: gridTiles,
    fillGaps: fillGaps,
    tileIsNoData: tileIsNoData,

    // CityGML
    parseCityGML: parseCityGML,
    readRing: readRing,
    parseNumbers: parseNumbers,
    mergeCityGML: mergeCityGML, parseCityJSON: parseCityJSON, parseBuildingText: parseBuildingText,
    detectAxisOrder: detectAxisOrder,
    buildBuildingsMesh: buildBuildingsMesh,
    triNormal: triNormal,
    triangulateBuildingRings: triangulateBuildingRings,
    // Gebäude aus 2D-Daten
    fpNum: fpNum, fpFields: fpFields, fpLooksLikeGeoJson: fpLooksLikeGeoJson, parseGeoJsonFootprints: parseGeoJsonFootprints, parseShp: parseShp, parseDbf: parseDbf,
    parseShapefileSet: parseShapefileSet, fpPrjEpsg: fpPrjEpsg, sqliteOpen: sqliteOpen, readGpkgFootprints: readGpkgFootprints, fpWkb: fpWkb,
    footprintRings: footprintRings, fpLooksLikeInspireGml: fpLooksLikeInspireGml, parseInspireBuildings: parseInspireBuildings,
    isLasName: isLasName, lasHeader: lasHeader, lasPeekEpsg: lasPeekEpsg, readLasTile: readLasTile, lasFillGaps: lasFillGaps, fpWindowFor: fpWindowFor, fpMedian: fpMedian, fpBridgeHoles: fpBridgeHoles,

    // IFC-Export
    terrainGridInRect: terrainGridInRect,
    clipTrianglesToRect: clipTrianglesToRect,
    collectExportGeometry: collectExportGeometry,
    buildExportPreview: buildExportPreview,
    thickLine: thickLine,
    frameRect: frameRect,
    ifcGuid: ifcGuid,
    buildIfc: buildIfc,

    // Bausteine
    defaultContainerParams: defaultContainerParams,
    containerLayout: containerLayout,
    buildContainer: buildContainer,
    defaultTowerParams: defaultTowerParams,
    buildTowerCrane: buildTowerCrane,
    defaultMobileParams: defaultMobileParams,
    buildMobileCrane: buildMobileCrane,

    // Baustraße
    defaultRoadParams: defaultRoadParams,
    dist2d: dist2d,
    filletPath: filletPath,
    densifyPath: densifyPath,
    pathLength: pathLength,
    computeRoad: computeRoad,
    autoRoadSlope: autoRoadSlope,
    defaultPitParams: defaultPitParams,
    computePit: computePit,
    buildPit: buildPit,
    polygonArea: polygonArea,
    pointInPolygon: pointInPolygon,
    triangulatePolygon: triangulatePolygon,
    updatePitHoles: updatePitHoles,
    getPitHoles: function () { return pitHoles; },
    getPitUniforms: function () { return pitUniforms; },
    pitHoleContains: pitHoleContains,
    pitHoleShader: pitHoleShader,
    firstVisibleHit: firstVisibleHit,
    hasNodes: hasNodes,
    PIT_MAX_POINTS: PIT_MAX_POINTS,
    PIT_MAX_HOLES: PIT_MAX_HOLES,
    PIT_DEPTH_MIN: PIT_DEPTH_MIN,
    PIT_DEPTH_MAX: PIT_DEPTH_MAX,
    PIT_ANGLE_MIN: PIT_ANGLE_MIN,
    PIT_ANGLE_MAX: PIT_ANGLE_MAX,
    polygonInset: polygonInset,
    insetValid: insetValid,
    EMBANKMENT_CHOICES: EMBANKMENT_CHOICES,
    ROAD_SLOPE_MAX: ROAD_SLOPE_MAX,
    buildRoad: buildRoad,
    roadInfo: roadInfo,
    segmentLabels: segmentLabels,
    getRoadPreviewLabels: function () { return roadPreviewLabels; },
    TIFF_MAX_PIXELS: TIFF_MAX_PIXELS, TIFF_BLOB_BYTES: TIFF_BLOB_BYTES, readTiffTileWindow: readTiffTileWindow, lonLatToCrs: lonLatToCrs,
    TIFF_MAX_TOTAL_PIXELS: TIFF_MAX_TOTAL_PIXELS,
    TIFF_MAX_FILE_BYTES: TIFF_MAX_FILE_BYTES,
    checkTiffFiles: checkTiffFiles,
    parseXyz: parseXyz,
    readXyzTile: readXyzTile,
    isXyzName: isXyzName,
    XYZ_MAX_POINTS: XYZ_MAX_POINTS,
    readTiffTile: readTiffTile,
    readTiffTiles: readTiffTiles,
    GEO_ENTRIES: GEO_ENTRIES, GEO_EU: GEO_EU, GEO_CITIES: GEO_CITIES, cityPortalsFor: cityPortalsFor,
    geoSourcesFor: geoSourcesFor,
    parsePhoton: parsePhoton,
    normalizeState: normalizeState,
    addrNorm: addrNorm,
    addrHasMatch: addrHasMatch,
    addrStem: addrStem,
    parseCoordinates: parseCoordinates,
    photonReverse: photonReverse,
    photonSearch: photonSearch,
    ifcReadGeoref: ifcReadGeoref,
    ifcAutoPlacement: ifcAutoPlacement,
    ifcTwoPointPlacement: ifcTwoPointPlacement,
    ifcApplyPlacement: ifcApplyPlacement,
    ifcReadModel: ifcReadModel,
    ifcSetModel: ifcSetModel,
    ifcRemoveModel: ifcRemoveModel,
    axisDragParam: axisDragParam,
    ringDragAngle: ringDragAngle,
    canonicalEpsg: canonicalEpsg,
    ifcValuesOf: ifcValuesOf, ifcMatches: ifcMatches, ifcIsolate: ifcIsolate, ifcRestore: ifcRestore, ifcElementIds: ifcElementIds, ifcGeometryQuantities: ifcGeometryQuantities, ifcSumQuantities: ifcSumQuantities,
    ifcElementAt: ifcElementAt, ifcPropIndex: ifcPropIndex, ifcElementProps: ifcElementProps, ifcValueText: ifcValueText, ifcCombine: ifcCombine, ifcCoreBox: ifcCoreBox, ifcChunkKey: ifcChunkKey,
    reprojectTerrain: reprojectTerrain, reprojectRings: reprojectRings, buildingTextEpsg: buildingTextEpsg, crsAccuracy: crsAccuracy,
    parseBeta2007: parseBeta2007, ensureBeta2007: ensureBeta2007, hasBeta2007: hasBeta2007, ifcRawPlacement: ifcRawPlacement, ifcGuessGk: ifcGuessGk,
    normDeg: normDeg,
    ifcSetShift: ifcSetShift,
    ifcCenterWorld: ifcCenterWorld,
    getIfcModel: function () { return ifcModel; },
    ifcInsideTerrain: ifcInsideTerrain,
    ifcAngle: ifcAngle,
    IFC_MAX_BYTES: IFC_MAX_BYTES,
    crsToLonLat: crsToLonLat,
    crsTransformer: crsTransformer,
    crsTransformIsApprox: crsTransformIsApprox,
    transverseMercatorForward: transverseMercatorForward, lccForward: lccForward, lccInverse: lccInverse, stereaForward: stereaForward, stereaInverse: stereaInverse, krovakForward: krovakForward, krovakInverse: krovakInverse, laeaForward: laeaForward, laeaInverse: laeaInverse, projForward: projForward, projInverse: projInverse,
    IFC_TARGET_CRS: IFC_TARGET_CRS,
    objectTriangles: objectTriangles,
    collectExportObjects: collectExportObjects,
    crsGeoDefinition: crsGeoDefinition,
    osmMapPlan: osmMapPlan,
    mapShader: mapShader,
    OSM_MAX_TILES: OSM_MAX_TILES,
    SEMI_TRUCK: SEMI_TRUCK,
    semiTruckLength: semiTruckLength,
    sweepSemiTruck: sweepSemiTruck,
    checkSemiTruck: checkSemiTruck,
    sweptOutlines: sweptOutlines,
    lateralOffsetOnPath: lateralOffsetOnPath,
    roadCentroid: roadCentroid,

    // Objektverwaltung
    builderFor: builderFor,
    defaultsFor: defaultsFor,
    labelFor: labelFor,
    addObject: addObject,
    rebuildObject: rebuildObject,
    moveObject: moveObject,
    removeObject: removeObject,
    findObject: findObject,
    reseatAllObjects: reseatAllObjects,
    pruneObjectsOutside: pruneObjectsOutside,
    objects: objects,

    // Auswahl
    selectObject: selectObject,
    selectObjects: selectObjects,
    getSelectedId: getSelectedId,
    isSelected: isSelected,
    updateSelectionBoxes: updateSelectionBoxes,
    clearSelectionBoxes: clearSelectionBoxes,

    // Baustraßen-Stützpunkte
    showRoadNodes: showRoadNodes,
    dropNodeGroup: dropNodeGroup,
    clearRoadNodes: clearRoadNodes,
    refreshRoadNodes: refreshRoadNodes,
    activeRoadNode: activeRoadNode,
    setActiveNode: setActiveNode,
    moveRoadNode: moveRoadNode,
    removeRoadNode: removeRoadNode,
    addRoadNode: addRoadNode,

    // Kennzahlen
    computeStats: computeStats,
    radiusConflicts: radiusConflicts,

    // Zustand für Tests
    getTerrain: function () { return TERRAIN; },
    getActiveTool: function () { return activeTool; },
    getSelectedIds: function () { return selectedIds; },
    resetState: function () {
      objects.length = 0;
      ifcModel = null;
      updatePitHoles();
      nextId = 1;
      selectedIds = [];
      TERRAIN = null;
      activeTool = null;
    }
  };
}
