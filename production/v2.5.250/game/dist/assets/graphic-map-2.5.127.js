/* The original illustration is drawn intact. Coordinates below calibrate its road grid. */
export const mapOrder116=['supply','industry','solar','efficiency','hq','vpp'];
const worldX=[-235,-140,0,140,160],worldZ=[-230,-135,0,12];
const grid=[[[32,267],[553,267],[966,267],[1466,267],[1526,267]],[[14,479],[531,479],[997,479],[1519,479],[1530,479]],[[9,888],[478,888],[1041,888],[1525,888],[1530,888]],[[9,938],[472,938],[1048,938],[1527,938],[1530,938]]];
const districts=[
 {id:'supply',label:[75,107,320,170],polygon:[[36,278],[528,278],[507,448],[22,448]]},
 {id:'industry',label:[692,151,879,216],polygon:[[578,278],[943,278],[969,447],[557,447]]},
 {id:'solar',label:[1181,130,1445,198],polygon:[[995,278],[1450,278],[1504,447],[1022,447]]},
 {id:'efficiency',label:[95,506,351,575],polygon:[[27,511],[505,511],[453,849],[15,849]]},
 {id:'hq',label:[649,478,891,543],polygon:[[561,511],[977,511],[1011,849],[505,849]]},
 {id:'vpp',label:[1177,491,1466,561],polygon:[[1034,511],[1510,511],[1525,849],[1070,849]]}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function highlightCity127(c,id,canvas){
 const district=districts.find(d=>d.id===id);if(!district)return;
 const f=imageFrame116(canvas);c.save();c.translate(f.x,f.y);c.scale(f.scale,f.scale);
 c.fillStyle='#ffe36b44';c.strokeStyle='#ffe36b';c.lineWidth=7;c.beginPath();district.polygon.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.stroke();
 const [x,y,x2,y2]=district.label;c.strokeRect(x-6,y-6,x2-x+12,y2-y+12);c.restore();
}
const segment=(values,value)=>{let i=0;while(i<values.length-2&&value>values[i+1])i++;return[i,clamp((value-values[i])/(values[i+1]-values[i]),0,1)];};
export function projectCity116(x,z){
 const [col,u]=segment(worldX,x),[row,v]=segment(worldZ,z),a=grid[row][col],b=grid[row][col+1],c=grid[row+1][col],d=grid[row+1][col+1];
 return{x:(a[0]*(1-u)+b[0]*u)*(1-v)+(c[0]*(1-u)+d[0]*u)*v,y:(a[1]*(1-u)+b[1]*u)*(1-v)+(c[1]*(1-u)+d[1]*u)*v};
}
export function imageFrame116(canvas){const scale=Math.min(canvas.width/1536,canvas.height/1024);return{x:(canvas.width-1536*scale)/2,y:(canvas.height-1024*scale)/2,w:1536*scale,h:1024*scale,scale};}
function inside(x,y,points){let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
export function createGraphicMap116(game,features){
 const image=new Image();image.decoding='async';image.src=(window.barghetoMediaURL223||((url)=>url))(new URL('./city-map-2.5.123.webp',import.meta.url).href);
 let disposed=false;
 function hit(canvas,cx,cy){
  if(disposed||!image.complete||!image.naturalWidth)return null;
  const f=imageFrame116(canvas),x=(cx-f.x)/f.scale,y=(cy-f.y)/f.scale;
  const region=districts.find(d=>x>=d.label[0]&&x<=d.label[2]&&y>=d.label[1]&&y<=d.label[3])||districts.find(d=>inside(x,y,d.polygon));
  return region&&features().some(f=>f.id===region.id)?region.id:null;
 }
 function draw(canvas){
  if(disposed||!image.complete||!image.naturalWidth)return false;
  const c=canvas.getContext('2d'),f=imageFrame116(canvas);c.clearRect(0,0,canvas.width,canvas.height);c.fillStyle='#17343c';c.fillRect(0,0,canvas.width,canvas.height);c.drawImage(image,f.x,f.y,f.w,f.h);
  const pos=game.player.position,p=projectCity116(pos.x,pos.z),yaw=game.camera.yaw||0;
  // Project a short forward vector too, so heading follows the illustrated perspective.
  const ahead=projectCity116(pos.x-Math.sin(yaw)*2,pos.z-Math.cos(yaw)*2),angle=Math.atan2(ahead.x-p.x,-(ahead.y-p.y));
  const radius=Math.max(5,Math.min(14,canvas.width/65)),x=clamp(f.x+p.x*f.scale,radius,canvas.width-radius),y=clamp(f.y+p.y*f.scale,radius,canvas.height-radius);
  c.save();c.translate(x,y);c.rotate(angle);c.shadowColor='#001e33';c.shadowBlur=radius/2;c.fillStyle='#00d8ba';c.strokeStyle='#fff';c.lineWidth=Math.max(1.5,radius/5);c.beginPath();c.moveTo(0,-radius);c.lineTo(radius*.7,radius*.8);c.lineTo(0,radius*.4);c.lineTo(-radius*.7,radius*.8);c.closePath();c.fill();c.stroke();c.restore();return true;
 }
 return{draw,hit,image,dispose(){disposed=true;image.onload=image.onerror=null;}};
}
