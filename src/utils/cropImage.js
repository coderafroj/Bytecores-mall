export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180
}

export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation)
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

export default async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  ctx.drawImage(image, 0, 0)

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  // Max width/height to ensure 20KB-50KB size
  const MAX_DIMENSION = 600;
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;

  if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
      if (targetWidth > targetHeight) {
          targetHeight = (targetHeight / targetWidth) * MAX_DIMENSION;
          targetWidth = MAX_DIMENSION;
      } else {
          targetWidth = (targetWidth / targetHeight) * MAX_DIMENSION;
          targetHeight = MAX_DIMENSION;
      }
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext('2d');

  const extractCanvas = document.createElement('canvas');
  extractCanvas.width = pixelCrop.width;
  extractCanvas.height = pixelCrop.height;
  const extractCtx = extractCanvas.getContext('2d');
  extractCtx.putImageData(data, 0, 0);

  finalCtx.drawImage(extractCanvas, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve) => {
    finalCanvas.toBlob((file) => {
      resolve(file)
    }, 'image/jpeg', 0.6)
  })
}
