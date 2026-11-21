// XR eye-buffer dimensions are set when the native layer is created. Canvas
// pixel ratio and texture filtering cannot substitute for geometric edge AA.
export function edgeScale142(state){return state?.edgeClarity===false?1:1.2;}
export function xrAntialias142(layer){return typeof layer?.antialias==='boolean'?layer.antialias:null;}
export function officeOutput142(state,stencil=false){return{canvasOptions:{antialias:true,depth:true,stencil:!!stencil,alpha:true,framebufferScaleFactor:edgeScale142(state)}};}
