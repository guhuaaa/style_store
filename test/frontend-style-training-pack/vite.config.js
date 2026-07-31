import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Keep the extracted package self-contained: its optional .env lives here.
  const envDir = __dirname
  const env = loadEnv(mode, envDir, '')
  const frontendPort = Number(env.VITE_DEV_PORT || 3000)
  const backendTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5001'

  return {
  // 所有运行配置统一放在项目根目录 .env，避免维护两份机器相关配置。
  envDir,
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: frontendPort,
    open: true,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: frontendPort,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false
      }
    }
  }
  }
})
