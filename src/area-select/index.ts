import { Options, EventName, CallbackMap, Callback, Params } from './base'
import { warn, throttle } from '@src/utils'

export { Params } from './base'

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
  private isResizing: boolean = false
  private callbackMap: CallbackMap = {
    afterChange: [],
    change: []
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
  public on (eventName: EventName, callback: Callback) {
    this.callbackMap[eventName].push(callback)
  }

  private trigger (eventName: EventName, params: Params) {
    const callbacks = this.callbackMap[eventName]
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
    this.rect.addEventListener(
      'touchmove',
      throttle(this.onTouchMove.bind(this), 16.7)
    )
    this.rect.addEventListener('touchend', this.onTouchEnd.bind(this))
    this.rect.addEventListener('touchcancel', this.onTouchCancel.bind(this))
  }

  private onTouchStart (event: TouchEvent) {
    const { classList } = event.target as HTMLElement
    if (!classList.contains('drag-button')) return
    this.isResizing = true
  }

  private onTouchMove (event: TouchEvent) {
    const { classList } = event.target as HTMLElement
    if (!classList.contains('drag-button')) return
    if (!this.isResizing) return

    const { minWidth = 80, minHeight = 60 } = this.options
    const { clientX, clientY } = event.touches[0]
    const { width, height, x, y } = this.rect!.getBoundingClientRect()
    const isTopButton = classList.contains('drag-button-top')
    const isRightButton = classList.contains('drag-button-right')
    const isBottomButton = classList.contains('drag-button-bottom')
    const isLeftButton = classList.contains('drag-button-left')

    let deltaX = 0
    let deltaY = 0
    let newWidth = width
    let newHeight = height
    let newX = x
    let newY = y

    if (isTopButton) {
      // 更新矩形左上角
      deltaX = clientX - this.options.x
      deltaY = clientY - this.options.y
      newWidth = this.options.width - deltaX
      newHeight = this.options.height - deltaY
      newX = clientX
      newY = clientY

      // 检查是否达到最小宽度和高度
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
    } else if (isBottomButton) {
      // 更新矩形右下角
      deltaX = clientX - (this.options.x + this.options.width)
      deltaY = clientY - (this.options.y + this.options.height)
      newWidth = this.options.width + deltaX
      newHeight = this.options.height + deltaY

      // 检查是否达到最小宽度和高度
      if (newWidth < minWidth) {
        newWidth = minWidth
      }
      if (newHeight < minHeight) {
        newHeight = minHeight
      }
    } else if (isLeftButton) {
      // 更新矩形左下角
      deltaX = clientX - this.options.x
      deltaY = clientY - this.options.y - this.options.height
      newWidth = this.options.width - deltaX
      newHeight = this.options.height + deltaY
      newX = clientX
      newY = clientY - newHeight

      // 检查是否达到最小宽度和高度
      if (newWidth < minWidth) {
        newWidth = minWidth
        deltaX = this.options.width - minWidth
        newX = this.options.x + deltaX
      }
      if (newHeight < minHeight) {
        newHeight = minHeight
        deltaY = this.options.height - minHeight
        newY = this.options.y + deltaY
        console.log(newY)
      }
    } else if (isRightButton) {
      // 更新矩形右上角
      deltaX = clientX - (this.options.x + this.options.width)
      deltaY = clientY - this.options.y
      newWidth = this.options.width + deltaX
      newHeight = this.options.height - deltaY
      newY = clientY

      // 检查是否达到最小宽度和高度
      if (newWidth < minWidth) {
        newWidth = minWidth
      }
      if (newHeight < minHeight) {
        newHeight = minHeight
        deltaY = this.options.height - minHeight
        newY = this.options.y + deltaY
      }
    }

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

  private onTouchEnd (event: TouchEvent) {
    const { classList } = event.target as HTMLElement
    if (!classList.contains('drag-button')) return

    this.isResizing = false
    const { width, height, x, y } = this.rect!.getBoundingClientRect()
    this.options = { ...this.options, x, y, width, height }
    this.trigger('afterChange', { ...this.options })
  }

  private onTouchCancel (event: TouchEvent) {
    const { classList } = event.target as HTMLElement
    if (!classList.contains('drag-button')) return

    this.isResizing = false
    const { width, height, x, y } = this.rect!.getBoundingClientRect()
    this.options = { ...this.options, x, y, width, height }
  }

  private getMinRect () {}
}
