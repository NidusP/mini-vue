import { isObject } from "@mini-vue/shared"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"


const set = createSetter()
const readonlySet = createSetter(true)
const get = createGetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createSetter(isReadonly = false){
  return function set(target, key, value){
    if(isReadonly) {
      // readonly 的响应式对象不可以修改值
      console.warn(
        `Set operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
      return true;
    }
    
    if(target[key] === value){
      return true
    }

    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

function createGetter(isReadonly = false, shallow = false){
  return function get(target, key){
    if(key === ReactiveFlags.IS_READONLY){
      return isReadonly
    }else if(key === ReactiveFlags.IS_REACTIVE){
      return !isReadonly
    }
    const res = Reflect.get(target, key)
    if(!isReadonly){
      track(target, key)
    }

    if(shallow){
      return res
    }
    if(isObject(res)){
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set: readonlySet,
}

export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set: readonlySet,
}