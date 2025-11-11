import { BlobServiceClient } from '@azure/storage-blob'
import { NextRequest, NextResponse } from 'next/server'

import { authWrapper } from '@/utils/authWrapper'

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const containerName =
  process.env.AZURE_STORAGE_CONTAINER_NAME || 'catalogo-images'

if (!connectionString) {
  throw new Error('AZURE_STORAGE_CONNECTION_STRING is not defined')
}

export async function POST(request: NextRequest) {
  try {
    const session = await authWrapper()

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { sourceCatalogId, targetCatalogId } = await request.json()

    if (!sourceCatalogId || !targetCatalogId) {
      return NextResponse.json(
        { error: 'Source and target catalog IDs are required' },
        { status: 400 }
      )
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      connectionString!
    )
    const containerClient = blobServiceClient.getContainerClient(containerName)

    const sourcePrefix = `${sourceCatalogId}/`
    const blobs: string[] = []

    for await (const blob of containerClient.listBlobsFlat({
      prefix: sourcePrefix
    })) {
      blobs.push(blob.name)
    }

    if (blobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No images to copy',
        copiedCount: 0
      })
    }

    const copiedBlobs: string[] = []
    for (const sourceBlobName of blobs) {
      const fileName = sourceBlobName.replace(sourcePrefix, '')
      const targetBlobName = `${targetCatalogId}/${fileName}`

      const sourceBlob = containerClient.getBlobClient(sourceBlobName)
      const targetBlob = containerClient.getBlobClient(targetBlobName)

      const copyOperation = await targetBlob.beginCopyFromURL(sourceBlob.url)
      await copyOperation.pollUntilDone()

      copiedBlobs.push(targetBlobName)
    }

    return NextResponse.json({
      success: true,
      copiedCount: copiedBlobs.length,
      blobs: copiedBlobs
    })
  } catch (error) {
    console.error('Duplicate images error:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate images' },
      { status: 500 }
    )
  }
}
