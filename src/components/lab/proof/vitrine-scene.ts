// The hero (round 5): a museum vitrine. A glass case with softly rounded
// edges stands on a dark plinth; a thin light slot in the plinth lights each
// object from below. The five objects pass, one at a time, into the case
// through its glass, settle above the slot (crisp, slowly turning in the
// uplight: the object's own footage takes over from its still), and leave the
// same way as the next one arrives.
//
// The glass is the round-4 material: a port of drei's MeshTransmissionMaterial
// (transmission, real thickness, clearcoat, dispersion only at grazing
// angles), lit by a soft studio of large softboxes that turns with the sway
// and the pointer. One render target: the scene without the front glass (the
// case's inner walls included, as reflections only), which the front glass
// refracts. It never runs its own loop: the page calls render() from
// gsap.ticker while the stage is on screen.
import {
  AdditiveBlending, BackSide, CanvasTexture, CustomBlending, MaxEquation, Color, DoubleSide, FrontSide, HalfFloatType, LinearSRGBColorSpace, Mesh,
  MeshBasicMaterial, MeshPhysicalMaterial, NoToneMapping, PerspectiveCamera, PlaneGeometry, PMREMGenerator, Scene,
  ShaderMaterial, SRGBColorSpace, Texture, TextureLoader, Vector3, VideoTexture, WebGLRenderer, WebGLRenderTarget,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { TransmissionMaterial } from "./transmission-material";
import type { Stage } from "./stage-scene";

export type VitrineOptions = {
  objects: string[]; // the stills, with alpha, square, all framed the same
  clips: { webm: string; mp4: string }[]; // each object's turning footage; its first frame is the still
  reduced: boolean;
};

const PAGE = new Color("#07080a");
const RAD = Math.PI / 180;

// The case and the plinth (world units). The case floor is the plinth top.
const FLOOR = -1.5;
const CASE = { w: 3.3, h: 3.4, d: 3.0, r: 0.16 };
const PLINTH = { w: 3.62, h: 1.05, d: 3.32, r: 0.05 };
const REST_Y = FLOOR + CASE.h * 0.5 + 0.12; // the resting object: a little above the middle
const CONTENT = 1.75; // a resting object's real content fits this box
const SIZE = 3.1; // each object's plane

// The camera: a three-quarter view, from above and from the left.
const ELEV = 17 * RAD;
const AZIM = 25 * RAD;

// ── The studio: large feathered softboxes (round 4) ────────────────────────
function softStudio(renderer: WebGLRenderer) {
  const env = new Scene();
  env.background = new Color().setScalar(0.006);
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
  box(7, 4.5, 2.4, [-6, 3.2, 1.5], [0, Math.PI / 2.7, 0]); // the key, high left: the left face
  box(11, 3.2, 1.6, [0, 7.5, 0.5], [Math.PI / 2, 0, 0]); // overhead: the top face
  box(2.4, 8, 1.2, [6.5, 0.8, -2.5], [0, -Math.PI / 2.4, 0]); // a tall strip box behind right
  box(9, 2.5, 0.3, [1.5, 2.2, 8], [0.25, Math.PI, 0]); // a dim fill in front
  box(2.6, 10, 2.0, [-3.2, 1.5, 9], [0, Math.PI - 0.3, 0.12]); // the soft band that sweeps the front face
  const pmrem = new PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.035).texture;
  pmrem.dispose();
  env.traverse((o) => { if (o instanceof Mesh) { o.geometry.dispose(); (o.material as MeshBasicMaterial).dispose(); } });
  soft.dispose();
  return tex;
}

// A canvas texture, drawn once.
function paint(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}

