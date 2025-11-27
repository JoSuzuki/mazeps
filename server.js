import crypto from 'crypto'
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

app.disable('x-powered-by')

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
          imgSrc: ["'self'", "data:", "blob:"],
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
