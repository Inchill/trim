import AreaSelect from '../area-select';

const imgRectMargin = 20;
const img = new Image();
let rectX = 0,
  rectY = 0,
  rectWidth = 0,
  rectHeight = 0;
const translateX = 0;
const translateY = 0;
let scale = 1;

export const drawImage = (src: string) => {
  const canvas = document.querySelector('.trim-edit-canvas')
    ?.children[0] as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const rootWrapper = document.querySelector(
    '.trim-root-wrapper'
  ) as HTMLElement;
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
    rectY = (canvasHeight - rectHeight) / 2;

    scale = rectWidth / img.width + 0.3;

    drawImageWithScale(canvas, img, scale);

    const rectangle = document.getElementById('rectangle');
    const areaSelect = new AreaSelect(rectangle, {
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
      drawImageWithScale(canvas, img, scale);
    });

    areaSelect.on('afterChange', (params) => {
      rectX = params.x;
      rectY = params.y;
      rectWidth = params.width;
      rectHeight = params.height;
      drawImageWithScale(canvas, img, scale);
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
function drawImageWithScale(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  scaleFactor = 1
) {
  if (!canvas) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

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
