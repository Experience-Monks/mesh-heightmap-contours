var removeOrphans = require('remove-orphan-vertices')
var toPolyline = require('planar-graph-to-polyline')
var simplicial = require('simplicial-complex')
var contours = require('heightmap-contours')
var combine = require('mesh-combine')
var copy = require('shallow-copy')
var cdt2d = require('cdt2d')

module.exports = meshHeightmapContours

function meshHeightmapContours (heightmap, options) {
  options = copy(options || {})
  options.border = true

  var cont = contours(heightmap, options)

  return combine([]
    .concat(meshSurface(cont, options))
    .concat(meshExtrude(cont, options))
  )
}

function meshSurface (contours, options) {
  var meshes = contours
    .reduce(function (layers, layer, i) {
      var complexes = simplicial.connectedComponents(layer.cells)
        .map(function (cells) {
          return {
            positions: layer.positions,
            cells: cells,
            height: i
          }
        })

      return layers.concat(complexes)
    }, [])
    .map(function (complex) {
      var height = complex.height
      complex = removeOrphans(complex.cells, complex.positions)
      complex.height = height
      return complex
    })
    .map(function (layer, i) {
      return {
        positions: to3d(layer.positions, layer.height),
        cells: cdt2d(layer.positions, layer.cells, {
          exterior: false,
          delaunay: true
        })
      }
    })

  return meshes
}

function meshExtrude (contours) {
  var polyline = contours.reduce(function (polyline, contour, height) {
    var lines = toPolyline(contour.cells, contour.positions)
    var edges = []

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i]

      for (var j = 0; j < line.length; j++) {
        var isHole = !!j
        var bound = line[j]

        if (bound.length < 6) continue

        for (var k = 0; k < bound.length; k++) {
          bound[k] = contour.positions[bound[k]]
        }

        edges.push(extrude(bound,
          isHole ? -height : -height - 1,
          isHole ? -height - 1 : -height
        ))
      }

    }

    return polyline.concat(edges)
  }, [])

  return polyline
}

function to3d (positions, j) {
  positions = positions.slice()

  for (var i = 0; i < positions.length; i++) {
    positions[i] = [
      positions[i][0],
      positions[i][1],
      -j
    ]
  }

  return positions
}

function extrude (line, bottom, top) {
  var positions = []
  var cells = []

  for (var i = 0; i < line.length; i++) {
    positions.push([
      line[i][0],
      line[i][1],
      bottom
    ], [
      line[i][0],
      line[i][1],
      top
    ])

    var k = i ? i : 0
    var j = i ? i - 1 : line.length - 1

    cells.push(
      [k * 2 + 1, k * 2, j * 2],
      [k * 2 + 1, j * 2, j * 2 + 1]
    )
  }

  return {
    positions: positions,
    cells: cells
  }
}
