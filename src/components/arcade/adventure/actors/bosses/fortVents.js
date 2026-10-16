const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
import {fortAssemblyRig} from './fortGeometry';
export function fortVents(s){
 return s.boss.fortVents??=[0,1].map(station=>({part:station===0?'vent-left':'vent-right',station,dir:-1,hp:18,maxHp:18,deploy:0,angle:0,flash:0}));
}
export function fortVentRig(s,v){
 const a=fortAssemblyRig(s),station=v.station??(v.part==='vent-right'?1:0),pose=v.angle<-.1?3:v.angle>.1?4:2,tilt=pose===3?14:pose===4?-16:0;
 const sourceY=station?240:148,x=a.x+100*a.k,y=a.y+sourceY*a.k,angle=Math.PI+(pose===3?-.28:pose===4?.28:0);
 return{x,y,angle,pose,mouth:{x:a.x+(pose===4?38:33)*a.k,y:y+tilt*a.k},size:176};
}
export function stepFortVents(s,dt){
 const b=s.boss,active=b.coreOpened&&b.hp>0;
 for(const v of fortVents(s)){
  v.flash=Math.max(0,v.flash-dt);
  // Deploy once when the core opens; exposed weapons remain readable targets.
  v.deploy=clamp(v.deploy+(active&&v.hp>0?dt/1.05:-dt*1.8),0,1);
  if(v.hp<=0||b.phase==='attack')continue;
  const m=fortVentRig(s,v),dx=(s.player.x-m.x)*v.dir,dy=s.player.y-32-m.y;
  const aim=clamp(Math.atan2(dy,Math.max(180,dx)),-.28,.28)*v.dir;
  v.angle+=(aim-v.angle)*Math.min(1,dt*2.8);
 }
}
export function fortVentTargets(s){
 return fortVents(s).filter(v=>v.hp>0&&v.deploy>.55&&(s.boss.assemblyAge??2)>=1.25).map(v=>{const m=fortVentRig(s,v);return{part:v.part,x:m.x-78,y:m.y-55,w:156,h:110};});
}
