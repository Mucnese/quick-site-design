// SPDX-License-Identifier: GPL-3.0-or-later
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
let addNodeMode = false;         // nächster Klick fügt einen Punkt hinzu (Straße, Baugrube)
let roadPoints = [];          // Stützpunkte während des Zeichnens (Straße oder Baugrube)

/* =========================================================
   Sprachen
   ========================================================= */
const STRINGS = {
  de: {
    lang: 'Deutsch',
    overview: 'Übersicht', data: 'Daten', view: 'Ansicht', site: 'Baustelle',
    clear: 'Leeren', resetAll: 'Reset', confirmNo: 'Abbrechen',
    confirmClear: 'Alle {n} Bausteine löschen? Das lässt sich nicht rückgängig machen. Gelände, Gebäude und Bauwerk bleiben.', confirmClearYes: 'Ja, löschen',
    confirmReset: 'Alles zurücksetzen? Gelände, Gebäude, Bauwerk (IFC) und alle Bausteine werden entfernt, die Seite startet neu und nichts ist geladen. Das lässt sich nicht rückgängig machen.', confirmResetYes: 'Ja, zurücksetzen',
    msgNothingToClear: 'Es gibt keine Bausteine zu löschen.',
    appearance: 'Darstellung', close: 'Schließen', tweak: 'Darstellung',
    noTerrain: 'Kein Geländemodell geladen',
    loadFirst: 'Zum Starten ein Geländemodell laden',
    smTitle: 'Lade OpenStreetMap',
    smConsent: 'Die Karte lädt Kacheln von tile.openstreetmap.org. Dabei wird Ihre IP-Adresse übertragen. Erst nach Ihrem Klick.',
    smBack: 'Zurück zum Gelände', smLoad: 'Karte laden', smLoadAt: 'Karte am Ort laden', smConsentPlace: 'Ort: {p}',
    smZoomIn: 'Vergrößern', smZoomOut: 'Verkleinern',
    smAttrib: '-Mitwirkende',
    smUtmPoint: 'EPSG:{c} · Rechts {e} · Hoch {n}',
    smPopHint: 'Dateien herunterladen und links unter „Daten“ laden.',
    smBigHint: 'Sehr große Datei (z. B. BEV, mehrere GB)? Einfach unter „Daten“ wählen: Die Anwendung liest nur den Ausschnitt um den Pin.',
    smCutToggle: 'Lieber selbst zuschneiden? Für Fortgeschrittene: GDAL',
    smCutTitle: 'GDAL ist ein kostenloses Kommandozeilenprogramm. Dieser Befehl schneidet den Ausschnitt aus der großen Datei:',
    smCutAround: '{s} × {s} m um den Pin',
    smCutCopy: 'Kopieren', smCutDone: 'Kopiert',
    osmMap: 'Karte · OpenStreetMap', osmShow: 'anzeigen', osmBtn: 'Karte',
    osmNote: 'Aus. Beim Einschalten lädt Ihr Browser Kartenkacheln von tile.openstreetmap.org; dabei wird Ihre IP-Adresse übertragen.',
    osmLoading: 'Lade Kacheln …', osmLoaded: 'Karte geladen ({n} Kacheln).',
    osmPartial: 'Karte geladen, {m} von {n} Kacheln fehlen.',
    osmNoTiles: 'Keine Kachel konnte geladen werden (offline oder blockiert?).',
    osmNoCrs: 'Das Bezugssystem {c} lässt sich nicht in Längen- und Breitengrad umrechnen.',
    osmNoTerrain: 'Zuerst ein Geländemodell laden.',
    osmAttrib: 'Kartendaten © OpenStreetMap-Mitwirkende',
    ifcFile: 'Bauwerk · IFC', ifcManualBtn: 'Manuell platzieren', ifcDz: 'Höhe ±',
    demWindow: 'Ausschnitt',
    gmlUnreadable: 'Gebäudedatei nicht lesbar:',
    fpTitle: '2D-Gebäudedaten · {n} Gebäude · {f}', fpTable: 'Tabelle', fpGround: 'Geländehöhe (Unterkante)', fpGroundTerrain: 'aus dem Geländemodell',
    fpGroundAttr: 'aus dem Attribut', fpGroundFixed: 'fester Wert (m ü. NN)', fpHeight: 'Gebäudehöhe', fpHeightAttr: 'aus dem Attribut', fpHeightFixed: 'fester Wert (m)',
    fpRef: 'Der Attributwert ist', fpRefRel: 'die Höhe über Grund', fpRefAbs: 'die absolute Höhe (m ü. NN)', fpFactor: 'Faktor (zum Beispiel 3 bei Geschosszahl)',
    fpFallback: 'Ersatzhöhe ohne Angabe (m)', fpCrs: 'Bezugssystem der Daten', fpCrsKnown: 'aus der Datei: EPSG:{c}', fpCrsUnknown0: 'nicht angegeben: wie das Gelände',
    fpOther: 'anderer EPSG-Code', fpNoNumeric: '– kein Zahlenfeld –',
    fpInfo: '{n} Gebäude im Gelände, {o} außerhalb, {h} ohne brauchbare Höhe (Ersatzhöhe)', fpStatus: '{n} Gebäude ({f}) · {u} im Gelände',
    fpNeedTerrain: 'Bitte zuerst ein Geländemodell laden. Die Grundrisse werden auf das Gelände gesetzt.',
    fpNeedShp: 'Zu den Zusatzdateien (.dbf, .prj) fehlt die .shp-Datei. Bitte .shp, .dbf und .prj zusammen wählen.',
    fpBadJson: 'Die Datei ist kein gültiges GeoJSON.', fpNoPolygons: 'Keine Gebäudeflächen (Polygone) im Bereich des Geländes gefunden. Liegen die Daten dort?',
    fpBadShp: 'Die .shp-Datei ist nicht lesbar.', fpShpNotPolygon: 'Das Shapefile enthält keine Flächen (Polygone).', fpBadDbf: 'Die .dbf-Tabelle ist nicht lesbar.',
    fpCrsUnknown: 'Das Bezugssystem der Daten ist der Anwendung nicht bekannt. Bitte unten einen EPSG-Code wählen.',
    sqliteBad: 'Die Datei ist keine lesbare GeoPackage-Datei (SQLite).', sqliteEncoding: 'Die GeoPackage-Datei ist nicht UTF-8-kodiert; das wird nicht gelesen.',
    gpkgNone: 'Das GeoPackage enthält keine Flächenebene (Polygone).',
    gmlTooBig: 'Die Gebäudedateien sind zusammen {s} MB groß, mehr als {m} MB schafft der Browser nicht. Bitte kleinere Ausschnitte laden.',
    busyGml: 'Gebäudemodell wird verarbeitet … bei großen Dateien kann das einige Sekunden dauern.', busyGmlRender: 'Gebäudemodell wird gerendert …',
    busyIfc: 'IFC-Datei wird gelesen und gerendert … bei großen Dateien kann das einige Sekunden dauern.',
    ifcReading: 'Lese IFC …', ifcPlacedAuto: 'Automatisch platziert (EPSG:{c}).',
    ifcWhyNoGeo: 'Das Bauwerk ist nicht georeferenziert.', ifcWhyCrs: 'Das Bauwerk liegt in EPSG:{a}, das Gelände in EPSG:{b}.',
    ifcWhyNoCrs: 'Das Bauwerk nennt kein Bezugssystem (EPSG-Code).', ifcWhyTerrainCrs: 'Das Gelände hat kein bekanntes Bezugssystem.',
    ifcStep0: 'Punkt A am Bauwerk anklicken (zum Beispiel eine Ecke).', ifcStep1: 'Jetzt im Gelände den Punkt anklicken, der A am Bauwerk entspricht.',
    ifcStep2: 'Punkt B am Bauwerk anklicken, möglichst weit von A entfernt.', ifcStep3: 'Im Gelände den Punkt anklicken, der B entspricht.',
    ifcStepSub: 'Schritt {n} von 4 · Esc bricht ab · Die Ansicht lässt sich zwischendurch drehen und zoomen.',
    ifcPlacedManual: 'Bauwerk platziert. Abstand A–B: Bauwerk {m} m, Gelände {t} m.',
    ifcDistWarn: 'Die Abstände weichen um {d} m ab; stimmen die Punkte?',
    ifcOutside: 'Das Bauwerk liegt außerhalb des Geländes. „Manuell platzieren“ setzt es neu.',
    ifcTooBig: '{n}: {s} MB sind zu groß für den Browser (Grenze {m} MB).',
    ifcFail: 'IFC konnte nicht gelesen werden: {e}', ifcEmpty: 'Die IFC-Datei enthält keine darstellbare Geometrie.',
    ifcLibFail: 'Die IFC-Bibliothek (lib/web-ifc-api-iife.js) konnte nicht geladen werden.',
    ifcNeedTerrain: 'Zuerst ein Geländemodell laden.', ifcCancelled: 'Platzierung abgebrochen.', ifcRemoved: 'Bauwerk entfernt.',
    ifcInfo: '{n} · {t} Dreiecke',
    helpBtn: 'Hilfe', helpGuide: 'Vollständige Anleitung auf GitHub ↗',
    helpGuideUrl: 'https://github.com/Mucnese/quick-site-design/blob/main/BENUTZERANLEITUNG.md',
    helpChangelog: 'Änderungsprotokoll ↗', helpChangelogUrl: 'https://github.com/Mucnese/quick-site-design/blob/main/CHANGELOG.md',
    helpNote: 'Die Anwendung ersetzt keine Statik- oder Traglastprüfung. Für Krane gilt allein die Traglasttabelle des Herstellers. Alle Ergebnisse sind überschlägig und ohne Gewähr; die Haftung ist ausgeschlossen, soweit gesetzlich zulässig (siehe Impressum).',
    helpS1T: 'Loslegen',
    helpS1B: '- Am Start zeigt die Seite eine Karte („Karte laden“ lädt erst dann Kacheln von OpenStreetMap): Ort anklicken (Pin).\n- Oder oben links die Adresse oder Koordinaten eingeben („Wo ist deine Baustelle?“): Du bekommst die Links zum Geländemodell (DGM) und zum Gebäudemodell deines Bundeslandes bzw. Landes (EU), in Großstädten zusätzlich die Stadtgeoportale.\n- Datei herunterladen und im Fenster „Daten“ laden: Gelände als GeoTIFF, XYZ oder Punktwolke LAS/LAZ (bei XYZ das Bezugssystem wählen), Gebäude als CityGML, CityJSON oder als 2D-Datei (GeoPackage, Shapefile, GeoJSON, INSPIRE-GML): Bei 2D wählst du danach Gelände- und Gebäudehöhe aus den Attributen. Mehrere Kacheln gehen zugleich.\n- Ohne Gelände bleiben die Bausteine gesperrt. Zum Ausprobieren gibt es den Demo-Link mit ?demo=1.',
    helpS2T: 'Ansicht steuern',
    helpS2B: '- Linke Maustaste ziehen: drehen. Rechte oder mittlere Taste ziehen: verschieben. Mausrad: zoomen.\n- Linksklick aufs Gelände setzt einen Messpunkt mit Rechtswert, Hochwert und Höhe.\n- 2D: Draufsicht. Kompass: nach Norden ausrichten. „Zurücksetzen“ in der Übersicht passt die Ansicht neu ein.\n- Darstellung: Schrift, Schriftgröße, Akzentfarbe, Fensterbreite. DE und EN wechseln die Sprache.',
    helpS3T: 'Bausteine setzen',
    helpS3B: '- Unten einen Baustein wählen und ins Gelände klicken: Container, Turmdrehkran, Mobilkran.\n- Baustraße und Baugrube: Punkt für Punkt setzen, dann Rechtsklick oder Leertaste. Esc bricht ab.\n- Im Eigenschaftsfenster rechts Maße, Winkel und Typ einstellen. Jeder Regler hat ein Zahlenfeld zum Eintippen.',
    helpS4T: 'Bearbeiten',
    helpS4B: '- Objekt anklicken: Verschieben, Duplizieren, Löschen.\n- Straße und Baugrube: Stützpunkte anklicken und versetzen, „Punkt hinzufügen“, „Punkt löschen“.\n- Ein Eintrag in der Übersicht wählt die ganze Gruppe.',
    helpS5T: 'Mengen und Prüfungen',
    helpS5B: '- Baustraße: Längsneigung, Böschung 1:1 bis 1:2, Auftrag und Abtrag in m³.\n- Die Achslinie zeigt über der Mittellinie die Neigung, darunter die Länge je Abschnitt; beide lassen sich eintippen (Enter).\n- Baugrube: Tiefe, Höhe der Unterkante, Böschungswinkel, Aushub und Aufschüttung in m³.\n- Die Übersicht zeigt die Mengen je Gruppe.\n- „Schleppkurve Sattelzug prüfen“ (Baustraße): zeigt die überstrichene Fläche und ob die Straße breit genug ist.\n- Überschneiden sich Kranradien, warnt die Übersicht.\n- „Messen“ (Leiste): Punkte anklicken, an jeder Strecke stehen waagerechte Länge und Höhenunterschied (2 Nachkommastellen); Rechtsklick oder Leertaste beendet, Rücktaste nimmt den letzten Punkt zurück, Esc beendet.',
    helpS6T: 'Karte und Export',
    helpS6B: '- Knopf „Karte“ (unten links) → „Karte · OpenStreetMap“ legt eine Karte aufs Gelände. Dafür werden Kacheln von OpenStreetMap geladen.\n- IFC Export: In der 2D-Ansicht ein Rechteck aufziehen, dann werden Gelände, Gebäude und auf Wunsch die Bausteine als IFC-Datei heruntergeladen, auch in einem anderen Koordinatensystem.\n- IFC Import („Bauwerk · IFC“ im Fenster „Daten“): georeferenziert im gleichen Bezugssystem wie das Gelände = automatisch platziert, sonst je zwei Punkte am Bauwerk und im Gelände anklicken.',
    helpS7T: 'Tastatur',
    helpS7B: '- Esc: abbrechen und Auswahl aufheben.\n- Leertaste: Straße oder Baugrube abschließen.\n- Entf oder Rücktaste: ausgewählte Objekte löschen (nicht beim Tippen in Feldern).',
    addrPlaceholder: 'Wo ist deine Baustelle?',
    addrNote: 'Vorschläge von photon.komoot.io; Eingabe und IP-Adresse werden übertragen.',
    addrSimilar: 'Nichts zu „{q}“ gefunden. Ähnlich:', addrCoordSub: 'Ort und Bundesland werden beim Wählen ermittelt',
    addrCoordFail: 'Ort oder Bundesland konnte nicht ermittelt werden.', addrAt: 'Lage',
    addrSearching: 'Suche …', addrNone: 'Keine Treffer.', addrError: 'Die Suche ist gerade nicht erreichbar.',
    addrOnlyDeAt: 'Für diesen Ort sind keine Datenquellen hinterlegt (nur Länder der EU).',
    addrDem: 'Geländemodell (DGM)', addrBldg: 'Gebäudemodell (LoD1/LoD2)',
    addrCity: 'Stadtgeoportale · {c}', cityKind_map: 'Karte / Geoportal', cityKind_data: 'Offene Daten / Downloads', cityKind_3d: '3D-Stadtmodell',
    geoFmtTif: 'GeoTIFF, direkt ladbar', geoFmtXyz: 'XYZ-Text, direkt ladbar (Bezugssystem wählen)', geoFmtLaz: 'LAZ-Punktwolke, direkt ladbar', geoFmtUnclear: 'Format unklar',
    geoNote_dgm025: 'Das DGM1 gibt es hier nur als XYZ-Text, GeoTIFF nur beim DGM025 (0,25 m).',
    geoNote_berlin: 'Berlin liegt vermutlich in den Brandenburg-Daten (nicht geprüft).',
    geoNote_catalog: 'Katalogeintrag, nicht selbst geprüft.',
    geoNote_saarland: 'Seite ohne Download, Lizenz unklar.',
    geoNote_epsg3035: 'Sehr große Kacheln (EPSG:3035): Die Anwendung liest daraus nur einen Ausschnitt um den gewählten Ort. Zuerst einen Pin setzen, dann die Datei wählen.',
    geoNote_asc: 'Gemeindeweise als TIF und ASCII.',
    geoNote_unverified: 'Nicht geprüft.',
    geoNote_servicesOnly: 'Kein Download gefunden, nur Dienste.',
    geoNote_atGpkg: 'Ganz Österreich als Blockmodell (LoD1), GeoPackage, rund 2,5 GB, CC BY 4.0. Unter „Daten“ laden: Die Anwendung liest nur den Ausschnitt um das Gelände. Gelände- und Gebäudehöhe wählen Sie danach aus den Attributen (zum Beispiel HOEHE_BODEN_MIN und HOEHE_OBJEKT_MAX).',
    geoNote_euNoOpenDem: 'Kein offenes Geländemodell geprüft. Das nationale Geoportal oder das INSPIRE-Geoportal der EU nennen Angebote.',
    geoNote_noEuBldg: 'Kein amtliches 3D-Gebäudemodell geprüft.',
    geoNote_plLod2: 'LoD1 für ganz Polen (CityGML 2.0, nach Landkreisen), LoD2 nur für einen Teil des Landes (Stand 2018).',
    geoNote_bldgShp: 'Als Shapefile oder KML (LoD1-Blockmodell). Ein Shapefile lässt sich als 2D-Datei laden (zusammen mit .dbf und .prj); ob es Höhenattribute enthält, wurde nicht geprüft.',
    geoNote_euCheckFormat: 'Das Format steht auf der Seite nicht eindeutig; vor dem Laden prüfen (GeoTIFF wird direkt geladen).',
    geoNote_euPartial: 'Nicht überall verfügbar.',
    geoNote_czLaz: 'Ganz Tschechien in 2 × 2 km-Kacheln (LAZ), kostenlos, CC BY 4.0. Koordinaten laut Seite ETRS89 / UTM 33N (EPSG:25833): Steht kein Bezugssystem in der Datei, dieses wählen.',
    geoNote_frLidar: 'Noch nicht überall: Stand 6. September 2026 rund 78 % der Fläche, Guyane gehört nicht zum Programm. Ob ein Ort schon dabei ist, zeigt der Link „Abdeckung nach Gemeinde“.',
    geoNote_esMdt: 'Ganz Spanien in Blättern (MTN25, COG-GeoTIFF). Ceuta, Melilla und Alborán stammen aus Luftbildern (geringere Qualität); die Kanaren liegen in REGCAN95.',
    geoNote_euBldgNotCityGml: 'Als CityJSON (lässt sich laden), GeoPackage (als 2D-Datei lesbar) oder OBJ (nicht).',
    geoNote_euUnreachable: 'Die Seite war bei der Prüfung nicht erreichbar.',
    xyzCrs: 'Bezugssystem für XYZ-Dateien (und LAS, wenn die Datei keines nennt)', xyzChoose: '– bitte wählen –', xyzOther: 'anderer EPSG-Code …',
    xyzNeedCrs: 'XYZ- oder LAS-Datei ohne Bezugssystem erkannt: bitte das Bezugssystem wählen oder den EPSG-Code eintippen.',
    lasBad: 'Die Datei ist keine gültige LAS/LAZ-Datei.', lasNoPoints: 'Die Punktwolke enthält keine brauchbaren Punkte im Ausschnitt.', lasLibFail: 'Die LAZ-Bibliothek (lib/laz-perf.js) konnte nicht geladen werden.',
    lasBigNoPin: 'Die Punktwolke ist sehr groß. Bitte zuerst auf der Startkarte einen Pin setzen: Dann wird nur der Ausschnitt um den Pin gerastert.',
    lasTooBig: '{s} MB sind zu viel für den Browser (Grenze {m} MB). Bitte die Wolke vorher kacheln oder zuschneiden.',
    lasInfo: 'Punktwolke {n} Punkte, Geländepunkte auf {c} m gerastert', lasInfoRaw: 'Punktwolke {n} Punkte (nicht klassifiziert), tiefster Punkt je {c}-m-Zelle',
    xyzBadEpsg: 'Ungültiger EPSG-Code (vier bis fünf Ziffern).',
    xyzFar: 'Achtung: Im gewählten System {c} liegen die Koordinaten bei Breite {lat}, Länge {lon}, also außerhalb Europas.',
    terrainFile: 'Gelände · GeoTIFF / XYZ / LAS / LAZ', buildingFile: 'Gebäude · CityGML / CityJSON / 2D (GPKG, SHP, GeoJSON, INSPIRE)',
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
    tRuler: 'Messen', tRulerHint: 'Strecken, Höhenunterschiede und Gefälle messen',
    rulerHint0: 'Messen: ersten Punkt anklicken · Esc beendet',
    rulerHint1: 'Messen: weitere Punkte anklicken · Rechtsklick oder Leertaste beendet · Rücktaste nimmt den letzten Punkt zurück · Esc beendet',
    rulerDone: 'Messung beendet · ein Klick beginnt eine neue · Esc beendet das Messen',
    rulerTitle: 'Messen', rulerPts: 'Punkte', rulerH: 'Horizontal', rulerS: 'Schräg (im Raum)', rulerDz: 'Höhenunterschied',
    rulerSlope: 'Gefälle', rulerZ0: 'Höhe Start', rulerZ1: 'Höhe Ende', rulerNew: 'Neu messen', rulerClose: 'Beenden',
    tIfc: 'IFC Export', tIfcHint: 'Rechteck aufziehen, Gelände, Gebäude und Bausteine als IFC', ifcExportHint: 'Rechteck auf dem Gelände ziehen. Esc bricht ab.',
    ifcCoords: 'Koordinaten', ifcCoordsAbs: 'absolut im Bezugssystem', ifcCoordsLocal: 'lokal (mit IfcMapConversion)',
    ifcCoordsNote: 'Absolut: Rechtswert, Hochwert und Höhe stehen direkt im Modell. Lokal: kleine Zahlen, die Lage steckt in der Georeferenz (IfcMapConversion).',
    ifcPanelTitle: 'IFC-Export', ifcExtent: 'Ausdehnung', ifcCrs: 'Koordinatenbezug',
    ifcTarget: 'Bezugssystem der Datei', ifcTargetSame: 'wie Gelände', ifcObjects: 'Straßen, Baugruben und Bausteine mitnehmen',
    ifcTargetNote: 'Die Punkte werden umgerechnet und absolut geschrieben.',
    ifcTargetApprox: 'Bessel-System (DHDN/MGI): Umrechnung nur auf etwa 1 bis 2 m genau, ohne Höhenänderung.',
    ifcExportAction: 'Exportieren', cancel: 'Abbrechen', msgIfcExported: 'IFC-Datei heruntergeladen.',
    crs: 'KBS', accuracy: 'DGM-Rasterung', unit: 'Einheit', unitMeter: 'Meter',
    hintClick: 'Linksklick', hintMeasure: 'Messpunkt', hintDrag: 'Links', hintDragX: ' ziehen',
    hintRotate: 'Drehen', hintPan: 'Rechts/Mitte', hintPanX: ' ziehen', hintPanDo: 'Verschieben',
    hintWheel: 'Mausrad', hintZoom: 'Zoom', hintEsc: 'Esc', hintCancel: 'Abbrechen',
    measureOn: 'Messpunkt auf', ground: 'Gelände', building: 'Gebäude',
    font: 'Schriftart', fontSize: 'Schriftgröße',
    accent: 'Akzentfarbe', panelWidth: 'Fensterbreite',
    language: 'Sprache',
    loading: 'Lade', reset: 'Zurücksetzen',
    tCont: 'Container', tContHint: 'Ab zwei Reihen liegt die zweite quer',
    tTower: 'Turmdrehkran', tTowerHint: 'Generisches Modell, Parameter frei einstellbar',
    tMobile: 'Mobilkran', tMobileHint: 'Liebherr LTM',
    tRoad: 'Baustraße', tRoadHint: 'Stützpunkte setzen, Rechtsklick oder Leertaste schließt ab',
    tPit: 'Baugrube', tPitHint: 'Eckpunkte setzen, Rechtsklick oder Leertaste schließt das Polygon',
    fDepth: 'Tiefe zum mittleren Gelände', fBottomAbs: 'Höhe Unterkante (m ü. NHN)', fPitAngle: 'Böschungswinkel (90° = senkrecht)',
    pitFloor: 'Sohlfläche', pitClamped: 'Grube zu schmal: Böschungswinkel auf den Mindestwinkel',
    pitDrawing: 'Baugrube: Eckpunkte im Gelände setzen', pitFinish: 'Rechtsklick oder Leertaste schließt das Polygon, Esc bricht ab',
    msgMinThree: 'Mindestens drei Punkte setzen.', msgMaxPoints: 'Mehr als 32 Eckpunkte sind nicht möglich.',
    pitCut: 'Aushub', pitFill: 'Aufschüttung', pitRef: 'Mittleres Gelände', pitBottom: 'Unterkante', pitCreated: 'Baugrube angelegt:',
    fCols: 'Anzahl nebeneinander', fRows: 'Reihen hintereinander', fLevels: 'Stockwerke',
    fRot: 'Winkel Anlage', fUnitL: 'Länge je Container', fUnitB: 'Breite je Container',
    fUnitH: 'Höhe je Container', fModel: 'Krantyp', fHook: 'Hakenhöhe',
    fRadius: 'Ausladung', fMast: 'Turmbreite', fJibRot: 'Winkel Ausleger',
    fBaseRot: 'Winkel Fundament', fVehRot: 'Winkel Fahrzeug', fShowRadius: 'Arbeitsradius zeigen',
    fWidth: 'Straßenbreite', fMinRadius: 'Mindestradius Kurve', fShowEdge: 'Ränder zeigen',
    axisSlopeTip: 'Längsneigung dieses Abschnitts in % (Zahl eingeben, Enter)',
    axisLenTip: 'Länge dieses Abschnitts in m entlang der Achse (Zahl eingeben, Enter). Der Endpunkt und alle folgenden Punkte rücken mit.',
    slopeVariable: 'variabel',
    fSwept: 'Schleppkurve Sattelzug prüfen',
    sweptNeed: 'Sattelzug 16,50 m braucht {n} m bei Fahrt auf der Straßenmitte (Fahrbahn {w} m).',
    sweptOk: 'Passt.', sweptOver: 'Passt nicht: ragt bis {o} m über den Fahrbahnrand.',
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
    nodeHint: 'Stützpunkt anklicken, dann neue Position im Gelände wählen.', nodePicked: 'Stützpunkt gewählt. Neue Position anklicken.', nodeMoved: 'Stützpunkt verschoben.', nodePickFirst: 'Zuerst einen Stützpunkt anklicken.', nodeMinTwo: 'Eine Baustraße braucht mindestens zwei Stützpunkte.', nodeMinThree: 'Eine Baugrube braucht mindestens drei Eckpunkte.', delNode: 'Punkt löschen', addNode: 'Punkt hinzufügen', nodeAddHint: 'Stelle im Gelände anklicken: der Punkt wird in die nächste Strecke eingefügt.', nodeAdded: 'Punkt hinzugefügt.'
  },
  en: {
    lang: 'English',
    overview: 'Overview', data: 'Data', view: 'View', site: 'Site',
    clear: 'Clear', resetAll: 'Reset', confirmNo: 'Cancel',
    confirmClear: 'Delete all {n} blocks? This cannot be undone. Terrain, buildings and structure stay.', confirmClearYes: 'Yes, delete',
    confirmReset: 'Reset everything? Terrain, buildings, structure (IFC) and all blocks are removed, the page restarts and nothing is loaded. This cannot be undone.', confirmResetYes: 'Yes, reset',
    msgNothingToClear: 'There are no blocks to delete.',
    appearance: 'Appearance', close: 'Close', tweak: 'Appearance',
    noTerrain: 'No terrain model loaded',
    loadFirst: 'Load a terrain model to begin',
    smTitle: 'Load OpenStreetMap',
    smConsent: 'The map loads tiles from tile.openstreetmap.org. Your IP address is transmitted. Only after your click.',
    smBack: 'Back to the terrain', smLoad: 'Load map', smLoadAt: 'Load map at the place', smConsentPlace: 'Place: {p}',
    smZoomIn: 'Zoom in', smZoomOut: 'Zoom out',
    smAttrib: ' contributors',
    smUtmPoint: 'EPSG:{c} · Easting {e} · Northing {n}',
    smPopHint: 'Download the files and load them under “Data” on the left.',
    smBigHint: 'Very large file (e.g. BEV, several GB)? Just choose it under “Data”: the application reads only the area around the pin.',
    smCutToggle: 'Prefer to cut it yourself? For advanced users: GDAL',
    smCutTitle: 'GDAL is a free command-line program. This command cuts the area out of the large file:',
    smCutAround: '{s} × {s} m around the pin',
    smCutCopy: 'Copy', smCutDone: 'Copied',
    osmMap: 'Map · OpenStreetMap', osmShow: 'show', osmBtn: 'Map',
    osmNote: 'Off. Turning it on makes your browser load map tiles from tile.openstreetmap.org; your IP address is transmitted.',
    osmLoading: 'Loading tiles …', osmLoaded: 'Map loaded ({n} tiles).',
    osmPartial: 'Map loaded, {m} of {n} tiles are missing.',
    osmNoTiles: 'No tile could be loaded (offline or blocked?).',
    osmNoCrs: 'The coordinate system {c} cannot be converted to latitude and longitude.',
    osmNoTerrain: 'Load a terrain model first.',
    osmAttrib: 'Map data © OpenStreetMap contributors',
    ifcFile: 'Structure · IFC', ifcManualBtn: 'Place manually', ifcDz: 'Height ±',
    demWindow: 'extract',
    gmlUnreadable: 'Building file not readable:',
    fpTitle: '2D building data · {n} buildings · {f}', fpTable: 'Table', fpGround: 'Ground height (base)', fpGroundTerrain: 'from the terrain model',
    fpGroundAttr: 'from the attribute', fpGroundFixed: 'fixed value (m a.s.l.)', fpHeight: 'Building height', fpHeightAttr: 'from the attribute', fpHeightFixed: 'fixed value (m)',
    fpRef: 'The attribute value is', fpRefRel: 'the height above ground', fpRefAbs: 'the absolute height (m a.s.l.)', fpFactor: 'Factor (for example 3 for number of storeys)',
    fpFallback: 'Substitute height when missing (m)', fpCrs: 'Coordinate system of the data', fpCrsKnown: 'from the file: EPSG:{c}', fpCrsUnknown0: 'not stated: same as the terrain',
    fpOther: 'other EPSG code', fpNoNumeric: '– no numeric field –',
    fpInfo: '{n} buildings in the terrain, {o} outside, {h} without a usable height (substitute height)', fpStatus: '{n} buildings ({f}) · {u} in the terrain',
    fpNeedTerrain: 'Please load a terrain model first. The footprints are placed on the terrain.',
    fpNeedShp: 'The .shp file is missing for the extra files (.dbf, .prj). Please choose .shp, .dbf and .prj together.',
    fpBadJson: 'The file is not valid GeoJSON.', fpNoPolygons: 'No building areas (polygons) found within the terrain. Is the data located there?',
    fpBadShp: 'The .shp file cannot be read.', fpShpNotPolygon: 'The shapefile contains no areas (polygons).', fpBadDbf: 'The .dbf table cannot be read.',
    fpCrsUnknown: 'The coordinate system of the data is not known to the application. Please choose an EPSG code below.',
    sqliteBad: 'The file is not a readable GeoPackage (SQLite) file.', sqliteEncoding: 'The GeoPackage file is not UTF-8 encoded; this is not read.',
    gpkgNone: 'The GeoPackage contains no area layer (polygons).',
    gmlTooBig: 'The building files are {s} MB together; the browser cannot handle more than {m} MB. Please load smaller extracts.',
    busyGml: 'Building model is being processed … large files can take a few seconds.', busyGmlRender: 'Building model is being rendered …',
    busyIfc: 'IFC file is being read and rendered … large files can take a few seconds.',
    ifcReading: 'Reading IFC …', ifcPlacedAuto: 'Placed automatically (EPSG:{c}).',
    ifcWhyNoGeo: 'The structure is not georeferenced.', ifcWhyCrs: 'The structure is in EPSG:{a}, the terrain in EPSG:{b}.',
    ifcWhyNoCrs: 'The structure names no coordinate system (EPSG code).', ifcWhyTerrainCrs: 'The terrain has no known coordinate system.',
    ifcStep0: 'Click point A on the structure (for example a corner).', ifcStep1: 'Now click the point in the terrain that matches A on the structure.',
    ifcStep2: 'Click point B on the structure, as far from A as possible.', ifcStep3: 'Click the point in the terrain that matches B.',
    ifcStepSub: 'Step {n} of 4 · Esc cancels · You can rotate and zoom the view in between.',
    ifcPlacedManual: 'Structure placed. Distance A–B: structure {m} m, terrain {t} m.',
    ifcDistWarn: 'The distances differ by {d} m; do the points match?',
    ifcOutside: 'The structure lies outside the terrain. “Place manually” sets it again.',
    ifcTooBig: '{n}: {s} MB is too large for the browser (limit {m} MB).',
    ifcFail: 'The IFC could not be read: {e}', ifcEmpty: 'The IFC file contains no displayable geometry.',
    ifcLibFail: 'The IFC library (lib/web-ifc-api-iife.js) could not be loaded.',
    ifcNeedTerrain: 'Load a terrain model first.', ifcCancelled: 'Placement cancelled.', ifcRemoved: 'Structure removed.',
    ifcInfo: '{n} · {t} triangles',
    helpBtn: 'Help', helpGuide: 'Full user guide on GitHub ↗',
    helpGuideUrl: 'https://github.com/Mucnese/quick-site-design/blob/main/USER-GUIDE.en.md',
    helpChangelog: 'Changelog ↗', helpChangelogUrl: 'https://github.com/Mucnese/quick-site-design/blob/main/CHANGELOG.en.md',
    helpNote: 'The application does not replace a structural or load-capacity check. For cranes only the manufacturer’s load chart counts. All results are rough and without warranty; liability is excluded to the extent permitted by law (see legal notice).',
    helpS1T: 'Getting started',
    helpS1B: '- At the start the page shows a map (“Load map” loads OpenStreetMap tiles only then): click a place (pin).\n- Or type the address or coordinates at the top left (“Where is your construction site?”): you get the links to the terrain model (DGM) and the building model of your state or country (EU), in large cities also the city geoportals.\n- Download the file and load it in the “Data” window: terrain as GeoTIFF, XYZ or LAS/LAZ point cloud (for XYZ choose the coordinate system), buildings as CityGML, CityJSON or as a 2D file (GeoPackage, shapefile, GeoJSON, INSPIRE GML): for 2D you then choose ground and building height from the attributes. Several tiles work at once.\n- Without terrain the building blocks stay locked. To try it out, use the demo link with ?demo=1.',
    helpS2T: 'Controlling the view',
    helpS2B: '- Drag with the left mouse button: rotate. Drag with the right or middle button: pan. Mouse wheel: zoom.\n- A left click on the terrain sets a measuring point with easting, northing and height.\n- 2D: top view. Compass: align north. “Reset” in the overview fits the view again.\n- Appearance: font, text size, accent colour, panel width. DE and EN switch the language.',
    helpS3T: 'Placing building blocks',
    helpS3B: '- Choose a block at the bottom and click into the terrain: container, tower crane, mobile crane.\n- Haul road and excavation: set point after point, then right-click or space. Esc cancels.\n- Set sizes, angles and type in the properties window on the right. Every slider has a number field for typing.',
    helpS4T: 'Editing',
    helpS4B: '- Click an object: move, duplicate, delete.\n- Road and excavation: click nodes and move them, “Add node”, “Delete node”.\n- An entry in the overview selects the whole group.',
    helpS5T: 'Quantities and checks',
    helpS5B: '- Haul road: longitudinal slope, embankment 1:1 to 1:2, fill and cut in m³.\n- The axis line shows the slope above and the length below the centre line for every section; both can be typed in (Enter).\n- Excavation: depth, bottom level, slope angle, excavation and fill in m³.\n- The overview shows the quantities per group.\n- “Check swept path (semi-trailer)” (haul road): shows the swept area and whether the road is wide enough.\n- If crane radii overlap, the overview warns.\n- “Measure” (toolbar): click points, every segment shows horizontal length and height difference (2 decimals); right-click or space finishes, backspace removes the last point, Esc ends.',
    helpS6T: 'Map and export',
    helpS6B: '- “Map” button (bottom left) → “Map · OpenStreetMap” puts a map on the terrain. Tiles are loaded from OpenStreetMap for this.\n- IFC export: drag a rectangle in the 2D view; terrain, buildings and, optionally, the blocks are downloaded as an IFC file, also in another coordinate system.\n- IFC import (“Structure · IFC” in the “Data” window): georeferenced in the same coordinate system as the terrain = placed automatically, otherwise click two points on the structure and two on the terrain.',
    helpS7T: 'Keyboard',
    helpS7B: '- Esc: cancel and clear the selection.\n- Space: finish a road or excavation.\n- Delete or Backspace: delete the selected objects (not while typing in fields).',
    addrPlaceholder: 'Where is your construction site?',
    addrNote: 'Suggestions from photon.komoot.io; input and IP address are transmitted.',
    addrSimilar: 'Nothing found for “{q}”. Similar:', addrCoordSub: 'Place and state are looked up when you choose it',
    addrCoordFail: 'The place or state could not be determined.', addrAt: 'Position',
    addrSearching: 'Searching …', addrNone: 'No results.', addrError: 'The search is not reachable right now.',
    addrOnlyDeAt: 'No data sources are listed for this place (EU countries only).',
    addrDem: 'Terrain model (DGM)', addrBldg: 'Building model (LoD1/LoD2)',
    addrCity: 'City geoportals · {c}', cityKind_map: 'Map / geoportal', cityKind_data: 'Open data / downloads', cityKind_3d: '3D city model',
    geoFmtTif: 'GeoTIFF, loads directly', geoFmtXyz: 'XYZ text, loads directly (choose the coordinate system)', geoFmtLaz: 'LAZ point cloud, loads directly', geoFmtUnclear: 'Format unclear',
    geoNote_dgm025: 'The DGM1 is only offered as XYZ text here, GeoTIFF only for the DGM025 (0.25 m).',
    geoNote_berlin: 'Berlin is probably part of the Brandenburg data (not checked).',
    geoNote_catalog: 'Catalogue entry, not checked myself.',
    geoNote_saarland: 'Page without a download, licence unclear.',
    geoNote_epsg3035: 'Very large tiles (EPSG:3035): the application reads only an area around the chosen place. Set a pin first, then choose the file.',
    geoNote_asc: 'Per municipality as TIF and ASCII.',
    geoNote_unverified: 'Not checked.',
    geoNote_servicesOnly: 'No download found, services only.',
    geoNote_atGpkg: 'All of Austria as a block model (LoD1), GeoPackage, about 2.5 GB, CC BY 4.0. Load it under “Data”: the application reads only the area around the terrain. Then choose ground and building height from the attributes (for example HOEHE_BODEN_MIN and HOEHE_OBJEKT_MAX).',
    geoNote_euNoOpenDem: 'No open terrain model checked. The national geoportal or the EU INSPIRE geoportal list offers.',
    geoNote_noEuBldg: 'No official 3D building model checked.',
    geoNote_plLod2: 'LoD1 for all of Poland (CityGML 2.0, by county), LoD2 only for part of the country (as of 2018).',
    geoNote_bldgShp: 'As shapefile or KML (LoD1 block model). A shapefile can be loaded as a 2D file (together with .dbf and .prj); whether it contains height attributes was not checked.',
    geoNote_euCheckFormat: 'The page does not state the format clearly; check before loading (GeoTIFF loads directly).',
    geoNote_euPartial: 'Not available everywhere.',
    geoNote_czLaz: 'All of Czechia in 2 × 2 km tiles (LAZ), free of charge, CC BY 4.0. Coordinates according to the page: ETRS89 / UTM 33N (EPSG:25833): if the file has no coordinate system, choose this one.',
    geoNote_frLidar: 'Not everywhere yet: as of 6 September 2026 about 78 % of the area; French Guiana is not part of the programme. Whether a place is covered yet is shown by the link “coverage by municipality”.',
    geoNote_esMdt: 'All of Spain in sheets (MTN25, COG GeoTIFF). Ceuta, Melilla and Alborán come from aerial photos (lower quality); the Canary Islands use REGCAN95.',
    geoNote_euBldgNotCityGml: 'As CityJSON (can be loaded), GeoPackage (readable as a 2D file) or OBJ (cannot).',
    geoNote_euUnreachable: 'The page could not be reached when checked.',
    xyzCrs: 'Coordinate system for XYZ files (and LAS if the file gives none)', xyzChoose: '– please choose –', xyzOther: 'other EPSG code …',
    xyzNeedCrs: 'XYZ or LAS file without a coordinate system detected: please choose the coordinate system or type the EPSG code.',
    lasBad: 'The file is not a valid LAS/LAZ file.', lasNoPoints: 'The point cloud has no usable points in the area.', lasLibFail: 'The LAZ library (lib/laz-perf.js) could not be loaded.',
    lasBigNoPin: 'The point cloud is very large. Please set a pin on the start map first: then only the area around the pin is gridded.',
    lasTooBig: '{s} MB is too much for the browser (limit {m} MB). Please tile or clip the cloud first.',
    lasInfo: 'point cloud {n} points, ground points gridded at {c} m', lasInfoRaw: 'point cloud {n} points (unclassified), lowest point per {c} m cell',
    xyzBadEpsg: 'Invalid EPSG code (four to five digits).',
    xyzFar: 'Warning: in the chosen system {c} the coordinates lie at latitude {lat}, longitude {lon}, outside Europe.',
    terrainFile: 'Terrain · GeoTIFF / XYZ / LAS / LAZ', buildingFile: 'Buildings · CityGML / CityJSON / 2D (GPKG, SHP, GeoJSON, INSPIRE)',
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
    tRuler: 'Measure', tRulerHint: 'Measure distances, height differences and slope',
    rulerHint0: 'Measure: click the first point · Esc ends',
    rulerHint1: 'Measure: click more points · right-click or space finishes · backspace removes the last point · Esc ends',
    rulerDone: 'Measurement finished · a click starts a new one · Esc ends measuring',
    rulerTitle: 'Measure', rulerPts: 'Points', rulerH: 'Horizontal', rulerS: 'Slope distance (3D)', rulerDz: 'Height difference',
    rulerSlope: 'Slope', rulerZ0: 'Height start', rulerZ1: 'Height end', rulerNew: 'Measure again', rulerClose: 'End',
    tIfc: 'IFC Export', tIfcHint: 'Draw a rectangle, export terrain, buildings and blocks as IFC', ifcExportHint: 'Drag a rectangle over the terrain. Esc cancels.',
    ifcCoords: 'Coordinates', ifcCoordsAbs: 'absolute in the CRS', ifcCoordsLocal: 'local (with IfcMapConversion)',
    ifcCoordsNote: 'Absolute: easting, northing and height are written directly into the model. Local: small numbers, the position is in the georeference (IfcMapConversion).',
    ifcPanelTitle: 'IFC export', ifcExtent: 'Extent', ifcCrs: 'Coordinate reference',
    ifcTarget: 'CRS of the file', ifcTargetSame: 'same as terrain', ifcObjects: 'Include roads, excavations and blocks',
    ifcTargetNote: 'Points are converted and written as absolute coordinates.',
    ifcTargetApprox: 'Bessel system (DHDN/MGI): conversion accurate to about 1 to 2 m only, heights unchanged.',
    ifcExportAction: 'Export', cancel: 'Cancel', msgIfcExported: 'IFC file downloaded.',
    crs: 'CRS', accuracy: 'DTM grid', unit: 'Unit', unitMeter: 'Metre',
    hintClick: 'Left click', hintMeasure: 'Measure point', hintDrag: 'Left', hintDragX: ' drag',
    hintRotate: 'Orbit', hintPan: 'Right/middle', hintPanX: ' drag', hintPanDo: 'Pan',
    hintWheel: 'Wheel', hintZoom: 'Zoom', hintEsc: 'Esc', hintCancel: 'Cancel',
    measureOn: 'Measure point on', ground: 'terrain', building: 'building',
    font: 'Typeface', fontSize: 'Text size',
    accent: 'Accent colour', panelWidth: 'Panel width',
    language: 'Language',
    loading: 'Loading', reset: 'Reset',
    tCont: 'Containers', tContHint: 'From two rows the second lies crosswise',
    tTower: 'Tower crane', tTowerHint: 'Generic model, freely adjustable parameters',
    tMobile: 'Mobile crane', tMobileHint: 'Liebherr LTM',
    tRoad: 'Haul road', tRoadHint: 'Set points, right-click or space finishes',
    tPit: 'Excavation', tPitHint: 'Set corner points, right-click or space closes the polygon',
    fDepth: 'Depth below mean ground', fBottomAbs: 'Bottom level (m a.s.l.)', fPitAngle: 'Slope angle (90° = vertical)',
    pitFloor: 'Floor area', pitClamped: 'Pit too narrow: slope angle set to the minimum angle of',
    pitDrawing: 'Excavation: set corner points on the terrain', pitFinish: 'right-click or space closes the polygon, Esc cancels',
    msgMinThree: 'Set at least three points.', msgMaxPoints: 'More than 32 corner points are not possible.',
    pitCut: 'Excavation', pitFill: 'Fill', pitRef: 'Mean ground', pitBottom: 'Bottom', pitCreated: 'Excavation created:',
    fCols: 'Units side by side', fRows: 'Rows behind each other', fLevels: 'Storeys',
    fRot: 'Angle', fUnitL: 'Unit length', fUnitB: 'Unit width',
    fUnitH: 'Unit height', fModel: 'Crane type', fHook: 'Hook height',
    fRadius: 'Radius', fMast: 'Mast width', fJibRot: 'Jib angle',
    fBaseRot: 'Base angle', fVehRot: 'Carrier angle', fShowRadius: 'Show working radius',
    fWidth: 'Road width', fMinRadius: 'Minimum curve radius', fShowEdge: 'Show edges',
    axisSlopeTip: 'Longitudinal slope of this section in % (type a number, Enter)',
    axisLenTip: 'Length of this section in m along the axis (type a number, Enter). The end point and all following points move with it.',
    slopeVariable: 'variable',
    fSwept: 'Check swept path (semi-trailer)',
    sweptNeed: 'Semi-trailer 16.50 m needs {n} m when driving on the road centre (road {w} m).',
    sweptOk: 'It fits.', sweptOver: 'Does not fit: sticks out up to {o} m beyond the road edge.',
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
    nodeHint: 'Click a node, then pick its new position on the terrain.', nodePicked: 'Node selected. Click the new position.', nodeMoved: 'Node moved.', nodePickFirst: 'Select a node first.', nodeMinTwo: 'A haul road needs at least two nodes.', nodeMinThree: 'An excavation needs at least three corner points.', delNode: 'Delete node', addNode: 'Add node', nodeAddHint: 'Click a spot on the terrain: the node is inserted into the nearest segment.', nodeAdded: 'Node added.'
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
  if (typeof smRender === 'function') smRender();       // Beschriftung des Kastens der Startkarte (hängt vom gewählten Ort ab)
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
    { key: 'showEdge', label: 'fShowEdge',       type: 'checkbox' },
    { key: 'showSwept', label: 'fSwept',         type: 'checkbox' }
  ],
  pit: [
    // Tiefe zum MITTLEREN Gelände im Polygon (Standard -5 m); die Höhe der Unterkante
    // ist derselbe Wert in absoluten Metern und wird im Editor an das Gelände angepasst
    { key: 'depth',     label: 'fDepth',     type: 'range', min: -100, max: 10, step: 0.1, unit: 'm' },
    { key: 'bottomAbs', label: 'fBottomAbs', type: 'range', min: 0, max: 100, step: 0.1, unit: 'm', editorOnly: true },
    // Böschungswinkel der Wände (90° = senkrecht); das gezeichnete Polygon bleibt die Oberkante
    { key: 'angle',     label: 'fPitAngle',  type: 'range', min: 20, max: 90, step: 1, unit: '°' }
  ]
};

