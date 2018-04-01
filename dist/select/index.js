var aggregates = require('./aggregates')
var createGeometryClause = require('./geometry').createClause
var createFieldsClause = require('./fields').createClause

function createClause (options) {
  if (options.aggregates) { return aggregates(options.aggregates, options.groupBy, options.esri) }

  var fieldsClause = createFieldsClause(options)

  if (options.returnGeometry === false) {
    return (("SELECT " + fieldsClause + " FROM ?"))
  }

  return (("SELECT " + fieldsClause + ", " + (createGeometryClause(options)) + " FROM ?"))
}

module.exports = { createClause: createClause }
