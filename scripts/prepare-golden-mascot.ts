/**
 * Prepara o PNG do mascote golden para a home (sem cortar o desenho):
 * 1) fundo preto -> transparente
 * 2) trim — só remove margens totalmente transparentes (Sharp), não apaga o peão
 * 3) redimensiona a arte toda para caber numa caixa (mantém proporção), para escala ~mascotes
 *
 * Lê `golden-mascot.source.png` se existir; senão lê `golden-mascot.png`.
 * Escreve em `golden-mascot.png`.
 *
 *   npm run assets:golden-mascot
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const OUTPUT = resolve('app/assets/images/golden-mascot.png')
const SOURCE = resolve('app/assets/images/golden-mascot.source.png')
const RGB_THRESHOLD = 22
/** Lado máximo (px) do PNG gerado; na UI usa-se ~100px CSS com object-contain (sem cortar). */
const OUTPUT_MAX_SIDE_PX = 320

function blackToTransparent(buf: Buffer) {
  return sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
}

async function main() {
  const inputPath = existsSync(SOURCE) ? SOURCE : OUTPUT
  const fileBuf = readFileSync(inputPath)
  const { data, info } = await blackToTransparent(fileBuf)
  const { width: w, height: h, channels } = info
  if (channels !== 4 || !w || !h) {
    throw new Error(`Esperado RGBA com dimensões, obtido ${channels} canais ${w}x${h}`)
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    if (r <= RGB_THRESHOLD && g <= RGB_THRESHOLD && b <= RGB_THRESHOLD) {
      data[i + 3] = 0
    }
  }

  const rgbaBuf = await sharp(Buffer.from(data), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png()
    .toBuffer()

  const trimmedBuf = await sharp(rgbaBuf).trim({ threshold: 0 }).png().toBuffer()
  const trimmedMeta = await sharp(trimmedBuf).metadata()

  const out = await sharp(trimmedBuf)
    .resize({
      width: OUTPUT_MAX_SIDE_PX,
      height: OUTPUT_MAX_SIDE_PX,
      fit: 'inside',
      withoutEnlargement: false,
    })
    .png({ compressionLevel: 9 })
    .toBuffer()

  writeFileSync(OUTPUT, out)
  const meta = await sharp(out).metadata()
  console.log(
    `OK: ${OUTPUT} (origem: ${inputPath})\n  após trim: ${trimmedMeta.width}x${trimmedMeta.height}px\n  saída: ${meta.width}x${meta.height}px`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
