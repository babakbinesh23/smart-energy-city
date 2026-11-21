const frameInterval=1000/60;

export function createWebFrameLimit168(){
 let previous=null,remaining=0;
 return function allow(timestamp,immersive){
  if(immersive){previous=null;remaining=0;return true;}
  if(!Number.isFinite(timestamp))return true;
  if(previous===null||timestamp<previous||timestamp-previous>250){
   previous=timestamp;remaining=0;return true;
  }
  remaining+=timestamp-previous;previous=timestamp;
  if(remaining<frameInterval-.2)return false;
  remaining=Math.min(frameInterval,remaining-frameInterval);
  return true;
 };
}

export function displayFps168(fps,immersive){
 return Math.round(immersive?fps:Math.min(60,fps));
}
