// Redraw only brand lettering on a shared canvas at load time. No extra draw calls.
export function brandText222(T,source,regions){
 const image=source.image,canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);
 for(const {x,y,w,h,font,spacing=0,color='#061746'}of regions){
  const upper=c.getImageData(x,y-2,w,1),lower=c.getImageData(x,y+h+1,w,1),patch=c.createImageData(w,h);
  for(let row=0;row<h;row++)for(let col=0;col<w;col++)for(let k=0;k<4;k++)patch.data[(row*w+col)*4+k]=upper.data[col*4+k]*(1-row/(h-1))+lower.data[col*4+k]*row/(h-1);
  c.putImageData(patch,x,y);c.fillStyle=color;c.textBaseline='middle';c.textAlign='left';c.font='bold '+font+'px Arial, sans-serif';
  const text='BARGHETO',total=c.measureText(text).width+spacing*(text.length-1);let pen=x+w/2-total/2;
  for(const letter of text){c.fillText(letter,pen,y+h/2+.5);pen+=c.measureText(letter).width+spacing;}
 }
 const result=new T.CanvasTexture(canvas);result.name='Bargheto corrected English livery';result.userData.englishBrand='BARGHETO';source.dispose();return result;
}
