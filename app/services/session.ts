import { createCookieSessionStorage } from 'react-router'
import { Authenticator } from 'remix-auth'
import { emailPasswordStrategy } from './email-password.authenticator'
import { googleStrategy } from './google.authenticator'
import type { User } from '~/generated/prisma/client'

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not defined')
}

export interface PrismaCurrentUser extends Pick<User, 'id' | 'name' | 'nickname' | 'email' | 'updatedAt' | 'role' | 'isWriter' | 'isSupporter'> {
  password?: never;
}

export interface CurrentUser extends Pick<User, 'id' | 'name' | 'nickname' | 'email' | 'role' | 'isWriter' | 'isSupporter'> {
  updatedAt: string
  password?: never;
}

/** Segundos — sem isto o cookie é só de “sessão do navegador” e some ao fechar o app (pior em mobile). */
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export const sessionStorage = createCookieSessionStorage<{ user: CurrentUser }>({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: SESSION_COOKIE_MAX_AGE,
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
})

export const cookieUserFields = {
  id: true,
  name: true,
  nickname: true,
  email: true,
  updatedAt: true,
  role: true,
  isWriter: true,
  isSupporter: true,
};

export const mapPrismaToCurrentUser = (user: PrismaCurrentUser): CurrentUser => ({
  id: user.id,
  name: user.name,
  nickname: user.nickname,
  email: user.email,
  updatedAt: user.updatedAt.toISOString(),
  role: user.role,
  isWriter: user.isWriter,
  isSupporter: user.isSupporter,
})

export const setSession = async (request: Request, user: PrismaCurrentUser) => {
  const session = await sessionStorage.getSession(request.headers.get('cookie'))
  session.set('user', mapPrismaToCurrentUser(user))
  return sessionStorage.commitSession(session)
}

export const authenticator = new Authenticator<PrismaCurrentUser>()

authenticator.use(googleStrategy, 'google')
authenticator.use(emailPasswordStrategy, 'email-password')
