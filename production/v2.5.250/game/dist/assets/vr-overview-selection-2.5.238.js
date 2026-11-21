// Keep overview hover live while the select buttons rearm. Stick drift, a held
// grip, or the B gesture used to return to the overview cannot disable aiming.
export function installOverviewSelection238(game,T){
 const vr=game.vr,previous=vr.updateIntroduction;
 vr.updateIntroduction=function(dt){
  const intro=this.intro;if(!intro)return;
  const frozen=this.mapOpen125;intro.update(frozen?0:dt,this.view);this.notifyIntro();this.rig.rotation.set(0,intro.yaw,0);this.rig.position.copy(intro.position);this.anchor.y=intro.position.y-this.eyeOffset;this.syncView();intro.update(0,this.view);if(intro.caption)intro.caption.visible=false;
  this.blocked=false;this.marker.visible=this.smallTitle.visible=false;this.curtain.position.copy(this.view.position);
  this.revealAge125=(this.revealAge125??0)+Math.max(0,Math.min(.05,dt));
  const fade=this.fade>.12?(.24-this.fade)/.12:this.fade/.12,t=Math.max(0,Math.min(1,(this.revealAge125-.8)/3.6));
  this.curtain.material.opacity=Math.max(fade,1-t*t*(3-2*t));this.curtain.visible=this.curtain.material.opacity>.001;
  for(const hand of this.hands){
   const pad=hand.source?.gamepad,poll=pad?.buttons.map(b=>b.pressed)??[];hand.cursor.visible=false;hand.line.visible=intro.selectable;
   if(!pad||!hand.group.visible)continue;
   const previousButtons=hand.buttons??[],right=hand.source.handedness==='right';
   // Resolve and display the same ray target that A/trigger will activate,
   // including while a previously held select button is waiting for release.
   this.handRay(hand);
   const mapped=this.mapOpen125,distance=mapped?this.onRaycast(this.raycaster):null,pick=mapped?null:intro.pick(this.raycaster);
   hand.line.scale.z=distance??(pick?this.origin.distanceTo(pick.point):10);hand.line.material.color.set(distance!==null||pick?0xffd43a:0x8cdec0);hand.cursor.visible=distance!==null||!!pick;hand.cursor.position.copy(this.direction).multiplyScalar(hand.line.scale.z).add(this.origin);hand.cursor.scale.setScalar(mapped?1:Math.max(1,hand.line.scale.z*.2));if(pick)intro.hover(pick.feature.id);
   if(hand.needsRelease){
    // Only selection inputs need to be released. Axes, grip and B do not
    // generate a destination selection and must not keep this gate latched.
    if(!poll[0]&&(!right||!poll[4])){hand.needsRelease=false;hand.selectHandled=false;}
    hand.buttons=poll;continue;
   }
   const edge=i=>!!poll[i]&&!previousButtons[i];
   if(edge(0)||right&&edge(4)){if(hand.selectHandled)hand.selectHandled=false;else if(mapped)this.onSelectRay(this.raycaster);else if(pick)this.selectIntro(pick);}
   if(!poll[0])hand.selectHandled=false;hand.buttons=poll;
  }
 };
 game.disposers.push(()=>{vr.updateIntroduction=previous;});
}
