function createClause (options) {
  if (!options.geometry) { return }
  var spatialPredicate = options.spatialPredicate || 'ST_Intersects'
  return (spatialPredicate + "(geometry, ?)")
}

module.exports = { createClause: createClause }
