import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateBoss} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {captureInBubble} from '../src/components/arcade/adventure/engine/adventureBubbles';
import {buddyPosition} from '../src/components/arcade/adventure/engine/adventureDefense';
import {bargeRig} from '../src/components/arcade/adventure/actors/bosses/adventureBarge';
const folder='tests/artifacts/arcade/harbor-aquatic/';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function quiet(){const s=createAdventure(2);for(const key of ['enemies','outposts','supplies','hazards','stars','cages'])s[key]=[];s.player.hurt=100;return s;}
const helpers={body:playerBody,say:()=>{},particles:()=>{}};
function battle(move){const s=quiet(),a=s.level.arena;Object.assign(s.player,{x:a.left+450,y:a.y,ground:s.platforms.findIndex(q=>q.x===a.left),hurt:0});Object.assign(s.boss,{phase:'warn',timer:.001,engaged:true,vulnerable:true,move});s.arenaLocked=true;return s;}

test('moving boats shoot up and can be sunk with actual downward player attacks',()=>{
 const s=quiet(),e=makeEnemy(3490,608,9,0);s.enemies=[e];Object.assign(s.player,{x:3200,y:465,dir:1,ground:s.platforms.findIndex(q=>q.x===2850)});
 let firedUp=false,sank=false;
 for(let i=0;i<180;i++){stepAdventure(s,{},1/120);firedUp ||= s.hostile.some(q=>q.kind==='water-bolt'&&q.vy<0);}
 expect(e.y).toBeGreaterThan(s.player.y+130);expect(e.x).toBeLessThan(3490);s.player.x=e.x-185;const start=e.x;
 for(let i=0;i<850;i++){
  stepAdventure(s,{hold:true,down:true,right:e.x>=s.player.x,left:e.x<s.player.x,attack:true},1/120);
  firedUp ||= s.hostile.some(q=>q.kind==='water-bolt'&&q.vy<0);
  if(e.defeated){sank=true;break;}
 }
 expect(e.x).not.toBe(start);expect(firedUp).toBe(true);expect(sank).toBe(true);expect(e.deadTime).toBeGreaterThan(2);
 const y=e.y;tick(s,110);expect(e.y).toBeGreaterThan(y+20);expect(e.splashed).toBe(true);tick(s,200);expect(s.enemies).toEqual([]);
 retryAdventure(s);expect(s.enemies.filter(q=>q.type===9)).toHaveLength(2);expect(s.level.harborAmbush.waves.flat().filter(q=>q.type===9)).toHaveLength(2);expect(s.enemies.every(q=>!q.defeated)).toBe(true);
});

test('the diver resumes walking after each volley without teleporting',()=>{
 const s=quiet(),e=makeEnemy(3180,465,8,0);s.enemies=[e];
 Object.assign(s.player,{x:2780,y:465,ground:s.platforms.findIndex(q=>q.x===2300)});
 const phases=new Set();let landed=false,volleys=0;
 for(let i=0;i<1600;i++){
  const x=e.x,phase=e.phase;stepAdventure(s,{},1/120);phases.add(e.phase);
  if(e.phase==='landing')landed=true;
  if(landed)expect(Math.abs(e.x-x)).toBeLessThanOrEqual(120/120+.01);
  if(phase!=='attack'&&e.phase==='attack')volleys++;
 }
 expect(landed).toBe(true);expect(volleys).toBeGreaterThanOrEqual(3);expect(phases.has('patrol')&&phases.has('swim')&&phases.has('leap')).toBe(true);
});

