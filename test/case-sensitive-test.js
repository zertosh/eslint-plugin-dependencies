'use strict';

if (require('os').platform() !== 'darwin') {
  console.log('Skipping case-sensitive test.');
  process.exit(0);
}

var RuleTester = require('eslint').RuleTester;

var ruleTester = new RuleTester();
ruleTester.run('case-sensitive', require.resolve('../case-sensitive'), {
  valid: [
    // require(…);
    {
      filename: __filename,
      code: 'require("../index")',
    },
    {
      filename: __filename,
      code: 'require("..")',
    },
    {
      filename: __filename,
      code: 'require("./case-sensitive/foo")',
    },
    {
      filename: __filename,
      code: 'require("resolve")',
    },
    {
      filename: __filename,
      code: 'require("assert")',
    },
    {
      filename: __filename,
      code: 'require("non-existing-filename")',
    },
    {
      filename: __filename,
      code: 'require(foo)',
    },
    // custom path
    {
      filename: __filename,
      code: 'require("foo")',
      options: [{ paths: ["test/custom-path"] }],
    },

    // require.resolve(…);
    {
      filename: __filename,
      code: 'require.resolve("../index")',
    },
    // import "…";
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import "../index"',
    },
    // import … from …;
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'import x from "../index"',
    },
    // export * from "…";
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'export {foo} from "../index"',
    },
    // export … from "…";
    {
      filename: __filename,
      parserOptions: {sourceType: 'module'},
      code: 'export * from "../index"',
    },
  ],
  invalid: [
    //
    // parent dir
    //
    {
      filename: __filename,
      code: 'require("../Index")',
      errors: [
        'Case mismatch in "Index", expected "index".',
      ],
    },
    {
      filename: __filename,
      code: 'require("../Index.js")',
      errors: [
        'Case mismatch in "Index.js", expected "index.js".',
      ],
    },

    //
    // nested dir
    //
    {
      filename: __filename,
      code: 'require("./Case-Sensitive/Bar/baz")',
      errors: [
        'Case mismatch in "Case-Sensitive", expected "case-sensitive".',
      ],
    },
    {
      filename: __filename,
      code: 'require("./case-sensitive/bar/baz")',
      errors: [
        'Case mismatch in "bar", expected "Bar".',
      ],
    },
    {
      filename: __filename,
      code: 'require("./case-sensitive/Bar/bAz")',
      errors: [
        'Case mismatch in "bAz", expected "baz".',
      ],
    },
    {
      filename: __filename,
      code: 'require("./case-sensitive/Bar/Baz.js")',
      errors: [
        'Case mismatch in "Baz.js", expected "baz.js".',
      ],
    },
    {
      filename: __filename,
      code: 'require("./Case-Sensitive/bar/Baz.js")',
      errors: [
        'Case mismatch in "Case-Sensitive", expected "case-sensitive".',
        'Case mismatch in "bar", expected "Bar".',
        'Case mismatch in "Baz.js", expected "baz.js".',
      ],
    },

    //
    // node_modules
    //
    {
      filename: __filename,
      code: 'require("Resolve")',
      errors: [
        'Case mismatch in "Resolve", expected "resolve".',
      ],
    },
    {
      filename: __filename,
      code: 'require("Resolve/index")',
      errors: [
        'Case mismatch in "Resolve", expected "resolve".',
      ],
    },
    {
      filename: __filename,
      code: 'require("Resolve/Index")',
      errors: [
        'Case mismatch in "Resolve", expected "resolve".',
        'Case mismatch in "Index", expected "index".',
      ],
    },
    {
      filename: __filename,
      code: 'require("Resolve/Index.js")',
      errors: [
        'Case mismatch in "Resolve", expected "resolve".',
        'Case mismatch in "Index.js", expected "index.js".',
      ],
    },
    {
      filename: __filename,
      code: 'require("resolve/Index")',
      errors: [
        'Case mismatch in "Index", expected "index".',
      ],
    },

    //
    // custom path
    //
    {
      filename: __filename,
      code: 'require("Foo")',
      options: [{ paths: ["test/custom-path"] }],
      errors: [
        'Case mismatch in "Foo", expected "foo".',
      ],
    },

    //
    // require.resolve, import, export
    //
    {
      filename: __filename,
      code: 'require.resolve("./Case-Sensitive/bar/Baz.js")',
      parserOptions: {sourceType: 'module'},
      errors: [
        'Case mismatch in "Case-Sensitive", expected "case-sensitive".',
        'Case mismatch in "bar", expected "Bar".',
        'Case mismatch in "Baz.js", expected "baz.js".',
      ],
    },
    {
      filename: __filename,
      code: 'import "./Case-Sensitive/bar/Baz.js"',
      parserOptions: {sourceType: 'module'},
      errors: [
        'Case mismatch in "Case-Sensitive", expected "case-sensitive".',
        'Case mismatch in "bar", expected "Bar".',
        'Case mismatch in "Baz.js", expected "baz.js".',
      ],
    },
    {
      filename: __filename,
      code: 'import baz from "./Case-Sensitive/bar/Baz.js"',
      parserOptions: {sourceType: 'module'},
      errors: [
        'Case mismatch in "Case-Sensitive", expected "case-sensitive".',
        'Case mismatch in "bar", expected "Bar".',
        'Case mismatch in "Baz.js", expected "baz.js".',
      ],
    },
    {
      filename: __filename,
      code: 'export * from "./Case-Sensitive/bar/Baz.js"',
      parserOptions: {sourceType: 'module'},
      errors: [
        'Case mismatch in "Case-Sensitive", expected "case-sensitive".',
        'Case mismatch in "bar", expected "Bar".',
        'Case mismatch in "Baz.js", expected "baz.js".',
      ],
    },
    {
      filename: __filename,
      code: 'export {baz} from "./Case-Sensitive/bar/Baz.js"',
      parserOptions: {sourceType: 'module'},
      errors: [
        'Case mismatch in "Case-Sensitive", expected "case-sensitive".',
        'Case mismatch in "bar", expected "Bar".',
        'Case mismatch in "Baz.js", expected "baz.js".',
      ],
    },

    //
    // .json, .node
    //
    {
      filename: __filename,
      code: 'require("./case-sensitive/Quux")',
      errors: [
        'Case mismatch in "Quux", expected "quux".',
      ],
    },
    {
      filename: __filename,
      code: 'require("./case-sensitive/Quux.node")',
      errors: [
        'Case mismatch in "Quux.node", expected "quux.node".',
      ],
    },
    {
      filename: __filename,
      code: 'require("./case-sensitive/Qux")',
      errors: [
        'Case mismatch in "Qux", expected "qux".',
      ],
    },
    {
      filename: __filename,
      code: 'require("./case-sensitive/Qux.json")',
      errors: [
        'Case mismatch in "Qux.json", expected "qux.json".',
      ],
    },
  ],
});
