import { createRenderer } from "@mini-vue/runtime-core";
import { isOn } from "@mini-vue/shared";

function createElement(type) {
  return document.createElement(type);
}
function createText(text) {
  return document.createTextNode(text);
}
function setText(node, text) {
  node.nodeValue = text;
}

function patchProp(el, key, prevValue, nextValue) {
  if (isOn(key)) {
    el.addEventListener(
      key.slice(2).toLocaleLowerCase(),
      // (value as any).bind(vnode)
      nextValue
    );
  } else {
    el.setAttribute(key, nextValue);
  }
}

function insert(child, container, anchor?) {
  // container.append(el);
  console.log(anchor, 'anchor anchor')
  container.insertBefore(child, anchor || null);
}

function setElementText(el, text) {
  el.textContent = text;
}
/**
+  * @description 移除子元素
+  * @param child 子元素
+  */
function remove(child) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

const { createApp } = createRenderer({
  createElement,
  setText,
  createText,
  patchProp,
  insert,
  remove,
  setElementText,
});

export { createApp };
