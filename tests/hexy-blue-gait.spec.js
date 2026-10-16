import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
const dir='tests/artifacts/arcade/blue-gait/';
function scene(type=1,direction=1,slope=0){
 const s=createAdventure(0);s.platforms=[{x:0,y:480-1000*slope,yEnd:480+1000*slope,baseY:480-1000*slope,w:2000,kind:'earth'}];s.damage=()=>{};
 const e=makeEnemy(1000,480,type);Object.assign(e,{dir:direction,timer:20});s.enemies=[e];s.player.x=1000+direction*500;s.player.y=groundY(s.platforms,s.player.x);return{s,e};
}
const tick=(s,n)=>{for(let i=0;i<n;i++)updateEnemies(s,1/120,playerBody,()=>{});};

test('running visits a complete stride while boots stay on the floor; blue is faster than red',()=>{
 const {s,e}=scene(),poses=new Set();let moved=0;
 for(let i=0;i<85;i++){tick(s,1);const d=enemyDrawing(e);expect(d.key).toBe('acrobat-run-fluid');poses.add(d.frame);expect(e.y).toBe(e.baseY);moved=e.x-1000;}
 expect([...poses].sort()).toEqual([0,1,2,3,4,5,6,7]);expect(moved).toBeCloseTo(74*85/120,4);
 const red=scene(0);tick(red.s,85);expect(red.e.x-1000).toBeCloseTo(40*85/120,4);expect(moved).toBeGreaterThan((red.e.x-1000)*1.7);
});

for(const type of [1,4])for(const direction of [-1,1])test(`type ${type} runs, prepares one hop and plants feet on a slope towards ${direction}`,()=>{
 const {s,e}=scene(type,direction,.12);const phases=new Set(),poses=new Set();let landingX,peak=0,landed=false;
 for(let i=0;i<500;i++){
  tick(s,1);const d=enemyDrawing(e);phases.add(e.phase);peak=Math.max(peak,e.baseY-e.y);if(d.key==='acrobat-air-painted')poses.add(d.frame);
  if(e.acrobatAir){expect(e.phase).toBe('jump');expect(d.key).toBe('acrobat-air-painted');expect(s.hostile).toHaveLength(0);}
  if(e.landing>0){landed=true;landingX??=e.x;expect(e.y).toBeCloseTo(groundY(s.platforms,e.x),4);}
 }
 expect(phases.has('crouchJump')).toBe(true);expect(phases.has('jump')).toBe(true);expect(landed).toBe(true);expect(peak).toBeGreaterThan(type===4?80:40);expect(peak).toBeLessThan(type===4?130:75);expect(poses.has(6)).toBe(true);expect(poses.has(7)).toBe(true);expect(e.hp).toBe(e.maxHp);expect(landingX).toBeDefined();
});

test('attack preparation waits for a real landing and keeps the ring attack intact',()=>{
 const {s,e}=scene();e.acrobatWait=0;e.timer=.8;let airborne=false,landed=false;
 for(let i=0;i<230;i++){tick(s,1);airborne||=!!e.acrobatAir;landed||=airborne&&e.landing>0;if(e.acrobatAir){expect(e.timer).toBeGreaterThanOrEqual(.59);expect(s.hostile).toHaveLength(0);}}
 expect(landed).toBe(true);expect(s.hostile.find(q=>q.kind==='ring')?.r).toBeCloseTo(16.1);expect(e.acrobatAir).toBe(false);
});

test('a hop keeps its direction past the patrol limit and turns after landing',()=>{
 for(const type of [1,4]){
  const {s,e}=scene(type);e.x=1150;e.acrobatWait=0;let flew=false,landed=false;
  for(let i=0;i<150;i++){tick(s,1);if(e.acrobatAir){flew=true;expect(e.dir).toBe(1);}if(flew&&e.landing>0)landed=true;}
  expect(landed).toBe(true);expect(e.dir).toBe(-1);
 }
});

