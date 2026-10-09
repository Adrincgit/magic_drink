import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,playerBody,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {harlequinDrawing,updateHarlequin} from '../src/components/arcade/adventure/actors/bosses/adventureHarlequin';
import {castHarlequinFire,PYRE_HEIGHT,PYRE_BASE_DURATION} from '../src/components/arcade/adventure/actors/bosses/harlequinFire';
import {enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {arenaBarrierPositions} from '../src/components/arcade/adventure/render/infernoStageCanvas';
import {adventureBounds,followAdventureCamera} from '../src/components/arcade/adventure/render/adventureCamera';
import {grandRingBackdropLayers,grandRingBackdropPlacement} from '../src/components/arcade/adventure/render/harlequinCanvas';
import {hexyChargeParticle} from '../src/components/arcade/adventure/render/adventureSuperCanvas';
import {hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {launchClashLoser,stepClashAftermath} from '../src/components/arcade/adventure/engine/clashAftermath';
import {CLASH_THROW_DISTANCE} from '../src/components/arcade/adventure/engine/clashGeometry';
import {fallingEmber} from '../src/components/arcade/adventure/render/infernoBackdropCanvas';

function fresh(stage=2){const s=createAdventure(3);s.arenaLocked=true;s.supplies=[];s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:1500,y:480,ground:2});Object.assign(s.boss,{x:2430,y:480,phase:'recover',timer:100,engaged:true,vulnerable:true,debrisClock:100,stage,hp:stage===1?720:stage===2?420:240});return s;}
const tick=(s,n=1,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};

test('burning column bases persist at the same positions and eventually disappear',()=>{
 const s=fresh();s.player.x=1980;s.boss.move='pyre';s.boss.volley=0;castHarlequinFire(s,s.boss,enemyShot);s.player.x=2060;const positions=s.hostile.map(q=>q.x);
 tick(s,265);expect(s.hearts).toBe(5);expect(s.hostile).toHaveLength(3);expect(s.hostile.every(q=>q.kind==='harlequin-groundfire'&&q.source==='pyre'&&q.duration===PYRE_BASE_DURATION)).toBe(true);expect(s.hostile.map(q=>q.x).sort((a,b)=>a-b)).toEqual(positions);expect(PYRE_HEIGHT).toBe(420);
 s.player.x=positions[0];tick(s);expect(s.hearts).toBe(4);s.player.x=2060;tick(s,440);expect(s.hostile).toHaveLength(0);
});

test('phase transitions use fire explosions and both aid crates contain Witchy Kiwii',()=>{
 const s=fresh(1);s.boss.hp=480;tick(s,120);expect(s.boss.stage).toBe(2);expect(s.effects.some(q=>q.fireBurst)).toBe(true);expect(s.effects.some(q=>q.harlequin)).toBe(false);expect(s.supplies[0].loot.kind).toBe(2);
 tick(s,120);s.boss.hp=240;tick(s,120);expect(s.boss.stage).toBe(3);expect(s.supplies.map(q=>q.loot.kind)).toEqual([2,2]);expect(s.effects.some(q=>q.harlequin)).toBe(false);
});

test('rush anticipation uses all twelve drawings and the ground strike reaches impact before columns heat',()=>{
 for(const stage of [1,2,3]){const s=fresh(stage),b=s.boss;Object.assign(b,{move:'dash',phase:'warn',warnDuration:1,timer:1});const frames=[];for(let i=0;i<12;i++){b.timer=1-(i+.5)/12;frames.push(harlequinDrawing(s).frame);expect(harlequinDrawing(s).key).toContain('inferno');}expect(new Set(frames).size).toBe(12);}
 const s=fresh(),b=s.boss;s.damage=()=>{};Object.assign(b,{move:'pyre',phase:'warn',warnDuration:1,timer:.001});updateHarlequin(s,1/120,{body:playerBody},enemyShot);
 let contact=false;for(let i=0;i<30;i++){updateHarlequin(s,1/120,{body:playerBody},enemyShot);const frame=harlequinDrawing(s).frame;if(frame===18)contact=true;if(s.hostile.length){expect(contact).toBe(true);expect(s.hostile.every(q=>!q.damaging&&q.age===0)).toBe(true);break;}}
 expect(s.hostile).toHaveLength(3);
});

