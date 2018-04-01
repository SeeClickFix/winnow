var transformCoordinates = require('./transform-coordinates')
module.exports = function (coordinates, precision) {
  return transformCoordinates(coordinates, precision, function (coordinates, precision) {
    return coordinates.map(function (position) {
      return parseFloat(position.toFixed(precision))
    })
  })
}
