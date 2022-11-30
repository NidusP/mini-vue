import { h } from "@mini-vue/runtime-core";
import RunTimeChild from "./RunTimeChild";

(window as any).self = null;
export default {
  name: "RunTime",
  // 由于还没有实现模板编译的功能 因此先用 render 函数来替代
  render() {
    (window as any).self = this;
    return h(
      "div",
      {
        class: ["cyan", "success"],
        onClick() {
          console.log("click...");
        },
        onDblclick() {
          console.log("onDblclick...", this, this.msg);
        },
      },
      [
        h("div", { class: "cyan" }, "hi "),
        h("p", { class: "darkcyan" }, "plasticine "),
        h("p", { class: "darkviolet" }, `setupState msg: ${this.msg}`),
        h(RunTimeChild, { data: 666666, onEvent: this.onEvent }, [
          h("div", { class: "slot-div" }, "this is div slot"),
          h("span", { class: "slot-span" }, "this is span slot"),
        ]),
      ]
    );
  },
  setup() {
    // Composition API
    const onEvent = (...data: any[]) => {
      console.log("data onEvent", data);
    };
    return {
      msg: "plasticine-mini-vue",
      onEvent,
    };
  },
};
