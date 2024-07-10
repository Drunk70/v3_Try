import { isString, ShapeFlags } from "@vue/shared";

// 判断是否是虚拟节点方法
export function isVnode(props) {
    return props?._v_isVnode; // 根据是否有_v_isVnode属性来判断是否是一个虚拟节点
  }
  // 创建虚拟dom节点的方法
export  function createVnode(type, props, children?) {
    //标记是什么类型，方便渲染的时候判断
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
    const vnode = {
      _v_isVnode: true,
      type,
      props,
      children,
      key: props?.key, //diff算法需要的key
      el: null, // 虚拟节点对应的真实节点是谁
      shapeFlag, //标识
    };
    if (children) {
      if (Array.isArray(children)) {
        // 是数组类型的儿子
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
      } else {
        // 否则就是文本类型的儿子
        children = String(children);
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
      }
    }
    return vnode;
  }