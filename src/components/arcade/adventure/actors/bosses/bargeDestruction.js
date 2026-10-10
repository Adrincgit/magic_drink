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
 if(!b.shattered&&q.age>=1.55){
  const m=bargeRig(s);bargeFragments(s,b.armorBroken?'barge-damaged':'barge-body',m.body,5,3,1.2);bargeFragments(s,'barge-wheel',{x:m.wheel.x-77,y:m.wheel.y-77,w:154,h:154},1,1,1.4);
  bargeFragments(s,'barge-cannon',{x:m.cannon.x-66,y:m.cannon.y-39.5,w:132,h:79},1,1,1.2);
  b.shattered=true;s.shake=.3;s.events.push('bargeDestroy','bargeSplash');s.effects.push({x:b.x,y:a.y,bargeSplash:true,size:350,age:0,life:.75});
 }
 for(const [i,at]of [1.85,2.25,2.8].entries())if(q.age>=at&&!((q.blasts||0)&(1<<i))){q.blasts=(q.blasts||0)|(1<<i);s.effects.push({x:b.x-165+i*150,y:bargeWaterline(s),bargeSplash:true,size:170,age:0,life:.65});s.events.push(i===1?'bargeBreak':'bargeSplash');}
 p.vy+=1550*dt;p.y+=p.vy*dt;if(p.y>=a.y){p.y=a.y;p.vy=0;p.ground=s.platforms.findIndex(t=>p.x>=t.x&&p.x<=t.x+t.w);}
 stepWorldEffects(s,dt);followAdventureCamera(s,dt);
 if(q.age>=4.5){q.ready=true;s.arenaLocked=false;s.hearts=Math.min(s.maxHearts,s.hearts+2);s.score+=60;s.events.push('bossDown');s.notice='bossDown';s.noticeTime=4;}return true;
}
