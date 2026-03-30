import { useEffect, useRef } from 'react'
import { Link, useFetcher } from 'react-router'
import ParabensCelebration from '~/components/parabens-celebration/parabens-celebration.component'
import type { ExtraMediaBlock } from '~/lib/enigma-phase-extras'
import { MediaType } from '~/generated/prisma/enums'

export type EnigmaPhasePlayLoaderData = {
  enigma: { name: string }
  phase: {
    id: number
    title: string
    phrase: string
    hiddenHint: string | null
    mediaType: MediaType
    mediaUrl: string | null
    imageAlt: string | null
    tipPhrase: string | null
    extraMediaBlocks: ExtraMediaBlock[]
    extraPhrases: string[]
    extraTipPhrases: string[]
    extraHiddenHints: string[]
  } | null
  isFinished: boolean
  isAdmin: boolean
}

type EnigmaPhasePlayActionResult =
  | { wrong?: true }
  | { whiteScreen?: true; message?: string }

function renderMediaBlock(
  key: string,
  mediaType: MediaType,
  mediaUrl: string | null,
  imageAlt: string | null,
  title: string,
  /** Mais de uma mídia: cada uma ocupa uma fatia da altura disponível, sem scroll interno. */
  shareVerticalSpace: boolean,
) {
  const slotClass = shareVerticalSpace
    ? 'flex min-h-0 min-w-0 w-full flex-1 flex-col items-center justify-center gap-2'
    : 'flex w-full shrink-0 flex-col items-center justify-center gap-2'

  if (mediaType === MediaType.IMAGE && mediaUrl) {
    return (
      <div key={key} className={slotClass}>
        <img
          src={mediaUrl}
          alt={imageAlt ?? ''}
          className={
            shareVerticalSpace
              ? 'max-h-full w-auto max-w-full rounded-md object-contain'
              : 'max-h-[min(50dvh,420px)] w-auto max-w-full rounded-md object-contain'
          }
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const msg = e.currentTarget.nextElementSibling
            if (msg instanceof HTMLElement) {
              msg.classList.remove('hidden')
            }
          }}
        />
        <p className="hidden text-center text-sm text-foreground/50">
          Não foi possível carregar a imagem. Se o ficheiro foi removido do servidor, edite a fase e envie de
          novo ou use uma URL externa.
        </p>
      </div>
    )
  }
  if (mediaType === MediaType.VIDEO && mediaUrl) {
    return (
      <div key={key} className={slotClass}>
        <div className="aspect-video w-full max-h-full min-h-0 max-w-2xl">
          <iframe
            src={mediaUrl}
            className="h-full w-full rounded-md"
            title={title}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    )
  }
  if (mediaType === MediaType.AUDIO && mediaUrl) {
    return (
      <div key={key} className={slotClass}>
        <audio controls src={mediaUrl} className="w-full max-w-xl shrink-0" />
      </div>
    )
  }
  return null
}

