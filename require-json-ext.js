'use strict';

var path = require('path');

var resolveSync = require('./_resolveSync');

var jsonExtRe = /\.json$/;

module.exports = function(context) {
  var target = context.getFilename();

  var resolveOpts = {
    basedir: path.dirname(target),
    extensions: ['.js', '.json', '.node'],
  };

  function validate(node, valueNode) {
    var value = valueNode.value;
    if (jsonExtRe.test(value)) return;
    var resolved = resolveSync(value, resolveOpts);
    if (jsonExtRe.test(resolved)) {
      context.report({
        node: node.type === 'CallExpression' ? node.arguments[0] : node.source,
        data: {basename: path.basename(value)},
        message: '"{{basename}}" needs ".json" extension',
        fix: function(fixer) {
          return fixer.insertTextAfter(valueNode, '.json');
        },
      });
    }
  }

  return {
    CallExpression: function(node) {
      if (
        // require(…);
        node.callee.type === 'Identifier' &&
        node.callee.name === 'require' &&
        node.arguments[0] &&
        node.arguments[0].type === 'Literal'
      ) {
        validate(node, node.arguments[0]);
      } else if (
        // require.resolve(…);
        node.callee.type === 'MemberExpression' &&
        node.callee.computed === false &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'require' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'resolve' &&
        node.arguments[0] &&
        node.arguments[0].type === 'Literal'
      ) {
        validate(node, node.arguments[0]);
      }
    },
    ImportDeclaration: function(node) {
      // import … from "…";
      // import "…";
      validate(node, node.source);
    },
    ExportAllDeclaration: function(node) {
      // export * from …;
      if (node.source && node.source.type === 'Literal') {
        validate(node, node.source);
      }
    },
    ExportNamedDeclaration: function(node) {
      // export … from …;
      if (node.source && node.source.type === 'Literal') {
        validate(node, node.source);
      }
    },
  };
};

module.exports.schema = [];