test('boats remain visible across piers and nearby water stays anchored while animating',async({page})=>{
 await page.goto('/arcade');const report=await page.evaluate(async()=>{
  const [{createAdventure},{makeEnemy},{loadAdventureArt,renderAdventure},{drawAquaticEnemy},{riverBridgePiers},{drawHarborBackdrop}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/actors/enemies/adventureEnemies.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/riverActorsCanvas.js'),import('/src/components/arcade/adventure/render/adventureRiverCanvas.js'),import('/src/components/arcade/adventure/render/adventureHarborCanvas.js')]);
  const art=await loadAdventureArt(),s=createAdventure(2),bridge=s.platforms.find(q=>q.x===2850),pier=riverBridgePiers(bridge,art['river-bridge'])[0];
  for(const key of ['enemies','outposts','supplies','hazards','stars','cages'])s[key]=[];s.level={...s.level,harborProps:[],scenery:[]};s.noticeTime=0;
  s.camera={x:2850,y:80,backdropY:80,zoom:1};Object.assign(s.player,{x:2780,y:465,ground:3});
  const boat=makeEnemy(pier.x,608,9,0);Object.assign(boat,{waterY:608,phase:'sail'});s.enemies=[boat];
  const canvas=document.createElement('canvas');canvas.style='width:960px;height:540px';document.body.append(canvas);renderAdventure(canvas,s,art,{reduced:true});
  const raw=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,960,540).data;
  const actor=document.createElement('canvas');actor.width=960;actor.height=540;const ctx=actor.getContext('2d',{willReadFrequently:true});ctx.translate(-2850,-80);drawAquaticEnemy(ctx,boat,art,true);
  const ink=ctx.getImageData(0,0,960,540).data;let solid=0,hidden=0;
  for(let k=0;k<ink.length;k+=4)if(ink[k+3]>=252){solid++;if(Math.max(Math.abs(raw[k]-ink[k]),Math.abs(raw[k+1]-ink[k+1]),Math.abs(raw[k+2]-ink[k+2]))>15)hidden++;}
  const {drawHarborSurface}=await import('/src/components/arcade/adventure/render/harborSurfaceCanvas.js');
  const backdrop=document.createElement('canvas');backdrop.width=960;backdrop.height=540;const bg=backdrop.getContext('2d',{willReadFrequently:true});
  const surface=(cam,time,reduced=false)=>{s.camera.x=cam;s.time=time;bg.clearRect(0,0,960,540);bg.save();bg.translate(-cam,-80);drawHarborSurface(bg,s,art,reduced);bg.restore();return bg.getImageData(0,0,960,540).data;};
  const before=surface(2850,0),pan=surface(2950,0),after=surface(2850,1.7),still=surface(2850,1.7,true);
  let waterDifference=0,movingWater=0,reducedDifference=0;
  for(let y=505;y<535;y++)for(let x=200;x<850;x++){const k=(y*960+x)*4,j=k-100*4;
   for(let ch=0;ch<4;ch++){waterDifference+=Math.abs(before[k+ch]-pan[j+ch]);reducedDifference+=Math.abs(before[k+ch]-still[k+ch]);}
   if(Math.abs(before[k]-after[k])+Math.abs(before[k+1]-after[k+1])+Math.abs(before[k+2]-after[k+2])>9)movingWater++;
  }
  canvas.remove();return{solid,hidden,waterDifference,movingWater,reducedDifference};
 });fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(folder+'boat-water-regression.json',JSON.stringify(report,null,2));expect(report.solid).toBeGreaterThan(3000);expect(report.hidden/report.solid).toBeLessThan(.01);
 // Compare the same world pixels before/after a camera pan, not distant water.
 expect(report.waterDifference/(650*30*4)).toBeLessThan(1);expect(report.reducedDifference).toBe(0);expect(report.movingWater).toBeGreaterThan(1000);
});

test('water bullets and balloons retain their identity inside Bubble Tape',()=>{
 const bubble={kind:3,life:2,vx:290,vy:0};
 for(const kind of ['water-bolt','barge-balloon']){const h={kind,water:true,barge:kind==='barge-balloon',life:2};expect(captureInBubble(bubble,h)).toBe(true);expect(h.life).toBe(0);}
 expect(bubble.captured.map(q=>q.kind)).toEqual(['water-bolt','barge-balloon']);expect(bubble.captured.every(q=>q.water)).toBe(true);
 expect(captureInBubble(bubble,{kind:'barge-jet',life:2})).toBe(false);
});

test('the long water cannon hits standing Hexy, can be jumped and stops with the boss',()=>{
 const s=battle('jet');tick(s,195);expect(s.hostile.some(q=>q.kind==='barge-jet'&&q.length>900)).toBe(true);expect(s.hearts).toBeLessThan(s.maxHearts);
 const air=battle('jet');tick(air,1);Object.assign(air.player,{y:air.level.arena.y-160,vy:0,ground:null,hurt:0});
 tick(air,62,{jump:true});expect(air.hearts).toBe(air.maxHearts);
 s.boss.hp=0;tick(s,1);expect(s.hostile.some(q=>q.kind==='barge-jet')).toBe(false);
});

