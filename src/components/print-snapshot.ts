import type L from 'leaflet';

export interface Snapshot {
    image: HTMLCanvasElement;
    canvas: HTMLCanvasElement;
}

/**
 * A WebGL canvas can print blank, so a vector layer is replaced by a copy of its current view while the page is printed.
 * The map is redrawn and copied in the same task, because a WebGL canvas without a preserved buffer is only readable right after a render,
 * and a 2D canvas needs no asynchronous image decoding before the print dialog takes its picture.
 */
export function freezeVectorLayers(map: L.Map): Snapshot[] {
    const snapshots: Snapshot[] = [];
    map.eachLayer((layer) => {
        const gl = (layer as L.MaplibreGL).getMaplibreMap?.();
        if (!gl) return;
        try {
            const canvas = gl.getCanvas();
            gl.redraw();
            const image = document.createElement('canvas');
            image.width = canvas.width;
            image.height = canvas.height;
            image.className = canvas.className;
            image.style.cssText = canvas.style.cssText;
            image.setAttribute('aria-hidden', 'true');
            image.getContext('2d')!.drawImage(canvas, 0, 0);
            canvas.after(image);
            canvas.style.visibility = 'hidden';
            snapshots.push({ image, canvas });
        } catch {
            // A canvas that cannot be read (lost context) prints as it is.
        }
    });
    return snapshots;
}

export function releaseSnapshots(snapshots: Snapshot[]) {
    for (const { image, canvas } of snapshots) {
        image.remove();
        canvas.style.visibility = '';
    }
}