test('increasing phases throw faster denser volleys while leaving pyre escape gaps',()=>{
 const results=[];for(const stage of [1,2,3]){const s=fresh(stage),b=s.boss;s.damage=()=>{};Object.assign(b,{phase:'warn',timer:.001,move:'fan'});for(let n=0;n<210;n++)updateHarlequin(s,1/120,{body:playerBody},enemyShot);results.push({count:s.hostile.length,speed:Math.hypot(s.hostile[0].vx,s.hostile[0].vy)});}
 expect(results[0].speed).toBe(335);expect(results[1].speed).toBeGreaterThan(results[0].speed);expect(results[2].speed).toBeGreaterThan(results[1].speed);expect(results[2].count).toBeGreaterThan(results[1].count);
 const s=fresh(3);s.boss.move='pyre';s.boss.volley=0;castHarlequinFire(s,s.boss,enemyShot);s.player.x+=80;tick(s,390);expect(s.hearts).toBe(5);
});

test('visible barriers follow the exact arena and retreat limits and release after victory',()=>{
 const s=fresh();for(const bounds of [undefined,{left:700,right:2616}]){s.player.x=bounds?900:1500;s.clashRetreatBounds=bounds;const a=adventureBounds(s),p=arenaBarrierPositions(s);expect(p.map(q=>q.edge)).toEqual([a.left-15,a.right+15]);}
 s.boss.hp=0;expect(arenaBarrierPositions(s)).toHaveLength(2);tick(s,600);expect(s.boss.defeat.ready).toBe(true);expect(arenaBarrierPositions(s)).toEqual([]);
});

test('charge particles converge toward the measured wand in the air and mirrored directions',()=>{
 for(const dir of [-1,1])for(const y of [480,300]){const s=fresh();s.player.dir=dir;s.player.y=y;s.player.ground=y===480?2:null;s.player.charge=.2;s.camera={x:1050,y:-100,zoom:.7};const h=hexyMuzzle(s),a=hexyChargeParticle(s,0,.1),b=hexyChargeParticle(s,0,.72);expect(a.tip).toEqual(h);expect(b.tip).toEqual(h);expect(Math.hypot(b.x-h.x,b.y-h.y)).toBeLessThan(Math.hypot(a.x-h.x,a.y-h.y)*.35);}
});

test('winning scorches a surviving boss, produces a large explosion and retry restores the costume',()=>{
 const s=fresh(3);s.powerClash={won:true};launchClashLoser(s);expect(s.boss.hp).toBe(48);expect(s.boss.scorched).toBeGreaterThan(.2);expect(s.effects.find(q=>q.fireBurst).size).toBeGreaterThan(450);expect(s.effects.filter(q=>q.cinematicSmoke).length).toBeGreaterThan(8);retryAdventure(s);expect(s.boss.scorched).toBeUndefined();
});

test('either loser is violently thrown within the wider fire walls and stays inside the lens',()=>{
 for(const reverse of [false,true])for(const won of [false,true]){
  const s=fresh(3),a=s.level.arena;expect(a.right-a.left).toBe(2840);
  s.player.x=reverse?a.right-a.throwMargin:a.left+a.throwMargin;s.boss.x=reverse?a.left+a.throwMargin:a.right-a.throwMargin;
  for(let i=0;i<600;i++)followAdventureCamera(s,1/120);
  const loser=won?s.boss:s.player;s.powerClash={won};launchClashLoser(s);
  expect(Math.abs(s.powerClash.flight.toX-s.powerClash.flight.fromX)).toBe(Math.min(CLASH_THROW_DISTANCE,a.throwMargin-(won?120:70)));
  const start=loser.x;for(let i=0;i<160;i++){s.powerClash.age+=1/120;stepClashAftermath(s,1/120,{hurt:()=>{},finishBoss:()=>{}});
   for(const [actor,margin]of [[s.player,65],[s.boss,110]]){expect((actor.x-margin-s.camera.x)*s.camera.zoom).toBeGreaterThanOrEqual(0);expect((actor.x+margin-s.camera.x)*s.camera.zoom).toBeLessThanOrEqual(960);}
   expect((a.y-s.camera.y)*s.camera.zoom).toBeCloseTo(454,1);
   if(i===29)expect(Math.abs(loser.x-start)).toBeGreaterThan(230);
  }
  expect(loser.x).toBeGreaterThan(a.left+24);expect(loser.x).toBeLessThan(a.right-24);expect(loser.y).toBe(a.y);
 }
});

