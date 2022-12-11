import { isObject } from "@mini-vue/shared";
import { createDep } from "./dep";
import { trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

export class RefImpl {
  private _rawValue: any;
  private _value: any;
  public dep;

  constructor(value) {
    this._rawValue = value;
    // 看看value 是不是一个对象，如果是一个对象的话
    // 那么需要用 reactive 包裹一下
    this._value = convert(value);

    this.dep = createDep();
  }

  get value() {
    // 收集依赖
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    // 当新的值不等于老的值的话，
    // 那么才需要触发依赖
    // if (hasChanged(newValue, this._rawValue)) {
    //   // 更新值
    //   this._value = convert(newValue);
    //   this._rawValue = newValue;
    //   // 触发依赖
    //   triggerRefValue(this);
    // }
    if(newValue !== this._value){
      this._value = newValue;
      triggerRefValue(this);
    }
  }

  get __v_isRef(){
    return true
  }
  set __v_isRef(_a){
  }
}

function convert(val){
  return isObject(val) ? reactive(val) : val
}
export function ref(raw){
  return new RefImpl(raw)
}



// 这个函数的目的是
// 帮助解构 ref
// 比如在 template 中使用 ref 的时候，直接使用就可以了
// 例如： const count = ref(0) -> 在 template 中使用的话 可以直接 count
// 解决方案就是通过 proxy 来对 ref 做处理

// const shallowUnwrapHandlers = {
//   get(target, key, receiver) {
//     // 如果里面是一个 ref 类型的话，那么就返回 .value
//     // 如果不是的话，那么直接返回value 就可以了
//     return unRef(Reflect.get(target, key, receiver));
//   },
//   set(target, key, value, receiver) {
//     const oldValue = target[key];
//     if (isRef(oldValue) && !isRef(value)) {
//       return (target[key].value = value);
//     } else {
//       return Reflect.set(target, key, value, receiver);
//     }
//   },
// };

// // 这里没有处理 objectWithRefs 是 reactive 类型的时候
// // TODO reactive 里面如果有 ref 类型的 key 的话， 那么也是不需要调用 ref.value 的
// // （but 这个逻辑在 reactive 里面没有实现）
// export function proxyRefs(objectWithRefs) {
//   return new Proxy(objectWithRefs, shallowUnwrapHandlers);
// }

/**
 *  @description: 代理reactivity，直接返回值而不是 .value 
 * */ 
export const proxyRefs = (objectWithRefs) => {
  return new Proxy(objectWithRefs, {
    get(target, key){
      return unRef(Reflect.get(target, key))
    },
    set(target, key, newVal){
      const oldVal = target[key];
      if(isRef(oldVal) && !isRef(newVal)){
        oldVal.value = newVal
        return true;
      }else {
        return Reflect.set(target, key, newVal); 
      }
    }
  })
} 

export const isRef = (value) => {
  return !!value.__v_isRef
}

export const unRef = (ref) => {
  return isRef(ref) ? ref.value : ref
}
function trackRefValue(refRaw: RefImpl){
  trackEffects(refRaw.dep)
}



function triggerRefValue(refRaw){
  triggerEffects(refRaw.dep)
}