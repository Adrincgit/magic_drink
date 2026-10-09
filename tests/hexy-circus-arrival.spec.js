import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,retryAdventure,adventureCarry} from '../src/components/arcade/adventure/engine/adventureModel';
import {circusEntryFade,outsideCircus} from '../src/components/arcade/adventure/engine/adventureCircusEntrance';
import {circusFacadePlacement} from '../src/components/arcade/adventure/render/circusEntranceCanvas';
import {followAdventureCamera} from '../src/components/arcade/adventure/render/adventureCamera';
import {canEnterShop,shopForLevel} from '../src/components/arcade/adventure/engine/adventureShop';
import {adventureMusic} from '../src/components/arcade/adventure/world/adventureWorlds';
import {openAdventureMenu} from './arcade-input.helpers';
const folder='tests/artifacts/arcade/circus-arrival/';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};

test('waterfront victory follows Hexy to the actual tent before ending the chapter',()=>{
 const s=createAdventure(2),a=s.level.arena;
 Object.assign(s.player,{x:a.left+50,y:a.y,ground:s.platforms.findIndex(p=>p.x===a.left)});
 Object.assign(s.boss,{hp:0,phase:'defeated',engaged:true,shattered:true,defeat:{age:4,ready:true}});
 s.camera={x:a.left,y:80,zoom:.7,backdropY:110};const start=s.camera.x;
 for(let i=0;i<2400&&!s.done;i++){tick(s,1);expect(s.player.y).toBe(a.y);expect(s.camera.x+960/s.camera.zoom).toBeLessThanOrEqual(s.level.width+1);}
 expect(s.won).toBe(true);expect(s.player.x).toBe(s.level.circusArrival.stopX);expect(s.camera.x).toBeGreaterThan(start+1800);
 const tent=circusFacadePlacement(s,{width:1536,height:1024});expect(tent.x).toBeLessThan(s.camera.x+960/s.camera.zoom);expect(s.level.circusArrival.doorX-s.camera.x).toBeLessThan(960/s.camera.zoom);expect(s.clear.arrivalFade).toBe(1);
 const next=createAdventure(3,false,adventureCarry(s));expect(next.player.x).toBeLessThan(0);expect(next.boss.phase).toBe('sleep');expect(next.hearts).toBe(s.hearts);
 expect(next.level.circusEntrance.doorX-next.player.x).toBe(s.level.circusArrival.doorX-s.player.x);
});

test('approach, crossing and interior walk precede the arlequin, with no damage or automatic attack',()=>{
 const s=createAdventure(3);let crossed=false,insideAt=0,lastOutside=0,entryEvents=0;
 for(let i=0;i<1400&&s.boss.phase==='sleep';i++){
  const wasOutside=outsideCircus(s);tick(s,1,{right:true});entryEvents+=s.events.filter(e=>e==='doorOpen').length;
  if(outsideCircus(s))lastOutside=s.player.x;
  if(wasOutside&&!outsideCircus(s)){crossed=true;insideAt=i;expect(circusEntryFade(s)).toBe(1);expect(s.player.x).toBe(660);expect(s.checkpointAt).toBeNull();}
  if(s.circusEntry)expect(s.boss.phase).toBe('sleep');
  expect(s.hearts).toBe(s.maxHearts);
 }
 expect(crossed).toBe(true);expect(entryEvents).toBe(1);expect(lastOutside).toBe(s.level.circusEntrance.doorX);expect(insideAt).toBeGreaterThan(400);expect(s.boss.phase).toBe('intro');expect(s.checkpointAt).toBeNull();
});

test('jumping and dashing into the doorway cannot bypass the entry',()=>{
 const s=createAdventure(3);s.player.x=-320;
 tick(s,30,{right:true,jump:true,dash:true});expect(outsideCircus(s)).toBe(true);expect(s.player.x).toBeLessThan(0);
 for(let i=0;i<600&&outsideCircus(s);i++)tick(s,1,{right:true});
 expect(outsideCircus(s)).toBe(false);expect(s.boss.phase).toBe('sleep');expect(circusEntryFade(s)).toBe(1);
});

test('the shop is outside and retries after entry return to Missi outside with full boss health',()=>{
 const s=createAdventure(3),shop=shopForLevel(s.level);s.player.x=shop.x;expect(canEnterShop(s)).toBe(true);
 retryAdventure(s);expect(s.player.x).toBe(s.level.spawn[0]);expect(s.camera.x).toBeLessThan(0);
 for(let i=0;i<1000&&(outsideCircus(s)||s.circusEntry);i++)tick(s,1,{right:true});
 expect(s.checkpointAt).toBeNull();s.boss.hp=32;s.boss.stage=3;s.done=true;retryAdventure(s);
 expect(s.player.x).toBe(s.level.spawn[0]);expect(outsideCircus(s)).toBe(true);expect(s.circusEntry).toBeUndefined();expect(s.boss.hp).toBe(720);expect(s.boss.stage).toBe(1);expect(canEnterShop(s)).toBe(false);
 s.player.x=s.level.shop.x;tick(s,30);expect(canEnterShop(s)).toBe(true);
});

