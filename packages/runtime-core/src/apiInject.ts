import { isFunction } from "@mini-vue/shared";
import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent?.provides;
    if (currentInstance.provides === parentProvides) {
      // 让当前组件实例的 provides 指向一个空对象 并且该空对象以父组件的 provides 为原型
      currentInstance.provides = currentInstance.provides = Object.create(parentProvides);
    }

    // currentInstance.provides = Object.create(currentInstance.parent.provides);
    currentInstance.provides[key] = value;
  }
}

export function inject(key, defaultValue?) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;

    if(key in parentProvides) return parentProvides[key];

    return isFunction(defaultValue) ? defaultValue() : defaultValue
  }
}
