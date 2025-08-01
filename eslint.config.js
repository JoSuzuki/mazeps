import { config as defaultConfig } from '@epic-web/config/eslint'

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...defaultConfig,
  {
    rules: {
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    },
  },
  {
    ignores: ['.react-router/**', 'app/generated/**', 'console.ts', 'react-router.config.ts'],
  },
]
