/* =========================================================
   Quick-Site-Design  –  Bedienoberfläche
   ========================================================= */

let toolParams = {};
let formRefs = {};
let statusTimer = null;
let lastGmlRings = null;
let lastDemTiles = null;      // eingelesene Kacheln, für Auflösungswechsel
let lastDemNames = [];
let gridLimit = MAX_GRID;
let roadPoints = [];          // Stützpunkte während des Zeichnens

/* =========================================================
   Sprachen
   ========================================================= */
const STRINGS = {
  de: {
    lang: 'Deutsch',
    overview: 'Übersicht', data: 'Daten', view: 'Ansicht', site: 'Baustelle',
    clear: 'Leeren', appearance: 'Darstellung', close: 'Schließen', tweak: 'Ansicht',
    noTerrain: 'Kein Geländemodell geladen',
    loadFirst: 'Zum Starten ein Geländemodell laden',
    terrainFile: 'Gelände · GeoTIFF', buildingFile: 'Gebäude · CityGML',
    detail: 'Detailstufe', original: 'Original', points: 'Punkte',
    noFile: 'Keine Datei', remove: 'Entfernen',
    heightRange: 'Höhenbereich', objects: 'Objekte', containers: 'Container',
    cranes: 'Krane', area: 'Stellfläche', road: 'Baustraße',
    nothingPlaced: 'Noch nichts platziert',
    nothingSelected: 'Kein Baustein gewählt',
    pickHint: 'Baustein unten wählen oder ein platziertes Objekt anklicken.',
    placeHint: 'Klick ins Gelände platziert. Esc bricht ab.',
    roadHint: 'Punkt für Punkt setzen, dann Leertaste. Breite und Radius lassen sich danach ändern.',
    another: 'Weiterer', move: 'Verschieben', duplicate: 'Duplizieren', del: 'Löschen',
    deselect: 'Abwählen', delGroup: 'Gruppe löschen', selected: 'Objekte ausgewählt',
    datasheet: 'Datenblatt beim Hersteller',
    craneNote: 'Nur als Richtwert zu benutzen. Genaue Spezifikation siehe Datenblatt.',
    guideValues: 'Achtung: Richtwerte',
    dark: 'Dunkel', light: 'Hell',
    topView: '2D', topViewSet: 'Draufsicht. Ziehen kippt die Ansicht wieder.',
    north: 'Nach Norden ausrichten',
    sourceCode: 'Quelltext auf GitHub',
    imprint: 'Impressum', privacy: 'Datenschutz',
    demoLoading: 'Beispieldaten werden geladen: Gelände',
    demoLoadingBuildings: 'Beispieldaten werden geladen: Gebäude',
    demoReady: 'Beispieldatensatz geladen. Baustein unten wählen und ins Gelände klicken.',
    demoFailed: 'Beispieldaten konnten nicht geladen werden:',
    demoAttribution: 'Beispieldaten:',
    radiusTooTight: 'Der Mindestradius passt nicht zwischen die Stützpunkte. Punkte weiter auseinander setzen oder Radius verkleinern.',
    noManufacturerValue: 'keine Herstellerangabe',
    ifcExportBtn: 'Ausschnitt wählen', ifcExportHint: 'Rechteck auf dem Gelände ziehen. Esc bricht ab.',
    ifcPanelTitle: 'IFC-Export', ifcExtent: 'Ausdehnung', ifcTargetEpsg: 'Ziel-EPSG-Code',
    ifcExportAction: 'Exportieren', cancel: 'Abbrechen', msgIfcExported: 'IFC-Datei heruntergeladen.',
    crs: 'KBS', accuracy: 'Genauigkeit', unit: 'Einheit', unitMeter: 'Meter',
    hintClick: 'Klick', hintMeasure: 'Messpunkt', hintDrag: 'Ziehen',
    hintRotate: 'Drehen', hintEsc: 'Esc', hintCancel: 'Abbrechen',
    measureOn: 'Messpunkt auf', ground: 'Gelände', building: 'Gebäude',
    design: 'Design', font: 'Schriftart', fontSize: 'Schriftgröße',
    accent: 'Akzentfarbe', layout: 'Anordnung', panelWidth: 'Fensterbreite',
    language: 'Sprache', toolsLeft: 'Werkzeuge links', toolsRight: 'Werkzeuge rechts',
    loading: 'Lade', reset: 'Zurücksetzen',
    tCont: 'Container', tContHint: 'Ab zwei Reihen liegt die zweite quer',
    tTower: 'Turmdrehkran', tTowerHint: 'Liebherr und WOLFF, inkl. Schnellbaukrane',
    tMobile: 'Mobilkran', tMobileHint: 'Liebherr LTM',
    tRoad: 'Baustraße', tRoadHint: 'Stützpunkte setzen, Leertaste schließt ab',
    fCols: 'Anzahl nebeneinander', fRows: 'Reihen hintereinander', fLevels: 'Stockwerke',
    fRot: 'Winkel Anlage', fUnitL: 'Länge je Container', fUnitB: 'Breite je Container',
    fUnitH: 'Höhe je Container', fModel: 'Krantyp', fHook: 'Hakenhöhe',
    fRadius: 'Ausladung', fMast: 'Turmbreite', fJibRot: 'Winkel Ausleger',
    fBaseRot: 'Winkel Fundament', fVehRot: 'Winkel Fahrzeug', fShowRadius: 'Arbeitsradius zeigen',
    fWidth: 'Straßenbreite', fMinRadius: 'Mindestradius Kurve', fShowEdge: 'Ränder zeigen',
    msgPlaced: 'platziert.', msgMinTwo: 'Mindestens zwei Punkte setzen.',
    msgCleared: 'Baustelle geleert.', msgViewReset: 'Ansicht zurückgesetzt.',
    msgMoved: 'Position übernommen.', msgPickNew: 'Neue Position im Gelände anklicken.',
    msgNextPos: 'Nächste Position anklicken.', msgNeedTerrain: 'Bitte zuerst ein Geländemodell laden.',
    msgBuildingsLoaded: 'Gebäudemodell geladen.', msgBuildingsRemoved: 'Gebäudemodell entfernt.',
    roadDrawing: 'Baustraße: Punkte im Gelände setzen',
    roadSet: 'gesetzt', roadFinish: 'Leertaste beendet, Esc bricht ab',
    long: 'lang', tightest: 'engster Radius', curvesTight: 'Kurve(n) enger als gewünscht',
    conflict1: 'Kranradien überschneiden sich um', conflictN: 'Überschneidungen von Kranradien',
    nodeHint: 'Stützpunkt anklicken, dann neue Position im Gelände wählen.', nodePicked: 'Stützpunkt gewählt. Neue Position anklicken.', nodeMoved: 'Stützpunkt verschoben.', nodePickFirst: 'Zuerst einen Stützpunkt anklicken.', nodeMinTwo: 'Eine Baustraße braucht mindestens zwei Stützpunkte.', delNode: 'Punkt löschen'
  },
  en: {
    lang: 'English',
    overview: 'Overview', data: 'Data', view: 'View', site: 'Site',
    clear: 'Clear', appearance: 'Appearance', close: 'Close', tweak: 'View',
    noTerrain: 'No terrain model loaded',
    loadFirst: 'Load a terrain model to begin',
    terrainFile: 'Terrain · GeoTIFF', buildingFile: 'Buildings · CityGML',
    detail: 'Detail level', original: 'Original', points: 'points',
    noFile: 'No file', remove: 'Remove',
    heightRange: 'Elevation range', objects: 'Objects', containers: 'Containers',
    cranes: 'Cranes', area: 'Footprint', road: 'Haul road',
    nothingPlaced: 'Nothing placed yet',
    nothingSelected: 'No item selected',
    pickHint: 'Pick an item below or click a placed object.',
    placeHint: 'Click the terrain to place. Esc cancels.',
    roadHint: 'Set point by point, then press space. Width and radius can be changed afterwards.',
    another: 'Another', move: 'Move', duplicate: 'Duplicate', del: 'Delete',
    deselect: 'Deselect', delGroup: 'Delete group', selected: 'objects selected',
    datasheet: 'Manufacturer data sheet',
    craneNote: 'Guide values only. See the data sheet for exact specifications.',
    guideValues: 'Caution: guide values',
    dark: 'Dark', light: 'Light',
    topView: '2D', topViewSet: 'Top view. Drag to tilt back.',
    north: 'Face north',
    sourceCode: 'Source code on GitHub',
    imprint: 'Impressum', privacy: 'Datenschutz',
    demoLoading: 'Loading sample data: terrain',
    demoLoadingBuildings: 'Loading sample data: buildings',
    demoReady: 'Sample data loaded. Pick an element below and click the terrain.',
    demoFailed: 'Sample data could not be loaded:',
    demoAttribution: 'Sample data:',
    radiusTooTight: 'The minimum radius does not fit between the nodes. Move the nodes further apart or reduce the radius.',
    noManufacturerValue: 'no manufacturer figure',
    ifcExportBtn: 'Select extent', ifcExportHint: 'Drag a rectangle over the terrain. Esc cancels.',
    ifcPanelTitle: 'IFC export', ifcExtent: 'Extent', ifcTargetEpsg: 'Target EPSG code',
    ifcExportAction: 'Export', cancel: 'Cancel', msgIfcExported: 'IFC file downloaded.',
    crs: 'CRS', accuracy: 'Accuracy', unit: 'Unit', unitMeter: 'Metre',
    hintClick: 'Click', hintMeasure: 'Measure point', hintDrag: 'Drag',
    hintRotate: 'Orbit', hintEsc: 'Esc', hintCancel: 'Cancel',
    measureOn: 'Measure point on', ground: 'terrain', building: 'building',
    design: 'Design', font: 'Typeface', fontSize: 'Text size',
    accent: 'Accent colour', layout: 'Layout', panelWidth: 'Panel width',
    language: 'Language', toolsLeft: 'Tools left', toolsRight: 'Tools right',
    loading: 'Loading', reset: 'Reset',
    tCont: 'Containers', tContHint: 'From two rows the second lies crosswise',
    tTower: 'Tower crane', tTowerHint: 'Liebherr and WOLFF, incl. self-erecting',
    tMobile: 'Mobile crane', tMobileHint: 'Liebherr LTM',
    tRoad: 'Haul road', tRoadHint: 'Set points, space finishes',
    fCols: 'Units side by side', fRows: 'Rows behind each other', fLevels: 'Storeys',
    fRot: 'Angle', fUnitL: 'Unit length', fUnitB: 'Unit width',
    fUnitH: 'Unit height', fModel: 'Crane type', fHook: 'Hook height',
    fRadius: 'Radius', fMast: 'Mast width', fJibRot: 'Jib angle',
    fBaseRot: 'Base angle', fVehRot: 'Carrier angle', fShowRadius: 'Show working radius',
    fWidth: 'Road width', fMinRadius: 'Minimum curve radius', fShowEdge: 'Show edges',
    msgPlaced: 'placed.', msgMinTwo: 'Set at least two points.',
    msgCleared: 'Site cleared.', msgViewReset: 'View reset.',
    msgMoved: 'Position applied.', msgPickNew: 'Click the new position on the terrain.',
    msgNextPos: 'Click the next position.', msgNeedTerrain: 'Please load a terrain model first.',
    msgBuildingsLoaded: 'Building model loaded.', msgBuildingsRemoved: 'Building model removed.',
    roadDrawing: 'Haul road: set points on the terrain',
    roadSet: 'set', roadFinish: 'space finishes, Esc cancels',
    long: 'long', tightest: 'tightest radius', curvesTight: 'curve(s) tighter than requested',
    conflict1: 'Crane radii overlap by', conflictN: 'overlapping crane radii',
    nodeHint: 'Click a node, then pick its new position on the terrain.', nodePicked: 'Node selected. Click the new position.', nodeMoved: 'Node moved.', nodePickFirst: 'Select a node first.', nodeMinTwo: 'A haul road needs at least two nodes.', delNode: 'Delete node'
  }
};

