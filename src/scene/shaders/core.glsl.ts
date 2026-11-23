/** Sentinel Core: faceted normals from screen-space derivatives, Fresnel rim, velocity hue shift. */
export const coreVertex = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const coreFragment = /* glsl */ `
  uniform float uTime;
  uniform float uVelocity;
  uniform float uOpacity;
  uniform vec3 uBase;
  uniform vec3 uRim;
  varying vec3 vWorldPos;
  void main() {
    vec3 n = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
    vec3 v = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - abs(dot(n, v)), 2.2);
    float facet = 0.35 + 0.65 * max(dot(n, normalize(vec3(0.45, 0.8, 0.55))), 0.0);
    vec3 shift = vec3(uVelocity * 0.5, 0.0, -uVelocity * 0.35);
    vec3 color = mix(uBase * facet, uRim + shift, fresnel);
    color += 0.03 * sin(uTime * 0.7 + vWorldPos.y * 3.0);
    gl_FragColor = vec4(color, uOpacity * (0.72 + 0.28 * fresnel));
  }
`;
