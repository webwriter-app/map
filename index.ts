import { LitElementWw } from '@webwriter/lit';
import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import LOCALIZE from './localization/generated';

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

import L from './leaflet/leaflet.js';
import 'fa-icons';

@customElement('webwriter-map')
@localized()
export class WwMap extends LitElementWw {
    // styles = [leafletStyles];
    styles = [style, leafletStyles];

	localize = LOCALIZE;

    @query('#map')
    accessor mapElement!: HTMLElement;

    @query('#pinDialog')
    accessor pinDialog!: SlDialog;

    @query('#switchStudentPanning')
    accessor switchStudentPanning!: SlSwitch

    @property({ type: Object })
    accessor map: L.Map | undefined;

    @property({ type: Object, attribute: true, reflect: true })
    accessor initialPos: {
        lat: number;
        lng: number;
    } = {
        lat: 51,
        lng: 19,
    };

    @property({ type: Object, attribute: true, reflect: true })
    accessor mapBounds: L.LatLngBoundsExpression;

    @property({ type: Number, attribute: true, reflect: true })
    accessor maxZoom: number;

    @property({ type: Number, attribute: true, reflect: true })
    accessor minZoom: number;

    @property({ type: Number, attribute: true, reflect: true })
    accessor initialZoom = 13;

    @property({ type: Number, attribute: true})
    accessor fixedZoom = 1;

    @property({ type: Array, attribute: true, reflect: true })
    accessor markers = [];

    @property({ type: Object, attribute: true, reflect: true })
    accessor objects = {};

    @property({ type: String, attribute: true, reflect: true })
    accessor customTileUrl = '';

    @property({ type: String, attribute: true, reflect: true })
    accessor geoJSON = '';

    @property({ type: Number, attribute: true, reflect: true })
    accessor mapWidth = 100;

    @property({ type: Number, attribute: true, reflect: true })
    accessor mapHeight = 500;

    @property({ type: Boolean, attribute: true, reflect: true })
    accessor boundsActive = true;

    @property({ type: Number })
    accessor inputLat = 0;

    @property({ type: Number })
    accessor inputLng = 0;

    @property({ type: Number })
    accessor inputZoom = 0;

    @property({ type: String })
    accessor inputBorderColor = '#000000ff';

    @property({ type: String })
    accessor inputFillColor = '#000000ff';

    @property({ type: String })
    accessor inputDrawObjectLabel = '';

    @property({ type: String })
    accessor pinTitle = '';

    @property({ type: String })
    accessor mapMode = 'view';

    @property({ type: Object })
    accessor mouseMarker: L.Marker | undefined;

    @property({ type: Boolean })
    accessor showBounds = false;

    @property({ type: Object })
    accessor showBoundsLayer: L.Rectangle | undefined;

    @property({ type: Object })
    accessor editObject;

    @property({ type: Array })
    accessor editObjectMarkers = [];

    @property({ type: Object })
    accessor layerControl;

    @property({ type: Object })
    accessor drawObject;

    @property({ type: Number })
    accessor heightBuffer;

    @property({ type: Boolean, reflect: true })
    accessor allowPanning;

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

        this.addEventListener("fullscreenchange", () => this.requestUpdate())

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

        this.loadObjects()
        
