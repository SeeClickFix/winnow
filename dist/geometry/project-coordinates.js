var proj4 = require('proj4')
var transformCoordinates = require('./transform-coordinates')

module.exports = function projectCoordinates (coordinates, options) {
  if ( options === void 0 ) options = {};

  var inSR = options.inSR || 'EPSG:4326'
  var outSR = options.outSR || 'EPSG:3857'
  if (inSR === outSR) { return coordinates }

  return transformCoordinates(coordinates, { inSR: inSR, outSR: outSR }, function (coordinates, options) {
    if (coordinates[0]) {
      return proj4(options.inSR, options.outSR, coordinates)
    } else {
      return coordinates
    }
  })
}
