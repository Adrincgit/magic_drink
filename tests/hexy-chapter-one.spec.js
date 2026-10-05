import {test,expect} from '@playwright/test';
import sharp from 'sharp';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventureModel';
import {makeEnemy,updateBoss,BOSS_MOVES,bossHitbox} from '../src/components/arcade/adventureEnemies';
import {bossDrawing} from '../src/components/arcade/adventureSprites';
import {followAdventureCamera,cameraView,balloonSockets} from '../src/components/arcade/adventureCamera';
import {hexyPose} from '../src/components/arcade/hexyAnimation';
const tick=(s,n=1,keys={})=>{for(let i=0;i<n;i++)stepAdventure(s,keys,1/120);};
test('trapping bubble cells have transparent corners and a clear center, without rectangular seams',async()=>{
 const {data,info}=await sharp('public/arcade/sprites/props/trap-bubble.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});expect(info.width).toBe(1024);expect(info.height).toBe(256);
 for(let frame=0;frame<4;frame++){
  let total=0,count=0,corners=0;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){const alpha=data[(y*1024+frame*256+x)*4+3];if(Math.hypot(x-128,y-128)<65){total+=alpha;count++;}if((x<16||x>239)&&(y<16||y>239))corners=Math.max(corners,alpha);}
  expect(total/count).toBeLessThan(8);expect(corners).toBeLessThan(15);
 }
});
test('both green harlequins throw golden rings with curved paths',()=>{
 for(const type of [1,4]){
  const s=createAdventure();s.enemies=[makeEnemy(350,480,type)];s.enemies[0].timer=0;s.pickups=[];s.hazards=[];
  tick(s);expect(s.hostile).toHaveLength(1);const shot=s.hostile[0];expect(shot.kind).toBe('ring');
  const first=Math.atan2(shot.vy,shot.vx);tick(s,35);expect(shot.life).toBeGreaterThan(0);expect(Math.abs(Math.atan2(shot.vy,shot.vx)-first)).toBeGreaterThan(.25);
 }
});
test('balloon anticipation, release drawings and actual weapons agree for all four attacks',()=>{
 for(const move of BOSS_MOVES[0]){
  const s=createAdventure(),b=s.boss,a=s.level.arena;s.player.x=a.left+100;s.player.y=a.y;s.enemies=[];s.damage=()=>{};
  Object.assign(b,{phase:'warn',move,timer:.01,attackClock:0,shotClock:0});
  const before=bossDrawing(s).frame;updateBoss(s,.02,{say:()=>{},particles:()=>{},body:playerBody});updateBoss(s,.01,{say:()=>{},particles:()=>{},body:playerBody});
  expect(bossDrawing(s).frame).toBe(before+1);
  if(move==='drop'){expect(s.enemies).toHaveLength(1);expect(s.enemies[0].type).toBe(6);expect(s.enemies[0].y).toBeCloseTo(balloonSockets(s)[1].y);}
  else{expect(s.hostile).toHaveLength(3);expect(s.hostile.every(q=>q.kind===({streamers:'streamer',balls:'ball',bombs:'bomb'}[move]))).toBe(true);s.hostile.forEach((q,i)=>expect(q.x).toBeCloseTo(balloonSockets(s)[i].x));}
 }
});
test('boss camera frames the large balloon, arena floor and player',()=>{
 const s=createAdventure(),a=s.level.arena;s.arenaLocked=true;s.player.x=a.left+100;s.player.y=a.y;s.damage=()=>{};
 Object.assign(s.boss,{phase:'attack',move:'balls',timer:100,shotClock:100,attackClock:0});
 for(let i=0;i<360;i++){updateBoss(s,1/120,{say:()=>{},particles:()=>{},body:playerBody});followAdventureCamera(s,1/120);}
 expect(s.camera.zoom).toBeCloseTo(.82,3);const view=cameraView(s),b=bossHitbox(s);
 expect(b.x).toBeGreaterThan(s.camera.x);expect(b.x+b.w).toBeLessThan(s.camera.x+view.width);expect(b.y).toBeGreaterThan(s.camera.y+40);expect(a.y).toBeLessThan(s.camera.y+view.height-30);
});
test('victory plants a flag, ignores attacks and exits before completing without rescues',()=>{
 const s=createAdventure(),a=s.level.arena;s.enemies=[];s.player.x=a.left+230;s.player.y=a.y-100;s.player.ground=null;s.boss.hp=0;s.boss.phase='defeated';s.camera={x:a.left-100,y:a.y-580,zoom:.82};
 const hp=s.hearts,poses=new Set();let wins=0,walked=false;
 for(let i=0;i<1200&&!s.done;i++){tick(s,1,{left:true,attack:true,super:true,jump:true});wins+=s.events.filter(e=>e==='win').length;poses.add(hexyPose(s).sheet);if(s.clear?.stage==='leave')walked=true;expect(s.hearts).toBe(hp);expect(s.superCinematic).toBeFalsy();}
 expect(poses.has('flag-plant')).toBe(true);expect(walked).toBe(true);expect(wins).toBe(1);expect(s.won).toBe(true);expect(s.rescued).toBe(0);
});
test('a finishing super completes its cinematic before the victory animation begins',()=>{
 const s=createAdventure(),a=s.level.arena;s.player.x=a.left+230;s.player.y=a.y;s.enemies=[];Object.assign(s.boss,{phase:'recover',timer:10,hp:1,vulnerable:true,x:s.player.x+130,y:a.y});
 tick(s,1,{super:true});let defeatedDuringSuper=false;
 for(let i=0;i<900;i++){
  tick(s);if(s.superCinematic){expect(s.clear).toBeFalsy();if(s.boss.hp===0)defeatedDuringSuper=true;}
  if(s.clear)break;
 }
 expect(defeatedDuringSuper).toBe(true);expect(s.clear).toBeTruthy();expect(s.superCinematic).toBeFalsy();
});
for(const width of [390,1440])test(`${width}: HUD uses pictures within the game and keeps semantic health and magic`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/arcade');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready',{timeout:30000});await page.locator('[data-practice]').click();
 const hud=page.locator('[data-game-hud]'),canvas=await page.locator('[data-adventure-canvas]').boundingBox();
 await expect(page.locator('[data-life] img[data-full=true]')).toHaveCount(5);await expect(page.getByRole('meter',{name:'Energía de magia',exact:true})).toHaveAttribute('value','100');
 for(const selector of ['[data-life]','[data-bunny-hud]']){const box=await page.locator(selector).boundingBox();expect(box.x).toBeGreaterThanOrEqual(canvas.x);expect(box.y).toBeGreaterThanOrEqual(canvas.y);expect(box.x+box.width).toBeLessThanOrEqual(canvas.x+canvas.width);expect(box.y+box.height).toBeLessThanOrEqual(canvas.y+canvas.height);}
 expect(await hud.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
 expect(await hud.locator('img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
});

test('paid flag sequence automatically starts the next chapter with the same ticket and carried power',async({page})=>{
 // Supply a completed encounter to the real React loop. No debug controls or
 // shortcuts are shipped in the application itself.
 await page.route('**/src/components/arcade/adventureModel.js*',async route=>{
  const response=await route.fetch(),source=await response.text();
  const fixture=`function stepAdventure(s,input,dt){
   if(s.index===0&&s.ticks===0){const a=s.level.arena;s.player.x=a.right-200;s.player.y=a.y;s.player.ground=s.platforms.length-1;s.boss.hp=0;s.boss.phase='defeated';s.camera={x:a.right-1170,y:a.y-580,zoom:.82};s.enemies=[];s.rescued=2;s.weapon=2;s.shield=2;s.magic=74;}
  `;
  expect(source).toContain('function stepAdventure(s,input,dt){');
  await route.fulfill({response,body:source.replace('function stepAdventure(s,input,dt){',fixture)});
 });
 await page.goto('/arcade');const root=page.locator('[data-hexy-adventure]'),canvas=page.locator('[data-adventure-canvas]');await expect(root).toHaveAttribute('data-phase','ready',{timeout:30000});await page.locator('[data-insert-coin]').click();
 await expect(canvas).toHaveAttribute('data-pose',/flag-plant:/);await expect(page.locator('[data-bunny-hud] img[data-rescued=true]')).toHaveCount(2);
 const first=await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')));expect(first.coins).toBe(0);
 await expect(canvas).toHaveAttribute('data-level','1',{timeout:10000});await expect(root).toHaveAttribute('data-phase','playing');await expect(page.locator('[data-adventure-overlay]')).toHaveCount(0);await expect(canvas).toHaveAttribute('data-weapon','2');
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')));expect(after.coins).toBe(0);expect(after.run.id).toBe(first.run.id);expect(after.run.chapter).toBe(1);expect(after.adventureCleared).toEqual([0]);
});
