/**
 * 初始化配置项
 */
export interface IOptions {
  el: HTMLElement | null;
  src: string;
}

/**
 * Touch 事件回调函数类型
 */
export type TouchFunctionType = (event: TouchEvent) => void;

/**
 * 函数类型
 */
export type FunctionType = (...args: unknown[]) => unknown;

/**
 * Promise resolve type
 */
export type ResolveFunctionType = (...args: number[]) => void;
