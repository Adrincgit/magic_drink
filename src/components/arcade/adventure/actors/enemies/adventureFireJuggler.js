import {enemyMuzzle} from './adventureEnemyGeometry';
export function updateFireJuggler(s,e,dt,shoot){
 if(e.trap>0)return;
 const near=Math.abs(s.player.x-e.x)<460&&Math.abs(s.player.y-e.y)<180;
 e.y=e.baseY;e.fireState??='patrol';e.fireAge=(e.fireAge||0)+dt;
 const enter=state=>{e.fireState=state;e.fireAge=0;};
 if(e.fireState==='patrol'){
  const next=e.x+e.dir*42*dt;
  if(Math.abs(next-e.home)>125||s.level.emberPits?.some(q=>next>q.x-35&&next<q.x+q.w+35))e.dir*=-1;else e.x=next;
  if(near&&e.timer<=0){e.dir=Math.sign(s.player.x-e.x)||e.dir;enter('windup');e.timer=1.15;s.events.push('emberInhale');}
 }else if(e.fireState==='windup'&&e.fireAge>=1.15){
  enter('attack');
  const mouth=enemyMuzzle(e);
  shoot(s,mouth.x,mouth.y,0,0,'ember-breath',{ember:true,element:'fire',owner:e,dir:e.dir,r:0,life:1.65,duration:1.65,range:0});s.events.push('emberBreath');
 }else if(e.fireState==='attack'&&e.fireAge>=1.65)enter('recover');
 else if(e.fireState==='recover'&&e.fireAge>=.85){enter('patrol');e.timer=s.gentle?2.2:1.5;}
 e.phase=e.fireState;
}
export function fireBreatherFrame(e,reduced=false){
 if(e.hp<=0)return 23;
 if(e.phase==='windup')return 8+Math.min(3,Math.floor((e.fireAge||0)/1.15*4));
 if(e.phase==='attack')return 12+(reduced?2:Math.floor((e.fireAge||0)*11)%8);
 if(e.phase==='recover')return 20+Math.min(3,Math.floor((e.fireAge||0)/.85*4));
 return reduced?0:Math.floor((e.gait||0)*12)%8;
}
