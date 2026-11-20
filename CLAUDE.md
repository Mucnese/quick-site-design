# Quick-Site-Design

Baustelleneinrichtungsplanung im Browser auf Grundlage amtlicher Geobasisdaten.
Eine HTML-Datei plus vier Bibliotheken, kein Server, kein Framework.

**Sprache: Deutsch.** Kommentare, Meldungen, Dokumente und Antworten auf Deutsch.

---

## Arbeitsablauf

Nach jeder Änderung an `src/`:

```bash
python3 build.py
node test/test.js
node test/test-ui.js
node test/validate-html.js
```

Alle drei Testläufe müssen grün sein, bevor etwas als fertig gilt. `index.html`
wird nie von Hand bearbeitet — sie entsteht aus `src/`.

Neue Funktionen bekommen Tests. Bei Fehlern erst einen Test schreiben, der ihn
zeigt, dann beheben.

---

## Aufbau

| Datei | Inhalt |
|---|---|
| `src/shell_head.html` | HTML-Gerüst, komplettes CSS, Einbindung von `lib/` |
| `src/app.js` | Szene, Gelände, Bausteine, Geometrie, Objektverwaltung |
| `src/ui.js` | Oberfläche, Formulare, Dateiimport, Sprachen |
| `src/boot.js` | Startsequenz und Renderschleife |

`build.py` entfernt die Node-Exportblöcke am Ende von `app.js` und `ui.js` und
hängt alles in ein `<script>`. Beide Dateien liegen im Browser deshalb im selben
Scope und teilen sich `scene`, `TERRAIN`, `objects`, `activeTool`, `SETTINGS`.

Die Exportblöcke am Dateiende dienen nur den Tests. Neue Funktionen, die getestet
werden sollen, dort eintragen.

---

## Tests

`test/three-stub.js` bildet die genutzte Three.js-Teilmenge nach und wirft bei
Fehlbedienung — dadurch fallen falsche Indizes und Tippfehler auf.
`test/xml-stub.js` ersetzt den `DOMParser`. `test/test-ui.js` lädt `app.js` und
`ui.js` über `vm` in einen gemeinsamen Scope, wie es der Browser tut.

Ein Browser ist für die Tests nicht nötig und auch nicht verfügbar.

---

## Festlegungen, die nicht verhandelbar sind

Jeder Punkt war schon einmal Fehlerursache.

**Achsen:** `+x = Ost`, `-z = Nord`, `y` = Meter über `TERRAIN.zmin`. Nord auf
`+z` ergibt von oben ein Spiegelbild.

**Maßstab:** 1 Einheit = 1 Meter, keine Überhöhung.

**Kein Startgelände.** Die Seite startet leer, Bausteine bleiben gesperrt, bis
eine Datei geladen ist.

**Kein `localStorage`/`sessionStorage`.** Einstellungen gelten nur für die
Sitzung. Die Datenschutzerklärung sagt das ausdrücklich zu.

**XYZ-Dateien.** `readXyzTile` (über `readTiffTiles(items, epsg)`, Endungen `.xyz/.txt/.csv`)
macht aus Textzeilen (Rechts Hoch Höhe, Punkt als Dezimalzeichen) dieselbe Kachel wie `readTiffTile`:
Rasterweite = häufigster Koordinatenabstand, Punkte gelten als Zellmitten, Lücken sind NoData
(-9999). Die Datei trägt kein Bezugssystem; die Oberfläche fragt es ab (`xyz-crs`, `xyz-epsg`,
`getXyzEpsg`, vorgemerkte Dateien in `pendingDemFiles`) und warnt, wenn der Code die Mitte weit
außerhalb Europas legt. Grenze `XYZ_MAX_POINTS` (30 Mio.). ESRI-ASCII-Raster werden abgelehnt.

**Linke Spalte.** Suche, Übersicht und Daten (`#col-left-body > .panel`) schrumpfen bei Platzmangel; nur das Datenfenster scrollt, Adresseingabe (`#locate`) und Übersicht (`#overview`) nie; `#about` (Quellen, Recht) steht fest darunter.

