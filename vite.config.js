import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import chatHandler from './api/chat.js'
import loginHandler from './api/auth/login.js'
import logoutHandler from './api/auth/logout.js'
import sessionHandler from './api/auth/session.js'
import kutatasokHandler from './api/kutatasok.js'
import meresekHandler from './api/meresek.js'
import fajazonositasHandler from './api/fajazonositas.js'
import cikkekHandler from './api/cikkek.js'
import egyeniGocpontokHandler from './api/egyeni-gocpontok.js'
import uploadHandler from './api/upload.js'
import { uploadsDir } from './api/_lib/storage.js'
import { existsSync, createReadStream } from 'fs'
import path from 'path'

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

const MIME = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

// Blob token nélkül a feltöltött fájlok a data mappába kerülnek – dev alatt
// ezeket is ki kell szolgálni, különben a csatolt kép/PDF nem jelenik meg.
function mountUploads(server) {
  server.middlewares.use('/uploads', (req, res, next) => {
    const name = path.basename(decodeURIComponent(req.url.split('?')[0]))
    const file = path.join(uploadsDir(), name)
    if (!name || !existsSync(file)) return next()
    res.setHeader('Content-Type', MIME[path.extname(name).toLowerCase()] ?? 'application/octet-stream')
    createReadStream(file).pipe(res)
  })
}

// A feltöltés bináris, ezért a handler maga olvassa a streamet – itt nem nyúlunk hozzá.
function mountRawApi(server, path, handler) {
  server.middlewares.use(path, async (req, res) => {
    polyfillExpressRes(res)
    await handler(req, res)
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
          mountApi(server, '/api/auth/login', loginHandler)
          mountApi(server, '/api/auth/logout', logoutHandler)
          mountApi(server, '/api/auth/session', sessionHandler)
          mountApi(server, '/api/kutatasok', kutatasokHandler)
          mountApi(server, '/api/meresek', meresekHandler)
          mountApi(server, '/api/fajazonositas', fajazonositasHandler)
          mountApi(server, '/api/cikkek', cikkekHandler)
          mountApi(server, '/api/egyeni-gocpontok', egyeniGocpontokHandler)
          mountRawApi(server, '/api/upload', uploadHandler)
          mountUploads(server)
        },
      },
    ],
  }
})
