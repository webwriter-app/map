import type { DrawnObject, Pin, Point } from './map-data';

type Position = [number, number];
type Geometry = { type: string; coordinates?: unknown; geometries?: Geometry[] };
export type GeoFeature = { type: 'Feature'; geometry: Geometry | null; properties: Record<string, unknown> | null; id?: string | number };

const GEOMETRY_TYPES = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'];
const STYLE_KEYS = ['borderColor', 'fillColor', 'borderOpacity', 'fillOpacity', 'label'] as const;

const toPosition = (p: Point): Position => [p.lng, p.lat];
const fromPosition = (p: Position): Point => ({ lat: p[1], lng: p[0] });
const isPosition = (p: unknown): p is Position => Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number';
const isRing = (r: unknown): r is Position[] => Array.isArray(r) && r.length > 0 && r.every(isPosition);
const closeRing = (ring: Position[]): Position[] => (ring.length && ring.at(0)!.join() !== ring.at(-1)!.join() ? [...ring, ring[0]] : ring);
const openRing = (ring: Position[]): Position[] => (ring.length > 1 && ring.at(0)!.join() === ring.at(-1)!.join() ? ring.slice(0, -1) : ring);

/** The features of a GeoJSON text, or `undefined` when the text is not GeoJSON. Bare geometries are wrapped. */
export function readFeatures(text: string): GeoFeature[] | undefined {
    let parsed: any;
    try {
        parsed = JSON.parse(text);
    } catch {
        return undefined;
    }
    if (!parsed || typeof parsed !== 'object') return undefined;
    if (parsed.type === 'FeatureCollection') return Array.isArray(parsed.features) && parsed.features.every((f: any) => f?.type === 'Feature') ? parsed.features : undefined;
    if (parsed.type === 'Feature') return [parsed];
    if (parsed.type === 'GeometryCollection' || GEOMETRY_TYPES.includes(parsed.type)) return [{ type: 'Feature', geometry: parsed, properties: null }];
    return undefined;
}

const style = (o: DrawnObject) => Object.fromEntries(STYLE_KEYS.filter((key) => o[key] !== undefined && o[key] !== '').map((key) => [key, o[key]]));

/** One feature per stored drawing. A circle is a point with a radius in meters. */
function objectFeature(o: DrawnObject): GeoFeature | undefined {
    const properties = { kind: o.type, id: o.id, ...style(o) };
    if (o.type === 'rectangle') {
        const { _northEast: ne, _southWest: sw } = o.latlngs;
        const ring: Position[] = [[sw.lng, sw.lat], [ne.lng, sw.lat], [ne.lng, ne.lat], [sw.lng, ne.lat], [sw.lng, sw.lat]];
        return { type: 'Feature', properties, geometry: { type: 'Polygon', coordinates: [ring] } };
    }
    if (o.type === 'circle') return { type: 'Feature', properties: { ...properties, radius: o.radius }, geometry: { type: 'Point', coordinates: toPosition(o.latlngs) } };
    if (o.type === 'polygon') {
        const rings = (o.latlngs as unknown as Point[][]).map((ring) => closeRing(ring.map(toPosition)));
        return { type: 'Feature', properties, geometry: { type: 'Polygon', coordinates: rings } };
    }
    if (o.type === 'polyline') {
        const lines = o.latlngs as unknown as (Point | Point[])[];
        if (lines.every((l) => !Array.isArray(l))) return { type: 'Feature', properties, geometry: { type: 'LineString', coordinates: (lines as Point[]).map(toPosition) } };
        return { type: 'Feature', properties, geometry: { type: 'MultiLineString', coordinates: (lines as Point[][]).map((line) => line.map(toPosition)) } };
    }
    return undefined;
}

/** A FeatureCollection of the overlay, the pins and the drawings of the map. */
export function exportFeatures(overlay: string, pins: Pin[], objects: Record<string, DrawnObject>): string {
    const features: GeoFeature[] = [
        ...(overlay ? readFeatures(overlay) ?? [] : []),
        ...pins.map<GeoFeature>((pin) => ({ type: 'Feature', properties: { kind: 'pin', ...(pin.title ? { title: pin.title } : {}) }, geometry: { type: 'Point', coordinates: toPosition(pin) } })),
        ...Object.values(objects).map(objectFeature).filter((f): f is GeoFeature => !!f),
    ];
    return JSON.stringify({ type: 'FeatureCollection', features }, null, 2);
}

