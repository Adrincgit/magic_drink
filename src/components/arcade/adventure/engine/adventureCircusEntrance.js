import {followAdventureCamera} from '../render/adventureCamera';
import {stepWorldEffects} from './adventureEffects';

const clamp=n=>Math.max(0,Math.min(1,n));
// The outside occupies negative world coordinates. The combat floor stays in
// its own coordinates. Defeat returns outside to Missi; entry sets no checkpoint.
export const outsideCircus=s=>!!s.level.circusEntrance&&s.player.x<0;
export function circusEntryFade(s){
 const q=s.circusEntry;if(!q)return 0;
 return q.age<1.35?clamp((q.age-.9)/.45):1-clamp((q.age-1.5)/.55);
}
export function circusEntryFigure(s){
 const q=s.circusEntry;
 return q&&!q.inside?clamp((q.age-.45)/.65):0;
}
export function circusEntryPose(s){
 const q=s.circusEntry;
 return q&&!q.inside&&q.age>=.45?{sheet:'shop-enter',frame:Math.min(7,Math.floor((q.age-.45)/.12))}:null;
}
export function stepCircusEntrance(s,dt){
 const spec=s.level.circusEntrance,p=s.player;
 if(!spec)return false;
 if(!s.circusEntry){
  if(!outsideCircus(s)||p.x<spec.trigger||p.ground===null)return false;
  s.circusEntry={age:0,fromX:p.x,inside:false};s.shots=[];s.hostile=[];
  Object.assign(p,{dir:1,vx:0,vy:0,dash:0,cast:0,specialCast:0,superCast:0,charge:0,spin:0,crouch:false,guarding:false,firing:false,gliding:false,pendingSpecial:null});
  s.events.push('doorOpen');s.noticeTime=0;
 }
 const q=s.circusEntry;q.age+=dt;s.time+=dt;stepWorldEffects(s,dt);
 if(!q.inside){
  const t=clamp(q.age/.45),x=q.fromX+(spec.doorX-q.fromX)*t;
  p.vx=q.age<.45?(spec.doorX-q.fromX)/.45:0;p.stride+=Math.abs(x-p.x)/151.2;p.x=x;
  if(q.age>=1.35){
   q.inside=true;p.x=spec.insideX;p.vx=0;p.ground=s.platforms.findIndex(t=>t.x<=p.x&&t.x+t.w>=p.x);
   s.camera={x:Math.max(0,p.x-300),y:p.y-440,backdropY:40,zoom:1};
   s.events.push('doorClose');
  }
 }
 followAdventureCamera(s,dt);
 if(q.age>=2.05)delete s.circusEntry;
 return true;
}
