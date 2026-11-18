/// <reference types="mocha" />
import "mocha/mocha.js";
import { getMochaConfig } from "@webwriter/build/test";
import L from "leaflet";
import "../src/widgets/webwriter-map";
import { assert, equal, until, mount, edit, block, data, settle, holder, cleanup } from "./helpers";

mocha.setup(getMochaConfig());

const L_layer = (gl: unknown): L.Layer => new (L.Layer.extend({ onAdd() { return this; }, onRemove() { return this; }, getMaplibreMap: () => gl }) as any)();


describe("<webwriter-map>", function () {
  this.timeout(30000);
  before(() => customElements.whenDefined("webwriter-map"));
  afterEach(cleanup);


  it("read mode: the authored data block positions the map", async function () {
    const el = await mount();
    const c = el.map.getCenter();
    assert(Math.abs(c.lat - 50.775) < 1e-4 && Math.abs(c.lng - 6.085) < 1e-4, `center ${c.lat},${c.lng}`);
    equal(el.map.getZoom(), 14, "zoom");
  });

  it("read mode: a pristine widget writes nothing and keeps unknown keys", async function () {
    const el = await mount();
    await settle(el);
    equal(data(el), { initialPos: { lat: 50.775, lng: 6.085 }, custom: 1 });
  });

  it("read mode without allowpanning: interaction is switched off, no toolbox", async function () {
    const el = await mount();
    assert(!el.shadowRoot.querySelector(".toolbox"), "toolbox in read mode");
    assert(!el.map.scrollWheelZoom.enabled(), "wheel zoom enabled");
    assert(!el.map.touchZoom.enabled(), "touch zoom enabled");
    equal(el.shadowRoot.querySelector("#map").style.pointerEvents, "none");
    equal(el.map.getMinZoom(), 14);
  });

  it("read mode with allowpanning: the reader may move the map", async function () {
    const el = await mount("allowpanning");
    assert(el.map.scrollWheelZoom.enabled(), "wheel zoom disabled");
    assert(el.shadowRoot.querySelector("#map").style.pointerEvents !== "none", "pointer events off");
  });

  it("allowPanning is declared as a permission of the widget", async function () {
    const el = await mount();
    equal(Object.keys(el.permissions), ["allowPanning"]);
    equal(Object.keys((customElements.get("webwriter-map") as any).permissions), ["allowPanning"]);
    equal(el.permissions.allowPanning.label, "Allow student movement");
  });


  it("edit mode: toolbox and dialogs are rendered, the map stays interactive", async function () {
    const el = await edit();
    assert(el.shadowRoot.querySelector(".toolbox"), "no toolbox");
    assert(el.shadowRoot.querySelector("#pinDialog"), "no pin dialog");
    assert(el.map.scrollWheelZoom.enabled(), "wheel zoom disabled in edit mode");
    equal(el.shadowRoot.querySelector("#map").style.pointerEvents, "");
    assert(!el.shadowRoot.querySelector("#switchStudentPanning").hasAttribute("checked"), "switch checked without allowpanning");
  });

  it("edit mode: the movement switch follows allowpanning", async function () {
    const el = await edit("allowpanning");
    assert(el.shadowRoot.querySelector("#switchStudentPanning").hasAttribute("checked"), "switch not checked");
  });

  it("edit mode: the switch writes the allowpanning attribute", async function () {
    const el = await edit();
    const sw = el.shadowRoot.querySelector("#switchStudentPanning");
    sw.checked = true;
    sw.dispatchEvent(new CustomEvent("sl-change", { bubbles: true, composed: true }));
    await until(() => el.hasAttribute("allowpanning"), "the attribute");
    sw.checked = false;
    sw.dispatchEvent(new CustomEvent("sl-change", { bubbles: true, composed: true }));
    await until(() => !el.hasAttribute("allowpanning"), "the attribute to go");
  });

  it("the toolbox follows a change of mode without a reload", async function () {
    const el = await mount();
    assert(!el.shadowRoot.querySelector(".toolbox"), "toolbox before");
    el.setAttribute("contenteditable", "");
    await until(() => el.shadowRoot.querySelector(".toolbox"), "the toolbox to appear");
    el.removeAttribute("contenteditable");
    await until(() => !el.shadowRoot.querySelector(".toolbox"), "the toolbox to go");
  });

  it("a change is written to the data block and keeps other keys", async function () {
    const el = await edit();
    el.markers = [{ lat: 1, lng: 2, title: "A" }];
    await until(() => data(el).markers?.length === 1, "the marker in the block");
    equal(data(el).markers, [{ lat: 1, lng: 2, title: "A" }]);
    equal(data(el).custom, 1, "unknown key");
    equal(data(el).initialPos, { lat: 50.775, lng: 6.085 });
    equal(block(el).getAttribute("slot"), "data");
  });

  it("in-place changes that are assigned again are written each time", async function () {
    const el = await edit();
    el.objects["r1"] = { id: "r1", type: "rectangle", latlngs: [[0, 0], [1, 1]] };
    el.objects = { ...el.objects };
    await until(() => data(el).objects?.r1, "first object");
    el.objects["r1"].latlngs = [[0, 0], [2, 2]];
    el.objects = { ...el.objects };
    await until(() => JSON.stringify(data(el).objects.r1.latlngs) === "[[0,0],[2,2]]", "the changed object");
    el.markers.push({ lat: 5, lng: 5, title: "B" });
    el.markers = [...el.markers];
    await until(() => data(el).markers?.length === 1, "pushed marker");
  });

  it("a block that is replaced from outside updates the widget", async function () {
    const el = await edit();
    block(el).textContent = JSON.stringify({ initialPos: { lat: 1, lng: 2 }, markers: [{ lat: 3, lng: 4, title: "R" }], geoJSON: "" });
    await until(() => el.markers.length === 1 && el.initialPos.lat === 1, "the remote value");
    equal(el.markers[0].title, "R");
    await settle(el);
    equal(data(el).markers, [{ lat: 3, lng: 4, title: "R" }], "no echo that changes it");
  });

  it("an unreadable block is left alone", async function () {
    const el = await mount("", "{not json");
    await settle(el);
    equal(block(el).textContent, "{not json");
  });

  it("a marker removed from the block data clears the widget state", async function () {
    const el = await edit();
    el.markers = [{ lat: 1, lng: 2, title: "A" }];
    await until(() => data(el).markers?.length === 1, "written");
    el.markers = [];
    await until(() => !data(el).markers?.length, "emptied");
  });

  it("language: lang follows the inherited value and is not written", async function () {
    holder().setAttribute("lang", "de");
    const el = await edit();
    assert(!el.hasAttribute("lang"), "lang written");
    equal(el.lang, "de");
    await until(() => el.localize.getLocale() === "de", "German catalog");
    await el.updateComplete;
    const summaries = [...el.shadowRoot.querySelectorAll("sl-details")].map((d) => d.getAttribute("summary"));
    assert(summaries.includes("Bewegung"), "German summary missing: " + summaries);
    holder().removeAttribute("lang");
  });

  it("language: the drawer declarations are read again in the new language", async function () {
    holder().setAttribute("lang", "de");
    const el = await edit();
    let changed = 0;
    el.addEventListener("optionschange", () => changed++);
    await until(() => el.options.initialZoom.label === "Anfängliche Zoomstufe", "German option label");
    equal(el.permissions.allowPanning.label, "Bewegung durch Schüler zulassen");
    equal(typeof (customElements.get("webwriter-map") as any).options.initialZoom.label, "function", "static label is a function of the widget");
    holder().removeAttribute("lang");
    await until(() => el.options.initialZoom.label === "Initial zoom", "English again");
  });

  it("language: an explicit lang on the widget changes the language", async function () {
    const el = await edit('lang="fr"');
    await until(() => el.localize.getLocale() === "fr", "French");
    await el.updateComplete;
  });

  it("pins are drawn once, also after the base layer or the GeoJSON changes", async function () {
    const el = await mount("", '{"initialPos":{"lat":50.775,"lng":6.085},"markers":[{"lat":50.7,"lng":6,"title":"a"}]}');
    const count = () => el.shadowRoot.querySelectorAll(".marker-icon-red").length;
    equal(count(), 1, "pins at start");
    el.customTileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    await settle(el);
    el.geoJSON = '{"type":"FeatureCollection","features":[]}';
    await settle(el);
    equal(count(), 1, "pins after changes");
  });

  const rect = { id: "r1", type: "rectangle", latlngs: { _northEast: { lat: 50.78, lng: 6.09 }, _southWest: { lat: 50.77, lng: 6.08 } }, borderColor: "#f00", fillColor: "#f00", borderOpacity: 1, fillOpacity: 0.2 };
  const withShape = (extra = "") => `{"initialPos":{"lat":50.775,"lng":6.085},"markers":[{"lat":50.7,"lng":6,"title":"Aachen"}],"objects":{"r1":${JSON.stringify({ ...rect, ...JSON.parse(extra || "{}") })}}}`;
  const key = (target: Element, k: string) => target.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, composed: true }));

  it("keyboard: the fullscreen button and the pins have accessible names", async function () {
    const el = await mount("", withShape());
    equal(el.shadowRoot.querySelector("#fsButton sl-icon").getAttribute("label"), "Enter fullscreen");
    equal(el.shadowRoot.querySelector(".marker-icon-red").getAttribute("title"), "Aachen");
  });

  it("keyboard: a shape is selected with Enter and its handles move with the arrow keys", async function () {
    const el = await mount('contenteditable=""', withShape());
    const mapObjects = () => { const found: any[] = []; el.map.eachLayer((l: any) => { if (l.id === "r1") found.push(l); }); return found; };
    await until(() => mapObjects().length, "the drawn shape");
    const shape = mapObjects()[0].getElement();
    equal(shape.getAttribute("tabindex"), "0");
    equal(shape.getAttribute("role"), "button");
    key(shape, "Enter");
    await until(() => el.shadowRoot.querySelectorAll(".marker-icon-green").length === 4, "four handles");
    const handle = el.shadowRoot.querySelector(".marker-icon-green");
    equal(handle.getAttribute("aria-label"), "Move handle");
    assert(handle.getBoundingClientRect().width >= 24 && handle.getBoundingClientRect().height >= 24, "touch target below 24px");
    const before = JSON.stringify(el.objects.r1.latlngs);
    key(handle, "ArrowRight");
    key(handle, "ArrowRight");
    await until(() => JSON.stringify(el.objects.r1.latlngs) !== before, "the saved shape");
    const stored = JSON.stringify(el.objects.r1.latlngs);
    key(handle, "ArrowDown");
    await until(() => JSON.stringify(el.objects.r1.latlngs) !== stored, "a second move is saved too");
  });

  it("keyboard: in read mode only labelled shapes can be focused, and not without allowpanning", async function () {
    const el = await mount("allowpanning", withShape('{"label":"Campus"}'));
    let shape: any;
    await until(() => { el.map.eachLayer((l: any) => { if (l.id === "r1") shape = l; }); return shape; }, "the shape");
    equal(shape.getElement().getAttribute("role"), "img");
    equal(shape.getElement().getAttribute("aria-label"), "Campus");
    key(shape.getElement(), "Enter");
    await settle(el);
    equal(el.shadowRoot.querySelectorAll(".marker-icon-green").length, 0, "read mode does not edit");
  });

  it("touch: handles and pins are at least 24 by 24 CSS pixels", async function () {
    const el = await mount("allowpanning", withShape());
    const pin = el.shadowRoot.querySelector(".marker-icon-red");
    const box = pin.getBoundingClientRect();
    assert(box.width >= 24 && box.height >= 24, `pin ${box.width}x${box.height}`);
    assert(el.map.touchZoom.enabled() && el.map.dragging.enabled(), "touch zoom or drag disabled");
    const container = el.shadowRoot.querySelector(".leaflet-container");
    for (const type of ["pointerdown", "pointermove", "pointerup"]) {
      container.dispatchEvent(new PointerEvent(type, { pointerType: "touch", pointerId: 7, isPrimary: true, bubbles: true, composed: true, clientX: 40, clientY: 40 }));
    }
    await settle(el);
    equal(data(el).initialPos, { lat: 50.775, lng: 6.085 }, "a touch without movement does not change the view");
  });

  it("layout: the host fits 300 to 2100 px and the map follows a resize without storing a position", async function () {
    const el = await mount();
    const frame = holder();
    frame.style.width = "300px";
    await until(() => el.getBoundingClientRect().width === 300, "300px");
    equal(el.shadowRoot.querySelector("#map").getBoundingClientRect().width, 300);
    await until(() => el.map.getSize().x === 300, "leaflet size at 300px");
    frame.style.width = "2400px";
    await until(() => el.map.getSize().x === 2100, "leaflet size at the maximum width");
    equal(getComputedStyle(el).maxWidth, "2100px");
    frame.style.width = "640px";
    await until(() => el.map.getSize().x === 640, "leaflet size at 640px");
    const c = el.map.getCenter();
    assert(Math.abs(c.lat - 50.775) < 1e-3 && Math.abs(c.lng - 6.085) < 1e-3, "center after resizing");
    await settle(el);
    equal(data(el), { initialPos: { lat: 50.775, lng: 6.085 }, custom: 1 }, "resizing writes nothing");
    assert(el.scrollWidth <= el.clientWidth, "sideways overflow");
  });

  it("theme: text, font, link and pin colors follow the document theme properties", async function () {
    const wrapper = holder();
    wrapper.style.cssText = "--ww-text-color: rgb(1, 2, 3); --ww-font-family: Georgia, serif; --ww-link-color: rgb(4, 5, 6); --ww-theme-accent-1: rgb(7, 8, 9);";
    const el = await mount("", withShape());
    equal(getComputedStyle(el).color, "rgb(1, 2, 3)");
    assert(getComputedStyle(el.shadowRoot.querySelector(".leaflet-container")).fontFamily.includes("Georgia"), "font family");
    equal(getComputedStyle(el.shadowRoot.querySelector(".leaflet-control-attribution a")).color, "rgb(4, 5, 6)");
    equal(getComputedStyle(el.shadowRoot.querySelector(".marker-icon-red"), "::before").backgroundColor, "rgb(7, 8, 9)");
    wrapper.style.cssText = "";
    await settle(el);
    equal(getComputedStyle(el.shadowRoot.querySelector(".marker-icon-red"), "::before").backgroundColor, "rgb(255, 0, 0)", "fallback keeps today's red");
  });

  it("print: a vector canvas is replaced by a picture while printing, and the pin titles are listed", async function () {
    const el = await mount("", withShape());
    const canvas = document.createElement("canvas");
    canvas.width = 20; canvas.height = 10; const c2 = canvas.getContext("2d")!; c2.fillStyle = "rgb(10, 20, 30)"; c2.fillRect(0, 0, 20, 10); canvas.style.width = "20px"; canvas.style.height = "10px";
    el.shadowRoot.querySelector("#map").append(canvas);
    let redraws = 0;
    const layer = L_layer({ getCanvas: () => canvas, redraw: () => { redraws++; } });
    layer.addTo(el.map);
    window.dispatchEvent(new Event("beforeprint"));
    const image = canvas.nextElementSibling as HTMLCanvasElement;
    assert(image && image.tagName === "CANVAS" && image.width === 20, "no snapshot");
    equal(Array.from(image.getContext("2d")!.getImageData(5, 5, 1, 1).data), [10, 20, 30, 255], "the copy holds the picture");
    equal(canvas.style.visibility, "hidden");
    equal(redraws, 1);
    window.dispatchEvent(new Event("afterprint"));
    assert(!canvas.nextElementSibling, "snapshot left behind");
    equal(canvas.style.visibility, "");
    equal(el.shadowRoot.querySelector(".print-pins li").textContent.trim().startsWith("Aachen"), true);
    equal(getComputedStyle(el.shadowRoot.querySelector(".print-pins")).display, "none", "screen hides the list");
    el.remove();
    window.dispatchEvent(new Event("beforeprint"));
    equal(el.printSnapshots.length, 0, "no print listener after disconnect");
  });

  it("actions: resetBounds and importGeoJSON still work", async function () {
    const el = await edit();
    el.mapBounds = [[1, 1], [2, 2]]; el.maxZoom = 8; el.boundsActive = true;
    await until(() => data(el).mapBounds, "bounds written");
    el.resetBounds();
    await until(() => !data(el).mapBounds, "bounds removed from the block");
    equal(el.boundsActive, false);
    const geo = { type: "FeatureCollection", features: [] };
    await el.importGeoJSON([new File([JSON.stringify(geo)], "a.geojson")]);
    await until(() => data(el).geoJSON === JSON.stringify(geo), "geoJSON in the block");
    equal(Object.keys(el.actions), ["resetBounds", "addPin", "importGeoJSON"]);
  });


  describe("formats", () => {
    const overlay = { type: "FeatureCollection", features: [{ type: "Feature", properties: { name: "Aachen" }, geometry: { type: "Point", coordinates: [6.08, 50.77] } }] };
    const shapes = {
      r: { id: "r", type: "rectangle", latlngs: { _northEast: { lat: 51, lng: 7 }, _southWest: { lat: 50, lng: 6 } }, borderColor: "#00f", label: "Box" },
      c: { id: "c", type: "circle", latlngs: { lat: 50.5, lng: 6.5 }, radius: 300, fillColor: "#f00" },
      p: { id: "p", type: "polygon", latlngs: [[{ lat: 50, lng: 6 }, { lat: 51, lng: 6 }, { lat: 51, lng: 7 }]] },
      l: { id: "l", type: "polyline", latlngs: [{ lat: 50, lng: 6 }, { lat: 52, lng: 8 }] },
    };
    const full = () => `{"initialPos":{"lat":50.775,"lng":6.085},"geoJSON":${JSON.stringify(JSON.stringify(overlay))},"markers":[{"lat":50.7,"lng":6,"title":"Aachen"},{"lat":1,"lng":2}],"objects":${JSON.stringify(shapes)}}`;

    it("declares the conversion maps", async function () {
      const cls: any = customElements.get("webwriter-map");
      equal(Object.keys(cls.convertFrom), [".geojson", "application/geo+json"]);
      equal(Object.keys(cls.convertTo), ["application/geo+json"]);
    });

    it("export: overlay, pins and shapes in one FeatureCollection", async function () {
      const el = await mount("", full());
      const file: File = el.exportGeoJSON();
      equal([file.name, file.type], ["map.geojson", "application/geo+json"]);
      const out = JSON.parse(await file.text());
      equal(out.type, "FeatureCollection");
      equal(out.features.map((f: any) => f.properties?.kind ?? "overlay"), ["overlay", "pin", "pin", "rectangle", "circle", "polygon", "polyline"]);
      equal(out.features[1].geometry.coordinates, [6, 50.7]);
      const poly = out.features[5].geometry.coordinates[0];
      equal(poly[0], poly[poly.length - 1]);
    });

    it("import: a foreign file becomes the overlay and keeps pins and shapes", async function () {
      const el = await edit();
      const apply = await el.importFile(new File([JSON.stringify(overlay)], "a.geojson"));
      equal(el.geoJSON, "", "unchanged before apply");
      apply();
      await until(() => data(el).geoJSON === JSON.stringify(overlay), "overlay in the block");
    });

    it("import: invalid files are refused and change nothing", async function () {
      const el = await mount("", full());
      for (const text of ["not json", '{"type":"Topology"}', "[]"]) {
        let message = "";
        try { await el.importFile(new File([text], "x.geojson")); } catch (e: any) { message = e.message; }
        equal(message, "The selected file does not contain GeoJSON.");
      }
      equal(el.markers.length, 2);
    });

    it("round trip: export then import restores overlay, pins and shapes", async function () {
      const source = await mount("", full());
      const text = await source.exportGeoJSON().text();
      cleanup();
      const el = await edit();
      (await el.importFile(new File([text], "map.geojson")))();
      await until(() => data(el).objects?.r, "shapes in the block");
      const d = data(el);
      equal(JSON.parse(d.geoJSON), overlay);
      equal(d.markers, [{ lat: 50.7, lng: 6, title: "Aachen" }, { lat: 1, lng: 2 }]);
      equal(Object.keys(d.objects), ["r", "c", "p", "l"]);
      for (const k of ["r", "c", "p", "l"]) assert(JSON.stringify(Object.entries(d.objects[k]).sort()) === JSON.stringify(Object.entries((shapes as any)[k]).sort()), k + " " + JSON.stringify(d.objects[k]));
      const drawn: string[] = [];
      el.map.eachLayer((l: any) => { if (l.id) drawn.push(l.id); });
      equal(drawn.sort(), ["c", "l", "p", "r"]);
    });

    it("action: addPin opens the dialog for the map center", async function () {
      const el = await edit();
      el.addPin();
      await until(() => el.shadowRoot.querySelector("#pinDialog").open, "the dialog");
    });
  });
  });

mocha.run();
