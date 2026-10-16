import {FORT_SCALE} from './fortGeometry';
import {fireImpact} from './harlequinFire';
export function breakFortCannon(s,point,angle=0){
 const scale=156*FORT_SCALE/513;
 for(let i=0;i<4;i++){
  const dx=(513*(i+.5)/4-365)*scale,dy=(319/2-204)*scale;
  (s.organDebris??=[]).push({art:'barge-cannon',crop:[i/4,0,.25,1],x:point.x+Math.cos(angle)*dx-Math.sin(angle)*dy,y:point.y+Math.sin(angle)*dx+Math.cos(angle)*dy,
   w:513/4*scale,h:319*scale,vx:(i-1.5)*85,vy:-135-i%2*85,rotation:angle,spin:(i%2?1:-1)*1.5,age:0,life:2.8,floor:s.level.arena.y,water:false});
 }
}
export function fortRupture(s,x,y,seed){
 fireImpact(s,x,y,.72+seed%3*.16);
 for(let i=0;i<6;i++)s.effects.push({cinematicSmoke:true,soot:i%3!==0,x:x+(i-2.5)*24,y,size:120+i*27,vx:(i-2.5)*30,vy:-42-i*12,age:0,life:2.4+i*.15,duration:2.4+i*.15,seed:seed+i});
 for(let i=0;i<7;i++){
  const metal=i%2===0,source=metal?[.27,.81,.045,.065]:[.65,.67,.043,.065],a=seed*2.39+i*.91;
  (s.organDebris??=[]).push({art:'ember-fort',crop:source,x,y,w:metal?28:20,h:metal?34:43,vx:Math.cos(a)*(180+i*25),vy:-160-Math.abs(Math.sin(a))*230,rotation:a,spin:(i%2?1:-1)*(3+i*.3),age:0,life:3.2,floor:s.level.arena.y,jagged:true});
 }
}
export function fortCollapseCover(s,frame){
 for(let i=0;i<9;i++){
  const duration=1.25+i%3*.12;
  s.effects.push({cinematicSmoke:true,dust:true,x:s.boss.x-440+i*110,y:s.boss.y-70-(i%3)*165,size:210+i%3*55,
   vx:(i-4)*18,vy:-25-i%3*15,age:0,life:duration,duration,seed:frame*13+i,alpha:1.25});
 }
}
