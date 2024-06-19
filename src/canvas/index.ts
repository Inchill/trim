import { Params, ZoomParams, AreaSelect } from '../area-select'

const imgRectMargin = 20
const img = new Image()
let rectX = 0,
  rectY = 0,
  rectWidth = 0,
  rectHeight = 0
let translateX = 0
let translateY = 0
let scale = 1

let distance = 0
let isDragging = false
let lastX = 0
let lastY = 0

let areaSelect: AreaSelect

export const initEditor = (src: string) => {
  const canvas = document.querySelector('.trim-edit-canvas')
    ?.children[0] as HTMLCanvasElement
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const rootWrapper = document.querySelector(
    '.trim-root-wrapper'
  ) as HTMLElement
  const rootWrapperRect = rootWrapper.getBoundingClientRect()

  canvas.width = rootWrapperRect.width
  canvas.height = rootWrapperRect.height
  canvas.style.width = rootWrapperRect.width + 'px'
  canvas.style.height = rootWrapperRect.height + 'px'

  img.onload = () => {
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    // 计算矩形区域的宽度和高度，保持与图片的宽高比相同
    rectWidth = canvasWidth - imgRectMargin * 2
    rectHeight = rectWidth * (img.height / img.width)
    // 计算矩形区域的位置，使其在画布中央显示，并且距离画布边缘有间距
    rectX = (canvasWidth - rectWidth) / 2
    rectY = (canvasHeight - rectHeight) / 2

    scale = rectWidth / img.width + 0.3

    drawTrim(rectX, rectY, rectWidth, rectHeight)
    // drawImageWithScale(canvas, img, scale)
    initEvents(canvas)

    const onAreaSelectChange = (params: Params) => {
      rectX = params.x
      rectY = params.y
      rectWidth = params.width
      rectHeight = params.height
      // drawImageWithScale(canvas, img, scale)
      drawTrim(rectX, rectY, rectWidth, rectHeight)
    }

    const onAreaSelectZoom = (params: ZoomParams) => {
      // const { scale } = params
      scale = params.scale
      // drawImageWithScale(canvas, img, scale)
      drawTrim(rectX, rectY, rectWidth, rectHeight)
    }

    areaSelect = new AreaSelect(document.querySelector('.area-select-box'), {
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight
    })

    areaSelect.on('change', onAreaSelectChange)
    areaSelect.on('afterChange', onAreaSelectChange)
    areaSelect.on('zoom', onAreaSelectZoom)
  }

  img.crossOrigin = 'anonymous'
  img.src = src
}

// 根据缩放比例绘制图片
function drawImageWithScale (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  scaleFactor = 1
) {
  if (!canvas) return

  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  const ctx = canvas.getContext('2d')

  if (!ctx) return

  // 计算缩放后的图片宽度和高度
  let imgWidth = image.width * scaleFactor
  let imgHeight = image.height * scaleFactor

  // 沿着矩形区域中心点缩放
  let dx = (canvasWidth - imgWidth) / 2 + translateX
  let dy = (canvasHeight - imgHeight) / 2 + translateY

  // 限制移动边界
  dx = dx > rectX ? rectX : dx
  dy = dy > rectY ? rectY : dy

  if (dx + imgWidth < rectX + rectWidth) {
    dx = rectX + rectWidth - imgWidth
  }

  if (dy + imgHeight < rectY + rectHeight) {
    dy = rectY + rectHeight - imgHeight
  }

  // 限制缩放大小
  if (imgWidth < rectWidth || imgHeight < rectHeight) {
    imgWidth = rectWidth
    imgHeight = rectHeight

    translateX = translateY = 0

    dx = (canvasWidth - imgWidth) / 2 + translateX
    dy = (canvasHeight - imgHeight) / 2 + translateY
  }

  // 清除画布
  // ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 绘制图片
  ctx.drawImage(image, dx, dy, imgWidth, imgHeight)

  // 更新拖拽区域缓存的图片信息，用以限制拖拽区域
  if (areaSelect) {
    areaSelect.updateCanvasImageInfo({
      x: dx,
      y: dy,
      width: imgWidth,
      height: imgHeight
    })
  }

  // 获取矩形区域图像数据(TODO: 频繁读取会造成性能问题，最好是在矩形区域再次绘制选定图片区域)
  // const imageData = ctx.getImageData(rectX, rectY, rectWidth, rectHeight)

  // // 添加蒙层
  // ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  // ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // // 绘制矩形区域裁剪的图像
  // ctx.putImageData(imageData, rectX, rectY)
}

/**
 * 绘制裁剪框
 * @param startX 裁剪框横坐标
 * @param startY 裁剪框纵坐标
 * @param width 裁剪框宽度
 * @param height 裁剪框高度
 * @returns
 */
