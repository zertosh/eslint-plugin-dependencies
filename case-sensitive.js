'use strict';

var commondir = require('commondir');
var path = require('path');
var fs = require('fs');

var resolveSync = require('./_resolveSync');

var nodeExts = /\.(js|json|node)$/;

var readdirCache = Object.create(null);
function readdirSync(dirname) {
  if (!(dirname in readdirCache)) {
    try {
      readdirCache[dirname] = fs.readdirSync(dirname);
    } catch (err) {
      readdirCache[dirname] = null;
    }
  }
  return readdirCache[dirname];
}

// turns "/a/b/c.js" into ["/a", "/a/b", "/a/b/c.js"]
function pathSteps(pathString) {
  return pathString
    .split('/')
    .map(function(part, i, parts) {
      return parts.slice(0, i + 1).join('/');
    })
    .filter(Boolean);
}

// if more than one possible suggestion is found, return none.
function getCaseSuggestion(needle, haystack) {
  var found = false;
  var lneedle = needle.toLowerCase();
  for (var i = 0; i < haystack.length; i++) {
    if (lneedle === haystack[i].toLowerCase()) {
      if (found) return false;
      found = haystack[i];
    }
  }
  return found;
}

module.exports = function(context) {
  var target = context.getFilename();

  var resolveOpts = {
    basedir: path.dirname(target),
    extensions: ['.js', '.json', '.node'],
  };

  function validate(node, valueNode) {
    var value = valueNode.value;
    var resolved = resolveSync(value, resolveOpts);
    if (!resolved) return;
    var prefix = commondir([target, resolved]);
    pathSteps(resolved)
      .filter(function(step) {
        // remove the steps outside of our request
        return step.indexOf(prefix) !== -1;
      })
      .forEach(function(step, i, steps) {
        var basename = path.basename(step);
        var dirname = path.dirname(step);
        var dirlist = readdirSync(dirname);

        // compare the directory listing to the requested path. this works
        // because "resolve" resolves by concating the path segments from the
        // input, so the resolved path will have the incorrect case:
        if (dirlist.indexOf(basename) !== -1) return;

        var shouldRemoveExt =
          i === steps.length - 1 &&   // last step
          nodeExts.test(basename) &&  // expected
          !nodeExts.test(value);      // actual

        var suggestion = getCaseSuggestion(basename, dirlist);

        var incorrect = shouldRemoveExt
          ? basename.replace(nodeExts, '')
          : basename;

        var correct = shouldRemoveExt && suggestion
          ? suggestion.replace(nodeExts, '')
          : suggestion;

        if (correct) {
          context.report({
            node: valueNode,
            data: {incorrect: incorrect, correct: correct},
            message: 'Case mismatch in "{{incorrect}}", expected "{{correct}}".',
          });
        } else {
          context.report({
            node: valueNode,
            data: {incorrect: incorrect},
            message: 'Case mismatch in "{{incorrect}}".',
          });
        }
      });
  }

  return {
    CallExpression: function(node) {
      if (
        // require("…");
        node.callee.type === 'Identifier' &&
        node.callee.name === 'require' &&
        node.arguments[0] &&
        node.arguments[0].type === 'Literal'
      ) {
        validate(node, node.arguments[0]);
      } else if (
        // require.resolve("…");
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
      // export * from "…";
      if (node.source && node.source.type === 'Literal') {
        validate(node, node.source);
      }
    },
    ExportNamedDeclaration: function(node) {
      // export … from "…";
      if (node.source && node.source.type === 'Literal') {
        validate(node, node.source);
      }
    },
  };
};

module.exports.schema = [];
