/* =========================================================
   Quick-Site-Design  –  Kernlogik
   Einheiten: 1 Three.js-Einheit = 1 Meter
   ========================================================= */

/* ---------- Stammdaten Mobilkrane (Richtwerte Liebherr LTM) ---------- */
/* ---------- Mobilkrane (Liebherr LTM) ----------
   Aufgenommen sind nur Modelle, für die Hersteller- oder Vermieterangaben
   vorliegen. Nicht belegte Felder stehen auf null; die Oberfläche gibt
   dann keinen Höchstwert vor. Abstützmaße und Fahrzeuglängen dienen
   ausschließlich der Darstellung und sind schematisch.                */
const CRANE_MODELS = [
  { id: 'ltm1050',  name: 'LTM 1050-3.1',  maker: 'Liebherr', cap: 50,   boomTele: 38,  hookMax: 54,   radiusMax: 44,  hookDef: 36,  radiusDef: 18, outL: 6.3,  outW: 6.0,  chassisL: 10.9 },
  { id: 'ltm1090',  name: 'LTM 1090-4.2',  maker: 'Liebherr', cap: 90,   boomTele: 60,  hookMax: 76,   radiusMax: 62,  hookDef: 56,  radiusDef: 26, outL: 7.4,  outW: 6.8,  chassisL: 13.1 },
  { id: 'ltm1150',  name: 'LTM 1150-5.3',  maker: 'Liebherr', cap: 150,  boomTele: 66,  hookMax: 92,   radiusMax: 72,  hookDef: 60,  radiusDef: 30, outL: 8.07, outW: 7.90, chassisL: 14.9 },
  { id: 'ltm1250',  name: 'LTM 1250-6.1',  maker: 'Liebherr', cap: 250,  boomTele: 72,  hookMax: 108,  radiusMax: 92,  hookDef: 66,  radiusDef: 34, outL: 8.9,  outW: 8.2,  chassisL: 16.5 },
  { id: 'ltm1350',  name: 'LTM 1350-6.1',  maker: 'Liebherr', cap: 350,  boomTele: 70,  hookMax: 108,  radiusMax: 96,  hookDef: 66,  radiusDef: 36, outL: 9.4,  outW: 8.8,  chassisL: 17.4 },
  { id: 'ltm1450',  name: 'LTM 1450-8.1',  maker: 'Liebherr', cap: 450,  boomTele: 85,  hookMax: 145,  radiusMax: 108, hookDef: 80,  radiusDef: 40, outL: 10.0, outW: 9.5,  chassisL: 18.5 },
  { id: 'ltm1500',  name: 'LTM 1500-8.1',  maker: 'Liebherr', cap: 500,  boomTele: 84,  hookMax: 145,  radiusMax: 108, hookDef: 80,  radiusDef: 42, outL: 10.6, outW: 9.6,  chassisL: 18.8 },
  { id: 'ltm1650',  name: 'LTM 1650-8.1',  maker: 'Liebherr', cap: 700,  boomTele: 80,  hookMax: 152,  radiusMax: 112, hookDef: 85,  radiusDef: 46, outL: 10.6, outW: 9.6,  chassisL: 19.5 },
  { id: 'ltm1750',  name: 'LTM 1750-9.1',  maker: 'Liebherr', cap: 750,  boomTele: 52,  hookMax: 154,  radiusMax: 116, hookDef: 90,  radiusDef: 50, outL: 12.0, outW: 12.0, chassisL: 20.2 }
];

/* ---------- Turmdrehkrane ----------
   Alle Werte aus den Original-Datenblättern der Hersteller.
   kind: schnell = Schnellbaukran, flat = spitzenloser Obendreher,
         head = Obendreher mit Turmkopf
   hookMax ist die größte in der Hubhöhentabelle aufgeführte Höhe.
   Bei WOLFFKRAN hängt sie von der Turmkombination ab und steht
   deshalb auf null; der Regler bleibt dort offen.                 */
