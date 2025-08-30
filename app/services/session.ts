import { createCookieSessionStorage } from 'react-router'
import { Authenticator } from 'remix-auth'
import type { User } from '../generated/prisma'
import { emailPasswordStrategy } from './email-password.authenticator'
import { googleStrategy } from './google.authenticator'

if (!process.env.SESSION_SECRET) {
	throw new Error('SESSION_SECRET is not defined')
}

export interface CurrentUser extends Omit<User, 'createdAt' | 'updatedAt'> {
	createdAt: string
	updatedAt: string
}

export const sessionStorage = createCookieSessionStorage<{ user: User }>({
	cookie: {
		name: '__session',
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secrets: [process.env.SESSION_SECRET],
		secure: process.env.NODE_ENV === 'production',
	},
})

export const setSession = async (request: Request, user: User) => {
	const session = await sessionStorage.getSession(request.headers.get('cookie'))
	session.set('user', user)
	return sessionStorage.commitSession(session)
}

export const authenticator = new Authenticator<User>()

authenticator.use(googleStrategy, 'google')
authenticator.use(emailPasswordStrategy, 'email-password')
