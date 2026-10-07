import {organAnchor,organPipes,organMouths,organBassMouth,organMechanism,organDriveRect} from './organMechanism';
import {breakOrganArmor} from './organDestruction';
import {prepareOrganCharge,stepOrganCharge} from './organCharge';
export {organAnchor,organPipes,organMouths} from './organMechanism';
export const ORGAN_MOVES=['organ-fanfare','organ-chords','organ-bellows','organ-charge'];
export const organProjectileSize=s=>({note:s.boss.transformed?114:102,noteRadius:s.boss.transformed?29:26,wave:s.boss.transformed?136:122,waveRadius:s.boss.transformed?26:23});
export function organShotScale(q){const t=Math.max(0,Math.min(1,(q.age||0)/(q.growthTime||1)));return q.growthTime ? .8+.2*t*t*(3-2*t) : 1;}
export function stepOrganWave(q,dt){
 q.x+=q.vx*dt;const t=Math.min(1,Math.abs(q.x-q.launchX)/160);
 const height=(q.r||16)+2;q.y=q.floor-height+(q.launchY-q.floor+height)*(1-t)*(1-t);
}
function organContact(s,helpers){
 const body=organCollision(s),player=helpers.body(s.player);
 if(player.x<body.x+body.w&&player.x+player.w>body.x&&player.y<body.y+body.h&&player.y+player.h>body.y){
  s.damage();const p=s.player;
  p.x=p.x<body.x+body.w/2?body.x-(player.x+player.w-p.x)-.5:body.x+body.w+(p.x-player.x)+.5;p.vx=0;
 }
}
export function stepOrganRain(q,s,dt){
 if(q.rain==='rise'){
  q.x+=q.vx*dt;q.y+=q.vy*dt;
  if(q.y<q.ceiling){q.rain='wait';q.x=q.targetX;q.y=q.ceiling;q.vx=0;q.vy=0;}
 }else if(q.rain==='wait'){
  q.wait-=dt;if(q.wait<=0){q.rain='fall';q.vy=100;}
 }else{q.vy+=q.gravity*dt;q.y+=q.vy*dt;}
}
function organHull(m){const {x,y}=m.anchor,r=organDriveRect(m.drive,m.body),left=Math.min(x-170,r.x),top=Math.min(y-349,r.y);return{x:left,y:top,w:Math.max(x+170,r.x+r.w)-left,h:y-top};}
export function organCollision(s){return organHull(organMechanism(s));}
export function organTargets(s){const m=organMechanism(s),{body,drive}=m,r=organDriveRect(drive,{x:body.x,y:body.y+48,w:body.w,h:body.h-112}),hull=organHull(m);return[{...r,x:hull.x,w:hull.w}];}
export function organShellDrawing(s){
 // Logical phases for HUD/debug tools. Painting uses moving full-size parts.
 const b=s.boss,key='organ-machine';
 if(b.hp<=0)return{key,frame:(b.deadTime||0)<.85?14:15};
 if(b.phase==='transform')return{key,frame:[3,4,5,6,7,8][Math.min(5,Math.max(0,Math.floor((2.6-b.timer)/2.6*6)))]};
 const pressing=b.release>.13,recoil=b.release>0,preparing=b.phase==='warn'||b.phase==='attack'&&b.shotClock<=.14;
 return{key,frame:b.transformed?(pressing?10:recoil?(b.move==='organ-finale'?12:11):preparing?9:13):(pressing?2:recoil?3:preparing?0:1)};
}
export function updateOrganFortress(s,dt,helpers,shoot){
 const b=s.boss,a=s.level.arena,p=s.player,home=a.right-345;
 const target=b.phase==='attack'?-45-35*Math.sin(Math.min(1,(b.attackClock||0)/2.8)*Math.PI):b.phase==='warn'?-28:0;
 const previous=b.x;
 if(!(b.move==='organ-charge'&&b.charge)){
  b.driveOffset=(b.driveOffset||0)+(target-(b.driveOffset||0))*Math.min(1,dt*1.8);
  b.x=home+b.driveOffset+(b.phase==='intro'?Math.max(0,b.timer/2.2)*310:0);
  b.driveSpeed=(b.x-previous)/dt;
 }
 b.y=a.y;b.dir=-1;
 b.steamRelease=Math.max(0,(b.steamRelease||0)-dt);
 if(b.hp<=b.maxHp*.5&&!b.transformed&&!['intro','sleep'].includes(b.phase)){
  b.transformed=true;b.phase='transform';b.timer=2.6;b.vulnerable=false;b.turn=0;b.charge=null;s.hostile=[];s.shake=.25;b.steamRelease=.65;s.events.push('towerTransform','organSteam');
 }
 if(b.phase==='intro'){b.vulnerable=false;if(b.timer<=0){b.phase='recover';b.timer=1;}return;}
 if(b.phase==='transform'){
  b.vulnerable=false;if(b.timer<1.48&&!b.armorBroken)breakOrganArmor(s);
  if(b.timer<=0){b.phase='recover';b.timer=1.7;b.vulnerable=true;}return;
 }
 if(stepOrganCharge(s,dt)){organContact(s,helpers);return;}
 if(b.phase==='warn'){
  b.vulnerable=true;
  if(b.timer<=0){b.phase='attack';b.timer=b.move==='organ-fanfare'?2.35:b.move==='organ-finale'?5.8:b.transformed?5.2:4.5;b.attackClock=0;b.shotClock=.16;b.volley=0;b.frontVolley=0;b.rainGap=Math.max(a.left+120,Math.min(home-220,p.x+(b.turn%2?95:-95)));}
 }else if(b.phase==='attack'){
  b.attackClock+=dt;b.shotClock-=dt;b.vulnerable=true;
  if(b.shotClock<=0){
   const n=b.volley++,boost=b.transformed?1.18:1,easy=s.gentle?1.22:1;
   b.activeMouth=b.move==='organ-fanfare'?[2,1,0][n%3]:b.move==='organ-bellows'?1:n%2?2:0;b.release=.26;
   const ports=organMouths(s),size=organProjectileSize(s);let fired=false;
   const launch=(x,y,angle,speed,kind,extra)=>shoot(s,x,y,angle,speed,kind,{organ:true,...extra,growthTime:.24,fullRadius:extra.r,r:extra.r*.8});
   const fire=(i,kind,angle,speed,extra={})=>{const q=ports[i];fired=true;launch(q.x,q.y,angle,speed,kind,extra);};
   const front=(i,targetY,speed)=>{
    const q=ports[i],count=b.frontVolley||0;b.frontVolley=count+1;
    // One extra upper note every second front volley: 3 notes per pair, not 2.
    for(const offset of b.transformed&&count%2===1?[0,-72]:[0])fire(i,'note',Math.atan2(targetY+offset-q.y,p.x-q.x),speed,{voice:'red',gravity:0,floor:a.y,r:size.noteRadius,drawSize:size.note,life:7});
   };
   const bass=()=>{b.bassRelease=.3;const q=organBassMouth(s);fired=true;launch(q.x,q.y,Math.PI,b.transformed?355:315,'sound-wave',{floor:a.y,launchX:q.x,launchY:q.y,r:size.waveRadius,drawSize:size.wave,life:7});s.events.push('organLowWave');};
   if(b.move==='organ-fanfare'){
    const i=[2,1,0][n%3],targetY=Math.min(a.y-42,p.y-35);
    front(i,targetY,280*boost);
    if(n%2===1)bass();b.shotClock=(b.transformed?.7:.9)*easy;
   }else{
    const perWave=b.transformed?9:7,batch=n%3,wave=Math.floor(n/3),waves=b.transformed?2:1;
    if(wave<waves){
     const gap=b.rainGap??p.x,left=a.left+170,step=(home-160-left)/(perWave-1),gapWidth=(b.transformed?50:70)*(s.gentle?1.3:1);
     // Omit a lane around a fixed warning gap. Never retarget falling notes.
     for(let j=0;j<3;j++){
      const order=batch*3+j;if(order>=perWave)continue;
      const index=b.move==='organ-bellows'?perWave-1-order:b.move==='organ-finale'?(order%2?perWave-1-Math.floor(order/2):Math.floor(order/2)):order,target=left+index*step;
      if(Math.abs(target-gap)<=gapWidth)continue;
      const q=organPipes(s)[j];fired=true;
      launch(q.x,q.y,-Math.PI/2+(j-1)*.2,490,'note',{rain:'rise',targetX:target,ceiling:Math.min(s.camera.y-90,q.y-180),wait:.9,gravity:b.transformed?660:490,floor:a.y,life:7,r:size.noteRadius,drawSize:size.note});
     }
     b.shotClock=batch===2?1.15:(b.transformed?.36:.44)*easy;
    }else{b.shotClock=.65;}
    if(wave<waves&&b.move!=='organ-chords'&&batch===2){
     bass();if(b.transformed)front(0,a.y-170,285);
    }
   }
   b.release=fired?.26:0;
   if(fired){b.steamRelease=.32;s.events.push(b.move==='organ-fanfare'?'organFanfare':n%2?'organNotesHigh':'organNotes');}
  }
  if(b.timer<=0){b.phase='recover';b.timer=s.gentle?2.5:b.transformed?1.65:2;b.vulnerable=true;}
 }else if(b.timer<=0){
  const moves=b.transformed?['organ-fanfare','organ-chords','organ-charge','organ-bellows','organ-finale','organ-charge']:ORGAN_MOVES;b.move=moves[b.turn++%moves.length];b.phase='warn';b.timer=s.gentle?1.25:1;b.activeMouth=b.move==='organ-fanfare'?2:b.move==='organ-bellows'?1:0;b.vulnerable=true;s.events.push('warning');
  if(b.move==='organ-charge')prepareOrganCharge(s);
 }
 b.bassRelease=Math.max(0,(b.bassRelease||0)-dt);organContact(s,helpers);
}
