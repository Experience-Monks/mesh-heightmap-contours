var size = 128

var canvas = document.body.appendChild(document.createElement('canvas'))
var gl = require('gl-context')(canvas, render)
var camera = require('canvas-orbit-camera')(canvas)
var Geom = require('gl-geometry')
var clear = require('gl-clear')({ color: [1, 1, 1, 1] })
var toWire = require('gl-wireframe')
var mat4 = require('gl-mat4')
var Shader = require('gl-shader')
var glslify = require('glslify')
var simplex = new (require('simplex-noise'))
var heightmap = require('zeros')([size, size])
var fill = require('ndarray-fill')
var normals = require('normals')
var qs = require('querystring')
var query = qs.parse(String(window.location.search).slice(1)) || {}

var wireframe = 'wireframe' in query

var meshHeightmapContours = require('./')

fill(heightmap, function (x, y) {
  return (
    simplex.noise2D(x * 2 / size, y * 2 / size) +
    simplex.noise2D(x * 3.83 / size, y * 3.83 / size) * 0.5
  )
})

var complex = meshHeightmapContours(heightmap, {
  slices: 12
})

if (wireframe) {
  complex.cells = toWire(complex.cells)
}

camera.center[0] = size / 2
camera.center[1] = size / 2

complex = Geom(gl)
  .attr('position', complex.positions)
  .attr('normal', normals.vertexNormals(complex.cells, complex.positions))
  .faces(complex.cells)

window.addEventListener('resize'
  , require('canvas-fit')(canvas)
  , false
)

var proj = mat4.create()
var view = mat4.create()
var model = mat4.create()

var shader = Shader(gl
  , glslify('./wire.vert')
  , glslify('./wire.frag')
)

function render () {
  var width = canvas.width
  var height = canvas.height

  gl.viewport(0, 0, width, height)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  clear(gl)

  camera.view(view)
  camera.tick()
  mat4.perspective(proj
    , Math.PI / 4
    , width / height
    , 0.01
    , 1000
  )

  complex.bind(shader)
  shader.uniforms.proj = proj
  shader.uniforms.view = view
  shader.uniforms.model = model
  complex.draw(wireframe ? gl.LINES : gl.TRIANGLES)
}
