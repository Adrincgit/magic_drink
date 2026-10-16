import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {nightmareDrawing} from '../src/components/arcade/adventure/actors/enemies/adventureNightmares';
import {skeletonFrame,skeletonThrowOrigin} from '../src/components/arcade/adventure/actors/enemies/nightmareSkeletonAnimation';
import {beginNightmareDefeat,zombieReleasesSoul,spawnNightmareSoul} from '../src/components/arcade/adventure/engine/adventureNightmareMotion';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
const scene=()=>{const s=createAdventure(6);s.enemies=[];s.graves=[];s.damage=()=>{};place(s,7200);return s;};
function place(s,x){Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w)});}
const tick=(s,n=1)=>{for(let i=0;i<n;i++){s.time+=1/120;s.fxTime+=1/120;updateEnemies(s,1/120,playerBody,()=>{});}};

test('6: an intact skeleton plucks from its ribs and throws repeatedly without needing fallen bones',()=>{
 const s=scene(),e=makeEnemy(7480,525,22);Object.assign(e,{active:true,timer:0,gait:0});s.enemies=[e];const phases=new Set();let reachedRibs=false,release;
 for(let i=0;i<1500;i++){
  if(e.phase==='throw'&&e.timer<=1/120)release=skeletonThrowOrigin({...e,timer:0});const count=s.hostile.length;tick(s);phases.add(e.phase);
  if(e.phase==='pluck')reachedRibs||=skeletonFrame(e)===10;
  if(s.hostile.length>count){const shot=s.hostile.at(-1);expect(shot.boneFrame).toBe(9);expect(shot.x).toBeCloseTo(release.x);expect(shot.y).toBeCloseTo(release.y);expect(e.heldBone).toBeNull();}
  if(i===300)e.hp=e.maxHp*.7;if(i===600)e.hp=e.maxHp*.25;expect(e.lostParts).toBeUndefined();expect(s.looseBones).toHaveLength(0);
 }
 expect(reachedRibs).toBe(true);expect([...phases]).toEqual(expect.arrayContaining(['pluck','throw','recover','patrol']));expect(s.hostile.length).toBeGreaterThanOrEqual(3);expect(phases.has('pickup')).toBe(false);
});

test('7: injury before a leap or during its windup cancels the jump for arms and legs',()=>{
 for(const props of [{armMissing:true},{armLost:true},{legLost:true},{type:21}])for(const phase of ['patrol','windup']){
  const s=scene(),e=makeEnemy(7400,525,18);Object.assign(e,{active:true,nightmareVariant:0,lunger:true,armMissing:false,phase,timer:.01,attackKind:'lunge',attackDir:-1,...props});s.enemies=[e];let leaps=0;
  for(let i=0;i<500;i++){tick(s);leaps+=e.phase==='lunge';expect(e.y).toBeCloseTo(groundY(s.level.route,e.x));}
  expect(leaps).toBe(0);expect(e.x).not.toBe(7400);
 }
});

test('7: losing an arm or leg during a real lunge causes a continuous fall and no subsequent leap',()=>{
 for(const variant of [0,4]){
  const s=scene(),e=makeEnemy(7410,525,18);Object.assign(e,{active:true,nightmareVariant:variant,lunger:true,armMissing:false,phase:'windup',timer:.01,attackKind:'lunge',attackDir:-1});s.enemies=[e];tick(s,22);expect(e.phase).toBe('lunge');expect(e.y).toBeLessThan(e.baseY-10);const oldY=e.y;e.hp=e.maxHp*(variant===0?.6:.3);tick(s);expect(e.phase).toBe('injuredFall');expect(e.y-oldY).toBeGreaterThan(0);expect(e.y-oldY).toBeLessThan(5);
  for(let i=0;i<480;i++){const y=e.y;tick(s);expect(e.phase).not.toBe('lunge');expect(Math.abs(e.y-y)).toBeLessThan(8);}expect(e.y).toBeCloseTo(e.baseY);if(variant===4)expect(e.type).toBe(21);else expect(e.armMissing).toBe(true);
 }
});