function T(key) {
  const d = STRINGS[SETTINGS.language] || STRINGS.de;
  return d[key] !== undefined ? d[key] : (STRINGS.de[key] !== undefined ? STRINGS.de[key] : key);
}

/* Setzt alle fest im Markup stehenden Texte */
function applyLanguage() {
  const nodes = document.querySelectorAll('[data-i18n]');
  for (let i = 0; i < nodes.length; i++) {
    const k = nodes[i].getAttribute('data-i18n');
    if (k) nodes[i].textContent = T(k);
  }
  document.documentElement.lang = SETTINGS.language;
}

/* ---------- Parameterschemata ---------- */
const SCHEMAS = {
  container: [
    { key: 'cols',   label: 'fCols',  type: 'range', min: 1, max: 25, step: 1, unit: '' },
    { key: 'rows',   label: 'fRows', type: 'range', min: 1, max: 2,  step: 1, unit: '' },
    { key: 'levels', label: 'fLevels',            type: 'range', min: 1, max: 5,  step: 1, unit: '' },
    { key: 'rot',    label: 'fRot',         type: 'range', min: 0, max: 355, step: 5, unit: '°' },
    { key: 'unitL',  label: 'fUnitL',  type: 'number', min: 2, max: 15, step: 0.01, unit: 'm' },
    { key: 'unitB',  label: 'fUnitB', type: 'number', min: 1.5, max: 6, step: 0.01, unit: 'm' },
    { key: 'unitH',  label: 'fUnitH',   type: 'number', min: 2, max: 4,  step: 0.01, unit: 'm' }
  ],
  tower: [
    { key: 'model',      label: 'fModel',    type: 'select', source: 'tower' },
    { key: 'hookHeight', label: 'fHook',  type: 'range', min: 15, max: 130, step: 1, unit: 'm' },
    { key: 'radius',     label: 'fRadius',  type: 'range', min: 15, max: 85,  step: 1, unit: 'm' },
    { key: 'mastWidth',  label: 'fMast', type: 'range', min: 1.1, max: 3.5, step: 0.1, unit: 'm' },
    { key: 'rot',        label: 'fJibRot',  type: 'range', min: 0, max: 355, step: 5, unit: '°' },
    { key: 'baseRot',    label: 'fBaseRot', type: 'range', min: 0, max: 355, step: 5, unit: '°' },
    { key: 'showRadius', label: 'fShowRadius', type: 'checkbox' }
  ],
  mobile: [
    { key: 'model',      label: 'fModel',    type: 'select', source: 'mobile' },
    { key: 'hookHeight', label: 'fHook',  type: 'range', min: 10, max: 190, step: 1, unit: 'm' },
    { key: 'radius',     label: 'fRadius',  type: 'range', min: 3,  max: 140, step: 1, unit: 'm' },
    { key: 'rot',        label: 'fJibRot',  type: 'range', min: 0, max: 355, step: 5, unit: '°' },
    { key: 'baseRot',    label: 'fVehRot',  type: 'range', min: 0, max: 355, step: 5, unit: '°' },
    { key: 'showRadius', label: 'fShowRadius', type: 'checkbox' }
  ],
  road: [
    { key: 'width',    label: 'fWidth',       type: 'range', min: 3, max: 14, step: 0.5, unit: 'm' },
    { key: 'radius',   label: 'fMinRadius', type: 'range', min: 5, max: 60, step: 1, unit: 'm' },
    { key: 'showEdge', label: 'fShowEdge',       type: 'checkbox' }
  ]
};

const TOOL_INFO = {
  container: { name: 'tCont',   hint: 'tContHint' },
  tower:     { name: 'tTower',  hint: 'tTowerHint' },
  mobile:    { name: 'tMobile', hint: 'tMobileHint' },
  road:      { name: 'tRoad',   hint: 'tRoadHint' }
};


/* =========================================================
   Darstellung: Designs und Einstellungen
   ========================================================= */
const THEMES = {
  dunkel: {
    name: 'dark',
    vars: {
      '--bg': '#191c1f', '--scene': '#1f2429',
      '--panel-bg': 'rgba(32, 36, 40, 0.95)',
      '--border': '#3a4047', '--border-strong': '#586069',
      '--text': '#e2e6ea', '--text-dim': '#9aa3ac', '--text-dim2': '#6d7681',
      '--accent': '#4da3d9', '--danger': '#e0655a',
      '--field': '#262b30', '--radius': '2px'
    }
  },
  hell: {
    name: 'light',
    vars: {
      '--bg': '#cfd5db', '--scene': '#dde2e7',
      '--panel-bg': 'rgba(250, 251, 252, 0.96)',
      '--border': '#ccd2d8', '--border-strong': '#98a1aa',
      '--text': '#1b1f23', '--text-dim': '#515a63', '--text-dim2': '#7d868f',
      '--accent': '#1f6feb', '--danger': '#c4362c',
      '--field': '#ffffff', '--radius': '2px'
    }
  }
};



