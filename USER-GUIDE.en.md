# Quick-Site-Design: User guide

Quick-Site-Design plans a construction site in the browser: load terrain and buildings, place
containers, cranes, haul roads and excavations, read off quantities, check roads against the
swept path of a semi-trailer truck, and export the result as an IFC file. Everything runs in the
browser, there is no login and no save: when you close the page, the plan is gone.

[Deutsche Fassung](BENUTZERANLEITUNG.md) · [Project home](README.en.md)

**Contents**

1. [Getting started](#1-getting-started)
2. [The interface](#2-the-interface)
3. [Controlling the view](#3-controlling-the-view)
4. [Placing and editing building blocks](#4-placing-and-editing-building-blocks)
5. [The building blocks in detail](#5-the-building-blocks-in-detail)
6. [Quantities and checks](#6-quantities-and-checks)
7. [Map (OpenStreetMap)](#7-map-openstreetmap)
8. [IFC import and export](#8-ifc-import-and-export)
9. [Keyboard](#9-keyboard)
10. [Limits and notes](#10-limits-and-notes)
11. [If something does not work](#11-if-something-does-not-work)

---

## 1. Getting started

### Try it quickly

Append `?demo=1` to the address of the page. The application then loads a sample area (terrain
and buildings) and you can place blocks right away.

### Load your own data

The application needs at least a **terrain model**. Without terrain the building blocks stay
locked.

1. **Find the data.** At the start the page shows a **map**. After you click **Load map** (only then are
   tiles loaded from OpenStreetMap and your IP address transmitted) you can pan it (drag with any mouse button,
   including the pressed middle button) and zoom it smoothly (mouse wheel, **+**/**−**). A click sets a **pin**; next to it a **window with the links to the state's
   geoportals** opens (terrain and building model) and, if the city is in the table, the **city geoportals** (map, open data, sometimes a 3D city model), with the place and UTM values (close with **×** or **Esc**). For **Austria** the window also gives (collapsed under “For advanced users”) a ready-made **`gdal_translate` command** that cuts the
   area around the pin (1000 × 1000 m) out of a very large raster file (for example BEV 1 m, over 1 GB);
   **Copy** puts it on the clipboard. The links then appear
   only there; below the address bar they appear when you type something there. The map
   disappears as soon as a terrain is loaded. If you chose a place in the address bar before the map is loaded, the box names it and **Load map at the place** takes you straight there. **If a terrain is already loaded** (for example the demo) and you choose a place **outside** it, the map opens there again; **Back to the terrain** (or **Esc**) returns you to the 3D view, the terrain stays. Alternatively: type an address or place in the address bar at the top left (“Where is your
   construction site?”) and pick a suggestion. Below it you get the links to the terrain model
   (DGM) and building model (LoD2) pages of your German state; for Austria, the pages of the federal
   government and the state, **for all other EU countries** the pages of the national mapping agency (where an open
   terrain model is known; otherwise a note says so). **In capitals and large cities of the EU** (for example Vienna, Berlin, Munich, Paris, Prague, Madrid) a group **City geoportals** with the city's map and open-data pages is added. The search finds places in the whole EU. The application downloads nothing here: you open the pages and
   download the files yourself. The same table is in the [README](README.en.md#where-to-get-the-data).
   - **Nothing suitable found?** Structures such as valley bridges are often named differently or
     missing in OpenStreetMap. If the search finds nothing that fits your input, the bar asks again with
     the name stem (“Ohetalbrücke” becomes “Ohetal”) and writes “Nothing found for …. Similar:”
     above the list.
   - **Coordinates instead of an address.** You can also type coordinates: latitude and longitude
     (`48.1366, 11.5771`, also with ° and N/E, with a semicolon and a decimal comma),
     UTM with zone (`32 692000 5336000` or `EPSG:25832 692000 5336000`) or Gauss-Krüger
     (`3500000 5400000`). Two large numbers without further information are taken in the coordinate
     system of the loaded terrain. The bar shows the recognised point as the only suggestion; only
     when you choose it does it ask Photon for the place and state and then show the links.
2. **Load the terrain.** In the **Data** window click “Choose files” and select the terrain file.
   Several tiles can be selected together and are merged.
3. **Load buildings (optional).** Also in the **Data** window, row “Buildings · CityGML / CityJSON / 2D”.
   Buildings outside the terrain are discarded. **2D files** (GeoPackage, shapefile, GeoJSON) carry footprints only: after loading, selection fields appear.
   For **ground height** choose “from the terrain model”, an **attribute** (for example `HOEHE_BODEN_MIN`) or a fixed value. For **building height** choose the attribute
   (for example `HOEHE_OBJEKT_MAX`) or a fixed value; also say whether the value is the **height above ground** or the **absolute height**, and optionally multiply with a
   **factor** (3 for a number of storeys). A building without a height gets the **substitute height**. Every change rebuilds the buildings immediately.

### Which files work?

| Kind | Format | Note |
|---|---|---|
| Terrain | **GeoTIFF** (`.tif`, `.tiff`) | the coordinate system is in the file |
| Terrain | **XYZ text** (`.xyz`, `.txt`, `.csv`) | easting, northing, height on a regular grid. The file has no coordinate system: choose it beforehand in the **Data** window under “Coordinate system for XYZ files” or type an EPSG code. If you change the choice later, the application re-reads the file with the new system and the terrain moves there |
| Terrain | **Point cloud** (`.las`, `.laz`) | LAS 1.0 to 1.4, LAZ (compressed). The ground points (class 2, plus water; without class 2, class 8, the model key points, as in the North Rhine-Westphalian data) are averaged into a height grid (cell size from the point density: 0.5 to 10 m), small gaps are filled; vegetation, buildings and noise are dropped. Without classification the lowest point per cell is used. The coordinate system is usually in the file; if not, you choose it as for XYZ. Files over 3 km extent need a pin (only the area is gridded), limit 300 MB per file |
| Buildings | **CityGML** (`.gml`, `.xml`) | LoD2, the axis order is detected |
| Buildings (2D) | **GeoPackage** (`.gpkg`) | area layer with height attributes; also over 2 GB (for example the BEV model “DLM Bauwerke”): only the area around the terrain is read. With several area tables you choose the table. The coordinate system is in the file |
| Buildings (2D) | **Shapefile** (`.shp` together with `.dbf`, `.prj`, `.cpg`) | choose all files at once; without `.prj` the coordinate system of the terrain is assumed, otherwise you choose it yourself |
| Buildings (2D) | **INSPIRE GML** (`.xml`, `.gml`, buildings 2D) | for example the “INSPIRE buildings” export of the Czech ČÚZK (RÚIAN): footprints in latitude/longitude (EPSG:4258), number of floors and height only where populated (mostly not in this file: then choose a fixed height). It is recognised and not read as CityGML |
| Buildings (2D) | **GeoJSON** (`.geojson`, `.json`) | WGS84 (longitude/latitude) unless stated, otherwise the `crs` member |
| Buildings | **CityJSON** (`.json`, `.city.json`, `.jsonl`) | also CityJSONSeq and feature lists (3DBAG); the highest level of detail per part, footprints and terrain are dropped. If the file names another coordinate system than the terrain, it is converted (3DBAG: Rijksdriehoek, matching the AHN) |

ESRI ASCII grids (`.asc`) and decimal commas in XYZ files are not read. Convert them to GeoTIFF
first, for example with GDAL.

**Choosing the coordinate system (CRS).** At the top of the **Data** window it says “as the terrain”. If you choose another system or type an EPSG code, **terrain and buildings are converted to it**, for example from UTM to Gauss-Krüger, so that a structure in Gauss-Krüger fits. This works before or after loading.

- **Accuracy:** The note below states it, in red if the conversion is inexact. Between ETRS89/UTM and German Gauss-Krüger (DHDN) about **1 m** with the included BeTA2007 grid (about 3 m without it: outside Germany or if the file cannot be loaded), for Austrian Gauss-Krüger (MGI) about 2 m. Between systems with the same datum practically no error. **Heights are never converted.**
- Because the systems can be rotated against each other, the terrain grid is computed anew; a narrow strip at the edges is lost.
- Buildings are taken in the system their file names, otherwise in that of the terrain data.
- Old Gauss-Krüger codes (31462 to 31465, also 5676 to 5679) count as 31466 to 31469.
- Changing it after placing removes the **building blocks** (after a question). So best choose the system beforehand.

**Very large GeoTIFF (for example BEV, 7.9 GB).** Files over 300 MB are **not read completely, only the area around the chosen place**.
First set a pin on the start map or choose an address, then choose the file under “Data”. With the BEV raster this takes
about half a second; the data window says “extract”. Without a chosen place, with a place outside the file or an area over
100 million pixels a message appears.

**Size.** Smaller files are read completely into memory. Before reading the tool therefore rejects:
files over 1 GB (for GeoTIFF over 300 MB the extract applies, see above), tiles over 100 million pixels, and more than 150 million pixels (or 2 GB) in
total; for XYZ more than 30 million points; for LAS/LAZ more than 300 MB per file; for CityGML more than 300 MB in total; for IFC more than 300 MB per file. The message names the file and the number. If you prefer
to cut out an area yourself first, you can use
`gdal_translate -projwin <left> <top> <right> <bottom> -of GTiff input.tif cutout.tif`.

---

## 2. The interface

| Area | Where | What |
|---|---|---|
| **Address bar** | top left | search a place, links to the geodata |
| **Overview** | left | terrain, height range, object count, list of blocks with quantities |
| **Data** | left | coordinate system (CRS), terrain, buildings, structure (IFC) |
| **Map** | bottom left | button for the OpenStreetMap map |
| **Properties** | right | sizes and values of the selected block |
| **Building blocks** | bottom | container, tower crane, mobile crane, haul road, excavation, IFC export, measure |
| **DE / EN, 2D, Appearance, Help** | bottom right | language, top view, looks, short help |
| **Compass** | bottom | north direction, a click aligns north |
| **Info bar** | bottom left | coordinate system (CRS), DTM grid, unit |

**Appearance** sets font, font size, accent colour and panel width (220 to 400 px).
**Help** opens a short overview with a link to this guide.

---

## 3. Controlling the view

- **Drag with the left mouse button:** orbit. If you click and drag on terrain, a building or a
  block, it rotates around exactly that point. If you click the background, the whole scene
  orbits around the centre.
- **From below:** Without a structure, tilting ends at the horizontal. With an IFC structure loaded, you can also turn the view **underneath** it (underside, foundations). When looking from below, only the structure is brightened slightly.
- **Drag with the right or middle button:** pan (brisk: about twice as fast as the pointer, measured at the point it is on when you press).
- **Mouse wheel:** zoom in even steps (one step is a sixtieth of the terrain edge, at least 5 m), no matter how close the camera is. You can go up to 3 m before what is in the middle of the picture.
- **Left click** on terrain or a building: sets a **measuring point**. It shows easting, northing
  and height and becomes the centre for rotating and zooming.
- **2D:** straight from above. Dragging tilts the view freely again.
- **Compass:** shows north, a click aligns the view to it.
- **Reset** (Overview window): fits the view to the terrain again.

The terrain resolution follows the zoom: full data resolution near the camera, coarser far away.
There is no slider for it; the heights used for objects and quantities do not depend on it.

---

## 4. Placing and editing building blocks

### Placing

- **Container, tower crane, mobile crane:** choose the block at the bottom and click into the
  terrain. The block sits at ground height.
- **Haul road and excavation:** click point after point into the terrain, then **right-click** or
  press **space** to finish. A road needs at least 2 points, an excavation 3 (at most 32 corners).
  **Esc** cancels. While drawing, every segment shows its **horizontal length** in metres with two
  decimals, including the segment to the mouse.

After placing, the **Properties** window opens on the right. Every slider has a number field in
its header: click the value and type, Enter or leaving the field applies it, a value outside the
range is set to the limit.

### Editing

- **Clicking** selects an object. On the right you find **Move**, **Duplicate** and **Delete**.
  **Move**: press the button and click the new position.
- **Road and excavation:** when selected, the **nodes** appear as white dots. Click a node, then the
  new position. **Add node** inserts a new point into the nearest segment, **Delete node**
  removes the selected one.
- **Several objects:** an entry in the **Overview** selects the whole group (for example all mobile
  cranes). There the group can be deselected or deleted.
- **Esc** clears the selection. **Delete** or **Backspace** deletes the selected objects.
- **Clear** (bottom) removes all blocks, after a confirmation.
- **Remove** is at the top right of terrain, buildings and structure in the **Data** window. For buildings and structure only that data set disappears. Everything depends on the terrain: after a question, removing it removes everything, like Reset.
- **Reset** (bottom, below “Clear”) resets everything: terrain, buildings, structure (IFC) and all blocks are removed, the page restarts, nothing is loaded. This also asks first (Cancel is preselected, **Esc** cancels).

---

## 5. The building blocks in detail

### Container

A container setup with up to 25 containers side by side, 2 rows and 5 storeys. With two rows
an aisle of one container width remains between them, filled by a plain connecting structure.
You can set the number, rows, storeys, rotation and the size of each container.

### Tower crane

A **generic** model: radius, hook height, tower width and the rotation of jib and foundation can
be set freely within the range of real tower cranes. It is not a manufacturer model. The switch
“Show working radius” shows the circle in which the hook works.

### Mobile crane

24 Liebherr mobile cranes from 35 t to 750 t. The values come from the manufacturer’s data
sheets, the number of axles from the model designation. The link “Data sheet at the manufacturer”
leads to the source. Outrigger dimensions and carrier lengths serve presentation only.

**Important:** the values are guide values. For planning a lift only the **load chart** of the
respective crane counts. If the working radii of two cranes overlap, the overview shows a warning
with the overlap in metres.

### Haul road

A polyline with **filleted corners**.

- **Road width** 3 to 14 m, **minimum radius** of the curves 5 to 60 m. If a radius does not fit
  between two nodes it is reduced there and the slider turns coloured. Then set the points further
  apart or reduce the radius.
- **Longitudinal slope** in percent (±30 %). It is preset to the slope that connects start and end
  point on the terrain. If each section has its own slope (see axis line), the field shows
  **“variable”**; moving the slider then gives all sections the same slope again.
- **Embankment** 1:1, 1:1.5 or 1:2. If the carriageway is above or below the terrain, an
  embankment joins it down or up to the terrain (search limit 80 m).
- **Show edges** shows the carriageway edges.
- **Check swept path (semi-trailer):** see section 6.

Length, area and the tightest radius are shown in the properties window.

**Axis line.** A finished road shows its **centre line** (yellow, dashed, with cross marks at the points
you set). Every stretch between two points is a **section**. **Above** the line is the section's
**longitudinal slope** in percent, **below** it its **length** in metres along the axis. Both fields can be
clicked and overwritten (type a number, **Enter**; **Esc** discards):

- The **slope** applies to this section only, so a road with a ramp and a flat stretch can be planned.
  The properties window then shows “variable”.
- The **length** moves the end point of the section along its direction; all following points move
  with it and keep their position relative to each other. Rounded corners count.
- A new point splits its section (both halves keep the slope), a deleted point joins two sections.
  While drawing and measuring the fields are hidden. When zooming out, all fields of a road disappear
  at the same time as soon as its shortest section becomes too short on screen.
- The axis line is only a display and is not written to the IFC file.

### Excavation

A polygon with up to 32 corners. The terrain gets a hole you can look into.

- **Depth below the mean ground** (default −5 m, down to −100 m) and **bottom level** (m above sea level) are two
  sliders for the same value: moving one moves the other.
- **Slope angle** (20° to 90°, 90° = vertical). The drawn polygon stays the **top edge**, only the
  **floor** gets smaller. If the pit is too narrow for the angle, the slider jumps to the smallest
  possible angle (minimum angle) and a red note names it.
- If the floor lies partly above the ground, **fill** arises next to the excavation.

Note: objects standing in a pit sit at the height of the original ground.

---

## 6. Quantities and checks

- **Haul road:** fill and cut in m³ (average end area method), in the properties window and in the
  overview.
- **Excavation:** excavation and fill in m³, plus bottom level and floor area.
- **Overview:** under “Haul road” you see cut and fill, under “Excavation” excavation and fill,
  each as the sum over the group.
- **Swept path of a semi-trailer:** the switch in the haul road properties (off by default) drives a
  semi-trailer truck of 16.50 m length and 2.55 m width along the road centre. The swept area lies on
  the road as a blue area with an outline, **red** where it leaves the carriageway. The window shows
  the required width and “It fits” or “Does not fit” with the overhang. The basis are the dimensions
  and turning radii of the 16.5 m semi-trailer from **Autodesk Vehicle Tracking** (design speed 5 km/h):
  the model matches its radii (outer body 12.5 m, inner wheel 5.28 m, at full lock 7.9 m) to within a few
  centimetres. Limitations: steering angle and articulation angle are not limited, and when turning in, the
  rear swings out a little further in the template (0.42 m instead of 0.30 m at R = 10 m). Where it is tight,
  check with Vehicle Tracking.
- **Crane radii:** if they overlap, a warning appears in the overview.
- **Measure:** the **Measure** card (bottom, far right) measures distances on terrain and buildings.
  Click points one after another; every segment shows its **horizontal length** and the **height
  difference** (**Δ**) in metres with two decimals. The window below gives the totals horizontally and
  in space, the height difference and the **slope** between start and end in percent, and the heights of
  start and end. **Right-click**, **space** or **Enter** finishes the measurement, another click starts
  a new one, **Backspace** removes the last point, **Esc** ends the tool. The accuracy depends on the
  terrain model (see the info bar for the grid size), and for buildings on the roof shape of the model.

The calculations are planning aids. They do not replace a design calculation or coordination with
the parties involved.

---

## 7. Map (OpenStreetMap)

The **Map** button at the bottom left opens a small window with the switch **Map · OpenStreetMap**. It puts a map as colour on the terrain. It
is **off by default**. When you turn it on, your browser loads map tiles from
`tile.openstreetmap.org`; your IP address and the approximate location of the terrain are
transmitted (see [privacy](datenschutz.html)). At the bottom left the attribution
“© OpenStreetMap contributors” appears.

- The map needs a coordinate system the application can convert to latitude and longitude: UTM
  (ETRS89 and WGS 84), Gauss-Krüger (DHDN), Gauss-Krüger Austria (MGI, EPSG:31254 to 31256), the European
  ETRS89-LAEA (EPSG:3035, BEV) and the national systems of many EU countries (list in the [README](README.en.md#where-to-get-the-data)).
  For other systems, for example Hungary (EOV), the map switches itself off with a message.
- For Bessel systems the map is accurate to about: DHDN 1 m (BeTA2007 grid), MGI 2 m.
- Depending on the terrain size the map loads up to 144 tiles at once. The smaller the terrain, the finer the zoom level and the smaller the labels look.
- After a new terrain the map reloads on its own.

---

## 8. IFC import and export

### Importing a structure as IFC

In the **Data** window, the **Structure · IFC** row loads a structure (new building, building,
bridge) from an IFC file. Terrain must be loaded first. The reading library is loaded only now; the
file stays in the browser and is not transmitted. Size up to 300 MB (together).

**Several files:** If a structure comes in parts (superstructure, substructure, temporary works), choose **all of them at once**. They are combined into one structure, each in its place; placing, moving, rotating and removing act on all of it.
Files without a georeference are taken to be in the system of the others. Files in another coordinate system, far away (over 20 km) or unreadable are left out and named. If a structure is already loaded, **a new selection is added**; what is there stays exactly in place, also after aligning by hand. A file that is already loaded is skipped. For another structure, **Remove** first.

**Clicking an element:** A click on the structure highlights the element and opens the **Element** window on the right. From top to bottom:

- **Filter:** choose an attribute (sorted A to Z), **is** or **contains**, type a value (with suggestions) and **Filter** (or Enter). Clicking a **row** further down sets the filter and applies it at once. **Reset filter** shows again what the filter hid and refills the fields; hidden things stay hidden.
- **Isolate** or **Hide**, each the **element** or the whole **file**. Hidden things add up; they cannot be clicked, you click through them.
- **Quantities of the elements shown** (after filtering or isolating): count, **volume** and **surface area**, computed from the geometry (approximate; only closed solids have a volume, the number of the others is stated), plus **sums from the IFC** with the number of elements that have them (units as in the file).
- All data of the element: IFC class, name, object type, type, material, container, file, properties and quantities.

**Show all** (in the **Element** window and in the **Structure · IFC** row) shows everything again. **Close** keeps the state; **Esc** first shows all and closes the window the second time.

- **Automatic:** If the file is georeferenced (`IfcMapConversion`) and uses the **same coordinate
  system (EPSG)** as the terrain, the structure appears at the right place, rotated and at the right
  height. Scale and length unit of the file are taken into account.
  This also works without a georeference if the file itself holds national coordinates that lie within the terrain (common with Gauss-Krüger).
  If the structure is in another system than the terrain, a **red warning** appears, also after aligning by hand. It names the EPSG code you can choose above as **coordinate system (CRS)**; the structure then places itself.
- **Align 4 points (2 + 2):** If the georeference is missing or the coordinate system differs, the
  message names the reason and starts the procedure: click alternately **point A on the structure**, then the
  **matching point A on the terrain**, then point B the same way. The point pairs give position and rotation. The structure
  always stays **level**; its height follows the terrain at the first point. If the two distances do
  not match, a warning appears. **Esc** cancels. **Align 4 points** repeats the procedure later.
- **Move & rotate:** Three arrows appear at the centre of the structure: **X** (red, east), **Y** (green, north), **Z** (blue, height), plus a yellow ring.
  Dragging an arrow moves the structure only in that direction; dragging the ring rotates it about the vertical axis (Z) through its centre. You can rotate and zoom the view as usual. If you look almost
  along an axis (for example Z in the top view), that arrow cannot be dragged; the ring cannot be dragged if you look almost horizontally. **Esc** or a second click on the button ends the mode.
  The button also works in the middle of the four-point procedure: a new structure then stays where you see it.
- The fields **X** (east), **Y** (north), **Z** (height) hold the shift in metres, **Rot Z** the rotation in degrees (positive anticlockwise, seen from above); you can also type them. Aligning with 4 points again sets the fields to 0. **Remove** (right of the heading) takes the structure away.
- If the structure lies outside the terrain, a note appears. When other terrain is loaded, an
  automatically placed structure is placed again, a manually placed one is removed.
- Not supported: length units such as feet and inches (IfcConversionBasedUnit).

### IFC export

The **IFC export** card (at the bottom, among the blocks) writes **terrain and buildings** to an
IFC file, optionally with **roads, excavations, cranes and containers** (checkbox in the window,
on by default; every block is a building element of its own). The parts carry **colours**: blocks as in the application (yellow crane, coloured containers, grey asphalt, brown embankment), terrain green-brown, buildings light grey. Buildings that reach beyond the rectangle are cut off there with a clean straight edge (open cut surface, no cap). The terrain is not cut out: an
excavation lies below the terrain surface.

1. Click **IFC export**. The view switches to the top view.
2. **Drag a rectangle** on the terrain. Zooming is possible meanwhile. The view goes to the top view but **does not turn to north**, and the rectangle follows the screen: if the view is turned, it is turned against north, and the export cuts out exactly this turned area (terrain, buildings, blocks). The coordinates in the file stay in the coordinate system, only the cut-out is turned; “Extent” gives the edge lengths of the rectangle.
3. The **IFC export** window shows the extent and the coordinate reference. Under **Coordinates**
   you choose how the position gets into the file: **absolute in the CRS** (default: easting,
   northing and height above sea level are written directly into the model, visible in any
   program) or **local** (small numbers from the north-west corner, the position is in the
   georeference `IfcMapConversion`). Under **CRS of the file** the position can be converted to
   **another coordinate system** (UTM 31N to 33N, Gauss-Krüger 2 to 5, Gauss-Krüger Austria and the national EU systems, for example
   RD New of the Netherlands, Lambert-93 of France, SWEREF 99 TM of Sweden, PL-1992 of Poland). Every
   point is then converted individually and written as absolute coordinates; heights stay unchanged.
   For the Bessel systems (marked ≈) the position is less accurate: DHDN about 1 m with the BeTA2007 grid,
   MGI about 2 m. The file also names the coordinate system (EPSG code, datum,
   zone) and carries latitude and longitude of the site where the system can be converted.
   **Export** downloads the file, **Cancel** or **Esc** aborts.

---

## 9. Keyboard

| Key | Effect |
|---|---|
| **Esc** | cancel, clear the selection, close windows |
| **Space** | finish a road or excavation (like a right-click) |
| **Delete** / **Backspace** | delete the selected objects (not while typing in a field) |

---

## 10. Limits and notes

- **No structural design.** The application does not replace a structural check, a stability
  check or a load-capacity calculation. For cranes only the manufacturer’s load chart counts.
- **No warranty, no liability.** All results (quantities, distances, crane radii, swept paths,
  coordinates, IFC files) are rough aids and must be checked by a qualified person before any use.
  The operator's liability is excluded to the extent permitted by law (see the
  [legal notice](impressum.html), in German).
- **Data.** The quality of the quantities depends on the terrain model. Coarse grids smooth
  embankments.
- **No saving.** There is no save. The IFC model contains terrain, buildings and, optionally, the blocks.
- **Privacy.** All data stays in the browser. Two functions connect to the outside, both only on
  your input: the **address bar** (suggestions from `photon.komoot.io`) and the **map** (the start map too, only after “Load map”; tiles from
  `tile.openstreetmap.org`). Details in the [privacy statement](datenschutz.html) (German).
- **Data licences.** Geodata mostly requires attribution. The exact wording is in the metadata of
  the respective state.

---

## 11. If something does not work

| Problem | Solution |
|---|---|
| Building blocks are grey | Load a terrain model first |
| “too large for the browser” | Cut out an area (section 1, “Size”) |
| XYZ or LAS file does not load | Choose the coordinate system under “Coordinate system for XYZ files” or type an EPSG code |
| LAS/LAZ: “set a pin” | the cloud is larger than 3 km: set a pin on the start map, then choose the file |
| Warning “outside Europe” | The EPSG code does not match the coordinates: choose the right code |
| Buildings are missing | They lie outside the terrain, or the building file is in another coordinate system and does not name it |
| Map does not load | Offline or blocked; or the coordinate system is not supported |
| No suggestions in the address bar | Type at least three characters; the search service may not be reachable |
| A structure (for example a bridge) is not found | It is missing or named differently in OpenStreetMap: search the place name or street, or type the coordinates |
| Road curve tighter than wanted | The radius slider is coloured: set the points further apart or reduce the radius |
| Excavation: “too narrow” | Widen the pit, make it shallower or set a steeper angle |

Please report errors and wishes as an issue on GitHub:
[github.com/Mucnese/quick-site-design](https://github.com/Mucnese/quick-site-design).
