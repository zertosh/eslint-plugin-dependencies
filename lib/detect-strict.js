'use strict';

var babylon = require('babylon');
var fs = require('fs');

var searchRe = /\b(?:require|import)\b/;

var skipKeys = [
  'parent', '_paths', '__clone',
  'range', 'loc', 'tokens', 'start', 'end',
  'leadingComments', 'trailingComments', 'comments',
  'type', 'extra',
].reduce(function(acc, x) { acc[x] = null; return acc; }, {});

module.exports = function(filename, src, ast) {
  var collect = [];

  if (!src) src = read(filename);
  if (!src) return collect;

  // fast exit if the words "require"/"import" don't show up in the source.
  if (!searchRe.test(src)) return collect;

  if (!ast) ast = parse(src);
  if (!ast) return collect;

  var search = [ast];
  var node;
  while ((node = search.pop())) {
    // skip traversing branches that don't include the words we're looking for.
    var start = node.range ? node.range[0] : node.start;
    var end = node.range ? node.range[1] : node.end;
    var section = src.slice(start, end);
    if (!searchRe.test(section)) continue;

    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 'require' &&
      node.arguments[0] && (
        node.arguments[0].type === 'Literal' ||
        node.arguments[0].type === 'StringLiteral'
      )
    ) {
      collect.push(node.arguments[0].value);
    }

    if (
      node.type === 'ImportDeclaration' &&
      node.importKind === 'value'
    ) {
      collect.push(node.source.value);
    }

    for (var key in node) {
      if (skipKeys.hasOwnProperty(key)) continue;
      var prop = node[key];
      if (prop && typeof prop.type === 'string') {
        search.push(prop);
      } else if (Array.isArray(prop)) {
        for (var i = prop.length - 1; i >= 0; i--) {
          if (prop[i] && typeof prop[i].type === 'string') {
            search.push(prop[i]);
          }
        }
      }
    }
  }

  return collect;
};

function read(filename) {
  try {
    return fs.readFileSync(filename, 'utf8');
  } catch(err) {
    return null;
  }
}

function parse(src) {
  try {
    return babylon.parse(src, {
      sourceType: 'module',
      strictMode: true,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      plugins: [
        'flow',
        'jsx',
        'asyncFunctions',
        'asyncGenerators',
        'classConstructorCall',
        'classProperties',
        'decorators',
        'doExpressions',
        'exponentiationOperator',
        'exportExtensions',
        'functionBind',
        'functionSent',
        'objectRestSpread',
        'trailingFunctionCommas',
      ],
    });
  } catch(err) {
    return null;
  }
}
