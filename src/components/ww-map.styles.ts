import { css } from 'lit';

export const style = css`

    :host {
        display: block;
        box-sizing: border-box;
        min-width: min(300px, 100%);
        max-width: 2100px;
        color: var(--ww-text-color, inherit);
        font-family: var(--ww-font-family, inherit);
    }

    :host(:fullscreen) {
        max-width: none;
    }

    #map {
        min-width: min(280px, 100%);
        min-height: 200px;
        max-width: 100%;
    }

    .toolbox > * {
        margin-bottom: 1em;
    }

    .leaflet-container:focus-visible {
        outline: 2px solid var(--ww-theme-accent-1, #0078a8);
        outline-offset: -2px;
    }

    .leaflet-interactive:focus-visible,
    .marker-icon:focus-visible {
        outline: 2px solid #000;
        outline-offset: 2px;
    }

    .print-pins {
        display: none;
    }

    .position {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .position sl-input {
        width: calc(50% - 10px);
    }

    .button-group-toolbar sl-button-group:not(:last-of-type) {
        margin-right: var(--sl-spacing-x-small);
    }

    .marker-icon {
        width: 24px !important;
        height: 24px !important;
    }

    /* The box is 24 px for touch; the drawn pin stays 20 px. */
    .marker-icon::before {
        content: '';
        position: absolute;
        inset: 2px;

        border-bottom-left-radius: 50%;
        border-top-left-radius: 50%;
        border-top-right-radius: 50%;

        rotate: 45deg;
    }

    .marker-icon::after {
        content: '';
        position: absolute;
        inset: 8px;
        border-radius: 50%;
        background-color: white;
    }

    .marker-icon.marker-icon-red::before {
        background-color: var(--ww-theme-accent-1, red);
    }

    .marker-icon.marker-icon-green::before {
        background-color: green;
    }

    #overlay{
        position: relative; 
        display: block; 
    }

    #fsButton sl-icon{
        font-size: 18px;
    }

    #fsButton{
        pointer-events: auto;
        position: absolute;
        width: 30px;
        top: 80px; 
        left: 12px; 
        z-index: 10000; 
        border: 2px solid rgba(0, 0, 0, 0.2); 
        border-radius: 0.25rem
    }

    sl-button::part(base) {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    sl-dialog {
        z-index: 2000;
    }
    sl-button {
        margin-block: 5px;
        width: 100%;
    }
    sl-button::part(base){
        line-height: normal
    }
    sl-details::part(content) {
        padding-top: 0;
        display: flex;
        flex-direction: column;
        gap: var(--sl-spacing-small);
    }
    sl-menu-label::part(base) {
        padding: var(--sl-spacing-x-small) 0 0 var(--sl-spacing-x-large);
        line-height: var(--sl-line-height-dense);
    }
    sl-menu-label::part(base)::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        background-color: var(--sl-color-primary);
    }

    @media print {
        :host {
            max-width: none;
            break-inside: avoid;
        }
        .toolbox-frame,
        #overlay,
        .leaflet-control-zoom,
        .leaflet-control-layers,
        .marker-icon-green {
            display: none !important;
        }
        #map {
            max-width: 100%;
            break-inside: avoid;
        }
        .marker-icon::before,
        .marker-icon::after {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
        }
        .print-pins {
            display: block;
            margin-block-start: 0.5rem;
            break-inside: avoid;
        }
        .print-pins h3 {
            margin: 0 0 0.25rem;
            font-size: 1rem;
        }
        .print-pins ol {
            margin: 0;
            padding-inline-start: 1.5rem;
        }
        .print-pins small {
            opacity: 0.7;
        }
    }
`;
