import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'
import Link from '~/components/link/link.component'
import ParabensCelebration from '~/components/parabens-celebration/parabens-celebration.component'
import { MediaType } from '~/generated/prisma/enums'

export type EnigmaPhasePlayLoaderData = {
  enigma: { name: string }
  phase: {
    id: number
    title: string
    phrase: string
    answerLength: number
    hiddenHint: string | null
    mediaType: MediaType
    mediaUrl: string | null
    imageAlt: string | null
    tipPhrase: string | null
  } | null
  isFinished: boolean
  isAdmin: boolean
}

type EnigmaPhasePlayActionResult = { wrong?: boolean }

export default function EnigmaPhasePlay({
  loaderData,
  slug,
}: {
  loaderData: EnigmaPhasePlayLoaderData
  slug: string
}) {
  const fetcher = useFetcher<EnigmaPhasePlayActionResult>()
  const answerRef = useRef<HTMLInputElement>(null)
  const [inputLength, setInputLength] = useState(0)

  useEffect(() => {
    if (fetcher.data?.wrong) {
      alert('Resposta incorreta!')
      if (answerRef.current) {
        answerRef.current.value = ''
        answerRef.current.focus()
        setInputLength(0)
      }
    }
  }, [fetcher.data])

  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.value = ''
      setInputLength(0)
    }
  }, [loaderData.phase?.id])

  if (loaderData.isFinished) {
    return <ParabensCelebration enigmaName={loaderData.enigma.name} />
  }

  const { phase } = loaderData

  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-hidden px-6 py-2">
      <div className="flex w-full shrink-0 items-center justify-between">
        <span className="w-16" />
        <h1 className="text-center text-xl font-bold">{phase!.title}</h1>
        {loaderData.isAdmin ? (
          <Link
            to={`/enigmas/${slug}/edit/phases/${phase!.id}`}
            viewTransition
            className="w-16 text-right text-sm"
          >
            Editar
          </Link>
        ) : (
          <span className="w-16" />
        )}
      </div>

      {phase!.mediaType === MediaType.IMAGE && phase!.mediaUrl && (
        <div className="min-h-0 flex flex-1 items-center justify-center">
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

      {phase!.hiddenHint ? (
        <p
          className="shrink-0 max-w-full whitespace-pre-wrap text-center text-sm select-text"
          style={{ color: 'var(--color-background)' }}
        >
          {phase!.hiddenHint}
        </p>
      ) : null}

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
          onChange={(e) => setInputLength(e.target.value.length)}
        />
        <p className="text-sm opacity-60">
          Caracteres Restantes: {Math.max(0, phase!.answerLength - inputLength)}
        </p>
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
