import {fortVents,fortVentRig} from '../actors/bosses/fortVents';
import {fortAssemblyRig} from '../actors/bosses/fortGeometry';
import {energyGlow} from './paintedDuelCanvas';
const cell=384;
function plate(c,img,frame,a,region){
 if(!region){c.drawImage(img,frame%4*cell,Math.floor(frame/4)*cell,cell,cell,a.x,a.y,a.w,a.h);return;}
 const [x,y,w,h]=region;c.drawImage(img,frame%4*cell+x,Math.floor(frame/4)*cell+y,w,h,a.x+x*a.k,a.y+y*a.k,w*a.k,h*a.k);
}
export function fortAssemblyFrame(b){
 if(b.assemblyAge<.6)return 0;if(b.assemblyAge<1.25)return 1;
 if(b.furnacePulse)return b.furnacePulse.age<.72?6:7;
 return b.phase==='warn'&&b.move==='vent'?5:2;
}
export function drawFortVents(c,s,art,reduced){
 const b=s.boss;if(!b.coreOpened)return;const a=fortAssemblyRig(s),img=art['fort-deploy-painted'],frame=fortAssemblyFrame(b);
 c.save();if(b.fortParts?.core?.flash>0)c.filter='brightness(1.65)';
 const press=b.furnacePulse;
 if(press&&press.age<.72&&!reduced){
  const region=[165,313,76,65];
  c.save();c.beginPath();c.rect(a.x,a.y,a.w,a.h);c.rect(a.x+region[0]*a.k,a.y+region[1]*a.k,region[2]*a.k,region[3]*a.k);c.clip('evenodd');plate(c,img,frame,a);c.restore();
  const lift=press.age<.5?Math.min(1,press.age/.32):1-Math.min(1,(press.age-.5)/.22);
  plate(c,img,7,{...a,y:a.y-lift*42},region);
 }else plate(c,img,frame,a);
 // Each pose includes its curved pipe and the painted mounting socket.
 if((b.assemblyAge||0)>=1.25)for(const v of fortVents(s)){
  const m=fortVentRig(s,v),region=v.station?[0,202,175,92]:[0,102,175,99];
  if(!press||v.hp<=0)plate(c,img,v.hp>0?m.pose:0,a,region);
  if(v.flash>0){c.save();c.filter='brightness(1.65)';plate(c,img,v.hp>0?m.pose:0,a,region);c.restore();}
  if(v.hp>0&&b.move==='vent'&&b.phase==='warn')energyGlow(c,true,m.mouth.x,m.mouth.y,45,.38);
 }
 c.restore();
}
