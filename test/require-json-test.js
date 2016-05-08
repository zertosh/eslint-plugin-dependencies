'use strict';

var path = require('path');
var RuleTester = require('eslint').RuleTester;

var ruleTester = new RuleTester();
ruleTester.run('require-json-ext', require.resolve('../require-json-ext'), {
  valid: [
    {
      filename: __filename,
      code: 'require("' + __filename + '")',
    },
    {
      filename: __filename,
      code: 'require("./' + path.basename(__filename) + '")',
    },
    {
      filename: __filename,
      code: 'require("./non-existent-file")',
    },
    {
      filename: __filename,
      code: 'require("../package.json")',
    },
    {
      filename: __filename,
      code: 'require.resolve("' + __filename + '")',
    },
    {
      filename: __filename,
      code: 'require.resolve("./' + path.basename(__filename) + '")',
    },
    {
      filename: __filename,
      code: 'require.resolve("./non-existent-file")',
    },
    {
      filename: __filename,
      code: 'require.resolve("../package.json")',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import json from "' + __filename + '"',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import "./' + path.basename(__filename) + '"',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import json from "./non-existent-file"',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import json from "../package.json"',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'export * from "../package.json"',
    },
  ],
  invalid: [
    {
      filename: __filename,
      code: 'require("../package")',
      errors: [
        '"package" needs ".json" extension',
      ],
    },
    {
      filename: __filename,
      code: 'require.resolve("../package")',
      errors: [
        '"package" needs ".json" extension',
      ],
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import "../package"',
      errors: [
        '"package" needs ".json" extension',
      ],
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'export * from "../package"',
      errors: [
        '"package" needs ".json" extension',
      ],
    },
  ],
});
