"use client";

import type { Camera, Object3D, WebGLRenderer } from "three";

// Shared rules for the site's WebGL stages (the rings, the vitrine, the mercury
// close, the globe).

// WebKit (Safari, and every browser on iOS) composites a canvas at its full
// backing size on every frame; at 2× a full-width stage is four times the
// pixels of 1×, which is where Safari ran out of frame. It draws at 1.5×
// there, still sharper than the display can show on a moving object; the
// others keep 2×.
const isWebKit = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /AppleWebKit/.test(ua) && !/(Chrome|Chromium|Edg|OPR|Android)\//.test(ua);
};

export function glPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, isWebKit() ? 1.5 : 2);
}

// A scene's first build (three.js parsing, the environment map, the shader
// compiles) is one long task, ~60 ms in Safari, which has no parallel shader
// compile. Run it while the page is still: after the scroll has rested for a
// moment, or at the latest after `maxWait` ms. The stage shows its poster
// until then, so a later build is never seen. Returns a cancel.
export function whenScrollRests(fn: () => void, { rest = 180, maxWait = 30000 } = {}) {
  let done = false;
  let quiet: ReturnType<typeof setTimeout> | undefined;
  const fire = () => {
    if (done) return;
    done = true;
    clearTimeout(quiet);
    clearTimeout(cap);
    window.removeEventListener("scroll", onScroll);
    fn();
  };
  const onScroll = () => { clearTimeout(quiet); quiet = setTimeout(fire, rest); };
  const cap = setTimeout(fire, maxWait);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return () => { done = true; clearTimeout(quiet); clearTimeout(cap); window.removeEventListener("scroll", onScroll); };
}

// Compile a scene's programs before its first frame: off the main thread where
// the browser can (KHR_parallel_shader_compile), at once where it cannot
// (Safari). compileAsync without the extension gains nothing and warns in the
// console, so it is used only where the extension is there.
export async function compileScene(renderer: WebGLRenderer, scene: Object3D, camera: Camera) {
  if (renderer.extensions.has("KHR_parallel_shader_compile")) await renderer.compileAsync(scene, camera);
  else renderer.compile(scene, camera);
}

// Give a disposed renderer's context back at once instead of at GC: Safari
// caps live contexts, and a page change must not leave one behind. Firefox
// frees them promptly itself and logs every deliberate loss as a warning, so
// there the context goes with the canvas.
export function releaseContext(renderer: WebGLRenderer) {
  if (/Firefox\//.test(navigator.userAgent)) return;
  renderer.forceContextLoss();
}
