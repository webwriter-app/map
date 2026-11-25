import { LitElementWw } from '@webwriter/lit';
import { jsonData } from '@webwriter/lit/data';
import { localizer } from '@webwriter/lit/localize';
import { Permissions } from '@webwriter/lit/permissions';
import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import type { MsgFn } from "@lit/localize";
import { sourceLocale, targetLocales } from "../../localization/generated/locale-codes.js";

import { styleMap } from 'lit/directives/style-map.js';

import { style } from '../components/ww-map.styles';
import { leafletStyles } from '../components/leaflet.styles';

import { icons } from '../components/icons';

import maximizeIcon from '@tabler/icons/outline/maximize.svg';
import minimizeIcon from '@tabler/icons/outline/minimize.svg';
import { createMaplibreLayer, createRasterLayer, type BaseLayerHost } from '../components/base-layers';
import { circleHandles, polygonHandles, polylineHandles, rectangleHandles } from '../components/edit-handles';
import { mapToolbox, pinDialog } from '../components/map-panels';
import { freezeVectorLayers, releaseSnapshots, type Snapshot } from '../components/print-snapshot';
import { bindShapeKeys, drawObject, setShapeAccess, storeObject } from '../components/map-objects';
import { exportFeatures, importFeatures, type ImportedMap } from '../model/geojson';
import { copy, defaultMaxZoom, VECTOR_TILES, RASTER_TILES, type DrawLayer, type DrawnObject, type Pin, type Point, type WithId } from '../model/map-data';

import SlButton from '@shoelace-style/shoelace/dist/components/button/button.component.js';
import SlDetails from '@shoelace-style/shoelace/dist/components/details/details.component.js';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component.js';
import SlIcon from '@shoelace-style/shoelace/dist/components/icon/icon.component.js';
import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.component.js';
import SlMenuLabel from '@shoelace-style/shoelace/dist/components/menu-label/menu-label.component.js';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.component.js';
import SlRadioGroup from '@shoelace-style/shoelace/dist/components/radio-group/radio-group.component.js';
import SlRadio from '@shoelace-style/shoelace/dist/components/radio/radio.component.js';

import '@shoelace-style/shoelace/dist/themes/light.css';

import L from 'leaflet';
import '@maplibre/maplibre-gl-leaflet';

/**
 * Geographical map with different terrain options including custom tiling, and GeoJSON support.
 *
 * Keyboard: with `allowpanning` (and always in edit mode) the focused map pans with the arrow keys and zooms with + and -.
 * Pins are focusable and open their text on Enter. In edit mode a drawn shape is selected with Enter or Space, and its
 * handles move with the arrow keys. Touch: drag, pinch and tap work as on a mouse.
 * Layout: the map fills the width of the widget (down to 300 px) and follows its container when it is resized.
 * Files: GeoJSON (`.geojson`, `application/geo+json`) imports and exports; the export holds the overlay, the pins and the
 * drawn shapes, and an import of it restores them. The base layer, the view and the bounds are not part of the file.
 * Print: the toolbox and map controls are hidden, a vector map is printed as a copy of its current view, and the
 * titles of the pins are listed below the map.
 *
 * @part map - The map frame.
 * @part pins - The list of pin titles that is shown on paper.
 */
@customElement('webwriter-map')
export class WebwriterMap extends LitElementWw {
    static dataType = 'application/json';

    static styles = [style, leafletStyles];

    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

    /** @internal */
    static scopedElements = {
        'sl-button': SlButton,
        'sl-icon': SlIcon,
        'sl-input': SlInput,
        'sl-details': SlDetails,
        'sl-switch': SlSwitch,
        'sl-menu-label': SlMenuLabel,
        'sl-dialog': SlDialog,
        'sl-radio-group': SlRadioGroup,
        'sl-radio': SlRadio,
    };

