'use strict';

var assert = require('assert');
var detect = require('../lib/detect-strict');
var path = require('path');

[
  {
    filename: 'require-import/empties.js',
    expected: ['', 'a'],
  },
  {
    filename: 'require-import/nested.js',
    expected: ['b', 'c', 'd', 'e', 'f', 'i', 'h', 'g', 'a'],
  },
].forEach(function(x) {
  var actual = detect(path.join(__dirname, x.filename));
  assert.deepEqual(actual, x.expected);
});

