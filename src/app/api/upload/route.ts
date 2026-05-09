import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const lessonId = formData.get('lesson_id') as string
    const type = formData.get('type') as string

    if (!file || !lessonId) {
      return NextResponse.json({ error: 'Ficheiro e lesson_id obrigatorios' }, { status: 400 })
    }

    // Validar tamanho (max 500MB)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Ficheiro demasiado grande. Maximo 500MB.' }, { status: 400 })
    }

    // Gerar nome unico para o ficheiro
    const ext = file.name.split('.').pop()
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filename = `${type}/${lessonId}/${timestamp}-${random}.${ext}`

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Fazer upload para R2
    await r2.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
    }))

    const url = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${filename}`

    return NextResponse.json({ url, filename: file.name }, { status: 201 })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
