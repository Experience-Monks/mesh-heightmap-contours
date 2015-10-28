precision mediump float;

attribute vec3 position;
attribute vec3 normal;
uniform mat4 proj;
uniform mat4 view;
uniform mat4 model;
varying vec3 vpos;
varying vec3 vnor;

void main() {
  vpos = position;
  vnor = normal;
  gl_Position = proj * view * model * vec4(position, 1.0);
}