const FONTS = {
  system:  { name: 'Systemschrift',   stack: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" },
  arial:   { name: 'Arial',           stack: "Arial, Helvetica, 'Liberation Sans', sans-serif" },
  narrow:  { name: 'Arial Narrow',    stack: "'Arial Narrow', 'Liberation Sans Narrow', 'Nimbus Sans Narrow', Arial, sans-serif" },
  calibri: { name: 'Calibri',         stack: "Calibri, Carlito, 'Segoe UI', Candara, sans-serif" },
  helv:    { name: 'Helvetica',       stack: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  verdana: { name: 'Verdana',         stack: "Verdana, Geneva, 'DejaVu Sans', sans-serif" },
  tahoma:  { name: 'Tahoma',          stack: "Tahoma, Geneva, 'DejaVu Sans', sans-serif" },
  times:   { name: 'Times New Roman', stack: "'Times New Roman', Times, 'Liberation Serif', serif" },
  georgia: { name: 'Georgia',         stack: "Georgia, 'Iowan Old Style', 'Times New Roman', serif" },
  simplex: { name: 'Simplex (CAD)',   stack: "'Simplex', 'ISOCPEUR', 'RomanS', 'Consolas', 'DejaVu Sans Mono', monospace" },
  mono:    { name: 'Consolas',        stack: "Consolas, 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace" }
};



const ACCENTS = ['#4aa3df', '#0696d7', '#1858ff', '#e8890c', '#37a06a'];

const SETTINGS = {
  theme: 'dunkel',
  font: 'system',
  size: 12,
  accent: null,
  layout: 'links',
  width: 300,
  detail: 1,
  language: 'de'
};


function applySettings() {
  const root = document.documentElement;
  const th = THEMES[SETTINGS.theme] || THEMES.blaupause;
  Object.keys(th.vars).forEach(function (k) { root.style.setProperty(k, th.vars[k]); });
  if (SETTINGS.accent) root.style.setProperty('--accent', SETTINGS.accent);

  const f = FONTS[SETTINGS.font] || FONTS.system;
  root.style.setProperty('--ui-font', f.stack);
  root.style.setProperty('--ui-size', SETTINGS.size + 'px');
  root.style.setProperty('--panel-w', SETTINGS.width + 'px');

  document.body.className = SETTINGS.layout === 'rechts' ? 'swapped' : '';

  // Szenenhintergrund an das Design angleichen
  const sceneHex = parseInt((th.vars['--scene'] || '#0c2438').slice(1), 16);
  if (scene && scene.background && scene.background.setHex) scene.background.setHex(sceneHex);
  if (scene && scene.fog && scene.fog.color && scene.fog.color.setHex) scene.fog.color.setHex(sceneHex);
}

/* ---------- Tweak-Fenster ---------- */
function optionRow(label, options, current, onPick) {
  const row = document.createElement('div');
  row.className = 'tw-row';
  const lab = document.createElement('div');
  lab.className = 'tw-label';
  lab.textContent = label;
  row.appendChild(lab);

  const group = document.createElement('div');
  group.className = 'tw-group';
  options.forEach(function (o) {
    const b = document.createElement('button');
    b.className = 'tw-opt' + (o.value === current ? ' on' : '');
    b.textContent = o.label;
    if (o.color) { b.className += ' swatch'; b.style.background = o.color; b.textContent = ''; }
    b.addEventListener('click', function () {
      onPick(o.value);
      applySettings();
      buildTweakPanel();
    });
    group.appendChild(b);
  });
  row.appendChild(group);
  return row;
}

function sliderRow(label, min, max, step, value, unit, onChange) {
  const row = document.createElement('div');
  row.className = 'tw-row';
  const head = document.createElement('div');
  head.className = 'tw-label';
  head.textContent = label;
  const val = document.createElement('span');
  val.className = 'tw-val';
  val.textContent = value + unit;
  head.appendChild(val);
  row.appendChild(head);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = min; input.max = max; input.step = step; input.value = value;
  input.className = 'tw-slider';
  input.addEventListener('input', function () {
    const v = parseFloat(input.value);
    if (!isFinite(v)) return;
    val.textContent = v + unit;
    onChange(v);
    applySettings();
  });
  row.appendChild(input);
  return row;
}

function selectRow(label, options, current, onPick) {
  const row = document.createElement('div');
  row.className = 'tw-row';
  const lab = document.createElement('div');
  lab.className = 'tw-label';
  lab.textContent = label;
  row.appendChild(lab);

  const sel = document.createElement('select');
  sel.className = 'tw-select';
  options.forEach(function (o) {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.label;
    sel.appendChild(opt);
  });
  sel.value = current;
  sel.addEventListener('change', function () {
    onPick(sel.value);
    applySettings();
    refreshTexts();
    buildTweakPanel();
  });
  row.appendChild(sel);
  return row;
}

function buildTweakPanel() {
  const body = document.getElementById('tweak-body');
  body.innerHTML = '';

  body.appendChild(optionRow(T('design'),
    Object.keys(THEMES).map(function (k) { return { value: k, label: T(THEMES[k].name) }; }),
    SETTINGS.theme, function (v) { SETTINGS.theme = v; SETTINGS.accent = null; }));

  body.appendChild(selectRow(T('font'),
    Object.keys(FONTS).map(function (k) { return { value: k, label: FONTS[k].name }; }),
    SETTINGS.font, function (v) { SETTINGS.font = v; }));

  body.appendChild(sliderRow(T('fontSize'), 10, 16, 0.5, SETTINGS.size, ' px',
    function (v) { SETTINGS.size = v; }));

  body.appendChild(optionRow(T('accent'),
    ACCENTS.map(function (c) { return { value: c, label: '', color: c }; }),
    SETTINGS.accent, function (v) { SETTINGS.accent = v; }));

  body.appendChild(optionRow(T('layout'),
    [{ value: 'links', label: T('toolsLeft') }, { value: 'rechts', label: T('toolsRight') }],
    SETTINGS.layout, function (v) { SETTINGS.layout = v; }));

  body.appendChild(sliderRow(T('panelWidth'), 250, 400, 10, SETTINGS.width, ' px',
    function (v) { SETTINGS.width = v; }));
}

function setLanguage(code) {
  if (!STRINGS[code] || SETTINGS.language === code) { markLanguageButtons(); return; }
  SETTINGS.language = code;
  markLanguageButtons();
  refreshTexts();
  if (document.getElementById('tweak-panel').style.display === 'block') buildTweakPanel();
}

function markLanguageButtons() {
  Object.keys(STRINGS).forEach(function (code) {
    const b = document.getElementById('lang-' + code);
    if (b && b.classList) b.classList.toggle('on', SETTINGS.language === code);
  });
}

/* Nach einem Sprachwechsel alle sichtbaren Texte erneuern */
function refreshTexts() {
  applyLanguage();
  const pal = document.getElementById('palette').children;
  for (let i = 0; i < pal.length; i++) {
    const type = pal[i].dataset.tool;
    if (!type) continue;
    pal[i].title = T(TOOL_INFO[type].hint);
    const nm = pal[i].children[1];
    if (nm) nm.textContent = T(TOOL_INFO[type].name);
  }
  document.getElementById('detail-val').textContent = detailLabel();
  updateInfoBar();
  updateTerrainInfo();
  renderOverview();
  refreshAttribution();
  const id = getSelectedId();
  if (id !== null) showObjectEditor(id);
  else if (activeTool) selectTool(activeTool);
  else selectTool(null);
}

function toggleTweak(force) {
  const p = document.getElementById('tweak-panel');
  const open = force !== undefined ? force : p.style.display !== 'block';
  p.style.display = open ? 'block' : 'none';
  if (open) buildTweakPanel();
}

/* =========================================================
   Formulare
   ========================================================= */
function makeRow(field, value, onChange) {
  const row = document.createElement('div');
  row.className = 'field';

  const head = document.createElement('div');
  head.className = 'field-head';
  const lab = document.createElement('label');
  lab.textContent = T(field.label);
  head.appendChild(lab);
  const out = document.createElement('span');
  out.className = 'field-val';
  head.appendChild(out);
  row.appendChild(head);

  let input;
  if (field.type === 'select') {
    input = document.createElement('select');
    const src = field.source === 'tower' ? TOWER_MODELS : CRANE_MODELS;
    src.forEach(function (m) {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name + '  ' + m.cap + ' t';
      input.appendChild(opt);
    });
    input.value = value;
    input.addEventListener('change', function () { onChange(field.key, input.value); });
  } else if (field.type === 'checkbox') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value !== false;
    input.addEventListener('change', function () { onChange(field.key, input.checked); });
  } else {
    input = document.createElement('input');
    input.type = field.type === 'number' ? 'number' : 'range';
    input.min = field.min; input.max = field.max; input.step = field.step;
    input.value = value;
    out.textContent = formatVal(value, field.unit);
    input.addEventListener('input', function () {
      const v = parseFloat(input.value);
      if (!isFinite(v)) return;
      out.textContent = formatVal(v, field.unit);
      onChange(field.key, v);
    });
  }
  input.className = 'field-input';
  row.appendChild(input);
  return { row: row, input: input, out: out, field: field };
}

function formatVal(v, unit) {
  const s = (Math.round(v * 100) / 100).toString();
  return unit ? s + ' ' + unit : s;
}

/* Reihenfolge im Formular: Auswahl, Schieberegler, Zahlenfelder, Schalter */
const FIELD_ORDER = { select: 0, range: 1, number: 2, checkbox: 3 };

function fieldRank(type) {
  // Achtung: select hat den Rang 0, deshalb kein ||-Kurzschluss
  const r = FIELD_ORDER[type];
  return r === undefined ? 9 : r;
}

function sortFields(fields) {
  return fields.map(function (f, i) { return { f: f, i: i }; })
    .sort(function (a, b) {
      const d = fieldRank(a.f.type) - fieldRank(b.f.type);
      return d !== 0 ? d : a.i - b.i;
    })
    .map(function (x) { return x.f; });
}

function buildForm(type, values, onChange) {
  const wrap = document.createElement('div');
  wrap.className = 'form';
  const refs = {};
  let lastGroup = null;
  sortFields(SCHEMAS[type]).forEach(function (f) {
    const grp = fieldRank(f.type);
    if (lastGroup !== null && grp !== lastGroup) {
      const sep = document.createElement('div');
      sep.className = 'sep';
      wrap.appendChild(sep);
    }
    lastGroup = grp;
    const r = makeRow(f, values[f.key], onChange);
    refs[f.key] = r;
    wrap.appendChild(r.row);
  });
  return { element: wrap, refs: refs };
}

function syncForm(refs, values) {
  Object.keys(refs).forEach(function (k) {
    const r = refs[k];
    if (!r) return;
    const v = values[k];
    if (r.field.type === 'checkbox') r.input.checked = v !== false;
    else if (r.field.type === 'select') r.input.value = v;
    else { r.input.value = v; r.out.textContent = formatVal(v, r.field.unit); }
  });
}

function applyModelDefaults(values, refs, type) {
  const tower = type === 'tower';
  const m = tower ? getTowerModel(values.model) : getModel(values.model);

  values.hookHeight = m.hookDef;
  values.radius = tower ? m.jibDef : m.radiusDef;
  // Turmbreite bleibt frei einstellbar und wird vom Modellwechsel nicht überschrieben

  if (!refs) return;
  // Ohne belegte Herstellerangabe bleibt der Bereich aus dem Schema stehen
  const setMax = function (ref, v) {
    if (!ref) return;
    ref.input.max = (v === null || v === undefined) ? ref.field.max : v;
  };
  setMax(refs.hookHeight, m.hookMax);
  setMax(refs.radius, tower ? m.jibMax : m.radiusMax);
  syncForm(refs, values);
}

/* =========================================================
   Rechtes Fenster ein- und ausblenden
   ========================================================= */
function showPanel(on) {
  document.getElementById('col-right').style.display = on ? 'flex' : 'none';
}

/* ---------- Werkzeugwahl ---------- */
function selectTool(type) {
  clearRoadNodes();
  if (activeTool === 'road' && type !== 'road') { roadPoints = []; clearRoadPreview(); setRoadHint(false); }
  activeTool = type;
  selectObject(null);
  moveMode = false;
  roadPoints = [];
  clearRoadPreview();
  setRoadHint(type === 'road');

  const cards = document.getElementById('palette').children;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].classList) cards[i].classList.toggle('active', cards[i].dataset && cards[i].dataset.tool === type);
  }

  const panel = document.getElementById('param-panel');
  panel.innerHTML = '';

  if (!type) {
    clearGhost();
    showPanel(false);
    renderOverview();
    return;
  }

  if (!toolParams[type]) toolParams[type] = defaultsFor(type);
  const values = toolParams[type];

  document.getElementById('param-title').textContent = T(TOOL_INFO[type].name);
  document.getElementById('param-hint').textContent = T(TOOL_INFO[type].hint);

  const form = buildForm(type, values, function (key, v) {
    values[key] = v;
    if (key === 'model') applyModelDefaults(values, form.refs, type);
    setGhost(type, values);
  });
  formRefs = form.refs;
  panel.appendChild(form.element);

  const note = document.createElement('div');
  note.className = 'place-note';
  note.textContent = type === 'road'
    ? 'Stützpunkte nacheinander anklicken, Leertaste schließt die Straße ab. Esc bricht ab.'
    : 'Klick ins Gelände platziert. Esc bricht ab.';
  panel.appendChild(note);

  showPanel(true);
  if (type === 'road') {
    clearGhost();
    roadPoints = [];
    clearRoadPreview();
    setRoadHint(true);
  } else {
    setGhost(type, values);
  }
  renderOverview();
}

