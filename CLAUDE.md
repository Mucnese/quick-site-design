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
