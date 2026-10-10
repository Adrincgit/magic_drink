import {bargeRig,bargeWaterline} from './bargeRig';
export function bargeParts(s){
 const b=s.boss;
 return b.parts??={drum:{hp:b.maxHp*.25,maxHp:b.maxHp*.25},tank:{hp:b.maxHp*.3,maxHp:b.maxHp*.3}};
}
export function bargePartBroken(s,name){return bargeParts(s)[name].hp<=0;}
export function bargePartHit(s,name,amount){
 const b=s.boss,parts=bargeParts(s),part=parts[name==='core'?'tank':name];
 if(!part||amount<=0)return;part.flash=.23;part.flashDuration=.23;
 if(part.hp<=0)return;
 part.hp=Math.max(0,part.hp-amount);
 if(part.hp>0)return;
 const m=bargeRig(s);s.events.push(name==='tank'?'bargeTankBreak':'bargeDrumBreak');s.shake=Math.max(s.shake,.22);
 if(name==='drum')b.armorBroken=true;
 else{b.tankFill=0;b.pressureStun=1.1;}
 // Actual local destruction cancels that weapon's current attack, not the
 // other crew's projectiles. The exposed tank frame remains a core target.
 if(name==='drum'&&b.move==='drumroll'||name==='tank'&&b.move==='jet'){
  b.phase='recover';b.timer=1.5;b.driveSpeed=0;
  for(const q of s.hostile)if(name==='tank'&&q.kind==='barge-jet')q.life=0;
 }
 const at=name==='drum'?m.drum:m.tank;
 for(let i=0;i<5;i++)(s.organDebris??=[]).push({art:name==='drum'?'barge-shield':'barge-tank',crop:name==='drum'?[i/5,0,1/5,1]:[.75+i/20,0,1/20,1],x:at.x+(i-2)*15,y:at.y,w:26,h:name==='drum'?90:130,vx:(i-2)*75,vy:-130-i%2*60,rotation:0,spin:(i%2?1:-1)*2,age:0,life:2.2,floor:bargeWaterline(s),water:true,jagged:true});
 if(name==='tank')s.effects.push({x:at.x,y:at.y,bargeSplash:true,size:170,age:0,life:.5});
}
export function stepBargeSystems(s,dt){
 const b=s.boss,parts=bargeParts(s);
 for(const part of Object.values(parts))part.flash=Math.max(0,(part.flash||0)-dt);
 b.pressureStun=Math.max(0,(b.pressureStun||0)-dt);
 if(b.portFlash)b.portFlash.age=Math.max(0,b.portFlash.age-dt);
 if(parts.tank.hp<=0)b.tankFill=0;
 else if(b.phase==='warn'&&b.move==='jet'){b.tankFill=Math.min(1,(b.tankFill||0)+dt/1.6*(1+.16*Math.sin(b.clock*13)));b.pumpClock=(b.pumpClock||0)-dt;if(b.pumpClock<=0){b.pumpClock=.32;s.events.push('bargePump');}}
 else if(b.phase==='attack'&&b.move==='jet')b.tankFill=Math.max(0,(b.tankFill||0)-dt/1.75);
 else b.tankFill=Math.max(0,(b.tankFill||0)-dt*.15);
 b.visibleFill=(b.visibleFill||0)+((b.tankFill||0)-(b.visibleFill||0))*(1-Math.exp(-dt*8));
 if(parts.tank.hp<parts.tank.maxHp*.6&&parts.tank.hp>0){
  b.leakClock=(b.leakClock||0)-dt;
  if(b.leakClock<=0){b.leakClock=.14;const m=bargeRig(s);s.effects.push({x:m.tank.x-m.tank.w*.35,y:m.tank.y+18,waterDrop:true,size:14,vx:-30,vy:30,floor:m.waterY,age:0,life:1.4,duration:1.4});}
 }
}
export function jamBargePressure(s,shot){
 const b=s.boss;
 if(b.phase!=='warn'||b.move!=='jet'||bargePartBroken(s,'tank')||!shot.captured?.some(q=>q.kind==='barge-balloon'))return false;
 b.phase='recover';b.timer=2.2;b.pressureStun=2.2;b.tankFill=0;
 s.events.push('bargePressureJam');s.shake=Math.max(s.shake,.18);
 const m=bargeRig(s);s.effects.push({x:m.jetMuzzle.x,y:m.jetMuzzle.y,bargeSplash:true,size:160,age:0,life:.5});return true;
}
