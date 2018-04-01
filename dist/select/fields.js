function createClause (options) {
  if ( options === void 0 ) options = {};

  var propType = options.toEsri ? 'attributes' : 'properties'

  if (options.fields) {
    var fields
    if (typeof options.fields !== 'string') { fields = options.fields.join(',') }
    else { fields = options.fields.replace(/,\s+/g, ',') }
    if (options.toEsri) { return ("pick(properties, \"" + fields + "\") as " + propType) }
    else { return ("type, pick(properties, \"" + fields + "\") as " + propType) }
  } else {
    if (options.toEsri) { return ("properties as " + propType) }
    else { return ("type, properties as " + propType) }
  }
}

module.exports = { createClause: createClause }