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
  scene.fog = new THREE.FogExp2(0x0a1013, 0.00035);

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
  controls.maxPolarAngle = Math.PI * 0.492;   // knapp unter die Horizontale, Draufsicht bleibt erlaubt
  // Links drehen, rechts UND Mitte verschieben, Rad zoomt. (Standard von
  // OrbitControls ist Mitte = Zoomen; das Rad macht das ohnehin.)
  controls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;

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
  // Böschungen: Auftrag hell (aufgeschüttet), Abtrag dunkel (angeschnitten)
  MAT.roadFill    = new THREE.MeshLambertMaterial({ color: 0xc9a45c, side: THREE.DoubleSide });
  MAT.roadCut     = new THREE.MeshLambertMaterial({ color: 0x9a5a44, side: THREE.DoubleSide });
  // Abtrag liegt unter dem Gelände: Überlagerung ohne Tiefentest, damit man ihn sieht
  MAT.cutOverlay  = new THREE.MeshBasicMaterial({ color: 0x9a5a44, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
  MAT.roadOverlay = new THREE.MeshBasicMaterial({ color: 0x6f6a60, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
  MAT.cutCrest    = new THREE.LineBasicMaterial({ color: 0xffd24a, depthTest: false });
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
      terrainMesh.add(c.mesh);
      terrainChunks.push(c);
    }
  }
  scene.add(terrainMesh);
  updateTerrainLod(true);

  const plinthH = Math.max((t.zmax - t.zmin) * 0.6, 12);
  plinthMesh = new THREE.Mesh(
    new THREE.BoxGeometry(t.w, plinthH, t.d),
    new THREE.MeshLambertMaterial({ color: 0x151c20 })
  );
  plinthMesh.position.y = -plinthH / 2 - 0.2;
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
  scene.fog.density = 0.35 / span;

  return { mesh: terrainMesh, material: terrainMat };
}

let topView = false;

function isTopView() { return topView; }

/* Setzt die Ansicht senkrecht von oben. Kein Sperrzustand: sobald gedreht
   wird, kippt die Kamera wieder frei in den Raum. */
function setTopView() {
  const t = controls.target;
  const span = TERRAIN ? Math.max(TERRAIN.w, TERRAIN.d) : 500;
  let d = camera.position.distanceTo(t);
  if (!(d > 1)) d = span * 0.6;
  camGoal = new THREE.Vector3(t.x, t.y + d, t.z + 0.001);
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
  25831: 'ETRS89 / UTM 31N', 25832: 'ETRS89 / UTM 32N', 25833: 'ETRS89 / UTM 33N',
  5650: 'ETRS89 / UTM 33N (Zone)', 4647: 'ETRS89 / UTM 32N (Zone)',
  31466: 'DHDN / GK 2', 31467: 'DHDN / GK 3', 31468: 'DHDN / GK 4', 31469: 'DHDN / GK 5',
  4326: 'WGS 84', 4258: 'ETRS89', 3857: 'Web Mercator'
};

function crsLabel(code) {
  if (!code) return 'unbekannt';
  const n = EPSG_NAMES[code];
  return n ? 'EPSG:' + code + ' · ' + n : 'EPSG:' + code;
}

/* Liest eine einzelne Kachel ein und liefert Raster samt Georeferenz */
async function readTiffTile(arrayBuffer, fileName) {
  const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();

  const W = image.getWidth();
  const H = image.getHeight();
  if (!W || !H) throw new Error(fileName + ': kein lesbares Raster.');

  const rasters = await image.readRasters();
  const band = rasters[0];
  if (!band || !band.length) throw new Error(fileName + ': keine Höhenwerte.');

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
    if (gk) epsg = gk.ProjectedCSTypeGeoKey || gk.GeographicTypeGeoKey || null;
  } catch (e) { /* ohne GeoKeys weiterarbeiten */ }

  return {
    name: fileName, W: W, H: H, band: band,
    originX: originX, originY: originY, resX: resX, resY: resY,
    nodata: nodata, epsg: epsg, srcRes: Math.min(resX, resY)
  };
}

