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
8. [IFC export](#8-ifc-export)
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

1. **Find the data.** Type an address or place in the address bar at the top left (“Where is your
   construction site?”) and pick a suggestion. Below it you get the links to the terrain model
   (DGM) and building model (LoD2) pages of your German state; for Austria, the pages of the federal
   government and the state. The application downloads nothing here: you open the pages and
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
3. **Load buildings (optional).** Also in the **Data** window, row “Buildings · CityGML”.
   Buildings outside the terrain are discarded.

### Which files work?

| Kind | Format | Note |
|---|---|---|
| Terrain | **GeoTIFF** (`.tif`, `.tiff`) | the coordinate system is in the file |
| Terrain | **XYZ text** (`.xyz`, `.txt`, `.csv`) | easting, northing, height on a regular grid. The file has no coordinate system: choose it beforehand in the **Data** window under “Coordinate system for XYZ files” or type an EPSG code |
| Buildings | **CityGML** (`.gml`, `.xml`) | LoD2, the axis order is detected |

ESRI ASCII grids (`.asc`) and decimal commas in XYZ files are not read. Convert them to GeoTIFF
first, for example with GDAL.

**Size.** The tool reads each file completely into memory. Before reading it therefore rejects:
files over 1 GB, tiles over 100 million pixels, and more than 150 million pixels (or 2 GB) in
total; for XYZ more than 30 million points. The message names the file and the number. In that case
cut out an area first, for example with
`gdal_translate -projwin <left> <top> <right> <bottom> -of GTiff input.tif cutout.tif`.
This mainly concerns Austria, where the BEV rasters are very large.

---

## 2. The interface

| Area | Where | What |
|---|---|---|
| **Address bar** | top left | search a place, links to the geodata |
| **Overview** | left | terrain, height range, object count, list of blocks with quantities |
| **Data** | left | terrain, buildings, coordinate system for XYZ, map |
| **Properties** | right | sizes and values of the selected block |
| **Building blocks** | bottom | container, tower crane, mobile crane, haul road, excavation, IFC export |
| **DE / EN, 2D, Appearance, Help** | bottom right | language, top view, looks, short help |
| **Compass** | bottom | north direction, a click aligns north |
| **Info bar** | bottom left | coordinate system (CRS), DTM grid, unit |

**Appearance** sets dark or light, font, font size, accent colour and panel width (220 to 400 px).
**Help** opens a short overview with a link to this guide.

---

## 3. Controlling the view

- **Drag with the left mouse button:** orbit. If you click and drag on terrain, a building or a
  block, it rotates around exactly that point. If you click the background, the whole scene
  orbits around the centre.
- **Drag with the right or middle button:** pan.
- **Mouse wheel:** zoom.
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
  **Esc** cancels.

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
- **Clear** (bottom) removes all blocks.

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
  point on the terrain.
- **Embankment** 1:1, 1:1.5 or 1:2. If the carriageway is above or below the terrain, an
  embankment joins it down or up to the terrain (search limit 80 m).
- **Show edges** shows the carriageway edges.
- **Check swept path (semi-trailer):** see section 6.

Length, area and the tightest radius are shown in the properties window.

### Excavation

A polygon with up to 32 corners. The terrain gets a hole you can look into.

- **Depth below the mean ground** (default −5 m) and **bottom level** (m above sea level) are two
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
  the required width and “It fits” or “Does not fit” with the overhang. The basis is sheet 736.107.2
  of Kanton Luzern (2006), not the German RBSV; the values were matched to the curves of that sheet
  (90 % of the points within 7 cm).
- **Crane radii:** if they overlap, a warning appears in the overview.

The calculations are planning aids. They do not replace a design calculation or coordination with
the parties involved.

---

## 7. Map (OpenStreetMap)

In the **Data** window the switch **Map · OpenStreetMap** puts a map as colour on the terrain. It
is **off by default**. When you turn it on, your browser loads map tiles from
`tile.openstreetmap.org`; your IP address and the approximate location of the terrain are
transmitted (see [privacy](datenschutz.html)). At the bottom left the attribution
“© OpenStreetMap contributors” appears.

- The map needs a coordinate system the application can convert to latitude and longitude: UTM
  (ETRS89 and WGS 84), Gauss-Krüger (DHDN) and Gauss-Krüger Austria (MGI, EPSG:31254 to 31256).
  For other systems, for example EPSG:3035 of the BEV, the map switches itself off with a message.
- For Bessel systems (DHDN, MGI) the map is accurate to about 1 to 2 m.
- After a new terrain the map reloads on its own.

---

## 8. IFC export

The **IFC export** card (at the bottom, among the blocks) writes **terrain and buildings** to an
IFC file, georeferenced in the coordinate system of the loaded terrain. Blocks such as cranes and
containers are not included.

1. Click **IFC export**. The view switches to the top view.
2. **Drag a rectangle** on the terrain. Zooming is possible meanwhile.
3. The **IFC export** window shows the extent and the coordinate reference. Under **Coordinates**
   you choose how the position gets into the file: **absolute in the CRS** (default: easting,
   northing and height above sea level are written directly into the model, visible in any
   program) or **local** (small numbers from the north-west corner, the position is in the
   georeference `IfcMapConversion`). The file also names the coordinate system (EPSG code, datum,
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
- **Data.** The quality of the quantities depends on the terrain model. Coarse grids smooth
  embankments.
- **No saving.** There is no save. The IFC model contains only terrain and buildings.
- **Privacy.** All data stays in the browser. Two functions connect to the outside, both only on
  your input: the **address bar** (suggestions from `photon.komoot.io`) and the **map** (tiles from
  `tile.openstreetmap.org`). Details in the [privacy statement](datenschutz.html) (German).
- **Data licences.** Geodata mostly requires attribution. The exact wording is in the metadata of
  the respective state.

---

## 11. If something does not work

| Problem | Solution |
|---|---|
| Building blocks are grey | Load a terrain model first |
| “too large for the browser” | Cut out an area (section 1, “Size”) |
| XYZ file does not load | Choose the coordinate system under “Coordinate system for XYZ files” or type an EPSG code |
| Warning “outside Europe” | The EPSG code does not match the coordinates: choose the right code |
| Buildings are missing | They lie outside the terrain, or the coordinate system of the CityGML file differs |
| Map does not load | Offline or blocked; or the coordinate system is not supported |
| No suggestions in the address bar | Type at least three characters; the search service may not be reachable |
| A structure (for example a bridge) is not found | It is missing or named differently in OpenStreetMap: search the place name or street, or type the coordinates |
| Road curve tighter than wanted | The radius slider is coloured: set the points further apart or reduce the radius |
| Excavation: “too narrow” | Widen the pit, make it shallower or set a steeper angle |

Please report errors and wishes as an issue on GitHub:
[github.com/Mucnese/quick-site-design](https://github.com/Mucnese/quick-site-design).
