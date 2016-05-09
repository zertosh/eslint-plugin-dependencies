'use strict';

var RuleTester = require('eslint').RuleTester;

var ruleTester = new RuleTester();
ruleTester.run('require-json-ext', require.resolve('../require-json-ext'), {
  valid: [
    {
      filename: __filename,
      code: 'require("./require-json/foo")',
    },
    {
      filename: __filename,
      code: 'require("./require-json/foo.js")',
    },
    {
      filename: __filename,
      code: 'require("./require-json/foo.json")',
    },
    {
      filename: __filename,
      code: 'require("./require-json/bar.json")',
    },
    {
      filename: __filename,
      code: 'require("./require-json/non-existent-file")',
    },
    {
      filename: __filename,
      code: 'require("./require-json/non-existent-file.json")',
    },
    {
      filename: __filename,
      code: 'require("resolve/package.json")',
    },

    //
    // require.resolve, import, export
    //
    {
      filename: __filename,
      code: 'require.resolve("./require-json/bar.json")',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import "./require-json/bar.json"',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import bar from "./require-json/bar.json"',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'export * from "./require-json/bar.json"',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'export {bar} from "./require-json/bar.json"',
    },
  ],
  invalid: [
    {
      filename: __filename,
      code: 'require("./require-json/bar")',
      errors: [
        {
          type: 'Literal',
          message: '"bar" missing ".json" extension.',
        },
      ],
    },
    {
      filename: __filename,
      code: 'require("resolve/package")',
      errors: [
        {
          type: 'Literal',
          message: '"package" missing ".json" extension.',
        },
      ],
    },

    //
    // require.resolve, import, export
    //
    {
      filename: __filename,
      code: 'require.resolve("./require-json/bar")',
      errors: [
        {
          type: 'Literal',
          message: '"bar" missing ".json" extension.',
        },
      ],
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import "./require-json/bar"',
      errors: [
        {
          type: 'Literal',
          message: '"bar" missing ".json" extension.',
        },
      ],
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import bar from "./require-json/bar"',
      errors: [
        {
          type: 'Literal',
          message: '"bar" missing ".json" extension.',
        },
      ],
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'export {bar} from "./require-json/bar"',
      errors: [
        {
          type: 'Literal',
          message: '"bar" missing ".json" extension.',
        },
      ],
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'export * from "./require-json/bar"',
      errors: [
        {
          type: 'Literal',
          message: '"bar" missing ".json" extension.',
        },
      ],
    },
  ],
});
