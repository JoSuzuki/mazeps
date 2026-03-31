import { data, Form, redirect, useSearchParams } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import { DEFAULT_ENIGMA_ENTRANCE_PROMPT } from '~/lib/enigma-entrance-prompt'
import {
  enigmaRequiresEntrancePassword,
  hasEnigmaPlayAccess,
  resolveEntrancePrompt,
  safeEnigmaInternalPath,
  setEnigmaUnlockCookieHeader,
  userBypassesEnigmaPasswordGateLive,
} from '~/lib/enigma-entrance-access.server'
import { enigmaRobotsMeta } from '~/lib/enigma-robots-meta'
import {
  getPlayablePhasesOrdered,
  hasMorePhasesAfterPlayableWindow,
} from '~/lib/enigma-public-phases.server'
import { Role } from '~/generated/prisma/enums'
import bcrypt from 'bcrypt'

function normalize(str: string) {
  return str.trim().toLowerCase()
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
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

  const accessCtx =
    context.currentUser != null
      ? { prisma: context.prisma, userId: Number(context.currentUser.id) }
      : undefined
  const hasAccess = await hasEnigmaPlayAccess(
    request,
    enigma,
    context.currentUser?.role,
    accessCtx,
  )
  if (!hasAccess && enigmaRequiresEntrancePassword(enigma)) {
    return {
      locked: true as const,
      enigmaName: enigma.name,
      slug: enigma.slug,
      prompt: resolveEntrancePrompt(enigma),
    }
  }

  const playable = getPlayablePhasesOrdered(
    enigma,
    enigma.phases,
    context.currentUser?.role,
  )
  if (enigma.published && playable.length === 0 && context.currentUser?.role !== Role.ADMIN) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    locked: false as const,
    enigma,
  }
}

export function meta({ data }: Route.MetaArgs) {
  const robots = enigmaRobotsMeta()
  if (!data) return [...robots, { title: 'Mazeps' }]
  const name = 'locked' in data && data.locked ? data.enigmaName : data.enigma.name
  return [...robots, { title: `${name} | Mazeps` }]
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

  const playable = getPlayablePhasesOrdered(
    enigma,
    phases,
    context.currentUser?.role,
  )
  if (enigma.published && playable.length === 0 && context.currentUser?.role !== Role.ADMIN) {
    throw new Response('Not Found', { status: 404 })
  }

  const formData = await request.formData()
  const intent = (formData.get('intent') as string) || ''

  if (intent === 'unlock') {
    const hash = enigma.entrancePasswordHash
    const nextRaw = (formData.get('next') as string) || null
    const nextPath = safeEnigmaInternalPath(slug, nextRaw)

    if (await userBypassesEnigmaPasswordGateLive(context.prisma, context.currentUser)) {
      if (hash) {
        const cookie = await setEnigmaUnlockCookieHeader(request, slug, enigma.id, hash)
        return redirect(nextPath, {
          headers: { 'Set-Cookie': cookie },
        })
      }
      return redirect(nextPath)
    }

    if (!hash) {
      return redirect(`/enigmas/${slug}/entrada`)
    }
    const password = (formData.get('password') as string) ?? ''

    if (!password.trim()) {
      return data({ error: 'Digite a senha.', intent: 'unlock' as const })
    }

    let ok = false
    try {
      ok = await bcrypt.compare(password, hash)
    } catch {
      ok = false
    }
    if (!ok) {
      return data({
        error: 'Senha incorreta.',
        intent: 'unlock' as const,
        prompt: resolveEntrancePrompt(enigma),
      })
    }

    const cookie = await setEnigmaUnlockCookieHeader(request, slug, enigma.id, hash)
    return redirect(nextPath, {
      headers: { 'Set-Cookie': cookie },
    })
  }

  const accessCtxPost =
    context.currentUser != null
      ? { prisma: context.prisma, userId: Number(context.currentUser.id) }
      : undefined
  const canPlay = await hasEnigmaPlayAccess(
    request,
    enigma,
    context.currentUser?.role,
    accessCtxPost,
  )
  if (!canPlay && enigmaRequiresEntrancePassword(enigma)) {
    return data({
      error: 'É necessário informar a senha do enigma antes de continuar.',
    })
  }

  const raw = (formData.get('lastAnswer') as string) ?? ''
  const keyNorm = normalize(raw)

  if (!keyNorm) {
    return data({ error: 'Preencha o campo para continuar.' })
  }

  const matchIndex = playable.findIndex((p) => normalize(p.answer) === keyNorm)
  if (matchIndex === -1) {
    return data({
      error: 'Não encontramos essa resposta neste enigma. Confira ortografia e espaços.',
    })
  }

  const isLast = matchIndex === playable.length - 1
  if (isLast) {
    if (hasMorePhasesAfterPlayableWindow(enigma.phases, playable)) {
      return redirect(`/enigmas/${slug}/mais-por-vir`)
    }
    return redirect(`/enigmas/${slug}/parabens`)
  }

  const segment = encodeURIComponent(playable[matchIndex]!.answer.trim())
  return redirect(`/enigmas/${slug}/${segment}`)
}

function LockedGateView({
  enigmaName,
  prompt,
  actionData,
}: {
  enigmaName: string
  prompt: string
  actionData: Route.ComponentProps['actionData']
}) {
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') ?? ''

  const displayPrompt =
    actionData && 'prompt' in actionData && typeof actionData.prompt === 'string'
      ? actionData.prompt
      : prompt

  return (
    <>
      <BackButtonPortal to="/enigmas" />
      <Center>
        <div className="mx-auto w-full max-w-md px-6 py-10">
          <div
            className="rounded-2xl border border-foreground/15 bg-background/95 p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enigma-gate-title"
          >
            <h1
              id="enigma-gate-title"
              className="mb-4 text-center font-brand text-2xl tracking-wide text-foreground/95"
            >
              {enigmaName}
            </h1>
            <p className="mb-6 whitespace-pre-wrap text-center text-sm leading-relaxed text-foreground/80">
              {displayPrompt || DEFAULT_ENIGMA_ENTRANCE_PROMPT}
            </p>
            <Form method="post" className="flex flex-col gap-4">
              <input type="hidden" name="intent" value="unlock" />
              <input type="hidden" name="next" value={next} />
                <label htmlFor="gate-password" className="sr-only">
                  Senha do enigma
                </label>
                <input
                  id="gate-password"
                  name="password"
                  type="password"
                  autoComplete="off"
                  className="w-full rounded-md border-1 p-2"
                  placeholder="Senha"
                />
                {actionData?.error && (
                  <p className="text-center text-sm text-red-600" role="alert">
                    {actionData.error}
                  </p>
                )}
              <Button type="submit" className="w-full py-3 text-base font-semibold">
                Entrar
              </Button>
            </Form>
          </div>
        </div>
      </Center>
    </>
  )
}

export default function Route({
  loaderData,
  actionData,
  params,
}: Route.ComponentProps) {
  if (loaderData.locked) {
    return (
      <LockedGateView
        enigmaName={loaderData.enigmaName}
        prompt={loaderData.prompt}
        actionData={actionData}
      />
    )
  }

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
