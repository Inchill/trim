import { IOptions } from 'types';
import { drawImage } from './canvas';
import { warn } from './utils';
import { createTrimImageEditorUI } from './ui';
import './css/index.styl';

export const init = (options: IOptions) => {
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
