import { isObject } from "@mini-vue/shared";
import { shallowReadonly } from "@mini-vue/reactivity";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { createVNode } from "./vnode";
import { emit } from "./componentEmit";
import { initSlots } from "./componentSlots";

/**
 *  @description 创建组件实例对象
 * */
export function createComponentInstance(vnode, parent) {
  console.log('createComponentInstance -- parent: ', parent);
  const component = {
    vnode,
    type: vnode.type,
    ctx: {}, // context 对象
    props: {},
    slots: {},
    emit,
    // 取父级的provides
    provides: parent ? parent.provides : {},
    parent
  };

  // 在 prod 坏境下的 ctx 只是下面简单的结构；dev 环境下会更复杂
  component.ctx = {
    _: component,
  };
  return component;
}

/**
 *  @description 初始化
 * */
export function setupComponent(instance) {
  // TODO
  initProps(instance, instance.vnode.props);
  // children即为插槽
  initSlots(instance, instance.vnode.children);

  setupStatefulComponent(instance);
}

/**
 *  @description 处理setup选项中的state状态
 *
 * */
function setupStatefulComponent(instance: any) {
  const Component = instance.type;
  const { setup } = Component;

  // ctx -- context
  // 组件实例render函数的上下文，提供 this. 访问 setupState 或 option api
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);

  if (setup) {
    // setup期间赋值
    setCurrentInstance(instance);
    // (props, { emit })
    // instance.emit.bind(null, instance)
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: emit.bind(null, instance),
    });
    setCurrentInstance(null);
    // setupResult 可能是 function 也可能是 object
    // - function 则将其作为组件的 render 函数
    // - object 则注入到组件的上下文中
    handleSetupResult(instance, setupResult);
  }
}

/**
 *  @description 处理setup函数返回的结果，对象或者function（即渲染）
 *
 * */
function handleSetupResult(instance, setupResult: any) {
  // TODO 处理 setupResult 是 function 的情况
  if (isObject(setupResult)) {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}

/**
 *  @description 在处理完setupResult后，还要组件的render函数赋给组件实例作为它的render函数（如果有的话）
 *
 * */
function finishComponentSetup(instance: any) {
  const Component = instance.type;

  instance.render = Component.render;
}

// h方法， 用于创建虚拟节点
export function h(type, props?, children?) {
  return createVNode(type, props, children);
}

let currentInstance = null;

function setCurrentInstance(instance) {
  currentInstance = instance;
}
export function getCurrentInstance() {
  return currentInstance;
}
