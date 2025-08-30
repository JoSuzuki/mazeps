import { OAuth2Strategy } from 'remix-auth-oauth2'
import prisma from '~/lib/prisma'

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is required')
}

if (!process.env.GOOGLE_CALLBACK_URL) {
  throw new Error('GOOGLE_CALLBACK_URL is required')
}

interface GoogleUser {
  email: string
  email_verified: boolean
  sub: string
  name: string
}

export const googleStrategy = new OAuth2Strategy(
  {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    redirectURI: process.env.GOOGLE_CALLBACK_URL,
    scopes: ['profile', 'email'],
  },
  async ({ tokens, request: _request }) => {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `${tokens.tokenType()} ${tokens.accessToken()}`,
        },
      },
    )
    const googleUser: GoogleUser = await response.json()

    const user = await prisma.user.upsert({
      where: {
        email: googleUser.email,
      },
      update: {
        googleId: googleUser.sub,
      },
      create: {
        email: googleUser.email,
        name: googleUser.name,
        nickname: googleUser.name,
        googleId: googleUser.sub,
      },
    })

    return user
  },
)
