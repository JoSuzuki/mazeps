import 'react-router'
import { createRequestHandler } from '@react-router/express'
import express from 'express'
import type { ExtendedError, Server } from 'socket.io'
import { registerSantoriniHandlers } from './santorini/socket-handler'
import type { PrismaClient } from '~/generated/prisma/client'
import prisma from '~/lib/prisma'
import {
  cookieUserFields,
  mapPrismaToCurrentUser,
  sessionStorage,
} from '~/services/session'
import type { CurrentUser } from '~/services/session'

declare module 'react-router' {
  interface AppLoadContext {
    prisma: PrismaClient
    currentUser?: CurrentUser
    cspNonce: string
    io: Server
  }
}

export const app = express()

export const socket = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const session = await sessionStorage.getSession(
        socket.handshake.headers.cookie,
      )
      const currentUser = session.get('user') as unknown as CurrentUser
      if (!currentUser) {
        return next(new Error('Não autorizado, por favor faça login'))
      }
      socket.data.currentUser = currentUser
      next()
    } catch (error) {
      next(error as unknown as ExtendedError)
    }
  })

  io.on('connection', (socket) => {
    console.log(
      `User connected: ${socket.data.currentUser.nickname}, ${socket.id}`,
    )

    registerSantoriniHandlers(io, socket)
  })
}

app.use(
  createRequestHandler({
    build: () => import('virtual:react-router/server-build'),
    async getLoadContext(request, response) {
      let session = await sessionStorage.getSession(request.headers.cookie)
      let currentUser = session.get('user') as unknown as CurrentUser

      if (currentUser) {
        currentUser.id = Number(currentUser.id)
        const user = await prisma.user.findUnique({
          where: { id: currentUser.id },
          select: cookieUserFields,
        })
        if (user && currentUser.updatedAt !== user.updatedAt.toISOString()) {
          session.set('user', mapPrismaToCurrentUser(user))
          response.setHeader(
            'Set-Cookie',
            await sessionStorage.commitSession(session),
          )
          return {
            currentUser: user as unknown as CurrentUser,
            prisma,
            io: response.locals.io,
            cspNonce: response.locals.cspNonce,
          }
        }
      }

      return {
        prisma,
        currentUser,
        io: response.locals.io,
        cspNonce: response.locals.cspNonce,
      }
    },
  }),
)
