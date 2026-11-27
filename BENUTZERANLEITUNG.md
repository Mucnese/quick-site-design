# Quick-Site-Design: Benutzeranleitung

Quick-Site-Design plant eine Baustelle im Browser: Gelände und Gebäude laden,
Container, Krane, Baustraßen und Baugruben setzen, Mengen ablesen, Straßen mit der
Schleppkurve eines Sattelzugs prüfen und das Ergebnis als IFC-Datei ausgeben. Alles
läuft im Browser, es gibt keine Anmeldung und keinen Speicherstand: Schließt du die
Seite, ist die Planung weg.

[English version](USER-GUIDE.en.md) · [Zur Startseite des Projekts](README.md)

**Inhalt**

1. [Loslegen](#1-loslegen)
2. [Die Oberfläche](#2-die-oberfläche)
3. [Die Ansicht steuern](#3-die-ansicht-steuern)
4. [Bausteine setzen und bearbeiten](#4-bausteine-setzen-und-bearbeiten)
5. [Container, Krane, Baustraße, Baugrube im Einzelnen](#5-die-bausteine-im-einzelnen)
6. [Mengen und Prüfungen](#6-mengen-und-prüfungen)
7. [Karte (OpenStreetMap)](#7-karte-openstreetmap)
8. [IFC-Import und IFC-Export](#8-ifc-import-und-ifc-export)
9. [Tastatur](#9-tastatur)
10. [Grenzen und Hinweise](#10-grenzen-und-hinweise)
11. [Wenn etwas nicht klappt](#11-wenn-etwas-nicht-klappt)

---

## 1. Loslegen

### Schnell ausprobieren

Hänge `?demo=1` an die Adresse der Seite. Dann lädt die Anwendung einen Beispielausschnitt
(Gelände und Gebäude) und du kannst sofort Bausteine setzen.

### Eigene Daten laden

Die Anwendung braucht mindestens ein **Geländemodell**. Ohne Gelände bleiben die Bausteine
gesperrt.

1. **Daten finden.** Beim Start zeigt die Seite eine **Karte**. Nach dem Klick auf **Karte laden**
   (erst dann werden Kacheln von OpenStreetMap geladen und deine IP-Adresse übertragen) kannst du sie
   verschieben (Ziehen mit einer beliebigen Maustaste, auch mit gedrückter Mitteltaste) und stufenlos zoomen (Mausrad,
   **+**/**−**). Ein Klick setzt einen **Pin**; daneben öffnet sich ein
   **Fenster mit den Links zu den Geoportalen** des Landes (Gelände- und Gebäudemodell) und, wenn die Stadt in der Tabelle steht, den **Stadtgeoportalen** (Karte, Offene Daten, teils 3D-Stadtmodell), mit Ort und UTM-Werten
   (schließen mit **×** oder **Esc**). Für **Österreich** nennt das Fenster zusätzlich (zugeklappt unter „Für Fortgeschrittene“) einen fertigen **`gdal_translate`-Befehl**, der aus einer sehr großen
   Rasterdatei (zum Beispiel BEV 1 m, über 1 GB) den Ausschnitt um den Pin (1000 × 1000 m) schneidet; **Kopieren**
   legt ihn in die Zwischenablage. Die Links stehen dann nur dort; unter der Adressleiste
   erscheinen sie, wenn du dort etwas eintippst. Die Karte verschwindet, sobald ein Gelände geladen ist. Hast du in der Adressleiste einen Ort gewählt, bevor die Karte geladen ist, nennt der Kasten ihn, und **Karte am Ort laden** führt direkt dorthin. **Ist schon ein Gelände geladen** (zum Beispiel die Demo) und du wählst einen Ort **außerhalb**, öffnet sich die Karte dort wieder; **Zurück zum Gelände** (oder **Esc**) bringt dich zur 3D-Ansicht zurück, das Gelände bleibt.
   Alternativ: Gib oben links in der Adressleiste („Wo ist deine Baustelle?“) eine
   Adresse oder einen Ort ein und wähle einen Vorschlag. Darunter erscheinen die Links zur
   Seite des Geländemodells (DGM) und des Gebäudemodells (LoD2) deines Bundeslandes, bei
   Österreich die Seiten von Bund und Land, **für alle übrigen Länder der EU** die Seiten der Landesvermessung (soweit
   ein offenes Geländemodell bekannt ist; sonst steht dort ein Hinweis). **In Hauptstädten und Großstädten der EU** (zum Beispiel Wien, Berlin, München, Paris, Prag, Madrid) kommt eine Gruppe **Stadtgeoportale** mit den Karten- und Open-Data-Seiten der Stadt dazu. Die Suche findet Orte in der ganzen EU. Die Anwendung lädt dabei nichts herunter, du
   öffnest die Seiten und lädst die Dateien selbst herunter. Die gleiche Tabelle steht in der
   [README](README.md#datenquellen).
   - **Nichts Passendes gefunden?** Bauwerke wie Talbrücken stehen in OpenStreetMap oft anders oder
     gar nicht. Findet die Suche nichts, was zu deiner Eingabe passt, fragt die Leiste mit dem
     Namensstamm nach („Ohetalbrücke“ wird zu „Ohetal“) und schreibt „Nichts zu … gefunden.
     Ähnlich:“ über die Liste.
   - **Koordinaten statt Adresse.** Du kannst auch Koordinaten eintippen: Breite und Länge
     (`48.1366, 11.5771`, auch mit ° und N/E, bei Semikolon mit Komma als Dezimalzeichen),
     UTM mit Zone (`32 692000 5336000` oder `EPSG:25832 692000 5336000`) oder Gauß-Krüger
     (`3500000 5400000`). Zwei große Zahlen ohne Angabe gelten im Bezugssystem des geladenen
     Geländes. Die Leiste zeigt den erkannten Punkt als einzigen Vorschlag; erst wenn du ihn
     wählst, fragt sie Photon nach Ort und Bundesland und zeigt dann die Links.
2. **Gelände laden.** Im Fenster **Daten** auf „Dateien auswählen“ klicken und die
   Geländedatei wählen. Mehrere Kacheln lassen sich zusammen auswählen, sie werden verschmolzen.
3. **Gebäude laden (optional).** Ebenfalls im Fenster **Daten**, Zeile „Gebäude · CityGML / CityJSON / 2D“.
   Gebäude außerhalb des Geländes werden verworfen. **2D-Dateien** (GeoPackage, Shapefile, GeoJSON) tragen nur Grundrisse: Nach dem Laden erscheinen Auswahlfelder.
   (Eine INSPIRE-GML-Datei mit Geschosszahlen bekommt die Geschosszahl als Höhe, Faktor 3 voreingestellt.) Bei **Geländehöhe** wählst du „aus dem Geländemodell“, ein **Attribut** (zum Beispiel `HOEHE_BODEN_MIN`) oder einen festen Wert. Bei **Gebäudehöhe** wählst du das
   Attribut (zum Beispiel `HOEHE_OBJEKT_MAX`) oder einen festen Wert; dazu sagst du, ob der Wert die **Höhe über Grund** oder die **absolute Höhe** ist, und kannst mit einem
   **Faktor** rechnen (3 bei einer Geschosszahl). Fehlt einem Gebäude die Höhe, gilt die **Ersatzhöhe**. Jede Änderung baut die Gebäude sofort neu.

### Welche Dateien gehen?

| Art | Format | Hinweis |
|---|---|---|
| Gelände | **GeoTIFF** (`.tif`, `.tiff`) | Bezugssystem steht in der Datei |
| Gelände | **XYZ-Text** (`.xyz`, `.txt`, `.csv`) | Rechtswert, Hochwert, Höhe auf einem regelmäßigen Raster. Das Bezugssystem fehlt in der Datei: vorher im Fenster **Daten** unter „Bezugssystem für XYZ-Dateien“ wählen oder einen EPSG-Code eintippen. Ändert man die Wahl später, liest die Anwendung die Datei mit dem neuen System neu und das Gelände wandert dorthin |
| Gelände | **Punktwolke** (`.las`, `.laz`) | LAS 1.0 bis 1.4, LAZ (komprimiert). Aus den Geländepunkten (Klasse 2, dazu Wasser; gibt es keine Klasse 2, gilt Klasse 8, die Modell-Schlüsselpunkte, wie bei den nordrhein-westfälischen Daten) wird ein Höhenraster gemittelt (Rasterweite aus der Punktdichte: 0,5 bis 10 m), kleine Lücken werden gefüllt; Vegetation, Gebäude und Rauschen fallen weg. Ohne Klassifizierung gilt der tiefste Punkt je Zelle. Das Bezugssystem steht meist in der Datei; fehlt es, wählst du es wie bei XYZ. Dateien über 3 km Ausdehnung brauchen einen Pin (nur der Ausschnitt wird gerastert), Grenze 300 MB je Datei |
| Gebäude | **CityGML** (`.gml`, `.xml`) | LoD2, die Achsenreihenfolge wird erkannt |
| Gebäude (2D) | **GeoPackage** (`.gpkg`) | Flächenebene mit Höhenattributen; auch über 2 GB (zum Beispiel das BEV-Modell „DLM Bauwerke“): gelesen wird nur der Ausschnitt um das Gelände. Gibt es mehrere Flächentabellen, wählst du die Tabelle. Das Bezugssystem steht in der Datei |
| Gebäude (2D) | **Shapefile** (`.shp` zusammen mit `.dbf`, `.prj`, `.cpg`) | alle Dateien gleichzeitig wählen; ohne `.prj` gilt das Bezugssystem des Geländes, sonst wählst du es selbst |
| Gebäude (2D) | **INSPIRE-GML** (`.xml`, `.gml`, Gebäude 2D) | zum Beispiel der Export „INSPIRE Gebäude“ des tschechischen ČÚZK (RÚIAN): Grundrisse in Breite/Länge (EPSG:4258), Geschosszahl und Höhe nur, wo sie befüllt sind (in dieser Datei meist nicht: dann feste Höhe wählen). Wird erkannt und nicht als CityGML gelesen |
| Gebäude (2D) | **GeoJSON** (`.geojson`, `.json`) | ohne Angabe WGS84 (Länge/Breite), sonst das `crs`-Feld |
| Gebäude | **CityJSON** (`.json`, `.city.json`, `.jsonl`) | auch CityJSONSeq und Merkmalslisten (3DBAG); je Bauteil die höchste Detailstufe, Grundrisse und Gelände fallen weg. Nennt die Datei ein anderes Bezugssystem als das Gelände, wird umgerechnet (3DBAG: Rijksdriehoek, passend zum AHN) |

Nicht gelesen werden ESRI-ASCII-Raster (`.asc`) und Dezimalkommas in XYZ-Dateien. Wandle sie
vorher in GeoTIFF um, zum Beispiel mit GDAL.

**Bezugssystem (KBS) wählen.** Oben im Fenster **Daten** steht „wie das Gelände“. Wählst du ein anderes System oder tippst einen EPSG-Code ein, werden **Gelände und Gebäude dorthin umgerechnet**, zum Beispiel von UTM nach Gauß-Krüger, damit ein Bauwerk in Gauß-Krüger passt. Das geht vor oder nach dem Laden.

- **Genauigkeit:** Die Meldung darunter nennt sie. Zwischen ETRS89/UTM und Gauß-Krüger Deutschland (DHDN) etwa **1 m** mit dem beiliegenden BeTA2007-Gitter (etwa 3 m ohne: außerhalb Deutschlands oder wenn die Datei nicht geladen werden kann), bei Gauß-Krüger Österreich (MGI) etwa 2 m. Zwischen Systemen mit gleichem Datum praktisch ohne Fehler. **Höhen werden nie umgerechnet.**
- Weil die Systeme gegeneinander gedreht sein können, wird das Geländeraster neu gerechnet; an den Rändern fällt dabei ein schmaler Streifen weg.
- Gebäude gelten im System, das ihre Datei nennt, sonst in dem der Geländedaten.
- Ein Wechsel nach dem Platzieren entfernt die **Bausteine** (mit Rückfrage). Wähle das System also am besten vorher.

**Sehr große GeoTIFF (zum Beispiel BEV, 7,9 GB).** Dateien über 300 MB liest das Tool **nicht ganz, sondern nur den Ausschnitt um
den gewählten Ort**. Setze zuerst auf der Startkarte einen Pin oder wähle eine Adresse, dann wähle die Datei
unter „Daten“. Beim BEV-Raster dauert das etwa eine halbe Sekunde; im Datenfenster steht „Ausschnitt“. Ohne gewählten Ort, bei
einem Ort außerhalb der Datei oder einem Ausschnitt über 100 Millionen Pixel erscheint eine Meldung.

**Größe.** Kleinere Dateien liest das Tool ganz in den Speicher. Es lehnt deshalb vor dem Lesen ab:
Dateien über 1 GB (bei GeoTIFF über 300 MB gilt der Ausschnitt, s. o.), Kacheln über 100 Millionen Pixel und mehr als 150 Millionen Pixel (oder 2 GB)
zusammen; bei XYZ mehr als 30 Millionen Punkte; bei LAS/LAZ mehr als 300 MB je Datei; bei CityGML insgesamt mehr als 300 MB; bei IFC mehr als 300 MB je Datei. Die Meldung nennt die Datei und die Zahl. Wer
lieber selbst vorher einen Ausschnitt schneidet, kann `gdal_translate -projwin <links> <oben> <rechts> <unten> -of GTiff eingabe.tif ausschnitt.tif` nehmen.

---

## 2. Die Oberfläche

| Bereich | Wo | Was |
|---|---|---|
| **Adressleiste** | ganz oben links | Ort suchen, Links zu den Geodaten |
| **Übersicht** | links | Gelände, Höhenbereich, Objektzahl, Liste der Bausteine mit Mengen |
| **Daten** | links | Bezugssystem (KBS), Gelände, Gebäude, Bauwerk (IFC) |
| **Karte** | unten links | Knopf für die OpenStreetMap-Karte |
| **Eigenschaften** | rechts | Maße und Werte des gewählten Bausteins |
| **Bausteine** | unten | Container, Turmdrehkran, Mobilkran, Baustraße, Baugrube, IFC Export, Messen |
| **DE / EN, 2D, Darstellung, Hilfe** | unten rechts | Sprache, Draufsicht, Aussehen, Kurzhilfe |
| **Kompass** | unten | Nordrichtung, Klick richtet nach Norden aus |
| **Infoleiste** | unten links | Bezugssystem (KBS), DGM-Rasterung, Einheit |

**Darstellung** stellt Schriftart, Schriftgröße, Akzentfarbe und Fensterbreite
(220 bis 400 px) ein. **Hilfe** öffnet eine Kurzübersicht mit einem Link auf diese Anleitung.

---

## 3. Die Ansicht steuern

- **Linke Maustaste ziehen:** umkreisen. Wer auf Gelände, Gebäude oder einen Baustein klickt und
  zieht, dreht um genau diesen Punkt. Wer auf den Hintergrund klickt, kreist die ganze Szene
  um das Zentrum.
- **Rechte oder mittlere Taste ziehen:** verschieben (zügig: etwa doppelt so schnell wie der Mauszeiger auf dem Boden).
- **Mausrad:** zoomen, in gleichmäßigen Schritten (je Rastenschritt ein Sechzigstel der Geländekante, mindestens 5 m), egal wie nah die Kamera ist.
- **Linksklick** auf Gelände oder Gebäude: setzt einen **Messpunkt**. Er zeigt Rechtswert, Hochwert
  und Höhe und wird zum Dreh- und Zoomzentrum.
- **2D:** senkrecht von oben. Ein Ziehen kippt die Ansicht wieder frei in den Raum.
- **Kompass:** zeigt Norden, ein Klick richtet die Ansicht danach aus.
- **Zurücksetzen** (Fenster Übersicht): passt die Ansicht neu auf das Gelände ein.

Die Geländeauflösung passt sich dem Zoom an: nah an der Kamera in voller Datenauflösung, fern
gröber. Dafür gibt es keinen Regler, die Höhen für Objekte und Mengen sind davon unabhängig.

---

## 4. Bausteine setzen und bearbeiten

### Setzen

- **Container, Turmdrehkran, Mobilkran:** unten den Baustein wählen und ins Gelände klicken.
  Der Baustein sitzt auf der Geländehöhe.
- **Baustraße und Baugrube:** Punkt für Punkt ins Gelände klicken, dann **Rechtsklick** oder
  **Leertaste**, um abzuschließen. Eine Straße braucht mindestens 2 Punkte, eine Baugrube 3
  (höchstens 32 Eckpunkte). **Esc** bricht ab. Beim Zeichnen steht an jeder Strecke ihre
  **waagerechte Länge** in Metern mit zwei Nachkommastellen, auch an der Strecke zur Maus.

Nach dem Setzen öffnet sich rechts das Fenster **Eigenschaften**. Jeder Regler hat in der
Kopfzeile ein Zahlenfeld: Wert anklicken und tippen, Enter oder Verlassen übernimmt ihn, ein
Wert außerhalb des Bereichs wird auf die Grenze gesetzt.

### Bearbeiten

- **Anklicken** wählt ein Objekt. Rechts erscheinen **Verschieben**, **Duplizieren** und
  **Löschen**. **Verschieben**: Knopf drücken und die neue Position anklicken.
- **Straße und Baugrube:** Beim Auswählen erscheinen die **Stützpunkte** als weiße Punkte.
  Punkt anklicken, dann die neue Position wählen. **Punkt hinzufügen** setzt einen neuen Punkt
  in die nächste Strecke, **Punkt löschen** entfernt den gewählten.
- **Mehrere Objekte:** Ein Eintrag in der **Übersicht** wählt die ganze Gruppe (zum Beispiel alle
  Mobilkrane). Dort lässt sich die Gruppe abwählen oder löschen.
- **Esc** hebt die Auswahl auf. **Entf** oder **Rücktaste** löscht die gewählten Objekte.
- **Leeren** (unten) entfernt alle Bausteine, nach einer Rückfrage.
- **Entfernen** steht im Fenster **Daten** oben rechts bei Gelände, Gebäude und Bauwerk. Bei Gebäude und Bauwerk verschwindet nur dieser Datensatz. Beim Gelände hängt alles daran: Nach einer Rückfrage wird wie bei Reset alles entfernt.
- **Reset** (unten, unter „Leeren“) setzt alles zurück: Gelände, Gebäude, Bauwerk (IFC) und alle Bausteine werden entfernt, die Seite startet neu, nichts ist geladen. Auch das fragt vorher nach (Abbrechen ist vorgewählt, **Esc** bricht ab).

---

## 5. Die Bausteine im Einzelnen

### Container

Containeranlage mit bis zu 25 Containern nebeneinander, 2 Reihen und 5 Stockwerken. Bei zwei
Reihen bleibt dazwischen ein Gang von einer Containerbreite, ausgefüllt von einem schlichten
Verbindungsbau. Einstellbar sind Anzahl, Reihen, Stockwerke, Drehwinkel und die Maße je Container.

### Turmdrehkran

Ein **generisches** Modell: Ausladung, Hakenhöhe, Turmbreite und die Drehwinkel von Ausleger und
Fundament lassen sich frei innerhalb der Bandbreite realer Baukrane einstellen. Es ist kein
Herstellermodell. Der Schalter „Arbeitsradius zeigen“ blendet den Kreis ein, in dem der Haken
arbeitet.

### Mobilkran

24 Liebherr-Mobilkrane von 35 t bis 750 t. Die Kennwerte stammen aus den Datenblättern des
Herstellers, die Achszahl aus der Modellbezeichnung. Der Link „Datenblatt beim Hersteller“ führt
zur Quelle. Abstützmaße und Fahrzeuglängen dienen nur der Darstellung.

**Wichtig:** Die Werte sind Richtwerte. Für die Einsatzplanung zählt allein die **Traglasttabelle**
des jeweiligen Krans. Überschneiden sich die Arbeitsradien zweier Krane, zeigt die Übersicht eine
Warnung mit der Überschneidung in Metern.

### Baustraße

Ein Polygonzug mit **ausgerundeten Ecken**.

- **Straßenbreite** 3 bis 14 m, **Mindestradius** der Kurven 5 bis 60 m. Passt ein Radius nicht
  zwischen zwei Stützpunkte, wird er dort verkleinert, und der Regler färbt sich. Dann Punkte weiter
  auseinander setzen oder den Radius verkleinern.
- **Längsneigung** in Prozent (±30 %). Vorbelegt ist die Neigung, die Anfangs- und Endpunkt auf dem
  Gelände verbindet. Hat jeder Abschnitt seine eigene Neigung (siehe Achslinie), steht im Feld
  **„variabel“**; bewegst du dann den Regler, bekommen alle Abschnitte wieder dieselbe Neigung.
- **Böschung** 1:1, 1:1,5 oder 1:2. Liegt die Fahrbahn über oder unter dem Gelände, schließt
  eine Böschung bis zum Gelände an (Suchgrenze 80 m).
- **Ränder zeigen** blendet die Fahrbahnkanten ein.
- **Schleppkurve Sattelzug prüfen:** siehe Abschnitt 6.

Länge, Fläche und der engste Radius stehen im Eigenschaftsfenster.

**Achslinie.** Eine fertige Straße zeigt ihre **Mittellinie** (gelb gestrichelt, mit Querstrichen an den
gesetzten Punkten). Jede Strecke zwischen zwei Punkten ist ein **Abschnitt**. **Über** der Linie steht die
**Längsneigung** des Abschnitts in Prozent, **darunter** seine **Länge** in Metern entlang der Achse.
Beide Felder lassen sich anklicken und überschreiben (Zahl eintippen, **Enter**; **Esc** verwirft):

- Die **Neigung** gilt nur für diesen Abschnitt. So lässt sich eine Straße mit Rampe und flachem Stück
  planen. Das Eigenschaftsfenster zeigt dann „variabel“.
- Die **Länge** verschiebt den Endpunkt des Abschnitts in Richtung der Strecke; alle folgenden Punkte
  rücken mit, ihre Lage zueinander bleibt. Ausgerundete Ecken zählen mit.
- Ein neuer Punkt teilt seinen Abschnitt (beide Hälften behalten die Neigung), ein gelöschter führt zwei
  zusammen. Beim Zeichnen und Messen sind die Felder ausgeblendet. Beim Herauszoomen verschwinden
  alle Felder einer Straße gleichzeitig, sobald ihr kürzester Abschnitt auf dem Bildschirm zu kurz wird.
- Die Achslinie ist nur Darstellung und kommt nicht in die IFC-Datei.

### Baugrube

Ein Polygon mit bis zu 32 Ecken. Im Gelände entsteht ein Loch, in das man hineinsieht.

- **Tiefe zum mittleren Gelände** (Standard −5 m, bis −100 m) und **Höhe der Unterkante** (m ü. NHN) sind zwei
  Regler für denselben Wert: bewegst du einen, folgt der andere.
- **Böschungswinkel** (20° bis 90°, 90° = senkrecht). Das gezeichnete Polygon bleibt die **Oberkante**,
  nur die **Sohle** wird kleiner. Ist die Grube für den Winkel zu schmal, springt der Regler auf den
  kleinsten möglichen Winkel (Mindestwinkel) und ein roter Hinweis nennt ihn.
- Liegt die Sohle teils über dem Gelände, entsteht neben dem Aushub auch **Aufschüttung**.

Hinweis: Objekte, die in einer Grube stehen, sitzen auf der Höhe des ursprünglichen Geländes.

---

## 6. Mengen und Prüfungen

- **Baustraße:** Auftrag und Abtrag in m³ (Mittelflächenverfahren), im Eigenschaftsfenster und
  in der Übersicht.
- **Baugrube:** Aushub und Aufschüttung in m³ sowie Unterkante und Sohlfläche.
- **Übersicht:** Unter „Baustraße“ stehen Abtrag und Auftrag, unter „Baugrube“ Aushub und
  Aufschüttung, jeweils als Summe über die Gruppe.
- **Schleppkurve Sattelzug:** Der Schalter in den Eigenschaften der Baustraße (standardmäßig aus)
  fährt einen Sattelzug von 16,50 m Länge und 2,55 m Breite auf der Straßenmitte entlang. Die
  überstrichene Fläche liegt als blaue Fläche mit Rand auf der Straße, **rot** dort, wo sie über die
  Fahrbahn hinausragt. Das Fenster nennt die benötigte Breite und „Passt“ oder „Passt nicht“ mit
  dem Überstand. Grundlage sind die Maße und Wenderadien des Sattelzugs 16,5 m aus
  **Autodesk Vehicle Tracking** (Entwurfsgeschwindigkeit 5 km/h): Das Modell trifft dessen Radien
  (äußere Karosserie 12,5 m, inneres Rad 5,28 m, bei Vollausschlag 7,9 m) auf wenige Zentimeter.
  Einschränkungen: Lenkeinschlag und Knickwinkel werden nicht begrenzt, und das Heck schwingt beim Einlenken
  in der Vorlage etwas weiter nach außen aus (0,42 m statt 0,30 m bei R = 10 m). Wo es knapp wird, mit
  Vehicle Tracking nachprüfen.
- **Kranradien:** überschneiden sie sich, erscheint eine Warnung in der Übersicht.
- **Messen:** Die Karte **Messen** (unten, ganz rechts) misst Strecken auf Gelände und Gebäuden. Punkte
  nacheinander anklicken; an jeder Strecke stehen die **waagerechte Länge** und der **Höhenunterschied**
  (**Δ**) in Metern mit zwei Nachkommastellen. Das Fenster darunter nennt die Summen waagerecht und im Raum,
  den Höhenunterschied und das **Gefälle** zwischen Start und Ende in Prozent sowie die Höhen von Start und
  Ende. **Rechtsklick**, **Leertaste** oder **Enter** beendet die Messung, ein weiterer Klick beginnt eine
  neue, **Rücktaste** nimmt den letzten Punkt zurück, **Esc** beendet das Werkzeug. Die Genauigkeit
  hängt vom Geländemodell ab (Rasterweite siehe Infoleiste), bei Gebäuden von der Dachform des Modells.

Die Rechnungen sind Planungshilfen. Sie ersetzen keine Bemessung und keine Abstimmung mit den
Beteiligten.

---

## 7. Karte (OpenStreetMap)

Der Knopf **Karte** unten links öffnet ein kleines Fenster mit dem Schalter **Karte · OpenStreetMap**. Er legt eine Karte als Farbe über das
Gelände. Er ist **standardmäßig aus**. Beim Einschalten lädt dein Browser Kartenkacheln von
`tile.openstreetmap.org`; dabei werden deine IP-Adresse und der ungefähre Standort des Geländes
übertragen (siehe [Datenschutz](datenschutz.html)). Unten links erscheint der Quellenhinweis
„© OpenStreetMap-Mitwirkende“.

- Die Karte braucht ein Bezugssystem, das die Anwendung in Längen- und Breitengrad umrechnen kann:
  UTM (ETRS89 und WGS 84), Gauß-Krüger (DHDN), Gauß-Krüger Österreich (MGI, EPSG:31254 bis 31256), das europäische
  ETRS89-LAEA (EPSG:3035, BEV) und die nationalen Systeme vieler EU-Länder (Liste in der [README](README.md#datenquellen)).
  Bei anderen Systemen, zum Beispiel Ungarn (EOV), schaltet sich die Karte mit einer Meldung ab.
- Bei Bessel-Systemen liegt die Karte etwa so genau: DHDN etwa 1 m (BeTA2007-Gitter), MGI etwa 2 m.
- Die Karte lädt je nach Größe des Geländes bis zu 144 Kacheln auf einmal. Je kleiner das Gelände, desto feiner die Stufe und desto kleiner wirkt die Beschriftung.
- Nach einem neuen Gelände lädt sich die Karte von selbst neu.

---

## 8. IFC-Import und IFC-Export

### Bauwerk als IFC einlesen

Im Fenster **Daten** liest die Zeile **Bauwerk · IFC** ein Bauwerk (Neubau, Gebäude, Brücke) als
IFC-Datei ein. Voraussetzung ist ein geladenes Gelände. Die Bibliothek zum Lesen wird erst jetzt
nachgeladen; die Datei bleibt dabei im Browser und wird nicht übertragen. Größe bis 300 MB.

- **Automatisch:** Ist die Datei georeferenziert (`IfcMapConversion`) und hat **dasselbe
  Bezugssystem (EPSG)** wie das Gelände, steht das Bauwerk sofort an der richtigen Stelle,
  gedreht und in der richtigen Höhe. Maßstab und Längeneinheit der Datei werden berücksichtigt.
  Das gilt auch ohne Georeferenz, wenn in der Datei selbst Landeskoordinaten stehen, die im Gelände liegen (häufig bei Gauß-Krüger).
  Liegt das Gelände in einem anderen System, nennt die Meldung den EPSG-Code, den du oben als **Bezugssystem (KBS)** wählen kannst; das Bauwerk setzt sich dann selbst.
- **4 Punkte ausrichten (2 + 2):** Fehlt die Georeferenz oder weicht das Bezugssystem ab, nennt die Meldung
  den Grund und startet das Verfahren: abwechselnd **Punkt A am Bauwerk**, dann der **zugehörige
  Punkt A im Gelände**, danach ebenso Punkt B. Aus den Punktpaaren ergeben sich Lage und Drehung. Das Bauwerk bleibt
  immer **waagerecht**; die Höhe richtet sich nach dem Gelände am ersten Punkt. Stimmen die beiden
  Abstände nicht überein, erscheint eine Warnung. **Esc** bricht ab. Mit **4 Punkte ausrichten** lässt sich
  das Verfahren später wiederholen.
- **Schieben & Drehen:** In der Mitte des Bauwerks erscheinen drei Pfeile: **X** (rot, Ost), **Y** (grün, Nord), **Z** (blau, Höhe), dazu ein gelber Ring.
  An einem Pfeil ziehen verschiebt das Bauwerk nur in dieser Richtung; am Ring ziehen dreht es um die Hochachse (Z) durch seine Mitte. Die Ansicht lässt sich wie gewohnt drehen und zoomen. Blickt man fast
  entlang einer Achse (z. B. Z in der Draufsicht), lässt sich dieser Pfeil nicht ziehen; der Ring lässt sich nicht ziehen, wenn man fast waagerecht blickt. **Esc** oder ein zweiter Klick auf den Knopf beendet den Modus.
  Der Knopf geht auch mitten im Vier-Punkte-Verfahren: Ein neues Bauwerk bleibt dann dort, wo es zu sehen ist.
- In den Feldern **X** (Ost), **Y** (Nord), **Z** (Höhe) steht die Verschiebung in Metern, in **Um Z** die Drehung in Grad (positiv gegen den Uhrzeigersinn, von oben gesehen); man kann alles auch eintippen. Ein neues Ausrichten mit 4 Punkten setzt die Felder auf 0. **Entfernen** (rechts neben der Überschrift) nimmt das Bauwerk weg.
- Liegt das Bauwerk außerhalb des Geländes, erscheint ein Hinweis. Wird ein anderes Gelände geladen,
  wird ein automatisch platziertes Bauwerk neu gesetzt, ein manuell platziertes entfernt.
- Nicht unterstützt: Längeneinheiten wie Fuß und Zoll (IfcConversionBasedUnit).

### IFC-Export

Die Karte **IFC Export** (unten bei den Bausteinen) gibt **Gelände und Gebäude** als IFC-Datei aus,
auf Wunsch mit **Straßen, Baugruben, Kranen und Containern** (Häkchen im Fenster, Voreinstellung an;
jeder Baustein ist ein eigenes Bauteil). Die Teile tragen **Farben**: Bausteine wie in der Anwendung (gelber Kran, bunte Container, grauer Asphalt, braune Böschung), Gelände grün-braun, Gebäude hellgrau. Gebäude, die über den Rand des Rechtecks ragen, werden dort glatt und gerade abgeschnitten (offene Schnittfläche, kein Deckel). Das Gelände wird nicht ausgeschnitten: eine Baugrube liegt
unter der Geländefläche.

1. Auf **IFC Export** klicken. Die Ansicht wechselt in die Draufsicht.
2. Auf dem Gelände ein **Rechteck aufziehen**. Zoomen ist währenddessen möglich. Die Ansicht geht in die Draufsicht, **dreht sich aber nicht nach Norden**, und das Rechteck richtet sich nach dem Bildschirm: Ist die Ansicht gedreht, ist es gegen Norden gedreht, und der Export schneidet genau diese gedrehte Fläche aus (Gelände, Gebäude, Bausteine). Die Koordinaten in der Datei bleiben im Bezugssystem, nur der Ausschnitt ist gedreht; „Ausdehnung“ nennt die Kantenlängen des Rechtecks.
3. Im Fenster **IFC-Export** erscheinen Ausdehnung und Koordinatenbezug. Unter **Koordinaten**
   wählst du, wie die Lage in die Datei kommt: **absolut im Bezugssystem** (Voreinstellung:
   Rechtswert, Hochwert und Höhe ü. NHN stehen direkt im Modell, sichtbar in jedem Programm)
   oder **lokal** (kleine Zahlen ab der Nordwestecke, die Lage steckt in der Georeferenz
   `IfcMapConversion`). Unter **Bezugssystem der Datei** lässt sich die Lage in ein **anderes
   Koordinatensystem** umrechnen (UTM 31N bis 33N, Gauß-Krüger 2 bis 5, Gauß-Krüger Österreich und die nationalen Systeme der EU, zum Beispiel
   RD New der Niederlande, Lambert-93 Frankreichs, SWEREF 99 TM Schwedens, PL-1992 Polens). Alle
   Punkte werden dann einzeln umgerechnet und absolut geschrieben; die Höhen bleiben unverändert. Bei den
   Bessel-Systemen (mit ≈ markiert) ist die Lage weniger genau: DHDN etwa 1 m mit dem BeTA2007-Gitter,
   MGI etwa 2 m. Die Datei nennt außerdem das Bezugssystem (EPSG-Code, Datum, Zone) und
   trägt Breite und Länge der Baustelle ein, wo sich das System umrechnen lässt.
   **Exportieren** lädt die Datei herunter, **Abbrechen** oder **Esc** bricht ab.

---

## 9. Tastatur

| Taste | Wirkung |
|---|---|
| **Esc** | abbrechen, Auswahl aufheben, Fenster schließen |
| **Leertaste** | Straße oder Baugrube abschließen (wie Rechtsklick) |
| **Entf** / **Rücktaste** | gewählte Objekte löschen (nicht beim Tippen in einem Feld) |

---

## 10. Grenzen und Hinweise

- **Keine Statik.** Die Anwendung ersetzt keine statische Prüfung, keine Standsicherheits- und
  keine Traglastberechnung. Für Krane gilt allein die Traglasttabelle des Herstellers.
- **Keine Gewähr, keine Haftung.** Alle Ergebnisse (Mengen, Abstände, Kranradien, Schleppkurven,
  Koordinaten, IFC-Dateien) sind überschlägige Hilfen und müssen vor jeder Verwendung fachkundig geprüft
  werden. Die Haftung des Betreibers ist ausgeschlossen, soweit gesetzlich zulässig (siehe
  [Impressum](impressum.html)).
- **Daten.** Die Qualität der Mengen hängt vom Geländemodell ab. Grobe Raster glätten Böschungen.
- **Kein Speichern.** Es gibt keinen Speicherstand. Das IFC-Modell enthält Gelände, Gebäude und auf Wunsch die Bausteine.
- **Datenschutz.** Alle Daten bleiben im Browser. Zwei Funktionen nehmen Verbindung nach außen auf,
  beide nur auf deine Eingabe: die **Adressleiste** (Vorschläge von `photon.komoot.io`) und die
  **Karte** (Kacheln von `tile.openstreetmap.org`, auch die Startkarte erst nach „Karte laden“). Näheres in der [Datenschutzerklärung](datenschutz.html).
- **Lizenz der Daten.** Geodaten verlangen meist eine Quellenangabe. Die Wortlaute stehen in den
  Metadaten des jeweiligen Landes.

---

## 11. Wenn etwas nicht klappt

| Problem | Lösung |
|---|---|
| Bausteine sind grau | Erst ein Geländemodell laden |
| „zu groß für den Browser“ | Ausschnitt schneiden (Abschnitt 1, „Größe“) |
| XYZ- oder LAS-Datei wird nicht geladen | Bezugssystem unter „Bezugssystem für XYZ-Dateien“ wählen oder EPSG-Code eintippen |
| LAS/LAZ: „Pin setzen“ | die Wolke ist größer als 3 km: auf der Startkarte einen Pin setzen, dann die Datei wählen |
| Warnung „außerhalb Europas“ | Der EPSG-Code passt nicht zu den Koordinaten: richtigen Code wählen |
| Gebäude fehlen | Sie liegen außerhalb des Geländes, oder die Gebäudedatei liegt in einem anderen Bezugssystem und nennt es nicht |
| Karte lädt nicht | Offline oder von einer Sperre blockiert; oder das Bezugssystem wird nicht unterstützt |
| Keine Vorschläge in der Adressleiste | Mindestens drei Zeichen tippen; der Suchdienst ist vielleicht nicht erreichbar |
| Ein Bauwerk (zum Beispiel eine Brücke) wird nicht gefunden | In OpenStreetMap fehlt es oder heißt anders: den Ortsnamen oder die Straße suchen oder die Koordinaten eintippen |
| Straßenkurve wird enger als gewünscht | Der Radiusregler ist rot: Punkte weiter auseinander setzen oder den Radius verkleinern |
| Grube: „zu schmal“ | Grube verbreitern, flacher machen oder den Winkel steiler stellen |

Fehler und Wünsche bitte als Issue auf GitHub melden:
[github.com/Mucnese/quick-site-design](https://github.com/Mucnese/quick-site-design).