const TOOL_INFO = {
  container: { name: 'tCont',   hint: 'tContHint' },
  tower:     { name: 'tTower',  hint: 'tTowerHint' },
  mobile:    { name: 'tMobile', hint: 'tMobileHint' },
  road:      { name: 'tRoad',   hint: 'tRoadHint' },
  pit:       { name: 'tPit',    hint: 'tPitHint' },
  ifc:       { name: 'tIfc',    hint: 'tIfcHint' },  // keine Platzierung, startet die Rechteckauswahl
  ruler:     { name: 'tRuler',  hint: 'tRulerHint' } // keine Platzierung, startet das Messen
};


/* =========================================================
   Darstellung: Designs und Einstellungen
   ========================================================= */
/* Nur ein Design: dunkle Oberfläche auf hellem Szenenhintergrund (--scene), damit die dunkle Schrift unten links lesbar bleibt */
const THEMES = {
  dunkel: {
    vars: {
      '--bg': '#191c1f', '--scene': '#dde2e7',
      '--panel-bg': 'rgba(32, 36, 40, 0.85)',
      '--border': '#4a525a', '--border-strong': '#6a737c',
      '--text': '#eef1f4', '--text-dim': '#b4bcc4', '--text-dim2': '#8d97a1',
      '--accent': '#4da3d9', '--danger': '#e0655a',
      '--field': '#262b30', '--radius': '2px'
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
  width: 220,
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

  body.appendChild(selectRow(T('font'),
    Object.keys(FONTS).map(function (k) { return { value: k, label: FONTS[k].name }; }),
    SETTINGS.font, function (v) { SETTINGS.font = v; }));

  body.appendChild(sliderRow(T('fontSize'), 10, 16, 0.5, SETTINGS.size, ' px',
    function (v) { SETTINGS.size = v; }));

  body.appendChild(optionRow(T('accent'),
    ACCENTS.map(function (c) { return { value: c, label: '', color: c }; }),
    SETTINGS.accent, function (v) { SETTINGS.accent = v; }));

  body.appendChild(sliderRow(T('panelWidth'), 220, 400, 10, SETTINGS.width, ' px',
    function (v) { SETTINGS.width = v; }));
}

function setLanguage(code) {
  if (!STRINGS[code] || SETTINGS.language === code) { markLanguageButtons(); return; }
  SETTINGS.language = code;
  markLanguageButtons();
  refreshTexts();
  if (document.getElementById('tweak-panel').style.display === 'block') buildTweakPanel();
  if (document.getElementById('help-panel').style.display === 'block') buildHelpPanel();
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
  renderOsmUi();
  buildXyzCrsOptions();
  renderFpPanel();
  renderAddrUi();
  if (ifcPick) showIfcHint(ifcPick.step);
  const id = getSelectedId();
  if (id !== null) showObjectEditor(id);
  else if (activeTool) selectTool(activeTool);
  else selectTool(null);
}

/* ---------- Hilfe ---------- */
function buildHelpPanel() {
  const body = document.getElementById('help-body');
  body.innerHTML = '';
  for (let i = 1; i <= 7; i++) {
    const h = document.createElement('h3');
    h.textContent = T('helpS' + i + 'T');
    body.appendChild(h);
    const ul = document.createElement('ul');
    String(T('helpS' + i + 'B')).split('\n').forEach(function (line) {
      const li = document.createElement('li');
      li.textContent = line.replace(/^- /, '');
      ul.appendChild(li);
    });
    body.appendChild(ul);
  }
  const note = document.createElement('p');
  note.className = 'help-note';
  note.textContent = T('helpNote');
  body.appendChild(note);
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = T('helpGuideUrl'); a.target = '_blank'; a.rel = 'noopener noreferrer';
  a.textContent = T('helpGuide');
  p.appendChild(a);
  body.appendChild(p);
  const p2 = document.createElement('p');
  const a2 = document.createElement('a');
  a2.href = T('helpChangelogUrl'); a2.target = '_blank'; a2.rel = 'noopener noreferrer';
  a2.textContent = T('helpChangelog');
  p2.appendChild(a2);
  body.appendChild(p2);
}

function toggleHelp(force) {
  const p = document.getElementById('help-panel');
  const open = force !== undefined ? force : p.style.display !== 'block';
  p.style.display = open ? 'block' : 'none';
  if (open) { toggleTweak(false); buildHelpPanel(); }
}

function toggleTweak(force) {
  const p = document.getElementById('tweak-panel');
  const open = force !== undefined ? force : p.style.display !== 'block';
  p.style.display = open ? 'block' : 'none';
  if (open) { const hp = document.getElementById('help-panel'); if (hp) hp.style.display = 'none'; buildTweakPanel(); }
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
  if (rulerActive && type) stopRuler();
  clearRoadNodes();
  if (isDrawTool(activeTool) && type !== activeTool) { roadPoints = []; clearRoadPreview(); setRoadHint(false); }
  activeTool = type;
  selectObject(null);
  moveMode = false;
  addNodeMode = false;
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

function isAddNodeMode() { return addNodeMode; }

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
      if (key === 'angle') obj.params.angle = v;
      else obj.params.depth = key === 'bottomAbs' ? Math.round((v - ref) * 100) / 100 : v;
      rebuildObject(obj);
      renderOverview();
      document.getElementById('param-title').textContent = labelFor(obj.type, obj.params);
      document.getElementById('param-hint').textContent = pitHintText(obj);
      renderPitInfo(obj, earthEl);
      // zu schmale Grube: der Winkelregler springt auf den Mindestwinkel
      const shownAngle = pitAngleShown(obj.group.userData.pit);
      form.refs.angle.input.value = shownAngle;
      form.refs.angle.num.value = shownAngle;
      if (key === 'angle') return;
      const other = key === 'bottomAbs' ? form.refs.depth : form.refs.bottomAbs;
      const val = key === 'bottomAbs' ? obj.params.depth : obj.group.userData.pit.bottomAbs;
      other.input.value = val;
      other.num.value = Math.round(val * 100) / 100;
      return;
    }
    obj.params[key] = v;
    if (obj.type === 'road' && key === 'slope') obj.params.sectionSlopes = null;    // der Regler macht alle Abschnitte gleich
    if (key === 'model') applyModelDefaults(obj.params, form.refs, obj.type);
    rebuildObject(obj);
    renderOverview();
    document.getElementById('param-title').textContent = labelFor(obj.type, obj.params);
    if (obj.type === 'road') {
      markRoadRadius(obj, form.refs);
      markRoadSlope(obj, form.refs);
      document.getElementById('param-hint').textContent = roadHintText(obj);
      renderRoadEarth(obj, earthEl);
    }
  }, true);
  formRefs = form.refs;
  panel.appendChild(form.element);
  if (obj.type === 'road') { markRoadRadius(obj, form.refs); markRoadSlope(obj, form.refs); }

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
    const btnAdd = document.createElement('button');
    btnAdd.className = 'btn';
    btnAdd.textContent = T('addNode');
    btnAdd.addEventListener('click', function () {
      moveMode = false;
      addNodeMode = true;
      setStatus(obj.type === 'pit' && obj.params.points.length >= PIT_MAX_POINTS ? T('msgMaxPoints') : T('nodeAddHint'),
                obj.type === 'pit' && obj.params.points.length >= PIT_MAX_POINTS);
      if (obj.type === 'pit' && obj.params.points.length >= PIT_MAX_POINTS) addNodeMode = false;
    });
    actions.appendChild(btnAdd);

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
  return { depth: obj.params.depth, bottomAbs: Math.round(info.bottomAbs * 100) / 100, angle: pitAngleShown(info) };
}

