'use strict';

var commondir = require('commondir');
var fs = require('fs');
var path = require('path');
var resolve = require('resolve');

var helpers = require('./_helpers');

var nodeExts = /\.(js|json|node)$/;

var _readdirCache = helpers.oneTickCache();
function readdirSync(dirname) {
  var readdirCache = _readdirCache();
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
    .split(path.sep)
    .map(function(part, i, parts) {
      return parts.slice(0, i + 1).join(path.sep);
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

  if (context.options[0] && context.options[0].paths) {
    resolveOpts.paths = context.options[0].paths.map(function(single_path) {
      return path.resolve(single_path);
    });
  }

  function validate(node) {
    var id = helpers.getModuleId(node);
    var resolved = helpers.resolveSync(id, resolveOpts, context);
    if (!resolved || resolve.isCore(resolved)) return;
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

        // we don't have permission?
        if (!dirlist) return;

        // compare the directory listing to the requested path. this works
        // because "resolve" resolves by concating the path segments from the
        // input, so the resolved path will have the incorrect case:
        if (dirlist.indexOf(basename) !== -1) return;

        var shouldRemoveExt =
          i === steps.length - 1 &&   // last step
          nodeExts.test(basename) &&  // expected
          !nodeExts.test(id);         // actual

        var suggestion = getCaseSuggestion(basename, dirlist);

        var incorrect = shouldRemoveExt
          ? basename.replace(nodeExts, '')
          : basename;

        var correct = shouldRemoveExt && suggestion
          ? suggestion.replace(nodeExts, '')
          : suggestion;

        var idNode = helpers.getIdNode(node);

        if (correct) {
          context.report({
            node: idNode,
            data: {incorrect: incorrect, correct: correct},
            message: 'Case mismatch in "{{incorrect}}", expected "{{correct}}".',
          });
        } else {
          context.report({
            node: idNode,
            data: {incorrect: incorrect},
            message: 'Case mismatch in "{{incorrect}}".',
          });
        }
      });
  }

  return {
    CallExpression: function(node) {
      if (helpers.isRequireCall(node) ||
          helpers.isRequireResolveCall(node)) {
        validate(node);
      }
    },
    ImportDeclaration: function(node) {
      if (helpers.isImport(node) || helpers.isImportType(node)) {
        validate(node);
      }
    },
    ExportAllDeclaration: function(node) {
      if (helpers.isExportFrom(node) || helpers.isExportTypeFrom(node)) {
        validate(node);
      }
    },
    ExportNamedDeclaration: function(node) {
      if (helpers.isExportFrom(node) || helpers.isExportTypeFrom(node)) {
        validate(node);
      }
    },
  };
};

module.exports.schema = {
  paths: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
};