function tileIsNoData(tile, v) {
  if (!isFinite(v)) return true;
  if (tile.nodata !== null && Math.abs(v - tile.nodata) < 1e-6) return true;
  return v < -1000 || v > 9000;
}

/* Mehrere GeoTIFF-Kacheln zu einem Gelände verschmelzen.
   Die Pixel aller Kacheln werden in ein gemeinsames Zielraster gemittelt;
   dadurch spielen unterschiedliche Auflösungen und Überlappungen keine Rolle. */
async function readTiffTiles(items) {
  if (typeof GeoTIFF === 'undefined') {
    throw new Error('Die Datei lib/geotiff.js fehlt. Siehe lib/LIESMICH.txt.');
  }
  if (!items || !items.length) throw new Error('Keine Datei ausgewählt.');
  const tiles = [];
  for (let i = 0; i < items.length; i++) {
    tiles.push(await readTiffTile(items[i].buffer, items[i].name));
  }
  return tiles;
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
    ? tiles[0].name + ' · ' + tiles[0].W + '×' + tiles[0].H + ' px · ' + tiles[0].resX.toFixed(1) + ' m'
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

/* Mehrere CityGML-Dateien zu einer Ringliste zusammenführen */
function mergeCityGML(files) {
  if (!files || !files.length) throw new Error('Keine Datei ausgewählt.');
  let rings = [];
  const failed = [];
  files.forEach(function (f) {
    try {
      const r = parseCityGML(f.text);
      for (let i = 0; i < r.length; i++) rings.push(r[i]);
    } catch (e) {
      failed.push(f.name + ': ' + e.message);
    }
  });
  if (!rings.length) {
    throw new Error(failed.length ? failed.join(' | ') : 'Keine Gebäudeflächen gefunden.');
  }
  return { rings: rings, failed: failed, files: files.length };
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
   Nur um die Hochachse gedreht (kein vollständiges 3D-"look at"): für
   flache Vorschaulinien auf sanft geneigtem Gelände reicht das, echte
   Steigungen an einzelnen Segmenten werden dabei leicht unterschlagen. */
function thickLine(points, width, material, closed) {
  const g = new THREE.Group();
  const n = closed ? points.length : points.length - 1;
  for (let i = 0; i < n; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 1e-6) continue;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(len, width * 0.4, width), material);
    seg.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    seg.rotation.y = -Math.atan2(dz, dx);
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
  return { points: [], width: 6.0, radius: 15, showEdge: true, slope: null };
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
   Gelände, schließt eine Böschung mit 1:1 (45°) vom Fahrbahnrand bis zum
   Gelände an - Auftrag, wenn die Straße darüber liegt, Abtrag darunter.
   Die Mengen sind das Mittel der Querschnittsflächen mal Abstand
   (Mittelflächenverfahren); in engen Kurven weicht der Innenrand davon ab. */
const ROAD_SLOPE_MAX = 30;      // einstellbare Längsneigung, ± Prozent
const EMBANKMENT_RATIO = 1;     // Böschung 1:1 = 1 m Höhe je 1 m Breite
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

/* Böschung einer Seite: sucht vom Fahrbahnrand nach außen den ersten
   Schnitt der 1:1-Linie mit dem Gelände. */
function embankmentSide(f, sign, hr, half) {
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
    const hs = hr + dir * d * EMBANKMENT_RATIO;
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
  side.oh = hr + dir * side.reach * EMBANKMENT_RATIO;
  return side;
}

/* Alles Geometrische einer Baustraße in einem Durchgang: Fahrbahnhöhen,
   Böschungen und Mengen. */
function computeRoad(p) {
  const width = Math.max(p.width, 1), half = width / 2;
  const rp = roadPathOf(p);
  const frames = roadFrames(rp.path);
  const length = frames.length ? frames[frames.length - 1].s : 0;
  const slope = (typeof p.slope === 'number' && isFinite(p.slope)) ? p.slope : autoRoadSlope(p);
  const h0 = getHeightAt(rp.path[0].x, rp.path[0].z);

  const sections = frames.map(function (f) {
    const hr = h0 + slope / 100 * f.s;
    const left = embankmentSide(f, 1, hr, half);
    const right = embankmentSide(f, -1, hr, half);

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
    earthworks: { fill: fill, cut: cut, maxReach: maxReach, unreached: unreached }
  };
}

/* Im Abtrag liegen Böschung und Fahrbahn unter dem Gelände und wären nicht
   zu sehen. Deshalb zusätzlich: Böschung und eingegrabene Fahrbahn als
   halbtransparente Fläche ohne Tiefentest über dem Gelände, dazu eine helle
   Linie an der Böschungsoberkante (dort, wo die 1:1-Linie das Gelände
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

  if (p.showEdge !== false) {
    const left = [], right = [];
    secs.forEach(function (sc) {
      left.push(new THREE.Vector3(sc.left.ex, sc.hr + ROAD_LIFT + 0.02, sc.left.ez));
      right.push(new THREE.Vector3(sc.right.ex, sc.hr + ROAD_LIFT + 0.02, sc.right.ez));
    });
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(left), MAT.roadEdge));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(right), MAT.roadEdge));
  }

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

function roadCentroid(pts) {
  if (!pts || !pts.length) return { x: 0, z: 0 };
  let sx = 0, sz = 0;
  pts.forEach(function (q) { sx += q.x; sz += q.z; });
  return { x: sx / pts.length, z: sz / pts.length };
}

/* ---------- Vorschau während des Setzens ---------- */
let roadPreview = null;

function setRoadPreview(pts, hover) {
  clearRoadPreview();
  if (!pts || !pts.length) return;
  const g = new THREE.Group();
  const all = hover ? pts.concat([hover]) : pts;

  if (all.length >= 2) {
    const line = all.map(function (q) {
      return new THREE.Vector3(q.x, getHeightAt(q.x, q.z) + 0.4, q.z);
    });
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
  throw new Error('Unbekannter Typ: ' + type);
}

function defaultsFor(type) {
  if (type === 'container') return defaultContainerParams();
  if (type === 'tower') return defaultTowerParams();
  if (type === 'mobile') return defaultMobileParams();
  if (type === 'road') return defaultRoadParams();
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
  if (type === 'road') {
    const fil = filletPath(params.points || [], Math.max(params.radius, 1));
    const l = pathLength(densifyPath(fil.path, 2.5));
    return 'Baustraße ' + Math.round(l) + ' m · ' + params.width.toFixed(1) + ' m breit';
  }
  return type;
}

function placeGroup(obj) {
  if (obj.type === 'road') {
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
  return obj;
}

function rebuildObject(obj) {
  disposeGroup(obj.group);
  scene.remove(obj.group);
  obj.group = builderFor(obj.type)(obj.params);
  obj.group.userData.__objId = obj.id;
  scene.add(obj.group);
  placeGroup(obj);
  if (isSelected(obj.id)) updateSelectionBoxes();
}

function moveObject(obj, x, z) {
  if (obj.type === 'road') {
    const dx = x - obj.x, dz = z - obj.z;
    obj.params.points = (obj.params.points || []).map(function (q) {
      return { x: q.x + dx, z: q.z + dz };
    });
    obj.params.slope = autoRoadSlope(obj.params);    // anderes Gelände, neue Anfangs-/Endhöhe
    rebuildObject(obj);
    if (isSelected(obj.id)) focusOnObject(obj);
    return;
  }
  obj.x = x; obj.z = z;
  obj.group.position.set(x, getHeightAt(x, z), z);
  if (isSelected(obj.id)) { updateSelectionBoxes(); focusOnObject(obj); }
}

function removeObject(id) {
  let idx = -1;
  for (let i = 0; i < objects.length; i++) if (objects[i].id === id) { idx = i; break; }
  if (idx < 0) return false;
  disposeGroup(objects[idx].group);
  scene.remove(objects[idx].group);
  objects.splice(idx, 1);
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
    if (objects[i].type === 'road') rebuildObject(objects[i]);
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
  selectedIds = (ids || []).filter(function (i) { return findObject(i) !== null; });
  updateSelectionBoxes();
  if (!selectedIds.length) return;
  const objs = selectedIds.map(findObject);
  if (frame === false) return;
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
  if (obj.type === 'road') { frameObjects([obj]); return; }
  focusGoal = new THREE.Vector3(obj.x, getHeightAt(obj.x, obj.z) + b.cy, obj.z);
  camGoal = null;
}

/* Kamera so setzen, dass alle übergebenen Objekte ins Bild passen */
function frameObjects(objs) {
  if (!objs || !objs.length) return;
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
  let dx = camera.position.x - controls.target.x;
  let dy = camera.position.y - controls.target.y;
  let dz = camera.position.z - controls.target.z;
  let len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (!(len > 0.001)) { dx = 0.6; dy = 0.55; dz = 0.6; len = Math.sqrt(0.36 + 0.3025 + 0.36); }
  dx /= len; dy /= len; dz /= len;
  if (dy < 0.25) { dy = 0.45; }

  camGoal = new THREE.Vector3(cx + dx * dist, focusGoal.y + dy * dist, cz + dz * dist);
}

/* Pro Bild aufgerufen: weicher Übergang von Drehzentrum und Kamera */
function updateControls() {
  if (focusGoal) {
    controls.target.lerp(focusGoal, 0.16);
    if (controls.target.distanceTo(focusGoal) < 0.08) {
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
    camera.position.lerp(camGoal, 0.14);
    if (camera.position.distanceTo(camGoal) < 0.2) {
      camera.position.copy(camGoal);
      camGoal = null;
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
  focusGoal = new THREE.Vector3(x, y, z);
  if (zoom === false) { camGoal = null; return; }
  let dx = camera.position.x - controls.target.x;
  let dy = camera.position.y - controls.target.y;
  let dz = camera.position.z - controls.target.z;
  let len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (!(len > 0.001)) return;
  // Blickrichtung beibehalten, Abstand auf einen nahen Arbeitsabstand ziehen
  const span = TERRAIN ? Math.max(TERRAIN.w, TERRAIN.d) : 500;
  const want = Math.max(Math.min(len, span * 0.35), span * 0.12);
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
  if (!obj || obj.type !== 'road') { clearRoadNodes(); return null; }
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
  if (!obj || obj.type !== 'road') return false;
  const pts = obj.params.points;
  if (!pts || index < 0 || index >= pts.length) return false;
  pts[index] = { x: x, z: z };
  const c = roadCentroid(pts);
  obj.x = c.x; obj.z = c.z;
  obj.params.slope = autoRoadSlope(obj.params);
  rebuildObject(obj);
  refreshRoadNodes();
  return true;
}

/* Stützpunkt entfernen; unter drei Punkten bleibt alles unverändert */
function removeRoadNode(obj, index) {
  if (!obj || obj.type !== 'road') return false;
  const pts = obj.params.points;
  if (!pts || pts.length <= 2 || index < 0 || index >= pts.length) return false;
  pts.splice(index, 1);
  const c = roadCentroid(pts);
  obj.x = c.x; obj.z = c.z;
  obj.params.slope = autoRoadSlope(obj.params);
  activeNode = null;
  rebuildObject(obj);
  refreshRoadNodes();
  return true;
}

/* =========================================================
   Raycasting
   ========================================================= */
function pointerToNDC(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  return pointer;
}

function raycastTerrain(event) {
  if (!terrainMesh) return null;
  pointerToNDC(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(terrainMesh, true);
  return hits.length ? hits[0].point : null;
}

/* Trifft Gelände oder Gebäude; liefert Punkt und Quelle */
function raycastGround(event) {
  if (!terrainMesh) return null;
  pointerToNDC(event);
  raycaster.setFromCamera(pointer, camera);
  const targets = [terrainMesh];
  if (buildingsMesh) targets.push(buildingsMesh);
  const hits = raycaster.intersectObjects(targets, true);
  if (!hits.length) return null;
  return {
    point: hits[0].point,
    onBuilding: buildingsMesh ? hits[0].object === buildingsMesh : false
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
  if (!roots.length) return null;
  const hits = raycaster.intersectObjects(roots, true);
  if (!hits.length) return null;
  const p = hits[0].point;
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
  if (type === 'road') return g;
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

/* Tastet ein eigenes, regelmäßiges Raster über dem Rechteck ab –
   unabhängig von der internen Vertex-Reihenfolge von THREE.PlaneGeometry,
   die dafür nicht erneut nachgebildet werden muss – und liefert Dreiecke
   in Lokalkoordinaten. Das Rechteck wird auf die geladene Kachel begrenzt;
   die Zellgröße folgt der geladenen Geländeauflösung. */
function terrainGridInRect(minX, minZ, maxX, maxZ) {
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
  return triangles;
}

/* Grobe, aber robuste Klassifikation über den Dreiecksschwerpunkt – wie
   die bestehende Randprüfung in triangulateBuildingRings(), keine exakte
   Kantenclippung. */
function trianglesInRect(triangles, minX, minZ, maxX, maxZ) {
  return triangles.filter(function (tri) {
    const cx = (tri.a[0] + tri.b[0] + tri.c[0]) / 3;
    const cz = (tri.a[2] + tri.b[2] + tri.c[2]) / 3;
    return cx >= minX && cx <= maxX && cz >= minZ && cz <= maxZ;
  });
}

/* Geländeraster + Gebäude-Dreiecke innerhalb des Rechtecks. rings kommt
   vom Aufrufer (in ui.js liegt lastGmlRings), damit app.js wie überall
   sonst auch hier keine Kenntnis vom Dateiimport-Zustand braucht. */
function collectExportGeometry(rings, minX, minZ, maxX, maxZ) {
  const terrain = terrainGridInRect(minX, minZ, maxX, maxZ);
  let buildings = [];
  if (rings && rings.length) {
    buildings = trianglesInRect(triangulateBuildingRings(rings).triangles, minX, minZ, maxX, maxZ);
  }
  return { terrain: terrain, buildings: buildings };
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
  const ux = 0.6, uz = 0.8; // feste, normierte Diagonalrichtung
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
   IfcMapConversion, immer im EPSG-Code des geladenen Geländes – keine
   Ziel-EPSG-Wahl (eine korrekte Umrechnung für alle in EPSG_NAMES
   gelisteten Systeme bräuchte für die DHDN/Gauß-Krüger-Fälle ein
   Umrechnungsgitter, das hier nicht mitgeliefert wird; lieber gar keine
   Wahl anbieten als eine, die für einen Teil der Codes lautlos falsch
   läge). Alle Geometrie-Koordinaten liegen relativ zur Rechteck-
   Südwestecke (übliche IFC-Praxis, vermeidet Präzisionsverlust durch
   große UTM-Werte direkt in der Geometrie). */
function buildIfc(geo, rectMinX, rectMinZ, epsg) {
  if (!TERRAIN) throw new Error('Bitte zuerst ein Geländemodell laden.');
  if (!geo.terrain.length && !geo.buildings.length) {
    throw new Error('Der Ausschnitt enthält keine Geometrie.');
  }

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
    return [p[0] - rectMinX, -(p[2] - rectMinZ), p[1]];
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

  const projectedCrs = add('IFCPROJECTEDCRS',
    str('EPSG:' + epsg) + ',$,$,$,$,$,' + lengthUnit);
  // OrthogonalHeight: die reale Höhe, die lokal Z=0 entspricht. Lokal Z=0
  // ist TERRAIN.zmin (dort setzt auch die Höhe im Szenengraphen auf 0),
  // nicht 0 m ü. NHN.
  add('IFCMAPCONVERSION',
    context + ',' + projectedCrs + ',' + num(target.e) + ',' + num(target.n) + ',' +
    num(TERRAIN.zmin) + ',1.,0.,1.');

  const siteLocalPlacement = add('IFCLOCALPLACEMENT', '$,' + worldPlacement);
  const project = add('IFCPROJECT',
    str(ifcGuid()) + ',' + owner + ',' + str('Quick-Site-Design Ausschnitt') + ',$,$,$,$,(' + context + '),' + unitAssignment);
  const site = add('IFCSITE',
    str(ifcGuid()) + ',' + owner + ',' + str('Baustelle') + ',$,$,' + siteLocalPlacement + ',$,$,.ELEMENT.,$,$,$,$,$');
  add('IFCRELAGGREGATES', str(ifcGuid()) + ',' + owner + ',$,$,' + project + ',(' + site + ')');

  const elements = [];

  // Gleiche Eckpunkte nur einmal schreiben: das Geländeraster teilt jeden
  // Punkt zwischen bis zu sechs Dreiecken, ohne Zusammenfassen wird die
  // Datei viermal so groß und die eine Zeile mit der Punktliste sprengt
  // manche Leser.
  function addGroup(triangles, name, entityType, predefinedType) {
    if (!triangles.length) return;
    const index = new Map();
    const pts = [];
    const faces = [];
    triangles.forEach(function (tri) {
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
    const shapeRep = add('IFCSHAPEREPRESENTATION', bodyContext + ',' + str('Body') + ',' + str('Tessellation') + ',(' + faceSet + ')');
    const productShape = add('IFCPRODUCTDEFINITIONSHAPE', '$,$,(' + shapeRep + ')');
    const placement = add('IFCLOCALPLACEMENT', siteLocalPlacement + ',' + worldPlacement);
    // Beide Elementarten haben neun Attribute; das Tag steht vor dem
    // PredefinedType (beim Gelände fehlte es früher, der Typ verrutschte).
    const el = add(entityType,
      str(ifcGuid()) + ',' + owner + ',' + str(name) + ',$,$,' + placement + ',' + productShape +
      ',$,' + predefinedType);
    elements.push(el);
  }

  addGroup(geo.terrain, 'Gelände (Ausschnitt)', 'IFCGEOGRAPHICELEMENT', '.TERRAIN.');
  addGroup(geo.buildings, 'Gebäude (Ausschnitt)', 'IFCBUILDINGELEMENTPROXY', '.NOTDEFINED.');

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
   Export für Tests
   ========================================================= */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Aufbau (für Tests: initScene(fakeContainer) statt echtem DOM-Element)
    initScene: initScene,
    initSharedResources: initSharedResources,
    getScene: function () { return scene; },
    getControls: function () { return controls; },
    getCamera: function () { return camera; },
    setTopView: setTopView,
    raycastPivot: raycastPivot,
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
    mergeCityGML: mergeCityGML,
    detectAxisOrder: detectAxisOrder,
    buildBuildingsMesh: buildBuildingsMesh,
    triNormal: triNormal,
    triangulateBuildingRings: triangulateBuildingRings,

    // IFC-Export
    terrainGridInRect: terrainGridInRect,
    trianglesInRect: trianglesInRect,
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
    ROAD_SLOPE_MAX: ROAD_SLOPE_MAX,
    buildRoad: buildRoad,
    roadInfo: roadInfo,
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

    // Kennzahlen
    computeStats: computeStats,
    radiusConflicts: radiusConflicts,

    // Zustand für Tests
    getTerrain: function () { return TERRAIN; },
    getActiveTool: function () { return activeTool; },
    getSelectedIds: function () { return selectedIds; },
    resetState: function () {
      objects.length = 0;
      nextId = 1;
      selectedIds = [];
      TERRAIN = null;
      activeTool = null;
    }
  };
}