    static options = {
        initialZoom: { type: "number", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Initial zoom"), min: 0, max: 22, step: 1 },
        mapWidth: { type: "number", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Map width (%)"), min: 10, max: 100, step: 1 },
        mapHeight: { type: "number", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Map height (px)"), min: 100, max: 1200, step: 10 },
        boundsActive: { type: "boolean", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Constrain panning to bounds") },
        customTileUrl: { type: "string", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Custom tile URL") },
        vectorStyle: { type: "string", group: "map", label: (widget: { msg: MsgFn }) => widget.msg("Vector map style URL") },
    } as const;

    static optionGroups = {
        map: { label: (widget: { msg: MsgFn }) => widget.msg("Map settings"), collapsible: true, advanced: false },
    } as const;

    static permissions = {
        allowPanning: { label: (widget: { msg: MsgFn }) => widget.msg("Allow student movement") },
    } as const;

    static actions = {
        resetBounds: { label: (widget: { msg: MsgFn }) => widget.msg("Reset map bounds"), group: "map", icon: "Restore", intent: "default" },
        addPin: { label: (widget: { msg: MsgFn }) => widget.msg("Add pin at map center"), group: "map", icon: "Add", intent: "default" },
        importGeoJSON: {
            label: (widget: { msg: MsgFn }) => widget.msg("Import GeoJSON"),
            group: "map",
            icon: "Upload",
            input: { type: "file", accept: ".json,.geojson,application/json,application/geo+json" },
        },
    } as const;

    static convertFrom = { '.geojson': 'importFile', 'application/geo+json': 'importFile' };

    static convertTo = { 'application/geo+json': 'exportGeoJSON' };

    // The drawer labels are computed with `msg`, so the editor has to read them again after a language change.
    protected localize = localizer(this, { sourceLocale, targetLocales, load: (locale) => import(`../../localization/generated/${locale}.ts`), drawer: true });
    readonly msg = this.localize.msg;

    #permissions = new Permissions(this);
    #data = jsonData<{
        initialPos: Point;
        mapBounds?: L.LatLngBoundsExpression;
        markers: Pin[];
        objects: Record<string, DrawnObject>;
        geoJSON: string;
    }>(this, {
        defaults: { initialPos: { lat: 51, lng: 10 }, markers: [], objects: {}, geoJSON: '' },
        validate: ({ markers, objects, geoJSON }) =>
            Array.isArray(markers) && !!objects && typeof objects === 'object' && !Array.isArray(objects) && typeof geoJSON === 'string',
        changed: (data) => {
            this.initialPos = copy(data.initialPos);
            this.mapBounds = copy(data.mapBounds);
            this.markers = copy(data.markers);
            this.objects = copy(data.objects);
            this.geoJSON = data.geoJSON;
        },
    });

    /** Initial center position of the map.<br>Expected value: object { lat: number, lng: number } (e.g. { lat: 51, lng: 19 }).<br>Optional; when set via attribute, pass a JSON string (e.g. '{"lat":51,"lng":19}'). */
    @property({ type: Object, attribute: false, state: true })
    accessor initialPos: Point = { lat: 51, lng: 10 };

    /** Maximum bounding box for panning the map.<br>Expected value: Leaflet LatLngBoundsExpression (e.g. [[northLat, westLng], [southLat, eastLng]]).<br>Optional; when set via attribute, pass a JSON string (e.g. '[[51,6],[50,7]]'). */
    @property({ type: Object, attribute: false, state: true })
    accessor mapBounds: L.LatLngBoundsExpression | undefined;

    /** Maximum zoom level allowed when `boundsActive` is true.<br>Expected value: number (Leaflet zoom level).<br>Optional. */
    @property({ type: Number, attribute: true, reflect: true })
    accessor maxZoom: number | undefined;

    /** Minimum zoom level allowed.<br>Expected value: number (Leaflet zoom level).<br>Optional. */
    @property({ type: Number, attribute: true, reflect: true })
    accessor minZoom: number | undefined;

    /** Initial zoom level when the map is created.<br>Expected value: number (Leaflet zoom level).<br>Optional. */
    @property({ type: Number, attribute: true, reflect: true })
    accessor initialZoom = 5;

    /** Fixed zoom level to enforce when panning is not allowed for viewers (non-edit contexts).<br>Expected value: number (Leaflet zoom level).<br>Optional. */
    @property({ type: Number, attribute: true})
    accessor fixedZoom = 1;

    /** Static pin markers to display on the map.<br>Expected value: array of { lat: number, lng: number, title?: string }.<br>Optional; when set via attribute, pass a JSON string. */
    @property({ type: Array, attribute: false, state: true })
    accessor markers: Pin[] = [];

    /** Persisted drawing objects (rectangles, circles, polygons, polylines), keyed by id.<br>Expected value: map id -> { id, type, latlngs, radius?, borderColor, fillColor, borderOpacity, fillOpacity, label? }.<br>Optional; when set via attribute, pass a JSON string. */
    @property({ type: Object, attribute: false, state: true })
    accessor objects: Record<string, DrawnObject> = {};

    /** Custom tile URL template to use for the base map layer.<br>Expected value: string URL template containing {z}/{x}/{y}.<br>Optional; when empty, the default base layer is used. */
    @property({ type: String, attribute: false, state: true })
    accessor customTileUrl: string | undefined = '';

    /** MapLibre GL style URL for vector tile rendering (e.g. OpenFreeMap).<br>Expected value: URL to a MapLibre style JSON (e.g. 'https://tiles.openfreemap.org/styles/liberty').<br>When set, this takes priority over customTileUrl and the default raster layers. */
    @property({ type: String, attribute: true, reflect: true })
    accessor vectorStyle: string | undefined = undefined;

    /** GeoJSON overlay to render on the map.<br>Expected value: stringified GeoJSON (Feature or FeatureCollection).<br>Optional; when empty/falsy, no GeoJSON overlay is shown. */
    @property({ type: String, attribute: true, reflect: true })
    accessor geoJSON = '';

    /** Map container width, as a percentage of the host element's width.<br>Expected value: number (0–100). Applied as CSS width: `${mapWidth}%`.<br>Optional. */
    @property({ type: Number, attribute: true, reflect: true })
    accessor mapWidth = 100;

    /** Map container height in pixels.<br>Expected value: number (pixels). Applied as CSS height: `${mapHeight}px`.<br>Optional. */
    @property({ type: Number, attribute: true, reflect: true })
    accessor mapHeight = 500;

    /** Whether to enforce `mapBounds` and `maxZoom` constraints on the map.<br>Expected value: boolean; when true and `mapBounds` is set, panning is constrained to those bounds.<br>Optional. */
    @property({ type: Boolean, attribute: true, reflect: true })
    accessor boundsActive = true;

    @query('#map')
    private accessor mapElement!: HTMLElement;

    @query('#pinDialog')
    private accessor pinDialog!: SlDialog;

    @query('#switchStudentPanning')
    private accessor switchStudentPanning!: SlSwitch;

    @property({ type: Object })
    private accessor map!: L.Map;

    @property({ type: Number })
    private accessor inputLat = 0;

    @property({ type: Number })
    private accessor inputLng = 0;

    @property({ type: Number })
    private accessor inputZoom = 0;

    @property({ type: String })
    private accessor pinTitle = '';

    @property({ type: Array })
    private accessor editObjectMarkers: L.Marker[] = [];

    @property({ type: Object })
    private accessor layerControl: L.Control.Layers | undefined;

    @property({ type: Boolean })
    private accessor isFullscreen = false;

    @property({ type: Boolean, reflect: true })
    accessor allowPanning: boolean | undefined;

    private markerLayer: L.LayerGroup | undefined;

    private resizeObserver: ResizeObserver | undefined;

    private lifetime: AbortController | undefined;

    private printSnapshots: Snapshot[] = [];

    private resizing = false;

    private layerHost: BaseLayerHost = {
        getMap: () => this.map,
        useLayerMaxZoom: (maxZoom) => {
            if (!this.maxZoom || !this.boundsActive) this.map?.setMaxZoom(maxZoom);
        },
    };

    protected updated(changedProperties: PropertyValueMap<this>): void {
        super.updated(changedProperties);

        if ((['initialPos', 'mapBounds', 'markers', 'objects', 'geoJSON'] as const).some((key) => changedProperties.has(key))) {
            this.#data.set({
                initialPos: copy(this.initialPos),
                mapBounds: copy(this.mapBounds),
                markers: copy(this.markers),
                objects: copy(this.objects),
                geoJSON: this.geoJSON,
            });
        }

        if (this.map && (changedProperties.has('customTileUrl') || changedProperties.has('vectorStyle'))) {
            this.updateBaseLayer();
        }

        if (this.map && changedProperties.has('geoJSON')) {
            this.map.eachLayer((layer) => {
                if (layer instanceof L.GeoJSON) this.map.removeLayer(layer);
            });
            if (this.geoJSON) {
                L.geoJSON(JSON.parse(this.geoJSON)).addTo(this.map);
            }
            this.renderMarkers();
        }

        if (this.map && changedProperties.has('mapBounds')) {
            this.map.setMaxBounds(this.mapBounds && this.boundsActive ? this.mapBounds : undefined);
        }

        if (this.map && (changedProperties.has('maxZoom') || changedProperties.has('vectorStyle') || changedProperties.has('customTileUrl'))) {
            if (this.maxZoom && this.boundsActive) {
                this.map.setMaxZoom(this.maxZoom);
            } else {
                this.map.setMaxZoom(defaultMaxZoom(this.vectorStyle, this.customTileUrl));
            }
        }

        if (this.map && changedProperties.has('minZoom')) {
            this.map.setMinZoom(this.minZoom || 0);
        }

        if (this.map && changedProperties.has('boundsActive')) {
            if (this.boundsActive) {
                this.map.setMaxBounds(this.mapBounds);
            } else {
                this.map.setMaxBounds(undefined);
            }
        }

        if (this.map && changedProperties.has('editable')) {
            this.removeEditMarkers();
            this.syncObjectAccess();
        }
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<this>): void {
        super.firstUpdated(_changedProperties);

        this.map = L.map(this.mapElement).setView([this.initialPos.lat, this.initialPos.lng], this.initialZoom);
        this.updateBaseLayer();

        if (this.geoJSON) {
            L.geoJSON(JSON.parse(this.geoJSON)).addTo(this.map);
        }

        this.markerLayer = L.layerGroup().addTo(this.map);
        this.renderMarkers();

        this.map.on('moveend', this.setInitialPosition.bind(this));
        this.inputLat = this.initialPos.lat;
        this.inputLng = this.initialPos.lng;
        this.inputZoom = this.initialZoom;

        this.loadObjects()
        
        if(!this.#permissions.can("allowPanning")){
            this.map.touchZoom.disable();
            this.map.doubleClickZoom.disable();
            this.map.scrollWheelZoom.disable();
            this.map.boxZoom.disable();
            this.map.keyboard.disable();
            this.mapElement.style.pointerEvents = "none"
            this.fixedZoom = this.initialZoom
            this.map.setMinZoom(this.fixedZoom);
            this.map.setMaxZoom(this.fixedZoom);
        }else if(this.#permissions.editing){
            this.switchStudentPanning.toggleAttribute("checked", !!this.allowPanning)
        }

        this.resizeObserver = new ResizeObserver(() => {
            this.resizeMap();
            const fullscreen = this.ownerDocument.fullscreenElement === this;
            if (!fullscreen && this.isFullscreen) {
                this.isFullscreen = false;
                this.updateComplete.then(() => this.map?.invalidateSize());
            } else if (fullscreen && !this.isFullscreen) {
                this.isFullscreen = true;
                this.updateComplete.then(() => this.map?.invalidateSize());
            }
        });
        this.resizeObserver.observe(this);
        this.syncObjectAccess();
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.resizeObserver?.observe(this);
        this.lifetime = new AbortController();
        window.addEventListener('beforeprint', () => this.freezeVectorLayers(), { signal: this.lifetime.signal });
        window.addEventListener('afterprint', () => this.releaseVectorLayers(), { signal: this.lifetime.signal });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.resizeObserver?.disconnect();
        this.lifetime?.abort();
        this.releaseVectorLayers();
    }

    /** Keeps the map filling its box when the widget is resized. The view keeps its center and is not stored as a new start position. */
    private resizeMap() {
        if (!this.map) return;
        this.resizing = true;
        try {
            this.map.invalidateSize({ animate: false });
        } finally {
            this.resizing = false;
        }
    }

    private freezeVectorLayers() {
        this.releaseVectorLayers();
        if (this.map) this.printSnapshots = freezeVectorLayers(this.map);
    }

    private releaseVectorLayers() {
        releaseSnapshots(this.printSnapshots);
        this.printSnapshots = [];
    }

    /** Reads and checks a whole GeoJSON file. Nothing changes before the returned function runs. */
    private async prepareImport(file: File): Promise<ImportedMap> {
        const imported = importFeatures(await file.text());
        if (!imported) throw new Error(this.msg('The selected file does not contain GeoJSON.'));
        return imported;
    }

    private applyImport({ overlay, pins, objects }: ImportedMap) {
        this.geoJSON = overlay;
        if (pins) {
            this.markers = pins;
            this.renderMarkers();
        }
        if (!objects) return;
        this.removeEditMarkers();
        this.map?.eachLayer((layer) => {
            if (this.objects[(layer as DrawLayer).id ?? '']) this.map.removeLayer(layer);
        });
        this.objects = objects;
        if (this.map) {
            this.loadObjects();
            this.syncObjectAccess();
        }
    }

    async importFile(file: File): Promise<() => void> {
        const imported = await this.prepareImport(file);
        return () => this.applyImport(imported);
    }

    /** GeoJSON import of an action: the first file replaces the overlay, and replaces the pins and drawings too when the file holds them (nothing is merged). */
    async importGeoJSON(files: File[]): Promise<void> {
        if (files[0]) this.applyImport(await this.prepareImport(files[0]));
    }

    /**
     * Exports the overlay, the pins and the drawn shapes as one GeoJSON FeatureCollection.
     * Pins and shapes are tagged with a `kind` property, so that an import of the file restores them.
     * A circle is a point with a `radius` in meters; styles are kept as properties. Base layer, view and bounds are not part of it.
     */
    exportGeoJSON(): File {
        return new File([exportFeatures(this.geoJSON, this.markers, this.objects)], 'map.geojson', { type: 'application/geo+json' });
    }

    /** Opens the pin dialog for a pin at the center of the map. */
    addPin(): void {
        this.loadMapPosition();
        this.pinTitle = '';
        this.pinDialog?.show();
    }

    resetBounds(): void {
        this.mapBounds = undefined;
        this.maxZoom = undefined;
        this.minZoom = undefined;
        this.boundsActive = false;
    }

    private updateBaseLayer() {
        this.map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer || 'getMaplibreMap' in layer) {
                this.map.removeLayer(layer);
            }
        });

