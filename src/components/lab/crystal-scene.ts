// C2 · WebGL crystal (glass round 4): a real slab of crystal, refracting a
// backdrop we own. Loaded on demand; renders only while on screen.
import {
  ACESFilmicToneMapping, CanvasTexture, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, PerspectiveCamera,
  PlaneGeometry, PMREMGenerator, Scene, SRGBColorSpace, WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type Backdrop = "object" | "glow" | "room";

const loadImage = (src: string) => new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });

export async function createCrystal(canvas: HTMLCanvasElement, backdrop: Backdrop) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;

  const camera = new PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 6);

  // The backdrop: drawn in 2D with the same composition as the C1 panels, so
  // the two can be compared like for like.
  const img = backdrop === "room" ? await loadImage("/media/websites/gallery-1000.webp") : backdrop === "object" ? await loadImage("/media/objects/02-reactivation-800.webp") : null;
  const bgCanvas = document.createElement("canvas");
  const bgTex = new CanvasTexture(bgCanvas);
  bgTex.colorSpace = SRGBColorSpace;
  const bg = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: bgTex, toneMapped: false }));
  bg.position.z = -2;
  scene.add(bg);

  const paint = (w: number, h: number) => {
    const s = Math.min(2, window.devicePixelRatio || 1);
    bgCanvas.width = Math.round(w * s); bgCanvas.height = Math.round(h * s);
    const g = bgCanvas.getContext("2d")!;
    g.scale(s, s);
    if (backdrop === "room" && img) {
      const k = Math.max(w / img.width, h / img.height);
      g.drawImage(img, (w - img.width * k) / 2, (h - img.height * k) / 2, img.width * k, img.height * k);
    } else {
      g.fillStyle = backdrop === "object" ? "#07080a" : "#0b0c0e";
      g.fillRect(0, 0, w, h);
      const glow = g.createRadialGradient(w * 0.55, h * 0.42, 0, w * 0.55, h * 0.42, Math.max(w, h) * 0.55);
      glow.addColorStop(0, "rgba(205,209,217,0.22)"); glow.addColorStop(1, "rgba(205,209,217,0)");
      g.fillStyle = glow; g.fillRect(0, 0, w, h);
      if (backdrop === "object" && img) {
        // The chrome object behind the slab's top-right edge and corner.
        const size = Math.min(330, w * 0.78);
        g.save();
        const cx = w / 2 + Math.min(160, w * 0.36), cy = h / 2 - 110;
        const fade = g.createRadialGradient(cx, cy, size * 0.31, cx, cy, size * 0.5);
        g.drawImage(img, cx - size / 2, cy - size / 2, size, size);
        g.globalCompositeOperation = "destination-in";
        fade.addColorStop(0, "rgba(0,0,0,1)"); fade.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = fade; g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = "destination-over";
        g.fillStyle = "#07080a"; g.fillRect(0, 0, w, h);
        g.restore();
      } else {
        // The mercury glow: a chrome ring, as in the C1 panel.
        const cx = w / 2 + Math.min(150, w * 0.34), cy = h / 2 - 106, R = Math.min(105, w * 0.24);
        const ring = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
        ring.addColorStop(0, "rgba(250,251,252,0.6)"); ring.addColorStop(0.38, "rgba(169,174,182,0.6)"); ring.addColorStop(0.58, "rgba(238,240,242,0.6)"); ring.addColorStop(1, "rgba(142,147,155,0.6)");
        g.strokeStyle = ring; g.lineWidth = 14; g.beginPath(); g.arc(cx, cy, R - 7, 0, Math.PI * 2); g.stroke();
      }
    }
    bgTex.needsUpdate = true;
  };

  // The slab: a rounded box of clear crystal. Real transmission, a high ior and
  // dispersion, so the backdrop bends hard at the thick edge and splits light.
  const slabMat = new MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0, transmission: 1, thickness: 0.7, ior: 1.75,
    dispersion: 3.5, specularIntensity: 0.8, envMapIntensity: 0.55, attenuationDistance: Infinity,
  });
  const slab = new Mesh(new RoundedBoxGeometry(1, 1, 0.42, 10, 0.2), slabMat);
  scene.add(slab);

  let w = 1, h = 1;
  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // The backdrop fills the view exactly at its depth.
    const dist = camera.position.z - bg.position.z;
    const vh = 2 * dist * Math.tan((camera.fov * Math.PI) / 360), vw = vh * camera.aspect;
    bg.scale.set(vw, vh, 1);
    paint(w, h);
    // The slab: about 360 px wide, as the C1 card, at the card's proportions.
    const fh = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    const unit = fh / h;
    const sw = Math.min(360, w * 0.8) * unit, sh = 300 * unit;
    slab.geometry.dispose();
    slab.geometry = new RoundedBoxGeometry(sw, sh, 0.3, 10, Math.min(0.24, sh * 0.13));
  };
  resize();

  let raf = 0, running = false, t0 = 0, el = 0;
  const frame = (t: number) => {
    slab.rotation.y = Math.sin(t * 0.32) * 0.07;
    slab.rotation.x = -0.05 + Math.cos(t * 0.26) * 0.035;
    renderer.render(scene, camera);
  };
  const loop = (now: number) => { if (!running) return; el = (now - t0) / 1000; frame(el); raf = requestAnimationFrame(loop); };

  return {
    start: () => { if (running) return; running = true; t0 = performance.now() - el * 1000; raf = requestAnimationFrame(loop); },
    stop: () => { running = false; cancelAnimationFrame(raf); },
    resize: () => { resize(); if (!running) frame(el); },
    still: () => frame(0),
    dispose: () => { running = false; cancelAnimationFrame(raf); slab.geometry.dispose(); slabMat.dispose(); bg.geometry.dispose(); (bg.material as MeshBasicMaterial).dispose(); bgTex.dispose(); pmrem.dispose(); renderer.dispose(); },
  };
}
