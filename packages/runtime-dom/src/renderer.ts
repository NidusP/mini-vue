import { createRenderer } from "@mini-vue/runtime-core";
import { isOn } from "@mini-vue/shared";

function createElement(type) {
  return document.createElement(type);
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

function insert(el, container) {
  container.append(el);
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
  patchProp,
  insert,
  remove,
  setElementText
});

export { createApp };
