import {
  getCurrentInstance,
  h,
  renderSlots,
  inject,
  provide,
} from "mini-vue";
import Bar from "./Bar";

export default {
  name: "Foo",
  // 由于还没有实现模板编译的功能 因此先用 render 函数来替代
  render() {
    return h(
      "div",
      {
        onClick: this.emitEvent,
        style: "background-color: #ffafaf; margin-top: 10px",
      },
      [
        h(Bar),
        renderSlots(this.$slots, "top", { data: "scope data" }) ||
          h("p", {}, `"default top"`),
        h("div", {}, `RunTimeChild: ${this.data} -- ${this.appValue}`),
        renderSlots(this.$slots, "default") || h("p", {}, `"default content"`),
        renderSlots(this.$slots, "bottom") || h("p", {}, `"default bottom"`),
      ]
    );
  },
  setup(props: any, { emit }: any) {
    // Composition API
    const emitEvent = () => {
      console.log("start emitEvent");
      emit("event", "this is emitEvent");
    };
    const appValue = inject("appKey");
    provide("appKey", "fooValue");
    const ins = getCurrentInstance();
    console.log("Foo: ", ins, appValue);
    return {
      msg: "Foo-vue",
      emitEvent,
      appValue,
    };
  },
};
