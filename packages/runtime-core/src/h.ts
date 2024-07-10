// 1.一个参数，就一定是类型
// 2. 两个参数，第二个可能是属性，也可能是儿子
// 3. 第二个参数有（_v_isVnode)或者是个数组，就说明是儿子
// 4. 直接传递非对象的文本。就是儿子
// 5. 出现三个参数的时候，第二个只能是属性
// 6.超过三个参数，后面的都是儿子

import { isObject,} from "@vue/shared";
import { createVnode, isVnode } from "./createVnode";

export function h(type, propsOrChildren, children) {
  let l = arguments.length;
  if (l === 2) {
    // 有两种情况
    // 1. h(h1,虚拟节点|属性)
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      //是对象并且不是数组的时候，判断是否是虚拟节点
      if (isVnode(propsOrChildren)) {
        // 是数组类型的儿子
        return createVnode(type, null, [propsOrChildren]);
      } else {
        // 不是虚拟节点说明是属性
        return createVnode(type, propsOrChildren);
      }
    }
    // 2.儿子是文本|数组
   return createVnode(type, null, propsOrChildren);
  } else {
    if (l > 3) {
      // 第三个开始全是儿子
      children = Array.from(arguments).slice(2); //把第三个往后全放数组里
    }
    if (l == 3 && isVnode(children)){
        // 当有三个，并且第三个是虚拟节点
        children=[children]
    }
      //就只剩下单纯的l===1或者3了，直接调用createVnode
      return createVnode(type, propsOrChildren, children);
  }
}