test('a bubble stops the stride and its frame progression, then releases the same clown',()=>{
 const {s,e}=scene();tick(s,30);const x=e.x,gait=e.gait;e.trap=1;tick(s,80);
 expect(e.x).toBe(x);expect(e.gait).toBe(gait);expect(enemyDrawing(e).key).toBe('acrobat-rings');tick(s,70);expect(e.x).not.toBe(x);expect(e.hp).toBe(e.maxHp);
});

test('emerging blue clowns use travelling feet instead of a stationary ring pose',()=>{
 const {s,e}=scene();e.emerging=1.2;e.campTent=0;const poses=new Set();for(let i=0;i<110;i++){tick(s,1);const d=enemyDrawing(e);expect(d.key).toBe('acrobat-run-fluid');poses.add(d.frame);}expect(poses.size).toBe(8);
});

test('new run cels share one scale, nose registration and sole baseline',()=>{
 const rows=JSON.parse(fs.readFileSync('context/arcade/blue-gait/run-registration.json'));expect(rows).toHaveLength(8);expect(new Set(rows.map(q=>q.scale)).size).toBe(1);expect(new Set(rows.map(q=>q.noseX)).size).toBe(1);expect(new Set(rows.map(q=>q.soleY)).size).toBe(1);for(const r of rows){expect(r.x).toBeGreaterThan(3);expect(r.x+r.w).toBeLessThan(253);}
});

test('record real running, turning, agile hops and landing in both directions',async({page})=>{
 test.setTimeout(120000);fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';const w=window.blueReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','render/adventureSprites.js','render/adventureCanvas.js','world/adventureTerrain.js'].map(f=>import(root+f))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='blue-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.setup=(name)=>{const s=w.s=w.createAdventure(0);for(const k of ['enemies','outposts','supplies','stars','cages','hazards','campTents'])s[k]=[];s.noticeTime=0;s.player.hurt=999;const direction=name.includes('left')?-1:1,x=2600,y=w.groundY(s.platforms,x);Object.assign(s.player,{x:x+direction*350,y,ground:s.platforms.findIndex(q=>s.player.x>=q.x&&s.player.x<=q.x+q.w)});const e=w.makeEnemy(x,y,name.startsWith('fast')?4:1);Object.assign(e,{dir:direction,timer:4});if(name.startsWith('run')){e.timer=99;e.acrobatWait=99;}s.enemies=[e];w.fixed={x:x-460,y:y-440,backdropY:y-440,zoom:1};s.camera={...w.fixed};w.frames=[];};
  w.paint=()=>w.renderAdventure(w.c,w.s,w.art);
  w.step=()=>{w.stepAdventure(w.s,{},1/120);w.s.camera={...w.fixed};const e=w.s.enemies[0],d=w.enemyDrawing(e);w.frames.push({time:w.s.time,x:e.x,y:e.y,phase:e.phase,key:d.key,frame:d.frame});};
  w.record=async seconds=>{const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm'});const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();let last,start,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.step();acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return data;};
 });
 for(const name of ['run-left','run-right','agile-left','fast-right']){
  await page.evaluate(n=>{window.blueReview.setup(n);window.blueReview.paint();},name);const data=await page.evaluate(()=>window.blueReview.record(5.2));fs.writeFileSync(dir+name+'.webm',Buffer.from(data,'base64'));
  const frames=await page.evaluate(()=>window.blueReview.frames);fs.writeFileSync(dir+name+'-trace.json',JSON.stringify(frames));await page.locator('#blue-review').screenshot({path:dir+name+'-after.png'});expect(frames.filter(q=>q.key==='acrobat-run-fluid').length).toBeGreaterThan(100);if(name==='agile-left'||name==='fast-right')expect(frames.some(q=>q.phase==='jump')).toBe(true);
 }
 expect(errors).toEqual([]);
});
