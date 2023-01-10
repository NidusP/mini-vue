import { ShapeFlags } from "@mini-vue/shared";
import { effect } from "@mini-vue/reactivity";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { queueJob } from "./scheduler";

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
    // console.log(
    //   n1,
    //   n2,
    //   shapeFlag & ShapeFlags.TEXT_CHILDREN,
    //   shapeFlag & ShapeFlags.ARRAY_CHILDREN,
    //   "patchChildren patchChildren"
    // );

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

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentAnchor,
    parentComponent
  ) {
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
      // 那么我们就需要把多余的remove
      while (i <= e1) {
        console.log(`需要删除当前的 vnode: ${c1[i].key}`);
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 左右两边都比对完了，然后剩下的就是中间部位顺序变动的
      // 例如下面的情况
      // a,b,[c,d,e],f,g
      // a,b,[e,c,d],f,g

      let s1 = i;
      let s2 = i;
      // 构建map存储 新节点 下待对比的子节点
      const keyToNewIndexMap = new Map();
      let moved = false;
      let maxNewIndexSoFar = 0;
      // 先把 key 和 newIndex 绑定好，方便后续基于 key 找到 newIndex
      // 时间复杂度是 O(1)
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      // 需要处理新节点的数量
      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      // 初始化 从新的index映射为老的index
      // 创建数组的时候给定数组的长度，这个是性能最快的写法
      const newIndexToOldIndexMap = new Array(toBePatched);
      // 初始化为 0 , 后面处理的时候 如果发现是 0 的话，那么就说明新值在老的里面不存在
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      // 遍历老节点
      // 1. 需要找出老节点有，而新节点没有的 -> 需要把这个节点删除掉
      // 2. 新老节点都有的，—> 需要 patch
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        // 优化点
        // 如果老的节点大于新节点的数量的话，那么这里在处理老节点的时候就直接删除即可
        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }

        // 记录在新节点中的索引（可能不存在）
        let newIndex;
        if (prevChild.key != null) {
          // 这里就可以通过key快速的查找了， 看看在新的里面这个节点存在不存在
          // 时间复杂度O(1)
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          // 如果没key 的话，那么只能是遍历所有的新节点来确定当前节点存在不存在了
          // 时间复杂度O(n)
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        // 因为有可能 nextIndex 的值为0（0也是正常值）
        // 所以需要通过值是不是 undefined 或者 null 来判断
        if (newIndex === undefined) {
          // 当前节点的key 不存在于 newChildren 中，需要把当前节点给删除掉
          hostRemove(prevChild.el);
        } else {
          // 新老节点都存在
          console.log("新老节点都存在");
          // 把新节点的索引和老的节点的索引建立映射关系
          // i + 1 是因为 i 有可能是0 (0 的话会被认为新节点在老的节点中不存在)
          newIndexToOldIndexMap[newIndex - s2] = i + 1;

          // 来确定中间的节点是不是需要移动
          // 新的 newIndex 如果一直是升序的话，那么就说明没有移动
          // 所以我们可以记录最后一个节点在新的里面的索引，然后看看是不是升序
          // 不是升序的话，我们就可以确定节点移动过了
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          // 先patch当前节点
          patch(prevChild, c2[newIndex], container, null, parentComponent);
          patched++;
        }
      }

      console.log(
        newIndexToOldIndexMap,
        "newIndexToOldIndexMap newIndexToOldIndexMap newIndexToOldIndexMap newIndexToOldIndexMap"
      );
      // 利用最长递增子序列来优化移动逻辑
      // 因为元素是升序的话，那么这些元素就是不需要移动的
      // 而我们就可以通过最长递增子序列来获取到升序的列表
      // 在移动的时候我们去对比这个列表，如果对比上的话，就说明当前元素不需要移动
      // 通过 moved 来进行优化，如果没有移动过的话 那么就不需要执行算法
      // getSequence 返回的是 newIndexToOldIndexMap 的索引值
      // 所以后面我们可以直接遍历索引值来处理，也就是直接使用 toBePatched 即可
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length - 1;
      console.log(
        increasingNewIndexSequence,
        "increasingNewIndexSequence increasingNewIndexSequence increasingNewIndexSequence increasingNewIndexSequence"
      );
      // 遍历新节点
      // 1. 需要找出老节点没有，而新节点有的 -> 需要把这个节点创建
      // 2. 最后需要移动一下位置，比如 [c,d,e] -> [e,c,d]

      // 这里倒循环是因为在 insert 的时候，需要保证锚点是处理完的节点（也就是已经确定位置了）
      // 因为 insert 逻辑是使用的 insertBefore()
      for (let i = toBePatched - 1; i >= 0; i--) {
        // 确定当前要处理的节点索引
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        // 锚点等于当前节点索引+1
        // 也就是当前节点的后面一个节点(又因为是倒遍历，所以锚点是位置确定的节点)
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;

        if (newIndexToOldIndexMap[i] === 0) {
          // 说明新节点在老的里面不存在
          // 需要创建
          patch(null, nextChild, container, anchor, parentComponent);
        } else if (moved) {
          // 需要移动
          // 1. j 已经没有了 说明剩下的都需要移动了
          // 2. 最长子序列里面的值和当前的值匹配不上， 说明当前元素需要移动
          if (j < 0 || increasingNewIndexSequence[j] !== i) {
            // 移动的话使用 insert 即可
            hostInsert(nextChild.el, container, anchor);
          } else {
            // 这里就是命中了  index 和 最长递增子序列的值
            // 所以可以移动指针了
            j--;
          }
        }
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
      updateComponent(n1, n2, container);
    }
  }

  /**
   * @description 创建组件实例，然后进行初始化与渲染
   * */
  function mountComponent(vnode: any, container, parentComponent) {
    // 根据 vnode 创建组件实例
    const instance = (vnode.component = createComponentInstance(
      vnode,
      parentComponent
    ));

    // setup 组件实例
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
  }

  /**
   * @description 组件更新
   * */
  function updateComponent(n1, n2, container) {
    // 更新组件实例引用
    const instance = (n2.component = n1.component);
    console.log("更新组件", n1, n2, instance);
    // 先看看这个组件是否应该更新
    if (shouldUpdateComponent(n1, n2)) {
      console.log(`组件需要更新: ${instance}`);
      // 那么 next 就是新的 vnode 了（也就是 n2）
      instance.next = n2;
      // 这里的 update 是在 setupRenderEffect 里面初始化的，update 函数除了当内部的响应式对象发生改变的时候会调用
      // 还可以直接主动的调用(这是属于 effect 的特性)
      // 调用 update 再次更新调用 patch 逻辑
      // 在update 中调用的 next 就变成了 n2了
      // ps：可以详细的看看 update 中 next 的应用
      // TODO 需要在 update 中处理支持 next 的逻辑
      instance.update();
    } else {
      console.log(`组件不需要更新: ${instance}`);
      // 不需要更新的话，那么只需要覆盖下面的属性即可
      n2.component = n1.component;
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  /**
   * @description 调用render方法，并patch子节点
   *
   * */
  function setupRenderEffect(instance, initialVNode, container) {
    function componentUpdateFn() {
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
        const { proxy, vnode, next } = instance;
        if (next) {
          // 问题是 next 和 vnode 的区别是什么
          next.el = vnode.el;
          updateComponentPreRender(instance, next);
        }

        const subTree = instance.render.call(proxy); // 新 vnode
        const prevSubTree = instance.subTree; // 旧 vnode
        instance.subTree = subTree; // 新的 vnode 要更新到组件实例的 subTree 属性 作为下一更新的旧 vnode

        console.log("old vnode", prevSubTree);
        console.log("new vnode", subTree);
        patch(prevSubTree, subTree, container, null, instance);
      }
    }
    // 副作用函数， reactivity值更新时，执行render函数触发patch
    instance.update = effect(componentUpdateFn, {
      scheduler(){
        // 异步更新
        queueJob(instance.update);
      }
    });
  }

  function updateComponentPreRender(instance, nextVNode) {
    // 更新 nextVNode 的组件实例
    // 现在 instance.vnode 是组件实例更新前的
    // 所以之前的 props 就是基于 instance.vnode.props 来获取
    // 接着需要更新 vnode ，方便下一次更新的时候获取到正确的值
    nextVNode.component = instance;
    // TODO 后面更新 props 的时候需要对比
    // const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;

    const { props } = nextVNode;
    console.log("更新组件的 props", props);
    instance.props = props;
    console.log("更新组件的 slots");
    // TODO 更新组件的 slots
    // 需要重置 vnode
  }
  return {
    createApp: createAppAPI(render),
  };
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
