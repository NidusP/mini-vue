import { ShapeFlags } from "@mini-vue/shared";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

/**
 *  自定义渲染函数
 *
 * */
export function createRenderer(options) {
  const { createElement, patchProp, insert } = options;
  /**
   * @description 将vnode转为真实的dom节点， 调用patch方法对不同类型的vnode作处理
   *
   */
  function render(vnode: any, container: any) {
    // 调用 patch
    patch(vnode, container);
  }

  /**
   * @description 能够处理 component 类型和 dom element 类型
   *
   * component 类型会递归调用 patch 继续处理
   * element 类型则会进行渲染
   */
  function patch(vnode, container, parentComponent = null) {
    if (!vnode) return;
    const { type, shapeFlag } = vnode;

    switch (type) {
      case Text:
        processText(vnode, container);
        break;
      // 其中还有几个类型比如： static fragment comment
      case Fragment:
        processFragment(vnode, container, parentComponent);
        break;
      default:
        // 这里就基于 shapeFlag 来处理
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 真实 DOM
          processElement(vnode, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理 component 类型
          processComponent(vnode, container, parentComponent);
        }
    }
  }

  /**
   * @description 处理 Text
   * */
  function processText(vnode: any, container: any) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
  }

  /**
   * @description 处理 Fragment
   * */
  function processFragment(vnode: any, container: any, parentComponent) {
    mountChildren(vnode.children, container, parentComponent);
  }

  function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent);
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    // const el = (vnode.el = document.createElement(vnode.type));
    const el = (vnode.el = createElement(vnode.type));
    const { children, shapeFlag } = vnode;

    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent);
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    }
    // props
    const { props } = vnode;

    for (const [key, value] of Object.entries(props)) {
      // // 处理事件监听
      // if (isOn(key)) {
      //   el.addEventListener(
      //     key.slice(2).toLocaleLowerCase(),
      //     (value as any).bind(vnode)
      //   );
      // } else {
      //   el.setAttribute(key, value);
      // }
      patchProp(el, key, value);
    }

    insert(el, container);
    // container.append(el);
  }

  function mountChildren(vnode: any, container: any, parentComponent) {
    vnode.forEach((v) => {
      patch(v, container, parentComponent);
    });
  }

  /**
   * @description 分为 mount挂载 与 update更新
   * */
  function processComponent(vnode: any, container: any, parentComponent) {
    mountComponent(vnode, container, parentComponent);
  }

  /**
   * @description 创建组件实例，然后进行初始化与渲染
   * */
  function mountComponent(vnode: any, container, parentComponent) {
    // 根据 vnode 创建组件实例
    const instance = createComponentInstance(vnode, parentComponent);

    // setup 组件实例
    setupComponent(instance);
    setupRenderEffect(instance, container);
  }

  /**
   * @description 调用render方法，并patch子节点
   *
   * */
  function setupRenderEffect(instance, container) {
    const subTree = instance.render.call(instance.proxy);

    // subTree 可能是 Component 类型也可能是 Element 类型
    // 调用 patch 去处理 subTree
    // Element 类型则直接挂载
    patch(subTree, container, instance);

    // patch 完毕后，将 el 再次赋给组件实例
    instance.vnode.el = subTree.el;
  }

  return {
    createApp: createAppAPI(render),
  };
}
