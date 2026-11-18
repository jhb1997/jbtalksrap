import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['site/', 'node_modules/'] },
  js.configs.recommended,
  { rules: { 'no-empty': ['error', { allowEmptyCatch: true }] } },
  {
    files: ['src/js/**/*.js'],
    languageOptions: { sourceType: 'script', globals: globals.browser },
  },
  {
    files: ['scripts/**/*.mjs', 'content/**/*.mjs', '*.js'],
    languageOptions: { sourceType: 'module', globals: globals.node },
  },
];
