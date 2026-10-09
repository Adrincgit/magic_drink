import {fireImpact} from './harlequinFire';
export const HARLEQUIN_ENTRANCE={duration:4.5,dropStart:.65,land:1.6};
const clamp=n=>Math.max(0,Math.min(1,n));
export function harlequinArrivalFrame(age){
 if(age<1.6)return Math.min(3,Math.floor(clamp((age-.65)/.95)*4));
 if(age<1.91)return 4+Math.min(1,Math.floor((age-1.6)/.155));
 if(age<2.44)return 6+Math.min(1,Math.floor((age-1.91)/.265));
 return age<2.7?8:age<3.35?9:age<4.08?10:11;
}
export function beginHarlequinArrival(s){
 const b=s.boss,a=s.level.arena;
 const x=a.right-(a.throwMargin||235);
 b.arrival={age:0,duration:HARLEQUIN_ENTRANCE.duration,fromX:x+155,toX:x,fromY:a.y-650,toY:a.y};
 b.x=b.arrival.fromX;b.y=b.arrival.fromY;b.timer=b.arrival.duration;b.vulnerable=false;s.events.push('harlequinEntrance');
}
export function stepHarlequinArrival(s,dt){
 const b=s.boss,q=b.arrival,t=clamp((q.age-.65)/.95),ease=t*t;
 b.clock+=dt;b.x=q.fromX+(q.toX-q.fromX)*(t*t*(3-2*t));b.y=q.fromY+(q.toY-q.fromY)*ease;
 b.timer=q.duration-q.age;b.dir=Math.sign(s.player.x-b.x)||-1;b.vulnerable=false;
 if(q.age>=1.6&&!q.landed){q.landed=true;fireImpact(s,b.x,q.toY,1.7,true);s.shake=Math.max(s.shake,.3);s.events.push('harlequinEntranceLand');}
 if(q.age>=2.7&&!q.revealed){q.revealed=true;s.events.push('harlequinReady');}
 if(q.age===q.duration){b.x=q.toX;b.y=q.toY;b.phase='recover';b.timer=1;b.vulnerable=true;}
}
