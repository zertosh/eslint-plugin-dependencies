'use strict';

var resolve = require('resolve');
var cache;

module.exports = function(x, opts) {
  if (!cache) makeCache();
  var cacheKey = JSON.stringify([x, opts]);
  if (!(cacheKey in cache)) {
    try {
      cache[cacheKey] = resolve.sync(x, opts);
    } catch(err) {
      cache[cacheKey] = null;
    }
  }
  return cache[cacheKey];
};

function makeCache() {
  // The cache is preserved for the one tick that eslint runs in.
  cache = Object.create(null);
  process.nextTick(function() { cache = null; });
}
