export function isMobile235(game){
 return !game.vr?.active&&navigator.maxTouchPoints>0&&matchMedia('(pointer: coarse)').matches&&!/OculusBrowser|Quest/i.test(navigator.userAgent);
}
