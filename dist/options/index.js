var _ = require('lodash')
var ref = require('./normalizeSQL');
var normalizeWhere = ref.normalizeWhere;
var normalizeFields = ref.normalizeFields;
var normalizeOrder = ref.normalizeOrder;
var normalizeAggregates = ref.normalizeAggregates;
var normalizeGroupBy = ref.normalizeGroupBy;
var ref$1 = require('./normalizeOptions');
var normalizeCollection = ref$1.normalizeCollection;
var normalizeDateFields = ref$1.normalizeDateFields;
var normalizeSpatialPredicate = ref$1.normalizeSpatialPredicate;
var normalizeLimit = ref$1.normalizeLimit;
var normalizeGeometry = ref$1.normalizeGeometry;
var normalizeOffset = ref$1.normalizeOffset;
var normalizeProjection = ref$1.normalizeProjection;
var ref$2 = require('./normalizeClassification');
var normalizeClassification = ref$2.normalizeClassification;

function prepare (options, features) {
  var prepared = _.merge({}, options, {
    collection: normalizeCollection(options, features),
    where: normalizeWhere(options),
    geometry: normalizeGeometry(options),
    spatialPredicate: normalizeSpatialPredicate(options),
    fields: normalizeFields(options),
    order: normalizeOrder(options),
    aggregates: normalizeAggregates(options),
    groupBy: normalizeGroupBy(options),
    limit: normalizeLimit(options),
    offset: normalizeOffset(options),
    projection: normalizeProjection(options),
    classification: normalizeClassification(options)
  })
  prepared.dateFields = normalizeDateFields(prepared.collection)
  if (prepared.where === '1=1') { delete prepared.where }
  return prepared
}

module.exports = { prepare: prepare }
