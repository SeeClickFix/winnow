const test = require('tape')
const winnow = require('../src')
const features = require('./fixtures/trees.json').features

test('No geometry property on features for option "returnedGeometryfalse', t => {
  t.plan(1)
  const options = {
    returnGeometry: false
  }
  const featureArr = winnow.query(features, options)
  t.equal(featureArr[0].hasOwnProperty('geometry'), false)
})
