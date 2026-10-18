// The signature stage: the five chrome objects lit on obsidian, with one of two
// signatures, so the comparison is like for like.
//   crystal: a block of crystal in front of them, a port of drei's
//            MeshTransmissionMaterial refracting the objects behind it.
//   chrome:  a live pool of liquid mercury under them, reflecting them.
// It never runs its own animation loop: the page calls render() from
// gsap.ticker while the stage is on screen, and never otherwise.
import {
  BackSide, CanvasTexture, Color, DoubleSide, FrontSide, HalfFloatType, LatheGeometry, LinearSRGBColorSpace,
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
  strip(9, 0.32, 5.5, [-5, 4.5, 2], [0.5, 0.9, 0.25]); // the long key strip, high left
  strip(0.22, 9, 4, [6.5, 0.5, -3], [0, -0.9, 0]); // the rim, behind right
  strip(14, 0.12, 2.2, [0, 6.5, -2], [Math.PI / 2, 0, 0]); // a fine overhead line
  strip(6, 3, 0.18, [0, -6, 2], [-Math.PI / 2, 0, 0]); // a faint bounce from below, so faces never go flat black
  // In front, behind the camera: what the crystal's faces and edges mirror.
  // Two long, narrow diagonals give the crisp streaks; nothing broad, so no glare.
  const front = (w: number, h: number, power: number, pos: [number, number, number], tilt: number) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color().setScalar(power), side: DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    m.rotateZ(tilt);
    env.add(m);
  };
  front(16, 0.16, 7, [-3.5, 3.2, 7], -0.62);
  front(10, 0.07, 5, [3.8, -1.2, 7.5], -0.62);
  front(0.12, 12, 3.2, [7.5, 1, 4], 0);
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
  const SPACING = 3.7;
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
    r.addColorStop(0, "rgba(205,209,217,0.55)"); r.addColorStop(0.45, "rgba(205,209,217,0.12)"); r.addColorStop(1, "rgba(205,209,217,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
  })();
  const glows = planes.map(() => {
    const m = new Mesh(new PlaneGeometry(SIZE * 1.1, SIZE * 0.22), new MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.0 }));
    m.position.z = OBJ_Z - 0.01;
    if (opts.sig === "crystal") scene.add(m);
    return m;
  });

  // ── Signature: crystal ─────────────────────────────────────────────────
  let crystal: Mesh | null = null;
  let front: TransmissionMaterial | null = null;
  let back: TransmissionMaterial | null = null;
  let rtMain: WebGLRenderTarget | null = null;
  let rtBack: WebGLRenderTarget | null = null;
  if (opts.sig === "crystal") {
    const geo: BufferGeometry = opts.kind === "hero" ? new RoundedBoxGeometry(3.0, 3.75, 0.72, 16, 0.36) : lensGeometry(1.25, 0.2, 0.2, 0.12);
    const common = { color: 0xffffff, ior: 1.5, envMap: envTex, envMapIntensity: 1.35, specularIntensity: 1, roughness: 0 };
    // A trace of emissive on the front faces only (the back pass would add it
    // twice and grey the slab): the volume reads as catching light, never as a hole.
    front = new TransmissionMaterial({ ...common, side: FrontSide, emissive: new Color(0.0011, 0.0012, 0.0014) }, 12);
    front.t.uThickness.value = opts.kind === "hero" ? 0.75 : 0.8;
    front.t.uChroma.value = 0.09;
    front.t.uAniso.value = 0.06;
    back = new TransmissionMaterial({ ...common, side: BackSide, envMapIntensity: 0.6 }, 6);
    back.t.uThickness.value = 0.35;
    back.t.uChroma.value = 0.04;
    back.t.uAniso.value = 0.04;
    crystal = new Mesh(geo, front);
    crystal.position.z = opts.kind === "hero" ? 0.9 : 1.0;
    scene.add(crystal);
    const rtOpts = { type: HalfFloatType, colorSpace: LinearSRGBColorSpace, depthBuffer: true };
    rtMain = new WebGLRenderTarget(2, 2, rtOpts);
    rtBack = new WebGLRenderTarget(2, 2, rtOpts);
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
  let scroll = 0, px = 0, py = 0, intro = opts.reduced ? 1 : 0;
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
    camera.position.set(0, 0.5, narrow ? (opts.kind === "hero" ? 10.2 : 11) : opts.kind === "hero" ? 9.2 : 10.5);
    camera.lookAt(lookAt);
    camera.updateProjectionMatrix();
    const dpr = renderer.getPixelRatio();
    // The buffer the crystal refracts: 60% of the drawing size is plenty, the
    // samples blur it anyway.
    if (poolMat) renderer.getDrawingBufferSize(poolMat.uniforms.uRes.value);
    rtMain?.setSize(Math.round(w * dpr * 0.6), Math.round(h * dpr * 0.6));
    rtBack?.setSize(Math.round(w * dpr * 0.6), Math.round(h * dpr * 0.6));
  };
  resize();

  const easeOutExpo = (k: number) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));

  const layout = (time: number) => {
    const t = opts.reduced ? 0 : time;
    const n = planes.length;
    if (opts.kind === "hero") {
      // The row glides in from the right through the crystal, then follows the
      // scroll: one object moves on as the hero leaves.
      const active = -2.6 * (1 - easeOutExpo(intro)) + scroll * 1.15;
      const narrow = aspect < 1.1;
      // Wide: the crystal and the active object sit right of centre, the copy
      // to their left. Narrow: centred, the copy is above the stage.
      focusX = narrow ? 0 : Math.min(2.4, (aspect - 1.2) * 1.1);
      const spacing = narrow ? SPACING * 0.92 : SPACING;
      const reach = narrow ? 3.6 : 8.4;
      planes.forEach((m, i) => {
        const x = focusX + (i - active) * spacing + px * 0.12;
        const bob = Math.sin(t * 0.55 + i * 1.7) * 0.05;
        m.position.set(x, 0.12 + bob + py * 0.05, OBJ_Z);
        const dx = x - focusX;
        // On wide screens an object that has passed through to the left
        // dissolves, so it never sits behind the copy.
        const left = narrow ? Math.min(1, Math.max(0, (reach + dx) / 1.6)) : Math.min(1, Math.max(0, 1 + (dx + 0.55 * spacing) / (0.5 * spacing)));
        const right = Math.min(1, Math.max(0, (reach - dx) / 1.6));
        const fade = Math.min(left, right);
        (m.material as MeshBasicMaterial).opacity = fade * Math.min(1, intro * 1.6);
        const g = glows[i];
        g.position.set(x, -1.42, OBJ_Z - 0.01);
        (g.material as MeshBasicMaterial).opacity = fade * 0.5 * intro;
      });
      const nearest = Math.max(0, Math.min(n - 1, Math.round(active)));
      if (poolMat && nearest !== lastActive && intro > 0.6) {
        poolMat.uniforms.uWave.value.set(planes[nearest].position.x, OBJ_Z, time, 1);
        lastActive = nearest;
      }
      if (crystal) {
        crystal.rotation.set(-0.05 + py * 0.08 + Math.cos(t * 0.21) * 0.02, -0.2 + px * 0.14 + Math.sin(t * 0.26) * 0.045 + scroll * 0.3, 0.0);
        crystal.position.x = focusX;
        crystal.position.y = 0.1 + scroll * 0.4;
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
    dispose: () => {
      planes.forEach((m) => { m.geometry.dispose(); (m.material as MeshBasicMaterial).dispose(); });
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
