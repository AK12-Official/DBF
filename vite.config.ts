import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0', // 允许外部访问
      cors: true, // 启用 CORS
      proxy: {
        // 代理所有 /api 开头的请求到后端服务器
        // 后端接口已有 /api 前缀，所以代理时保持路径不变
        '/api': {
          // 从 VITE_API_BASE_URL 提取基础地址（去掉 /api 后缀）
          // 例如：http://localhost:8080/api -> http://localhost:8080
          target: env.VITE_API_BASE_URL 
            ? env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') 
            : 'http://localhost:8080',
          changeOrigin: true, // 改变请求头中的 origin
          secure: false, // 如果是 https 接口，需要配置这个参数
          // 不需要重写路径，直接转发（保持 /api 前缀）
          // rewrite: (path) => path, // 保持原路径
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err)
            })
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url)
            })
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url)
            })
          },
        },
      },
    },
  }
})
