import {SUPER_WINDUP,SUPER_CHARGE_RATE,superChargeAge} from './adventureSuperTiming';
import {surfaceMaterial} from './adventureSurfaceFeedback';
import {surfaceY} from '../world/adventureTerrain';

// The cinematic freezes the world. Only these pressure-driven fragments age.
export function stepSuperSurface(s,dt){
 const q=s.superCinematic;if(!q)return;
 q.surfaceDust??=[];
 const dustDt=q.age<SUPER_WINDUP?dt*SUPER_CHARGE_RATE:dt;
 for(const d of q.surfaceDust){d.age+=dustDt;d.x+=d.vx*dustDt;d.y+=(d.vy||0)*dustDt;if(d.kind)d.vy+=220*dustDt;}
 q.surfaceDust=q.surfaceDust.filter(d=>d.age<d.life);
 if(q.airborne)return;
 const p=s.player,floor=s.platforms[p.ground];if(!floor||floor.gone)return;
 const material=surfaceMaterial(s,floor),grass=material==='soil'&&['grass','riverbank'].includes(s.level.world?.terrain)&&!s.level.emberTrail;
 const emit=release=>{
  const seed=q.surfaceSeed=(q.surfaceSeed||0)+1;
  for(const dir of [-1,1])q.surfaceDust.push({x:p.x+dir*18,y:p.y+2,age:0,life:release?.72:.5,material,
   size:(release?88:36)*(material==='stone'?.65:1),opacity:material==='stone'?.3:release?.8:.48,vx:dir*(release?70:24),vy:release?-12:-6});
  for(let i=0;i<(release?12:4);i++){
   const dir=i%2?1:-1,x=p.x+dir*(9+(i*13+seed*7)%29),kind=grass?'grass':material;
   q.surfaceDust.push({kind,material,x,y:surfaceY(floor,x)-2,age:0,life:.45+(i%4)*.1,
    size:kind==='grass'?7+i%3*2:3+i%3,opacity:.9,vx:dir*((release?65:24)+(i*17+seed*11)%45),vy:-(release?100:50)-(i*23+seed*9)%55,angle:i*1.7,spin:dir*(3+i%4)});
  }
 };
 const before=q.age-dt;
 const age=superChargeAge(q.age),previous=superChargeAge(before);
 if(age>=.45&&q.age<SUPER_WINDUP&&Math.floor((age-.45)/.18)!==Math.floor((previous-.45)/.18))emit(false);
 if(before<SUPER_WINDUP&&q.age>=SUPER_WINDUP)emit(true);
}
