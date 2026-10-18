# Next ESLint root directory adapter

This private package replaces **only** `fast-glob` under the pinned
`@next/eslint-plugin-next@16.3.8`. It is not a general fast-glob implementation.

The plugin uses `globSync(string, { onlyDirectories: true })` in
`dist/utils/get-root-dirs.js`. The adapter uses `tinyglobby@0.2.17`, disables
literal-directory expansion and preserves absolute paths and directory names.
Unexpected argument/options shapes fail explicitly.

Why: the original dependency chain included `micromatch → braces`, affected by
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), without an
upstream patched version at review time (2026-10-16). Removing this dependency
chain resolves this repository's audit findings; it does not patch upstream braces.

`package.json` declares a local development dependency and a version-scoped npm
override. `npm ci` installs its dependencies; do not commit nested node_modules.

Before updating Next or its ESLint configuration:

1. Inspect the plugin's actual fast-glob callers and the new dependency chain.
2. Prefer an upstream fix and remove this package/override when unnecessary.
3. If still needed, review the new caller contract before changing the version scope.
4. Run clean `npm ci`, `npm audit`, `npm run test:unit`, and `npm run lint -- --quiet`.

`tests/unit/developer-dependencies.test.ts` checks literal, wildcard, brace,
array, hidden and absent paths, plus a real Next lint rule violation. A bare
package alias was rejected because its path/directory semantics differed.
