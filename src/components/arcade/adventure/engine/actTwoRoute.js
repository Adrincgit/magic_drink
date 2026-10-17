import {worldSound} from './adventureWorldAudio';
export const actTwoObstacleBody=q=>({x:q.x,y:q.y,w:q.w,h:q.h});
export function prepareActTwo(s,at=0){
 if(!s.level.actTwo)return;
 s.actTwoAmbushes=(s.level.ambushes||[]).map(q=>({...q,fired:q.x<at,warning:0}));
 s.actTwoDebris=[];s.actTwoDust=[];
 s.villagers=[];s.villageFire=[];s.villageDust=[];
 for(const q of s.platforms)if(q.solid){q.hp=q.maxHp??q.hp;q.maxHp=q.hp;q.gone=false;q.hitIds=new Set();}
 s.strawPiles=[];s.dreamMirrors=[];s.dreamHazards=[];
 s.dreamPlatforms=[];
}
export function resolveActTwoWalls(s,oldX,oldY){
 if(!s.level.actTwo)return;
 const p=s.player;
 if(s.level.maskMansion&&oldX<7240&&p.x>=7240&&p.y>220){p.x=7226;p.vx=0;}
 for(const q of s.platforms)if(q.solid&&!q.gone&&p.y>q.y+7&&oldY>q.y+4&&p.y-55<q.y+q.h){
  if(oldX+14<=q.x&&p.x+14>q.x){p.x=q.x-14;p.vx=0;}
  else if(oldX-14>=q.x+q.w&&p.x-14<q.x+q.w){p.x=q.x+q.w+14;p.vx=0;}
 }
}
export function breakActTwoProp(s,q,shot){
 if(q.gone)return;q.hp=0;q.gone=true;worldSound(s,q.art===7?'rubbleBreak':'woodBreak',q.x+q.w/2,q.y);s.shake=Math.max(s.shake,.12);
 for(let i=0;i<7;i++)s.actTwoDebris.push({x:q.x+q.w*(i+.5)/7,y:q.y+q.h*.5,vx:(i-3)*55+(shot?.vx>0?75:-75),vy:-190-i%3*45,age:0,life:1.1,art:q.art===7?7:3,rotation:i*.4});
 if(s.player.ground===s.platforms.indexOf(q))s.player.ground=null;
}
export function hitActTwoObjects(s,shot,r=0){
 if(!s.level.actTwo||shot.life<=0)return;
 const hit=q=>shot.x+r>=q.x&&shot.x-r<=q.x+q.w&&shot.y+r>=q.y&&shot.y-r<=q.y+q.h;
 for(const q of s.platforms)if(q.solid&&!q.gone&&hit(q)){
  shot.actTwoHits??=new Set();if(shot.actTwoHits.has(q))continue;shot.actTwoHits.add(q);q.hp-=shot.damage;q.flash=.16;
  if(q.hp<=0)breakActTwoProp(s,q,shot);else worldSound(s,q.art===7?'rubbleHit':'woodHit',shot.x,shot.y);
  if(!shot.heavy&&!shot.piercing&&shot.kind!==0&&shot.kind!==1)shot.life=0;
 }
 for(const q of [...s.strawPiles,...s.dreamMirrors])if(q.hp>0&&Math.abs(shot.x-q.x)<45+r&&shot.y>q.y-q.h-r&&shot.y<q.y+r){
  shot.actTwoHits??=new Set();if(shot.actTwoHits.has(q))continue;shot.actTwoHits.add(q);q.hp=Math.max(0,q.hp-shot.damage);q.flash=.15;
  if(!q.hp){worldSound(s,'rubbleBreak',q.x,q.y);s.effects.push({x:q.x,y:q.y-35,row:2,size:100,age:0,life:.32});}
  if(!shot.heavy&&!shot.piercing)shot.life=0;
 }
}
export function stepActTwoRoute(s,dt,makeEnemy){
 if(!s.level.actTwo)return;
 for(const q of s.villageFire)q.age+=dt;s.villageFire=s.villageFire.filter(q=>q.age<q.life);
 for(const q of s.platforms)q.flash=Math.max(0,(q.flash||0)-dt);
 for(const q of s.actTwoAmbushes){
  if(q.fired||s.player.x<q.x-340)continue;
  if(!q.warning){q.warning=1.25;worldSound(s,'woodHit',q.x+250,s.player.y);continue;}
  q.warning-=dt;if(q.warning<=0){q.fired=true;for(const [x,y,type]of q.enemies){const e=makeEnemy(x,y,type,80+s.enemies.length);e.timer=1.4;e.active=true;s.enemies.push(e);}}
 }
 for(const q of s.actTwoDebris){q.age+=dt;q.vy+=700*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.rotation+=dt*4;}
 for(const q of s.actTwoDust)q.age+=dt;
 s.actTwoDebris=s.actTwoDebris.filter(q=>q.age<q.life);s.actTwoDust=s.actTwoDust.filter(q=>q.age<q.life);
}