/* Winkel für den Regler: ist die Grube zu schmal, der kleinste noch mögliche (ganze Grad) */
function pitAngleShown(info) {
  return info.clamped ? Math.min(PIT_ANGLE_MAX, Math.ceil(info.angleEff - 1e-9)) : info.angle;
}

/* Beide Regler überdecken dieselbe Spanne (Tiefe -100..+10 m um das mittlere Gelände) */
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
  note.textContent = T('pitBottom') + ' ' + info.bottomAbs.toFixed(2) + ' m ü. NHN' +
    (info.angle < 90 ? ' · ' + T('pitFloor') + ' ' + Math.round(info.floorArea) + ' m²' : '');
  el.appendChild(note);
  if (info.clamped) {
    const warn = document.createElement('div');
    warn.className = 'earth-note earth-warn';
    warn.textContent = T('pitClamped') + ' ' + pitAngleShown(info) + '°.';
    el.appendChild(warn);
  }
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

  const sw = obj.group.userData.swept;
  if (sw) {
    const n1 = document.createElement('div');
    n1.className = 'earth-note';
    n1.textContent = T('sweptNeed').replace('{n}', sw.need.toFixed(1)).replace('{w}', sw.width.toFixed(1));
    el.appendChild(n1);
    const n2 = document.createElement('div');
    n2.className = 'earth-note' + (sw.fits ? '' : ' earth-warn');
    n2.textContent = sw.fits ? T('sweptOk') : T('sweptOver').replace('{o}', sw.over.toFixed(1));
    el.appendChild(n2);
  }
}

/* Färbt den Radiusregler, sobald der Wunschradius nicht gehalten werden kann.
   Der Regler bleibt bedienbar, damit man ihn zurückdrehen kann. */
/* Längsneigung im Eigenschaftsfenster: haben die Abschnitte verschiedene Neigungen, steht "variabel" im Feld. Der Regler
   macht dann beim nächsten Verschieben alle Abschnitte wieder gleich. */
function markRoadSlope(obj, refs) {
  const ref = refs && refs.slope;
  if (!ref || !ref.num) return;
  const variable = roadSlopeVariable(obj.params);
  if (ref.num.dataset && ref.num.dataset.w === undefined) ref.num.dataset.w = ref.num.style.width || '';
  ref.num.placeholder = T('slopeVariable');
  if (variable) {
    ref.num.value = '';
    ref.num.style.width = '8ch';
    const list = roadSlopeList(obj.params);
    ref.input.value = Math.round(list.reduce(function (a, b) { return a + b; }, 0) / list.length * 10) / 10;
  } else {
    const v = roadSlopeList(obj.params)[0];
    ref.num.value = isFinite(v) ? v : ref.num.value;
    ref.input.value = ref.num.value;
    if (ref.num.dataset) ref.num.style.width = ref.num.dataset.w;
  }
  if (ref.row && ref.row.classList) ref.row.classList.toggle('field-variable', variable);
}

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
  return 'Mobilkran';
}

function buildGroups() {
  const map = {};
  const order = [];
  objects.forEach(function (o) {
    const k = groupKeyFor(o);
    if (!map[k]) { map[k] = { key: k, type: o.type, ids: [], units: 0, meters: 0, cut: 0, fill: 0 }; order.push(k); }
    map[k].ids.push(o.id);
    map[k].units += o.type === 'container' ? containerLayout(o.params).count : 1;
    if (o.type === 'road') map[k].meters += roadInfo(o.params).length;
    // Mengen stehen nach dem Neuaufbau in group.userData (Straße: earthworks, Grube: pit)
    const ud = o.group && o.group.userData ? o.group.userData : null;
    const q = ud ? (o.type === 'road' ? ud.earthworks : (o.type === 'pit' ? ud.pit : null)) : null;
    if (q) { map[k].cut += q.cut; map[k].fill += q.fill; }
  });
  return order.map(function (k) { return map[k]; });
}

