// Coordinates measured in the 1536x1024 fortress painting. Keeping the ports
// in that space registers their shutters, muzzle and hit target to the facade.
import {FORT_WIDTH,FORT_SCALE} from './fortGeometry';
const PORTS=[[523,510],[1120,494],[542,760],[1390,720]];
export function fortWindows(s){
 const b=s.boss;
 b.windows??=PORTS.map((_,i)=>({id:'window-'+i,hp:22,maxHp:22,flash:0,phase:'closed',age:0,dir:-1}));
 return b.windows.map((q,i)=>({...q,x:b.x-FORT_WIDTH/2+PORTS[i][0]*FORT_WIDTH/1536,y:b.y+(PORTS[i][1]-950)*FORT_WIDTH/1536}));
}
export function fortWindowTargets(s){return fortWindows(s).filter(q=>q.hp>0).map(q=>({part:q.id,x:q.x-25*FORT_SCALE,y:q.y-25*FORT_SCALE,w:50*FORT_SCALE,h:50*FORT_SCALE}));}
export function hitFortWindow(s,id,damage){
 const point=fortWindows(s).find(q=>q.id===id),q=s.boss.windows.find(q=>q.id===id);
 if(!q||q.hp<=0)return;
 q.hp=Math.max(0,q.hp-damage);q.flash=.2;
 if(!q.hp){q.phase='broken';s.events.push('impact');s.effects.push({x:point.x,y:point.y,armor:true,size:65,age:0,life:.32});}
}
export function fortWindowFrame(q){
 if(q.hp<=0)return 7;
 if(q.phase==='closed')return 0;
 if(q.phase==='opening')return q.age<.18?1:q.age<.36?2:3;
 if(q.phase==='aim')return q.age<.4?4:5;
 if(q.phase==='fire')return 6;
 return q.age<.18?3:q.age<.3?2:1;
}
export function updateFortWindows(s,dt,shoot){
 const b=s.boss;fortWindows(s);
 for(const q of b.windows)q.flash=Math.max(0,q.flash-dt);
 const active=b.windows.find(q=>q.hp>0&&q.phase!=='closed');
 if(!active){
  b.windowWait=(b.windowWait??1.8)-dt;if(b.windowWait>0)return;
  const alive=b.windows.filter(q=>q.hp>0);if(!alive.length)return;
  const q=alive[(b.windowTurn||0)%alive.length];b.windowTurn=(b.windowTurn||0)+1;
  const port=fortWindows(s).find(p=>p.id===q.id);
  q.phase='opening';q.age=0;q.dir=Math.sign(s.player.x-port.x)||-1;q.targetX=s.player.x;q.targetY=s.player.y-26;return;
 }
 const q=active;q.age+=dt;
 if(q.phase==='opening'&&q.age>=.55){q.phase='aim';q.age=0;}
 else if(q.phase==='aim'&&q.age>=1.05){
  const port=fortWindows(s).find(p=>p.id===q.id),x=port.x+q.dir*24*FORT_SCALE,y=port.y+7*FORT_SCALE,flight=1.3,gravity=230;
  const vx=(q.targetX-x)/flight,vy=(q.targetY-y-.5*gravity*flight*flight)/flight;
  shoot(s,x,y,Math.atan2(vy,vx),Math.hypot(vx,vy),'ember-window',{ember:true,element:'fire',r:12,drawSize:48,gravity,life:3,window:q.id});
  q.phase='fire';q.age=0;s.events.push('cannon');
 }else if(q.phase==='fire'&&q.age>=.2){q.phase='closing';q.age=0;}
 else if(q.phase==='closing'&&q.age>=.48){q.phase='closed';q.age=0;b.windowWait=.8;}
}
