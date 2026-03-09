import { useState } from 'react'
import Button from '~/components/button/button.component'
import NumberInput from '~/components/number-input/number-input.component'
import RadioGroup from '~/components/radio-group/radio-group.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import type { MediaType } from '~/generated/prisma/enums'

interface EnigmaPhaseFormProps {
  defaultValues?: {
    order?: number
    title?: string
    mediaType?: MediaType
    mediaUrl?: string | null
    imageFile?: string | null
    imageAlt?: string | null
    phrase?: string
    answer?: string
    tipPhrase?: string | null
  }
  submitLabel: string
}

const MEDIA_TYPE_OPTIONS = [
  { id: 'none', label: 'Nenhuma', value: 'NONE' },
  { id: 'image', label: 'Imagem', value: 'IMAGE' },
  { id: 'video', label: 'Vídeo (YouTube)', value: 'VIDEO' },
  { id: 'audio', label: 'Áudio', value: 'AUDIO' },
]

export default function EnigmaPhaseForm({
  defaultValues,
  submitLabel,
}: EnigmaPhaseFormProps) {
  const [mediaType, setMediaType] = useState<string>(
    defaultValues?.mediaType ?? 'NONE',
  )
  const [inputMode, setInputMode] = useState<'url' | 'upload'>(
    defaultValues?.mediaUrl ? 'url' : 'url',
  )

  const supportsUpload = mediaType === 'IMAGE' || mediaType === 'AUDIO'
  const acceptAttr = mediaType === 'IMAGE' ? 'image/*' : 'audio/*'

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

      <div onChange={(e) => {
        setMediaType((e.target as HTMLInputElement).value)
        setInputMode('url')
      }}>
        <RadioGroup
          name="mediaType"
          label="Tipo de mídia"
          required={true}
          defaultValue={defaultValues?.mediaType ?? 'NONE'}
          options={MEDIA_TYPE_OPTIONS}
        />
      </div>
      <Spacer size="sm" />

      {mediaType !== 'NONE' && (
        <>
          {supportsUpload && (
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="_inputMode"
                  value="url"
                  checked={inputMode === 'url'}
                  onChange={() => setInputMode('url')}
                />
                URL
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="_inputMode"
                  value="upload"
                  checked={inputMode === 'upload'}
                  onChange={() => setInputMode('upload')}
                />
                Upload
              </label>
            </div>
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
              defaultValue={defaultValues?.mediaUrl}
            />
          ) : (
            <>
              <label className="block" htmlFor="mediaFile">
                {mediaType === 'IMAGE' ? 'Arquivo de imagem' : 'Arquivo de áudio'}
              </label>
              <input
                id="mediaFile"
                name="mediaFile"
                type="file"
                accept={acceptAttr}
                required
                className="w-full rounded-md border-1 p-1"
              />
              {defaultValues?.mediaUrl && (
                <p className="text-sm opacity-60 mt-1">
                  Arquivo atual: {defaultValues.mediaUrl}
                </p>
              )}
            </>
          )}
          <Spacer size="sm" />
        </>
      )}

      {mediaType === 'IMAGE' && (
        <>
          <TextInput
            id="imageFile"
            name="imageFile"
            label="Nome do arquivo de imagem (dica)"
            type="text"
            required={false}
            defaultValue={defaultValues?.imageFile}
          />
          <Spacer size="sm" />
          <TextInput
            id="imageAlt"
            name="imageAlt"
            label="Texto alternativo da imagem (dica)"
            type="text"
            required={false}
            defaultValue={defaultValues?.imageAlt}
          />
          <Spacer size="sm" />
        </>
      )}

      <label className="block" htmlFor="phrase">
        Frase abaixo da mídia
      </label>
      <textarea
        id="phrase"
        name="phrase"
        className="w-full rounded-md border-1 p-1"
        rows={3}
        required
        defaultValue={defaultValues?.phrase}
      />
      <Spacer size="sm" />

      <TextInput
        id="answer"
        name="answer"
        label="Resposta correta"
        type="text"
        required={true}
        defaultValue={defaultValues?.answer}
      />
      <Spacer size="sm" />

      <label className="block" htmlFor="tipPhrase">
        Frase de dica (opcional)
      </label>
      <textarea
        id="tipPhrase"
        name="tipPhrase"
        className="w-full rounded-md border-1 p-1"
        rows={2}
        defaultValue={defaultValues?.tipPhrase ?? ''}
      />
      <Spacer size="md" />

      <Button type="submit">{submitLabel}</Button>
    </>
  )
}
