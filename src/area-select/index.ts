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
      throttle(this.onTouchMove.bind(this), 0)
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

    this.updateRect(newX, newY, newWidth, newHeight)
  }

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

    this.updateRect(x, y, newWidth, newHeight)
  }

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

    this.updateRect(newX, newY, newWidth, newHeight)
  }

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

    this.updateRect(x, newY, newWidth, newHeight)
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
