// @ts-check
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

/**
 * Base ESLint base configuration for DMS workspace
 * Contains common rules for code consistency across API and frontend
 */

// Common JavaScript/TypeScript rules for both projects
export const baseRules = Object.freeze({
  // Code quality
  'prefer-const': 'error',
  'no-var': 'error',
  'no-console': 'warn',
  'no-debugger': 'warn',
  'no-unused-vars': 'off', // Let TypeScript handle this

  // Let Prettier handle all formatting
  semi: 'off',
  quotes: 'off',
  indent: 'off',
  'comma-dangle': 'off',
  'max-len': 'off',
})

// Common TypeScript rules (warnings instead of errors for better DX)
export const baseTypeScriptRules = Object.freeze({
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-unused-vars': 'warn',
  '@typescript-eslint/no-unused-expressions': 'warn',

  // Make strict rules warnings instead of errors
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
})

// Common configurations that both projects can extend
export const baseConfigs = Object.freeze([
  eslintPluginPrettierRecommended, // Ensures Prettier integration
])

// Common ignore patterns
export const baseIgnores = Object.freeze([
  'eslint.config.*',
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/.tmp/**',
])
