import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {estimatePvEnergy,aggregateEnergy,motorSavings,batteryUsableEnergy,compareSupplyOffers} from './energy-model.js';
import './styles.css';

const nf=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1});
const zones=[
 {id:'industry',title:'تأمین برق صنایع',icon:'🏭',subtitle:'مقایسه سناریوهای فرضی',desc:'برای مقایسه دو پیشنهاد، انرژی مصرفی و نرخ‌ها را تغییر بده.',fields:[['energy','مصرف (kWh)',1000,30000,1000,10000],['a','نرخ اول',100,900,50,320],['b','نرخ دوم',100,900,50,480]],calc:v=>['اختلاف هزینه',Math.abs(compareSupplyOffers({monthlyEnergyKwh:v.energy,offerA:v.a,offerB:v.b}).difference),'واحد نمونه']},
 {id:'solar',title:'نیروگاه خورشیدی',icon:'☀️',subtitle:'محاسبه تولید',desc:'ظرفیت و ساعات معادل خورشید را تنظیم کن.',fields:[['kw','ظرفیت (kW)',2,100,2,20],['sun','ساعات معادل خورشید',1,8,.5,4.5]],calc:v=>['تولید ماهانه',estimatePvEnergy({capacityKw:v.kw,equivalentSunHoursPerDay:v.sun}),'kWh']},
 {id:'aggregation',title:'تجمیع نیروگاه خانگی',icon:'🏘️',subtitle:'تجمیع تولید',desc:'تولید ماهانه خانه‌های نمونه را جمع بزن.',fields:[['homes','تعداد خانه',1,20,1,3],['kwh','تولید هر خانه (kWh)',50,1000,50,350]],calc:v=>['تولید تجمیعی',aggregateEnergy(Array.from({length:v.homes},()=>v.kwh)),'kWh']},
 {id:'efficiency',title:'بهینه‌سازی مصرف',icon:'💡',subtitle:'مقایسه موتور BLDC',desc:'تفاوت توان موتور قدیمی و جدید را بررسی کن.',fields:[['old','توان قبلی (W)',300,1500,50,750],['new','توان جدید (W)',100,900,50,400],['hours','ساعت کار روزانه',1,24,1,12]],calc:v=>['صرفه‌جویی ماهانه',motorSavings({oldPowerW:v.old,newPowerW:v.new,hoursPerDay:v.hours}).savedKwh,'kWh']},
 {id:'storage',title:'ذخیره‌سازی',icon:'🔋',subtitle:'باتری و انرژی قابل استفاده',desc:'تخمین ظرفیت باتری در پنجره شارژ محدود.',fields:[['capacity','ظرفیت (kWh)',5,300,5,100]],calc:v=>['انرژی قابل تحویل',batteryUsableEnergy({capacityKwh:v.capacity}),'kWh']}
];
const container=document.getElementById('scene'),scene=new THREE.Scene();
scene.background=new THREE.Color('#102c3b');
const camera=new THREE.PerspectiveCamera(48,1,.1,160);camera.position.set(30,25,32);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);
const orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.minDistance=16;orbit.maxDistance=65;orbit.maxPolarAngle=Math.PI/2.1;
scene.add(new THREE.HemisphereLight(0xd9f1ff,0x25494b,3));
const sun=new THREE.DirectionalLight(0xffe8ac,2.6);sun.position.set(16,24,10);scene.add(sun);
const mat=(color,metalness=0)=>new THREE.MeshStandardMaterial({color,metalness,roughness:.7});
const lawn=mat(0x205749),road=mat(0x273c49),walls=mat(0xb6d2d4),roof=mat(0x507d87),solar=mat(0x196184,.4),light=mat(0x37c9b1),steel=mat(0x8ca6ae,.4);
function block(parent,x,y,z,w,h,d,m){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
function sphere(parent,x,y,z,r,m){const o=new THREE.Mesh(new THREE.SphereGeometry(r,12,10),m);o.position.set(x,y,z);parent.add(o);return o;}
block(scene,0,-.5,0,44,1,42,lawn);
for(const x of [-6,6])block(scene,x,.03,0,3.4,.08,42,road);
block(scene,0,.03,0,44,.08,3.3,road);
const locations={
 industry:[-13,-10],solar:[13,-10],aggregation:[-13,10],efficiency:[13,10],storage:[0,12]
};
const groupMap={};
for(const zone of zones){let g=new THREE.Group();g.userData.zone=zone.id;scene.add(g);groupMap[zone.id]=g;}
{
 const g=groupMap.industry;block(g,-13,1.7,-10,9,3.4,6,walls);block(g,-13,3.5,-10,9.4,.3,6.3,roof);
 for(let i=0;i<4;i++)block(g,-16+i*2,2,-6.95,1.25,1,.1,solar);
 for(let i=0;i<3;i++)block(g,-16+i*2.6,5,-12.2,.8,4,.8,steel);
}
{
 const g=groupMap.solar;block(g,13,.1,-10,13,.2,12,roof);
 for(let i=0;i<5;i++)for(let j=0;j<4;j++){let p=block(g,8.5+i*2.2,.7,-14+j*2.3,1.8,.1,1.4,solar);p.rotation.x=-.23;}
}
{
 const g=groupMap.aggregation;for(let i=0;i<3;i++){let x=-17+i*4.4;block(g,x,1.2,10,3.1,2.5,3.1,walls);block(g,x,2.55,10,3.5,.25,3.4,roof);block(g,x,2.8,10,2,.08,1.4,solar);}
}
{
 const g=groupMap.efficiency;block(g,13,1.5,10,8,3,6,walls);block(g,13,3.1,10,8.3,.3,6.3,roof);
 for(let i=0;i<3;i++)block(g,10+i*2.4,1.7,6.95,1.4,1.2,.1,solar);
 for(let i=0;i<3;i++){block(g,8+i*3.6,1.8,15,.14,3.6,.14,steel);sphere(g,8+i*3.6,3.7,15,.35,light);}
}
{
 const g=groupMap.storage;block(g,0,.2,12,6,.3,5,steel);
 for(let i=0;i<4;i++){block(g,-1.6+i*1.1,1.25,12,.9,1.85,1.5,roof);block(g,-1.6+i*1.1,1.2,11.22,.18,1.25,.08,light);}
}
const rings={};
for(const z of zones){const [x,y]=locations[z.id];const r=new THREE.Mesh(new THREE.TorusGeometry(1,.055,7,40),new THREE.MeshBasicMaterial({color:0x71f5ca,transparent:true,opacity:.6}));r.rotation.x=Math.PI/2;r.position.set(x,4.5,y);scene.add(r);rings[z.id]=r;}
const list=document.getElementById('zone-list'),fields=document.getElementById('calc-controls'),output=document.getElementById('calc-output');
let selected='solar';
function selectZone(id){
 selected=id;const z=zones.find(v=>v.id===id);
 list.replaceChildren();
 for(const opt of zones){const b=document.createElement('button');b.className='zone'+(opt.id===id?' active':'');b.type='button';b.setAttribute('aria-pressed',String(opt.id===id));
 const em=document.createElement('span');em.className='zone-emoji';em.textContent=opt.icon;
 const caption=document.createElement('span');caption.textContent=opt.title;const small=document.createElement('small');small.textContent=opt.subtitle;caption.appendChild(small);
 b.append(em,caption);b.onclick=()=>selectZone(opt.id);list.appendChild(b);}
 document.getElementById('calc-title').textContent=z.title;document.getElementById('calc-description').textContent=z.desc;fields.replaceChildren();
 const values={};
 const update=()=>{const [label,value,unit]=z.calc(values);output.replaceChildren();const sm=document.createElement('small');sm.textContent=label;const strong=document.createElement('strong');strong.textContent=nf.format(value)+' '+unit;output.append(sm,strong);};
 for(const [key,label,min,max,step,start] of z.fields){values[key]=start;const wrap=document.createElement('label');wrap.className='input-field';const header=document.createElement('span');header.textContent=label;const displayed=document.createElement('strong');displayed.textContent=nf.format(start);header.append(displayed);
 const input=document.createElement('input');input.type='range';Object.assign(input,{min,max,step,value:start});input.oninput=()=>{values[key]=Number(input.value);displayed.textContent=nf.format(values[key]);update();};wrap.append(header,input);fields.appendChild(wrap);}
 update();
}
selectZone(selected);
const ray=new THREE.Raycaster(),p=new THREE.Vector2();let down=null;
renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>8)return;
 const rect=renderer.domElement.getBoundingClientRect();p.set(2*(e.clientX-rect.left)/rect.width-1,1-2*(e.clientY-rect.top)/rect.height);
 ray.setFromCamera(p,camera);const hit=ray.intersectObjects(Object.values(groupMap),true).find(h=>h.object.parent);
 if(hit){let g=hit.object;while(g&&!g.userData.zone)g=g.parent;if(g?.userData.zone)selectZone(g.userData.zone);}down=null;});
function resize(){const w=container.clientWidth,h=Math.max(container.clientHeight,1);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
new ResizeObserver(resize).observe(container);resize();
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();
 for(const z of zones){const r=rings[z.id];r.material.opacity=(z.id===selected?.9:.28)+.08*Math.sin(t*2);r.scale.setScalar((z.id===selected?1.15:1)+.04*Math.sin(t));}
 orbit.update();renderer.render(scene,camera);}animate();
