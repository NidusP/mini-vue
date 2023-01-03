import { h, ref } from "mini-vue";

// ==================== Case2: 左端新增 ====================
const prevChildrenCase2 = [
  h("p", { key: "C" }, "C"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "E" }, "E"),
];

const nextChildrenCase2 = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "E" }, "E"),
];
export const ArrayToArrayCase1 = {
  name: "ArrayToArrayCase1",
  setup() {
    const toggleChildrenCase1 = ref(true);
    window.toggleChildrenCase1 = toggleChildrenCase1;

    return {
      toggleChildrenCase1,
    };
  },
  render() {
    // return h("div", {}, [h(Case1, { data: this.toggleChildrenCase1 })]);
    return this.toggleChildrenCase1
      ? h("div", {}, nextChildrenCase2)
      : h("div", {}, prevChildrenCase2);
  },
};

// ==================== Case1: 右端新增 ====================
const prevChildrenCase1 = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
];

const nextChildrenCase1 = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "E" }, "E"),
];
const Case1 = {
  setup(props) {
    return {};
  },
  render() {
    console.log(
      this.$props.data,
      "this.datathis.datathis.datathis.datathis.datathis.datathis.datathis.datathis.datathis.datathis.datathis.data"
    );
    return this.data
      ? h("div", {}, prevChildrenCase1)
      : h("div", {}, nextChildrenCase1);
  },
};
