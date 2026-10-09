import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {updateHarlequin,stepHarlequinProjectile,harlequinDrawing} from '../src/components/arcade/adventure/actors/bosses/adventureHarlequin';
import {beginBossArrival,stepBossArrival} from '../src/components/arcade/adventure/actors/bosses/adventureArrival';
import {castHarlequinFire,leaveHarlequinFire,TRAIL_DURATION} from '../src/components/arcade/adventure/actors/bosses/harlequinFire';
import {guardBlocks,clearPowerProjectiles} from '../src/components/arcade/adventure/engine/adventureDefense';
import {paintedMeter} from '../src/components/arcade/adventure/render/paintedDuelCanvas';

function fresh(){const s=createAdventure(3);s.arenaLocked=true;s.supplies=[];s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:1500,y:480,ground:2});Object.assign(s.boss,{x:2430,y:480,phase:'recover',timer:100,engaged:true,vulnerable:true});return s;}
const tick=(s,n=1,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};

test('health has a plain fill while the clash retains both moving beam textures',()=>{
 const calls=[],c=new Proxy({globalAlpha:1,createLinearGradient:()=>({addColorStop(){}}),drawImage:(img)=>calls.push(img)},{get:(o,k)=>o[k]??(()=>{})});
 const art={'duel-meter':{},'harlequin-ultimate-beam':{},'super-beam':{}};
 paintedMeter(c,art,0,0,600,90,.6,true,1,true);
 expect(calls).toEqual([art['duel-meter']]);calls.length=0;
 paintedMeter(c,art,0,0,600,90,.6,true,1,false);
 expect(calls).toContain(art['harlequin-ultimate-beam']);expect(calls).toContain(art['super-beam']);
});

test('fire projectiles explode with fire on the floor, Hexy, guard and charged interception',()=>{
 for(const kind of ['harlequin-ember','harlequin-card']){const s=fresh(),q={kind,harlequin:true,x:1800,y:470,r:16,life:2};stepHarlequinProjectile(s,q,1/120);expect(q.life).toBe(0);expect(s.effects.some(q=>q.fireBurst&&q.grounded)).toBe(true);expect(s.effects.some(q=>q.harlequin)).toBe(false);}
 const hit=fresh();enemyShot(hit,hit.player.x,455,0,0,'harlequin-card',{harlequin:true,r:13});tick(hit);expect(hit.hearts).toBe(4);expect(hit.effects.some(q=>q.fireBurst)).toBe(true);
 const guard=fresh();guard.player.guarding=true;const shot={harlequin:true,x:guard.player.x+35,y:437,r:13,life:2};expect(guardBlocks(guard,shot)).toBe(true);expect(guard.effects.some(q=>q.fireBurst)).toBe(true);
 const intercepted=fresh();enemyShot(intercepted,1800,300,0,0,'harlequin-card',{harlequin:true,r:13});clearPowerProjectiles(intercepted,[{x:1800,y:300,r:20,life:1,heavy:true,kind:0}]);expect(intercepted.hostile[0].life).toBe(0);expect(intercepted.effects.every(q=>q.fireBurst)).toBe(true);
});

test('faster rushes burn their actual path in both directions independently of tick size',()=>{
 for(const dir of [-1,1]){
  const paths=[];
  for(const dt of [1/120,1/30]){const s=fresh(),b=s.boss;b.dir=dir;b.x=dir<0?2300:1500;const start=b.x;b.fireDistance=0;
   for(let distance=dt*816;distance<=816+.01;distance+=dt*816){const old=b.x;b.x=start+dir*Math.min(distance,816);leaveHarlequinFire(s,b,enemyShot,old);}
   expect(s.hostile).toHaveLength(12);expect(s.hostile.every(q=>q.kind==='harlequin-groundfire'&&q.duration===TRAIL_DURATION)).toBe(true);paths.push(s.hostile.map(q=>q.x));
  }
  paths[0].forEach((x,i)=>expect(x).toBeCloseTo(paths[1][i],3));
 }
 for(const [stage,speed]of [[1,870],[2,1015],[3,1160]]){const s=fresh(),b=s.boss;s.damage=()=>{};Object.assign(b,{stage,hp:stage===1?720:stage===2?420:180,move:'dash',phase:'warn',timer:.001});updateHarlequin(s,1/120,{body:playerBody},enemyShot);updateHarlequin(s,1/120,{body:playerBody},enemyShot);expect(Math.abs(b.driveSpeed)).toBeCloseTo(speed,3);}
});

