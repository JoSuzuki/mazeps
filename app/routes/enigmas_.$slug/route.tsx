import { data, redirect } from 'react-router'
import type { Route } from './+types/route'
import EnigmaPhasePlay from '~/components/enigma-phase-play/enigma-phase-play.component'
import { allowEnigmaAnswerAttempt } from '~/lib/enigma-answer-rate-limit.server'
import {
  enigmaRequiresEntrancePassword,
  hasEnigmaPlayAccess,
} from '~/lib/enigma-entrance-access.server'
import {
  loadEnigmaLightForPlay,
  loadEnigmaPhasePlayPayload,
} from '~/lib/enigma-play-queries.server'
import {
  toPublicEnigmaPhase,
  toPublicEnigmaPlay,
} from '~/lib/enigma-play-public'
import { enigmaRobotsMeta } from '~/lib/enigma-robots-meta'
import { resolvePhaseAnswerSubmission } from '~/lib/enigma-phase-answer.server'
import { grantEnigmaPhaseCertificateIfEligible } from '~/lib/enigma-phase-certificate-award.server'
import { redirectWithCelebrationCookie } from '~/lib/enigma-celebration-cookie.server'
import {
  getPlayablePhasesOrdered,
  hasMorePhasesAfterPlayableWindow,
} from '~/lib/enigma-public-phases.server'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { slug } = params

  const enigma = await loadEnigmaLightForPlay(context.prisma, slug)

  if (!enigma) throw new Response('Not Found', { status: 404 })

  const isAdmin = context.currentUser?.role === Role.ADMIN
  if (!isAdmin && !enigma.published) {
    throw new Response('Not Found', { status: 404 })
  }

  const canPlay = await hasEnigmaPlayAccess(
    request,
    enigma,
    context.currentUser?.role,
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
  const first = playable[0] ?? null
  if (!first) throw new Response('Not Found', { status: 404 })

  const phaseFull = await loadEnigmaPhasePlayPayload(context.prisma, first.id)
  if (!phaseFull) throw new Response('Not Found', { status: 404 })

  return {
    enigma: toPublicEnigmaPlay(enigma, 'none'),
    phase: toPublicEnigmaPhase(phaseFull),
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

  if (!allowEnigmaAnswerAttempt(request, slug)) {
    return data({ tooManyAttempts: true as const }, { status: 429 })
  }

  const enigma = await loadEnigmaLightForPlay(context.prisma, slug)

  if (!enigma) throw new Response('Not Found', { status: 404 })

  const isAdmin = context.currentUser?.role === Role.ADMIN
  if (!isAdmin && !enigma.published) {
    throw new Response('Not Found', { status: 404 })
  }

  const canPlay = await hasEnigmaPlayAccess(
    request,
    enigma,
    context.currentUser?.role,
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
  const first = playable[0] ?? null
  if (!first) throw new Response('Not Found', { status: 404 })

  const phaseFull = await loadEnigmaPhasePlayPayload(context.prisma, first.id)
  if (!phaseFull) throw new Response('Not Found', { status: 404 })

  const formData = await request.formData()
  const resolution = resolvePhaseAnswerSubmission({
    submittedRaw: formData.get('answer') as string,
    correctAnswer: phaseFull.answer,
    whiteScreenHintsJson: phaseFull.whiteScreenHints,
  })

  if (resolution.kind === 'whiteScreen') {
    return data({ whiteScreen: true as const, message: resolution.message })
  }
  if (resolution.kind === 'wrong') {
    return data({ wrong: true as const })
  }

  await grantEnigmaPhaseCertificateIfEligible(
    context.prisma,
    context.currentUser,
    phaseFull,
  )

  const isLast = phaseFull.order === playable[playable.length - 1]!.order
  if (isLast) {
    if (hasMorePhasesAfterPlayableWindow(enigma.phases, playable)) {
      return redirectWithCelebrationCookie(
        `/enigmas/${slug}/mais-por-vir`,
        request,
        slug,
        enigma.id,
        'interlude',
      )
    }
    return redirectWithCelebrationCookie(
      `/enigmas/${slug}/parabens`,
      request,
      slug,
      enigma.id,
      'full',
    )
  }

  const curIdx = enigma.phases.findIndex((p) => p.id === phaseFull.id)
  const nextLight =
    curIdx !== -1 && curIdx + 1 < enigma.phases.length
      ? enigma.phases[curIdx + 1]!
      : null
  if (!nextLight) {
    throw new Response('Not Found', { status: 404 })
  }
  return redirect(`/enigmas/${slug}/${nextLight.playPathToken}`)
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  return <EnigmaPhasePlay loaderData={loaderData} slug={params.slug} />
}
