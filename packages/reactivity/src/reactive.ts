/**
 * reactive 模块
 * */
import { isObject } from "@vue/shared";
import { baseHandler,ReactiveFlags } from "./baseHandler";

// reactive函数要做的事 => 把传入的对象变成响应式
// 1. 判断传入的是否是对象
// 2. 判断这个对象是否已经是响应式了
// 3. 判断是否有缓存
// 4.使用proxy代理

const reactiveMap=new WeakMap() // 用来存储缓存，代理后的结果
export function reactive(target) {
  // 判断 reactive包裹的对象是否是对象，proxy只支持对象
  if (!isObject(target)) {
    return target;
  }
  // 如果有这个属性，表示已经是响应式的数据了
  if(target[ReactiveFlags.IS_REACTIVE]){
    return target
  }
  // 判断是否有缓存
  if(reactiveMap.get(target)){
    return reactiveMap.get(target)
  }
  // 使用proxy代理，返回的是代理后的对象，baseHandler里面是get、set方法
  const proxy = new Proxy(target, baseHandler);
  reactiveMap.set(target,proxy) // 代理完成后缓存
  return proxy;
}
