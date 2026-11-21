// Firefox versions without AudioListener AudioParams still expose the legacy
// setters. Detect the API on each node rather than guessing from user agent.
export function setAudioPosition122(node,x,y,z){
 if(!node)return false;
 if(typeof node.positionX?.value==='number'&&typeof node.positionY?.value==='number'&&typeof node.positionZ?.value==='number'){
  node.positionX.value=x;node.positionY.value=y;node.positionZ.value=z;return true;
 }
 if(typeof node.setPosition==='function'){node.setPosition(x,y,z);return true;}
 return false;
}

export function setAudioListener122(listener,position,forward,up){
 const placed=setAudioPosition122(listener,position.x,position.y,position.z);
 if(!listener)return false;
 if(typeof listener.forwardX?.value==='number'&&typeof listener.forwardY?.value==='number'&&typeof listener.forwardZ?.value==='number'&&typeof listener.upX?.value==='number'&&typeof listener.upY?.value==='number'&&typeof listener.upZ?.value==='number'){
  listener.forwardX.value=forward.x;listener.forwardY.value=forward.y;listener.forwardZ.value=forward.z;
  listener.upX.value=up.x;listener.upY.value=up.y;listener.upZ.value=up.z;return placed;
 }
 if(typeof listener.setOrientation==='function'){listener.setOrientation(forward.x,forward.y,forward.z,up.x,up.y,up.z);return placed;}
 return false;
}
