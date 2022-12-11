import { ShapeFlags } from "@mini-vue/shared";
import { effect } from "@mini-vue/reactivity";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

/**
 *  自定义渲染函数
 *
 * */
export function createRenderer(options) {
  // 自定义渲染器de方法
  const {
    createElement: hostCreateElement,
    remove: hostRemove,
    setElementText: hostSetElementText,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options;
  /**
   * @description 将vnode转为真实的dom节点， 调用patch方法对不同类型的vnode作处理
   *
   */
  function render(vnode: any, container: any) {
    // 调用 patch
    patch(null, vnode, container);
  }

  /**
   * @description 能够处理 component 类型和 dom element 类型
   *
   * component 类型会递归调用 patch 继续处理
   * element 类型则会进行渲染
   *
   * @data n1 旧  n2 新
   */
  function patch(n1, n2, container, parentComponent = null) {
    if (!n2) return;
    const { type, shapeFlag } = n2;

    switch (type) {
      case Text:
        processText(n2, container);
        break;
      // 其中还有几个类型比如： static fragment comment
      case Fragment:
        processFragment(n2, container, parentComponent);
        break;
      default:
        // 这里就基于 shapeFlag 来处理
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 真实 DOM
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理 component 类型
          processComponent(n2, container, parentComponent);
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

  function processElement(n1: any, n2: any, container: any, parentComponent) {
    if (!n1) {
      // n1 不存在表示是首次挂载，应当执行初始化的逻辑
      mountElement(n2, container, parentComponent);
    } else {
      // n1 存在表示更新 调用 patchElement 执行更新的逻辑
      patchElement(n1, n2, container);
    }
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type));
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent);
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    }
    // props
    const { props } = vnode;

    for (const [key, value] of Object.entries(props)) {
      hostPatchProp(el, key, null, value);
    }
    hostInsert(el, container);
    // container.append(el);
  }

  /**
   * @description 对比 n1 和 n2 虚拟结点 找出不同的部分进行更新
   * @param n1 旧结点
   * @param n2 新结点
   * @param container 容器
   */
  function patchElement(n1, n2, container) {
    const el = (n2.el = n1.el);
    const oldProps = n1.props ?? {};
    const newProps = n2.props ?? {};
    // 找出 props 的不同
    patchProps(el, oldProps, newProps);

    // 找出 children 的不同  anchor, parentComponent
    patchChildren(n1, n2, el, container);
  }

  /**
   * @description 对比新旧结点的 props 进行更新
   * @param n1 旧结点
   * @param n2 新结点
   */
  function patchProps(el, oldProps, newProps) {
    for (const key in newProps) {
      const next = newProps[key];
      const prev = oldProps[key];

      if (next !== prev) {
        hostPatchProp(el, key, prev, next);
      }
    }
    // 遍历 oldProps 找出不存在于 newProps 中的 key 进行删除
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  }

  function patchChildren(n1, n2, container, parentComponent) {
    // n2 的 children 是 text 类型
    const prevShapeFlag = n1.shapeFlag;
    const { shapeFlag } = n2;
    const c2 = n2.children;
    console.log(n1, n2, shapeFlag & ShapeFlags.TEXT_CHILDREN, shapeFlag & ShapeFlags.ARRAY_CHILDREN,  'patchChildren patchChildren')

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新 children 是 text 类型
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 旧 children 是 array 类型 -- 从 array 变为 text

        // 卸载 array 的内容
        // unmountChildren(n1.children);
        for (let i = 0; i < n1.children.length; i++) {
          // 获取到 vnode 中的 el
          const el = n1.children[i].el;
          // 调用自定义渲染器中的 remove 逻辑
          hostRemove(el);
        }
        // 挂载 text 的内容
        hostSetElementText(container, c2);
      } else {
        console.log('hostSetElementText  旧 children 是 text 类型 -- 从 text 变为 text')
        // 旧 children 是 text 类型 -- 从 text 变为 text
        hostSetElementText(container, c2); // 直接修改文本内容即可
      }
    } else {
      // 新 children 是 array 类型
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 旧 children 是 text 类型 -- 从 text 变为 array

        // 清空旧结点中的文本内容
        hostSetElementText(container, "");

        // 挂载新结点中 array 的内容
        mountChildren(c2, container, parentComponent);
      }
    }
  }

  function mountChildren(vnode: any, container: any, parentComponent) {
    vnode.forEach((v) => {
      patch(null, v, container, parentComponent);
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
    // 副作用函数， reactivity值更新时，执行render函数触发patch
    effect(() => {
      console.log(
        "effect000000000000000000000000000000000000000000000000000",
        instance.isMounted
      );
      if (!instance.isMounted) {
        console.log("init");
        const subTree = (instance.subTree = instance.render.call(
          instance.proxy
        ));
        // subTree 可能是 Component 类型也可能是 Element 类型
        // 调用 patch 去处理 subTree
        // Element 类型则直接挂载
        patch(null, subTree, container, instance);

        // patch 完毕后，将 el 再次赋给组件实例
        instance.vnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        const { proxy, vnode } = instance;
        const subTree = instance.render.call(proxy); // 新 vnode
        const prevSubTree = instance.subTree; // 旧 vnode
        instance.subTree = subTree; // 新的 vnode 要更新到组件实例的 subTree 属性 作为下一更新的旧 vnode

        console.log("old vnode", prevSubTree);
        console.log("new vnode", subTree);

        patch(prevSubTree, subTree, container, instance);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
