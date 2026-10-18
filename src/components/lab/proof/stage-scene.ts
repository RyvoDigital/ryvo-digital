// The signature stage: the five chrome objects lit on obsidian, with one of two
// signatures, so the comparison is like for like.
//   crystal: a block of crystal in front of them, a port of drei's
//            MeshTransmissionMaterial refracting the objects behind it.
//   chrome:  a live pool of liquid mercury under them, reflecting them.
// It never runs its own animation loop: the page calls render() from
// gsap.ticker while the stage is on screen, and never otherwise.
import {
  AdditiveBlending, BackSide, CanvasTexture, Color, DoubleSide, FrontSide, HalfFloatType, LatheGeometry, LinearSRGBColorSpace,
  Mesh, MeshBasicMaterial, NoToneMapping, PerspectiveCamera, PlaneGeometry, PMREMGenerator,
  Scene, ShaderMaterial, SRGBColorSpace, Texture, TextureLoader, Vector2, Vector3, Vector4, WebGLRenderer, WebGLRenderTarget,
  type BufferGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { TransmissionMaterial } from "./transmission-material";

export type Sig = "crystal" | "chrome";
export type StageKind = "hero" | "cta";

export type StageOptions = {
  sig: Sig;
  kind: StageKind;
  objects: string[]; // image URLs with alpha, square, all framed the same
  reduced: boolean;
};

export type Stage = {
  render: (time: number) => void;
  resize: () => void;
  setScroll: (p: number) => void; // 0 at rest, 1 when the stage has scrolled past
  setPointer: (x: number, y: number) => void; // -1..1, already smoothed by the caller
  setIntro: (k: number) => void; // 0 → 1, driven by a GSAP tween
  setPos: (p: number) => void; // hero: object k rests in the crystal at p = k (wraps every 5)
  setHover: (k: number) => void; // hero: 0 → 1 while the pointer is over the scene
  dispose: () => void;
};

const PAGE = new Color("#07080a");
const OBJ_Z = -1.6;

// ── Environment: a black studio with thin strip lights ─────────────────────
// Thin, bright strips (not soft boxes) give crisp streak highlights on curved
// glass and metal, never a blown-out glare.
function studio(renderer: WebGLRenderer) {
  const env = new Scene();
  env.background = new Color(0x000000);
  const strip = (w: number, h: number, power: number, pos: [number, number, number], rot: [number, number, number]) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color().setScalar(power), side: DoubleSide }));
    m.position.set(...pos);
    m.rotation.set(...rot);
    env.add(m);
  };
  strip(9, 0.32, 5.5, [-5, 4.5, -2.5], [0.5, 0.9, 0.25]); // the long key strip, high left (behind, so it lands on the rim)
  strip(12, 0.14, 4.2, [0, 8, 1.2], [Math.PI / 2, 0, 0]); // straight overhead: one crisp, bright top edge on the crystal
  strip(0.22, 9, 4, [6.5, 0.5, -3], [0, -0.9, 0]); // the rim, behind right
  strip(14, 0.12, 0.9, [0, 6.5, -4], [Math.PI / 2, 0, 0]); // a fine overhead line, set back so it lands on the rim
  strip(6, 3, 0.08, [0, -6, -1], [-Math.PI / 2, 0, 0]); // a faint bounce from below, so faces never go flat black
  // (Round 2: lights in front of the crystal drew a second line partway round
  // its bevel, so every strip now sits level with or behind it.)
  const pmrem = new PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0).texture;
  pmrem.dispose();
  env.traverse((o) => { if (o instanceof Mesh) { o.geometry.dispose(); (o.material as MeshBasicMaterial).dispose(); } });
  return tex;
}

// A lens: a thick disc with rounded edges and gently domed faces.
function lensGeometry(R: number, h: number, c: number, dome: number) {
  const pts: Vector2[] = [];
  const N = 18;
  for (let i = 0; i <= N; i++) { const x = (i / N) * (R - c); pts.push(new Vector2(x, -h - dome * (1 - (x / (R - c)) ** 2))); }
  for (let i = 1; i < 24; i++) { const a = -Math.PI / 2 + (i / 24) * Math.PI; pts.push(new Vector2(R - c + Math.cos(a) * c, Math.sin(a) * (h))); }
  for (let i = N; i >= 0; i--) { const x = (i / N) * (R - c); pts.push(new Vector2(x, h + dome * (1 - (x / (R - c)) ** 2))); }
  const g = new LatheGeometry(pts, 96);
  g.rotateX(Math.PI / 2);
  return g;
}

