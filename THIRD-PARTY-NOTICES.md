# Drittsoftware und Drittdaten / Third-party software and data

Quick-Site-Design selbst steht unter der **GNU General Public License, Version 3 oder später** (siehe [LICENSE](LICENSE)).
Die folgenden Bestandteile stammen von Dritten und behalten ihre eigenen Lizenzen. Alle sind mit der
GPLv3 verträglich. Sie liegen unverändert im Ordner `lib/`; die Prüfsummen stehen in
[`lib/SHA256SUMS`](lib/SHA256SUMS) und werden von `node test/validate-html.js` geprüft.

Quick-Site-Design itself is licensed under the **GNU General Public License, version 3 or later** (see
[LICENSE](LICENSE)). The components below come from third parties and keep their own licences. All are
compatible with the GPLv3. They are included unmodified in `lib/`; checksums are in
[`lib/SHA256SUMS`](lib/SHA256SUMS) and verified by `node test/validate-html.js`.

## Bibliotheken / Libraries

| Datei / File | Projekt / Project | Version | Lizenz / Licence | Lizenztext / Licence text | Quelle / Source |
|---|---|---|---|---|---|
| `lib/three.min.js` | three.js | r128 | MIT | [`lib/LICENSE-three.txt`](lib/LICENSE-three.txt) | https://github.com/mrdoob/three.js |
| `lib/OrbitControls.js` | three.js (examples) | r128 | MIT | [`lib/LICENSE-three.txt`](lib/LICENSE-three.txt) | https://github.com/mrdoob/three.js |
| `lib/geotiff.js` | geotiff.js | 2.1.3 | MIT | [`lib/LICENSE-geotiff.txt`](lib/LICENSE-geotiff.txt) | https://github.com/geotiffjs/geotiff.js |
| `lib/web-ifc-api-iife.js`, `lib/web-ifc.wasm` | web-ifc (That Open Company) | 0.0.79 | MPL-2.0 | [`lib/LICENSE-web-ifc.txt`](lib/LICENSE-web-ifc.txt) | https://github.com/ThatOpen/engine_web-ifc |
| `lib/laz-perf.js`, `lib/laz-perf.wasm` | laz-perf (Hobu, Inc.) | 0.0.7 | Apache-2.0 | [`lib/LICENSE-laz-perf.txt`](lib/LICENSE-laz-perf.txt) | https://github.com/hobuinc/laz-perf |

Herkunft der Dateien und Download-Adressen: [`lib/LIESMICH.txt`](lib/LIESMICH.txt). Die Dateien three.js,
OrbitControls und geotiff.js stimmen byte-genau mit den offiziellen Downloads überein (Stand 19. November 2026).

Origin of the files and download addresses: [`lib/LIESMICH.txt`](lib/LIESMICH.txt). The three.js,
OrbitControls and geotiff.js files are byte-identical to the official downloads (as of 19 November 2026).

### Apache-2.0 (laz-perf)

laz-perf (LAZ-Entpacker, nur für LAZ-Punktwolken) steht unter der Apache-Lizenz 2.0, die mit der GPLv3 verträglich ist. Die Dateien liegen **unverändert**
bei (npm-Paket 0.0.7, Ordner `lib/web/`); sie werden erst beim ersten LAZ-Import geladen. Der Lizenztext liegt bei.

laz-perf (LAZ decompressor, only for LAZ point clouds) is under the Apache License 2.0, which is compatible with the GPLv3. The files are included **unmodified**
(npm package 0.0.7, folder `lib/web/`); they are loaded only on the first LAZ import. The licence text is included.

### MPL-2.0 (web-ifc)

web-ifc steht unter der Mozilla Public License 2.0 (Datei-Ebene). Die Dateien liegen **unverändert** bei; der
Quelltext ist öffentlich unter https://github.com/ThatOpen/engine_web-ifc. Wer die web-ifc-Dateien ändert, muss
die geänderten Dateien unter der MPL-2.0 weitergeben. Die Datei `web-ifc.wasm` ist ein Übersetzungsergebnis
des dortigen Quelltexts; sie wird erst beim ersten IFC-Import geladen.

web-ifc is under the Mozilla Public License 2.0 (file level). The files are included **unmodified**; the source
is public at https://github.com/ThatOpen/engine_web-ifc. Anyone who modifies the web-ifc files must distribute
the modified files under the MPL-2.0. `web-ifc.wasm` is a build product of that source; it is loaded only
on the first IFC import.

### In geotiff.js enthaltene Pakete / Packages contained in geotiff.js

geotiff.js 2.1.3 bündelt seine Abhängigkeiten in `lib/geotiff.js`. Nach den Angaben der Pakete (npm) sind das:

| Paket / Package | Lizenz / Licence |
|---|---|
| lerc | Apache-2.0 |
| pako | MIT AND Zlib |
| zstddec | MIT AND BSD-3-Clause |
| quick-lru | MIT |
| xml-utils | CC0-1.0 |
| web-worker | Apache-2.0 |
| parse-headers | MIT |
| @petamoriken/float16 | MIT |

Die Lizenzen der enthaltenen Pakete stehen in den jeweiligen Projekten (Links über npm). Für Apache-2.0 gilt:
https://www.apache.org/licenses/LICENSE-2.0. / The licences of the contained packages are in the respective
projects (links via npm). For Apache-2.0 see https://www.apache.org/licenses/LICENSE-2.0.

> Hinweis zur Genauigkeit / Accuracy note: Die Liste der Pakete und Lizenzen stammt aus den npm-Angaben zu
> geotiff 2.1.3 (Stand 19. November 2026). Welche davon im Browser-Bündel stecken, wurde nicht Zeile für Zeile
> geprüft. / The list comes from the npm metadata of geotiff 2.1.3 (as of 19 November 2026); which of them end
> up in the browser bundle was not checked line by line.

## Daten und Dienste / Data and services

| Was / What | Lizenz oder Bedingungen / Licence or terms | Wo / Where |
|---|---|---|
| Beispieldaten (DGM1, LoD2), Bayerische Vermessungsverwaltung | CC BY 4.0 | [`demo/LIESMICH.txt`](demo/LIESMICH.txt) |
| OpenStreetMap-Kartenkacheln (nur auf Wunsch) | ODbL, © OpenStreetMap-Mitwirkende; Tile Usage Policy | https://www.openstreetmap.org/copyright |
| Adresssuche Photon (nur auf Eingabe), Betreiber Komoot | Demo-Server, Fair Use; Daten © OpenStreetMap-Mitwirkende | https://github.com/komoot/photon |
| Geobasisdaten der Länder (vom Nutzer geladen) | je Land, meist dl-de/by-2.0 oder CC BY 4.0 | Tabelle in [README.md](README.md) |

## Marken / Trademarks

Hersteller- und Modellnamen (zum Beispiel „Liebherr LTM“) werden nur genannt, um die Geräte zu bezeichnen, deren
veröffentlichte Datenblätter als Richtwerte dienen. Es besteht keine Verbindung zu den Herstellern, und sie
unterstützen oder prüfen dieses Projekt nicht. Die Marken gehören den jeweiligen Inhabern. Das IFC-Piktogramm der
Anwendung ist eine eigene Darstellung; das Logo von buildingSMART wird nicht verwendet.

Manufacturer and model names (for example “Liebherr LTM”) are used only to identify the machines whose
published data sheets serve as guide values. There is no affiliation with the manufacturers, and they neither
endorse nor review this project. The trademarks belong to their owners. The IFC icon in the application is an
original drawing; the buildingSMART logo is not used.
