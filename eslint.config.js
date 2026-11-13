const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/**', 'dist-pages/**', 'artifacts/**', 'test-results/**', 'playwright-report/**', '.expo/**'] },
]);