**Messen.** Werkzeug `ruler` in der Leiste (`startRuler`, `rulerClick`, `drawRuler`, nicht über `selectTool`): Punkte auf Gelände/Gebäude
(`raycastGround`), `rulerStats` (app.js) rechnet waagerecht, im Raum, Höhenunterschied, Gefälle; alle Anzeigen mit zwei
Nachkommastellen. Streckenschilder laufen über `updateSegLabels` (Feld `text`), Panel `#ruler-panel`, Hinweis `#ruler-hint`.

**Hinweise und Meldungen** stehen immer oben in der Mitte, untereinander im Container `#notices`
(`#road-hint`, `#ifc-hint`, `#busy-hint`, `#status`), alle mit 12 px. Lange Arbeit (CityGML, IFC) zeigt `showBusy`/`hideBusy`; davor `await yieldToPaint()`, sonst blockiert die Arbeit, bevor der Hinweis gezeichnet ist (Tests ersetzen `yieldToPaint`). Neue Hinweise dort einsetzen, nicht als eigenes
`position: fixed` an anderer Stelle.

**Adressleiste (Photon).** Zweite Verbindung nach außen neben der OSM-Karte: `photonSearch`
fragt `photon.komoot.io` (nur ab 3 Zeichen, 350 ms Entprellung, Ergebnisse auf DE/AT gefiltert,
`lang=de`), `parsePhoton` macht Vorschläge, `geoSourcesFor` ordnet das Bundesland (Photon-Feld
`state`) den Links aus `GEO_ENTRIES` zu (entspricht der README-Tabelle, ein Test prüft die Links).
`addrHasMatch`/`addrStem` lösen die Nachfrage mit dem Namensstamm aus, wenn nichts Passendes kommt;
`parseCoordinates` erkennt Koordinaten (Breite/Länge, UTM, Gauß-Krüger) ohne Suche, `photonReverse` ermittelt
beim Wählen Ort und Bundesland. Es wird nichts heruntergeladen. Die Datenschutzerklärung nennt die Adressleiste als Einwilligung
durch die Eingabe; der Hinweis steht unter dem Feld (`addr-note`) und darf nicht entfallen.
Links in `GEO_ENTRIES` ändern, wenn sich die README-Tabelle ändert.

**GeoTIFF-Größe.** `readTiffTile` liest ganze Dateien in den Speicher (4 Byte je Pixel).
`checkTiffFiles` und `checkTiffPixels` lehnen vor dem Einlesen ab (`TIFF_MAX_*`: 1 GB je
Datei, 100 Mio. Pixel je Kachel, 150 Mio. Pixel und 2 GB gesamt; Schätzwerte für etwa 8 GB
RAM, nicht gemessen). Teilweises Lesen mit `geotiff.js` (Fenster, Verkleinern beim Lesen)
wäre der Weg zu größeren COGs, ist aber nicht gebaut.

**Hilfe und Anleitung.** Der Knopf „Hilfe“ (`help-btn`, `toggleHelp`, `buildHelpPanel`) zeigt sieben
Kurzabschnitte aus `STRINGS` (`helpS1T`..`helpS7B`, beide Sprachen) und verlinkt auf
`BENUTZERANLEITUNG.md` bzw. `USER-GUIDE.en.md` im Hauptzweig. Wer eine Funktion ändert, die dort
beschrieben ist, passt Anleitung (beide Sprachen) und Kurzhilfe mit an.

**Content Security Policy.** `index.html` trägt eine CSP im `<meta>`-Element (`src/shell_head.html`); `build.py` ersetzt
`__CSP_SCRIPT_HASH__` durch die Prüfsumme des einen Inline-Skripts, deshalb kein `unsafe-inline` für Skripte. Neue Fremdserver, Inline-Ereignisse
(`onclick=`) oder `eval` brechen die Seite: erst die Richtlinie und die Datenschutzerklärung anpassen (`test/validate-html.js` prüft die Liste).
Die Bibliotheken in `lib/` haben Prüfsummen in `lib/SHA256SUMS` (Test); bei einem Austausch Datei, Prüfsumme, `lib/LIESMICH.txt` und
`THIRD-PARTY-NOTICES.md` zusammen ändern.

