import { createRenderer } from "@mini-vue/runtime-core";
import { isOn } from "@mini-vue/shared";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, value) {
  if (isOn(key)) {
    el.addEventListener(
      key.slice(2).toLocaleLowerCase(),
      // (value as any).bind(vnode)
      value
    );
  } else {
    el.setAttribute(key, value);
  }
}

function insert(el, container) {
  container.append(el);
}

const { createApp } = createRenderer({
  createElement,
  patchProp,
  insert,
});

export { createApp };
