import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import { enigmaRobotsMeta } from '~/lib/enigma-robots-meta'
import { Role } from '~/generated/prisma/enums'

function normalize(str: string) {
  return str.trim().toLowerCase()
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const { slug } = params

  const enigma = await context.prisma.enigma.findUnique({
    where: { slug },
    include: { phases: { orderBy: { order: 'asc' } } },
  })

  if (!enigma) throw new Response('Not Found', { status: 404 })

  const isAdmin = context.currentUser?.role === Role.ADMIN
  if (!isAdmin && !enigma.published) {
    throw new Response('Not Found', { status: 404 })
  }

  if (enigma.phases.length === 0) {
    throw new Response('Not Found', { status: 404 })
  }

  return { enigma }
}

export function meta({ data }: Route.MetaArgs) {
  const robots = enigmaRobotsMeta()
  if (!data) return [...robots, { title: 'Mazeps' }]
  return [...robots, { title: `${data.enigma.name} | Mazeps` }]
}

export async function action({ request, context, params }: Route.ActionArgs) {
  const { slug } = params

  const enigma = await context.prisma.enigma.findUnique({
    where: { slug },
    include: { phases: { orderBy: { order: 'asc' } } },
  })

  if (!enigma) throw new Response('Not Found', { status: 404 })

  const isAdmin = context.currentUser?.role === Role.ADMIN
  if (!isAdmin && !enigma.published) {
    throw new Response('Not Found', { status: 404 })
  }

  const phases = enigma.phases
  if (phases.length === 0) throw new Response('Not Found', { status: 404 })

  const formData = await request.formData()
  const raw = (formData.get('lastAnswer') as string) ?? ''
  const keyNorm = normalize(raw)

  if (!keyNorm) {
    return data({ error: 'Preencha o campo para continuar.' })
  }

  const matchIndex = phases.findIndex((p) => normalize(p.answer) === keyNorm)
  if (matchIndex === -1) {
    return data({
      error: 'Não encontramos essa resposta neste enigma. Confira ortografia e espaços.',
    })
  }

  const isLast = matchIndex === phases.length - 1
  if (isLast) {
    return redirect(`/enigmas/${slug}/parabens`)
  }

  const segment = encodeURIComponent(phases[matchIndex].answer.trim())
  return redirect(`/enigmas/${slug}/${segment}`)
}

export default function Route({
  loaderData,
  actionData,
  params,
}: Route.ComponentProps) {
  const { enigma } = loaderData

  return (
    <>
      <BackButtonPortal to="/enigmas" />
      <Center>
        <div className="mx-auto w-full max-w-md px-6 py-10">
          <header className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/50">
              Enigma
            </p>
            <h1 className="font-brand text-3xl tracking-wide text-foreground/95">
              {enigma.name}
            </h1>
          </header>

          <div className="space-y-8 rounded-2xl border border-foreground/15 bg-background/60 p-6 shadow-sm">
            <section className="text-center">
              <LinkButton
                to={`/enigmas/${params.slug}`}
                viewTransition
                styleType="primary"
                className="w-full justify-center py-3 text-base font-semibold"
              >
                Vamos do começo...
              </LinkButton>
            </section>

            <div className="border-t border-foreground/10 pt-8">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Continuar
              </h2>

              <Form method="post" className="flex flex-col gap-4">
                <label htmlFor="lastAnswer" className="sr-only">
                  Resposta para retomar o enigma
                </label>
                <input
                  id="lastAnswer"
                  name="lastAnswer"
                  type="text"
                  autoComplete="off"
                  placeholder="Ex.: a palavra ou frase que você encontrou"
                  className="w-full rounded-md border-1 p-2"
                />
                {actionData?.error && (
                  <p className="text-sm text-red-600" role="alert">
                    {actionData.error}
                  </p>
                )}
                <Button type="submit" className="w-full py-3 text-base font-semibold">
                  Ir para a fase
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </Center>
    </>
  )
}
