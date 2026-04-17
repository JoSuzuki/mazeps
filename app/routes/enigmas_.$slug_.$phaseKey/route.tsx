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
import { resolvePhaseIdFromPlayUrlSegment } from '~/lib/enigma-phase-url-resolve.server'
import {
  canAccessCelebrationScreen,
  canAccessParabensScreen,
  redirectWithCelebrationCookie,
} from '~/lib/enigma-celebration-cookie.server'
import {
  getPlayablePhasesOrdered,
  hasMorePhasesAfterPlayableWindow,
} from '~/lib/enigma-public-phases.server'
import { Role } from '~/generated/prisma/enums'
import { grantEnigmaPhaseCertificateIfEligible } from '~/lib/enigma-phase-certificate-award.server'

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { slug, phaseKey } = params

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

  if (phaseKey === 'comecar') {
    return redirect(`/enigmas/${slug}`)
  }

  if (phaseKey === 'parabens') {
    const ok = await canAccessParabensScreen(
      request,
      context.currentUser,
      slug,
      enigma,
      context.currentUser?.role,
    )
    if (!ok) return redirect(`/enigmas/${slug}`)
    return {
      enigma: toPublicEnigmaPlay(enigma),
      phase: null,
      isFinished: true,
      celebrationKind: 'full' as const,
      isAdmin: context.currentUser?.role === Role.ADMIN,
    }
  }

  if (phaseKey === 'mais-por-vir') {
    const playable = getPlayablePhasesOrdered(
      enigma,
      enigma.phases,
      context.currentUser?.role,
    )
    if (!hasMorePhasesAfterPlayableWindow(enigma.phases, playable)) {
      return redirect(`/enigmas/${slug}/parabens`)
    }
    const ok = await canAccessCelebrationScreen(
      request,
      context.currentUser,
      slug,
      enigma.id,
      'interlude',
    )
    if (!ok) return redirect(`/enigmas/${slug}`)
    return {
      enigma: toPublicEnigmaPlay(enigma),
      phase: null,
      isFinished: true,
      celebrationKind: 'interlude' as const,
      isAdmin: context.currentUser?.role === Role.ADMIN,
    }
  }

  const playable = getPlayablePhasesOrdered(
    enigma,
    enigma.phases,
    context.currentUser?.role,
  )
  const playableIds = new Set(playable.map((p) => p.id))

  const resolvedId = resolvePhaseIdFromPlayUrlSegment(
    enigma.phases,
    phaseKey ?? '',
  )
  if (resolvedId == null || !playableIds.has(resolvedId)) {
    throw new Response('Not Found', { status: 404 })
  }

  const phaseFull = await loadEnigmaPhasePlayPayload(context.prisma, resolvedId)
  if (!phaseFull) throw new Response('Not Found', { status: 404 })

  return {
    enigma: toPublicEnigmaPlay(enigma),
    phase: toPublicEnigmaPhase(phaseFull),
    isFinished: false,
    isAdmin: context.currentUser?.role === Role.ADMIN,
  }
}

export function meta({ data }: Route.MetaArgs) {
  const robots = enigmaRobotsMeta()
  if (!data) return [...robots, { title: 'Mazeps' }]
  if (data.isFinished) {
    if (data.celebrationKind === 'interlude') {
      return [
        ...robots,
        { title: `Há mais por vir — ${data.enigma.name} | Mazeps` },
      ]
    }
    return [...robots, { title: `Parabéns - ${data.enigma.name} | Mazeps` }]
  }
  const title = data.phase?.pageTitle ?? data.phase?.title ?? data.enigma.name
  return [...robots, { title: `${title} | Mazeps` }]
}

export async function action({ request, context, params }: Route.ActionArgs) {
  const { slug, phaseKey } = params

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

  if (phaseKey === 'comecar') {
    return redirect(`/enigmas/${slug}`, { status: 307 })
  }

  if (phaseKey === 'parabens' || phaseKey === 'mais-por-vir') {
    throw new Response('Not Found', { status: 404 })
  }

  const playable = getPlayablePhasesOrdered(
    enigma,
    enigma.phases,
    context.currentUser?.role,
  )
  const playableIds = new Set(playable.map((p) => p.id))

  const resolvedId = resolvePhaseIdFromPlayUrlSegment(
    enigma.phases,
    phaseKey ?? '',
  )
  if (resolvedId == null || !playableIds.has(resolvedId)) {
    throw new Response('Not Found', { status: 404 })
  }

  const phaseFull = await loadEnigmaPhasePlayPayload(context.prisma, resolvedId)
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
