// Reuse the existing pause quality controls and keep the social row in normal flow.
export function installWebQuality159(game, T) {
 const row = game.multiplayer.element.querySelector('.social-row');
 const gear = document.createElement('button');
 gear.type = 'button';
 gear.className = 'social-settings159';
 gear.title = 'تنظیم کیفیت تصویر';
 gear.setAttribute('aria-label', gear.title);
 gear.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 3-.6 2.5-2 .9-2.2-1.3-2.1 3.6 1.9 1.7v2.4l-1.9 1.7 2.1 3.6 2.2-1.3 2 .9.6 2.5h4l.6-2.5 2-.9 2.2 1.3 2.1-3.6-1.9-1.7v-2.4l1.9-1.7-2.1-3.6-2.2 1.3-2-.9L14 3z"/><circle cx="12" cy="11.6" r="3"/></svg>';
 gear.onclick = () => {if (!game.vr.active && !game.officeSession.active) game.pause();};
 const style = document.createElement('style');
 style.textContent = '.city-social .social-row>button.social-settings159{display:grid!important;order:-1}.city-quick-actions,.city-quick-actions .social-row{flex-wrap:wrap}';
 document.head.append(style);
 row.prepend(gear);

 const roads = [], lightweight = new Map();
 game.city.group.traverse(mesh => {
  const material = mesh.material;
  if (!mesh.isMesh || !material?.map || !(mesh.name === 'intersections' || material.name.startsWith('road-'))) return;
  let low = lightweight.get(material);
  if (!low) {
   low = new T.MeshBasicMaterial({map:material.map, color:material.color, fog:material.fog});
   low.name = material.name;
   lightweight.set(material, low);
  }
  roads.push({mesh, material, low, height:mesh.position.y});
 });
 const xr = game.renderer.webgl.xr;
 const updateRoads = () => {
  const low = ['low','medium','high'].includes(game.settings.quality) && !xr.isPresenting && game.overlay.mode !== 'vr';
  for (const {mesh, material, low:replacement, height} of roads) {
   mesh.material = low ? replacement : material;
   // Separate the asphalt from the ground while keeping it below the road paint.
   mesh.position.y = height + (low ? .006 : 0);
   mesh.updateMatrix();
  }
 };
 const setQuality = game.setQuality;
 game.setQuality = function (...args) {
  const result = setQuality.apply(this, args);
  updateRoads();
  return result;
 };
 xr.addEventListener('sessionstart', updateRoads);
 xr.addEventListener('sessionend', updateRoads);
 updateRoads();
 game.disposers.push(() => {
  gear.remove();
  style.remove();
  xr.removeEventListener('sessionstart', updateRoads);
  xr.removeEventListener('sessionend', updateRoads);
  if (game.setQuality !== setQuality) game.setQuality = setQuality;
  for (const {mesh, material, height} of roads) {
   mesh.material = material;
   mesh.position.y = height;
   mesh.updateMatrix();
  }
  for (const material of lightweight.values()) material.dispose();
 });
}