        if (this.layerControl) {
            this.map.removeControl(this.layerControl);
            this.layerControl = undefined;
        }

        if (this.vectorStyle) {
            createMaplibreLayer(this.vectorStyle, this.layerHost).addTo(this.map);
        } else if (this.customTileUrl) {
            const tileDef = RASTER_TILES.find(t => t.url === this.customTileUrl);
            L.tileLayer(this.customTileUrl, {
                attribution: tileDef?.attribution ?? '',
            }).addTo(this.map);
        } else {
            const vectorLayers = VECTOR_TILES.map(s => [s.name, createMaplibreLayer(s.url, this.layerHost)] as const);
            const rasterLayers = RASTER_TILES.filter(t => t.userSelect).map(t => [t.name, createRasterLayer(t, this.layerHost)] as const);
            const baseLayers = Object.fromEntries([...vectorLayers, ...rasterLayers]);
            this.layerControl = L.control.layers(baseLayers).addTo(this.map);
            vectorLayers[0][1].addTo(this.map);
        }
    }

    /** Draws the pins into one group, so that drawing them again never stacks duplicates. */
    private renderMarkers() {
        this.markerLayer?.clearLayers();
        this.markers?.forEach((marker) => {
            L.marker([marker.lat, marker.lng], { icon: icons.RED, title: marker.title, alt: marker.title }).bindPopup(marker.title ?? '').addTo(this.markerLayer!);
        });
    }

    render() {
        return html`
            ${this.#permissions.editing ? html`<div class="toolbox-frame">${mapToolbox(this)}</div>` : ''}
            <div id="map" part="map" style=${styleMap({ height: this.isFullscreen ? '100%' : this.mapHeight + 'px', width: this.mapWidth + '%' })}>
                <div id="overlay">
                    <sl-button id="fsButton" size="small" title=${this.isFullscreen ? this.msg('Exit fullscreen') : this.msg('Enter fullscreen')} @click=${()=>{
                        if (this.ownerDocument.fullscreenElement === this) {
                            this.ownerDocument.exitFullscreen()
                        } else {
                            this.requestFullscreen()
                        }
                    }}>
                    <sl-icon src=${this.isFullscreen ? minimizeIcon : maximizeIcon} label=${this.isFullscreen ? this.msg('Exit fullscreen') : this.msg('Enter fullscreen')}></sl-icon>
                    </sl-button> 
                </div>
            </div>
            ${this.markers?.some((pin) => pin.title) ? html`<section class="print-pins" part="pins">
                <h3>${this.msg('Pins')}</h3>
                <ol>${this.markers.filter((pin) => pin.title).map((pin) => html`<li>${pin.title} <small>${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}</small></li>`)}</ol>
            </section>` : ''}

            ${this.#permissions.editing ? pinDialog(this.msg, this.pinTitle, (title) => (this.pinTitle = title), () => this.addLabel()) : ''}
        `;
    }

    /** Shows the handles of the selected shape. A selection by keyboard moves the focus to the first handle. */
    private selectShape<T extends DrawLayer>(e: L.LeafletEvent, handles: (map: L.Map, layer: WithId<T>, save: () => void) => L.Marker[]) {
        if (!this.#permissions.editing) return;

        this.removeEditMarkers();
        const layer = e.target as WithId<T>;
        const markers = handles(this.map, layer, () => this.saveObject(layer, layer.id));
        for (const marker of markers) marker.getElement()?.setAttribute('aria-label', this.msg('Move handle'));
        this.editObjectMarkers.push(...markers);
        if ((e as L.LeafletMouseEvent).originalEvent instanceof KeyboardEvent) markers[0]?.getElement()?.focus();
    }

    private selectObject(type: DrawnObject['type'], e: L.LeafletEvent) {
        if (type === 'rectangle') this.selectShape<L.Rectangle>(e, rectangleHandles);
        else if (type === 'circle') this.selectShape<L.Circle>(e, circleHandles);
        else if (type === 'polygon') this.selectShape<L.Polygon>(e, polygonHandles);
        else this.selectShape<L.Polyline>(e, polylineHandles);
    }

    private setInitialPosition() {
        if (this.resizing) return;
        this.loadMapPosition()

        this.initialPos = {
            lat: this.inputLat,
            lng: this.inputLng,
        };
        this.initialZoom = this.inputZoom;
    }

    private loadMapPosition() {
        this.inputLat = this.map?.getCenter().lat || 0;
        this.inputLng = this.map?.getCenter().lng || 0;
        this.inputZoom = this.map?.getZoom() || 0;
    }

    private addLabel() {
        if (this.pinTitle) {
            this.pinDialog.hide();
            L.marker([this.inputLat, this.inputLng], { icon: icons.RED, title: this.pinTitle, alt: this.pinTitle })
                .addTo(this.markerLayer!)
                .bindPopup(this.pinTitle)
                .openPopup();
            this.markers.push({
                lat: this.inputLat,
                lng: this.inputLng,
                title: this.pinTitle,
            });
            this.markers = [...this.markers];
            this.pinTitle = '';
        }
    }

    private removeEditMarkers() {
        this.editObjectMarkers.forEach((marker) => {
            this.map?.removeLayer(marker);
        });
        this.editObjectMarkers = [];
    }

    private saveObject(o: DrawLayer, id?: string) {
        if (!id) o.id = id = crypto.randomUUID();
        this.objects = { ...this.objects, [id]: storeObject(o, id) };
    }

    private loadObjects() {
        for (const o of Object.values(this.objects)) {
            const layer = drawObject(o);
            if (!layer) continue;
            layer.addTo(this.map);
            layer.id = o.id;
            layer.on('click', (e: L.LeafletEvent) => this.selectObject(o.type, e));
            if (o.label) layer.bindTooltip(o.label, { direction: 'center' });
            bindShapeKeys(layer, () => this.#permissions.editing);
        }
    }

    /** Makes the drawn shapes reachable by keyboard: all of them for the author, the labelled ones for a reader who may move the map. */
    private syncObjectAccess() {
        if (!this.map) return;
        const interactive = this.#permissions.can('allowPanning');
        this.map.eachLayer((layer) => {
            const id = (layer as DrawLayer).id;
            const object = id ? this.objects[id] : undefined;
            const element = object && (layer as DrawLayer).getElement?.();
            if (!object || !element) return;
            setShapeAccess(element, interactive && (this.#permissions.editing || !!object.label), this.#permissions.editing, object.label || this.msg('Shape'));
        });
    }
}