/* ---------- Editor eines platzierten Objekts ---------- */
function showObjectEditor(id) {
  const obj = findObject(id);
  if (!obj) return;

  activeTool = null;
  clearGhost();
  selectObject(id);
  clearRoadNodes();
  if (obj.type === 'road') showRoadNodes(obj);

  const cards = document.getElementById('palette').children;
  for (let i = 0; i < cards.length; i++) if (cards[i].classList) cards[i].classList.remove('active');

  const panel = document.getElementById('param-panel');
  panel.innerHTML = '';

  const utm = worldToUTM(obj.x, obj.z);
  document.getElementById('param-title').textContent = labelFor(obj.type, obj.params);
  if (obj.type === 'road') {
    document.getElementById('param-hint').textContent = roadHintText(obj);
  } else {
    document.getElementById('param-hint').textContent =
      'R ' + Math.round(utm.e) + '   H ' + Math.round(utm.n) +
      '   Z ' + getAbsoluteHeightAt(obj.x, obj.z).toFixed(2) + ' m';
  }

  if (obj.type === 'tower' || obj.type === 'mobile') {
    const m = obj.type === 'tower' ? getTowerModel(obj.params.model) : getModel(obj.params.model);

    const warn = document.createElement('div');
    warn.className = 'crane-warn';
    const head = document.createElement('div');
    head.className = 'crane-warn-head';
    head.textContent = T('guideValues');
    warn.appendChild(head);
    const body = document.createElement('div');
    body.textContent = T('craneNote');
    warn.appendChild(body);

    const url = sheetUrlFor(m);
    if (url) {
      const a = document.createElement('a');
      a.className = 'sheet-link';
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = T('datasheet') + ' · ' + m.maker + ' →';
      warn.appendChild(a);
    }
    panel.appendChild(warn);
  }

  const form = buildForm(obj.type, obj.params, function (key, v) {
    obj.params[key] = v;
    if (key === 'model') applyModelDefaults(obj.params, form.refs, obj.type);
    rebuildObject(obj);
    renderOverview();
    document.getElementById('param-title').textContent = labelFor(obj.type, obj.params);
    if (obj.type === 'road') {
      markRoadRadius(obj, form.refs);
      document.getElementById('param-hint').textContent = roadHintText(obj);
    }
  });
  formRefs = form.refs;
  panel.appendChild(form.element);
  if (obj.type === 'road') markRoadRadius(obj, form.refs);

  if (obj.type === 'road') {
    const note = document.createElement('div');
    note.className = 'data-note';
    note.textContent = T('nodeHint');
    panel.appendChild(note);
  }

  const actions = document.createElement('div');
  actions.className = 'actions';

  const btnMore = document.createElement('button');
  btnMore.className = 'btn';
  btnMore.textContent = T('another');
  if (obj.type === 'road') btnMore.style.display = 'none';
  btnMore.title = 'Noch einen Baustein dieser Art platzieren';
  btnMore.addEventListener('click', function () {
    toolParams[obj.type] = JSON.parse(JSON.stringify(obj.params));
    selectTool(obj.type);
    setStatus(T('msgNextPos'));
  });
  actions.appendChild(btnMore);

  const btnMove = document.createElement('button');
  btnMove.className = 'btn';
  btnMove.textContent = T('move');
  btnMove.addEventListener('click', function () {
    moveMode = true;
    setStatus(T('msgPickNew'));
  });
  actions.appendChild(btnMove);

  const btnDup = document.createElement('button');
  btnDup.className = 'btn';
  btnDup.textContent = T('duplicate');
  btnDup.addEventListener('click', function () {
    const copy = addObject(obj.type, obj.x + 20, obj.z + 20, JSON.parse(JSON.stringify(obj.params)));
    showObjectEditor(copy.id);
    renderOverview();
  });
  actions.appendChild(btnDup);

  if (obj.type === 'road') {
    const btnNode = document.createElement('button');
    btnNode.className = 'btn';
    btnNode.textContent = T('delNode');
    btnNode.addEventListener('click', function () {
      const i = activeRoadNode();
      if (i === null) { setStatus(T('nodePickFirst'), true); return; }
      if (removeRoadNode(obj, i)) {
        showObjectEditor(obj.id);
        renderOverview();
      } else {
        setStatus(T('nodeMinTwo'), true);
      }
    });
    actions.appendChild(btnNode);
  }

  const btnDel = document.createElement('button');
  btnDel.className = 'btn danger';
  btnDel.textContent = T('del');
  btnDel.addEventListener('click', function () {
    removeObject(obj.id);
    selectTool(null);
    renderOverview();
  });
  actions.appendChild(btnDel);

  panel.appendChild(actions);
  showPanel(true);
  renderOverview();
}

/* ---------- Editor für eine ausgewählte Gruppe ---------- */
function showGroupEditor(ids, title) {
  activeTool = null;
  clearGhost();

  const panel = document.getElementById('param-panel');
  panel.innerHTML = '';
  document.getElementById('param-title').textContent = title;
  document.getElementById('param-hint').textContent = ids.length + ' ' + T('selected');

  const actions = document.createElement('div');
  actions.className = 'actions';

  const btnClear = document.createElement('button');
  btnClear.className = 'btn';
  btnClear.textContent = T('deselect');
  btnClear.addEventListener('click', function () { selectTool(null); });
  actions.appendChild(btnClear);

  const btnDel = document.createElement('button');
  btnDel.className = 'btn danger';
  btnDel.textContent = T('delGroup');
  btnDel.addEventListener('click', function () {
    ids.slice().forEach(function (i) { removeObject(i); });
    selectTool(null);
    renderOverview();
  });
  actions.appendChild(btnDel);

  panel.appendChild(actions);
  showPanel(true);
}

