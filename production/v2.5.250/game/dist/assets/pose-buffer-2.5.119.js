const mix=(a,b,t)=>a+(b-a)*t,angle=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
export class PoseBuffer114{
 constructor(){this.frames=[];this.seq=-1;this.gaps=[];this.delay=110;this.cursor=-Infinity;this.offset=null;}
 valid(p){return p&&(p.space===undefined||['city','office'].includes(p.space))&&(p.immersive===undefined||typeof p.immersive==='boolean')&&Array.isArray(p.p)&&p.p.length===3&&p.p.every(n=>Number.isFinite(n)&&Math.abs(n)<=3000)&&['yaw','speed','vy','seq','gait'].every(k=>Number.isFinite(p[k]))&&Number.isSafeInteger(p.seq)&&p.seq>=0&&p.speed>=0&&p.speed<=100&&Math.abs(p.vy)<=100&&[0,1,2].includes(p.gait)&&['grounded','flying','active','muted'].every(k=>typeof p[k]==='boolean');}
 push(p,received){
  if(!this.valid(p)||p.seq<=this.seq||!Number.isFinite(received))return false;
  const previous=this.frames.at(-1);let at=received;
  if(Number.isFinite(p.stamp)&&p.stamp>=0){const offset=received-p.stamp;this.offset=this.offset===null?offset:Math.min(this.offset+.02,offset);at=p.stamp+this.offset;}
  if(previous&&((previous.pose.space??'city')!==(p.space??'city')||Math.hypot(...p.p.map((v,i)=>v-previous.pose.p[i]))>8||received-previous.received>2000)){this.frames=[];this.gaps=[];this.cursor=-Infinity;}
  else if(previous){const gap=Math.max(1,at-previous.at);this.gaps.push(gap);if(this.gaps.length>20)this.gaps.shift();const sorted=[...this.gaps].sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length/2)],jitter=this.gaps.reduce((sum,n)=>sum+Math.abs(n-median),0)/this.gaps.length;this.delay=Math.min(420,Math.max(110,median*1.2+jitter*2));at=Math.max(previous.at+.01,at);}
  this.seq=p.seq;this.frames.push({pose:{...p,p:[...p.p]},at,received});if(this.frames.length>60)this.frames.shift();return true;
 }
 sample(now){
  if(!this.frames.length)return null;const target=Math.max(this.cursor,now-this.delay);this.cursor=target;
  while(this.frames.length>2&&this.frames[1].at<=target)this.frames.shift();
  const a=this.frames[0],b=this.frames[1],last=this.frames.at(-1);
  if(!b||target<=a.at)return {...a.pose,p:[...a.pose.p],speed:now-last.received>500?0:a.pose.speed};
  if(target<=b.at){const t=Math.max(0,Math.min(1,(target-a.at)/(b.at-a.at)));return {...b.pose,p:a.pose.p.map((v,i)=>mix(v,b.pose.p[i],t)),yaw:angle(a.pose.yaw,b.pose.yaw,t),speed:mix(a.pose.speed,b.pose.speed,t)};}
  const gap=Math.max(1,b.at-a.at),age=target-b.at,extra=Math.min(150,Math.max(0,age)),decay=Math.max(0,1-age/250),stale=now-last.received>600;
  return {...b.pose,p:b.pose.p.map((v,i)=>v+(v-a.pose.p[i])/gap*extra),speed:stale?0:b.pose.speed*decay};
 }
}
