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
export default {
  name: "Diff",
  setup(props) {
    const toggleChildrenCase1 = ref(true);
    window.toggleChildrenCase1 = toggleChildrenCase1;
    console.log(props, 'this.count')
    return {
      toggleChildrenCase1,

    };
  },
  render() {
    // return h("div", {}, [h(Case1, { data: this.toggleChildrenCase1 })]);
    const bool = !!(this.$props.code % 2)
    console.log(this.$props.code, bool, 'this.count')
    return h(
      'p',
      {},
      `here is child, I receive a message from App: ${this.$props.code}`
    );
    // return bool
    //   ? h("div", {}, prevChildrenCase3)
    //   : h("div", {}, nextChildrenCase3);
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


const prevChildrenCase3 = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
];

const nextChildrenCase3 = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'E' }, 'new E'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'C' }, 'new C'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
];