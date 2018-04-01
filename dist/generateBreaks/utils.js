'use strict'
var ss = require('simple-statistics')

function adjustIntervalValue (value, index, array, isStddev) {
  // TODO: determine how to fix rounding on large decimal places (e.g., [1 - 2.33334], [2.3333*6* - 3])

  // if stddev classification method, create intervals by decreasing max value
  if (isStddev) {
    // lower
    if (index === array.length / 2 - 1) { return [value, array[index + 1]] }
    else if (index === array.length / 2) { return null }
    else if (index < array.length / 2 - 1) {
      var maxValue = array[index + 1] || array[0]
      if (isNaN(maxValue)) { throw new Error('Previous break value is non-numeric: ' + maxValue) }
      if (maxValue !== 0 && maxValue !== array[0]) {
        var divisor = Math.pow(10, getPrecision(maxValue))
        maxValue = Math.round((maxValue - (1 / divisor)) * divisor) / divisor
      }
      return [value, maxValue]
    }
    // otherwise, continue create intervals above mean interval
  }

  // create intervals by increasing min value
  var minValue = array[index - 1] || array[0]
  if (isNaN(minValue)) { throw new Error('Previous break value is non-numeric: ' + minValue) }
  if (minValue !== 0 && minValue !== array[0]) {
    var divisor$1 = Math.pow(10, getPrecision(minValue))
    minValue = Math.round((minValue + (1 / divisor$1)) * divisor$1) / divisor$1
  }
  return [minValue, value]
}

function getPrecision (a) {
  if (!isFinite(a)) { return 0 }
  var e = 1
  var p = 0
  while (Math.round(a * e) / e !== a) { e *= 10; p++ }
  return p
}

function calculateStdDevIntervals (values, classification) {
  if (!classification.stddev_intv) { throw new Error('must supply a standard deviation interval') }
  var intv = classification.stddev_intv
  if (intv !== 0.25 && intv !== 0.33 && intv !== 0.5 && intv !== 1) { throw new Error('Unacceptable interval value: ' + intv) }

  var mean = ss.mean(values)
  var stddev = ss.standardDeviation(values)
  var breakCount = classification.breakCount
  var intervals = []

  // create interval around mean
  var minMeanInt = Number((mean - (0.5 * stddev)).toFixed(6))
  var maxMeanInt = Number((mean + (0.5 * stddev)).toFixed(6))
  intervals.unshift(minMeanInt)
  intervals.push(maxMeanInt)

  // create positive & negative stddev intervals
  var maxPosStd, minNegStd
  for (var i = 1; i <= breakCount; i++) {
    minNegStd = Number((minMeanInt - (i * stddev)).toFixed(6))
    maxPosStd = Number((maxMeanInt + (i * stddev)).toFixed(6))
    intervals.unshift(minNegStd)
    intervals.push(maxPosStd)
  }
  return intervals
}

module.exports = { adjustIntervalValue: adjustIntervalValue, calculateStdDevIntervals: calculateStdDevIntervals }
