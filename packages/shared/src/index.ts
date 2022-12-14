export * from "./shapeFlags";

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const isString = (val) => typeof val === "string";

export const isFunction = (val) => typeof val === "function";

export const isArray = (val) => Array.isArray(val);

export const extend = Object.assign;

export const isOn = (key: string) => /^on[A-Z]/.test(key);

export const hasOwn = (target: Record<string, any>, key: string) =>
  target ? Object.prototype.hasOwnProperty.call(target, key) : false;
