import {groundY} from '../world/adventureTerrain';
export const POPCORN=13;
export const POPCORN_RANGE=240,POPCORN_STRONG_RANGE=480,POPCORN_COST=45;
export const POPCORN_SPREAD=.24,POPCORN_DAMAGE=3.2,POPCORN_SPEED=1200,POPCORN_RECOVERY=.78;
// Both casts use the same seven physical kernels, damage and cone angle.
// The strong cast changes only their travel budget, never penetration or damage.
export function firePopcorn(s,muzzle,aim,scale=1,strong=false){
 const angle=Math.atan2(aim.y,aim.x),range=strong?POPCORN_STRONG_RANGE:POPCORN_RANGE,group={impacts:new Set()};
 const shots=Array.from({length:7},(_,i)=>{const a=angle+(i-3)*POPCORN_SPREAD/3;return{x:muzzle.x,y:muzzle.y,vx:Math.cos(a)*POPCORN_SPEED,vy:Math.sin(a)*POPCORN_SPEED,kind:POPCORN,popcorn:true,popcornStrong:strong,popcornRange:range,popcornTravel:0,popcornGroup:group,pellet:i,r:8*scale,scale,damage:POPCORN_DAMAGE,age:0,life:range/POPCORN_SPEED+.025,hits:[]};});
 s.shots.push(...shots);s.effects.push({popcornBlast:true,x:muzzle.x,y:muzzle.y,angle,range,scale,age:0,life:strong?.43:.31,duration:strong?.43:.31});
 s.player.cast=.3;s.shake=Math.max(s.shake,.075);
 return shots;
}
export function popcornImpact(s,q,target){
 if(!q.popcorn)return;
 const key=target||'floor',group=q.popcornGroup;
 if(group?.impacts.has(key))return;group?.impacts.add(key);
 s.effects.push({drinkFx:POPCORN,x:q.x,y:q.y,size:82*(q.scale||1),age:0,life:.32,duration:.32});
 s.events.push('popcornImpact');
 if(target){s.hitStop=Math.max(s.hitStop,.035);s.shake=Math.max(s.shake,.11);}
}
export function stepPopcornShot(s,q){
 if(!q.popcorn||q.life<=0)return;
 const distance=Math.hypot(q.x-q.previousX,q.y-q.previousY),remaining=q.popcornRange-q.popcornTravel;
 if(distance>remaining){const u=Math.max(0,remaining/Math.max(.0001,distance));q.x=q.previousX+(q.x-q.previousX)*u;q.y=q.previousY+(q.y-q.previousY)*u;q.life=0;}
 q.popcornTravel+=Math.min(distance,Math.max(0,remaining));
 const floor=groundY(s.platforms,q.x,Infinity);
 if(q.y+q.r>=floor&&q.vy>0){q.y=floor-q.r;q.life=0;popcornImpact(s,q);}
}
