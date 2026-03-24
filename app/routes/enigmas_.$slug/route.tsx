import { data, redirect } from 'react-router'
import type { Route } from './+types/route'
import EnigmaPhasePlay from '~/components/enigma-phase-play/enigma-phase-play.component'
import {
  toPublicEnigmaPhase,
  toPublicEnigmaPlay,
} from '~/lib/enigma-play-public'
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

  const phase = enigma.phases[0] ?? null
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

  const phase = enigma.phases[0] ?? null
  if (!phase) throw new Response('Not Found', { status: 404 })

  const formData = await request.formData()
  const submitted = normalize(formData.get('answer') as string)
  const correct = normalize(phase.answer)

  if (submitted !== correct) {
    return data({ wrong: true })
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
