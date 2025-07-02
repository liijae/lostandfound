import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0', // 允许子网访问前端开发服务器
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://10.122.193.212:5000', // 指向您的后端IP和端口
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});