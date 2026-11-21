import {highlightCity127} from './graphic-map-2.5.127-media223.js';
export function mapHover127(hit,rows,map,hitMap){
 if(!hit)return null;
 const x=hit.x,y=hit.y;
 if(x>910&&y<90)return {id:'close',x,y};
 const row=rows.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);
 if(row)return {id:row.id,x,y};
 if(x>=40&&x<=984&&y>=96&&y<=96+944*map.height/map.width){return {id:hitMap(map,(x-40)*map.width/944,(y-96)*map.width/944)||'',x,y};}
 return {id:'',x,y};
}
export function paintMapHover127(c,hover,map){
 if(!hover)return;
 if(hover.id&&hover.id!=='close'){
  c.save();c.translate(40,96);c.scale(944/map.width,944/map.width);highlightCity127(c,hover.id,map);c.restore();
 }
 c.strokeStyle='#ffe36b';c.lineWidth=4;c.beginPath();c.arc(hover.x,hover.y,12,0,Math.PI*2);c.stroke();
}
