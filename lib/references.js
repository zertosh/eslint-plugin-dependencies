'use strict';

var detect = require('./detect-strict');
var path = require('path');
var resolve = require('./resolve');

var cache = Object.create(null);

var externalRe = /^[^./]/;
var jsonRe = /\.json$/;

function resolver(name, basedir) {
  if (!externalRe.test(name)) {
    var resolved = resolve.sync(name, {basedir: basedir});
    if (resolved && !jsonRe.test(resolved)) {
      return resolved;
    }
  }
}

function deps(filename, src, ast) {
  if (cache[filename]) return cache[filename];
  var found = cache[filename] = [];

  if (jsonRe.test(filename)) return found;

  var ret = detect(filename, src, ast);
  if (!ret.length) return found;

  var basedir = path.dirname(filename);
  for (var i = 0; i < ret.length; i++) {
    var resolved = resolver(ret[i], basedir);
    if (resolved) found.push(resolved);
  }

  return found;
}

module.exports.deps = deps;
module.exports.resolver = resolver;
