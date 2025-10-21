import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
// @ts-ignore
import pluginCypress from 'eslint-plugin-cypress/flat'
import oxlint from 'eslint-plugin-oxlint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
// @ts-ignore
import { baseRules, baseTypeScriptRules, baseIgnores } from '../eslint.base.config.mjs'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: [...baseIgnores, '**/dist-ssr/**'], // Use shared ignores + frontend-specific
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginCypress.configs.recommended,
    files: [
      '**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}',
      'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}',
      'cypress/support/**/*.{js,ts,jsx,tsx}',
    ],
  },
  ...oxlint.configs['flat/recommended'],
  skipFormatting,

  // Apply shared workspace rules
  {
    name: 'workspace/shared-rules',
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname, // Explicitly set to frontend directory
      },
    },
    rules: {
      ...baseRules,
      ...baseTypeScriptRules,
      // Frontend-specific overrides
      'no-console': 'warn', // Keep console as warning in frontend
    },
  },
)
