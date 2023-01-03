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
    createText: hostCreateText,
    setText: hostSetText,
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
  function patch(
    n1,
    n2,
    container = null,
    anchor = null,
    parentComponent = null
  ) {
    // 基于 n2 的类型来判断
    // 因为 n2 是新的 vnode
    const { type, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      // 其中还有几个类型比如： static fragment comment
      case Fragment:
        processFragment(n1, n2, container);
        break;
      default:
        // 这里就基于 shapeFlag 来处理
        if (shapeFlag & ShapeFlags.ELEMENT) {
          console.log("处理 element");
          processElement(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          console.log("处理 component");
          processComponent(n1, n2, container, parentComponent);
        }
    }
  }
  /**
   * @description 处理 Text
   * */
  function processText(n1, n2, container) {
    // const { children } = vnode;
    // const textNode = (vnode.el = document.createTextNode(children));
    // container.append(textNode);
    console.log("处理 Text 节点");
    if (n1 === null) {
      // n1 是 null 说明是 init 的阶段
      // 基于 createText 创建出 text 节点，然后使用 insert 添加到 el 内
      console.log("初始化 Text 类型的节点");
      hostInsert((n2.el = hostCreateText(n2.children as string)), container);
    } else {
      // update
      // 先对比一下 updated 之后的内容是否和之前的不一样
      // 在不一样的时候才需要 update text
      // 这里抽离出来的接口是 setText
      // 注意，这里一定要记得把 n1.el 赋值给 n2.el, 不然后续是找不到值的
      const el = (n2.el = n1.el!);
      if (n2.children !== n1.children) {
        console.log("更新 Text 类型的节点");
        hostSetText(el, n2.children as string);
      }
    }
  }

  /**
   * @description 处理 Fragment
   * */
  function processFragment(vnode: any, container: any, parentComponent) {
    mountChildren(vnode.children, container, parentComponent);
  }

  function processElement(n1, n2, container, anchor, parentComponent) {
    if (!n1) {
      // n1 不存在表示是首次挂载，应当执行初始化的逻辑
      // parentComponent
      mountElement(n2, container, anchor);
    } else {
      // n1 存在表示更新 调用 updateElement 执行更新的逻辑
      updateElement(n1, n2, container, anchor, parentComponent);
    }
  }

  function mountElement(vnode: any, container: any, anchor?) {
    const el = (vnode.el = hostCreateElement(vnode.type));
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // parentComponent
      mountChildren(children, el);
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    }
    // props
    const { props } = vnode;

    for (const [key, value] of Object.entries(props)) {
      hostPatchProp(el, key, null, value);
    }
    hostInsert(el, container, anchor);
    // container.append(el);
  }

  /**
   * @description 对比 n1 和 n2 虚拟节点 找出不同的部分进行更新
   * @param n1 旧节点
   * @param n2 新节点
   * @param container 容器
   */
  // function patchElement(n1, n2, container) {
  //   const el = (n2.el = n1.el);
  //   const oldProps = n1.props ?? {};
  //   const newProps = n2.props ?? {};
  //   // 找出 props 的不同
  //   patchProps(el, oldProps, newProps);

  //   // 找出 children 的不同  anchor, parentComponent
  //   patchChildren(n1, n2, el, container);
  // }
  function updateElement(n1, n2, container, anchor, parentComponent) {
    const oldProps = (n1 && n1.props) || {};
    const newProps = n2.props || {};
    // 应该更新 element
    console.log("应该更新 element");
    console.log("旧的 vnode", n1);
    console.log("新的 vnode", n2);

    // 需要把 el 挂载到新的 vnode
    const el = (n2.el = n1.el);

    // 对比 props
    patchProps(el, oldProps, newProps);

    // 对比 children
    patchChildren(n1, n2, el, anchor, parentComponent);
  }

  /**
   * @description 对比新旧节点的 props 进行更新
   * @param n1 旧节点
   * @param n2 新节点
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

  function patchChildren(n1, n2, container, anchor, parentComponent) {
    // n2 的 children 是 text 类型
    const prevShapeFlag = n1.shapeFlag;
    const { shapeFlag } = n2;
    const c1 = n1.children,
      c2 = n2.children;
    console.log(
      n1,
      n2,
      shapeFlag & ShapeFlags.TEXT_CHILDREN,
      shapeFlag & ShapeFlags.ARRAY_CHILDREN,
      "patchChildren patchChildren"
    );

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
        console.log(
          "hostSetElementText  旧 children 是 text 类型 -- 从 text 变为 text"
        );
        // 旧 children 是 text 类型 -- 从 text 变为 text
        hostSetElementText(container, c2); // 直接修改文本内容即可
      }
    } else {
      // 新 children 是 array 类型
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 旧 children 是 text 类型 -- 从 text 变为 array

        // 清空旧节点中的文本内容
        hostSetElementText(container, "");

        // 挂载新节点中 array 的内容
        mountChildren(c2, container, parentComponent);
      } else {
        // 旧 children 是 array 类型 -- 从 array 变为 array
        console.log("arr- arr");
        patchKeyedChildren(c1, c2, container, anchor, parentComponent);
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentAnchor, parentComponent) {
    const l2 = c2.length;
    let i = 0; // 从左端开始遍历新旧 children
    let e1 = c1.length - 1; // 指向旧 children 的末尾
    let e2 = l2 - 1; // 指向新 children 的末尾
    /**
     * @description 判断两个节点是否是相同节点
     * @param n1 vnode1
     * @param n2 vnode2
     * @returns 节点是否是同一个节点
     */
    const isSameVNodeType = (n1, n2) => {
      return n1.type === n2.type && n1.key === n2.key;
    };

    // 左端对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVNodeType(n1, n2)) {
        // 新旧节点是同一个节点 -- 递归处理它们的 children 看看是否有变化
        patch(n1, n2, container, null, parentComponent);
      } else {
        // 遇到不相同的节点 -- 左端对比结束
        break;
      }

      i++;
    }

    // 右端对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent);
      } else {
        // 不同节点，右端对比结束
        break;
      }

      e1--;
      e2--;
    }

    if (i > e1 && i <= e2) {
      // 如果是这种情况的话就说明 e2 也就是新节点的数量大于旧节点的数量
      // 也就是说新增了 vnode
      // 应该循环 c2
      // 锚点的计算：新的节点有可能需要添加到尾部，也可能添加到头部，所以需要指定添加的问题
      // 要添加的位置是当前的位置(e2 开始)+1
      // 因为对于往左侧添加的话，应该获取到 c2 的第一个元素
      // 所以我们需要从 e2 + 1 取到锚点的位置
      const nextPos = e2 + 1;
      const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
      while (i <= e2) {
        console.log(`需要新创建一个 vnode: ${c2[i].key}`);
        patch(null, c2[i], container, anchor, parentComponent);
        i++;
      }
    } else if (i > e2 && i <= e1) {
      // 这种情况的话说明新节点的数量是小于旧节点的数量的
      // 那么我们就需要把多余的
      while (i <= e1) {
        console.log(`需要删除当前的 vnode: ${c1[i].key}`);
        hostRemove(c1[i].el);
        i++;
      }
    }

    console.log(`i: ${i}, e1: ${e1}, e2: ${e2}`);
  }

  function mountChildren(vnode: any, container: any, parentComponent?) {
    vnode.forEach((v) => {
      console.log("mountChildren:", v, container, parentComponent);
      patch(null, v, container, null, parentComponent);
    });
  }
  // function mountChildren(children, container) {
  //   children.forEach((VNodeChild) => {
  //     // todo
  //     // 这里应该需要处理一下 vnodeChild
  //     // 因为有可能不是 vnode 类型
  //     console.log("mountChildren:", VNodeChild);
  //     patch(null, VNodeChild, container);
  //   });
  // }

  /**
   * @description 分为 mount挂载 与 update更新
   * */
  function processComponent(n1, n2, container, parentComponent) {
    // 如果 n1 没有值的话，那么就是 mount
    if (!n1) {
      // 初始化 component
      mountComponent(n2, container, parentComponent);
    } else {
      // updateComponent(n1, n2, container);
    }
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
        patch(null, subTree, container, null, instance);

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

        patch(prevSubTree, subTree, container, null, instance);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