**Open-Source-Dateien.** `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `THIRD-PARTY-NOTICES.md`, `CHANGELOG.md`/`CHANGELOG.en.md`,
`.github/` (Vorlagen). Eine Datei `.github/workflows/ci.yml` darf lokal liegen, wird aber nicht hochgeladen (`.gitignore`). Neue sichtbare Änderung: Eintrag im Änderungsprotokoll (beide Sprachen).

**Keine CDN-Verweise.** Die vier Bibliotheken liegen in `lib/` (web-ifc nur lokal und unverändert, Lizenztext `lib/LICENSE-web-ifc.txt`; es steht nicht als `<script>` im HTML, `getWebIfc` lädt es erst beim ersten IFC-Import). Ein neuer
`<script src>` auf einen fremden Server würde die Datenschutzerklärung
unrichtig machen.

**Verbindungen nach außen: die Karte (OpenStreetMap) und die Adressleiste.** Die Karte läuft nur auf Schalter im
Fenster am Kartenknopf unten links (`#osm-btn`, `#osm-card`, `toggleOsmCard`), Standard aus (`osmMap`, `setOsmMap`): der Browser lädt dann Kacheln von
`tile.openstreetmap.org` (`OSM_TILE_URL`), die als Farbe über das Gelände gelegt
werden (`mapShader` in `terrainShader`, `osmMapPlan` rechnet die Kachelauswahl und die
affine Abbildung Welt -> Bild; `crsToLonLat` rechnet UTM, Gauß-Krüger DHDN und Österreich
GK/MGI um, Referenz pyproj). Die Datenschutzerklärung beschreibt das als Einwilligung durch
den Schalter; Quellenhinweis „© OpenStreetMap-Mitwirkende" erscheint, solange die Karte an
ist. Weitere externe Anfragen (andere Kartendienste, Schriften, Zähler) dürfen nicht
dazukommen, ohne dass die Erklärung nachgezogen wird. Bezugssysteme, die `crsGeoDefinition`
nicht kennt, schalten die Karte mit Fehlermeldung ab.

**Krandrehung:** `g.rotation.y = baseRot`, `slew.rotation.y = rot - baseRot`.
So bleibt der Auslegerwinkel absolut, unabhängig vom Fundament.

**Gelände in Kacheln.** `terrainMesh` ist eine Gruppe aus 64×64-Zellen-Kacheln,
keine einzelne Ebene mehr. Die Höhendaten (`TERRAIN.rel`) liegen fest in der höchsten Rasterstufe
(`GRID_MAX`, es gibt keinen Detailregler mehr); nur das gezeichnete Mesh wird je
Kachel gröber, je weiter sie weg ist (`updateTerrainLod`). Höhenabfragen, Objekte und IFC dürfen nie am
Mesh hängen, sondern an `getHeightAt`. Raycasts gegen das Gelände immer
rekursiv (`intersectObject(terrainMesh, true)`).

**Maussteuerung:** links drehen, rechts und Mitte verschieben, Rad zoomt. Linke
Taste auf einem Treffer (Gelände, Gebäude, Baustein) dreht über `orbitAround`
um genau diesen Punkt – ein Capture-Handler am Fenster entscheidet vor
OrbitControls und schaltet es für die Geste mit `controls.enabled = false` ab.
OrbitControls selbst würde nur um sein Ziel drehen und die Ansicht springen
lassen. Auf dem Hintergrund übernimmt OrbitControls das Umkreisen.

**Platzierung** über `pointerdown`/`pointerup`, nicht `click`. Mit
Bewegungstoleranz 5 px, Wiederholungssperre 250 ms, nur linke Maustaste. Sonst
entstehen doppelte Objekte.

**Gebäude brauchen `side: THREE.DoubleSide`.** LOD2-Wandpolygone sind
uneinheitlich gewickelt; sonst fehlt die Hälfte der Wände.

**Auswahlrahmen** aus `userData.selBox`, nicht `THREE.BoxHelper` — der ignoriert
Instanz-Matrizen und liegt bei Containerblöcken falsch.

**`showRoadNodes` ruft `dropNodeGroup()`**, nicht `clearRoadNodes()`, sonst geht
bei jedem Neuaufbau die Knotenauswahl verloren.

**Esc prüft zuerst den aktiven Knoten**, sonst verschwindet die Objektauswahl
gleich mit.

**Detailstufe „Original"** kommt als `maxGrid === 0`. Ein `||`-Fallback macht
daraus die Voreinstellung — der Sonderfall muss ausdrücklich geprüft werden.

