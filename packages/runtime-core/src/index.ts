import { ShapeFlags } from "@vue/shared";
// 不关心api，可以跨平台
export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    pacthProp: hostPatchProp,
  } = renderOptions;
  const mountChildren = (children, container) => {
    for(let i=0;i<children.length;i++){
      patch(null,children[i],container) //调用挂载方法，把每个字节点挂上去
    }
  };
  // 挂载
  const mountElement = (vnode, container) => {
    const { type, children, props, shapeFlag } = vnode;
    let el = hostCreateElement(type); // 调用创建元素api
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    //拿h方法生成的vnode中的shapeFlags与ShapeFlags做&运算,判断标识
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);  // 挂载子节点
    }
    // 挂载el到app上
    hostInsert(el,container)
  };
  // 渲染
  const patch = (n1, n2, container) => {
    if (n1 === n2) {
      //两次相同无需渲染
      return;
    }
    //n1如果是null表明是第一次渲染
    if (n1 === null) {
      mountElement(n2, container); // 第一次渲染就直接把n2挂载上去
    }
  };
  const render = (vnode, container) => {
    // 可以console出来看看，vnode就是h方法生成的虚拟节点，container就是挂载点
    console.log(vnode, container);
    // 将虚拟节点变成真实节点渲染
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode; // 给新增一个属性，存储第一次渲染的属性
  };
  return {
    render,
  };
}
