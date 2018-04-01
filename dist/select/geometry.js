var compose = require('./compose')
function createClause (options) {
  if ( options === void 0 ) options = {};

  var funcs = []
  if (options.projection) { funcs.push({ project: true }) }
  if (options.geometryPrecision) { funcs.push({ reducePrecision: true }) }
  if (options.toEsri) { funcs.push('esriGeom') }

  return funcs.length ? compose(funcs, 'geometry') + ' as geometry' : 'geometry'
}

module.exports = { createClause: createClause }
