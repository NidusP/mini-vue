import { extend } from "@mini-vue/shared";
import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  private _getter: any;
  // 控制是否需要重新计算
  private _dirty: boolean = true;
  private _value: any;
  private _effect: ReactiveEffect;

  constructor(getter) {
    this._getter = getter;
    // computed 收集的副作用不需要默认执行一次， 因此不使用 effect 方法
    this._effect = new ReactiveEffect(getter);
    extend(this._effect, {
      scheduler: () => {
        if(!this._dirty){
          this._dirty = true
        }
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
