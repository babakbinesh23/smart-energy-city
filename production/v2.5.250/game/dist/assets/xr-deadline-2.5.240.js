// Off-head time is not loading time. Visibility events account for intervals
// even when the browser suspends both animation callbacks and window timers.
export function createVisibleDeadline240(session,limit,onExpire,{now=()=>performance.now(),schedule=setTimeout,cancel=clearTimeout}={}){
 let left=limit,last=now(),visible=!session||session.visibilityState==='visible',timer=null,done=false;
 function account(){const time=now();if(visible)left-=Math.max(0,time-last);last=time;visible=!session||session.visibilityState==='visible';}
 function stop(){if(done)return;done=true;cancel(timer);session?.removeEventListener('visibilitychange',account);session?.removeEventListener('end',stop);}
 function tick(){if(done)return;account();if(left<=0){stop();onExpire();return;}timer=schedule(tick,Math.min(1000,Math.max(1,left)));}
 session?.addEventListener('visibilitychange',account);session?.addEventListener('end',stop);timer=schedule(tick,Math.min(1000,Math.max(1,left)));
 return{cancel:stop,get remaining(){return left;}};
}
