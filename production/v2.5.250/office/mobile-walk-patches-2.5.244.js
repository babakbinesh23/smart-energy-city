// Office touch walking uses the same 2.15 m/s baseline as desktop walking.
(()=>{'use strict';
 const before="const running=!ghost222&&(keys.has('ShiftLeft')||keys.has('ShiftRight')||!!touchInput.sprint);";
 const after="const mobileWalk235=navigator.maxTouchPoints>0&&officeTouchLayout169.matches&&!window.Office97?.xrActive;const running=!ghost222&&!mobileWalk235&&(keys.has('ShiftLeft')||keys.has('ShiftRight')||!!touchInput.sprint);";
 const patches=window.OfficePatches97;
 if(!patches['game.js']?.includes(before))throw Error('Office mobile walking integration mismatch');
 // The VR base does not carry the web-only layout declaration. Its frame
 // still runs before XR adoption on touch-capable headset browsers.
 if(!patches['game.js'].includes('const officeTouchLayout169=')){
  const frame='function frame(){';
  if(!patches['game.js'].includes(frame))throw Error('Office touch layout integration mismatch');
  patches['game.js']=patches['game.js'].replace(frame,"const officeTouchLayout169=matchMedia('(hover: none) and (pointer: coarse)');\n"+frame);
 }
 patches['game.js']=patches['game.js'].replace(before,after);
 // A full joystick push remains walking inside the office.
 const style=document.createElement('style');style.textContent='[data-office-mobile121] .touch-run120{display:none!important}[data-office-mobile121] .city-joystick[data-running120=true]{box-shadow:inset 0 1px 5px #ffffff50,0 7px 23px #0005}';document.head.append(style);
})();
