import { effect, stop } from "../src/effect"
import { reactive } from "../src/reactive"

describe('effect', () => {
    it('reactivity', () => {
      const user = reactive({
        age: 10
      })

      let age
      effect(() => {
        age =  user.age + 1
      })

      expect(age).toBe(11)
      user.age++
      user.age++
      expect(age).toBe(13)
    })

    
    it('return run', () => {
      let age = 1
      const runner = effect(() => {
        age++
        return 'run cb'
      })
      expect(age).toBe(2)
      const r = runner()
      expect(age).toBe(3)
      expect(r).toBe('run cb')
    })

    // scheduler 
    it('scheduler', () => {
      let dummy 
      let run
      const obj = reactive({ foo: 1})
      const scheduler = vi.fn(() => {
        run = runner
      })
      const runner = effect(() => {
        dummy = obj.foo
      }, { scheduler })

      // 
      expect(scheduler).not.toHaveBeenCalled()
      expect(dummy).toBe(1)

      // 响应式数据变化可能并不会立刻执行effect，如果scheduler存在需要 scheduler 执行后，才会变化
      obj.foo++
      expect(scheduler).toBeCalledTimes(1)
      expect(dummy).toBe(1)

      run()
      
      obj.foo++
      expect(dummy).toBe(2)

      run()
      expect(dummy).toBe(3)
    })


    it('stop', () => {
      let dummy 
      const obj = reactive({ foo: 1})
      const runner = effect(() => {
        dummy = obj.foo
      })
      obj.foo = 2
      expect(dummy).toBe(2)
      stop(runner)
      obj.foo = 3
      expect(dummy).toBe(2)

      runner()
      expect(dummy).toBe(3)
    })

    it('onStop', () => {
      let dummy 
      const obj = reactive({ foo: 1})
      const onStop = vi.fn()
      const runner = effect(() => {
        dummy = obj.foo
      }, {
        onStop
      })

      stop(runner)
      expect(onStop).toHaveBeenCalled()
      expect(onStop).toBeCalledTimes(1)
    })
})