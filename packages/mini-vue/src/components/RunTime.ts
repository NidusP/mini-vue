import { h } from '@mini-vue/runtime-core'

export default {
  // 由于还没有实现模板编译的功能 因此先用 render 函数来替代
  render() {
    return h(
      "div",
      {
        class: ["cyan", "success"],
      },
      [
        h("div", { class: "cyan" }, "hi "),
        h("p", { class: "darkcyan" }, "plasticine "),
        h("p", { class: "darkviolet" }, "mini-vue!"),
      ]
    );
  },
  setup() {
    // Composition API
    return {
      msg: "plasticine-mini-vue",
    };
  },
}