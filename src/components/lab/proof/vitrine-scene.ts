// The hero: a museum vitrine. A clear glass case with softly rounded edges
// stands on a machined dark plinth; a thin recessed light slot in the plinth
// lights each object from below. The five objects pass, one at a time, into
// the case through its glass, settle above the slot and turn slowly in the
// uplight (the object's own footage, which begins on its still's pose), and
// leave the same way as the next one arrives.
//
// Light (round 6): real light, not a sprite.
//   · the slot: a bevelled channel through the plinth's cap, a diffuser strip
//     glowing inside it, its walls catching that glow;
//   · the glow (round 7): one soft vertical glow rising from the slot,
//     brightest there and fading smoothly to nothing exactly at the bottom of
//     the resting object; it faces the camera and falls to zero at its sides
//     and top, so no outline can be seen at any angle; dithered, no banding;
//   · the object: lit by the same falloff (brightest low, fading upward), its
//     lower edges catching the light as chrome does;
//   · the glass: glints along its lower edges and a soft rising gradient on
//     its faces (transmission-material.ts, uUp*); a faint pool on the floor;
//   · a filmic shoulder: highlights roll off smoothly to white, while the toe
//     stays linear so the page black (#07080a) matches the page exactly.
//
// The glass is the round-4 material: a port of drei's MeshTransmissionMaterial
// (transmission, real wall thickness, clearcoat, dispersion only at grazing
// angles), lit by a soft studio of large softboxes that turns with the sway
// and the pointer. One render target, at full resolution with 4× MSAA: the
// scene without the front glass, which the front glass refracts, so what is
// seen through the glass is as sharp as what is not. It never runs its own
// loop: the page calls render() from gsap.ticker while the stage is on screen.
import {
  AdditiveBlending, BoxGeometry, CanvasTexture, Color, CustomBlending, CustomToneMapping, DoubleSide, ExtrudeGeometry,
  FrontSide, Group, HalfFloatType, LinearSRGBColorSpace, MaxEquation, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, Path,
  PerspectiveCamera, PlaneGeometry, PMREMGenerator, Scene, ShaderChunk, ShaderMaterial, Shape, SRGBColorSpace, Texture,
  TextureLoader, UnsignedByteType, Vector3, WebGLRenderer, WebGLRenderTarget,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { TransmissionMaterial } from "./transmission-material";
import type { Stage } from "./stage-scene";

export type VitrineOptions = {
  objects: string[]; // the stills, with alpha, square, all framed the same
  // Each object's turning footage, alpha-matted and interpolated to 60 fps at
  // its final speed: VP9 with alpha (Chrome, Firefox) and HEVC with alpha
  // (Safari). Its first frame is the still's pose.
  clips: { webm: string; hevc: string }[];
  reduced: boolean;
};

const PAGE = new Color("#07080a");
const RAD = Math.PI / 180;

// The case and the plinth (world units). The case floor is the plinth top.
const FLOOR = -1.5;
const CASE = { w: 3.3, h: 3.4, d: 3.0, r: 0.16 };
const PLINTH = { w: 3.62, d: 3.32, cap: 0.14, reveal: 0.018, body: 0.9, bevel: 0.014 };
const SLOT = { len: 1.56, w: 0.09, z: 0.1, depth: 0.007 }; // the light slot, in the cap: its diffuser sits nearly flush, so it reads from a low view
const REST_Y = FLOOR + CASE.h * 0.5 + 0.12;
// A resting object sits in the clear centre of the case's front face as the
// camera sees it, with margin from every edge, so the glass never distorts it
// (refraction shows only while it glides in and out). Seen from 25° left, the
// front face spans about −0.86 … +2.13 across the screen from the case's
// centre: a 1.5 box shifted 0.4 to the right clears its left edge by 0.5.
const CONTENT = 1.5;
const REST_SHIFT = 0.4;
const SIZE = 3.1; // each object's plane

// The camera: a three-quarter view, from above and from the left.
const ELEV = 17 * RAD;
const AZIM = 25 * RAD;

// A filmic shoulder with a linear toe: values below KNEE pass unchanged (so
// the page's black and the dark plinth match the page), brighter values roll
// off smoothly toward white (C1-continuous at the knee). Defined once, for
// CustomToneMapping, which only this scene uses.
const KNEE = 0.55;
if (!ShaderChunk.tonemapping_pars_fragment.includes("ryvo-shoulder")) {
  ShaderChunk.tonemapping_pars_fragment = ShaderChunk.tonemapping_pars_fragment.replace(
    "vec3 CustomToneMapping( vec3 color ) { return color; }",
    /* glsl */ `// ryvo-shoulder
vec3 CustomToneMapping( vec3 color ) {
  color *= toneMappingExposure;
  vec3 k = vec3(${KNEE.toFixed(2)});
  vec3 over = max(color - k, 0.0);
  vec3 rolled = k + (1.0 - k) * (1.0 - exp(-over / (1.0 - k)));
  return mix(color, rolled, step(k, color));
}`,
  );
}

// ── The studio: large feathered softboxes ─────────────────────────────────
// Round 6: the overhead light is a narrow soft band, not a broad box, so the
// case's lid reads as clear glass with one soft reflection, never a grey lid.
function softStudio(renderer: WebGLRenderer) {
  const env = new Scene();
  env.background = new Color().setScalar(0.005);
  const c = document.createElement("canvas"); c.width = 256; c.height = 256;
  const g = c.getContext("2d")!;
  const fx = g.createLinearGradient(0, 0, 256, 0), fy = g.createLinearGradient(0, 0, 0, 256);
  for (const f of [fx, fy]) { f.addColorStop(0, "rgba(255,255,255,0)"); f.addColorStop(0.28, "rgba(255,255,255,1)"); f.addColorStop(0.72, "rgba(255,255,255,1)"); f.addColorStop(1, "rgba(255,255,255,0)"); }
  g.fillStyle = fx; g.fillRect(0, 0, 256, 256);
  g.globalCompositeOperation = "destination-in"; g.fillStyle = fy; g.fillRect(0, 0, 256, 256);
  const soft = new CanvasTexture(c);
  const box = (w: number, h: number, power: number, pos: [number, number, number], rot: [number, number, number]) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ map: soft, color: new Color().setScalar(power), side: DoubleSide, transparent: true }));
    m.position.set(...pos); m.rotation.set(...rot); env.add(m);
  };
  box(1.6, 6.5, 2.4, [-6, 3.2, 1.5], [0, Math.PI / 2.7, 0.2]); // the key, high left: one soft band down the left face
  box(0.6, 12, 0.42, [1.2, 7.5, -0.5], [Math.PI / 2, 0, 0.5]); // overhead: one narrow, soft band across the lid (seen at a grazing angle it stretches)
  box(2.4, 8, 1.1, [6.5, 0.8, -2.5], [0, -Math.PI / 2.4, 0]); // a tall strip box behind right
  box(9, 2.5, 0.07, [1.5, 2.2, 8], [0.25, Math.PI, 0]); // a dim fill in front
  box(1.4, 10, 1.4, [-3.2, 1.5, 9], [0, Math.PI - 0.3, 0.12]); // the soft band that sweeps the front face
  const pmrem = new PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.035).texture;
  pmrem.dispose();
  env.traverse((o) => { if (o instanceof Mesh) { o.geometry.dispose(); (o.material as MeshBasicMaterial).dispose(); } });
  soft.dispose();
  return tex;
}

