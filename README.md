# Map (`@webwriter/map@3.0.1`)
[License: MIT](LICENSE) | Version: 3.0.1

Explore geographic maps with terrain options, custom tiles, and GeoJSON support.

## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| Example Location | `@webwriter/map/snippets/Example-Location.html` |



## `WebwriterMap` (`<webwriter-map>`)
Geographical map with different terrain options including custom tiling, and GeoJSON support.

Keyboard: with `allowpanning` (and always in edit mode) the focused map pans with the arrow keys and zooms with + and -.
Pins are focusable and open their text on Enter. In edit mode a drawn shape is selected with Enter or Space, and its
handles move with the arrow keys. Touch: drag, pinch and tap work as on a mouse.
Layout: the map fills the width of the widget (down to 300 px) and follows its container when it is resized.
Files: GeoJSON (`.geojson`, `application/geo+json`) imports and exports; the export holds the overlay, the pins and the
drawn shapes, and an import of it restores them. The base layer, the view and the bounds are not part of the file.
Print: the toolbox and map controls are hidden, a vector map is printed as a copy of its current view, and the
titles of the pins are listed below the map.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/map/widgets/webwriter-map.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/map/widgets/webwriter-map.js"></script>
<webwriter-map></webwriter-map>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/map
```

```html
<link href="@webwriter/map/widgets/webwriter-map.css" rel="stylesheet">
<script type="module" src="@webwriter/map/widgets/webwriter-map.js"></script>
<webwriter-map></webwriter-map>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterMap.dataType` | `string` | - | `'application/json'` | ✗ |
| `WebwriterMap.shadowRootOptions` | `object` | - | `{ ...LitElement.shadowRootOptions, delegatesFocus: true }` | ✗ |
| `WebwriterMap.options` | `{<br>        initialZoom: { type: "number", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Initial zoom"), min: 0, max: 22, step: 1 },<br>        mapWidth: { type: "number", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Map width (%)"), min: 10, max: 100, step: 1 },<br>        mapHeight: { type: "number", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Map height (px)"), min: 100, max: 1200, step: 10 },<br>        boundsActive: { type: "boolean", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Constrain panning to bounds") },<br>        customTileUrl: { type: "string", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Custom tile URL") },<br>        vectorStyle: { type: "string", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Vector map style URL") },<br>    }` | - | `{ initialZoom: { type: "number", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Initial zoom"), min: 0, max: 22, step: 1 }, mapWidth: { type: "number", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Map width (%)"), min: 10, max: 100, step: 1 }, mapHeight: { type: "number", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Map height (px)"), min: 100, max: 1200, step: 10 }, boundsActive: { type: "boolean", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Constrain panning to bounds") }, customTileUrl: { type: "string", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Custom tile URL") }, vectorStyle: { type: "string", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Vector map style URL") }, }` | ✗ |
| `WebwriterMap.optionGroups` | `{<br>        map: { label: (widget: { msg: MsgFn }) => widget.msg("Map settings"), collapsible: true, advanced: false },<br>    }` | - | `{ map: { label: (widget: { msg: MsgFn }) => widget.msg("Map settings"), collapsible: true, advanced: false }, }` | ✗ |
| `WebwriterMap.permissions` | `{<br>        allowPanning: { label: (widget: { msg: MsgFn }) => widget.msg("Allow student movement") },<br>    }` | - | `{ allowPanning: { label: (widget: { msg: MsgFn }) => widget.msg("Allow student movement") }, }` | ✗ |
| `WebwriterMap.actions` | `{<br>        resetBounds: { label: (widget: { msg: MsgFn }) => widget.msg("Reset map bounds"), group: "map", icon: "Restore", intent: "default" },<br>        addPin: { label: (widget: { msg: MsgFn }) => widget.msg("Add pin at map center"), group: "map", icon: "Add", intent: "default" },<br>        importGeoJSON: {<br>            label: (widget: { msg: MsgFn }) => widget.msg("Import GeoJSON"),<br>            group: "map",<br>            icon: "Upload",<br>            input: { type: "file", accept: ".json,.geojson,application/json,application/geo+json" },<br>        },<br>    }` | - | `{ resetBounds: { label: (widget: { msg: MsgFn }) => widget.msg("Reset map bounds"), group: "map", icon: "Restore", intent: "default" }, addPin: { label: (widget: { msg: MsgFn }) => widget.msg("Add pin at map center"), group: "map", icon: "Add", intent: "default" }, importGeoJSON: { label: (widget: { msg: MsgFn }) => widget.msg("Import GeoJSON"), group: "map", icon: "Upload", input: { type: "file", accept: ".json,.geojson,application/json,application/geo+json" }, }, }` | ✗ |
| `WebwriterMap.convertFrom` | `object` | - | `{ '.geojson': 'importFile', 'application/geo+json': 'importFile' }` | ✗ |
| `WebwriterMap.convertTo` | `object` | - | `{ 'application/geo+json': 'exportGeoJSON' }` | ✗ |
| `msg` | - | - | - | ✗ |
| `initialPos` | `Point` | Initial center position of the map.<br>Expected value: object { lat: number, lng: number } (e.g. { lat: 51, lng: 19 }).<br>Optional; when set via attribute, pass a JSON string (e.g. '{"lat":51,"lng":19}'). | `{ lat: 51, lng: 10 }` | ✗ |
| `mapBounds` | `L.LatLngBoundsExpression \| undefined` | Maximum bounding box for panning the map.<br>Expected value: Leaflet LatLngBoundsExpression (e.g. [[northLat, westLng], [southLat, eastLng]]).<br>Optional; when set via attribute, pass a JSON string (e.g. '[[51,6],[50,7]]'). | - | ✗ |
| `maxZoom` (`maxZoom`) | `number \| undefined` | Maximum zoom level allowed when `boundsActive` is true.<br>Expected value: number (Leaflet zoom level).<br>Optional. | - | ✓ |
| `minZoom` (`minZoom`) | `number \| undefined` | Minimum zoom level allowed.<br>Expected value: number (Leaflet zoom level).<br>Optional. | - | ✓ |
| `initialZoom` (`initialZoom`) | `number` | Initial zoom level when the map is created.<br>Expected value: number (Leaflet zoom level).<br>Optional. | `5` | ✓ |
| `fixedZoom` (`fixedZoom`) | `number` | Fixed zoom level to enforce when panning is not allowed for viewers (non-edit contexts).<br>Expected value: number (Leaflet zoom level).<br>Optional. | `1` | ✗ |
| `markers` | `Pin[]` | Static pin markers to display on the map.<br>Expected value: array of { lat: number, lng: number, title?: string }.<br>Optional; when set via attribute, pass a JSON string. | `[]` | ✗ |
| `objects` | `Record<string, DrawnObject>` | Persisted drawing objects (rectangles, circles, polygons, polylines), keyed by id.<br>Expected value: map id -> { id, type, latlngs, radius?, borderColor, fillColor, borderOpacity, fillOpacity, label? }.<br>Optional; when set via attribute, pass a JSON string. | `{}` | ✗ |
| `customTileUrl` | `string \| undefined` | Custom tile URL template to use for the base map layer.<br>Expected value: string URL template containing {z}/{x}/{y}.<br>Optional; when empty, the default base layer is used. | `''` | ✗ |
| `vectorStyle` (`vectorStyle`) | `string \| undefined` | MapLibre GL style URL for vector tile rendering (e.g. OpenFreeMap).<br>Expected value: URL to a MapLibre style JSON (e.g. 'https://tiles.openfreemap.org/styles/liberty').<br>When set, this takes priority over customTileUrl and the default raster layers. | `undefined` | ✓ |
| `geoJSON` (`geoJSON`) | `string` | GeoJSON overlay to render on the map.<br>Expected value: stringified GeoJSON (Feature or FeatureCollection).<br>Optional; when empty/falsy, no GeoJSON overlay is shown. | `''` | ✓ |
| `mapWidth` (`mapWidth`) | `number` | Map container width, as a percentage of the host element's width.<br>Expected value: number (0–100). Applied as CSS width: `${mapWidth}%`.<br>Optional. | `100` | ✓ |
| `mapHeight` (`mapHeight`) | `number` | Map container height in pixels.<br>Expected value: number (pixels). Applied as CSS height: `${mapHeight}px`.<br>Optional. | `500` | ✓ |
| `boundsActive` (`boundsActive`) | `boolean` | Whether to enforce `mapBounds` and `maxZoom` constraints on the map.<br>Expected value: boolean; when true and `mapBounds` is set, panning is constrained to those bounds.<br>Optional. | `true` | ✓ |
| `allowPanning` (`allowPanning`) | `boolean \| undefined` | - | - | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `importFile` | - | `file: File`
| `importGeoJSON` | GeoJSON import of an action: the first file replaces the overlay, and replaces the pins and drawings too when the file holds them (nothing is merged). | `files: File[]`
| `exportGeoJSON` | Exports the overlay, the pins and the drawn shapes as one GeoJSON FeatureCollection.<br>Pins and shapes are tagged with a `kind` property, so that an import of the file restores them.<br>A circle is a point with a `radius` in meters; styles are kept as properties. Base layer, view and bounds are not part of it. | -
| `addPin` | Opens the pin dialog for a pin at the center of the map. | -
| `resetBounds` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| map | The map frame. |
| pins | The list of pin titles that is shown on paper. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


---
*Generated with @webwriter/build@1.15.0*
