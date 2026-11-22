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

**Mausrad (3D-Ansicht).** `onCanvasWheel` setzt `controls.zoomSpeed` je Ereignis so (`linearZoomSpeed`), dass der Abstand um eine feste Strecke wächst oder schrumpft
(`wheelStepMeters`: Geländekante / 60, mindestens 5 m); `lib/OrbitControls.js` bleibt unverändert. Der Listener hängt am `window` (Capture), damit er vor OrbitControls läuft.

**Punktwolken (LAS/LAZ).** Abschnitt „Punktwolken“ in `app.js`: `lasHeader` (Kopf, Bezugssystem aus GeoKey 3072 oder WKT-VLR 2111/2112, bei LAS 1.4 auch aus den EVLRs), `lasPeekEpsg` (nur Kopf lesen,
damit `handleDemFiles` vorher weiß, ob die Wahl des Bezugssystems fehlt), `lasForEachPoint` (LAS direkt, LAZ über `laz-perf`: `getLazPerf` lädt `lib/laz-perf.js` erst beim ersten LAZ, ein Punkt je `getPoint`),
`readLasTile` rastert Klassen 2 und 9 (Mittel je Zelle, `LAS_MAX_CELLS`), sonst den tiefsten Punkt; Lücken über `lasFillGaps`. Rasterweite aus der Punktdichte (0,5 bis 10 m). Wolken über `LAS_WINDOW_EXTENT` (3 km)
brauchen den Pin (`currentSiteWindow`). Fehler sind Schlüssel (`lasBad` ...), `lasErrText` übersetzt. Testdateien `test/fixtures/cloud_*.la[sz]` (laspy, synthetische Fläche); in den UI-Tests liegt `createLazPerf`
mit eingebettetem wasm im Sandkasten. Ungeprüft: echte Daten des ČÚZK (S-JTSK, Klassen) - kein Zugang.

**XYZ-Dateien.** `readXyzTile` (über `readTiffTiles(items, epsg)`, Endungen `.xyz/.txt/.csv`)
macht aus Textzeilen (Rechts Hoch Höhe, Punkt als Dezimalzeichen) dieselbe Kachel wie `readTiffTile`:
Rasterweite = häufigster Koordinatenabstand, Punkte gelten als Zellmitten, Lücken sind NoData
(-9999). Die Datei trägt kein Bezugssystem; die Oberfläche fragt es ab (`xyz-crs`, `xyz-epsg`,
`getXyzEpsg`, vorgemerkte Dateien in `pendingDemFiles`, zuletzt gelesene in `lastXyzLoad`: ein späterer Wechsel liest sie neu) und warnt, wenn der Code die Mitte weit
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

**Große GeoTIFF.** Dateien über `TIFF_BLOB_BYTES` (300 MB) gehen nicht über `arrayBuffer()`, sondern als Blob in `readTiffTileWindow`
(`GeoTIFF.fromBlob`: liest nur Kopf und die Blöcke des Fensters). Das Fenster kommt aus der Startkarte (`currentSiteWindow` in `ui.js`: Quadrat
`{lon,lat,size}` um den Pin, in Metern im Bezugssystem der Datei; `readTiffTileWindow` versteht auch ein Rechteck `{w,e,s,n}` in Länge/Breite). Ohne Fenster nur, wenn das Raster
unter `TIFF_MAX_PIXELS` bleibt. Ein Fenster außerhalb der Datei gibt `null` (Meldung nur, wenn es in keiner liegt). Geprüft an der echten
BEV-Kachel (ALS_DTM_CRS3035RES50000mN2800000E4750000.tif: BigTIFF, COG, 512er Blöcke, LZW mit Gleitkomma-Prädiktor, 7,9 GB): Fenster 1 km in
0,5 s, 5,5 MB gelesen, Werte gleich GDAL. In Node geht das nur mit einem eigenen Blob-Ersatz: `fs.openAsBlob` meldet über 4 GB die Größe modulo
2^32. EPSG:3035 (`laeaForward`/`laeaInverse`, `projForward`/`projInverse` in `app.js`) ist gegen `gdaltransform` auf 1 cm geprüft.

**CityJSON.** `parseCityJSON` (app.js, neben `parseCityGML`) liefert dieselbe Ringliste wie CityGML (`[x, y, z, ...]`, Rechtswert, Hochwert,
Höhe im Bezugssystem der Datei). `parseBuildingText` wählt nach dem ersten Zeichen (`{` oder `[` = JSON). Je CityObject nur die Geometrie mit
der höchsten LoD (3DBAG liefert 0, 1.2, 1.3, 2.2 übereinander), LoD unter 1 (Grundriss) und TINRelief, Pflanzen, Wasser, Landnutzung fallen weg;
Löcher werden ignoriert. Formen: CityJSON 1.x/2.0 (`transform` aus Maßstab und Verschiebung), CityJSONSeq (Kopfzeile mit `transform`, je Zeile ein
`CityJSONFeature`), Merkmalsliste (`features`, `metadata.transform`). Geprüft an einem echten 3DBAG-Merkmal (api.3dbag.nl, EPSG:7415).

