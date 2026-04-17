import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import type { Route } from './+types/root'
import NotFoundPage from '~/components/not-found-page/not-found-page.component'
import { useNonce } from './services/nonce'
import './app.css'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,100..900;1,100..900&display=swap',
  },
]

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: 'Mazeps' },
    { name: 'description', content: 'Bem vindo ao Mazeps!' },
  ]
}

export function Layout({ children }: { children: React.ReactNode }) {
  const nonce = useNonce()

  return (
    <html
      lang="pt-BR"
      data-theme="flamingo"
      className="font-default bg-background text-on-background h-full"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
      const savedTheme = localStorage.getItem('theme')
      const allowed = ['flamingo', 'pegasus', 'golden']
      if (savedTheme && allowed.includes(savedTheme)) {
        document.documentElement.setAttribute('data-theme', savedTheme)
        document.cookie = 'mazepsTheme=' + encodeURIComponent(savedTheme) + '; path=/; max-age=31536000; samesite=lax'
      }
    })()`,
          }}
        ></script>
      </head>
      <body className="flex h-full flex-col">
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />
  }

  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = `Erro ${error.status}`
    details = error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
