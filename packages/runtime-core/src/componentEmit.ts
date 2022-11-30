/** 
 *  @description setup(props, { emit }) emit方法，触发父级对应的事件 
 * */ 
export function emit(instance, event, data) {

  const { props } = instance

  const handlerKey = toHandlerKey(event);
  props[handlerKey]  && props[handlerKey](data)
}

function toHandlerKey(key: string){
  const name = key.replace(/-(\w)/g, (_, s) => {
    return s ? s.toUpperCase() : ''
  })
  return 'on' + capitalize(name)
}

function capitalize (key: string){
  return key.charAt(0).toUpperCase() + key.slice(1);
}