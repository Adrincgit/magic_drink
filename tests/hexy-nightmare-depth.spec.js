import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,playerBody,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies,updateBoss} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {stepGraveyard} from '../src/components/arcade/adventure/engine/adventureGraveyard';
import {stepNightmareBranches,beginNightmareDefeat} from '../src/components/arcade/adventure/engine/adventureNightmareMotion';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {enemyBody} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {NIGHTMARE_PLANES,nightmarePlaneX} from '../src/components/arcade/adventure/render/nightmareDepthCanvas';
const scene=()=>{const s=createAdventure(6);s.damage=()=>{};s.graves=[];s.enemies=[];return s;};
const place=(s,x)=>{s.player.x=x;s.player.y=groundY(s.level.route,x);s.player.ground=s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w);s.player.hurt=999;};
const tick=(s,n)=>{for(let i=0;i<n;i++){s.time+=1/120;s.fxTime+=1/120;updateEnemies(s,1/120,playerBody,()=>{});}};
test('route is twenty percent shorter with real height changes and upper alternatives',()=>{
 const s=scene();expect(s.level.width).toBe(26800*.8);const ys=s.level.route.flatMap(q=>[q.y,q.yEnd]);expect(Math.max(...ys)-Math.min(...ys)).toBeGreaterThan(200);
 expect(s.platforms.filter(q=>q.kind==='nightmare-branch').length).toBe(16);expect(s.level.graves.every(q=>q.type!==19)).toBe(true);
 const displacement=NIGHTMARE_PLANES.map(p=>nightmarePlaneX(500,1000,p.depth)-nightmarePlaneX(100,1000,p.depth));expect(new Set(displacement).size).toBe(3);expect(Math.abs(displacement[2]-displacement[0])).toBeGreaterThanOrEqual(180);
});
test('a loaded branch warns, breaks, releases Hexy and resets on retry',()=>{
 const s=scene(),i=s.platforms.findIndex(q=>q.kind==='nightmare-branch'),q=s.platforms[i];s.player.ground=i;s.player.x=q.x+q.w/2;s.player.y=q.y;
 stepNightmareBranches(s,.5);expect(q.loaded).toBe(true);expect(q.gone).not.toBe(true);stepNightmareBranches(s,2);expect(q.gone).not.toBe(true);stepNightmareBranches(s,1.01);expect(q.gone).toBe(true);expect(s.player.ground).toBeNull();expect(s.player.vy).toBeGreaterThan(0);
 for(let j=0;j<120;j++)stepAdventure(s,{},1/120);expect(s.player.y).toBeGreaterThan(q.y+20);expect(s.player.ground).not.toBe(i);retryAdventure(s);expect(s.platforms[i].gone).toBeUndefined();
});
test('the cemetery descent stays continuous in both directions',()=>{
 const s=scene();place(s,3920);for(let i=0;i<240;i++)stepAdventure(s,{right:true},1/120);
 expect(s.player.x).toBeGreaterThan(4400);expect(s.player.y).toBeCloseTo(groundY(s.level.route,s.player.x));
 for(let i=0;i<240;i++)stepAdventure(s,{left:true},1/120);
 expect(s.player.x).toBeLessThan(4000);expect(s.player.y).toBeCloseTo(groundY(s.level.route,s.player.x));
});
test('the lower and upper boughs are reachable using ordinary jumps',()=>{
 const s=scene(),low=s.platforms.findIndex(q=>q.kind==='nightmare-branch'&&q.tree===0&&q.side===-1),high=s.platforms.findIndex(q=>q.kind==='nightmare-branch'&&q.tree===0&&q.side===1);place(s,s.platforms[low].x+s.platforms[low].w*.55);
 let apex=Infinity;for(let i=0;i<130;i++){stepAdventure(s,{jump:i<80},1/120);apex=Math.min(apex,s.player.y);if(s.player.ground===low)break;}expect(s.player.ground,JSON.stringify({x:s.player.x,y:s.player.y,apex,low:s.platforms[low]})).toBe(low);
 while(s.player.x<s.platforms[low].x+s.platforms[low].w-12)stepAdventure(s,{right:true},1/120);
 for(let i=0;i<180;i++){stepAdventure(s,{jump:true,right:s.player.x<s.platforms[high].x+35},1/120);if(s.player.ground===high)break;}expect(s.player.ground).toBe(high);expect(s.platforms[high].gone).not.toBe(true);
});
test('a fleeing clown follows the cemetery slope without a vertical teleport',()=>{
 const s=scene(),e=makeEnemy(4400,460,0);Object.assign(e,{fleeing:true,active:true,fleeDir:-1,fleeSpeed:360,fleeState:'run',fleeTravel:0});s.enemies=[e];place(s,4400);let maxChange=0,air=false;
 for(let i=0;i<150;i++){const y=e.y;tick(s,1);maxChange=Math.max(maxChange,Math.abs(e.y-y));air||=e.fleeAir;}
 expect(air).toBe(true);expect(maxChange).toBeLessThan(9);expect(e.x).toBeLessThan(4100);expect(e.y).toBeGreaterThan(groundY(s.level.route,e.x)-200);expect(e.y).toBeLessThanOrEqual(groundY(s.level.route,e.x));
});
test('zombies accelerate on approach and lungers telegraph before leaving the ground',()=>{
 const speed=distance=>{const s=scene(),e=makeEnemy(7000,525,18);e.nightmareVariant=0;e.timer=99;s.enemies=[e];place(s,e.x+distance);tick(s,60);return e.x-7000;};expect(speed(180)).toBeGreaterThan(speed(500)*1.7);
 const s=scene(),e=makeEnemy(7000,525,18);e.nightmareVariant=0;e.timer=0;s.enemies=[e];place(s,7190);tick(s,1);expect(e.phase).toBe('windup');expect(e.y).toBe(525);tick(s,85);expect(e.phase).toBe('lunge');expect(e.y).toBeLessThan(e.baseY-10);tick(s,150);expect(e.y).toBeCloseTo(e.baseY);
});
test('arm loss releases a pursuing hand, and leg loss makes a crawler without regrowing an arm',()=>{
 const s=scene(),e=makeEnemy(7100,525,18);Object.assign(e,{nightmareVariant:0,armMissing:false,hp:e.maxHp*.63});s.enemies=[e];place(s,7400);tick(s,1);expect(e.armMissing).toBe(true);const hand=s.enemies.find(q=>q.type===24);expect(hand).toBeTruthy();const x=hand.x;tick(s,220);expect(hand.x).toBeGreaterThan(x+60);expect(enemyBody(hand).h).toBeLessThan(30);
 const z=makeEnemy(7000,525,18);Object.assign(z,{nightmareVariant:1,hp:z.maxHp*.32});s.enemies=[z];tick(s,1);expect(z.phase).toBe('legBreak');expect(enemyDrawing(z).key).toBe('nightmare-actions');tick(s,100);expect(z.type).toBe(21);expect(z.armMissing).toBe(false);expect(enemyBody(z).h).toBe(66);
});
test('a fallen civilian stands up after a pause when no zombie catches it',()=>{
 const s=scene(),e=makeEnemy(7100,525,0);Object.assign(e,{fleeing:true,active:true,fleeDir:-1,fleeSpeed:360,fleeState:'run',fleeTravel:0,tripAfter:35});s.enemies=[e];place(s,7000);const states=new Set();for(let i=0;i<750;i++){tick(s,1);states.add(e.fleeState);}expect([...states]).toEqual(expect.arrayContaining(['fall','prone','recover','run']));expect(e.fleeing).toBe(true);expect(e.x).toBeLessThan(7100-300);
});
test('killing, trapping or toppling the captor rescues the clown before transformation',()=>{
 for(const rescue of ['kill','trap','cripple']){const s=createAdventure(6),e=s.enemies.find(q=>q.fleeing),z=makeEnemy(e.x+10,e.y,18);e.tripAfter=35;s.graves=[];s.enemies=[e,z];stepGraveyard(s,.01,makeEnemy);for(let i=0;i<190;i++)stepGraveyard(s,1/120,makeEnemy);expect(e.capture.age).toBeGreaterThan(1.5);if(rescue==='kill')z.hp=0;else if(rescue==='trap')z.trap=2;else{z.nightmareVariant=1;z.hp=z.maxHp*.32;tick(s,2);}stepGraveyard(s,.01,makeEnemy);expect(e.capture).toBeNull();expect(e.rescued).toBe(true);expect(e.fleeState).toBe('recover');const savedX=e.x;tick(s,150);expect(e.x).toBeLessThan(savedX-60);expect(e.type).toBe(0);expect(e.fleeState).toBe('run');expect(e.fleeing).toBe(true);if(rescue==='cripple')expect(z.type).toBe(21);}
});
test('an eligible zombie collapse releases one smaller ghost from its body',()=>{
 const s=scene(),e=makeEnemy(7100,525,18);Object.assign(e,{hp:0,defeated:true,releasesSoul:true});beginNightmareDefeat(s,e);s.enemies=[e];place(s,7250);tick(s,30);expect(e.deadTime).toBeGreaterThan(1);expect(enemyDrawing(e).key).toBe('nightmare-zombie-defeat-v3');expect(s.enemies.filter(q=>q.type===19)).toHaveLength(0);tick(s,90);const ghost=s.enemies.find(q=>q.type===19);expect(ghost.fromZombie).toBe(true);expect(ghost.phase).toBe('soulRise');expect(ghost.x).toBeCloseTo(e.x);expect(enemyBody(ghost).w).toBe(0);tick(s,170);expect(s.enemies.filter(q=>q.type===19)).toHaveLength(1);expect(s.enemies.includes(e)).toBe(false);
});
test('ghost blinks behind the player only while hidden and reappears with grace',()=>{
 const s=scene(),e=makeEnemy(7280,390,19);Object.assign(e,{active:true,timer:99,blinkCooldown:0});s.enemies=[e];place(s,7100);s.player.dir=1;tick(s,1);expect(e.phase).toBe('vanish');expect(e.blinkX).toBeLessThan(s.player.x);tick(s,62);expect(e.phase).toBe('hidden');expect(e.x).toBe(e.blinkX);expect(e.nightmareHidden).toBe(true);tick(s,50);expect(e.phase).toBe('appear');expect(enemyBody(e).w).toBe(0);tick(s,100);expect(['patrol','windup']).toContain(e.phase);expect(e.blinkCooldown).toBeGreaterThan(4);
});
test('bellkeeper summons ghosts, then its defeat purges all threats and prevents new souls',()=>{
 const s=scene();place(s,s.level.arena.entry);const phases=new Set();for(let i=0;i<720;i++){updateBoss(s,1/120,{body:playerBody});tick(s,1);phases.add(s.boss.phase);}expect([...phases]).toContain('summonWindup');expect([...phases]).toContain('summon');expect(s.enemies.filter(e=>e.summoned)).toHaveLength(2);
 const z=makeEnemy(s.player.x+200,480,18);s.enemies.push(z);s.boss.hp=0;updateBoss(s,.01,{body:playerBody});expect(s.nightmarePurged).toBe(true);expect(s.enemies.every(e=>e.hp===0)).toBe(true);for(let i=0;i<300;i++){tick(s,1);updateBoss(s,1/120,{body:playerBody});}expect(s.enemies).toHaveLength(0);expect(s.hostile).toHaveLength(0);expect(s.boss.defeat.ready).toBe(true);expect(s.arenaLocked).toBe(false);
});