function renderOverview() {
  const s = computeStats();
  document.getElementById('stat-objects').textContent = s.total;

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

      // Baustraße: Abtrag/Auftrag, Baugrube: Aushub/Aufschüttung als Unterzeile
      if (g.type === 'road' || g.type === 'pit') {
        const sub = document.createElement('div');
        sub.className = 'grp-sub';
        const l = document.createElement('span');
        l.textContent = T(g.type === 'road' ? 'cut' : 'pitCut') + ' ' + formatVolume(g.cut);
        const r = document.createElement('span');
        r.textContent = T(g.type === 'road' ? 'fill' : 'pitFill') + ' ' + formatVolume(g.fill);
        sub.appendChild(l); sub.appendChild(r);
        row.appendChild(sub);
      }

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

/* Dauerhinweis "wird verarbeitet" oben in der Mitte (gemeinsam mit den anderen Hinweisen), solange eine lange
   Arbeit läuft (große Gebäudemodelle, IFC). Der Browser muss die Meldung erst zeichnen dürfen, bevor die Arbeit
   den Hauptthread blockiert: yieldToPaint wartet ein Bild und eine Runde der Ereignisschleife ab. */
function showBusy(key) {
  const el = document.getElementById('busy-hint');
  if (!el) return;
  el.textContent = T(key);
  el.style.display = 'block';
}

function hideBusy() {
  const el = document.getElementById('busy-hint');
  if (el) el.style.display = 'none';
}

function yieldToPaint() {
  return new Promise(function (resolve) {
    requestAnimationFrame(function () { setTimeout(resolve, 0); });
  });
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
    renderOsmUi();
    smForced = false;
    showStartMap();
    return;
  }
  setNeedsData(false);
  renderOsmUi();
  smForced = false;                                    // ein neues Gelände ist da: zurück zur 3D-Ansicht
  showStartMap();
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

/* Längen der Strecken beim Zeichnen von Straße und Baugrube: ein kleines Schild je Strecke,
   waagerechte Länge mit zwei Nachkommastellen. Die Schilder liegen im Container #seg-labels und
   werden pro Bild neu an die Bildschirmstelle gesetzt (wie die Beschriftung am Messpunkt). */
let segLabelEls = [];

function updateSegLabels() {
  const box = document.getElementById('seg-labels');
  if (!box) return;
  const list = rulerActive ? rulerAllLabels() : roadPreviewLabels;
  const show = list.length && (rulerActive || isDrawTool(activeTool));
  const n = show ? list.length : 0;
  while (segLabelEls.length < n) {
    const d = document.createElement('div');
    d.className = 'seg-label';
    box.appendChild(d);
    segLabelEls.push(d);
  }
  if (n) camera.updateMatrixWorld();
  const v = new THREE.Vector3();
  segLabelEls.forEach(function (el, i) {
    if (i >= n) { if (el.style.display !== 'none') el.style.display = 'none'; return; }
    v.set(list[i].x, list[i].y, list[i].z).project(camera);
    if (v.z > 1) { el.style.display = 'none'; return; }
    const txt = list[i].text || (list[i].len.toFixed(2) + ' m');
    if (el.textContent !== txt) el.textContent = txt;
    el.className = 'seg-label' + (list[i].live ? ' live' : '');
    el.style.display = 'block';
    el.style.transform = 'translate(' + Math.round((v.x * 0.5 + 0.5) * window.innerWidth) + 'px, ' +
      Math.round((-v.y * 0.5 + 0.5) * window.innerHeight) + 'px) translate(-50%, -130%)';
  });
}

/* ---------- Achslinie: Neigung (oben) und Länge (unten) je Abschnitt ----------
   Jede fertige Straße zeigt ihre Mittellinie. Über der Linie steht die Längsneigung des Abschnitts in %, darunter
   seine Länge in m; beide sind Eingabefelder. Eine Neigung gilt nur für ihren Abschnitt; die Länge verschiebt den
   Endpunkt des Abschnitts (die folgenden Punkte rücken mit). Pro Bild an die Bildschirmstelle gesetzt. */
let axisEls = [];
const AXIS_MIN_PX = 260;       // ist der kürzeste Abschnitt einer Straße auf dem Bildschirm kürzer, blendet die Straße alle Felder aus (zu eng)

function axisSlopeText(v) { return String(Math.round(v * 100) / 100); }
function axisLenText(v) { return v.toFixed(2); }

function parseAxisNumber(text) {
  const v = parseFloat(String(text).replace(',', '.').replace(/[^0-9eE+\-.]/g, ''));
  return isFinite(v) ? v : null;
}

/* Feldbreite nach dem Text (plus Platz für die Ziffern am Rand), sonst verdeckt die letzte Stelle die Einheit */
function fitAxisInput(input) {
  input.style.width = (Math.max(3, String(input.value).length) + 1) + 'ch';
}

function makeAxisLabel(kind) {
  const wrap = document.createElement('div');
  wrap.className = 'axis-label ' + kind;
  const input = document.createElement('input');
  input.type = 'text';
  input.setAttribute('inputmode', 'decimal');
  input.title = T(kind === 'up' ? 'axisSlopeTip' : 'axisLenTip');
  const unit = document.createElement('span');
  unit.textContent = kind === 'up' ? '%' : 'm';
  wrap.appendChild(input);
  wrap.appendChild(unit);
  const entry = { wrap: wrap, input: input, kind: kind, ref: null };
  input.addEventListener('change', function () { applyAxisEdit(entry); });
  input.addEventListener('input', function () { fitAxisInput(input); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { if (input.blur) input.blur(); }
    else if (e.key === 'Escape') { entry.cancel = true; if (input.blur) input.blur(); }
  });
  input.addEventListener('focus', function () { if (input.select) input.select(); });
  return entry;
}

function applyAxisEdit(entry) {
  const ref = entry.ref;
  if (!ref) return;
  const obj = findObject(ref.objId);
  const part = obj && obj.group.userData.parts && obj.group.userData.parts[ref.index];
  if (entry.cancel) {                       // Esc: alten Wert wiederherstellen
    entry.cancel = false;
    if (part) { entry.input.value = entry.kind === 'up' ? axisSlopeText(part.slope) : axisLenText(part.len); fitAxisInput(entry.input); }
    return;
  }
  if (!obj || !part) return;
  const v = parseAxisNumber(entry.input.value);
  if (v === null) { entry.input.value = entry.kind === 'up' ? axisSlopeText(part.slope) : axisLenText(part.len); fitAxisInput(entry.input); return; }
  if (entry.kind === 'up') setRoadSectionSlope(obj, ref.index, v);
  else setRoadSectionLength(obj, ref.index, v);
  renderOverview();
  showObjectEditor(obj.id);                 // Eigenschaftsfenster zeigt die neuen Werte ("variabel")
}

function axisPartList() {
  const out = [];
  objects.forEach(function (o) {
    const parts = o.type === 'road' && o.group.userData.parts;
    if (parts) parts.forEach(function (pt, i) { out.push({ obj: o, part: pt, index: i }); });
  });
  return out;
}

function updateAxisLabels() {
  const box = document.getElementById('axis-labels');
  if (!box) return;
  const list = (rulerActive || isDrawTool(activeTool)) ? [] : axisPartList();
  const n = list.length;
  while (axisEls.length < n * 2) {
    const a = makeAxisLabel('up'), b = makeAxisLabel('down');
    box.appendChild(a.wrap); box.appendChild(b.wrap);
    axisEls.push(a, b);
  }
  if (n) camera.updateMatrixWorld();
  const v = new THREE.Vector3();
  const focal = (window.innerHeight || 768) / 2 / Math.tan(camera.fov * Math.PI / 360);
  // Pro Straße gemeinsam: ist der kürzeste Abschnitt zu kurz, verschwinden alle Felder der Straße zugleich
  const minPx = {};
  list.forEach(function (it) {
    v.set(it.part.x, it.part.y, it.part.z);
    const d = camera.position.distanceTo(v);
    const px = d > 0 ? it.part.len * focal / d : 0;
    if (minPx[it.obj.id] === undefined || px < minPx[it.obj.id]) minPx[it.obj.id] = px;
  });
  axisEls.forEach(function (e, k) {
    const item = list[k >> 1];
    if (!item) { if (e.wrap.style.display !== 'none') e.wrap.style.display = 'none'; e.ref = null; return; }
    const pt = item.part;
    v.set(pt.x, pt.y, pt.z);
    v.project(camera);
    if (v.z > 1 || minPx[item.obj.id] < AXIS_MIN_PX) {
      if (e.wrap.style.display !== 'none') e.wrap.style.display = 'none';
      return;
    }
    e.ref = { objId: item.obj.id, index: item.index };
    const txt = e.kind === 'up' ? axisSlopeText(pt.slope) : axisLenText(pt.len);
    if (e.input !== document.activeElement && e.input.value !== txt) { e.input.value = txt; fitAxisInput(e.input); }
    e.wrap.style.display = 'block';
    e.wrap.style.transform = 'translate(' + Math.round((v.x * 0.5 + 0.5) * window.innerWidth) + 'px, ' +
      Math.round((-v.y * 0.5 + 0.5) * window.innerHeight) + 'px) translate(-50%, ' + (e.kind === 'up' ? '-110%' : '10%') + ')';
  });
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

/* ---------- Messen ----------
   Werkzeug "Messen" in der Leiste: Punkte auf Gelände oder Gebäuden anklicken, es entsteht ein Linienzug. An jeder
   Strecke steht die waagerechte Länge und der Höhenunterschied (zwei Nachkommastellen); das Fenster darunter zeigt
   Gesamtlängen (waagerecht und im Raum), Höhenunterschied, Gefälle und die Höhen von Start und Ende.
   Rechtsklick oder Leertaste beendet die Messung, ein weiterer Klick beginnt eine neue, Rücktaste nimmt den letzten
   Punkt zurück, Esc beendet das Werkzeug. */
let rulerActive = false, rulerDone = false;
let rulerPts = [], rulerHover = null, rulerGroup = null, rulerStaticLabels = [], rulerHoverLabel = null, rulerMarkers = [];
let rulerHoverMesh = null, rulerHoverMarker = null, rulerRefineTimer = null;

function rulerFmt(v) { return v.toFixed(2); }
function rulerSigned(v) { return (v >= 0.005 ? '+' : (v <= -0.005 ? '−' : '')) + rulerFmt(Math.abs(v)); }

/* Alle Streckenschilder: die festen und, solange gemessen wird, das zur Maus */
function rulerAllLabels() { return rulerHoverLabel ? rulerStaticLabels.concat([rulerHoverLabel]) : rulerStaticLabels; }

function markRulerCard() {
  const cards = document.getElementById('palette').children;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].classList && cards[i].dataset && cards[i].dataset.tool === 'ruler') cards[i].classList.toggle('active', rulerActive);
  }
}

function setRulerHint() {
  const el = document.getElementById('ruler-hint');
  if (!el) return;
  if (!rulerActive) { el.style.display = 'none'; return; }
  el.textContent = T(rulerDone ? 'rulerDone' : (rulerPts.length ? 'rulerHint1' : 'rulerHint0'));
  el.style.display = 'block';
}

function clearRulerDrawing() {
  if (rulerGroup) { scene.remove(rulerGroup); disposeGroup(rulerGroup); rulerGroup = null; }
  rulerMarkers = [];
  rulerStaticLabels = [];
  rulerHoverLabel = null;
  if (rulerHoverMesh) rulerHoverMesh.visible = false;
  if (rulerHoverMarker) rulerHoverMarker.visible = false;
}

function rulerRenderPanel() {
  const panel = document.getElementById('ruler-panel');
  if (!panel) return;
  const st = rulerStats(rulerPts);
  panel.style.display = rulerActive && st.n >= 2 ? 'block' : 'none';
  if (st.n < 2) return;
  const set = function (id, txt) { document.getElementById(id).textContent = txt; };
  set('ruler-n', String(st.n));
  set('ruler-h', rulerFmt(st.horizontal) + ' m');
  set('ruler-s', rulerFmt(st.slant) + ' m');
  set('ruler-dz', rulerSigned(st.dz) + ' m');
  set('ruler-slope', st.slopePct === null ? '–' : rulerSigned(st.slopePct) + ' %');
  set('ruler-z0', rulerFmt(st.zStart) + ' m');
  set('ruler-z1', rulerFmt(st.zEnd) + ' m');
}

function rulerLabelFor(p, q, live) {
  const h = Math.hypot(q.x - p.x, q.z - p.z);
  return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 + 0.12, z: (p.z + q.z) / 2,
           text: rulerFmt(h) + ' m · Δ ' + rulerSigned(q.y - p.y) + ' m', live: live };
}

function rulerMarker() {
  const m = new THREE.Mesh(GEO.sphere, MAT.measure);
  m.renderOrder = 10;
  return m;
}

/* Baut die festen Teile neu (nur bei Klick, Rücktaste, Neustart): Linienzug, Punkte, Schilder, Fenster */
function drawRuler() {
  clearRulerDrawing();
  if (rulerPts.length) {
    const g = new THREE.Group();
    if (rulerPts.length >= 2) {
      g.add(thickLine(rulerPts.map(function (p) { return new THREE.Vector3(p.x, p.y + 0.12, p.z); }), 0.5, MAT.drawPreview, false));
    }
    rulerPts.forEach(function (p) {
      const m = rulerMarker();
      m.position.set(p.x, p.y + 0.12, p.z);
      g.add(m);
      rulerMarkers.push(m);
    });
    scene.add(g);
    rulerGroup = g;
    for (let i = 1; i < rulerPts.length; i++) rulerStaticLabels.push(rulerLabelFor(rulerPts[i - 1], rulerPts[i], false));
  }
  updateRulerHover();
  updateRulerScale();
  rulerRenderPanel();
  setRulerHint();
}

/* Die Vorschau zur Maus: ein einziges Stück Linie und ein Punkt, die nur verschoben werden (keine neuen Objekte pro
   Mausbewegung), dazu das Schild. Sonst ruckelte die Messung. */
function updateRulerHover() {
  const show = rulerActive && !rulerDone && rulerHover && rulerPts.length;
  if (!show) {
    rulerHoverLabel = null;
    if (rulerHoverMesh) rulerHoverMesh.visible = false;
    if (rulerHoverMarker) rulerHoverMarker.visible = false;
    return;
  }
  if (!rulerHoverMesh) {
    rulerHoverMesh = new THREE.Mesh(GEO.box, MAT.drawPreview);
    rulerHoverMesh.renderOrder = 9;
    scene.add(rulerHoverMesh);
    rulerHoverMarker = rulerMarker();
    scene.add(rulerHoverMarker);
  }
  const a = rulerPts[rulerPts.length - 1], b = rulerHover;
  const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
  const flat = Math.sqrt(dx * dx + dz * dz), len = Math.sqrt(flat * flat + dy * dy);
  const m = rulerHoverMesh;
  m.visible = len > 1e-6;
  m.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.12, (a.z + b.z) / 2);
  m.rotation.order = 'YZX';
  m.rotation.y = -Math.atan2(dz, dx);
  m.rotation.z = Math.atan2(dy, flat);
  m.scale.set(len, 0.2, 0.5);
  rulerHoverMarker.visible = true;
  rulerHoverMarker.position.set(b.x, b.y + 0.12, b.z);
  rulerHoverLabel = rulerLabelFor(a, b, true);
}

/* Hält die Punkte unabhängig vom Zoom gleich groß; pro Bild aufgerufen */
function updateRulerScale() {
  const list = rulerMarkers.concat(rulerHoverMarker && rulerHoverMarker.visible ? [rulerHoverMarker] : []);
  if (!list.length) return;
  const fov = camera.fov * Math.PI / 180;
  list.forEach(function (m) {
    const d = camera.position.distanceTo(m.position);
    const r = (d * Math.tan(fov / 2) * 2 / window.innerHeight) * (MEASURE_PIXELS / 2);
    m.scale.set(r, r, r);
  });
}

function startRuler() {
  if (!hasTerrain()) { setStatus(T('msgNeedTerrain'), true); return; }
  if (rectSelectActive) cancelRectExport();
  clearExportPreview();
  if (ifcPick) cancelIfcPick(true);
  selectTool(null);
  hideMeasure();
  rulerActive = true; rulerDone = false; rulerPts = []; rulerHover = null;
  markRulerCard();
  drawRuler();
}

function stopRuler() {
  if (rulerRefineTimer) { clearTimeout(rulerRefineTimer); rulerRefineTimer = null; }
  rulerActive = false; rulerDone = false; rulerPts = []; rulerHover = null;
  clearRulerDrawing();
  markRulerCard();
  rulerRenderPanel();
  setRulerHint();
}

function finishRuler() {
  if (!rulerActive || rulerDone) return;
  if (rulerPts.length < 2) { rulerPts = []; rulerHover = null; drawRuler(); return; }
  rulerDone = true;
  rulerHover = null;
  drawRuler();
}

function newRuler() {
  rulerPts = []; rulerHover = null; rulerDone = false;
  drawRuler();
}

function rulerClick(event) {
  if (rulerDone) newRuler();
  const g = raycastGround(event);
  if (!g) return;
  rulerPts.push({ x: g.point.x, y: g.point.y, z: g.point.z });
  rulerHover = null;
  drawRuler();
}

function rulerRemoveLast() {
  if (!rulerActive) return;
  if (rulerDone) rulerDone = false;
  rulerPts.pop();
  rulerHover = null;
  drawRuler();
}

/* Vorschau zur Maus. Bei jeder Bewegung sofort mit dem Geländepunkt, den onCanvasMove ohnehin schon berechnet hat
   (billig, glatt); steht die Maus kurz still, wird der Punkt mit Gebäuden genau nachgezogen. Der teure Strahl über das
   Gebäudemodell läuft so nie bei jeder Bewegung. */
function rulerMove(event, terrainPt) {
  if (!rulerActive || rulerDone || !rulerPts.length) return;
  rulerHover = terrainPt ? { x: terrainPt.x, y: terrainPt.y, z: terrainPt.z } : null;
  updateRulerHover();
  if (rulerRefineTimer) clearTimeout(rulerRefineTimer);
  rulerRefineTimer = setTimeout(function () {
    rulerRefineTimer = null;
    if (!rulerActive || rulerDone) return;
    const g = raycastGround(event);
    rulerHover = g ? { x: g.point.x, y: g.point.y, z: g.point.z } : rulerHover;
    updateRulerHover();
  }, 120);
}

/* ---------- Dateiimport ---------- */
function setFileStatus(which, msg, kind) {
  const el = document.getElementById(which === 'dem' ? 'dem-status' : 'gml-status');
  el.textContent = msg;
  el.className = 'file-status' + (kind ? ' ' + kind : '');
  // Geladen: der Abschnitt klappt zu (die Statuszeile bleibt). Hat ein Gebäudesatz 2D-Einstellungen, bleibt er offen. Fehler, Laden und leer: offen.
  setFileRowCollapsed(which === 'dem' ? 'row-dem' : 'row-gml', kind === 'ok' && !(which === 'gml' && typeof lastFootprints !== 'undefined' && lastFootprints));
  if (which === 'dem') updateXyzCrsRow();
}

/* Abschnitt im Datenfenster ein- oder ausklappen (className statt classList, damit es auch ohne echtes DOM geht) */
function setFileRowCollapsed(rowId, on) {
  const row = document.getElementById(rowId);
  if (!row) return;
  const rest = String(row.className || '').split(/\s+/).filter(function (c) { return c && c !== 'collapsed'; });
  row.className = rest.concat(on ? ['collapsed'] : []).join(' ');
  const head = row.children && row.children[0] && row.children[0].children ? row.children[0].children[0] : null;
  if (head && head.setAttribute) head.setAttribute('aria-expanded', on ? 'false' : 'true');
}

function toggleFileRow(rowId) {
  const row = document.getElementById(rowId);
  setFileRowCollapsed(rowId, !(row && /(^|\s)collapsed(\s|$)/.test(String(row.className || ''))));
}

/* Die Auswahl des Bezugssystems für XYZ und LAS erscheint nur, wenn sie gebraucht wird: eine Datei wartet darauf oder die geladene hatte keines */
function updateXyzCrsRow() {
  const row = document.getElementById('xyz-crs-row');
  if (row) row.style.display = (pendingDemFiles || lastXyzLoad) ? 'flex' : 'none';
}

/* ---------- Karte (OpenStreetMap) ----------
   Schalter im Datenfenster. Der Status-Text wird aus (Schlüssel, Werte) neu gebaut,
   damit ein Sprachwechsel ihn mitnimmt. */
let osmStatus = { key: 'osmNote', cls: '', vars: null };

function setOsmStatus(key, cls, vars) {
  osmStatus = { key: key, cls: cls || '', vars: vars || null };
  renderOsmUi();
}

function renderOsmUi() {
  const tg = document.getElementById('osm-toggle');
  const st = document.getElementById('osm-status');
  const at = document.getElementById('osm-attribution');
  if (!tg || !st) return;
  tg.disabled = !TERRAIN;
  if (!TERRAIN && tg.checked) tg.checked = false;
  let txt = T(osmStatus.key);
  if (osmStatus.vars) Object.keys(osmStatus.vars).forEach(function (k) { txt = txt.replace('{' + k + '}', osmStatus.vars[k]); });
  st.textContent = txt;
  st.className = 'file-status' + (osmStatus.cls ? ' ' + osmStatus.cls : '');
  if (at) at.style.display = tg.checked ? 'block' : 'none';
  const btn = document.getElementById('osm-btn');
  if (btn && btn.classList) btn.classList.toggle('on', !!tg.checked);
}

/* Fenster am Kartenknopf auf/zu (Klick auf den Knopf, Klick daneben oder Esc schließt es) */
function toggleOsmCard(open) {
  const card = document.getElementById('osm-card'), btn = document.getElementById('osm-btn');
  if (!card) return;
  const want = open === undefined ? !card.classList.contains('open') : !!open;
  card.classList.toggle('open', want);
  btn.setAttribute('aria-expanded', want ? 'true' : 'false');
}

async function onOsmToggle() {
  const tg = document.getElementById('osm-toggle');
  const on = tg.checked;
  if (!on) { await setOsmMap(false); setOsmStatus('osmNote'); return; }
  setOsmStatus('osmLoading', 'busy');
  try {
    const r = await setOsmMap(true);
    if (r.stale) return;
    if (r.failed) setOsmStatus('osmPartial', 'ok', { m: r.failed, n: r.tiles + r.failed });
    else setOsmStatus('osmLoaded', 'ok', { n: r.tiles });
  } catch (e) {
    tg.checked = false;
    if (e.code === 'noCrs') setOsmStatus('osmNoCrs', 'err', { c: (TERRAIN && TERRAIN.epsg) ? 'EPSG:' + TERRAIN.epsg : '' });
    else if (e.code === 'noTerrain') setOsmStatus('osmNoTerrain', 'err');
    else setOsmStatus('osmNoTiles', 'err');
  }
}

/* Meldungen aus der LAS-Verarbeitung sind Schlüssel (lasBad ...) und werden hier in den Text übersetzt */
function lasErrText(e) {
  const m = e && e.message ? e.message : String(e);
  return /^las[A-Z][A-Za-z]+$/.test(m) ? T(m) : m;
}

function demStatusText(t) {
  let st = lastDemNames.length > 1
    ? lastDemNames.length + ' Kacheln verbunden'
    : (lastDemNames[0] || '');
  if (lastDemTiles && lastDemTiles.some(function (x) { return x.windowed; })) st += ' · ' + T('demWindow');
  const pc = lastDemTiles && lastDemTiles.filter(function (x) { return x.pointCloud; })[0];
  if (pc) st += ' · ' + T(pc.pointCloud.classified ? 'lasInfo' : 'lasInfoRaw').replace('{n}', (pc.pointCloud.points / 1e6 >= 1 ? (pc.pointCloud.points / 1e6).toFixed(1) + ' Mio.' : String(pc.pointCloud.points))).replace('{c}', String(pc.pointCloud.cell).replace('.', ','));
  st += ' · ' + t.nx + '×' + t.nz;
  if (t.gaps) st += ' · ' + t.gaps + ' Lücken gefüllt';
  return st;
}

/* ---------- Startkarte ----------
   Solange kein Gelände geladen ist, zeigt die Seite eine OSM-Karte: Ort suchen oder anklicken (Pin). Das Fenster am Pin
   nennt die Links zu Gelände- und Gebäudedaten des Landes (der Klick wählt den Ort wie eine Adresse). Die Kacheln laden
   erst nach dem Klick "Karte laden".
   Bedienung: Ziehen mit der linken, mittleren oder rechten Taste verschiebt die Karte, das Mausrad zoomt stufenlos. Beim Zoomen bleiben die Kacheln der alten Stufe stehen (skaliert), bis die neuen geladen
   sind - sonst blitzt die leere Fläche auf. */
