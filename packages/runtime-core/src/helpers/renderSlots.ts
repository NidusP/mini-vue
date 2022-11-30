import { createVNode } from '../vnode';
// 向外提供渲染插槽的方法
export function renderSlots(slots) {
  return createVNode('span', {}, slots);
}