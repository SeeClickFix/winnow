var moment = require('moment')
var DATE_FORMATS = [moment.ISO_8601]

module.exports = function (properties) {
  return Object.keys(properties).map(function (name) {
    return {
      name: name,
      type: detectType(properties[name])
    }
  })
}

function detectType (value) {
  var type = typeof value

  if (type === 'number') {
    return isInt(value) ? 'Integer' : 'Double'
  } else if (type && moment(value, DATE_FORMATS, true).isValid()) {
    return 'Date'
  } else {
    return 'String'
  }
}

function isInt (value) {
  return Math.round(value) === value
}
