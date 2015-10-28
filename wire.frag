precision mediump float;

varying vec3 vpos;
varying vec3 vnor;

void main() {
  gl_FragColor = vec4((1.0 - vpos.z * 0.05) * (vnor * 0.5 + 0.5), 1.0);
}
