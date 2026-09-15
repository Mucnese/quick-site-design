# Quick-Site-Design — Entwicklernotizen

Copyright © 2026 Haoran Li · GNU GPL v3

Kurzreferenz für die Weiterarbeit. Alles Weitere steht im Code.

---

## Aufbau

`index.html` wird aus vier Quelldateien zusammengesetzt:

| Datei | Inhalt |
|---|---|
| `src/shell_head.html` | HTML-Gerüst, komplettes CSS, CDN-Skripte |
| `src/app.js` | Szene, Gelände, Bausteine, Geometrie, Objektverwaltung |
| `src/ui.js` | Bedienoberfläche, Formulare, Dateiimport, Sprachen |
| `src/boot.js` | Startsequenz und Renderschleife |

```bash
python3 build.py
```

Der Build entfernt die Node-Exportblöcke am Ende von `app.js` und `ui.js`.
Beide Dateien liegen im Browser deshalb im selben Scope und teilen sich ihre
Variablen (`scene`, `TERRAIN`, `objects`, `activeTool`, `SETTINGS`).

**Bibliotheken** liegen lokal in `lib/`: three.js r128, OrbitControls r128,
geotiff.js 2.1.3. Alle MIT, mit der GPLv3 verträglich. Bewusst kein CDN, damit
beim Aufruf keine Besucherdaten an Dritte gehen — das hält die
Datenschutzerklärung kurz. Die Dateien sind nicht im Repository; Bezugsquellen
in `lib/LIESMICH.txt`. **Version nicht wechseln**, die Anwendung ist gegen
three.js r128 gebaut.

**Rechtliche Seiten** `impressum.html` und `datenschutz.html` liegen neben
`index.html` und werden nicht mitgebaut. Ändert sich etwas an den geladenen
Fremdinhalten, muss die Datenschutzerklärung nachgezogen werden — derzeit
beschreibt sie den Zustand ohne jede CDN-Verbindung.

**Namensnennung.** Die Beispieldaten stehen unter CC BY 4.0. `showAttribution`
blendet Herausgeber und Lizenz ein, solange sie geladen sind, und wieder aus,
sobald eigene Daten hereinkommen. Beim Austausch der Beispieldaten muss
`DEMO_ATTRIBUTION` in `ui.js` mitgeändert werden.

---

## Tests

```bash
node test/test.js            # Kernlogik gegen three-stub.js
node test/test-ui.js         # app.js + ui.js im gemeinsamen Scope, DOM-Stub
node test/validate-html.js   # fertige Datei: Struktur, IDs, Syntax, Laufzeit
```

Alle drei müssen grün sein. `test/three-stub.js` bildet die genutzte
Three.js-Teilmenge nach und wirft bei Fehlbedienung, `test/xml-stub.js` ist ein
`DOMParser`-Ersatz. `test/demo-check.js` prüft die Beispieldaten gegen die
echte Verarbeitungskette.

---

## Festlegungen, die nicht verhandelbar sind

Jeder dieser Punkte war schon einmal Fehlerursache.

**Achsen:** `+x = Ost`, `-z = Nord`, `y` = Meter über `TERRAIN.zmin`. Nord auf
`+z` ergibt von oben ein Spiegelbild.

**Maßstab:** 1 Einheit = 1 Meter, keine Überhöhung.

**Kein Startgelände.** Die Seite startet leer, Bausteine bleiben gesperrt, bis
eine Datei geladen ist.

**Kein `localStorage`/`sessionStorage`.** Einstellungen gelten nur für die
Sitzung.

**Krandrehung:** `g.rotation.y = baseRot`, `slew.rotation.y = rot - baseRot`.
So bleibt der Auslegerwinkel absolut, unabhängig vom Fundament.

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

## Wichtige Funktionen

```
app.js
  buildTerrain / gridTiles            Gelände aufbauen und rastern
  readTiffTiles / parseCityGML        Dateien einlesen
  buildBuildingsMesh                  ein Mesh für alle Gebäude
  getHeightAt / worldToUTM            Höhe und Koordinaten
  containerLayout / buildContainer    Containeranlage samt Verbindungsbau
  buildTowerCrane / buildMobileCrane  Krane
  filletPath / buildRoad / roadInfo   Baustraße
  showRoadNodes / moveRoadNode        Stützpunkte bearbeiten
  addObject / rebuildObject / moveObject / removeObject
  selectObjects / frameObjects / focusOnPoint / updateControls
  setTopView / refreshTopView         Draufsicht, erlischt beim Drehen
  faceNorth / northAngle / cameraTilt Nordrichtung und Neigung
  computeStats / radiusConflicts      Kennzahlen und Warnungen

ui.js
  SCHEMAS / sortFields / buildForm    Parameterformulare
  selectTool / showObjectEditor / showGroupEditor
  handleDemFiles / handleGmlFiles     Dateiimport
  loadDemo / demoRequested            Beispieldaten über ?demo=1
  showAttribution                     Namensnennung der Beispieldaten
  markRoadRadius                      Warnung am Radiusregler
  renderOverview / buildGroups        Geräteübersicht
  STRINGS / T / applyLanguage         Sprachen
  applySettings / buildTweakPanel     Darstellung
```

---

## Datenlage Krane

Alle Werte aus den Original-Datenblättern, extrahiert mit `pdfplumber`.

- **34 Turmdrehkrane:** 18 Liebherr (85 EC-B 5 bis 1188 EC-H 40, dazu 91 K und
  125 K), 16 WOLFFKRAN (4518 bis 7534.16 clear)
- **9 Mobilkrane:** Liebherr LTM 1050-3.1 bis 1750-9.1

Nicht belegte Felder stehen auf `null`; die Oberfläche lässt den Reglerbereich
dann offen, statt einen Anschlag zu erfinden. Betrifft vor allem die
WOLFF-Hakenhöhen (turmabhängig) und vier Spitzenlasten, deren Tabelle nur als
Grafik vorliegt.

Abstützmaße und Fahrzeuglängen sind schematisch und dienen der Darstellung.

---

## Bekannte Grenzen

- CityGML lässt sich erst nach dem Geländemodell laden
- Löcher in Flächen (Innenhöfe) werden ignoriert, nur der äußere Ring zählt
- Fächertriangulierung kann bei stark konkaven Dachflächen unsauber aussehen;
  Ear-Clipping wäre der nächste Schritt
- Originalauflösung bis etwa 500×500 flüssig; oberhalb `GRID_CELL_CAP`
  (2,5 Mio. Punkte) wird sie mit Meldung abgelehnt
- Einstellungen überleben kein Neuladen
- Die 2D-Ansicht ist eine perspektivische Kamera von oben, keine echte
  Orthogonalprojektion. Sie ist eine Rücksetzung, kein Modus: `refreshTopView`
  löscht den Zustand, sobald die Neigung 3° überschreitet