**`FIELD_ORDER[type] || 9`** ist eine Falle: `select` hat Rang 0, der
Kurzschluss macht daraus 9. Deshalb `fieldRank()`.

---

## Daten

**Krane.** Der Mobilkran hat weiterhin einen echten Modellkatalog: 24 Liebherr
LTM, alle Werte aus den Original-Datenblättern. Nicht belegte Felder stehen
auf `null`; die Oberfläche lässt den Reglerbereich dann offen, statt einen
Anschlag zu erfinden. **Keine Werte schätzen oder interpolieren.**

Der Turmdrehkran ist dagegen kein Herstellerkatalog mehr, sondern ein
**einziges generisches Modell** (`TOWER_LIMITS` in `app.js`) mit frei
einstellbaren Parametern. Die Grenzen sind Minimum und Maximum aus den 34
Modellen, die früher hier standen (18 Liebherr, 16 WOLFFKRAN – die Rohdaten
stehen in der Git-Historie vor dieser Änderung). `kind` ist fest auf „flat"
(spitzenloser Obendreher), das war die unter den 34 Modellen häufigste
Bauart. Deshalb hat der Turmdrehkran auch keinen Datenblatt-Link mehr im
Objekt-Editor – nur noch der Mobilkran, der ein echtes Herstellerprodukt
bleibt.

**Baustraße.** Längsneigung (`params.slope`, in %; einheitlich) oder je Abschnitt (`params.sectionSlopes`,
ein Wert je Strecke zwischen zwei gesetzten Punkten; sind alle gleich, wird sie wieder einheitlich),
keine Querneigung, Start auf der Geländehöhe des ersten Punkts. Die einheitliche Neigung wird beim Setzen und
bei jeder Punktänderung neu aus dem Gelände abgeleitet (`autoRoadSlope`, `resetRoadSlope`), der
Regler überschreibt sie danach und macht alle Abschnitte gleich (`setRoadUniformSlope`, im Fenster steht bei
verschiedenen Werten „variabel“, `markRoadSlope`). Eigene Neigungen bleiben beim Verschieben eines Punkts
erhalten, ein neuer Punkt teilt, ein gelöschter vereint Abschnitte. Der Höhenverlauf ist zwischen den
Stationen der Punkte (`nodeStations`, Weglänge entlang der ausgerundeten Mitte) linear (`computeRoad`,
`parts` mit Länge, Neigung, Mitte). Achslinie (`addRoadAxis`, `kind: 'roadAxis'`, nicht im IFC) und die
Eingabefelder über/unter der Linie (`updateAxisLabels` in `ui.js`, ein `#axis-labels`-Container wie bei
`#seg-labels`): Neigung `setRoadSectionSlope`, Länge `setRoadSectionLength` (Endpunkt und folgende Punkte
rücken um dieselbe Strecke, die Länge wird in wenigen Schritten angenähert). Böschung wählbar 1:1, 1:1,5 oder 1:2
(`params.embank` = n m Breite je 1 m Höhe, Standard und Rückfall 1:1); Auftrag und Abtrag aus dem
Mittelflächenverfahren in `computeRoad`. Alles Volumen stammt aus dieser einen
Funktion – nicht in der Oberfläche nachrechnen.

**Baugrube.** Polygon (`params.points`, höchstens 32 Ecken), Tiefe `params.depth`
(Standard −5 m) zum MITTLEREN Gelände im Polygon. Die absolute Unterkante ist kein
Parameter, sondern folgt aus `computePit(...).bottomAbs`; beide Regler zeigen denselben
Wert (der Editor rechnet um). Aushub und Aufschüttung nur aus `computePit`. Das Gelände
bekommt das Loch per Fragment-Shader (`pitHoleShader`, `pitUniforms`, auch am Sockel);
die Höhendaten bleiben unverändert, deshalb ändern sich Mengen, Objekthöhen und IFC nicht.
Raycasts überspringen weggeschnittene Geländestücke (`firstVisibleHit`). Bekannte Grenze:
Bausteine, die in einer Grube stehen, sitzen auf der Höhe des ursprünglichen Geländes.
Böschung der Grube: `params.angle` in Grad (`PIT_ANGLE_MIN` 20 bis `PIT_ANGLE_MAX` 90,
90 = senkrecht, Standard). Der gezeichnete Umriss bleibt die Oberkante; die Sohle ist ein
nach innen versetztes Polygon (`polygonInset`, Gehrung), der Abstand je Ecke ist
|Geländehöhe − Sohle| / tan(Winkel). Wird die Grube dafür zu schmal (`insetValid` schlägt
fehl), verkleinert `computePit` den Versatz per Bisektion und meldet `clamped` und den
tatsächlichen steileren Winkel `angleEff`; die Mengen rechnen mit diesem Winkel.
Baustraße und Baugrube werden mit Rechtsklick oder Leertaste abgeschlossen.