test('the complete burning panorama crossfades at both transitions without changing its placement',async()=>{
 const images={};for(const name of ['background','background-burning-v2','background-inferno-v2'])images[name]=await sharp('public/arcade/maps/grand-ring/'+name+'.webp').metadata();
 for(const name of ['background-burning-v2','background-inferno-v2'])expect([images[name].width,images[name].height]).toEqual([images.background.width,images.background.height]);
 const s=fresh(1),placement=grandRingBackdropPlacement(s,images.background);s.boss.hp=480;tick(s,120);
 expect(grandRingBackdropLayers(s)).toMatchObject({from:1,to:2});expect(grandRingBackdropLayers(s).blend).toBeGreaterThan(0);expect(grandRingBackdropLayers(s).blend).toBeLessThan(.1);
 tick(s,180);expect(grandRingBackdropLayers(s).blend).toBe(1);expect(grandRingBackdropPlacement(s,images['background-burning-v2']).w).toBe(placement.w);
 s.boss.hp=240;tick(s,120);expect(grandRingBackdropLayers(s)).toMatchObject({from:2,to:3});tick(s,180);expect(grandRingBackdropLayers(s).blend).toBe(1);
 retryAdventure(s);expect(grandRingBackdropLayers(s)).toMatchObject({from:1,to:1,blend:1});
});

test('foreground embers fall toward the fighters and reduced motion holds them still',()=>{
 const s=fresh();s.fxTime=0;const before=fallingEmber(s,0),reduced=fallingEmber(s,3,true);s.fxTime=1;
 expect(fallingEmber(s,0).y).toBeGreaterThan(before.y);expect(fallingEmber(s,3,true)).toEqual(reduced);
 const same=fallingEmber(s,1);s.camera.x+=700;s.camera.zoom=.4;expect(fallingEmber(s,1)).toEqual(same);
});

test('all 72 added action cells contain isolated transparent figures',async()=>{
 for(const name of ['inferno','inferno-mid','inferno-final']){const im=sharp('public/arcade/sprites/bosses/harlequin/'+name+'.webp');expect(await im.metadata()).toMatchObject({width:2048,height:3072,hasAlpha:true});for(let i=0;i<24;i++){const raw=await im.clone().extract({left:i%4*512,top:Math.floor(i/4)*512,width:512,height:512}).raw().toBuffer();let count=0;for(let k=3;k<raw.length;k+=4)if(raw[k]>100)count++;expect(count).toBeGreaterThan(18000);expect(count).toBeLessThan(180000);for(const k of [3,511*4+3,511*512*4+3,raw.length-1])expect(raw[k]).toBe(0);}}
});