// ── The mercury pool ────────────────────────────────────────────────────────
const POOL_VERT = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const POOL_FRAG = /* glsl */ `
precision highp float;
varying vec3 vWorld;
uniform float uTime;
uniform float uObjZ;
uniform sampler2D uTex0; uniform sampler2D uTex1; uniform sampler2D uTex2; uniform sampler2D uTex3; uniform sampler2D uTex4;
uniform vec4 uRect[5];   // centre x, centre y, half size, opacity
uniform vec4 uWave;      // x, z, start time, strength: a ring sent out when the object above changes
uniform vec2 uPointer;   // a soft disturbance that follows the pointer
uniform vec3 uPage;
uniform float uCount;
uniform vec2 uRes;      // drawing-buffer size: the pool fades out before any canvas edge
uniform float uLeftCut; // wide hero: the pool fades out left of here, under the copy

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
// Slow, heavy flow: two octaves of domain-warped noise. Mercury is dense, so
// the waves are long and low.
float height(vec2 p) {
  float t = uTime * 0.16;
  vec2 q = vec2(noise(p * 0.55 + vec2(t, -t * 0.7)), noise(p * 0.55 + vec2(-t * 0.6, t * 0.9) + 7.3));
  float h = noise(p * 0.8 + q * 1.6 + vec2(t * 0.4, 0.0)) * 0.6 + noise(p * 1.9 - q + vec2(0.0, t * 0.5)) * 0.25;
  h *= 0.065;
  float age = uTime - uWave.z;
  if (age > 0.0 && age < 6.0) {
    float d = length(p - uWave.xy);
    h += uWave.w * 0.045 * sin(d * 7.0 - age * 5.0) * exp(-d * 0.7) * exp(-age * 0.75) * smoothstep(age * 1.6 + 0.4, age * 1.6 - 0.6, d);
  }
  float dp = length(p - uPointer);
  h += 0.009 * sin(dp * 8.0 - uTime * 2.0) * exp(-dp * 1.5);
  return h;
}

vec3 env(vec3 r) {
  // The studio: black, a long key streak high left, a rim line right, a low haze.
  float key = smoothstep(0.035, 0.0, abs(r.y - 0.42 - r.x * 0.22)) * smoothstep(0.9, -0.2, r.x);
  float rim = smoothstep(0.03, 0.0, abs(r.x - 0.62)) * smoothstep(-0.1, 0.4, r.y);
  float line = smoothstep(0.02, 0.0, abs(r.y - 0.78));
  float haze = exp(-abs(r.y - 0.06) * 9.0) * 0.07;
  return vec3(0.004) + vec3(1.0) * (key * 1.6 + rim * 0.9 + line * 0.45) + vec3(0.78, 0.80, 0.84) * haze;
}

vec4 objectAt(int i, vec2 uv) {
  if (i == 0) return texture2D(uTex0, uv);
  if (i == 1) return texture2D(uTex1, uv);
  if (i == 2) return texture2D(uTex2, uv);
  if (i == 3) return texture2D(uTex3, uv);
  return texture2D(uTex4, uv);
}

void main() {
  vec2 p = vWorld.xz;
  float e = 0.03;
  float h = height(p);
  vec3 N = normalize(vec3(-(height(p + vec2(e, 0.0)) - h) / e, 1.0, -(height(p + vec2(0.0, e)) - h) / e));
  vec3 V = normalize(vWorld - cameraPosition);
  vec3 R = reflect(V, N);

  vec3 col = env(R);
  // The objects, reflected: follow the reflected ray to the objects' plane.
  if (R.z < -0.001) {
    float t = (uObjZ - vWorld.z) / R.z;
    vec3 hit = vWorld + R * t;
    for (int i = 0; i < 5; i++) {
      if (float(i) >= uCount) break;
      vec4 rc = uRect[i];
      vec2 uv = (hit.xy - rc.xy) / (2.0 * rc.z) + 0.5;
      if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
        vec4 o = objectAt(i, uv);
        col = mix(col, o.rgb, o.a * rc.w);
      }
    }
  }
  // Mercury: about 75–80% reflective at every angle, faintly cool.
  vec3 merc = col * vec3(0.80, 0.81, 0.83);
  // The far edge and the sides fall back into the page.
  float far = smoothstep(-11.0, -2.5, vWorld.z);
  float side = smoothstep(7.5, 3.0, abs(vWorld.x));
  float near = smoothstep(4.4, 2.6, vWorld.z);
  float left = smoothstep(uLeftCut - 1.8, uLeftCut + 0.8, vWorld.x);
  vec2 sc = gl_FragCoord.xy / uRes;
  float edge = smoothstep(0.0, 0.16, sc.x) * smoothstep(1.0, 0.84, sc.x) * smoothstep(0.0, 0.14, sc.y);
  float k = far * side * near * left * edge;
  gl_FragColor = vec4(mix(uPage, merc, k), 1.0);
  #include <colorspace_fragment>
}`;

