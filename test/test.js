'use strict';

var assert = require('assert');
var dependencies = require('../');

assert.equal(dependencies.rulesConfig['case-sensitive'], 0);
assert.equal(
  dependencies.rules['case-sensitive'],
  require('../case-sensitive')
);

assert.equal(dependencies.rulesConfig['no-cycles'], 0);
assert.equal(
  dependencies.rules['no-cycles'],
  require('../no-cycles')
);

assert.equal(dependencies.rulesConfig['no-unresolved'], 0);
assert.equal(
  dependencies.rules['no-unresolved'],
  require('../no-unresolved')
);

require('./detect-strict');

require('./case-sensitive-test');
require('./no-cycles-test');
require('./no-unresolved-test');
