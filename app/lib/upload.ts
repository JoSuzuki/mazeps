import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import crypto from 'node:crypto'

export async function saveUploadedFile(file: File): Promise<string> {
  const uploadDir = join(process.cwd(), 'uploads', 'enigmas')
  await mkdir(uploadDir, { recursive: true })

  const ext = file.name.split('.').pop() ?? ''
  const filename = `${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, filename), buffer)

  return `/uploads/enigmas/${filename}`
}
