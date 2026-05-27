# Map (`@webwriter/map@2.1.2`)
[License: MIT](LICENSE) | Version: 2.1.2

Geographical map with different terrain options including custom tiling, and GeoJSON support.

## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| Example Location | `@webwriter/map/snippets/Example-Location.html` |



## `WwMap` (`<webwriter-map>`)
Geographical map with different terrain options including custom tiling, and GeoJSON support.

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
| `initialPos` (`initialPos`) | `{ lat: number; lng: number; }` | Initial center position of the map.<br>Expected value: object { lat: number, lng: number } (e.g. { lat: 51, lng: 19 }).<br>Optional; when set via attribute, pass a JSON string (e.g. '{"lat":51,"lng":19}'). | `{ lat: 51, lng: 19, }` | ✓ |
| `mapBounds` (`mapBounds`) | `L.LatLngBoundsExpression` | Maximum bounding box for panning the map.<br>Expected value: Leaflet LatLngBoundsExpression (e.g. [[northLat, westLng], [southLat, eastLng]]).<br>Optional; when set via attribute, pass a JSON string (e.g. '[[51,6],[50,7]]'). | - | ✓ |
| `maxZoom` (`maxZoom`) | `number` | Maximum zoom level allowed when `boundsActive` is true.<br>Expected value: number (Leaflet zoom level).<br>Optional. | - | ✓ |
| `minZoom` (`minZoom`) | `number` | Minimum zoom level allowed.<br>Expected value: number (Leaflet zoom level).<br>Optional. | - | ✓ |
| `initialZoom` (`initialZoom`) | `number` | Initial zoom level when the map is created.<br>Expected value: number (Leaflet zoom level).<br>Optional. | `13` | ✓ |
| `fixedZoom` (`fixedZoom`) | `number` | Fixed zoom level to enforce when panning is not allowed for viewers (non-edit contexts).<br>Expected value: number (Leaflet zoom level).<br>Optional. | `1` | ✗ |
| `markers` (`markers`) | `array` | Static pin markers to display on the map.<br>Expected value: array of { lat: number, lng: number, title?: string }.<br>Optional; when set via attribute, pass a JSON string. | `[]` | ✓ |
| `objects` (`objects`) | `object` | Persisted drawing objects (rectangles, circles, polygons, polylines), keyed by id.<br>Expected value: map id -> { id, type, latlngs, radius?, borderColor, fillColor, borderOpacity, fillOpacity, label? }.<br>Optional; when set via attribute, pass a JSON string. | `{}` | ✓ |
| `customTileUrl` (`customTileUrl`) | `string` | Custom tile URL template to use for the base map layer.<br>Expected value: string URL template containing {z}/{x}/{y}.<br>Optional; when empty, the default base layer is used. | `''` | ✓ |
| `geoJSON` (`geoJSON`) | `string` | GeoJSON overlay to render on the map.<br>Expected value: stringified GeoJSON (Feature or FeatureCollection).<br>Optional; when empty/falsy, no GeoJSON overlay is shown. | `''` | ✓ |
| `mapWidth` (`mapWidth`) | `number` | Map container width, as a percentage of the host element's width.<br>Expected value: number (0–100). Applied as CSS width: `${mapWidth}%`.<br>Optional. | `100` | ✓ |
| `mapHeight` (`mapHeight`) | `number` | Map container height in pixels.<br>Expected value: number (pixels). Applied as CSS height: `${mapHeight}px`.<br>Optional. | `500` | ✓ |
| `boundsActive` (`boundsActive`) | `boolean` | Whether to enforce `mapBounds` and `maxZoom` constraints on the map.<br>Expected value: boolean; when true and `mapBounds` is set, panning is constrained to those bounds.<br>Optional. | `true` | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public methods, slots, events, custom CSS properties, or CSS parts.*


---
*Generated with @webwriter/build@1.9.0*