'use strict'
var Geometry = require('./geometry')
var Where = require('./where')
var Select = require('./select')
var Order = require('./order')

function create (options) {
  var query = Select.createClause(options)
  var where = Where.createClause(options)
  var geomFilter = Geometry.createClause(options)
  var order = Order.createClause(options)
  if (options.where || options.geometry) { query += ' WHERE ' }
  if (options.where) { query += where }
  if (options.geometry && !where) { query += geomFilter }
  if (options.geometry && where) { query += " AND " + geomFilter }
  if (options.order || options.orderByFields) { query += order }
  if (options.limit) { query += " LIMIT " + (options.limit) }
  // if (options.offset) query += ` OFFSET ${options.offset}` // handled in executeQuery.js
  return query
}

function params (features, options) {
  var params = []
  // NOTE: order matters here
  // Fields stage
  if (options.projection && !options.aggregates) { params.push(options.projection) }
  if (options.geometryPrecision) { params.push(options.geometryPrecision) }
  // From stage
  params.push(Array.isArray(features) ? features : [features])
  // Where stage
  if (options.geometry) { params.push(options.geometry) }
  return params
}

module.exports = { create: create, params: params }
