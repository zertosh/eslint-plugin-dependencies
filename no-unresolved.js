'use strict';

var path = require('path');
var helpers = require('./_helpers');

module.exports = function(context) {
  var target = context.getFilename();

  var resolveOpts = {
    basedir: path.dirname(target),
    extensions: ['.js', '.json', '.node'],
  };

  function validate(node) {
    var id = helpers.getModuleId(node);
    var resolved = helpers.resolveSync(id, resolveOpts);
    if (!resolved) {
      context.report({
        node: helpers.getIdNode(node),
        data: {id: id},
        message: '"{{id}}" does not exist.',
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
