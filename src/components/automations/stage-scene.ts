// The closing stage: a chrome object over a live pool of liquid mercury that
// reflects it. (The hero's vitrine is vitrine-scene.ts.)
// It never runs its own animation loop: the page calls render() from
// gsap.ticker while the stage is on screen, and never otherwise.
import {
  Color, DoubleSide, Mesh, MeshBasicMaterial, NoToneMapping, PerspectiveCamera, PlaneGeometry, PMREMGenerator,
  Scene, ShaderMaterial, SRGBColorSpace, Texture, TextureLoader, Vector2, Vector3, Vector4, WebGLRenderer,
} from "three";
import { glPixelRatio } from "@/lib/gl";

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
  renderer.setPixelRatio(glPixelRatio());
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

  const SIZE = 3.2;
  const planes = textures.map((map) => {
    const m = new Mesh(new PlaneGeometry(SIZE, SIZE), new MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false }));
    m.position.z = OBJ_Z;
    scene.add(m);
    return m;
  });
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
  let px = 0, py = 0, intro = opts.reduced ? 1 : 0;
  let w = 1, h = 1, aspect = 1;
  let lastActive = 0;

  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    // Phones are taller than wide: step back so the object and the pool fit.
    const narrow = aspect < 1.1;
    camera.fov = narrow ? 34 : 28;
    camera.position.set(0, 0.5, narrow ? 11 : 10.5);
    camera.lookAt(lookAt);
    camera.updateProjectionMatrix();
    if (poolMat) renderer.getDrawingBufferSize(poolMat.uniforms.uRes.value);
  };
  resize();

  const layout = (time: number) => {
    const t = opts.reduced ? 0 : time;
    const m = planes[0];
    m.position.set(px * 0.1, 0.12 + Math.sin(t * 0.55) * 0.05, OBJ_Z);
    (m.material as MeshBasicMaterial).opacity = Math.min(1, intro * 1.4);
    if (poolMat) {
      if (intro > 0.6 && lastActive === 0) { poolMat.uniforms.uWave.value.set(0, OBJ_Z, time, 0.8); lastActive = 1; }
      poolMat.uniforms.uTime.value = t;
      planes.forEach((p, i) => (poolMat!.uniforms.uRect.value[i] as Vector4).set(p.position.x, p.position.y, SIZE / 2, (p.material as MeshBasicMaterial).opacity));
      poolMat.uniforms.uPointer.value.set(px * 3.2, OBJ_Z + 2.2 - py * 0.6);
      poolMat.uniforms.uLeftCut.value = -99;
    }
  };

  const render = (time: number) => {
    layout(time);
    renderer.render(scene, camera);
  };

  // Compile every program before the first frame, off the main thread where
  // the browser can (KHR_parallel_shader_compile), and upload the textures.
  layout(0);
  await renderer.compileAsync(scene, camera);
  textures.forEach((t) => renderer.initTexture(t));

  return {
    render,
    resize,
    setScroll: () => {},
    setPointer: (x, y) => { px = x; py = y; },
    setIntro: (k) => { intro = k; },
    setPos: () => {},
    setHover: () => {},
    dispose: () => {
      planes.forEach((m) => { m.geometry.dispose(); (m.material as MeshBasicMaterial).dispose(); });
      textures.forEach((t) => t.dispose());
      pool?.geometry.dispose(); poolMat?.dispose();
      envTex.dispose();
      renderer.dispose();
      renderer.forceContextLoss(); // free the context now, not at GC (Safari caps live contexts)
    },
  };
}
