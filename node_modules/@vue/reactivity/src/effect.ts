// activeEffect也就是现在是在哪个effect下面处理，第一此肯定是没有上级，默认undefined
export let activeEffect = undefined;
export function effect(fn, options = {} as any) {
  // 1. 根据传入的fn，创建出一个响应的 effect
  const _effect = new ReactiveEffect(fn, options.scheduler);
  // 这个响应的effect会在创建后立即执行一次
  _effect.run();
  const runner = _effect.run.bind(_effect); //保证_effect的this指向
  runner.effect = _effect;
  return runner;
}
// 依赖收集
// 外层用一个map { object: { name: [effect, effect], age: [effect, effect] } }
const targetMap = new WeakMap();
export function track(target, key) {
  if (activeEffect) {    
    // 尝试获取这个对象之前已经收集过的依赖
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      // 如果之前没有，就用这个对象名存一个
      targetMap.set(target, (depsMap = new Map()));
    }
    // 查询之前收集的依赖当中有没有这个key的依赖
    let deps = depsMap.get(key);
    if (!deps) {
      //没有的话，就用key存一个
      depsMap.set(key, (deps = new Set()));
    }
    // 到这已经获取到了之前所有的key的依赖，把当前执行的这个effect放进去就是收集完成
    trackEffects(deps);
  }
}
// 添加当前的effect进依赖库 函数
export function trackEffects(deps) {
  // 判断当前key依赖中是否已经有执行的这个effect
  let shouldTrack = !deps.has(activeEffect);
  if (shouldTrack) {
    //没有才能添加
    deps.add(activeEffect); //添加进收集的依赖
    activeEffect.deps.push(deps); // 记录effect用了哪些属性
  }
}
// 触发页面更新
export function trigger(target, key, value) {
  // 获取当前更新的对象它所有的依赖
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    //不存在依赖就不需要更新页面
    return;
  }
  let effects = depsMap.get(key); // 获取当前属性的所有依赖
  // 现在得到了当前改变的属性所有有关的依赖，对这些依赖执行
  triggerEffects(effects);
}
// 执行依赖effect的函数
export function triggerEffects(effects) {
  if (effects) {
    effects = new Set(effects);
    // 对所有的依赖进行遍历调用
    effects.forEach((effect) => {
      // 必须要保证要执行的不是当前正在执行的这个effect，否则死循环
      if (effect !== activeEffect) {
        // 再判断当前的effect是否有自己的调度函数
        if (effect.scheduler) {
          effect.scheduler();
        } else {
          effect.run(); //重新执行effect
        }
      }
    });
  }
}

function cleanEffect(effect) {
  let deps = effect.deps;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect);
  }
  effect.deps.length = 0;
}
export class ReactiveEffect {
  // 是否是响应式的，默认是true
  public active = true;
  // 定义一个parent，存储父级，保证effect套effect都是正常的
  public parent = null;
  public deps = [];
  constructor(public fn, public scheduler?) {
    this.fn = fn;
  }
  run() {
    if (!this.active) {
      return this.fn();
    } else {
      try {
        //存储父级effect
        this.parent = activeEffect;
        // 把activeEffect改成当前，方便当前的下一级使用
        activeEffect = this;
        cleanEffect(this);
        return this.fn();
      } finally {
        // 执行完成后，改回这个在哪一级下执行的，当然是在当前的父级下执行的
        activeEffect = this.parent;
        this.parent = null;
      }
    }
  }
  stop () {
    if (this.active) {
      this.active = false
      cleanEffect(this)
    }
  }
}
