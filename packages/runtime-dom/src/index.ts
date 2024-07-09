import {nodeOps} from './nodeOps'
import { patchProp} from './patchProps'
import {createRenderer} from '@vue/runtime-core'
const renderOptions={ ...nodeOps,patchProp}
export const render=(vnode,container)=>{
    return createRenderer(renderOptions).render(vnode,container)
}
export {renderOptions}
export * from '@vue/runtime-core'