/* =========================================================
   Übersicht der Gerätschaften (oben links)
   ========================================================= */
/* Hinweistext einer Baustraße */
function roadHintText(obj) {
  const info = roadInfo(obj.params);
  let txt = Math.round(info.length) + ' m ' + T('long') + ' · ' +
            T('tightest') + ' ' + info.minRadius.toFixed(1) + ' m';
  if (info.reduced) txt += ' · ' + info.reduced + ' ' + T('curvesTight');
  return txt;
}

/* Färbt den Radiusregler, sobald der Wunschradius nicht gehalten werden kann.
   Der Regler bleibt bedienbar, damit man ihn zurückdrehen kann. */
function markRoadRadius(obj, refs) {
  const ref = refs && refs.radius;
  if (!ref) return null;
  const info = roadInfo(obj.params);
  const eng = info.reduced > 0;
  ref.row.className = 'field' + (eng ? ' field-warn' : '');
  ref.out.textContent = eng
    ? formatVal(obj.params.radius, 'm') + ' → ' + info.minRadius.toFixed(1) + ' m'
    : formatVal(obj.params.radius, 'm');
  ref.input.title = eng ? T('radiusTooTight') : '';
  return eng;
}

function groupKeyFor(o) {
  if (o.type === 'container') return 'Containeranlage';
  if (o.type === 'road') return 'Baustraße';
  if (o.type === 'tower') return getTowerModel(o.params.model).name;
  return getModel(o.params.model).name;
}

function buildGroups() {
  const map = {};
  const order = [];
  objects.forEach(function (o) {
    const k = groupKeyFor(o);
    if (!map[k]) { map[k] = { key: k, type: o.type, ids: [], units: 0, meters: 0 }; order.push(k); }
    map[k].ids.push(o.id);
    map[k].units += o.type === 'container' ? containerLayout(o.params).count : 1;
    if (o.type === 'road') map[k].meters += roadInfo(o.params).length;
  });
  return order.map(function (k) { return map[k]; });
}

function renderOverview() {
  const s = computeStats();
  document.getElementById('stat-objects').textContent = s.total;
  document.getElementById('stat-containers').textContent = s.containers;
  document.getElementById('stat-cranes').textContent = (s.towers + s.mobiles);
  document.getElementById('stat-area').textContent = Math.round(s.area) + ' m2';
  document.getElementById('stat-road').textContent = Math.round(s.roadLength) + ' m';

  const list = document.getElementById('overview-list');
  list.innerHTML = '';

  const groups = buildGroups();
  if (!groups.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = T('nothingPlaced');
    list.appendChild(e);
  } else {
    groups.forEach(function (g) {
      const allSel = g.ids.length > 0 && g.ids.every(isSelected);
      const row = document.createElement('div');
      row.className = 'grp-row' + (allSel ? ' selected' : '');

      const dot = document.createElement('span');
      dot.className = 'dot ' + g.type;
      row.appendChild(dot);

      const nm = document.createElement('span');
      nm.className = 'grp-name';
      nm.textContent = g.key;
      row.appendChild(nm);

      const cnt = document.createElement('span');
      cnt.className = 'grp-count';
      cnt.textContent = g.type === 'container'
        ? g.ids.length + ' / ' + g.units + ' St.'
        : (g.type === 'road' ? Math.round(g.meters) + ' m' : String(g.ids.length));
      row.appendChild(cnt);

      row.addEventListener('click', function () {
        if (g.ids.length === 1) {
          showObjectEditor(g.ids[0]);
        } else {
          selectObjects(g.ids);
          showGroupEditor(g.ids, g.key);
          renderOverview();
        }
      });
      list.appendChild(row);
    });
  }

  const conflicts = radiusConflicts();
  const warn = document.getElementById('warning');
  if (conflicts.length) {
    warn.style.display = 'block';
    warn.textContent = conflicts.length === 1
      ? T('conflict1') + ' ' + conflicts[0].overlap.toFixed(1) + ' m'
      : conflicts.length + ' ' + T('conflictN');
  } else {
    warn.style.display = 'none';
  }
}

/* ---------- Statuszeile ---------- */
function setRoadHint(on) {
  const el = document.getElementById('road-hint');
  el.style.display = on ? 'block' : 'none';
  if (on) {
    el.textContent = roadPoints.length < 2
      ? T('roadDrawing') + ' · ' + roadPoints.length + ' ' + T('roadSet')
      : T('tRoad') + ': ' + roadPoints.length + ' · ' + T('roadFinish');
  }
}

function finishRoad() {
  if (activeTool !== 'road') return false;
  if (roadPoints.length < 2) {
    setStatus(T('msgMinTwo'), true);
    return false;
  }
  const params = JSON.parse(JSON.stringify(toolParams.road));
  params.points = roadPoints.slice();
  const c = roadCentroid(params.points);
  const obj = addObject('road', c.x, c.z, params);

  roadPoints = [];
  clearRoadPreview();
  setRoadHint(false);

  const r = obj.group.userData;
  if (r.reduced) {
    setStatus(r.reduced + ' Kurve(n) zu eng: Radius dort auf ' +
              r.minRadius.toFixed(1) + ' m verkleinert.', true);
  } else {
    setStatus('Baustraße angelegt: ' + Math.round(r.length) + ' m.');
  }
  showObjectEditor(obj.id);
  return true;
}

function setStatus(msg, isError) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
  el.className = isError ? 'error' : '';
  if (statusTimer) clearTimeout(statusTimer);
  if (msg) statusTimer = setTimeout(function () { el.style.display = 'none'; }, isError ? 8000 : 3000);
}

function setNeedsData(on) {
  const data = document.getElementById('data');
  data.className = 'panel' + (on ? ' needs' : '');
  document.getElementById('data-note').style.display = on ? 'block' : 'none';
  const cards = document.getElementById('palette').children;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].classList) cards[i].classList.toggle('off', on);
  }
}

function updateInfoBar() {
  const t = TERRAIN;
  document.getElementById('crs-info').textContent = T('crs') + ' ' + ((t && t.crs) || '–');
  let acc = '–';
  if (t && isFinite(t.cell)) {
    acc = t.cell.toFixed(2) + ' m';
    if (t.simplified && isFinite(t.srcRes)) acc += ' (Quelle ' + t.srcRes.toFixed(2) + ' m)';
  }
  document.getElementById('acc-info').textContent = T('accuracy') + ' ' + acc;
  document.getElementById('unit-info').textContent = T('unit') + ' ' + T('unitMeter') + ' (m)';
}

function updateTerrainInfo() {
  const t = TERRAIN;
  updateInfoBar();
  if (!t) {
    document.getElementById('tile-label').textContent = T('noTerrain');
    document.getElementById('tile-size').textContent = '–';
    document.getElementById('tile-grid').textContent = '–';
    document.getElementById('stat-relief').textContent = '–';
    setNeedsData(true);
    return;
  }
  setNeedsData(false);
  document.getElementById('tile-label').textContent = t.label;
  document.getElementById('tile-size').textContent = Math.round(t.w) + ' × ' + Math.round(t.d) + ' m';
  document.getElementById('tile-grid').textContent = t.nx + ' × ' + t.nz;
  document.getElementById('stat-relief').textContent = t.zmin.toFixed(1) + ' – ' + t.zmax.toFixed(1) + ' m';
}

/* ---------- Messpunkt ---------- */
function showMeasure(pt, onBuilding) {
  const utm = worldToUTM(pt.x, pt.z);
  const z = pt.y + TERRAIN.zmin;
  setMeasureMarker(pt.x, pt.y, pt.z);
  focusOnPoint(pt.x, pt.y, pt.z);

  document.getElementById('measure-r').textContent = utm.e.toFixed(2);
  document.getElementById('measure-h').textContent = utm.n.toFixed(2);
  document.getElementById('measure-z').textContent = z.toFixed(2);
  document.getElementById('measure-src').textContent =
    T('measureOn') + ' ' + (onBuilding ? T('building') : T('ground'));
  document.getElementById('point-label').style.display = 'block';
  updatePointLabel();
}

function hideMeasure() {
  clearMeasureMarker();
  document.getElementById('point-label').style.display = 'none';
}

/* Dreht die Nordnadel mit der Kamera; wird pro Bild aufgerufen */
function updateCompass() {
  const n = document.getElementById('compass-needle');
  if (n) n.style.transform = 'rotate(' + northAngle().toFixed(1) + 'deg)';
  // Der 2D-Knopf leuchtet nur, solange die Ansicht tatsächlich senkrecht steht
  const b = document.getElementById('view2d-btn');
  if (b && b.classList) b.classList.toggle('on', isTopView());
}

