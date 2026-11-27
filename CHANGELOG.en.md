# Changelog

All notable changes to Quick-Site-Design, newest first. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); releases are named by date (year-month-day)
because there are no fixed version numbers. German version: [CHANGELOG.md](CHANGELOG.md).

Categories: **Added**, **Changed**, **Fixed**, **Removed**, **Legal and privacy**.

## 2026-11-27

### Added
- **Click an IFC element:** a window with class, name, type, material, container and all properties and quantities; the element is highlighted.
- **Filter by any attribute with quantities:** at the top of the element window (attributes from A to Z, “is” or “contains”, value editable by hand) or by clicking a row; with count, volume, surface area and the quantities from the IFC.
- **Isolate and hide** an element or a whole file, with “Show all”.
- **Reset filter** removes only the filter.
- With an IFC structure loaded, the view can also be turned from below.
- **Add IFC files:** a new selection is added to the loaded structure instead of replacing it.

### Changed
- **Large IFC files respond faster:** clicking and turning the view on a large structure no longer blocks (the geometry is stored in spatial blocks).

### Added
- **Several IFC files at once:** parts of a structure (superstructure, substructure, temporary works) are combined into one structure and placed together.
- Single small parts far from the structure (such as a marker at height 0) no longer shift the centre used by the arrows, the rotation and the camera.

### Fixed
- **IFC import, length unit:** The project unit (`IfcProject.UnitsInContext`) now applies, not the first length unit in the file. Before, a structure from a file with further units (for example decimetres in Revit files) could appear at the wrong size.
- **Panning was sluggish after zooming in close:** the speed now follows the point under the mouse pointer.
- **Zooming in got stuck:** the mouse wheel stopped 12 m before the rotation centre even when what you saw was far away. The centre now moves along, up to 3 m before what is in the middle of the picture.
- **Old Gauss-Krüger codes:** EPSG:31462 to 31465 (for example `31463` in Revit IFC files) and the variants 5676 to 5679 are now understood like 31466 to 31469.

### Added
- **Choose the coordinate system (CRS):** In the data window you can choose a system or type an EPSG code; terrain and buildings are converted to it (for example UTM to Gauss-Krüger), with the accuracy stated. Heights stay unchanged; blocks are removed after a question when changing.
- **More accurate with BeTA2007:** Between German Gauss-Krüger (DHDN) and ETRS89 the application now uses the AdV BeTA2007 grid (about 1 m instead of about 3 m), also for IFC export and the map.
- **IFC with national coordinates but no georeference** is placed automatically if the coordinates lie within the terrain.
- Building files naming another coordinate system than the terrain are converted.
- **Red warning** when an IFC structure is in another coordinate system than the terrain (stays after aligning by hand).

### Changed
- **“Remove” for all data:** The terrain now has the button too; for terrain, buildings and structure it is always at the top right. For the terrain, after a question everything is removed, because everything depends on it.

### Added
- **Move and rotate an IFC structure:** Besides aligning with four points there is “Move & rotate”: arrows at the centre of the structure (X east, Y north, Z height) each move it only in that direction, a ring rotates it about the vertical axis through its centre. Shift and rotation are shown in four fields and can be typed (before there was only “Height ±”).
  The “Place manually” button is now called “Align 4 points”.

## 2026-11-22

### Changed
- **IFC export no longer turns to north, the rectangle follows the screen:** When the rectangle starts, the view switches to the top view but keeps its heading (also when framing afterwards). The dragged rectangle follows the screen,
  so with a turned view it is turned against north; the export cuts out exactly this area (terrain, buildings, blocks, with clean edges). The coordinates in the IFC stay axis-parallel in the coordinate system. With north up nothing changes. The “2D” button still turns north up as before.
- **Data window clearer:** Terrain, buildings and structure can be collapsed (click the heading, ▾/▸). A loaded file collapses by itself and shows only the status line;
  errors and empty sections stay open, and so do the 2D settings of the buildings. The coordinate-system choice for XYZ and LAS appears only when it is needed.

### New
- **Reset:** A button below “Clear” resets everything (terrain, buildings, structure, blocks; the page reloads, without ?demo=1). It asks first, Cancel is preselected, Esc cancels.
  “Clear” now asks as well (with the number of blocks) and says “no blocks” when there is nothing to delete.
- **Point clouds (LAS and LAZ) as terrain model:** The ground points (class 2, plus water) are averaged into a height grid, small gaps are filled, vegetation, buildings and noise are dropped
  (without classification the lowest point per cell is used). Coordinate system from the file (GeoKey or WKT), otherwise a choice as for XYZ. Clouds over 3 km need a pin (only the area is gridded).
  New library `laz-perf` (Apache-2.0, LAZ only, loaded only then). Checked in the browser with 4.2 million points (25 MB LAZ): under 2 seconds. LAS 1.2 and LAZ 1.2 and 1.4 are tested.

