import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {graveArmFrame,graveBody,stepGraveyard,damageGrave} from '../src/components/arcade/adventure/engine/adventureGraveyard';
import {hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
const place=(s,x)=>{Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),vx:0,vy:0});};
const scene=()=>{const s=createAdventure(6);s.enemies=[];s.graves=[];s.cages=[];s.supplies=[];s.pickups=[];s.stars=[];return s;};
const fireOnce=(s,input={})=>{s.shotWait=0;stepAdventure(s,{...input,attack:true},1/120);expect(s.events).toContain('cast');for(let i=0;i<80;i++)stepAdventure(s,input,1/120);};

test('1: four arm poses precede the emerging actor, and destroying the warning grave cancels both',()=>{
 const s=createAdventure(6),q=s.graves[0];s.enemies=[];s.graves=[q];place(s,q.x-200);const poses=new Set();
 while(q.phase!=='open'){stepGraveyard(s,1/120,makeEnemy);const frame=graveArmFrame(q);if(frame>=0){poses.add(frame);expect(s.enemies).toHaveLength(0);}expect(s.enemies.length).toBeLessThan(2);}
 expect([...poses]).toEqual([0,1,2,3]);expect(s.enemies).toHaveLength(1);expect(s.enemies[0].phase).toBe('manifest');expect(s.enemies[0].y).toBeGreaterThan(q.y);expect(graveArmFrame(q)).toBe(-1);
 const t=createAdventure(6),g=t.graves[0];t.enemies=[];t.graves=[g];place(t,g.x-200);Object.assign(g,{phase:'warning',timer:.5});expect(graveArmFrame(g)).toBe(2);damageGrave(t,g,g.hp);for(let i=0;i<600;i++)stepGraveyard(t,1/120,makeEnemy);expect(graveArmFrame(g)).toBe(-1);expect(t.enemies).toHaveLength(0);
});

test('2 and 4: real basic wand projectiles kill a ghost in two hits and a ground hand in one',()=>{
 for(const type of [18,21])expect(makeEnemy(0,0,type).hp).toBe(makeEnemy(0,0,0).hp*5);
 const s=scene();place(s,7200);const ghost=makeEnemy(7440,s.player.y-10,19);Object.assign(ghost,{active:true,trap:99,phase:'patrol'});s.enemies=[ghost];fireOnce(s);expect(ghost.hp).toBe(2);fireOnce(s);expect(ghost.hp).toBe(0);expect(ghost.defeated).toBe(true);
 const t=scene();place(t,7200);stepAdventure(t,{hold:true,down:true},1/120);const tip=hexyMuzzle(t),x=tip.x+t.player.y-6-tip.y,hand=makeEnemy(x,t.player.y,24);Object.assign(hand,{active:true,trap:99,phase:'patrol'});t.enemies=[hand];fireOnce(t,{hold:true,down:true});expect(hand.hp).toBe(0);expect(hand.defeated).toBe(true);
});

test('5: exactly two tall crypts block walking, dashing and double jumps from either side',()=>{
 const source=createAdventure(6).graves.filter(q=>q.kind==='crypt');expect(source).toHaveLength(2);
 for(const crypt of source)for(const direction of [-1,1])for(const mode of ['walk','dash','double-jump']){
  const s=scene(),q={...crypt,timer:99,phase:'warning'};s.graves=[q];s.doubleJump=true;const edge=q.x-direction*193;place(s,edge-direction*85);
  for(let i=0;i<420;i++)stepAdventure(s,{right:direction>0,left:direction<0,dash:mode==='dash'&&i%120===0,jump:mode==='double-jump'&&(i<50||i>=58&&i<130)},1/120);
  expect(direction*(s.player.x-edge),JSON.stringify({crypt:q.x,direction,mode,player:s.player})).toBeLessThanOrEqual(.01);expect(s.hearts).toBe(5);expect(graveBody(q).h).toBeGreaterThan(300);
  damageGrave(s,q,q.hp);for(let i=0;i<240;i++)stepAdventure(s,{right:direction>0,left:direction<0},1/120);expect(direction*(s.player.x-q.x)).toBeGreaterThan(190);
 }
});

