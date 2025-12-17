import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 👇 THÊM ĐOẠN NÀY ĐỂ FIX LỖI MÀN HÌNH TRẮNG
  define: {
    'process.env': {}
  }
})
