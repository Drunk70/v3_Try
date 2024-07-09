export function patchEvent(el,name,nextValue){
    const invokers=el._vei||(el._vei={})    //获取el上本来绑定的
    const exitingInvoker=invokers[name]     // 判断本来绑定了name事件了么
    const ename=name.slice(2).toLowerCase()    //拿到去除on的事件名，比较click
    if(nextValue&&exitingInvoker){  // 如果传了新值并且本来就有这个事件了
      return (exitingInvoker.value=nextValue)  //进行换绑
    }
    if(nextValue){  //如果本来没有这个事件，但是传了值，表示是新值的事件
        const invoker=createInvoker(nextValue)  
        invokers[name]=invoker  
       return el.addEventListener(ename,invoker)
    }
    if(exitingInvoker){ // 如果本来有事件，传的没有值
        el.removeEventListener(ename,exitingInvoker)
        invokers[name]=undefined
    }
}
function createInvoker(preValue){
    const invoker=(e)=>{invoker.value(e)}
    invoker.value=preValue
    return invoker
}