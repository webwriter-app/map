import { css } from 'lit';

export const style = css`

    :host{
        display: block;
        /* overflow: hidden */
    }

    .toolbox > * {
        margin-bottom: 1em;
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
        width: 20px !important;
        height: 20px !important;
    }

    .marker-icon::before {
        content: '';
        position: absolute;
        inset: 0;

        border-bottom-left-radius: 50%;
        border-top-left-radius: 50%;
        border-top-right-radius: 50%;

        rotate: 45deg;
    }

    .marker-icon::after {
        content: '';
        position: absolute;
        inset: 6px;
        border-radius: 50%;
        background-color: white;
    }

    .marker-icon.marker-icon-red::before {
        background-color: red;
    }

    .marker-icon.marker-icon-green::before {
        background-color: green;
    }

    .marker-icon.marker-icon-blue::before {
        background-color: blue;
    }

    .marker-icon.marker-icon-yellow::before {
        background-color: yellow;
    }

    .mouse-marker-icon {
        width: 1.5em;
        height: 1.5em;
        background-color: blue;
    }

    #overlay{
        position: relative; 
        display: block; 
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
`;
