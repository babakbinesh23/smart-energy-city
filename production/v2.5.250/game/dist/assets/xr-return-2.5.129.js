// WebXR forbids supplying baseLayer and layers together. Updates commit at
// the next XR frame boundary, before the old iframe/GL context can be destroyed.
export function cityRenderState129(saved){
 const state={};for(const key of ['depthNear','depthFar'])if(Number.isFinite(saved?.[key]))state[key]=saved[key];
 if(saved?.layers?.length)state.layers=[...saved.layers];
 else if(saved?.baseLayer)state.baseLayer=saved.baseLayer;
 else throw Error('لایهٔ نمایش شهر برای بازگشت موجود نیست.');
 return state;
}
export function cityLayerActive129(session,saved){
 const actual=session.renderState;
 return saved.layers?.length?saved.layers.length===actual.layers?.length&&saved.layers.every((layer,i)=>layer===actual.layers[i]):actual.baseLayer===saved.baseLayer;
}
