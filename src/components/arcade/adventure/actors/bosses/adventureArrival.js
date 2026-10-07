const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function beginBossArrival(s){
 const b=s.boss,a=s.level.arena,organ=s.index===1;
 const duration=organ?4.6:4.2;
 b.arrival={age:0,duration,fromX:a.right+(organ?380:420),fromY:organ?a.y:a.y-235,
  toX:organ?a.right-345:clamp(s.player.x+430,a.left+430,a.right-240),toY:organ?a.y:a.y-65};
 b.x=b.arrival.fromX;b.y=b.arrival.fromY;b.timer=duration;b.vulnerable=false;
}
export function stepBossArrival(s,dt){
 const b=s.boss,q=b.arrival;if(b.phase!=='intro'||!q)return false;
 q.age=Math.min(q.duration,q.age+dt);const t=q.age/q.duration,ease=t*t*(3-2*t),old=b.x;
 b.clock+=dt;b.timer=q.duration-q.age;b.x=q.fromX+(q.toX-q.fromX)*ease;b.y=q.fromY+(q.toY-q.fromY)*ease;
 b.driveSpeed=(b.x-old)/dt;b.dir=-1;b.crewDir=-1;b.vulnerable=false;
 if(s.index===0)b.y+=Math.sin(q.age*1.6)*9*Math.sin(t*Math.PI);
 if(t===1){b.x=q.toX;b.y=q.toY;b.driveSpeed=0;b.phase='recover';b.timer=1.1;b.vulnerable=true;}
 return true;
}
