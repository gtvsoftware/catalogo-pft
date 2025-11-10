import { BlobServiceClient } from '@azure/storage-blob'
import { NextRequest, NextResponse } from 'next/server'

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

    const maxSize = 5 * 1024 * 1024
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

    const extension = file.name.split('.').pop()
    const blobName = `${slug}.${extension}`

    const blockBlobClient = containerClient.getBlockBlobClient(blobName)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: file.type
      }
    })

    const url = blockBlobClient.url

    return NextResponse.json({
      url,
      filename: blobName,
      size: file.size,
      type: file.type
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
