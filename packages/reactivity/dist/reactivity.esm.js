// packages/reactivity/src/effect.ts
var activeEffect = void 0;
function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let deps = depsMap.get(key);
    if (!deps) {
      depsMap.set(key, deps = /* @__PURE__ */ new Set());
    }
    trackEffects(deps);
  }
}
function trackEffects(deps) {
  let shouldTrack = !deps.has(activeEffect);
  if (shouldTrack) {
    deps.add(activeEffect);
    activeEffect.deps.push(deps);
  }
}
function trigger(target, key, value) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let effects = depsMap.get(key);
  triggerEffects(effects);
}
function triggerEffects(effects) {
  if (effects) {
    effects = new Set(effects);
    effects.forEach((effect2) => {
      if (effect2 !== activeEffect) {
        if (effect2.scheduler) {
          effect2.scheduler();
        } else {
          effect2.run();
        }
      }
    });
  }
}
function cleanEffect(effect2) {
  let deps = effect2.deps;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect2);
  }
  effect2.deps.length = 0;
}
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    this.parent = null;
    this.deps = [];
    this.fn = fn;
  }
  run() {
    if (!this.active) {
      return this.fn();
    } else {
      try {
        this.parent = activeEffect;
        activeEffect = this;
        cleanEffect(this);
        return this.fn();
      } finally {
        activeEffect = this.parent;
        this.parent = null;
      }
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      cleanEffect(this);
    }
  }
};

// packages/shared/src/index.ts
var isObject = (value) => {
  return typeof value === "object" && value !== null;
};
var isFunction = (value) => {
  return typeof value === "function";
};
var isArray = Array.isArray;

// packages/reactivity/src/baseHandler.ts
function isReactive(value) {
  return value && value[ReactiveFlags.IS_REACTIVE];
}
var ReactiveFlags = /* @__PURE__ */ ((ReactiveFlags2) => {
  ReactiveFlags2["IS_REACTIVE"] = "__v_isReactive";
  return ReactiveFlags2;
})(ReactiveFlags || {});
var baseHandler = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    track(target, key);
    let res = Reflect.get(target, key, receiver);
    if (isObject(res)) {
      return reactive(res);
    }
    return res;
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    let res = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value);
      return res;
    }
    return res;
  }
};

// packages/reactivity/src/reactive.ts
var reactiveMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  if (reactiveMap.get(target)) {
    return reactiveMap.get(target);
  }
  const proxy = new Proxy(target, baseHandler);
  reactiveMap.set(target, proxy);
  return proxy;
}

// packages/reactivity/src/ref.ts
function ref(value) {
  return new RefImpl(value);
}
var RefImpl = class {
  constructor(rawValue) {
    this.rawValue = rawValue;
    this._v_isRef = true;
    this._value = toReactive(rawValue);
  }
  get value() {
    trackEffects(this.dep || (this.dep = /* @__PURE__ */ new Set()));
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this._value = toReactive(newValue);
      this.rawValue = newValue;
    }
    triggerEffects(this.dep);
  }
};
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}
var ObjectRefImpl = class {
  constructor(object, key) {
    this.object = object;
    this.key = key;
    this._v_isRef = true;
  }
  get value() {
    return this.object[this.key];
  }
  set value(newValue) {
    this.object[this.key] = newValue;
  }
};
function toRefs(object) {
  let res = {};
  for (let key in object) {
    res[key] = toRef(object, key);
  }
  return res;
}
function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key, receiver) {
      let res = Reflect.get(target, key, receiver);
      return res._v_isRef ? res.value : res;
    },
    set(target, key, value, receiver) {
      if (target[key]._v_isRef) {
        target[key].value = value;
        return true;
      }
      return Reflect.set(target, key, value, receiver);
    }
  });
}

// packages/reactivity/src/computed.ts
function computed(getterOrOptions) {
  let onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  const fn = () => console.log("\u8BE5computed\u662F\u53EA\u8BFB\u7684");
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = fn;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set || fn;
  }
  return new ComputedRefImpl(getter, setter);
}
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this.getter = getter;
    this.setter = setter;
    this._dirty = true;
    this.__v_isRef = true;
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        if (!this._dirty) {
          this._dirty = true;
          triggerEffects(this.deps);
        }
      }
    );
  }
  get value() {
    if (activeEffect) {
      trackEffects(this.deps || (this.deps = /* @__PURE__ */ new Set()));
      track(this, "value");
    }
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
};

// packages/reactivity/src/watch.ts
function watch(source, cb, options = {}) {
  return doWatch(source, cb, options);
}
function watchEffect(source, options = {}) {
  return doWatch(source, null, options);
}
function doWatch(source, cb, { deep, immediate }) {
  let get;
  if (isReactive(source)) {
    get = () => traverse(source, deep);
  } else if (isFunction(source)) {
    get = source;
  }
  let newValue;
  let oldValue;
  let clean;
  const onCleanUp = (fn) => {
    clean = fn;
  };
  let scheduler = () => {
    if (cb) {
      clean && clean();
      newValue = effect2.run();
      cb(newValue, oldValue, onCleanUp);
      oldValue = newValue;
    } else {
      effect2.run();
    }
  };
  const effect2 = new ReactiveEffect(get, scheduler);
  if (cb) {
    if (immediate) {
      scheduler();
    } else {
      oldValue = effect2.run();
    }
  } else {
    effect2.run();
  }
}
function traverse(source, deep, set = /* @__PURE__ */ new Set()) {
  if (set.has(source)) {
    return source;
  }
  set.add(source);
  for (const key in source) {
    if (deep) {
      traverse(source[key], deep, set);
    }
  }
  return source;
}
export {
  ReactiveEffect,
  activeEffect,
  computed,
  effect,
  proxyRefs,
  reactive,
  ref,
  toReactive,
  toRef,
  toRefs,
  track,
  trackEffects,
  trigger,
  triggerEffects,
  watch,
  watchEffect
};
//# sourceMappingURL=reactivity.esm.js.map
