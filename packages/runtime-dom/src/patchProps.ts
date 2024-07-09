import { patchAttr } from './modules/patchAttr'
import {patchCalss} from './modules/patchCalss'
import { patchEvent } from './modules/patchEvent'
import { patchStyle } from './modules/patchStyle'
// 对节点的属性操作
export const patchProp=(el,key,preValue,nextValue)=>{
    // el目标节点，key属性，preValue老值，nextValue新值
    if(key==='class'){  // 如果是传入的是class类名
        patchCalss(el,nextValue)
    }else if(key==='style'){
        patchStyle(el,preValue,nextValue)
    }else if(/on[^a-z]/.test(key)){
        patchEvent(el,key,nextValue)
    }else{      
        patchAttr(el,key,nextValue)
    }
}