const TOWER_MODELS = [
  { id: 'lieb85ecb5', name: 'Liebherr 85 EC-B 5', maker: 'Liebherr', kind: 'flat', cap: 5, tip: 1.3, jibMax: 50.0, jibDef: 41, hookMax: 41.9, hookDef: 29, mast: 1.6 },
  { id: 'lieb91k', name: 'Liebherr 91 K', maker: 'Liebherr', kind: 'schnell', cap: 6, tip: 1.13, jibMax: 48.0, jibDef: 39, hookMax: 57.2, hookDef: 40, mast: 1.6 },
  { id: 'lieb125ecb6', name: 'Liebherr 125 EC-B 6', maker: 'Liebherr', kind: 'flat', cap: 6, tip: 1.4, jibMax: 58.0, jibDef: 48, hookMax: 59.5, hookDef: 42, mast: 1.6 },
  { id: 'lieb125k', name: 'Liebherr 125 K', maker: 'Liebherr', kind: 'schnell', cap: 8, tip: 1.0, jibMax: 55.0, jibDef: 45, hookMax: 65.5, hookDef: 46, mast: 1.6 },
  { id: 'lieb150ecb8', name: 'Liebherr 150 EC-B 8', maker: 'Liebherr', kind: 'flat', cap: 8, tip: 1.2, jibMax: 62.5, jibDef: 51, hookMax: 52.7, hookDef: 37, mast: 1.6 },
  { id: 'lieb172ecb8', name: 'Liebherr 172 EC-B 8', maker: 'Liebherr', kind: 'flat', cap: 8, tip: 1.6, jibMax: 62.5, jibDef: 51, hookMax: 53.7, hookDef: 38, mast: 1.6 },
  { id: 'lieb205ecb10', name: 'Liebherr 205 EC-B 10', maker: 'Liebherr', kind: 'flat', cap: 10, tip: 1.9, jibMax: 65.0, jibDef: 53, hookMax: 54.7, hookDef: 38, mast: 1.6 },
  { id: 'lieb220ecb10', name: 'Liebherr 220 EC-B 10', maker: 'Liebherr', kind: 'flat', cap: 10, tip: 1.9, jibMax: 68.0, jibDef: 56, hookMax: 54.4, hookDef: 38, mast: 1.6 },
  { id: 'lieb240ecb10', name: 'Liebherr 240 EC-B 10', maker: 'Liebherr', kind: 'flat', cap: 10, tip: 2.15, jibMax: 68.0, jibDef: 56, hookMax: 54.4, hookDef: 38, mast: 1.6 },
  { id: 'lieb220ecb12', name: 'Liebherr 220 EC-B 12', maker: 'Liebherr', kind: 'flat', cap: 12, tip: 1.7, jibMax: 68.0, jibDef: 56, hookMax: 51.3, hookDef: 36, mast: 1.6 },
  { id: 'lieb240ecb12', name: 'Liebherr 240 EC-B 12', maker: 'Liebherr', kind: 'flat', cap: 12, tip: 2.05, jibMax: 68.0, jibDef: 56, hookMax: 51.3, hookDef: 36, mast: 1.6 },
  { id: 'lieb270ecb12', name: 'Liebherr 270 EC-B 12', maker: 'Liebherr', kind: 'flat', cap: 12, tip: 1.8, jibMax: 73.0, jibDef: 60, hookMax: 82.4, hookDef: 58, mast: 1.6 },
  { id: 'lieb550ech20', name: 'Liebherr 550 EC-H 20', maker: 'Liebherr', kind: 'head', cap: 20, tip: 3.5, jibMax: 81.5, jibDef: 67, hookMax: 84.5, hookDef: 59, mast: 1.6 },
  { id: 'lieb550ech40', name: 'Liebherr 550 EC-H 40', maker: 'Liebherr', kind: 'head', cap: 40, tip: 3.5, jibMax: 81.5, jibDef: 67, hookMax: 83.1, hookDef: 58, mast: 1.6 },
  { id: 'lieb630ech40', name: 'Liebherr 630 EC-H 40', maker: 'Liebherr', kind: 'head', cap: 40, tip: 5.4, jibMax: 81.4, jibDef: 67, hookMax: 80.0, hookDef: 56, mast: 1.6 },
  { id: 'lieb1000ech40', name: 'Liebherr 1000 EC-H 40', maker: 'Liebherr', kind: 'head', cap: 40, tip: 10.5, jibMax: 81.4, jibDef: 67, hookMax: 97.1, hookDef: 68, mast: 1.6 },
  { id: 'lieb1188ech40', name: 'Liebherr 1188 EC-H 40', maker: 'Liebherr', kind: 'head', cap: 40, tip: 8.0, jibMax: 91.4, jibDef: 75, hookMax: 94.2, hookDef: 66, mast: 1.6 },
  { id: 'lieb630ech50', name: 'Liebherr 630 EC-H 50', maker: 'Liebherr', kind: 'head', cap: 50, tip: 4.8, jibMax: 81.4, jibDef: 67, hookMax: 80.0, hookDef: 56, mast: 1.6 },
  { id: 'wolff4518', name: 'WOLFF 4518', maker: 'WOLFFKRAN', kind: 'head', cap: 6.0, tip: 1.3, jibMax: 50.0, jibDef: 41, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff5014', name: 'WOLFF 5014', maker: 'WOLFFKRAN', kind: 'head', cap: 6.0, tip: 1.4, jibMax: 50.0, jibDef: 41, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff60236clear', name: 'WOLFF 6023.6 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 6.2, tip: null, jibMax: 60.0, jibDef: 49, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff50208clear', name: 'WOLFF 5020.8 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 8.5, tip: null, jibMax: 55.0, jibDef: 45, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff60208clear', name: 'WOLFF 6020.8 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 8.5, tip: 1.7, jibMax: 60.0, jibDef: 49, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff60238clear', name: 'WOLFF 6023.8 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 8.5, tip: null, jibMax: 60.0, jibDef: 49, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff60318clear', name: 'WOLFF 6031.8 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 8.5, tip: null, jibMax: 65.0, jibDef: 53, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff65238clear', name: 'WOLFF 6523.8 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 8.5, tip: 2.3, jibMax: 65.0, jibDef: 53, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff70218clear', name: 'WOLFF 7021.8 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 8.5, tip: 2.1, jibMax: 70.0, jibDef: 57, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff70328clear', name: 'WOLFF 7032.8 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 8.5, tip: 3.2, jibMax: 70.0, jibDef: 57, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff75348clear', name: 'WOLFF 7534.8 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 8.5, tip: 3.4, jibMax: 75.0, jibDef: 61, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff702110clear', name: 'WOLFF 7021.10 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 10.5, tip: 2.1, jibMax: 70.0, jibDef: 57, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff652312clear', name: 'WOLFF 6523.12 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 12.0, tip: 1.9, jibMax: 65.0, jibDef: 53, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff703212clear', name: 'WOLFF 7032.12 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 12.0, tip: 2.8, jibMax: 70.0, jibDef: 57, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff224b', name: 'WOLFF 224 B', maker: 'WOLFFKRAN', kind: 'head', cap: 16.0, tip: null, jibMax: 60.0, jibDef: 49, hookMax: null, hookDef: 45, mast: 1.8 },
  { id: 'wolff753416clear', name: 'WOLFF 7534.16 clear', maker: 'WOLFFKRAN', kind: 'flat', cap: 16.5, tip: 2.9, jibMax: 75.0, jibDef: 61, hookMax: null, hookDef: 45, mast: 1.8 }
];