// A canvas texture, drawn once at full 8-bit range (strength is set by the
// material, so a faint gradient never shows its steps).
function paint(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}
// A separable gaussian: soft on both axes, no edge anywhere.
const gauss = (w: number, h: number) => paint(w, h, (g) => {
  const img = g.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = (x / (w - 1)) * 2 - 1, v = (y / (h - 1)) * 2 - 1;
    const a = Math.exp(-(u * u) * 4.2) * Math.exp(-(v * v) * 4.2);
    const i = (y * w + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = Math.round(a * 255);
  }
  g.putImageData(img, 0, 0);
});

// The slot's light on the objects: it falls off with
// height above the slot (inverse-square-like) and with distance from the
// slot's line, spreading as it rises.
const LIGHT_GLSL = /* glsl */ `
uniform float uFloor;
uniform vec3 uSlot; // half length, z, unused
float slotLight(vec3 p, float spread) {
  float h = p.y - uFloor;
  if (h <= 0.0) return 0.0;
  float w = 0.03 + h * spread;
  float dz = p.z - uSlot.y;
  float dx = max(abs(p.x) - uSlot.x, 0.0);
  float we = w + 0.3; // the slot's ends fade softly
  float lat = exp(-(dz * dz) / (w * w) - (dx * dx) / (we * we));
  float fall = 1.0 / (1.0 + h * h * 1.8);
  return lat * fall * smoothstep(0.0, 0.03, h);
}`;