        if(!this.allowPanning){
            if(!this.hasAttribute("contenteditable")){
                this.map.touchZoom.disable();
                this.map.doubleClickZoom.disable();
                this.map.scrollWheelZoom.disable();
                this.map.boxZoom.disable();
                this.map.keyboard.disable();
                this.mapElement.style.pointerEvents = "none"
                this.fixedZoom = this.initialZoom
            }else{
                this.switchStudentPanning.removeAttribute("checked")  
            }
            
        }else{
            if(this.hasAttribute("contenteditable")){
                this.switchStudentPanning.setAttribute("checked", "")
            }
        }

        
        setInterval(() => {
            this.setInitialPosition()
            if(!this.allowPanning && !this.hasAttribute("contenteditable")){
                this.map.setZoom(this.fixedZoom)
            }
        }, 250);
    }

    private isEditable() {
        return this.contentEditable === 'true' || this.contentEditable === '';
    }

    onMapMove() {
        // this.setInitialPosition()
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
            <div id="map" style=${styleMap({ height: this.mapHeight + 'px', width: this.mapWidth + '%' })}>
                <div id="overlay">
                    <sl-button id="fsButton" size="small" @click=${()=>{
                        if(this.ownerDocument.fullscreenElement === this){
                            this.ownerDocument.exitFullscreen()
                            this.style.setProperty("height", this.heightBuffer+"px")
                            this.mapHeight = this.heightBuffer
                        }else{
                            this.heightBuffer = this.mapHeight
                            this.requestFullscreen()
                            this.style.height = "100%"
                            setTimeout(() => {
                                window.dispatchEvent(new Event('resize'));
                                this.mapHeight = this.getBoundingClientRect().height
                            }, 250); 
                        }
                    }}>
                    ${!(this.ownerDocument.fullscreenElement === this)
                    ? 
                    html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M4 15a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2H5a2 2 0 0 1-2-2v-3a1 1 0 0 1 1-1m16 0a1 1 0 0 1 .993.883L21 16v3a2 2 0 0 1-1.85 1.995L19 21h-3a1 1 0 0 1-.117-1.993L16 19h3v-3a1 1 0 0 1 1-1M19 3a2 2 0 0 1 1.995 1.85L21 5v3a1 1 0 0 1-1.993.117L19 8V5h-3a1 1 0 0 1-.117-1.993L16 3zM8 3a1 1 0 0 1 .117 1.993L8 5H5v3a1 1 0 0 1-1.993.117L3 8V5a2 2 0 0 1 1.85-1.995L5 3z"/></g></svg>` 
                    :
                    html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M20 7h-3V4a1 1 0 1 0-2 0v3a2 2 0 0 0 2 2h3a1 1 0 1 0 0-2M7 9a2 2 0 0 0 2-2V4a1 1 0 1 0-2 0v3H4a1 1 0 1 0 0 2zm0 8H4a1 1 0 1 1 0-2h3a2 2 0 0 1 2 2v3a1 1 0 1 1-2 0zm10-2a2 2 0 0 0-2 2v3a1 1 0 1 0 2 0v-3h3a1 1 0 1 0 0-2z"/></g></svg>`}
                    </sl-button> 
                </div>
            </div>
            

            ${this.isEditable() ? this.dialogs() : ''}
        `;
    }

    toolbox() {
        return html`
            <div part="options" class="toolbox">
                <!-- <div class="position">
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
                <sl-button-group label=${msg('Actions')}>
                    <sl-tooltip content=${msg('Add Pin')}>
                        <sl-button
                            @click=${() => {
                                this.pinDialog.show();
                            }}
                            >${faLocationDot}</sl-button
                        >
                    </sl-tooltip>
                    <sl-tooltip content=${msg('Set Position as initial')}>
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
                        ${msg('Bounds')}
                        <i style="font-size:0.5rem"
                            >(${!this.mapBounds ? msg('not set') : this.boundsActive ? msg('activated') : msg('deactivated')})</i
                        >
                    </div>
                    <span name="plus-square" slot="expand-icon">${faSquarePlus}</span>
                    <span name="dash-square" slot="collapse-icon">${faSquareMinus}</span>

                    <sl-button-group label=${msg('Bounds')}>
                        <sl-tooltip content=${msg('Set Top Left')}>
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
                        <sl-tooltip content=${msg('Set Bottom Right')}>
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
                        <sl-tooltip content=${msg('Set Max Zoom')}>
                            <sl-button
                                @click=${() => {
                                    this.maxZoom = this.inputZoom;
                                }}
                                >${faMagnifyingGlassPlus}</sl-button
                            >
                        </sl-tooltip>
                        <sl-tooltip content=${msg('Set Min Zoom')}>
                            <sl-button
                                @click=${() => {
                                    this.minZoom = this.inputZoom;
                                }}
                                >${faMagnifyingGlassMinus}</sl-button
                            >
                        </sl-tooltip>
                    </sl-button-group>
                    <sl-button-group label=${msg('Actions')}>
                        <sl-tooltip content=${msg('Fit Bounds')}>
                            <sl-button
                                @click=${() => {
                                    this.map?.fitBounds(this.mapBounds);
                                }}
                                >${faExpand}</sl-button
                            >
                        </sl-tooltip>
                        <sl-tooltip content=${msg('Visualize Bounds')}>
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
                        <sl-tooltip content=${this.boundsActive ? msg('Disable Bounds') : msg('Enable Bounds')}>
                            <sl-button
                                @click=${() => {
                                    this.boundsActive = !this.boundsActive;
                                }}
                                variant=${!this.boundsActive ? 'primary' : 'default'}
                                >${this.boundsActive ? faBan : faBan}</sl-button
                            >
                        </sl-tooltip>
                        <sl-tooltip content=${msg('Reset Bounds')}>
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
                <sl-details summary=${msg('Draw')} class="custom-icons">
                    <span name="plus-square" slot="expand-icon">${faSquarePlus}</span>
                    <span name="dash-square" slot="collapse-icon">${faSquareMinus}</span>

                    <div>
                        <sl-button-group label=${msg('Draw')}>
                            <sl-tooltip content=${msg('Draw Rectangle')}>
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
                            <sl-tooltip content=${msg('Draw Circle')}>
                                <sl-button
                                    @click=${this.addCircle}
                                    variant=${this.mapMode === 'drawingCircle' || this.mapMode === 'awaitDrawingCircle'
                                        ? 'primary'
                                        : 'default'}
                                >
                                    ${faCircle}
                                </sl-button>
                            </sl-tooltip>
                            <sl-tooltip content=${msg('Draw Polygon')}>
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
                            <sl-tooltip content=${msg('Draw Polyline')}>
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
                        <sl-button-group label=${msg('Delete')}>
                            <sl-tooltip content=${msg('Delete Object')}>
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
                        <span>${msg('Border Color')}</span>
                        <sl-tooltip content=${msg('Border Color')}>
                            <sl-color-picker
                                opacity
                                value=${this.inputBorderColor}
                                @sl-change=${(e: any) => {
                                    this.inputBorderColor = e.target.value;
                                }}
                            >
                                <span slot="label">${msg('Border Color')}</span>
                            </sl-color-picker>
                        </sl-tooltip>
                    </div>
                    <div>
                        <span>${msg('Fill Color')}</span>
                        <sl-tooltip content=${msg('Fill Color')}>
                            <sl-color-picker
                                opacity
                                value=${this.inputFillColor}
                                @sl-change=${(e: any) => {
                                    this.inputFillColor = e.target.value;
                                }}
                            >
                                <span slot="label">${msg('Fill Color')}</span>
                            </sl-color-picker>
                        </sl-tooltip>
                    </div>
                    <div>
                        <sl-input
                            label=${msg('Label')}
                            value=${this.inputDrawObjectLabel}
                            @sl-change=${(e: any) => {
                                this.inputDrawObjectLabel = e.target.value;
                            }}
                        ></sl-input>
                    </div>
                </sl-details>

                <sl-details summary=${msg('Size')} class="custom-icons">
                    <span name="plus-square" slot="expand-icon">${faSquarePlus}</span>
                    <span name="dash-square" slot="collapse-icon">${faSquareMinus}</span>

                    <sl-input
                        label=${msg('Width')}
                        value=${this.mapWidth}
                        @sl-change=${(e: any) => {
                            this.mapWidth = e.target.value;
                        }}
                    >
                        <span slot="suffix">%</span></sl-input
                    >
                    <sl-input
                        label=${msg('Height')}
                        value=${this.mapHeight}
                        @sl-change=${(e: any) => {
                            this.mapHeight = e.target.value;
                        }}
                        ><span slot="suffix">px</span></sl-input
                    >
                </sl-details> -->
                <sl-details summary=${msg('Movement')} class="custom-icons">
                    <span name="plus-square" slot="expand-icon">${faSquarePlus}</span>
                    <span name="dash-square" slot="collapse-icon">${faSquareMinus}</span>
                    <sl-switch id="switchStudentPanning" size="small" @sl-change=${()=>{this.allowPanning = this.switchStudentPanning.checked}}>${msg('Allow student movement')}</sl-switch>
                </sl-details>
                <sl-details summary=${msg('Advanced')} class="custom-icons">
                    <span name="plus-square" slot="expand-icon">${faSquarePlus}</span>
                    <span name="dash-square" slot="collapse-icon">${faSquareMinus}</span>

                    <p style="margin-top:-20px;margin-bottom:-2px; font-size:11.5pt">${msg('Map style')}</p>
                    <sl-tooltip content=${msg('Default')}>
                        <sl-button
                            @click=${() => {
                                this.customTileUrl = undefined;
                            }}
                            >${msg('User select')}</sl-button
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
                    <sl-input
                        label=${msg('Custom Tile Url')}
                        value=${this.customTileUrl}
                        @sl-change=${(e: any) => {
                            this.customTileUrl = e.target.value;
                        }}
                    ></sl-input>
                    <sl-input
                        label="GeoJSON"
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
                ${msg('Add Pin')}
                <div class="marker-icon marker-icon-red" style="position: relative"></div>
            </div>
            <sl-input
                autofocus
                placeholder=${msg('Text')}
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
                >${msg('Add')}</sl-button
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
        this.loadMapPosition()

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
