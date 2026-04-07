import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import Button from '~/components/button/button.component'
import NumberInput from '~/components/number-input/number-input.component'
import RadioGroup, {
  mediaTypeChipClassName,
} from '~/components/radio-group/radio-group.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import type { ExtraMediaBlock } from '~/lib/enigma-phase-extras'
import {
  parseExtraMediaBlocksJson,
  parseStringArrayJson,
} from '~/lib/enigma-phase-extras'
import {
  parseWhiteScreenHintsJson,
  type WhiteScreenHint,
} from '~/lib/enigma-white-screen'
import { isEnigmaServerUploadUrl } from '~/lib/enigma-upload-url'
import { MediaType } from '~/generated/prisma/enums'

interface EnigmaPhaseFormProps {
  defaultValues?: {
    order?: number
    title?: string
    pageTitle?: string | null
    mediaType?: MediaType
    mediaUrl?: string | null
    imageFile?: string | null
    imageAlt?: string | null
    phrase?: string
    answer?: string
    tipPhrase?: string | null
    hiddenHint?: string | null
    extraMediaBlocks?: unknown
    extraPhrases?: unknown
    extraTipPhrases?: unknown
    extraHiddenHints?: unknown
    whiteScreenHints?: unknown
  }
  submitLabel: string
  /** Na edição: resposta num bloco destacado no fim (acima do envio / zona de perigo). */
  prominentAnswerSection?: boolean
}

const MEDIA_TYPE_OPTIONS = [
  { id: 'none', label: 'Nenhuma', value: 'NONE' },
  { id: 'image', label: 'Imagem', value: 'IMAGE' },
  { id: 'video', label: 'Vídeo (YouTube)', value: 'VIDEO' },
  { id: 'audio', label: 'Áudio', value: 'AUDIO' },
]

type ExtraMediaRow = {
  mediaType: MediaType
  inputMode: 'url' | 'upload'
  mediaUrl: string
  imageFile: string
  imageAlt: string
  persistUrl: string | null
}

function blockToRow(b: ExtraMediaBlock): ExtraMediaRow {
  return {
    mediaType: b.mediaType,
    inputMode: 'url',
    mediaUrl: b.mediaUrl ?? '',
    imageFile: b.imageFile ?? '',
    imageAlt: b.imageAlt ?? '',
    persistUrl: b.mediaUrl,
  }
}

function emptyMediaRow(): ExtraMediaRow {
  return {
    mediaType: MediaType.NONE,
    inputMode: 'url',
    mediaUrl: '',
    imageFile: '',
    imageAlt: '',
    persistUrl: null,
  }
}

/** Segundo `/` após outro vira `\n`. Não aplica em `://` (ex.: `http://`). */
function keyDownDoubleSlashToNewline(
  e: ReactKeyboardEvent<HTMLTextAreaElement>,
  value: string,
  apply: (next: string, caret: number) => void,
) {
  if (e.key !== '/') return
  const el = e.currentTarget
  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  if (start !== end || start < 1) return
  if (value[start - 1] !== '/') return
  if (start >= 2 && value[start - 2] === ':') return
  e.preventDefault()
  const next = value.slice(0, start - 1) + '\n' + value.slice(start)
  apply(next, start)
}

/** Altura do textarea = conteúdo (sem scroll interno). */
function autoResizeTextareaToContent(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = '0px'
  el.style.height = `${el.scrollHeight}px`
}

