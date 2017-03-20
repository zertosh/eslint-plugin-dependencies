'use strict';

var fs = require('fs');
var path = require('path');

var RuleTester = require('eslint').RuleTester;

var ruleTester = new RuleTester();
ruleTester.run('no-cycles', require.resolve('../no-cycles'), {
  valid: [
    {
      code: 'console.log();',
    },
    {
      // self-ref-extern
      // a => b => b
      filename: path.join(__dirname, 'cycles-self-ref-extern/a.js'),
      code: fs.readFileSync(path.join(__dirname, 'cycles-self-ref-extern/a.js'), 'utf8'),
    },

    //
    // skip option
    //
    {
      // self-ref-direct
      // a => a
      filename: path.join(__dirname, 'cycles-self-ref-direct/a.js'),
      code: fs.readFileSync(path.join(__dirname, 'cycles-self-ref-direct/a.js'), 'utf8'),
      options: [{skip: ['/cycles-self-ref-direct/']}],
    },
  ],
  invalid: [
    {
      // self-ref-direct
      // a => a
      filename: path.join(__dirname, 'cycles-self-ref-direct/a.js'),
      code: fs.readFileSync(path.join(__dirname, 'cycles-self-ref-direct/a.js'), 'utf8'),
      errors: [
        'Self-reference cycle.',
      ],
    },
    {
      // multi-direct
      // a => b => c => a
      // a ======> c => a
      filename: path.join(__dirname, 'cycles-multi-direct/a.js'),
      code: fs.readFileSync(path.join(__dirname, 'cycles-multi-direct/a.js'), 'utf8'),
      errors: [
        'Cycle in b.js => c.js.',
        'Cycle in c.js.',
      ],
    },
    {
      // types-multi-direct
      // a => b => c => a
      // a ======> c => a
      filename: path.join(__dirname, 'cycles-types-multi-direct/a.js'),
      parser: 'babel-eslint',
      parserOptions: {sourceType: 'module'},
      code: fs.readFileSync(path.join(__dirname, 'cycles-types-multi-direct/a.js'), 'utf8'),
      options: [{types: true}],
      errors: [
        'Cycle in b.js => c.js.',
        'Cycle in c.js.',
      ],
    },
    {
      // multi-part-direct
      // a => b => c => a
      //      b ======> a
      filename: path.join(__dirname, 'cycles-multi-part-direct/a.js'),
      code: fs.readFileSync(path.join(__dirname, 'cycles-multi-part-direct/a.js'), 'utf8'),
      errors: [
        'Cycle in b.js.',
        'Cycle in b.js => c.js.',
      ],
    },
    {
      // multi-direct-extern
      // a => b => c => b
      //      b => c => a
      filename: path.join(__dirname, 'cycles-multi-direct-extern/a.js'),
      code: fs.readFileSync(path.join(__dirname, 'cycles-multi-direct-extern/a.js'), 'utf8'),
      errors: [
        'Cycle in b.js => c.js.',
      ],
    },
    {
      // cycle dups
      // a ===========> a
      // a ===========> a
      // a => b => c => a
      // a => b => c => a
      // a ======> c => a
      //           c => a

      filename: path.join(__dirname, 'cycles-dups/a.js'),
      code: fs.readFileSync(path.join(__dirname, 'cycles-dups/a.js'), 'utf8'),
      errors: [
        'Self-reference cycle.',
        'Self-reference cycle.',
        'Cycle in b.js => c.js.',
        'Cycle in b.js => c.js.',
        'Cycle in c.js.',
        'Cycle in c.js.',
      ],
    },

    //
    // babel-eslint
    //
    {
      // multi-direct
      // a => b => c => a
      // a ======> c => a
      filename: path.join(__dirname, 'cycles-with-babel-eslint/a.js'),
      code: fs.readFileSync(path.join(__dirname, 'cycles-with-babel-eslint/a.js'), 'utf8'),
      parser: 'babel-eslint',
      errors: [
        'Cycle in b.js => c.js.',
        'Cycle in c.js.',
      ],
    },

    //
    // skip
    //
    {
      // self-ref-direct
      // a => a
      filename: path.join(__dirname, 'cycles-self-ref-direct/a.js'),
      code: fs.readFileSync(path.join(__dirname, 'cycles-self-ref-direct/a.js'), 'utf8'),
      options: [{skip: ['/some-path-that-doesnt-exist/']}],
      errors: [
        'Self-reference cycle.',
      ],
    },
  ],
});