/* Hält die Beschriftung am Messpunkt; wird pro Bild aufgerufen */
function updatePointLabel() {
  const el = document.getElementById('point-label');
  const p = measureScreenPos();
  if (!p) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  el.style.left = Math.round(p.x) + 'px';
  el.style.top = Math.round(p.y) + 'px';
}

/* ---------- Dateiimport ---------- */
function setFileStatus(which, msg, kind) {
  const el = document.getElementById(which === 'dem' ? 'dem-status' : 'gml-status');
  el.textContent = msg;
  el.className = 'file-status' + (kind ? ' ' + kind : '');
}

const DETAIL_STEPS = [140, 260, 500, 900, 0];   // 0 = ohne Vereinfachung

function detailLimit() {
  const i = Math.max(0, Math.min(DETAIL_STEPS.length - 1, Math.round(SETTINGS.detail)));
  return DETAIL_STEPS[i];
}

function detailLabel() {
  const v = detailLimit();
  return v === 0 ? T('original') : v + ' ' + T('points');
}

async function rebuildTerrainDetail() {
  if (!lastDemTiles) return;
  setFileStatus('dem', 'Rechne neu', 'busy');
  try {
    const t = gridTiles(lastDemTiles, detailLimit());
    buildTerrain(t);
    reseatAllObjects();
    updateTerrainInfo();
    renderOverview();
    if (lastGmlRings) {
      try { setBuildings(buildBuildingsMesh(lastGmlRings)); } catch (e) { clearBuildings(); }
    }
    setFileStatus('dem', demStatusText(t), 'ok');
  } catch (err) {
    setFileStatus('dem', err.message, 'err');
  }
}

function demStatusText(t) {
  let st = lastDemNames.length > 1
    ? lastDemNames.length + ' Kacheln verbunden'
    : (lastDemNames[0] || '');
  st += ' · ' + t.nx + '×' + t.nz;
  if (t.gaps) st += ' · ' + t.gaps + ' Lücken gefüllt';
  return st;
}

async function handleDemFiles(files, isDemo) {
  const list = Array.prototype.slice.call(files || []);
  if (!list.length) return;
  setFileStatus('dem', list.length === 1 ? 'Lese ' + list[0].name : 'Lese ' + list.length + ' Kacheln', 'busy');
  try {
    const items = [];
    for (let i = 0; i < list.length; i++) {
      items.push({ buffer: await list[i].arrayBuffer(), name: list[i].name });
    }
    lastDemTiles = await readTiffTiles(items);
    lastDemNames = items.map(function (x) { return x.name; });
    const t = gridTiles(lastDemTiles, detailLimit());

    hideMeasure();
    buildTerrain(t);
    frameTerrain();
    const removed = pruneObjectsOutside();
    reseatAllObjects();
    updateTerrainInfo();
    renderOverview();

    demoAttribDem = !!isDemo;
    refreshAttribution();

    setFileStatus('dem', demStatusText(t), 'ok');

    let msg = 'Gelände ersetzt: ' + Math.round(t.w) + ' × ' + Math.round(t.d) + ' m.';
    if (removed) msg += ' ' + removed + ' Objekt(e) außerhalb entfernt.';
    setStatus(msg);

    if (lastGmlRings) {
      try {
        setBuildings(buildBuildingsMesh(lastGmlRings));
        setFileStatus('gml', 'Neu eingepasst', 'ok');
      } catch (e) {
        clearBuildings();
        setFileStatus('gml', e.message, 'err');
      }
    }
  } catch (err) {
    setFileStatus('dem', err.message, 'err');
    setStatus('GeoTIFF nicht lesbar: ' + err.message, true);
  }
}

async function handleGmlFiles(files, isDemo) {
  const list = Array.prototype.slice.call(files || []);
  if (!list.length) return;
  setFileStatus('gml', list.length === 1 ? 'Lese ' + list[0].name : 'Lese ' + list.length + ' Dateien', 'busy');
  try {
    const texts = [];
    for (let i = 0; i < list.length; i++) {
      texts.push({ name: list[i].name, text: await list[i].text() });
    }
    const merged = mergeCityGML(texts);
    lastGmlRings = merged.rings;

    const mesh = buildBuildingsMesh(merged.rings);
    setBuildings(mesh);

    demoAttribGml = !!isDemo;
    refreshAttribution();

    let msg = mesh.userData.faces + ' Flächen';
    if (merged.files > 1) msg = merged.files + ' Dateien · ' + msg;
    if (mesh.userData.skipped) msg += ', ' + mesh.userData.skipped + ' außerhalb';
    setFileStatus('gml', msg, merged.failed.length ? 'busy' : 'ok');
    if (merged.failed.length) {
      setStatus(merged.failed.length + ' Datei(en) übersprungen: ' + merged.failed[0], true);
    } else {
      setStatus(T('msgBuildingsLoaded'));
    }
  } catch (err) {
    setFileStatus('gml', err.message, 'err');
    setStatus('CityGML nicht lesbar: ' + err.message, true);
  }
}

/* =========================================================
   Beispieldatensatz über die Adresszeile laden
   Aufruf:  index.html?demo=1
   ========================================================= */
const DEMO_FILES = {
  dem: 'demo/demo_dgm.tif',
  gml: 'demo/demo_lod2.gml'
};

/* Quelle der Beispieldaten (CC BY 4.0). Beim Austausch der Daten in demo/
   muss dieser Eintrag mitgeändert werden. */
const DEMO_ATTRIBUTION = {
  publisher: 'Bayerische Vermessungsverwaltung',
  url: 'https://geodaten.bayern.de/opengeodata/OpenDataDetail.html?pn=dgm1',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.de'
};

/* Getrennt für Gelände und Gebäude: ersetzt der Nutzer nur eines von
   beiden durch eigene Daten, bleibt die Namensnennung für das jeweils
   andere bestehen. */
let demoAttribDem = false;
let demoAttribGml = false;

/* Blendet Herausgeber und Lizenz ein, solange Beispieldaten geladen sind. */
function showAttribution(on) {
  const el = document.getElementById('attribution');
  if (!el) return;
  if (!on) { el.style.display = 'none'; return; }

  el.textContent = '';
  const label = document.createElement('span');
  label.textContent = T('demoAttribution');
  el.appendChild(label);

  const pub = document.createElement('a');
  pub.href = DEMO_ATTRIBUTION.url;
  pub.target = '_blank';
  pub.rel = 'noopener noreferrer';
  pub.textContent = DEMO_ATTRIBUTION.publisher;
  el.appendChild(pub);

  const lic = document.createElement('a');
  lic.href = DEMO_ATTRIBUTION.licenseUrl;
  lic.target = '_blank';
  lic.rel = 'noopener noreferrer';
  lic.textContent = DEMO_ATTRIBUTION.license;
  el.appendChild(lic);

  el.style.display = 'flex';
}

function refreshAttribution() {
  showAttribution(demoAttribDem || demoAttribGml);
}

function isAttributionShown() {
  return demoAttribDem || demoAttribGml;
}

/* Macht aus einer Antwort ein Objekt mit derselben Schnittstelle
   wie eine vom Nutzer gewählte Datei. */
function remoteFile(name, response) {
  return {
    name: name,
    arrayBuffer: function () { return response.arrayBuffer(); },
    text: function () { return response.text(); }
  };
}

async function loadDemo() {
  const box = document.getElementById('loading');
  box.style.display = 'flex';
  box.textContent = T('demoLoading');
  try {
    const demRes = await fetch(DEMO_FILES.dem);
    if (!demRes.ok) throw new Error(DEMO_FILES.dem + ' (' + demRes.status + ')');
    await handleDemFiles([remoteFile('demo_dgm.tif', demRes)], true);

    box.textContent = T('demoLoadingBuildings');
    const gmlRes = await fetch(DEMO_FILES.gml);
    if (!gmlRes.ok) throw new Error(DEMO_FILES.gml + ' (' + gmlRes.status + ')');
    await handleGmlFiles([remoteFile('demo_lod2.gml', gmlRes)], true);

    box.style.display = 'none';
    setStatus(T('demoReady'));
    return true;
  } catch (err) {
    box.style.display = 'none';
    setFileStatus('dem', err.message, 'err');
    setStatus(T('demoFailed') + ' ' + err.message, true);
    return false;
  }
}

function demoRequested() {
  const q = (window.location && window.location.search) || '';
  return /[?&]demo=1/.test(q);
}

/* =========================================================
   IFC-Export (Rechteckauswahl in der 2D-Ansicht)
   ========================================================= */
let rectSelectActive = false;
let rectStart = null;          // Weltkoordinaten der ersten Ecke während des Ziehens
let rectPreviewGroup = null;   // Rechteck-Vorschau während des Ziehens
let exportPreviewGroup = null; // Vorschau des tatsächlich exportierten Ausschnitts
let exportRect = null;         // { minX, minZ, maxX, maxZ } des zuletzt gezeichneten Rechtecks
let exportGeometry = null;     // zuletzt eingesammelte {terrain, buildings}-Dreiecke

