'use strict'
var Classifier = require('classybrew')
var Options = require('../options')
var Query = require('../query')
var ref = require('./normalizeClassBreaks');
var getFieldValues = ref.getFieldValues;
var normalizeClassBreaks = ref.normalizeClassBreaks;
var ref$1 = require('./utils');
var adjustIntervalValue = ref$1.adjustIntervalValue;
var calculateStdDevIntervals = ref$1.calculateStdDevIntervals;

function calculateClassBreaks (features, classification) {
  if (!classification.method) { throw new Error('must supply classification.method') }
  if (!classification.breakCount) { throw new Error('must supply classification.breakCount') }

  var isStdDev = classification.method === 'stddev'
  var values = getFieldValues(features, classification.field)
  // limit break count to num values
  if (classification.breakCount > values.length) { classification.breakCount = values.length }

  // calculate break ranges [ [a-b], [b-c], ...] from input values
  return classifyClassBreaks(values, features, classification)
    .map(function (value, index, array) {
      // adjust min or max interval value so break ranges don't overlap [ [0-1], [1.1-2], ...]
      return adjustIntervalValue(value, index, array, isStdDev)
    })
    .slice(isStdDev ? 0 : 1) // if not stddev classification, remove first interval
    .filter(function (currBreak) { return currBreak !== null }) // remove null breaks within stddev classification
}

function classifyClassBreaks (values, features, classification) {
  if (classification.normType) { values = normalizeClassBreaks(values, features, classification) }
  var classifier = new Classifier()
  classifier.setSeries(values)
  classifier.setNumClasses(classification.breakCount)

  switch (classification.method) {
    case 'equalInterval': return classifier.classify('equal_interval')
    case 'naturalBreaks': return classifier.classify('jenks')
    case 'quantile': return classifier.classify('quantile')
    case 'geomInterval': throw new Error('Classification method not yet supported')
    case 'stddev': return calculateStdDevIntervals(values, classification)
    default: throw new Error('invalid classificationMethod: ' + classification.method)
  }
}

function calculateUniqueValueBreaks (features, classification) {
  if (classification.fields.length > 3) { throw new Error('Cannot classify using more than three fields') }
  classification.fields.map(function (field) {
    if (!features[0].properties[field]) { throw new Error('Unknown field: ' + field) }
  })

  var options = {
    aggregates: [
      {
        type: 'count',
        field: classification.fields[0], // arbitrary field choice
        name: 'count'
      }
    ],
    groupBy: classification.fields
  }
  options = Options.prepare(options, features)
  var query = Query.create(options)
  return { options: options, query: query }
}

module.exports = { calculateClassBreaks: calculateClassBreaks, calculateUniqueValueBreaks: calculateUniqueValueBreaks }
