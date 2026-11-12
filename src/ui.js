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
let roadPoints = [];          // Stützpunkte während des Zeichnens (Straße oder Baugrube)

/* =========================================================
   Sprachen
   ========================================================= */
const STRINGS = {
  de: {
    lang: 'Deutsch',
    overview: 'Übersicht', data: 'Daten', view: 'Ansicht', site: 'Baustelle',
    clear: 'Leeren', appearance: 'Darstellung', close: 'Schließen', tweak: 'Darstellung',
    noTerrain: 'Kein Geländemodell geladen',
    loadFirst: 'Zum Starten ein Geländemodell laden',
    terrainFile: 'Gelände · GeoTIFF', buildingFile: 'Gebäude · CityGML',
    noFile: 'Keine Datei', remove: 'Entfernen',
    heightRange: 'Höhenbereich', objects: 'Objekte', containers: 'Container',
    cranes: 'Krane', road: 'Baustraße',
    nothingPlaced: 'Noch nichts platziert',
    nothingSelected: 'Kein Baustein gewählt',
    pickHint: 'Baustein unten wählen oder ein platziertes Objekt anklicken.',
    placeHint: 'Klick ins Gelände platziert. Esc bricht ab.',
    roadHint: 'Punkt für Punkt setzen, dann Rechtsklick oder Leertaste. Breite und Radius lassen sich danach ändern.',
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
    geoportals: 'Geoportale', geoportalsTip: 'Tabelle der Geoportale der Bundesländer (GitHub)',
    geoportalUrl: 'https://github.com/Mucnese/quick-site-design#datenquellen',
    tIfc: 'IFC Export', tIfcHint: 'Rechteck aufziehen, Gelände und Gebäude als IFC', ifcExportHint: 'Rechteck auf dem Gelände ziehen. Esc bricht ab.',
    ifcPanelTitle: 'IFC-Export', ifcExtent: 'Ausdehnung', ifcCrs: 'Koordinatenbezug',
    ifcExportAction: 'Exportieren', cancel: 'Abbrechen', msgIfcExported: 'IFC-Datei heruntergeladen.',
    crs: 'KBS', accuracy: 'DGM-Genauigkeit', unit: 'Einheit', unitMeter: 'Meter',
    hintClick: 'Linksklick', hintMeasure: 'Messpunkt', hintDrag: 'Links', hintDragX: ' ziehen',
    hintRotate: 'Drehen', hintPan: 'Rechts/Mitte', hintPanX: ' ziehen', hintPanDo: 'Verschieben',
    hintWheel: 'Mausrad', hintZoom: 'Zoom', hintEsc: 'Esc', hintCancel: 'Abbrechen',
    measureOn: 'Messpunkt auf', ground: 'Gelände', building: 'Gebäude',
    design: 'Design', font: 'Schriftart', fontSize: 'Schriftgröße',
    accent: 'Akzentfarbe', panelWidth: 'Fensterbreite',
    language: 'Sprache',
    loading: 'Lade', reset: 'Zurücksetzen',
    tCont: 'Container', tContHint: 'Ab zwei Reihen liegt die zweite quer',
    tTower: 'Turmdrehkran', tTowerHint: 'Generisches Modell, Parameter frei einstellbar',
    tMobile: 'Mobilkran', tMobileHint: 'Liebherr LTM',
    tRoad: 'Baustraße', tRoadHint: 'Stützpunkte setzen, Rechtsklick oder Leertaste schließt ab',
    tPit: 'Baugrube', tPitHint: 'Eckpunkte setzen, Rechtsklick oder Leertaste schließt das Polygon',
    fDepth: 'Tiefe zum mittleren Gelände', fBottomAbs: 'Höhe Unterkante (m ü. NHN)',
    pitDrawing: 'Baugrube: Eckpunkte im Gelände setzen', pitFinish: 'Rechtsklick oder Leertaste schließt das Polygon, Esc bricht ab',
    msgMinThree: 'Mindestens drei Punkte setzen.', msgMaxPoints: 'Mehr als 32 Eckpunkte sind nicht möglich.',
    pitCut: 'Aushub', pitFill: 'Aufschüttung', pitRef: 'Mittleres Gelände', pitBottom: 'Unterkante', pitCreated: 'Baugrube angelegt:',
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
    roadSet: 'gesetzt', roadFinish: 'Rechtsklick oder Leertaste beendet, Esc bricht ab',
    long: 'lang', tightest: 'engster Radius', curvesTight: 'Kurve(n) enger als gewünscht',
    fSlope: 'Längsneigung', area: 'Fläche', fill: 'Auftrag', cut: 'Abtrag',
    fEmbank: 'Böschung', embankment: 'Böschung {r} bis zum Gelände', embankFar: 'Böschung erreicht das Gelände nicht (Grenze 80 m)',
    conflict1: 'Kranradien überschneiden sich um', conflictN: 'Überschneidungen von Kranradien',
    nodeHint: 'Stützpunkt anklicken, dann neue Position im Gelände wählen.', nodePicked: 'Stützpunkt gewählt. Neue Position anklicken.', nodeMoved: 'Stützpunkt verschoben.', nodePickFirst: 'Zuerst einen Stützpunkt anklicken.', nodeMinTwo: 'Eine Baustraße braucht mindestens zwei Stützpunkte.', nodeMinThree: 'Eine Baugrube braucht mindestens drei Eckpunkte.', delNode: 'Punkt löschen'
  },
  en: {
    lang: 'English',
    overview: 'Overview', data: 'Data', view: 'View', site: 'Site',
    clear: 'Clear', appearance: 'Appearance', close: 'Close', tweak: 'Appearance',
    noTerrain: 'No terrain model loaded',
    loadFirst: 'Load a terrain model to begin',
    terrainFile: 'Terrain · GeoTIFF', buildingFile: 'Buildings · CityGML',
    noFile: 'No file', remove: 'Remove',
    heightRange: 'Elevation range', objects: 'Objects', containers: 'Containers',
    cranes: 'Cranes', road: 'Haul road',
    nothingPlaced: 'Nothing placed yet',
    nothingSelected: 'No item selected',
    pickHint: 'Pick an item below or click a placed object.',
    placeHint: 'Click the terrain to place. Esc cancels.',
    roadHint: 'Set point by point, then right-click or press space. Width and radius can be changed afterwards.',
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
    geoportals: 'Geoportals', geoportalsTip: 'Table of the German state geoportals (GitHub)',
    geoportalUrl: 'https://github.com/Mucnese/quick-site-design/blob/main/README.en.md#where-to-get-the-data',
    tIfc: 'IFC Export', tIfcHint: 'Draw a rectangle, export terrain and buildings as IFC', ifcExportHint: 'Drag a rectangle over the terrain. Esc cancels.',
    ifcPanelTitle: 'IFC export', ifcExtent: 'Extent', ifcCrs: 'Coordinate reference',
    ifcExportAction: 'Export', cancel: 'Cancel', msgIfcExported: 'IFC file downloaded.',
    crs: 'CRS', accuracy: 'DTM accuracy', unit: 'Unit', unitMeter: 'Metre',
    hintClick: 'Left click', hintMeasure: 'Measure point', hintDrag: 'Left', hintDragX: ' drag',
    hintRotate: 'Orbit', hintPan: 'Right/middle', hintPanX: ' drag', hintPanDo: 'Pan',
    hintWheel: 'Wheel', hintZoom: 'Zoom', hintEsc: 'Esc', hintCancel: 'Cancel',
    measureOn: 'Measure point on', ground: 'terrain', building: 'building',
    design: 'Design', font: 'Typeface', fontSize: 'Text size',
    accent: 'Accent colour', panelWidth: 'Panel width',
    language: 'Language',
    loading: 'Loading', reset: 'Reset',
    tCont: 'Containers', tContHint: 'From two rows the second lies crosswise',
    tTower: 'Tower crane', tTowerHint: 'Generic model, freely adjustable parameters',
    tMobile: 'Mobile crane', tMobileHint: 'Liebherr LTM',
    tRoad: 'Haul road', tRoadHint: 'Set points, right-click or space finishes',
    tPit: 'Excavation', tPitHint: 'Set corner points, right-click or space closes the polygon',
    fDepth: 'Depth below mean ground', fBottomAbs: 'Bottom level (m a.s.l.)',
    pitDrawing: 'Excavation: set corner points on the terrain', pitFinish: 'right-click or space closes the polygon, Esc cancels',
    msgMinThree: 'Set at least three points.', msgMaxPoints: 'More than 32 corner points are not possible.',
    pitCut: 'Excavation', pitFill: 'Fill', pitRef: 'Mean ground', pitBottom: 'Bottom', pitCreated: 'Excavation created:',
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
    roadSet: 'set', roadFinish: 'right-click or space finishes, Esc cancels',
    long: 'long', tightest: 'tightest radius', curvesTight: 'curve(s) tighter than requested',
    fSlope: 'Longitudinal slope', area: 'area', fill: 'Fill', cut: 'Cut',
    fEmbank: 'Embankment', embankment: 'Embankment {r} to the ground', embankFar: 'Embankment does not reach the ground (80 m limit)',
    conflict1: 'Crane radii overlap by', conflictN: 'overlapping crane radii',
    nodeHint: 'Click a node, then pick its new position on the terrain.', nodePicked: 'Node selected. Click the new position.', nodeMoved: 'Node moved.', nodePickFirst: 'Select a node first.', nodeMinTwo: 'A haul road needs at least two nodes.', nodeMinThree: 'An excavation needs at least three corner points.', delNode: 'Delete node'
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
  // Die Tabelle steht in beiden READMEs; der Link folgt der Sprache
  const geo = document.getElementById('geoportal-link');
  geo.href = T('geoportalUrl');
  geo.title = T('geoportalsTip');
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
    // Generisches Modell, kein Hersteller-Katalog mehr - die Grenzen sind
    // Minimum/Maximum aus den früher hier hinterlegten 34 Herstellermodellen
    // (siehe TOWER_LIMITS in app.js).
    { key: 'hookHeight', label: 'fHook',  type: 'range', min: TOWER_LIMITS.hookHeight.min, max: TOWER_LIMITS.hookHeight.max, step: 1, unit: 'm' },
    { key: 'radius',     label: 'fRadius',  type: 'range', min: TOWER_LIMITS.radius.min, max: TOWER_LIMITS.radius.max, step: 1, unit: 'm' },
    { key: 'mastWidth',  label: 'fMast', type: 'range', min: TOWER_LIMITS.mastWidth.min, max: TOWER_LIMITS.mastWidth.max, step: 0.1, unit: 'm' },
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
    // Nur im Editor: vor dem Setzen gibt es noch keine Punkte, aus denen die Neigung folgt
    { key: 'slope',    label: 'fSlope',     type: 'range', min: -30, max: 30, step: 0.1, unit: '%', editorOnly: true },
    { key: 'embank',   label: 'fEmbank',    type: 'choice', options: [
      { value: 1, label: '1 : 1' }, { value: 1.5, label: '1 : 1.5' }, { value: 2, label: '1 : 2' }] },
    { key: 'showEdge', label: 'fShowEdge',       type: 'checkbox' }
  ],
  pit: [
    // Tiefe zum MITTLEREN Gelände im Polygon (Standard -5 m); die Höhe der Unterkante
    // ist derselbe Wert in absoluten Metern und wird im Editor an das Gelände angepasst
    { key: 'depth',     label: 'fDepth',     type: 'range', min: -30, max: 10, step: 0.1, unit: 'm' },
    { key: 'bottomAbs', label: 'fBottomAbs', type: 'range', min: 0, max: 100, step: 0.1, unit: 'm', editorOnly: true }
  ]
};