let smConsent = false, smVisible = false;
let smView = { lon: 10.5, lat: 50.6, z: 6 };
let smPoint = null, smDrag = null;
let smForced = false;                              // Karte wieder geöffnet, obwohl ein Gelände geladen ist (Ort außerhalb gewählt)
let smAnim = null, smAnimBusy = false, smRenderBusy = false;
let smPopOpen = false, smPopKey = '', smCutOpen = false;              // Fenster am Pin mit den Links
let smSettleAt = 0, smSettleTimer = null;       // seit wann alle Kacheln der Ansicht geladen sind
const SM_FADE_MS = 180;                          // Dauer des Einblendens (CSS .18s)
const smImgs = {};

function smEl(id) { return document.getElementById(id); }

function smSize() {
  const el = smEl('sm-tiles');
  return { w: el.clientWidth || window.innerWidth || 1024, h: el.clientHeight || window.innerHeight || 768 };
}

function smOrigin() {
  const el = smEl('sm-tiles'), r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
  return { left: (r && r.left) || 0, top: (r && r.top) || 0 };
}

function smToScreen(lon, lat) {
  const s = smSize(), c = smWorldPx(smView.lon, smView.lat, smView.z), p = smWorldPx(lon, lat, smView.z);
  return { x: p.x - c.x + s.w / 2, y: p.y - c.y + s.h / 2 };
}

function smFromClient(cx, cy) {
  const s = smSize(), o = smOrigin(), c = smWorldPx(smView.lon, smView.lat, smView.z);
  return smLonLat(c.x + (cx - o.left) - s.w / 2, c.y + (cy - o.top) - s.h / 2, smView.z);
}

function smClampView() {
  smView.lat = Math.max(-80, Math.min(80, smView.lat));
  smView.z = Math.max(SM_MIN_ZOOM, Math.min(SM_MAX_ZOOM, smView.z));
  smView.lon = ((smView.lon + 540) % 360) - 180;
}

function smDropImg(key) {
  const im = smImgs[key];
  delete smImgs[key];
  if (im && im.parentNode && im.parentNode.removeChild) im.parentNode.removeChild(im);
  else if (im && im.remove) im.remove();
}

function smLoaded(im) { return !!im && im.complete === true && im.naturalWidth > 0; }

/* Mehrere Änderungen in einem Bild zusammenfassen (Kachel geladen, Mausbewegung) */
function smSchedule() {
  if (smRenderBusy) return;
  smRenderBusy = true;
  requestAnimationFrame(function () { smRenderBusy = false; smRender(); });
}

function smRender() {
  const consent = smEl('sm-consent'), tools = smEl('sm-tools'), attrib = smEl('sm-attrib');
  consent.style.display = smVisible && !smConsent ? 'block' : 'none';
  // Wurde schon ein Ort gewählt (Adresse eingetippt), nennt der Kasten ihn: ein Klick bringt direkt dorthin
  const where = smVisible && !smConsent && smPoint && addrPlace && addrPlace.main
    ? addrPlace.main + (addrPlace.sub && !addrPlace.coord ? ', ' + addrPlace.sub : '') : '';
  const pl = smEl('sm-consent-place');
  pl.style.display = where ? 'block' : 'none';
  pl.textContent = where ? T('smConsentPlace').replace('{p}', where) : '';
  smEl('sm-load').textContent = T(where ? 'smLoadAt' : 'smLoad');
  const backOn = smVisible && smForced && !!TERRAIN;
  tools.style.display = smVisible && (smConsent || backOn) ? 'flex' : 'none';
  smEl('sm-back').style.display = backOn ? 'block' : 'none';
  smEl('sm-zoom').style.display = smConsent ? 'flex' : 'none';
  attrib.style.display = smVisible && smConsent ? 'block' : 'none';
  const box = smEl('sm-tiles');
  if (!smVisible || !smConsent) {
    Object.keys(smImgs).forEach(function (k) { smDropImg(k); });
    smEl('sm-marker').style.display = 'none';
    smEl('sm-pop').style.display = 'none';
    return;
  }
  const s = smSize(), list = smTileList(smView, s.w, s.h, 120), cur = {};
  let allLoaded = true;
  // Unterlage: eine viel gröbere Stufe (nur wenige Kacheln). Sie füllt beim Herauszoomen und Verschieben die Flächen, für die
  // die feinen Kacheln noch fehlen, mit einem unscharfen Kartenbild - statt hellem Hintergrund, der beim Einblenden aufblitzt.
  const base = [];
  if (list.length) {
    // zwei Unterlagen (3 und 6 Stufen gröber): auch bei schnellem Herauszoomen um mehrere Stufen bleibt das Bild gefüllt
    [list[0].z - 6, list[0].z - 3].forEach(function (lv, i, arr) {
      const l = Math.max(SM_MIN_ZOOM, lv);
      if (l < list[0].z && (i === 0 ? l !== Math.max(SM_MIN_ZOOM, arr[1]) : true)) smTileList(smView, s.w, s.h, 40, l).forEach(function (t) { base.push(t); });
    });
  }
  base.concat(list).forEach(function (t) {
    const fine = t.z === (list.length ? list[0].z : -1);
    const key = t.z + '/' + t.tx + '/' + t.y;
    cur[key] = true;
    let im = smImgs[key];
    if (!im) {
      im = document.createElement('img');
      im.alt = '';
      im.draggable = false;
      im.style.opacity = '0';                           // erst zeigen, wenn geladen: kein Bruchbild, kein Aufblitzen
      im.style.zIndex = String(t.z);                    // feinere Stufe liegt über der gröberen
      im.src = OSM_TILE_URL.replace('{z}', t.z).replace('{x}', t.x).replace('{y}', t.y);
      im.addEventListener('load', function () { im.style.opacity = '1'; smSchedule(); });
      // Schlägt das Laden fehl (Netz weg), verschwindet das Bild; beim nächsten Verschieben oder Zoomen wird es neu angefragt
      im.addEventListener('error', function () { if (smImgs[key] === im) smDropImg(key); });
      im._t = { z: t.z, tx: t.tx, y: t.y };
      box.appendChild(im);
      smImgs[key] = im;
    }
    if (fine && !smLoaded(im)) allLoaded = false;        // die Unterlage zählt nicht mit
  });
  // Die alten Kacheln erst entfernen, wenn die neuen ganz eingeblendet sind: sonst scheint für einen Augenblick
  // der helle Hintergrund durch (Aufblitzen beim Zoomen)
  const now = Date.now();
  if (!allLoaded) smSettleAt = 0;
  else if (!smSettleAt) smSettleAt = now;
  const settled = allLoaded && now - smSettleAt >= SM_FADE_MS + 40;
  if (allLoaded && !settled && !smSettleTimer) {
    smSettleTimer = setTimeout(function () { smSettleTimer = null; smRender(); }, SM_FADE_MS + 60);
  }
  // Alle Kacheln der Ansicht (auch die alten Stufen, solange sie gebraucht werden) an ihre Stelle setzen
  Object.keys(smImgs).forEach(function (k) {
    const im = smImgs[k], t = im._t;
    if (!cur[k] && settled) { smDropImg(k); return; }        // neue Stufe fertig und eingeblendet: alte Kacheln weg
    const sc = Math.pow(2, smView.z - t.z), c = smWorldPx(smView.lon, smView.lat, t.z);
    const left = (t.tx * SM_TILE - c.x) * sc + s.w / 2, top = (t.y * SM_TILE - c.y) * sc + s.h / 2;
    if (!cur[k] && (left > s.w || top > s.h || left + SM_TILE * sc < 0 || top + SM_TILE * sc < 0 || sc > 70 || Object.keys(smImgs).length > 260)) {
      smDropImg(k);                                          // alte Kachel außerhalb des Fensters oder viel zu stark vergrößert
      return;
    }
    // Rundung der Größe nach oben: kein feiner Spalt zwischen den Kacheln
    im.style.transform = 'translate(' + left.toFixed(2) + 'px,' + top.toFixed(2) + 'px) scale(' + sc.toFixed(5) + ')';
  });
  const mk = smEl('sm-marker');
  if (smPoint) {
    const p = smToScreen(smPoint.lon, smPoint.lat);
    mk.style.display = 'block'; mk.style.left = p.x + 'px'; mk.style.top = p.y + 'px';
  } else mk.style.display = 'none';
  smRenderPop();
}

/* Die Karte steht, solange kein Gelände geladen ist (außer mit ?demo=1, dort lädt gleich das Beispiel), und auf Wunsch (smForced)
   über einem geladenen Gelände: Wer einen Ort außerhalb wählt, kommt so zu einer anderen Stadt. */
/* Liegt der Ort (Breite/Länge) im geladenen Gelände? Bei einem Bezugssystem, das die Anwendung nicht kennt: nein. */
function placeInsideTerrain(lat, lon) {
  const t = typeof TERRAIN !== 'undefined' ? TERRAIN : null;
  const def = t && crsGeoDefinition(t.epsg);
  if (!t || !def || def.merc) return false;
  const p = lonLatToCrs(def, lat, lon);
  return Math.abs(p.e - t.originE) <= t.w / 2 && Math.abs(p.n - t.originN) <= t.d / 2;
}

function smShouldShow() { return smForced || (!TERRAIN && !demoRequested()); }

function showStartMap() {
  const want = smShouldShow();
  smVisible = want;
  smEl('startmap').style.display = want ? 'block' : 'none';
  smRender();
}

function smFlyTo(lat, lon, z) {
  smAnim = null;
  smView = { lon: lon, lat: lat, z: z };
  smClampView();
  smPoint = { lon: lon, lat: lat };
  smPopOpen = true;
  smRender();
}

/* Zoomstufe z setzen, der Punkt `anchor` (Breite/Länge) bleibt an der Bildschirmstelle (px, py) */
function smSetZoom(z, anchor, px, py) {
  const s = smSize();
  const p = smWorldPx(anchor.lon, anchor.lat, z);
  const c = smLonLat(p.x - (px - s.w / 2), p.y - (py - s.h / 2), z);
  smView = { lon: c.lon, lat: c.lat, z: z };
  smClampView();
}

/* Ein Schritt der Zoomfahrt; liefert true, solange sie läuft */
function smAnimStep() {
  const a = smAnim;
  if (!a) return false;
  const dz = a.target - smView.z;
  const z = Math.abs(dz) < 0.01 ? a.target : smView.z + dz * 0.25;
  smSetZoom(z, a.anchor, a.px, a.py);
  smRender();
  if (z === a.target) { smAnim = null; return false; }
  return true;
}

function smAnimLoop() {
  smAnimBusy = false;
  if (smAnimStep() && !smAnimBusy) { smAnimBusy = true; requestAnimationFrame(smAnimLoop); }
}

/* Ziel der Zoomfahrt um dz Stufen verschieben; (cx, cy) in Fensterkoordinaten, ohne Angabe die Mitte */
function smZoomBy(dz, cx, cy) {
  const s = smSize(), o = smOrigin();
  const px = cx === undefined ? s.w / 2 : cx - o.left, py = cy === undefined ? s.h / 2 : cy - o.top;
  const base = smAnim ? smAnim.target : smView.z;
  const target = Math.max(SM_MIN_ZOOM, Math.min(SM_MAX_ZOOM, base + dz));
  if (Math.abs(target - smView.z) < 1e-6 && !smAnim) return;
  smAnim = { target: target, px: px, py: py,
             anchor: cx === undefined ? { lon: smView.lon, lat: smView.lat } : smFromClient(cx, cy) };
  if (!smAnimBusy) { smAnimBusy = true; requestAnimationFrame(smAnimLoop); }
}

/* Zoomfahrt sofort beenden (Tests, oder wenn der Nutzer zieht) */
function smFinishZoom() {
  let guard = 0;
  while (smAnim && guard++ < 200) smAnimStep();
}

/* Fenster am Pin: Ort, Koordinaten und die Links zu Gelände- und Gebäudedaten des Landes (dasselbe wie in der Adressleiste).
   Es hängt am Pin und folgt ihm beim Verschieben und Zoomen. */
function smAnchor() {
  return smPoint ? { lon: smPoint.lon, lat: smPoint.lat } : null;
}

/* Österreich: Die BEV-Raster sind riesig (Datei über 1 GB geht nicht in den Browser). Das Fenster nennt den fertigen Befehl zum
   Zuschneiden des Ausschnitts um den Pin, mit Knopf zum Kopieren. */
function smAddCutBlock(body, a) {
  if (String(addrPlace.country || '').toUpperCase() !== 'AT' || addrPlace.pending) return;
  const win = smCutWindow(a, SM_CUT_SIZE);
  const cmd = gdalCutCommand(win);
  const box = document.createElement('div');
  box.className = 'sm-cut';
  const big = document.createElement('div');
  big.className = 'sm-line';
  big.textContent = T('smBigHint');
  box.appendChild(big);
  const toggle = document.createElement('button');                  // zugeklappt: das ist etwas für Fortgeschrittene
  toggle.className = 'sm-cut-toggle';
  toggle.textContent = (smCutOpen ? '▾ ' : '▸ ') + T('smCutToggle');
  box.appendChild(toggle);
  const inner = document.createElement('div');
  inner.className = 'sm-cut-body';
  inner.style.display = smCutOpen ? 'block' : 'none';
  toggle.addEventListener('click', function () {
    smCutOpen = !smCutOpen;
    inner.style.display = smCutOpen ? 'block' : 'none';
    toggle.textContent = (smCutOpen ? '▾ ' : '▸ ') + T('smCutToggle');
  });
  box.appendChild(inner);
  const t = document.createElement('div');
  t.className = 'sm-line sm-dim';
  t.textContent = T('smCutTitle') + ' ' + T('smCutAround').replace(/\{s\}/g, String(SM_CUT_SIZE));
  inner.appendChild(t);
  const code = document.createElement('code');
  code.className = 'sm-code';
  code.textContent = cmd;
  inner.appendChild(code);
  const btn = document.createElement('button');
  btn.className = 'btn-block sm-copy';
  btn.textContent = T('smCutCopy');
  btn.addEventListener('click', function () {
    const done = function () { btn.textContent = T('smCutDone'); };
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(cmd).then(done, function () {});
    else done();
  });
  inner.appendChild(btn);
  body.appendChild(box);
}

function smRenderPop() {
  const pop = smEl('sm-pop');
  const a = smAnchor();
  if (!smVisible || !smConsent || !smPopOpen || !a || !addrPlace) { pop.style.display = 'none'; smPopKey = ''; return; }
  const s = smSize(), p = smToScreen(a.lon, a.lat);
  if (p.x < -20 || p.y < -20 || p.x > s.w + 20 || p.y > s.h + 20) { pop.style.display = 'none'; return; }
  const key = [addrPlace.main, addrPlace.sub, addrPlace.pending, addrPlace.failed, addrPlace.country, addrPlace.state, a.lon.toFixed(6), a.lat.toFixed(6)].join('|');
  const body = smEl('sm-pop-body');
  if (key !== smPopKey) {                               // nur neu aufbauen, wenn sich Ort oder Daten ändern (nicht bei jedem Verschieben)
    smPopKey = key;
    renderPlaceInto(body, addrPlace);
    const zone = Math.floor((a.lon + 180) / 6) + 1, def = crsGeoDefinition(25800 + zone);
    if (def) {
      const q = transverseMercatorForward(a.lat, a.lon, def);
      const d = document.createElement('div');
      d.className = 'sm-line sm-dim';
      d.textContent = T('smUtmPoint').replace('{c}', 25800 + zone).replace('{e}', Math.round(q.e)).replace('{n}', Math.round(q.n));
      d.style.marginTop = '6px';
      body.appendChild(d);
    }
    const hint = document.createElement('div');
    hint.className = 'sm-line sm-dim';
    hint.textContent = T('smPopHint');
    body.appendChild(hint);
    smAddCutBlock(body, a);
  }
  pop.style.display = 'block';
  const bottomLimit = s.h - 160;                        // darunter liegen Werkzeugleiste, Knöpfe und die Quellenangabe
  const sc = smEl('sm-pop-scroll');
  sc.style.maxHeight = Math.max(120, bottomLimit - 10 - 34) + 'px';       // zu hoch (mehrere Quellen): im Fenster scrollen
  const w = pop.offsetWidth || 300, h = Math.min(pop.offsetHeight || 170, bottomLimit - 10);
  const gap = 36;                                       // der Pin ist 27 px hoch
  const belowGap = 14;
  const minLeft = s.w > 900 ? 350 : 14;                 // nicht unter das linke Fenster schieben
  const above = p.y - gap - h > 10;
  const below = !above && p.y + belowGap + h < bottomLimit;
  let left, top, mode;
  if (above || below) {
    left = Math.max(minLeft, Math.min(s.w - w - 14, p.x - w / 2));
    top = above ? p.y - gap - h : p.y + belowGap;
    mode = above ? 'above' : 'below';
  } else {                                              // passt weder oben noch unten: neben den Pin
    left = p.x + 24 + w < s.w - 14 ? p.x + 24 : Math.max(minLeft, p.x - w - 24);
    top = Math.max(10, Math.min(bottomLimit - h, p.y - h / 2));
    mode = 'side';
  }
  pop.style.left = Math.round(left) + 'px';
  pop.style.top = Math.round(top) + 'px';
  pop.className = 'panel ' + mode;
  smEl('sm-pop-arrow').style.left = Math.round(Math.max(14, Math.min(w - 26, p.x - left - 6))) + 'px';
}

/* Ausschnitt für große Rasterdateien: ein Quadrat von SM_CUT_SIZE m um den Pin (auch eine gewählte Adresse setzt den Pin) */
function currentSiteWindow() {
  if (smPoint) return { lon: smPoint.lon, lat: smPoint.lat, size: SM_CUT_SIZE };
  return null;
}

const SM_BUTTON_MASK = { 0: 1, 1: 4, 2: 2 };      // button -> Bit in event.buttons

function smPointerDown(e) {
  const btn = e.button === undefined ? 0 : e.button;
  if (!smConsent || !(btn in SM_BUTTON_MASK)) return;
  smAnim = null;                                     // eine laufende Zoomfahrt endet, wenn gezogen wird
  const start = smFromClient(e.clientX, e.clientY);
  smDrag = { x: e.clientX, y: e.clientY, view: { lon: smView.lon, lat: smView.lat, z: smView.z }, start: start,
             moved: false, btn: btn };
  smEl('sm-tiles').className = 'drag';
  window.addEventListener('pointermove', smPointerMove);
  window.addEventListener('pointerup', smPointerUp);
  window.addEventListener('pointercancel', smPointerUp);
  if (e.preventDefault) e.preventDefault();          // Mitteltaste: kein Autoscroll des Browsers
}

function smPointerMove(e) {
  const d = smDrag;
  if (!d) return;
  if (e.buttons !== undefined && !(e.buttons & SM_BUTTON_MASK[d.btn])) { smPointerUp(e); return; }
  const dx = e.clientX - d.x, dy = e.clientY - d.y;
  if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
  const c = smWorldPx(d.view.lon, d.view.lat, d.view.z), q = smLonLat(c.x - dx, c.y - dy, d.view.z);
  smView = { lon: q.lon, lat: q.lat, z: d.view.z };
  smClampView();
  smSchedule();
}

function smPointerUp(e) {
  const d = smDrag;
  if (!d) return;
  smDrag = null;
  window.removeEventListener('pointermove', smPointerMove);
  window.removeEventListener('pointerup', smPointerUp);
  window.removeEventListener('pointercancel', smPointerUp);
  smEl('sm-tiles').className = '';
  if (d.btn === 0 && !d.moved) {                       // Klick ohne Ziehen: Ort wählen
    smPoint = { lon: d.start.lon, lat: d.start.lat };
    smPopOpen = true;
    chooseAddrItem({ coord: true, main: d.start.lat.toFixed(5) + ', ' + d.start.lon.toFixed(5), sub: T('addrCoordSub'), lat: d.start.lat, lon: d.start.lon }, { noFly: true, fromMap: true });
  }
  smRender();
}

function smWheel(e) {
  if (!smConsent) return;
  if (e.preventDefault) e.preventDefault();
  let d = e.deltaY || 0;
  if (e.deltaMode === 1) d *= 33;                      // Zeilen statt Pixel
  smZoomBy(Math.max(-1, Math.min(1, -d * 0.006)), e.clientX, e.clientY);   // ein Rastenschritt etwa 0,6 Stufen
}

function initStartMap() {
  smEl('sm-load').addEventListener('click', function () { smConsent = true; smRender(); });
  smEl('sm-pop-close').addEventListener('click', function () { smPopOpen = false; smRenderPop(); });
  smEl('sm-back').addEventListener('click', function () { smForced = false; showStartMap(); });
  smEl('sm-in').addEventListener('click', function () { smZoomBy(1); });
  smEl('sm-out').addEventListener('click', function () { smZoomBy(-1); });
  const box = smEl('sm-tiles');
  box.addEventListener('pointerdown', smPointerDown);
  box.addEventListener('wheel', smWheel);
  box.addEventListener('contextmenu', function (e) { if (e.preventDefault) e.preventDefault(); });   // rechte Taste zieht
  box.addEventListener('mousedown', function (e) { if (e.button === 1 && e.preventDefault) e.preventDefault(); });
  window.addEventListener('resize', function () { if (smVisible) smRender(); });
}

