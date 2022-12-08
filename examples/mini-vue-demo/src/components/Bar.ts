import { h, inject } from "mini-vue";

export default {
  name: "Bar",
  // 由于还没有实现模板编译的功能 因此先用 render 函数来替代
  render() {
    return h("div", {}, "bar" + this.appValue);
  },
  setup(props: any, { emit }: any) {
    const appValue = inject("appKey");
    return {
      appValue,
    };
  },
};
