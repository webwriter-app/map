import L from 'leaflet';
import { icons } from './icons';
import type { WithId } from '../model/map-data';

const handle = (map: L.Map, latlng: L.LatLngExpression) => L.marker(latlng, { draggable: true, icon: icons.GREEN }).addTo(map);

/** Adds draggable corner handles to a rectangle and returns them. `save` runs after a handle was dropped. */
export function rectangleHandles(map: L.Map, rectangle: WithId<L.Rectangle>, save: () => void): L.Marker[] {
    const bounds = rectangle.getBounds();
    const markerTL = handle(map, bounds.getNorthWest());
    const markerTR = handle(map, bounds.getNorthEast());
    const markerBL = handle(map, bounds.getSouthWest());
    const markerBR = handle(map, bounds.getSouthEast());

    markerTL.on('drag', (e: L.LeafletEvent) => {
        rectangle.setBounds(L.latLngBounds((e.target as L.Marker).getLatLng(), markerBR.getLatLng()));

        markerTR.setLatLng(rectangle.getBounds().getNorthEast());
        markerBL.setLatLng(rectangle.getBounds().getSouthWest());
        markerBR.setLatLng(rectangle.getBounds().getSouthEast());
    });
    markerTL.once('dragend', save);
    markerTR.on('drag', (e: L.LeafletEvent) => {
        const dragged = (e.target as L.Marker).getLatLng();
        rectangle.setBounds(
            L.latLngBounds([dragged.lat, markerTL.getLatLng().lng], [markerBL.getLatLng().lat, dragged.lng])
        );

        markerTL.setLatLng(rectangle.getBounds().getNorthWest());
        markerBL.setLatLng(rectangle.getBounds().getSouthWest());
        markerBR.setLatLng(rectangle.getBounds().getSouthEast());
    });
    markerTR.once('dragend', save);
    markerBL.on('drag', (e: L.LeafletEvent) => {
        const dragged = (e.target as L.Marker).getLatLng();
        rectangle.setBounds(
            L.latLngBounds([markerTL.getLatLng().lat, dragged.lng], [dragged.lat, markerBR.getLatLng().lng])
        );

        markerTL.setLatLng(rectangle.getBounds().getNorthWest());
        markerTR.setLatLng(rectangle.getBounds().getNorthEast());
        markerBR.setLatLng(rectangle.getBounds().getSouthEast());
    });
    markerBL.once('dragend', save);
    markerBR.on('drag', (e: L.LeafletEvent) => {
        rectangle.setBounds(L.latLngBounds(markerTL.getLatLng(), (e.target as L.Marker).getLatLng()));

        markerTL.setLatLng(rectangle.getBounds().getNorthWest());
        markerTR.setLatLng(rectangle.getBounds().getNorthEast());
        markerBL.setLatLng(rectangle.getBounds().getSouthWest());
    });
    markerBR.once('dragend', save);

    return [markerTL, markerTR, markerBL, markerBR];
}

/** Adds draggable center and radius handles to a circle and returns them. */
export function circleHandles(map: L.Map, circle: WithId<L.Circle>, save: () => void): L.Marker[] {
    const radiusHandle = (): L.LatLngTuple => {
        const bounds = circle.getBounds();
        return [
            bounds.getNorthEast().lat,
            bounds.getNorthWest().lng + Math.abs(bounds.getNorthEast().lng - bounds.getNorthWest().lng) / 2,
        ];
    };
    const markerCenter = handle(map, circle.getLatLng());
    const markerRadius = handle(map, radiusHandle());

    markerCenter.on('drag', (e: L.LeafletEvent) => {
        circle.setLatLng((e.target as L.Marker).getLatLng());
        markerRadius.setLatLng(radiusHandle());
    });
    markerCenter.once('dragend', save);

    markerRadius.on('drag', (e: L.LeafletEvent) => {
        circle.setRadius((e.target as L.Marker).getLatLng().distanceTo(markerCenter.getLatLng()));
        markerCenter.setLatLng(circle.getLatLng());
    });
    markerRadius.once('dragend', save);

    return [markerCenter, markerRadius];
}

/** Adds one draggable handle per vertex of a polygon and returns them. */
export function polygonHandles(map: L.Map, polygon: WithId<L.Polygon>, save: () => void): L.Marker[] {
    const markers: L.Marker[] = [];
    (polygon.getLatLngs()[0] as L.LatLng[]).forEach((point) => {
        const marker = handle(map, point);
        markers.push(marker);

        marker.on('drag', (e: L.LeafletEvent) => {
            const index = markers.indexOf(e.target as L.Marker);
            const latlngs = polygon.getLatLngs() as L.LatLng[][];
            latlngs[0][index] = (e.target as L.Marker).getLatLng();
            polygon.setLatLngs(latlngs);
        });

        marker.once('dragend', save);
    });
    return markers;
}

/** Adds one draggable handle per vertex of a polyline and returns them. */
export function polylineHandles(map: L.Map, polyline: WithId<L.Polyline>, save: () => void): L.Marker[] {
    const markers: L.Marker[] = [];
    (polyline.getLatLngs() as L.LatLng[]).forEach((point) => {
        const marker = handle(map, point);
        markers.push(marker);

        marker.on('drag', (e: L.LeafletEvent) => {
            const index = markers.indexOf(e.target as L.Marker);
            const latlngs = polyline.getLatLngs() as L.LatLng[];
            latlngs[index] = (e.target as L.Marker).getLatLng();
            polyline.setLatLngs(latlngs);
        });

        marker.once('dragend', save);
    });
    return markers;
}
