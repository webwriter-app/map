import L from 'leaflet';
import '@maplibre/maplibre-gl-leaflet';
import { VECTOR_TILES, type RasterTiles } from '../model/map-data';

/** What a base layer needs from the map that shows it. */
export interface BaseLayerHost {
    getMap(): L.Map | undefined;
    /** Applies the maximum zoom of a base layer unless the author constrained it. */
    useLayerMaxZoom(maxZoom: number): void;
}

export function createRasterLayer(tileDef: RasterTiles, host: BaseLayerHost): L.TileLayer {
    const layer = L.tileLayer(tileDef.url, { attribution: tileDef.attribution });
    layer.on('add', () => host.useLayerMaxZoom(tileDef.maxZoom));
    return layer;
}

export function createMaplibreLayer(styleUrl: string, host: BaseLayerHost): L.MaplibreGL {
    const maxZoom = VECTOR_TILES.find((s) => s.url === styleUrl)?.maxZoom ?? 20;
    const layer = L.maplibreGL({ style: styleUrl });
    let attribution: string | null = null;
    layer.on('add', () => {
        host.useLayerMaxZoom(maxZoom);
        const glMap = (layer as L.MaplibreGL).getMaplibreMap();
        if (glMap) {
            glMap.on('styleimagemissing', (e: { id: string }) => {
                if (!glMap.hasImage(e.id)) {
                    glMap.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) });
                }
            });
            if (!attribution) {
                glMap.once('load', () => {
                    attribution = layer.getAttribution?.() ?? null;
                });
            }
        }
    });
    layer.on('remove', () => {
        if (attribution) {
            host.getMap()?.attributionControl?.removeAttribution(attribution);
        }
    });
    return layer;
}
