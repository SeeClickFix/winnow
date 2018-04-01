'use strict'
var sql = require('./sql')
var Query = require('./query')
var ref = require('./generateBreaks/index');
var calculateClassBreaks = ref.calculateClassBreaks;
var calculateUniqueValueBreaks = ref.calculateUniqueValueBreaks;
var _ = require('lodash')

function breaksQuery (features, query, options) {
  var queriedData = standardQuery(features, query, options)
  if (queriedData === undefined || queriedData.features === undefined) { throw new Error('query response undefined') }
  if (queriedData.features.length === 0) { throw new Error('need features in order to classify') }

  var classification = options.classification
  if (classification.type === 'classes') {
    if (classification.breakCount <= 0) { throw new Error('breakCount must be positive: ' + classification.breakCount) }
    return calculateClassBreaks(queriedData.features, classification)
  } else if (classification.type === 'unique') {
    var ref = calculateUniqueValueBreaks(queriedData.features, classification);
    var options$1 = ref.options;
    var query$1 = ref.query;
    return aggregateQuery(queriedData.features, query$1, options$1)
  } else { throw new Error('unacceptable classification type: ' + classification.type) }
}

function aggregateQuery (features, query, options) {
  var params = Query.params(features, options)
  var filtered = sql(query, params)
  return finishQuery(filtered, options)
}

function limitQuery (features, query, options) {
  var filtered = []
  var limitExceeded = false
  if (options.offset) {
    if (options.offset >= features.length) { throw new Error('OFFSET >= features length: ' + options) }
    options.limit += options.offset
  }
  features.some(function (feature, i) {
    var result = processQuery(feature, query, options, i)
    if (result) { filtered.push(result) }
    if (filtered.length === (options.limit + 1)) {
      limitExceeded = true
      return true
    }
  })

  if (limitExceeded) { filtered = filtered.slice(0, -1) }

  if (options.collection) {
    options.collection.metadata = Object.assign({}, options.collection.metadata, { limitExceeded: limitExceeded })
  }

  return finishQuery(filtered, options)
}

function standardQuery (features, query, options) {
  var filtered = features.reduce(function (filteredFeatures, feature, i) {
    var result = processQuery(feature, query, options, i)
    if (result) { filteredFeatures.push(result) }
    return filteredFeatures
  }, [])
  return finishQuery(filtered, options)
}

function processQuery (feature, query, options, i) {
  var params = Query.params([feature], options)
  var result = sql(query, params)[0]

  if (result && options.toEsri) { return esriFy(result, options, i) }
  else { return result }
}

function esriFy (result, options, i) {
  if (options.dateFields.length) {
    // mutating dates has down stream consequences if the data is reused
    result.attributes = _.cloneDeep(result.attributes)
    options.dateFields.forEach(function (field) {
      result.attributes[field] = new Date(result.attributes[field]).getTime()
    })
  }

  var metadata = (options.collection && options.collection.metadata) || {}
  if (!metadata.idField) {
    result.attributes.OBJECTID = i
  }
  return result
}

function finishQuery (features, options) {
  if (options.offset) {
    if (options.offset >= features.length) { throw new Error('OFFSET >= features length: ' + options) }
    features = features.slice(options.offset)
  }
  if (options.groupBy) {
    return features
  } else if (options.aggregates) {
    return features[0]
  } else if (options.collection) {
    var collection = options.collection
    collection.features = features
    return collection
  } else {
    return features
  }
}

module.exports = { breaksQuery: breaksQuery, aggregateQuery: aggregateQuery, limitQuery: limitQuery, standardQuery: standardQuery, finishQuery: finishQuery }
