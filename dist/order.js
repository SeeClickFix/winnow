function createClause (options) {
  var selector = options.esri ? 'attributes' : 'properties'
  var order = options.order
  if (order) {
    var fields = order.reduce(function (fragment, sort) {
      var parts = sort.split(' ')
      var field = parts[0]
      var direction
      if (parts[1]) {
        direction = parts[1].toUpperCase()
      } else {
        direction = 'ASC'
      }
      var orderIsAgg = options.aggregates && options.aggregates.some(function (agg) {
        return field === agg.name
      })
      if (orderIsAgg) { return (fragment + " `" + field + "` " + direction + ",") }
      else { return (fragment + " " + selector + "->`" + field + "` " + direction + ",") }
    }, '').slice(0, -1)
    return (" ORDER BY " + fields)
  } else {
    return ''
  }
}

module.exports = { createClause: createClause }
