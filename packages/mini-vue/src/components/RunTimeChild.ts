import { h, renderSlots } from '@mini-vue/runtime-core';

export default {
  name: 'RunTimeChild',
  // 由于还没有实现模板编译的功能 因此先用 render 函数来替代
  render() {
    console.log(this.$slots, 'this.$slots this.$slots this.$slots')
    return h(
      "span",
      {
        onClick: this.emitEvent
      },
      [h('div', {}, `RunTimeChild: ${this.data}`), renderSlots(this.$slots || 'default content')]
    );
  },
  setup(props: any, { emit } : any) {
    // Composition API
    console.log(props, 'props props')
    const emitEvent = () => {
      console.log('start emitEvent')
      emit('event', 'this is emitEvent')
    }
    return {
      msg: "plasticine-mini-vue",
      emitEvent
    };
  },
}