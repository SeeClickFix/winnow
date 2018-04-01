module.exports = function (functions, target) {
  return functions.reduce(function (composed, fx) {
    if (typeof fx === 'string') {
      return (fx + "(" + composed + ")")
    } else {
      var method = Object.keys(fx)[0]
      return (method + "(" + composed + ",?)")
    }
  }, target)
}
