/**
 * 矩形坐标和大小
 */
export interface Options {
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
}

/**
 * 画布图片信息
 */
export interface CanvasImage {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Params {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ZoomParams {
  scale: number;
}

export interface MoveParams {
  x: number;
  y: number;
}

/**
 * 事件名称
 */
export type EventName = 'afterChange' | 'change' | 'zoom' | 'move';

/**
 * 回调函数
 */
export type Callback<T> = (params: T) => void;

/**
 * 缩放回调函数
 */
export type ZoomCallback = (params: ZoomParams) => void;

/**
 * 事件注册表
 */
export type CallbackMap = {
  afterChange: Callback<Params>[];
  change: Callback<Params>[];
  zoom: Callback<ZoomParams>[];
  move: Callback<MoveParams>[];
};
