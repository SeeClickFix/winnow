module.exports = function (aggregates, groupBy, esri) {
  var selector = esri ? 'attributes' : 'properties'
  var select = aggregates.reduce(function (sql, agg) {
    var func
    if (agg.options) {
      func = (agg.type.toUpperCase()) + "(" + selector + "->`" + (agg.field) + "`, " + (agg.options) + ")"
    } else {
      func = (agg.type.toUpperCase()) + "(" + selector + "->`" + (agg.field) + "`)"
    }
    return (sql + " " + func + " as `" + (agg.name) + "`,")
  }, 'SELECT')
  if (groupBy) { return addGroupBy(select, groupBy, selector) }
  else { return ((select.slice(0, -1)) + " FROM ?") }
}

function addGroupBy (select, groupBy, selector) {
  var groups = groupBy.reduce(function (fragment, group) {
    return (fragment + " " + selector + "->`" + group + "`,")
  }, '').slice(0, -1)

  var fields = groupBy.reduce(function (fragment, group) {
    return (fragment + " " + selector + "->`" + group + "` as `" + group + "`,")
  }, '').slice(0, -1)

  return ((select.slice(0, -1)) + ", " + fields + " FROM ? GROUP BY " + groups)
}
