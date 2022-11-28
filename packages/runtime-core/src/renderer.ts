import { isObject, isArray, isString } from "@mini-vue/shared";
import { createComponentInstance, setupComponent } from "./component";

/**
 * @description 将vnode转为真实的dom节点， 调用patch方法对不同类型的vnode作处理
 * 
*/
export function render(vnode: any, container: any) {
  // 调用 patch
  patch(vnode, container);
}


/**
 * @description 能够处理 component 类型和 dom element 类型
 *
 * component 类型会递归调用 patch 继续处理
 * element 类型则会进行渲染
 */
 export function patch(vnode, container) {
  const { type } = vnode;

  if (typeof type === 'string') {
    // 真实 DOM
    processElement(vnode, container);
  } else if (isObject(type)) {
    // 处理 component 类型
    processComponent(vnode, container);
  }
}
/**
 * @description 分为 mount挂载 与 update更新
 * */ 
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

/**
 * @description 创建组件实例，然后进行初始化与渲染
 * */ 
function mountComponent(vnode: any, container) {
  // 根据 vnode 创建组件实例
  const instance = createComponentInstance(vnode);

  // setup 组件实例
  setupComponent(instance);
  setupRenderEffect(instance, container);
}


function setupRenderEffect(instance, container) {
  const subTree = instance.render.call(instance.setupState)

  // subTree 可能是 Component 类型也可能是 Element 类型
  // 调用 patch 去处理 subTree
  // Element 类型则直接挂载
  patch(subTree, container);
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);
  const { children } = vnode;

  if(isArray(children)){
    children.forEach(item => {
      patch(item, el)
    });
  } else if(isString(children)) {
    el.textContent = children;
  }
  // props
  const { props } = vnode;
  for (const [key, value] of Object.entries(props)) {
    el.setAttribute(key, value);
  }

  container.append(el);
}








