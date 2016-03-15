'use strict';

var commondir = require('commondir');
var path = require('path');
var resolve = require('./lib/resolve');
var fs = require('fs');

var externalRe = /^[^./]/;
var jsonExtRe = /\.json$/;

module.exports = function(context) {
  var target = context.getFilename();
  var basedir = path.dirname(target);

  function validate(node, value) {
    if (externalRe.test(value)) return;
    var resolved = resolve.sync(value, {basedir: basedir});
    if (!resolved) return;
    if (jsonExtRe.test(resolved) && !jsonExtRe.test(value)) {
      context.report({
        node: node.type === 'CallExpression' ? node.arguments[0] : node.source,
        data: {value: value},
        message: '"{{value}} needs ".json" extension',
      });
      // TODO: Add auto-fix
    }
  }

  return {
    CallExpression: function(node) {
      // require('dep')
      if (
        node.callee.type === 'Identifier' &&
        node.callee.name === 'require' &&
        node.arguments[0] &&
        node.arguments[0].type === 'Literal'
      ) {
        validate(node, node.arguments[0].value);
        return;
      }
      // require.resolve('dep')
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.computed === false &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'require' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'resolve' &&
        node.arguments[0] &&
        node.arguments[0].type === 'Literal'
      ) {
        validate(node, node.arguments[0].value);
        return;
      }
    },
    ImportDeclaration: function(node) {
      validate(node, node.source.value);
    },
  };
};

module.exports.schema = [];