function startRectExport() {
  if (!hasTerrain()) { setStatus(T('msgNeedTerrain'), true); return; }
  clearExportPreview();
  rectSelectActive = true;
  rectStart = null;
  setTopView();
  controls.enabled = false; // sonst kollidiert das Ziehen mit dem Kamera-Orbit
  selectTool(null);
  setStatus(T('ifcExportHint'));
}

function cancelRectExport() {
  rectSelectActive = false;
  rectStart = null;
  controls.enabled = true;
  clearRectDragPreview();
  setStatus('');
}

function clearRectDragPreview() {
  if (rectPreviewGroup) {
    scene.remove(rectPreviewGroup);
    disposeGroup(rectPreviewGroup);
    rectPreviewGroup = null;
  }
}

function clearExportPreview() {
  if (exportPreviewGroup) {
    scene.remove(exportPreviewGroup);
    disposeGroup(exportPreviewGroup);
    exportPreviewGroup = null;
  }
  exportRect = null;
  exportGeometry = null;
  hideIfcPanel();
}

function updateRectDragPreview(a, b) {
  clearRectDragPreview();
  const minX = Math.min(a.x, b.x), maxX = Math.max(a.x, b.x);
  const minZ = Math.min(a.z, b.z), maxZ = Math.max(a.z, b.z);
  const y = getHeightAt((minX + maxX) / 2, (minZ + maxZ) / 2) + 0.3;
  const pts = [
    new THREE.Vector3(minX, y, minZ), new THREE.Vector3(maxX, y, minZ),
    new THREE.Vector3(maxX, y, maxZ), new THREE.Vector3(minX, y, maxZ)
  ];
  rectPreviewGroup = new THREE.Group();
  rectPreviewGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), MAT.ghost));
  scene.add(rectPreviewGroup);
}

/* Ecke a kommt vom pointerdown, b vom pointerup. */
function finishRectExport(a, b) {
  rectSelectActive = false;
  controls.enabled = true;
  clearRectDragPreview();

  const minX = Math.min(a.x, b.x), maxX = Math.max(a.x, b.x);
  const minZ = Math.min(a.z, b.z), maxZ = Math.max(a.z, b.z);
  if (maxX - minX < 1 || maxZ - minZ < 1) { setStatus(''); return; }

  try {
    exportGeometry = collectExportGeometry(lastGmlRings, minX, minZ, maxX, maxZ);
  } catch (err) {
    setStatus(err.message, true);
    return;
  }

  exportRect = { minX: minX, minZ: minZ, maxX: maxX, maxZ: maxZ };
  frameRect(minX, minZ, maxX, maxZ);
  exportPreviewGroup = buildExportPreview(exportGeometry);
  scene.add(exportPreviewGroup);
  setStatus('');
  showIfcPanel();
}

function showIfcPanel() {
  const r = exportRect;
  document.getElementById('ifc-extent').textContent =
    Math.round(r.maxX - r.minX) + ' × ' + Math.round(r.maxZ - r.minZ) + ' m';
  document.getElementById('ifc-epsg').value = TERRAIN.epsg;
  document.getElementById('ifc-error').textContent = '';
  document.getElementById('ifc-panel').style.display = 'block';
}

function hideIfcPanel() {
  document.getElementById('ifc-panel').style.display = 'none';
}

function isIfcPanelOpen() {
  return document.getElementById('ifc-panel').style.display === 'block';
}

function isRectSelectActive() { return rectSelectActive; }
function getExportRect() { return exportRect; }
function getExportGeometry() { return exportGeometry; }

function runIfcExport() {
  const epsg = parseInt(document.getElementById('ifc-epsg').value, 10);
  const errEl = document.getElementById('ifc-error');
  try {
    const ifc = buildIfc(exportGeometry, exportRect.minX, exportRect.minZ, TERRAIN.epsg, epsg);
    downloadText(ifc, 'quick-site-design-export.ifc');
    errEl.textContent = '';
    setStatus(T('msgIfcExported'));
  } catch (err) {
    errEl.textContent = err.message;
  }
}

/* Löst einen Browser-Download aus, ohne dass ein Server beteiligt ist. */
function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'application/x-step' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* =========================================================
   Zeigerereignisse
   ========================================================= */
let pressInfo = null;
let lastPlaceTime = 0;
const DRAG_TOLERANCE = 5;
const REPEAT_GUARD = 250;

function onCanvasPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) { pressInfo = null; return; }
  if (rectSelectActive) {
    const pt = raycastTerrain(event);
    rectStart = pt ? { x: pt.x, z: pt.z } : null;
    return;
  }
  pressInfo = { x: event.clientX, y: event.clientY, id: event.pointerId, t: Date.now() };
}

function onCanvasPointerUp(event) {
  if (rectSelectActive) {
    const start = rectStart;
    rectStart = null;
    if (start) {
      const pt = raycastTerrain(event);
      if (pt) finishRectExport(start, { x: pt.x, z: pt.z });
      else cancelRectExport();
    }
    return;
  }
  if (!pressInfo) return;
  if (event.pointerId !== undefined && event.pointerId !== pressInfo.id) { pressInfo = null; return; }
  const moved = Math.abs(event.clientX - pressInfo.x) + Math.abs(event.clientY - pressInfo.y);
  pressInfo = null;
  if (moved > DRAG_TOLERANCE) return;
  const now = Date.now();
  if (now - lastPlaceTime < REPEAT_GUARD) return;
  lastPlaceTime = now;
  onCanvasClick(event);
}

function onCanvasPointerCancel() { pressInfo = null; rectStart = null; }

function onCanvasMove(event) {
  const pt = raycastTerrain(event);
  if (pt) {
    const utm = worldToUTM(pt.x, pt.z);
    document.getElementById('cursor-info').textContent =
      'R ' + Math.round(utm.e) + '   H ' + Math.round(utm.n) +
      '   Z ' + getAbsoluteHeightAt(pt.x, pt.z).toFixed(1);
  }
  if (rectSelectActive && rectStart && pt) {
    updateRectDragPreview(rectStart, { x: pt.x, z: pt.z });
  }
  if (activeTool === 'road' && roadPoints.length) {
    if (pt) setRoadPreview(roadPoints, { x: pt.x, z: pt.z });
  }
  if (ghost) {
    if (pt) {
      ghost.visible = true;
      ghost.position.set(pt.x, getHeightAt(pt.x, pt.z), pt.z);
    } else {
      ghost.visible = false;
    }
  }
}

function onCanvasClick(event) {
  // Stützpunkt einer ausgewählten Baustraße bearbeiten
  const sel = findObject(getSelectedId());
  if (sel && sel.type === 'road') {
    const hit = raycastRoadNode(event);
    if (hit !== null) {
      setActiveNode(hit);
      setStatus(T('nodePicked'));
      return;
    }
    if (activeRoadNode() !== null) {
      const pt = raycastTerrain(event);
      if (pt) {
        moveRoadNode(sel, activeRoadNode(), pt.x, pt.z);
        setActiveNode(null);
        showObjectEditor(sel.id);
        setStatus(T('nodeMoved'));
        return;
      }
    }
  }

  if (moveMode) {
    const pt = raycastTerrain(event);
    const obj = findObject(getSelectedId());
    if (pt && obj) {
      moveObject(obj, pt.x, pt.z);
      moveMode = false;
      setStatus(T('msgMoved'));
      showObjectEditor(obj.id);
    }
    return;
  }

  if (activeTool === 'road') {
    const pt = raycastTerrain(event);
    if (!pt) return;
    roadPoints.push({ x: pt.x, z: pt.z });
    setRoadPreview(roadPoints);
    setRoadHint(true);
    return;
  }

  if (activeTool) {
    const pt = raycastTerrain(event);
    if (!pt) return;
    const params = JSON.parse(JSON.stringify(toolParams[activeTool]));
    const obj = addObject(activeTool, pt.x, pt.z, params);
    setStatus(labelFor(obj.type, obj.params) + ' ' + T('msgPlaced'));
    // Direkt zum Bearbeiten des eben gesetzten Objekts wechseln
    showObjectEditor(obj.id);
    return;
  }

  const hit = raycastObjects(event);
  if (hit) {
    hideMeasure();
    showObjectEditor(hit.id);
    return;
  }

  // Kein Baustein getroffen: Messpunkt auf Gelände oder Gebäude
  const ground = raycastGround(event);
  if (ground) {
    selectTool(null);
    showMeasure(ground.point, ground.onBuilding);
  } else {
    selectTool(null);
    hideMeasure();
  }
}

