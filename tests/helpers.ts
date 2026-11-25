
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const until = async (fn: () => unknown, what: string, ms = 20000) => {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    try { if (await fn()) return; } catch {}
    await wait(30);
  }
  throw new Error("timed out waiting for " + what);
};

export const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

export const equal = (a: unknown, b: unknown, message = "") =>
  assert(JSON.stringify(a) === JSON.stringify(b), `${message} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);

export const holder = () => {
  let element = document.getElementById("mount");
  if (!element) {
    element = document.createElement("div");
    element.id = "mount";
    document.body.append(element);
  }
  return element;
};

export const mount = async (attrs = "", block = '{"initialPos":{"lat":50.775,"lng":6.085},"custom":1}') => {
  document.designMode = attrs.includes("contenteditable") ? "on" : "off";
  holder().innerHTML = `<webwriter-map initialzoom="14" ${attrs}><script type="application/json" slot="data">${block}<\/script></webwriter-map>`;
  const el: any = holder().firstElementChild;
  await until(() => el.map && el.shadowRoot?.querySelector("#map"), "the leaflet map");
  await el.updateComplete;
  return el;
};

export const edit = (attrs = "") => mount(`contenteditable="" ${attrs}`);

export const block = (el: Element) =>
  el.querySelector(':scope > script[type="application/json"][slot="data"]') as HTMLScriptElement;

export const data = (el: Element) => JSON.parse(block(el).textContent!);

export const settle = async (el: any) => {
  await el.updateComplete; await wait(0); await el.updateComplete; await wait(0);
};

export const cleanup = () => {
  document.designMode = "off";
  holder().remove();
};
