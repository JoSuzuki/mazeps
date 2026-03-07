import { useEffect, useRef } from 'react'
import { data, redirect, useFetcher } from 'react-router'
import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'
import { MediaType, Role } from '~/generated/prisma/enums'

function normalize(str: string) {
  return str.trim().toLowerCase()
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const { slug, phaseKey } = params

  const enigma = await context.prisma.enigma.findUnique({
    where: { slug },
    include: { phases: { orderBy: { order: 'asc' } } },
  })

  if (!enigma) throw new Response('Not Found', { status: 404 })

  // Congratulations screen
  if (phaseKey === 'parabens') {
    return { enigma, phase: null, isFinished: true, isAdmin: context.currentUser?.role === Role.ADMIN }
  }

  let phase = null

  if (phaseKey === 'comecar') {
    phase = enigma.phases[0] ?? null
  } else {
    // Find the phase whose previous phase has answer === phaseKey
    const keyNorm = normalize(phaseKey!)
    const prevIndex = enigma.phases.findIndex(
      (p) => normalize(p.answer) === keyNorm,
    )
    if (prevIndex !== -1 && prevIndex + 1 < enigma.phases.length) {
      phase = enigma.phases[prevIndex + 1]
    }
  }

  if (!phase) throw new Response('Not Found', { status: 404 })

  return {
    enigma,
    phase,
    isFinished: false,
    isAdmin: context.currentUser?.role === Role.ADMIN,
  }
}

export async function action({ request, context, params }: Route.ActionArgs) {
  const { slug, phaseKey } = params

  const enigma = await context.prisma.enigma.findUnique({
    where: { slug },
    include: { phases: { orderBy: { order: 'asc' } } },
  })

  if (!enigma) throw new Response('Not Found', { status: 404 })

  let phase = null
  if (phaseKey === 'comecar') {
    phase = enigma.phases[0] ?? null
  } else {
    const keyNorm = normalize(phaseKey!)
    const prevIndex = enigma.phases.findIndex(
      (p) => normalize(p.answer) === keyNorm,
    )
    if (prevIndex !== -1 && prevIndex + 1 < enigma.phases.length) {
      phase = enigma.phases[prevIndex + 1]
    }
  }

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
  const fetcher = useFetcher<typeof action>()
  const answerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (fetcher.data?.wrong) {
      alert('Resposta incorreta!')
      if (answerRef.current) {
        answerRef.current.value = ''
        answerRef.current.focus()
      }
    }
  }, [fetcher.data])

  if (loaderData.isFinished) {
    return (
      <Center>
        <Spacer size="lg" />
        <h1 className="flex justify-center text-2xl font-bold">Parabéns! 🎉</h1>
        <Spacer size="md" />
        <p className="text-center opacity-70">
          Você completou o enigma <strong>{loaderData.enigma.name}</strong>!
        </p>
        <Spacer size="lg" />
        <Link to="/enigmas" viewTransition>
          ← Ver todos os enigmas
        </Link>
      </Center>
    )
  }

  const { phase } = loaderData

  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-hidden px-6 py-2">
      {/* Title row with optional admin link */}
      <div className="flex w-full shrink-0 items-center justify-between">
        <span className="w-16" />
        <h1 className="text-center text-xl font-bold">{phase!.title}</h1>
        {loaderData.isAdmin ? (
          <Link
            to={`/enigmas/${params.slug}/edit/phases/${phase!.id}`}
            viewTransition
            className="w-16 text-right text-sm"
          >
            Editar
          </Link>
        ) : (
          <span className="w-16" />
        )}
      </div>

      {/* Media — flex-1 so it fills exactly what's left */}
      {phase!.mediaType === MediaType.IMAGE && phase!.mediaUrl && (
        <div className="min-h-0 flex-1 flex items-center justify-center">
          <img
            src={phase!.mediaUrl}
            alt={phase!.imageAlt ?? ''}
            className="max-h-full w-auto max-w-full rounded-md object-contain"
          />
        </div>
      )}

      {phase!.mediaType === MediaType.VIDEO && phase!.mediaUrl && (
        <div className="min-h-0 flex-1 w-full">
          <iframe
            src={phase!.mediaUrl}
            className="h-full w-full rounded-md"
            title={phase!.title}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}

      {phase!.mediaType === MediaType.AUDIO && phase!.mediaUrl && (
        <audio controls src={phase!.mediaUrl} className="w-full shrink-0" />
      )}

      {phase!.mediaType === MediaType.NONE && <div className="flex-1" />}

      <p className="shrink-0 text-center leading-relaxed">{phase!.phrase}</p>

      <fetcher.Form method="post" className="flex shrink-0 flex-col items-center gap-2">
        <label htmlFor="answer" className="block font-medium">
          Resposta
        </label>
        <input
          ref={answerRef}
          id="answer"
          name="answer"
          type="text"
          required
          autoComplete="off"
          className="w-48 rounded-md border-1 p-1 text-center"
        />
        <button
          type="submit"
          className="active:pressed cursor-pointer rounded-md bg-primary px-6 py-2 text-on-primary hover:opacity-90"
        >
          Enviar
        </button>
      </fetcher.Form>

      {phase!.tipPhrase && (
        <p className="shrink-0 pb-2 text-center text-sm italic opacity-60">
          {phase!.tipPhrase}
        </p>
      )}
    </div>
  )
}
