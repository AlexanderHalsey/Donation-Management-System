import { defineConfig } from 'cypress'
import dotenv from 'dotenv'

const envPath = process.env.CYPRESS_ENV_PATH || '.env'
dotenv.config({ path: envPath })

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:4173',
  },
  component: {
    specPattern: 'src/**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}',
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
  env: {
    VITE_MOCK_API_HOST: process.env.VITE_MOCK_API_HOST,
  },
})
