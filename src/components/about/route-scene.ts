// The about page's signature: the palette's two-cities globe (piece 12), with
// its story put on a dial. `story` runs 0 → 1: the turn in from the east
// (0 → TURN), then the arc drawing Lisbon → Madrid (TURN → ARC_END), then a
// hold while a small light travels the route. The page sets the target (the
// turn plays on its own once seen; the scroll draws the arc); the scene eases
// toward it, so a fast scroll never jumps. It has no loop of its own: the page
// calls render() from the site's shared GSAP ticker, only while on screen.
// Loaded on demand (three.js and the dot set are fetched when the stage nears).
import {
  AdditiveBlending, BackSide, BufferAttribute, BufferGeometry, CatmullRomCurve3, Group, Mesh,
  PerspectiveCamera, Points, Scene, ShaderMaterial, SphereGeometry, SRGBColorSpace, TubeGeometry,
  Vector3, WebGLRenderer, MathUtils,
} from "three";
import { SPARSE, DENSE } from "@/components/lab/globe-dots";
import { CITIES, FOCUS, toVec, unpack } from "@/components/lab/globe-shared";

export const TURN = 0.42;
export const ARC_END = 0.86;
const LIGHT_S = 3.4;

const V = (lat: number, lon: number, r: number) => new Vector3().copy(toVec(lat, lon, r));
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 4);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Where the globe sits in its stage: camera distance and the point it looks at
 * (which offsets the globe), once turned in (`far`, the whole globe) and once
 * the route is drawn (`near`, close on Iberia). The camera dollies between them as the arc draws. */
type Shot = { dist: number; ox: number; oy: number };
export type Framing = (aspect: number) => { far: Shot; near: Shot };

export type Label = { x: number; y: number; on: boolean };
/** Each frame: the two cities on screen, and how far the arc has drawn (0–1). */
export type Frame = (labels: Label[], arc: number) => void;

export type RouteGlobe = {
  /** The story position to ease toward, 0–1. */
  target: (story: number) => void;
  /** Draw one frame; `dt` in seconds. */
  render: (dt: number) => void;
  /** Jump to a story position with no easing (reduced motion, first frame). */
  set: (story: number) => void;
  resize: () => void;
  dispose: () => void;
};

