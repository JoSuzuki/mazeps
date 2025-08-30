import type React from 'react'
import { redirect } from 'react-router'
import { Role } from '../../generated/prisma/enums'
import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import Spacer from '~/components/spacer/spacer.component'

export async function loader({ context, request }: Route.LoaderArgs) {
	if (!context.currentUser) return redirect('/login')
	if (context.currentUser.role !== Role.ADMIN) return redirect('/')

	const url = new URL(request.url)
	const page = Number(url.searchParams.get('page') || 1)
	const limit = Number(url.searchParams.get('limit') || 10)
	const skip = (page - 1) * limit

	const [users, totalCount] = await Promise.all([
		context.prisma.user.findMany({
			skip,
			take: limit,
		}),
		context.prisma.user.count(),
	])

	const totalPages = Math.ceil(totalCount / limit)

	return {
		users,
		currentUser: context.currentUser,
		pagination: {
			currentPage: page,
			totalPages,
			totalCount,
			limit,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		},
	}
}

interface TableRow {
	id: string | number
}

interface TableColumn<TData> {
	key: string
	title: string
	value: (data: TData) => React.ReactNode
}

interface TableProps<TableData extends TableRow> {
	data: TableData[]
	columns: TableColumn<TableData>[]
}

function Table<TableData extends TableRow>({
	columns,
	data,
}: TableProps<TableData>) {
	return (
		<table>
			<thead>
				<tr>
					{columns.map((column) => (
						<td className="p-2" key={column.key}>
							{column.title}
						</td>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((row) => (
					<tr key={row.id}>
						{columns.map((column) => (
							<td className="p-2" key={`${row.id}-${column.key}`}>
								{column.value(row)}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	)
}

export default function Route({ loaderData }: Route.ComponentProps) {
	return (
		<Center>
			<Link to="/" className="absolute top-2 left-2">
				← Voltar
			</Link>
			<h1 className="flex justify-center text-lg">Usuários</h1>
			<Spacer size="md" />
			<Table
				data={loaderData.users}
				columns={[
					{ key: 'id', title: 'Id', value: (user) => user.id },
					{
						key: 'name',
						title: 'Nome',
						value: (user) => <Link to={`/user/${user.id}`}>{user.name}</Link>,
					},
					{ key: 'nickname', title: 'Apelido', value: (user) => user.nickname },
					{ key: 'email', title: 'E-mail', value: (user) => user.email },
					{ key: 'role', title: 'Role', value: (user) => user.role },
					{
						key: 'edit',
						title: 'Ações',
						value: (user) => (
							<LinkButton styleType="secondary" to={`/user/${user.id}/edit`}>
								Editar
							</LinkButton>
						),
					},
				]}
			/>
		</Center>
	)
}
