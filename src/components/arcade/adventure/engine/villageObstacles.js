import {worldSound} from './adventureWorldAudio';
import {groundY,surfaceY} from '../world/adventureTerrain';
import {makeEnemy} from '../actors/enemies/adventureEnemies';

export function prepareVillageObstacles(s){
 const previous=new Map((s.villageObstacles||[]).map(q=>[q.id,q]));
 s.villageObstacles=(s.level.obstacles||[]).map(q=>({...q,maxHp:q.hp,...previous.get(q.id)}));
 s.platforms=s.platforms.filter(q=>!q.villageObstacle);
 for(const r of s.villageObstacles)s.platforms.push({x:r.x-r.w/2,y:r.y-r.h,w:r.w,h:r.h,profile:r.profile,kind:'village-obstacle',villageObstacle:r.id,gone:!!r.broken,dx:0,dy:0});
 s.villageDebris=[];
}
export function villageObstaclePlatform(s,r){return s.platforms.find(q=>q.villageObstacle===r.id);}
export function blockVillageEscape(s,npc,nextX){
 const half=18;let x=nextX;npc.blocked=false;npc.blockedBy=null;
 for(const r of s.villageObstacles||[])if(r.kind!=='step'&&!r.broken&&npc.x>=r.x+r.w/2+half-2&&x<r.x+r.w/2+half){x=r.x+r.w/2+half;npc.blocked=true;npc.blockedBy=r.id;}
 for(const other of s.villagers||[]){
  if(other===npc||other.state!=='flee'||!other.blocked||other.x>=npc.x)continue;
  const edge=other.x+48;if(npc.x>=edge-2&&x<edge){x=edge;npc.blocked=true;npc.blockedBy=other.blockedBy;}
 }
 return x;
}
export function resolveVillageWalls(s,oldX,oldY,support){
 if(!s.level.villageTrail)return;
 const p=s.player;
 for(const r of s.villageObstacles||[]){
  const platform=villageObstaclePlatform(s,r),top=surfaceY(platform,p.x);
  if(r.broken||support===platform&&p.x+13>platform.x&&p.x-13<platform.x+platform.w||p.y<=top+7||oldY<=top+7&&p.vy>=0)continue;
  const left=r.x-r.w/2-14,right=r.x+r.w/2+14;
  if(p.x>left&&p.x<right){p.x=oldX<=left?left:oldX>=right?right:Math.abs(oldX-left)<Math.abs(oldX-right)?left:right;p.vx=0;p.dash=0;}
 }
}
function breakVillageObstacle(s,r){
 r.broken=true;r.hp=0;r.breakAge=0;
 const platform=villageObstaclePlatform(s,r);if(platform){platform.gone=true;if(s.platforms[s.player.ground]===platform)s.player.ground=null;}
 for(let i=0;i<(r.blockade?18:9);i++)s.villageDebris.push({x:r.x+(i%3-1)*r.w*.24,y:r.y-r.h*.55,vx:(i%9-4)*44,vy:-160-(i%4)*48,age:0,life:1.6,spin:(i%2?1:-1)*(4+i*.5),rotation:i,key:r.blockade?'village-collapse-v10':'village-obstacles-v8',frame:r.blockade?6+i%2:12+i%4,size:(r.blockade?36:25)+i%3*8});
 s.hitStop=Math.max(s.hitStop,.045);s.shake=Math.max(s.shake,.12);worldSound(s,r.blockade?'wallCollapse':r.kind==='wagon'?'wagonBreak':'woodBreak',r.x,r.y);
}
function segmentBox(q,b){
 let lo=0,hi=1;for(const [a,d,min,max] of [[q.previousX??q.x,q.x-(q.previousX??q.x),b.x,b.x+b.w],[q.previousY??q.y,q.y-(q.previousY??q.y),b.y,b.y+b.h]]){if(Math.abs(d)<1e-8){if(a<min||a>max)return false;}else{const x=(min-a)/d,y=(max-a)/d;lo=Math.max(lo,Math.min(x,y));hi=Math.min(hi,Math.max(x,y));if(lo>hi)return false;}}return true;
}
export function hitVillageObstacles(s,shot,radius=0){
 if(!s.level.villageTrail||shot.life<=0||shot.chainTarget||shot.hidden&&!shot.aquaProbe&&!shot.voltProbe)return;
 const candidates=(s.villageObstacles||[]).filter(r=>!r.broken&&!(shot.obstacleHits||[]).includes(r.id)&&segmentBox(shot,{x:r.x-r.w/2-radius,y:r.y-r.h-radius,w:r.w+radius*2,h:r.h+radius*2})).sort((a,b)=>Math.abs(a.x-(shot.previousX??shot.x))-Math.abs(b.x-(shot.previousX??shot.x)));
 for(const r of candidates){
  (shot.obstacleHits??=[]).push(r.id);r.hp-=shot.damage||1;r.hit=.18;
  if(r.hp<=0)breakVillageObstacle(s,r);else worldSound(s,r.blockade?'rubbleHit':'woodHit',r.x,r.y);
  // A normal projectile meets a real solid surface; strong casts can break
  // through and keep travelling. Popcorn pellets share one physical cast.
  if(!shot.heavy&&!shot.piercing&&!shot.popcornStrong){shot.life=0;break;}
 }
}
export function stepVillageObstacles(s,dt){
 if(!s.level.villageTrail)return;
 for(const r of s.villageObstacles||[]){
  r.hit=Math.max(0,(r.hit||0)-dt);if(r.broken){r.breakAge+=dt;continue;}
  if(!r.ambush||Math.abs(s.player.x-r.x)>760)continue;
  r.pressure=(r.pressure||0)+dt;
  const wave=r.waves||0;if(wave>=(r.secondWave?2:1)||wave===1&&r.pressure<5)continue;
  r.waves=wave+1;
  for(const [i,type] of [25,18].entries()){
   const x=Math.min(s.level.width-200,r.x+440+wave*100+i*105),e=makeEnemy(x,groundY(s.level.route,x),type,20000+Number(r.id.split(':').at(-1))*10+wave*2+i);
   Object.assign(e,{active:true,timer:.8+i*.4,dir:-1,villageAmbush:r.id});s.enemies.push(e);
  }
 }
 for(const q of s.villageDebris||[]){q.age+=dt;q.life-=dt;q.vy+=750*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.rotation+=q.spin*dt;const floor=groundY(s.level.route,q.x)-5;if(q.y>floor){q.y=floor;q.vy=0;q.vx*=.8;q.spin*=.7;}}
 s.villageDebris=(s.villageDebris||[]).filter(q=>q.life>0);
}