export async function createStage(canvas: HTMLCanvasElement, opts: StageOptions): Promise<Stage> {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  renderer.setClearColor(PAGE, 1);

  const scene = new Scene();
  scene.background = PAGE;
  const envTex = studio(renderer);

  const camera = new PerspectiveCamera(30, 1, 0.1, 60);
  const lookAt = new Vector3(0, -0.15, 0);

  const loader = new TextureLoader();
  const textures: Texture[] = await Promise.all(opts.objects.map((src) => loader.loadAsync(src)));
  textures.forEach((t) => { t.colorSpace = SRGBColorSpace; t.anisotropy = 4; });

  // The objects: one plane each, facing the camera.
  const SIZE = opts.kind === "hero" ? 3.1 : 3.2;
  // 70% of the crystal's inner face (2.28 × 3.03) as seen on screen. The objects
  // sit 2.5 units behind it, so perspective shrinks them by about 0.85: the box
  // at their depth is larger by 1/0.85.
  const FIT_W = 0.7 * 2.28 / 0.85, FIT_H = 0.7 * 3.03 / 0.85;
  const SPACING = 3.7;
  // Each object's real bounds (from its alpha), so every object can be fitted
  // to the same visual box inside the crystal, whatever its shape.
  const bounds = textures.map((t) => {
    const img = t.image as HTMLImageElement;
    const N = 128, c = document.createElement("canvas"); c.width = c.height = N;
    const g = c.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(img, 0, 0, N, N);
    const d = g.getImageData(0, 0, N, N).data;
    let x0 = N, y0 = N, x1 = 0, y1 = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (d[(y * N + x) * 4 + 3] > 24) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return { w: (x1 - x0 + 1) / N, h: (y1 - y0 + 1) / N, cx: (x0 + x1 + 1) / 2 / N - 0.5, cy: 0.5 - (y0 + y1 + 1) / 2 / N };
  });
  const planes = textures.map((map) => {
    const m = new Mesh(new PlaneGeometry(SIZE, SIZE), new MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false }));
    m.position.z = OBJ_Z;
    scene.add(m);
    return m;
  });
  // A faint silver glow pooled under each object (crystal only; the mercury
  // reflects the objects instead).
  const glowTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    // A long, soft falloff: no edge for the crystal's bevel to catch.
    r.addColorStop(0, "rgba(205,209,217,0.5)"); r.addColorStop(0.3, "rgba(205,209,217,0.2)"); r.addColorStop(0.65, "rgba(205,209,217,0.05)"); r.addColorStop(1, "rgba(205,209,217,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
  })();
  const glows = planes.map(() => {
    // Hero: narrower than the crystal's flat face, so its lower bevel never
    // refracts the glow into a hard band.
    const m = new Mesh(new PlaneGeometry(SIZE * (opts.kind === "hero" ? 0.7 : 1.1), SIZE * (opts.kind === "hero" ? 0.17 : 0.22)), new MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.0 }));
    m.position.z = OBJ_Z - 0.01;
    if (opts.sig === "crystal") scene.add(m);
    return m;
  });

  // Hero: a direct copy of each object, drawn over the crystal while it rests
  // there, so a resting object is crisp; the refraction keeps the edges and the
  // glide in and out. Never part of the buffers the crystal refracts.
  const restK = planes.map(() => 0); // how far each object has settled into its crisp copy
  const crisp = opts.kind === "hero" && opts.sig === "crystal"
    ? planes.map((p) => {
        const m = new Mesh(p.geometry, new MeshBasicMaterial({ map: (p.material as MeshBasicMaterial).map, transparent: true, depthWrite: false, depthTest: false, toneMapped: false, opacity: 0 }));
        m.renderOrder = 10;
        scene.add(m);
        return m;
      })
    : [];

  // Hero: soft caustic light pooled beneath the crystal, and a faint reflection
  // of its lower edge. Drawn only in the final pass, never in the buffers the
  // crystal refracts, so its bevel can never cut them into a band.
  let caustic: Mesh | null = null, reflection: Mesh | null = null;
  if (opts.kind === "hero" && opts.sig === "crystal") {
    const paint = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      draw(c.getContext("2d")!);
      const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
    };
    const ct = paint(512, 160, (g) => {
      const r = g.createRadialGradient(256, 80, 0, 256, 80, 250);
      r.addColorStop(0, "rgba(205,209,217,0.30)"); r.addColorStop(0.5, "rgba(205,209,217,0.08)"); r.addColorStop(1, "rgba(205,209,217,0)");
      g.save(); g.scale(1, 0.32); g.translate(0, 170); g.fillStyle = r; g.fillRect(0, -170, 512, 500); g.restore();
      // A few soft, curved threads of focused light, as a crystal throws.
      g.filter = "blur(2.5px)"; g.strokeStyle = "rgba(255,255,255,0.22)"; g.lineWidth = 2;
      for (const [a, b, c2] of [[140, 70, 360], [170, 92, 330], [200, 60, 300], [120, 100, 390]]) { g.beginPath(); g.moveTo(a, 80); g.quadraticCurveTo(256, b, c2, 82); g.stroke(); }
    });
    caustic = new Mesh(new PlaneGeometry(4.6, 1.3), new MeshBasicMaterial({ map: ct, transparent: true, depthWrite: false, toneMapped: false, blending: AdditiveBlending, opacity: 0.5 }));
    caustic.position.set(0, -2.22, 0.5);
    caustic.renderOrder = 4;
    scene.add(caustic);
    const rt2 = paint(512, 96, (g) => {
      const v = g.createLinearGradient(0, 0, 0, 96);
      v.addColorStop(0, "rgba(220,224,230,0.22)"); v.addColorStop(0.18, "rgba(220,224,230,0.06)"); v.addColorStop(1, "rgba(220,224,230,0)");
      g.fillStyle = v; g.fillRect(24, 0, 464, 96);
      const hz = g.createLinearGradient(0, 0, 512, 0);
      hz.addColorStop(0, "rgba(0,0,0,1)"); hz.addColorStop(0.15, "rgba(0,0,0,0)"); hz.addColorStop(0.85, "rgba(0,0,0,0)"); hz.addColorStop(1, "rgba(0,0,0,1)");
      g.globalCompositeOperation = "destination-out"; g.fillStyle = hz; g.fillRect(0, 0, 512, 96);
    });
    reflection = new Mesh(new PlaneGeometry(2.9, 0.55), new MeshBasicMaterial({ map: rt2, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.6 }));
    reflection.position.set(0, -1.98, 0.9);
    reflection.renderOrder = 4;
    scene.add(reflection);
  }

  // ── Signature: crystal ─────────────────────────────────────────────────
  let crystal: Mesh | null = null;
  let front: TransmissionMaterial | null = null;
  let back: TransmissionMaterial | null = null;
  let rtMain: WebGLRenderTarget | null = null;
  let rtBack: WebGLRenderTarget | null = null;
  if (opts.sig === "crystal") {
    const geo: BufferGeometry = opts.kind === "hero" ? new RoundedBoxGeometry(3.0, 3.75, 1.0, 16, 0.3) : lensGeometry(1.25, 0.2, 0.2, 0.12);
    const common = { color: 0xffffff, ior: 1.5, envMap: envTex, envMapIntensity: 1.35, specularIntensity: 1, roughness: 0 };
    // A trace of emissive on the front faces only (the back pass would add it
    // twice and grey the slab): the volume reads as catching light, never as a hole.
    front = new TransmissionMaterial({ ...common, side: FrontSide, emissive: new Color(0.0011, 0.0012, 0.0014) }, 8);
    front.t.uThickness.value = opts.kind === "hero" ? 0.75 : 0.8;
    front.t.uChroma.value = 0.045; // a subtle split at the edge, not a smear
    front.t.uAniso.value = 0.06;
    // The back faces mirror the studio faintly: at full strength their rim read
    // as a second, broken line inside the front one.
    back = new TransmissionMaterial({ ...common, side: BackSide, envMapIntensity: 0.04 }, 4);
    back.t.uThickness.value = 0.35;
    back.t.uChroma.value = 0.02;
    back.t.uAniso.value = 0.04;
    crystal = new Mesh(geo, front);
    crystal.position.z = opts.kind === "hero" ? 0.9 : 1.0;
    scene.add(crystal);
    // The buffers the crystal refracts. The rim's crispness comes from the
    // canvas itself (antialiased); these only feed the refraction, which the
    // samples soften anyway, so half resolution is enough. The background
    // buffer needs no MSAA (flat textured planes); the back faces get 2×.
    const rtOpts = { type: HalfFloatType, colorSpace: LinearSRGBColorSpace, depthBuffer: true };
    rtMain = new WebGLRenderTarget(2, 2, rtOpts);
    rtBack = new WebGLRenderTarget(2, 2, { ...rtOpts, samples: 2 });
  }

  // ── Signature: chrome ──────────────────────────────────────────────────
  let pool: Mesh | null = null;
  let poolMat: ShaderMaterial | null = null;
  if (opts.sig === "chrome") {
    poolMat = new ShaderMaterial({
      vertexShader: POOL_VERT,
      fragmentShader: POOL_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uObjZ: { value: OBJ_Z },
        uTex0: { value: textures[0] }, uTex1: { value: textures[1] ?? textures[0] }, uTex2: { value: textures[2] ?? textures[0] },
        uTex3: { value: textures[3] ?? textures[0] }, uTex4: { value: textures[4] ?? textures[0] },
        uRect: { value: Array.from({ length: 5 }, () => new Vector4()) },
        uWave: { value: new Vector4(0, OBJ_Z, -99, 0) },
        uPointer: { value: new Vector2(0, 40) },
        uPage: { value: PAGE.clone() }, // three Colors are already linear
        uCount: { value: textures.length },
        uLeftCut: { value: -99 },
        uRes: { value: new Vector2(1, 1) },
      },
    });
    pool = new Mesh(new PlaneGeometry(24, 16, 1, 1), poolMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, -1.62, -2.4);
    scene.add(pool);
  }

  // ── State ──────────────────────────────────────────────────────────────
  let scroll = 0, px = 0, py = 0, intro = opts.reduced || opts.kind === "hero" ? 1 : 0, pos = 0, hover = 0;
  let w = 1, h = 1, aspect = 1;
  let lastActive = 0;
  let focusX = 0;

  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    // Phones are taller than wide: step back so the row and the signature fit.
    const narrow = aspect < 1.1;
    camera.fov = narrow ? 34 : 28;
    // Hero: the crystal fills about half the stage's height, centred.
    camera.position.set(0, 0.5, opts.kind === "hero" ? (narrow ? 11.4 : 14.6) : narrow ? 11 : 10.5);
    // Wide hero: look a little higher, so the crystal sits just below the
    // middle, clear of the headline above and the caption below.
    camera.lookAt(opts.kind === "hero" && !narrow ? lookAt.clone().setY(0.42) : lookAt);
    camera.updateProjectionMatrix();
    const dpr = renderer.getPixelRatio();
    if (poolMat) renderer.getDrawingBufferSize(poolMat.uniforms.uRes.value);
    rtMain?.setSize(Math.round(w * dpr * 0.5), Math.round(h * dpr * 0.5));
    rtBack?.setSize(Math.round(w * dpr * 0.5), Math.round(h * dpr * 0.5));
  };
  resize();

  const easeOutExpo = (k: number) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));

  const layout = (time: number) => {
    const t = opts.reduced ? 0 : time;
    const n = planes.length;
    if (opts.kind === "hero") {
      // A loop, not a scroll: the carousel drives pos. Each object glides in,
      // passes through the crystal and rests centred inside it, then moves on.
      // Neighbours wait smaller and further back, and fade out before the
      // point where the row wraps, so 05 → 01 is seamless.
      const narrow = aspect < 1.1;
      const spacing = narrow ? 3.1 : 4.1;
      planes.forEach((m, i) => {
        let d = (((i - pos) % n) + n) % n;
        if (d > n / 2) d -= n;
        const ad = Math.abs(d);
        const near = Math.min(1, ad);
        const x = d * spacing + px * 0.1;
        const bob = Math.sin(t * 0.55 + i * 1.7) * 0.045;
        // The same visual box for every object: its real content fits at most
        // 70% of the crystal's inner face, centred.
        const b = bounds[i];
        const fit = Math.min(FIT_W / (SIZE * b.w), FIT_H / (SIZE * b.h));
        const k = fit * (1 - near * 0.3);
        // Hover: the resting object lifts a little and turns.
        const lift = hover * (1 - near) * 0.09;
        m.position.set(x - b.cx * SIZE * k, 0.18 + bob + py * 0.04 + lift - b.cy * SIZE * k, OBJ_Z - near * 0.9);
        m.scale.setScalar(k);
        m.rotation.z = hover * (1 - near) * -0.06;
        const fade = Math.max(0, Math.min(1, 1 - (ad - 0.45) * 0.78));
        (m.material as MeshBasicMaterial).opacity = fade;
        const c = crisp[i];
        if (c) {
          c.position.copy(m.position);
          c.scale.copy(m.scale);
          c.rotation.copy(m.rotation);
          // Fully crisp within 0.04 of rest, back to pure refraction by 0.3.
          const rest = 1 - Math.min(1, Math.max(0, (ad - 0.04) / 0.26));
          const k = rest * rest * (3 - 2 * rest);
          (c.material as MeshBasicMaterial).opacity = fade * k;
          restK[i] = k;
          c.visible = (c.material as MeshBasicMaterial).opacity > 0.002;
        }
        const g = glows[i];
        // The glow sits clear of the crystal's lower bevel, which would smear it into a band.
        g.position.set(x, -1.0 + near * 0.06, m.position.z - 0.01);
        g.scale.setScalar(1 - near * 0.3);
        (g.material as MeshBasicMaterial).opacity = fade * 0.34;
      });
      if (crystal) {
        // Tipped a touch toward the camera and barely turned: the top and side
        // faces stay edge-on, so the rim reads as one clean line of light.
        // Front-on, as a thick block: a very slow idle sway (±3.5°) and a gentle
        // pointer parallax (±5°) turn it just enough to show its depth.
        crystal.rotation.set(0.04 + Math.cos(t * 0.17) * 0.03 + py * 0.06, Math.sin(t * 0.21) * 0.061 + px * 0.087, 0.0);
        crystal.position.set(0, 0.12 + scroll * 0.35, 0.9);
        if (caustic && reflection) {
          caustic.scale.set(1 + Math.sin(t * 0.3) * 0.03, 1, 1);
          (caustic.material as MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 0.47) * 0.06;
          caustic.position.y = -2.22 + scroll * 0.35;
          reflection.position.y = -1.98 + scroll * 0.35;
        }
      }
    } else {
      const m = planes[0];
      m.position.set(px * 0.1, 0.12 + Math.sin(t * 0.55) * 0.05, OBJ_Z);
      (m.material as MeshBasicMaterial).opacity = Math.min(1, intro * 1.4);
      glows[0].position.set(m.position.x, -1.6, OBJ_Z - 0.01);
      (glows[0].material as MeshBasicMaterial).opacity = 0.5 * intro;
      if (crystal) {
        // The lens drifts slowly across the object; scroll brings it up into place.
        const k = 1 - easeOutExpo(intro);
        crystal.position.set(Math.sin(t * 0.23) * 0.95 + px * 0.25, Math.cos(t * 0.17) * 0.32 - 0.1 - k * 2.2 - scroll * 0.6, 1.0);
        crystal.rotation.set(0.32 + py * 0.12 + Math.sin(t * 0.19) * 0.06, -0.42 + px * 0.2 + Math.cos(t * 0.15) * 0.08, 0.1);
      }
      if (poolMat && intro > 0.6 && lastActive === 0) { poolMat.uniforms.uWave.value.set(0, OBJ_Z, time, 0.8); lastActive = 1; }
    }
    if (poolMat) {
      poolMat.uniforms.uTime.value = t;
      planes.forEach((m, i) => (poolMat!.uniforms.uRect.value[i] as Vector4).set(m.position.x, m.position.y, SIZE / 2, (m.material as MeshBasicMaterial).opacity));
      poolMat.uniforms.uPointer.value.set(focusX + px * 3.2, OBJ_Z + 2.2 - py * 0.6);
      poolMat.uniforms.uLeftCut.value = aspect < 1.1 || opts.kind !== "hero" ? -99 : focusX - 2.6;
    }
  };

  const render = (time: number) => {
    layout(time);
    if (crystal && front && back && rtMain && rtBack) {
      // drei's order: the scene without the crystal, then the crystal's back
      // faces refracting that, then the front faces refracting both.
      const shown = crisp.map((c) => c.visible);
      crisp.forEach((c) => (c.visible = false));
      if (caustic) caustic.visible = false;
      if (reflection) reflection.visible = false;
      // In the buffer the crystal refracts, a settling object fades out as its
      // crisp copy fades in on top: a cross-dissolve, never two images at once.
      const base = planes.map((m) => (m.material as MeshBasicMaterial).opacity);
      if (crisp.length) planes.forEach((m, i) => ((m.material as MeshBasicMaterial).opacity = base[i] * (1 - restK[i])));
      crystal.visible = false;
      renderer.setRenderTarget(rtMain);
      renderer.render(scene, camera);
      crystal.visible = true;
      crystal.material = back;
      back.t.uBuffer.value = rtMain.texture;
      renderer.setRenderTarget(rtBack);
      renderer.render(scene, camera);
      crystal.material = front;
      front.t.uBuffer.value = rtBack.texture;
      renderer.setRenderTarget(null);
      crisp.forEach((c, i) => (c.visible = shown[i]));
      if (caustic) caustic.visible = true;
      if (reflection) reflection.visible = true;
      planes.forEach((m, i) => ((m.material as MeshBasicMaterial).opacity = base[i]));
    }
    renderer.render(scene, camera);
  };

  // Compile every program before the first frame, off the main thread where the
  // browser can (KHR_parallel_shader_compile): a 12-sample transmission shader
  // linked mid-scroll costs a 150 ms frame. The buffer passes render into a
  // linear target, a different program variant from the screen's, so each pass
  // is compiled with its own target bound.
  layout(0);
  if (crystal && front && back && rtMain && rtBack) {
    crystal.visible = false;
    renderer.setRenderTarget(rtMain);
    await renderer.compileAsync(scene, camera);
    crystal.visible = true;
    crystal.material = back;
    renderer.setRenderTarget(rtBack);
    await renderer.compileAsync(scene, camera);
    crystal.material = front;
    renderer.setRenderTarget(null);
  }
  await renderer.compileAsync(scene, camera);
  // Upload the textures now too, so the first visible frame does no uploads.
  textures.forEach((t) => renderer.initTexture(t));
  renderer.initTexture(glowTex);

  if (process.env.NODE_ENV !== "production") (window as unknown as Record<string, unknown>)[`__stage_${opts.kind}`] = { scene, front, back, renderer, crystal, envTex };

  return {
    render,
    resize,
    setScroll: (p) => { scroll = p; },
    setPointer: (x, y) => { px = x; py = y; },
    setIntro: (k) => { intro = k; },
    setPos: (p) => { pos = p; },
    setHover: (k) => { hover = k; },
    dispose: () => {
      planes.forEach((m) => { m.geometry.dispose(); (m.material as MeshBasicMaterial).dispose(); });
      crisp.forEach((m) => (m.material as MeshBasicMaterial).dispose());
      for (const x of [caustic, reflection]) if (x) { x.geometry.dispose(); (x.material as MeshBasicMaterial).map?.dispose(); (x.material as MeshBasicMaterial).dispose(); }
      glows.forEach((m) => { m.geometry.dispose(); (m.material as MeshBasicMaterial).dispose(); });
      textures.forEach((t) => t.dispose());
      glowTex.dispose();
      crystal?.geometry.dispose(); front?.dispose(); back?.dispose();
      rtMain?.dispose(); rtBack?.dispose();
      pool?.geometry.dispose(); poolMat?.dispose();
      envTex.dispose();
      renderer.dispose();
    },
  };
}
