![Quick-Site-Design](docs/header.png)

# Quick-Site-Design

*[Deutsche Fassung](README.md)*

A tool for the early stage of construction site layout. The official terrain
model of the site is loaded and populated with what actually goes on it: site
offices, tower cranes, mobile cranes, haul roads. Everything to scale,
everything on real elevations.

A crane position is set in two minutes and moved in two more. Immediately
visible: whether the radius reaches, whether two crane radii overlap, whether
the office block fits the available area, and how the haul road sits in the
terrain. It does not replace detailed design.

Technically one HTML file of roughly 150 KB plus three libraries next to it. No
server, no installation, no build step. Once opened, all data stays in the
browser.

**[→ Open the application](https://quick-site-design.com/)**

---

## What it does

**Geospatial data**
- GeoTIFF terrain models, several tiles at once. Pixels from all tiles are
  averaged into a common grid, so differing resolutions and overlaps are not a
  problem.
- CityGML LOD2, also as a batch. Axis order is detected automatically, buildings
  outside the tile are discarded.
- Detail level from 140 grid points up to the untouched source resolution.
- The coordinate reference system is read from the GeoKeys.

**Site elements**
- Container blocks up to 25 side by side, 2 rows, 5 storeys. With two rows a
  walkway one container wide is left between them, filled by a plain connecting
  block.
- Tower crane as a generic model, jib length, hook height and mast width
  freely adjustable within the range of real construction cranes.
- 9 Liebherr mobile cranes from 50 t to 750 t, all figures taken from the
  manufacturers' original data sheets.
- Haul roads as a polyline with filleted corners; the alignment drapes onto the
  terrain. Selecting a road reveals its nodes, which can be moved or deleted.

**Interaction**
- Left-click on terrain or buildings sets a measure point, shows easting,
  northing and elevation right at the point, and makes it the orbit and zoom
  centre.
- **2D** button resets the view to straight from above; dragging tilts it back
  into space. The compass shows north and orients to it on click.
- Warning when crane radii overlap; the haul road radius slider turns red as
  soon as the minimum radius no longer fits between the nodes.
- Two interface styles (dark and light), eleven typefaces, German and English.

---

## Demo

**[→ Open the demo](https://quick-site-design.com/?demo=1)**

The link loads terrain and buildings automatically. After a few seconds a square
kilometre of real terrain with 612 buildings is ready — pick an element from the
bar at the bottom and click on the terrain.

The data set:

| File | Contents |
|---|---|
| `demo/demo_dgm.tif` | DTM, 1000 × 1000 points, 1 m grid, elevations 503.1 to 520.7 m |
| `demo/demo_lod2.gml` | LOD2 building model, 612 buildings, clipped to the tile |

ETRS89 / UTM zone 32N (EPSG:25832), south-west corner at E 692000 / N 5336000,
located at roughly 48.153 North and 11.588 East.

Own data goes in through the two file inputs under **Data**: terrain first, then
buildings.

The sample data originates from the Bavarian surveying authority
([geodaten.bayern.de](https://geodaten.bayern.de/opengeodata/OpenDataDetail.html?pn=dgm1)),
published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
The attribution is displayed inside the application for as long as the sample
data is loaded.

---

## Important note on the crane data

The crane figures are **guide values**. They come from the manufacturers'
published data sheets, but they depend on the rigging configuration, tower
combination and ballasting.

**For actual planning, only the load chart of the specific crane is
authoritative.** This application does not replace structural verification,
stability calculations, or coordination with the crane hire company.

Outrigger dimensions and carrier lengths serve presentation only and are
schematic.

---

## Where to get the data

All 16 German federal states publish their 1 m terrain model (DGM1) as open
data, free of charge. The portals differ considerably in format, tiling, access
and licence.

| State | Authority | Portal | Licence |
|---|---|---|---|
| Baden-Württemberg | LGL-BW | [opengeodata.lgl-bw.de](https://opengeodata.lgl-bw.de/) | dl-de/by-2-0 |
| Bavaria | Bayer. Vermessungsverwaltung | [geodaten.bayern.de](https://geodaten.bayern.de/opengeodata/OpenDataDetail.html?pn=dgm1) | cc-by/4.0 |
| Berlin | — | included in the Brandenburg data | — |
| Brandenburg | LGB | [geoportal.brandenburg.de](https://geoportal.brandenburg.de/) | dl-de/by-2-0 |
| Bremen | LGV Bremen | [geoportal.bremen.de](https://geoportal.bremen.de/geoportal/) | cc-by/4.0 |
| Hamburg | LGV Hamburg | [metaver.de](https://metaver.de/trefferanzeige?docuuid=A39B4E86-15E2-4BF7-BA82-66F9913D5640) | dl-de/by-2-0 |
| Hesse | HVBG | [hvbg.hessen.de](https://hvbg.hessen.de/landesvermessung/geotopographie/3d-daten/digitale-gelaendemodelle) | dl-de/by-2-0 |
| Mecklenburg-Vorpommern | LAiV MV | [laiv.geodaten-mv.de](https://laiv.geodaten-mv.de/afgvk/Geotopographie/Download?produkt=DGM1) | dl-de/by-2-0 |
| Lower Saxony | LGLN | [opengeodata.lgln.niedersachsen.de](https://opengeodata.lgln.niedersachsen.de/) | cc-by/4.0 |
| North Rhine-Westphalia | Geobasis NRW | [opengeodata.nrw.de](https://www.opengeodata.nrw.de/produkte/geobasis/hm/dgm1_tiff/) | dl-de/by-2-0 |
| Rhineland-Palatinate | LVermGeo RP | [geoshop.rlp.de](https://geoshop.rlp.de/opendata-dgm1.html) | dl-de/by-2-0 |
| Saarland | LVGL-SL | [saarland.de/lvgl](https://www.saarland.de/lvgl/DE/themen-aufgaben/themen/geotopographie/digitalegelaendemodelle/digitalegelaendemodelle) | dl-de/by-2-0 |
| Saxony | GeoSN | [geodaten.sachsen.de](https://www.geodaten.sachsen.de/downloadbereich-digitale-hoehenmodelle-4851.html) | dl-de/by-2-0 |
| Saxony-Anhalt | LVermGeo ST | [lvermgeo.sachsen-anhalt.de](https://www.lvermgeo.sachsen-anhalt.de/de/gdp-dgm-dom-lsa.html) | dl-de/by-2-0 |
| Schleswig-Holstein | LVermGeo SH | [opendata.schleswig-holstein.de](https://opendata.schleswig-holstein.de/dataset/digitales-gelandemodell-1-dgm1) | cc-by/4.0 |
| Thuringia | TLBG | [tlbg.thueringen.de](https://tlbg.thueringen.de/geobasisdaten/3d-informationen/digitale-gelaendemodelle) | dl-de/by-2-0 |

**Format.** Quick-Site-Design expects GeoTIFF with elevation values as float
and a georeference in the header. Most states deliver exactly that, Lower
Saxony as Cloud-Optimized GeoTIFF. Bremen, Schleswig-Holstein and parts of
Thuringia publish XYZ ASCII — that data has to be converted before loading,
for example with GDAL.

**Tiling.** Usually 1 × 1 km, sometimes 2 × 2 km. Several tiles can be selected
together and are merged on load.

**Building models.** LOD2 data mostly sits in the same portals, occasionally
under different licences; listed there as "LoD2" or "3D-Gebäudemodell".

**Attribution.** Both licences require a source statement. The exact wording is
in the metadata of the respective state.

Data from other countries works too, as long as the GeoTIFF carries a projected
coordinate system and the CityGML uses the same one.

---

## Repository layout

```
quick-site-design/
├── index.html            the application, built from src/
├── impressum.html        legal notice (German)
├── datenschutz.html      privacy policy (German)
├── README.md             German
├── README.en.md
├── PROJEKT.md            developer notes (German)
├── LICENSE
├── build.py
├── .gitignore
├── lib/
│   ├── three.min.js      libraries, local instead of CDN
│   ├── OrbitControls.js
│   ├── geotiff.js
│   └── LIESMICH.txt      which file comes from where
├── demo/
│   ├── demo_dgm.tif      terrain model for the demo link
│   ├── demo_lod2.gml     building model for the demo link
│   └── LIESMICH.txt      source and licence of the sample data
├── docs/
│   └── header.png        header image for the README
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

`index.html` is assembled from the four files in `src/` with
`python3 build.py`. The tests in `test/` run under `node` and need no browser.
Details are in `PROJEKT.md` (German).

---

## Running it yourself

The application requires three libraries:

| Library | Licence |
|---|---|
| three.js r128 | MIT |
| OrbitControls (three.js examples) | MIT |
| geotiff.js 2.1.3 | MIT |

All three are compatible with the GPLv3 and live in the `lib/` folder. They are
**not** loaded from a CDN, so opening the page creates no connections to third
parties and the application also works offline.

The library files themselves are not part of the repository; their sources are
listed in [`lib/LIESMICH.txt`](lib/LIESMICH.txt) (German).

For operation on a private web space, `index.html` together with the `lib/` and
`demo/` folders in the web directory is sufficient. The `demo/` folder is only
needed for the demo link.

---

## Legal

[Impressum](impressum.html) · [Datenschutzerklärung](datenschutz.html)

Both pages are in German, as required for a site operated from Germany.

---

## Licence

Copyright © 2026 Haoran Li

GNU General Public License, version 3 or later. See [LICENSE](LICENSE).

In short: the software may be used, distributed and modified. A distributed
modified version must also be under the GPLv3, with its source available.

The software is provided without any warranty.
