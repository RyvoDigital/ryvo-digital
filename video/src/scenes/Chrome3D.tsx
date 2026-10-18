import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { EXPO, clamp } from "../theme";

// 03 (the key) and 05 (the pen) as real chrome geometry: the two objects that
// have no footage (KIE-LOG.md, round 4). Mirror chrome lit by a studio room, so
// the light really slides over them as they turn. All motion comes from the
// frame number (never useFrame), so every render is identical.

// A dark studio, as in the stills: a black room with a few long softboxes,
// so the chrome reads as deep mirror with crisp white highlights. Prefiltered
// once, synchronously, so the very first frame already has its reflections.
const studioScene = () => {
  const room = new THREE.Scene();
  room.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x1a1c20, side: THREE.BackSide })));
  const strip = (w: number, h: number, pos: [number, number, number], rot: [number, number, number], k: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); room.add(m);
  };
  strip(4.5, 16, [-7, 2, 3], [0, Math.PI / 2.6, 0], 5); // key, left
  strip(2, 16, [7.5, 1, -2], [0, -Math.PI / 2.2, 0], 3); // rim, right
  strip(18, 3, [0, 9, 0], [Math.PI / 2, 0, 0], 3); // overhead
  strip(20, 20, [0, 12, 0], [Math.PI / 2, 0, 0], 0.45); // a soft dome above
  strip(14, 3, [0, 1, 12], [0, 0, 0], 0.55); // a broad, dim front fill
  strip(12, 1, [0, -6, 6], [-Math.PI / 4, 0, 0], 1.2); // a floor bounce
  return room;
};
const useStudio = () => {
  const { gl } = useThree();
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(studioScene(), 0.02).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  return env;
};

const chrome = (envMap: THREE.Texture) => new THREE.MeshPhysicalMaterial({ envMap, color: 0xe6e8ec, metalness: 1, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1 });
const dark = (envMap: THREE.Texture) => new THREE.MeshPhysicalMaterial({ envMap, color: 0x2a2c30, metalness: 1, roughness: 0.16, envMapIntensity: 1.1 });

// The key: a round bow with a hole, a blade with teeth, extruded and bevelled.
const keyGeometry = () => {
  const s = new THREE.Shape();
  s.absarc(0, 1.25, 1.05, -Math.PI * 0.36, Math.PI * 1.36, false);
  s.lineTo(-0.26, 0.05);
  s.lineTo(-0.26, -2.6);
  s.quadraticCurveTo(-0.26, -2.92, 0.02, -2.92);
  // the teeth, on the right edge of the blade, from the tip upwards
  const teeth: [number, number][] = [[0.36, -2.75], [0.36, -2.45], [0.2, -2.32], [0.42, -2.12], [0.42, -1.86], [0.24, -1.72], [0.46, -1.5], [0.46, -1.22], [0.26, -1.08], [0.26, -0.4]];
  for (const [x, y] of teeth) s.lineTo(x, y);
  s.lineTo(0.26, 0.05);
  s.absarc(0, 1.25, 1.05, -Math.PI * 0.36, -Math.PI * 0.36, false);
  const hole = new THREE.Path();
  hole.absarc(0.18, 1.62, 0.3, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.2, bevelSegments: 18, curveSegments: 64 });
  g.center();
  return g;
};

// The pen: a lathed cap and barrel with a ring, and a nib that tapers to a
// point (a flattened cone with a breather hole made by a dark disc).
const penParts = () => {
  const pts: THREE.Vector2[] = [];
  // the cap's rounded end (a quarter circle), its long side, a soft ring, the grip
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.sin(a) * 0.7, 2.4 + Math.cos(a) * 0.22)); }
  pts.push(new THREE.Vector2(0.7, 0.36));
  for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; pts.push(new THREE.Vector2(0.7 + Math.sin(a) * 0.07, 0.3 - i * 0.03)); }
  pts.push(new THREE.Vector2(0.66, -0.05), new THREE.Vector2(0.56, -0.2), new THREE.Vector2(0.5, -0.32), new THREE.Vector2(0.5, -0.78), new THREE.Vector2(0.42, -0.86));
  const body = new THREE.LatheGeometry(pts, 128);
  const nib = new THREE.ConeGeometry(0.44, 1.9, 96, 1, false);
  nib.rotateX(Math.PI); // the point downwards
  nib.scale(1, 1, 0.45);
  nib.translate(0, -0.86 - 0.95, 0);
  return { body, nib };
};

const Object3D = ({ which, start }: { which: "key" | "pen"; start: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame - start) / fps;
  const key = useMemo(() => (which === "key" ? keyGeometry() : null), [which]);
  const pen = useMemo(() => (which === "pen" ? penParts() : null), [which]);
  const env = useStudio();
  const mat = useMemo(() => chrome(env), [env]);
  const matDark = useMemo(() => dark(env), [env]);
  // in: it arrives from a quarter-turn away and settles; then turns slowly
  const arrive = interpolate(frame - start, [0, 34], [1, 0], { ...clamp, easing: EXPO });
  const spin = which === "key" ? -0.5 + t * 0.62 - arrive * 1.6 : 0.35 + Math.sin(t * 0.9) * 0.55 - arrive * 1.4;
  const bob = Math.sin(t * 1.4) * 0.08;
  return (
    <group position={[0, bob - arrive * 0.6, 0]} rotation={[0.12, 0, which === "key" ? -0.62 : -0.78]}>
      <group rotation={[0, spin, 0]} scale={which === "key" ? 0.95 : 0.8} position={[0, which === "key" ? 0 : -0.15, 0]}>
        {key && <mesh geometry={key} material={mat} />}
        {pen && (
          <>
            <mesh geometry={pen.body} material={mat} position={[0, 0.7, 0]} />
            <mesh geometry={pen.nib} material={mat} position={[0, 0.7, 0]} />
            <mesh material={matDark} position={[0, -1.25, 0.17]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.02, 24]} /></mesh>
          </>
        )}
      </group>
    </group>
  );
};

export const Chrome3D = ({ which, start = 0, size }: { which: "key" | "pen"; start?: number; size: number }) => (
  <ThreeCanvas width={size} height={size} camera={{ position: [0, 0, 8.2], fov: 32 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} style={{ width: size, height: size }}
    onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 0.85; gl.outputColorSpace = THREE.SRGBColorSpace; }}>
    <Object3D which={which} start={start} />
  </ThreeCanvas>
);
