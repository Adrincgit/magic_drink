import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {nightmareDrawing} from '../src/components/arcade/adventure/actors/enemies/adventureNightmares';
import {enemyGeometry,enemyBody} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {skeletonFrame,skeletonThrowOrigin} from '../src/components/arcade/adventure/actors/enemies/nightmareSkeletonAnimation';
import {nightmareWindPose} from '../src/components/arcade/adventure/render/nightmareTrailCanvas';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
const place=(s,x)=>{Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),hurt:0});};
const scene=()=>{const s=createAdventure(6);s.enemies=[];s.graves=[];s.damage=()=>{};return s;};
const tick=s=>{s.time+=1/120;s.fxTime+=1/120;updateEnemies(s,1/120,playerBody,()=>{});};
test('6: wind travels west in world space, even while the camera moves or returns',()=>{
 const s=scene();s.camera.x=800;s.fxTime=3;const a=nightmareWindPose(s,0);s.fxTime+=.1;const b=nightmareWindPose(s,0);expect(b.x-a.x).toBeCloseTo(-16.5);
 s.camera.x+=200;const c=nightmareWindPose(s,0);expect(c.x).toBeCloseTo(b.x);s.camera.x-=300;expect(nightmareWindPose(s,0).x).toBeCloseTo(b.x);
});
test('7: the actual zombie lunge lands through four recovery poses and resumes its walk in either direction',()=>{
 for(const dir of [-1,1]){
  const s=scene();place(s,7200);const e=makeEnemy(7200-dir*200,groundY(s.level.route,7200-dir*200),18);Object.assign(e,{active:true,phase:'windup',timer:.05,attackKind:'lunge',attackDir:dir,dir,nightmareVariant:0});s.enemies=[e];
  const phases=new Set(),frames=new Set();let landed=false,walked=false;
  for(let i=0;i<300;i++){tick(s);phases.add(e.phase);const q=nightmareDrawing(e);expect(q.key==='nightmare-actions'&&q.frame===3).toBe(false);if(q.key==='nightmare-zombie-recover'){frames.add(q.frame);landed=true;}if(landed&&e.phase==='patrol')walked=true;}
  expect([...phases]).toContain('lunge');expect([...frames]).toEqual([0,1,2,3]);expect(walked).toBe(true);
 }
});
test('8: a walking skeleton uses eight complete stepped poses and stops in its ready pose',()=>{
 const e={hp:23,phase:'patrol',gait:0,moving:true};const frames=new Set();
 for(let i=0;i<120;i++){e.gait=i/120;frames.add(skeletonFrame(e));}
 expect([...frames]).toEqual([0,1,2,3,4,5,6,7]);e.moving=false;expect(skeletonFrame(e)).toBe(15);
});

test('8: the skeleton plucks a rib without collecting loose bones, then releases it from its hand',()=>{
 const s=scene();place(s,7200);const e=makeEnemy(7400,groundY(s.level.route,7400),22);Object.assign(e,{active:true,phase:'patrol',gait:0,walkStride:72});s.enemies=[e];
 const b={x:7392,y:e.y-5,frame:5,settled:true,collected:false,life:35,rotation:0};s.looseBones=[b];let plucked=false,throwOrigin;
 for(let i=0;i<400;i++){if(e.phase==='throw'&&e.timer<=1/120)throwOrigin=skeletonThrowOrigin({...e,timer:0});tick(s);plucked||=e.phase==='pluck';if(s.hostile.length)break;}
 expect(plucked).toBe(true);expect(b.collected).toBe(false);expect(s.hostile[0].kind).toBe('bone');expect(s.hostile[0].x).toBeCloseTo(throwOrigin.x);expect(s.hostile[0].y).toBeCloseTo(throwOrigin.y);expect(e.heldBone).toBeNull();
});
test('9: the smaller severed hand still crawls, leaps and makes contact at ground level',()=>{
 const s=scene();place(s,7200);let hits=0;s.damage=()=>hits++;const e=makeEnemy(7350,groundY(s.level.route,7350),24);Object.assign(e,{active:true,phase:'patrol',timer:0});s.enemies=[e];const phases=new Set();
 for(let i=0;i<240;i++){tick(s);phases.add(e.phase);}expect(enemyGeometry(e).size).toBeCloseTo(58);expect(enemyBody(e).w).toBeCloseTo(34);expect(enemyBody(e).h).toBeCloseTo(22);expect([...phases]).toContain('handLeap');expect(hits).toBeGreaterThan(0);
});
test('10: no stone pedestals remain and each upper-route entrance can be reached from the ground',()=>{
 const failures=[];for(const tree of [0,2,4,6]){
  const probe=scene();expect(probe.platforms.some(q=>q.kind==='nightmare-ledge')).toBe(false);const low=probe.platforms.findIndex(q=>q.kind==='nightmare-branch'&&q.tree===tree&&q.side===-1),q=probe.platforms[low];let reached=false;
  for(const u of [.25,.5,.75,.9]){const s=scene();place(s,q.x+q.w*u);for(let i=0;i<130;i++){stepAdventure(s,{jump:i<80},1/120);if(s.player.ground===low){reached=true;break;}}if(reached)break;}
  if(!reached)failures.push({tree,x:q.x,y:q.y});
 }expect(failures).toEqual([]);
});