function onKeyDown(event) {
  if (event.key === ' ' || event.code === 'Space') {
    if (activeTool === 'road') {
      if (event.preventDefault) event.preventDefault();
      finishRoad();
    }
    return;
  }
  if (event.key === 'Escape') {
    if (rectSelectActive) { cancelRectExport(); return; }
    if (isIfcPanelOpen()) { clearExportPreview(); setStatus(''); return; }
    // Erst die Knotenauswahl lösen, die Objektauswahl bleibt bestehen
    if (activeRoadNode() !== null) { setActiveNode(null); setStatus(''); return; }
    moveMode = false;
    roadPoints = []; clearRoadPreview(); setRoadHint(false);
    selectTool(null);
    hideMeasure();
    toggleTweak(false);
    setStatus('');
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    const ids = selectedIds.slice();
    if (!ids.length) return;
    ids.forEach(function (i) { removeObject(i); });
    selectTool(null);
    renderOverview();
  }
}

/* =========================================================
   Initialisierung
   ========================================================= */
function initUI() {
  const palette = document.getElementById('palette');
  ['container', 'tower', 'mobile', 'road'].forEach(function (type) {
    const card = document.createElement('button');
    card.className = 'pal-card';
    card.dataset.tool = type;
    card.title = T(TOOL_INFO[type].hint);

    const icon = document.createElement('span');
    icon.className = 'pal-icon ' + type;
    card.appendChild(icon);

    const nm = document.createElement('span');
    nm.className = 'pal-name';
    nm.textContent = T(TOOL_INFO[type].name);
    card.appendChild(nm);

    card.addEventListener('click', function () {
      if (!hasTerrain()) { setStatus(T('msgNeedTerrain'), true); return; }
      selectTool(activeTool === type ? null : type);
    });
    palette.appendChild(card);
  });

  const demInput = document.getElementById('dem-input');
  demInput.addEventListener('change', function () {
    if (demInput.files && demInput.files.length) handleDemFiles(demInput.files);
  });

  const gmlInput = document.getElementById('gml-input');
  gmlInput.addEventListener('change', function () {
    if (gmlInput.files && gmlInput.files.length) handleGmlFiles(gmlInput.files);
  });

  const detail = document.getElementById('detail-slider');
  detail.value = SETTINGS.detail;
  document.getElementById('detail-val').textContent = detailLabel();
  detail.addEventListener('change', function () {
    const v = parseFloat(detail.value);
    if (!isFinite(v)) return;
    SETTINGS.detail = v;
    document.getElementById('detail-val').textContent = detailLabel();
    if (!lastDemTiles) return;
    if (detailLimit() === 0) setStatus('Volle Auflösung kann bei großen Kacheln spürbar bremsen.', true);
    rebuildTerrainDetail();
  });
  detail.addEventListener('input', function () {
    const v = parseFloat(detail.value);
    if (!isFinite(v)) return;
    SETTINGS.detail = v;
    document.getElementById('detail-val').textContent = detailLabel();
  });

  document.getElementById('gml-clear').addEventListener('click', function () {
    clearBuildings();
    lastGmlRings = null;
    demoAttribGml = false;
    refreshAttribution();
    setFileStatus('gml', T('noFile'));
    setStatus(T('msgBuildingsRemoved'));
  });

  document.getElementById('reset-view').addEventListener('click', function () {
    frameTerrain();
    setStatus(T('msgViewReset'));
  });

  document.getElementById('rect-export-btn').addEventListener('click', function () {
    startRectExport();
  });
  document.getElementById('ifc-export-btn').addEventListener('click', function () {
    runIfcExport();
  });
  document.getElementById('ifc-cancel-btn').addEventListener('click', function () {
    clearExportPreview();
    setStatus('');
  });

  document.getElementById('clear-all').addEventListener('click', function () {
    objects.slice().forEach(function (o) { removeObject(o.id); });
    selectTool(null);
    hideMeasure();
    renderOverview();
    setStatus(T('msgCleared'));
  });

  Object.keys(STRINGS).forEach(function (code) {
    const b = document.getElementById('lang-' + code);
    if (b) b.addEventListener('click', function () { setLanguage(code); });
  });
  markLanguageButtons();

  const btn2d = document.getElementById('view2d-btn');
  btn2d.addEventListener('click', function () {
    setTopView();
    setStatus(T('topViewSet'));
  });

  document.getElementById('compass').addEventListener('click', function () { faceNorth(); });

  document.getElementById('tweak-btn').addEventListener('click', function () { toggleTweak(); });
  document.getElementById('tweak-close').addEventListener('click', function () { toggleTweak(false); });

  const dom = renderer.domElement;
  dom.addEventListener('pointermove', onCanvasMove);
  dom.addEventListener('pointerdown', onCanvasPointerDown);
  dom.addEventListener('pointerup', onCanvasPointerUp);
  dom.addEventListener('pointercancel', onCanvasPointerCancel);
  dom.addEventListener('pointerleave', onCanvasPointerCancel);
  window.addEventListener('keydown', onKeyDown);

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  applySettings();
  applyLanguage();
  showPanel(false);
  selectTool(null);
  hideMeasure();
  updateTerrainInfo();
  renderOverview();
}

/* ---------- Export für Tests ---------- */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Sprachen
    STRINGS: STRINGS,
    T: T,
    applyLanguage: applyLanguage,
    setLanguage: setLanguage,
    markLanguageButtons: markLanguageButtons,
    refreshTexts: refreshTexts,

    // Formulare
    SCHEMAS: SCHEMAS,
    TOOL_INFO: TOOL_INFO,
    FIELD_ORDER: FIELD_ORDER,
    fieldRank: fieldRank,
    sortFields: sortFields,
    formatVal: formatVal,
    buildForm: buildForm,
    syncForm: syncForm,
    applyModelDefaults: applyModelDefaults,

    // Oberflächen-Einstellungen
    THEMES: THEMES,
    FONTS: FONTS,
    ACCENTS: ACCENTS,
    SETTINGS: SETTINGS,
    applySettings: applySettings,
    buildTweakPanel: buildTweakPanel,
    toggleTweak: toggleTweak,

    // Werkzeuge und Editoren
    showPanel: showPanel,
    selectTool: selectTool,
    showObjectEditor: showObjectEditor,
    showGroupEditor: showGroupEditor,
    roadHintText: roadHintText,
    markRoadRadius: markRoadRadius,
    groupKeyFor: groupKeyFor,
    buildGroups: buildGroups,
    renderOverview: renderOverview,
    setRoadHint: setRoadHint,
    finishRoad: finishRoad,

    // Statuszeile und Messpunkt
    setStatus: setStatus,
    setNeedsData: setNeedsData,
    updateInfoBar: updateInfoBar,
    updateTerrainInfo: updateTerrainInfo,
    showMeasure: showMeasure,
    hideMeasure: hideMeasure,
    updateCompass: updateCompass,
    updatePointLabel: updatePointLabel,

    // Dateiimport
    setFileStatus: setFileStatus,
    DETAIL_STEPS: DETAIL_STEPS,
    detailLimit: detailLimit,
    detailLabel: detailLabel,
    rebuildTerrainDetail: rebuildTerrainDetail,
    demStatusText: demStatusText,
    handleDemFiles: handleDemFiles,
    handleGmlFiles: handleGmlFiles,
    loadDemo: loadDemo,
    demoRequested: demoRequested,
    DEMO_ATTRIBUTION: DEMO_ATTRIBUTION,
    showAttribution: showAttribution,
    refreshAttribution: refreshAttribution,
    isAttributionShown: isAttributionShown,

    // IFC-Export
    startRectExport: startRectExport,
    cancelRectExport: cancelRectExport,
    finishRectExport: finishRectExport,
    clearRectDragPreview: clearRectDragPreview,
    clearExportPreview: clearExportPreview,
    updateRectDragPreview: updateRectDragPreview,
    showIfcPanel: showIfcPanel,
    hideIfcPanel: hideIfcPanel,
    isIfcPanelOpen: isIfcPanelOpen,
    runIfcExport: runIfcExport,
    downloadText: downloadText,
    isRectSelectActive: isRectSelectActive,
    getExportRect: getExportRect,
    getExportGeometry: getExportGeometry,

    // Zeigerbedienung
    DRAG_TOLERANCE: DRAG_TOLERANCE,
    REPEAT_GUARD: REPEAT_GUARD,
    onCanvasPointerDown: onCanvasPointerDown,
    onCanvasPointerUp: onCanvasPointerUp,
    onCanvasPointerCancel: onCanvasPointerCancel,
    onCanvasMove: onCanvasMove,
    onCanvasClick: onCanvasClick,
    onKeyDown: onKeyDown,

    initUI: initUI,

    // Zustand für Tests
    getPressInfo: function () { return pressInfo; },
    resetUIState: function () {
      toolParams = {};
      formRefs = {};
      lastGmlRings = null;
      lastDemTiles = null;
      lastDemNames = [];
      gridLimit = MAX_GRID;
      roadPoints = [];
      pressInfo = null;
      lastPlaceTime = 0;
      demoAttribDem = false;
      demoAttribGml = false;
      rectSelectActive = false;
      rectStart = null;
      exportRect = null;
      exportGeometry = null;
    }
  };
}
