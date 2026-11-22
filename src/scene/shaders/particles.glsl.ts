/** Instanced particle lattice: drift and pointer repulsion run entirely on the GPU. */
export const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  attribute float aSeed;
  varying float vGlow;
  void main() {
    vec3 center = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    float t = uTime * 0.18 + aSeed * 6.2831;
    center += vec3(sin(t), cos(t * 1.3), sin(t * 0.7)) * 0.07;
    vec4 worldCenter = modelMatrix * vec4(center, 1.0);
    vec4 clip = projectionMatrix * viewMatrix * worldCenter;
    vec2 away = clip.xy / clip.w - uPointer;
    float push = smoothstep(0.38, 0.0, length(away));
    vec3 displaced = worldCenter.xyz + normalize(vec3(away, 0.25)) * push * 0.5;
    vec3 local = (modelMatrix * instanceMatrix * vec4(position, 0.0)).xyz;
    vGlow = 0.35 + push;
    gl_Position = projectionMatrix * viewMatrix * vec4(displaced + local, 1.0);
  }
`;

export const particleFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vGlow;
  void main() {
    gl_FragColor = vec4(uColor * vGlow, uOpacity * min(1.0, vGlow));
  }
`;
