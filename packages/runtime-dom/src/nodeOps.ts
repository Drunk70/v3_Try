// 对节点元素的增删改查
export const nodeOps = {
  // el目标元素，parent插入哪个元素，anchor插在哪个元素前
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor); // 当anchor为空的时候==appendchild
  },
  remove(el) {
    // 获取要删除节点的父级节点
    const parent = el.parentNode;
    if (parent) {
      // 有父节点才能调用父节点的删除方法
      parent.removeChild(el);
    }
  },
  // 给文本节点设置内容
  setText(el, text) {
    el.textContent = text;
  },
  // 创建元素
  createElement(type) {
    return document.createElement(type);
  },
  // 创建文本节点
  createTextNode(text) {
    return document.createTextNode(text);
  },
    // 获取父节点
  parentNode(child) {
    return child.parentNode;
  },
  nextSilbling (child) { // 获取兄弟元素
    return child.nextSilbling
  },
  setElementText (element, text) { // 给元素节点设置内容 innerHTML
    element.textContent = text
  }
};
