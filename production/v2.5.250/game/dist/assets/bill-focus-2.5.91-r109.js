// Coordinates are in the original 2048 x 1252 bill, identical in both samples.
export const BILL_CUES91=Object.freeze({before:20.26,after:44.8,compare:53.24,end:79.30775});
export const BILL_FIELD91=Object.freeze({x:414,y:975,width:196,height:22,lineY:1004});
const ease=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x)};
export function billCue91(time,timed=true){
 if(!timed||!Number.isFinite(time)||time<BILL_CUES91.before||time>=BILL_CUES91.end)return {phase:'hidden',key:null,weight:0,trace:0};
 const phase=time<BILL_CUES91.after?'before':time<BILL_CUES91.compare?'after':'compare';
 const key=phase==='before'?'before':'after',start=BILL_CUES91[key];
 const age=time-start,limit=key==='before'?9.2:BILL_CUES91.compare-start;
 const weight=phase==='compare'?0:Math.min(ease((age-.35)/.65),ease((limit-age)/.65));
 return {phase,key,weight,trace:ease((age-.15)/.65)};
}
export function billView91(width,height,imageWidth,imageHeight,weight=0){
 const fit=Math.min(width/imageWidth,height/imageHeight);
 // A narrow screen prioritises the requested sentence; wide screens retain its amount.
 const narrow=width<600,roi=narrow?{x:400,y:938,width:224,height:94}:{x:26,y:916,width:600,height:132};
 const target=Math.min(width*.88/roi.width,height*.72/roi.height,3);
 const scale=fit+(Math.max(fit,target)-fit)*weight;
 const cx=imageWidth/2+(roi.x+roi.width/2-imageWidth/2)*weight;
 const cy=imageHeight/2+(roi.y+roi.height/2-imageHeight/2)*weight;
 return {scale,x:width/2-cx*scale,y:height/2-cy*scale};
}
export function drawBillUnderline91(ctx,image,x,y,width,height,trace=1){
 if(!image.naturalWidth||trace<=0)return;
 const sx=width/image.naturalWidth,sy=height/image.naturalHeight,f=BILL_FIELD91;
 ctx.save();ctx.strokeStyle='#ed202b';ctx.lineWidth=Math.max(2,3.5*sx);ctx.lineCap='round';ctx.beginPath();
 // Trace from right to left, following the Persian label.
 ctx.moveTo(x+(f.x+f.width)*sx,y+f.lineY*sy);ctx.lineTo(x+(f.x+f.width*(1-trace))*sx,y+f.lineY*sy);ctx.stroke();ctx.restore();
}
