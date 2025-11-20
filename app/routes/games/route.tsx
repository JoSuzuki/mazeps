import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'

export default function Route({ }: Route.ComponentProps) {

  return (
    <>
      <Center>
        <h1 className="flex justify-center text-lg">Jogos</h1>
        <Spacer size="lg" />
        <Link to="/games/santorini" className="p-8 border rounded-lg flex justify-between items-center">
          <h2 className="text-lg">Santorini</h2>
          Jogar
        </Link>
      </Center>
    </>
  )
}
