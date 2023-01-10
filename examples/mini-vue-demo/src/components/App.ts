import { h, createTextVNode, getCurrentInstance, provide, ref, nextTick } from "mini-vue";
import Foo from "./Foo";
import Diff from "./Diff";

(window as any).self = null;
export default {
  name: "App",
  // 由于还没有实现模板编译的功能 因此先用 render 函数来替代
  render() {
    console.log(
      "render*****************************************************************************************************************************************************************************************************************************************render"
    );
    (window as any).self = this;
    return h(
      "div",
      {
        class: [this.count % 2 ? "cyan" : "", "success"],
      },
      [
        h("button", { onClick: this.onClick }, "click_" + this.count),
        createTextVNode("Text Node Content"),
        h("div", { class: "cyan" }, "hi "),
        h("p", { class: "darkcyan" }, "plasticine "),
        h("p", { class: "darkviolet" }, `setupState msg: ${this.msg}`),
        h(Diff, { code: this.count }),
        // h(
        //   Foo,
        //   { data: 666666, onEvent: this.onEvent },
        //   {
        //     default: () => [
        //       h("div", { class: "slot-div" }, "this is div slot"),
        //       h("span", { class: "slot-span" }, "this is slot"),
        //     ],
        //   }
        // ),
        // h(
        //   Foo,
        //   { data: 666666, onEvent: this.onEvent },
        //   {
        //     top: ({ data }: any) =>
        //       h("div", { class: "slot-div" }, "this is div slot top " + data),
        //     bottom: () =>
        //       h("span", { class: "slot-span" }, "this is slot bottom"),
        //   }
        // ),
      ]
    );
  },
  setup() {
    // Composition API
    const onEvent = (...data: any[]) => {
      console.log("data onEvent", data);
    };
    provide("appKey", "appValue");
    const ins = getCurrentInstance();
    console.log("App: ", ins);

    const count = ref(0);

    const onClick = () => {
      for (let i = 0; i < 10; i++) {
        count.value++;
      }
      console.log(count.value, "click", ins.vnode.el);
      debugger;
      nextTick(() => {
        console.log(count.value, ins.vnode.el);
        debugger;
      });
    };
    return {
      msg: "App-vue",
      onEvent,
      onClick,
      count,
    };
  },
};