/* ---------- Standortsuche (Adressleiste) ----------
   Vorschläge von Photon beim Tippen (mind. 3 Zeichen, 350 ms Pause); nach der Wahl
   stehen Links zur DGM- und zur Gebäudemodell-Seite des Landes darunter. */
let addrTimer = null, addrAbort = null, addrItems = [], addrSel = -1, addrSeq = 0, addrPlace = null;
let addrStale = false;       // die Liste gehört zu einem älteren Eingabetext: Enter wählt dann nichts

function addrHost(url) {
  try { return new URL(url).hostname; } catch (e) { return url; }
}

function renderAddrUi() {
  const inp = document.getElementById('addr-input');
  if (!inp) return;
  inp.placeholder = T('addrPlaceholder');
  inp.setAttribute('aria-label', T('addrPlaceholder'));
  document.getElementById('addr-note').textContent = T('addrNote');
  renderAddrResult();
}

function renderAddrList(message) {
  const ul = document.getElementById('addr-list');
  ul.innerHTML = '';
  const inp = document.getElementById('addr-input');
  if (message) {
    const li = document.createElement('li');
    li.className = 'none';
    li.textContent = message;
    ul.appendChild(li);
  }
  if (!message || addrItems.length) {
    addrItems.forEach(function (it, i) {
      const li = document.createElement('li');
      li.className = i === addrSel ? 'sel' : '';
      li.setAttribute('role', 'option');
      const m = document.createElement('span'); m.className = 'm'; m.textContent = it.main;
      li.appendChild(m);
      if (it.sub) { const s = document.createElement('span'); s.className = 's'; s.textContent = it.sub; li.appendChild(s); }
      // mousedown statt click: das Eingabefeld darf den Fokus nicht vorher verlieren
      li.addEventListener('mousedown', function (e) { if (e.preventDefault) e.preventDefault(); chooseAddr(i); });
      ul.appendChild(li);
    });
  }
  const open = !!message || addrItems.length > 0;
  ul.style.display = open ? 'block' : 'none';
  inp.setAttribute('aria-expanded', open ? 'true' : 'false');
}

async function runAddrSearch(q) {
  const seq = ++addrSeq;
  if (addrAbort && addrAbort.abort) addrAbort.abort();
  addrAbort = typeof AbortController !== 'undefined' ? new AbortController() : null;
  addrItems = []; addrSel = -1;
  renderAddrList(T('addrSearching'));
  try {
    let items = await photonSearch(q, addrAbort ? addrAbort.signal : null);
    if (seq !== addrSeq) return;
    let note = null;
    // Nichts Passendes (Photon liefert sonst Ähnlichklingendes): mit dem Namensstamm ("Ohetalbrücke" -> "Ohetal") nachfragen
    if (!addrHasMatch(items, q)) {
      const stem = addrStem(q);
      if (stem) {
        const more = await photonSearch(stem, addrAbort ? addrAbort.signal : null);
        if (seq !== addrSeq) return;
        if (more.length) { items = more; note = T('addrSimilar').replace('{q}', q); }
      }
    }
    addrItems = items; addrSel = items.length ? 0 : -1;
    addrStale = false;
    renderAddrList(items.length ? note : T('addrNone'));
  } catch (e) {
    if (seq !== addrSeq || (e && e.name === 'AbortError')) return;
    addrItems = []; addrSel = -1;
    renderAddrList(T('addrError'));
  }
}

function onAddrInput() {
  const q = document.getElementById('addr-input').value.trim();
  if (addrTimer) clearTimeout(addrTimer);
  addrSeq++;
  addrStale = true;
  if (addrAbort && addrAbort.abort) addrAbort.abort();
  if (q.length < 3) { addrItems = []; addrSel = -1; renderAddrList(null); return; }
  // Koordinaten braucht keine Suche: ein Vorschlag mit dem erkannten Punkt, der Ort kommt erst beim Wählen
  const c = parseCoordinates(q, typeof TERRAIN !== 'undefined' && TERRAIN ? TERRAIN.epsg : null);
  if (c) {
    addrStale = false;
    addrItems = [{ coord: true, main: c.lat.toFixed(5) + ', ' + c.lon.toFixed(5), sub: T('addrCoordSub'), lat: c.lat, lon: c.lon }];
    addrSel = 0;
    renderAddrList(null);
    return;
  }
  addrTimer = setTimeout(function () { runAddrSearch(q); }, 350);
}

async function chooseAddr(i) {
  const it = addrItems[i];
  if (!it) return;
  return chooseAddrItem(it, {});
}

/* Ort übernehmen (aus der Liste oder aus einem Klick auf die Startkarte). opts.noFly: Karte nicht verschieben;
   opts.fromMap: Ort kommt von der Karte - dann zeigt nur das Fenster am Pin die Links, nicht die Adressleiste */
async function chooseAddrItem(it, opts) {
  if (!it) return;
  const fromMap = !!(opts && opts.fromMap);
  // Ist schon ein Gelände geladen und der Ort liegt außerhalb, öffnet sich die Karte dort (sonst bliebe nur die Linkliste)
  if (!fromMap && !(opts && opts.noFly) && TERRAIN && isFinite(it.lat) && isFinite(it.lon) && !placeInsideTerrain(it.lat, it.lon)) {
    smForced = true;
    showStartMap();
  }
  if (!(opts && opts.noFly) && isFinite(it.lat) && isFinite(it.lon)) smFlyTo(it.lat, it.lon, it.coord ? 16 : 15);
  if (addrTimer) clearTimeout(addrTimer);
  addrSeq++;                 // eine noch laufende Suche darf die Liste nicht wieder öffnen
  addrStale = false;
  addrPlace = it;
  it.fromMap = fromMap;
  if (!fromMap) document.getElementById('addr-input').value = it.coord ? it.main : it.main + (it.sub ? ', ' + it.sub : '');
  addrItems = []; addrSel = -1;
  renderAddrList(null);
  if (it.coord) {
    // Ort und Bundesland zu den Koordinaten nachfragen
    const place = { coord: true, main: it.main, sub: '', lat: it.lat, lon: it.lon, country: '', state: '', city: '', county: '', pending: true, fromMap: fromMap };
    addrPlace = place;
    renderAddrResult();
    try {
      const r = await photonReverse(it.lat, it.lon);
      if (addrPlace !== place) return;
      if (r) { place.country = r.country; place.state = r.state; place.city = r.city; place.county = r.county; place.sub = [r.postcode, r.city, r.state].filter(Boolean).join(' '); }
      else place.failed = true;
    } catch (e) {
      if (addrPlace !== place) return;
      place.failed = true;
    }
    place.pending = false;
    renderAddrResult();
    return;
  }
  renderAddrResult();
}

function onAddrKey(e) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!addrItems.length) return;
    addrSel = (addrSel + (e.key === 'ArrowDown' ? 1 : addrItems.length - 1)) % addrItems.length;
    renderAddrList(null);
    if (e.preventDefault) e.preventDefault();
  } else if (e.key === 'Enter') {
    if (addrSel >= 0 && !addrStale) chooseAddr(addrSel);
    if (e.preventDefault) e.preventDefault();
  } else if (e.key === 'Escape') {
    addrItems = []; addrSel = -1;
    renderAddrList(null);
  }
}

function addrRow(src, kind) {
  const row = document.createElement('div');
  row.className = 'addr-row';
  const a = document.createElement('a');
  a.href = src.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  a.textContent = (src.label ? src.label + ' · ' : '') + addrHost(src.url) + ' ↗';
  row.appendChild(a);
  if (kind === 'dem' && src.fmt) {
    const f = document.createElement('div');
    f.className = 'addr-fmt' + (src.fmt === 'tif' || src.fmt === 'laz' ? '' : ' warn');
    f.textContent = T(src.fmt === 'tif' ? 'geoFmtTif' : (src.fmt === 'xyz' ? 'geoFmtXyz' : (src.fmt === 'laz' ? 'geoFmtLaz' : 'geoFmtUnclear')));
    row.appendChild(f);
  }
  if (kind === 'city' && src.kind) {
    const f = document.createElement('div');
    f.className = 'addr-fmt';
    f.textContent = T('cityKind_' + src.kind);
    row.appendChild(f);
  }
  if (src.note) {
    const n = document.createElement('div');
    n.className = 'addr-note';
    n.textContent = T('geoNote_' + src.note);
    row.appendChild(n);
  }
  return row;
}

function renderAddrResult() {
  const box = document.getElementById('addr-result');
  if (!box) return;
  if (addrPlace && addrPlace.fromMap) { box.innerHTML = ''; box.style.display = 'none'; }     // von der Karte: nur das Fenster am Pin
  else renderPlaceInto(box, addrPlace);
  smRenderPop();                       // das Fenster am Pin zeigt dieselben Links
  if (!smConsent) smRender();          // noch keine Karte geladen: der Kasten nennt den gewählten Ort
}

/* Ort und Links zu Gelände- und Gebäudedaten in ein Feld schreiben (Adressleiste und Fenster am Pin) */
function renderPlaceInto(box, place) {
  box.innerHTML = '';
  if (!place) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  const title = document.createElement('div');
  title.className = 'addr-place';
  title.textContent = place.main;
  box.appendChild(title);
  if (place.coord) {
    const at = document.createElement('div');
    at.className = 'addr-note';
    at.textContent = place.pending ? T('addrSearching') : (place.sub || '');
    box.appendChild(at);
    if (place.pending) return;
    if (place.failed) {
      const f = document.createElement('div');
      f.className = 'addr-note';
      f.textContent = T('addrCoordFail');
      box.appendChild(f);
      return;
    }
  }
  const src = geoSourcesFor(place);
  if (!src) {
    const n = document.createElement('div');
    n.className = 'addr-note';
    n.textContent = T('addrOnlyDeAt');
    box.appendChild(n);
    return;
  }
  const grp = function (key, text) { const g = document.createElement('div'); g.className = 'addr-grp'; g.textContent = text || T(key); box.appendChild(g); };
  grp('addrDem');
  src.dem.forEach(function (d) { box.appendChild(addrRow(d, 'dem')); });
  if (src.demNote) {
    const n = document.createElement('div');
    n.className = 'addr-note';
    n.textContent = T('geoNote_' + src.demNote);
    box.appendChild(n);
  }
  grp('addrBldg');
  src.bldg.forEach(function (b) { box.appendChild(addrRow(b, 'bldg')); });
  // 3D-Stadtmodelle der Stadt (GEO_CITIES, kind '3d') gehören zum Gebäudemodell; mit ihnen entfällt der Hinweis "kein Gebäudemodell geprüft"
  const city = cityPortalsFor(place);
  const city3d = city ? city.links.filter(function (l) { return l.kind === '3d'; }) : [];
  city3d.forEach(function (l) { box.appendChild(addrRow(Object.assign({}, l, { label: place.city + ' · ' + l.label }), 'city')); });
  if (src.bldgNote && !city3d.length) {
    const n = document.createElement('div');
    n.className = 'addr-note';
    n.textContent = T('geoNote_' + src.bldgNote);
    box.appendChild(n);
  }
  // Stadtgeoportale (eigene Tabelle GEO_CITIES): zusätzlich zu den Seiten des Landes
  const cityRest = city ? city.links.filter(function (l) { return l.kind !== '3d'; }) : [];
  if (cityRest.length) {
    grp('', T('addrCity').replace('{c}', place.city));
    cityRest.forEach(function (l) { box.appendChild(addrRow(l, 'city')); });
  }
}

/* ---------- IFC-Import ----------
   Datei wählen -> mit web-ifc lesen -> automatisch platzieren, wenn Bauwerk und Gelände dasselbe Bezugssystem
   haben, sonst von Hand: je Punktpaar erst der Punkt am Bauwerk, dann der entsprechende im Gelände (A, dann B). */
let ifcPick = null;        // { step 0..3, p: [Punkt am Bauwerk], t: [Punkt im Gelände], markers, before, fresh }

function setIfcStatus(msg, kind) {
  const el = document.getElementById('ifc-status');
  el.textContent = msg;
  el.className = 'file-status' + (kind ? ' ' + kind : '');
}

function ifcFormat(key, vars) {
  let t = T(key);
  Object.keys(vars || {}).forEach(function (k) { t = t.replace('{' + k + '}', vars[k]); });
  return t;
}

function renderIfcUi() {
  const tools = document.getElementById('ifc-tools');
  if (tools) tools.style.display = ifcModel ? 'block' : 'none';
}

function showIfcHint(step) {
  const el = document.getElementById('ifc-hint');
  if (step === null || step === undefined) { el.style.display = 'none'; return; }
  el.textContent = '';
  const main = document.createElement('div');
  main.textContent = T('ifcStep' + step);
  const sub = document.createElement('div');
  sub.className = 'sub';
  sub.textContent = ifcFormat('ifcStepSub', { n: step + 1 });
  el.appendChild(main); el.appendChild(sub);
  el.style.display = 'block';
}

function clearIfcMarkers() {
  if (ifcPick && ifcPick.markers) ifcPick.markers.forEach(function (m) { scene.remove(m); });
  if (ifcPick) ifcPick.markers = [];
}

function addIfcMarker(pt, step) {
  const m = new THREE.Mesh(GEO.sphere, MAT.measure);
  m.position.set(pt.x, pt.y, pt.z);
  m.scale.set(0.9, 0.9, 0.9);
  m.renderOrder = 10;
  scene.add(m);
  ifcPick.markers.push(m);
}

/* Startet die Platzierung von Hand; fresh = das Bauwerk ist neu und hat noch keine Lage */
function startIfcManual(fresh, why) {
  if (!ifcModel) return;
  ifcPick = { step: 0, p: [], t: [], markers: [], fresh: !!fresh,
              before: ifcModel.placement ? { pl: ifcModel.placement, dz: ifcModel.dz } : null };
  selectTool(null);
  ifcPreviewPlacement(ifcModel);
  frameIfcModel();
  showIfcHint(0);
  if (why) setIfcStatus(why + ' ' + T('ifcManualBtn') + ' …', 'busy');
}

function frameIfcModel() {
  const b = ifcModel.bbox, pl = ifcModel.placement;
  const cx = pl.x + (b.minX + b.maxX) / 2, cz = pl.z + (b.minZ + b.maxZ) / 2;
  const cy = pl.y + (b.minY + b.maxY) / 2;
  const size = Math.max(b.maxX - b.minX, b.maxZ - b.minZ, b.maxY - b.minY, 5);
  // Blickrichtung beibehalten, Abstand nach der Größe des Bauwerks
  let dx = camera.position.x - controls.target.x, dy = camera.position.y - controls.target.y, dz = camera.position.z - controls.target.z;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  controls.target.set(cx, cy, cz);
  if (len > 0) {
    const k = (size * 2.2 + 20) / len;
    camera.position.set(cx + dx * k, cy + dy * k, cz + dz * k);
  }
  controls.update();
}

function cancelIfcPick(silent) {
  if (!ifcPick) return;
  clearIfcMarkers();
  const p = ifcPick;
  ifcPick = null;
  showIfcHint(null);
  if (p.fresh && !p.before) { ifcRemoveModel(); renderIfcUi(); setIfcStatus(T('noFile')); }
  else if (p.before && ifcModel) ifcApplyPlacement(ifcModel, p.before.pl, p.before.dz);
  if (!silent) setStatus(T('ifcCancelled'));
}

/* Klick im Platzierungsmodus, abwechselnd: Schritt 0 = A am Bauwerk, 1 = A im Gelände,
   2 = B am Bauwerk, 3 = B im Gelände */
function handleIfcPick(event) {
  const p = ifcPick;
  if (p.step % 2 === 0) {
    pointerToNDC(event);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(ifcModel.group, true);
    if (!hits.length) return;
    const wp = hits[0].point;
    const local = ifcModel.group.worldToLocal(wp.clone());
    p.p.push({ x: local.x, y: local.y, z: local.z });
    addIfcMarker(wp, p.step);
  } else {
    const pt = raycastTerrain(event);
    if (!pt) return;
    p.t.push({ x: pt.x, y: pt.y, z: pt.z });
    addIfcMarker(pt, p.step);
  }
  p.step++;
  if (p.step < 4) { showIfcHint(p.step); return; }
  finishIfcPick();
}

/* Vier Punkte sind gewählt: Bauwerk auf die beiden Geländepunkte legen und die Abstände prüfen */
function finishIfcPick() {
  const p = ifcPick;
  const pl = ifcTwoPointPlacement(p.p[0], p.p[1], p.t[0], p.t[1], getHeightAt);
  clearIfcMarkers();
  ifcPick = null;
  showIfcHint(null);
  ifcModel.dz = 0;
  document.getElementById('ifc-dz').value = '0';
  ifcApplyPlacement(ifcModel, pl, 0);
  ifcModel.how = 'manual';
  let msg = ifcFormat('ifcPlacedManual', { m: pl.distModel.toFixed(2), t: pl.distTerrain.toFixed(2) });
  const diff = Math.abs(pl.distModel - pl.distTerrain);
  if (diff > Math.max(0.5, 0.02 * pl.distTerrain)) msg += ' ' + ifcFormat('ifcDistWarn', { d: diff.toFixed(2) });
  setIfcStatus(msg, diff > Math.max(0.5, 0.02 * pl.distTerrain) ? 'err' : 'ok');
  setStatus(msg, diff > Math.max(0.5, 0.02 * pl.distTerrain));
}

async function handleIfcFile(file) {
  if (!file) return;
  if (!TERRAIN) { setIfcStatus(T('ifcNeedTerrain'), 'err'); return; }
  if (file.size > IFC_MAX_BYTES) {
    setIfcStatus(ifcFormat('ifcTooBig', { n: file.name, s: (file.size / 1e6).toFixed(0), m: IFC_MAX_BYTES / 1e6 }), 'err');
    return;
  }
  if (ifcPick) cancelIfcPick(true);
  setIfcStatus(T('ifcReading'), 'busy');
  showBusy('busyIfc');
  // dem Browser Zeit geben, die Meldung zu zeigen, bevor das Lesen blockiert
  await new Promise(function (r) { setTimeout(r, 30); });
  try {
    const m = await ifcReadModel(await file.arrayBuffer(), file.name);
    const model = ifcSetModel(m);
    renderIfcUi();
    document.getElementById('ifc-dz').value = '0';
    const g = model.georef;
    let why = '';
    if (!g) why = T('ifcWhyNoGeo');
    else if (!g.epsg) why = T('ifcWhyNoCrs');
    else if (!TERRAIN.epsg) why = T('ifcWhyTerrainCrs');
    else if (g.epsg !== TERRAIN.epsg) why = ifcFormat('ifcWhyCrs', { a: g.epsg, b: TERRAIN.epsg });
    if (!why) {
      ifcApplyPlacement(model, ifcAutoPlacement(g, model.coord, TERRAIN), 0);
      model.how = 'auto';
      if (!ifcInsideTerrain(model, TERRAIN)) {
        setIfcStatus(T('ifcOutside'), 'err');
        setStatus(T('ifcOutside'), true);
      } else {
        setIfcStatus(ifcFormat('ifcPlacedAuto', { c: g.epsg }) + ' ' + ifcFormat('ifcInfo', { n: m.name, t: m.triangles }), 'ok');
        setStatus(ifcFormat('ifcPlacedAuto', { c: g.epsg }));
      }
      focusOnIfc();
      return;
    }
    startIfcManual(true, why);
  } catch (e) {
    const code = e && e.message;
    const msg = code === 'ifcLibFail' ? T('ifcLibFail') : code === 'ifcEmpty' ? T('ifcEmpty') : ifcFormat('ifcFail', { e: code });
    setIfcStatus(msg, 'err');
    setStatus(msg, true);
  } finally {
    hideBusy();
  }
}

/* Nach einem neuen Gelände: automatisch platzierte Bauwerke mit demselben Bezugssystem neu einpassen,
   alles andere entfernen (die Lage gilt nur für das alte Gelände) */
function refreshIfcAfterTerrain() {
  if (ifcPick) cancelIfcPick(true);
  if (!ifcModel) return;
  const g = ifcModel.georef;
  if (ifcModel.how === 'auto' && g && g.epsg && g.epsg === TERRAIN.epsg) {
    ifcApplyPlacement(ifcModel, ifcAutoPlacement(g, ifcModel.coord, TERRAIN), ifcModel.dz || 0);
    return;
  }
  ifcRemoveModel();
  renderIfcUi();
  setIfcStatus(T('noFile'));
}

/* Höhenversatz des Bauwerks in m (Feld "Höhe ±") */
function applyIfcDz(value) {
  if (!ifcModel || !ifcModel.placement) return;
  const v = parseFloat(value);
  if (!isFinite(v)) return;
  ifcModel.dz = v;
  ifcModel.group.position.y = ifcModel.baseY + v;
}

function focusOnIfc() {
  if (ifcModel && ifcModel.placement) frameIfcModel();
}

