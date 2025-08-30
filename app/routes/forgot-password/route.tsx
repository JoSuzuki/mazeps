import { data, redirect } from 'react-router'
import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'

export async function loader({ context }: Route.LoaderArgs) {
  if (context.currentUser) return redirect('/')

  return data(null)
}

export default function Route() {
  return (
    <Center>
      <Link to="/login" className="absolute top-2 left-2">
        ← Voltar
      </Link>
      <h1 className="flex justify-center">Esqueci minha senha</h1>
      <div>
        🚧 Em construção, por enquanto entre em contato com o time do Mazeps 🚧
      </div>
    </Center>
  )
}