/* Anlaufstellen für die Originaldatenblätter */
const SHEET_URLS = {
  liebherrK:   'https://www.liebherr.com/de-de/turmdrehkrane/produkte/schnelleinsatzkrane/k-krane-3815559',
  liebherrLTM: 'https://www.liebherr.com',
  liebherrTower: 'https://www.liebherr.com/de-de/turmdrehkrane/turmdrehkrane-3808172',
  wolff:       'https://www.wolffkran.com'
};

function sheetUrlFor(m) {
  if (!m) return null;
  if (m.maker === 'WOLFFKRAN') return SHEET_URLS.wolff;
  if (m.kind === 'schnell') return SHEET_URLS.liebherrK;
  if (m.maker === 'Liebherr' && m.jibMax !== undefined && m.mast !== undefined
      && m.kind !== 'schnell' && m.cap !== undefined && m.tip !== undefined
      && String(m.name).indexOf('EC-') > 0) return SHEET_URLS.liebherrTower;
  return SHEET_URLS.liebherrLTM;
}

function getTowerModel(id) {
  for (let i = 0; i < TOWER_MODELS.length; i++) if (TOWER_MODELS[i].id === id) return TOWER_MODELS[i];
  return TOWER_MODELS[0];
}

const MAT = {};
const GEO = {};

