import { isOn, ShapeFlags } from "@mini-vue/shared";
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
  const { type, shapeFlag } = vnode;

  if (shapeFlag & ShapeFlags.ELEMENT) {
    // 真实 DOM
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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
  const subTree = instance.render.call(instance.proxy);
  console.log(subTree, " subTree subTree");
  // subTree 可能是 Component 类型也可能是 Element 类型
  // 调用 patch 去处理 subTree
  // Element 类型则直接挂载
  debugger;
  patch(subTree, container);

  // patch 完毕后，将 el 再次赋给组件实例
  instance.vnode.el = subTree.el;
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type));
  const { children, shapeFlag } = vnode;

  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el);
  } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  }
  // props
  const { props } = vnode;
  console.log(vnode, 'vnode vnode')
  for (const [key, value] of Object.entries(props)) {
    // 处理事件监听
    if (isOn(key)) {
      el.addEventListener(key.slice(2).toLocaleLowerCase(), (value as any).bind(vnode));
    } else {
      el.setAttribute(key, value);
    }
  }

  container.append(el);
}

function mountChildren(vnode: any, container: any) {
  vnode.forEach((v) => {
    patch(v, container);
  });
}