function removeIfc() {
  cancelIfcPick(true);
  ifcRemoveModel();
  renderIfcUi();
  setIfcStatus(T('noFile'));
  setStatus(T('ifcRemoved'));
}

/* ---------- Bezugssystem für XYZ-Dateien ----------
   XYZ-Dateien tragen kein Bezugssystem. Auswahlfeld mit gängigen Systemen plus
   Eingabefeld für einen beliebigen EPSG-Code; bis eines gewählt ist, bleiben die
   Dateien vorgemerkt und werden mit der Wahl gelesen. */
const XYZ_CRS_CHOICES = [25832, 25833, 25831, 4647, 31467, 31468, 31466, 31469, 31255, 31256, 31254];
let pendingDemFiles = null;
let lastXyzLoad = null;      // zuletzt gelesene XYZ-Dateien: ändert sich das Bezugssystem, werden sie damit neu gelesen

function buildXyzCrsOptions() {
  const sel = document.getElementById('xyz-crs');
  if (!sel) return;
  const keep = sel.value;
  sel.innerHTML = '';
  const add = function (value, label) {
    const o = document.createElement('option');
    o.value = value; o.textContent = label;
    sel.appendChild(o);
  };
  add('', T('xyzChoose'));
  XYZ_CRS_CHOICES.forEach(function (c) { add(String(c), crsLabel(c)); });
  add('other', T('xyzOther'));
  sel.value = keep || '';
  const inp = document.getElementById('xyz-epsg');
  if (inp) inp.style.display = sel.value === 'other' ? '' : 'none';
}

/* EPSG-Code aus Auswahl oder Eingabefeld, sonst null */
function getXyzEpsg() {
  const sel = document.getElementById('xyz-crs'), inp = document.getElementById('xyz-epsg');
  if (!sel) return null;
  const raw = sel.value === 'other' ? (inp ? inp.value : '') : sel.value;
  const v = parseInt(raw, 10);
  return (isFinite(v) && v >= 1000 && v <= 99999) ? v : null;
}

function onXyzCrsChanged() {
  const sel = document.getElementById('xyz-crs'), inp = document.getElementById('xyz-epsg');
  inp.style.display = sel.value === 'other' ? '' : 'none';
  const p = pendingDemFiles || lastXyzLoad;           // noch wartend, oder schon gelesen: dann mit dem neuen Bezugssystem neu lesen
  if (p && getXyzEpsg()) handleDemFiles(p.files, p.isDemo);
}

async function handleDemFiles(files, isDemo) {
  const list = Array.prototype.slice.call(files || []);
  if (!list.length) return;
  const hasXyz = list.some(function (f) { return isXyzName(f.name); });
  // LAS/LAZ: das Bezugssystem steht meist im Kopf; sonst wie bei XYZ die Wahl des Nutzers
  let lasNeedsCrs = false;
  for (let i = 0; i < list.length && !lasNeedsCrs; i++) {
    if (!isLasName(list[i].name)) continue;
    try { lasNeedsCrs = !(await lasPeekEpsg(list[i])); } catch (e) { setFileStatus('dem', lasErrText(e), 'err'); return; }
  }
  let xyzEpsg = null;
  if (hasXyz || lasNeedsCrs) {
    xyzEpsg = getXyzEpsg();
    if (!xyzEpsg) {
      const sel = document.getElementById('xyz-crs');
      pendingDemFiles = { files: list, isDemo: isDemo };
      const typed = sel && sel.value === 'other' && document.getElementById('xyz-epsg').value;
      setFileStatus('dem', T(typed ? 'xyzBadEpsg' : 'xyzNeedCrs'), 'busy');
      if (sel && sel.focus) sel.focus();
      return;
    }
  }
  pendingDemFiles = null;
  setFileStatus('dem', list.length === 1 ? 'Lese ' + list[0].name : 'Lese ' + list.length + ' Kacheln', 'busy');
  try {
    // Sehr große GeoTIFF-Dateien werden nicht ganz gelesen, sondern nur der Ausschnitt um den gewählten Ort (Pin oder Adresse)
    const isBig = function (f) { return !isXyzName(f.name) && !isLasName(f.name) && f.size > TIFF_BLOB_BYTES; };
    const win = list.some(function (f) { return isBig(f) || isLasName(f.name); }) ? currentSiteWindow() : null;
    list.forEach(function (f) { if (isLasName(f.name) && f.size > LAS_MAX_BYTES) throw new Error(f.name + ': ' + T('lasTooBig').replace('{s}', (f.size / 1e6).toFixed(0)).replace('{m}', String(LAS_MAX_BYTES / 1e6))); });
    // Größen prüfen, bevor die erste Datei in den Speicher gelesen wird (die großen entscheidet der Fensterleser nach dem Kopf)
    checkTiffFiles(list.filter(function (f) { return !isBig(f); }).map(function (f) { return { name: f.name, size: f.size }; }));
    const items = [];
    for (let i = 0; i < list.length; i++) {
      items.push(isBig(list[i]) ? { blob: list[i], name: list[i].name, window: win } : { buffer: await list[i].arrayBuffer(), name: list[i].name, window: win });
    }
    lastDemTiles = await readTiffTiles(items, xyzEpsg);
    lastDemNames = items.map(function (x) { return x.name; });
    lastXyzLoad = (hasXyz || lasNeedsCrs) ? { files: list, isDemo: isDemo } : null;
    const t = gridTiles(lastDemTiles, GRID_MAX);
    // XYZ ohne Bezugssystem in der Datei: liegt das Ergebnis weit weg von Europa, stimmt der Code vermutlich nicht
    let crsWarn = '';
    if (hasXyz || lasNeedsCrs) {
      const g = crsToLonLat(t.epsg, t.originE, t.originN);
      if (g && (g.lat < 34 || g.lat > 72 || g.lon < -12 || g.lon > 45)) {
        crsWarn = ' ' + T('xyzFar').replace('{c}', 'EPSG:' + t.epsg).replace('{lat}', g.lat.toFixed(1)).replace('{lon}', g.lon.toFixed(1));
      }
    }

    hideMeasure();
    buildTerrain(t);
    refreshIfcAfterTerrain();
    frameTerrain();
    const removed = pruneObjectsOutside();
    reseatAllObjects();
    updateTerrainInfo();
    renderOverview();

    demoAttribDem = !!isDemo;
    refreshAttribution();

    setFileStatus('dem', demStatusText(t) + crsWarn, crsWarn ? 'err' : 'ok');

    let msg = 'Gelände ersetzt: ' + Math.round(t.w) + ' × ' + Math.round(t.d) + ' m.';
    if (removed) msg += ' ' + removed + ' Objekt(e) außerhalb entfernt.';
    setStatus(msg);

    if (lastFootprints) {
      applyFootprints();                                        // Grundrisse neu auf das neue Gelände setzen
    } else if (lastGmlRings) {
      try {
        setBuildings(buildBuildingsMesh(lastGmlRings));
        setFileStatus('gml', 'Neu eingepasst', 'ok');
      } catch (e) {
        clearBuildings();
        setFileStatus('gml', e.message, 'err');
      }
    }
  } catch (err) {
    setFileStatus('dem', lasErrText(err), 'err');
    setStatus('GeoTIFF nicht lesbar: ' + lasErrText(err), true);
  }
}

/* Obergrenze für Gebäudedateien (CityGML und CityJSON): der Browser liest die Dateien als Text in den Speicher und parst sie als XML;
   darüber hinaus bricht er mit einer unverständlichen Meldung ab oder steht still. Schätzwert, nicht gemessen. */
const GML_MAX_BYTES = 300e6;

async function handleGmlFiles(files, isDemo) {
  const list = Array.prototype.slice.call(files || []);
  if (!list.length) return;
  const cls = await fpClassify(list);
  const only2d = !cls.gpkg && !cls.shp && !cls.geojson && !cls.inspire;
  if (!only2d) {
    // 2D-Grundrisse mit Höhenattributen: GeoPackage, Shapefile oder GeoJSON (ein Datensatz auf einmal)
    const big = !cls.gpkg && list.reduce(function (sum, f) { return sum + (f.size || 0); }, 0) > GML_MAX_BYTES;
    if (big) { const m = T('gmlTooBig').replace('{s}', (list.reduce(function (a, f) { return a + (f.size || 0); }, 0) / 1e6).toFixed(0)).replace('{m}', String(GML_MAX_BYTES / 1e6)); setFileStatus('gml', m, 'err'); setStatus(m, true); return; }
    await handleFootprintFiles(cls);
    return;
  }
  if (!cls.rest.length) {                                    // nur .dbf/.prj/.cpg ohne .shp
    if (Object.keys(cls.side).length) { const m = T('fpNeedShp'); setFileStatus('gml', m, 'err'); setStatus(m, true); return; }
  }
  lastFootprints = null;
  renderFpPanel();
  const total = list.reduce(function (s, f) { return s + (f.size || 0); }, 0);
  if (total > GML_MAX_BYTES) {
    const msg = T('gmlTooBig').replace('{s}', (total / 1e6).toFixed(0)).replace('{m}', String(GML_MAX_BYTES / 1e6));
    setFileStatus('gml', msg, 'err');
    setStatus(msg, true);
    return;
  }
  setFileStatus('gml', list.length === 1 ? 'Lese ' + list[0].name : 'Lese ' + list.length + ' Dateien', 'busy');
  showBusy('busyGml');
  await yieldToPaint();
  try {
    const texts = [];
    for (let i = 0; i < list.length; i++) {
      texts.push({ name: list[i].name, text: await list[i].text() });
    }
    const merged = mergeCityGML(texts);
    lastGmlRings = merged.rings;

    showBusy('busyGmlRender');
    await yieldToPaint();
    const mesh = buildBuildingsMesh(merged.rings);
    setBuildings(mesh);
    await yieldToPaint();                    // das erste Bild mit den Gebäuden ist gezeichnet

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
    setStatus(T('gmlUnreadable') + ' ' + err.message, true);
  } finally {
    hideBusy();
  }
}

/* ---------- Gebäude aus 2D-Daten (GeoJSON, Shapefile, GeoPackage) ----------
   Nach dem Laden wählt der Nutzer Gelände- und Gebäudehöhe aus den Attributen (oder gibt feste Werte an); jede Änderung baut die Gebäude neu.
   Die Grundrisse bleiben im Speicher (lastFootprints), damit sie auch nach einem Wechsel des Geländes neu auf dieses gesetzt werden. */
let lastFootprints = null;       // { set, file (GeoPackage), kind, opts }
const FP_CRS_CHOICES = XYZ_CRS_CHOICES.concat([3035, 4326]);

function fpExt(name) { const m = /\.([^.]+)$/.exec(String(name || '')); return m ? m[1].toLowerCase() : ''; }
function fpBase(name) { return String(name || '').replace(/\.[^.]*$/, '').toLowerCase(); }

async function fpReadHead(file) {
  if (!file.slice) return '';                                   // ohne slice() nicht die ganze Datei lesen, nur um den Typ zu raten
  try { return String(await file.slice(0, 6000).text()).slice(0, 6000); } catch (e) { return ''; }
}

/* Dateien nach Art ordnen: GeoPackage, Shapefile (mit .dbf/.prj/.cpg gleichen Namens), GeoJSON; der Rest ist CityGML/CityJSON */
async function fpClassify(list) {
  const c = { gpkg: null, shp: null, geojson: null, inspire: null, side: {}, rest: [] };
  for (let i = 0; i < list.length; i++) {
    const f = list[i], e = fpExt(f.name);
    if (e === 'gpkg') c.gpkg = c.gpkg || f;
    else if (e === 'shp') c.shp = c.shp || f;
    else if (e === 'geojson') c.geojson = c.geojson || f;
    else if (e === 'json' && fpLooksLikeGeoJson(await fpReadHead(f))) c.geojson = c.geojson || f;
    else if ((e === 'xml' || e === 'gml') && fpLooksLikeInspireGml(await fpReadHead(f))) c.inspire = c.inspire || f;
    else if (e === 'dbf' || e === 'prj' || e === 'cpg' || e === 'shx') { (c.side[fpBase(f.name)] = c.side[fpBase(f.name)] || {})[e] = f; }
    else c.rest.push(f);
  }
  return c;
}

function fpErrText(e) { const m = e && e.message ? e.message : String(e); return /^(fp|sqlite|gpkg)[A-Za-z0-9]+$/.test(m) ? T(m) : m; }

function fpBytes(file) { return file.arrayBuffer().then(function (b) { return new Uint8Array(b); }); }

function fpReadGpkg(file, table) {
  const rd = function (o, l) { return file.slice(o, o + l).arrayBuffer().then(function (b) { return new Uint8Array(b); }); };
  return readGpkgFootprints(rd, file.size, file.name, fpWindowFor, table);
}

/* Voreinstellung: Höhenfeld nach Namen finden (zum Beispiel BEV HOEHE_OBJEKT_MAX, 3DBAG, OSM height), Gelände aus dem Modell */
function fpDefaultOptions(set) {
  const num = set.fields.filter(function (f) { return f.numeric; }).map(function (f) { return f.name; });
  const isGround = function (n) { return /boden|gel(ae|ä)nde|ground|terrain|dgm|sohle/i.test(n); };
  const pick = function (list, tests) {
    for (let i = 0; i < tests.length; i++) { const r = list.filter(function (n) { return tests[i].test(n); })[0]; if (r) return r; }
    return null;
  };
  const hAttr = pick(num.filter(function (n) { return !isGround(n); }),
    [/objekt.*max|max.*objekt/i, /^(bldg_?)?(measured)?height$|^h(oe|ö)he$|geb(ae|ä)udeh(oe|ö)he|bauh(oe|ö)he/i, /height|h(oe|ö)he|hgt/i, /traufe|first|dach/i]);
  const gAttr = pick(num.filter(isGround), [/boden.*min|min.*boden/i, /boden|gel(ae|ä)nde|ground|terrain/i]);
  const floors = !hAttr ? pick(num, [/geschoss|floor|storey|stock|etage/i]) : null;
  const med = hAttr ? fpMedian(set, hAttr) : NaN;
  const abs = hAttr && (/(^|[^a-z])(abs|nn)([^a-z]|$)|ue_?nn/i.test(hAttr) || med > 100);
  return {
    ground: { src: 'terrain', attr: gAttr || num[0] || '', fixed: 0 },
    height: { src: hAttr || floors ? 'attr' : 'fixed', attr: hAttr || floors || num[0] || '', ref: abs ? 'abs' : 'rel', factor: hAttr ? 1 : (floors ? 3 : 1), fixed: 10 },
    fallback: 8, crs: ''
  };
}

function fpFill(sel, items, value) {
  sel.innerHTML = '';
  items.forEach(function (it) { const o = document.createElement('option'); o.value = it[0]; o.textContent = it[1]; sel.appendChild(o); });
  sel.value = value === undefined || value === null ? '' : String(value);
}

/* Auswahlfelder füllen und je nach Wahl ein- und ausblenden */
function renderFpPanel() {
  const fp = lastFootprints, panel = document.getElementById('fp-panel');
  if (!panel) return;
  if (!fp) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  const set = fp.set, o = fp.opts, g = function (id) { return document.getElementById(id); };
  const num = set.fields.filter(function (f) { return f.numeric; }).map(function (f) { return [f.name, f.name]; });
  const attrs = num.length ? num : [['', T('fpNoNumeric')]];
  g('fp-title').textContent = T('fpTitle').replace('{n}', String(set.feats.length)).replace('{f}', fp.kind);
  const multi = set.tables && set.tables.length > 1;
  g('fp-table-row').style.display = multi ? 'flex' : 'none';
  if (multi) fpFill(g('fp-table'), set.tables.map(function (t) { return [t, t]; }), set.table);
  fpFill(g('fp-ground-src'), [['terrain', T('fpGroundTerrain')], ['attr', T('fpGroundAttr')], ['fixed', T('fpGroundFixed')]], o.ground.src);
  fpFill(g('fp-ground-attr'), attrs, o.ground.attr);
  g('fp-ground-fixed').value = o.ground.fixed;
  fpFill(g('fp-h-src'), [['attr', T('fpHeightAttr')], ['fixed', T('fpHeightFixed')]], o.height.src);
  fpFill(g('fp-h-attr'), attrs, o.height.attr);
  g('fp-h-fixed').value = o.height.fixed;
  fpFill(g('fp-h-ref'), [['rel', T('fpRefRel')], ['abs', T('fpRefAbs')]], o.height.ref);
  g('fp-h-factor').value = o.height.factor;
  g('fp-fallback').value = o.fallback;
  const auto = set.epsg ? T('fpCrsKnown').replace('{c}', String(set.epsg)) : T('fpCrsUnknown0');
  fpFill(g('fp-crs'), [['', auto]].concat(FP_CRS_CHOICES.map(function (c) { return [String(c), crsLabel(c)]; })).concat([['other', T('fpOther')]]), o.crs === '' || o.crs === null ? '' : (FP_CRS_CHOICES.indexOf(+o.crs) >= 0 ? String(o.crs) : 'other'));
  g('fp-epsg').style.display = g('fp-crs').value === 'other' ? '' : 'none';
  g('fp-ground-attr').style.display = o.ground.src === 'attr' ? '' : 'none';
  g('fp-ground-fixed').style.display = o.ground.src === 'fixed' ? '' : 'none';
  g('fp-h-attr').style.display = o.height.src === 'attr' ? '' : 'none';
  g('fp-h-fixed').style.display = o.height.src === 'fixed' ? '' : 'none';
  g('fp-ref-row').style.display = o.height.src === 'attr' ? 'flex' : 'none';
  g('fp-factor-row').style.display = o.height.src === 'attr' ? 'flex' : 'none';
}

/* Einstellungen aus den Feldern lesen (die Felder sind maßgeblich) */
function readFpOptions() {
  const g = function (id) { return document.getElementById(id); }, n = function (id, d) { const v = parseFloat(g(id).value); return isFinite(v) ? v : d; };
  let crs = g('fp-crs').value;
  crs = crs === '' ? '' : (crs === 'other' ? (parseInt(g('fp-epsg').value, 10) || '') : parseInt(crs, 10));
  return {
    ground: { src: g('fp-ground-src').value || 'terrain', attr: g('fp-ground-attr').value, fixed: n('fp-ground-fixed', 0) },
    height: { src: g('fp-h-src').value || 'fixed', attr: g('fp-h-attr').value, ref: g('fp-h-ref').value || 'rel', factor: n('fp-h-factor', 1), fixed: n('fp-h-fixed', 10) },
    fallback: n('fp-fallback', 8), crs: crs
  };
}

/* Gebäude aus den Grundrissen und den gewählten Höhen neu bauen */
function applyFootprints() {
  const fp = lastFootprints;
  if (!fp) return;
  const info = document.getElementById('fp-info');
  try {
    const res = footprintRings(fp.set, { epsg: fp.opts.crs || null, ground: fp.opts.ground, height: fp.opts.height, fallback: fp.opts.fallback });
    lastGmlRings = res.rings;
    const mesh = buildBuildingsMesh(res.rings);
    setBuildings(mesh);
    info.textContent = T('fpInfo').replace('{n}', String(res.used)).replace('{o}', String(res.outside)).replace('{h}', String(res.noHeight));
    setFileStatus('gml', T('fpStatus').replace('{n}', String(fp.set.feats.length)).replace('{f}', fp.kind).replace('{u}', String(res.used)), 'ok');
  } catch (e) {
    clearBuildings();
    lastGmlRings = null;
    info.textContent = fpErrText(e);
    setFileStatus('gml', fpErrText(e), 'err');
  }
}

function onFpChanged(ev) {
  if (!lastFootprints) return;
  lastFootprints.opts = readFpOptions();
  renderFpPanel();
  applyFootprints();
}

async function onFpTableChanged() {
  const fp = lastFootprints;
  if (!fp || !fp.file) return;
  const t = document.getElementById('fp-table').value;
  showBusy('busyGml');
  await yieldToPaint();
  try {
    const set = await fpReadGpkg(fp.file, t);
    lastFootprints = { set: set, file: fp.file, kind: fp.kind, opts: fpDefaultOptions(set) };
    renderFpPanel();
    applyFootprints();
  } catch (e) {
    setFileStatus('gml', fpErrText(e), 'err');
  } finally { hideBusy(); }
}