test('5: a crypt absorbs 40 basic hits, stops spawning when destroyed and resets on retry',()=>{
 const s=scene(),q={...createAdventure(6).graves.find(q=>q.kind==='crypt'),phase:'warning',timer:99};s.graves=[q];place(s,q.x-300);
 for(let n=1;n<=40;n++){fireOnce(s);expect(q.hp).toBe(Math.max(0,80-n*2));if(n<40)expect(q.phase).not.toBe('broken');}
 expect(q.phase).toBe('broken');for(let i=0;i<3600;i++)stepGraveyard(s,1/120,makeEnemy);expect(q.spawned).toBe(0);expect(s.enemies).toHaveLength(0);
 retryAdventure(s);const reset=s.graves.find(g=>g.x===q.x);expect(reset.hp).toBe(80);expect(reset.phase).toBe('sealed');
});

test('record the first five cemetery revisions through the production renderer',async({page})=>{
 test.setTimeout(180000);const folder='tests/artifacts/arcade/cemetery-revision-2/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.r2=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','engine/adventureGraveyard.js','render/adventureCanvas.js','world/adventureTerrain.js'].map(f=>import(root+f))));w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='cemetery-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=x=>{w.s=w.createAdventure(6);w.s.noticeTime=0;w.s.enemies=[];w.s.graves=[];w.s.stars=[];w.s.pickups=[];w.s.supplies=[];w.s.cages=[];Object.assign(w.s.player,{x,y:w.groundY(w.s.level.route,x),ground:w.s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w)});w.s.camera={x:Math.max(0,x-300),y:w.s.player.y-440,backdropY:40,zoom:1};w.action=()=>({});};
  w.record=async seconds=>{
   const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6000000}),stats={minHearts:5,arms:[],phases:[],maxTeleport:0,wallBeforeBreak:null,passed:false,casts:0};
   const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
   w.renderAdventure(w.c,w.s,w.art);rec.start();let start,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){const old=w.s.player.x;w.stepAdventure(w.s,w.action(w.s.time),1/120);stats.minHearts=Math.min(stats.minHearts,w.s.hearts);stats.maxTeleport=Math.max(stats.maxTeleport,Math.abs(old-w.s.player.x));stats.casts+=w.s.events.filter(e=>e==='cast').length;for(const q of w.s.graves){const a=w.graveArmFrame(q);if(a>=0&&!stats.arms.includes(a))stats.arms.push(a);if(q.kind==='crypt'){if(q.hp>0)stats.wallBeforeBreak=Math.max(stats.wallBeforeBreak||0,w.s.player.x);else stats.passed||=w.s.player.x>q.x+193;}}for(const e of w.s.enemies)if(!stats.phases.includes(e.phase))stats.phases.push(e.phase);acc-=1/120;}w.renderAdventure(w.c,w.s,w.art);if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   stats.playerX=w.s.player.x;stats.crypts=w.s.graves.filter(q=>q.kind==='crypt').map(q=>({hp:q.hp,spawned:q.spawned}));rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const [name,seconds]of [['forest-return',12],['gate-return',11],['grave-arm',6],['crypt-wall',15]]){
  if(process.env.CEMETERY_SCENES&&!process.env.CEMETERY_SCENES.split(',').includes(name))continue;
  await page.evaluate(name=>{const w=window.r2;
   if(name==='forest-return'){w.pose(700);w.action=t=>({right:t<6,left:t>=6});}
   if(name==='gate-return'){w.pose(3900);w.action=t=>({right:t<5.5,left:t>=5.5,jump:t>1.2&&t<1.6||t>7.9&&t<8.3});}
   if(name==='grave-arm'){const q=w.createAdventure(6).graves[0];w.pose(q.x-300);w.s.graves=[q];}
   if(name==='crypt-wall'){const q=w.createAdventure(6).graves.find(q=>q.kind==='crypt');w.pose(q.x-300);w.s.graves=[q];w.action=t=>({right:true,jump:t>.5&&t<1.1,dash:t>1.8&&t<1.82,attack:t>3});}
  },name);
  const {data,stats}=await page.evaluate(seconds=>window.r2.record(seconds),seconds);fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(stats,null,2));await page.locator('#cemetery-review').screenshot({path:folder+name+'.png'});
  // Crypt combat includes the live summoned zombie; damage is expected when
  // deliberately standing at the doorway. Terrain-only scenes must be safe.
  if(name==='crypt-wall')expect(stats.minHearts).toBeGreaterThan(0);else expect(stats.minHearts).toBe(5);
  expect(stats.maxTeleport).toBeLessThan(10);if(name==='grave-arm'){expect(stats.arms).toEqual([0,1,2,3]);expect(stats.phases).toContain('manifest');}if(name==='crypt-wall'){expect(stats.wallBeforeBreak).toBeLessThanOrEqual(9720-193);expect(stats.passed).toBe(true);expect(stats.crypts[0].hp).toBe(0);}
 }
 expect(errors).toEqual([]);
});
