/** Service Monolith chamber: translucent body with bright edges and an inner light column. */
export const chamberVertex = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  void main() {
    vLocal = position;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const chamberFragment = /* glsl */ `
  uniform float uTime;
  uniform float uFocus;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uSize;
  varying vec3 vLocal;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  void main() {
    vec3 v = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), v)), 2.0);
    vec3 edge = smoothstep(uSize * 0.5 - 0.04, uSize * 0.5, abs(vLocal));
    float edgeMask = clamp(edge.x * edge.y + edge.y * edge.z + edge.x * edge.z, 0.0, 1.0);
    float column = exp(-pow(length(vLocal.xz) * 3.2, 2.0)) * (0.6 + 0.4 * sin(uTime * 1.6 + vLocal.y * 2.0));
    float glow = 0.12 + fresnel * 0.5 + edgeMask * 0.9 + column * 0.6;
    gl_FragColor = vec4(uColor * glow * (0.45 + 0.55 * uFocus), uOpacity * (0.25 + 0.6 * glow));
  }
`;
