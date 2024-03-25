import { Options, EventName, CallbackMap, Callback, Params } from './base';
import { warn } from '@src/utils';

export default class AreaSelect {
  public rect;
  private options: Options = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    minWidth: 40,
    minHeight: 30
  };
  private isResizing: boolean = false;
  private callbackMap: CallbackMap = {
    afterChange: [],
    change: []
  };

  constructor(el: HTMLElement | null, options: Options) {
    el = typeof el === 'string' ? document.querySelector(el) : el;

    if (!el) {
      warn('el is required');
      return;
    }

    if (!options) {
      warn('options is required');
      return;
    }

    this.rect = el;
    this.options = Object.assign(this.options, options);
    this.initStyle();
    this.bindEvent();
  }

  /**
   * register event listener
   * @param eventName
   * @param callback
   */
  public on(eventName: EventName, callback: Callback) {
    this.callbackMap[eventName].push(callback);
  }

  private trigger(eventName: EventName, params: Params) {
    const callbacks = this.callbackMap[eventName];
    callbacks.forEach((cb) => cb(params));
  }

  private initStyle() {
    const { x, y, width, height } = this.options;
    this.rect!.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${width}px;
        height: ${height}px;
    `;
  }

  private bindEvent() {
    if (!this.rect) return;

    this.rect.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.rect.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.rect.addEventListener('touchend', this.onTouchEnd.bind(this));
    this.rect.addEventListener('touchcancel', this.onTouchCancel.bind(this));
  }

  private onTouchStart(event: TouchEvent) {
    const { classList } = event.target as HTMLElement;
    if (!classList.contains('drag-button')) return;
    this.isResizing = true;
  }

  private onTouchMove(event: TouchEvent) {
    const { classList } = event.target as HTMLElement;
    if (!classList.contains('drag-button')) return;
    if (!this.isResizing) return;

    const { width, height, x, y } = this.rect!.getBoundingClientRect();
    const isTopButton = classList.contains('drag-button-top');
    const isRightButton = classList.contains('drag-button-right');
    const isBottomButton = classList.contains('drag-button-bottom');
    const isLeftButton = classList.contains('drag-button-left');

    let deltaX = 0;
    let deltaY = 0;
    let newWidth = width;
    let newHeight = height;
    let newX = x;
    let newY = y;

    if (isTopButton) {
      // 更新矩形左上角横纵坐标
      deltaX = event.touches[0].clientX - this.options.x;
      deltaY = event.touches[0].clientY - this.options.y;
      newWidth = this.options.width - deltaX;
      newHeight = this.options.height - deltaY;
      newX = event.touches[0].clientX;
      newY = event.touches[0].clientY;
    } else if (isBottomButton) {
      // 不更新矩形左上角坐标
      deltaX = event.touches[0].clientX - (this.options.x + this.options.width);
      deltaY =
        event.touches[0].clientY - (this.options.y + this.options.height);
      newWidth = this.options.width + deltaX;
      newHeight = this.options.height + deltaY;
    } else if (isLeftButton) {
      // 更新矩形左上角横纵坐标
      deltaX = event.touches[0].clientX - this.options.x;
      deltaY = event.touches[0].clientY - this.options.y - this.options.height;
      newWidth = this.options.width - deltaX;
      newHeight = this.options.height + deltaY;
      newX = event.touches[0].clientX;
      newY = event.touches[0].clientY - newHeight;
    } else if (isRightButton) {
      // 更新矩形左上角横纵坐标
      deltaX = event.touches[0].clientX - (this.options.x + this.options.width);
      deltaY = event.touches[0].clientY - this.options.y;
      newWidth = this.options.width + deltaX;
      newHeight = this.options.height - deltaY;
      newY = event.touches[0].clientY;
    }

    this.rect!.style.cssText = `
        left: ${newX}px;
        top: ${newY}px;
        width: ${newWidth}px;
        height: ${newHeight}px;
    `;
    this.trigger('change', {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight
    });
  }

  private onTouchEnd(event: TouchEvent) {
    const { classList } = event.target as HTMLElement;
    if (!classList.contains('drag-button')) return;

    this.isResizing = false;
    const { width, height, x, y } = this.rect!.getBoundingClientRect();
    this.options = { x, y, width, height };
    this.trigger('afterChange', { ...this.options });
  }

  private onTouchCancel(event: TouchEvent) {
    const { classList } = event.target as HTMLElement;
    if (!classList.contains('drag-button')) return;

    this.isResizing = false;
    const { width, height, x, y } = this.rect!.getBoundingClientRect();
    this.options = { x, y, width, height };
  }
}