test('burning ground permits jumping, stops damage before fading and expires completely',()=>{
 for(const [airborne,life,damage]of [[false,1,true],[true,1,false],[false,.4,false]]){const s=fresh();if(airborne)Object.assign(s.player,{y:380,ground:null,vy:0});s.hostile=[{kind:'harlequin-groundfire',harlequin:true,x:s.player.x,y:480,floor:480,r:0,age:.3,life,duration:2.1,damaging:false}];tick(s);expect(s.hearts).toBe(damage?4:5);expect(s.hostile).toHaveLength(1);}
 const s=fresh();s.hostile=[{kind:'harlequin-groundfire',harlequin:true,x:1800,y:480,floor:480,r:0,age:0,life:2.1,duration:2.1,damaging:false}];tick(s,260);expect(s.hostile).toHaveLength(0);
});

test('columns give a harmless heating interval and remain fixed after Hexy moves',()=>{
 for(const gentle of [false,true]){const s=fresh();s.gentle=gentle;s.boss.stage=2;s.boss.hp=420;s.boss.move='pyre';s.boss.volley=0;castHarlequinFire(s,s.boss,enemyShot);const q=s.hostile[1];s.player.x=q.x;const target=q.x;tick(s,Math.floor((q.delay+.14)*120));expect(s.hearts).toBe(5);expect(q.damaging).toBe(false);s.player.x+=80;tick(s,50);expect(q.x).toBe(target);expect(s.hearts).toBe(5);}
});

test('acrobatic entrance lands once, presents its crystal and releases a safe encounter',()=>{
 const s=fresh();s.boss.phase='intro';beginBossArrival(s);const frames=new Set();let impacts=0;
 for(let i=0;i<550&&s.boss.phase==='intro';i++){stepBossArrival(s,1/120);frames.add(harlequinDrawing(s).frame);if(s.boss.phase==='intro')expect(s.boss.vulnerable).toBe(false);impacts=s.effects.filter(q=>q.fireBurst).length;}
 expect(frames.size).toBe(12);expect(impacts).toBe(1);expect(s.boss.phase).toBe('recover');expect(s.boss.y).toBe(480);expect(s.boss.vulnerable).toBe(true);expect(s.hostile).toHaveLength(0);
 expect(s.events.filter(q=>q==='harlequinEntranceLand')).toHaveLength(1);expect(s.events).toContain('harlequinReady');
});

test('all arrival and sprint drawings have transparent margins and common foot registration',async()=>{
 for(const name of ['arrival','sprint','sprint-mid','sprint-final']){const img=sharp('public/arcade/sprites/bosses/harlequin/'+name+'.webp');expect(await img.metadata()).toMatchObject({width:2048,height:1536,hasAlpha:true});
  for(let i=0;i<12;i++){const raw=await img.clone().extract({left:i%4*512,top:Math.floor(i/4)*512,width:512,height:512}).raw().toBuffer();let count=0,bottom=0;for(let y=0;y<512;y++)for(let x=0;x<512;x++)if(raw[(y*512+x)*4+3]>90){count++;bottom=y;}
   expect(count).toBeGreaterThan(15000);expect(count).toBeLessThan(170000);expect(bottom).toBeGreaterThan(481);expect(bottom).toBeLessThan(491);
   for(const [x,y]of [[0,0],[511,0],[0,511],[511,511]])expect(raw[(y*512+x)*4+3]).toBe(0);
  }
 }
});