**2D-Gebäude (GPKG, SHP, GeoJSON).** Abschnitt „Gebäude aus 2D-Daten“ in `app.js`: eigene Leser `parseGeoJsonFootprints`, `parseShp`/`parseDbf`/`fpPrjEpsg`
(`parseShapefileSet`) und ein minimaler SQLite-Leser (`sqliteOpen`, nur Lesen, UTF-8, Tabellen-B-Bäume, Überlaufseiten; `readGpkgFootprints`: Geometrie aus GP-Kopf plus WKB,
R-Baum-Fenster über `rtree_<tabelle>_<spalte>_node`, 128-KB-Blöcke über `Blob.slice`, sonst Gesamtlesen). Datensatz `{epsg, feats: [{polys: [{outer, holes}], props}], fields}`.
`footprintRings(set, opts)` baut daraus Ringe im CityGML-Format (Wände je Kante, Dach per Ear-Clipping `triangulatePolygon`, Löcher über Brücken `fpBridgeHoles`); Gelände aus
Modell (tiefster Punkt) / Attribut / fest, Höhe aus Attribut (über Grund oder absolut, Faktor) / fest, Ersatzhöhe, Umrechnung ins Geländesystem über `crsTransformer`. UI in `ui.js`
(`handleFootprintFiles`, `renderFpPanel`, `applyFootprints`, `lastFootprints`, Feld `#fp-panel`); nach einem Geländewechsel werden die Grundrisse neu aufgesetzt. Das Fenster zum Lesen
ist das Gelände samt 20 % Rand (`fpWindowFor`). Testdateien in `test/fixtures/` (mit ogr2ogr erzeugt). Geprüft an `DLM_8000_BAUWERK_20260323.gpkg` (BEV, 2,5 GB, EPSG:31255, Tabelle
`BWK_8100_BAUWERK_F`: `HOEHE_BODEN_*` absolut, `HOEHE_OBJEKT_*` über Grund).

