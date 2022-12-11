import { extend } from "@mini-vue/shared"

const targetMap = new WeakMap();

export class ReactiveEffect {
  private _fn: any
  private active = true
  public deps = []
  public scheduler?: () => void
  public onStop?: () => void
  constructor(fn) {
    this._fn = fn
  }

  run(){
    activeEffect = this
    return this._fn()
  }
  stop(){
    // 防止重复调用stop
    if(this.active) {
      cleanupEffect(this)
      this.onStop && this.onStop()
      this.active = false
    }
  }
  
}

function cleanupEffect(effect){
  // 找到依赖这个 副作用 的响应式对象， 然后从响应式对象中删掉副作用
  effect.deps.forEach((dep:any) => {
    dep.delete(effect)
  })
}
let activeEffect

export function effect(fn, options:any = {}){
  const _effect = new ReactiveEffect(fn)
  extend(_effect, options)
  _effect.run();

  const runner:any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function track(target, key){
  let depsMap = targetMap.get(target)
  if(!depsMap){
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if(!dep){
    dep = new Set()
    depsMap.set(key, dep)
  }

  trackEffects(dep)
}

export function trackEffects(dep) {
  // 用 dep 来存放所有的 effect

  // TODO
  // 这里是一个优化点
  // 先看看这个依赖是不是已经收集了，
  // 已经收集的话，那么就不需要在收集一次了
  // 可能会影响 code path change 的情况
  // 需要每次都 cleanupEffect
  // shouldTrack = !dep.has(activeEffect!);
  if (activeEffect && !dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

export function trigger(target, key){
  const depMap = targetMap.get(target);
  if(!depMap) return
  
  const dep = depMap.get(key)

  triggerEffects(dep)
}


export function triggerEffects(dep) {
  for(let effect of dep){
    if(effect.scheduler) {
      effect.scheduler()
    }else {
      effect.run()
    }
  }
}

export function stop(runner: any){
  runner.effect.stop()
}