// The objects: a still (or, at rest, its footage keyed from black), with
// the uplight on its underside, and dimmed while it waits outside the case.
const OBJ_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const OBJ_FRAG = /* glsl */ `
uniform sampler2D map;
uniform sampler2D shape; // the still: its blurred alpha bounds where footage may show
uniform float opacity;
uniform float uUp;   // 0 → 1: how much of the uplight reaches it
uniform float uDim;  // 1 inside the case, lower while it waits outside
uniform float uKey;  // 1: the map is footage on black
uniform float uMax;  // 1: composited with MAX blending (the crisp copy)
varying vec2 vUv;
void main() {
  vec4 t = texture2D(map, vUv);
  float a = t.a;
  // Footage is on black: it needs no key, as the crisp copy is composited
  // with MAX blending (black adds nothing; dark chrome stays chrome). It is
  // limited to the object's own silhouette (the still's alpha, softened by a
  // coarse mip), so the codec's faint blocks in the black never show.
  if (uKey > 0.5) a = smoothstep(0.03, 0.35, texture2D(shape, vUv, 3.0).a);
  vec3 c = t.rgb;
  // Light from below: strongest on the underside, gone by the top. It lifts
  // what is already bright most (chrome reflects it), never fogs the dark.
  float under = pow(clamp(1.0 - vUv.y * 1.15, 0.0, 1.0), 2.4);
  c += uUp * under * (0.03 + c * 0.55);
  gl_FragColor = uMax > 0.5 ? vec4(c * uDim * a * opacity, 1.0) : vec4(c * uDim, a * opacity);
  #include <colorspace_fragment>
}`;