/** The drawing that a feature of this widget's own export stands for. Other features stay in the overlay. */
function objectOf(feature: GeoFeature): DrawnObject | undefined {
    const properties = feature.properties ?? {};
    const geometry = feature.geometry;
    if (!geometry || typeof properties.kind !== 'string') return undefined;
    const coordinates = geometry.coordinates;
    const kept = Object.fromEntries(STYLE_KEYS.filter((key) => properties[key] !== undefined).map((key) => [key, properties[key]]));
    const id = typeof properties.id === 'string' && properties.id ? properties.id : crypto.randomUUID();
    const base = { id, ...kept } as { id: string };
    if (properties.kind === 'rectangle' && geometry.type === 'Polygon' && Array.isArray(coordinates) && isRing(coordinates[0])) {
        const lats = coordinates[0].map((p) => p[1]);
        const lngs = coordinates[0].map((p) => p[0]);
        return { ...base, type: 'rectangle', latlngs: { _northEast: { lat: Math.max(...lats), lng: Math.max(...lngs) }, _southWest: { lat: Math.min(...lats), lng: Math.min(...lngs) } } };
    }
    if (properties.kind === 'circle' && geometry.type === 'Point' && isPosition(coordinates) && typeof properties.radius === 'number') {
        return { ...base, type: 'circle', latlngs: fromPosition(coordinates), radius: properties.radius };
    }
    if (properties.kind === 'polygon' && geometry.type === 'Polygon' && Array.isArray(coordinates) && coordinates.every(isRing)) {
        return { ...base, type: 'polygon', latlngs: (coordinates as Position[][]).map((ring) => openRing(ring).map(fromPosition)) as unknown as DrawnObject['latlngs'] } as DrawnObject;
    }
    if (properties.kind === 'polyline' && geometry.type === 'LineString' && isRing(coordinates)) {
        return { ...base, type: 'polyline', latlngs: coordinates.map(fromPosition) as unknown as DrawnObject['latlngs'] } as DrawnObject;
    }
    if (properties.kind === 'polyline' && geometry.type === 'MultiLineString' && Array.isArray(coordinates) && coordinates.every(isRing)) {
        return { ...base, type: 'polyline', latlngs: (coordinates as Position[][]).map((line) => line.map(fromPosition)) as unknown as DrawnObject['latlngs'] } as DrawnObject;
    }
    return undefined;
}

export interface ImportedMap {
    /** The GeoJSON overlay as a text, or an empty text when nothing is left for it. */
    overlay: string;
    /** Set only when the file holds pins of this widget's own export. */
    pins?: Pin[];
    /** Set only when the file holds drawings of this widget's own export. */
    objects?: Record<string, DrawnObject>;
}

/** Splits a GeoJSON text into pins and drawings (this widget's own export) and an overlay (everything else). */
export function importFeatures(text: string): ImportedMap | undefined {
    const features = readFeatures(text);
    if (!features) return undefined;
    const pins: Pin[] = [];
    const objects: Record<string, DrawnObject> = {};
    const overlay: GeoFeature[] = [];
    for (const feature of features) {
        const position = feature.geometry?.type === 'Point' ? feature.geometry.coordinates : undefined;
        if (feature.properties?.kind === 'pin' && isPosition(position)) {
            const title = feature.properties.title;
            pins.push({ ...fromPosition(position), ...(typeof title === 'string' ? { title } : {}) });
            continue;
        }
        const object = objectOf(feature);
        if (object) objects[object.id] = object;
        else overlay.push(feature);
    }
    return {
        overlay: overlay.length === features.length ? JSON.stringify(JSON.parse(text)) : overlay.length ? JSON.stringify({ type: 'FeatureCollection', features: overlay }) : '',
        ...(pins.length ? { pins } : {}),
        ...(Object.keys(objects).length ? { objects } : {}),
    };
}