test('record depth, gateway, boughs, rescue, attacks and the summoned-ghost miniboss',async({page})=>{
 test.setTimeout(220000);const folder='tests/artifacts/arcade/nightmare-depth/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.depthReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','render/adventureCanvas.js','world/adventureTerrain.js'].map(f=>import(root+f))));w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='depth-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=(x,isolated=false)=>{w.s=w.createAdventure(6);w.s.noticeTime=0;w.s.player.hurt=999;w.s.player.x=x;w.s.player.y=w.groundY(w.s.level.route,x);w.s.player.ground=w.s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w);w.s.camera={x:Math.max(0,x-300),y:w.s.player.y-440,backdropY:40,zoom:1};if(isolated){w.s.enemies=[];w.s.graves=[];}w.action=()=>({});};
  w.paint=()=>{const hurt=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=hurt;};
  w.enemy=(x,type,props={})=>{const e=w.makeEnemy(x,w.groundY(w.s.level.route,x),type);Object.assign(e,props);w.s.enemies.push(e);return e;};
  w.record=async(seconds)=>{const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6000000});const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});w.paint();rec.start();let start,last,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.stepAdventure(w.s,w.action(w.s.time),1/120);acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return data;};
 });
 for(const [name,seconds]of [['forest',10],['gate',8],['branches',8],['conversion',7],['rescue',7],['combat',12],['ghost',10],['boss',25]]){
  if(process.env.NIGHTMARE_REVIEW_SCENES&&!process.env.NIGHTMARE_REVIEW_SCENES.split(',').includes(name))continue;
  await page.evaluate(name=>{const w=window.depthReview;
   if(name==='forest'){w.pose(600);w.action=()=>({right:true});}
   if(name==='gate'){w.pose(3970);w.action=()=>({right:true});}
   if(name==='branches'){w.pose(1940,true);const q=w.s.platforms.find(q=>q.kind==='nightmare-branch'&&q.tree===1&&q.side===-1);w.s.player.x=q.x+q.w/2;w.s.player.y=q.y;w.s.player.ground=w.s.platforms.indexOf(q);w.action=t=>({right:t>2.3,jump:t>2.4&&t<2.5||t>3.05&&t<3.15});}
   if(name==='conversion'||name==='rescue'){w.pose(7100,true);w.enemy(7390,0,{fleeing:true,active:true,fleeDir:-1,fleeSpeed:365,fleeState:'run',fleeTravel:0,tripAfter:42});w.enemy(7300,18,{nightmareVariant:1,timer:99,hp:name==='rescue'?4:23,maxHp:name==='rescue'?4:23});w.action=t=>({attack:name==='rescue'&&t>1.8});}
   if(name==='combat'){w.pose(7100,true);w.enemy(7420,18,{nightmareVariant:0});w.enemy(7560,18,{nightmareVariant:1});w.action=t=>({attack:true,down:t>5});}
   if(name==='ghost'){w.pose(7100,true);w.enemy(7440,19,{y:390,active:true,blinkCooldown:1,timer:99});}
   if(name==='boss'){w.pose(19910,true);w.action=t=>{if(t>20)w.s.boss.hp=0;return{};};}
  },name);
  const data=await page.evaluate(seconds=>window.depthReview.record(seconds),seconds);fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));await page.locator('#depth-review').screenshot({path:folder+name+'.png'});
 }
 expect(errors).toEqual([]);
});
