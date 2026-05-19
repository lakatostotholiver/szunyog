import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import handler from './api/chat.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      {
        name: 'api-dev-server',
        configureServer(server) {
          server.middlewares.use('/api/chat', (req, res) => {
            let body = ''
            req.on('data', (chunk) => { body += chunk })
            req.on('end', async () => {
              req.body = body ? JSON.parse(body) : {}
              await handler(req, res)
            })
          })
        },
      },
    ],
  }
})
