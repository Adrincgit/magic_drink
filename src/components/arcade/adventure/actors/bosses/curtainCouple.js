import {faceTarget} from '../enemies/enemyFacing';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function stepCurtainCouple(s,dt,helpers,stepCount){
 const b=s.boss,a=s.level.arena;
 b.countess??={x:a.right-220,y:a.y-210,dir:-1,age:0,phase:'watch',timer:2.5,turn:0};
 const q=b.countess;
 stepCount(s,dt,helpers);
 if(['sleep','intro','transform','dying','defeated'].includes(b.phase)||b.hp<=0){q.phase=b.hp<=0?'defeated':'watch';q.timer=1.8;return;}
 q.age+=dt;q.timer-=dt;q.y+=(a.y-(q.phase==='recover'?45:170)-q.y)*Math.min(1,dt*3);
 q.x+=(clamp(s.player.x+410,a.left+240,a.right-160)-q.x)*Math.min(1,dt*.35);
 q.dir=['warn','cast'].includes(q.phase)?q.attackDir:faceTarget(q,s.player.x);
 if(b.stage===1){q.phase='watch';return;}
 // Alternate the partners' dangerous moments. The floating conductor never
 // drops a chandelier during the Count's committed rush or bat crossing.
 if(q.phase==='watch'&&q.timer<=0&&b.phase==='recover'){
  q.phase='warn';q.age=0;q.timer=1.15;q.targetX=clamp(s.player.x,a.left+160,a.right-160);q.attackDir=q.dir;q.aim={x:s.player.x,y:s.player.y-35};
  q.move=q.turn++%2?'fans':'chandelier';b.timer=Math.max(b.timer,3.4);b.vulnerable=true;
  if(q.move==='chandelier')s.curtainChandeliers.push({x:q.targetX,y:a.y-380,floor:a.y,age:0,delay:1.15,life:2.9,falling:false});
 }
 if(q.phase==='warn'&&q.timer<=0){
  q.phase='cast';q.age=0;q.timer=.8;s.events.push('witchRay');
  if(q.move==='fans')for(const offset of [-.24,0,.24])helpers.shoot(s,q.x+q.dir*54,q.y-90,Math.atan2(q.aim.y-(q.y-90),q.aim.x-q.x)+offset,245,'act-two-orb',{actTwo:true,r:13,life:3.5,element:'magic'});
 }else if(q.phase==='cast'&&q.timer<=0){q.phase='recover';q.age=0;q.timer=1.7;}
 else if(q.phase==='recover'&&q.timer<=0){q.phase='watch';q.age=0;q.timer=2.8;}
}
export function stepCurtainChandeliers(s,dt){
 for(const q of s.curtainChandeliers||[]){
  q.age+=dt;
  if(q.age>=q.delay&&!q.landed){q.falling=true;q.y=Math.min(q.floor-30,q.y+(q.age-q.delay)*1500*dt);
   if(Math.abs(s.player.x-q.x)<65&&Math.abs(s.player.y-35-q.y)<70)s.damage?.({x:q.x,element:'physical'});
   if(q.y>=q.floor-30){q.landed=true;q.life=q.age+.6;s.events.push('rubbleBreak');}
  }
 }
 s.curtainChandeliers=(s.curtainChandeliers||[]).filter(q=>q.age<q.life);
}
export function curtainCountessBody(s){
 const q=s.boss.countess;
 return q&&s.boss.stage===2&&q.phase==='recover'?{x:q.x-40,y:q.y-145,w:80,h:145}:null;
}
