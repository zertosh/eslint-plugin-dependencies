'use strict';

var references = require('./lib/references');
var path = require('path');

module.exports = function(context) {
  var seen = Object.create(null);

  var target = context.getFilename();
  var basedir = path.dirname(target);

  function trace(filename, depth, refs) {
    if (!depth) depth = [];
    if (!refs) refs = [];
    var deps = references.deps(filename);
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

  function resolveAndReport(node, value) {
    var resolved = references.resolver(value, basedir);
    if (resolved === target) {
      context.report({
        node: node,
        data: {trace: prettyTrace},
        message: 'Self-reference cycle',
      });
    } else {
      var refs = trace(resolved);
      for (var i = 0; i < refs.length; i++) {
        var prettyTrace = relativizeTrace(refs[i], basedir).join(' => ');
        context.report({
          node: node,
          data: {trace: prettyTrace},
          message: 'Cycle in {{trace}}',
        });
      }
    }
  }

  return {
    CallExpression: function(node) {
      if (
        node.callee.type === 'Identifier' &&
        node.callee.name === 'require' &&
        node.arguments[0] &&
        node.arguments[0].type === 'Literal'
      ) {
        var value = node.arguments[0].value;
        resolveAndReport(node, value);
      }
    },
    ImportDeclaration: function(node) {
      if (node.importKind === 'value') {
        var value = node.source.value;
        resolveAndReport(node, value);
      }
    },
    'Program:exit': function(node) {
      // since this ast has already been built, and traversing is cheap,
      // run it through references.deps so it's cached for future runs.
      references.deps(target, context.getSourceCode().text, node);
    },
  };
};

module.exports.schema = [];

function relativizeTrace(trace, basedir) {
  var out = [];
  for (var i = 0; i < trace.length; i++) {
    out.push(path.relative(basedir, trace[i]));
    basedir = path.dirname(trace[i]);
  }
  return out;
}

