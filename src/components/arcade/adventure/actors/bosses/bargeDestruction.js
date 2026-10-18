import {bargeWaterline} from './bargeRig';
import {bargeRig,bargeFragments} from './adventureBarge';
import {stepWorldEffects} from '../../engine/adventureEffects';
import {followAdventureCamera} from '../../render/adventureCamera';

export function stepBargeDefeat(s,dt){
 const b=s.boss,p=s.player,a=s.level.arena;
 if(s.index!==2||b.hp>0||s.superCinematic||(!b.engaged&&p.x<a.entry)||b.defeat?.ready)return false;
 if(!b.defeat){b.defeat={age:0,ready:false};b.phase='defeated';b.flash=0;s.hostile=[];s.shots=[];s.enemies=s.enemies.filter(e=>e.x<a.left);s.arenaLocked=true;s.noticeTime=0;
  Object.assign(p,{vx:0,dash:0,spin:0,cast:0,specialCast:0,hitReact:0,knockdown:null,firing:false,guarding:false});s.events.push('bargeBreak');}
 const q=b.defeat;q.age+=dt;b.deadTime=q.age;s.time+=dt;p.hurt=1;
 for(const [i,at]of [.12,.72,1.38].entries())if(q.age>=at&&!((q.ruptures||0)&(1<<i))){
  q.ruptures=(q.ruptures||0)|(1<<i);const m=bargeRig(s),point=i===0?m.tank:i===1?m.drum:{x:b.x,y:m.waterY-45};
  s.effects.push({x:point.x,y:point.y,bargeBurst:true,size:135+i*45,age:0,life:.65});s.events.push('bargePressureBurst');s.shake=Math.max(s.shake,.12+i*.035);
 }
 if(q.age<2){q.steamClock=(q.steamClock||0)-dt;if(q.steamClock<=0){q.steamClock=.13;const m=bargeRig(s),i=q.steamCount=(q.steamCount||0)+1;s.effects.push({x:m.tank.x+(i%3-1)*65,y:m.tank.y+35,waterDetail:3,waterDrift:true,size:120+i%3*25,vx:(i%3-1)*38,vy:-35,age:0,life:1.25,duration:1.25});}}
 if(!b.shattered&&q.age>=1.55){
  const m=bargeRig(s);
  // Separate along machinery and hull seams, with each fragment starting at
  // the exact place its painted component occupied before the collapse.
  const regions=[
   [570,50,155,330,[[.1,0],[.95,.04],[.7,.3],[.56,.55],[.97,.94],[.3,1],[.06,.55],[0,.17]]],
   [946,50,166,330,[[.03,.04],[1,0],[.96,.28],[.66,.61],[.4,1],[.03,.92],[.28,.48],[.37,.28]]],
   [300,310,310,340,'ellipse'],
   [737,306,200,340,'ellipse'],
   [1070,342,438,297,[[.18,0],[.72,.1],[.78,.45],[.75,.72],[1,.72],[1,1],[0,1],[.02,.39]]],
  ];
  for(const [i,[x,y,w,h,mask]]of regions.entries()){
   const rect={x:m.body.x+x*m.unit,y:m.body.y+y*m.unit,w:w*m.unit,h:h*m.unit};bargeFragments(s,'barge-pressure-barge',rect,1,1,.62);
   const piece=s.organDebris.at(-1);piece.crop=[x/1536,y/1024,w/1536,h/1024];piece.mask=mask;piece.vx=(i%2?1:-1)*(50+i*12);piece.vy=-95-i%3*35;piece.life=3;
  }
  for(const [art,point,w,h]of [['barge-wheel',m.wheel,m.wheel.r*2,m.wheel.r*2],['barge-cannon',m.cannon,150,90]]){
   bargeFragments(s,art,{x:point.x-w/2,y:point.y-h/2,w,h},1,1,.8);const piece=s.organDebris.at(-1);piece.vx=art==='barge-wheel'?140:-160;piece.spin=art==='barge-wheel'?4:-2;
  }
  b.shattered=true;s.shake=.3;s.events.push('bargeDestroy','bargeSplash');s.effects.push({x:b.x,y:m.waterY,surfaceY:m.waterY,bargeSplash:true,size:350,age:0,life:.75});
 }
 for(const [i,at]of [1.85,2.25,2.8].entries())if(q.age>=at&&!((q.blasts||0)&(1<<i))){q.blasts=(q.blasts||0)|(1<<i);s.effects.push({x:b.x-165+i*150,y:bargeWaterline(s),bargeSplash:true,size:170,age:0,life:.65});s.events.push(i===1?'bargeBreak':'bargeSplash');}
 p.vy+=1550*dt;p.y+=p.vy*dt;if(p.y>=a.y){p.y=a.y;p.vy=0;p.ground=s.platforms.findIndex(t=>p.x>=t.x&&p.x<=t.x+t.w);}
 stepWorldEffects(s,dt);followAdventureCamera(s,dt);
 if(q.age>=4.5){q.ready=true;s.arenaLocked=false;s.hearts=Math.min(s.maxHearts,s.hearts+2);s.score+=60;s.events.push('bossDown');s.notice='bossDown';s.noticeTime=4;}return true;
}
