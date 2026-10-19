// What the globe scene and its 2D poster share: the two cities, the timing,
// the framing and the dot decoding. No three.js here, so the poster stays light.

export const CITIES = [
  { key: "lisbon", name: "Lisbon", lat: 38.72, lon: -9.14, coords: "38.72°N · 9.14°W" },
  { key: "madrid", name: "Madrid", lat: 40.42, lon: -3.7, coords: "40.42°N · 3.70°W" },
] as const;

/** The point that faces the camera once settled: Iberia, a little east of the route's middle. */
export const FOCUS = { lat: 39.9, lon: -5.4 };

export const SETTLE_S = 5.2; // the turn in from the east, easing onto Iberia
export const ARC_S = 1.4; // the arc drawing from Lisbon to Madrid
export const LIGHT_S = 3.4; // one pass of the light along the arc

export const view = {
  fov: 30,
  /** Close enough that the 503 km arc reads; off-centre so the limb and halo show. */
  frame(aspect: number) {
    return aspect >= 1.1
      ? { dist: 1.86, ox: 0.42, oy: 0.02 }
      : { dist: 2.05, ox: -0.07, oy: 0.1 };
  },
};

export function toVec(lat: number, lon: number, r: number) {
  const p = (lat * Math.PI) / 180, l = (lon * Math.PI) / 180;
  return { x: r * Math.cos(p) * Math.sin(l), y: r * Math.sin(p), z: r * Math.cos(p) * Math.cos(l) };
}

export function unpack(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const a = new Int16Array(bytes.buffer);
  const out: { lat: number; lon: number }[] = [];
  for (let i = 0; i < a.length; i += 2) out.push({ lat: a[i] / 100, lon: a[i + 1] / 100 });
  return out;
}
