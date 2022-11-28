import { render } from "./renderer"
import { createVNode } from "./vnode"

/**
 *  @description createApp(App) 接收根组件返回app对象，之后进行挂载。 
 * 
 * */ 
export function createApp(rootComponent){
  return {
    mount(rootContainer){


      const vnode = createVNode(rootComponent)

      render(vnode, rootContainer)
    }
  }
}