test('tent and floor share the same movement, independent of the distant parallax',async()=>{
 const img={width:1536,height:1024},s=createAdventure(3),first=circusFacadePlacement(s,img);
 for(let i=0;i<300;i++){s.player.x+=1;followAdventureCamera(s,1/120);const q=circusFacadePlacement(s,img);expect(q).toEqual(first);expect((480-s.camera.y)*s.camera.zoom).toBeCloseTo(440);}
 const {data,info}=await sharp('public/arcade/maps/grand-ring/exterior.webp').raw().toBuffer({resolveWithObject:true});expect(info.channels).toBe(4);for(const [x,y]of [[0,0],[100,100],[100,1000],[1450,1000]])expect(data[(y*info.width+x)*4+3]).toBe(0);
});

test('music keeps the exploration recordings and uses the supplied fire harlequin battle theme',()=>{
 for(const [index,boss,path]of [[2,false,'exploration/canopy.ogg'],[2,true,'bosses/alegre.ogg'],[3,false,'exploration/ring.ogg'],[3,true,'bosses/arlequin_fuego.mp3']]){
  const track=adventureMusic(index,'playing',boss);expect(track.src).toBe('/arcade/music/'+path);expect(fs.statSync('public'+track.src).size).toBeGreaterThan(10000);
 }
});

test('real menu entry can be walked from the exterior through the door into the arena',async({page})=>{
 await page.goto('/arcade');await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir cap/}).click();await page.locator('[data-level-choice="3"]').click();await expect(page.locator('[data-start-adventure]')).toBeDisabled();await page.locator('[data-practice]').click();
 await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');const c=page.locator('[data-adventure-canvas]');
 expect(Number(await c.getAttribute('data-player-x'))).toBeLessThan(0);await expect(page.locator('audio').first()).toHaveAttribute('data-music-track','ring');
 await page.keyboard.down('ArrowRight');await expect.poll(async()=>Number(await c.getAttribute('data-player-x')),{timeout:12000}).toBeGreaterThan(650);await page.keyboard.up('ArrowRight');
 await expect(c).toHaveAttribute('data-boss-phase','sleep');await c.screenshot({path:folder+'actual-inside.jpg'});
 await expect(c).toHaveAttribute('data-circus-floor','dark');
 await page.keyboard.down('ArrowRight');await expect(c).toHaveAttribute('data-boss-phase','intro',{timeout:6000});await page.keyboard.up('ArrowRight');
 const music=page.locator('audio').first();await expect(music).toHaveAttribute('data-music-track','arlequin_fuego');await expect(music).toHaveAttribute('src','/arcade/music/bosses/arlequin_fuego.mp3');
 const decoded=await page.evaluate(async()=>{const response=await fetch('/arcade/music/bosses/arlequin_fuego.mp3');const context=new OfflineAudioContext(2,1,44100),buffer=await context.decodeAudioData(await response.arrayBuffer());const channel=buffer.getChannelData(0);let energy=0,peak=0;for(let i=0;i<channel.length;i+=512){energy+=channel[i]*channel[i];peak=Math.max(peak,Math.abs(channel[i]));}return{ok:response.ok,duration:buffer.duration,peak,rms:Math.sqrt(energy/Math.ceil(channel.length/512)),loop:document.querySelector('audio').loop};});
 expect(decoded.ok).toBe(true);expect(decoded.duration).toBeGreaterThan(60);expect(decoded.peak).toBeGreaterThan(.1);expect(decoded.rms).toBeGreaterThan(.01);expect(decoded.loop).toBe(true);
});

test('render final wharf, matching exterior, threshold and inside with the actual art',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});await page.setViewportSize({width:1440,height:810});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{followAdventureCamera}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureCamera.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='circus-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const paint=()=>renderAdventure(c,window.circusReview.s,art);
  window.circusReview={art,c,paint,createAdventure,stepAdventure,followAdventureCamera,s:createAdventure(2)};
  const s=window.circusReview.s;Object.assign(s.player,{x:15370,y:520,ground:14});Object.assign(s.boss,{hp:0,shattered:true,engaged:true,phase:'defeated',defeat:{ready:true,age:4}});s.clear={age:2,stage:'leave',flagX:14400,flagY:520};
  for(let i=0;i<600;i++)followAdventureCamera(s,1/120);paint();
 });
 const c=page.locator('#circus-review');await c.screenshot({path:folder+'13-last-wharf.jpg'});
 await page.evaluate(()=>{const w=window.circusReview;for(let i=0;i<240;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await c.screenshot({path:folder+'13-circus-reached.jpg'});
 await page.evaluate(()=>{const w=window.circusReview;w.s=w.createAdventure(3);w.paint();});await c.screenshot({path:folder+'14-exterior.jpg'});
 await page.evaluate(()=>{const w=window.circusReview;while(!w.s.circusEntry)w.stepAdventure(w.s,{right:true},1/120);for(let i=0;i<75;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await c.screenshot({path:folder+'14-crossing.jpg'});
 await page.evaluate(()=>{const w=window.circusReview;while(w.s.circusEntry)w.stepAdventure(w.s,{},1/120);w.paint();});await c.screenshot({path:folder+'14-inside.jpg'});
 expect(errors).toEqual([]);
});
