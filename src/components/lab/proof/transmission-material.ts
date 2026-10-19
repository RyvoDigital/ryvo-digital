// A plain three.js port of pmndrs drei's MeshTransmissionMaterial (MIT,
// github.com/pmndrs/drei, src/core/MeshTransmissionMaterial.tsx), updated for
// three r186's shader chunks. It layers onto MeshPhysicalMaterial: three's own
// transmission stays off (material.transmission = 0, so three never renders its
// transmission pass), and we sample a buffer we render ourselves, several times
// per pixel, with a per-channel ior for chromatic aberration and a thickness
// smear for anisotropic blur.
import { Color, MeshPhysicalMaterial, type MeshPhysicalMaterialParameters, type Texture } from "three";

export type TransmissionUniforms = {
  uTransmission: { value: number };
  uThickness: { value: number };
  uChroma: { value: number };
  uAniso: { value: number };
  uAttenDist: { value: number };
  uAttenColor: { value: Color };
  uBuffer: { value: Texture | null };
  // Light from below (the vitrine's slot): off unless uUpOn is 1.
  uUpOn: { value: number };
  uUpY: { value: number }; // the height of the light
  uUpZ: { value: number }; // the slot's depth position
  uUpCol: { value: Color };
  uUpHalf: { value: number }; // the slot's half length: the graze is keyed to its segment
};

export class TransmissionMaterial extends MeshPhysicalMaterial {
  readonly t: TransmissionUniforms;

  constructor(params: MeshPhysicalMaterialParameters = {}, samples = 10) {
    super({ roughness: 0, metalness: 0, ...params, transmission: 0 });
    this.t = {
      uTransmission: { value: 1 },
      uThickness: { value: 0.5 },
      uChroma: { value: 0.05 },
      uAniso: { value: 0.1 },
      uAttenDist: { value: 0 },
      uAttenColor: { value: new Color(1, 1, 1) },
      uBuffer: { value: null },
      uUpOn: { value: 0 },
      uUpY: { value: 0 },
      uUpZ: { value: 0 },
      uUpCol: { value: new Color(1, 1, 1) },
      uUpHalf: { value: 0 },
    };
    this.customProgramCacheKey = () => `ryvo-transmission-${samples}`;
    this.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.t);
      shader.defines = { ...(shader.defines ?? {}), USE_TRANSMISSION: "", MTM_SAMPLES: samples };

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <transmission_pars_fragment>",
        /* glsl */ `
#ifdef USE_TRANSMISSION
  uniform float uTransmission;
  uniform float uThickness;
  uniform float uChroma;
  uniform float uAniso;
  uniform float uAttenDist;
  uniform vec3 uAttenColor;
  uniform sampler2D uBuffer;
  uniform float uUpOn;
  uniform float uUpY;
  uniform float uUpZ;
  uniform vec3 uUpCol;
  uniform float uUpHalf;
  uniform mat4 modelMatrix;
  uniform mat4 projectionMatrix;
  varying vec3 vWorldPosition;

  // Per-pixel noise, so the samples dither instead of banding.
  float mtmRand(float n) {
    return fract(sin(n * 12.9898 + dot(gl_FragCoord.xy, vec2(0.0129, 0.0781))) * 43758.5453);
  }

  vec3 mtmRay(const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 m) {
    vec3 r = refract(-v, normalize(n), 1.0 / ior);
    vec3 s = vec3(length(m[0].xyz), length(m[1].xyz), length(m[2].xyz));
    return normalize(r) * thickness * s;
  }

  vec3 mtmSample(const in vec3 n, const in vec3 v, const in vec3 pos, const in float ior, const in float thickness) {
    vec3 exitPos = pos + mtmRay(n, v, thickness, ior, modelMatrix);
    vec4 ndc = projectionMatrix * viewMatrix * vec4(exitPos, 1.0);
    vec2 uv = ndc.xy / ndc.w * 0.5 + 0.5;
    return texture2D(uBuffer, clamp(uv, 0.0, 1.0)).rgb;
  }
#endif
`,
      );

      // The glass catching light from below: bright glints where the lower
      // edges turn away (Fresnel), and a soft gradient rising up the faces.
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
#ifdef USE_TRANSMISSION
  if (uUpOn > 0.5) {
    vec3 upV = normalize(cameraPosition - vWorldPosition);
    vec3 upN = transformNormalByInverseViewMatrix(normal, viewMatrix);
    float upF = pow(1.0 - clamp(abs(dot(upN, upV)), 0.0, 1.0), 2.2);
    float upH = max(vWorldPosition.y - uUpY, 0.0);
    vec2 upD = vec2(max(abs(vWorldPosition.x) - uUpHalf, 0.0), vWorldPosition.z - uUpZ);
    float upLat = exp(-dot(upD, upD) / 2.6);
    float glint = exp(-upH / 0.07) * upF * 1.6;
    float wash = exp(-upH / 0.8) * (0.004 + upF * 0.05);
    totalEmissiveRadiance += uUpCol * upLat * (glint + wash);
  }
#endif`,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <transmission_fragment>",
        /* glsl */ `
#ifdef USE_TRANSMISSION
  material.transmission = uTransmission;
  material.transmissionAlpha = 1.0;
  material.thickness = uThickness;

  vec3 pos = vWorldPosition;
  vec3 v = normalize(cameraPosition - pos);
  vec3 n = transformNormalByInverseViewMatrix(normal, viewMatrix);

  vec3 acc = vec3(0.0);
  float seed = 0.0;
  // drei jitters each pixel's samples at random; over black that dithers a
  // bright edge into speckles. Evenly spaced samples give a smooth spectrum.
  float jitter = 0.5;
  float smear = uThickness * max(pow(roughnessFactor, 0.33), uAniso);
  // The colour split grows with the grazing angle: none on a face seen
  // straight on, a faint spectrum where the bevels turn away.
  float graze = 1.0 - clamp(abs(dot(normalize(n), v)), 0.0, 1.0);
  float chroma = uChroma * graze * graze;
  for (int i = 0; i < MTM_SAMPLES; i++) {
    float k = (float(i) + jitter) / float(MTM_SAMPLES);
    vec3 rnd = normalize(vec3(mtmRand(seed++) - 0.5, mtmRand(seed++) - 0.5, mtmRand(seed++) - 0.5));
    vec3 sn = normalize(n + roughnessFactor * roughnessFactor * 2.0 * rnd * pow(mtmRand(seed++), 0.33));
    float th = material.thickness + smear * k;
    acc.r += mtmSample(sn, v, pos, material.ior, th).r;
    acc.g += mtmSample(sn, v, pos, material.ior * (1.0 + chroma * k), th).g;
    acc.b += mtmSample(sn, v, pos, material.ior * (1.0 + 2.0 * chroma * k), th).b;
  }
  acc /= float(MTM_SAMPLES);

  if (uAttenDist > 0.0) acc *= exp(log(max(uAttenColor, vec3(1e-4))) / uAttenDist * material.thickness);
  vec3 F = EnvironmentBRDF(n, v, material.specularColorBlended, material.specularF90, material.roughness);
  vec3 transmitted = (1.0 - F) * acc * material.diffuseContribution;
  totalDiffuse = mix(totalDiffuse, transmitted, material.transmission);
#endif
`,
      );
    };
  }
}