function UrlUploadSegment({
  name,
  value,
  onChange,
}: {
  name: string
  value: 'url' | 'upload'
  onChange: (v: 'url' | 'upload') => void
}) {
  const segment = (active: boolean) =>
    `relative flex flex-1 cursor-pointer select-none items-center justify-center rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background ${
      active
        ? 'bg-primary text-on-primary shadow-sm'
        : 'text-on-background/80 hover:bg-primary/15'
    }`
  return (
    <div
      className="mb-2 inline-flex w-full max-w-xs gap-0.5 rounded-xl border-2 border-primary/25 bg-primary/[0.07] p-1"
      role="group"
      aria-label="Origem da mídia"
    >
      <label className={segment(value === 'url')}>
        <input
          type="radio"
          name={name}
          value="url"
          checked={value === 'url'}
          onChange={() => onChange('url')}
          className="sr-only"
        />
        URL
      </label>
      <label className={segment(value === 'upload')}>
        <input
          type="radio"
          name={name}
          value="upload"
          checked={value === 'upload'}
          onChange={() => onChange('upload')}
          className="sr-only"
        />
        Upload
      </label>
    </div>
  )
}

export default function EnigmaPhaseForm({
  defaultValues,
  submitLabel,
  prominentAnswerSection = false,
}: EnigmaPhaseFormProps) {
  const [mediaType, setMediaType] = useState<string>(
    defaultValues?.mediaType ?? 'NONE',
  )
  const [inputMode, setInputMode] = useState<'url' | 'upload'>(
    defaultValues?.mediaUrl ? 'url' : 'url',
  )

  const [extraMediaRows, setExtraMediaRows] = useState<ExtraMediaRow[]>(() =>
    parseExtraMediaBlocksJson(defaultValues?.extraMediaBlocks).map(blockToRow),
  )
  const [extraPhrases, setExtraPhrases] = useState<string[]>(() =>
    parseStringArrayJson(defaultValues?.extraPhrases),
  )
  const [extraTipPhrases, setExtraTipPhrases] = useState<string[]>(() =>
    parseStringArrayJson(defaultValues?.extraTipPhrases),
  )
  const [extraHiddenHints, setExtraHiddenHints] = useState<string[]>(() =>
    parseStringArrayJson(defaultValues?.extraHiddenHints),
  )
  const [whiteScreenHints, setWhiteScreenHints] = useState<
    { trigger: string; popupText: string }[]
  >(() =>
    parseWhiteScreenHintsJson(defaultValues?.whiteScreenHints).map(
      (h: WhiteScreenHint) => ({
        trigger: h.trigger,
        popupText: h.popupText,
      }),
    ),
  )

  const supportsUpload = mediaType === 'IMAGE' || mediaType === 'AUDIO'
  const acceptAttr = mediaType === 'IMAGE' ? 'image/*' : 'audio/*'
  const hasStoredServerUpload = isEnigmaServerUploadUrl(defaultValues?.mediaUrl)

  const phraseTextareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    autoResizeTextareaToContent(phraseTextareaRef.current)
  }, [defaultValues?.phrase])

  return (
    <>
      <NumberInput
        id="order"
        name="order"
        label="Ordem da fase"
        required={true}
        step={1}
        min={1}
        defaultValue={defaultValues?.order}
      />
      <Spacer size="sm" />

      <TextInput
        id="title"
        name="title"
        label="Título"
        type="text"
        required={true}
        defaultValue={defaultValues?.title}
      />
      <Spacer size="sm" />

      <TextInput
        id="pageTitle"
        name="pageTitle"
        label="Aba do Navegador"
        type="text"
        required={false}
        defaultValue={defaultValues?.pageTitle ?? ''}
      />
      <Spacer size="sm" />

      <RadioGroup
        name="mediaType"
        label="Tipo de mídia (principal)"
        required={true}
        defaultValue={defaultValues?.mediaType ?? 'NONE'}
        options={MEDIA_TYPE_OPTIONS}
        onValueChange={(v) => {
          setMediaType(v)
          setInputMode('url')
        }}
      />
      <Spacer size="sm" />

      {mediaType !== 'NONE' && (
        <>
          {supportsUpload && (
            <UrlUploadSegment
              name="_inputMode"
              value={inputMode}
              onChange={setInputMode}
            />
          )}

          {inputMode === 'url' ? (
            <TextInput
              id="mediaUrl"
              name="mediaUrl"
              label={
                mediaType === 'IMAGE'
                  ? 'URL da imagem'
                  : mediaType === 'VIDEO'
                    ? 'URL do vídeo YouTube (ex: https://www.youtube.com/watch?v=...)'
                    : 'URL do áudio'
              }
              type="text"
              required={!supportsUpload}
              defaultValue={defaultValues?.mediaUrl ?? ''}
            />
          ) : (
            <>
              <label className="block" htmlFor="mediaFile">
                {mediaType === 'IMAGE' ? 'Arquivo de imagem' : 'Arquivo de áudio'}
              </label>
              <p className="mb-2 text-xs text-foreground/55">
                O arquivo é guardado no servidor (pasta <code className="text-foreground/70">uploads/enigmas</code>
                ) com nome único e ligado a esta fase. O jogador só baixa a imagem ao abrir a fase. Se já existe
                ficheiro salvo, não precisa reenviar ao editar outros campos.
              </p>
              <input
                id="mediaFile"
                name="mediaFile"
                type="file"
                accept={acceptAttr}
                required={!hasStoredServerUpload}
                className="w-full rounded-md border-1 p-1"
              />
              {defaultValues?.mediaUrl && (
                <p className="mt-1 text-sm opacity-60">
                  {hasStoredServerUpload ? 'Ficheiro no servidor:' : 'URL / ficheiro atual:'}{' '}
                  {defaultValues.mediaUrl}
                </p>
              )}
            </>
          )}
          <Spacer size="sm" />
        </>
      )}

      {mediaType === 'IMAGE' ? (
        <>
          <input type="hidden" name="imageFile" value={defaultValues?.imageFile ?? ''} />
          <input type="hidden" name="imageAlt" value={defaultValues?.imageAlt ?? ''} />
        </>
      ) : null}

      <label className="block" htmlFor="phrase">
        Dica principal
      </label>
      <p className="mb-1 text-xs text-foreground/50">
        Digite <kbd className="rounded border border-foreground/20 px-1 py-px font-mono text-[0.7rem]">//</kbd>{' '}
        para inserir uma quebra de linha.
      </p>
      <textarea
        id="phrase"
        name="phrase"
        ref={phraseTextareaRef}
        className="min-h-[4.5rem] w-full resize-none overflow-hidden rounded-md border-1 p-1"
        rows={1}
        required
        defaultValue={defaultValues?.phrase}
        onInput={(e) => autoResizeTextareaToContent(e.currentTarget)}
        onKeyDown={(e) =>
          keyDownDoubleSlashToNewline(e, e.currentTarget.value, (next, caret) => {
            const ta = e.currentTarget
            ta.value = next
            ta.setSelectionRange(caret, caret)
            queueMicrotask(() => autoResizeTextareaToContent(ta))
          })
        }
      />
      <Spacer size="sm" />

      {!prominentAnswerSection ? (
        <>
          <TextInput
            id="answer"
            name="answer"
            label="Resposta"
            type="text"
            required={true}
            defaultValue={defaultValues?.answer}
          />
          <Spacer size="sm" />
        </>
      ) : null}

      <label className="block" htmlFor="tipPhrase">
        Dica extra (opcional)
      </label>
      <textarea
        id="tipPhrase"
        name="tipPhrase"
        className="w-full rounded-md border-1 p-1"
        rows={2}
        defaultValue={defaultValues?.tipPhrase ?? ''}
      />
      <Spacer size="sm" />

      <label className="block" htmlFor="hiddenHint">
        Dica escondida (opcional)
      </label>
      <p className="mb-1 text-xs text-foreground/50">
        Na jogada, o texto usa a mesma cor do fundo da página (dá para ler ao selecionar ou
        realçar).
      </p>
      <textarea
        id="hiddenHint"
        name="hiddenHint"
        className="w-full rounded-md border-1 p-1"
        rows={2}
        defaultValue={defaultValues?.hiddenHint ?? ''}
        placeholder="Só nesta fase"
      />
      <Spacer size="md" />

      <div className="rounded-xl border border-foreground/15 bg-foreground/[0.03] p-4">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/55">
          Campos adicionais
        </h2>
        <p className="mb-4 text-sm text-foreground/60">
          Adicione mais mídias ou dicas nesta fase. Cada tipo segue as mesmas regras dos campos
          principais acima. Nas dicas principais adicionais,{' '}
          <kbd className="rounded border border-foreground/20 px-1 py-px font-mono text-[0.65rem]">//</kbd>{' '}
          também insere quebra de linha.
        </p>
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            type="button"
            styleType="secondary"
            onClick={() => setExtraMediaRows((r) => [...r, emptyMediaRow()])}
          >
            + Mídia
          </Button>
          <Button
            type="button"
            styleType="secondary"
            onClick={() => setExtraPhrases((p) => [...p, ''])}
          >
            + Dica principal
          </Button>
          <Button
            type="button"
            styleType="secondary"
            onClick={() => setExtraTipPhrases((p) => [...p, ''])}
          >
            + Dica extra
          </Button>
          <Button
            type="button"
            styleType="secondary"
            onClick={() => setExtraHiddenHints((p) => [...p, ''])}
          >
            + Dica escondida
          </Button>
        </div>

        <input type="hidden" name="extraMedia_count" value={extraMediaRows.length} />
        {extraMediaRows.map((row, i) => (
          <div
            key={`em-${i}`}
            className="mb-6 rounded-lg border border-foreground/10 bg-background/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground/80">
                Mídia adicional {i + 1}
              </span>
              <Button
                type="button"
                styleType="secondary"
                className="text-xs"
                onClick={() => setExtraMediaRows((rows) => rows.filter((_, j) => j !== i))}
              >
                Remover
              </Button>
            </div>
            <input type="hidden" name={`extraMedia_${i}_mediaType`} value={row.mediaType} />
            <input
              type="hidden"
              name={`extraMedia_${i}_persistUrl`}
              value={row.persistUrl ?? ''}
            />
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Tipo de mídia
            </span>
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MEDIA_TYPE_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={mediaTypeChipClassName(row.mediaType === o.value)}
                  onClick={() =>
                    setExtraMediaRows((rows) =>
                      rows.map((r, j) =>
                        j === i
                          ? { ...r, mediaType: o.value as MediaType, inputMode: 'url' }
                          : r,
                      ),
                    )
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>

            {row.mediaType !== 'NONE' && (
              <>
                {(row.mediaType === 'IMAGE' || row.mediaType === 'AUDIO') && (
                  <UrlUploadSegment
                    name={`_extraMedia_${i}_inputMode`}
                    value={row.inputMode}
                    onChange={(v) =>
                      setExtraMediaRows((rows) =>
                        rows.map((r, j) => (j === i ? { ...r, inputMode: v } : r)),
                      )
                    }
                  />
                )}

                {row.mediaType === 'VIDEO' || row.inputMode === 'url' ? (
                  <>
                    <label className="block" htmlFor={`extraMediaUrl-${i}`}>
                      {row.mediaType === 'IMAGE'
                        ? 'URL da imagem'
                        : row.mediaType === 'VIDEO'
                          ? 'URL do vídeo YouTube'
                          : 'URL do áudio'}
                    </label>
                    <input
                      id={`extraMediaUrl-${i}`}
                      name={`extraMedia_${i}_mediaUrl`}
                      type="text"
                      className="mb-3 w-full rounded-md border-1 p-1"
                      value={row.mediaUrl}
                      onChange={(e) =>
                        setExtraMediaRows((rows) =>
                          rows.map((r, j) => (j === i ? { ...r, mediaUrl: e.target.value } : r)),
                        )
                      }
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-sm" htmlFor={`extraMediaFile-${i}`}>
                      {row.mediaType === 'IMAGE' ? 'Arquivo de imagem' : 'Arquivo de áudio'}
                    </label>
                    <input
                      id={`extraMediaFile-${i}`}
                      name={`extraMedia_${i}_mediaFile`}
                      type="file"
                      accept={row.mediaType === 'IMAGE' ? 'image/*' : 'audio/*'}
                      required={
                        row.inputMode === 'upload' &&
                        !row.persistUrl &&
                        (row.mediaType === 'IMAGE' || row.mediaType === 'AUDIO')
                      }
                      className="w-full rounded-md border-1 p-1"
                    />
                  </>
                )}
                {row.persistUrl && row.inputMode === 'upload' && (
                  <p className="mt-1 text-xs text-foreground/50">Arquivo atual: {row.persistUrl}</p>
                )}
                <Spacer size="sm" />
              </>
            )}

            {row.mediaType === 'IMAGE' ? (
              <>
                <input type="hidden" name={`extraMedia_${i}_imageFile`} value={row.imageFile} />
                <input type="hidden" name={`extraMedia_${i}_imageAlt`} value={row.imageAlt} />
              </>
            ) : null}

          </div>
        ))}

        <input type="hidden" name="extraPhrase_count" value={extraPhrases.length} />
        {extraPhrases.map((text, i) => (
          <div key={`ep-${i}`} className="mb-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-foreground/80" htmlFor={`xp-${i}`}>
                Dica principal adicional {i + 1}
              </label>
              <Button
                type="button"
                styleType="secondary"
                className="text-xs"
                onClick={() => setExtraPhrases((p) => p.filter((_, j) => j !== i))}
              >
                Remover
              </Button>
            </div>
            <textarea
              id={`xp-${i}`}
              name={`extraPhrase_${i}`}
              className="w-full rounded-md border-1 p-1"
              rows={3}
              value={text}
              onChange={(e) =>
                setExtraPhrases((p) => p.map((t, j) => (j === i ? e.target.value : t)))
              }
              onKeyDown={(e) =>
                keyDownDoubleSlashToNewline(e, text, (next, caret) => {
                  setExtraPhrases((p) => p.map((t, j) => (j === i ? next : t)))
                  requestAnimationFrame(() => {
                    const ta = e.currentTarget
                    ta.setSelectionRange(caret, caret)
                  })
                })
              }
            />
          </div>
        ))}

        <input type="hidden" name="extraTipPhrase_count" value={extraTipPhrases.length} />
        {extraTipPhrases.map((text, i) => (
          <div key={`et-${i}`} className="mb-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-foreground/80" htmlFor={`xt-${i}`}>
                Dica extra adicional {i + 1}
              </label>
              <Button
                type="button"
                styleType="secondary"
                className="text-xs"
                onClick={() => setExtraTipPhrases((p) => p.filter((_, j) => j !== i))}
              >
                Remover
              </Button>
            </div>
            <textarea
              id={`xt-${i}`}
              name={`extraTipPhrase_${i}`}
              className="w-full rounded-md border-1 p-1"
              rows={2}
              value={text}
              onChange={(e) =>
                setExtraTipPhrases((p) => p.map((t, j) => (j === i ? e.target.value : t)))
              }
            />
          </div>
        ))}

        <input type="hidden" name="extraHiddenHint_count" value={extraHiddenHints.length} />
        {extraHiddenHints.map((text, i) => (
          <div key={`eh-${i}`} className="mb-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-foreground/80" htmlFor={`xh-${i}`}>
                Dica escondida adicional {i + 1}
              </label>
              <Button
                type="button"
                styleType="secondary"
                className="text-xs"
                onClick={() => setExtraHiddenHints((p) => p.filter((_, j) => j !== i))}
              >
                Remover
              </Button>
            </div>
            <p className="mb-1 text-xs text-foreground/50">
              Mesma regra da dica escondida principal (cor do fundo na jogada).
            </p>
            <textarea
              id={`xh-${i}`}
              name={`extraHiddenHint_${i}`}
              className="w-full rounded-md border-1 p-1"
              rows={2}
              value={text}
              onChange={(e) =>
                setExtraHiddenHints((p) => p.map((t, j) => (j === i ? e.target.value : t)))
              }
            />
          </div>
        ))}
      </div>

      <Spacer size="md" />
      <div className="rounded-xl border border-foreground/15 bg-foreground/[0.03] p-4">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/55">
          &quot;Telas Brancas&quot;
        </h2>
        <p className="mb-4 text-sm text-foreground/60">
          Cada dica branca tem um <strong className="text-foreground/80">gatilho</strong>: se o
          jogador enviar esse texto como resposta (mesma regra que a resposta certa: ignorar
          maiúsculas e espaços nas pontas), aparece um pop-up com o segundo texto, sem avançar nem
          mostrar
          &quot;resposta errada&quot;.
        </p>
        <div className="mb-6">
          <Button
            type="button"
            styleType="secondary"
            onClick={() =>
              setWhiteScreenHints((rows) => [...rows, { trigger: '', popupText: '' }])
            }
          >
            + Dica branca
          </Button>
        </div>

        <input type="hidden" name="whiteScreen_count" value={whiteScreenHints.length} />
        {whiteScreenHints.map((row, i) => (
          <div
            key={`ws-${i}`}
            className="mb-6 rounded-lg border border-foreground/10 bg-background/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground/80">
                Dica branca {i + 1}
              </span>
              <Button
                type="button"
                styleType="secondary"
                className="text-xs"
                onClick={() =>
                  setWhiteScreenHints((rows) => rows.filter((_, j) => j !== i))
                }
              >
                Remover
              </Button>
            </div>
            <label className="mb-1 block text-sm font-medium text-foreground/75" htmlFor={`ws-trigger-${i}`}>
              Texto que o jogador envia (gatilho)
            </label>
            <input
              id={`ws-trigger-${i}`}
              name={`whiteScreen_${i}_trigger`}
              type="text"
              className="mb-4 w-full rounded-md border-1 p-2 text-sm"
              value={row.trigger}
              onChange={(e) =>
                setWhiteScreenHints((rows) =>
                  rows.map((r, j) => (j === i ? { ...r, trigger: e.target.value } : r)),
                )
              }
            />
            <label className="mb-1 block text-sm font-medium text-foreground/75" htmlFor={`ws-popup-${i}`}>
              Texto do pop-up
            </label>
            <textarea
              id={`ws-popup-${i}`}
              name={`whiteScreen_${i}_popupText`}
              className="w-full rounded-md border-1 p-2 text-sm"
              rows={4}
              value={row.popupText}
              onChange={(e) =>
                setWhiteScreenHints((rows) =>
                  rows.map((r, j) => (j === i ? { ...r, popupText: e.target.value } : r)),
                )
              }
            />
          </div>
        ))}
      </div>

      {prominentAnswerSection ? (
        <>
          <Spacer size="lg" />
          <div className="rounded-2xl border-2 border-primary/45 bg-primary/[0.08] p-6 shadow-md ring-1 ring-primary/15 dark:border-primary/50 dark:bg-primary/15 dark:ring-primary/25">
            <h2 className="mb-2 font-brand text-xl tracking-wide text-primary">
              Resposta
            </h2>
            <p className="mb-5 text-sm text-foreground/65 underline underline-offset-2">
              Cuidado com acentos e espaços no meio da resposta, preferir usar underline. Maiúsculas
              não importam
            </p>
            <TextInput
              id="answer"
              name="answer"
              label="Texto da resposta"
              type="text"
              required={true}
              defaultValue={defaultValues?.answer}
              inputClassName="border-2 border-primary/35 bg-background text-base font-medium shadow-sm"
            />
          </div>
        </>
      ) : null}

      <Spacer size="md" />

      <Button type="submit">{submitLabel}</Button>
    </>
  )
}
