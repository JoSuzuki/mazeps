import { data, Form, redirect, useFetcher } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const enigma = await context.prisma.enigma.findUniqueOrThrow({
    where: { slug: params.slug },
    include: { phases: { orderBy: { order: 'asc' } } },
  })

  return { enigma }
}

export async function action({ request, context, params }: Route.ActionArgs) {
  if (context.currentUser?.role !== Role.ADMIN) {
    return data({ error: 'Não autorizado' })
  }

  const formData = await request.formData()
  const intent = formData.get('intent') as string

  if (intent === 'update') {
    const name = formData.get('name') as string
    const slug = (formData.get('slug') as string).toLowerCase().trim()
    await context.prisma.enigma.update({
      where: { slug: params.slug },
      data: { name, slug },
    })
    return redirect(`/enigmas/${slug}/edit`)
  }

  if (intent === 'delete-phase') {
    const phaseId = Number(formData.get('phaseId'))
    await context.prisma.enigmaPhase.delete({ where: { id: phaseId } })
    return data({ success: true })
  }

  if (intent === 'delete-enigma') {
    await context.prisma.enigma.delete({ where: { slug: params.slug } })
    return redirect('/enigmas')
  }

  return data({ error: 'Ação inválida' })
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher()

  return (
    <>
      <div className="px-6 py-2">
        <Link to="/enigmas" viewTransition>
          ← Voltar
        </Link>
      </div>
      <Center>
        <h1 className="flex justify-center text-lg">
          Gerenciar: {loaderData.enigma.name}
        </h1>
        <Spacer size="lg" />

        <h2 className="font-semibold">Informações</h2>
        <Spacer size="sm" />
        <Form method="post">
          <input type="hidden" name="intent" value="update" />
          <TextInput
            id="name"
            name="name"
            label="Nome"
            type="text"
            required={true}
            defaultValue={loaderData.enigma.name}
          />
          <Spacer size="sm" />
          <TextInput
            id="slug"
            name="slug"
            label="Slug"
            type="text"
            required={true}
            defaultValue={loaderData.enigma.slug}
          />
          <Spacer size="sm" />
          <Button type="submit">Salvar</Button>
        </Form>

        <Spacer size="lg" />
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Fases</h2>
          <LinkButton
            styleType="secondary"
            to={`/enigmas/${loaderData.enigma.slug}/edit/phases/new`}
          >
            + Adicionar fase
          </LinkButton>
        </div>
        <Spacer size="sm" />

        {loaderData.enigma.phases.length === 0 ? (
          <p className="text-sm opacity-60">Nenhuma fase ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {loaderData.enigma.phases.map((phase, index) => (
              <li
                key={phase.id}
                className="flex items-center justify-between gap-4 rounded-md border-1 p-3"
              >
                <div>
                  <span className="text-sm opacity-60">
                    Fase {phase.order}
                    {index === 0 ? ' (entrada: comecar)' : ''}
                  </span>
                  <p className="font-medium">{phase.title}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/enigmas/${loaderData.enigma.slug}/edit/phases/${phase.id}`}
                    viewTransition
                  >
                    Editar
                  </Link>
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="delete-phase" />
                    <input type="hidden" name="phaseId" value={phase.id} />
                    <button
                      type="submit"
                      className="cursor-pointer text-red-500 hover:underline"
                      onClick={(e) => {
                        if (!confirm('Remover esta fase?')) e.preventDefault()
                      }}
                    >
                      Remover
                    </button>
                  </fetcher.Form>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Spacer size="lg" />
        <Link to={`/enigmas/${loaderData.enigma.slug}/comecar`} viewTransition>
          Testar enigma →
        </Link>

        <Spacer size="lg" />
        <Form method="post">
          <input type="hidden" name="intent" value="delete-enigma" />
          <button
            type="submit"
            className="cursor-pointer text-red-500 hover:underline text-sm"
            onClick={(e) => {
              if (!confirm(`Deletar o enigma "${loaderData.enigma.name}" permanentemente? Esta ação não pode ser desfeita.`)) e.preventDefault()
            }}
          >
            Deletar enigma
          </button>
        </Form>
      </Center>
    </>
  )
}
