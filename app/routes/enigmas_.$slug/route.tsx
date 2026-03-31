import { data, redirect } from 'react-router'
import type { Route } from './+types/route'
import EnigmaPhasePlay from '~/components/enigma-phase-play/enigma-phase-play.component'
import {
  enigmaRequiresEntrancePassword,
  hasEnigmaPlayAccess,
} from '~/lib/enigma-entrance-access.server'
import {
  toPublicEnigmaPhase,
  toPublicEnigmaPlay,
} from '~/lib/enigma-play-public'
import { enigmaRobotsMeta } from '~/lib/enigma-robots-meta'
import { resolvePhaseAnswerSubmission } from '~/lib/enigma-phase-answer.server'
import {
  getPlayablePhasesOrdered,
  hasMorePhasesAfterPlayableWindow,
} from '~/lib/enigma-public-phases.server'
import { Role } from '~/generated/prisma/enums'

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

  const accessCtx =
    context.currentUser != null
      ? { prisma: context.prisma, userId: Number(context.currentUser.id) }
      : undefined
  const canPlay = await hasEnigmaPlayAccess(
    request,
    enigma,
    context.currentUser?.role,
    accessCtx,
  )
  if (!canPlay && enigmaRequiresEntrancePassword(enigma)) {
    const next = encodeURIComponent(new URL(request.url).pathname)
    return redirect(`/enigmas/${slug}/entrada?next=${next}`)
  }

  const playable = getPlayablePhasesOrdered(
    enigma,
    enigma.phases,
    context.currentUser?.role,
  )
  const phase = playable[0] ?? null
  if (!phase) throw new Response('Not Found', { status: 404 })

  return {
    enigma: toPublicEnigmaPlay(enigma),
    phase: toPublicEnigmaPhase(phase),
    isFinished: false,
    isAdmin: context.currentUser?.role === Role.ADMIN,
  }
}

export function meta({ data }: Route.MetaArgs) {
  const robots = enigmaRobotsMeta()
  if (!data) return [...robots, { title: 'Mazeps' }]
  const title = data.phase?.pageTitle ?? data.phase?.title ?? data.enigma.name
  return [...robots, { title: `${title} | Mazeps` }]
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

  const accessCtxAction =
    context.currentUser != null
      ? { prisma: context.prisma, userId: Number(context.currentUser.id) }
      : undefined
  const canPlay = await hasEnigmaPlayAccess(
    request,
    enigma,
    context.currentUser?.role,
    accessCtxAction,
  )
  if (!canPlay && enigmaRequiresEntrancePassword(enigma)) {
    const next = encodeURIComponent(new URL(request.url).pathname)
    return redirect(`/enigmas/${slug}/entrada?next=${next}`)
  }

  const playable = getPlayablePhasesOrdered(
    enigma,
    enigma.phases,
    context.currentUser?.role,
  )
  const phase = playable[0] ?? null
  if (!phase) throw new Response('Not Found', { status: 404 })

  const formData = await request.formData()
  const resolution = resolvePhaseAnswerSubmission({
    submittedRaw: formData.get('answer') as string,
    correctAnswer: phase.answer,
    whiteScreenHintsJson: phase.whiteScreenHints,
  })

  if (resolution.kind === 'whiteScreen') {
    return data({ whiteScreen: true as const, message: resolution.message })
  }
  if (resolution.kind === 'wrong') {
    return data({ wrong: true as const })
  }

  const isLast = phase.order === playable[playable.length - 1]!.order
  if (isLast) {
    if (hasMorePhasesAfterPlayableWindow(enigma.phases, playable)) {
      return redirect(`/enigmas/${slug}/mais-por-vir`)
    }
    return redirect(`/enigmas/${slug}/parabens`)
  }

  return redirect(`/enigmas/${slug}/${phase.answer}`)
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  return <EnigmaPhasePlay loaderData={loaderData} slug={params.slug} />
}
