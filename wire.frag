precision mediump float;

varying vec3 vpos;
varying vec3 vnor;

#pragma glslify: hsv = require('glsl-hsv2rgb')

void main() {
  float surface = max(0.0, dot(vnor, vec3(0, 0, 1)));
  gl_FragColor = vec4(surface * hsv(vec3(10.432423 * vpos.z, 0.5, 1.0)), 1.0);
}
