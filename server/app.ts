import 'react-router'
import { createRequestHandler } from '@react-router/express'
import express from 'express'
import type { PrismaClient } from '~/generated/prisma/client'
import prisma from '~/lib/prisma'
import { sessionStorage } from '~/services/session'
import type { CurrentUser } from '~/services/session'

declare module 'react-router' {
  interface AppLoadContext {
    prisma: PrismaClient
    currentUser?: CurrentUser
    cspNonce: string
  }
}

export const app = express()

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
        })
        if (user && currentUser.updatedAt !== user.updatedAt.toISOString()) {
          session.set('user', user)
          response.setHeader(
            'Set-Cookie',
            await sessionStorage.commitSession(session),
          )
          return {
            currentUser: user as unknown as CurrentUser,
            prisma,
            cspNonce: response.locals.cspNonce,
          }
        }
      }

      return {
        prisma,
        currentUser,
        cspNonce: response.locals.cspNonce,
      }
    },
  }),
)