test('rear cannons have distinct real origins and the hull stays anchored',()=>{
 const s=battle('broadside');Object.assign(s.boss,{hp:140,transformed:true,armorBroken:true});s.player.hurt=100;
 const x=s.boss.x;tick(s,120);const shots=s.hostile.filter(q=>q.kind==='barge-balloon');expect(shots.length).toBeGreaterThanOrEqual(2);expect(s.boss.x).toBeCloseTo(x);expect(s.hostile.some(q=>q.kind==='barge-surf')).toBe(false);
 const m=bargeRig(s);expect(m.ports).toHaveLength(2);expect(m.ports[1].x).toBeGreaterThan(m.ports[0].x);
});

test('bunnies stay on a raised dock and follow takeoff and landing continuously',()=>{
 const s=quiet(),dock=s.platforms.find(q=>q.x===5790);s.rescued=3;
 Object.assign(s.player,{x:6000,y:dock.y,ground:s.platforms.indexOf(dock)});tick(s,90);
 for(let i=0;i<3;i++)expect(buddyPosition(s,i).y).toBeCloseTo(dock.y,3);
 let last=Array.from({length:3},(_,i)=>({...buddyPosition(s,i)})),air=false,landed=false;
 for(let n=0;n<400;n++){
  stepAdventure(s,{jump:n<28},1/120);
  const now=Array.from({length:3},(_,i)=>({...buddyPosition(s,i)}));
  for(let i=0;i<3;i++){expect(Math.abs(now[i].y-last[i].y)).toBeLessThanOrEqual(850/120+.001);expect(now[i].y).toBeLessThan(330);}
  air ||= s.player.ground===null;landed ||= air&&s.player.ground!==null;last=now;
 }
 expect(air&&landed).toBe(true);for(let i=0;i<3;i++)expect(buddyPosition(s,i).y).toBeCloseTo(dock.y,2);
 const before=buddyPosition(s,0).x;tick(s,1,{left:true});expect(Math.abs(buddyPosition(s,0).x-before)).toBeLessThan(6);
 retryAdventure(s);expect(s.buddies).toBeUndefined();expect(s.buddyPath).toBeUndefined();
});