- **INSPIRE buildings (GML, 2D):** The ČÚZK “buildings” export (RÚIAN, `bu-ext2d`) is recognised and loaded as footprints, no longer wrongly read as CityGML (the polygons have only two coordinates per point,
  with EPSG:4258 in the order latitude, longitude). Number of floors and height are taken over where populated; checked with a file of 1163 footprints (14 MB, no heights): 1.3 seconds.

### Fixed
- **Flicker at the edge of the black block:** From a distance (from about 1.5 km) terrain and plinth fought over the same pixels because the plinth lay only 0.2 m below the lowest terrain. The plinth now lies deeper depending on the tile size and is pushed back in depth.

### Changed
- **Czechia:** The DMR 5G in ETRS89 (LAZ tiles of 2 × 2 km, free of charge, CC BY 4.0, coordinates according to the page UTM 33N) is listed; it loads directly. For LAS/LAZ class 8 (model key points, as in NRW) counts as ground
  when there is no class 2; the cell size follows the ground share of a sample (checked with an NRW file: 0.3 million points on 4 km², 5 m grid).
- **Denmark:** The elevation model is listed as GeoTIFF (as reported; the page loads by script and could not be read here). Privacy policy: now names five libraries.

## 2026-11-21

### Changed
- **France and Spain:** The note “not everywhere” is now precise. France: MNT LiDAR HD is published for about 78 % of the area as of 6 September 2026, French Guiana is not in the programme; a new link
  shows the coverage by municipality. Spain: MDT02 (2nd coverage) exists for all of Spain in sheets; Ceuta, Melilla and Alborán come from aerial photos. The **Canary Islands** (REGCAN95, EPSG:4082 and 4083)
  are now recognised (map, conversion; checked against GDAL to under 1 mm). Privacy policy: the statement about the rectangle on the start map was removed.

### New
- **2D building data (GeoPackage, shapefile, GeoJSON):** Footprints with attributes can be loaded as buildings (blocks with a flat roof, courtyards stay open). After loading you choose ground and
  building height from the attributes (above ground or absolute, with a factor) or give fixed values; coordinate system from the file, changeable. GeoPackage also over 2 GB: only the area around the
  terrain is read (R-tree). Checked with the BEV file “DLM Bauwerke” (2.5 GB): Vienna, 1 km², 1058 buildings in under a second.
- **Prague and other cities:** A city 3D model now appears with the building models, and the note “no building model checked” disappears then.
- **Building models of more countries (search for “LoD”):** Estonia (LoD2, all of Estonia, CityGML), Poland (LoD1 all of Poland, LoD2 partly, CityGML 2.0), Finland (LoD2, CityGML,
  so far example areas) and Flanders (3D GRB, LoD1, shapefile/KML, only there) are listed, plus 3D city models for Helsinki, Prague, Bordeaux and Clermont-Ferrand. The group
  is now called “Building model (LoD1/LoD2)”; where the format cannot be loaded, a note says so. The search found none in the other countries.
- **Austria: federal building model.** Every place in Austria now lists the BEV model “DLM Bauwerke” (all of Austria, block model LoD1 with heights, GeoPackage, CC BY 4.0).
  A note says it cannot be loaded directly (the application reads CityGML and CityJSON). The statement “no nationwide building model” is gone.

### Fixed
- **Italy:** The link to the South Tyrol elevation model appeared for all of Italy. Now only for places in the province of Bolzano (matched by the county Photon returns);
  Trentino (same region) and the rest of Italy do not show it.
- **Belgium:** The elevation models of Flanders and Wallonia appeared for all of Belgium. Now each place shows only the one of its region (matched by province);
  Brussels gets neither, but the note that no open terrain model was checked.

## 2026-11-20

### New
- **City geoportals:** For 76 capitals and large cities of the EU (in 22 countries) the application now also lists the city's geoportals and open-data portals
  in addition to the state's pages, for example the geodata viewer of the city survey for Vienna. Own table `GEO_CITIES`, also as a table in the README; the links appear below the
  address bar and in the window at the pin of the start map. Every link was opened; cities without a verifiable link (for example Budapest, Bucharest, Seville) are missing.

### Changed
- **Mouse wheel zooms linearly:** every wheel step changes the distance by the same length (a sixtieth of the terrain edge, at least 5 m) instead of the same
  percentage; close to the terrain the step no longer becomes tiny.

### Fixed
- **Coordinate system for XYZ:** the choice worked only the first time. If you change the system (or the EPSG code) after loading, the application re-reads the XYZ files
  and the terrain moves to the new location.

### Removed
- **Select area** on the start map (dragging a rectangle with size and UTM display) is gone. The map keeps pin and address; for very large raster files
  the 1000 m window around the pin still applies.

## 2026-11-19

### Legal and privacy
- Licence unified as **GPL version 3 or later** (program header, legal notice, README, contribution guide); the
  program header carries the SPDX identifier `GPL-3.0-or-later`.

### Added
- **Choosing another place:** If you choose a place in the address bar before the map is loaded, the box names it (“Load map at the place”) and one click takes you there.
  If a terrain is already loaded (for example the demo) and the place lies outside it, the map opens there again; “Back to the terrain” or Esc returns.
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
