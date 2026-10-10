import {drawWaterArc} from './paintedWaterCanvas';
// Short painted reflections and foam stay anchored to the hull's waterline.
export function drawHullWater(c,img,x,y,w,h,time=0,reduced=false,art){
 c.save();
 const depth=Math.min(46,h*.3),bands=8;
 for(let i=0;i<bands;i++){
  const u=i/bands,drift=reduced?0:Math.sin(time*1.7+i*1.3)*Math.min(2,w*.012);
  c.save();c.globalAlpha=.13*(1-u);c.translate(x+drift,y+4+(i+1)*depth/bands);c.scale(1,-1);
  c.drawImage(img,0,img.height*(1-(i+1)/bands),img.width,img.height/bands,-w/2,0,w,depth/bands);c.restore();
 }
 if(art){c.globalAlpha=.52;drawWaterArc(c,art,reduced?1:Math.floor(time*9)%4,x,y,Math.min(260,w*.98),Math.min(48,h*.32),'front');}
 c.restore();
}
