/** Largest data URL we store per image (well under Firestore's 1 MiB document limit). */
export const MAX_IMAGE_DATA_URL = 800_000

/**
 * What the upload button offers. Whatever comes in is redrawn and stored as PNG, WebP or JPEG
 * (see compressImage), so a client's browser never has to understand the original format.
 * ".avif" is listed by its ending too: some computers do not label those files as pictures.
 */
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/gif,.avif'

const IMAGE_ENDING = /\.(png|jpe?g|webp|avif|gif)$/i
const isAvif = (file: File) => file.type === 'image/avif' || /\.avif$/i.test(file.name)

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(
        new Error(
          isAvif(file)
            ? 'This browser cannot open AVIF pictures. Update the browser, or save the picture as PNG or JPG and upload that.'
            : 'That file could not be read as an image.',
        ),
      )
    }
    img.src = url
  })
}

type Format = 'image/png' | 'image/jpeg' | 'image/webp'

function canvasFor(img: HTMLImageElement, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: maxSide <= 256 })
  if (!ctx) throw new Error('Image processing is not available in this browser.')
  return { canvas, ctx }
}

/** Redraws the picture no larger than maxSide. Returns '' when the browser cannot write that format. */
function draw(img: HTMLImageElement, maxSide: number, type: Format, quality: number): string {
  const { canvas, ctx } = canvasFor(img, maxSide)
  if (type === 'image/jpeg') {
    // JPEG has no see-through: anything transparent becomes white.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const dataUrl = canvas.toDataURL(type, quality)
  // A browser that cannot write the format quietly hands back a PNG instead.
  return dataUrl.startsWith(`data:${type}`) ? dataUrl : ''
}

/** Does the picture have a see-through background (a logo or a cut-out product, say)? */
function hasTransparency(img: HTMLImageElement): boolean {
  try {
    const { canvas, ctx } = canvasFor(img, 256)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] < 250) return true
  } catch {
    /* cannot tell: treat it as a normal photo */
  }
  return false
}

/**
 * Turns a picture file (PNG, JPG, WebP, AVIF or GIF) into a data URL small enough to store.
 * Photos become JPEG. Pictures with a see-through background keep it, as PNG or WebP.
 */
export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/') && !IMAGE_ENDING.test(file.name)) {
    throw new Error('Choose an image file (PNG, JPG, WebP or AVIF).')
  }
  const img = await loadImage(file)
  const transparent = file.type !== 'image/jpeg' && hasTransparency(img)

  if (transparent || file.type === 'image/png') {
    const png = draw(img, 1200, 'image/png', 1)
    if (png && png.length <= MAX_IMAGE_DATA_URL) return png
  }
  if (transparent) {
    // Too heavy as PNG: WebP keeps the see-through background at a fraction of the size.
    for (const attempt of [
      { max: 1400, quality: 0.86 },
      { max: 1100, quality: 0.8 },
      { max: 900, quality: 0.74 },
    ]) {
      const webp = draw(img, attempt.max, 'image/webp', attempt.quality)
      if (webp && webp.length <= MAX_IMAGE_DATA_URL) return webp
    }
  }

  const attempts: { max: number; quality: number }[] = [
    { max: 1400, quality: 0.84 },
    { max: 1100, quality: 0.78 },
    { max: 900, quality: 0.7 },
    { max: 700, quality: 0.62 },
  ]
  for (const attempt of attempts) {
    const jpeg = draw(img, attempt.max, 'image/jpeg', attempt.quality)
    if (jpeg && jpeg.length <= MAX_IMAGE_DATA_URL) return jpeg
  }
  throw new Error('This image is too large even after compression. Try a smaller one.')
}
