import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {outpostDrawing} from '../src/components/arcade/adventure/render/outpostCanvas';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {JUGGLER_WALK_FRAMES} from '../src/components/arcade/adventure/actors/enemies/adventureJugglerWalk';
const folder='tests/artifacts/arcade/tent-motion/';
const tick=(s,n)=>{for(let i=0;i<n;i++)updateEnemies(s,1/120,playerBody,()=>{});};

test('intact first-level tents animate the full cloth and flag in closed and open states',()=>{
 const q=createAdventure(0).outposts[0];
 for(const spawnIn of [2,4.1]){
  q.spawnIn=spawnIn;const frames=new Set();for(let i=0;i<60;i++){const d=outpostDrawing(q,i/60);expect(d.key).toBe('outpost-wind-painted');frames.add(d.frame);}
  expect([...frames].sort()).toEqual(spawnIn===2?[0,1,2]:[4,5,6]);
 }
});
test('damaged and collapsed outposts retain their authored health stages',()=>{
 const q=createAdventure(0).outposts[0];q.hp=13;q.spawnIn=2;expect(outpostDrawing(q,1)).toEqual({key:'clown-outpost',frame:3});q.hp=0;
 for(const [age,frame]of [[0,5],[.4,6],[1,7]]){q.deadTime=age;expect(outpostDrawing(q,1)).toEqual({key:'clown-outpost',frame});}
});
test('the meadow atlas contains different flag and cloth pixels, not a repeated still',async()=>{
 const src='public/arcade/sprites/props/outpost-wind-painted.webp';
 const parts=[];for(let frame=0;frame<3;frame++){
  const image=sharp(src).extract({left:frame*256,top:0,width:256,height:256});const data=await image.raw().toBuffer();
  const region=(x,y,w,h)=>{const a=[];for(let py=y;py<y+h;py++)a.push(data.subarray((py*256+x)*4,(py*256+x+w)*4));return Buffer.concat(a).toString('base64');};
  parts.push({flag:region(126,20,70,48),cloth:region(58,145,140,95)});
 }
 expect(new Set(parts.map(q=>q.flag)).size).toBe(3);expect(new Set(parts.map(q=>q.cloth)).size).toBe(3);
});
test('the exported tent sheet excludes both sideways poses',()=>{
 const r=JSON.parse(fs.readFileSync('context/arcade/tent-motion/registration.json')).filter(q=>q.name==='meadow');expect(r.map(q=>q.sourceFrame)).toEqual([0,1,2,1,4,5,6,5]);
});
test('juggler patrol completes eight frames at its unchanged patrol speed without changing its travel speed',()=>{
 const s=createAdventure(0),e=makeEnemy(2700,480,3);s.damage=()=>{};s.player.x=2450;e.dir=-1;e.timer=10;s.enemies=[e];const frames=new Set();
 for(let i=0;i<220;i++){tick(s,1);frames.add(enemyDrawing(e).frame);}expect(frames.size).toBe(JUGGLER_WALK_FRAMES);expect(e.x).toBeCloseTo(2634,4);
});
for(const source of ['meadow','camp'])for(const direction of [-1,1])test(`${source}: juggling clown takes eight walking poses while emerging towards ${direction}`,()=>{
 const s=createAdventure(source==='camp'?3:0),x=source==='camp'?-11550:2800,y=groundY(s.platforms,x),e=makeEnemy(x,y,3);s.damage=()=>{};s.player.x=x-direction*250;
 Object.assign(e,{dir:direction,emerging:1.1,timer:5,phase:'emerge',...(source==='camp'?{campTent:0}: {outpost:0})});s.enemies=[e];const poses=new Set();
 for(let i=0;i<125;i++){tick(s,1);const d=enemyDrawing(e);expect(d.key).toBe('juggler-walk-v2');poses.add(d.frame);expect(e.y).toBeCloseTo(groundY(s.platforms,e.x),4);}
 expect(poses.size).toBe(JUGGLER_WALK_FRAMES);expect((e.x-x)*direction).toBeGreaterThan(55);expect(e.hp).toBe(e.maxHp);
});
test('juggler walking stops in a bubble and its original three-ball volley resumes intact',()=>{
 const s=createAdventure(0),e=makeEnemy(2700,480,3);s.damage=()=>{};s.player.x=e.x-240;Object.assign(e,{dir:-1,timer:10});s.enemies=[e];tick(s,30);const x=e.x,gait=e.gait;e.trap=1;tick(s,80);
 expect(e.x).toBe(x);expect(e.gait).toBe(gait);expect(enemyDrawing(e).key).toBe('juggler-actions');e.trap=0;e.timer=0;tick(s,120);expect(s.hostile.filter(q=>q.kind==='juggle').map(q=>q.color)).toEqual([0,1,2]);expect(enemyDrawing(e).key).toBe('juggler-actions');
});

