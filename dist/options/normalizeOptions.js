var _ = require('lodash')
var convertFromEsri = require('../geometry/convert-from-esri')
var transformArray = require('../geometry/transform-array')
var transformEnvelope = require('../geometry/transform-envelope')
var projectCoordinates = require('../geometry/project-coordinates')
var detectFieldsType = require('../detect-fields-type')
var esriPredicates = {
  esriSpatialRelContains: 'ST_Contains',
  esriSpatialRelWithin: 'ST_Within',
  esriSpatialRelIntersects: 'ST_Intersects'
}

function normalizeCollection (options, features) {
  if ( features === void 0 ) features = [];

  if (!options.collection) { return undefined }
  var collection = _.cloneDeep(options.collection)
  var metadata = collection.metadata || {}
  if (!metadata.fields && features[0]) { metadata.fields = detectFieldsType(features[0].properties) }
  var oidField
  if (features[0]) {
    oidField = Object.keys(features[0].properties).filter(function (key) {
      return /objectid/i.test(key)
    })[0]
  }
  if (oidField && !metadata.idField) { metadata.idField = oidField }
  collection.metadata = metadata
  return collection
}

function normalizeDateFields (collection) {
  var dateFields = []
  if (collection && collection.metadata && collection.metadata.fields) {
    collection.metadata.fields.forEach(function (field, i) {
      if (field.type === 'Date') { dateFields.push(field.name) }
    })
  }
  return dateFields
}

function normalizeSpatialPredicate (options) {
  var predicate = options.spatialPredicate || options.spatialRel
  return esriPredicates[predicate] || predicate
}

function normalizeGeometry (options) {
  var geometry = options.geometry || options.bbox
  if (!geometry) { return } // ABORT
  var bboxCRS
  if (typeof geometry === 'string') {
    var split = geometry.split(',')
    geometry = split.slice(0, 4).map(parseFloat)
    bboxCRS = split[4]
  }
  if (Array.isArray(geometry)) {
    geometry = transformArray(geometry)
  } else if (geometry.xmin || geometry.xmin === 0) {
    geometry = transformEnvelope(geometry)
  } else if (geometry.x || geometry.rings || geometry.paths || geometry.points) {
    geometry = convertFromEsri(geometry)
  }
  var inSR = bboxCRS || normalizeInSR(options)
  if (inSR) { geometry.coordinates = projectCoordinates(geometry.coordinates, { inSR: inSR, outSR: 'EPSG:4326' }) }
  return geometry
}

function normalizeInSR (options) {
  var SR
  if (options.inSR) { SR = options.inSR }
  else if (options.geometry.spatialReference) {
    if (/WGS_1984_Web_Mercator_Auxiliary_Sphere/.test(options.geometry.spatialReference.wkt)) {
      SR = 3857
    } else {
      SR = options.geometry.spatialReference.latestWkid || options.geometry.spatialReference.wkid
    }
  }

  if (/EPSG:/.test(SR)) { return SR }
  else if (SR === 102100) { return "EPSG:3857" }
  else if (SR) { return ("EPSG:" + SR) }
  else { return 'EPSG:4326' }
}

function normalizeLimit (options) {
  return options.limit || options.resultRecordCount || options.count || options.maxFeatures
}

function normalizeOffset (options) {
  return options.offset || options.resultOffset
}

function normalizeProjection (options) {
  var projection
  // WFS :)
  if (options.srsname || options.srsName) { return options.srsname || options.srsName }
  // Winnow native
  if (options.projection) {
    projection = options.projection
  // GeoServices
  } else if (options.outSR) {
    projection = options.outSR.latestWkid || options.outSR.wkid || options.outSR.wkt || options.outSR
  }
  // Support the old esri code for web mercator
  if (projection === 102100) { return 'EPSG:3857' }
  if (typeof projection !== 'number') { return projection }
  else { return ("EPSG:" + projection) }
}

module.exports = {
  normalizeCollection: normalizeCollection,
  normalizeDateFields: normalizeDateFields,
  normalizeSpatialPredicate: normalizeSpatialPredicate,
  normalizeLimit: normalizeLimit,
  normalizeGeometry: normalizeGeometry,
  normalizeOffset: normalizeOffset,
  normalizeProjection: normalizeProjection
}
