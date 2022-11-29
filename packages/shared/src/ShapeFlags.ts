/**
 * @description 组件的类型
 * @param ELEMENT = 1: element 类型
 * @param STATEFUL_COMPONENT = 1 << 2 = 4: 组件类型
 * @param TEXT_CHILDREN = 1 << 3 = 8: vnode 的 children 为 string 类型
 * @param ARRAY_CHILDREN = 1 << 4 = 16: vnode 的 children 为数组类型
 * @param SLOTS_CHILDREN = 1 << 5 = 32: vnode 的 children 为 slots 类型
*/
export const enum ShapeFlags {
  ELEMENT = 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5
}
