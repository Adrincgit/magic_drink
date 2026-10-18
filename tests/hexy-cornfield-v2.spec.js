import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,playerBody,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {damageActTwoBoss,stepActTwoBoss,actTwoBossDrawing} from '../src/components/arcade/adventure/actors/bosses/adventureActTwoBosses';
import {makeEnemy,enemyShot,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {prepareCornEnemy,hitActTwoObjects} from '../src/components/arcade/adventure/engine/actTwoRoute';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {beginCandyCapture} from '../src/components/arcade/adventure/engine/villageRescue';
import {cornKingMuzzle} from '../src/components/arcade/adventure/actors/bosses/cornfieldKing';
import {CORN_CARTOON_CELL,CORN_CARTOON_MUZZLES} from '../src/components/arcade/adventure/actors/cornfieldCartoonRegistration';
const tick=(s,time,input={})=>{for(let i=0;i<time*120;i++)stepAdventure(s,input,1/120);};
const fight=()=>{const s=createAdventure(8);s.enemies=[];s.supplies=[];s.player.x=s.level.arena.entry+120;s.player.hurt=999;tick(s,3);return s;};
test('all optional drying-shed routes and three rescues are reachable with normal jumps',()=>{
 const s=createAdventure(8);s.enemies=[];s.actTwoAmbushes=[];s.player.hurt=999;
 const reached=[];
 for(const q of s.platforms.filter(q=>q.kind!=='earth').sort((a,b)=>a.x-b.x)){
  const target=q.x+q.w*.5;let jumping=false,age=0,arrived=false;
  for(let frame=0;frame<1800;frame++){
   const p=s.player,dx=target-p.x,input={right:dx>8,left:dx< -8};
   if(!jumping&&p.ground!==null&&Math.abs(dx)<250){jumping=true;age=0;}
   if(jumping){age+=1/120;input.jump=!(age>.37&&age<.39);}
   stepAdventure(s,input,1/120);
   if(p.ground===s.platforms.indexOf(q)){arrived=true;reached.push(q);break;}
   if(jumping&&age>2.5&&p.ground!==null)jumping=false;
  }
  expect(arrived,`unreachable ${q.x},${q.y}; Hexy ${s.player.x},${s.player.y}`).toBe(true);
 }
 for(const cage of s.cages)expect(reached.some(q=>cage.x>=q.x&&cage.x<=q.x+q.w&&cage.y===q.y)).toBe(true);
});
test('the entire lower trail can be crossed with actual running, jumping and firing',()=>{
 const s=createAdventure(8);s.player.hurt=999;const seen=new Set();
 for(let i=0;i<120*110&&!s.arenaLocked;i++){
  stepAdventure(s,{right:true,attack:true,jump:i%360>275},1/120);
  for(const a of s.actTwoAmbushes)if(a.fired)seen.add(a.x);
  expect(Number.isFinite(s.player.x+s.player.y)).toBe(true);
 }
 expect(s.arenaLocked,`stuck at ${s.player.x},${s.player.y}`).toBe(true);expect(seen.size).toBe(6);
 expect(s.player.x).toBeGreaterThan(13900);expect(s.hearts).toBe(s.maxHearts);
});
test('corn ambushes rustle first, emerge without an attack and never respawn',()=>{
 const s=createAdventure(8),a=s.actTwoAmbushes[0];s.enemies=[];s.player.x=a.x-250;s.player.hurt=999;
 tick(s,.1);expect(a.warning).toBeGreaterThan(1);expect(s.enemies).toHaveLength(0);
 tick(s,1.2);expect(a.fired).toBe(true);expect(s.enemies).toHaveLength(2);expect(s.enemies.every(e=>e.cornEmerge&&e.emerging>.65)).toBe(true);
 tick(s,.6);expect(s.hostile).toHaveLength(0);tick(s,5);expect(s.enemies).toHaveLength(2);
 retryAdventure(s);expect(s.actTwoAmbushes.every(q=>!q.fired)).toBe(true);expect(s.cornHazards).toEqual([]);
});
test('corn imps have a distance-driven twelve-pose gait and independent throwing/rushing roles',()=>{
 const s=createAdventure(8);s.player.x=300;s.player.hurt=999;
 for(const [seed,role]of [[0,'thrower'],[1,'runner']]){
  s.player.x=300;const e=prepareCornEnemy(makeEnemy(900,480,29,seed));s.enemies=[e];e.timer=99;const poses=new Set();
  for(let i=0;i<220;i++){updateEnemies(s,1/120,playerBody,()=>{});poses.add(enemyDrawing(e).frame);}
  expect(e.cornRole).toBe(role);expect(poses.size).toBeGreaterThanOrEqual(10);
  e.timer=0;s.player.x=e.x-250;s.hostile=[];let windup=false,attackX;
  for(let i=0;i<220;i++){updateEnemies(s,1/120,playerBody,()=>{});if(e.phase==='windup')windup=true;if(e.phase==='attack')attackX??=e.x;}
  expect(windup).toBe(true);if(role==='thrower')expect(s.hostile.some(q=>q.corn)).toBe(true);else{expect(s.hostile).toHaveLength(0);expect(Math.abs(e.x-attackX)).toBeGreaterThan(70);}
 }
});
test('a crow fixes its dive target after warning and can return to flight',()=>{
 const s=createAdventure(8),e=prepareCornEnemy(makeEnemy(650,300,32));s.enemies=[e];s.player.x=350;s.player.hurt=999;e.timer=0;
 updateEnemies(s,1/120,playerBody,()=>{});expect(e.phase).toBe('windup');const aim={...e.aim};s.player.x=250;
 let lowest=0;for(let i=0;i<260;i++){updateEnemies(s,1/120,playerBody,()=>{});lowest=Math.max(lowest,e.y);}
 expect(e.aim).toEqual(aim);expect(lowest).toBeGreaterThan(430);expect(e.phase).toBe('recover');expect(s.hostile).toHaveLength(0);
});
test('destroying a supporting bale drops a scarecrow onto the real floor',()=>{
 const s=createAdventure(8),q=s.platforms.find(q=>q.solid),e=prepareCornEnemy(makeEnemy(q.x+50,q.y,29));s.enemies=[e];s.player.x=q.x-100;e.timer=99;
 updateEnemies(s,1/120,playerBody,()=>{});hitActTwoObjects(s,{x:q.x+30,y:q.y+30,life:1,damage:100,heavy:true},20);
 for(let i=0;i<150;i++)updateEnemies(s,1/120,playerBody,()=>{});
 expect(e.y).toBeCloseTo(groundY(s.level.route,e.x),0);
});
test('each phase completes its distinct attack cycle, warnings and punish windows within bounds',()=>{
 for(const stage of [1,2]){
  const s=fight(),b=s.boss;Object.assign(b,{stage,phase:'patrol',timer:0,turn:0});const moves=new Set(),windows=new Set();
  for(let i=0;i<120*32;i++){
   stepActTwoBoss(s,1/120,{makeEnemy,shoot:enemyShot});
   expect(Number.isFinite(b.x+b.y)).toBe(true);expect(b.x).toBeGreaterThan(s.level.arena.left+50);expect(b.x).toBeLessThan(s.level.arena.right-50);
   if(b.phase==='windup'){moves.add(b.move);expect(b.vulnerable).toBe(true);}
   if(b.phase==='recover'&&b.vulnerable)windows.add(b.move);
  }
  expect([...moves].sort()).toEqual((stage===1?['fan','rush','rain']:['roots','leap','harvest','summon','rush']).sort());expect(windows.size).toBe(moves.size);
  if(stage===2)expect(s.enemies.filter(e=>e.summoned)).toHaveLength(2);
 }
});
test('roots warn for 1.15 seconds, leave gaps and can be jumped',()=>{
 const s=fight(),b=s.boss;Object.assign(b,{stage:2,phase:'patrol',timer:0,turn:0});tick(s,.03);
 expect(s.cornHazards).toHaveLength(3);const q=s.cornHazards[1];s.player.x=q.x;s.player.hurt=0;const hp=s.hearts;
 tick(s,1);expect(s.hearts).toBe(hp);tick(s,.25);expect(s.hearts).toBe(hp-1);
 s.player.hurt=0;s.player.x=q.x+120;tick(s,.25);expect(s.hearts).toBe(hp-1);
 const jumping=fight();Object.assign(jumping.boss,{stage:2,phase:'patrol',timer:0,turn:0});tick(jumping,.03);jumping.player.x=jumping.cornHazards[1].x;jumping.player.hurt=0;
 tick(jumping,.85);tick(jumping,.4,{jump:true});expect(jumping.player.y).toBeLessThan(jumping.level.arena.y-90);expect(jumping.hearts).toBe(jumping.maxHearts);
});
test('two forms use different authored atlases and the transformation cannot be skipped',()=>{
 const s=fight(),b=s.boss;expect(actTwoBossDrawing(s).key).toMatch(/^corn-king/);b.vulnerable=true;damageActTwoBoss(s,9999);expect(b.hp).toBe(b.maxHp/2);
 tick(s,2);expect(b.stage).toBe(2);expect(b.phase).toBe('rebuild');expect(actTwoBossDrawing(s).key).toBe('corn-harvest');expect(b.vulnerable).toBe(false);
 for(const q of s.strawPiles)hitActTwoObjects(s,{x:q.x,y:q.y-30,life:1,damage:10,heavy:true},40);
 tick(s,3.3);expect(b.hp).toBe(b.maxHp/2);expect(b.rebuilt).toBe(true);
});
test('the cornfield witch can finish the candy capture without relying on village-only state',()=>{
 const s=createAdventure(8),e=s.enemies.find(e=>e.type===26);s.enemies=[e];s.player.x=e.x-150;e.active=true;s.player.hurt=999;
 beginCandyCapture(s,{kind:'candy-ray',owner:`witch:${e.spawnSeed}:${e.home}`});tick(s,7);
 expect(s.playerDefeat).toBeTruthy();expect(s.enemies.some(e=>e.playerSoul)).toBe(true);
});
test('cartoon hand and pitchfork registrations follow the displayed cel and mirror around the actor',()=>{
 const s=fight(),b=s.boss;
 for(const stage of [1,2])for(const phaseAge of [.03,.5]){
  Object.assign(b,{stage,phase:'attack',move:stage===1?'fan':'harvest',phaseAge,dir:-1});
  const d=actTwoBossDrawing(s),point=CORN_CARTOON_MUZZLES[stage===1?'king':'harvest'][d.frame],left=cornKingMuzzle(s);
  expect(left.x).toBeCloseTo(b.x+(point[0]/CORN_CARTOON_CELL-.5)*d.size,5);expect(left.y).toBeCloseTo(b.y+(point[1]/CORN_CARTOON_CELL-.975)*d.size,5);
  b.dir=1;const right=cornKingMuzzle(s);expect(left.x+right.x).toBeCloseTo(b.x*2,5);expect(left.y).toBe(right.y);
 }
 Object.assign(b,{stage:1,phase:'windup',phaseDuration:.9,phaseAge:.1,dir:-1});const raised=cornKingMuzzle(s);b.phaseAge=.7;const crouched=cornKingMuzzle(s);expect(Math.hypot(raised.x-crouched.x,raised.y-crouched.y)).toBeGreaterThan(80);
});
