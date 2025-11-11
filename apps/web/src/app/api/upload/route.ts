import { BlobServiceClient } from '@azure/storage-blob'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const containerName =
  process.env.AZURE_STORAGE_CONTAINER_NAME || 'catalogo-images'

if (!connectionString) {
  throw new Error('AZURE_STORAGE_CONNECTION_STRING is not defined')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const slug = formData.get('slug') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!slug) {
      return NextResponse.json({ error: 'No slug provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
        },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      connectionString!
    )
    const containerClient = blobServiceClient.getContainerClient(containerName)

    await containerClient.createIfNotExists({
      access: 'blob'
    })

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // Compress image based on type
    let compressedBuffer: Buffer
    let contentType: string
    let extension: string

    if (file.type === 'image/gif') {
      // GIFs are not compressed to preserve animation
      compressedBuffer = inputBuffer
      contentType = 'image/gif'
      extension = 'gif'
    } else {
      // Process with Sharp for compression
      const image = sharp(inputBuffer)
      const metadata = await image.metadata()

      // Resize if image is too large (max width 1920px)
      const maxWidth = 1920
      const resizeOptions =
        metadata.width && metadata.width > maxWidth
          ? { width: maxWidth, withoutEnlargement: true }
          : undefined

      if (file.type === 'image/png') {
        // Compress PNG
        compressedBuffer = await image
          .resize(resizeOptions)
          .png({
            quality: 75,
            compressionLevel: 9,
            adaptiveFiltering: true
          })
          .toBuffer()
        contentType = 'image/png'
        extension = 'png'
      } else if (file.type === 'image/webp') {
        // Compress WebP
        compressedBuffer = await image
          .resize(resizeOptions)
          .webp({
            quality: 75,
            effort: 6
          })
          .toBuffer()
        contentType = 'image/webp'
        extension = 'webp'
      } else {
        // Convert to JPEG and compress (default for JPEG and fallback)
        compressedBuffer = await image
          .resize(resizeOptions)
          .jpeg({
            quality: 75,
            progressive: true,
            mozjpeg: true
          })
          .toBuffer()
        contentType = 'image/jpeg'
        extension = 'jpg'
      }
    }

    const blobName = `${slug}.${extension}`
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    await blockBlobClient.upload(compressedBuffer, compressedBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    })

    const url = blockBlobClient.url

    return NextResponse.json({
      url,
      filename: blobName,
      originalSize: file.size,
      compressedSize: compressedBuffer.length,
      type: contentType,
      compressionRatio: Math.round(
        ((file.size - compressedBuffer.length) / file.size) * 100
      )
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      )
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      connectionString!
    )
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient.getBlockBlobClient(filename)

    await blockBlobClient.deleteIfExists()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
