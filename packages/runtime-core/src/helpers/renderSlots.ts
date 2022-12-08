import { createVNode, Fragment } from '../vnode';
// 向外提供渲染插槽的方法
export function renderSlots(slots, name, props) {
  const slot = slots[name];
  if(slot) {
    return createVNode(Fragment, {}, slot(props))
  }
}

