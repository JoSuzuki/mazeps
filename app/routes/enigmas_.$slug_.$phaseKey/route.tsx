import { data, redirect } from 'react-router'
import type { Route } from './+types/route'
import EnigmaPhasePlay from '~/components/enigma-phase-play/enigma-phase-play.component'
import {
  toPublicEnigmaPhase,
  toPublicEnigmaPlay,
} from '~/lib/enigma-play-public'
import { enigmaRobotsMeta } from '~/lib/enigma-robots-meta'
import {
  normalizeEnigmaAnswerInput,
  resolvePhaseAnswerSubmission,
} from '~/lib/enigma-phase-answer.server'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  const { slug, phaseKey } = params

  const enigma = await context.prisma.enigma.findUnique({
    where: { slug },
    include: { phases: { orderBy: { order: 'asc' } } },
  })

  if (!enigma) throw new Response('Not Found', { status: 404 })

  const isAdmin = context.currentUser?.role === Role.ADMIN
  if (!isAdmin && !enigma.published) {
    throw new Response('Not Found', { status: 404 })
  }

  if (phaseKey === 'comecar') {
    return redirect(`/enigmas/${slug}`)
  }

  if (phaseKey === 'parabens') {
    return {
      enigma: toPublicEnigmaPlay(enigma),
      phase: null,
      isFinished: true,
      isAdmin: context.currentUser?.role === Role.ADMIN,
    }
  }

  let phase = null

  const keyNorm = normalizeEnigmaAnswerInput(phaseKey!)
  const prevIndex = enigma.phases.findIndex(
    (p) => normalizeEnigmaAnswerInput(p.answer) === keyNorm,
  )
  if (prevIndex !== -1 && prevIndex + 1 < enigma.phases.length) {
    phase = enigma.phases[prevIndex + 1]
  }

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
  if (data.isFinished) {
    return [...robots, { title: `Parabéns - ${data.enigma.name} | Mazeps` }]
  }
  const title = data.phase?.pageTitle ?? data.phase?.title ?? data.enigma.name
  return [...robots, { title: `${title} | Mazeps` }]
}

export async function action({ request, context, params }: Route.ActionArgs) {
  const { slug, phaseKey } = params

  const enigma = await context.prisma.enigma.findUnique({
    where: { slug },
    include: { phases: { orderBy: { order: 'asc' } } },
  })

  if (!enigma) throw new Response('Not Found', { status: 404 })

  const isAdmin = context.currentUser?.role === Role.ADMIN
  if (!isAdmin && !enigma.published) {
    throw new Response('Not Found', { status: 404 })
  }

  if (phaseKey === 'comecar') {
    return redirect(`/enigmas/${slug}`, { status: 307 })
  }

  let phase = null
  const keyNorm = normalizeEnigmaAnswerInput(phaseKey!)
  const prevIndex = enigma.phases.findIndex(
    (p) => normalizeEnigmaAnswerInput(p.answer) === keyNorm,
  )
  if (prevIndex !== -1 && prevIndex + 1 < enigma.phases.length) {
    phase = enigma.phases[prevIndex + 1]
  }

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

  const isLast = phase.order === enigma.phases[enigma.phases.length - 1].order
  if (isLast) {
    return redirect(`/enigmas/${slug}/parabens`)
  }

  return redirect(`/enigmas/${slug}/${phase.answer}`)
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  return <EnigmaPhasePlay loaderData={loaderData} slug={params.slug} />
}
