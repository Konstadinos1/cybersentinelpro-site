/** Firewall Plane: crystalline hex lattice with a ripple from the last impact point. */
export const firewallVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const firewallFragment = /* glsl */ `
  uniform float uTime;
  uniform float uImpactAge;
  uniform vec2 uImpactUv;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uHit;
  varying vec2 vUv;
  float hexEdge(vec2 p) {
    p *= vec2(9.0, 7.0);
    vec2 r = vec2(1.0, 1.732);
    vec2 h = r * 0.5;
    vec2 a = mod(p, r) - h;
    vec2 b = mod(p - h, r) - h;
    vec2 g = dot(a, a) < dot(b, b) ? a : b;
    vec2 q = abs(g);
    float d = max(dot(q, normalize(r)), q.x);
    return smoothstep(0.42, 0.5, d);
  }
  void main() {
    float lines = hexEdge(vUv + vec2(0.0, uTime * 0.01));
    float dist = distance(vUv, uImpactUv);
    float ring = uImpactAge < 1.6 ? smoothstep(0.06, 0.0, abs(dist - uImpactAge * 0.45)) * (1.6 - uImpactAge) : 0.0;
    float vignette = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x) * smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
    vec3 color = mix(uColor, uHit, clamp(ring, 0.0, 1.0));
    float alpha = (0.05 + lines * 0.32 + ring * 0.8) * vignette * uOpacity;
    gl_FragColor = vec4(color, alpha);
  }
`;

/** Inbound node stream: each instance loops toward the plane on the GPU. */
export const nodeVertex = /* glsl */ `
  uniform float uTime;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    float t = fract(uTime * (0.08 + aSeed * 0.06) + aSeed);
    vec3 lane = vec3(mix(-5.5, -0.15, t), (fract(aSeed * 7.31) - 0.5) * 2.6, (fract(aSeed * 3.17) - 0.5) * 1.6);
    vAlpha = smoothstep(0.0, 0.15, t) * smoothstep(1.0, 0.85, t);
    vec3 local = (modelMatrix * instanceMatrix * vec4(position, 0.0)).xyz;
    vec4 world = modelMatrix * vec4(lane, 1.0);
    gl_Position = projectionMatrix * viewMatrix * vec4(world.xyz + local, 1.0);
  }
`;

export const nodeFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uColor, vAlpha * uOpacity * 0.8);
  }
`;
