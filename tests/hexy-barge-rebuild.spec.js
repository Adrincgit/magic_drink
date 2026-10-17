import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {updateBarge,bargeRig,bargeTargets} from '../src/components/arcade/adventure/actors/bosses/adventureBarge';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
const dir='tests/artifacts/arcade/barge-rebuild/';
function scene(){const s=createAdventure(2),a=s.level.arena;for(const k of ['enemies','outposts','supplies','stars','cages','hazards'])s[k]=[];Object.assign(s.player,{x:a.left+480,y:a.y,hurt:999,ground:s.platforms.findIndex(p=>p.x===a.left)});Object.assign(s.boss,{x:a.right-400,phase:'recover',engaged:true,vulnerable:true,timer:20});s.arenaLocked=true;return s;}
const tick=(s,n)=>{for(let i=0;i<n;i++)stepAdventure(s,{},1/120);};
test('small cannon launches its walking passenger and becomes empty on the same tick',()=>{
 for(const dir of [-1,1]){
  const s=scene(),e=makeEnemy(1000,480,5),clown=makeEnemy(1060,480,0);s.platforms=[{x:0,y:480,baseY:480,w:3000,kind:'earth'}];Object.assign(clown,{dir:-1,timer:10});s.enemies=[e,clown];s.player.x=e.x+dir*250;e.timer=0;
  for(let i=0;i<100;i++)updateEnemies(s,1/120,playerBody,()=>{});
  expect(s.hostile).toHaveLength(0);expect(clown.type).toBe(6);expect(Math.sign(clown.launchVx)).toBe(dir);expect(s.enemies).toEqual([e,clown]);
  expect(enemyDrawing(e)).toEqual({key:'cannon-launcher-painted',frame:2});
  for(let i=0;i<120;i++)updateEnemies(s,1/120,playerBody,()=>{});
  expect(enemyDrawing(e).frame).toBe(2);expect(s.hostile.filter(q=>q.kind==='clown')).toHaveLength(0);expect(clown.type).toBe(0);
 }
});
test('every second-phase cannon shell originates at the one mounted bow muzzle',()=>{
 const s=scene();Object.assign(s.boss,{move:'broadside',phase:'attack',timer:4,shotClock:0,volley:0,transformed:true,targetX:s.player.x});
 const shots=[];updateBarge(s,1/120,{body:playerBody,makeEnemy},(...args)=>{shots.push(args);enemyShot(...args);});
 const m=bargeRig(s);expect(m.ports).toEqual([]);expect(shots).toHaveLength(1);expect(Math.abs(shots[0][1]-m.muzzle.x)).toBeLessThan(3);expect(shots[0][2]).toBeCloseTo(m.muzzle.y);expect(s.hostile[0].vx).toBeLessThan(0);
});
test('boarding crew walk from the cabin to the stern ledge before diving into water',()=>{
 const s=scene();Object.assign(s.boss,{move:'boarding',phase:'attack',timer:4,shotClock:0,volley:0});
 updateBarge(s,1/120,{body:playerBody,makeEnemy},enemyShot);const e=s.enemies[0],m=bargeRig(s);
 s.player.x=m.stern.x-100; // Keep this splash within the spatial sound range.
 expect(e.phase).toBe('exit');expect(e.x).toBeCloseTo(m.stern.x);expect(e.y).toBeCloseTo(m.stern.y);
 for(let i=0;i<60;i++)updateEnemies(s,1/120,playerBody,()=>{});
 expect(e.phase).toBe('exit');expect(e.x).toBeGreaterThan(m.stern.x);expect(e.x).toBeLessThan(m.ledge.x);
 for(let i=0;i<57;i++)updateEnemies(s,1/120,playerBody,()=>{});
 expect(e.phase).toBe('deploy');expect(e.x).toBeGreaterThanOrEqual(m.ledge.x);expect(e.vy).toBeLessThan(0);
 for(let i=0;i<130;i++)updateEnemies(s,1/120,playerBody,()=>{});
 expect(['submerged','emerge']).toContain(e.phase);expect(s.events.map(q=>typeof q==='string'?q:q.kind)).toContain('bargeSplash');
});
test('real hits trigger white feedback on intact drum, tank and exposed core',()=>{
 const s=scene();for(const part of ['drum','tank']){
  const t=bargeTargets(s).find(p=>p.part===part);s.shots=[{x:t.x+t.w/2,y:t.y+t.h/2,vx:0,vy:0,r:8,damage:2,kind:-1,age:0,life:1,hits:[]}];tick(s,1);
  expect(s.boss.flash).toBeGreaterThan(0);expect(s.boss.parts[part].flash).toBeGreaterThan(0);tick(s,60);
 }
});
test('the locked water stream threatens standing Hexy instead of passing above her',()=>{
 const s=scene();s.player.hurt=0;Object.assign(s.boss,{move:'jet',phase:'warn',timer:.5});tick(s,230);expect(s.hearts).toBeLessThan(s.maxHearts);
 const angle=s.boss.jetAngle;expect(angle).toBeLessThan(0);s.player.x-=150;tick(s,10);expect(s.boss.jetAngle).toBe(angle);
});
test('record mounted attacks, real hit flashes, stern exits and both cannon launch directions',async({page})=>{
 test.setTimeout(180000);fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';const w=window.bargeReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/bosses/adventureBarge.js','actors/enemies/adventureEnemies.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='barge-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.setup=(name)=>{const s=w.s=w.createAdventure(name.startsWith('cannon')?0:2),a=s.level.arena;for(const key of ['enemies','outposts','supplies','stars','cages','hazards'])s[key]=[];s.noticeTime=0;s.player.hurt=999;w.name=name;w.frame=0;w.fixedCamera=null;
   if(name.startsWith('cannon')){const x=1100,y=w.groundY(s.platforms,x),direction=name==='cannon-left'?-1:1,px=x+direction*330;Object.assign(s.player,{x:px,y:w.groundY(s.platforms,px),ground:s.platforms.findIndex(q=>px>=q.x&&px<=q.x+q.w)});const e=w.makeEnemy(x,y,5),clown=w.makeEnemy(x-direction*125,w.groundY(s.platforms,x-direction*125),0);Object.assign(clown,{dir:direction,timer:10});s.enemies=[e,clown];s.camera={x:x-470,y:y-420,backdropY:y-420,zoom:1};w.fixedCamera={...s.camera};}
   else{Object.assign(s.player,{x:a.left+480,y:a.y,ground:s.platforms.findIndex(q=>q.x===a.left)});s.arenaLocked=true;Object.assign(s.boss,{x:a.right-400,engaged:true,phase:'warn',move:name==='barge-boarding'?'boarding':name==='barge-jet'?'jet':name==='barge-drum'?'drumroll':name==='barge-burst'?'broadside':'mortar',timer:.8,targetX:s.player.x,vulnerable:true});if(name==='barge-burst'){s.boss.transformed=true;s.boss.hp=140;}if(name==='barge-hit')s.boss.timer=50;if(name==='barge-defeat')s.boss.hp=0;for(let i=0;i<600;i++)w.followAdventureCamera(s,1/120);}
  };
  w.paint=()=>w.renderAdventure(w.c,w.s,w.art);
  w.step=()=>{const s=w.s;if(w.name==='barge-hit'&&w.frame%55===0){const targets=w.bargeTargets(s),t=targets[Math.floor(w.frame/55)%targets.length];s.shots.push({x:t.x+t.w/2,y:t.y+t.h/2,vx:0,vy:0,r:8,damage:3,kind:-1,age:0,life:1,hits:[]});}w.stepAdventure(s,{},1/120);if(w.fixedCamera)s.camera={...w.fixedCamera};w.frame++;};
  w.record=async seconds=>{const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm'});const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();let last,start,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.step();acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return data;};
 });
 for(const name of ['barge-mortar','barge-burst','barge-jet','barge-drum','barge-boarding','barge-hit','barge-defeat','cannon-left','cannon-right'].filter(n=>!process.env.HEXY_BARGE_REVIEW||process.env.HEXY_BARGE_REVIEW.split(',').includes(n))){
  await page.evaluate(n=>{window.bargeReview.setup(n);window.bargeReview.paint();},name);await page.locator('#barge-review').screenshot({path:dir+name+'-before.png'});
  const data=await page.evaluate(seconds=>window.bargeReview.record(seconds),name==='barge-defeat'?4.4:4.2);fs.writeFileSync(dir+name+'.webm',Buffer.from(data,'base64'));await page.locator('#barge-review').screenshot({path:dir+name+'-after.png'});
 }
 expect(errors).toEqual([]);
});
