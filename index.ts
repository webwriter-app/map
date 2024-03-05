import { LitElementWw } from '@webwriter/lit';
import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import { styleMap } from 'lit/directives/style-map.js';

import { style } from './ww-map.css.js';
import { leafletStyles } from './leaflet/leaflet.css.js';

import { icons } from './icons.js';

import {
    faArrowPointer,
    faBan,
    faBorderBottomRight,
    faBorderTopLeft,
    faCircle,
    faCompress,
    faDrawPolygon,
    faExpand,
    faEye,
    faEyeSlashed,
    faLocationCrosshairs,
    faLocationDot,
    faMagnifyingGlassLocation,
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus,
    faMapLocationDot,
    faSlash,
    faSquareMinus,
    faSquarePlus,
    faStreetView,
    faTrash,
    faVectorSquare,
} from './fontawesome.css.js';

import SlButton from '@shoelace-style/shoelace/dist/components/button/button.component.js';
import SlDetails from '@shoelace-style/shoelace/dist/components/details/details.component.js';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component.js';
import SlCheckbox from '@shoelace-style/shoelace/dist/components/checkbox/checkbox.component.js';
import SlTooltip from '@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js';
import SlButtonGroup from '@shoelace-style/shoelace/dist/components/button-group/button-group.component.js';
import SlIcon from '@shoelace-style/shoelace/dist/components/icon/icon.component.js';
import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.component.js';
import SlMenu from '@shoelace-style/shoelace/dist/components/menu/menu.component.js';
import SlMenuItem from '@shoelace-style/shoelace/dist/components/menu-item/menu-item.component.js';
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.component.js';
import SlRange from '@shoelace-style/shoelace/dist/components/range/range.component.js';
import SlProgressBar from '@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.component.js';
import SlCard from '@shoelace-style/shoelace/dist/components/card/card.component.js';
import SlDivider from '@shoelace-style/shoelace/dist/components/divider/divider.component.js';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.component.js';
import SlColorPicker from '@shoelace-style/shoelace/dist/components/color-picker/color-picker.component.js';

import '@shoelace-style/shoelace/dist/themes/light.css';

// import leafletStyles from './leaflet/leaflet.css.js';

import * as L from './leaflet/leaflet.js';
import 'fa-icons';

@customElement('webwriter-map')
export class WwMap extends LitElementWw {
    // styles = [leafletStyles];
    styles = [style, leafletStyles];

    @query('#map')
    mapElement!: HTMLElement;

    @query('#pinDialog')
    pinDialog!: SlDialog;

    @property({ type: Object })
    map: L.Map | undefined;

    @property({ type: Object, attribute: true, reflect: true })
    initialPos: {
        lat: number;
        lng: number;
    } = {
        lat: 51,
        lng: 19,
    };

    @property({ type: Object, attribute: true, reflect: true })
    mapBounds: L.LatLngBoundsExpression;

    @property({ type: Number, attribute: true, reflect: true })
    maxZoom: number;

    @property({ type: Number, attribute: true, reflect: true })
    minZoom: number;

    @property({ type: Number, attribute: true, reflect: true })
    initialZoom = 13;

    @property({ type: Array, attribute: true, reflect: true })
    markers = [];

    @property({ type: Object, attribute: true, reflect: true })
    objects = {};

    @property({ type: String, attribute: true, reflect: true })
    customTileUrl = '';

    @property({ type: String, attribute: true, reflect: true })
    geoJSON = '';

    @property({ type: Number, attribute: true, reflect: true })
    mapWidth = 100;

    @property({ type: Number, attribute: true, reflect: true })
    mapHeight = 500;

    @property({ type: Boolean, attribute: true, reflect: true })
    boundsActive = true;

    @property({ type: Number })
    inputLat = 0;

    @property({ type: Number })
    inputLng = 0;

    @property({ type: Number })
    inputZoom = 0;

    @property({ type: String })
    inputBorderColor = '#000000ff';

    @property({ type: String })
    inputFillColor = '#000000ff';

    @property({ type: String })
    inputDrawObjectLabel = '';

    @property({ type: String })
    pinTitle = '';

    @property({ type: String })
    mapMode = 'view';

    @property({ type: Object })
    mouseMarker: L.Marker | undefined;

    @property({ type: Boolean })
    showBounds = false;

    @property({ type: Object })
    showBoundsLayer: L.Rectangle | undefined;

    @property({ type: Object })
    editObject;

    @property({ type: Array })
    editObjectMarkers = [];

    @property({ type: Object })
    layerControl;

    @property({ type: Object })
    drawObject;

    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

    static get scopedElements() {
        return {
            'sl-button-group': SlButtonGroup,
            'sl-button': SlButton,
            'sl-icon': SlIcon,
            'sl-input': SlInput,
            'sl-checkbox': SlCheckbox,
            'sl-details': SlDetails,
            'sl-range': SlRange,
            'sl-progress-bar': SlProgressBar,
            'sl-card': SlCard,
            'sl-divider': SlDivider,
            'sl-switch': SlSwitch,
            'sl-menu': SlMenu,
            'sl-menu-item': SlMenuItem,
            'sl-dropdown': SlDropdown,
            'sl-tooltip': SlTooltip,
            'sl-dialog': SlDialog,
            'sl-color-picker': SlColorPicker,
        };
    }

    connectedCallback(): void {
        // console.log('connectedCallback');
        super.connectedCallback();
    }

