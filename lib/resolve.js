'use strict';

var resolve = require('resolve');

var cache = Object.create(null);

module.exports.sync = function(x, opts) {
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
