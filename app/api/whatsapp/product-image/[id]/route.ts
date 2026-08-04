import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { getMenuProduct } from '@/lib/menu-catalog'

export const runtime = 'nodejs'

type RouteProps = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params
  const product = getMenuProduct(id)

  if (!product) {
    return new Response('Product image not found.', { status: 404 })
  }

  try {
    const sourcePath = path.join(
      process.cwd(),
      'public',
      product.image.replace(/^\//, ''),
    )
    const source = await readFile(sourcePath)
    const jpeg = await sharp(source)
      .rotate()
      .resize({ width: 1_200, withoutEnlargement: true })
      .jpeg({ quality: 88, progressive: true })
      .toBuffer()

    return new Response(new Uint8Array(jpeg), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable',
        'Content-Disposition': `inline; filename="${product.id}.jpg"`,
      },
    })
  } catch (error) {
    console.error(
      'WhatsApp product image conversion failed:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return new Response('Product image unavailable.', { status: 500 })
  }
}