test('record checkpoints 6 to 10 with the production renderer',async({page})=>{
 test.setTimeout(180000);const folder='tests/artifacts/arcade/checkpoints-6-10/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.cp610=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','render/adventureCanvas.js','world/adventureTerrain.js','render/nightmareTrailCanvas.js'].map(f=>import(root+f))));w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='checkpoint-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=(x,combat=false)=>{w.s=w.createAdventure(6);w.s.noticeTime=0;w.s.enemies=[];w.s.graves=[];w.s.stars=[];w.s.pickups=[];w.s.supplies=[];Object.assign(w.s.player,{x,y:w.groundY(w.s.level.route,x),ground:w.s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),hurt:combat?999:0});w.s.camera={x:Math.max(0,x-300),y:w.s.player.y-440,backdropY:40,zoom:1};w.action=()=>({});w.combat=combat;};
  w.enemy=(x,type,props={})=>{const e=w.makeEnemy(x,w.groundY(w.s.level.route,x),type);Object.assign(e,{active:true},props);w.s.enemies.push(e);return e;};
  w.paint=()=>{const hurt=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=hurt;};
  w.record=async(seconds)=>{const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6000000}),stats={minHearts:5,phases:[],recovery:[],bonesThrown:0};const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});w.paint();rec.start();let start,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.stepAdventure(w.s,w.action(w.s.time),1/120);stats.minHearts=Math.min(stats.minHearts,w.s.hearts);for(const e of w.s.enemies){if(!stats.phases.includes(e.phase))stats.phases.push(e.phase);if(e.landingAge!==undefined&&!stats.recovery.includes(Math.min(3,Math.floor(e.landingAge*9))))stats.recovery.push(Math.min(3,Math.floor(e.landingAge*9)));}stats.bonesThrown=Math.max(stats.bonesThrown,w.s.hostile.filter(q=>q.kind==='bone').length);acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const [name,seconds]of [['wind-path',12],['zombie-landing',7],['skeleton',16],['small-hand',7]]){
  if(process.env.CHECKPOINT_SCENES&&!process.env.CHECKPOINT_SCENES.split(',').includes(name))continue;
  await page.evaluate(name=>{const w=window.cp610;
   if(name==='wind-path'){w.pose(700);w.action=t=>({right:t<6,left:t>=6});}
   if(name==='zombie-landing'){w.pose(7200,true);w.enemy(7430,18,{nightmareVariant:0,timer:.3});}
   if(name==='skeleton'){w.pose(7200,true);const e=w.enemy(7460,22);w.action=t=>{if(t>3&&!e.reviewHit){e.reviewHit=true;e.hp=e.maxHp*.7;}if(t>9&&!e.reviewHit2){e.reviewHit2=true;e.hp=e.maxHp*.4;}return{};};}
   if(name==='small-hand'){w.pose(7200,true);w.enemy(7500,24,{phase:'patrol'});w.enemy(7580,18,{nightmareVariant:0,timer:99});}
  },name);
  const {data,stats}=await page.evaluate(seconds=>window.cp610.record(seconds),seconds);fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(stats,null,2));await page.locator('#checkpoint-review').screenshot({path:folder+name+'.png'});expect(stats.minHearts).toBe(5);if(name==='zombie-landing')expect(stats.recovery).toEqual([0,1,2,3]);if(name==='skeleton')expect(stats.phases).toEqual(expect.arrayContaining(['patrol','pluck','throw','recover']));
 }
 // Close views of the intact cartoon rig, using the same drawing routine.
 await page.evaluate(()=>{const w=window.cp610,c=document.createElement('canvas');c.id='skeleton-poses';c.width=1440;c.height=760;c.style='position:fixed;inset:0;z-index:1000000';document.body.append(c);const ctx=c.getContext('2d');ctx.fillStyle='#33303b';ctx.fillRect(0,0,c.width,c.height);
  for(let i=0;i<12;i++){ctx.save();ctx.translate(i%6*240+120,Math.floor(i/6)*380+325);ctx.scale(2,2);w.drawNightmareSkeleton(ctx,{x:0,y:0,dir:i<6?-1:1,hp:23,phase:i<8?'patrol':i<10?'pluck':'throw',timer:i<10?.275:.07,gait:i%6/6,walkStride:72,heldBone:i>=10?9:null},w.art,false);ctx.restore();}
 });await page.locator('#skeleton-poses').screenshot({path:folder+'skeleton-poses.png'});
 expect(errors).toEqual([]);
});
