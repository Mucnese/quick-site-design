![Quick-Site-Design](docs/header.png)

# Quick-Site-Design

*[English version](README.en.md)*

Werkzeug für die frühe Phase der Baustelleneinrichtung. Das amtliche
Geländemodell des Bauplatzes wird geladen und darauf gestellt, was wirklich
draufsteht: Container, Turmdrehkrane, Mobilkrane, Baustraßen. Alles maßstäblich,
alles auf echter Höhenlage.

Eine Kranaufstellung ist in zwei Minuten gesetzt und in weiteren zwei
umgestellt. Auf einen Blick sichtbar: ob die Ausladung reicht, ob sich zwei
Kranradien überschneiden, ob die Containeranlage auf die verfügbare Fläche passt
und wie die Baustraße im Gelände liegt. Eine Ausführungsplanung ersetzt das
nicht.

Technisch eine HTML-Datei von rund 150 KB und drei Bibliotheken daneben. Kein
Server, keine Installation, kein Build. Nach dem Öffnen bleiben alle Daten im
Browser.

**[→ Anwendung öffnen](https://quick-site-design.com/)**

---

## Funktionsumfang

**Geobasisdaten**
- GeoTIFF-Geländemodelle, mehrere Kacheln gleichzeitig. Die Pixel aller Kacheln
  werden in ein gemeinsames Raster gemittelt, unterschiedliche Auflösungen und
  Überlappungen sind daher unkritisch.
- CityGML LOD2, ebenfalls als Stapel. Die Achsenreihenfolge wird erkannt,
  Gebäude außerhalb der Kachel verworfen.
- Detailstufe von 140 Stützpunkten bis zur unveränderten Quellauflösung.
- Koordinatenbezugssystem wird aus den GeoKeys gelesen.

**Bausteine**
- Containeranlagen bis 25 nebeneinander, 2 Reihen, 5 Stockwerke. Bei zwei Reihen
  bleibt dazwischen ein Gang von einer Containerbreite, ausgefüllt von einem
  schlichten Verbindungsbau.
- 34 Turmdrehkrane von Liebherr und WOLFFKRAN, sämtliche Kennwerte aus den
  Original-Datenblättern.
- 9 Liebherr-Mobilkrane von 50 t bis 750 t.
- Baustraßen als Polygonzug mit ausgerundeten Ecken; die Trasse legt sich auf
  das Gelände. Bei Auswahl erscheinen die Stützpunkte und lassen sich versetzen
  oder löschen.

**Bedienung**
- Linksklick auf Gelände oder Gebäude setzt einen Messpunkt, zeigt Rechtswert,
  Hochwert und Höhe direkt am Punkt und macht ihn zum Dreh- und Zoomzentrum.
- **2D**-Knopf setzt die Ansicht senkrecht von oben; ein Ziehen kippt sie wieder
  frei in den Raum. Der Kompass zeigt die Nordrichtung und richtet auf Klick
  danach aus.
- Warnung bei sich überschneidenden Kranradien; der Radiusregler der Baustraße
  färbt sich, sobald der Mindestradius nicht mehr zwischen die Stützpunkte passt.
- Zwei Oberflächen (dunkel und hell), elf Schriftarten, Deutsch und Englisch.

---

## Demo

**[→ Demo öffnen](https://quick-site-design.com/?demo=1)**

Der Link lädt Gelände und Gebäude automatisch. Nach wenigen Sekunden steht ein
Quadratkilometer echtes Gelände mit 612 Gebäuden bereit — Baustein aus der
Leiste unten wählen und ins Gelände klicken.

Der Datensatz:

| Datei | Inhalt |
|---|---|
| `demo/demo_dgm.tif` | DGM1, 1000 × 1000 Punkte, 1 m Raster, Höhen 503,1 bis 520,7 m |
| `demo/demo_lod2.gml` | LoD2-Gebäudemodell, 612 Gebäude, auf die Kachel zugeschnitten |

ETRS89 / UTM Zone 32N (EPSG:25832), Südwestecke bei E 692000 / N 5336000,
gelegen bei etwa 48,153 Nord und 11,588 Ost.

Eigene Daten kommen über die beiden Dateifelder unter **Daten** hinein: zuerst
das Geländemodell, dann die Gebäude.

Die Beispieldaten stammen von der Bayerischen Vermessungsverwaltung
([geodaten.bayern.de](https://geodaten.bayern.de/opengeodata/OpenDataDetail.html?pn=dgm1)),
veröffentlicht unter [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.de).
Die Namensnennung wird in der Anwendung angezeigt, solange die Beispieldaten
geladen sind.

---

## Wichtiger Hinweis zu den Krandaten

Die hinterlegten Kranwerte sind **Richtwerte**. Sie stammen aus den
veröffentlichten Datenblättern der Hersteller, sind aber von Rüstzustand,
Turmkombination und Ballastierung abhängig.

**Für die Einsatzplanung ist ausschließlich die Traglasttabelle des jeweiligen
Krans maßgeblich.** Die Anwendung ersetzt keine statische Prüfung, keine
Standsicherheitsberechnung und keine Abstimmung mit dem Kranvermieter.

Abstützmaße und Fahrzeuglängen dienen allein der Darstellung und sind
schematisch.

---

## Datenquellen

Alle 16 Bundesländer stellen das DGM1 kostenfrei als Open Data bereit. Die
Portale unterscheiden sich allerdings deutlich — in Format, Kachelung, Zugang
und Lizenz.

| Land | Stelle | Portal | Lizenz |
|---|---|---|---|
| Baden-Württemberg | LGL-BW | [opengeodata.lgl-bw.de](https://opengeodata.lgl-bw.de/) | dl-de/by-2-0 |
| Bayern | Bayer. Vermessungsverwaltung | [geodaten.bayern.de](https://geodaten.bayern.de/opengeodata/OpenDataDetail.html?pn=dgm1) | cc-by/4.0 |
| Berlin | — | in den Brandenburg-Daten enthalten | — |
| Brandenburg | LGB | [geoportal.brandenburg.de](https://geoportal.brandenburg.de/) | dl-de/by-2-0 |
| Bremen | LGV Bremen | [geoportal.bremen.de](https://geoportal.bremen.de/geoportal/) | cc-by/4.0 |
| Hamburg | LGV Hamburg | [metaver.de](https://metaver.de/trefferanzeige?docuuid=A39B4E86-15E2-4BF7-BA82-66F9913D5640) | dl-de/by-2-0 |
| Hessen | HVBG | [hvbg.hessen.de](https://hvbg.hessen.de/landesvermessung/geotopographie/3d-daten/digitale-gelaendemodelle) | dl-de/by-2-0 |
| Mecklenburg-Vorpommern | LAiV MV | [laiv.geodaten-mv.de](https://laiv.geodaten-mv.de/afgvk/Geotopographie/Download?produkt=DGM1) | dl-de/by-2-0 |
| Niedersachsen | LGLN | [opengeodata.lgln.niedersachsen.de](https://opengeodata.lgln.niedersachsen.de/) | cc-by/4.0 |
| Nordrhein-Westfalen | Geobasis NRW | [opengeodata.nrw.de](https://www.opengeodata.nrw.de/produkte/geobasis/hm/dgm1_tiff/) | dl-de/by-2-0 |
| Rheinland-Pfalz | LVermGeo RP | [geoshop.rlp.de](https://geoshop.rlp.de/opendata-dgm1.html) | dl-de/by-2-0 |
| Saarland | LVGL-SL | [saarland.de/lvgl](https://www.saarland.de/lvgl/DE/themen-aufgaben/themen/geotopographie/digitalegelaendemodelle/digitalegelaendemodelle) | dl-de/by-2-0 |
| Sachsen | GeoSN | [geodaten.sachsen.de](https://www.geodaten.sachsen.de/downloadbereich-digitale-hoehenmodelle-4851.html) | dl-de/by-2-0 |
| Sachsen-Anhalt | LVermGeo ST | [lvermgeo.sachsen-anhalt.de](https://www.lvermgeo.sachsen-anhalt.de/de/gdp-dgm-dom-lsa.html) | dl-de/by-2-0 |
| Schleswig-Holstein | LVermGeo SH | [opendata.schleswig-holstein.de](https://opendata.schleswig-holstein.de/dataset/digitales-gelandemodell-1-dgm1) | cc-by/4.0 |
| Thüringen | TLBG | [tlbg.thueringen.de](https://tlbg.thueringen.de/geobasisdaten/3d-informationen/digitale-gelaendemodelle) | dl-de/by-2-0 |

**Format.** Quick-Site-Design erwartet GeoTIFF mit Höhenwerten als Gleitkomma
und einer Georeferenz im Header. Die meisten Länder liefern genau das,
Niedersachsen als Cloud-Optimized GeoTIFF. Bremen, Schleswig-Holstein und Teile
Thüringens geben XYZ-ASCII aus — diese Daten müssen vor dem Laden umgewandelt
werden, etwa mit GDAL.

**Kachelung.** Meist 1 × 1 km, teilweise 2 × 2 km. Mehrere Kacheln lassen sich
gemeinsam auswählen und werden beim Laden verschmolzen.

**Gebäudemodelle.** Die LoD2-Daten liegen überwiegend in denselben Portalen,
teils unter abweichenden Lizenzen; dort unter „LoD2" oder „3D-Gebäudemodell"
aufgeführt.

**Lizenzpflicht.** Beide Lizenzen verlangen eine Quellenangabe. Der genaue
Wortlaut steht in den Metadaten des jeweiligen Landes.

---

## Aufbau des Repositorys

```
quick-site-design/
├── index.html            die Anwendung, aus src/ gebaut
├── impressum.html
├── datenschutz.html
├── README.md
├── README.en.md
├── PROJEKT.md            Entwicklernotizen
├── LICENSE
├── build.py
├── .gitignore
├── lib/
│   ├── three.min.js      Bibliotheken, lokal statt vom CDN
│   ├── OrbitControls.js
│   ├── geotiff.js
│   └── LIESMICH.txt      welche Datei woher kommt
├── demo/
│   ├── demo_dgm.tif      Geländemodell für den Demo-Link
│   ├── demo_lod2.gml     Gebäudemodell für den Demo-Link
│   └── LIESMICH.txt      Quelle und Lizenz der Beispieldaten
├── docs/
│   └── header.png        Titelbild für das README
├── src/
│   ├── shell_head.html
│   ├── app.js
│   ├── ui.js
│   └── boot.js
└── test/
    ├── test.js
    ├── test-ui.js
    ├── validate-html.js
    ├── demo-check.js
    ├── three-stub.js
    └── xml-stub.js
```

`index.html` wird mit `python3 build.py` aus den vier Dateien in `src/`
zusammengesetzt. Die Tests in `test/` laufen mit `node` und brauchen keinen
Browser. Einzelheiten stehen in `PROJEKT.md`.

---

## Selbst betreiben

Die Anwendung braucht drei Bibliotheken:

| Bibliothek | Lizenz |
|---|---|
| three.js r128 | MIT |
| OrbitControls (three.js examples) | MIT |
| geotiff.js 2.1.3 | MIT |

Alle drei sind mit der GPLv3 verträglich und liegen im Ordner `lib/`. Sie
werden **nicht** von einem CDN nachgeladen: so entstehen beim Aufruf keine
Verbindungen zu fremden Servern, und die Anwendung läuft auch ohne
Internetverbindung.

Die Bibliotheksdateien selbst sind nicht im Repository enthalten; ihre
Bezugsquellen stehen in [`lib/LIESMICH.txt`](lib/LIESMICH.txt).

Für den Betrieb auf eigenem Webspace genügt `index.html` mitsamt den Ordnern
`lib/` und `demo/` im Web-Verzeichnis. Der Ordner `demo/` wird nur für den
Demo-Link gebraucht.

---

## Rechtliches

[Impressum](impressum.html) · [Datenschutzerklärung](datenschutz.html)

---

## Lizenz

Copyright © 2026 Haoran Li

GNU General Public License, Version 3 oder später. Siehe [LICENSE](LICENSE).

In Kurzform: Die Software darf genutzt, weitergegeben und verändert werden.
Wird eine veränderte Fassung weitergegeben, muss auch diese unter der GPLv3
stehen und der Quelltext offenliegen.

Die Software wird ohne jede Gewährleistung bereitgestellt.