/* Eine Gruppe 2D-Dateien laden; c kommt aus fpClassify */
async function handleFootprintFiles(c) {
  if (!TERRAIN) { const msg = T('fpNeedTerrain'); setFileStatus('gml', msg, 'err'); setStatus(msg, true); return; }
  setFileStatus('gml', 'Lese ' + (c.gpkg || c.shp || c.geojson || c.inspire).name, 'busy');
  showBusy('busyGml');
  await yieldToPaint();
  try {
    let set, kind, file = null;
    if (c.gpkg) { kind = 'GeoPackage'; file = c.gpkg; set = await fpReadGpkg(c.gpkg, null); }
    else if (c.shp) {
      kind = 'Shapefile';
      const side = c.side[fpBase(c.shp.name)] || {};
      const shp = await fpBytes(c.shp);
      const dbf = side.dbf ? await fpBytes(side.dbf) : null;
      const prj = side.prj ? await side.prj.text() : null;
      const cpg = side.cpg ? await side.cpg.text() : null;
      set = parseShapefileSet(shp, dbf, prj, cpg, c.shp.name);
    } else if (c.inspire) { kind = 'INSPIRE-GML'; set = parseInspireBuildings(await c.inspire.text(), c.inspire.name); }
    else { kind = 'GeoJSON'; set = parseGeoJsonFootprints(await c.geojson.text(), c.geojson.name); }
    lastFootprints = { set: set, file: file, kind: kind, opts: fpDefaultOptions(set) };
    demoAttribGml = false;
    refreshAttribution();
    renderFpPanel();
    showBusy('busyGmlRender');
    await yieldToPaint();
    applyFootprints();
    if (lastGmlRings) setStatus(T('msgBuildingsLoaded'));
  } catch (e) {
    lastFootprints = null;
    renderFpPanel();
    setFileStatus('gml', fpErrText(e), 'err');
    setStatus(T('gmlUnreadable') + ' ' + fpErrText(e), true);
  } finally { hideBusy(); }
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
let rectFrame = null;          // Rahmen der Ansicht beim Ziehen: { ux, uz } (siehe groundFrameFromCamera)
let exportRect = null;         // orientiertes Rechteck des zuletzt gezeichneten Auswahlbereichs (orientedRect: u0..v1, Ecken, umschließender Kasten)
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
  if (rulerActive) stopRuler();
  clearExportPreview();
  rectSelectActive = true;
  rectStart = null;
  setTopView(true);                                          // Draufsicht, aber die Ansicht nicht nach Norden drehen
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
  const R = orientedRect(a, b, rectFrame);
  const y = getHeightAt((R.minX + R.maxX) / 2, (R.minZ + R.maxZ) / 2) + 0.3;
  const pts = R.corners.map(function (c) { return new THREE.Vector3(c[0], y, c[1]); });
  rectPreviewGroup = thickLine(pts, 1.5, MAT.drawPreview, true);
  scene.add(rectPreviewGroup);
}

/* Ecke a kommt vom pointerdown, b vom pointerup. */
function finishRectExport(a, b) {
  rectSelectActive = false;
  setOrbitLocked(false);
  clearRectDragPreview();

  const R = orientedRect(a, b, rectFrame);                    // an der Ansicht ausgerichtet; bei Norden oben achsenparallel
  const minX = R.minX, maxX = R.maxX, minZ = R.minZ, maxZ = R.maxZ;
  if (R.u1 - R.u0 < 1 || R.v1 - R.v0 < 1) { setStatus(''); return; }

  try {
    exportGeometry = collectExportGeometry(lastGmlRings, minX, minZ, maxX, maxZ, false, R);
  } catch (err) {
    setStatus(err.message, true);
    return;
  }

  exportRect = R;
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
    Math.round(r.u1 - r.u0) + ' × ' + Math.round(r.v1 - r.v0) + ' m';
  document.getElementById('ifc-crs').textContent = crsLabel(TERRAIN.epsg);
  fillIfcTargets();
  document.getElementById('ifc-error').textContent = '';
  document.getElementById('ifc-panel').style.display = 'block';
}

/* Auswahl des Bezugssystems der Datei: "wie Gelände" und die Zielsysteme, die sich umrechnen lassen */
function fillIfcTargets() {
  const sel = document.getElementById('ifc-target');
  const def = crsGeoDefinition(TERRAIN.epsg);
  const can = !!def && !def.merc;
  document.getElementById('ifc-target-row').style.display = can ? '' : 'none';
  sel.innerHTML = '';
  const add = function (value, label, i18n) {
    const o = document.createElement('option');
    o.value = value; o.textContent = label;
    if (i18n) o.setAttribute('data-i18n', i18n);
    sel.appendChild(o);
  };
  add('', T('ifcTargetSame'), 'ifcTargetSame');
  if (can) IFC_TARGET_CRS.forEach(function (c) {
    if (c !== TERRAIN.epsg) add(String(c), crsLabel(c) + (crsTransformIsApprox(TERRAIN.epsg, c) ? ' ≈' : ''));
  });
  sel.value = '';
  updateIfcTargetUi();
}

/* Anderes Bezugssystem: nur absolute Koordinaten, und bei Bessel-Systemen ein Hinweis zur Genauigkeit */
function updateIfcTargetUi() {
  const v = document.getElementById('ifc-target').value;
  const coords = document.getElementById('ifc-coords');
  const note = document.getElementById('ifc-target-note');
  const other = v !== '';
  if (other) coords.value = 'abs';
  coords.disabled = other;
  note.className = '';
  if (!other) { note.textContent = ''; return; }
  const approx = crsTransformIsApprox(TERRAIN.epsg, parseInt(v, 10));
  note.textContent = T('ifcTargetNote') + (approx ? ' ' + T('ifcTargetApprox') : '');
  if (approx) note.className = 'warn';
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
    const modeEl = document.getElementById('ifc-coords');
    const objEl = document.getElementById('ifc-objects'), r = exportRect;
    const targetEl = document.getElementById('ifc-target');
    const geo = Object.assign({}, exportGeometry, {
      objects: objEl && objEl.checked ? collectExportObjects(r.minX, r.minZ, r.maxX, r.maxZ, r) : []
    });
    const ifc = buildIfc(geo, r.minX, r.minZ, TERRAIN.epsg,
                         { coords: modeEl && modeEl.value === 'local' ? 'local' : 'abs',
                           targetEpsg: targetEl && targetEl.value ? parseInt(targetEl.value, 10) : 0 });
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
    rectFrame = groundFrameFromCamera();                      // das Rechteck richtet sich nach dem Bildschirm
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
  if (wasRight) { if (rulerActive) finishRuler(); else if (isDrawTool(activeTool)) finishDrawing(); return; }
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
  pivotDrag = { pivot: p, x: event.clientX, y: event.clientY, sx: event.clientX, sy: event.clientY, active: false };
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
  // Erst ab einigen Pixeln Weg drehen: das Zittern der Hand beim Klicken soll die Ansicht nicht verdrehen
  if (!pivotDrag.active) {
    if (Math.abs(event.clientX - pivotDrag.sx) + Math.abs(event.clientY - pivotDrag.sy) <= DRAG_TOLERANCE) return;
    pivotDrag.active = true;
  }
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

/* Mausrad: gleichmäßige Schritte in Metern statt Prozent vom Abstand. OrbitControls skaliert den Abstand je Rastenschritt um
   denselben Faktor (0,95^zoomSpeed), dadurch wird jeder Schritt kürzer, je näher die Kamera kommt. Hier wird zoomSpeed je
   Ereignis so gesetzt, dass der Abstand um eine feste Strecke wächst oder schrumpft (Schrittweite: ein Sechzigstel der
   Geländekante, mindestens 5 m; ein Rastenschritt = deltaY 100). Die Grenzen minDistance/maxDistance gelten weiter. */
const WHEEL_STEP_DIV = 60, WHEEL_STEP_MIN = 5;

function wheelStepMeters() {
  const t = typeof TERRAIN !== 'undefined' ? TERRAIN : null;
  return t ? Math.max(WHEEL_STEP_MIN, Math.max(t.w, t.d) / WHEEL_STEP_DIV) : 15;
}

/* zoomSpeed für OrbitControls, damit dieser Schritt den Abstand `dist` um eine feste Strecke ändert (deltaY < 0: heran) */
function linearZoomSpeed(dist, deltaY, deltaMode) {
  let dy = deltaY || 0;
  if (deltaMode === 1) dy *= 33;                         // Zeilen statt Pixel
  if (!dy || !(dist > 0)) return 1;
  const step = wheelStepMeters() * Math.max(0.1, Math.min(3, Math.abs(dy) / 100));
  let f;                                                 // Faktor, den OrbitControls als 0,95^zoomSpeed anwendet
  if (dy < 0) {
    const room = dist - (controls ? controls.minDistance : 0);
    const st = Math.min(step, Math.max(0, room));
    f = (dist - st) / dist;                              // heran: Abstand - Schritt
  } else {
    f = dist / (dist + step);                            // weg: Abstand + Schritt (OrbitControls teilt durch f)
  }
  return Math.log(f) / Math.log(0.95);
}

function onCanvasWheel(event) {
  if (pivotDrag && !(event.buttons & 1)) endOrbitDrag();
  settleCameraFlight();
  if (typeof controls !== 'undefined' && controls && typeof camera !== 'undefined' && camera && event.deltaY) {
    controls.zoomSpeed = linearZoomSpeed(camera.position.distanceTo(controls.target), event.deltaY, event.deltaMode);
  }
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
  if (rulerActive) rulerMove(event, pt);
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
  // IFC-Platzierung von Hand: jeder Klick gehört dazu
  if (ifcPick) { handleIfcPick(event); return; }
  // Messen: jeder Klick setzt einen Messpunkt
  if (rulerActive) { rulerClick(event); return; }

  // Punkt hinzufügen: hat Vorrang vor dem Anklicken vorhandener Stützpunkte
  if (addNodeMode) {
    const obj = findObject(getSelectedId());
    const pt = raycastTerrain(event);
    if (obj && pt) {
      addNodeMode = false;
      if (addRoadNode(obj, pt.x, pt.z) >= 0) {
        showObjectEditor(obj.id);
        setStatus(T('nodeAdded'));
      } else {
        setStatus(T('msgMaxPoints'), true);
      }
    }
    return;
  }

  // Stützpunkt einer ausgewählten Baustraße bearbeiten
  const sel = findObject(getSelectedId());
  if (hasNodes(sel)) {
    const hit = raycastRoadNode(event);
    if (hit !== null) {
      moveMode = false;                       // wer einen Stützpunkt anfasst, will nicht mehr die ganze Straße verschieben
      setActiveNode(hit);
      setStatus(T('nodePicked'));
      return;
    }
    if (activeRoadNode() !== null) {
      const pt = raycastTerrain(event);
      if (pt) {
        moveRoadNode(sel, activeRoadNode(), pt.x, pt.z);
        moveMode = false;                     // sonst verschiebt der nächste Klick irgendwo die ganze Straße mit
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

/* ---------- Bestätigung (Leeren, Reset) ---------- */
let confirmAction = null;

function askConfirm(textKey, vars, yesKey, action) {
  let text = T(textKey);
  Object.keys(vars || {}).forEach(function (k) { text = text.replace('{' + k + '}', String(vars[k])); });
  confirmAction = action;
  document.getElementById('confirm-text').textContent = text;
  document.getElementById('confirm-yes').textContent = T(yesKey);
  document.getElementById('confirm-wrap').style.display = 'flex';
  const no = document.getElementById('confirm-no');
  if (no.focus) no.focus();                                  // Abbrechen ist vorbelegt: ein versehentliches Enter löscht nichts
}

function closeConfirm() {
  confirmAction = null;
  document.getElementById('confirm-wrap').style.display = 'none';
}

function clearAllObjects() {
  objects.slice().forEach(function (o) { removeObject(o.id); });
  selectTool(null);
  hideMeasure();
  renderOverview();
  setStatus(T('msgCleared'));
}

/* Alles zurück auf den Anfang: nichts geladen, keine Bausteine. Ein Neuladen der Seite ohne Zusätze (auch ohne ?demo=1) ist der sicherste Weg:
   kein Zustand bleibt hängen (Gelände, Gebäude, IFC, Karte, Zwischenspeicher). */
function resetEverything() {
  try { window.location.replace(window.location.pathname || '.'); } catch (e) { window.location.reload(); }
}

function onKeyDown(event) {
  if (confirmAction) {                                       // solange die Bestätigung offen ist, gilt nur Esc
    if (event.key === 'Escape') closeConfirm();
    return;
  }
  if (event.key === 'Escape' && smPopOpen && smVisible) { smPopOpen = false; smRenderPop(); return; }
  if (event.key === 'Escape' && smForced && smVisible && !isTypingTarget(event)) { smForced = false; showStartMap(); return; }
  if (event.key !== 'Escape' && isTypingTarget(event)) return;
  if ((event.key === ' ' || event.code === 'Space' || event.key === 'Enter') && rulerActive) {
    if (event.preventDefault) event.preventDefault();
    finishRuler();
    return;
  }
  if (event.key === ' ' || event.code === 'Space') {
    if (isDrawTool(activeTool)) {
      if (event.preventDefault) event.preventDefault();
      finishDrawing();
    }
    return;
  }
  if (event.key === 'Escape') {
    if (rulerActive) { stopRuler(); return; }
    if (ifcPick) { cancelIfcPick(); return; }
    if (rectSelectActive) { cancelRectExport(); return; }
    if (isIfcPanelOpen()) { clearExportPreview(); setStatus(''); return; }
    // Erst die Knotenauswahl lösen, die Objektauswahl bleibt bestehen
    if (activeRoadNode() !== null) { setActiveNode(null); setStatus(''); return; }
    moveMode = false;
    addNodeMode = false;
    roadPoints = []; clearRoadPreview(); setRoadHint(false);
    selectTool(null);
    hideMeasure();
    toggleTweak(false);
    toggleHelp(false);
    setStatus('');
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    if (rulerActive) { rulerRemoveLast(); return; }
    if (ifcPick) return;
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
  ['container', 'tower', 'mobile', 'road', 'pit', 'ifc', 'ruler'].forEach(function (type) {
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
      if (type === 'ruler') { if (rulerActive) stopRuler(); else startRuler(); return; }
      selectTool(activeTool === type ? null : type);
    });
    palette.appendChild(card);
  });

  renderAddrUi();
  const addr = document.getElementById('addr-input');
  addr.addEventListener('input', onAddrInput);
  addr.addEventListener('keydown', onAddrKey);
  addr.addEventListener('blur', function () { addrItems = []; addrSel = -1; renderAddrList(null); });
  buildXyzCrsOptions();
  document.getElementById('xyz-crs').addEventListener('change', onXyzCrsChanged);
  [['row-dem', 'dem-input'], ['row-gml', 'gml-input'], ['ifc-row', 'ifc-input']].forEach(function (r) {
    const row = document.getElementById(r[0]);
    const head = row.children && row.children[0] && row.children[0].children ? row.children[0].children[0] : null;
    if (!head || !head.addEventListener) return;
    head.addEventListener('click', function () { toggleFileRow(r[0]); });
    head.addEventListener('keydown', function (e) { if (e && (e.key === 'Enter' || e.key === ' ')) { if (e.preventDefault) e.preventDefault(); toggleFileRow(r[0]); } });
  });
  document.getElementById('xyz-epsg').addEventListener('change', onXyzCrsChanged);
  const demInput = document.getElementById('dem-input');
  demInput.addEventListener('change', function () {
    if (demInput.files && demInput.files.length) handleDemFiles(demInput.files);
  });

  const ifcInput = document.getElementById('ifc-input');
  ifcInput.addEventListener('change', function () {
    if (ifcInput.files && ifcInput.files.length) handleIfcFile(ifcInput.files[0]);
  });
  document.getElementById('ifc-clear').addEventListener('click', removeIfc);
  document.getElementById('ruler-new').addEventListener('click', newRuler);
  document.getElementById('ruler-close').addEventListener('click', stopRuler);
  document.getElementById('ifc-manual-btn').addEventListener('click', function () { startIfcManual(false); });
  document.getElementById('ifc-dz').addEventListener('input', function (e) {
    applyIfcDz((e && e.target ? e.target : this).value);
  });
  ['fp-ground-src', 'fp-ground-attr', 'fp-ground-fixed', 'fp-h-src', 'fp-h-attr', 'fp-h-fixed', 'fp-h-ref', 'fp-h-factor', 'fp-fallback', 'fp-crs', 'fp-epsg'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', onFpChanged);
  });
  document.getElementById('fp-table').addEventListener('change', onFpTableChanged);
  const gmlInput = document.getElementById('gml-input');
  gmlInput.addEventListener('change', function () {
    if (gmlInput.files && gmlInput.files.length) handleGmlFiles(gmlInput.files);
  });

  document.getElementById('osm-toggle').addEventListener('change', onOsmToggle);
  document.getElementById('osm-btn').addEventListener('click', function (e) { if (e && e.stopPropagation) e.stopPropagation(); toggleOsmCard(); });
  window.addEventListener('click', function (e) {
    const t = e && e.target, card = document.getElementById('osm-card');
    if (t && t.closest && card && card.classList.contains('open') && !t.closest('#osm-ctl')) toggleOsmCard(false);
  });
  window.addEventListener('keydown', function (e) { if (e && e.key === 'Escape') toggleOsmCard(false); });
  // Neues Gelände bei eingeschalteter Karte: die Karte lädt sich neu, bei Fehlern geht sie aus
  osmMap.onChange = function (s) {
    const tg = document.getElementById('osm-toggle');
    if (s.error) {
      tg.checked = false;
      if (s.error === 'noCrs') setOsmStatus('osmNoCrs', 'err', { c: (TERRAIN && TERRAIN.epsg) ? 'EPSG:' + TERRAIN.epsg : '' });
      else setOsmStatus('osmNoTiles', 'err');
    } else if (s.on && s.failed === 0) setOsmStatus('osmLoaded', 'ok', { n: s.tiles });
    else if (s.on) setOsmStatus('osmPartial', 'ok', { m: s.failed, n: s.tiles + s.failed });
  };

  document.getElementById('gml-clear').addEventListener('click', function () {
    clearBuildings();
    lastGmlRings = null;
    lastFootprints = null;
    renderFpPanel();
    demoAttribGml = false;
    refreshAttribution();
    setFileStatus('gml', T('noFile'));
    setStatus(T('msgBuildingsRemoved'));
  });

  document.getElementById('reset-view').addEventListener('click', function () {
    frameTerrain();
    setStatus(T('msgViewReset'));
  });

  document.getElementById('ifc-target').addEventListener('change', updateIfcTargetUi);
  document.getElementById('ifc-export-btn').addEventListener('click', function () {
    runIfcExport();
  });
  document.getElementById('ifc-cancel-btn').addEventListener('click', function () {
    clearExportPreview();
    setStatus('');
  });

  document.getElementById('clear-all').addEventListener('click', function () {
    if (!objects.length) { setStatus(T('msgNothingToClear')); return; }
    askConfirm('confirmClear', { n: objects.length }, 'confirmClearYes', clearAllObjects);
  });
  document.getElementById('reset-all').addEventListener('click', function () {
    askConfirm('confirmReset', {}, 'confirmResetYes', resetEverything);
  });
  document.getElementById('confirm-no').addEventListener('click', closeConfirm);
  document.getElementById('confirm-yes').addEventListener('click', function () {
    const act = confirmAction;
    closeConfirm();
    if (act) act();
  });
  document.getElementById('confirm-wrap').addEventListener('click', function (e) { if (e && e.target === document.getElementById('confirm-wrap')) closeConfirm(); });

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
  document.getElementById('help-btn').addEventListener('click', function () { toggleHelp(); });
  document.getElementById('help-close').addEventListener('click', function () { toggleHelp(false); });
  document.getElementById('tweak-close').addEventListener('click', function () { toggleTweak(false); });

  const dom = renderer.domElement;
  dom.addEventListener('pointermove', onCanvasMove);
  dom.addEventListener('pointerdown', onCanvasPointerDown);
  dom.addEventListener('pointerup', onCanvasPointerUp);
  dom.addEventListener('pointercancel', onCanvasPointerCancel);
  window.addEventListener('pointerdown', onOrbitPointerDown, true);
  // Mausrad: eine laufende Kamerafahrt zum Klickpunkt endet, sonst zieht sie die Kamera zurück;
  // ging das Loslassen verloren, ist OrbitControls wieder frei (controls.enabled blieb sonst aus)
  window.addEventListener('wheel', function (e) { if (e.target === dom) onCanvasWheel(e); }, { capture: true, passive: true });   // vor OrbitControls
  window.addEventListener('blur', endOrbitDrag);
  dom.addEventListener('pointerleave', onCanvasPointerCancel);
  window.addEventListener('keydown', onKeyDown);

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  initStartMap();
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
    toggleHelp: toggleHelp,
    handleIfcFile: handleIfcFile,
    startIfcManual: startIfcManual,
    cancelIfcPick: cancelIfcPick,
    finishIfcPick: finishIfcPick,
    removeIfc: removeIfc,
    refreshIfcAfterTerrain: refreshIfcAfterTerrain,
    getIfcPick: function () { return ifcPick; },
    setIfcPick: function (p) { ifcPick = p; },
    buildHelpPanel: buildHelpPanel,

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
    pitAngleShown: pitAngleShown,
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
    startRuler: startRuler, stopRuler: stopRuler, finishRuler: finishRuler, rulerClick: rulerClick, rulerRemoveLast: rulerRemoveLast,
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
    isAddNodeMode: isAddNodeMode,
    resetUIState: function () {
      toolParams = {};
      formRefs = {};
      lastGmlRings = null;
      lastFootprints = null;
      lastDemTiles = null;
      lastDemNames = [];
      gridLimit = MAX_GRID;
      roadPoints = [];
      pressInfo = null;
      pivotDrag = null;
      addNodeMode = false;
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
