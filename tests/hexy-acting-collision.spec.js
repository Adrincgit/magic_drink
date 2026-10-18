import {test,expect} from '@playwright/test';
import sharp from 'sharp';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import actingAtlas from '../src/components/arcade/adventure/actors/hexy/hexyActingAtlas';
import {beginSuper} from '../src/components/arcade/adventure/engine/adventureSuper';
import {SUPER_WINDUP,SUPER_DURATION} from '../src/components/arcade/adventure/engine/adventureMagic';
import {beamPath} from '../src/components/arcade/adventure/engine/adventureVolt';
import {equipDrink} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {hitVillageObstacles,villageObstaclePlatform} from '../src/components/arcade/adventure/engine/villageObstacles';
import {hitVillageRubble} from '../src/components/arcade/adventure/engine/villageResistance';
import {configureDrinkShot,stepCreativeShot} from '../src/components/arcade/adventure/engine/adventureCreativeDrinks';
import {stepExtraShot} from '../src/components/arcade/adventure/engine/adventureExtraDrinks';
import {projectileWaterContact} from '../src/components/arcade/adventure/engine/adventureWaterContact';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {groundAt,groundY} from '../src/components/arcade/adventure/world/adventureTerrain';

const tick=(s,input={},n=1)=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function quiet(index=0){const s=createAdventure(index);for(const k of ['enemies','hazards','supplies','outposts','graves','cages','pickups'])s[k]=[];s.player.hurt=999;return s;}

for(const air of [false,true])for(const aim of [{right:true},{right:true,up:true},{up:true},{right:true,down:true},{down:true}])test(`ultimate has moving anticipation and sustained cels ${JSON.stringify(aim)} air=${air}`,()=>{
 const s=quiet(),p=s.player;Object.assign(p,{x:1000,y:air?260:480,ground:air?null:0});beginSuper(s,{super:true,...aim});
 const prep=new Set(),cast=new Set(),tips=[];
 for(let i=0;i<SUPER_DURATION*120;i++){
  const q=s.superCinematic;if(!q)break;const pose=hexyPose(s),m=hexyMuzzle(s);
  (q.age<SUPER_WINDUP?prep:cast).add(pose.sheet+':'+pose.frame);
  expect(Number.isFinite(m.x)&&Number.isFinite(m.y)).toBe(true);
  if(q.age>=SUPER_WINDUP)tips.push({dx:m.x-p.x,dy:m.y-p.y});
  tick(s,{super:true,...aim});
 }
 expect(prep.size).toBe(4);expect(cast.size).toBeGreaterThanOrEqual(3);
 expect([...prep].some(p=>cast.has(p))).toBe(false);
 // A star can move with recoil, but must not jump to the small hat star.
 expect(Math.max(...tips.map(q=>q.dx))-Math.min(...tips.map(q=>q.dx))).toBeLessThan(25);
 expect(Math.max(...tips.map(q=>q.dy))-Math.min(...tips.map(q=>q.dy))).toBeLessThan(25);
});

test('all new measured wand tips land on opaque gold pixels',async()=>{
 for(const [sheet,cels]of Object.entries(actingAtlas)){
  const {data,info}=await sharp('public/arcade/sprites/hexy/'+sheet+'.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(const [frame,{tip}]of cels.entries()){
   let gold=false;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){
    const x=frame%4*320+Math.round(tip[0])+dx,y=Math.floor(frame/4)*320+Math.round(tip[1])+dy,k=(y*info.width+x)*4;
    if(data[k]>160&&data[k+1]>120&&data[k+2]<140&&data[k+3]>80)gold=true;
   }
   expect(gold,sheet+':'+frame).toBe(true);
  }
 }
});

test('low health keeps the accepted moving drawings after retiring the rejected expression',()=>{
 const s=quiet(),p=s.player;Object.assign(p,{ground:0,vx:95});
 for(const hearts of [1,2])for(const action of ['run','run-fire','run-diagonal-up']){
  s.hearts=hearts;Object.assign(p,{cast:action==='run-fire'?.2:0,aimY:action==='run-diagonal-up'?-.707:0,aimX:1});const frames=new Set();
  for(let i=0;i<12;i++){p.stride=i/12+.001;const pose=hexyPose(s);expect(pose.sheet).toBe(action);frames.add(pose.frame);}
  expect(frames.size).toBe(12);s.hearts=s.maxHearts;expect(hexyPose(s).sheet).toBe(action);
 }
});

