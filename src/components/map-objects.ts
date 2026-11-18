import L from 'leaflet';
import type { DrawLayer, DrawnObject, Point } from '../model/map-data';

/** Creates the Leaflet layer of a stored drawing, or nothing for an unknown type. */
export function drawObject(o: DrawnObject): DrawLayer | undefined {
    const style = { color: o.borderColor, fillColor: o.fillColor, opacity: o.borderOpacity, fillOpacity: o.fillOpacity };
    switch (o.type) {
        case 'rectangle':
            return L.rectangle(
                [
                    [o.latlngs._northEast.lat, o.latlngs._northEast.lng],
                    [o.latlngs._southWest.lat, o.latlngs._southWest.lng],
                ],
                style
            );
        case 'circle':
            return L.circle([o.latlngs.lat, o.latlngs.lng], { radius: o.radius, ...style });
        case 'polygon':
            return L.polygon(o.latlngs as L.LatLngExpression[][], style);
        case 'polyline':
            return L.polyline(o.latlngs as L.LatLngExpression[], style) as L.Polyline;
        default:
            return undefined;
    }
}

/** The stored form of a drawn layer. */
export function storeObject(o: DrawLayer, id: string): DrawnObject {
    const style = {
        borderColor: o.options.color,
        fillColor: o.options.fillColor,
        borderOpacity: o.options.opacity,
        fillOpacity: o.options.fillOpacity,
        label: '',
    };
    if (o instanceof L.Rectangle) return { id, type: 'rectangle', latlngs: o.getBounds() as unknown as { _northEast: Point; _southWest: Point }, ...style };
    if (o instanceof L.Circle) return { id, type: 'circle', latlngs: o.getLatLng(), radius: o.getRadius(), ...style };
    return { id, type: o instanceof L.Polygon ? 'polygon' : 'polyline', latlngs: o.getLatLngs(), ...style };
}

/** Lets Enter or Space on a drawn shape act as a click while the author edits, and shows its label on focus. */
export function bindShapeKeys(layer: DrawLayer, editing: () => boolean) {
    const element = layer.getElement() as SVGElement | undefined;
    element?.addEventListener('keydown', (event: KeyboardEvent) => {
        if ((event.key !== 'Enter' && event.key !== ' ') || !editing()) return;
        event.preventDefault();
        event.stopPropagation();
        layer.fire('click', { originalEvent: event });
    });
    element?.addEventListener('focus', () => layer.openTooltip());
    element?.addEventListener('blur', () => layer.closeTooltip());
}

/** Makes a drawn shape a tab stop with a name, or takes that away again. */
export function setShapeAccess(element: Element, focusable: boolean, editing: boolean, label: string) {
    if (focusable) {
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', editing ? 'button' : 'img');
        element.setAttribute('aria-label', label);
    } else {
        for (const name of ['tabindex', 'role', 'aria-label']) element.removeAttribute(name);
    }
}
