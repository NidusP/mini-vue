// 创建dep存储 effect 副作用
export function createDep(effects?) {
  const dep = new Set(effects);
  return dep;
}
