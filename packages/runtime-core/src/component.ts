import { createVNode } from './vnode';

/**
 *  @description 创建组件实例对象
 * */ 
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
  };

  return component;
}

/**
 *  @description 初始化
 * */ 
export function setupComponent(instance) {
  // TODO
  // initProps()
  // initSlots()

  setupStatefulComponent(instance);
}

/**
 *  @description 处理setup选项中的state状态
 * 
 * */ 
function setupStatefulComponent(instance: any) {
  const Component = instance.type;
  const { setup } = Component;

  if (setup) {
    const setupResult = setup();

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
  if (typeof setupResult === 'object') {
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

export function h(type, props?, children?) {
  return createVNode(type, props, children);
}
