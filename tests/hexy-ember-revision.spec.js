import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {fortTargets,fortSystems} from '../src/components/arcade/adventure/actors/bosses/adventureEmberFort';
import {resolveBargeContact,BARGE_MOVES} from '../src/components/arcade/adventure/actors/bosses/adventureBarge';
import {makeEnemy,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {updateDiver} from '../src/components/arcade/adventure/actors/enemies/adventureDiver';
import {guardBlocks} from '../src/components/arcade/adventure/engine/adventureDefense';
import {CHAPTER_ORDER,nextAdventureChapter} from '../src/components/arcade/shared/adventureProgression';
import {sanitizeSave} from '../src/components/arcade/shared/arcadeStore';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function battle(index){const s=createAdventure(index),a=s.level.arena;s.player.x=a.entry+145;s.player.y=a.y;s.player.ground=0;s.player.hurt=999;s.boss.engaged=true;s.boss.phase='recover';s.boss.timer=50;s.boss.vulnerable=true;s.arenaLocked=true;for(const k of ['enemies','stars','supplies','outposts','cages','hazards'])s[k]=[];return s;}
function strike(s,part,damage){while(s.hitStop>0)tick(s,1);const t=fortTargets(s).find(t=>t.part===part);s.shots.push({x:t.x+t.w/2,y:t.y+t.h/2,vx:0,vy:0,r:7,kind:-1,damage,age:0,life:1,hits:[]});tick(s,1);}

test('barge never rams, touching its hull is harmless and boarding deploys visible divers',()=>{
 const s=battle(2);expect(BARGE_MOVES).not.toContain('surge');const hp=s.hearts;
 s.player.x=s.boss.x;s.player.hurt=0;resolveBargeContact(s,playerBody);expect(s.hearts).toBe(hp);expect(s.player.x).toBeLessThan(s.boss.x-290);
 s.player.x=s.level.arena.left+500;s.player.hurt=999;s.boss.phase='attack';s.boss.move='boarding';s.boss.timer=2.8;s.boss.shotClock=0;s.boss.volley=0;
 tick(s,2);const diver=s.enemies.find(e=>e.bargeCrew);expect(diver.phase).toBe('deploy');expect(diver.y).toBeLessThan(diver.waterY);
 const states=new Set();for(let i=0;i<1800;i++){stepAdventure(s,{},1/120);if(s.enemies.includes(diver))states.add(diver.phase);}
 expect(states.has('submerged')).toBe(true);expect(states.has('emerge')).toBe(true);expect(states.has('surfaceFire')).toBe(true);expect(s.enemies.filter(e=>e.bargeCrew&&e.hp>0).length).toBeLessThanOrEqual(3);
});
test('diver peeks out, dives to dodge, and faces its actual swimming direction',()=>{
 const s=battle(2),e=makeEnemy(s.player.x+100,s.player.y,8);e.clock=0;updateDiver(s,e,.01,enemyShot);expect(e.phase).toBe('emerge');
 for(let i=0;i<110;i++){e.clock+=1/120;updateDiver(s,e,1/120,enemyShot);}expect(e.phase).toBe('swim');
 for(let i=0;i<90;i++){const old=e.x;e.clock+=1/120;updateDiver(s,e,1/120,enemyShot);if(e.phase==='swim'&&e.x!==old)expect(e.dir).toBe(Math.sign(e.x-old));}
 e.phase='swim';e.diveWait=0;s.shots=[{x:e.x+40,y:e.waterY,life:1}];updateDiver(s,e,.01,enemyShot);expect(e.phase).toBe('dive');
});
test('guarded water balloons burst into a splash and falling droplets',()=>{
 const s=battle(2);s.player.guarding=true;s.player.dir=1;s.player.guardAge=1;
 const q={kind:'barge-balloon',barge:true,water:true,x:s.player.x+35,y:s.player.y-30,r:23,vx:-100,life:3};
 expect(guardBlocks(s,q)).toBe(true);expect(q.life).toBe(0);expect(s.effects.some(e=>e.bargeSplash)).toBe(true);expect(s.effects.filter(e=>e.waterDrop)).toHaveLength(6);
});
test('fort has independently damaged cannons, then an exposed core, and does not end the walk at death',()=>{
 const s=battle(5),parts=fortSystems(s);expect(fortTargets(s).filter(t=>!t.part.startsWith('window-')).map(t=>t.part)).toEqual(['upper','lower','core']);
 strike(s,'upper',999);expect(parts.upper.hp).toBe(0);expect(parts.lower.hp).toBe(70);expect(s.boss.hp).toBe(210);expect(parts.upper.flash).toBeGreaterThan(0);expect(parts.lower.flash).toBe(0);
 strike(s,'lower',999);tick(s,40);expect(s.boss.phase).toBe('transform');expect(fortTargets(s).filter(t=>!t.part.startsWith('window-')).map(t=>t.part)).toEqual(['core']);tick(s,300);expect(fortTargets(s).filter(t=>!t.part.startsWith('window-')).map(t=>t.part)).toEqual(['core']);strike(s,'core',999);tick(s,360);
 expect(s.boss.hp).toBe(0);expect(s.boss.defeat.ready).toBe(true);expect(s.done).toBe(false);expect(s.clear).toBeFalsy();expect(s.arenaLocked).toBe(false);
 const x=s.player.x;tick(s,120,{right:true});expect(s.player.x).toBeGreaterThan(x+100);
 s.player.x=s.level.fortDoor.x;tick(s,180);expect(s.fortInside).toBe(true);expect(s.player.x).toBe(s.level.fortDoor.insideX);
 s.player.x=s.level.exit[0];tick(s,140);expect(s.done).toBe(true);expect(s.won).toBe(true);expect(nextAdventureChapter(s.index)).toBe(3);
 retryAdventure(s);expect(s.fortInside).toBeUndefined();expect(s.boss.hp).toBe(s.boss.maxHp);
});
test('fort preserves backstage enemies, announces attacks before launching, and its shots are fire',()=>{
 const s=createAdventure(5);s.player.x=s.level.arena.entry+20;s.player.y=s.level.arena.y;s.player.hurt=999;tick(s,1);
 expect(s.enemies.some(e=>e.x>s.level.fortDoor.insideX)).toBe(true);tick(s,220);expect(s.hostile.some(q=>q.ember)).toBe(false);
 const phases=new Set();for(let i=0;i<480;i++){stepAdventure(s,{},1/120);phases.add(s.boss.phase);}
 expect(phases.has('warn')).toBe(true);expect(phases.has('attack')).toBe(true);expect(s.hostile.some(q=>q.ember&&q.element==='fire')).toBe(true);
});
test('ordinary aimed shots can disable both gun decks and then the heart from inside the fort',()=>{
 const s=battle(5);s.player.x=s.boss.x-200;s.boss.timer=999;
 for(let i=0;i<10800&&s.boss.hp>0;i++){
  const parts=fortSystems(s),guns=parts.upper.hp>0||parts.lower.hp>0;
  stepAdventure(s,guns?{attack:true,hold:true,up:true}:{right:true,attack:true,hold:s.player.x>=s.boss.x-100},1/120);
 }
 expect(fortSystems(s).upper.hp).toBe(0);expect(fortSystems(s).lower.hp).toBe(0);expect(s.boss.hp).toBe(0);
});
test('chapter order inserts the land approach and migrates progress without renumbering collected stars',()=>{
 expect(CHAPTER_ORDER).toEqual([0,1,2,5,3,4]);expect(nextAdventureChapter(2)).toBe(5);expect(nextAdventureChapter(5)).toBe(3);expect(nextAdventureChapter(4)).toBeNull();
 const save=sanitizeSave({version:1,adventureUnlocked:3,adventureCleared:[0,1,2,3],stars:123,economy:2});expect(save.adventureUnlocked).toBe(4);expect(save.adventureCleared).toEqual([0,1,2,3]);expect(save.stars).toBe(123);expect(sanitizeSave(save)).toEqual(save);
 expect(createAdventure(5).level.chapter).toBe('1-4');expect(createAdventure(3).level.chapter).toBe('1-5');expect(createAdventure(2).level.circusArrival).toBeUndefined();expect(createAdventure(3).player.x).toBeGreaterThan(0);
});

test('forest, scorched approach, fortress, backstage and revised crews render in the browser',async({page})=>{
 test.setTimeout(90000);const folder='tests/artifacts/arcade/ember-revision/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade',{waitUntil:'domcontentloaded'});
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{followAdventureCamera},{fortSystems}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureCamera.js'),import('/src/components/arcade/adventure/actors/bosses/adventureEmberFort.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='ember-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);window.ember={art,c,createAdventure,stepAdventure,renderAdventure,followAdventureCamera,fortSystems};
 });
 for(const [name,x]of [['forest',800],['scorched',7200],['fort',31070],['entrance',33250],['backstage',34300]]){
  await page.evaluate(({name,x})=>{const w=window.ember,s=w.createAdventure(5);w.s=s;s.player.x=x;s.player.y=s.level.arena.y;s.player.hurt=999;s.noticeTime=0;s.player.ground=0;if(name==='backstage')s.fortInside=true;if(name==='fort'){s.boss.phase='warn';s.boss.move='salvo';s.boss.timer=1;s.boss.engaged=true;s.arenaLocked=true;}for(let i=0;i<500;i++)w.followAdventureCamera(s,1/120);w.renderAdventure(w.c,s,w.art);},{name,x});
  await page.locator('#ember-review').screenshot({path:folder+name+'.jpg'});
 }
 await page.evaluate(()=>{const w=window.ember,s=w.createAdventure(5);w.s=s;s.player.x=31100;s.player.y=620;s.player.hurt=999;s.boss.phase='warn';s.boss.timer=.9;s.boss.engaged=true;s.boss.move='salvo';s.arenaLocked=true;for(let i=0;i<500;i++)w.followAdventureCamera(s,1/120);});
 const frames=await page.evaluate(async()=>{const w=window.ember,frames=[];let n=0;await new Promise(resolve=>{const frame=()=>{for(let i=0;i<4;i++)w.stepAdventure(w.s,{},1/120);w.renderAdventure(w.c,w.s,w.art);if([15,35,60,85,110,140].includes(n))frames.push({n,jpg:w.c.toDataURL('image/jpeg',.88).split(',')[1]});if(++n<145)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});return frames;});
 for(const q of frames)fs.writeFileSync(folder+'fort-motion-'+q.n+'.jpg',Buffer.from(q.jpg,'base64'));
 const locality=await page.evaluate(async()=>{
  const w=window.ember,{drawBarge}=await import('/src/components/arcade/adventure/render/bargeCanvas.js'),{bargeParts}=await import('/src/components/arcade/adventure/actors/bosses/bargeSystems.js');
  const s=w.createAdventure(2);Object.assign(s.boss,{phase:'recover',clock:1,flash:0});s.time=1;s.fxTime=1;
  const c=document.createElement('canvas');c.width=1000;c.height=720;const ctx=c.getContext('2d',{willReadFrequently:true});
  const draw=()=>{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,1000,720);ctx.translate(500-s.boss.x,0);drawBarge(ctx,s,w.art,true);return ctx.getImageData(0,0,1000,720).data;};
  const before=draw();s.boss.flash=.3;const p=bargeParts(s);p.drum.flash=.23;const after=draw();let local=0,remote=0;
  for(let y=0;y<720;y++)for(let x=0;x<1000;x++){const k=(y*1000+x)*4,d=Math.abs(before[k]-after[k])+Math.abs(before[k+1]-after[k+1])+Math.abs(before[k+2]-after[k+2]);if(d>15){if(x<450)local++;else remote++;}}
  return{local,remote};
 });
 expect(locality.local).toBeGreaterThan(1000);expect(locality.remote).toBe(0);
 await page.evaluate(async()=>{
  const w=window.ember,{makeEnemy}=await import('/src/components/arcade/adventure/actors/enemies/adventureEnemies.js'),s=w.createAdventure(2);w.s=s;
  for(const key of ['enemies','outposts','supplies','stars','cages','hazards'])s[key]=[];
  s.camera={x:2850,y:100,backdropY:100,zoom:1};s.player.x=3120;s.player.y=465;s.player.hurt=999;s.noticeTime=0;
  for(const [i,x]of [3060,3290,3550].entries()){const e=makeEnemy(x,465,i===2?9:8);Object.assign(e,{aquatic:true,waterY:608,swimAge:0,deckAge:0,phaseAge:.45,phase:i===0?'emerge':i===1?'surfaceFire':'sail',y:608,clock:1});s.enemies.push(e);}
  w.renderAdventure(w.c,s,w.art);
 });
 await page.locator('#ember-review').screenshot({path:folder+'aquatic-crew.jpg'});
 await page.evaluate(()=>{const w=window.ember,e=w.s.enemies[2];Object.assign(e,{hp:0,deathAge:.7,deadTime:1.6,waterY:608,y:629});w.renderAdventure(w.c,w.s,w.art);});
 await page.locator('#ember-review').screenshot({path:folder+'crew-sinking.jpg'});
 expect(errors).toEqual([]);
});
