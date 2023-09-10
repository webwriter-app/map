import { css } from 'lit';

export const style = css`
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

    sl-button::part(base) {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
`;
