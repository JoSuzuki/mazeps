import { data, redirect } from 'react-router'
import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'

export async function loader({ context }: Route.LoaderArgs) {
  if (context.currentUser) return redirect('/')

  return data(null)
}

export default function Route() {
  return (
    <>
      <div className="flex justify-between px-6 py-2">
        <Link to="/login">← Voltar</Link>
      </div>
      <Center className="align-center grid place-content-center">
        <h1 className="flex justify-center text-xl">Esqueci minha senha</h1>
        <Spacer size="md" />
        <div>
          🚧 Em construção, por enquanto entre em contato com o time do Mazeps
          🚧
        </div>
      </Center>
    </>
  )
}
