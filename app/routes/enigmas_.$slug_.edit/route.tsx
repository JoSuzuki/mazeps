import { data, Form, Link as RouterLink, redirect, useFetcher } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import TextInput from '~/components/text-input/text-input.component'
import { enigmaRobotsMeta } from '~/lib/enigma-robots-meta'
import { Role } from '~/generated/prisma/enums'
import bcrypt from 'bcrypt'

const ICON_CLASS = 'h-5 w-5 shrink-0 text-foreground/50'

function InfoIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4 text-foreground/40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function meta({ data }: Route.MetaArgs) {
  const robots = enigmaRobotsMeta()
  if (!data?.enigma) return [...robots, { title: 'Editar enigma | Mazeps' }]
  return [...robots, { title: `Editar: ${data.enigma.name} | Mazeps` }]
}

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const raw = await context.prisma.enigma.findUniqueOrThrow({
    where: { slug: params.slug },
    include: { phases: { orderBy: { order: 'asc' } } },
  })

  const { entrancePasswordHash, ...enigma } = raw
  return {
    enigma: {
      ...enigma,
      hasEntrancePassword: Boolean(entrancePasswordHash),
    },
  }
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
    const published = formData.get('published') === 'on'
    const entrancePasswordClear = formData.get('entrancePasswordClear') === 'on'
    const entrancePasswordRaw = ((formData.get('entrancePassword') as string) ?? '').trim()
    const entrancePasswordPromptRaw = (formData.get('entrancePasswordPrompt') as string) ?? ''
    const entrancePasswordPrompt =
      entrancePasswordPromptRaw.trim() === '' ? null : entrancePasswordPromptRaw.trim()

    const data: {
      name: string
      slug: string
      published: boolean
      entrancePasswordPrompt: string | null
      entrancePasswordHash?: string | null
    } = {
      name,
      slug,
      published,
      entrancePasswordPrompt,
    }

    if (entrancePasswordClear) {
      data.entrancePasswordHash = null
    } else if (entrancePasswordRaw) {
      data.entrancePasswordHash = await bcrypt.hash(entrancePasswordRaw, 10)
    }

    await context.prisma.enigma.update({
      where: { slug: params.slug },
      data,
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
  const { enigma } = loaderData

  return (
    <>
      <BackButtonPortal to="/enigmas" />
      <Center>
        <div className="mx-auto max-w-2xl px-6 py-10">
          {/* Header */}
          <header className="mb-8">
            <h1 className="font-brand text-2xl tracking-wide">
              Gerenciar enigma
            </h1>
            <p className="mt-1 text-sm uppercase tracking-[0.2em] text-foreground/50">
              {enigma.name}
            </p>
          </header>

          {/* Informações */}
          <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              <InfoIcon />
              Informações
            </h2>
            <Form method="post">
              <input type="hidden" name="intent" value="update" />
              <div className="space-y-5">
                <TextInput
                  id="name"
                  name="name"
                  label="Nome"
                  type="text"
                  required={true}
                  defaultValue={enigma.name}
                />
                <TextInput
                  id="slug"
                  name="slug"
                  label="Slug"
                  type="text"
                  required={true}
                  defaultValue={enigma.slug}
                />
                <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-foreground/20 p-6 transition-colors hover:border-foreground/30 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={enigma.published}
                    className="h-6 w-6 shrink-0 rounded border-2 border-foreground/30 accent-primary"
                  />
                  <span className="text-lg font-semibold uppercase tracking-wide">
                    PUBLICADO
                  </span>
                </label>

                <div className="rounded-xl border border-foreground/15 bg-foreground/[0.02] p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/55">
                    Senha da página de entrada
                  </h3>
                  <p className="mb-4 text-sm text-foreground/55">
                    Quem acessar a entrada ou as fases do enigma (exceto administradores) precisará
                    desta senha uma vez por navegador. Deixe em branco a nova senha para manter a
                    atual.
                  </p>
                  {enigma.hasEntrancePassword ? (
                    <p className="mb-3 text-sm font-medium text-foreground/70">
                      Estado: senha definida
                    </p>
                  ) : (
                    <p className="mb-3 text-sm text-foreground/50">Estado: sem senha</p>
                  )}
                  <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="entrancePasswordClear"
                      className="h-4 w-4 rounded border-foreground/30 accent-primary"
                    />
                    Remover senha da entrada
                  </label>
                  <label className="mb-1 block text-sm font-medium text-foreground/80" htmlFor="entrancePassword">
                    Nova senha (opcional)
                  </label>
                  <input
                    id="entrancePassword"
                    name="entrancePassword"
                    type="password"
                    autoComplete="new-password"
                    className="mb-4 w-full rounded-md border-1 p-2"
                    placeholder={
                      enigma.hasEntrancePassword
                        ? 'Deixe vazio para manter a senha atual'
                        : 'Definir senha'
                    }
                  />
                  <label
                    className="mb-1 block text-sm font-medium text-foreground/80"
                    htmlFor="entrancePasswordPrompt"
                  >
                    Texto do popup de senha
                  </label>
                  <p className="mb-2 text-xs text-foreground/45">
                    Mensagem exibida antes do campo de senha. Se vazio, usamos um texto padrão.
                  </p>
                  <textarea
                    id="entrancePasswordPrompt"
                    name="entrancePasswordPrompt"
                    rows={4}
                    className="w-full rounded-md border-1 p-2 text-sm"
                    defaultValue={enigma.entrancePasswordPrompt ?? ''}
                    placeholder="Este enigma está protegido por senha. Digite-a para continuar."
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Salvar alterações</Button>
                </div>
              </div>
            </Form>
          </section>

          {/* Fases */}
          <section className="mb-8 overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 shadow-sm">
            <div className="flex items-center justify-between border-b border-foreground/10 bg-foreground/5 px-6 py-4">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                <LayersIcon />
                Fases ({enigma.phases.length})
              </h2>
              <LinkButton
                styleType="primary"
                to={`/enigmas/${enigma.slug}/edit/phases/new`}
                viewTransition
                className="flex items-center gap-2"
              >
                <PlusIcon />
                Adicionar fase
              </LinkButton>
            </div>
            <div>
              {enigma.phases.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <LayersIcon className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-foreground/50">
                    Nenhuma fase ainda.
                  </p>
                  <p className="mt-1 text-sm text-foreground/40">
                    Adicione a primeira fase acima.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-foreground/10">
                  {enigma.phases.map((phase, index) => (
                    <li key={phase.id}>
                      <div className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-foreground/5">
                        <div className="min-w-0 flex-1 overflow-hidden pr-2">
                          <span className="text-xs font-medium text-foreground/50">
                            Fase {phase.order}
                            {index === 0 ? ' (entrada)' : ''}
                          </span>
                          <p className="break-words font-medium">{phase.title}</p>
                        </div>
                        <div className="relative z-10 flex shrink-0 items-center gap-2">
                          <RouterLink
                            to={`/enigmas/${enigma.slug}/edit/phases/${phase.id}`}
                            reloadDocument
                            className="flex items-center gap-1.5 rounded-lg border border-foreground/20 px-3 py-2 text-sm font-medium transition-colors hover:bg-foreground/5 hover:underline active:pressed"
                          >
                            <PencilIcon />
                            Editar
                          </RouterLink>
                          <fetcher.Form method="post">
                            <input type="hidden" name="intent" value="delete-phase" />
                            <input type="hidden" name="phaseId" value={phase.id} />
                            <button
                              type="submit"
                              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                              onClick={(e) => {
                                if (!confirm('Remover esta fase?')) e.preventDefault()
                              }}
                            >
                              <TrashIcon />
                              Remover
                            </button>
                          </fetcher.Form>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Testar enigma */}
          <div className="mb-8">
            <Link
              to={`/enigmas/${enigma.slug}`}
              viewTransition
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary/10 px-6 py-4 font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <PlayIcon />
              Testar enigma
              <ChevronRightIcon />
            </Link>
          </div>

          {/* Zona de perigo */}
          <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6 shadow-sm dark:border-red-900/50 dark:bg-red-950/20">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 dark:text-red-400">
              Zona de perigo
            </h2>
            <p className="mb-4 text-sm text-red-600 dark:text-red-300">
              Deletar o enigma é irreversível. Todas as fases e dados serão removidos.
            </p>
            <Form method="post">
              <input type="hidden" name="intent" value="delete-enigma" />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:border-red-800 dark:bg-red-700 dark:hover:bg-red-800"
                onClick={(e) => {
                  if (!confirm(`Deletar o enigma "${enigma.name}" permanentemente? Esta ação não pode ser desfeita.`)) e.preventDefault()
                }}
              >
                <TrashIcon />
                Deletar enigma
              </button>
            </Form>
          </section>
        </div>
      </Center>
    </>
  )
}
