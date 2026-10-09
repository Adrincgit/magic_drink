import {arenaBarrierPositions} from './infernoStageCanvas';
import {rushFireScale} from '../actors/bosses/harlequinFire';
import {ultimateBeamGeometry} from '../actors/bosses/harlequinUltimate';
import {clashContact} from '../engine/adventurePowerClash';

const clamp=n=>Math.max(0,Math.min(1,n));
export function infernoFloorLights(s){
 if(s.index!==3||s.player.x<0)return [];
 const floor=s.level.arena.y,lights=[],ground=new Map();
 const add=(x,y,radius,strength,boss=true)=>{
  const reach=clamp(1-Math.abs(floor-y)/340);
  if(reach>0&&strength>0)lights.push({x,floor,radius,strength:strength*reach,boss});
 };
 for(const wall of arenaBarrierPositions(s))add(wall.x,floor,205,.58);
 for(const q of s.hostile){
  if(!q.harlequin||q.life<=0)continue;
  if(q.kind==='harlequin-pyre'){
   const age=q.age-q.delay;if(age>=0)add(q.x,floor,250,.65*clamp(age/.08)*clamp(q.life/.16));
  }else if(q.kind==='harlequin-groundfire'){
   const strength=.45*clamp(q.age/.08)*clamp(q.life/.45)*rushFireScale(q),key=Math.round(q.x/100);
   if(!ground.has(key)||ground.get(key).strength<strength)ground.set(key,{x:q.x,floor,radius:145,strength,boss:true});
  }else add(q.x,q.y,175,q.kind==='harlequin-cloth'?.28:.38);
 }
 lights.push(...ground.values());
 for(const q of s.effects)if(q.fireBurst)add(q.x,q.y,Math.max(150,q.size*.75),.82*clamp(q.life/q.duration));
 if(s.boss.stage>=2&&s.boss.hp>0&&s.boss.phase!=='sleep')add(s.boss.x,s.boss.y,150,.25);
 const u=ultimateBeamGeometry(s),clash=s.powerClash;
 const ray=(a,b,boss)=>{
  const n=Math.max(1,Math.ceil(Math.abs(b.x-a.x)/180));
  for(let i=0;i<=n;i++){const t=i/n;add(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,205,.38,boss);}
 };
 if(u&&!clash)ray(u.a,u.b,true);
 if(clash&&['travel','contest','resolve'].includes(clash.state)){
  const h=clashContact(s),t=clash.state==='travel'?clamp(clash.age/.34):1;
  for(const [start,boss]of [[h.a,false],[h.b,true]])ray(start,{x:start.x+(h.x-start.x)*t,y:start.y+(h.y-start.y)*t},boss);
 }
 return lights;
}
export function drawInfernoFloorLights(c,s,reduced=false){
 const flicker=reduced?1:1+Math.sin(s.fxTime*27)*.045;
 c.save();c.globalCompositeOperation='screen';c.filter='none';
 for(const q of infernoFloorLights(s)){
  c.save();c.globalAlpha*=q.strength*flicker;c.translate(q.x,q.floor+10);c.scale(1,.3);
  const g=c.createRadialGradient(0,0,0,0,0,q.radius);
  g.addColorStop(0,q.boss?'#ffd68ad0':'#fff3bad0');g.addColorStop(.2,q.boss?'#ff8b48b0':'#ffb3dfa0');
  g.addColorStop(.55,q.boss?'#f3432440':'#ed75c940');g.addColorStop(1,q.boss?'#ef341800':'#dd5fc100');
  c.fillStyle=g;c.fillRect(-q.radius,-q.radius,q.radius*2,q.radius*2);c.restore();
 }
 c.restore();
}
