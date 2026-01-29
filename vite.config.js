import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import SlideLoaderPlugin from './plugins/vite-plugin-slides'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue(), SlideLoaderPlugin()],
  build: {
    emptyOutDir: false,
  }
})
