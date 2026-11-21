export {billView91 as billView92,drawBillUnderline91 as drawBillUnderline92} from './bill-focus-2.5.91-r109.js';
export const BILL_CUES92=Object.freeze({before:20.26,after:44.8,compare:53.24,chart:58.08,end:79.30775,overview:4,zoomDuration:2.4});
export const smooth92=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
export function billCue92(time,timed=true){
 if(!timed||!Number.isFinite(time)||time<BILL_CUES92.before||time>=BILL_CUES92.end)return {phase:'hidden',stage:'hidden',key:null,weight:0,trace:0,chartProgress:0};
 const phase=time<BILL_CUES92.after?'before':time<BILL_CUES92.compare?'after':'compare';
 const stage=phase==='compare'?(time<BILL_CUES92.chart?'comparison':'chart'):'bill';
 const key=phase==='before'?'before':'after',age=time-BILL_CUES92[key];
 const zoomIn=smooth92((age-BILL_CUES92.overview)/BILL_CUES92.zoomDuration);
 const weight=stage!=='bill'?0:key==='before'?Math.min(zoomIn,smooth92((16.8-age)/2.4)):zoomIn;
 return {phase,stage,key,weight,trace:stage==='bill'?smooth92((age-4.5)/1.1):1,chartProgress:smooth92((time-BILL_CUES92.chart)/1.6)};
}