test('review the real entrance, running fire, heated columns and explosions in motion',async({page})=>{
 test.setTimeout(120000);const folder='tests/artifacts/arcade/fire-show/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1280,height:720});await page.goto('/arcade');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';const [engine,render,camera,arrival,fire,enemies]=await Promise.all([import(root+'engine/adventureModel.js'),import(root+'render/adventureCanvas.js'),import(root+'render/adventureCamera.js'),import(root+'actors/bosses/adventureArrival.js'),import(root+'actors/bosses/harlequinFire.js'),import(root+'actors/enemies/adventureEnemies.js')]);
  const art=await render.loadAdventureArt(),canvas=document.createElement('canvas');canvas.id='fire-show-review';canvas.style='position:fixed;inset:0;z-index:99999;width:1280px;height:720px';document.body.append(canvas);
  const w=window.fireShow={canvas,art,engine,render,arrival,fire,enemies};w.fresh=()=>{const s=engine.createAdventure(3);s.arenaLocked=true;s.supplies=[];s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:1500,y:480,ground:2,hurt:20});Object.assign(s.boss,{x:2430,y:480,phase:'recover',timer:100,engaged:true,vulnerable:true,stage:1,hp:720});for(let n=0;n<600;n++)camera.followAdventureCamera(s,1/120);w.s=s;return s;};
  w.tick=(n=1)=>{for(let i=0;i<n;i++)engine.stepAdventure(w.s,{},1/120);};w.paint=()=>render.renderAdventure(canvas,w.s,art);
  w.intro=()=>{const s=w.fresh();s.boss.phase='intro';arrival.beginBossArrival(s);};
  w.rush=()=>{const s=w.fresh();Object.assign(s.boss,{move:'dash',phase:'warn',timer:.001,warnDuration:1});};
  w.columns=()=>{const s=w.fresh();s.player.x=1980;Object.assign(s.boss,{stage:2,hp:420,move:'pyre',volley:0});fire.castHarlequinFire(s,s.boss,enemies.enemyShot);};
  w.impact=()=>{const s=w.fresh();enemies.enemyShot(s,1980,380,0,0,'harlequin-ember',{harlequin:true,r:16,gravity:520,life:3});};w.intro();
 });
 const canvas=page.locator('#fire-show-review');
 for(const [name,n]of [['entry-dive',155],['entry-impact',43],['entry-rise',100],['entry-crystal',90],['entry-taunt',90]]){await page.evaluate(n=>{const w=window.fireShow;w.tick(n);w.paint();},n);await canvas.screenshot({path:folder+name+'.jpg'});}
 await page.evaluate(()=>window.fireShow.rush());
 for(const [name,n]of [['rush-first',20],['rush-moving',38],['rush-trail',58]]){await page.evaluate(n=>{const w=window.fireShow;w.tick(n);w.paint();},n);await canvas.screenshot({path:folder+name+'.jpg'});}
 await page.evaluate(()=>window.fireShow.columns());
 for(const [name,n]of [['heated-wood',68],['columns-erupt',47],['columns-burn',22],['columns-disperse',58]]){await page.evaluate(n=>{const w=window.fireShow;w.tick(n);w.paint();},n);await canvas.screenshot({path:folder+name+'.jpg'});}
 await page.evaluate(()=>{const w=window.fireShow;w.impact();w.tick(77);w.paint();});await canvas.screenshot({path:folder+'fireball-impact.jpg'});
 const encoded=await page.evaluate(async()=>{
  const w=window.fireShow;w.intro();const stream=w.canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3500000}),chunks=[];rec.ondataavailable=e=>chunks.push(e.data);rec.start();
  await new Promise(resolve=>{const start=performance.now();let previous=start,acc=0,rush=false,columns=false,impact=false;const frame=now=>{const elapsed=(now-start)/1000;acc+=Math.min(.05,(now-previous)/1000);previous=now;while(acc>=1/120){w.tick();acc-=1/120;}
   if(elapsed>=5&&!rush){rush=true;w.rush();}if(elapsed>=7.4&&!columns){columns=true;w.columns();}if(elapsed>=10.1&&!impact){impact=true;w.impact();}w.paint();if(elapsed<12.3)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
  const stopped=new Promise(resolve=>rec.onstop=resolve);rec.stop();await stopped;stream.getTracks().forEach(t=>t.stop());const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text);
 });fs.writeFileSync(folder+'motion-review.webm',Buffer.from(encoded,'base64'));expect(errors).toEqual([]);
});
