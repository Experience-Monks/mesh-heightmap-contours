# mesh-heightmap-contours

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Given a heightmap, generate a "contoured" terrain mesh, e.g.:

![](http://i.imgur.com/cooLqM6.png)

🚨 *There are still a few bugs but they'll be fixed soon* 🚨

## Usage

[![NPM](https://nodei.co/npm/mesh-heightmap-contours.png)](https://www.npmjs.com/package/mesh-heightmap-contours)

### `mesh = contourMesh(heightmap, [options])`

`heightmap` is a 2D [ndarray](https://github.com/scijs/ndarray) representing the heightmap. Its size ("shape") will determine the resolution of the final output.

Accepts the following options, which are passed onto [heightmap-contours](https://github.com/Jam3/heightmap-contours):

* `slices`: the number of slices to make through the heightmap, hence the number of output layers in the mesh.

Returns a [simplicial complex](https://github.com/mikolalysenko/simplicial-complex).

## See Also

* [heightmap-contours](https://github.com/Jam3/heightmap-contours)
* [surface-nets](https://github.com/mikolalysenko/surface-nets)

## License

MIT, see [LICENSE.md](http://github.com/Jam3/mesh-heightmap-contours/blob/master/LICENSE.md) for details.
