export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = new Image()
  image.src = imageSrc

  
  await new Promise(resolve => (image.onload = resolve))

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not found')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return canvas.toDataURL('image/jpeg')
}
export const onSelectFile = (
  e: React.ChangeEvent<HTMLInputElement>,
  setImageSrc: any,
  setShowCropper: any
) => {
  if (e.target.files && e.target.files.length > 0) {
    const reader = new FileReader()

    reader.addEventListener('load', () => setImageSrc(reader.result as string))

    reader.readAsDataURL(e.target.files[0] as Blob)

    setShowCropper(true)
  }
}

export const base64ToFile = (base64String: string, filename: string): File => {
  
  const [metadata, data] = base64String.split(',')
  const mime = metadata.match(/:(.*?);/)?.[1] || 'image/jpeg'

  
  const byteString = atob(data)
  const arrayBuffer = new ArrayBuffer(byteString.length)
  const uint8Array = new Uint8Array(arrayBuffer)
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i)
  }

  
  return new File([uint8Array], filename, { type: mime })
}
