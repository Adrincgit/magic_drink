import {paintedParticle} from './paintedDuelCanvas';

const glowLayers=new WeakMap(),clamp=n=>Math.max(0,Math.min(1,n));

function burningGlow(img,original){
 if(glowLayers.has(img))return glowLayers.get(img);
 const w=original.width,h=original.height,layer=new OffscreenCanvas(w,h),reference=new OffscreenCanvas(w,h);
 const c=layer.getContext('2d',{willReadFrequently:true}),r=reference.getContext('2d',{willReadFrequently:true});
 c.drawImage(img,0,0,w,h);r.drawImage(original,0,0,w,h);
 const pixels=c.getImageData(0,0,w,h),base=r.getImageData(0,0,w,h).data,p=pixels.data;
 // Animate only the warm newly painted flames. The roof, pillars, bleachers
 // and floor retain the panorama's exact registration throughout the loop.
 for(let i=0;i<p.length;i+=4){
  const heat=clamp((p[i]-p[i+1]*1.12)/38)*clamp((p[i]-140)/55)*clamp((p[i+1]-p[i+2]*1.55)/60);
  const added=clamp(((p[i]-base[i])*.5+(p[i+1]-base[i+1])*.4-8)/65);
  p[i+3]=Math.round(heat*added*170);
 }
 c.putImageData(pixels,0,0);glowLayers.set(img,layer);return layer;
}

export function drawInfernoBackdrop(c,s,art,q,reduced=false){
 const b=s.boss;if(b.stage<2||reduced)return;
 const img=art[b.stage===3?'grand-ring-inferno':'grand-ring-burning'];if(!img||!art.world3)return;
 const layer=burningGlow(img,art.world3),strength=(b.stage===3?1:.7)*(b.backdropBlend??1),age=s.fxTime;
 c.save();c.globalCompositeOperation='screen';
 const strips=18,source=layer.width/strips;
 for(let i=0;i<strips;i++){
  const phase=age*(7.5+i%4)+i*2.4,lift=(1+Math.sin(phase))*(b.stage===3?2.7:1.8);
  c.globalAlpha=strength*(.30+Math.sin(phase+1.2)*.12);
  c.drawImage(layer,i*source,0,source,layer.height,q.x+q.w*i/strips+Math.sin(phase*.55)*.65,q.y-lift,q.w/strips,q.h+lift);
 }
 c.restore();
 // Embers rise at the actual rear architecture, rather than standing jets.
 for(let i=0;i<(b.stage===3?38:24);i++){
  const t=(age*(.12+i%4*.025)+i*.618)%1,x=q.x+q.w*((i*.381966)%1)+Math.sin(t*4+i)*12,y=q.y+q.h*(.77-t*.68);
  paintedParticle(c,art,3,age+i,x,y,7+i%3*3,i+t*2,Math.sin(t*Math.PI)*strength*.75);
 }
}

export function fallingEmber(s,i,reduced=false){
 const age=reduced?0:s.fxTime,t=(age*(.11+i%4*.025)+i*.618)%1;
 return{x:960*((i*.381966+age*.007*(i%2?1:-1)+1)%1)+Math.sin(t*5+i)*25,y:-50+t*640,size:9+i%4*5,angle:i+age*(i%2?.8:-.6),alpha:Math.sin(t*Math.PI)*(.35+i%3*.15)};
}

export function drawInfernoForeground(c,s,art,reduced=false){
 if(!s.level.grandRing||s.boss.stage<2||s.player.x<0)return;
 for(let i=0;i<(reduced?6:s.boss.stage===3?42:26);i++){
  const p=fallingEmber(s,i,reduced);
  paintedParticle(c,art,3,reduced?0:s.fxTime+i,p.x,p.y,p.size,p.angle,p.alpha);
 }
}