export function createRouteGlobe(canvas: HTMLCanvasElement, framing: Framing, onFrame: Frame): RouteGlobe {
  const FOV = 30;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.05, 20);
  const globe = new Group();
  scene.add(globe);

  // The body: obsidian, with a mercury light at the rim (fresnel), never flat.
  const body = new Mesh(
    new SphereGeometry(0.996, 96, 64),
    new ShaderMaterial({
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(1. - max(dot(vN, vV), 0.), 3.2);
          vec3 c = mix(vec3(.043,.047,.055), vec3(.80,.82,.85), f*.55);
          gl_FragColor = vec4(c, 1.); }`,
    }),
  );
  globe.add(body);

  // The atmosphere: a soft silver halo just outside the limb.
  const halo = new Mesh(
    new SphereGeometry(1.14, 64, 48),
    new ShaderMaterial({
      side: BackSide, transparent: true, depthWrite: false, blending: AdditiveBlending,
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vV;
        void main(){ float s = clamp(-dot(vN, vV) / .5, 0., 1.); float i = pow(s, 2.4) * .75;
          gl_FragColor = vec4(vec3(.80,.82,.86) * i, 1.); }`,
    }),
  );
  scene.add(halo);

  // Land: fine silver dots that fade toward the limb.
  const dots = [...unpack(SPARSE).map((d) => ({ ...d, s: 0.0068 })), ...unpack(DENSE).map((d) => ({ ...d, s: 0.0052 }))];
  const pos = new Float32Array(dots.length * 3), size = new Float32Array(dots.length);
  dots.forEach((d, i) => { const v = toVec(d.lat, d.lon, 1.0); pos.set([v.x, v.y, v.z], i * 3); size[i] = d.s; });
  const dotGeo = new BufferGeometry();
  dotGeo.setAttribute("position", new BufferAttribute(pos, 3));
  dotGeo.setAttribute("aSize", new BufferAttribute(size, 1));
  const dotMat = new ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uF: { value: 600 } },
    vertexShader: `attribute float aSize; uniform float uF; varying float vA;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.);
        vec3 n = normalize(normalMatrix * position); vA = smoothstep(.0, .35, dot(n, normalize(-mv.xyz)));
        gl_PointSize = max(1.2, aSize * .46 * uF / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying float vA;
      void main(){ vec2 p = gl_PointCoord - .5; float r = length(p); float a = smoothstep(.5, .32, r);
        gl_FragColor = vec4(vec3(.80,.82,.85), a * .9 * vA); }`,
  });
  globe.add(new Points(dotGeo, dotMat));

  // The route: an arc lifted off the surface and bowed a little north, drawn by draw range.
  const L = V(CITIES[0].lat, CITIES[0].lon, 1), M = V(CITIES[1].lat, CITIES[1].lon, 1);
  const SEG = 140, RAD = 8;
  const north = V((CITIES[0].lat + CITIES[1].lat) / 2 + 1.5, (CITIES[0].lon + CITIES[1].lon) / 2, 1).sub(L.clone().lerp(M, 0.5).normalize());
  const path: Vector3[] = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48, b = Math.sin(Math.PI * t);
    path.push(L.clone().lerp(M, t).normalize().addScaledVector(north, b).normalize().multiplyScalar(1 + 0.05 * b));
  }
  const curve = new CatmullRomCurve3(path);
  const arcGeo = new TubeGeometry(curve, SEG, 0.0021, RAD, false);
  const arcMat = new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; void main(){ float g = .55 + .45 * sin(vUv.x * 3.14159);
      gl_FragColor = vec4(vec3(.98,.98,1.) * g, .95); }`,
  });
  const arc = new Mesh(arcGeo, arcMat);
  arcGeo.setDrawRange(0, 0);
  globe.add(arc);

  // Glows: the two cities, the pen at the arc's drawing tip, the travelling light.
  const glowMat = new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uF: { value: 600 } },
    vertexShader: `attribute float aSize; attribute float aA; uniform float uF; varying float vA;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vA = aA;
        gl_PointSize = aSize * uF / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying float vA; void main(){ float r = length(gl_PointCoord - .5) * 2.;
      float core = smoothstep(.22, .0, r); float glow = pow(max(0., 1. - r), 2.6) * .55;
      gl_FragColor = vec4(vec3(1.), (core + glow) * vA); }`,
  });
  const glowGeo = new BufferGeometry();
  const gPos = new Float32Array(12), gSize = new Float32Array([0.05, 0.05, 0.045, 0.04]), gA = new Float32Array([0, 0, 0, 0]);
  const Lg = V(CITIES[0].lat, CITIES[0].lon, 1.004), Mg = V(CITIES[1].lat, CITIES[1].lon, 1.004);
  gPos.set([Lg.x, Lg.y, Lg.z, Mg.x, Mg.y, Mg.z, Lg.x, Lg.y, Lg.z, Lg.x, Lg.y, Lg.z]);
  glowGeo.setAttribute("position", new BufferAttribute(gPos, 3));
  glowGeo.setAttribute("aSize", new BufferAttribute(gSize, 1));
  glowGeo.setAttribute("aA", new BufferAttribute(gA, 1));
  globe.add(new Points(glowGeo, glowMat));

  const settled = { yaw: -MathUtils.degToRad(FOCUS.lon), pitch: MathUtils.degToRad(FOCUS.lat) };
  let aspect = 1, story = 0, goal = 0, clock = 0, lightT = 0;

  const pose = () => {
    const k = easeOut(story / TURN);
    const yaw = settled.yaw - MathUtils.degToRad(150) * (1 - k);
    const pitch = settled.pitch * (0.35 + 0.65 * k);
    const sway = Math.sin(clock * 0.22) * 0.012 * k;
    globe.rotation.order = "XYZ";
    globe.rotation.set(pitch, yaw + sway, 0);
    const a = easeInOut(clamp01((story - TURN) / (ARC_END - TURN)));
    const { far, near } = framing(aspect);
    const z = easeInOut(clamp01((story - TURN) / (ARC_END - TURN) * 1.08));
    const mix = (x: number, y: number) => x + (y - x) * z;
    camera.position.set(0, 0, mix(far.dist, near.dist) + 1.6 * (1 - k));
    camera.lookAt(mix(far.ox, near.ox) * k, mix(far.oy, near.oy) * k, 0);

    arcGeo.setDrawRange(0, Math.floor(a * SEG) * RAD * 6);
    // The cities light as the pen reaches them; the pen glows while drawing.
    gA[0] = clamp01(a * 12) * k;
    gA[1] = clamp01((a - 0.96) * 25);
    if (a > 0 && a < 1) {
      const p = curve.getPointAt(a).multiplyScalar(1.002);
      gPos.set([p.x, p.y, p.z], 6);
      gA[2] = 0.9;
    } else gA[2] = 0;
    // Once drawn, a small light travels the route, again and again.
    if (a >= 1) {
      const u = (lightT % LIGHT_S) / LIGHT_S;
      const p = curve.getPointAt(easeInOut(u)).multiplyScalar(1.002);
      gPos.set([p.x, p.y, p.z], 9);
      gA[3] = Math.sin(Math.PI * u);
    } else { gA[3] = 0; lightT = 0; }
    glowGeo.attributes.position.needsUpdate = true;
    glowGeo.attributes.aA.needsUpdate = true;
    return { a, settledEnough: k > 0.9 };
  };

  const tmp = new Vector3(), n = new Vector3(), toCam = new Vector3();
  const labels = (a: number, ok: boolean): Label[] => {
    globe.updateMatrixWorld();
    const w = canvas.clientWidth, h = canvas.clientHeight;
    return [Lg, Mg].map((c, i) => {
      tmp.copy(c).applyMatrix4(globe.matrixWorld);
      n.copy(tmp).normalize();
      toCam.copy(camera.position).sub(tmp).normalize();
      const facing = n.dot(toCam) > 0.15;
      tmp.project(camera);
      return { x: (tmp.x * 0.5 + 0.5) * w, y: (-tmp.y * 0.5 + 0.5) * h, on: ok && facing && (i === 0 ? a > 0.02 : a > 0.97) };
    });
  };

  const draw = () => {
    const { a, settledEnough } = pose();
    renderer.render(scene, camera);
    onFrame(labels(a, settledEnough), a);
  };

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    const f = (h * renderer.getPixelRatio()) / (2 * Math.tan(MathUtils.degToRad(FOV / 2)));
    dotMat.uniforms.uF.value = f;
    glowMat.uniforms.uF.value = f;
  };
  resize();

  return {
    target: (s) => { goal = clamp01(s); },
    render: (dt) => {
      const step = Math.min(dt, 0.1);
      clock += step;
      lightT += step;
      // Ease toward the goal at a frame-rate-independent rate (about 0.2 s to close most of the gap).
      story += (goal - story) * (1 - Math.exp(-step * 7));
      if (Math.abs(goal - story) < 1e-4) story = goal;
      draw();
    },
    set: (s) => { story = goal = clamp01(s); lightT = LIGHT_S * 0.5; draw(); },
    resize: () => { resize(); draw(); },
    dispose: () => {
      [body, halo, arc].forEach((m) => { m.geometry.dispose(); (m.material as ShaderMaterial).dispose(); });
      dotGeo.dispose(); dotMat.dispose(); glowGeo.dispose(); glowMat.dispose();
      renderer.dispose();
    },
  };
}
