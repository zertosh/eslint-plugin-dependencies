# eslint-plugin-dependencies

[![Build Status](https://travis-ci.org/zertosh/eslint-plugin-dependencies.svg?branch=master)](https://travis-ci.org/zertosh/eslint-plugin-dependencies)

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
    "dependencies/no-unresolved": 1,
    "dependencies/require-json-ext": 1
  }
}
```

## Rules

An [eslint](https://github.com/eslint/eslint) plugin that ...

### `dependencies/case-sensitive`

Verifies that `require("…")`, `require.resolve(…)`, `import "…"` and `export … from "…"` ids match the case that is reported by a directory listing.

```json
{
  "plugins": [
    "dependencies"
  ],
  "rules": {
    "dependencies/case-sensitive": [1, {"paths": ["custom-path-to-search-for-modules"]}]
  }
}
```

### `dependencies/no-cycles`

Prevents cyclic references between modules. It resolves `require("…")`, `import "…"` and `export … from "…"` references to internal modules (i.e. not `node_modules`), to determine whether there is a cycle. If you're using a custom parser, the rule will use that to parse the dependencies. The rule takes a `skip` array of strings, that will be treated as regexps to skip checking files.

Additionally, with the `types` option enabled, you can detect and prevent `import type` cycles as well. This can be helpful, since the [Flow checker](https://flow.org) can exhibit unexpected behavior with such cycles.

```json
{
  "plugins": [
    "dependencies"
  ],
  "rules": {
    "dependencies/no-cycles": [1, {"skip": ["/spec/", "/vendor/"], "types": true}]
  }
}
```

### `dependencies/no-unresolved`

Checks that `require("…")`, `require.resolve(…)`, `import "…"` and `export … from "…"` reference modules that exist. Takes an `ignore` array of modules to ignore.

```json
{
  "plugins": [
    "dependencies"
  ],
  "rules": {
    "dependencies/no-unresolved": [1, {"ignore": ["atom"], "paths": ["custom-path-to-search-for-modules"]}]
  }
}
```

### `dependencies/require-json-ext`

Ensures that modules are that are `.json` include their extension in the module id. Supports auto fix.