test('review inferno phases, physical boundaries, flowing preparation, residue and charge in motion',async({page})=>{
 test.setTimeout(120000);const dir='tests/artifacts/arcade/inferno/';fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1280,height:720});await page.goto('/arcade');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';const [engine,render,camera,boss,clash]=await Promise.all([import(root+'engine/adventureModel.js'),import(root+'render/adventureCanvas.js'),import(root+'render/adventureCamera.js'),import(root+'actors/bosses/harlequinUltimate.js'),import(root+'engine/clashAftermath.js')]);const art=await render.loadAdventureArt(),canvas=document.createElement('canvas');canvas.id='inferno-review';canvas.style='position:fixed;inset:0;z-index:99999;width:1280px;height:720px';document.body.append(canvas);
  const w=window.infernoReview={engine,render,camera,boss,clash,art,canvas};w.fresh=(stage=2,reverse=false)=>{const s=engine.createAdventure(3);s.arenaLocked=true;s.supplies=[];s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:reverse?2500:1500,y:480,ground:2,hurt:20});Object.assign(s.boss,{x:reverse?1460:2430,y:480,clock:3,phase:'recover',timer:100,engaged:true,vulnerable:true,debrisClock:100,stage,hp:stage===1?720:stage===2?420:240});for(let n=0;n<600;n++)camera.followAdventureCamera(s,1/120);w.s=s;return s;};w.tick=(n=1,input={})=>{for(let i=0;i<n;i++)engine.stepAdventure(w.s,input,1/120);};w.paint=(circusFloor='wood')=>render.renderAdventure(canvas,w.s,art,{circusFloor});w.move=move=>{const s=w.fresh();Object.assign(s.boss,{move,phase:'warn',timer:1,warnDuration:1});};w.move('dash');
 });
 const c=page.locator('#inferno-review');
 for(const [name,n]of [['rush-gather',15],['rush-crouch',32],['rush-push',48],['rush-run',55]]){await page.evaluate(n=>{const w=window.infernoReview;w.tick(n);w.paint();},n);await c.screenshot({path:dir+name+'.jpg'});}
 await page.evaluate(()=>window.infernoReview.move('pyre'));
 for(const [name,n]of [['fist-raised',15],['fist-down',112],['wood-heating',70],['tower-fire',60],['remaining-fire',130]]){await page.evaluate(n=>{const w=window.infernoReview;w.tick(n);w.paint();},n);await c.screenshot({path:dir+name+'.jpg'});}
 for(const stage of [2,3]){await page.evaluate(stage=>{const w=window.infernoReview;w.fresh(stage);w.paint();},stage);await c.screenshot({path:dir+'aura-phase-'+stage+'.jpg'});}
 for(const stage of [1,2,3]){await page.evaluate(stage=>{const w=window.infernoReview;w.fresh(stage);w.paint('dark');},stage);await c.screenshot({path:dir+'dark-floor-phase-'+stage+'.jpg'});}
 const motion=await page.evaluate(async()=>{const w=window.infernoReview,{drawGrandRingBackdrop}=await import('/src/components/arcade/adventure/render/harlequinCanvas.js');w.fresh(3);const c=document.createElement('canvas');c.width=960;c.height=540;const ctx=c.getContext('2d');const frame=(age,reduced)=>{w.s.fxTime=age;drawGrandRingBackdrop(ctx,w.s,w.art,reduced);return ctx.getImageData(0,0,960,540).data;};const a=frame(0,false),b=frame(.21,false),r1=frame(0,true),r2=frame(.21,true);let changed=0,centerChanged=0,reducedChanged=0;for(let i=0;i<a.length;i+=4){if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]){changed++;const x=i/4%960,y=Math.floor(i/4/960);if(x>=500&&x<570&&y>=300&&y<370)centerChanged++;}if(r1[i]!==r2[i]||r1[i+1]!==r2[i+1]||r1[i+2]!==r2[i+2])reducedChanged++;}return{changed,centerChanged,reducedChanged};});
 expect(motion.changed).toBeGreaterThan(500);expect(motion.centerChanged).toBeLessThan(200);expect(motion.reducedChanged).toBe(0);
 for(const stage of [2,3]){await page.evaluate(stage=>{const w=window.infernoReview,s=w.fresh(stage-1);s.boss.hp=stage===2?480:240;w.tick(120);w.paint();},stage);await c.screenshot({path:dir+'background-transition-'+stage+'.jpg'});}
 for(const right of [false,true]){await page.evaluate(right=>{const w=window.infernoReview,s=w.fresh(1,right);s.player.x=right?s.level.arena.right-24:s.level.arena.left+24;for(let i=0;i<300;i++)w.camera.followAdventureCamera(s,1/120);w.paint();},right);await c.screenshot({path:dir+'boundary-'+(right?'right':'left')+'.jpg'});}
 for(const reverse of [false,true]){await page.evaluate(reverse=>{const w=window.infernoReview,s=w.fresh(2,reverse);s.player.hurt=0;s.player.dir=reverse?-1:1;w.tick(1,{super:true});w.tick(65);w.paint();},reverse);await c.screenshot({path:dir+'wand-charge-'+(reverse?'right':'left')+'.jpg'});}
 await page.evaluate(()=>{const w=window.infernoReview,s=w.fresh(3);s.boss.scorched=.22;w.paint();});await c.screenshot({path:dir+'scorched.jpg'});
 for(const won of [false,true])for(const reverse of [false,true]){
  await page.evaluate(([won,reverse])=>{const w=window.infernoReview,s=w.fresh(3,reverse);s.powerClash={won,sparks:[]};w.clash.launchClashLoser(s);w.tick(55);w.paint();},[won,reverse]);await c.screenshot({path:dir+'violent-flight-'+(won?'boss':'hexy')+'-'+(reverse?'left':'right')+'.jpg'});
 }
 const data=await page.evaluate(async()=>{const w=window.infernoReview;w.move('dash');const stream=w.canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3500000}),chunks=[];rec.ondataavailable=e=>chunks.push(e.data);rec.start();await new Promise(resolve=>{const start=performance.now();let prev=start,acc=0,columns=false,charge=false;const frame=now=>{const t=(now-start)/1000;acc+=Math.min(.05,(now-prev)/1000);prev=now;while(acc>=1/120){w.tick();acc-=1/120;}if(t>=3.7&&!columns){columns=true;w.move('pyre');}if(t>=9.5&&!charge){charge=true;const s=w.fresh(2);s.player.hurt=0;w.tick(1,{super:true});}w.paint();if(t<11.6)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});const stopped=new Promise(resolve=>rec.onstop=resolve);rec.stop();await stopped;stream.getTracks().forEach(t=>t.stop());const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(value);});fs.writeFileSync(dir+'motion-review.webm',Buffer.from(data,'base64'));expect(errors).toEqual([]);
});
