import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import chatHandler from './api/chat.js'
import inviteHandler from './api/colleagues/invite.js'
import notifyHandler from './api/reports/notify.js'
import sendToResidentHandler from './api/reports/send-to-resident.js'
import loginHandler from './api/auth/login.js'
import logoutHandler from './api/auth/logout.js'
import sessionHandler from './api/auth/session.js'
import kutatasokHandler from './api/kutatasok.js'

// A Vite dev middleware nyers Node res objektumot ad, amin nincs Express-szerű
// res.status()/res.json() – ezeket pótoljuk, hogy a handlerek dev alatt is működjenek.
function polyfillExpressRes(res) {
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
    return res
  }
}

function mountApi(server, path, handler) {
  server.middlewares.use(path, (req, res) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', async () => {
      req.body = body ? JSON.parse(body) : {}
      polyfillExpressRes(res)
      await handler(req, res)
    })
  })
}

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
          mountApi(server, '/api/chat', chatHandler)
          mountApi(server, '/api/colleagues/invite', inviteHandler)
          mountApi(server, '/api/reports/notify', notifyHandler)
          mountApi(server, '/api/reports/send-to-resident', sendToResidentHandler)
          mountApi(server, '/api/auth/login', loginHandler)
          mountApi(server, '/api/auth/logout', logoutHandler)
          mountApi(server, '/api/auth/session', sessionHandler)
          mountApi(server, '/api/kutatasok', kutatasokHandler)
        },
      },
    ],
  }
})
