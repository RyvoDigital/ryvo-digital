// The two-cities globe (palette 12): an obsidian globe, land as fine silver
// dots, a mercury rim of atmosphere. It turns in from the east, settles on
// Iberia, then a lifted arc draws from Lisbon to Madrid and a small light
// travels it. Loaded on demand when the piece nears the viewport.
import {
  AdditiveBlending, BackSide, BufferAttribute, BufferGeometry, CatmullRomCurve3, Group, Mesh,
  PerspectiveCamera, Points, Scene, ShaderMaterial, SphereGeometry, SRGBColorSpace, TubeGeometry,
  Vector3, WebGLRenderer, MathUtils,
} from "three";
import { SPARSE, DENSE } from "./globe-dots";
import { CITIES, FOCUS, SETTLE_S, ARC_S, LIGHT_S, view, unpack, toVec } from "./globe-shared";

const V = (lat: number, lon: number, r: number) => new Vector3().copy(toVec(lat, lon, r));

export type Globe = {
  start: () => void;
  stop: () => void;
  resize: () => void;
  dispose: () => void;
  /** Render the settled frame, arc drawn (reduced motion). */
  still: () => void;
  /** A calm nudge from a mouse drag, in radians; released, it eases home. */
  nudge: (dx: number, dy: number) => void;
};

type Frame = (labels: { x: number; y: number; on: boolean }[], settled: boolean) => void;

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 4);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createGlobe(canvas: HTMLCanvasElement, onFrame: Frame): Globe {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(view.fov, 1, 0.05, 20);
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

  // Land: round dots, nearly one size everywhere, so the sparse far side just
  // reads sparser (never blobby); dots fade toward the limb.
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

  // The route: a great-circle arc lifted off the surface, drawn by draw range.
  const L = V(CITIES[0].lat, CITIES[0].lon, 1), M = V(CITIES[1].lat, CITIES[1].lon, 1);
  const SEG = 140, RAD = 8;
  const path: Vector3[] = [];
  // Lifted off the surface and bowed a little north, so it reads as an arc
  // from above (a pure great circle this short looks like a straight line).
  const north = V((CITIES[0].lat + CITIES[1].lat) / 2 + 1.5, (CITIES[0].lon + CITIES[1].lon) / 2, 1).sub(L.clone().lerp(M, 0.5).normalize());
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

  // Glows: the two cities and the travelling light, as soft round sprites.
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
  const gPos = new Float32Array(9), gSize = new Float32Array([0.05, 0.05, 0.04]), gA = new Float32Array([1, 1, 0]);
  const Lg = V(CITIES[0].lat, CITIES[0].lon, 1.004), Mg = V(CITIES[1].lat, CITIES[1].lon, 1.004);
  gPos.set([Lg.x, Lg.y, Lg.z, Mg.x, Mg.y, Mg.z, Lg.x, Lg.y, Lg.z]);
  glowGeo.setAttribute("position", new BufferAttribute(gPos, 3));
  glowGeo.setAttribute("aSize", new BufferAttribute(gSize, 1));
  glowGeo.setAttribute("aA", new BufferAttribute(gA, 1));
  globe.add(new Points(glowGeo, glowMat));

  // Pose: the focus (between the two cities) faces the camera; the camera sits
  // off-centre so the limb and its halo show on one side.
  const settled = { yaw: -MathUtils.degToRad(FOCUS.lon), pitch: MathUtils.degToRad(FOCUS.lat) };
  const nudgeNow = { x: 0, y: 0 }, nudgeTo = { x: 0, y: 0 };
  let aspect = 1;

  const pose = (t: number) => {
    const k = easeOut(t / SETTLE_S);
    const yaw = settled.yaw - MathUtils.degToRad(150) * (1 - k);
    const pitch = settled.pitch * (0.35 + 0.65 * k);
    const sway = t > SETTLE_S ? Math.sin((t - SETTLE_S) * 0.22) * 0.012 : 0;
    nudgeNow.x += (nudgeTo.x - nudgeNow.x) * 0.06;
    nudgeNow.y += (nudgeTo.y - nudgeNow.y) * 0.06;
    globe.rotation.order = "XYZ";
    globe.rotation.set(pitch + nudgeNow.y, yaw + sway + nudgeNow.x, 0);
    const v = view.frame(aspect);
    const dist = v.dist + (3.4 - v.dist) * (1 - k);
    camera.position.set(0, 0, dist);
    camera.lookAt(v.ox * k, v.oy * k, 0);

    // The arc draws once settled; then a light travels it, again and again.
    const a = easeInOut(MathUtils.clamp((t - (SETTLE_S - 0.6)) / ARC_S, 0, 1));
    arcGeo.setDrawRange(0, Math.floor(a * SEG) * RAD * 6);
    const lt = t - (SETTLE_S - 0.6 + ARC_S);
    if (lt > 0) {
      const u = (lt % LIGHT_S) / LIGHT_S;
      const p = curve.getPointAt(easeInOut(u)).multiplyScalar(1.002);
      gPos.set([p.x, p.y, p.z], 6);
      gA[2] = Math.sin(Math.PI * u);
    } else gA[2] = 0;
    glowGeo.attributes.position.needsUpdate = true;
    glowGeo.attributes.aA.needsUpdate = true;
    return t > SETTLE_S - 0.4;
  };

  const tmp = new Vector3(), n = new Vector3(), toCam = new Vector3();
  const labels = () => {
    globe.updateMatrixWorld();
    const w = canvas.clientWidth, h = canvas.clientHeight;
    return [Lg, Mg].map((c) => {
      tmp.copy(c).applyMatrix4(globe.matrixWorld);
      n.copy(tmp).normalize();
      toCam.copy(camera.position).sub(tmp).normalize();
      const on = n.dot(toCam) > 0.15;
      tmp.project(camera);
      return { x: (tmp.x * 0.5 + 0.5) * w, y: (-tmp.y * 0.5 + 0.5) * h, on };
    });
  };

  const draw = (t: number) => {
    const done = pose(t);
    renderer.render(scene, camera);
    onFrame(labels(), done);
  };

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    const f = (h * renderer.getPixelRatio()) / (2 * Math.tan(MathUtils.degToRad(view.fov / 2)));
    dotMat.uniforms.uF.value = f;
    glowMat.uniforms.uF.value = f;
  };
  resize();

  let raf = 0, running = false, t0 = 0, elapsed = 0;
  const loop = (now: number) => {
    if (!running) return;
    elapsed = (now - t0) / 1000;
    draw(elapsed);
    raf = requestAnimationFrame(loop);
  };

  return {
    // Pausing keeps the clock: off-screen time does not advance the story.
    start: () => { if (running) return; running = true; t0 = performance.now() - elapsed * 1000; raf = requestAnimationFrame(loop); },
    stop: () => { running = false; cancelAnimationFrame(raf); },
    resize: () => { resize(); if (!running) draw(elapsed); },
    still: () => { elapsed = SETTLE_S + ARC_S + LIGHT_S * 0.5; nudgeNow.x = nudgeNow.y = 0; draw(elapsed); },
    nudge: (dx, dy) => { nudgeTo.x = MathUtils.clamp(dx, -0.22, 0.22); nudgeTo.y = MathUtils.clamp(dy, -0.12, 0.12); },
    dispose: () => {
      running = false; cancelAnimationFrame(raf);
      [body, halo, arc].forEach((m) => { m.geometry.dispose(); (m.material as ShaderMaterial).dispose(); });
      dotGeo.dispose(); dotMat.dispose(); glowGeo.dispose(); glowMat.dispose();
      renderer.dispose();
    },
  };
}