const TOOL_INFO = {
  container: { name: 'tCont',   hint: 'tContHint' },
  tower:     { name: 'tTower',  hint: 'tTowerHint' },
  mobile:    { name: 'tMobile', hint: 'tMobileHint' },
  road:      { name: 'tRoad',   hint: 'tRoadHint' },
  pit:       { name: 'tPit',    hint: 'tPitHint' },
  ifc:       { name: 'tIfc',    hint: 'tIfcHint' }   // keine Platzierung, startet die Rechteckauswahl
};


/* =========================================================
   Darstellung: Designs und Einstellungen
   ========================================================= */
const THEMES = {
  dunkel: {
    name: 'dark',
    vars: {
      '--bg': '#191c1f', '--scene': '#1f2429',
      '--panel-bg': 'rgba(32, 36, 40, 0.78)',
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
      '--panel-bg': 'rgba(250, 251, 252, 0.62)',
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
  width: 200,
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

/* Zahlenfeld neben einem Schieberegler: man kann den Wert auch tippen.
   Eine gültige Eingabe innerhalb des Reglerbereichs wirkt sofort; beim
   Verlassen oder mit Enter wird auf den Bereich begrenzt, eine ungültige
   Eingabe fällt auf den Reglerwert zurück. Der Reglerbereich wird erst beim
   Prüfen gelesen, weil er sich (Kranmodell) nachträglich ändern kann. Der
   getippte Wert wird nicht auf die Reglerschritte gerundet. */
function makeNumberBox(slider, className, apply) {
  const num = document.createElement('input');
  num.type = 'number';
  num.className = className;
  num.min = slider.min; num.max = slider.max; num.step = 'any';
  num.value = slider.value;
  // Breite nach der längsten möglichen Zahl (inkl. Vorzeichen und Nachkommastelle)
  const chars = Math.max(String(slider.min).length, String(slider.max).length) + (parseFloat(slider.step) < 1 ? 2 : 0);
  num.style.width = (chars + 0.6) + 'ch';
  num.addEventListener('input', function () {
    const v = parseFloat(num.value);
    if (!isFinite(v) || v < parseFloat(slider.min) || v > parseFloat(slider.max)) return;
    apply(v);
  });
  num.addEventListener('change', function () {
    let v = parseFloat(num.value);
    if (!isFinite(v)) { num.value = slider.value; return; }
    v = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), v));
    v = Math.round(v * 1000) / 1000;
    num.value = v;
    apply(v);
  });
  return num;
}

