'use strict';

var resolve = require('resolve');

function StorageObject() {}
StorageObject.prototype = Object.create(null);

function TickCache() {
  this._data = new StorageObject();
  this._willClear = false;
}
TickCache.prototype.get = function(key) {
  return this._data[key];
}
TickCache.prototype.set = function(key, value) {
  this._data[key] = value;
  if (!this._willClear) {
    this._willClear = true;
    process.nextTick(TickCache.bind(this));
  }
}

// The resolve cache is shared by all the rules, since the operation is very
// common and expensive.
var _resolveCache = new TickCache();
function resolveSync(x, opts) {
  var cacheKey = JSON.stringify([x, opts]);
  var cached = _resolveCache.get(cacheKey);
  if (cached === undefined) {
    try {
      cached = resolve.sync(x, opts);
    } catch(err) {
      cached = null;
    }
    _resolveCache.set(cacheKey, cached);
  }
  return cached;
}

function isRequireCall(node) {
  // require("…");
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments[0] &&
    node.arguments[0].type === 'Literal'
  );
}

function isRequireResolveCall(node) {
  // require.resolve("…");
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.computed === false &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'require' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'resolve' &&
    node.arguments[0] &&
    node.arguments[0].type === 'Literal'
  );
}

function isImport(node) {
  // import … from "…";
  // import "…";
  return (
    node.type === 'ImportDeclaration' &&
    (node.importKind == null || node.importKind === 'value') &&
    node.source &&
    node.source.type === 'Literal'
  );
}

function isImportType(node) {
  // import type … from "…";
  return (
    node.type === 'ImportDeclaration' &&
    node.importKind === 'type' &&
    node.source &&
    node.source.type === 'Literal'
  );
}

function isExportFrom(node) {
  // export * from "…";
  // export … from "…";
  return (
    node.type === 'ExportAllDeclaration' ||
    node.type === 'ExportNamedDeclaration'
  ) && (
    (node.exportKind == null || node.exportKind === 'value') &&
    node.source &&
    node.source.type === 'Literal'
  );
}

function isExportTypeFrom(node) {
  // export type * from "…";
  // export type … from "…";
  return (
    node.type === 'ExportAllDeclaration' ||
    node.type === 'ExportNamedDeclaration'
  ) && (
    node.exportKind === 'type' &&
    node.source &&
    node.source.type === 'Literal'
  );
}

function getModuleId(node) {
  if (isRequireCall(node) || isRequireResolveCall(node)) {
    return node.arguments[0].value;
  } else if (isImport(node) || isExportFrom(node) ||
             isImportType(node) || isExportTypeFrom(node)) {
    return node.source.value;
  } else {
    return null;
  }
}

function getIdNode(node) {
  if (isRequireCall(node) || isRequireResolveCall(node)) {
    return node.arguments[0];
  } else if (isImport(node) || isExportFrom(node) ||
             isImportType(node) || isExportTypeFrom(node)) {
    return node.source;
  } else {
    return null;
  }
}

module.exports = {
  StorageObject: StorageObject,
  TickCache: TickCache,
  resolveSync: resolveSync,
  isRequireCall: isRequireCall,
  isRequireResolveCall: isRequireResolveCall,
  isImport: isImport,
  isImportType: isImportType,
  isExportFrom: isExportFrom,
  isExportTypeFrom: isExportTypeFrom,
  getIdNode: getIdNode,
  getModuleId: getModuleId,
};
