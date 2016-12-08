'use strict';

var RuleTester = require('eslint').RuleTester;

var ruleTester = new RuleTester();
ruleTester.run('no-unresolved', require.resolve('../no-unresolved'), {
  valid: [
    {
      filename: __filename,
      code: 'require("./resolve/foo")',
    },
    {
      filename: __filename,
      code: 'require("./resolve/foo.js")',
    },
    {
      filename: __filename,
      code: 'require("./resolve/foo.json")',
    },
    {
      filename: __filename,
      code: 'require("./resolve/bar")',
    },
    {
      filename: __filename,
      code: 'require("./resolve/bar.json")',
    },
    {
      filename: __filename,
      code: 'require("./resolve/baz")',
    },
    {
      filename: __filename,
      code: 'require("./resolve/baz.node")',
    },
    {
      filename: __filename,
      code: 'require("resolve")',
    },
    {
      filename: __filename,
      code: 'require("resolve/package.json")',
    },
    {
      filename: __filename,
      code: 'require("non-existing-package")',
      options: [{ignore: ['non-existing-package']}],
    },
    // test custom path resolution
    {
      filename: __filename,
      code: 'require("foo")',
      options: [{paths: ['test/custom-path']}],
    },

    //
    // require.resolve, import, export
    //
    {
      filename: __filename,
      code: 'require.resolve("./resolve/foo")',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import "./resolve/foo"',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import bar from "./resolve/foo"',
    },
    {
      filename: __filename,
      parser: 'babel-eslint',
      code: 'import type bar from "./resolve/foo"',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'export * from "./resolve/foo"',
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'export {bar} from "./resolve/foo"',
    },
    {
      filename: __filename,
      parser: 'babel-eslint',
      code: 'export type {bar} from "./resolve/foo"',
    },
  ],
  invalid: [
    {
      filename: __filename,
      code: 'require("./resolve/qux")',
      errors: [
        {
          type: 'Literal',
          message: '"./resolve/qux" does not exist.',
        },
      ],
    },
    {
      filename: __filename,
      code: 'require("non-existing-package")',
      errors: [
        {
          type: 'Literal',
          message: '"non-existing-package" does not exist.',
        },
      ],
    },
    {
      filename: __filename,
      code: 'require("resolve/non-existing-file")',
      errors: [
        {
          type: 'Literal',
          message: '"resolve/non-existing-file" does not exist.',
        },
      ],
    },
    {
      filename: __filename,
      code: 'require("./resolve")',
      errors: [
        {
          type: 'Literal',
          message: '"./resolve" does not exist.',
        },
      ],
    },
    // test custom path resolution
    {
      filename: __filename,
      code: 'require("foo")',
      errors: [
        {
          type: 'Literal',
          message: '"foo" does not exist.',
        },
      ],
    },



    //
    // require.resolve, import, export
    //
    {
      filename: __filename,
      code: 'require.resolve("./resolve/qux")',
      errors: [
        {
          type: 'Literal',
          message: '"./resolve/qux" does not exist.',
        },
      ],
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import "./resolve/qux"',
      errors: [
        {
          type: 'Literal',
          message: '"./resolve/qux" does not exist.',
        },
      ],
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import qux from "./resolve/qux"',
      errors: [
        {
          type: 'Literal',
          message: '"./resolve/qux" does not exist.',
        },
      ],
    },
    {
      filename: __filename,
      parser: 'babel-eslint',
      code: 'import type qux from "./resolve/qux"',
      errors: [
        {
          type: 'Literal',
          message: '"./resolve/qux" does not exist.',
        },
      ],
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'export {qux} from "./resolve/qux"',
      errors: [
        {
          type: 'Literal',
          message: '"./resolve/qux" does not exist.',
        },
      ],
    },
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'export * from "./resolve/qux"',
      errors: [
        {
          type: 'Literal',
          message: '"./resolve/qux" does not exist.',
        },
      ],
    },
    {
      filename: __filename,
      parser: 'babel-eslint',
      code: 'export type {qux} from "./resolve/qux"',
      errors: [
        {
          type: 'Literal',
          message: '"./resolve/qux" does not exist.',
        },
      ],
    },
  ],
});