export const drawTrim = (
  startX: number,
  startY: number,
  width: number,
  height: number
) => {
  const canvas = document.querySelector('.trim-edit-canvas')
    ?.children[0] as HTMLCanvasElement
  if (!canvas) return

  const ctx = canvas.getContext('2d')

  if (!ctx) return

  // 清除前一帧
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制蒙层
  ctx.save()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)' // 蒙层颜色
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 将蒙层凿开
  ctx.globalCompositeOperation = 'source-atop'
  ctx.clearRect(startX, startY, width, height)

  // 绘制4个边框像素点并保存坐标信息以及事件参数
  // drawTrimCorners(startX, startY, width, height, ctx)

  // 再次使用drawImage将图片绘制到蒙层下方
  // ctx.save()
  ctx.globalCompositeOperation = 'destination-over'
  drawImageWithScale(canvas, img, scale)

  ctx.restore()
}

/**
 * 绘制裁剪区域 4 个顶角
 * @param startX 裁剪框横坐标
 * @param startY 裁剪框纵坐标
 * @param width 裁剪框宽度
 * @param height 裁剪框高度
 * @param ctx
 */
const drawTrimCorners = (
  startX: number,
  startY: number,
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D
) => {
  const radius = 10
  drawPoints(startX, startY, radius, ctx) // 左上角
  drawPoints(startX + width, startY, radius, ctx) // 右上角
  drawPoints(startX + width, startY + height, radius, ctx) // 右下角
  drawPoints(startX, startY + height, radius, ctx) // 左下角
}

const drawPoints = (
  startX: number,
  startY: number,
  radius: number,
  ctx: CanvasRenderingContext2D
) => {
  ctx.globalCompositeOperation = 'source-over'
  ctx.beginPath()
  ctx.arc(startX, startY, radius, 0, 2 * Math.PI)
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.closePath()
}

const onWheel = (event: WheelEvent) => {
  if (!event.deltaY || !event.ctrlKey) return
  event.preventDefault()

  scale += event.deltaY * -0.01

  // Restrict scale
  const minScale = 0.125
  const maxScale = 4
  scale = Math.min(Math.max(minScale, scale), maxScale)
  drawTrim(rectX, rectY, rectWidth, rectHeight)
}

const onTouchStart = (event: TouchEvent) => {
  event.preventDefault()

  if (event.touches.length > 1) {
    const x1 = event.touches[0].clientX
    const y1 = event.touches[0].clientY
    const x2 = event.touches[1].clientX
    const y2 = event.touches[1].clientY
    distance = Math.abs(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)))
  } else if (event.touches.length === 1) {
    isDragging = true
    lastX = event.touches[0].clientX
    lastY = event.touches[0].clientY
  }
}

const onTouchMove = (event: TouchEvent) => {
  event.preventDefault()

  if (event.touches.length > 1) {
    // 缩放
    const x1 = event.touches[0].clientX
    const y1 = event.touches[0].clientY
    const x2 = event.touches[1].clientX
    const y2 = event.touches[1].clientY
    const currentDistance = Math.abs(
      Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
    )
    scale = currentDistance / distance
    drawTrim(rectX, rectY, rectWidth, rectHeight)
  } else if (event.touches.length === 1 && isDragging) {
    const deltaX = event.touches[0].clientX - lastX
    const deltaY = event.touches[0].clientY - lastY
    translateX += deltaX
    translateY += deltaY
    lastX = event.touches[0].clientX
    lastY = event.touches[0].clientY
    drawTrim(rectX, rectY, rectWidth, rectHeight)
  }
}

const onTouchEnd = (event: TouchEvent) => {
  event.preventDefault()
  isDragging = false
}

const onDoneBtnClick = (canvas: HTMLCanvasElement) => {
  // 裁剪矩形区域的图片
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const imageData = ctx.getImageData(rectX, rectY, rectWidth, rectHeight)

  // 创建新的 Canvas 用于显示裁剪后的图片
  const clippedCanvas = document.createElement('canvas')
  clippedCanvas.width = rectWidth
  clippedCanvas.height = rectHeight
  const clippedCtx = clippedCanvas.getContext('2d')

  // 在新的 Canvas 上绘制裁剪后的图片
  clippedCtx?.putImageData(imageData, 0, 0)

  const aLink = document.createElement('a')
  aLink.download = 'landscape.jpg'
  aLink.href = clippedCanvas.toDataURL()
  document.body.appendChild(aLink)
  aLink.click()
  aLink.remove()
}

/**
 * 注册事件监听器
 * @param canvas canvas 对象
 */
const initEvents = (canvas: HTMLCanvasElement) => {
  if (!canvas) return
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('touchstart', onTouchStart, { passive: false })
  canvas.addEventListener('touchmove', onTouchMove, { passive: false })
  canvas.addEventListener('touchend', onTouchEnd, { passive: false })

  const doneBtn = document.querySelector('.trim-nav-done')
  doneBtn?.addEventListener('click', () => onDoneBtnClick(canvas))
}
