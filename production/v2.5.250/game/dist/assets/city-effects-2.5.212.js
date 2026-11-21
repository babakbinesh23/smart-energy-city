// LCD and tracker tours lock player input while the visible city keeps moving.
// Real pause, hidden tabs, an inactive headset and office sessions still stop it.
export function cityEffectsDelta212(game,rawDelta){
 if(document.hidden||game.manualPause||game.officeSession?.active)return 0;
 if(game.vr?.active&&(!game.vr.visible||game.vr.menuOpen||game.vr.insideOffice))return 0;
 const demonstration=game.sunTracking207?.previewing||game.city.solarBess?.isOpen;
 if(game.paused&&!demonstration)return 0;
 return Math.max(0,Math.min(.1,Number(rawDelta)||0));
}
