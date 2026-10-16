import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {aquaImpact,aquaFloor} from '../src/components/arcade/adventure/engine/adventureAquaEffects';
import {stepWorldEffects} from '../src/components/arcade/adventure/engine/adventureEffects';
import {createAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {quenchWithWater} from '../src/components/arcade/adventure/engine/adventureWater';
import {igniteEmberBushes} from '../src/components/arcade/adventure/engine/adventureEmberFire';

test('splash droplets fall onto the actual slope or hollow, leave grounded ripples, and expire',()=>{
 for(const x of [110,285,350,415]){
  const s={level:{route:[{x:0,y:440,yEnd:560,w:800,kind:'earth'}],emberPits:[{x:280,w:140,y:640}]},effects:[],particles:[],events:[]};
  aquaImpact(s,x,x>200?530:340,75,true);
  const drops=s.effects.filter(q=>q.aquaKind==='drop'),landed=new Set();expect(drops).toHaveLength(7);
  let falling=false;
  for(let i=0;i<300;i++){
   const descending=drops.filter(q=>q.aquaKind==='drop'&&q.vy>0).map(q=>[q,q.y]);
   stepWorldEffects(s,1/120);
   for(const [q,y]of descending)expect(q.y).toBeGreaterThanOrEqual(y-2);
   for(const q of drops){if(q.vy>0&&q.aquaKind==='drop')falling=true;if(q.aquaKind==='landing'&&!landed.has(q)){expect(q.y).toBeCloseTo(aquaFloor(s,q.x),5);landed.add(q);}}
  }
  expect(falling).toBe(true);expect(landed.size).toBe(7);
  expect(s.effects.some(q=>q.aquaKind==='puddle')).toBe(true);
  for(let i=0;i<600;i++)stepWorldEffects(s,1/120);
  expect(s.effects).toHaveLength(0);
 }
});

test('one shrub contact shares its splash with ground fire; extinction is harmless and emits lingering steam',()=>{
 const s=createAdventure(5),b=s.emberEnvironment.bushes[0];igniteEmberBushes(s,b.x,b.y,30);
 const shot=()=>({kind:5,x:b.x,y:b.y-30,r:16,scale:1,life:1});
 quenchWithWater(s,shot());
 expect(s.effects.filter(q=>q.aquaKind==='impact')).toHaveLength(1);
 expect(s.effects.filter(q=>q.aquaKind==='drop')).toHaveLength(7);
 expect(b.state).toBe('burning');
 for(let n=0;n<2;n++){for(let i=0;i<30;i++)stepWorldEffects(s,1/120);quenchWithWater(s,shot());}
 expect(b.state).toBe('charred');expect(s.hostile.every(q=>q.life<=0)).toBe(true);
 expect(s.effects.some(q=>q.aquaKind==='extinction')).toBe(true);
 for(let i=0;i<65;i++)stepWorldEffects(s,1/120);
 expect(s.effects.some(q=>q.aquaKind==='extinction')).toBe(false);
 expect(s.effects.some(q=>q.aquaKind==='steam')).toBe(true);
 expect(s.effects.every(q=>!q.damaging)).toBe(true);
});

test('record real Aqua Berry shots extinguishing brush and a larger hollow with falling water and steam',async({page})=>{
 test.setTimeout(90000);const dir='tests/artifacts/aqua-quench';fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.aquaReview=Object.assign({paused:true,keys:{},trace:[]},...await Promise.all(['engine/adventureModel.js','engine/adventureEmberFire.js','engine/adventureAmmo.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='aqua-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=mode=>{
   w.s=w.createAdventure(5);const s=w.s;s.enemies=[];s.noticeTime=0;s.time=12;s.fxTime=12;
   if(mode==='brush'){
    w.target=s.emberEnvironment.bushes.find(b=>b.x>21800);const b=w.target;
    s.emberEnvironment.bushes=[b];w.igniteEmberBushes(s,b.x,b.y,30);b.age=1;
    s.player.x=b.x-225;
   }else{
    w.target=s.emberEnvironment.pits[0];const p=w.target;
    s.player.x=p.x-45;s.player.y=w.groundY(s.platforms,s.player.x);s.player.ground=s.platforms.indexOf(w.groundAt(s.platforms,s.player.x));
   }
   if(mode==='brush'){s.player.y=w.groundY(s.platforms,s.player.x);s.player.ground=s.platforms.indexOf(w.groundAt(s.platforms,s.player.x));}
   s.player.dir=1;s.damage=()=>{};w.equipDrink(s,5);s.magic=100;
   for(let i=0;i<800;i++)w.followAdventureCamera(s,1/120);
   w.mode=mode;w.paused=true;w.renderAdventure(w.c,s,w.art);
  };
  for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{const key={KeyZ:'attack',KeyC:'special',ArrowDown:'down',ArrowUp:'up'}[e.code];if(key){e.preventDefault();w.keys[key]=type==='keydown';}});
  let last=performance.now(),acc=0;
  function frame(now){acc+=Math.min(.05,(now-last)/1000);last=now;if(w.paused)acc=0;while(acc>=1/120){w.stepAdventure(w.s,w.keys,1/120);acc-=1/120;}
   w.renderAdventure(w.c,w.s,w.art);if(!w.paused)w.trace.push({time:w.s.time,mode:w.mode,water:w.target.water||0,quenched:w.target.quenched||w.target.state==='charred',fx:w.s.effects.filter(q=>q.aqua).map(q=>({kind:q.aquaKind,x:q.x,y:q.y,age:q.age,vy:q.vy}))});requestAnimationFrame(frame);
  }
  w.scene('brush');requestAnimationFrame(frame);
  const chunks=[];w.recorder=new MediaRecorder(w.c.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4200000});w.recorder.ondataavailable=e=>chunks.push(e.data);w.recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='aqua-motion.webm';a.click();};w.recorder.start();
 });
 const wait=async seconds=>{const t=await page.evaluate(dt=>{const w=window.aquaReview;w.paused=false;return w.s.time+dt;},seconds);await page.waitForFunction(t=>window.aquaReview.s.time>=t,t);};
 const shot=async name=>page.locator('#aqua-review').screenshot({path:dir+'/'+name+'.png'});
 await shot('01-burning');await wait(.4);await page.keyboard.down('KeyZ');await wait(.8);await page.keyboard.up('KeyZ');await shot('02-splash');
 await wait(.55);await shot('03-steam');
 expect(await page.evaluate(()=>window.aquaReview.target.state)).toBe('charred');
 await wait(1.8);await shot('04-soaked');
 await page.evaluate(()=>window.aquaReview.scene('pit'));
 // Two actual strong shots are necessary to put out the larger ground fire.
 await page.keyboard.down('ArrowDown');await page.keyboard.down('KeyC');await wait(.1);await page.keyboard.up('KeyC');await wait(1.95);
 await shot('05-pit-partly-wet');
 expect(await page.evaluate(()=>window.aquaReview.target.water)).toBe(4);
 await page.keyboard.down('KeyC');await wait(.1);await page.keyboard.up('KeyC');await wait(1.3);
 await shot('06-pit-steam');expect(await page.evaluate(()=>window.aquaReview.target.quenched)).toBe(true);
 await wait(2.1);await shot('07-pit-soaked');
 const download=page.waitForEvent('download');await page.evaluate(()=>{window.aquaReview.paused=true;window.aquaReview.recorder.stop();});await(await download).saveAs(dir+'/aqua-motion.webm');
 fs.writeFileSync(dir+'/trace.json',JSON.stringify(await page.evaluate(()=>window.aquaReview.trace)));
 expect(errors).toEqual([]);
});
