/* eslint-disable @typescript-eslint/no-require-imports -- Loaded by the CommonJS Next ESLint plugin. */
const path = require('node:path');
const { globSync: tinyGlobSync } = require('tinyglobby');

// The pinned Next ESLint plugin uses only globSync(pattern, { onlyDirectories: true }).
// tinyglobby normally expands literal directories and returns relative paths, unlike
// that fast-glob call. Preserve the caller's semantics explicitly.
exports.globSync = function globSync(pattern, options = {}) {
  if (typeof pattern !== 'string' || Object.keys(options).some(key => key !== 'onlyDirectories')) {
    throw new Error('Next ESLint glob adapter call changed; review compatibility before upgrading.');
  }
  return tinyGlobSync(pattern, {
    onlyDirectories: options.onlyDirectories,
    expandDirectories: false,
    absolute: path.isAbsolute(pattern),
  }).map(entry => entry.length > 1 ? entry.replace(/[/\\]$/, '') : entry);
};
