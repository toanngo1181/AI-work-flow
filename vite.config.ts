import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Dòng này cực quan trọng để tránh lỗi màn hình trắng
    'process.env': {},
  }
})
