import {isMobile235} from './mobile-scope-2.5.235.js';
// A shadow-enabled shader can remain cached after a live preset change.
// Refresh the current city materials after the existing quality/material
// setters have completed, so mobile Low/Medium cannot use disposed shadow maps.
export function installMobileQuality245(game){
 const select=game.setQuality;
 game.setQuality=function(...args){
  const mobile=isMobile235(this),shadows=this.renderer.webgl.shadowMap.enabled;
  const result=select.apply(this,args);
  if(mobile&&shadows!==this.renderer.webgl.shadowMap.enabled){
   const materials=new Set();
   this.scene.traverse(node=>{if(!node.material)return;for(const material of Array.isArray(node.material)?node.material:[node.material])if(material)materials.add(material);});
   for(const material of materials)material.needsUpdate=true;
  }
  return result;
 };
 game.disposers.push(()=>{game.setQuality=select;});
}
