import { data, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import Spacer from '~/components/spacer/spacer.component'

export async function loader({ context }: Route.LoaderArgs) {
  if (context.currentUser) return redirect('/')

  return data(null)
}

export default function Route() {
  return (
    <>
      <BackButtonPortal to="/tournaments" />
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
