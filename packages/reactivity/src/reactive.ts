import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
  RAW = "__v_raw",
}

export const reactiveMap = new WeakMap();
export const readonlyMap = new WeakMap();
export const shallowReadonlyMap = new WeakMap();

function createReactiveObject(target, proxyMap, handlers){
  if(proxyMap.has(target)){
    return proxyMap.get(target)
  }

  const reactive = new Proxy(target, handlers)

  proxyMap.set(target, reactive)
  return reactive
}
export function reactive(raw){
  return createReactiveObject(raw, reactiveMap, mutableHandlers)
} 

export function readonly(obj){
  return createReactiveObject(obj, readonlyMap, readonlyHandlers)
}

export function shallowReadonly(obj){
  return createReactiveObject(obj, shallowReadonlyMap, shallowReadonlyHandlers)
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
