const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const assets=path.resolve(__dirname,'../game/dist/assets'),origin='https://www.bodara.ir';
const mapURL=origin+'/wp-content/uploads/bargheto-city/assets/bundled/city-map-2.5.123.webp?sha=dbf0f055a49f3151&repair=1';
const images=[],timers=new Map();let nextTimer=1;
function canvasContext(){return {draws:0,drawImage(){this.draws++;},clearRect(){},fillRect(){},save(){},restore(){},translate(){},scale(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},strokeRect(){},arc(){},fillText(){},getImageData(){return {data:new Uint8ClampedArray(512*512*4).fill(190)};},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(data){this.pixels=data;}};}
class Node {
 constructor(tag='div'){this.tag=tag;this.children=[];this.hidden=false;this.dataset={};this.style={};this.listeners={};this.attributes={};this.context=canvasContext();this.width=1536;this.height=1024;this.isConnected=true;}
 set innerHTML(value){this.html=value;this.parts={};if(value.includes('<canvas')){this.parts.canvas=new Node('canvas');if(value.includes('width="320"'))this.parts.canvas.width=this.parts.canvas.height=320;}
 if(value.includes('data-close')){this.parts['[data-close]']=new Node('button');this.parts['.map-list113']=new Node();this.parts['[role=status]']=new Node();this.parts['[data-map-retry]']=new Node('button');this.parts['[data-map-retry]'].hidden=true;}}
 get innerHTML(){return this.html;}
 append(...nodes){this.children.push(...nodes);}
 querySelector(selector){return this.parts[selector];}
 querySelectorAll(selector){if(selector==='button')return [this.parts['[data-close]'],...(this.parts['.map-list113']?.children||[]),this.parts['[data-map-retry]']].filter(Boolean);return [];}
 getContext(){return this.context;}
 setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(k,v){this.listeners[k]=v;}
 remove(){this.isConnected=false;}
 replaceChildren(...nodes){this.children=nodes;}
 focus(){document.activeElement=this;}
 getBoundingClientRect(){return {left:0,top:0,width:this.width,height:this.height};}
}
class ImageStub {
 constructor(){images.push(this);this.complete=false;this.naturalWidth=0;}
 set src(value){this.url=value;this.complete=false;this.naturalWidth=0;}
 get src(){return this.url;}
 load(){this.complete=true;this.naturalWidth=1536;this.naturalHeight=1024;this.onload?.();}
 fail(){this.complete=true;this.naturalWidth=0;this.onerror?.();}
}
const document={head:new Node(),activeElement:null,createElement:tag=>new Node(tag),createTextNode:text=>({textContent:text})};
const window={barghetoCityServerMedia109:{'city-map-2.5.123.webp':mapURL},addEventListener(){},removeEventListener(){},barghetoMediaURL223:value=>value};
const context={window,document,Image:ImageStub,URL,location:{href:origin+'/barghetocity/'},console,Intl,performance:{now:()=>1000},setTimeout(fn){const id=nextTimer++;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);},Uint8ClampedArray};
vm.createContext(context);
let source=fs.readFileSync(assets+'/graphic-map-2.5.227.js','utf8').replaceAll('import.meta.url',JSON.stringify(origin+'/wp-content/plugins/bargheto-city/game/dist/assets/graphic-map-2.5.227.js')).replace(/export /g,'');
vm.runInContext(source+';globalThis.factory=createGraphicMap116;',context);
const features=['supply','industry','solar','efficiency','hq','vpp'].map((id,i)=>({id,title:id,areas:[{minX:i*10,maxX:i*10+5,minZ:0,maxZ:5}],accent:'#62dab4'}));
const game={player:{position:{x:0,z:0}},camera:{yaw:0}};
const graphic=context.factory(game,()=>features),image=images.at(-1);
assert.equal(new URL(image.src).pathname,new URL(mapURL).pathname);assert.equal(new URL(image.src).searchParams.get('map'),'2.5.227');assert.equal(new URL(image.src).searchParams.get('repair'),'1');
assert.equal(graphic.state,'loading');assert.equal(graphic.draw(new Node('canvas')),false);
image.load();assert.equal(graphic.state,'ready');
const large=new Node('canvas'),small=new Node('canvas');small.width=small.height=320;
assert.equal(graphic.draw(large),true);assert.equal(graphic.drawMini(small),true);assert(large.context.draws&&small.context.draws);
assert.equal(graphic.hit(large,700,500),'hq');assert.equal(graphic.hit(large,-100,-100),null);
// Retry once on a failed image request, then expose an error and recover manually.
graphic.reload();image.fail();assert.equal(graphic.state,'loading');assert(timers.size);const fn=[...timers.values()][0];timers.clear();fn();image.fail();assert.equal(graphic.state,'error');graphic.reload();image.load();assert.equal(graphic.state,'ready');
graphic.dispose();assert.equal(image.onload,null);assert.equal(image.onerror,null);
// Execute the real navigation module against browser-shaped DOM and game inputs.
context.createGraphicMap116=context.factory;context.mapOrder116=['supply','industry','solar','efficiency','hq','vpp'];context.installVRMap113=()=>({update(){},dispose(){}});
source=fs.readFileSync(assets+'/city-navigation-2.5.227.js','utf8').replace(/^import .*?;\s*$/gm,'').replace(/export /g,'');
vm.runInContext(source+';globalThis.install=installCityNavigation113;',context);
let teleported=false,resumed=false;
const live={renderer:{canvas:{parentElement:new Node()}},editor:{active:false},city:{features:{all:features,get:id=>features.find(f=>f.id===id)},layout:{roads:[]},expert:{speech:{stop(){}}},updateAudio(){}},disposers:[],player:{position:{x:0,z:0},controller:{setFlying(){}},rig:{root:{}},teleport(){teleported=true;},update(){}},camera:{yaw:0,camera:{},reset(){},update(){}},input:{clear(){},exitPointerLock(){}},time:{resetAccumulator(){}},resume(){resumed=true;this.paused=false;},flightControl:{setFlying(){}},hud:{setFlying(){}},expertBills:{hide(){}},vr:{active:false},officeSession:{active:false},cinematic:{active:false},settings:{hideHud:false},enteredCity:true,paused:false,frame(){}};
const nav=context.install(live,{Vector3:class{}},()=>({feet:{x:0,y:0,z:0},heading:0}));
nav.mini.hidden=false;nav.mini.onclick();assert.equal(nav.opened,true);assert.equal(nav.dialog.hidden,false);assert.equal(live.paused,true);assert.equal(nav.dialog.parts['.map-list113'].children.length,6);
const navImage=images.at(-1),canvas=nav.dialog.parts.canvas,before=canvas.context.draws;
navImage.load();assert(canvas.context.draws>before,'Loaded image redraws expanded map even while gameplay is paused');
// A failed request exposes a usable retry control; destination list remains present.
navImage.fail();const retry=[...timers.values()][0];timers.clear();retry();navImage.fail();assert.equal(nav.dialog.parts['[data-map-retry]'].hidden,false);assert(nav.dialog.parts['[role=status]'].textContent.includes('دریافت نشد'));nav.dialog.parts['[data-map-retry]'].onclick();navImage.load();assert.equal(nav.dialog.parts['[data-map-retry]'].hidden,true);
(async()=>{assert.equal(await nav.teleport('hq'),true);assert(teleported&&resumed);assert.equal(nav.opened,false);nav.open();nav.dialog.parts['[data-close]'].onclick();assert.equal(nav.opened,false);nav.dispose();assert.equal(navImage.onload,null);
 console.log(JSON.stringify({version:'2.5.227',directServerMapWithoutHelper:'pass',cacheRefreshQuery:'pass',fullIllustratedMap:'pass',circularMinimap:'pass',hitTest:'pass',automaticAndManualRetry:'pass',openAndCloseDialog:'pass',redrawAfterLoadWhilePaused:'pass',destinationTeleport:'pass',dispose:'pass',runtime:'Actual modules with simulated DOM, canvas and image events'},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
