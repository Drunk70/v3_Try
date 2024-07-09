/***
 * =》 完成proxy里的get和set
 *     在get的时候会 收集依赖
 *     在set的时候会 触发更新
 **/
import { isObject } from "@vue/shared";
import { reactive } from "./reactive";
import { track, trigger } from "./effect";

export function isReactive(value) {
  return value && value[ReactiveFlags.IS_REACTIVE];
}

// 判断是否是响应式
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}
export const baseHandler = {
  // target 表示对象，key 表示对象里的哪一个属性，receiver表示代理的这个proxy对象
  get(target, key, receiver) {
    // 如果访问的属性等于这个，表示已经是响应式数据了，直接返回
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // 这里就要进行依赖收集了
    track(target, key);
    // Reflect 作用是修改代码执行时的行为，保证正确的this指向
    let res = Reflect.get(target, key, receiver);
    // 触发递归，保证多层对象每一个层都是响应式
    if (isObject(res)) {
      return reactive(res);
    }
    return res;
  },
  // value表示设置的值
  set(target, key, value, receiver) {
    let oldValue = target[key];
    // 对比新值和老值不同的时候，才会触发更新
    let res = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      // 数据改变了，也要触发页面更新
      trigger(target, key, value);
      return res;
    }
    return res;
  },
};
