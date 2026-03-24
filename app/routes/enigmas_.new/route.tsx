import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import TextInput from '~/components/text-input/text-input.component'
import { enigmaRobotsMeta } from '~/lib/enigma-robots-meta'
import { Role } from '~/generated/prisma/enums'

const ICON_CLASS = 'h-5 w-5 shrink-0 text-foreground/50'

function PlusIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

export function meta() {
  return [...enigmaRobotsMeta(), { title: 'Novo enigma | Mazeps' }]
}

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')
  return data(null)
}

export default function Route() {
  return (
    <>
      <BackButtonPortal to="/enigmas" />
      <Center>
        <div className="mx-auto max-w-xl px-6 py-10">
          <header className="mb-8">
            <h1 className="font-brand flex items-center gap-2 text-2xl tracking-wide">
              <PlusIcon />
              Criar enigma
            </h1>
            <p className="mt-1 text-sm uppercase tracking-[0.2em] text-foreground/50">
              Dê um nome e um slug para o novo enigma
            </p>
          </header>

          <section className="overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              <InfoIcon />
              Informações
            </h2>
            <Form method="post" className="space-y-5">
              <TextInput
                id="name"
                name="name"
                label="Nome"
                type="text"
                required={true}
                placeholder="Ex: O mistério do labirinto"
              />
              <TextInput
                id="slug"
                name="slug"
                label="Slug (usado na URL)"
                type="text"
                required={true}
                placeholder="Ex: mistério-labirinto"
              />
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <LinkButton
                  to="/enigmas"
                  styleType="secondary"
                  viewTransition
                  className="order-2 sm:order-1"
                >
                  Cancelar
                </LinkButton>
                <Button type="submit" className="order-1 sm:order-2">
                  Criar enigma
                </Button>
              </div>
            </Form>
          </section>
        </div>
      </Center>
    </>
  )
}

export async function action({ request, context }: Route.ActionArgs) {
  if (context.currentUser?.role !== Role.ADMIN) {
    return data({ error: 'Apenas admins podem criar enigmas' })
  }

  const formData = await request.formData()
  const name = formData.get('name') as string
  const slug = (formData.get('slug') as string).toLowerCase().trim()

  const enigma = await context.prisma.enigma.create({ data: { name, slug } })

  return redirect(`/enigmas/${enigma.slug}/edit`)
}
