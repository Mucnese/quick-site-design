# Changelog

All notable changes to Quick-Site-Design, newest first. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); releases are named by date (year-month-day)
because there are no fixed version numbers. German version: [CHANGELOG.md](CHANGELOG.md).

Categories: **Added**, **Changed**, **Fixed**, **Removed**, **Legal and privacy**.

## 2026-11-19

### Legal and privacy
- Licence unified as **GPL version 3 or later** (program header, legal notice, README, contribution guide); the
  program header carries the SPDX identifier `GPL-3.0-or-later`.

### Added
- **National coordinate systems of the EU:** The map, the conversion and the IFC export now know the systems of Sweden, Finland, Poland, Slovenia, Luxembourg, Portugal,
  Latvia, Lithuania, Greece, Croatia, Ireland, France, Belgium, Estonia, the Netherlands, Czechia and Slovakia (checked against GDAL/PROJ to a few millimetres). New for this are the
  latitude origin for Gauss-Krüger, the Lambert conic projection, the oblique stereographic projection (RD New) and Krovak (S-JTSK). The IFC target list includes them.
- **Reading large GeoTIFFs directly:** Files over 300 MB (for example the BEV height raster, 7.9 GB) are not read completely, only the area around
  the chosen place (pin, rectangle or address on the start map). For the BEV raster about 5 MB and half a second for 1 × 1 km; the values match
  GDAL. Cutting with GDAL is no longer necessary.
- **EPSG:3035 (ETRS89-LAEA):** The map, the conversion and the IFC export know the coordinate system of the BEV rasters (checked against GDAL to 1 cm).
- **CityJSON:** Buildings can also be loaded as CityJSON (CityJSON 1.x and 2.0, CityJSONSeq, feature lists like those of the 3DBAG API). The
  highest level of detail of each part is used; footprints and terrain are dropped. This makes the Dutch 3DBAG buildings loadable.
- **EU geoportals:** The address search and the start map now name the pages of the national mapping agency for the terrain model
  of every EU country (and building models where they exist: Luxembourg, the Netherlands, France partly). Countries without a
  known open terrain model carry a note instead of a guessed link. The search and the recognition of coordinates cover the whole EU.
- **Start map** (for Austria: ready-made `gdal_translate` command for cutting large files, with a Copy button, pin with a window and the links to the geoportals, only there; below the address bar only when typing, smooth zoom without empty areas and without flashing, coarse tiles as an underlay, panning also with the middle and right button): without terrain the page shows an OSM map. Tiles load only after clicking “Load map”. Clicking a place or dragging a
  rectangle gives the size and UTM values; the links to the state's terrain and building data appear in the address bar.
- **Axis line** (the fields disappear for all sections of a road at once when zooming out): every finished road shows its centre line. Above the line is the longitudinal slope per section, below it the
  length (two decimals); both can be typed in. Different slopes show as “variable” in the properties window, the slider makes
  them uniform again. The length moves the end point, the following points move with it.
- **Measure:** tool in the toolbar. Click points on terrain and buildings; every segment shows its
  horizontal length and height difference (two decimals). The window gives totals (horizontal and in
  space), height difference, slope in percent and the heights of start and end.
- Changelog (this file) and a link to it in the help window.
- Files for contributing: contribution guide, code of conduct, security policy, templates for bug
  reports and suggestions, third-party licences.

### Security
- **Content Security Policy** in `index.html`: own files only, the program script via its checksum (no
  `unsafe-inline`), third-party servers only for map tiles (OSM) and the address search (Photon).
- The libraries in `lib/` have checksums (`lib/SHA256SUMS`); a test detects changes.
- CityGML files over 300 MB are rejected before reading.

### Fixed
- Axis line: the second decimal of the length covered the “m”. The fields now fit their width to the text.
- Road/excavation: after moving a node, a click anywhere on the map moved the whole road if “Move” had been
  clicked before. Move mode now ends as soon as a node is touched.
- After clicking a point, zooming sometimes no longer worked: with a small terrain the camera move to the point could
  never arrive and kept pulling the camera back. The mouse wheel now ends the move, and its target always lies within
  the allowed zoom range.