    disconnectedCallback(): void {
        // console.log('disconnectedCallback');
        super.disconnectedCallback();
    }

    protected update(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        // console.log('update');
        super.update(changedProperties);
    }

    protected updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        // console.log('updated');
        super.updated(changedProperties);

        if (this.map && changedProperties.has('customTileUrl')) {
            this.map.eachLayer((layer) => {
                if (layer instanceof L.TileLayer) this.map.removeLayer(layer);
            });

            if (this.layerControl) {
                this.map.removeControl(this.layerControl);
            }

            if (this.customTileUrl) {
                L.tileLayer(this.customTileUrl, {
                    attribution: '',
                }).addTo(this.map);
            } else {
                const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                });
                const otm = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a> contributors',
                });
                const sat = L.tileLayer(
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    {
                        attribution: '&copy; <a href="https://www.esri.com/">Esri</a> contributors',
                    }
                );
                const baseLayers = {
                    OpenStreetMap: osm,
                    OpenTopoMap: otm,
                    Satellite: sat,
                };

                this.layerControl = L.control.layers(baseLayers).addTo(this.map);
                osm.addTo(this.map);
            }
            this.markers?.forEach((marker) => {
                const m = L.marker([marker.lat, marker.lng], { icon: icons.RED }).addTo(this.map);
                m.bindPopup(marker.title);
            });
        }

        if (this.map && changedProperties.has('geoJSON')) {
            this.map.eachLayer((layer) => {
                if (layer instanceof L.GeoJSON) this.map.removeLayer(layer);
            });
            if (this.geoJSON) {
                L.geoJSON(JSON.parse(this.geoJSON)).addTo(this.map);
            }
            this.markers?.forEach((marker) => {
                const m = L.marker([marker.lat, marker.lng], { icon: icons.RED }).addTo(this.map);
                m.bindPopup(marker.title);
            });
        }

        if (this.map && changedProperties.has('mapBounds')) {
            if (this.mapBounds && this.boundsActive) {
                this.map.setMaxBounds(this.mapBounds);
            } else {
                this.map.setMaxBounds(undefined);
            }
        }

        if (this.map && changedProperties.has('maxZoom')) {
            if (this.maxZoom && this.boundsActive) {
                this.map.setMaxZoom(this.maxZoom);
            } else {
                this.map.setMaxZoom(Infinity);
            }
        }

        if (this.map && changedProperties.has('minZoom')) {
            if (this.minZoom) {
                this.map.setMinZoom(this.minZoom);
            } else {
                this.map.setMinZoom(0);
            }
        }

        if (this.map && changedProperties.has('boundsActive')) {
            if (this.boundsActive) {
                this.map.setMaxBounds(this.mapBounds);
            } else {
                this.map.setMaxBounds(undefined);
            }
        }

        if (this.map && changedProperties.has('editable')) {
            this.clearEditObject();
        }
    }

    protected shouldUpdate(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): boolean {
        // console.log('shouldUpdate');
        return super.shouldUpdate(changedProperties);
    }

    protected willUpdate(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        // console.log('willUpdate');
        super.willUpdate(changedProperties);
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        // console.log('firstUpdated');
        super.firstUpdated(_changedProperties);

        // console.log(this.styles);

        this.map = L.map(this.mapElement).setView([this.initialPos.lat, this.initialPos.lng], this.initialZoom);
        if (this.customTileUrl) {
            L.tileLayer(this.customTileUrl, {
                attribution: '',
            }).addTo(this.map);
        } else {
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(this.map);
        }

        if (this.geoJSON) {
            L.geoJSON(JSON.parse(this.geoJSON)).addTo(this.map);
        }

        this.markers?.forEach((marker) => {
            const m = L.marker([marker.lat, marker.lng], { icon: icons.RED }).addTo(this.map);
            m.bindPopup(marker.title);
        });

        this.map.on('move', this.onMapMove.bind(this));
        this.map.on('click', this.onMapClick.bind(this));

        this.inputLat = this.initialPos.lat;
        this.inputLng = this.initialPos.lng;
        this.inputZoom = this.initialZoom;

        this.loadObjects();
    }

    private isEditable() {
        return this.contentEditable === 'true' || this.contentEditable === '';
    }

    onMapMove() {
        // console.log('onMapMove');
    }

    onMapClick(e: L.LeafletMouseEvent) {
        // console.log('onMapClick');
        if (this.mapMode === 'mouseSelect') {
            if (this.mouseMarker) {
                this.map?.removeLayer(this.mouseMarker);
            }
            this.mouseMarker = L.marker(e.latlng, { icon: icons.YELLOW }).addTo(this.map);
            this.inputLat = e.latlng.lat;
            this.inputLng = e.latlng.lng;
            this.inputZoom = this.map?.getZoom() || 0;
        }
    }

    render() {
        return html`
            <style>
                ${this.styles}
            </style>

            ${this.isEditable() ? this.toolbox() : ''}

            <div id="map" style=${styleMap({ height: this.mapHeight + 'px', width: this.mapWidth + '%' })}></div>

            ${this.isEditable() ? this.dialogs() : ''}
        `;
    }

    toolbox() {
        return html`
            <div part="options" class="toolbox">
                <div class="position">
                    <sl-input
                        class="label-on-left"
                        label="Lat"
                        value=${this.inputLat}
                        @sl-change=${(e: any) => {
                            this.inputLat = e.target.value;
                        }}
                    ></sl-input>
                    <sl-input
                        class="label-on-left"
                        label="Lng"
                        value=${this.inputLng}
                        @sl-change=${(e: any) => {
                            this.inputLng = e.target.value;
                        }}
                    ></sl-input>
                </div>
                <sl-input
                    class="label-on-left"
                    label="Zoom"
                    value=${this.inputZoom}
                    @sl-change=${(e: any) => {
                        this.inputZoom = e.target.value;
                    }}
                ></sl-input>

                <sl-button-group label="Positions">
                    <sl-tooltip content="Set current Position">
                        <sl-button
                            @click=${() => {
                                this.loadMapPosition();
                            }}
                            >${faMapLocationDot}</sl-button
                        >
                    </sl-tooltip>
                    <sl-tooltip content="Set your Location">
                        <sl-button
                            @click=${() => {
                                this.loadGeoLocation();
                            }}
                            >${faLocationCrosshairs}</sl-button
                        >
                    </sl-tooltip>
                    <sl-tooltip content=${(this.mapMode !== 'mouseSelect' ? 'Enable' : 'Disable') + ' Mouse Selection'}>
                        <sl-button
                            @click=${() => {
                                if (this.mapMode === 'mouseSelect') {
                                    this.map?.removeLayer(this.mouseMarker);
                                    this.mapMode = 'view';
                                } else {
                                    this.mapMode = 'mouseSelect';
                                }
                            }}
                            variant=${this.mapMode === 'mouseSelect' ? 'primary' : 'default'}
                            >${faArrowPointer}</sl-button
                        >
                    </sl-tooltip>
                    <sl-tooltip content="Find Position">
                        <sl-button
                            @click=${() => {
                                this.map?.setView([this.inputLat, this.inputLng], this.inputZoom);
                            }}
                            >${faMagnifyingGlassLocation}</sl-button
                        >
                    </sl-tooltip>
                </sl-button-group>
                <sl-button-group label="Actions">
                    <sl-tooltip content="Add Pin">
                        <sl-button
                            @click=${() => {
                                this.pinDialog.show();
                            }}
                            >${faLocationDot}</sl-button
                        >
                    </sl-tooltip>
                    <sl-tooltip content="Set Position as initial">
                        <sl-button
                            @click=${() => {
                                this.setInitialPosition();
                            }}
                            >${faStreetView}</sl-button
                        >
                    </sl-tooltip>
                </sl-button-group>
                <sl-details class="custom-icons">
                    <div slot="summary">
                        Bounds
                        <i style="font-size:0.5rem"
                            >(${!this.mapBounds ? 'not set' : this.boundsActive ? 'activated' : 'deactivated'})</i
                        >
                    </div>
                    <span name="plus-square" slot="expand-icon">${faSquarePlus}</span>
                    <span name="dash-square" slot="collapse-icon">${faSquareMinus}</span>

                    <sl-button-group label="Bounds">
                        <sl-tooltip content="Set Top Left">
                            <sl-button
                                @click=${() => {
                                    if (this.mapBounds) {
                                        this.mapBounds = [[this.inputLat, this.inputLng], this.mapBounds[1]];
                                    } else {
                                        this.mapBounds = [
                                            [this.inputLat, this.inputLng],
                                            [this.inputLat, this.inputLng],
                                        ];
                                    }
                                }}
                                >${faBorderTopLeft}</sl-button
                            >
                        </sl-tooltip>
                        <sl-tooltip content="Set Bottom Right">
                            <sl-button
                                @click=${() => {
                                    if (this.mapBounds) {
                                        this.mapBounds = [this.mapBounds[0], [this.inputLat, this.inputLng]];
                                    } else {
                                        this.mapBounds = [
                                            [this.inputLat, this.inputLng],
                                            [this.inputLat, this.inputLng],
                                        ];
                                    }
                                }}
                                >${faBorderBottomRight}</sl-button
                            >
                        </sl-tooltip>
                        <sl-tooltip content="Set Max Zoom">
                            <sl-button
                                @click=${() => {
                                    this.maxZoom = this.inputZoom;
                                }}
                                >${faMagnifyingGlassPlus}</sl-button
                            >
                        </sl-tooltip>
                        <sl-tooltip content="Set Min Zoom">
                            <sl-button
                                @click=${() => {
                                    this.minZoom = this.inputZoom;
                                }}
                                >${faMagnifyingGlassMinus}</sl-button
                            >
                        </sl-tooltip>
                    </sl-button-group>
                    <sl-button-group label="Actions">
                        <sl-tooltip content="Fit Bounds">
                            <sl-button
                                @click=${() => {
                                    this.map?.fitBounds(this.mapBounds);
                                }}
                                >${faExpand}</sl-button
                            >
                        </sl-tooltip>
                        <sl-tooltip content="Visualize Bounds">
                            <sl-button
                                @click=${() => {
                                    this.showBounds = !this.showBounds;
                                    if (this.showBounds) {
                                        this.map?.fitBounds(this.mapBounds);
                                        this.showBoundsLayer = L.rectangle(this.mapBounds, {
                                            color: '#ff7800',
                                            weight: 1,
                                        }).addTo(this.map);
                                    } else {
                                        this.map?.removeLayer(this.showBoundsLayer);
                                    }
                                }}
                                variant=${this.showBounds ? 'primary' : 'default'}
                                >${!this.showBounds ? faEye : faEyeSlashed}</sl-button
                            >
                        </sl-tooltip>
                        <sl-tooltip content=${this.boundsActive ? 'Disable Bounds' : 'Enable Bounds'}>
                            <sl-button
                                @click=${() => {
                                    this.boundsActive = !this.boundsActive;
                                }}
                                variant=${!this.boundsActive ? 'primary' : 'default'}
                                >${this.boundsActive ? faBan : faBan}</sl-button
                            >
                        </sl-tooltip>
                        <sl-tooltip content="Reset Bounds">
                            <sl-button
                                @click=${() => {
                                    this.mapBounds = undefined;
                                    this.maxZoom = undefined;
                                    this.minZoom = undefined;
                                    this.showBounds = false;
                                    if (this.showBoundsLayer) {
                                        this.map?.removeLayer(this.showBoundsLayer);
                                    }
                                }}
                                >${faTrash}</sl-button
                            >
                        </sl-tooltip>
                    </sl-button-group>
                </sl-details>
                <sl-details summary="Draw" class="custom-icons">
                    <span name="plus-square" slot="expand-icon">${faSquarePlus}</span>
                    <span name="dash-square" slot="collapse-icon">${faSquareMinus}</span>

                    <div>
                        <sl-button-group label="Draw">
                            <sl-tooltip content="Draw Rectangle">
                                <sl-button
                                    @click=${this.addRectangel}
                                    variant=${this.mapMode === 'drawingRectangle' ||
                                    this.mapMode === 'awaitDrawingRectangel'
                                        ? 'primary'
                                        : 'default'}
                                >
                                    ${faVectorSquare}
                                </sl-button>
                            </sl-tooltip>
                            <sl-tooltip content="Draw Circle">
                                <sl-button
                                    @click=${this.addCircle}
                                    variant=${this.mapMode === 'drawingCircle' || this.mapMode === 'awaitDrawingCircle'
                                        ? 'primary'
                                        : 'default'}
                                >
                                    ${faCircle}
                                </sl-button>
                            </sl-tooltip>
                            <sl-tooltip content="Draw Polygon">
                                <sl-button
                                    @click=${() => {
                                        if (this.mapMode === 'drawingPolygon') {
                                            this.mapMode = 'view';
                                            this.drawObject.on('click', (e: any) => {
                                                this.onPolygonClick(e);
                                            });
                                            if (this.inputDrawObjectLabel) {
                                                this.drawObject.bindTooltip(this.inputDrawObjectLabel, {
                                                    direction: 'center',
                                                });
                                            }
                                            this.map?.dragging.enable();
                                            this.saveObject(this.drawObject);
                                        } else {
                                            this.addPolygon();
                                        }
                                    }}
                                    variant=${this.mapMode === 'drawingPolygon' ? 'primary' : 'default'}
                                >
                                    ${faDrawPolygon}
                                </sl-button>
                            </sl-tooltip>
                            <sl-tooltip content="Draw Polyline">
                                <sl-button
                                    @click=${() => {
                                        if (this.mapMode === 'drawingPolyline') {
                                            this.mapMode = 'view';
                                            this.drawObject.on('click', (e: any) => {
                                                this.onPolylineClick(e);
                                            });
                                            if (this.inputDrawObjectLabel) {
                                                this.drawObject.bindTooltip(this.inputDrawObjectLabel, {
                                                    direction: 'center',
                                                });
                                            }
                                            this.map?.dragging.enable();
                                            this.saveObject(this.drawObject);
                                        } else {
                                            this.addPolyline();
                                        }
                                    }}
                                    variant=${this.mapMode === 'drawingPolyline' ? 'primary' : 'default'}
                                >
                                    ${faSlash}
                                </sl-button>
                            </sl-tooltip>
                        </sl-button-group>
                        <sl-button-group label="Delete">
                            <sl-tooltip content="Delete Object">
                                <sl-button
                                    @click=${() => {
                                        this.deleteSelectedObject();
                                    }}
                                    ?disabled=${!this.editObject}
                                    >${faTrash}</sl-button
                                >
                            </sl-tooltip>
                        </sl-button-group>
                    </div>
                    <div>
                        <span>Border Color</span>
                        <sl-tooltip content="Border Color">
                            <sl-color-picker
                                opacity
                                value=${this.inputBorderColor}
                                @sl-change=${(e: any) => {
                                    this.inputBorderColor = e.target.value;
                                }}
                            >
                                <span slot="label">Border Color</span>
                            </sl-color-picker>
                        </sl-tooltip>
                    </div>
                    <div>
                        <span>Fill Color</span>
                        <sl-tooltip content="Fill Color">
                            <sl-color-picker
                                opacity
                                value=${this.inputFillColor}
                                @sl-change=${(e: any) => {
                                    this.inputFillColor = e.target.value;
                                }}
                            >
                                <span slot="label">Fill Color</span>
                            </sl-color-picker>
                        </sl-tooltip>
                    </div>
                    <div>
                        <sl-input
                            label="Label"
                            value=${this.inputDrawObjectLabel}
                            @sl-change=${(e: any) => {
                                this.inputDrawObjectLabel = e.target.value;
                            }}
                        ></sl-input>
                    </div>
                </sl-details>

                <sl-details summary="Size" class="custom-icons">
                    <span name="plus-square" slot="expand-icon">${faSquarePlus}</span>
                    <span name="dash-square" slot="collapse-icon">${faSquareMinus}</span>

                    <sl-input
                        label="Width"
                        value=${this.mapWidth}
                        @sl-change=${(e: any) => {
                            this.mapWidth = e.target.value;
                        }}
                    >
                        <span slot="suffix">%</span></sl-input
                    >
                    <sl-input
                        label="Height"
                        value=${this.mapHeight}
                        @sl-change=${(e: any) => {
                            this.mapHeight = e.target.value;
                        }}
                        ><span slot="suffix">px</span></sl-input
                    >
                </sl-details>

                <sl-details summary="Advanced" class="custom-icons">
                    <span name="plus-square" slot="expand-icon">${faSquarePlus}</span>
                    <span name="dash-square" slot="collapse-icon">${faSquareMinus}</span>

                    <sl-input
                        label="Custom Tile Url"
                        value=${this.customTileUrl}
                        @sl-change=${(e: any) => {
                            this.customTileUrl = e.target.value;
                        }}
                    ></sl-input>

                    <!-- <sl-button-group label="Map Type"> -->
                    <sl-tooltip content="Default">
                        <sl-button
                            @click=${() => {
                                this.customTileUrl = undefined;
                            }}
                            >Default</sl-button
                        >
                    </sl-tooltip>
                    <sl-tooltip content="OpenStreetMapDE">
                        <sl-button
                            @click=${() => {
                                this.customTileUrl = 'https://tile.openstreetmap.de/{z}/{x}/{y}.png';
                            }}
                            >OpenStreetMapDE</sl-button
                        >
                    </sl-tooltip>
                    <sl-tooltip content="OpenTopoMap">
                        <sl-button
                            @click=${() => {
                                this.customTileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
                            }}
                            >OpenTopoMap</sl-button
                        >
                    </sl-tooltip>
                    <sl-tooltip content="WorldImagery">
                        <sl-button
                            @click=${() => {
                                this.customTileUrl =
                                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
                            }}
                            >WorldImagery</sl-button
                        >
                    </sl-tooltip>
                    <!-- </sl-button-group> -->

                    <sl-input
                        label="Geo JSON"
                        value=${this.geoJSON}
                        @sl-change=${(e: any) => {
                            this.geoJSON = e.target.value;
                        }}
                    ></sl-input>
                </sl-details>
            </div>
        `;
    }

    dialogs() {
        return html`<sl-dialog id="pinDialog">
            <div slot="label">
                Add Pin
                <div class="marker-icon marker-icon-red" style="position: relative"></div>
            </div>
            <sl-input
                autofocus
                placeholder="Text"
                value=${this.pinTitle}
                @sl-change=${(e: any) => {
                    this.pinTitle = e.target.value;
                }}
            ></sl-input>
            <sl-button
                slot="footer"
                variant="primary"
                @click=${() => {
                    this.addLabel();
                }}
                >Add</sl-button
            >
        </sl-dialog>`;
    }

    addRectangel() {
        //disable map dragging
        this.map?.dragging.disable();
        this.mapMode = 'awaitDrawingRectangel';

        //clear map events
        this.map?.off('mousemove');
        this.map?.off('mousedown');

        //on mouse down
        const onMapDivMouseDown = this.map.on('mousedown', (e: any) => {
            if (this.mapMode === 'awaitDrawingRectangel') {
                this.mapMode = 'drawingRectangle';
                this.drawObject = L.rectangle([e.latlng, e.latlng], {
                    color: this.inputBorderColor,
                    fillColor: this.inputFillColor,
                    opacity: this.getOpacity(this.inputBorderColor),
                    fillOpacity: this.getOpacity(this.inputFillColor),
                }).addTo(this.map);

                this.map.off('mousedown', onMapDivMouseDown);
            }
        });

        const onMapDivMove = this.map.on('mousemove', (e: any) => {
            if (this.mapMode === 'drawingRectangle') {
                this.drawObject?.setBounds(L.latLngBounds(this.drawObject.getBounds().getNorthWest(), e.latlng));
            }
        });

        const onMapDivMouseUp = this.map.on('mouseup', (e: any) => {
            if (this.mapMode === 'drawingRectangle') {
                this.mapMode = 'view';

                this.map.off('mousemove', onMapDivMove);
                this.map.off('mouseup', onMapDivMouseUp);

                this.drawObject.on('click', (e: any) => {
                    this.onRectangleClick(e);
                });

                if (this.inputDrawObjectLabel) {
                    this.drawObject.bindTooltip(this.inputDrawObjectLabel, {
                        direction: 'center',
                    });
                }

                this.map?.dragging.enable();

                this.saveObject(this.drawObject);
            }
        });
    }

    addCircle() {
        //disable map dragging
        this.map?.dragging.disable();
        this.mapMode = 'awaitDrawingCircle';

        //clear map events
        this.map?.off('mousemove');
        this.map?.off('mousedown');

        //on mouse down
        const onMapDivMouseDown = this.map.on('mousedown', (e: any) => {
            if (this.mapMode === 'awaitDrawingCircle') {
                this.mapMode = 'drawingCircle';
                this.drawObject = L.circle(e.latlng, {
                    color: this.inputBorderColor,
                    fillColor: this.inputFillColor,
                    opacity: this.getOpacity(this.inputBorderColor),
                    fillOpacity: this.getOpacity(this.inputFillColor),
                }).addTo(this.map);

                this.map.off('mousedown', onMapDivMouseDown);
            }
        });

        const onMapDivMove = this.map.on('mousemove', (e: any) => {
            if (this.mapMode === 'drawingCircle') {
                this.drawObject?.setRadius(this.drawObject.getLatLng().distanceTo(e.latlng));
            }
        });

        const onMapDivMouseUp = this.map.on('mouseup', (e: any) => {
            if (this.mapMode === 'drawingCircle') {
                this.mapMode = 'view';

                this.map.off('mousemove');
                this.map.off('mouseup');

                this.drawObject.on('click', (e: any) => {
                    this.onCircleClick(e);
                });
                if (this.inputDrawObjectLabel) {
                    this.drawObject.bindTooltip(this.inputDrawObjectLabel, {
                        direction: 'center',
                    });
                }

                this.map?.dragging.enable();

                this.saveObject(this.drawObject);
            }
        });
    }

    addPolygon() {
        //disable map dragging
        this.map?.dragging.disable();
        this.mapMode = 'drawingPolygon';

        this.drawObject = undefined;

        //clear map events
        this.map?.off('mousemove');
        this.map?.off('mousedown');

        //on map click
        const onMapDivMouseDown = this.map.on('click', (e: any) => {
            if (this.mapMode === 'drawingPolygon') {
                if (this.drawObject) {
                    this.drawObject.addLatLng(e.latlng);
                } else {
                    this.drawObject = L.polygon([e.latlng], {
                        color: this.inputBorderColor,
                        fillColor: this.inputFillColor,
                        opacity: this.getOpacity(this.inputBorderColor),
                        fillOpacity: this.getOpacity(this.inputFillColor),
                    }).addTo(this.map);
                }
            }
        });
    }

    addPolyline() {
        //disable map dragging
        this.map?.dragging.disable();
        this.mapMode = 'drawingPolyline';

        this.drawObject = undefined;

        //clear map events
        this.map?.off('mousemove');
        this.map?.off('mousedown');

        //on map click
        const onMapDivMouseDown = this.map.on('click', (e: any) => {
            if (this.mapMode === 'drawingPolyline') {
                if (this.drawObject) {
                    this.drawObject.addLatLng(e.latlng);
                } else {
                    this.drawObject = L.polyline([e.latlng], {
                        color: this.inputBorderColor,
                        fillColor: this.inputFillColor,
                        opacity: this.getOpacity(this.inputBorderColor),
                        fillOpacity: this.getOpacity(this.inputFillColor),
                    }).addTo(this.map);
                }
            }
        });
    }

    getPolygonPoints(n: number) {
        const points = [];
        const centerLat = this.inputLat;
        const centerLng = this.inputLng;

        // Create n sided polygon
        for (let i = 0; i < n; i++) {
            const x = centerLat + 0.01 * Math.cos((2 * Math.PI * i) / n);
            const y = centerLng + 0.01 * Math.sin((2 * Math.PI * i) / n);

            points.push([x, y]);
        }
        return points;
    }

    getPolylinePoints(n: number) {
        const points = [];
        const centerLat = this.inputLat;
        const centerLng = this.inputLng;

        for (let i = 0; i < n; i++) {
            const x = centerLat + 0.01 * i;
            const y = centerLng + 0.01 * i;

            points.push([x, y]);
        }
        return points;
    }

    onRectangleClick(e: any) {
        if (!this.isEditable()) return;

        this.clearEditObject();
        this.editObject = e.target;

        const markerTL = L.marker(this.editObject.getBounds().getNorthWest(), {
            draggable: true,
            icon: icons.GREEN,
        }).addTo(this.map);
        const markerTR = L.marker(this.editObject.getBounds().getNorthEast(), {
            draggable: true,
            icon: icons.GREEN,
        }).addTo(this.map);
        const markerBL = L.marker(this.editObject.getBounds().getSouthWest(), {
            draggable: true,
            icon: icons.GREEN,
        }).addTo(this.map);
        const markerBR = L.marker(this.editObject.getBounds().getSouthEast(), {
            draggable: true,
            icon: icons.GREEN,
        }).addTo(this.map);

        this.editObjectMarkers.push(markerTL);
        this.editObjectMarkers.push(markerTR);
        this.editObjectMarkers.push(markerBL);
        this.editObjectMarkers.push(markerBR);

        markerTL.on('drag', (e: any) => {
            this.editObject?.setBounds(L.latLngBounds(e.target.getLatLng(), markerBR.getLatLng()));

            this.editObjectMarkers[1].setLatLng(this.editObject.getBounds().getNorthEast());
            this.editObjectMarkers[2].setLatLng(this.editObject.getBounds().getSouthWest());
            this.editObjectMarkers[3].setLatLng(this.editObject.getBounds().getSouthEast());
        });
        markerTL.once('dragend', (e: any) => {
            this.saveObject(this.editObject, this.editObject.id);
        });
        markerTR.on('drag', (e: any) => {
            this.editObject?.setBounds(
                L.latLngBounds(
                    [e.target.getLatLng().lat, markerTL.getLatLng().lng],
                    [markerBL.getLatLng().lat, e.target.getLatLng().lng]
                )
            );

            this.editObjectMarkers[0].setLatLng(this.editObject.getBounds().getNorthWest());
            this.editObjectMarkers[2].setLatLng(this.editObject.getBounds().getSouthWest());
            this.editObjectMarkers[3].setLatLng(this.editObject.getBounds().getSouthEast());
        });
        markerTR.once('dragend', (e: any) => {
            this.saveObject(this.editObject, this.editObject.id);
        });
        markerBL.on('drag', (e: any) => {
            this.editObject?.setBounds(
                L.latLngBounds(
                    [markerTL.getLatLng().lat, e.target.getLatLng().lng],
                    [e.target.getLatLng().lat, markerBR.getLatLng().lng]
                )
            );

            this.editObjectMarkers[0].setLatLng(this.editObject.getBounds().getNorthWest());
            this.editObjectMarkers[1].setLatLng(this.editObject.getBounds().getNorthEast());
            this.editObjectMarkers[3].setLatLng(this.editObject.getBounds().getSouthEast());
        });
        markerBL.once('dragend', (e: any) => {
            this.saveObject(this.editObject, this.editObject.id);
        });
        markerBR.on('drag', (e: any) => {
            this.editObject?.setBounds(L.latLngBounds(markerTL.getLatLng(), e.target.getLatLng()));

            this.editObjectMarkers[0].setLatLng(this.editObject.getBounds().getNorthWest());
            this.editObjectMarkers[1].setLatLng(this.editObject.getBounds().getNorthEast());
            this.editObjectMarkers[2].setLatLng(this.editObject.getBounds().getSouthWest());
        });
        markerBR.once('dragend', (e: any) => {
            this.saveObject(this.editObject, this.editObject.id);
        });
    }

    onCircleClick(e: any) {
        if (!this.isEditable()) return;

        if (this.editObjectMarkers.length > 0) {
            this.editObjectMarkers.forEach((marker) => {
                this.map?.removeLayer(marker);
            });
            this.editObjectMarkers = [];
        }

        this.editObject = e.target;
        const markerCenter = L.marker(this.editObject.getLatLng(), {
            draggable: true,
            icon: icons.GREEN,
        }).addTo(this.map);
        const markerRadius = L.marker(
            [
                this.editObject.getBounds().getNorthEast().lat,
                this.editObject.getBounds().getNorthWest().lng +
                    Math.abs(
                        this.editObject.getBounds().getNorthEast().lng - this.editObject.getBounds().getNorthWest().lng
                    ) /
                        2,
            ],
            {
                draggable: true,
                icon: icons.GREEN,
            }
        ).addTo(this.map);

        this.editObjectMarkers.push(markerCenter);
        this.editObjectMarkers.push(markerRadius);

        markerCenter.on('drag', (e: any) => {
            this.editObject?.setLatLng(e.target.getLatLng());
            this.editObjectMarkers[1].setLatLng([
                this.editObject.getBounds().getNorthEast().lat,
                this.editObject.getBounds().getNorthWest().lng +
                    Math.abs(
                        this.editObject.getBounds().getNorthEast().lng - this.editObject.getBounds().getNorthWest().lng
                    ) /
                        2,
            ]);
        });

        markerCenter.once('dragend', (e: any) => {
            this.saveObject(this.editObject, this.editObject.id);
        });

        markerRadius.on('drag', (e: any) => {
            this.editObject?.setRadius(e.target.getLatLng().distanceTo(markerCenter.getLatLng()));
            this.editObjectMarkers[0].setLatLng(this.editObject.getLatLng());
        });

        markerRadius.once('dragend', (e: any) => {
            this.saveObject(this.editObject, this.editObject.id);
        });
    }

    onPolygonClick(e: any) {
        if (!this.isEditable()) return;

        if (this.editObjectMarkers.length > 0) {
            this.editObjectMarkers.forEach((marker) => {
                this.map?.removeLayer(marker);
            });
            this.editObjectMarkers = [];
        }

        this.editObject = e.target;
        this.editObject.getLatLngs()[0].forEach((point: any) => {
            const marker = L.marker(point, {
                draggable: true,
                icon: icons.GREEN,
            }).addTo(this.map);
            this.editObjectMarkers.push(marker);

            marker.on('drag', (e: any) => {
                const index = this.editObjectMarkers.indexOf(e.target);
                const latlngs = this.editObject.getLatLngs()[0];
                latlngs[index] = e.target.getLatLng();
                this.editObject.setLatLngs(latlngs);
            });

            marker.once('dragend', (e: any) => {
                this.saveObject(this.editObject, this.editObject.id);
            });
        });
    }

    onPolylineClick(e: any) {
        if (!this.isEditable()) return;

        if (this.editObjectMarkers.length > 0) {
            this.editObjectMarkers.forEach((marker) => {
                this.map?.removeLayer(marker);
            });
            this.editObjectMarkers = [];
        }

        this.editObject = e.target;
        this.editObject.getLatLngs().forEach((point: any) => {
            const marker = L.marker(point, {
                draggable: true,
                icon: icons.GREEN,
            }).addTo(this.map);
            this.editObjectMarkers.push(marker);

            marker.on('drag', (e: any) => {
                const index = this.editObjectMarkers.indexOf(e.target);
                const latlngs = this.editObject.getLatLngs();
                latlngs[index] = e.target.getLatLng();
                this.editObject.setLatLngs(latlngs);
            });

            marker.once('dragend', (e: any) => {
                this.saveObject(this.editObject, this.editObject.id);
            });
        });
    }

    setInitialPosition() {
        // console.log('setInitialPosition');

        this.initialPos = {
            lat: this.inputLat,
            lng: this.inputLng,
        };
        this.initialZoom = this.inputZoom;
    }

    loadMapPosition() {
        this.inputLat = this.map?.getCenter().lat || 0;
        this.inputLng = this.map?.getCenter().lng || 0;
        this.inputZoom = this.map?.getZoom() || 0;
    }

    loadGeoLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.map?.setView([position.coords.latitude, position.coords.longitude], 13);
                this.loadMapPosition();
            });
        }
    }

    addLabel() {
        if (this.pinTitle) {
            this.pinDialog.hide();
            const marker = L.marker([this.inputLat, this.inputLng], { icon: icons.RED })
                .addTo(this.map)
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

    private clearEditObject() {
        if (this.editObjectMarkers.length > 0) {
            this.editObjectMarkers.forEach((marker) => {
                this.map?.removeLayer(marker);
            });
            this.editObjectMarkers = [];
        }
        if (this.editObject) {
            this.editObject = undefined;
        }
    }

    private saveObject(o, id: string = undefined) {
        const checkIfObjectExists = this.objects.hasOwnProperty(id);

        // console.log('SAVE DRAW OBJECT', this.objects, checkIfObjectExists);

        if (!id) {
            id = crypto.randomUUID();
            o.id = id;
        }

        this.objects[id] = {
            id: id,
            type:
                o instanceof L.Rectangle
                    ? 'rectangle'
                    : o instanceof L.Circle
                    ? 'circle'
                    : o instanceof L.Polygon
                    ? 'polygon'
                    : o instanceof L.Polyline
                    ? 'polyline'
                    : 'unknown',
            latlngs:
                o instanceof L.Rectangle
                    ? o.getBounds()
                    : o instanceof L.Circle
                    ? o.getLatLng()
                    : o instanceof L.Polygon
                    ? o.getLatLngs()
                    : o instanceof L.Polyline
                    ? o.getLatLngs()
                    : undefined,
            radius: o instanceof L.Circle ? o.getRadius() : undefined,
            borderColor: o.options.color,
            fillColor: o.options.fillColor,
            borderOpacity: o.options.opacity,
            fillOpacity: o.options.fillOpacity,
            label: this.inputDrawObjectLabel,
        };
        this.objects = { ...this.objects };
    }

    private deleteObject(id: string) {
        const checkIfObjectExists = this.objects.hasOwnProperty(id);
        if (checkIfObjectExists) {
            delete this.objects[id];
            this.objects = { ...this.objects };
        }
    }

    private loadObjects() {
        for (let key in this.objects) {
            const o = this.objects[key];

            switch (o.type) {
                case 'rectangle':
                    const rectangle = L.rectangle(
                        [
                            [o.latlngs._northEast.lat, o.latlngs._northEast.lng],
                            [o.latlngs._southWest.lat, o.latlngs._southWest.lng],
                        ],
                        {
                            color: o.borderColor,
                            fillColor: o.fillColor,
                            opacity: o.borderOpacity,
                            fillOpacity: o.fillOpacity,
                        }
                    ).addTo(this.map);
                    rectangle.id = o.id;
                    rectangle.on('click', (e: any) => {
                        this.onRectangleClick(e);
                    });
                    if (o.label) {
                        rectangle.bindTooltip(o.label, {
                            direction: 'center',
                        });
                    }
                    break;
                case 'circle':
                    const circle = L.circle([o.latlngs.lat, o.latlngs.lng], {
                        radius: o.radius,
                        color: o.borderColor,
                        fillColor: o.fillColor,
                        opacity: o.borderOpacity,
                        fillOpacity: o.fillOpacity,
                    }).addTo(this.map);
                    circle.id = o.id;
                    circle.on('click', (e: any) => {
                        this.onCircleClick(e);
                    });
                    if (o.label) {
                        circle.bindTooltip(o.label, {
                            direction: 'center',
                        });
                    }
                    break;
                case 'polygon':
                    const polygon = L.polygon(o.latlngs, {
                        color: o.borderColor,
                        fillColor: o.fillColor,
                        opacity: o.borderOpacity,
                        fillOpacity: o.fillOpacity,
                    }).addTo(this.map);
                    polygon.id = o.id;
                    polygon.on('click', (e: any) => {
                        this.onPolygonClick(e);
                    });
                    if (o.label) {
                        polygon.bindTooltip(o.label, {
                            direction: 'center',
                        });
                    }
                    break;
                case 'polyline':
                    const polyline = L.polyline(o.latlngs, {
                        color: o.borderColor,
                        fillColor: o.fillColor,
                        opacity: o.borderOpacity,
                        fillOpacity: o.fillOpacity,
                    }).addTo(this.map);
                    polyline.id = o.id;
                    polyline.on('click', (e: any) => {
                        this.onPolylineClick(e);
                    });
                    if (o.label) {
                        polyline.bindTooltip(o.label, {
                            direction: 'center',
                        });
                    }
                    break;
                default:
                    break;
            }
        }
    }

    private getOpacity(hex) {
        const a = parseInt(hex.substring(6, 8), 16);
        return Math.round((a / 255) * 100);
    }

    private deleteSelectedObject() {
        if (this.editObject) {
            this.map?.removeLayer(this.editObject);
            this.deleteObject(this.editObject.id);
            this.clearEditObject();
        }
    }
}
