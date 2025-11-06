export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = new Image()
  image.src = imageSrc

  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
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
