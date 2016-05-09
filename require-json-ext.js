'use strict';

var path = require('path');
var helpers = require('./_helpers');
var jsonExtRe = /\.json$/;

module.exports = function(context) {
  var target = context.getFilename();

  var resolveOpts = {
    basedir: path.dirname(target),
    extensions: ['.js', '.json', '.node'],
  };

  function validate(node) {
    var id = helpers.getModuleId(node);
    if (jsonExtRe.test(id)) return;
    var resolved = helpers.resolveSync(id, resolveOpts);
    if (jsonExtRe.test(resolved)) {
      var basename = path.basename(id);
      var idNode = helpers.getIdNode(node);
      context.report({
        node: idNode,
        data: {basename: basename},
        message: '"{{basename}}" missing ".json" extension.',
        fix: function(fixer) {
          return fixer.insertTextAfter(idNode, '.json');
        },
      });
    }
  }

  return {
    CallExpression: function(node) {
      if (helpers.isRequireCall(node) ||
          helpers.isRequireResolveCall(node)) {
        validate(node);
      }
    },
    ImportDeclaration: function(node) {
      if (helpers.isImport(node)) {
        validate(node);
      }
    },
    ExportAllDeclaration: function(node) {
      if (helpers.isExportFrom(node)) {
        validate(node);
      }
    },
    ExportNamedDeclaration: function(node) {
      if (helpers.isExportFrom(node)) {
        validate(node);
      }
    },
  };
};

module.exports.schema = [];
