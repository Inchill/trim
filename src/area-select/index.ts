import {
  Options,
  EventName,
  CallbackMap,
  Callback,
  Params,
  ZoomParams,
  CanvasImage
} from './base'
import { warn, throttle } from '@src/utils'

export { Params, ZoomParams } from './base'

const minX = 10 // 最小横坐标
const maxX = window.innerWidth - 10 // 最大横坐标
const minY = 200 // 最小纵坐标
const maxY = window.innerHeight - 200 // 最大纵坐标

export class AreaSelect {
  public rect
  private options: Options = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    minWidth: 80,
    minHeight: 60
  }
  private isResizing = false
  private scale = 1
  private callbackMap: CallbackMap = {
    afterChange: [],
    change: [],
    zoom: [],
    move: []
  }
  // 画布图片坐标&宽高信息
  private imageInfo: CanvasImage = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }

  constructor (el: HTMLElement | null, options: Options) {
    el = typeof el === 'string' ? document.querySelector(el) : el

    if (!el) {
      warn('el is required')
      return
    }

    if (!options) {
      warn('options is required')
      return
    }

    this.rect = el
    this.options = { ...this.options, ...options }
    this.initStyle()
    this.bindEvent()
  }

  /**
   * register event listener
   * @param eventName
   * @param callback
   */
  public on<T extends Params | ZoomParams> (
    eventName: EventName,
    callback: Callback<T>
  ) {
    this.callbackMap[eventName].push(callback as Callback<unknown>)
  }

  private trigger<T extends Params | ZoomParams> (
    eventName: EventName,
    params: T
  ) {
    const callbacks = this.callbackMap[eventName] as Callback<T>[]
    callbacks.forEach((cb) => cb(params))
  }

  private initStyle () {
    const { x, y, width, height } = this.options
    this.rect!.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
    `
  }

  private async bindEvent () {
    if (!this.rect) return

    this.rect.addEventListener('touchstart', this.onTouchStart.bind(this))
    this.rect.addEventListener('touchmove', this.onTouchMove.bind(this))
    this.rect.addEventListener('touchend', this.onTouchEnd.bind(this))
    this.rect.addEventListener('touchcancel', this.onTouchCancel.bind(this))
    this.rect.addEventListener('wheel', this.onWheel.bind(this))
  }

  private onTouchStart (event: TouchEvent) {
    const { classList } = event.target as HTMLElement
    if (!classList.contains('drag-button')) {
      this.dispatchEventToCanvas(event)
      return
    }
    this.isResizing = true
    this.showGridLine()
  }

  // 监听触摸移动
  private onTouchMove (event: TouchEvent) {
    const { classList } = event.target as HTMLElement
    // 矩形区域移动或者缩放事件透传
    if (!classList.contains('drag-button')) {
      this.dispatchEventToCanvas(event)
      return
    }
    if (!this.isResizing) return

    const { clientX, clientY } = event.touches[0]
    const { width, height, x, y } = this.rect!.getBoundingClientRect()

    if (classList.contains('drag-button-top')) {
      this.resizeTop(clientX, clientY, x, y, width, height)
    } else if (classList.contains('drag-button-bottom')) {
      this.resizeBottom(clientX, clientY, x, y, width, height)
    } else if (classList.contains('drag-button-left')) {
      this.resizeLeft(clientX, clientY, x, y, width, height)
    } else if (classList.contains('drag-button-right')) {
      this.resizeRight(clientX, clientY, x, y, width, height)
    }
  }

  private onTouchEnd (event: TouchEvent) {
    const { classList } = event.target as HTMLElement
    if (!classList.contains('drag-button')) {
      this.dispatchEventToCanvas(event)
      return
    }

    this.isResizing = false
    this.hideGridLine()
    const { width, height, x, y } = this.rect!.getBoundingClientRect()
    this.options = { ...this.options, x, y, width, height }
    this.trigger('afterChange', { ...this.options })
  }

  private onTouchCancel (event: TouchEvent) {
    const { classList } = event.target as HTMLElement
    if (!classList.contains('drag-button')) {
      this.dispatchEventToCanvas(event)
      return
    }

    this.isResizing = false
    this.hideGridLine()
    const { width, height, x, y } = this.rect!.getBoundingClientRect()
    this.options = { ...this.options, x, y, width, height }
  }

  // 左上角
  private resizeTop (
    clientX: number,
    clientY: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const { minWidth = 80, minHeight = 60 } = this.options
    let deltaX = clientX - this.options.x
    let deltaY = clientY - this.options.y
    let newWidth = this.options.width - deltaX
    let newHeight = this.options.height - deltaY
    let newX = clientX
    let newY = clientY

    // 检查是否最小
    if (newWidth < minWidth) {
      newWidth = minWidth
      deltaX = this.options.width - minWidth
      newX = this.options.x + deltaX
    }
    if (newHeight < minHeight) {
      newHeight = minHeight
      deltaY = this.options.height - minHeight
      newY = this.options.y + deltaY
    }

    // Ensure the dot position is within the min boundaries
    if (newX < minX) return
    if (newY < Math.max(minY, this.imageInfo.y)) return

    this.updateRect(newX, newY, newWidth, newHeight)
  }

  // 右上角
  private resizeRight (
    clientX: number,
    clientY: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const { minWidth = 80, minHeight = 60 } = this.options
    const deltaX = clientX - (this.options.x + this.options.width)
    let deltaY = clientY - this.options.y
    let newWidth = this.options.width + deltaX
    let newHeight = this.options.height - deltaY
    let newY = clientY

    if (newWidth < minWidth) {
      newWidth = minWidth
    }
    if (newHeight < minHeight) {
      newHeight = minHeight
      deltaY = this.options.height - minHeight
      newY = this.options.y + deltaY
    }

    // Ensure the dot position is within the min boundaries
    if (x + newWidth > maxX) return
    if (newY < Math.max(minY, this.imageInfo.y)) return

    this.updateRect(x, newY, newWidth, newHeight)
  }

  // 右下角
  private resizeBottom (
    clientX: number,
    clientY: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const { minWidth = 80, minHeight = 60 } = this.options
    const deltaX = clientX - (this.options.x + this.options.width)
    const deltaY = clientY - (this.options.y + this.options.height)
    let newWidth = this.options.width + deltaX
    let newHeight = this.options.height + deltaY

    if (newWidth < minWidth) {
      newWidth = minWidth
    }
    if (newHeight < minHeight) {
      newHeight = minHeight
    }

    // Ensure the dot position is within the min boundaries
    if (x + newWidth > maxX) return
    if (
      y + newHeight >
      Math.min(maxY, this.imageInfo.y + this.imageInfo.height)
    )
      return

    this.updateRect(x, y, newWidth, newHeight)
  }

  // 左下角
  private resizeLeft (
    clientX: number,
    clientY: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const { minWidth = 80, minHeight = 60 } = this.options
    let deltaX = clientX - this.options.x
    let deltaY = clientY - (this.options.y + this.options.height)
    let newWidth = this.options.width - deltaX
    let newHeight = this.options.height + deltaY
    let newX = clientX
    let newY = clientY - newHeight

    if (newWidth < minWidth) {
      newWidth = minWidth
      deltaX = this.options.width - minWidth
      newX = this.options.x + deltaX
    }
    if (newHeight < minHeight) {
      newHeight = minHeight
      deltaY = this.options.height - minHeight
      newY = this.options.y + deltaY
      if (clientY - this.options.y < minHeight) {
        newY = this.options.y
      }
    }

    // Ensure the dot position is within the min boundaries
    if (newX < minX) return
    if (
      y + newHeight >
      Math.min(maxY, this.imageInfo.y + this.imageInfo.height)
    )
      return

    this.updateRect(newX, newY, newWidth, newHeight)
  }

  private updateRect (
    newX: number,
    newY: number,
    newWidth: number,
    newHeight: number
  ) {
    this.rect!.style.cssText = `
      left: ${newX}px;
      top: ${newY}px;
      width: ${newWidth}px;
      height: ${newHeight}px;
    `
    this.trigger('change', {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight
    })
  }

  // 检查坐标是否在矩形区域内
  private checkInRect (x: number, y: number) {
    if (
      x < this.options.x ||
      x > this.options.x + this.options.width ||
      y < this.options.y ||
      y > this.options.y + this.options.height
    ) {
      return false
    }

    return true
  }

  private onWheel (event: WheelEvent) {
    event.preventDefault()

    const { classList } = event.target as HTMLElement
    if (classList.contains('drag-button')) return
    if (!event.deltaY || !event.ctrlKey) return

    this.scale += event.deltaY * -0.01

    // Restrict scale
    const minScale = 0.125
    const maxScale = 4
    this.scale = Math.min(Math.max(minScale, this.scale), maxScale)
    this.trigger('zoom', { scale: this.scale })
  }

  private dispatchEventToCanvas (event: TouchEvent) {
    // 如果是在矩形区域内的 touch 事件，需要派发给底层 canvas 画布
    const canvas = document.querySelector('.trim-edit-canvas')
      ?.children[0] as HTMLCanvasElement
    if (!canvas) return

    const touches = Array.from(event.touches).map(
      (t) =>
        new Touch({
          identifier: t.identifier,
          target: canvas,
          clientX: t.clientX,
          clientY: t.clientY,
          screenX: t.screenX,
          screenY: t.screenY,
          pageX: t.pageX,
          pageY: t.pageY,
          radiusX: t.radiusX,
          radiusY: t.radiusY,
          rotationAngle: t.rotationAngle,
          force: t.force
        })
    )
    const targetTouches = Array.from(event.targetTouches).map(
      (t) =>
        new Touch({
          identifier: t.identifier,
          target: canvas,
          clientX: t.clientX,
          clientY: t.clientY,
          screenX: t.screenX,
          screenY: t.screenY,
          pageX: t.pageX,
          pageY: t.pageY,
          radiusX: t.radiusX,
          radiusY: t.radiusY,
          rotationAngle: t.rotationAngle,
          force: t.force
        })
    )
    const changedTouches = Array.from(event.changedTouches).map(
      (t) =>
        new Touch({
          identifier: t.identifier,
          target: canvas,
          clientX: t.clientX,
          clientY: t.clientY,
          screenX: t.screenX,
          screenY: t.screenY,
          pageX: t.pageX,
          pageY: t.pageY,
          radiusX: t.radiusX,
          radiusY: t.radiusY,
          rotationAngle: t.rotationAngle,
          force: t.force
        })
    )
    const canvasEvent = new TouchEvent(event.type, {
      bubbles: true,
      cancelable: true,
      touches: touches,
      targetTouches: targetTouches,
      changedTouches: changedTouches
    })
    canvas.dispatchEvent(canvasEvent)
  }

  public updateCanvasImageInfo (info: CanvasImage) {
    this.imageInfo = { ...info }
  }

  private showGridLine () {
    const ele = document.querySelector('.area-select-box') as HTMLElement
    ele.classList.add('grid-line')
  }

  private hideGridLine () {
    const ele = document.querySelector('.area-select-box') as HTMLElement
    ele.classList.remove('grid-line')
  }
}