// The objects: a still (or its footage, on black), composited with MAX
// blending everywhere, still or footage alike, so the hand-over is invisible.
const OBJ_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vW;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const OBJ_FRAG = /* glsl */ `
uniform sampler2D map;
uniform float opacity;
uniform float uUp;   // how much of the uplight reaches it (1 inside the case)
uniform float uDim;  // 1 inside the case, lower while it waits outside
uniform float uKey;  // 0: the still; 1: its footage (both carry their own alpha)
varying vec2 vUv;
varying vec3 vW;
${LIGHT_GLSL}
float coverage(vec2 uv) {
  vec4 t = texture2D(map, uv);
  return t.a;
}
void main() {
  vec4 t = texture2D(map, vUv);
  // Still or footage, a clean cut-out with its own alpha. (Footage on a
  // background is never shown: round 7.)
  float a = t.a;
  if (a < 0.002) discard; // an empty pixel writes nothing, in any browser
  vec3 c = t.rgb * a;
  // The uplight: the slot's light at this point, lifting what is bright (the
  // chrome reflects it) more than the dark; and the lower edges, which face
  // the light, catching it (where the object is, but nothing is below it).
  // (The object hovers well above the slot, so its gain is its own: the light
  // that reaches it is brightest at its lowest point and fades up through it.)
  float L = slotLight(vW, 0.45) * uUp * 3.2;
  float below = coverage(vUv - vec2(0.0, 0.026));
  float edge = coverage(vUv) * (1.0 - below);
  // (Everything here scales with coverage: an empty pixel gets no light, so
  // the object's square never shows.)
  c += L * (0.012 * a + c * 1.0) + L * edge * 0.42;
  gl_FragColor = vec4(c * uDim * opacity, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// The glow: a camera-facing plane from the slot up to the resting object's
// underside. Its light is brightest at the slot, falls to exactly zero at its
// top (the object's underside) and, as a soft gaussian, to zero at its sides,
// so it has no edge; a fine dither keeps the faint gradient from banding.
const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const GLOW_FRAG = /* glsl */ `
uniform float uInt;
varying vec2 vUv;
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
void main() {
  float u = vUv.x * 2.0 - 1.0;
  float v = clamp(vUv.y, 0.0, 1.0);
  float side = (exp(-u * u * 4.5) - exp(-4.5)) / (1.0 - exp(-4.5)); // exactly 0 at the sides
  float up = pow(1.0 - v, 1.25);                     // exactly 0 at the top
  float base = smoothstep(0.0, 0.035, v);            // born just above the slot
  float g = max(side, 0.0) * up * base * uInt;
  g += (ign(gl_FragCoord.xy) - 0.5) / 255.0 * step(0.0005, g);
  gl_FragColor = vec4(vec3(0.95, 0.965, 1.0) * max(g, 0.0), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// The plinth's cap: a rounded rectangle with the slot cut through it; both
// are bevelled, so every edge catches a fine line of light.
function capGeometry() {
  const { w, d } = PLINTH, r = 0.05, b = PLINTH.bevel;
  const W = w / 2 - b, D = d / 2 - b;
  const s = new Shape();
  s.moveTo(-W + r, -D); s.lineTo(W - r, -D); s.quadraticCurveTo(W, -D, W, -D + r);
  s.lineTo(W, D - r); s.quadraticCurveTo(W, D, W - r, D); s.lineTo(-W + r, D);
  s.quadraticCurveTo(-W, D, -W, D - r); s.lineTo(-W, -D + r); s.quadraticCurveTo(-W, -D, -W + r, -D);
  // The slot (shape coords: x along the slot, y = −z): a long channel with
  // round ends. Its bevel widens it at the top, like a machined chamfer.
  const L = SLOT.len / 2, hw = SLOT.w / 2 - b, zc = -SLOT.z;
  const hole = new Path();
  hole.absarc(-L + hw, zc, hw, Math.PI / 2, (3 * Math.PI) / 2, false);
  hole.lineTo(L - hw, zc - hw);
  hole.absarc(L - hw, zc, hw, -Math.PI / 2, Math.PI / 2, false);
  hole.lineTo(-L + hw, zc + hw);
  s.holes.push(hole);
  const g = new ExtrudeGeometry(s, { depth: PLINTH.cap - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 4, curveSegments: 24 });
  g.rotateX(-Math.PI / 2); // extrude upward
  g.translate(0, -PLINTH.cap + b, 0); // its top at y = 0
  return g;
}

export async function createVitrine(canvas: HTMLCanvasElement, opts: VitrineOptions): Promise<Stage & { setPlaying: (on: boolean) => void }> {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = CustomToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor(PAGE, 1);

  const scene = new Scene();
  scene.background = PAGE;
  const envTex = softStudio(renderer);
  const camera = new PerspectiveCamera(28, 1, 1, 60); // a near plane of 1: ten times the depth precision of 0.1, so nothing fights at a grazing angle
  const target = new Vector3(0, -0.4, 0);

  const loader = new TextureLoader();
  const stills: Texture[] = await Promise.all(opts.objects.map((src) => loader.loadAsync(src)));
  stills.forEach((t) => { t.colorSpace = SRGBColorSpace; t.anisotropy = 8; });

  // Each object's real bounds, from its alpha, so all five fill the same box.
  const bounds = stills.map((t) => {
    const img = t.image as HTMLImageElement;
    const N = 128, c = document.createElement("canvas"); c.width = c.height = N;
    const g = c.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(img, 0, 0, N, N);
    const d = g.getImageData(0, 0, N, N).data;
    let x0 = N, y0 = N, x1 = 0, y1 = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (d[(y * N + x) * 4 + 3] > 24) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return { w: (x1 - x0 + 1) / N, h: (y1 - y0 + 1) / N, cx: (x0 + x1 + 1) / 2 / N - 0.5, cy: 0.5 - (y0 + y1 + 1) / 2 / N };
  });

  const slotU = { uFloor: { value: FLOOR }, uSlot: { value: new Vector3(SLOT.len / 2, SLOT.z, 1) } };
  const plane = new PlaneGeometry(SIZE, SIZE);
  const planes = stills.map((t) => {
    const mat = new ShaderMaterial({
      vertexShader: OBJ_VERT, fragmentShader: OBJ_FRAG, transparent: true, depthWrite: false, toneMapped: true,
      blending: CustomBlending, blendEquation: MaxEquation,
      uniforms: { map: { value: t }, opacity: { value: 1 }, uUp: { value: 0 }, uDim: { value: 1 }, uKey: { value: 0 }, ...slotU },
    });
    const m = new Mesh(plane, mat); m.renderOrder = 3; scene.add(m); return m;
  });

  // ── The footage ────────────────────────────────────────────────────────
  // Each object's clip is made when it is next or resting. Its texture takes
  // over from the still the moment its first frame (the still's own pose) is
  // decoded; from then on it simply plays while the object rests and holds
  // its frame otherwise, so nothing ever jumps back to the still.
  // HEVC with alpha in Safari (it ignores VP9's alpha); VP9 with alpha in
  // Chrome and Firefox. Neither: the clean still, turning gently. The first
  // decoded frame is also checked: its corners must be transparent, or the
  // browser has dropped the alpha, and every object falls back to its still.
  const safari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
  const probe = document.createElement("video");
  const format: "hevc" | "webm" | null = safari
    ? (probe.canPlayType('video/mp4; codecs="hvc1"') ? "hevc" : null)
    : (probe.canPlayType('video/webm; codecs="vp9"') ? "webm" : null);
  let alphaOK: boolean | null = format ? null : false; // null: not yet verified
  const check = document.createElement("canvas"); check.width = check.height = 16;
  const verify = (v: HTMLVideoElement) => {
    try {
      const g = check.getContext("2d", { willReadFrequently: true })!;
      g.clearRect(0, 0, 16, 16); g.drawImage(v, 0, 0, 16, 16);
      const d = g.getImageData(0, 0, 16, 16).data;
      const corners = [0, 15, 240, 255].map((p) => d[p * 4 + 3]);
      alphaOK = corners.every((a) => a < 16);
    } catch { alphaOK = false; }
  };
  const videos: (HTMLVideoElement | null)[] = opts.clips.map(() => null);
  const vtex: (Texture | null)[] = opts.clips.map(() => null);
  // Each new frame is drawn into a small 2D canvas, and that canvas is the
  // texture, in every browser. Safari drops HEVC's alpha when a video goes
  // straight to WebGL (its transparent area then shows as a faint square), and
  // Chrome's direct video upload skips the sRGB decode (the object turns pale);
  // through a canvas, both keep their alpha and decode exactly like the stills.
  const frames: (CanvasRenderingContext2D | null)[] = opts.clips.map(() => null);
  const drawFrame = (i: number) => {
    const g = frames[i], v = videos[i], t = vtex[i];
    if (!g || !v || !t || v.readyState < 2) return;
    g.clearRect(0, 0, g.canvas.width, g.canvas.height);
    g.drawImage(v, 0, 0, g.canvas.width, g.canvas.height);
    t.needsUpdate = true;
  };
  const video = (i: number) => {
    if (opts.reduced || !opts.clips[i] || !format || alphaOK === false) return null;
    if (!videos[i]) {
      const v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto";
      v.src = format === "hevc" ? opts.clips[i].hevc : opts.clips[i].webm; // already at its slow, 60 fps turn
      v.addEventListener("loadeddata", () => { if (alphaOK === null) verify(v); }, { once: true });
      videos[i] = v;
      const c = document.createElement("canvas"); c.width = c.height = 512;
      frames[i] = c.getContext("2d");
      const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace;
      vtex[i] = t;
      v.addEventListener("seeked", () => drawFrame(i));
      v.addEventListener("loadeddata", () => drawFrame(i));
    }
    return videos[i];
  };
  let playing = true;

  // ── The plinth: a bevelled cap with the slot, a shadow-gap reveal, the body
  const base = new Group();
  scene.add(base);
  // Dark lacquered stone: honed beneath a clear glossy coat, so its faces stay
  // deep and quiet while every bevel draws one crisp line of light.
  const stone = new MeshPhysicalMaterial({ color: 0x0d0e10, metalness: 0.25, roughness: 0.5, clearcoat: 0.7, clearcoatRoughness: 0.06, envMap: envTex, envMapIntensity: 1.4 });
  const inset = new MeshPhysicalMaterial({ color: 0x050506, metalness: 0.4, roughness: 0.6, envMap: envTex, envMapIntensity: 0.3 });
  const cap = new Mesh(capGeometry(), stone);
  const reveal = new Mesh(new BoxGeometry(PLINTH.w - 0.06, PLINTH.reveal, PLINTH.d - 0.06), inset);
  reveal.position.y = -PLINTH.cap - PLINTH.reveal / 2;
  const body = new Mesh(new RoundedBoxGeometry(PLINTH.w, PLINTH.body, PLINTH.d, 4, PLINTH.bevel), stone);
  body.position.y = -PLINTH.cap - PLINTH.reveal - PLINTH.body / 2;
  base.add(cap, reveal, body);
  // Inside the slot: the diffuser (a soft emissive strip, brightest along its
  // middle, fading at its rounded ends) and the glow on the slot's walls.
  const diffTex = paint(1024, 32, (g) => {
    const img = g.createImageData(1024, 32);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 1024; x++) {
      const u = Math.abs((x / 1023) * 2 - 1), v = Math.abs((y / 31) * 2 - 1);
      const a = (1 - Math.pow(Math.max(0, (u - 0.93) / 0.07), 2)) * (0.78 + 0.22 * Math.cos((v * Math.PI) / 2));
      const i = (y * 1024 + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = Math.round(Math.max(0, a) * 255);
    }
    g.putImageData(img, 0, 0);
  });
  const diffuser = new Mesh(new PlaneGeometry(SLOT.len, SLOT.w), new MeshBasicMaterial({ map: diffTex, color: new Color(2.6, 2.62, 2.7), transparent: true, depthWrite: false }));
  diffuser.rotation.x = -Math.PI / 2;
  diffuser.position.set(0, -SLOT.depth, SLOT.z);
  const wallTex = paint(16, 64, (g) => {
    const v = g.createLinearGradient(0, 64, 0, 0);
    v.addColorStop(0, "rgba(255,255,255,1)"); v.addColorStop(0.5, "rgba(255,255,255,0.25)"); v.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = v; g.fillRect(0, 0, 16, 64);
  });
  for (const sgn of [-1, 1]) {
    const m = new Mesh(new PlaneGeometry(SLOT.len - SLOT.w, SLOT.depth + 0.004), new MeshBasicMaterial({ map: wallTex, color: new Color(0.5, 0.51, 0.55), transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide }));
    m.position.set(0, -SLOT.depth / 2, SLOT.z + sgn * (SLOT.w / 2 - PLINTH.bevel - 0.001));
    base.add(m);
  }
  base.add(diffuser);

  // ── A faint pool of light on the floor around the slot ─────────────────
  const add = (map: Texture, w: number, h: number, opacity: number) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ map, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity }));
    base.add(m); return m;
  };
  const pool = add(gauss(256, 256), 2.2, 1.0, 0.09); // a gentle pool on the floor, longer along the slot
  pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.012, SLOT.z);

  // ── The glow: one soft vertical light from the slot to the object ──────
  const glowMat = new ShaderMaterial({ vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG, transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: true, uniforms: { uInt: { value: 0.13 } } });
  const glowGeo = new PlaneGeometry(1, 1); glowGeo.translate(0, 0.5, 0); // grows up from its base
  const glowMesh = new Mesh(glowGeo, glowMat);
  glowMesh.renderOrder = 2;
  scene.add(glowMesh);

  // ── The case: thin, clear glass with softly rounded edges ────────────────
  const caseGeo = new RoundedBoxGeometry(CASE.w, CASE.h, CASE.d, 10, CASE.r);
  const front = new TransmissionMaterial({ color: 0xffffff, ior: 1.5, envMap: envTex, envMapIntensity: 0.75, specularIntensity: 1, roughness: 0, side: FrontSide, clearcoat: 0.45, clearcoatRoughness: 0.03 }, 6);
  front.t.uThickness.value = 0.22; // the walls' real thickness: a shift, not a lens
  // Weighted by grazing angle in the shader, so the edges only; kept low, as the
  // lid is seen at a grazing angle and a wide split would echo the object.
  front.t.uChroma.value = 0.04;
  front.t.uAniso.value = 0;
  front.t.uUpOn.value = 1; front.t.uUpY.value = FLOOR; front.t.uUpZ.value = SLOT.z;
  front.t.uUpCol.value.setRGB(0.9, 0.92, 0.96);
  const glass = new Mesh(caseGeo, front);
  const LIFT = 0.02; // the glass stands a hair above the plinth: no coplanar faces
  scene.add(glass);
  // (No inner-wall layer, round 7: its faint reflection read as a lit panel
  // behind the object. The glass is clear: only its faces and edges show.)

  // The buffer: half float where the browser can blend into it (Chrome,
  // Firefox); otherwise (Safari has no EXT_float_blend) an 8-bit sRGB buffer,
  // which blends everywhere and keeps its precision in the darks. Blending
  // into a float target without that extension is silently skipped, and the
  // objects' squares then overwrite the light behind them.
  const floatBlend = renderer.extensions.has("EXT_float_blend");
  const rt = new WebGLRenderTarget(2, 2, floatBlend
    ? { type: HalfFloatType, colorSpace: LinearSRGBColorSpace, depthBuffer: true, samples: 4 }
    : { type: UnsignedByteType, colorSpace: SRGBColorSpace, depthBuffer: true, samples: 4 });

  // ── State ──────────────────────────────────────────────────────────────
  let scroll = 0, px = 0, py = 0, pos = 0;
  let w = 1, h = 1, aspect = 1, dist = 21;
  const right = new Vector3(), away = new Vector3();

  const placeCamera = (t: number) => {
    // A slow idle drift and the pointer move the viewpoint a degree or two
    // (both already smooth and time-based): the case turns very slightly and
    // the softboxes slide over its faces.
    const az = AZIM + Math.sin(t * 0.21) * 1.2 * RAD + px * 2.4 * RAD;
    const el = ELEV + Math.cos(t * 0.17) * 0.6 * RAD - py * 1.6 * RAD;
    camera.position.set(target.x - Math.sin(az) * Math.cos(el) * dist, target.y + Math.sin(el) * dist, target.z + Math.cos(az) * Math.cos(el) * dist);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    right.set(Math.cos(az), 0, Math.sin(az));
    away.set(Math.sin(az), 0, -Math.cos(az));
    front.envMapRotation.set(py * 0.08, Math.sin(t * 0.13) * 0.25 + px * 0.3, 0);
  };

  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    const narrow = aspect < 1.1;
    camera.fov = narrow ? 34 : 28;
    dist = narrow ? 15 : 21.4 * Math.min(1.2, Math.max(1, 880 / h));
    target.y = narrow ? -0.25 : -0.4;
    camera.updateProjectionMatrix();
    const dpr = renderer.getPixelRatio();
    rt.setSize(Math.round(w * dpr), Math.round(h * dpr));
  };
  resize();

  const layout = (time: number) => {
    const t = opts.reduced ? 0 : time;
    placeCamera(t);
    const n = planes.length;
    const narrow = aspect < 1.1;
    const spacing = narrow ? 3.4 : 4.6;
    const lift = scroll * 0.35;
    let glowW = 0, glowTop = 0, glowX = 0, glowZ = 0;
    planes.forEach((m, i) => {
      let d = (((i - pos) % n) + n) % n;
      if (d > n / 2) d -= n;
      const ad = Math.abs(d);
      const near = Math.min(1, ad);
      const b = bounds[i];
      const k = Math.min(CONTENT / (SIZE * b.w), CONTENT / (SIZE * b.h)) * (1 - near * 0.28);
      const bob = Math.sin(t * 0.55 + i * 1.7) * 0.03;
      m.quaternion.copy(camera.quaternion); // each object faces the camera
      m.position.set(0, REST_Y + bob + lift - b.cy * SIZE * k, 0)
        .addScaledVector(right, d * spacing - b.cx * SIZE * k + REST_SHIFT * (1 - near))
        .addScaledVector(away, near * 0.9);
      m.scale.setScalar(k);
      // Where an object has no footage (or the browser cannot play its alpha),
      // its clean still turns gently at rest instead, at the display's rate.
      if (m.material.uniforms.uKey.value < 0.5) m.rotateY(Math.sin(t * 0.6 + i) * 0.14 * (1 - near));
      // The glow reaches exactly the underside of whatever rests (weighted
      // across a glide, so its height moves smoothly).
      const w = Math.max(0, 1 - ad);
      glowW += w; glowTop += w * (m.position.y - b.h * SIZE * k * 0.5); glowX += w * m.position.x; glowZ += w * m.position.z;
      const u = m.material.uniforms;
      u.opacity.value = Math.max(0, Math.min(1, 1 - (ad - 0.45) * 0.78));
      u.uUp.value = Math.max(0, 1 - Math.max(0, ad - 0.2) * 1.4); // the uplight reaches it inside the case
      u.uDim.value = 1 - Math.min(1, Math.max(0, (ad - 0.35) / 0.5)) * 0.42;
      // The footage: ready while it is next or resting; it plays only at rest.
      const v = ad < 1.05 ? video(i) : videos[i];
      if (v) {
        if (v.readyState >= 2 && alphaOK && u.map.value !== vtex[i]) { u.map.value = vtex[i]; u.uKey.value = 1; }
        if (alphaOK === false && u.map.value !== stills[i]) { u.map.value = stills[i]; u.uKey.value = 0; }
        const rest = ad < 0.04 && playing;
        if (rest && v.paused) v.play().catch(() => {});
        else if (!rest && !v.paused) v.pause();
        if (!v.paused) drawFrame(i);
      }
    });
    // The case, its plinth and its light rise a little as the page scrolls on.
    glass.position.y = FLOOR + CASE.h / 2 + LIFT + lift;
    base.position.y = FLOOR + lift;
    // The glow stands on the slot, under the resting object, facing the camera.
    if (glowW > 0) {
      const top = glowTop / glowW, gx = glowX / glowW;
      const h = Math.max(0.2, top - (FLOOR + lift) - 0.02);
      glowMesh.position.set(Math.max(-0.5, Math.min(0.5, gx)), FLOOR + lift + 0.004, SLOT.z);
      glowMesh.scale.set(1.9, h, 1);
      glowMesh.rotation.set(0, Math.atan2(camera.position.x - glowMesh.position.x, camera.position.z - glowMesh.position.z), 0);
    }
    slotU.uFloor.value = FLOOR + lift;
    front.t.uUpY.value = FLOOR + lift;
  };

  const render = (time: number) => {
    layout(time);
    // The buffer: everything but the front glass, which then refracts it.
    glass.visible = false;
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    glass.visible = true;
    front.t.uBuffer.value = rt.texture;
    renderer.render(scene, camera);
  };

  // Compile every program before the first frame (off the main thread where
  // the browser can), with each target bound, and upload the textures.
  layout(0);
  glass.visible = false;
  renderer.setRenderTarget(rt);
  await renderer.compileAsync(scene, camera);
  renderer.setRenderTarget(null);
  glass.visible = true;
  await renderer.compileAsync(scene, camera);
  stills.forEach((t) => renderer.initTexture(t));

  if (process.env.NODE_ENV !== "production") {
    // Dev only: render one exact frame and return it, for checks in browsers
    // whose animation loop is paused (a locked screen, an offscreen window).
    // The row is placed at `p`; any clip near it is loaded and seeked to `at`
    // seconds first, so the frame shows real footage, not the still.
    const shot = async (p: number, at = 2) => {
      pos = p;
      layout(performance.now() / 1000);
      await Promise.all(videos.map((v) => !v ? null : new Promise<void>((ok) => {
        const go = () => { const done = () => ok(); v.addEventListener("seeked", done, { once: true }); v.currentTime = at; setTimeout(done, 3000); };
        if (v.readyState >= 1) go(); else v.addEventListener("loadedmetadata", go, { once: true });
      })));
      await new Promise((ok) => setTimeout(ok, 300));
      videos.forEach((_, i) => drawFrame(i));
      pos = p; // (a live loop may have moved it meanwhile)
      layout(performance.now() / 1000);
      render(performance.now() / 1000);
      return canvas.toDataURL("image/png");
    };
    (window as unknown as Record<string, unknown>).__vitrine = { scene, camera, front, renderer, videos, glowMat, planes, stills, alpha: () => alphaOK, format, floatBlend, shot };
  }

  return {
    render,
    resize,
    setScroll: (p) => { scroll = p; },
    setPointer: (x, y) => { px = x; py = y; },
    setIntro: () => {},
    setPos: (p) => { pos = p; },
    setHover: () => {},
    setPlaying: (on) => {
      playing = on;
      if (!on) videos.forEach((v) => v?.pause());
    },
    dispose: () => {
      videos.forEach((v) => { if (v) { v.pause(); v.removeAttribute("src"); v.load(); } });
      vtex.forEach((t) => t?.dispose());
      stills.forEach((t) => t.dispose());
      scene.traverse((o) => {
        if (!(o instanceof Mesh)) return;
        o.geometry.dispose();
        const mat = o.material as MeshBasicMaterial;
        if (!planes.includes(o as never)) mat.map?.dispose();
        mat.dispose();
      });
      rt.dispose(); envTex.dispose();
      renderer.dispose();
    },
  };
}