- Measure: the preview to the mouse was choppy. It now follows every mouse movement and only moves one line piece
  and one point; the exact point on buildings follows as soon as the mouse rests briefly.

### Changed
- Axis line: slope and length more subtle (smaller type, translucent background, slope in yellow); they stand out when hovered.
- **Swept path of the semi-trailer:** dimensions and turning radii now from the “Sattelzug 16,5” export of Autodesk
  Vehicle Tracking (replaces the Luzern sheet). The model matches its radii to within a few centimetres; when turning in,
  the rear swings out a little further in the template (see guide).
- Excavation: the depth now goes down to −100 m (before −30 m).
- Help window: “Close” stays at the top, only the text scrolls.
- No fog when zooming out; the background behind the terrain is light.
- Dark interface only; the light/dark choice is gone.
- Left column: address input and overview never scroll, only the data window does; the footer with
  copyright, source code and legal notice is always visible.
- The map (OpenStreetMap) has its own button at the bottom left.
- Hints and messages appear uniformly at the top centre (12 px).

## 2026-11-17

### Added
- “Being processed / rendered” hint while loading large building models and IFC files.
- IFC export: buildings are cut off cleanly and straight at the rectangle.

### Legal and privacy
- Liability disclaimer in the legal notice, README, guide and help.
- Privacy statement: transfer to the USA (Data Privacy Framework), to the United Kingdom (adequacy
  decision), note on Photon, up to 144 map tiles.

## 2026-11-16

### Added
- IFC export optionally contains roads, excavations, cranes and containers as separate building
  elements, with colours.
- IFC export can convert to another coordinate system (UTM, Gauss-Krüger, Austria; DHDN/MGI only
  accurate to about 1 to 2 m).
- While drawing a road or excavation, every segment shows its horizontal length.

### Changed
- Manual IFC placement: points alternately on the structure and on the terrain (A, A, B, B).
- Better text contrast, more opaque windows, faster panning with the middle and right button.
- Map: finer zoom level, the labels look smaller.

### Fixed
- On left click the view briefly twisted and swung back.

## 2026-11-14

### Added
- **IFC import:** load structures as IFC files. With a georeference and the same coordinate system as the
  terrain they are placed automatically, otherwise by hand using two point pairs. web-ifc is loaded
  only on the first import.

## 2026-11-13

### Added
- **Address bar** with place suggestions (Photon) and links to the terrain model and building model of
  the state; coordinates can be typed in directly.
- Help button, short help and user guide (German and English).
- IFC export: absolute coordinates selectable, fuller coordinate reference and site position.

### Changed
- All links open in a new tab.
- The drawing preview follows the terrain.

## 2026-11-12

### Added
- **Excavation** as a new tool; finish haul roads and excavations with a right-click, “Add point”, slope
  angle.
- **Swept path of a semi-trailer** check (sheet 736.107.2, Kanton Luzern).
- **Map** (OpenStreetMap) as a base on the terrain (switch, off by default).
- Read XYZ files, with a choice of coordinate system; limits for very large GeoTIFFs.
- Table of geoportals: formats, building model column, Austria.
- Overview with total quantities for roads and excavations.
- More Liebherr mobile cranes from the data sheets.

## 2026-11-11

### Added
- Haul road with longitudinal slope and selectable embankment, cut and fill.
- Terrain: level of detail adapts to the zoom automatically.
- Sliders with a number field for typing.
- IFC export as a card in the toolbar.

### Fixed
- The view no longer rotates while panning; container editor repaired; the point window no longer jitters.

## 2026-09-17

### Added
- Tower crane as a generic model, mobile cranes with real axle count and dimensions.

## 2026-09-16

### Added
- **IFC export** of terrain and buildings via a rectangle in the top view.
- Attribution for the sample data (CC BY 4.0).

## 2026-09-15

- First published version: load terrain (GeoTIFF) and buildings (CityGML), place containers, tower cranes
  and mobile cranes, check crane radii. GPLv3.
