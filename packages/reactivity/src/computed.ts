// 计算属性，不属于reactive，但是基于effect编译，所以放一起

import { isFunction } from "@vue/shared";
import { activeEffect, ReactiveEffect, track, trackEffects, triggerEffects } from "./effect";

export function computed(getterOrOptions) {
  // 计算属性默认是只读的，根据传入的getterOrOptions判断
  let onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  const fn = () => console.log("该computed是只读的");
  if (onlyGetter) {
    //判断是否传入的是一个函数
    getter = getterOrOptions;
    setter = fn;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set || fn;
  }
  return new ComputedRefImpl(getter, setter);
}
class ComputedRefImpl {
  public effect;
  public _dirty = true;
  public _value;
  public deps
  public __v_isRef=true
  constructor(public getter, public setter) {
    // 根据getter创建一个effect
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {       //scheduler，依赖的值发生变化后要触发渲染
        if (!this._dirty) {
            this._dirty=true
            triggerEffects(this.deps)
        }
      }
    );
  }
  get value() {
    if(activeEffect){   
        // 收集计算属性依赖
        trackEffects(this.deps||(this.deps=new Set))
        track(this,'value')
    }
    // 当获取value的时候触发
    if (this._dirty) {
      this._dirty = false;  
      this._value = this.effect.run();
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue)
  }
}
