export function patchStyle(el,preValue,nextValue){
    let style=el.style
    // 遍历循环新值的每一项，把每一项赋值给style
    for (const key in nextValue) {
        style[key]=nextValue[key]
    }
    if(preValue){
        for (const key in preValue) {
            if(nextValue[key]==null){
                style[key]=null
            }
        }
    }
}