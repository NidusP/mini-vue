import { h } from '@mini-vue/runtime-core';

export default {
  name: 'RunTimeChild',
  // 由于还没有实现模板编译的功能 因此先用 render 函数来替代
  render() {
    return h(
      "span",
      {},
      `RunTimeChild: ${this.data}`
    );
  },
  setup(props: any) {
    // Composition API
    console.log(props, 'props props')
    return {
      msg: "plasticine-mini-vue",
    };
  },
}