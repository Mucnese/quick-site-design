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
8. [IFC-Export](#8-ifc-export)
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

1. **Daten finden.** Gib oben links in der Adressleiste („Wo ist deine Baustelle?“) eine
   Adresse oder einen Ort ein und wähle einen Vorschlag. Darunter erscheinen die Links zur
   Seite des Geländemodells (DGM) und des Gebäudemodells (LoD2) deines Bundeslandes, bei
   Österreich die Seiten von Bund und Land. Die Anwendung lädt dabei nichts herunter, du
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
3. **Gebäude laden (optional).** Ebenfalls im Fenster **Daten**, Zeile „Gebäude · CityGML“.
   Gebäude außerhalb des Geländes werden verworfen.

### Welche Dateien gehen?

| Art | Format | Hinweis |
|---|---|---|
| Gelände | **GeoTIFF** (`.tif`, `.tiff`) | Bezugssystem steht in der Datei |
| Gelände | **XYZ-Text** (`.xyz`, `.txt`, `.csv`) | Rechtswert, Hochwert, Höhe auf einem regelmäßigen Raster. Das Bezugssystem fehlt in der Datei: vorher im Fenster **Daten** unter „Bezugssystem für XYZ-Dateien“ wählen oder einen EPSG-Code eintippen |
| Gebäude | **CityGML** (`.gml`, `.xml`) | LoD2, die Achsenreihenfolge wird erkannt |

Nicht gelesen werden ESRI-ASCII-Raster (`.asc`) und Dezimalkommas in XYZ-Dateien. Wandle sie
vorher in GeoTIFF um, zum Beispiel mit GDAL.

**Größe.** Das Tool liest jede Datei ganz in den Speicher. Es lehnt deshalb vor dem Lesen ab:
Dateien über 1 GB, Kacheln über 100 Millionen Pixel und mehr als 150 Millionen Pixel (oder 2 GB)
zusammen; bei XYZ mehr als 30 Millionen Punkte. Die Meldung nennt die Datei und die Zahl. Dann
vorher einen Ausschnitt schneiden, etwa mit
`gdal_translate -projwin <links> <oben> <rechts> <unten> -of GTiff eingabe.tif ausschnitt.tif`.
Das betrifft vor allem Österreich, wo die BEV-Raster sehr groß sind.

---

## 2. Die Oberfläche

| Bereich | Wo | Was |
|---|---|---|
| **Adressleiste** | ganz oben links | Ort suchen, Links zu den Geodaten |
| **Übersicht** | links | Gelände, Höhenbereich, Objektzahl, Liste der Bausteine mit Mengen |
| **Daten** | links | Gelände, Gebäude, Bezugssystem für XYZ, Karte |
| **Eigenschaften** | rechts | Maße und Werte des gewählten Bausteins |
| **Bausteine** | unten | Container, Turmdrehkran, Mobilkran, Baustraße, Baugrube, IFC Export |
| **DE / EN, 2D, Darstellung, Hilfe** | unten rechts | Sprache, Draufsicht, Aussehen, Kurzhilfe |
| **Kompass** | unten | Nordrichtung, Klick richtet nach Norden aus |
| **Infoleiste** | unten links | Bezugssystem (KBS), DGM-Rasterung, Einheit |

**Darstellung** stellt dunkel oder hell, Schriftart, Schriftgröße, Akzentfarbe und Fensterbreite
(220 bis 400 px) ein. **Hilfe** öffnet eine Kurzübersicht mit einem Link auf diese Anleitung.

---

## 3. Die Ansicht steuern

- **Linke Maustaste ziehen:** umkreisen. Wer auf Gelände, Gebäude oder einen Baustein klickt und
  zieht, dreht um genau diesen Punkt. Wer auf den Hintergrund klickt, kreist die ganze Szene
  um das Zentrum.
- **Rechte oder mittlere Taste ziehen:** verschieben.
- **Mausrad:** zoomen.
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
  (höchstens 32 Eckpunkte). **Esc** bricht ab.

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
- **Leeren** (unten) entfernt alle Bausteine.

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
  Gelände verbindet.
- **Böschung** 1:1, 1:1,5 oder 1:2. Liegt die Fahrbahn über oder unter dem Gelände, schließt
  eine Böschung bis zum Gelände an (Suchgrenze 80 m).
- **Ränder zeigen** blendet die Fahrbahnkanten ein.
- **Schleppkurve Sattelzug prüfen:** siehe Abschnitt 6.

Länge, Fläche und der engste Radius stehen im Eigenschaftsfenster.

### Baugrube

Ein Polygon mit bis zu 32 Ecken. Im Gelände entsteht ein Loch, in das man hineinsieht.

- **Tiefe zum mittleren Gelände** (Standard −5 m) und **Höhe der Unterkante** (m ü. NHN) sind zwei
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
  dem Überstand. Grundlage ist das Blatt 736.107.2 des Kantons Luzern (2006), nicht die RBSV;
  die Werte wurden an den Kurven dieses Blatts abgeglichen (90 % der Punkte innerhalb von 7 cm).
- **Kranradien:** überschneiden sie sich, erscheint eine Warnung in der Übersicht.

Die Rechnungen sind Planungshilfen. Sie ersetzen keine Bemessung und keine Abstimmung mit den
Beteiligten.

---

## 7. Karte (OpenStreetMap)

Im Fenster **Daten** legt der Schalter **Karte · OpenStreetMap** eine Karte als Farbe über das
Gelände. Er ist **standardmäßig aus**. Beim Einschalten lädt dein Browser Kartenkacheln von
`tile.openstreetmap.org`; dabei werden deine IP-Adresse und der ungefähre Standort des Geländes
übertragen (siehe [Datenschutz](datenschutz.html)). Unten links erscheint der Quellenhinweis
„© OpenStreetMap-Mitwirkende“.

- Die Karte braucht ein Bezugssystem, das die Anwendung in Längen- und Breitengrad umrechnen kann:
  UTM (ETRS89 und WGS 84), Gauß-Krüger (DHDN) und Gauß-Krüger Österreich (MGI, EPSG:31254 bis 31256).
  Bei anderen Systemen, zum Beispiel EPSG:3035 des BEV, schaltet sich die Karte mit einer Meldung ab.
- Bei Bessel-Systemen (DHDN, MGI) liegt die Karte auf etwa 1 bis 2 m genau.
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
- **Manuell (2 + 2 Punkte):** Fehlt die Georeferenz oder weicht das Bezugssystem ab, nennt die Meldung
  den Grund und startet das Verfahren: zwei Punkte am **Bauwerk** anklicken, danach die **zugehörigen
  zwei Punkte im Gelände**. Aus den Punktpaaren ergeben sich Lage und Drehung. Das Bauwerk bleibt
  immer **waagerecht**; die Höhe richtet sich nach dem Gelände am ersten Punkt. Stimmen die beiden
  Abstände nicht überein, erscheint eine Warnung. **Esc** bricht ab. Mit **Manuell platzieren** lässt sich
  das Verfahren später wiederholen.
- Mit **Höhe ±** hebt oder senkt man das Bauwerk, **✕** entfernt es.
- Liegt das Bauwerk außerhalb des Geländes, erscheint ein Hinweis. Wird ein anderes Gelände geladen,
  wird ein automatisch platziertes Bauwerk neu gesetzt, ein manuell platziertes entfernt.
- Nicht unterstützt: Längeneinheiten wie Fuß und Zoll (IfcConversionBasedUnit).

### IFC-Export

Die Karte **IFC Export** (unten bei den Bausteinen) gibt **Gelände und Gebäude** als IFC-Datei aus,
georeferenziert im Bezugssystem des geladenen Geländes. Bausteine wie Krane und Container sind nicht
enthalten.

1. Auf **IFC Export** klicken. Die Ansicht wechselt in die Draufsicht.
2. Auf dem Gelände ein **Rechteck aufziehen**. Zoomen ist währenddessen möglich.
3. Im Fenster **IFC-Export** erscheinen Ausdehnung und Koordinatenbezug. Unter **Koordinaten**
   wählst du, wie die Lage in die Datei kommt: **absolut im Bezugssystem** (Voreinstellung:
   Rechtswert, Hochwert und Höhe ü. NHN stehen direkt im Modell, sichtbar in jedem Programm)
   oder **lokal** (kleine Zahlen ab der Nordwestecke, die Lage steckt in der Georeferenz
   `IfcMapConversion`). Die Datei nennt außerdem das Bezugssystem (EPSG-Code, Datum, Zone) und
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
- **Daten.** Die Qualität der Mengen hängt vom Geländemodell ab. Grobe Raster glätten Böschungen.
- **Kein Speichern.** Es gibt keinen Speicherstand. Das IFC-Modell enthält nur Gelände und Gebäude.
- **Datenschutz.** Alle Daten bleiben im Browser. Zwei Funktionen nehmen Verbindung nach außen auf,
  beide nur auf deine Eingabe: die **Adressleiste** (Vorschläge von `photon.komoot.io`) und die
  **Karte** (Kacheln von `tile.openstreetmap.org`). Näheres in der [Datenschutzerklärung](datenschutz.html).
- **Lizenz der Daten.** Geodaten verlangen meist eine Quellenangabe. Die Wortlaute stehen in den
  Metadaten des jeweiligen Landes.

---

## 11. Wenn etwas nicht klappt

| Problem | Lösung |
|---|---|
| Bausteine sind grau | Erst ein Geländemodell laden |
| „zu groß für den Browser“ | Ausschnitt schneiden (Abschnitt 1, „Größe“) |
| XYZ-Datei wird nicht geladen | Bezugssystem unter „Bezugssystem für XYZ-Dateien“ wählen oder EPSG-Code eintippen |
| Warnung „außerhalb Europas“ | Der EPSG-Code passt nicht zu den Koordinaten: richtigen Code wählen |
| Gebäude fehlen | Sie liegen außerhalb des Geländes, oder das Bezugssystem der CityGML-Datei weicht ab |
| Karte lädt nicht | Offline oder von einer Sperre blockiert; oder das Bezugssystem wird nicht unterstützt |
| Keine Vorschläge in der Adressleiste | Mindestens drei Zeichen tippen; der Suchdienst ist vielleicht nicht erreichbar |
| Ein Bauwerk (zum Beispiel eine Brücke) wird nicht gefunden | In OpenStreetMap fehlt es oder heißt anders: den Ortsnamen oder die Straße suchen oder die Koordinaten eintippen |
| Straßenkurve wird enger als gewünscht | Der Radiusregler ist rot: Punkte weiter auseinander setzen oder den Radius verkleinern |
| Grube: „zu schmal“ | Grube verbreitern, flacher machen oder den Winkel steiler stellen |

Fehler und Wünsche bitte als Issue auf GitHub melden:
[github.com/Mucnese/quick-site-design](https://github.com/Mucnese/quick-site-design).
