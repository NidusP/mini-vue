import { hasOwn } from "@mini-vue/shared";

/**
 * @description 定义映射，用于处理其他的 this.$** 属性
 * */ 
const publicPropertiesMap = {
  $el:  (i) => i.vnode.el,
  $data: (i) => null,
  $slots: (i) => i.slots,
  $props: (i) => i.props
} as const;

/**
 * @description 统一的代理方法，用于在render方法中通过this获取组件中的其他属性或数据
 * 
 * */ 
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const publicGetter = publicPropertiesMap[key];

    if(publicGetter) return publicGetter(instance)

    const { setupState, props } = instance
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if(hasOwn(props, key)){
      return props[key];
    }
  },
};