test('aquatic actor frames have real alpha and distinct hand-painted poses',async()=>{
 for(const [file,cols,rows]of [['enemies/river-diver-aquatic',6,4],['enemies/river-boat-actions',6,1],['effects/harbor-aquatic',4,4]]){
  const raw=await sharp('public/arcade/sprites/'+file+'.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});expect(raw.info.width).toBe(cols*256);expect(raw.info.height).toBe(rows*256);
  for(let i=0;i<cols*rows;i++){
   const tile=await sharp('public/arcade/sprites/'+file+'.webp').extract({left:i%cols*256,top:Math.floor(i/cols)*256,width:256,height:256}).ensureAlpha().raw().toBuffer();
   expect(tile[3]).toBe(0);let ink=0;for(let j=3;j<tile.length;j+=4)if(tile[j]>128)ink++;expect(ink).toBeGreaterThan(3000);
  }
 }
 const ground=await sharp('public/arcade/maps/harbor/ground-v2.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});let topAlpha=0;for(let x=0;x<ground.info.width;x++)topAlpha+=ground.data[x*4+3];expect(topAlpha/ground.info.width).toBeLessThan(20);
});

test('flag pole is pixel-stable while its cloth animates',async({page})=>{
 await page.goto('/arcade');const result=await page.evaluate(async()=>{
  const {drawCheckpoint}=await import('/src/components/arcade/adventure/render/checkpointCanvas.js');const img=new Image();img.src='/arcade/sprites/props/victory-flag.webp';await img.decode();
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d',{willReadFrequently:true}),draw=frame=>{ctx.clearRect(0,0,256,256);drawCheckpoint(ctx,img,frame,128,250,256);return ctx.getImageData(0,0,256,256).data;};
  const a=draw(0),b=draw(3);let pole=0,cloth=0;for(let y=0;y<256;y++)for(let x=0;x<256;x++){const k=(y*256+x)*4;if(a[k]!==b[k]||a[k+1]!==b[k+1]||a[k+2]!==b[k+2]||a[k+3]!==b[k+3]){if(x<82)pole++;else cloth++;}}return{pole,cloth};
 });expect(result.pole).toBe(0);expect(result.cloth).toBeGreaterThan(3000);
});

test('aquatic encounters render in motion with bridges, captured water and a long cannon stream',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{groundY},{followAdventureCamera}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/world/adventureTerrain.js'),import('/src/components/arcade/adventure/render/adventureCamera.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='aquatic-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const scene=(x,boss=false,move='jet')=>{const s=createAdventure(2);s.noticeTime=0;s.stars=[];s.outposts=[];s.supplies=[];s.hazards=[];s.cages=[];s.player.hurt=100;
   Object.assign(s.player,{x,y:groundY(s.platforms,x),ground:s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w)});s.camera={x:x-300,y:s.player.y-385,backdropY:s.player.y-385,zoom:1};
   if(boss){s.enemies=[];s.arenaLocked=true;Object.assign(s.boss,{phase:'warn',move,timer:.001,engaged:true,vulnerable:true});for(let i=0;i<240;i++)followAdventureCamera(s,1/120);}
   window.aquatic.s=s;return s;};
  window.aquatic={c,art,scene,stepAdventure,renderAdventure};scene(3080);
  for(let i=0;i<40;i++)stepAdventure(window.aquatic.s,{},1/120);renderAdventure(c,window.aquatic.s,art);
 });
 await page.locator('#aquatic-review').screenshot({path:folder+'swimming-boats-foam.jpg'});
 await page.evaluate(()=>{const w=window.aquatic;for(let i=0;i<190;i++)w.stepAdventure(w.s,{},1/120);w.renderAdventure(w.c,w.s,w.art);});await page.locator('#aquatic-review').screenshot({path:folder+'leaping-diver.jpg'});
 await page.evaluate(()=>{const w=window.aquatic;for(let i=0;i<170;i++)w.stepAdventure(w.s,{},1/120);w.renderAdventure(w.c,w.s,w.art);});await page.locator('#aquatic-review').screenshot({path:folder+'water-pistol.jpg'});
 await page.evaluate(()=>{const w=window.aquatic;w.s.shots=[{x:3350,y:425,r:35,scale:1.4,kind:3,age:.3,life:1,captured:[{kind:'water-bolt',water:true},{kind:'barge-balloon',water:true,barge:true}]}];w.renderAdventure(w.c,w.s,w.art);});await page.locator('#aquatic-review').screenshot({path:folder+'captured-water.jpg'});
 for(const move of ['mortar','jet','surge']){await page.evaluate(move=>{const w=window.aquatic,s=w.scene(13650,true,move);if(move==='surge')Object.assign(s.boss,{transformed:true,armorBroken:true,hp:140});for(let i=0;i<(move==='surge'?65:125);i++)w.stepAdventure(s,{},1/120);w.renderAdventure(w.c,s,w.art);},move);await page.locator('#aquatic-review').screenshot({path:folder+move+'.jpg'});}
 await page.evaluate(()=>{const w=window.aquatic,s=w.scene(6000);s.enemies=[];s.rescued=3;s.player.hurt=0;const dock=s.platforms.find(q=>q.x===5790);Object.assign(s.player,{y:dock.y,ground:s.platforms.indexOf(dock)});for(let i=0;i<90;i++)w.stepAdventure(s,{},1/120);w.renderAdventure(w.c,s,w.art);});await page.locator('#aquatic-review').screenshot({path:folder+'bunnies-raised-dock.jpg'});
 await page.evaluate(()=>{const w=window.aquatic;for(let i=0;i<26;i++)w.stepAdventure(w.s,{jump:true},1/120);w.renderAdventure(w.c,w.s,w.art);});await page.locator('#aquatic-review').screenshot({path:folder+'bunnies-takeoff.jpg'});
 await page.evaluate(()=>{const w=window.aquatic;for(let i=0;i<220;i++)w.stepAdventure(w.s,{},1/120);w.renderAdventure(w.c,w.s,w.art);});await page.locator('#aquatic-review').screenshot({path:folder+'bunnies-landed.jpg'});
 const movie=await page.evaluate(async()=>{
  const w=window.aquatic;w.scene(3100);const stream=w.c.captureStream(60),recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),parts=[];recorder.ondataavailable=e=>parts.push(e.data);recorder.start();
  const start=performance.now();await new Promise(resolve=>{const animate=()=>{w.stepAdventure(w.s,{},1/120);w.stepAdventure(w.s,{},1/120);w.renderAdventure(w.c,w.s,w.art);if(performance.now()-start<4500)requestAnimationFrame(animate);else resolve();};requestAnimationFrame(animate);});
  await new Promise(resolve=>{recorder.onstop=resolve;recorder.stop();});for(const track of stream.getTracks())track.stop();const bytes=new Uint8Array(await new Blob(parts).arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary);
 });fs.writeFileSync(folder+'river-encounter.webm',Buffer.from(movie,'base64'));expect(errors).toEqual([]);
});