export default function EnigmaPhasePlay({
  loaderData,
  slug,
}: {
  loaderData: EnigmaPhasePlayLoaderData
  slug: string
}) {
  const fetcher = useFetcher<EnigmaPhasePlayActionResult>()
  const answerRef = useRef<HTMLInputElement>(null)
  const whiteScreenDialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = fetcher.data
    if (!d) return
    if ('whiteScreen' in d && d.whiteScreen && typeof d.message === 'string') {
      queueMicrotask(() => whiteScreenDialogRef.current?.showModal())
      return
    }
    if ('wrong' in d && d.wrong) {
      alert('Resposta incorreta!')
      if (answerRef.current) {
        answerRef.current.value = ''
        answerRef.current.focus()
      }
    }
  }, [fetcher.data])

  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.value = ''
    }
  }, [loaderData.phase?.id])

  if (loaderData.isFinished) {
    return <ParabensCelebration enigmaName={loaderData.enigma.name} />
  }

  const { phase } = loaderData
  const extras = phase!.extraMediaBlocks ?? []
  const extraPhrases = phase!.extraPhrases ?? []
  const extraTips = phase!.extraTipPhrases ?? []
  const extraHidden = phase!.extraHiddenHints ?? []

  const whiteScreenMessage =
    fetcher.data && 'whiteScreen' in fetcher.data && fetcher.data.whiteScreen
      ? fetcher.data.message
      : undefined

  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-hidden px-6 py-2">
      <dialog
        ref={whiteScreenDialogRef}
        className="fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-primary/35 bg-background p-6 text-primary shadow-2xl backdrop:bg-black/50"
        onClose={() => answerRef.current?.focus()}
      >
        <p className="mb-6 max-h-[min(60dvh,20rem)] overflow-y-auto whitespace-pre-wrap text-center text-base font-medium leading-relaxed text-primary">
          {whiteScreenMessage ?? ''}
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            className="rounded-lg bg-primary px-8 py-2.5 font-medium text-on-primary hover:opacity-90"
            onClick={() => whiteScreenDialogRef.current?.close()}
          >
            OK
          </button>
        </div>
      </dialog>
      <div className="flex w-full shrink-0 items-center justify-between gap-2">
        <span className="w-16 shrink-0" aria-hidden />
        <h1 className="min-w-0 flex-1 truncate text-center text-xl font-bold">
          {phase!.title}
        </h1>
        {loaderData.isAdmin ? (
          <Link
            to={`/enigmas/${slug}/edit/phases/${phase!.id}`}
            reloadDocument
            className="relative z-10 w-16 shrink-0 text-right text-sm hover:underline active:pressed"
          >
            Editar
          </Link>
        ) : (
          <span className="w-16 shrink-0" aria-hidden />
        )}
      </div>

      {(() => {
        const primaryShown =
          phase!.mediaType !== MediaType.NONE && Boolean(phase!.mediaUrl)
        const extraShown = extras.some(
          (b) => b.mediaType !== MediaType.NONE && Boolean(b.mediaUrl),
        )
        if (!primaryShown && !extraShown) {
          return <div className="min-h-0 flex-1" />
        }
        let mediaCount = 0
        if (primaryShown) mediaCount += 1
        for (const b of extras) {
          if (b.mediaType !== MediaType.NONE && b.mediaUrl) mediaCount += 1
        }
        const shareVerticalSpace = mediaCount > 1
        return (
          <div
            className={
              shareVerticalSpace
                ? 'flex min-h-0 w-full min-w-0 flex-1 flex-col items-center gap-2 overflow-hidden'
                : 'flex min-h-0 w-full flex-1 flex-col items-center gap-4 overflow-y-auto'
            }
          >
            {primaryShown
              ? renderMediaBlock(
                  'primary-media',
                  phase!.mediaType,
                  phase!.mediaUrl,
                  phase!.imageAlt,
                  phase!.title,
                  shareVerticalSpace,
                )
              : null}
            {extras.map((b, i) =>
              b.mediaType !== MediaType.NONE && b.mediaUrl
                ? renderMediaBlock(
                    `extra-media-${i}`,
                    b.mediaType,
                    b.mediaUrl,
                    b.imageAlt,
                    phase!.title,
                    shareVerticalSpace,
                  )
                : null,
            )}
          </div>
        )
      })()}

      <p className="shrink-0 whitespace-pre-line text-center leading-relaxed">{phase!.phrase}</p>
      {extraPhrases.map((p, i) => (
        <p key={`xp-${i}`} className="shrink-0 whitespace-pre-line text-center leading-relaxed">
          {p}
        </p>
      ))}

      {phase!.hiddenHint ? (
        <p
          className="shrink-0 max-w-full whitespace-pre-wrap text-center text-sm select-text"
          style={{ color: 'var(--color-background)' }}
        >
          {phase!.hiddenHint}
        </p>
      ) : null}
      {extraHidden.map((h, i) => (
        <p
          key={`xh-${i}`}
          className="shrink-0 max-w-full whitespace-pre-wrap text-center text-sm select-text"
          style={{ color: 'var(--color-background)' }}
        >
          {h}
        </p>
      ))}

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
        <p className="shrink-0 pb-1 text-center text-sm italic opacity-60">
          {phase!.tipPhrase}
        </p>
      )}
      {extraTips.map((t, i) => (
        <p key={`xt-${i}`} className="shrink-0 pb-2 text-center text-sm italic opacity-60">
          {t}
        </p>
      ))}
    </div>
  )
}
