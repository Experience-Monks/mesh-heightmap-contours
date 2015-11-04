var removeOrphans = require('remove-orphan-vertices')
var simplicial = require('simplicial-complex')
var contours = require('heightmap-contours')
var combine = require('mesh-combine')
var copy = require('shallow-copy')
var clean = require('clean-pslg')
var cdt2d = require('cdt2d')

module.exports = meshHeightmapContours

function meshHeightmapContours (heightmap, options) {
  options = copy(options || {})
  options.border = true

  var cont = contours(heightmap, options)

  return combine([]
    .concat(meshExtrude(cont, options))
    .concat(meshSurface(cont, options))
  )
}

function meshSurface (contours, options) {
  return contours.map(function (layer, i) {
    clean(layer.positions, layer.cells)

    layer.positions = to3d(layer.positions, i)
    layer.cells = cdt2d(layer.positions, layer.cells, {
      exterior: false,
      interior: true,
      delaunay: true
    })

    return layer
  }, [])
}

function meshExtrude (contours) {
  var polyline = contours.reduce(function (polyline, contour, height) {
    var components = simplicial
      .connectedComponents(contour.cells)
      .map(function (cells) {
        return {
          positions: contour.positions,
          cells: cells,
          height: height
        }
      })
      .map(function (complex) {
        var height = complex.height
        complex = removeOrphans(complex.cells, complex.positions)
        complex.height = height
        return complex
      })

    return polyline.concat(components)
  }, []).map(function (contour) {
    var height = contour.height
    var top = -height - 1
    var bottom = -height
    var output = {
      positions: [],
      cells: []
    }

    for (var i = 0; i < contour.cells.length; i++) {
      var cell = contour.cells[i]
      var p0 = contour.positions[cell[0]]
      var p1 = contour.positions[cell[1]]

      output.positions.push([
        p0[0],
        p0[1],
        bottom
      ], [
        p1[0],
        p1[1],
        top
      ], [
        p0[0],
        p0[1],
        top
      ], [
        p1[0],
        p1[1],
        bottom
      ])

      output.cells.push(
        [i * 4 + 1, i * 4 + 2, i * 4],
        [i * 4 + 1, i * 4, i * 4 + 3]
      )
    }

    output = removeOrphans(output.cells, output.positions)

    return output
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
