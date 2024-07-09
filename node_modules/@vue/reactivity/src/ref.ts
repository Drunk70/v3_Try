import { isObject } from "@vue/shared";
import { reactive } from "./reactive";
import { trackEffects, triggerEffects } from "./effect";
// 把传入的数据变成响应式
export function ref(value) {
  return new RefImpl(value);
}
// 直接建一个类
class RefImpl {
  public _v_isRef = true; // 增加ref标识
  public _value; //保存ref的值
  public dep;
  constructor(public rawValue) {
    // 传入的值可能是个对象
    this._value = toReactive(rawValue);
  }
  get value() {
    // 给这个值的value做响应式处理
    // 再取值之前需要做依赖收集，和reactive一样
    trackEffects(this.dep || (this.dep = new Set()));
    return this._value; // 去拿这个值的时候，返回的其实是value的数据
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      // 判断新值和老值是否相同，如果不同，还是先判断是否是对象
      this._value = toReactive(newValue);
      this.rawValue = newValue;
    }
    // 数据更新触发页面更新
    triggerEffects(this.dep);
  }
}
// 判断传入的是否是对象函数
export function toReactive(value) {
  // 如果是对象，就先用reactive处理
  return isObject(value) ? reactive(value) : value;
}

// toRef 是基于响应式对象reactive 上的属性创建一个对应的 ref，与其源属性保持同步：改变源属性的值将更新 ref 的值，反之亦然
export function toRef(object, key) {
    // object 响应式对象，key：哪一个属性
    return new ObjectRefImpl(object,key)
}
class ObjectRefImpl{
    public _v_isRef=true
    constructor(public object,public key){
    }   
    get value(){    // 返回的value 也就是这个响应式对象的这个属性值
        return this.object[this.key]
    }
    set value(newValue){    // 改值的时候，也就是其实改变的是 这个响应式对象的 这个属性值
        this.object[this.key]=newValue  // 因为改响应式对象的属性值会触发 判断新值老值是否相等，所有这里不用管
    }
}

// toRefs 将一个响应式对象转换为一个普通对象，
//这个普通对象的每个属性都是指向源对象相应属性的 ref。每个单独的 ref 都是使用 toRef() 创建的
export function toRefs(object){
    // 1.先创建一个用来返回的空对象
    let res={}
    // 2.循环这个对象，把每一个属性都用toRef处理
    for (let key in object) {
        res[key]=toRef(object,key)
    }
    // 3. 返回对象
    return res
}
export function proxyRefs(objectWithRef){
    return new Proxy(objectWithRef,{
      get(target,key,receiver){
        let res=Reflect.get(target,key,receiver)
        return res._v_isRef?res.value:res // 如果是ref，就直接返回里面的value
      },
      set(target,key,value,receiver){
        if(target[key]._v_isRef){ //如果是ref。就是给它上面的value设置
          target[key].value=value
          return true
        }
        return Reflect.set(target,key,value,receiver)
      }
    })
}