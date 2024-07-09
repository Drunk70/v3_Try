export function patchCalss(el,nextValue){
    if(nextValue==null){    // 如果传入的class是空，则移除自定义属性
        el.removeAttribute('class')
    }else{  //否则则更改类名
        el.className=nextValue  
    }
}