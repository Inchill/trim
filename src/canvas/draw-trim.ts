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
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)' // 蒙层颜色
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 将蒙层凿开
  ctx.globalCompositeOperation = 'source-atop'
  ctx.clearRect(startX, startY, width, height)

  // 绘制4个边框像素点并保存坐标信息以及事件参数
  drawTrimCorners(startX, startY, width, height, ctx)

  // 再次使用drawImage将图片绘制到蒙层下方
  ctx.save()
  ctx.globalCompositeOperation = 'destination-over'

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
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.closePath()
}