**Frankreich/Spanien.** `frLidar` (78 % der Fläche, Stand 6.9.2026, plus Link „Abdeckung nach Gemeinde") und `esMdt` ersetzen das pauschale `euPartial`; REGCAN95 (EPSG:4082/4083, Kanaren) steht in `crsGeoDefinition` (4083 = ETRS89 UTM 28N, 4082 = UTM 27N).

**Gebäudemodelle (LoD).** In `GEO_EU` tragen Estland, Polen, Finnland und Flandern (`only.state`) einen `bldg`-Eintrag; Notizen `plLod2`, `bldgShp` (nicht ladbar), Österreich: `GEO_AT_FEDERAL_BLDG`
(`atGpkg`). `bldgNote` (`noEuBldg`) erscheint nur, wenn nach dem Filtern kein Link bleibt. Stadtmodelle (3D) stehen in `GEO_CITIES` (`kind: '3d'`). Nicht geladen werden GeoPackage,
Shapefile und KML; die Anwendung liest CityGML und CityJSON.

**Teilgebiete eines Landes.** Ein Link in `GEO_EU` kann `only: { county: [...] }` tragen (Italien: Südtirol); `placeMatchesOnly` vergleicht mit dem Landkreis, den Photon liefert
(`place.county`, über `parsePhoton` und `photonReverse`). Ohne Landkreis wird der Link nicht gezeigt. `only: { state: [...] }` gleicht die Provinz genau ab (Belgien:
Flandern und Wallonien; Photon liefert dort die Provinz als `state`). Passt bei einem Land mit nur regionalen Links keiner, steht der Hinweis `euNoOpenDem` (Brüssel).

**Stadtgeoportale.** `GEO_CITIES` (`app.js`, Liste von `{cc, name, names, links:[{kind: 'map'|'data'|'3d', label, url}]}`) ist eine eigene Tabelle neben den Ländern;
`cityPortalsFor(place)` gleicht Land und Stadtname (`place.city` von Photon, ohne Akzente über `addrNorm`) mit `names` ab, `renderPlaceInto` hängt die Gruppe `addrCity` an
(Adressleiste und Fenster am Pin). Regeln wie bei `GEO_EU`: nur Links, die bei der Prüfung antworteten, keine geratenen. Ein Test hält die Tabelle und beide README-Tabellen
(Abschnitt „Stadtgeoportale“) gleich.

**Geoportale der EU.** `GEO_EU` (nach ISO-Code, 25 Länder außer DE/AT) neben `GEO_ENTRIES` und den AT-Tabellen; `geoSourcesFor` liefert
auch `demNote`. Regeln: nur Links, die bei der Prüfung antworteten; `fmt: 'tif'` nur, wo die Seite selbst GeoTIFF nennt, sonst
`'unclear'` mit Hinweis; Länder ohne bekanntes offenes DGM tragen `demNote: 'euNoOpenDem'` statt eines geratenen Links. Quelle der
Liste und der Lizenzen: Landesvermessungen und maps3d.io/dataset (Stand November 2026). Ein Test hält `GEO_EU` und beide README-Tabellen
gleich. Photon sucht in der EU (`PHOTON_BBOX`, `isSearchCountry`), eingetippte Koordinaten gelten für die EU. Viele Länder liefern in einem
eigenen Bezugssystem; `crsGeoDefinition` kennt UTM, Gauß-Krüger, MGI, LAEA (3035), Web-Mercator und die nationalen Systeme in `EU_NATIONAL_CRS`
(Gauß-Krüger mit Breitenursprung `lat0`, Lambert-Kegel `lcc`, schiefe Stereographie `sterea`, Krovak `krovak`; Datumswechsel `helmert`, bei S-JTSK eine Funktion nach Lage:
Tschechien/Slowakei). Parameter stammen aus PROJ (`gdalsrsinfo -o proj4`, `projinfo`), der Test "Nationale Bezugssysteme der EU" vergleicht 59 Punkte mit `gdaltransform`.
Unbekannt sind Ungarn (EOV), Rumänien (Stereo 70), Bulgarien, Zypern; dort schaltet sich die Karte ab.

**Startkarte.** Solange `TERRAIN` null ist (`updateTerrainInfo` -> `showStartMap`), liegt `#startmap` über dem Canvas: eigene
Web-Mercator-Karte ohne Bibliothek (`smWorldPx`, `smLonLat`, `smTileList` in `app.js`, Darstellung und Maus in
`ui.js`, Abschnitt Startkarte). Kacheln (`OSM_TILE_URL`) werden erst nach dem Klick auf `#sm-load` angefragt (Datenschutz:
IP-Adresse an OSM); nie beim Start. Der Klick ruft `chooseAddrItem` auf (Ort wie eine eingegebene Koordinate,
Links des Landes über `geoSourcesFor`), `noFly` hält die Karte still. Der Klick setzt einen Pin (`#sm-marker`) und öffnet
`#sm-pop` mit den Links (`renderPlaceInto`, `smRenderPop`; folgt dem Pin, Esc und × schließen). Die Karte steht auch über einem geladenen Gelände, wenn ein Ort außerhalb gewählt wird (`smForced`, `placeInsideTerrain`; Knopf `#sm-back`, Esc); ein
neues Gelände (`updateTerrainInfo`) setzt `smForced` zurück. Vor dem Klick "Karte laden" nennt `#sm-consent-place` den gewählten Ort (Knopf `smLoadAt`).
Für Österreich (`country === 'AT'`) hängt `smAddCutBlock` einen `gdal_translate`-Befehl an (`smCutWindow`, `gdalCutCommand`,
`-projwin_srs EPSG:4326`: unabhängig vom Bezugssystem der Datei, auch 3035). Das Fenster scrollt (`#sm-pop-scroll`) und weicht
neben den Pin aus, wenn es oben und unten nicht passt. Orte von der Karte tragen
`fromMap`: dann bleibt `#addr-result` leer und das Eingabefeld unberührt; die Adressleiste zeigt die Links nur bei einer Eingabe dort.
Achtung Stapelreihenfolge: `#sm-tiles` ist ein eigener Stapelkontext (`isolation`), sonst liegen die Kacheln (z-index = Stufe) über Pin und Fenster. Kein localStorage: die Einwilligung gilt nur bis zum
Neuladen. Zoomen: stufenlos (`smZoomBy`, `smAnimStep`); Kacheln der nächsten ganzen Stufe werden skaliert, zwei grobe Unterlagen (3 und
6 Stufen darunter) füllen Lücken, alte Kacheln bleiben, bis die neuen geladen UND eingeblendet sind (sonst blitzt der Hintergrund). Mit `?demo=1` erscheint sie nicht. Die Karte lädt kein Gelände; das tut weiterhin der Nutzer mit den Dateien.

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
