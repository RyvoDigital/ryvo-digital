// Two interlocking polished-chrome rings, one solid object, turning a full 360°
// in an endless loop. Loaded on demand (dynamic import) when the Automations
// section nears the viewport; never on the critical path.
import {
  ACESFilmicToneMapping, Group, Mesh, MeshPhysicalMaterial, PerspectiveCamera, PMREMGenerator,
  Quaternion, Scene, SRGBColorSpace, TorusGeometry, Vector3, WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { gsap as GSAP } from "gsap";
import { glPixelRatio, releaseContext } from "@/lib/gl";

export type Rings = { start: () => void; stop: () => void; resize: () => void; dispose: () => void; renderAt: (turn: number) => void };

const TURN_SECONDS = 26; // one full revolution: slow, calm

// It turns on the site's one ticker (gsap.ticker, which also drives Lenis and
// ScrollTrigger): no requestAnimationFrame loop of its own.
export function createRings(canvas: HTMLCanvasElement, { opaque = false, ticker }: { opaque?: boolean; ticker: typeof GSAP.ticker }): Rings {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: !opaque, powerPreference: "high-performance" });
  renderer.setPixelRatio(glPixelRatio());
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, opaque ? 1 : 0);

  const scene = new Scene();
  // A small studio: the RoomEnvironment, prefiltered for physically based reflections.
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environment = env;

  const chrome = new MeshPhysicalMaterial({
    color: 0xe4e7ec, metalness: 1, roughness: 0.09, clearcoat: 0.4, clearcoatRoughness: 0.06, envMapIntensity: 1.25,
  });

  // A Hopf link: each ring passes through the other's centre, perpendicular to it.
  const R = 1, tube = 0.17;
  const geo = new TorusGeometry(R, tube, 96, 320);
  const a = new Mesh(geo, chrome);
  a.position.x = -R / 2;
  const b = new Mesh(geo, chrome);
  b.position.x = R / 2;
  b.rotation.x = Math.PI / 2;

  const object = new Group();
  object.add(a, b);
  const pose = new Group(); // a fixed three-quarter pose, so the link reads at once
  pose.rotation.set(0.42, 0.28, -0.32);
  pose.add(object);
  scene.add(pose);

  // The turn is about a slightly tilted axis, so the two rings keep showing
  // different faces: a full 360°, seamless because the angle wraps.
  const axis = new Vector3(0.18, 1, 0.12).normalize();
  const q = new Quaternion();

  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 11);

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the object's width fixed relative to the stage, whatever its shape.
    camera.position.z = 11 * Math.max(1, 1 / camera.aspect) ** 0.9;
    camera.updateProjectionMatrix();
  };

  const renderAt = (turn: number) => {
    object.quaternion.copy(q.setFromAxisAngle(axis, turn * Math.PI * 2));
    renderer.render(scene, camera);
  };

  let on = false, turn = 0;
  const tick = (_time: number, deltaMs: number) => {
    turn = (turn + Math.min(0.05, deltaMs / 1000) / TURN_SECONDS) % 1;
    renderAt(turn);
  };
  const stop = () => { if (on) { on = false; ticker.remove(tick); } };

  resize();
  return {
    start: () => { if (!on) { on = true; ticker.add(tick); } },
    stop,
    resize,
    renderAt,
    dispose: () => {
      stop();
      geo.dispose(); chrome.dispose(); env.dispose(); pmrem.dispose(); renderer.dispose();
      releaseContext(renderer);
    },
  };
}