test('Volt damages intact debris, then ignores its retained gone platform and freed rubble',()=>{
 const s=quiet(7),r=s.villageObstacles.find(q=>q.kind!=='step'),platform=villageObstaclePlatform(s,r);
 s.villageObstacles=[r];s.platforms=s.platforms.filter(p=>!p.villageObstacle||p===platform);s.villageRubble=[];
 const from={x:r.x-r.w/2-80,y:r.y-40},d={x:1,y:0},target=makeEnemy(r.x+r.w/2+80,r.y,0);target.hp=100;target.timer=999;s.enemies=[target];
 const intact=beamPath(s,from,d,true);expect(intact.hits[0]?.target).toBe(r);
 const impact=intact.hits[0].point;hitVillageObstacles(s,{...impact,kind:9,voltProbe:true,hidden:true,life:1,damage:r.hp+1},12);
 expect(r.broken).toBe(true);expect(platform.gone).toBe(true);expect(beamPath(s,from,d,true).hits[0]?.target).toBe(target);
 const rubble={id:'regression-rubble',x:r.x,y:r.y,hp:2};s.villageRubble=[rubble];expect(beamPath(s,from,d,true).hits[0]?.target).toBe(rubble);
 hitVillageRubble(s,{x:rubble.x,y:rubble.y-35,kind:9,life:1,damage:4},12);expect(rubble.freed).toBe(true);expect(beamPath(s,from,d,true).hits[0]?.target).toBe(target);
});

test('Jelly, Prism and Honey do not bounce or rest on a destroyed platform',()=>{
 const s=quiet(7),r=s.villageObstacles.find(q=>q.kind!=='step'),platform=villageObstaclePlatform(s,r);hitVillageObstacles(s,{x:r.x,y:r.y-30,kind:0,life:1,damage:r.hp+1},0);
 for(const kind of [6,7,10]){
  const q=configureDrinkShot({kind,x:r.x,y:platform.y+3,previousX:r.x,previousY:platform.y-30,vx:0,vy:200,r:4,scale:1,age:0,life:1,hits:[]});q.vy=200;
  const life=q.life;if(kind===10)stepExtraShot(s,q,1/120);else stepCreativeShot(s,q,1/120);
  expect(q.life).toBe(life);expect(q.vy).toBeGreaterThan(0);expect(q.bounces||0).toBe(0);
 }
});

test('a held Volt channel breaks the real obstacle and then damages the enemy behind it',()=>{
 const s=quiet(7),r=s.villageObstacles.find(q=>q.kind!=='step'),platform=villageObstaclePlatform(s,r),p=s.player;
 s.villageObstacles=[r];s.villageRubble=[];s.villagers=[];r.ambush=false;r.hp=1;s.platforms=s.platforms.filter(q=>!q.villageObstacle||q===platform);
 p.x=r.x-r.w/2-130;p.y=groundY(s.platforms,p.x);p.ground=s.platforms.indexOf(groundAt(s.platforms,p.x));
 const e=makeEnemy(r.x+r.w/2+70,groundY(s.platforms,r.x+r.w/2+70),25);e.timer=999;e.hp=100;s.enemies=[e];equipDrink(s,9);s.modLevels['starter-9']=3;
 tick(s,{attack:true},180);expect(r.broken).toBe(true);expect(e.hp).toBeLessThan(100);expect(s.voltBeam.segments[0].to.x).toBeGreaterThan(r.x+r.w/2);
});

for(const index of [1,2])for(const type of [8,9])test(`shots from the bridge reach swimming enemy ${type} level ${index}`,()=>{
 const s=quiet(index),river=s.level.rivers[0],x=river.x+230,deck=groundY(s.platforms,x),p=s.player;
 Object.assign(p,{x,y:deck,ground:s.platforms.indexOf(groundAt(s.platforms,x)),vx:0,vy:0});
 const targetX=x+155,e=makeEnemy(targetX,deck,type);Object.assign(e,{active:true,hp:100,maxHp:100,timer:999,phase:type===8?'swim':'sail',aquatic:true,boat:true,waterY:deck+(type===8?134:143),y:deck+148,phaseAge:0,diveWait:999,surfaceWait:999,swimAge:-999,swimClock:0,home:targetX,left:targetX,right:targetX,sailDir:1});s.enemies=[e];
 tick(s,{hold:true,down:true,attack:true},100);expect(e.hp).toBeLessThan(100);
 expect(river.shotSurfaceY).toBeGreaterThan(e.waterY);
 s.enemies=[];s.effects=[];tick(s,{hold:true,down:true,attack:true},100);expect(s.effects.some(f=>f.bargeSplash&&f.y===river.shotSurfaceY)).toBe(true);
});

test('a bullet passes the painted water edge before making exactly one splash below the navigation lane',()=>{
 const s=quiet(2),r=s.level.rivers[0],q={x:r.x+150,y:r.y+20,previousX:r.x+150,previousY:r.y-20,r:8,life:1};
 expect(projectileWaterContact(s,q)).toBe(false);expect(q.life).toBe(1);
 q.previousY=q.y;q.y=r.shotSurfaceY+50;expect(projectileWaterContact(s,q)).toBe(true);expect(q.y).toBe(r.shotSurfaceY);expect(projectileWaterContact(s,q)).toBe(false);expect(s.effects.filter(f=>f.bargeSplash)).toHaveLength(1);
});
