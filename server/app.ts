import 'react-router'
import { createRequestHandler } from '@react-router/express'
import express from 'express'
import type { PrismaClient } from '../app/generated/prisma'
import prisma from '../app/lib/prisma'
import { sessionStorage } from '../app/services/session'
import type { CurrentUser } from '../app/services/session'

declare module 'react-router' {
	interface AppLoadContext {
		prisma: PrismaClient
		currentUser?: CurrentUser
	}
}

export const app = express()

app.use(
	createRequestHandler({
		build: () => import('virtual:react-router/server-build'),
		async getLoadContext(request, response) {
			let session = await sessionStorage.getSession(request.headers.cookie)
			let currentUser = session.get('user') as unknown as CurrentUser
			currentUser.id = Number(currentUser.id)

			if (currentUser) {
				const user = await prisma.user.findUnique({
					where: { id: currentUser.id },
				})
				if (user && currentUser.updatedAt !== user.updatedAt.toISOString()) {
					session.set('user', user)
					response.setHeader(
						'Set-Cookie',
						await sessionStorage.commitSession(session),
					)
					return { currentUser: user as unknown as CurrentUser, prisma }
				}
			}

			return {
				prisma,
				currentUser,
			}
		},
	}),
)