test('8: side, forward, one-arm and crawling collapses reach a resting pose before fading',()=>{
 for(const [props,row]of [[{deathStyle:0},0],[{deathStyle:1},1],[{armMissing:true},2],[{type:21,legLost:true},3]]){
  const s=scene(),e=makeEnemy(7450,525,18);Object.assign(e,{hp:0,defeated:true,releasesSoul:false,...props});beginNightmareDefeat(s,e);s.enemies=[e];const poses=new Set();let contacts=0;s.damage=()=>contacts++;
  for(let i=0;i<165;i++){tick(s);const q=nightmareDrawing(e);expect(q.key).toBe('nightmare-zombie-defeat-v3');poses.add(q.frame);expect(e.y).toBeLessThanOrEqual(e.baseY);}
  expect([...poses]).toEqual([row*4,row*4+1,row*4+2,row*4+3]);expect(e.deadTime).toBeGreaterThan(.65);expect(contacts).toBe(0);expect(s.enemies).toContain(e);tick(s,110);expect(s.enemies).not.toContain(e);
 }
});

test('9: only a stable minority of zombie deaths release a soul, exactly once, with purge suppression',()=>{
 const s=scene(),zombies=Array.from({length:120},(_,i)=>{const e=makeEnemy(6000+i*57,525,i%4===0?21:18,i%3);Object.assign(e,{hp:0,defeated:true});beginNightmareDefeat(s,e);return e;});s.enemies=zombies;
 const count=zombies.filter(zombieReleasesSoul).length;expect(count).toBeGreaterThan(20);expect(count).toBeLessThan(60);tick(s,150);expect(s.enemies.filter(e=>e.fromZombie)).toHaveLength(count);tick(s,150);expect(s.enemies.filter(e=>e.fromZombie)).toHaveLength(count);
 const t=scene(),e=makeEnemy(7300,525,18);Object.assign(e,{hp:0,defeated:true,releasesSoul:true});beginNightmareDefeat(t,e);t.enemies=[e];t.nightmarePurged=true;tick(t,300);expect(t.enemies).toHaveLength(0);
});

test('10: wandering and released souls use the spectral clown; boss summons keep the sheet ghost and two-hit health',()=>{
 const s=scene(),wild=makeEnemy(7400,390,19),soul=spawnNightmareSoul(s,7420,440,makeEnemy,{fromZombie:true}),summon=spawnNightmareSoul(s,7460,390,makeEnemy,{summoned:true});
 expect(nightmareDrawing(wild).key).toBe('nightmare-clown-ghost-v3');expect(nightmareDrawing(soul)).toEqual({key:'nightmare-clown-ghost-v3',frame:9});expect(nightmareDrawing(summon).key).toBe('nightmare-ghost');expect([wild.hp,soul.hp,summon.hp]).toEqual([4,4,4]);
 for(const ghostForm of ['clown','sheet']){
  const t=scene();t.cages=[];t.supplies=[];const e=makeEnemy(7440,t.player.y-10,19);Object.assign(e,{active:true,trap:99,ghostForm});t.enemies=[e];
  for(let shot=1;shot<=2;shot++){t.shotWait=0;stepAdventure(t,{attack:true},1/120);for(let i=0;i<80;i++)stepAdventure(t,{},1/120);expect(e.hp).toBe(4-shot*2);}
 }
});

