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

export interface Params {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 事件名称
 */
export type EventName = 'afterChange' | 'change';

/**
 * 回调函数
 */
export type Callback = (params: Params) => void;

/**
 * 事件注册表
 */
export type CallbackMap = {
  [key in EventName]: Callback[];
};
