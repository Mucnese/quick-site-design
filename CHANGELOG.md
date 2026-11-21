# Änderungsprotokoll

Alle nennenswerten Änderungen an Quick-Site-Design, neueste zuerst. Das Format folgt
[Keep a Changelog](https://keepachangelog.com/de/1.1.0/); die Fassungen heißen nach dem Datum
(Jahr-Monat-Tag), weil es keine festen Versionsnummern gibt. Englische Fassung:
[CHANGELOG.en.md](CHANGELOG.en.md).

Kategorien: **Neu**, **Geändert**, **Behoben**, **Entfernt**, **Rechtliches und Datenschutz**.

## 2026-11-21

### Neu
- **Österreich: Gebäudemodell des Bundes.** Jeder Ort in Österreich nennt jetzt das BEV-Modell „DLM Bauwerke“ (ganz Österreich, Blockmodell LoD1 mit Höhen, GeoPackage, CC BY 4.0).
  Ein Hinweis sagt, dass es nicht direkt ladbar ist (die Anwendung liest CityGML und CityJSON). Der Satz „kein landesweites Gebäudemodell“ entfällt.

### Behoben
- **Italien:** Der Link zum Südtiroler Höhenmodell erschien für ganz Italien. Jetzt nur noch für Orte in der Provinz Bozen (Abgleich über den Landkreis, den Photon liefert);
  das Trentino (gleiche Region) und der Rest Italiens zeigen ihn nicht.
- **Belgien:** Die Höhenmodelle von Flandern und Wallonien erschienen für ganz Belgien. Jetzt zeigt jeder Ort nur das seiner Region (Abgleich über die Provinz);
  Brüssel bekommt keines der beiden, sondern den Hinweis, dass kein offenes Geländemodell geprüft wurde.

## 2026-11-20

### Neu
- **Stadtgeoportale:** Für 76 Hauptstädte und Großstädte der EU (in 22 Ländern) nennt die Anwendung zusätzlich zu den Seiten des Landes die Geoportale und Open-Data-Portale
  der Stadt, zum Beispiel für Wien den Geodatenviewer der Stadtvermessung. Eigene Tabelle `GEO_CITIES`, auch als Tabelle in der README; Links erscheinen unter der
  Adressleiste und im Fenster am Pin der Startkarte. Jeder Link wurde aufgerufen; Städte ohne belegbaren Link (zum Beispiel Budapest, Bukarest, Sevilla) fehlen.

### Geändert
- **Mausrad zoomt linear:** Jeder Rastenschritt ändert den Abstand um dieselbe Strecke (ein Sechzigstel der Geländekante, mindestens 5 m), nicht mehr um denselben
  Prozentsatz; nahe am Gelände wird der Schritt nicht mehr winzig.

### Behoben
- **Bezugssystem für XYZ:** Die Auswahl wirkte nur beim ersten Mal. Wechselt man das System (oder den EPSG-Code) nach dem Laden, liest die Anwendung die XYZ-Dateien
  neu und das Gelände wandert an den neuen Ort.

### Entfernt
- **Bereich wählen** auf der Startkarte (Rechteck aufziehen mit Größen- und UTM-Anzeige) ist weg. Die Karte bleibt bei Pin und Adresse; für sehr große Rasterdateien
  gilt weiter das 1000-m-Fenster um den Pin.

## 2026-11-19

### Rechtliches und Datenschutz
- Lizenz einheitlich **GPL Version 3 oder später** (Programmkopf, Impressum, README, Beitragshinweise); der
  Programmkopf nennt die SPDX-Kennung `GPL-3.0-or-later`.

### Neu
- **Anderen Ort wählen:** Wer in der Adressleiste einen Ort wählt, bevor die Karte geladen ist, sieht ihn im Kasten („Karte am Ort laden“) und kommt mit einem Klick dorthin.
  Ist schon ein Gelände geladen (zum Beispiel die Demo) und der Ort liegt außerhalb, öffnet sich die Karte dort wieder; „Zurück zum Gelände“ oder Esc führt zurück.
- **Nationale Bezugssysteme der EU:** Karte, Umrechnung und IFC-Export kennen jetzt die Systeme von Schweden, Finnland, Polen, Slowenien, Luxemburg, Portugal,
  Lettland, Litauen, Griechenland, Kroatien, Irland, Frankreich, Belgien, Estland, den Niederlanden, Tschechien und der Slowakei (an GDAL/PROJ auf wenige Millimeter
  geprüft). Neu sind dafür der Breitenursprung bei Gauß-Krüger, die Lambert-Kegelprojektion, die schiefe stereographische Abbildung (RD New) und Krovak (S-JTSK). Die IFC-Zielliste
  enthält sie.
- **Große GeoTIFF direkt lesen:** Dateien über 300 MB (zum Beispiel das BEV-Höhenraster, 7,9 GB) werden nicht ganz gelesen, sondern nur der Ausschnitt
  um den gewählten Ort (Pin, Rechteck oder Adresse auf der Startkarte). Beim BEV-Raster rund 5 MB und eine halbe Sekunde für 1 × 1 km; die Werte
  stimmen mit GDAL überein. Kein Zuschneiden mit GDAL mehr nötig.
- **EPSG:3035 (ETRS89-LAEA):** Karte, Umrechnung und IFC-Export kennen das Bezugssystem der BEV-Raster (auf 1 cm gegen GDAL geprüft).
- **CityJSON:** Gebäude lassen sich auch als CityJSON laden (CityJSON 1.x und 2.0, CityJSONSeq, Merkmalslisten wie die der 3DBAG-Schnittstelle). Je
  Bauteil gilt die höchste Detailstufe; Grundrisse und Gelände fallen weg. Damit lassen sich die niederländischen 3DBAG-Gebäude laden.
- **Geoportale der EU:** Die Adresssuche und die Startkarte nennen jetzt für alle Länder der EU die Seiten der Landesvermessung für
  das Geländemodell (und Gebäudemodelle, wo es sie gibt: Luxemburg, Niederlande, Frankreich teilweise). Länder ohne bekanntes offenes
  Geländemodell tragen einen Hinweis statt eines geratenen Links. Die Suche und das Erkennen von Koordinaten gelten für die ganze EU.
- **Startkarte** (für Österreich: fertiger `gdal_translate`-Befehl zum Zuschneiden großer Dateien mit Kopieren-Knopf, Pin mit Fenster und den Links zu den Geoportalen, nur dort; unter der Adressleiste nur bei Eingabe, weiches Zoomen ohne leere Flächen und ohne Aufblitzen, grobe Kacheln als Unterlage, Verschieben auch mit Mittel- und rechter Taste): Ohne Gelände zeigt die Seite eine OSM-Karte. Kacheln laden erst nach dem Klick „Karte laden“. Ort anklicken oder
  Rechteck aufziehen nennt Größe und UTM-Werte; die Links zu Gelände- und Gebäudedaten des Landes erscheinen in der Adressleiste.
- **Achslinie** (Felder verschwinden beim Herauszoomen für alle Abschnitte einer Straße gleichzeitig): Jede fertige Straße zeigt ihre Mittellinie. Über der Linie steht die Längsneigung je Abschnitt, darunter die
  Länge (zwei Nachkommastellen); beide lassen sich eintippen. Verschiedene Neigungen zeigt das Eigenschaftsfenster als
  „variabel“, der Regler macht sie wieder einheitlich. Die Länge verschiebt den Endpunkt, die folgenden Punkte rücken mit.
- **Messen:** Werkzeug in der Leiste. Punkte auf Gelände und Gebäuden anklicken; an jeder Strecke stehen
  die waagerechte Länge und der Höhenunterschied (zwei Nachkommastellen). Das Fenster nennt Summen
  (waagerecht und im Raum), Höhenunterschied, Gefälle in Prozent sowie die Höhen von Start und Ende.
- Änderungsprotokoll (diese Datei) und Link dazu im Hilfefenster.
- Dateien für die Mitarbeit: Beitragshinweise, Verhaltenskodex, Sicherheitshinweise, Vorlagen für
  Fehlermeldungen und Änderungsvorschläge, Drittlizenzen.

### Sicherheit
- **Content Security Policy** in `index.html`: nur eigene Dateien, das Programm-Skript über seine Prüfsumme (kein
  `unsafe-inline`), Fremdserver nur für Kartenkacheln (OSM) und die Adresssuche (Photon).
- Die Bibliotheken in `lib/` haben Prüfsummen (`lib/SHA256SUMS`); ein Test erkennt Veränderungen.
- CityGML-Dateien über 300 MB werden vor dem Lesen abgelehnt.

### Behoben
- Achslinie: die zweite Nachkommastelle der Länge verdeckte das „m“. Die Felder passen ihre Breite jetzt dem Text an.
- Straße/Baugrube: Nach dem Versetzen eines Stützpunkts verschob ein Klick irgendwo auf der Karte die ganze Straße,
  wenn zuvor „Verschieben“ angeklickt war. Der Verschiebemodus endet jetzt, sobald ein Stützpunkt angefasst wird.
- Nach dem Anklicken eines Punkts ließ sich manchmal nicht mehr zoomen: die Kamerafahrt zum Punkt konnte bei kleinem
  Gelände nie ankommen und zog die Kamera zurück. Das Mausrad beendet die Fahrt jetzt, und das Fahrtziel liegt immer im
  erlaubten Zoombereich.
- Messen: die Vorschau zur Maus ruckelte. Sie folgt jetzt jeder Mausbewegung und verschiebt nur ein Linienstück und
  einen Punkt; der genaue Punkt auf Gebäuden wird nachgezogen, sobald die Maus kurz steht.

### Geändert
- Achslinie: Neigung und Länge dezenter (kleinere Schrift, durchscheinender Hintergrund, Neigung in Gelb); beim Überfahren treten sie hervor.
- **Schleppkurve Sattelzug:** Maße und Wenderadien jetzt aus dem Export „Sattelzug 16,5“ von Autodesk Vehicle Tracking
  (ersetzt das Luzerner Blatt). Das Modell trifft dessen Radien auf wenige Zentimeter; das Heck schwingt beim Einlenken
  in der Vorlage etwas weiter aus (siehe Anleitung).
- Baugrube: die Tiefe reicht jetzt bis −100 m (vorher −30 m).
- Hilfefenster: „Schließen“ bleibt oben stehen, nur der Text scrollt.
- Kein Nebel mehr beim Herauszoomen; der Hintergrund hinter dem Gelände ist hell.
- Nur noch die dunkle Oberfläche; die Wahl „hell/dunkel“ entfällt.
- Linke Spalte: Adresseingabe und Übersicht scrollen nie, nur das Datenfenster; die Fußzeile mit
  Urheber, Quelltext und Impressum bleibt immer sichtbar.
- Karte (OpenStreetMap) hat einen eigenen Knopf unten links.
- Hinweise und Meldungen stehen einheitlich oben in der Mitte (12 px).

## 2026-11-17

### Neu
- Hinweis „wird verarbeitet / gerendert“ beim Laden großer Gebäudemodelle und IFC-Dateien.
- IFC-Export: Gebäude werden am Rechteck glatt und gerade abgeschnitten.

### Rechtliches und Datenschutz
- Haftungsausschluss in Impressum, README, Anleitung und Hilfe.
- Datenschutzerklärung: Übermittlung in die USA (Data Privacy Framework), ins Vereinigte Königreich
  (Angemessenheitsbeschluss), Hinweis zu Photon, bis zu 144 Karten-Kacheln.

## 2026-11-16

### Neu
- IFC-Export enthält auf Wunsch Straßen, Baugruben, Krane und Container als eigene Bauteile, mit Farben.
- IFC-Export in ein anderes Koordinatensystem umrechnen (UTM, Gauß-Krüger, Österreich; bei DHDN/MGI
  nur auf etwa 1 bis 2 m genau).
- Beim Zeichnen von Straße und Baugrube steht an jeder Strecke die waagerechte Länge.

### Geändert
- Manuelle IFC-Platzierung: Punkte abwechselnd am Bauwerk und im Gelände (A, A, B, B).
- Besserer Textkontrast, deckendere Fenster, schnelleres Verschieben mit Mitte und rechter Taste.
- Karte: feinere Zoomstufe, die Beschriftung wirkt kleiner.

### Behoben
- Beim Linksklick verdrehte sich die Ansicht kurz und schwang zurück.

## 2026-11-14

### Neu
- **IFC-Import:** Bauwerke als IFC-Datei einlesen. Mit Georeferenz und gleichem Bezugssystem wie das
  Gelände automatisch platziert, sonst von Hand über zwei Punktpaare. web-ifc wird erst beim ersten
  Import nachgeladen.

## 2026-11-13

### Neu
- **Adressleiste** mit Ortsvorschlägen (Photon) und Links zu Geländemodell und Gebäudemodell des Landes;
  Koordinaten lassen sich direkt eintippen.
- Hilfe-Knopf, Kurzhilfe und Benutzeranleitung (Deutsch und Englisch).
- IFC-Export: absolute Koordinaten wählbar, vollständigeres Bezugssystem und Lage der Baustelle.

### Geändert
- Alle Links öffnen in einem neuen Tab.
- Die Zeichenvorschau folgt dem Gelände.

## 2026-11-12

### Neu
- **Baugrube** als neues Werkzeug; Baustraße und Baugrube mit Rechtsklick abschließen, „Punkt
  hinzufügen“, Böschungswinkel.
- **Schleppkurve Sattelzug** prüfen (Blatt 736.107.2, Kanton Luzern).
- **Karte** (OpenStreetMap) als Grundlage auf dem Gelände (Schalter, standardmäßig aus).
- XYZ-Dateien einlesen, mit Wahl des Bezugssystems; Grenzen für sehr große GeoTIFF.
- Tabelle der Geoportale: Formate, Spalte Gebäudemodell, Österreich.
- Übersicht mit Gesamtmengen für Straßen und Baugruben.
- Weitere Liebherr-Mobilkrane aus den Datenblättern.

## 2026-11-11

### Neu
- Baustraße mit Längsneigung und wählbarer Böschung, Abtrag und Auftrag.
- Gelände: Detailstufe passt sich automatisch dem Zoom an.
- Schieberegler mit Zahlenfeld zum Eintippen.
- IFC Export als Karte in der Werkzeugleiste.

### Behoben
- Ansicht dreht sich nicht mehr beim Verschieben; Container-Editor repariert; Punktfenster zittert nicht.

## 2026-09-17

### Neu
- Turmdrehkran als generisches Modell, Mobilkrane mit echter Achszahl und Maßen.

## 2026-09-16

### Neu
- **IFC-Export** von Gelände und Gebäuden über ein Rechteck in der Draufsicht.
- Namensnennung für die Beispieldaten (CC BY 4.0).

## 2026-09-15

- Erste veröffentlichte Fassung: Gelände (GeoTIFF) und Gebäude (CityGML) laden, Container, Turmdrehkran und
  Mobilkran setzen, Kranradien prüfen. GPLv3.