test('record checkpoints 6-10 with the production renderer',async({page})=>{
 test.setTimeout(180000);const folder='tests/artifacts/arcade/cemetery-revision-3/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.r3=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/adventureNightmareMotion.js','actors/enemies/adventureEnemies.js','actors/enemies/adventureNightmares.js','render/adventureCanvas.js','render/nightmareTrailCanvas.js','world/adventureTerrain.js'].map(f=>import(root+f))));w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='actor-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=(x=7200)=>{w.s=w.createAdventure(6);w.s.noticeTime=0;w.s.enemies=[];w.s.graves=[];w.s.stars=[];w.s.pickups=[];w.s.supplies=[];w.s.cages=[];Object.assign(w.s.player,{x,y:w.groundY(w.s.level.route,x),ground:w.s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),hurt:999});w.s.camera={x:Math.max(0,x-300),y:w.s.player.y-440,backdropY:40,zoom:1};w.action=()=>({});};
  w.enemy=(x,type,props={})=>{const e=w.makeEnemy(x,w.groundY(w.s.level.route,x),type);Object.assign(e,{active:true},props);w.s.enemies.push(e);return e;};
  w.paint=()=>{const h=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=h;};
  w.record=async seconds=>{
   const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6500000}),stats={phases:[],souls:0,throws:0,deathFrames:[],maxFrameSeconds:0};
   const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});w.paint();rec.start();let start,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;stats.maxFrameSeconds=Math.max(stats.maxFrameSeconds,(now-last)/1000);acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.stepAdventure(w.s,w.action(w.s.time),1/120);for(const e of w.s.enemies){if(!stats.phases.includes(e.phase))stats.phases.push(e.phase);if(e.hp<=0&&[18,21].includes(e.type)){const f=w.nightmareDrawing(e).frame;if(!stats.deathFrames.includes(f))stats.deathFrames.push(f);}}stats.souls=Math.max(stats.souls,w.s.enemies.filter(e=>e.fromZombie).length);stats.throws=Math.max(stats.throws,w.s.hostile.filter(e=>e.kind==='bone').length);acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const [name,seconds]of [['cartoon-skeleton',12],['injured-no-leap',7],['zombie-falls',8],['clown-ghost',12],['boss-ghost',11]]){
  if(process.env.CEMETERY3_SCENES&&!process.env.CEMETERY3_SCENES.split(',').includes(name))continue;
  await page.evaluate(name=>{const w=window.r3;w.pose();
   if(name==='cartoon-skeleton'){const e=w.enemy(7480,22,{timer:.5});w.action=t=>{if(t>6)e.hp=e.maxHp*.25;return{};};}
   if(name==='injured-no-leap'){const e=w.enemy(7430,18,{nightmareVariant:0,lunger:true,armMissing:false,phase:'windup',timer:.01,attackKind:'lunge',attackDir:-1});w.enemy(7620,21,{nightmareVariant:1,timer:.1});w.action=t=>{if(t>.22&&!e.reviewHit){e.reviewHit=true;e.hp=e.maxHp*.6;}return{right:t>3&&t<4.2};};}
   if(name==='zombie-falls'){
    const a=w.enemy(7100,18,{nightmareVariant:0,armMissing:false,deathStyle:0,releasesSoul:false,trap:99}),b=w.enemy(7310,18,{nightmareVariant:1,armMissing:false,deathStyle:1,releasesSoul:true,trap:99}),c=w.enemy(7510,18,{nightmareVariant:5,armMissing:true,releasesSoul:false,trap:99}),d=w.enemy(7710,21,{nightmareVariant:2,releasesSoul:false,trap:99});
    w.action=t=>{[a,b,c,d].forEach((e,i)=>{if(t>1+i*1.1&&e.hp>0){e.hp=0;e.defeated=true;e.trap=0;w.beginNightmareDefeat(w.s,e);}});return{};};
   }
   if(name==='clown-ghost'){w.enemy(7470,19,{y:390,ghostForm:'clown',timer:.5,blinkCooldown:3});}
   if(name==='boss-ghost'){w.pose(20100);w.action=t=>({right:t>8&&t<9});}
  },name);
  const {data,stats}=await page.evaluate(seconds=>window.r3.record(seconds),seconds);fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(stats,null,2));await page.locator('#actor-review').screenshot({path:folder+name+'.png'});
  if(name==='cartoon-skeleton'){expect(stats.phases).toEqual(expect.arrayContaining(['pluck','throw','recover']));expect(stats.throws).toBeGreaterThan(0);}if(name==='injured-no-leap')expect(stats.phases).toContain('injuredFall');if(name==='zombie-falls'){expect(new Set(stats.deathFrames).size).toBe(16);expect(stats.souls).toBe(1);}if(name==='clown-ghost')expect(stats.phases).toEqual(expect.arrayContaining(['vanish','hidden','appear','rush']));
 }
 expect(errors).toEqual([]);
});
