import type { Route } from './+types/route'
import Title from './title.component'
import Board from '~/components/board/board.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'

export const meta = ({}: Route.MetaArgs) => {
	return [
		{ title: 'Mazeps' },
		{ name: 'description', content: 'Bem vindo ao Mazeps!' },
	]
}

export const loader = async ({ context }: Route.LoaderArgs) => {
	return { currentUser: context.currentUser }
}

export default function Route({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<nav className="flex items-center justify-end p-4">
				{loaderData.currentUser ? (
					<div>
						Bem vindo,{' '}
						<Link
							to="/profile"
							className="bg-primary text-on-primary rounded-md p-0.5"
						>
							{loaderData.currentUser.nickname}
						</Link>
					</div>
				) : (
					<LinkButton to="/login">Login</LinkButton>
				)}
			</nav>
			<main>
				<div className="mb-2 flex justify-center">
					<Title />
				</div>
				<Board />
			</main>
		</>
	)
}
