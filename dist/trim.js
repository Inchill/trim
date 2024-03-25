
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.trim = {}));
})(this, (function (exports) { 'use strict';

  const warn = (message) => console.warn(message);

  let AreaSelect$1 = class AreaSelect {
      rect;
      options = {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          minWidth: 40,
          minHeight: 30
      };
      isResizing = false;
      callbackMap = {
          afterChange: [],
          change: []
      };
      constructor(el, options) {
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
      on(eventName, callback) {
          this.callbackMap[eventName].push(callback);
      }
      trigger(eventName, params) {
          const callbacks = this.callbackMap[eventName];
          callbacks.forEach((cb) => cb(params));
      }
      initStyle() {
          const { x, y, width, height } = this.options;
          this.rect.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${width}px;
        height: ${height}px;
    `;
      }
      bindEvent() {
          if (!this.rect)
              return;
          this.rect.addEventListener('touchstart', this.onTouchStart.bind(this));
          this.rect.addEventListener('touchmove', this.onTouchMove.bind(this));
          this.rect.addEventListener('touchend', this.onTouchEnd.bind(this));
          this.rect.addEventListener('touchcancel', this.onTouchCancel.bind(this));
      }
      onTouchStart(event) {
          const { classList } = event.target;
          if (!classList.contains('drag-button'))
              return;
          this.isResizing = true;
      }
      onTouchMove(event) {
          const { classList } = event.target;
          if (!classList.contains('drag-button'))
              return;
          if (!this.isResizing)
              return;
          const { width, height, x, y } = this.rect.getBoundingClientRect();
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
          }
          else if (isBottomButton) {
              // 不更新矩形左上角坐标
              deltaX = event.touches[0].clientX - (this.options.x + this.options.width);
              deltaY =
                  event.touches[0].clientY - (this.options.y + this.options.height);
              newWidth = this.options.width + deltaX;
              newHeight = this.options.height + deltaY;
          }
          else if (isLeftButton) {
              // 更新矩形左上角横纵坐标
              deltaX = event.touches[0].clientX - this.options.x;
              deltaY = event.touches[0].clientY - this.options.y - this.options.height;
              newWidth = this.options.width - deltaX;
              newHeight = this.options.height + deltaY;
              newX = event.touches[0].clientX;
              newY = event.touches[0].clientY - newHeight;
          }
          else if (isRightButton) {
              // 更新矩形左上角横纵坐标
              deltaX = event.touches[0].clientX - (this.options.x + this.options.width);
              deltaY = event.touches[0].clientY - this.options.y;
              newWidth = this.options.width + deltaX;
              newHeight = this.options.height - deltaY;
              newY = event.touches[0].clientY;
          }
          this.rect.style.cssText = `
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
      onTouchEnd(event) {
          const { classList } = event.target;
          if (!classList.contains('drag-button'))
              return;
          this.isResizing = false;
          const { width, height, x, y } = this.rect.getBoundingClientRect();
          this.options = { x, y, width, height };
          this.trigger('afterChange', { ...this.options });
      }
      onTouchCancel(event) {
          const { classList } = event.target;
          if (!classList.contains('drag-button'))
              return;
          this.isResizing = false;
          const { width, height, x, y } = this.rect.getBoundingClientRect();
          this.options = { x, y, width, height };
      }
  };

  const imgRectMargin = 20;
  const img = new Image();
  let rectX = 0, rectY = 0, rectWidth = 0, rectHeight = 0;
  const translateX = 0;
  const translateY = 0;
  const drawImage = (src) => {
      const canvas = document.querySelector('.trim-edit-canvas')
          ?.children[0];
      if (!canvas)
          return;
      canvas.getContext('2d');
      const rootWrapper = document.querySelector('.trim-root-wrapper');
      const rootWrapperRect = rootWrapper.getBoundingClientRect();
      canvas.width = rootWrapperRect.width;
      canvas.height = rootWrapperRect.height;
      canvas.style.width = rootWrapperRect.width + 'px';
      canvas.style.height = rootWrapperRect.height + 'px';
      img.onload = () => {
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          // 计算矩形区域的宽度和高度，保持与图片的宽高比相同
          rectWidth = canvasWidth - imgRectMargin * 2;
          rectHeight = rectWidth * (img.height / img.width);
          // 计算矩形区域的位置，使其在画布中央显示，并且距离画布边缘有间距
          rectX = (canvasWidth - rectWidth) / 2;
          rectY = (canvasHeight - rectHeight) / 2 - imgRectMargin * 2;
          drawImageWithScale(canvas, img);
          const rectangle = document.getElementById('rectangle');
          const areaSelect = new AreaSelect$1(rectangle, {
              x: rectX,
              y: rectY,
              width: rectWidth,
              height: rectHeight
          });
          areaSelect.on('change', (params) => {
              rectX = params.x;
              rectY = params.y;
              rectWidth = params.width;
              rectHeight = params.height;
              drawImageWithScale(canvas, img);
          });
          areaSelect.on('afterChange', (params) => {
              rectX = params.x;
              rectY = params.y;
              rectWidth = params.width;
              rectHeight = params.height;
              drawImageWithScale(canvas, img);
          });
          // 设置手势缩放
          // setupGesture(canvas, img);
          // 设置裁剪区域
          // setupCropArea()
      };
      img.crossOrigin = 'anonymous';
      img.src = src;
  };
  // 根据缩放比例绘制图片
  function drawImageWithScale(canvas, image, scaleFactor = 1) {
      if (!canvas)
          return;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ctx = canvas.getContext('2d');
      if (!ctx)
          return;
      // 计算缩放后的图片宽度和高度
      const imgWidth = image.width * scaleFactor;
      const imgHeight = image.height * scaleFactor;
      // 沿着矩形区域中心点缩放
      const dx = (canvasWidth - imgWidth) / 2 + translateX;
      const dy = (canvasHeight - imgHeight) / 2 + translateY;
      // 清除画布
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      // 绘制图片
      ctx.drawImage(image, dx, dy, imgWidth, imgHeight);
      // 获取矩形区域图像数据
      const imageData = ctx.getImageData(rectX, rectY, rectWidth, rectHeight);
      // 添加蒙层
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      // 绘制矩形区域裁剪的图像
      ctx.putImageData(imageData, rectX, rectY);
  }

  var Nav = () => `
    <div class="trim-nav-tools">
        <button class="trim-nav-close" title="关闭">
            <span>
            </span>
        </button>
        <button class="trim-nav-done" title="完成">
            <span>
            </span>
        </button>
    </div>
`;

  var Toolbar = () => `

`;

  var Canvas = () => `
    <div class="trim-edit-canvas">
        <canvas></canvas>
    </div>
`;

  var AreaSelect = () => `
    <div class="trim-edit-main">
        <div id="rectangle">
            <div class="drag-button drag-button-top"></div>
            <div class="drag-button drag-button-right"></div>
            <div class="drag-button drag-button-bottom"></div>
            <div class="drag-button drag-button-left"></div>
        </div>
    </div>
`;

  const createTrimImageEditorUI = () => `
    <div class="trim-root-wrapper">
        ${Nav()}
        ${AreaSelect()}
        ${Toolbar()}
        ${Canvas()}
    </div>
`;

  const init = (options) => {
      let { el } = options;
      const { src } = options;
      el = typeof el === 'string' ? document.querySelector(el) : el;
      if (!el) {
          warn('el is required');
          return;
      }
      if (!src) {
          warn('src is required');
          return;
      }
      el.innerHTML = createTrimImageEditorUI();
      drawImage(src);
      window.addEventListener('resize', () => drawImage(src));
  };

  exports.init = init;

}));
