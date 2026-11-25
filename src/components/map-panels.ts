import { html } from 'lit';
import type { MsgFn } from '@lit/localize';
import type SlInput from '@shoelace-style/shoelace/dist/components/input/input.component.js';
import type SlRadioGroup from '@shoelace-style/shoelace/dist/components/radio-group/radio-group.component.js';
import type SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.component.js';
import squareMinus from '@tabler/icons/outline/square-minus.svg';
import squarePlus from '@tabler/icons/outline/square-plus.svg';
import { RASTER_TILES, VECTOR_TILES } from '../model/map-data';

/** The settings of the map widget that the toolbox changes. */
export interface ToolboxHost {
    msg: MsgFn;
    allowPanning: boolean | undefined;
    vectorStyle: string | undefined;
    customTileUrl: string | undefined;
    geoJSON: string;
}

/** The author's toolbox above the map. */
export function mapToolbox(host: ToolboxHost) {
    return html`
        <div class="toolbox">
            <sl-details summary=${host.msg('Movement')} class="custom-icons">
                <sl-icon slot="expand-icon" src=${squarePlus}></sl-icon>
                <sl-icon slot="collapse-icon" src=${squareMinus}></sl-icon>
                <sl-switch id="switchStudentPanning" size="small" @sl-change=${(e: Event)=>{host.allowPanning = (e.target as SlSwitch).checked}}>${host.msg('Allow student movement')}</sl-switch>
            </sl-details>
            <sl-details summary=${host.msg('Advanced')} class="custom-icons">
                <sl-icon slot="expand-icon" src=${squarePlus}></sl-icon>
                <sl-icon slot="collapse-icon" src=${squareMinus}></sl-icon>

                <sl-radio-group
                    label=${host.msg('Map style')}
                    value=${host.vectorStyle ?? (host.customTileUrl || 'user-select')}
                    @sl-change=${(e: Event) => {
                        const v = (e.target as SlRadioGroup).value;
                        if (v === 'user-select') {
                            host.customTileUrl = undefined;
                            host.vectorStyle = undefined;
                        } else if (VECTOR_TILES.some(s => s.url === v)) {
                            host.customTileUrl = '';
                            host.vectorStyle = v;
                        } else {
                            host.vectorStyle = undefined;
                            host.customTileUrl = v;
                        }
                    }}
                >
                    <sl-radio value="user-select">${host.msg('User select')}</sl-radio>
                    <sl-menu-label>${host.msg('OpenFreeMap vector tiles')}</sl-menu-label>
                    ${VECTOR_TILES.map(s => html`<sl-radio value=${s.url}>${s.name}</sl-radio>`)}
                    <sl-menu-label>${host.msg('Raster tiles')}</sl-menu-label>
                    ${RASTER_TILES.map(t => html`<sl-radio value=${t.url}>${t.name}</sl-radio>`)}
                </sl-radio-group>
                <sl-input
                    label=${host.msg('Custom Tile Url')}
                    value=${host.customTileUrl}
                    @sl-change=${(e: Event) => {
                        host.vectorStyle = undefined;
                        host.customTileUrl = (e.target as SlInput).value;
                    }}
                ></sl-input>
                <sl-input
                    label="GeoJSON"
                    value=${host.geoJSON}
                    @sl-change=${(e: Event) => {
                        host.geoJSON = (e.target as SlInput).value;
                    }}
                ></sl-input>
            </sl-details>
        </div>
    `;
}

/** The dialog that asks for the text of a new pin. */
export function pinDialog(msg: MsgFn, pinTitle: string, onTitle: (title: string) => void, onAdd: () => void) {
    return html`<sl-dialog id="pinDialog">
        <div slot="label">
            ${msg('Add Pin')}
            <div class="marker-icon marker-icon-red" style="position: relative"></div>
        </div>
        <sl-input
            autofocus
            placeholder=${msg('Text')}
            value=${pinTitle}
            @sl-change=${(e: Event) => {
                onTitle((e.target as SlInput).value);
            }}
        ></sl-input>
        <sl-button
            slot="footer"
            variant="primary"
            @click=${() => {
                onAdd();
            }}
            >${msg('Add')}</sl-button
        >
    </sl-dialog>`;
}
