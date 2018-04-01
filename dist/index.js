'use strict'
var sql = require('./sql')
var Query = require('./query')
var Params = require('./params')
var Options = require('./options')
var ref = require('./executeQuery');
var breaksQuery = ref.breaksQuery;
var aggregateQuery = ref.aggregateQuery;
var limitQuery = ref.limitQuery;
var standardQuery = ref.standardQuery;
var finishQuery = ref.finishQuery;
var _ = require('lodash')
var Winnow = {}

Winnow.query = function (input, options) {
  if ( options === void 0 ) options = {};

  /* First step is detect what kind of input this is.
  i.e. is it a collection object or an array of features?
  If it's a collection object we'll want to return it as such.
  Otherwise we can just return an array */
  var features = input
  if (input.features) {
    options.collection = _.omit(input, 'features')
    features = input.features
  }
  options = Options.prepare(options, features)

  var query = Query.create(options)
  if (process.env.NODE_ENV === 'test') { console.log(query, options) }

  if (options.classification) { return breaksQuery(features, query, options) }
  if (options.aggregates) { return aggregateQuery(features, query, options) }
  else if (options.limit) { return limitQuery(features, query, options) }
  else { return standardQuery(features, query, options) }
}

Winnow.prepareQuery = function (options) {
  options = Options.prepare(options)
  var statement = Query.create(options)
  var query = sql.compile(statement)
  var params = [null]
  if (options.projection) { params.push(options.projection) }
  if (options.geometryPrecision) { params.push(options.geometryPrecision) }
  if (options.geometry) { params.push(options.geometry) }

  return function (input) {
    /* Prepared queries can take either a collection object,
     a feature array, or a single feature.
     So detection is a little more complex */
    var features
    if (input.features) {
      options.collection = _.omit(input, 'features')
      features = input.features
    } else if (input.length) {
      features = input
    } else {
      // coerce to an array if this is a single feature
      features = [input]
    }
    params[0] = features
    var filtered = query(params)
    return finishQuery(filtered, options)
  }
}

Winnow.querySql = function (statement, params) {
  return sql(statement, params)
}

Winnow.prepareSql = function (statement) {
  var query = sql.compile(statement)

  return function (inParams) {
    var params = Params.prepare(inParams)
    var results = query(params)
    return results
  }
}

module.exports = Winnow
