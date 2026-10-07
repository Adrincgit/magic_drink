import {organMechanism} from './organMechanism';
import {stepWorldEffects} from '../../engine/adventureEffects';
import {followAdventureCamera} from '../../render/adventureCamera';

function fragments(s,art,rect,columns,rows,{rotation=0,power=1,life=3}={}){
 const debris=s.organDebris??=[];
 for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
  const i=debris.length,dx=(column+.5-columns/2)*rect.w/columns,dy=(row+.5-rows/2)*rect.h/rows;
  const x=rect.x+rect.w/2+dx*Math.cos(rotation)-dy*Math.sin(rotation);
  const y=rect.y+rect.h/2+dx*Math.sin(rotation)+dy*Math.cos(rotation);
  const angle=i*2.4;
  debris.push({art,crop:[column/columns,row/rows,1/columns,1/rows],
   x,y,w:rect.w/columns,h:rect.h/rows,vx:(Math.cos(angle)*165+dx*.8)*power,
   vy:(-165-row*25-Math.abs(Math.sin(angle))*100)*power,
   rotation,spin:(i%2?1:-1)*(1.4+i%3),life:life+i%3*.16,age:0,
   floor:s.level.arena.y,bounced:false,jagged:columns*rows>1});
 }
}

export function breakOrganArmor(s){
 const m=organMechanism(s);
 fragments(s,'organ-cover',m.cover,3,2,{rotation:m.cover.rotation,power:.85,life:2.7});
 s.boss.armorBroken=true;s.boss.steamRelease=.8;s.shake=.22;
 s.events.push('organBreak','organSteam');
}

function shatterOrgan(s){
 const m=organMechanism(s);
 fragments(s,'organ-body',m.body,4,3,{power:1.3,life:3.1});
 fragments(s,'organ-pipes',m.pipes,3,1,{power:1.35,life:3.2});
 for(const q of m.horns)fragments(s,'organ-horn',q,1,1,{power:1.35,life:3.3});
 for(const q of m.wheels)fragments(s,'organ-wheel',{x:q.x-q.w/2,y:q.y-q.w/2,w:q.w,h:q.w},1,1,{power:.8,life:3.4});
 if(!s.boss.armorBroken)fragments(s,'organ-cover',m.cover,3,2,{power:1.2,life:3.1});
 s.boss.shattered=true;s.boss.steamRelease=1.5;s.shake=.4;
 s.effects.push({x:m.anchor.x,y:m.anchor.y-185,row:1,size:265,age:0,life:.45});
 s.events.push('organDestroy','organSteam');
}

// Give the machine time to break apart before Hexy plants the victory flag.
// This path is shared by ordinary shots and a lethal super attack.
export function stepOrganDefeat(s,dt){
 const b=s.boss,p=s.player,a=s.level.arena;
 if(s.index!==1||b.hp>0||s.superCinematic||(!b.engaged&&p.x<a.entry)||b.defeat?.ready)return false;
 if(!b.defeat){
  b.defeat={age:0,ready:false};b.deadTime=0;b.phase='defeated';b.flash=0;
  s.hostile=[];s.shots=[];s.enemies=s.enemies.filter(e=>e.x<a.left);s.arenaLocked=true;s.noticeTime=0;
  Object.assign(p,{vx:0,dash:0,spin:0,cast:0,specialCast:0,hitReact:0,firing:false,guarding:false});
 }
 const q=b.defeat;q.age+=dt;b.deadTime=q.age;s.time+=dt;p.hurt=1;
 if(!b.shattered&&q.age>=.16)shatterOrgan(s);
 if(b.shattered){
  for(const [i,at]of [.58,1.03].entries())if(q.age>=at&&!(q.blasts&(1<<i))){
   q.blasts=(q.blasts||0)|(1<<i);const x=b.x+(i?75:-95),y=a.y-(i?110:205);
   s.effects.push({x,y,row:1,size:i?125:155,age:0,life:.38});s.events.push('organBlast');s.shake=.18;
  }
 }
 b.steamRelease=Math.max(0,(b.steamRelease||0)-dt);
 p.vy+=1550*dt;p.y+=p.vy*dt;
 if(p.y>=a.y){p.y=a.y;p.vy=0;p.ground=s.platforms.findIndex(t=>p.x>=t.x&&p.x<=t.x+t.w);}
 stepWorldEffects(s,dt);followAdventureCamera(s,dt);
 if(q.age>=2.5){q.ready=true;s.arenaLocked=false;}
 return true;
}
