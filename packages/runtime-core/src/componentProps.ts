// 把原始的vnode中定义的props挂载到组件实例instance上，这样就可以直接通过组件实例去访问props，而不需要总是通过vnode去访问
export function initProps(instance, rawProps) {
  // 初始化props 
  instance.props = rawProps ?? {};
}