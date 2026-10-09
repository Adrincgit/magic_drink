export const BARGE_MOVES=['drumroll','mortar','tidal'];
export const BARGE_HEALTH={normal:320,gentle:220};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Sprite anchors also drive the collision, the animated weapons and projectiles.
export function bargeRig(s){
 const b=s.boss,beat=Math.sin((b.clock||0)*2.1)*3,kick=clamp((b.release||0)/.25,0,1)*8;
 const x=b.x,y=b.y+beat+34;
 const aimed=['warn','attack'].includes(b.phase),angle=aimed?(b.move==='mortar'?.22:b.move==='tidal'?-.4:0):0;
 const cannon={x:x-231+kick,y:y-100,angle};
 return{body:{x:x-330,y:y-360,w:660,h:440},wheel:{x:x+263,y:y-29,r:77},
  drum:{x:x-174,y:y-164,r:74},core:{x:x+42,y:y-132,r:46},
  cannon,muzzle:{x:cannon.x-62*Math.cos(angle),y:cannon.y-62*Math.sin(angle)},wave:{x:x-287,y:b.y-12},
  pilot:{x:x+38,y:y-230},stern:{x:x+237,y:y-123},
  vents:[{x:x-47,y:y-306},{x:x+112,y:y-314}]};
}
export function bargeCollision(s){const b=s.boss;return{x:b.x-270,y:b.y-215,w:550,h:285};}
export function resolveBargeContact(s,bodyOf,damage=true){
 const p=s.player,body=bargeCollision(s),player=bodyOf(p);
 if(player.x<body.x+body.w&&player.x+player.w>body.x&&player.y<body.y+body.h&&player.y+player.h>body.y){
  if(damage)s.damage();
  p.x=body.x-(player.x+player.w-p.x)-1;p.vx=Math.min(0,p.vx);
 }
}
// Only the solid lower hull blocks shots. The contact box includes empty
// space ahead of the drum and must not intercept shots aimed at that drum.
export function bargeArmor(s){const b=s.boss;return{x:b.x-280,y:b.y-76,w:570,h:140};}
export function bargeTargets(s){const m=bargeRig(s);return[{x:m.drum.x-69,y:m.drum.y-69,w:138,h:138},{x:m.core.x-54,y:m.core.y-82,w:108,h:146}];}
export function bargeDrawing(s){const b=s.boss;return{key:'barge-body',frame:b.hp<=0?5:b.phase==='transform'?4:b.phase==='attack'?3:b.phase==='warn'?2:b.transformed?1:0};}
function splash(s,x,y,size=110){s.effects.push({x,y,row:1,bargeSplash:true,size,age:0,life:.5});s.events.push('bargeSplash');}
export function bargeFragments(s,art,rect,columns,rows,power=1){
 const debris=s.organDebris??=[];
 for(let r=0;r<rows;r++)for(let c=0;c<columns;c++){
  const i=r*columns+c;debris.push({art,crop:[c/columns,r/rows,1/columns,1/rows],x:rect.x+(c+.5)*rect.w/columns,y:rect.y+(r+.5)*rect.h/rows,w:rect.w/columns,h:rect.h/rows,
   vx:((c+.5-columns/2)*100+Math.sin(i*3)*70)*power,vy:-160-(i%3)*65,rotation:0,spin:(i%2?1:-1)*(1.2+i%3),life:3.2+i%3*.15,age:0,floor:s.level.arena.y+80,water:true,jagged:columns*rows>1});
 }
}
export function updateBarge(s,dt,helpers,shoot){
 const b=s.boss,a=s.level.arena,p=s.player,home=a.right-400;b.dir=-1;
 b.wheelAngle=(b.wheelAngle||0)+dt*(b.phase==='warn'&&b.move==='surge'?21:b.phase==='attack'&&b.move==='surge'?29:2.6);
 if(b.hp<=b.maxHp*.5&&!b.transformed){b.transformed=true;b.stage=2;b.phase='transform';b.timer=2.1;b.vulnerable=false;b.turn=0;s.hostile=[];s.events.push('bargeBreak','organSteam');s.shake=.25;}
 if(b.phase==='transform'){
  resolveBargeContact(s,helpers.body,false);
  b.vulnerable=false;
  if(b.timer<1.25&&!b.armorBroken){const m=bargeRig(s);bargeFragments(s,'barge-shield',{x:m.drum.x-74,y:m.drum.y-74,w:148,h:148},3,2);b.armorBroken=true;s.events.push('bargeBreak');splash(s,b.x,a.y+50,170);}
  if(b.timer<=0){b.phase='recover';b.timer=1.3;b.vulnerable=true;}return;
 }
 b.vulnerable=true;
 if(b.move!=='surge'||b.phase!=='attack')b.x+=(home-b.x)*Math.min(1,dt*.75);
 if(b.phase==='warn'&&b.timer<=0){b.phase='attack';b.attackClock=0;b.shotClock=.09;b.volley=0;b.originX=b.x;b.targetX=clamp(p.x-70,a.left+140,b.x-360);b.timer=b.move==='drumroll'?3.4:b.move==='mortar'?4.0:b.move==='surge'?2.15:2.7;}
 else if(b.phase==='attack'){
  b.attackClock=(b.attackClock||0)+dt;b.shotClock=(b.shotClock||0)-dt;
  const m=bargeRig(s),fast=b.transformed?1.15:1,easy=s.gentle?.85:1;
  if(b.move==='surge'){
   const end=a.left+620,travel=b.originX-end;
   const t=clamp(b.attackClock*620/travel,0,1),e=t*t*(3-2*t),old=b.x;b.x=b.originX+(end-b.originX)*e;b.driveSpeed=(b.x-old)/dt;
   if(b.shotClock<=0){splash(s,b.x-270,a.y+47,110);b.shotClock=.24;}
  }else if(b.shotClock<=0){
   const n=b.volley++;b.release=.25;
   if(b.move==='drumroll'){
    const targetY=n%3===2?a.y-156:a.y-35;
    shoot(s,m.drum.x-67,m.drum.y,Math.atan2(targetY-m.drum.y,Math.min(p.x,m.drum.x-240)-m.drum.x),285*fast*easy,'barge-hoop',{r:20,drawSize:67,life:7,barge:true});
    b.shotClock=(b.transformed?.43:.57)*(s.gentle?1.2:1);s.events.push('bargeBeat');
   }else if(b.move==='mortar'){
    const flight=1.35,gravity=360,targetX=clamp(b.targetX+(n%3-1)*150,a.left+100,b.x-360);
    shoot(s,m.muzzle.x,m.muzzle.y,0,0,'barge-shell',{vx:(targetX-m.muzzle.x)/flight,vy:(a.y-22-m.muzzle.y-.5*gravity*flight*flight)/flight,gravity,floor:a.y,r:19,drawSize:54,life:5,barge:true});
    b.shotClock=(b.transformed?.68:.93)*(s.gentle?1.2:1);s.events.push('bargeCannon');
   }else{
    splash(s,m.wave.x,a.y+12,145);s.shake=.14;
    shoot(s,m.wave.x,m.wave.y,Math.PI,280*fast*easy,'barge-wave',{r:23,drawSize:96,floor:a.y,life:7,barge:true});
    if(b.transformed)shoot(s,m.drum.x-67,m.drum.y,Math.PI,260*easy,'barge-hoop',{r:21,drawSize:70,life:7,barge:true});
    b.shotClock=s.gentle?1.15:.9;s.events.push('bargeBeat');
   }
  }
  if(b.timer<=0){b.phase='recover';b.timer=s.gentle?1.65:1.15;b.driveSpeed=0;}
 }else if(b.timer<=0){const moves=b.transformed?['drumroll','mortar','surge','tidal']:BARGE_MOVES;b.move=moves[b.turn++%moves.length];b.phase='warn';b.timer=b.move==='surge'?1.65:b.move==='tidal'?1.15:1.05;b.targetX=p.x;s.events.push(b.move==='surge'?'bargeRev':'bargeReady');}
 resolveBargeContact(s,helpers.body);
}

export function stepBargeProjectile(s,q,dt,additions){
 if(!q.barge)return false;
 q.vy+=(q.gravity||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
 if(q.kind==='barge-wave')q.y=q.floor-q.r-2;
 if(q.kind==='barge-shell'&&q.y>=q.floor-19&&q.vy>0){
  q.life=0;splash(s,q.x,q.floor,125);
  for(const dir of [-1,1])additions.push({x:q.x,y:q.floor-20,vx:dir*205,vy:0,r:17,drawSize:70,age:0,life:1.25,kind:'barge-wave',barge:true,floor:q.floor});
 }
 if(q.x<s.level.arena.left-90||q.x>s.level.arena.right+90)q.life=0;
 return true;
}
