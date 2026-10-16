"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

// Fits a flat "screen" exactly onto a phone screen in a photo: the content is laid
// out on a plain rectangle (BASE px wide), then one matrix3d maps its four corners
// onto the four measured corners of the glass, so it takes the photo's own
// perspective. The rectangle is clipped to the screen's rounded corners before the
// transform, so nothing can sit outside the glass.

export type Corners = { TL: [number, number]; TR: [number, number]; BR: [number, number]; BL: [number, number] }; // % of the image

const BASE = 300;

// Solves the 8 unknowns of the homography that maps src → dst (4 point pairs).
function homography(src: number[][], dst: number[][]) {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [X, Y] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]); b.push(X);
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]); b.push(Y);
  }
  // Gaussian elimination with partial pivoting
  for (let c = 0; c < 8; c++) {
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
    for (let r = c + 1; r < 8; r++) {
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const h = new Array(8).fill(0);
  for (let r = 7; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < 8; k++) s -= A[r][k] * h[k];
    h[r] = s / A[r][r];
  }
  // CSS matrix3d is column-major.
  return `matrix3d(${[h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, 1].map((v) => +v.toFixed(8)).join(",")})`;
}

export default function ScreenFit({
  corners,
  aspect,
  radius,
  className = "",
  style,
  children,
}: {
  corners: Corners;
  aspect: number; // screen height ÷ width
  radius: number; // corner radius ÷ width
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const el = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = el.current;
    const box = node?.parentElement;
    if (!node || !box) return;
    const h = BASE * aspect;
    const apply = () => {
      const { width, height } = box.getBoundingClientRect();
      // getBoundingClientRect includes ancestor transforms; offsetWidth does not.
      const w = box.offsetWidth || width, hh = box.offsetHeight || height;
      const px = (p: [number, number]) => [(p[0] / 100) * w, (p[1] / 100) * hh];
      node.style.transform = homography(
        [[0, 0], [BASE, 0], [BASE, h], [0, h]],
        [px(corners.TL), px(corners.TR), px(corners.BR), px(corners.BL)],
      );
      node.style.visibility = "visible";
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(box);
    return () => ro.disconnect();
  }, [corners, aspect]);

  return (
    <div
      ref={el}
      className={className}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: BASE,
        height: BASE * aspect,
        transformOrigin: "0 0",
        borderRadius: BASE * radius,
        overflow: "hidden",
        visibility: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
