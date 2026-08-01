type Listener = (msg: string) => void;
const listeners: Listener[] = [];

/** 订阅 toast 事件，返回取消订阅函数 */
export function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

/** 全局 toast：任意位置调用 showToast('...') */
export function showToast(msg: string) {
  listeners.forEach(l => l(msg));
}
