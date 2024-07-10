import { ShapeFlags } from "@vue/shared";
import { isSaveVnode } from "./createVnode";
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
    patchProp: hostPatchProp,
  } = renderOptions;
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container); //调用挂载方法，把每个字节点挂上去
    }
  };
  // 挂载
  const mountElement = (vnode, container) => {
    const { type, children, props, shapeFlag } = vnode;
    // 创建元素的同时。让虚拟节点记住创造的的元素，也就是增加el属性
    let el = (vnode.el = hostCreateElement(type)); // 调用创建元素api
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    //拿h方法生成的vnode中的shapeFlags与ShapeFlags做&运算,判断标识
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el); // 挂载子节点
    }
    // 挂载el到app上
    hostInsert(el, container);
  };
  // 对元素进行渲染
  const processElement = (n1, n2, container) => {
    //n1如果是null表明是第一次渲染
    if (n1 === null) {
      mountElement(n2, container); // 第一次渲染就直接把n2挂载上去
    } else {
      //两次节点相同,对比两次差异
      patchElement(n1, n2, container);
    }
  };
  // 移除子节点
  const unmountChildren=(children)=>{
    for (let i = 0; i < children.length; i++) {
        let child=children[i]
        unmount(child)
    }
  }
  //对比儿子
  const patchChildren = (n1, n2, el) => {
    //儿子只会有三种情况，text,array,null
    const c1 = n1.children;
    const c2 = n2.children;
    // 拿到之前vnode上的标识，确定类型
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    // 1.新的是文本。老的是数组 ==》移除老的、
    // 2.新的是文本，老的是文本 ==》内容替换
    // 3.老的是数组，新的是数组 ==》 diff算法
    // 4.老的是数组，新的不是数组 == 移除老的
    // 5.老的是文本，新的是空
    // 6.老的是文本，新的是数组
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 如果新的是文本
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //老的是数组
        unmountChildren(c1)
      }
      if(c1!==c2){
        hostSetElementText(el,c2)
      }
    } else{
        //如果老的是数组
        if(prevShapeFlag&ShapeFlags.ARRAY_CHILDREN){    
            if(shapeFlag&ShapeFlags.ARRAY_CHILDREN){    //新的也是数组
                // diff算法
            }else{  //新的不是数组
                unmountChildren(el) // 移除老的
            }
        }else{
            if(prevShapeFlag&ShapeFlags.TEXT_CHILDREN){ //老的是文本,新的是空
                hostSetElementText(el,'')
            }
            if(shapeFlag&ShapeFlags.ARRAY_CHILDREN){    //老的是文本，新的是数组
                mountChildren(c2,el)
            }   
        }
    }
  };
  // 对比两次虚拟节点差异方法，更新老的n1dom就行了，复用
  const patchElement = (n1, n2, container) => {
    // 1.复用n1的dom，比如两次都是h1，只是内容变了
    let el = (n2.el = n1.el);
    // 2.比较元素和属性的子节点
    let oldProps = n1.props || {};
    let newProps = n2.props || {};
    // hostPatchProp只针对某一个属性，对比属性，更改
    patchProps(oldProps, newProps, el);
    //对比儿子
    patchChildren(n1, n2, el);
  };
  const patchProps = (oldProps, newProps, el) => {
    // 1.新的属性要全部生效
    for (const key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key]); // 调用api，遍历更改属性
    }
    // 2. 老的有，新的没有要删除
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps, null); // 调用api改成空
      }
    }
  };
  // 移除元素方法
  const unmount = (vnode) => {
    hostRemove(vnode.el); // 在虚拟节点上获取上次渲染的元素，调用api移除
  };
  // 渲染
  const patch = (n1, n2, container) => {
    if (n1 === n2) {
      //两次完全相同无需渲染
      return;
    }
    if (n1 && !isSaveVnode(n1, n2)) {
      // 如果n1存在，并且判断了n1、n2属性和key都相同
      // 如果不是相同节点,就直接删掉老节点
      unmount(n1);
      // 删掉老节点n1后还得渲染新节点n2，只需要把n1清空，就会进入下一步渲染n2
      n1 = null;
    }
    // 对元素进行渲染
    processElement(n1, n2, container);
  };
  const render = (vnode, container) => {
    // console出来看看，vnode就是h方法生成的虚拟节点，container就是挂载点
    console.log(vnode, container);
    // 如果传入的虚拟节点是空，并且之前渲染过（有_v_isVnode属性）表示要移除
    if (vnode == null || container._v_isVnode) {
      unmount(container._vnode);
    }
    // 将虚拟节点变成真实节点渲染
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode; // 给新增一个属性，存储第一次渲染的属性
  };
  return {
    render,
  };
}