let scene, camera, renderer, controls, raycaster, pointer;
let terrainMesh, terrainGeo, plinthMesh;
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
  // Immer sichtbar, damit der Punkt nicht im Gelände verschwindet
  MAT.measure     = new THREE.MeshBasicMaterial({ color: 0x6cff8a, depthTest: false });
  MAT.node        = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false });
  MAT.nodeActive  = new THREE.MeshBasicMaterial({ color: 0xff8a3c, depthTest: false });
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

function buildTerrain(t) {
  TERRAIN = t;

  if (terrainMesh) {
    scene.remove(terrainMesh);
    terrainGeo.dispose();
    terrainMesh = null;
  }
  if (plinthMesh) {
    scene.remove(plinthMesh);
    plinthMesh.geometry.dispose();
    plinthMesh = null;
  }

  terrainGeo = new THREE.PlaneGeometry(t.w, t.d, t.nx - 1, t.nz - 1);
  terrainGeo.rotateX(-Math.PI / 2);
  terrainGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(t.nx * t.nz * 3), 3));

  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  terrainMesh = new THREE.Mesh(terrainGeo, mat);
  terrainMesh.receiveShadow = true;
  terrainMesh.castShadow = true;
  terrainMesh.name = 'terrain';
  scene.add(terrainMesh);

  applyTerrainHeights();

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

  return { mesh: terrainMesh, material: mat };
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

function applyTerrainHeights() {
  const pos = terrainGeo.attributes.position;
  const col = terrainGeo.attributes.color;
  const span = Math.max(TERRAIN.zmax - TERRAIN.zmin, 0.0001);
  const count = TERRAIN.nx * TERRAIN.nz;
  for (let i = 0; i < count; i++) {
    const h = TERRAIN.rel[i];
    pos.setY(i, h);
    const c = colorAt(h / span);
    col.setXYZ(i, c[0], c[1], c[2]);
  }
  pos.needsUpdate = true;
  col.needsUpdate = true;
  terrainGeo.computeVertexNormals();
}

/* Bilineare Höheninterpolation in Weltkoordinaten */
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
function buildBuildingsMesh(rings) {
  const t = TERRAIN;
  if (!t) throw new Error('Bitte zuerst ein Geländemodell laden.');
  const order = detectAxisOrder(rings, t.originE, t.originN);
  const marginX = t.w / 2 + t.w * 0.15;
  const marginZ = t.d / 2 + t.d * 0.15;

  const positions = [];
  const colors = [];
  const baseY = [];

  const wallCol = [0.82, 0.80, 0.76];
  const roofCol = [0.64, 0.35, 0.28];

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
      const col = Math.abs(nrm[1]) > 0.55 ? roofCol : wallCol;
      const tri = [a, b, c];
      for (let k = 0; k < 3; k++) {
        positions.push(tri[k][0], tri[k][1], tri[k][2]);
        baseY.push(tri[k][1]);
        colors.push(col[0], col[1], col[2]);
      }
    }
    used++;
  }

  if (!positions.length) {
    throw new Error('Die Gebäude liegen außerhalb der geladenen Geländekachel.');
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, MAT.building);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'buildings';
  mesh.userData.baseY = new Float32Array(baseY);
  mesh.userData.faces = used;
  mesh.userData.skipped = skipped;
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
  const m = getTowerModel('lieb150ecb8');
  return { model: m.id, hookHeight: m.hookDef, radius: m.jibDef,
           mastWidth: m.mast, rot: 0, baseRot: 0, showRadius: true };
}

