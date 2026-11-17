/// <reference types="mocha" />
import "mocha/mocha.js";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-map";
import { assert, equal, until, mount, edit, block, data, settle, holder, cleanup } from "./helpers";

mocha.setup(getMochaConfig());

describe("<webwriter-map>", function () {
  this.timeout(30000);
  before(() => customElements.whenDefined("webwriter-map"));
  afterEach(cleanup);


  it("read mode: the authored data block positions the map", async function () {
    const el = await mount();
    const c = el.map.getCenter();
    assert(Math.abs(c.lat - 50.775) < 1e-6 && Math.abs(c.lng - 6.085) < 1e-6, `center ${c.lat},${c.lng}`);
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
    equal(Object.keys(el.actions), ["resetBounds", "importGeoJSON"]);
  });

  });

mocha.run();