**Schleppkurve Sattelzug.** `params.showSwept` der Baustraße (Standard aus). Reine Rechnung
in `sweepSemiTruck` (Einspurmodell: Vorderachse folgt der Straßenmitte, Hinterachse der
Zugmaschine und Ersatzachse des Aufliegers laufen ohne Schlupf nach, 5 Teilschritte je
0,25 m) und `checkSemiTruck` (größte seitliche Abweichung links/rechts von der Mitte,
Bedarf = 2 × das Größere, `fits`/`over`). `sweptOutlines` (Raster und Marching Squares)
und `addSweptOverlay` sind nur Darstellung (blaue Fläche, Rand; rot, wo er über die
Fahrbahn hinausragt). Fahrzeugwerte stehen in `SEMI_TRUCK` mit Quelle: Autodesk Vehicle Tracking, Export
"Sattelzug 16,5" (V26.00, 5 km/h; ersetzt seit 2026-11-20 das Luzerner Blatt 736.107.2). Aus der DXF stammen die
Maße der Fahrzeugzeichnung (Stoßfänger–Vorderachse 1,43, Radstand 3,95, Sattelzapfen 4,65 vom Stoßfänger, Zugmaschine
6,20, Auflieger 13,59, Achsen 6,2/7,6/9,0 m hinter dem Sattelzapfen, Heck 2,85 hinter der letzten Achse) und die
Kontrollradien (äußere Karosserie 12,5, äußeres Rad 11,962, inneres Rad 5,277 bei Hinterachse auf 10,0 m; Vollausschlag
7,028 und 7,9 m Wand zu Wand). Die drei Achsen des Aufliegers sind durch eine Ersatzachse in ihrer Mitte (7,6 m)
ersetzt; damit stimmen die Radien auf wenige cm (Test "Wenderadien der Vehicle-Tracking-Vorlage"). Bekannte Lücken:
kein Lenk- und Knickwinkelgrenzwert, und das Heck schwingt beim Einlenken in der Vorlage weiter aus (0,42 m statt
0,30 m bei R = 10 m; 1,38 m statt 0,60 m bei Vollausschlag, wo VT mit 4 s Lenkzeit fährt). Die DXF enthält nur die
Fahrzeugvorlage und Umrisse; die Schleppkurven selbst stecken in Autodesk-Proxyobjekten und sind nicht lesbar. Neue
Fahrzeuge: nur `SEMI_TRUCK` ändern und die Kontrollradien erneut prüfen, nicht Werte raten.

**IFC-Koordinaten.** `buildIfc(..., {coords})`: `'abs'` (Voreinstellung der Oberfläche, Auswahl `ifc-coords`)
schreibt Rechtswert, Hochwert und Höhe ü. NHN in die Geometrie, IfcMapConversion ist dann Nullversatz;
`'local'` ist die IFC4-übliche Form (Geometrie ab der Nordwestecke, Lage in IfcMapConversion). In beiden
Fällen nennt IfcProjectedCRS Beschreibung, Datum, Abbildung und Zone (nur wo aus dem EPSG-Code ableitbar)
und IfcSite trägt RefLatitude/RefLongitude/RefElevation (über `crsToLonLat`). Mit ifcopenshell geprüft.

