import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,playerBody,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {updateBoss,makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {damageBellkeeper,BELL_BREAK_TIME} from '../src/components/arcade/adventure/actors/bosses/adventureBellkeeper';
import {bossDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {burstBubble} from '../src/components/arcade/adventure/engine/adventureBubbles';
const scene=()=>{const s=createAdventure(6);s.enemies=[];s.graves=[];s.stars=[];s.cages=[];s.pickups=[];s.supplies=[];s.noticeTime=0;s.damage=()=>{};Object.assign(s.player,{x:s.level.arena.entry,y:480,hurt:999,ground:s.platforms.findIndex(q=>q.x<=s.level.arena.entry&&q.x+q.w>=s.level.arena.entry)});return s;};
const bossTick=(s,seconds)=>{for(let i=0;i<Math.ceil(seconds*120);i++)updateBoss(s,1/120,{body:playerBody});};
const active=()=>{const s=scene();bossTick(s,1.6);return s;};

test('both forms have readable anticipation, distinct attacks and bounded ghost summons',()=>{
 const s=scene();s.player.x=s.level.arena.entry-10;bossTick(s,3);expect(s.boss.phase).toBe('sleep');s.player.x+=10;
 const first=new Set(),second=new Set(),art=new Set();
 for(let stage=1;stage<=2;stage++){
  for(let i=0;i<2400;i++){
   updateBoss(s,1/120,{body:playerBody});(stage===1?first:second).add(s.boss.phase);const d=bossDrawing(s);art.add(d.key+':'+d.frame);
   expect(s.boss.x).toBeGreaterThanOrEqual(s.level.arena.left+120);expect(s.boss.x).toBeLessThanOrEqual(s.level.arena.right-140);
   if(['slamWindup','hauntWindup'].includes(s.boss.phase))expect(s.boss.phaseDuration).toBeGreaterThanOrEqual(1);
   expect(s.enemies.filter(e=>e.summoned&&e.hp>0).length).toBeLessThanOrEqual(4);
  }
  if(stage===1){s.boss.vulnerable=true;damageBellkeeper(s,1000);expect(s.boss.hp).toBe(92);expect(s.boss.phase).toBe('transform');}
 }
 expect([...first]).toEqual(expect.arrayContaining(['summon','ring','rush','slam']));expect([...second]).toEqual(expect.arrayContaining(['transform','soulVolley','hauntRush','summon']));
 expect(s.hostile.some(q=>q.kind==='bell-wave')).toBe(false); // Transition cleared the first form's hazards.
 expect(s.hostile.some(q=>q.kind==='bell-soul')).toBe(true);expect(art.size).toBeGreaterThan(150);
});

test('basic and overkill shots break the shell once, and the reveal cannot be damaged or complete the level',()=>{
 for(const damage of [2,10000]){
  const s=active(),b=s.boss;b.hp=93;b.y=480;b.x=s.player.x+220;s.enemies.push(Object.assign(makeEnemy(b.x+250,480,19),{summoned:true}));
  s.shots.push({x:b.x-90,y:b.y-55,vx:500,vy:0,r:10,life:1,age:0,kind:-1,damage,hits:[]});
  for(let i=0;i<10&&b.phase!=='transform';i++)stepAdventure(s,{},1/120);
  expect(b.phase).toBe('transform');expect(b.hp).toBe(92);expect(s.nightmarePurged).toBeFalsy();expect(s.clear).toBeFalsy();expect(s.arenaLocked).toBe(true);
  const frames=new Set();for(let i=0;i<Math.ceil(BELL_BREAK_TIME*120)+2;i++){frames.add(bossDrawing(s).frame);damageBellkeeper(s,10000);updateBoss(s,1/120,{body:playerBody});if(b.phase!=='transform')break;expect(b.hp).toBe(92);}
  expect(frames.size).toBe(24);expect(b.bellBroken).toBe(true);expect(b.vulnerable).toBe(true);expect(b.stage).toBe(2);expect(bossDrawing(s).key).toBe('nightmare-wraith-idle-v9');
 }
});

test('bubble bursts and every super pulse obey the shell transition boundary',()=>{
 const bubble=active();bubble.boss.hp=93;burstBubble(bubble,{x:bubble.boss.x,y:bubble.boss.y-55,captured:Array(8).fill({}),heavy:true},()=>{});expect(bubble.boss.hp).toBe(92);expect(bubble.boss.phase).toBe('transform');
 const s=active();s.boss.hp=96;s.player.dir=1;s.magic=100;stepAdventure(s,{super:true},1/120);
 let triggered=false;for(let i=0;i<1500;i++){stepAdventure(s,{},1/120);if(s.boss.phase==='transform')triggered=true;if(triggered){expect(s.boss.hp).toBe(92);expect(s.clear).toBeFalsy();}if(triggered&&s.boss.phase==='recover')break;}
 expect(triggered).toBe(true);expect(s.boss.bellBroken).toBe(true);expect(s.superCinematic).toBeNull();
});

test('slam sends low waves which hit a standing player and can be jumped',()=>{
 for(const jumping of [false,true]){
  const s=active(),b=s.boss;s.enemies=[];s.player.x=b.x-350;s.player.hurt=0;
  Object.assign(b,{phase:'slam',phaseAge:0,phaseDuration:.24,timer:.24,slamFrom:388,y:388,vulnerable:false});
  for(let i=0;i<185;i++)stepAdventure(s,{jump:jumping&&i>=90&&i<170},1/120);
  expect(s.hearts).toBe(jumping?5:4);
 }
});

test('the spectral dash commits to its warned destination even when Hexy changes sides',()=>{
 const s=active(),b=s.boss;damageBellkeeper(s,1000);bossTick(s,3.2);b.phase='patrol';b.timer=0;b.turn=1;updateBoss(s,1/120,{body:playerBody});const target=b.dashTo;
 expect(b.phase).toBe('hauntWindup');s.player.x=b.x+500;bossTick(s,2);expect(b.x).toBeCloseTo(target,1);expect(b.phase).toBe('recover');expect(b.vulnerable).toBe(true);
});

test('a complete basic-shot fight crosses both forms, purges enemies and wins once; retry restores the bell',()=>{
 const s=scene(),states=new Set();let wins=0,breaks=0,last='';
 for(let i=0;i<18000&&!s.done;i++){
  const dx=s.boss.x-s.player.x;stepAdventure(s,{attack:true,right:dx>280,left:dx<0},1/120);states.add(s.boss.phase);wins+=s.events.filter(e=>e==='win').length;if(s.boss.phase==='transform'&&last!=='transform')breaks++;last=s.boss.phase;
 }
 expect(s.won).toBe(true);expect(breaks).toBe(1);expect(wins).toBe(1);expect(s.nightmarePurged).toBe(true);expect(s.hostile).toHaveLength(0);expect(s.enemies.every(e=>e.hp<=0)).toBe(true);expect(states.has('soulVolley')).toBe(true);
 retryAdventure(s);expect(s.boss.phase).toBe('sleep');expect(s.boss.hp).toBe(184);expect(s.boss.bellBroken).toBeFalsy();expect(s.nightmarePurged).toBeFalsy();
});

test('record Bellkeeper bell attacks, shell reveal, spectral attacks and final purge',async({page})=>{
 test.setTimeout(180000);const folder=process.env.BELL_REVIEW_FOLDER||'tests/artifacts/arcade/bellkeeper-v6/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.bellReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','render/adventureSprites.js','render/adventureCanvas.js','world/adventureTerrain.js'].map(f=>import(root+f))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='bellkeeper-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=()=>{w.s=w.createAdventure(6);w.s.noticeTime=0;for(const k of ['enemies','graves','stars','pickups','supplies','cages'])w.s[k]=[];const x=19910;Object.assign(w.s.player,{x,y:480,ground:w.s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),hurt:999});w.s.camera={x:19680,y:-60,backdropY:40,zoom:.75};w.action=()=>({});};
  w.paint=()=>{const h=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=h;};
  w.record=async seconds=>{
   w.paint();const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6500000});
   const stats={phaseStarts:[],phases:[],frames:[],events:[],minHP:184,renderTimes:[],simulationTime:0};
   const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();let start,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;
    while(acc>=1/120){w.stepAdventure(w.s,w.action(w.s.time),1/120);const b=w.s.boss,d=w.bossDrawing(w.s);if(stats.phaseStarts.at(-1)?.phase!==b.phase)stats.phaseStarts.push({phase:b.phase,time:stats.simulationTime});if(!stats.phases.includes(b.phase))stats.phases.push(b.phase);if(!stats.frames.includes(d.key+':'+d.frame))stats.frames.push(d.key+':'+d.frame);for(const e of w.s.events)if(!stats.events.includes(e))stats.events.push(e);stats.minHP=Math.min(stats.minHP,b.hp);stats.simulationTime+=1/120;acc-=1/120;}
    const began=performance.now();w.paint();stats.renderTimes.push(performance.now()-began);if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   stats.won=w.s.won;stats.purged=!!w.s.nightmarePurged;stats.finalHP=w.s.boss.hp;stats.renderTimes.sort((a,b)=>a-b);stats.renderP95=stats.renderTimes[Math.floor(stats.renderTimes.length*.95)];delete stats.renderTimes;rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const [name,seconds]of [['bell',19],['reveal',6],['wraith',18],['victory',10]]){
  if(process.env.BELL_SCENES&&!process.env.BELL_SCENES.split(',').includes(name))continue;
  await page.evaluate(name=>{const w=window.bellReview;w.pose();const s=w.s,b=s.boss;
   if(name!=='bell'){Object.assign(b,{engaged:true,phase:'patrol',timer:.65,phaseAge:0,phaseDuration:.65,vulnerable:true,y:450,dir:-1});s.arenaLocked=true;}
   if(name==='reveal'){b.hp=94;b.timer=10;let fired=false;w.action=t=>{if(t>.8&&!fired){fired=true;s.shots.push({x:b.x-100,y:b.y-50,vx:500,vy:0,r:10,life:1,age:0,kind:-1,damage:2,hits:[]});}return{};};}
   if(name==='wraith'){Object.assign(b,{bellBroken:true,stage:2,hp:92});w.action=()=>({jump:b.phase==='hauntWindup'&&b.timer<.22});}
   if(name==='victory'){Object.assign(b,{bellBroken:true,stage:2,hp:8,timer:20});s.enemies=[Object.assign(w.makeEnemy(b.x+240,480,18),{active:true}),Object.assign(w.makeEnemy(b.x+360,380,19),{active:true,ghostForm:'sheet',summoned:true})];w.action=()=>({attack:true});}
  },name);
  const {data,stats}=await page.evaluate(seconds=>window.bellReview.record(seconds),seconds);fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(stats,null,2));await page.locator('#bellkeeper-review').screenshot({path:folder+name+'.png'});
  if(name==='bell')expect(stats.phases).toEqual(expect.arrayContaining(['ring','rush','slam']));
  if(name==='reveal'){expect(stats.frames.filter(f=>f.startsWith('nightmare-break'))).toHaveLength(24);expect(stats.finalHP).toBe(92);}
  if(name==='wraith')expect(stats.phases).toEqual(expect.arrayContaining(['hauntRush','soulVolley','summon']));
  if(name==='victory'){expect(stats.purged).toBe(true);expect(stats.phases).toContain('dying');expect(stats.finalHP).toBe(0);}
 }
 expect(errors).toEqual([]);
});
