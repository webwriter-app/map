import type L from 'leaflet';

export interface Pin {
    lat: number;
    lng: number;
    title?: string;
}

export interface Point {
    lat: number;
    lng: number;
}

export type Polylines = ReturnType<L.Polyline['getLatLngs']>;

/** A drawn object as stored in the data block. Leaflet serializes bounds as `_northEast` and `_southWest`. */
export type DrawnObject = {
    id: string;
    borderColor?: string;
    fillColor?: string;
    borderOpacity?: number;
    fillOpacity?: number;
    label?: string;
} & (
    | { type: 'rectangle'; latlngs: { _northEast: Point; _southWest: Point } }
    | { type: 'circle'; latlngs: Point; radius: number }
    | { type: 'polygon' | 'polyline'; latlngs: Polylines }
);

export type WithId<T> = T & { id?: string };
export type DrawLayer = WithId<L.Rectangle | L.Circle | L.Polygon | L.Polyline>;

export interface RasterTiles {
    name: string;
    url: string;
    attribution: string;
    maxZoom: number;
    userSelect?: boolean;
}

export interface VectorTiles {
    name: string;
    url: string;
    maxZoom: number;
}

export const RASTER_TILES: RasterTiles[] = [
    {
        name: 'OpenStreetMap',
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        userSelect: true,
    },
    {
        name: 'OpenStreetMapDE',
        url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
    },
    {
        name: 'OpenTopoMap',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a> contributors',
        maxZoom: 17,
        userSelect: true,
    },
    {
        name: 'WorldImagery',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a> contributors',
        maxZoom: 18,
        userSelect: true,
    },
];

export const VECTOR_TILES: VectorTiles[] = [
    {
        name: 'OFM Liberty',
        url: 'https://tiles.openfreemap.org/styles/liberty',
        maxZoom: 20,
    },
    {
        name: 'OFM Bright',
        url: 'https://tiles.openfreemap.org/styles/bright',
        maxZoom: 20,
    },
    {
        name: 'OFM Positron',
        url: 'https://tiles.openfreemap.org/styles/positron',
        maxZoom: 20,
    },
    {
        name: 'OFM Dark',
        url: 'https://tiles.openfreemap.org/styles/dark',
        maxZoom: 20,
    },
    {
        name: 'OFM Fiord',
        url: 'https://tiles.openfreemap.org/styles/fiord',
        maxZoom: 20,
    },
];

/**
 * A copy of a JSON value. The handlers change markers and objects in place before they assign them again,
 * so the widget's state must not be the object that the data helper holds.
 */
export const copy = <T,>(value: T): T => (value === undefined ? value : JSON.parse(JSON.stringify(value)));

/** The highest zoom level that the selected base layer supports. */
export const defaultMaxZoom = (vectorStyle: string | undefined, customTileUrl: string | undefined): number =>
    VECTOR_TILES.find((s) => s.url === vectorStyle)?.maxZoom ?? RASTER_TILES.find((t) => t.url === customTileUrl)?.maxZoom ?? 20;

