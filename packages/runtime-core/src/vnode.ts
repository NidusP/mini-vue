import { ShapeFlags } from "@mini-vue/shared";

export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');
/**
 * @description 创建虚拟 DOM 节点
 * @param type 组件导出的对象, vnode的类型 Component 或 Element 等
 * @param props 组件的 props
 * @param children 子组件
 */
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
    key: props?.key,
    component: null,
  };

  // 根据 children 的类型添加 vnode 的类型 -- 是 TEXT_CHILDREN 还是 ARRAY_CHILDREN
  if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }

  // 组件 + children 是 object
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
    }
  }
  return vnode;
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}


function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
