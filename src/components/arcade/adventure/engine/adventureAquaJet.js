import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {aquaFloor,aquaImpact} from './adventureAquaEffects';
export const AQUA_JET_DURATION=1.85;
export function beginAquaJet(s,scale=1){
 s.aquaJet={age:0,life:AQUA_JET_DURATION,scale,angle:-.36,pulse:-1,splash:0,waterBudget:new Map(),points:[]};
 s.player.aquaChannel=true;
}
export function aimAquaJet(s,input,dt){
 const q=s.aquaJet,p=s.player;if(!q)return;
 if(p.hitReact>0||p.knockdown||p.dash>0||input.guard||s.playerDefeat||s.clear||s.circusEntry){s.aquaJet=null;p.aquaChannel=false;return;}
 const target=input.up?-.95:input.down?.8:-.36;
 q.angle+=(target-q.angle)*(1-Math.exp(-dt*7));
 p.crouch=false;p.specialCast=.22;p.specialAimX=p.dir*Math.cos(q.angle);p.specialAimY=Math.sin(q.angle);
}
export function stepAquaJet(s,dt){
 const q=s.aquaJet;if(!q)return;
 const p=s.player;q.age+=dt;q.life-=dt;
 if(q.life<=0){s.aquaJet=null;p.aquaChannel=false;return;}
 const origin=hexyMuzzle(s),vx=p.dir*Math.cos(q.angle)*590,vy=Math.sin(q.angle)*590;
 const reach=Math.min(1.3,q.age*2.5),points=[];
 q.grounded=false;
 for(let t=0;t<=reach+.015;t+=.022){
  const x=origin.x+vx*t,y=origin.y+vy*t+370*t*t,floor=aquaFloor(s,x);
  if(y>=floor&&t>.03){points.push({x,y:floor,t});q.grounded=true;break;}
  points.push({x,y,t});
 }
 q.points=points;q.dir=p.dir;q.splash-=dt;
 const end=points.at(-1);
 if(q.grounded&&q.splash<=0){aquaImpact(s,end.x,end.y,65*q.scale);q.splash=.22;}
 const pulse=Math.floor(q.age/.18);if(q.pulse===pulse)return;q.pulse=pulse;
 const hits=[],waterHits=new Set();
 for(const [i,point]of points.entries())if(i%2===0||point===end){
  s.shots.push({x:point.x,y:point.y-2,vx:0,vy:0,r:(9+point.t*9)*q.scale,kind:5,heavy:true,hidden:true,aquaProbe:true,sustained:true,
   damage:1.1,life:.024,age:0,scale:q.scale,hits,waterHits,waterBudget:q.waterBudget,waterLimit:4,waterPower:.8,waterFxSize:55,jetDir:p.dir});
 }
}