function sliderRow(label, min, max, step, value, unit, onChange) {
  const row = document.createElement('div');
  row.className = 'tw-row';
  const head = document.createElement('div');
  head.className = 'tw-label';
  head.textContent = label;
  const val = document.createElement('span');
  val.className = 'tw-val';
  head.appendChild(val);
  row.appendChild(head);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = min; input.max = max; input.step = step; input.value = value;
  input.className = 'tw-slider';
  const num = makeNumberBox(input, 'tw-num', function (v) {
    input.value = v;
    onChange(v);
    applySettings();
  });
  const u = document.createElement('span');
  u.className = 'tw-unit';
  u.textContent = unit.trim();
  val.appendChild(num);
  val.appendChild(u);
  input.addEventListener('input', function () {
    const v = parseFloat(input.value);
    if (!isFinite(v)) return;
    num.value = v;
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

  body.appendChild(sliderRow(T('panelWidth'), 200, 400, 10, SETTINGS.width, ' px',
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
  // Bei Reglern ist der Wert in der Kopfzeile selbst das Eingabefeld (Zahl, Einheit,
  // und - nur beim Straßenradius - der tatsächlich erreichte Wert).
  const out = document.createElement('span');
  out.className = 'field-val';
  head.appendChild(out);
  row.appendChild(head);

  let input;
  let num = null;
  let eff = null;
  if (field.type === 'select') {
    input = document.createElement('select');
    const src = CRANE_MODELS; // nur noch der Mobilkran hat eine Modellauswahl
    src.forEach(function (m) {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name + '  ' + m.cap + ' t';
      input.appendChild(opt);
    });
    input.value = value;
    input.addEventListener('change', function () { onChange(field.key, input.value); });
  } else if (field.type === 'choice') {
    // Feste Zahlenwerte als Auswahlliste (z. B. Böschung 1:1, 1:1,5, 1:2)
    input = document.createElement('select');
    field.options.forEach(function (o) {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      input.appendChild(opt);
    });
    input.value = value;
    input.addEventListener('change', function () { onChange(field.key, parseFloat(input.value)); });
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
    if (input.type === 'range') {
      num = makeNumberBox(input, 'field-num', function (v) {
        input.value = v;
        onChange(field.key, v);
      });
      out.appendChild(num);
      const u = document.createElement('span');
      u.className = 'field-unit';
      u.textContent = field.unit || '';
      out.appendChild(u);
      eff = document.createElement('span');
      eff.className = 'field-eff';
      out.appendChild(eff);
    } else {
      out.textContent = formatVal(value, field.unit);
    }
    input.addEventListener('input', function () {
      const v = parseFloat(input.value);
      if (!isFinite(v)) return;
      if (num) num.value = v;
      else out.textContent = formatVal(v, field.unit);
      onChange(field.key, v);
    });
  }
  input.className = 'field-input';
  row.appendChild(input);
  return { row: row, input: input, out: out, field: field, num: num, eff: eff };
}

function formatVal(v, unit) {
  const s = (Math.round(v * 100) / 100).toString();
  return unit ? s + ' ' + unit : s;
}

/* Reihenfolge im Formular: Auswahl, Schieberegler, Zahlenfelder, Schalter */
const FIELD_ORDER = { select: 0, range: 1, number: 2, choice: 2, checkbox: 3 };

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

function buildForm(type, values, onChange, editor) {
  const wrap = document.createElement('div');
  wrap.className = 'form';
  const refs = {};
  let lastGroup = null;
  sortFields(SCHEMAS[type].filter(function (f) { return editor || !f.editorOnly; })).forEach(function (f) {
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
    else if (r.field.type === 'select' || r.field.type === 'choice') r.input.value = v;
    else {
      r.input.value = v;
      if (r.num) { r.num.value = v; r.num.min = r.input.min; r.num.max = r.input.max; }
      else r.out.textContent = formatVal(v, r.field.unit);
    }
  });
}

/* Nur noch für den Mobilkran gebraucht - der Turmdrehkran hat seit dem
   generischen Modell keine Modellauswahl mehr, die "model"-Taste in
   buildForm() löst diese Funktion also nur noch für type "mobile" aus. */
function applyModelDefaults(values, refs, type) {
  const m = getModel(values.model);

  values.hookHeight = m.hookDef;
  values.radius = m.radiusDef;
  // Turmbreite bleibt frei einstellbar und wird vom Modellwechsel nicht überschrieben

  if (!refs) return;
  // Ohne belegte Herstellerangabe bleibt der Bereich aus dem Schema stehen
  const setMax = function (ref, v) {
    if (!ref) return;
    ref.input.max = (v === null || v === undefined) ? ref.field.max : v;
  };
  setMax(refs.hookHeight, m.hookMax);
  setMax(refs.radius, m.radiusMax);
  syncForm(refs, values);
}

/* =========================================================
   Rechtes Fenster ein- und ausblenden
   ========================================================= */
function showPanel(on) {
  document.getElementById('col-right').style.display = on ? 'flex' : 'none';
}

/* Werkzeuge, bei denen man Punkt für Punkt zeichnet und mit Rechtsklick oder
   Leertaste abschließt: Baustraße (offen, ab 2 Punkten) und Baugrube
   (geschlossenes Polygon, ab 3 Punkten, höchstens PIT_MAX_POINTS). */
function isDrawTool(t) { return t === 'road' || t === 'pit'; }

/* ---------- Werkzeugwahl ---------- */
function selectTool(type) {
  clearRoadNodes();
  if (isDrawTool(activeTool) && type !== activeTool) { roadPoints = []; clearRoadPreview(); setRoadHint(false); }
  activeTool = type;
  selectObject(null);
  moveMode = false;
  roadPoints = [];
  clearRoadPreview();
  setRoadHint(isDrawTool(type));

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
    ? 'Stützpunkte nacheinander anklicken, Rechtsklick oder Leertaste schließt die Straße ab. Esc bricht ab.'
    : (type === 'pit'
      ? 'Eckpunkte nacheinander anklicken, Rechtsklick oder Leertaste schließt das Polygon. Esc bricht ab.'
      : 'Klick ins Gelände platziert. Esc bricht ab.');
  panel.appendChild(note);

  showPanel(true);
  if (isDrawTool(type)) {
    clearGhost();
    roadPoints = [];
    clearRoadPreview();
    setRoadHint(true);
  } else {
    setGhost(type, values);
  }
  renderOverview();
}

/* Formularfelder des gerade offenen Fensters (für Tests) */
function getFormRefs() { return formRefs; }

/* ---------- Editor eines platzierten Objekts ---------- */
function showObjectEditor(id) {
  const obj = findObject(id);
  if (!obj) return;

  activeTool = null;
  clearGhost();
  selectObject(id);
  clearRoadNodes();
  if (hasNodes(obj)) showRoadNodes(obj);

  const cards = document.getElementById('palette').children;
  for (let i = 0; i < cards.length; i++) if (cards[i].classList) cards[i].classList.remove('active');

  const panel = document.getElementById('param-panel');
  panel.innerHTML = '';

  const utm = worldToUTM(obj.x, obj.z);
  document.getElementById('param-title').textContent = labelFor(obj.type, obj.params);
  if (obj.type === 'road') {
    document.getElementById('param-hint').textContent = roadHintText(obj);
  } else if (obj.type === 'pit') {
    document.getElementById('param-hint').textContent = pitHintText(obj);
  } else {
    document.getElementById('param-hint').textContent =
      'R ' + Math.round(utm.e) + '   H ' + Math.round(utm.n) +
      '   Z ' + getAbsoluteHeightAt(obj.x, obj.z).toFixed(2) + ' m';
  }

  // Der Turmdrehkran ist seit dem generischen Modell kein Herstellerprodukt
  // mehr - Richtwert-Hinweis und Datenblatt-Link gelten nur noch für den
  // Mobilkran, der weiterhin einen echten Modellkatalog hat.
  if (obj.type === 'mobile') {
    const m = getModel(obj.params.model);

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

  const form = buildForm(obj.type, obj.type === 'pit' ? pitFormValues(obj) : obj.params, function (key, v) {
    if (obj.type === 'pit') {
      // Tiefe und Höhe der Unterkante sind derselbe Wert: der andere Regler folgt
      const ref = obj.group.userData.pit.refAbs;
      obj.params.depth = key === 'bottomAbs' ? Math.round((v - ref) * 100) / 100 : v;
      rebuildObject(obj);
      renderOverview();
      document.getElementById('param-title').textContent = labelFor(obj.type, obj.params);
      document.getElementById('param-hint').textContent = pitHintText(obj);
      renderPitInfo(obj, earthEl);
      const other = key === 'bottomAbs' ? form.refs.depth : form.refs.bottomAbs;
      const val = key === 'bottomAbs' ? obj.params.depth : obj.group.userData.pit.bottomAbs;
      other.input.value = val;
      other.num.value = Math.round(val * 100) / 100;
      return;
    }
    obj.params[key] = v;
    if (key === 'model') applyModelDefaults(obj.params, form.refs, obj.type);
    rebuildObject(obj);
    renderOverview();
    document.getElementById('param-title').textContent = labelFor(obj.type, obj.params);
    if (obj.type === 'road') {
      markRoadRadius(obj, form.refs);
      document.getElementById('param-hint').textContent = roadHintText(obj);
      renderRoadEarth(obj, earthEl);
    }
  }, true);
  formRefs = form.refs;
  panel.appendChild(form.element);
  if (obj.type === 'road') markRoadRadius(obj, form.refs);

  let earthEl = null;
  if (obj.type === 'road') {
    earthEl = document.createElement('div');
    earthEl.className = 'earth';
    renderRoadEarth(obj, earthEl);
    panel.appendChild(earthEl);
  }
  if (obj.type === 'pit') {
    setPitRanges(obj, form.refs);
    earthEl = document.createElement('div');
    earthEl.className = 'earth';
    renderPitInfo(obj, earthEl);
    panel.appendChild(earthEl);
  }

  if (hasNodes(obj)) {
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
  if (hasNodes(obj)) btnMore.style.display = 'none';
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
    const dup = JSON.parse(JSON.stringify(obj.params));
    if (obj.type === 'pit') dup.points = dup.points.map(function (q) { return { x: q.x + 20, z: q.z + 20 }; });
    const copy = addObject(obj.type, obj.x + 20, obj.z + 20, dup);
    showObjectEditor(copy.id);
    renderOverview();
  });
  actions.appendChild(btnDup);

  if (hasNodes(obj)) {
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
        setStatus(T(obj.type === 'pit' ? 'nodeMinThree' : 'nodeMinTwo'), true);
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
            T('area') + ' ' + Math.round(info.area) + ' m² · ' +
            T('tightest') + ' ' + info.minRadius.toFixed(1) + ' m';
  if (info.reduced) txt += ' · ' + info.reduced + ' ' + T('curvesTight');
  return txt;
}

/* Baugrube: Werte für das Formular. Die Höhe der Unterkante ist kein gespeicherter
   Parameter, sie folgt aus Tiefe und mittlerem Gelände. */
function pitFormValues(obj) {
  const info = obj.group.userData.pit;
  return { depth: obj.params.depth, bottomAbs: Math.round(info.bottomAbs * 100) / 100 };
}

/* Beide Regler überdecken dieselbe Spanne (Tiefe -30..+10 m um das mittlere Gelände) */
function setPitRanges(obj, refs) {
  const info = obj.group.userData.pit;
  const lo = Math.round((info.refAbs + PIT_DEPTH_MIN) * 10) / 10;
  const hi = Math.round((info.refAbs + PIT_DEPTH_MAX) * 10) / 10;
  refs.bottomAbs.input.min = lo; refs.bottomAbs.input.max = hi;
  syncForm(refs, pitFormValues(obj));
}

function pitHintText(obj) {
  const info = obj.group.userData.pit;
  return T('area') + ' ' + Math.round(info.area) + ' m² · ' + T('pitRef') + ' ' + info.refAbs.toFixed(1) + ' m ü. NHN';
}

/* Aushub, Aufschüttung und Unterkante der Baugrube */
function renderPitInfo(obj, el) {
  if (!el) return;
  el.textContent = '';
  const info = obj.group && obj.group.userData ? obj.group.userData.pit : null;
  if (!info) return;
  [['pitCut', info.cut, 'cut'], ['pitFill', info.fill, 'fill']].forEach(function (r) {
    const row = document.createElement('div');
    row.className = 'earth-row';
    const sw = document.createElement('i');
    // Aushub dunkel wie der Abtrag der Straße, Aufschüttung hell wie deren Auftrag
    sw.className = 'earth-sw earth-' + r[2];
    row.appendChild(sw);
    const lab = document.createElement('span');
    lab.textContent = T(r[0]);
    row.appendChild(lab);
    const val = document.createElement('b');
    val.textContent = formatVolume(r[1]);
    row.appendChild(val);
    el.appendChild(row);
  });
  const note = document.createElement('div');
  note.className = 'earth-note';
  note.textContent = T('pitBottom') + ' ' + info.bottomAbs.toFixed(2) + ' m ü. NHN';
  el.appendChild(note);
}

/* Auftrag und Abtrag der Baustraße samt Hinweis zur Böschung. Die Mengen
   stehen nach jedem Neuaufbau in group.userData.earthworks. */
function formatVolume(v) {
  return (v < 10 ? (Math.round(v * 10) / 10).toString() : Math.round(v).toString()) + ' m³';
}

function renderRoadEarth(obj, el) {
  if (!el) return;
  el.textContent = '';
  const ew = obj.group && obj.group.userData ? obj.group.userData.earthworks : null;
  if (!ew) return;
  [['fill', ew.fill], ['cut', ew.cut]].forEach(function (r) {
    const row = document.createElement('div');
    row.className = 'earth-row';
    const sw = document.createElement('i');
    sw.className = 'earth-sw earth-' + r[0];
    row.appendChild(sw);
    const lab = document.createElement('span');
    lab.textContent = T(r[0]);
    row.appendChild(lab);
    const val = document.createElement('b');
    val.textContent = formatVolume(r[1]);
    row.appendChild(val);
    el.appendChild(row);
  });
  const note = document.createElement('div');
  note.className = 'earth-note';
  note.textContent = T('embankment').replace('{r}', '1:' + ew.embank) + (ew.unreached ? ' · ' + T('embankFar') : '');
  el.appendChild(note);
}

/* Färbt den Radiusregler, sobald der Wunschradius nicht gehalten werden kann.
   Der Regler bleibt bedienbar, damit man ihn zurückdrehen kann. */
function markRoadRadius(obj, refs) {
  const ref = refs && refs.radius;
  if (!ref) return null;
  const info = roadInfo(obj.params);
  const eng = info.reduced > 0;
  ref.row.className = 'field' + (eng ? ' field-warn' : '');
  // Der gewünschte Radius bleibt im Feld stehen; was tatsächlich möglich ist, steht daneben
  ref.eff.textContent = eng ? '→ ' + info.minRadius.toFixed(1) + ' m' : '';
  ref.input.title = eng ? T('radiusTooTight') : '';
  return eng;
}

function groupKeyFor(o) {
  if (o.type === 'container') return 'Containeranlage';
  if (o.type === 'road') return 'Baustraße';
  if (o.type === 'pit') return 'Baugrube';
  if (o.type === 'tower') return 'Turmdrehkran';
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
  if (!on) return;
  const n = roadPoints.length;
  if (activeTool === 'pit') {
    el.textContent = n < 3
      ? T('pitDrawing') + ' · ' + n + ' ' + T('roadSet')
      : T('tPit') + ': ' + n + ' · ' + T('pitFinish');
  } else {
    el.textContent = n < 2
      ? T('roadDrawing') + ' · ' + n + ' ' + T('roadSet')
      : T('tRoad') + ': ' + n + ' · ' + T('roadFinish');
  }
}

/* Schließt das Zeichnen ab (Rechtsklick oder Leertaste): Baustraße ab zwei, Baugrube ab drei Punkten */
function finishDrawing() {
  if (!isDrawTool(activeTool)) return false;
  const tool = activeTool;
  const need = tool === 'pit' ? 3 : 2;
  if (roadPoints.length < need) {
    setStatus(T(tool === 'pit' ? 'msgMinThree' : 'msgMinTwo'), true);
    return false;
  }
  const params = JSON.parse(JSON.stringify(toolParams[tool]));
  params.points = roadPoints.slice();
  const c = roadCentroid(params.points);
  const obj = addObject(tool, c.x, c.z, params);

  roadPoints = [];
  clearRoadPreview();
  setRoadHint(false);

  const r = obj.group.userData;
  if (tool === 'pit') {
    setStatus(T('pitCreated') + ' ' + Math.round(r.pit.area) + ' m², ' + T('pitCut') + ' ' + formatVolume(r.pit.cut) +
              (r.pit.fill > 0.5 ? ', ' + T('pitFill') + ' ' + formatVolume(r.pit.fill) : '') + '.');
  } else if (r.reduced) {
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
  // transform statt left/top: kein Layout pro Bild, und die 14 px Abstand zum
  // Punkt stehen gleich mit drin (früher im CSS)
  const t = 'translate(' + (Math.round(p.x) + 14) + 'px, ' + Math.round(p.y) + 'px) translateY(-50%)';
  if (el.style.transform !== t) el.style.transform = t;
}

/* ---------- Dateiimport ---------- */
function setFileStatus(which, msg, kind) {
  const el = document.getElementById(which === 'dem' ? 'dem-status' : 'gml-status');
  el.textContent = msg;
  el.className = 'file-status' + (kind ? ' ' + kind : '');
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
    const t = gridTiles(lastDemTiles, GRID_MAX);

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

/* Nur Drehen/Verschieben sperren, nicht das Zoomen - sonst kollidiert das
   Ziehen des Rechtecks mit dem Kamera-Orbit, aber näher heranzoomen soll
   beim genauen Setzen des Ausschnitts weiter möglich sein. */
function setOrbitLocked(locked) {
  controls.enableRotate = !locked;
  controls.enablePan = !locked;
}

/* Die IFC-Karte leuchtet, solange das Rechteck gezogen wird oder das Exportpanel offen ist */
function markIfcCard() {
  const cards = document.getElementById('palette').children;
  const on = rectSelectActive || isIfcPanelOpen();
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].classList && cards[i].dataset && cards[i].dataset.tool === 'ifc') cards[i].classList.toggle('active', on);
  }
}

function startRectExport() {
  if (!hasTerrain()) { setStatus(T('msgNeedTerrain'), true); return; }
  clearExportPreview();
  rectSelectActive = true;
  rectStart = null;
  setTopView();
  setOrbitLocked(true);
  selectTool(null);
  setStatus(T('ifcExportHint'));
  markIfcCard();
}

function cancelRectExport() {
  rectSelectActive = false;
  rectStart = null;
  setOrbitLocked(false);
  clearRectDragPreview();
  setStatus('');
  markIfcCard();
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
  rectPreviewGroup = thickLine(pts, 1.5, MAT.drawPreview, true);
  scene.add(rectPreviewGroup);
}

/* Ecke a kommt vom pointerdown, b vom pointerup. */
function finishRectExport(a, b) {
  rectSelectActive = false;
  setOrbitLocked(false);
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
  markIfcCard();
}

function showIfcPanel() {
  const r = exportRect;
  document.getElementById('ifc-extent').textContent =
    Math.round(r.maxX - r.minX) + ' × ' + Math.round(r.maxZ - r.minZ) + ' m';
  document.getElementById('ifc-crs').textContent = crsLabel(TERRAIN.epsg);
  document.getElementById('ifc-error').textContent = '';
  document.getElementById('ifc-panel').style.display = 'block';
}

function hideIfcPanel() {
  document.getElementById('ifc-panel').style.display = 'none';
  markIfcCard();
}

function isIfcPanelOpen() {
  return document.getElementById('ifc-panel').style.display === 'block';
}

function isRectSelectActive() { return rectSelectActive; }
function getExportRect() { return exportRect; }
function getExportGeometry() { return exportGeometry; }

function runIfcExport() {
  const errEl = document.getElementById('ifc-error');
  try {
    const ifc = buildIfc(exportGeometry, exportRect.minX, exportRect.minZ, TERRAIN.epsg);
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
  // Rechtsklick schließt beim Zeichnen ab (Ziehen mit rechts verschiebt weiter die Ansicht)
  if (event.button === 2 && isDrawTool(activeTool)) {
    pressInfo = { x: event.clientX, y: event.clientY, id: event.pointerId, t: Date.now(), button: 2 };
    return;
  }
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
  const wasRight = pressInfo.button === 2;
  pressInfo = null;
  if (moved > DRAG_TOLERANCE) return;
  if (wasRight) { if (isDrawTool(activeTool)) finishDrawing(); return; }
  const now = Date.now();
  if (now - lastPlaceTime < REPEAT_GUARD) return;
  lastPlaceTime = now;
  onCanvasClick(event);
}

/* ---------- Kamera: Umkreisen um den angeklickten Punkt ----------
   Linke Taste auf Gelände, Gebäude oder Baustein: um genau diesen Punkt
   drehen (er bleibt dabei an derselben Stelle im Bild). Linke Taste auf den
   Hintergrund: die ganze Szene wie bisher um das Drehzentrum umkreisen -
   das erledigt OrbitControls. Verschieben (rechts/Mitte) und Zoom (Rad)
   bleiben ebenfalls bei OrbitControls. Der Handler hängt in der
   Capture-Phase am Fenster, damit er vor OrbitControls entscheidet. */
let pivotDrag = null;

function onOrbitPointerDown(event) {
  if (event.target !== renderer.domElement) return;
  if (event.button !== 0 || event.ctrlKey || event.shiftKey || event.metaKey || event.altKey) return;
  if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
  if (rectSelectActive) return;               // Rechteck ziehen sperrt das Drehen
  const p = raycastPivot(event);
  if (!p) return;
  pivotDrag = { pivot: p, x: event.clientX, y: event.clientY };
  controls.enabled = false;                    // OrbitControls aussetzen
  if (event.preventDefault) event.preventDefault();
  window.addEventListener('pointermove', onOrbitPointerMove);
  window.addEventListener('pointerup', endOrbitDrag);
  window.addEventListener('pointercancel', endOrbitDrag);
}

function onOrbitPointerMove(event) {
  if (!pivotDrag) return;
  // Ging das Loslassen verloren (außerhalb des Fensters, Fensterwechsel), würde jede
  // weitere Mausbewegung die Ansicht drehen: ohne gedrückte linke Taste Geste beenden
  if (event.buttons !== undefined && !(event.buttons & 1)) { endOrbitDrag(); return; }
  const h = renderer.domElement.clientHeight || window.innerHeight || 1;
  const dx = event.clientX - pivotDrag.x, dy = event.clientY - pivotDrag.y;
  pivotDrag.x = event.clientX;
  pivotDrag.y = event.clientY;
  // Gleiche Empfindlichkeit und Richtung wie OrbitControls
  orbitAround(pivotDrag.pivot, -2 * Math.PI * dx / h, -2 * Math.PI * dy / h);
}

function endOrbitDrag() {
  if (!pivotDrag) return;
  pivotDrag = null;
  controls.enabled = true;
  window.removeEventListener('pointermove', onOrbitPointerMove);
  window.removeEventListener('pointerup', endOrbitDrag);
  window.removeEventListener('pointercancel', endOrbitDrag);
}

function isPivotDragging() { return pivotDrag !== null; }

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
  if (isDrawTool(activeTool) && roadPoints.length) {
    if (pt) setRoadPreview(roadPoints, { x: pt.x, z: pt.z }, activeTool === 'pit');
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
  if (hasNodes(sel)) {
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

  if (isDrawTool(activeTool)) {
    const pt = raycastTerrain(event);
    if (!pt) return;
    if (activeTool === 'pit' && roadPoints.length >= PIT_MAX_POINTS) { setStatus(T('msgMaxPoints'), true); return; }
    roadPoints.push({ x: pt.x, z: pt.z });
    setRoadPreview(roadPoints, null, activeTool === 'pit');
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

/* Tippt der Nutzer gerade in ein Formularfeld, sind Leertaste, Entf und
   Backspace keine Befehle: sonst löscht Backspace beim Korrigieren einer Zahl
   das ganze ausgewählte Objekt. Esc bleibt überall gültig. */
function isTypingTarget(event) {
  const t = event && event.target;
  if (!t) return false;
  const tag = String(t.tagName || '').toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable === true;
}

function onKeyDown(event) {
  if (event.key !== 'Escape' && isTypingTarget(event)) return;
  if (event.key === ' ' || event.code === 'Space') {
    if (isDrawTool(activeTool)) {
      if (event.preventDefault) event.preventDefault();
      finishDrawing();
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
  ['container', 'tower', 'mobile', 'road', 'pit', 'ifc'].forEach(function (type) {
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
      if (type === 'ifc') {
        // Erneuter Klick während der Auswahl bricht sie ab
        if (rectSelectActive) cancelRectExport(); else startRectExport();
        return;
      }
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
  window.addEventListener('pointerdown', onOrbitPointerDown, true);
  window.addEventListener('blur', endOrbitDrag);
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
    renderRoadEarth: renderRoadEarth,
    formatVolume: formatVolume,
    groupKeyFor: groupKeyFor,
    buildGroups: buildGroups,
    renderOverview: renderOverview,
    setRoadHint: setRoadHint,
    finishDrawing: finishDrawing,
    isDrawTool: isDrawTool,
    pitFormValues: pitFormValues,
    setPitRanges: setPitRanges,
    renderPitInfo: renderPitInfo,
    pitHintText: pitHintText,

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
    markIfcCard: markIfcCard,
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
    onOrbitPointerDown: onOrbitPointerDown,
    onOrbitPointerMove: onOrbitPointerMove,
    endOrbitDrag: endOrbitDrag,
    isPivotDragging: isPivotDragging,
    onCanvasMove: onCanvasMove,
    onCanvasClick: onCanvasClick,
    onKeyDown: onKeyDown,

    initUI: initUI,

    // Zustand für Tests
    getPressInfo: function () { return pressInfo; },
    getFormRefs: getFormRefs,
    resetUIState: function () {
      toolParams = {};
      formRefs = {};
      lastGmlRings = null;
      lastDemTiles = null;
      lastDemNames = [];
      gridLimit = MAX_GRID;
      roadPoints = [];
      pressInfo = null;
      pivotDrag = null;
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
