import {drawHexy} from './hexyCanvas';
import {drawPopcornShot,drawPopcornImpact} from './popcornCanvas';
import {drawExtraShot,drawExtraField} from './extraDrinksCanvas';
import {drawRibbonShot,drawRibbonImpact,drawRibbonControls} from './ribbonCanvas';
const keys={6:'jelly-fx',7:'prism-fx',8:'echo-fx',9:'volt-fx',10:'honey-fx',11:'orbit-fx'};
function cell(c,art,kind,row,frame,x,y,w,h=w,anchor=.5,angle=0){
 const img=art[keys[kind]];if(!img)return;
 const sw=img.width/4,sh=img.height/3;
 c.save();c.translate(x,y);c.rotate(angle);
 c.drawImage(img,(frame%4)*sw,row*sh,sw,sh,-w/2,-h*anchor,w,h);c.restore();
}
export function drawCreativeShot(c,q,art,reduced){
 if(q.popcorn){drawPopcornShot(c,q,art,reduced);return;}
 if(q.kind===12){drawRibbonShot(c,q,art);return;}
 if(q.kind>=9){drawExtraShot(c,q,art,reduced,cell);return;}
 const frame=reduced?0:Math.floor(q.age*12)%4,scale=q.scale||1;
 c.save();if(q.echoCopy)c.globalAlpha=.72;
 if(q.kind===6){
  const bounce=q.bounceAge<.09?1:q.vy<-170?2:frame===3?3:0;
  cell(c,art,6,0,reduced?0:bounce,q.x,q.y,43*scale,43*scale);
 }else if(q.kind===7)cell(c,art,7,0,frame,q.x,q.y,72*scale,44*scale,.5,Math.atan2(q.vy,q.vx));
 else{
  const t=Math.min(1,q.age/1.1);c.globalAlpha*=Math.min(1,q.life/.18)*(1-t*.38);
  cell(c,art,8,0,frame,q.x,q.y,q.r*3,q.r*3,.5,Math.atan2(q.vy,q.vx));
 }
 c.restore();
}
export function drawCreativeFields(c,s,art,reduced){
 drawRibbonControls(c,s,art,reduced);
 for(const f of s.drinkFields||[]){
  c.save();c.globalAlpha=Math.min(1,f.age*9,f.life*5);
  if(f.kind>=9){drawExtraField(c,f,art,reduced,cell);
  }else if(f.kind===6){
   const frame=f.bounceAge<.07?1:f.bounceAge<.19?2:f.bounceAge<.35?3:0;
   // Painted coil bottoms are registered to the same ground contact.
   cell(c,art,6,1,reduced?0:frame,f.x,f.y,118*f.scale,100*f.scale,.86);
  }else if(f.kind===7){
   cell(c,art,7,1,reduced?0:Math.floor(f.age*6)%4,f.x,f.y,90*f.scale);
   if(f.flash>0)cell(c,art,7,2,0,f.x,f.y,110*f.scale);
  }else{
   c.globalAlpha*=.58;c.filter='sepia(.6) saturate(.8) hue-rotate(85deg)';
   drawHexy(c,art,f.pose,f.x,f.y,f.dir<0);c.filter='none';
   if(f.flash>0){c.globalAlpha=.6;cell(c,art,8,2,0,f.muzzle.x,f.muzzle.y,36,36);}
  }
  c.restore();
 }
}
export function drawCreativeImpact(c,q,art,reduced){
 if(q.drinkFx===13){drawPopcornImpact(c,q,art,reduced);return;}
 if(q.drinkFx===12){drawRibbonImpact(c,q,art,reduced);return;}
 c.save();c.globalAlpha=Math.min(1,q.life/.12);
 cell(c,art,q.drinkFx,2,reduced?1:Math.min(3,Math.floor(q.age/(q.duration||.36)*4)),q.x,q.y,q.size);c.restore();
}
