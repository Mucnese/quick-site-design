# Quick-Site-Design

Baustelleneinrichtungsplanung im Browser auf Grundlage amtlicher Geobasisdaten.
Eine HTML-Datei plus drei Bibliotheken, kein Server, kein Framework.

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

**Keine CDN-Verweise.** Die drei Bibliotheken liegen in `lib/`. Ein neuer
`<script src>` auf einen fremden Server würde die Datenschutzerklärung
unrichtig machen.

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

**Baustraße.** Konstante Längsneigung (`params.slope`, in %), keine Querneigung,
Start auf der Geländehöhe des ersten Punkts. Die Neigung wird beim Setzen und
bei jeder Punktänderung neu aus dem Gelände abgeleitet (`autoRoadSlope`), der
Regler überschreibt sie danach. Böschung wählbar 1:1, 1:1,5 oder 1:2
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

Lizenz GPLv3, Copyright 2026 Haoran Li. Der Vermerk steht im Kopf von
`index.html`, unten links in der Anwendung und in beiden READMEs.

---

## Stil

Kommentare erklären das Warum, nicht das Was. Deutsche Bezeichner in der
Oberfläche, englische in der Geometrie, wo es eingebürgert ist.

Keine Frameworks, keine Build-Kette außer `build.py`, keine neuen
Abhängigkeiten ohne Rückfrage.
