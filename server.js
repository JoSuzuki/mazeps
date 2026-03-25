import crypto from 'crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'http'
import compression from 'compression'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { Server } from "socket.io";

// Short-circuit the type-checking of the built output.
const BUILD_PATH = './build/server/index.js'
const DEVELOPMENT = process.env.NODE_ENV === 'development'
const PORT = Number.parseInt(process.env.PORT || '3000')

const app = express()
const httpServer = createServer(app);
const io = new Server(httpServer);

app.set('trust proxy', true)

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const generateCspNonce = (req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64')
  next()
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const ioSocketMiddleware = (req, res, next) => {
  res.locals.io = io;
  next();
}

app.use(ioSocketMiddleware)
app.use(generateCspNonce)

app.use(compression())

/** Enigmas: não indexar (reforço além de robots.txt e meta tags). */
app.use((req, res, next) => {
  const path = (req.path || '').toLowerCase()
  if (path === '/enigmas' || path.startsWith('/enigmas/')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  }
  next()
})

app.disable('x-powered-by')

/**
 * Enigmas: ficheiros em disco com nome UUID; lado a lado existe `.download-name` com o nome original
 * para Content-Disposition inline (título da aba / “Guardar como” ao abrir só a imagem).
 */
app.get('/uploads/enigmas/:filename', (req, res, next) => {
  const raw = req.params.filename
  if (
    !raw ||
    raw.includes('..') ||
    raw.includes('/') ||
    raw.includes('\\') ||
    raw.endsWith('.download-name')
  ) {
    return next()
  }
  const safe = path.basename(raw)
  const dir = path.join(process.cwd(), 'uploads', 'enigmas')
  const absolute = path.join(dir, safe)
  if (!absolute.startsWith(dir)) {
    return next()
  }
  try {
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
      return next()
    }
  } catch {
    return next()
  }

  let downloadName = safe
  try {
    const meta = fs.readFileSync(`${absolute}.download-name`, 'utf8').trim()
    if (meta) {
      downloadName = meta.slice(0, 240)
    }
  } catch {
    // sem meta: mantém nome no disco
  }

  const ascii = downloadName.replace(/[\x00-\x1f\x7f"]/g, '_').slice(0, 200)
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
  )

  const maxAgeMs =
    process.env.NODE_ENV === 'production' ? 365 * 24 * 60 * 60 * 1000 : 0
  res.sendFile(absolute, { maxAge: maxAgeMs, immutable: process.env.NODE_ENV === 'production' }, (err) => {
    if (err) {
      next(err)
    }
  })
})

app.use(
  '/uploads',
  express.static('uploads', {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    immutable: process.env.NODE_ENV === 'production',
    etag: true,
  }),
)

if (DEVELOPMENT) {
  console.log('Starting development server')
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  )
  const viteDevServer = await import('vite').then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    }),
  )

  /**
   * @type {Record<string, any>}
   */
  let currentSocketModule;

  app.use(viteDevServer.middlewares)
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule('./server/app.ts')
      if (source !== currentSocketModule) {
        currentSocketModule = source
        io.removeAllListeners()
        if (source.socket) source.socket(io)
      }
      return await source.app(req, res, next)
    } catch (error) {
      if (typeof error === 'object' && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error)
      }
      next(error)
    }
  })
} else {
  console.log('Starting production server')

  app.use((req, res, next) => {
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            `'nonce-${res.locals.cspNonce}'`, // Nonce for inline scripts
          ],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
          frameSrc: [
            "https://www.youtube.com",
            "https://www.youtube-nocookie.com",
            "https://*.spotify.com",
          ],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    })(req, res, next)
  })

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  const forceHttps = (req, res, next) => {
    const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1'
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https'

    if (!isLocalhost && !isSecure) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`)
    }
    next()
  }

  app.use(forceHttps)
  app.use(
    '/assets',
    express.static('build/client/assets', { immutable: true, maxAge: '1y' }),
  )
  app.use(morgan('tiny'))
  app.use(express.static('build/client', { maxAge: '1h' }))
  let mod = await import(BUILD_PATH)
  mod.socket(io)

  app.use(mod.app)
}

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
