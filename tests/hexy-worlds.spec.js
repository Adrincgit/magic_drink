import {openAdventureMenu} from './arcade-input.helpers';
import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {LEVELS} from '../src/components/arcade/adventure/world/adventureLevels';
import {adventureMusic} from '../src/components/arcade/adventure/world/adventureWorlds';
import {BOSS_ART,BOSS_POSES,actorFrame,bossDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {BOSS_MOVES} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
const hash=path=>createHash('sha256').update(readFileSync('public'+path)).digest('hex');

test('five chapters have different painted worlds, terrain and ten independent scores',()=>{
 expect(new Set(LEVELS.map(l=>hash(l.background))).size).toBe(5);
 expect(new Set(LEVELS.map(l=>hash(l.world.ground))).size).toBe(5);
 expect(new Set(LEVELS.map(l=>l.world.terrain)).size).toBe(5);
 const songs=LEVELS.flatMap((_,i)=>[adventureMusic(i,'playing'),adventureMusic(i,'playing',true)]);
 expect(new Set(songs.map(s=>hash(s.src))).size).toBe(10);
 for(let i=0;i<5;i++){
  expect(adventureMusic(i,'playing').loop).toBe(true);expect(adventureMusic(i,'paused',true).key).toBe(LEVELS[i].world.music.boss.key);
  expect(adventureMusic(i,'between')).toMatchObject({key:'victory',loop:false});
  expect(adventureMusic(i,'result',true,false)).toMatchObject({key:'gameover',loop:false});
 }
});

test('each boss uses distinct artwork and attack-specific telegraph and action poses',()=>{
 expect(new Set(BOSS_ART.map((key,i)=>hash('/arcade/sprites/bosses/'+(i===1?'organ/body':key)+'.webp'))).size).toBe(5);
 for(let i=0;i<5;i++)for(const move of BOSS_MOVES[i]){
  if(i===1){const boss={hp:164,phase:'warn',move};expect(bossDrawing({index:i,boss})).toEqual({key:'organ-machine',frame:0});expect(bossDrawing({index:i,boss:{...boss,phase:'attack',release:.2}})).toEqual({key:'organ-machine',frame:2});continue;}
  const sheet=BOSS_ART[i],a={hp:10,flash:0,move,clock:.2,attackClock:.2};
  expect(BOSS_POSES[sheet][move].warn).toContain(actorFrame({...a,phase:'warn'},false,sheet));
  const frames=new Set();for(let t=0;t<2.2;t+=.08)frames.add(actorFrame({...a,phase:'attack',attackClock:t},false,sheet));
  for(const f of frames)expect(BOSS_POSES[sheet][move].attack).toContain(f);
  if(move!=='rain')expect(frames.size).toBeGreaterThan(1);
  expect(actorFrame({...a,phase:'attack',flash:.1},false,sheet)).toBe(10);
  expect(actorFrame({...a,phase:'attack',hp:0},false,sheet)).toBe(11);
 }
 expect(actorFrame({hp:10,phase:'attack',move:'rain',attackClock:1},false,'muta')).toBe(7);
 expect(actorFrame({hp:10,phase:'attack',move:'slam',attackClock:1.4},false,'agresivo')).toBe(8);
});

test('chapter choices play their own music and pausing stops each track',async({page})=>{
 await page.goto('/arcade');await openAdventureMenu(page);const root=page.locator('[data-hexy-adventure]'),music=page.locator('audio').first();await expect(root).toHaveAttribute('data-phase','ready',{timeout:20000});
 for(let i=0;i<5;i++){
  await page.getByRole('button',{name:/Elegir cap/}).click();await page.locator(`[data-level-choice="${i}"]`).click();await page.locator('[data-practice]').click();await expect(root).toHaveAttribute('data-phase','playing');
  await expect(music).toHaveAttribute('data-music-track',LEVELS[i].world.music.explore.key);
  await expect.poll(()=>music.evaluate(a=>a.currentTime)).toBeGreaterThan(.03);
  expect(await music.evaluate(a=>a.loop)).toBe(true);
  await page.keyboard.press('KeyP');await expect(root).toHaveAttribute('data-phase','paused');await expect.poll(()=>music.evaluate(a=>a.paused)).toBe(true);
  await page.getByRole('button',{name:'Terminar práctica',exact:true}).click();await expect(root).toHaveAttribute('data-phase','ready');
 }

});

test('all ten active tracks, including the replacement MP3s, decode to non-silent unclipped stereo',async({page})=>{
 await page.goto('/arcade');await openAdventureMenu(page);
 const tracks=LEVELS.flatMap((_,i)=>[adventureMusic(i,'playing').src,adventureMusic(i,'playing',true).src]);
 const report=await page.evaluate(async paths=>{
  const ctx=new AudioContext(),result=[];
  try{for(const path of paths){const response=await fetch(path);if(!response.ok)throw Error(path);const b=await ctx.decodeAudioData(await response.arrayBuffer());let peak=0,sum=0;
   for(let ch=0;ch<b.numberOfChannels;ch++){const d=b.getChannelData(ch);for(let n=0;n<d.length;n++){peak=Math.max(peak,Math.abs(d[n]));sum+=d[n]*d[n];}}
   result.push({path,duration:b.duration,channels:b.numberOfChannels,peak,rms:Math.sqrt(sum/b.length/b.numberOfChannels)});
  }}finally{await ctx.close();}return result;
 },tracks);
 for(const r of report){expect(r.channels).toBe(2);expect(r.duration).toBeGreaterThan(24);expect(r.peak).toBeLessThan(.98);expect(r.rms).toBeGreaterThan(.05);}
});

test('user arrangements map to field, forest and both opening bosses while shop and other chapters retain their tracks',()=>{
 expect(adventureMusic(0,'playing').src).toBe('/arcade/music/exploration/meadow.mp3');
 expect(adventureMusic(1,'playing').src).toBe('/arcade/music/exploration/woods.mp3');
 expect(adventureMusic(0,'playing',true).src).toBe('/arcade/music/bosses/troupe.mp3');
 expect(adventureMusic(1,'playing',true).src).toBe('/arcade/music/bosses/serio.mp3');
 expect(adventureMusic(0,'shop').src).toBe('/arcade/music/shop.ogg');
 expect(adventureMusic(2,'playing').src).toBe('/arcade/music/exploration/canopy.ogg');
});

test('parallax remains continuous when the camera crosses a mirrored tile boundary',async({page})=>{
 await page.goto('/arcade');await openAdventureMenu(page);
 const delta=await page.evaluate(async()=>{
  const {createAdventure}=await import('/src/components/arcade/adventure/engine/adventureModel.js'),{loadAdventureArt,renderAdventure}=await import('/src/components/arcade/adventure/render/adventureCanvas.js');
  const art=await loadAdventureArt(),s=createAdventure(3),canvas=document.createElement('canvas');Object.assign(canvas.style,{width:'960px',height:'540px'});document.body.append(canvas);
  s.player.x=-2000;s.platforms=[];s.enemies=[];s.cages=[];s.pickups=[];s.stars=[];s.hazards=[];
  const boundary=425*art.mid3.width/art.mid3.height/s.level.world.midSpeed;
  const capture=x=>{s.camera.x=x;renderAdventure(canvas,s,art,{reduced:true});return canvas.getContext('2d').getImageData(0,120,960,230).data;};
  const before=capture(boundary-.05),after=capture(boundary+.05);let sum=0;for(let i=0;i<before.length;i+=4)for(let ch=0;ch<3;ch++)sum+=Math.abs(before[i+ch]-after[i+ch]);canvas.remove();return sum/(before.length/4*3);
 });
 expect(delta).toBeLessThan(2);
});
