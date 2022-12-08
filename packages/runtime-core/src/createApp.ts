import { createVNode } from "./vnode"

/**
 *  @description createApp(App) 接收根组件返回app对象，之后进行挂载。 
 * 
 * */ 
// export function createApp(rootComponent){
//   return {
//     mount(rootContainer){


//       const vnode = createVNode(rootComponent)

//       render(vnode, rootContainer)
//     }
//   }
// }

/**
 *  @description 闭包 -- 使用自定义渲染函数返回的渲染方法
 * 
 * */ 
export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 先将 rootComponent 转成 VNode 再进行处理
        const vnode = createVNode(rootComponent);

        if (typeof rootContainer === 'string') {
          rootContainer = document.querySelector(rootContainer);
        }

        render(vnode, rootContainer);
      },
    };
  }
}
