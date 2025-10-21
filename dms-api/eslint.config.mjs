// @ts-check
import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { baseRules, baseTypeScriptRules, baseConfigs, baseIgnores } from '../eslint.base.config.mjs'

export default tseslint.config(
  {
    ignores: [...baseIgnores],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended, // Less strict than recommendedTypeChecked
  ...baseConfigs,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      ...baseRules,
      ...baseTypeScriptRules,
      // API-specific overrides
      'no-console': 'off', // Allow console in backend
    },
  },
)
