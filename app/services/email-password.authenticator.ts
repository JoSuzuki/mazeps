import bcrypt from 'bcrypt'
import { FormStrategy } from 'remix-auth-form'
import prisma from '~/lib/prisma'
import { cookieUserFields, type PrismaCurrentUser } from './session'

async function login(email: string, password: string): Promise<PrismaCurrentUser> {
  const checkUser = await prisma.user.findUnique({ where: { email }, select: { ...cookieUserFields, password: true } })

  if (!checkUser) {
    throw new Error('Usuário e/ou Senha inválidos')
  }

  const match = await bcrypt.compare(password, checkUser.password || '')

  if (!match) {
    throw new Error('Usuário e/ou Senha inválidos')
  }

  const { password: _password, ...user } = checkUser;

  return user;
}

export const emailPasswordStrategy = new FormStrategy(async ({ form }) => {
  const email = form.get('email') as string
  const password = form.get('password') as string

  if (!email || !password) {
    throw new Error('Email e senha são obrigatórios')
  }

  return await login(email, password)
})
