import { TouchFunctionType, ResolveFunctionType } from 'types';

export const warn = (message: string) => console.warn(message);

/**
 * 节流函数
 * @param fn 执行函数
 * @param delay 限制时间
 */
export const throttle = <T extends TouchFunctionType>(fn: T, delay: number) => {
  let last = 0;
  return function (this: unknown, event: TouchEvent) {
    const now = Date.now();
    if (now - last > delay) {
      fn.apply(this, [event]);
      last = now;
    }
  };
};

export const getScreenRefreshTime = (): Promise<number> => {
  const run = <T extends ResolveFunctionType>(resolve: T, reject: T) => {
    let startTime = 0,
      endTime = 0,
      samples = 60; // 取样次数
    let totalTime = 0;

    function refresh() {
      if (!startTime) {
        startTime = performance.now();
        requestAnimationFrame(refresh);
        return;
      }

      endTime = performance.now();
      const frameTime = endTime - startTime;
      totalTime += frameTime;
      startTime = endTime;

      if (--samples > 0) {
        requestAnimationFrame(refresh);
      } else {
        const averageFrameTime = totalTime / 60; // 计算平均帧时间
        const refreshRate = 1000 / averageFrameTime; // 计算刷新率
        // console.log('Estimated screen refresh rate: ' + refreshRate.toFixed(0) + ' Hz');
        resolve(Math.round(averageFrameTime));
      }
    }

    refresh();
  };

  return new Promise((resolve, reject) => {
    run(resolve, reject);
  });
};
