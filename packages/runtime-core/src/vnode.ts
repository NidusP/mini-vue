/**
 * @description 创建虚拟 DOM 节点
 * @param type 组件导出的对象, vnode的类型 Component 或 Element 等
 * @param props 组件的 props
 * @param children 子组件
 */

 export function createVNode(type, props?, children?){
  const vnode = {
    type,
    props,
    children,
  }

  return vnode
 }