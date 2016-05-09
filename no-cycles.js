'use strict';

var fs = require('fs');
var path = require('path');
var helpers = require('./_helpers');

/**
 * A reference to the eslint module is needed to be able to require the same
 * parser that used to parse the file being linted, as well as to use eslint's
 * own traverser.
 */

var eslintModule = (function() {
  var parent = module.parent;
  var eslintLibRe = /\/node_modules\/eslint\/lib\/[^/]+\.js$/;
  do {
    if (eslintLibRe.test(parent.filename)) {
      return parent;
    }
  } while ((parent = parent.parent));
  throw new Error('Could not find eslint');
})();

var Traverser = eslintModule.require('./util/traverser');
var traverser = new Traverser();

//------------------------------------------------------------------------------
// Utils
//------------------------------------------------------------------------------

var externalRe = /^[^./]/;
var skipExts = /\.(?:json|node)$/;
var searchRe = /\b(?:require|import|export)\b/;

function StorageObject() {}
StorageObject.prototype = Object.create(null);

function parse(src, parserPath, parserOptions) {
  var parser = eslintModule.require(parserPath);
  try {
    return parser.parse(src, parserOptions);
  } catch (err) {
    return null;
  }
}

function read(filename) {
  try {
    return fs.readFileSync(filename, 'utf8');
  } catch(err) {
    return null;
  }
}

function resolver(name, basedir) {
  if (!externalRe.test(name)) {
    var opts = {
      basedir: basedir,
      extensions: ['.js', '.json', '.node'],
    };
    var resolved = helpers.resolveSync(name, opts);
    if (resolved && !skipExts.test(resolved)) {
      return resolved;
    }
  }
  return null;
}

function relativizeTrace(trace, basedir) {
  var out = [];
  for (var i = 0; i < trace.length; i++) {
    out.push(path.relative(basedir, trace[i]));
    basedir = path.dirname(trace[i]);
  }
  return out;
}

var depsCache = new StorageObject();
function getDeps(filename, src, ast, context) {
  if (depsCache[filename]) return depsCache[filename];
  var found = depsCache[filename] = [];

  if (skipExts.test(filename)) return found;

  if (!src) src = read(filename);
  if (!src) return found;

  if (!searchRe.test(src)) return found;

  if (!ast) ast = parse(src, context.parserPath, context.parserOptions);
  if (!ast) return found;

  var basedir = path.dirname(filename);

  traverser.traverse(ast, {
    enter: function(node, parent) {
      if (helpers.isRequireCall(node) ||
          helpers.isImport(node) ||
          helpers.isExportFrom(node)) {
        var id = helpers.getModuleId(node);
        var resolved = resolver(id, basedir);
        if (resolved) found.push(resolved);
      }
    },
  });

  return found;
}

//------------------------------------------------------------------------------
// Rule
//------------------------------------------------------------------------------

module.exports = function(context) {
  var seen = new StorageObject();

  var target = context.getFilename();
  var basedir = path.dirname(target);

  function trace(filename, depth, refs) {
    if (!depth) depth = [];
    if (!refs) refs = [];
    var deps = getDeps(filename, null, null, context);
    depth.push(filename);
    for (var i = 0; i < deps.length; i++) {
      filename = deps[i];
      if (filename === target) {
        refs.push(depth.slice());
      } else if (!seen[filename]) {
        seen[filename] = true;
        trace(filename, depth, refs);
      }
    }
    depth.pop();
    return refs;
  }

  function validate(node) {
    var id = helpers.getModuleId(node);
    var resolved = resolver(id, basedir);
    if (resolved === target) {
      context.report({
        node: node,
        message: 'Self-reference cycle.',
      });
    } else {
      var refs = trace(resolved);
      for (var i = 0; i < refs.length; i++) {
        var prettyTrace = relativizeTrace(refs[i], basedir).join(' => ');
        context.report({
          node: node,
          data: {trace: prettyTrace},
          message: 'Cycle in {{trace}}.',
        });
      }
    }
  }

  return {
    CallExpression: function(node) {
      // no-cycles doesn't test for "require.resolve"
      if (helpers.isRequireCall(node)) {
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
    'Program:exit': function(node) {
      // since this ast has already been built, and traversing is cheap,
      // run it through references.deps so it's cached for future runs.
      var src = context.getSourceCode().text;
      getDeps(target, src, node);
    },
  };
};

module.exports.schema = [];