function buildTowerCrane(p) {
  const g = new THREE.Group();
  const m = getTowerModel(p.model);
  const HH = Math.max(p.hookHeight, 8);
  const R  = Math.max(p.radius, 10);
  const mw = p.mastWidth || m.mast || 1.8;
  const wipp = m.kind === 'wipp';

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
  if (wipp) {
    // Wippausleger: Fußpunkt am Drehkranz, Spitze über der Ausladung
    const lift = Math.max(HH * 0.28, 6);
    const len = Math.sqrt(R * R + lift * lift);
    jib.scale.set(len, 1.5, 1.4);
    jib.position.set(R / 2, topY + lift / 2, 0);
    jib.rotation.z = Math.atan2(lift, R);
  } else {
    jib.scale.set(R, 1.3, 1.2);
    jib.position.set(R / 2, topY + 1.0, 0);
  }
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

  // Spitzenloser Obendreher braucht keinen Turmkopf
  if (m.kind !== 'flat') {
    const tip = new THREE.Mesh(GEO.box, MAT.craneYellow);
    tip.scale.set(0.6, 6.0, 0.6);
    tip.position.set(0, topY + 4.5, 0);
    tip.castShadow = true;
    slew.add(tip);

    slew.add(new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, topY + 7.5, 0), new THREE.Vector3(R * 0.95, topY + 1.6, 0),
        new THREE.Vector3(0, topY + 7.5, 0), new THREE.Vector3(-cLen * 0.9, topY + 1.6, 0)
      ]),
      MAT.hookLine
    ));
  }

  const hookTopY = wipp ? topY + Math.max(HH * 0.28, 6) : topY;
  if (!wipp) {
    const trolley = new THREE.Mesh(GEO.box, MAT.craneRed);
    trolley.scale.set(1.4, 0.7, 1.4);
    trolley.position.set(R, topY + 0.1, 0);
    slew.add(trolley);
  }

  slew.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(R, hookTopY - 0.4, 0),
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
  g.userData.model = m;
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

  const axles = Math.max(2, Math.round(m.chassisL / 3.2));
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


/* =========================================================
   Baustein: Baustraße
   Der Nutzer setzt Stützpunkte; die Ecken werden mit dem
   gewünschten Mindestradius ausgerundet. Passt ein Radius
   nicht zwischen zwei Punkte, wird er dort so weit verkleinert
   wie nötig und das Ergebnis gemeldet.
   ========================================================= */
