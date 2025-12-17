import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Đây là "liều thuốc" quan trọng nhất:
    // Nó biến mọi biến process.env thành rỗng để trình duyệt không báo lỗi
    'process.env': {},
  }
})