export async function createVitrine(canvas: HTMLCanvasElement, opts: VitrineOptions): Promise<Stage & { setPlaying: (on: boolean) => void }> {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  renderer.setClearColor(PAGE, 1);

  const scene = new Scene();
  scene.background = PAGE;
  const envTex = softStudio(renderer);
  const camera = new PerspectiveCamera(28, 1, 0.1, 80);
  const target = new Vector3(0, -0.35, 0);

  const loader = new TextureLoader();
  const stills: Texture[] = await Promise.all(opts.objects.map((src) => loader.loadAsync(src)));
  stills.forEach((t) => { t.colorSpace = SRGBColorSpace; t.anisotropy = 4; });

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

  const objMat = (map: Texture) => new ShaderMaterial({
    vertexShader: OBJ_VERT, fragmentShader: OBJ_FRAG, transparent: true, depthWrite: false,
    uniforms: { map: { value: map }, shape: { value: map }, opacity: { value: 1 }, uUp: { value: 0 }, uDim: { value: 1 }, uKey: { value: 0 }, uMax: { value: 0 } },
  });
  const plane = new PlaneGeometry(SIZE, SIZE);
  // What the glass refracts: the objects as stills.
  const planes = stills.map((t) => { const m = new Mesh(plane, objMat(t)); scene.add(m); return m; });
  // The resting object, drawn directly over the glass so it is perfectly crisp
  // (never part of the buffer the glass refracts); it cross-dissolves with its
  // refracted twin as it settles and as it leaves.
  // Still or footage, it is composited the same way (MAX, the GPU's "lighten"),
  // so the swap from still to footage at rest is seamless.
  const crisp = stills.map((t) => {
    const m = new Mesh(plane, objMat(t));
    m.material.depthTest = false; m.renderOrder = 10;
    m.material.blending = CustomBlending; m.material.blendEquation = MaxEquation;
    m.material.uniforms.uMax.value = 1;
    scene.add(m); return m;
  });
  const restK = planes.map(() => 0);

  // ── The footage: one video at a time, made only when it is needed ────────
  const webm = document.createElement("video").canPlayType('video/webm; codecs="vp9"') !== "";
  const videos: (HTMLVideoElement | null)[] = opts.clips.map(() => null);
  const vtex: (VideoTexture | null)[] = opts.clips.map(() => null);
  const video = (i: number) => {
    if (opts.reduced || !opts.clips[i]) return null;
    if (!videos[i]) {
      const v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto";
      v.src = webm ? opts.clips[i].webm : opts.clips[i].mp4;
      v.playbackRate = 0.45; v.defaultPlaybackRate = 0.45; // a slow turn
      videos[i] = v;
      const t = new VideoTexture(v); t.colorSpace = SRGBColorSpace;
      vtex[i] = t;
    }
    return videos[i];
  };
  let playing = true; // false while the stage is off screen or the tab hidden
  let live = -1; // the object whose footage is showing

  // ── The plinth: obsidian-dark metal, softly bevelled ──────────────────────
  const plinthMat = new MeshPhysicalMaterial({ color: 0x101114, metalness: 0.6, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.16, envMap: envTex, envMapIntensity: 1.25 });
  const plinth = new Mesh(new RoundedBoxGeometry(PLINTH.w, PLINTH.h, PLINTH.d, 6, PLINTH.r), plinthMat);
  plinth.position.y = FLOOR - PLINTH.h / 2;
  scene.add(plinth);

  // ── The uplight: a thin slot, a pool on the case floor, a faint cone ──────
  const add = (map: Texture, w: number, h: number, opacity: number) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false, blending: AdditiveBlending, opacity }));
    scene.add(m); return m;
  };
  const slotTex = paint(512, 64, (g) => {
    // a bright line with soft ends, and a tight bloom around it
    const h = g.createLinearGradient(0, 0, 512, 0);
    h.addColorStop(0, "rgba(255,255,255,0)"); h.addColorStop(0.12, "rgba(255,255,255,1)"); h.addColorStop(0.88, "rgba(255,255,255,1)"); h.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = h; g.globalAlpha = 0.22; g.fillRect(0, 14, 512, 36);
    g.globalAlpha = 1; g.fillRect(0, 29, 512, 6);
  });
  const slot = add(slotTex, 1.7, 0.2, 0.95);
  slot.rotation.x = -Math.PI / 2;
  slot.position.set(0, FLOOR + 0.004, 0.1);
  const poolTex = paint(256, 256, (g) => {
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    // Drawn at full range (strength is the material's opacity): a faint
    // gradient drawn faint in 8 bits would show its steps.
    r.addColorStop(0, "rgba(226,228,232,1)"); r.addColorStop(0.35, "rgba(226,228,232,0.35)"); r.addColorStop(1, "rgba(226,228,232,0)");
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  });
  const pool = add(poolTex, 3.1, 2.8, 0.2);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0, FLOOR + 0.003, 0.1);
  const coneTex = paint(256, 512, (g) => {
    // wider as it rises, fading out well below the top of the case
    const v = g.createLinearGradient(0, 512, 0, 0);
    v.addColorStop(0, "rgba(228,230,234,1)"); v.addColorStop(0.45, "rgba(228,230,234,0.3)"); v.addColorStop(1, "rgba(228,230,234,0)");
    g.fillStyle = v;
    g.beginPath(); g.moveTo(96, 512); g.lineTo(160, 512); g.lineTo(256, 0); g.lineTo(0, 0); g.closePath();
    g.filter = "blur(18px)"; g.fill();
  });
  const cone = add(coneTex, 2.6, CASE.h * 0.92, 0.11);

  // ── The case: thin, clear glass with softly rounded edges ────────────────
  // The front faces refract the buffer; the back faces (the inner walls) are
  // drawn into that buffer as reflections only, added over what is behind.
  const caseGeo = new RoundedBoxGeometry(CASE.w, CASE.h, CASE.d, 10, CASE.r);
  const front = new TransmissionMaterial({ color: 0xffffff, ior: 1.5, envMap: envTex, envMapIntensity: 1.1, specularIntensity: 1, roughness: 0, side: FrontSide, clearcoat: 1, clearcoatRoughness: 0.03 }, 8);
  front.t.uThickness.value = 0.22; // the walls' real thickness: a shift, not a lens
  // Weighted by grazing angle in the shader, so the edges only; kept low, as the
  // top face is seen at a grazing angle and a wide split would echo the object.
  front.t.uChroma.value = 0.04;
  front.t.uAniso.value = 0;
  const glass = new Mesh(caseGeo, front);
  const LIFT = 0.006; // the glass stands a hair above the plinth: no coplanar faces
  glass.position.y = FLOOR + CASE.h / 2 + LIFT;
  scene.add(glass);
  const backMat = new MeshPhysicalMaterial({ color: 0x000000, metalness: 0, roughness: 0.3, envMap: envTex, envMapIntensity: 0.16, side: BackSide, transparent: true, blending: AdditiveBlending, depthWrite: false });
  const inner = new Mesh(caseGeo, backMat);
  inner.position.copy(glass.position);
  inner.renderOrder = 2;
  scene.add(inner);

  const rt = new WebGLRenderTarget(2, 2, { type: HalfFloatType, colorSpace: LinearSRGBColorSpace, depthBuffer: true, samples: 2 });

  // ── State ──────────────────────────────────────────────────────────────
  let scroll = 0, px = 0, py = 0, pos = 0, hover = 0;
  let w = 1, h = 1, aspect = 1, dist = 17;
  const right = new Vector3(), back = new Vector3();

  const placeCamera = (t: number) => {
    // A slow idle drift and the pointer move the viewpoint a degree or two:
    // the case turns very slightly, and the softboxes slide over its faces.
    const az = AZIM + Math.sin(t * 0.21) * 1.2 * RAD + px * 2.4 * RAD;
    const el = ELEV + Math.cos(t * 0.17) * 0.6 * RAD - py * 1.6 * RAD;
    camera.position.set(target.x - Math.sin(az) * Math.cos(el) * dist, target.y + Math.sin(el) * dist, target.z + Math.cos(az) * Math.cos(el) * dist);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    // The row runs along the screen's horizontal, so the objects glide across
    // and pass through the case's side walls.
    right.set(Math.cos(az), 0, Math.sin(az));
    back.set(Math.sin(az), 0, -Math.cos(az)); // away from the camera
    front.envMapRotation.set(py * 0.1, Math.sin(t * 0.13) * 0.3 + px * 0.5, 0);
  };

  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    const narrow = aspect < 1.1;
    camera.fov = narrow ? 34 : 28;
    // Short screens step back a little more, so the caption keeps its room.
    dist = narrow ? 15 : 21.4 * Math.min(1.2, Math.max(1, 880 / h));
    target.y = narrow ? -0.25 : -0.4;
    camera.updateProjectionMatrix();
    const dpr = renderer.getPixelRatio();
    rt.setSize(Math.round(w * dpr * 0.5), Math.round(h * dpr * 0.5));
  };
  resize();

  const layout = (time: number) => {
    const t = opts.reduced ? 0 : time;
    placeCamera(t);
    const n = planes.length;
    const narrow = aspect < 1.1;
    const spacing = narrow ? 3.4 : 4.6;
    const lift = scroll * 0.35;
    let resting = -1;
    planes.forEach((m, i) => {
      let d = (((i - pos) % n) + n) % n;
      if (d > n / 2) d -= n;
      const ad = Math.abs(d);
      const near = Math.min(1, ad);
      const b = bounds[i];
      const k = Math.min(CONTENT / (SIZE * b.w), CONTENT / (SIZE * b.h)) * (1 - near * 0.28);
      const bob = Math.sin(t * 0.55 + i * 1.7) * 0.035;
      const hv = hover * (1 - near) * 0.08;
      // Centred in its own box: offsets are along the plane's own axes.
      const ox = -b.cx * SIZE * k, oy = -b.cy * SIZE * k;
      m.quaternion.copy(camera.quaternion); // each still faces the camera
      m.position.set(0, REST_Y + bob + hv + lift, 0)
        .addScaledVector(right, d * spacing + ox)
        .addScaledVector(back, near * 0.9);
      m.position.y += oy;
      m.rotateZ(hover * (1 - near) * -0.05);
      m.scale.setScalar(k);
      const fade = Math.max(0, Math.min(1, 1 - (ad - 0.45) * 0.78));
      const u = m.material.uniforms;
      u.opacity.value = fade;
      u.uUp.value = Math.max(0, 1 - ad * 1.6); // the uplight reaches it inside the case
      u.uDim.value = 1 - Math.min(1, Math.max(0, (ad - 0.35) / 0.5)) * 0.42; // dimmer while it waits outside
      const c = crisp[i];
      c.position.copy(m.position); c.quaternion.copy(m.quaternion); c.scale.copy(m.scale);
      const r = 1 - Math.min(1, Math.max(0, (ad - 0.04) / 0.26));
      const kk = r * r * (3 - 2 * r);
      restK[i] = kk;
      const cu = c.material.uniforms;
      cu.opacity.value = fade * kk; cu.uUp.value = u.uUp.value; cu.uDim.value = u.uDim.value;
      c.visible = cu.opacity.value > 0.002;
      if (ad < 0.05) resting = i;
    });
    // The footage: the resting object's clip starts from its first frame (its
    // still's pose) and turns it slowly; it stops as the object moves off.
    const want = resting >= 0 && playing ? resting : -1;
    if (want !== live) {
      if (live >= 0) { const v = videos[live]; if (v) { v.pause(); v.currentTime = 0; } crispUse(live, false); }
      live = want;
      if (live >= 0) { const v = video(live); if (v) { v.currentTime = 0; v.play().catch(() => {}); } }
    }
    if (live >= 0) {
      const v = videos[live];
      // Only once a frame past the first is decoded, so the swap never flashes.
      if (v && v.readyState >= 2 && v.currentTime > 0.04) crispUse(live, true);
    }
    // Ready the next one's footage while this one rests.
    if (resting >= 0 && !opts.reduced) video((resting + 1) % n);
    // The case, its plinth and its light rise a little as the page scrolls on.
    glass.position.y = inner.position.y = FLOOR + CASE.h / 2 + LIFT + lift;
    plinth.position.y = FLOOR - PLINTH.h / 2 + lift;
    slot.position.y = FLOOR + 0.004 + lift;
    pool.position.y = FLOOR + 0.003 + lift;
    // The cone stands on the slot and turns to face the camera about the vertical.
    cone.position.set(0, FLOOR + lift + (CASE.h * 0.92) / 2, 0.1);
    cone.rotation.set(0, Math.atan2(camera.position.x - cone.position.x, camera.position.z - cone.position.z), 0);
  };

  const crispUse = (i: number, footage: boolean) => {
    const u = crisp[i].material.uniforms;
    u.map.value = footage ? vtex[i] : stills[i];
    u.uKey.value = footage ? 1 : 0;
  };

  const render = (time: number) => {
    layout(time);
    // The buffer: everything but the front glass and the crisp copies. A
    // settling object fades out of it as its crisp copy fades in on top.
    const shown = crisp.map((c) => c.visible);
    crisp.forEach((c) => (c.visible = false));
    const base = planes.map((m) => m.material.uniforms.opacity.value as number);
    planes.forEach((m, i) => (m.material.uniforms.opacity.value = base[i] * (1 - restK[i])));
    glass.visible = false; inner.visible = true;
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    glass.visible = true; inner.visible = false;
    front.t.uBuffer.value = rt.texture;
    crisp.forEach((c, i) => (c.visible = shown[i]));
    planes.forEach((m, i) => (m.material.uniforms.opacity.value = base[i]));
    renderer.render(scene, camera);
  };

  // Compile every program before the first frame (off the main thread where
  // the browser can), with each target bound, and upload the textures.
  layout(0);
  glass.visible = false; inner.visible = true;
  renderer.setRenderTarget(rt);
  await renderer.compileAsync(scene, camera);
  renderer.setRenderTarget(null);
  glass.visible = true; inner.visible = false;
  await renderer.compileAsync(scene, camera);
  stills.forEach((t) => renderer.initTexture(t));

  if (process.env.NODE_ENV !== "production") (window as unknown as Record<string, unknown>).__vitrine = { scene, camera, front, renderer, videos };

  return {
    render,
    resize,
    setScroll: (p) => { scroll = p; },
    setPointer: (x, y) => { px = x; py = y; },
    setIntro: () => {},
    setPos: (p) => { pos = p; },
    setHover: (k) => { hover = k; },
    setPlaying: (on) => {
      playing = on;
      if (!on && live >= 0) { videos[live]?.pause(); }
      else if (on && live >= 0) { videos[live]?.play().catch(() => {}); }
    },
    dispose: () => {
      videos.forEach((v) => { if (v) { v.pause(); v.removeAttribute("src"); v.load(); } });
      vtex.forEach((t) => t?.dispose());
      [...planes, ...crisp].forEach((m) => m.material.dispose());
      plane.dispose();
      stills.forEach((t) => t.dispose());
      for (const m of [slot, pool, cone]) { m.geometry.dispose(); (m.material as MeshBasicMaterial).map?.dispose(); (m.material as MeshBasicMaterial).dispose(); }
      plinth.geometry.dispose(); plinthMat.dispose();
      caseGeo.dispose(); front.dispose(); backMat.dispose();
      rt.dispose(); envTex.dispose();
      renderer.dispose();
    },
  };
}
