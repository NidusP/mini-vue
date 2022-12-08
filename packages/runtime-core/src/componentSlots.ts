import { isArray, isString, ShapeFlags } from "@mini-vue/shared";

// 把原始的vnode中定义的slots挂载到组件实例instance上，这样就可以直接通过组件实例去访问slots，而不需要总是通过vnode去访问
export function initSlots(instance, children) {
  // // 初始化slots 确保存储 vnode 是数组结构
  // instance.slots =
  //   isString(children) || isArray(children) ? children : [children];
  // if (children) normalizeObjectSlots(children, instance.slots);

  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(children, instance.slots);
  }
}

/**
 * 因为还有具名插槽，slots是对象
 *
 * */
function normalizeObjectSlots(children: any, slots: any) {
  for (const [key, value] of Object.entries<any>(children)) {
    slots[key] =
      typeof value === "function"
        ? (props) => normalizeSlotValue(value(props))
        : normalizeSlotValue(value);
  }
}

function normalizeSlotValue(value) {
  return isString(value) || isArray(value) ? value : [value];
}