**IFC-Import** (`ifcReadModel`, `handleIfcFile`, Abschnitt „IFC-Import“ in `app.js` und `ui.js`): web-ifc liest
die Meshes (Meter, Y oben, `COORDINATE_TO_ORIGIN`); `ifcReadGeoref` holt IfcMapConversion und Längeneinheiten
(wirksamer Maßstab = Scale × Kartenmaßeinheit / Projekteinheit). Stimmt der EPSG-Code mit `TERRAIN.epsg`
überein, platziert `ifcAutoPlacement` das Modell absolut (Drehung aus Abszisse/Ordinate, Höhe über
`TERRAIN.zmin`). Sonst führt `startIfcManual` durch vier Klicks, abwechselnd Modell/Gelände (A Modell, A Gelände, B Modell, B Gelände);
`ifcTwoPointPlacement` rechnet nur Drehung um die Hochachse, Verschiebung und optional den Maßstab, das
Modell bleibt waagerecht. IfcConversionBasedUnit (z. B. Fuß) wird nicht ausgewertet. Nach dem Wechsel des
Geländes setzt `refreshIfcAfterTerrain` automatisch platzierte Modelle neu, manuell platzierte entfallen.

**IFC-Export mit Bausteinen und Zielsystem.** `collectExportObjects` holt je Baustein die Dreiecke
(`objectTriangles`: Meshes und Instanzen in Weltkoordinaten; Linien und `IFC_SKIP_KINDS`-Hilfsflächen der
Straße bleiben draußen); `runIfcExport` ruft es erst beim Exportieren (Häkchen `ifc-objects`). `opts.targetEpsg`
rechnet jeden Punkt mit `crsTransformer` um (Krüger-Reihe vor und zurück, Helmert für Bessel-Systeme DHDN/MGI,
dort nur etwa 1 bis 2 m, Höhen unverändert); bei anderem Ziel immer absolute Koordinaten. Zielsysteme: `IFC_TARGET_CRS`.
Farben: `objectTriangles` gibt je Dreieck `col` (Materialfarbe mal Instanzfarbe); `addGroup` schreibt je Farbe eine
IfcTriangulatedFaceSet mit IfcStyledItem und gemeinsamem IfcSurfaceStyle (`IFC_COLOR_*` für gleichfarbiges Gelände/Gebäude).
Neue Systeme nur mit nachgeprüften Parametern (der Test vergleicht über `crsToLonLat` mit PROJ-Referenzwerten).

**IFC-Gebäude am Rechteck.** `clipTrianglesToRect` schneidet die Gebäude-Dreiecke exakt an den vier Rechteckkanten ab (Höhen mit); früher entschied der Schwerpunkt, ganze lange Dreiecke blieben oder fehlten.

**Klick ohne Drehen.** Ein Klick bleibt ruhig: `onOrbitPointerMove` dreht erst nach `DRAG_TOLERANCE` Pixeln Weg (Handzittern),
und `updateControls` fährt Kamera und Drehzentrum mit demselben Schritt, sonst kippt die Blickrichtung kurz und schwingt zurück.

**IFC-Export** muss strenge Leser bestehen: reines ASCII (Umlaute als `\X2\`),
GUIDs mit erstem Zeichen 0–3, genaue Attributzahl je Entität, Gelände-Dreiecke
nach oben gewickelt. Nach Änderungen an `buildIfc` einmal mit ifcopenshell
gegenprüfen (nicht Teil des Projekts).

**Beispieldaten** in `demo/` stehen unter CC BY 4.0. `showAttribution` blendet
Herausgeber und Lizenz ein, solange sie geladen sind. Beim Austausch der Daten
muss `DEMO_ATTRIBUTION` in `ui.js` mitgeändert werden.

---

## Sprachen

Deutsch und Englisch. Wörterbuch in `STRINGS` (`ui.js`), Zugriff über `T(key)`.
Feste Markup-Texte tragen `data-i18n="key"`. **Beide Sprachen müssen dieselben
Schlüssel haben** — dafür gibt es einen Test.

---

## Rechtliches

`impressum.html` und `datenschutz.html` liegen neben `index.html` und werden
nicht mitgebaut. Ändert sich etwas an geladenen Fremdinhalten, muss die
Datenschutzerklärung nachgezogen werden.

Lizenz GPL-3.0-or-later (Version 3 oder später), Copyright 2026 Haoran Li. Der Vermerk steht im Kopf von
`index.html`, unten links in der Anwendung und in beiden READMEs.

---

## Stil

Kommentare erklären das Warum, nicht das Was. Deutsche Bezeichner in der
Oberfläche, englische in der Geometrie, wo es eingebürgert ist.

Keine Frameworks, keine Build-Kette außer `build.py`, keine neuen
Abhängigkeiten ohne Rückfrage.