test('full juggler drawings keep one scale and ground contact; both passing poses bring the boots together',async()=>{
 const registration=JSON.parse(fs.readFileSync('context/arcade/juggler-gait/revision-2/registration.json'));
 expect(new Set(registration.map(q=>q.scale)).size).toBe(1);expect(Math.max(...registration.map(q=>q.noseY))-Math.min(...registration.map(q=>q.noseY))).toBeLessThan(4);
 const widths=[];
 for(let i=0;i<8;i++){
  const {data,info}=await sharp('public/arcade/sprites/enemies/juggler-walk-v2.webp').extract({left:i%4*256,top:Math.floor(i/4)*256,width:256,height:256}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let left=256,right=0,bottom=0;
  for(let y=216;y<256;y++)for(let x=0;x<256;x++)if(data[(y*info.width+x)*4+3]>160){left=Math.min(left,x);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  expect(bottom).toBeGreaterThanOrEqual(248);expect(bottom).toBeLessThanOrEqual(250);widths.push(right-left);
 }
 expect(widths[2]).toBeLessThan(widths[0]*.8);expect(widths[6]).toBeLessThan(widths[4]*.8);
});

test('camp interiors are dark opaque artwork with transparent exterior and no black spill',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});await page.goto('/');
 const pixels=await page.evaluate(async()=>{
  const {loadAdventureArt}=await import('/src/components/arcade/adventure/render/adventureCanvas.js'),{drawCampWindTent}=await import('/src/components/arcade/adventure/render/windClothCanvas.js');const art=await loadAdventureArt();
  const c=document.createElement('canvas');c.id='tent-alpha';c.width=512;c.height=384;document.body.append(c);const ctx=c.getContext('2d'),results=[];
  for(let i=0;i<4;i++){
   ctx.fillStyle='#73c7cc';ctx.fillRect(0,0,512,384);drawCampWindTent(ctx,{fxTime:(i+.1)/6},art,0,0,512,384,true);
   const pixel=(x,y)=>[...ctx.getImageData(x,y,1,1).data];results.push({inside:pixel(270,305),bottom:pixel(270,381),corner:pixel(0,0),png:c.toDataURL('image/png').split(',')[1]});
  }
  return results;
 });
 for(const [i,p]of pixels.entries()){expect(Math.max(...p.inside.slice(0,3))).toBeLessThan(70);expect(p.bottom).toEqual([115,199,204,255]);expect(p.corner).toEqual([115,199,204,255]);fs.writeFileSync(folder+'camp-interior-'+i+'.png',Buffer.from(p.png,'base64'));}
});

test('record first-level cloth, juggler exits and camp interiors with production rendering',async({page})=>{
 test.setTimeout(120000);fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.tentReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','render/adventureSprites.js','render/adventureCanvas.js','world/adventureTerrain.js'].map(f=>import(root+f))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='tent-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.setup=name=>{const camp=name.startsWith('camp'),s=w.s=w.createAdventure(camp?3:0),q=camp?s.campTents[0]:s.outposts[0];w.name=name;w.trace=[];
   for(const k of ['enemies','supplies','stars','cages','hazards'])s[k]=[];s.noticeTime=0;s.player.hurt=999;const x=q.x,y=camp?480:q.y;Object.assign(s.player,{x:x-240,y,ground:s.platforms.findIndex(p=>s.player.x>=p.x&&s.player.x<=p.x+p.w)});
   if(camp){s.outposts=[];s.campTents=[q];q.state='opening';q.age=1;q.wait=name==='camp-juggler'?.02:100;q.crew=name==='camp-juggler'?[3]:[];}
   else{s.outposts=[q];s.campTents=[];q.spawned=2;q.spawnIn=name==='meadow-juggler'?.02:1.1;}
   w.camera={x:x-460,y:y-440,backdropY:y-440,zoom:1};s.camera={...w.camera};
  };
  w.paint=()=>w.renderAdventure(w.c,w.s,w.art);
  w.step=()=>{const s=w.s;w.stepAdventure(s,{},1/120);s.camera={...w.camera};const e=s.enemies.find(e=>e.type===3);if(e){const d=w.enemyDrawing(e);w.trace.push({time:s.time,x:e.x,y:e.y,phase:e.phase,key:d.key,frame:d.frame});}};
  w.record=async seconds=>{const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6000000});const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();let last,start,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.step();acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return data;};
 });
 for(const name of ['meadow-wind','meadow-juggler','camp-open','camp-juggler']){
  await page.evaluate(n=>{window.tentReview.setup(n);window.tentReview.paint();},name);await page.locator('#tent-review').screenshot({path:folder+name+'-before.png'});const data=await page.evaluate(()=>window.tentReview.record(4));fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));await page.locator('#tent-review').screenshot({path:folder+name+'-after.png'});
  const trace=await page.evaluate(()=>window.tentReview.trace);fs.writeFileSync(folder+name+'-trace.json',JSON.stringify(trace));if(name.endsWith('juggler'))expect(new Set(trace.filter(q=>q.phase==='emerge'&&q.key==='juggler-walk-v2').map(q=>q.frame)).size).toBe(JUGGLER_WALK_FRAMES);
 }
 expect(errors).toEqual([]);
});
