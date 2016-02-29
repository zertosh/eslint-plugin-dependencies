# eslint-plugin-dependencies

[![Build Status](https://travis-ci.org/zertosh/eslint-plugin-dependencies.svg?branch=master)](https://travis-ci.org/zertosh/eslint-plugin-dependencies)

An [eslint](https://github.com/eslint/eslint) plugin that ...

## Usage

```sh
npm install eslint-plugin-dependencies
```

In your `.eslintrc`:

```json
{
  "plugins": [
    "dependencies"
  ],
  "rules": {
    "dependencies/case-sensitive": 1,
    "dependencies/no-cycles": 1,
    "dependencies/no-unresolved": 1
  }
}
```

## Rules

### `dependencies/case-sensitive`

Verifies that `require` and `import` references match the case that is reported by a directory listing.

### `dependencies/no-cycles`

This rule prevents cyclic references between modules. It resolves `require` calls and `import` statements to internal modules (i.e. not `node_modules`), to determine whether there is a cycle.

### `dependencies/no-unresolved`

No unresolved `require` calls or `import` statements. Only checks internal modules, not `node_modules`.