function defaultRoadParams() {
  return { points: [], width: 6.0, radius: 15, showEdge: true };
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

/* Erzeugt das Band der Baustraße; Höhen kommen aus dem Gelände */
function roadGeometry(path, width) {
  const half = width / 2;
  const pos = [];
  const idx = [];

  for (let i = 0; i < path.length; i++) {
    const prev = path[Math.max(i - 1, 0)];
    const next = path[Math.min(i + 1, path.length - 1)];
    let tx = next.x - prev.x, tz = next.z - prev.z;
    const tl = Math.sqrt(tx * tx + tz * tz) || 1;
    tx /= tl; tz /= tl;
    const nx = -tz, nz = tx;                    // Querrichtung

    const lx = path[i].x + nx * half, lz = path[i].z + nz * half;
    const rx = path[i].x - nx * half, rz = path[i].z - nz * half;
    pos.push(lx, getHeightAt(lx, lz) + 0.12, lz);
    pos.push(rx, getHeightAt(rx, rz) + 0.12, rz);

    if (i > 0) {
      const a = (i - 1) * 2, b = a + 1, c = i * 2, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  return { positions: pos, indices: idx };
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

  const fil = filletPath(pts, Math.max(p.radius, 1));
  const path = densifyPath(fil.path, 2.5);
  const rg = roadGeometry(path, Math.max(p.width, 1));

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rg.positions), 3));
  geo.setIndex(rg.indices);
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, MAT.road);
  mesh.receiveShadow = true;
  g.add(mesh);

  if (p.showEdge !== false) {
    const left = [], right = [];
    for (let i = 0; i < path.length; i++) {
      const o = i * 6;
      left.push(new THREE.Vector3(rg.positions[o], rg.positions[o + 1] + 0.02, rg.positions[o + 2]));
      right.push(new THREE.Vector3(rg.positions[o + 3], rg.positions[o + 4] + 0.02, rg.positions[o + 5]));
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(left), MAT.roadEdge));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(right), MAT.roadEdge));
  }

  let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity;
  path.forEach(function (q) {
    if (q.x < minx) minx = q.x;
    if (q.x > maxx) maxx = q.x;
    if (q.z < minz) minz = q.z;
    if (q.z > maxz) maxz = q.z;
  });
  const half = Math.max(p.width, 1) / 2;

  g.userData.bbox = { w: maxx - minx + width0(half), d: maxz - minz + width0(half), h: 1 };
  g.userData.selBox = {
    w: maxx - minx + width0(half) + 2, d: maxz - minz + width0(half) + 2, h: 2,
    cy: 1, cx: (minx + maxx) / 2, cz: (minz + maxz) / 2
  };
  g.userData.length = pathLength(path);
  g.userData.reduced = fil.reduced;
  g.userData.minRadius = fil.minRadius;
  g.userData.path = path;
  return g;
}

function width0(h) { return h * 2; }

/* Mittelpunkt der gesetzten Stützpunkte */
/* Kennzahlen einer Baustraße ohne Mesh-Aufbau */
function roadInfo(p) {
  const pts = (p && p.points) || [];
  if (pts.length < 2) return { length: 0, minRadius: (p && p.radius) || 0, reduced: 0 };
  const fil = filletPath(pts, p.radius);
  const path = densifyPath(fil.path, 2);
  return { length: pathLength(path), minRadius: fil.minRadius, reduced: fil.reduced };
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
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(line), MAT.ghost));
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
  if (type === 'tower') return getTowerModel(params.model).name;
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
  if (camGoal) {
    camera.position.lerp(camGoal, 0.14);
    if (camera.position.distanceTo(camGoal) < 0.2) {
      camera.position.copy(camGoal);
      camGoal = null;
    }
  }
  controls.update();
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
  const hits = raycaster.intersectObject(terrainMesh, false);
  return hits.length ? hits[0].point : null;
}

/* Trifft Gelände oder Gebäude; liefert Punkt und Quelle */
function raycastGround(event) {
  if (!terrainMesh) return null;
  pointerToNDC(event);
  raycaster.setFromCamera(pointer, camera);
  const targets = [terrainMesh];
  if (buildingsMesh) targets.push(buildingsMesh);
  const hits = raycaster.intersectObjects(targets, false);
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
  let containers = 0, towers = 0, mobiles = 0, area = 0, roadLength = 0;
  for (let i = 0; i < objects.length; i++) {
    const o = objects[i];
    if (o.type === 'container') {
      const lay = containerLayout(o.params);
      containers += lay.count;
      area += lay.w * lay.d;
    } else if (o.type === 'tower') towers++;
    else if (o.type === 'mobile') mobiles++;
    else if (o.type === 'road') roadLength += roadInfo(o.params).length;
  }
  return { containers: containers, towers: towers, mobiles: mobiles, area: area,
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
   Export für Tests
   ========================================================= */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Aufbau (für Tests: initScene(fakeContainer) statt echtem DOM-Element)
    initScene: initScene,
    initSharedResources: initSharedResources,
    getScene: function () { return scene; },

    // Kranmodelle und Datenblätter
    CRANE_MODELS: CRANE_MODELS,
    TOWER_MODELS: TOWER_MODELS,
    sheetUrlFor: sheetUrlFor,
    getTowerModel: getTowerModel,
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
    roadGeometry: roadGeometry,
    buildRoad: buildRoad,
    width0: width0,
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
