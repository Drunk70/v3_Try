import { isFunction } from "@vue/shared";
import { isReactive } from "./baseHandler";
import { ReactiveEffect } from "./effect";

// sourec 侦听的对象，cb回调函数
export function watch(source, cb, options = {} as any) {
  return doWatch(source, cb, options);
}

//  watchEffect(()=>{ console.log(state.name,state.age)}) 相当于
//   const runner= effect(()=>{
//     console.log(state.name,state.age)
//    }{
//      scheduler(){
//       runner()
//       }
//    })
export function watchEffect(source, options = {} as any) {
  return doWatch(source, null, options);
}
// ？确定下思路，目的：当source发生变化的时候，触发cb
//  1. 要创建一个effect，source改变的时候要触发它
//  2. 那肯定得引入 ReactiveEffect 来创建effect，要传入的参数fn是一个函数，函数内get所有的
//    对象、属性时都会和当前生成的effect产生关系，但是source是一个对象，怎么办？
//    目的：我们要让source所有的属性都和effect产生关系，那我们直接写一个函数循环source
//  3. cb回调函数有两个参数新值旧值，并且需要在source改变时触发，所以肯定得传 scheduler
function doWatch(source, cb, { deep, immediate }) {
  let get; // get必须得是个函数
  // 获得一个会触发source所有属性get的函数，用来当做 fn
  if (isReactive(source)) {
    // 判断传入的是否是响应式对象
    get = () => traverse(source, deep);
  } else if (isFunction(source)) {
    get = source;
  }
  let newValue;
  let oldValue;
  let clean;
  const onCleanUp = (fn) => {
    // 接收的是一个函数
    clean = fn; // 要做的就是保存传入的函数
  };
  // 创建一个source改变会触发的scheduler
  let scheduler = () => {
    // 这里就是侦听到改变之后想做的事情，有cb也就是cb，没用就是在执行一遍run(),cb有两个参数，新值旧值
    if (cb) {
     // 第一次值改变的时候，clean还没赋值，只到走到下面cb，才会传入函数，
     // 第二次值改变的时候，clean里还是上一次的函数，也就是每次会触发上一次传进来的函数
     // 也就是闭包，这样做可以在使用的时候，传入改变标识的函数，每次会在下一次执行
     // 只有最后一次标识是不同的，保证渲染最新的
      clean && clean();     
      newValue = effect.run(); // 新值就是返回的
      cb(newValue, oldValue, onCleanUp); // 调用cb   onCleanUp也要传回去让传参数
      oldValue = newValue; // 调用完后这次的新值就是旧值了
    } else {
      effect.run();
    }
  };
  const effect = new ReactiveEffect(get, scheduler);
  if (cb) {
    // 如果有回调函数
    if (immediate) {
      // 首先判断是否是立即执行
      scheduler(); // 是的话直接 调用一遍effect的scheduler
    } else {
      oldValue = effect.run(); // 默认执行一次
    }
  } else {
    // 没有回调函数表示是 watchEffect
    effect.run();
  }
}

// 循环source属性，根据deep确定循环层级，set反正一直递归
function traverse(source, deep, set = new Set()) {
  if (set.has(source)) {
    // 判断是否存入set，防止一直递归
    return source;
  }
  set.add(source); // 进入循环就先存储
  for (const key in source) {
    // 循环source每一项属性
    if (deep) {
      // 只有深度监听才监听每一个层级
      traverse(source[key], deep, set);
    }
  }
  return source;
}
