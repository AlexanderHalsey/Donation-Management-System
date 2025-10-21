import { fileURLToPath, URL } from 'node:url'

import { defineConfig, PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(async ({ command }) => {
  const plugins: PluginOption[] = [vue()]

  // Only add devtools in development (not during build)
  if (command !== 'build') {
    const { default: vueDevTools } = await import('vite-plugin-vue-devtools')
    plugins.push(vueDevTools())
  }

  return {
    plugins, // Use the plugins array we built above
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 8080,
    },
  }
})
