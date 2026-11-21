// Office touch walking uses the same 2.15 m/s baseline as desktop walking.
(()=>{'use strict';
 const before="const running=!ghost222&&(keys.has('ShiftLeft')||keys.has('ShiftRight')||!!touchInput.sprint);";
 const after="const mobileWalk235=navigator.maxTouchPoints>0&&officeTouchLayout169.matches&&!window.Office97?.xrActive;const running=!ghost222&&!mobileWalk235&&(keys.has('ShiftLeft')||keys.has('ShiftRight')||!!touchInput.sprint);";
 const patches=window.OfficePatches97;
 if(!patches['game.js']?.includes(before))throw Error('Office mobile walking integration mismatch');
 patches['game.js']=patches['game.js'].replace(before,after);
 // A full joystick push remains walking inside the office.
 const style=document.createElement('style');style.textContent='[data-office-mobile121] .touch-run120{display:none!important}[data-office-mobile121] .city-joystick[data-running120=true]{box-shadow:inset 0 1px 5px #ffffff50,0 7px 23px #0005}';document.head.append(style);
})();
