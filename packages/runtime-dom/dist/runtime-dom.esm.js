var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  },
  remove(el) {
    const parent = el.parentNode;
    if (parent) {
      parent.removeChild(el);
    }
  },
  setText(el, text) {
    el.textContent = text;
  },
  createElement(type) {
    return document.createElement(type);
  },
  createTextNode(text) {
    return document.createTextNode(text);
  },
  parentNode(child) {
    return child.parentNode;
  },
  nextSilbling(child) {
    return child.nextSilbling;
  },
  setElementText(element, text) {
    element.textContent = text;
  }
};

// packages/runtime-dom/src/modules/patchAttr.ts
function patchAttr(el, key, nextValue) {
  if (nextValue == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, nextValue);
  }
}

// packages/runtime-dom/src/modules/patchCalss.ts
function patchCalss(el, nextValue) {
  if (nextValue == null) {
    el.removeAttribute("class");
  } else {
    el.className = nextValue;
  }
}

// packages/runtime-dom/src/modules/patchEvent.ts
function patchEvent(el, name, nextValue) {
  const invokers = el._vei || (el._vei = {});
  const exitingInvoker = invokers[name];
  const ename = name.slice(2).toLowerCase();
  if (nextValue && exitingInvoker) {
    return exitingInvoker.value = nextValue;
  }
  if (nextValue) {
    const invoker = createInvoker(nextValue);
    invokers[name] = invoker;
    return el.addEventListener(ename, invoker);
  }
  if (exitingInvoker) {
    el.removeEventListener(ename, exitingInvoker);
    invokers[name] = void 0;
  }
}
function createInvoker(preValue) {
  const invoker = (e) => {
    invoker.value(e);
  };
  invoker.value = preValue;
  return invoker;
}

// packages/runtime-dom/src/modules/patchStyle.ts
function patchStyle(el, preValue, nextValue) {
  let style = el.style;
  for (const key in nextValue) {
    style[key] = nextValue[key];
  }
  if (preValue) {
    for (const key in preValue) {
      if (nextValue[key] == null) {
        style[key] = null;
      }
    }
  }
}

// packages/runtime-dom/src/patchProps.ts
var patchProp = (el, key, preValue, nextValue) => {
  if (key === "class") {
    patchCalss(el, nextValue);
  } else if (key === "style") {
    patchStyle(el, preValue, nextValue);
  } else if (/on[^a-z]/.test(key)) {
    patchEvent(el, key, nextValue);
  } else {
    patchAttr(el, key, nextValue);
  }
};

// packages/shared/src/index.ts
var isArray = Array.isArray;

// packages/runtime-core/src/index.ts
function createRenderer(renderOptions2) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    pacthProp: hostPatchProp
  } = renderOptions2;
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container);
    }
  };
  const mountElement = (vnode, container) => {
    const { type, children, props, shapeFlag } = vnode;
    let el = hostCreateElement(type);
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (shapeFlag & 8 /* TEXT_CHILDREN */) {
      hostSetElementText(el, children);
    } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
      mountChildren(children, el);
    }
    hostInsert(el, container);
  };
  const patch = (n1, n2, container) => {
    if (n1 === n2) {
      return;
    }
    if (n1 === null) {
      mountElement(n2, container);
    }
  };
  const render2 = (vnode, container) => {
    console.log(vnode, container);
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  };
  return {
    render: render2
  };
}

// packages/runtime-dom/src/index.ts
var renderOptions = __spreadProps(__spreadValues({}, nodeOps), { patchProp });
var render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};
export {
  createRenderer,
  render,
  renderOptions
};
//# sourceMappingURL=runtime-dom.esm.js.map
