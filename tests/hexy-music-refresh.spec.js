import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {openAdventureMenu} from './arcade-input.helpers';
import {adventureMusic} from '../src/components/arcade/adventure/world/adventureWorlds';

const folder='context/arcade/music-refresh/';
const replacements=[['shop.mp3',adventureMusic(0,'shop')],['main_title_screen.mp3',adventureMusic(0,'ready')],['Jefe 1-2.mp3',adventureMusic(1,'playing',true)],['jefe 1-3.mp3',adventureMusic(2,'playing',true)],['Jefe 1-4.mp3',adventureMusic(5,'playing',true)]];
test('all five supplied recordings are installed byte for byte and every boss has an independent source',()=>{
 const hash=path=>createHash('sha256').update(fs.readFileSync(path)).digest('hex');
 for(const [source,track]of replacements){expect(hash('public'+track.src)).toBe(hash('public/arcade/music/for replace/'+source));expect(track.loop).toBe(true);}
 const tracks=[1,2,5,3].map(i=>adventureMusic(i,'playing',true).src);expect(new Set(tracks).size).toBe(4);expect(new Set(tracks.map(src=>hash('public'+src))).size).toBe(4);
 expect(hash('public/arcade/music/bosses/arlequin_fuego.mp3')).toBe('7b3821eddf4c6599d0e4d83af5b34ff9b9f194e16579780de7b2770e2d02c75b');
});

test('the five active MP3s decode and their actual media elements can play and pause',async({page})=>{
 test.setTimeout(120000);await page.route('**/__music_decode',r=>r.fulfill({contentType:'text/html',body:'<body></body>'}));await page.goto('/__music_decode');
 const report=await page.evaluate(async paths=>{
  const context=new AudioContext(),result=[];
  try{for(const path of paths){
   const response=await fetch(path);if(!response.ok)throw Error(path+' '+response.status);const b=await context.decodeAudioData(await response.arrayBuffer());let peak=0,power=0;
   for(let ch=0;ch<b.numberOfChannels;ch++){const samples=b.getChannelData(ch);for(let i=0;i<samples.length;i++){peak=Math.max(peak,Math.abs(samples[i]));power+=samples[i]*samples[i];}}
   const media=document.createElement('audio');media.src=path;media.loop=true;media.muted=true;document.body.append(media);await media.play();await new Promise(resolve=>setTimeout(resolve,120));const time=media.currentTime;media.pause();result.push({path,duration:b.duration,channels:b.numberOfChannels,peak,rms:Math.sqrt(power/b.length/b.numberOfChannels),time,paused:media.paused,loop:media.loop});media.remove();
  }}finally{await context.close();}return result;
 },replacements.map(([,track])=>track.src));
 for(const r of report){expect(r.duration).toBeGreaterThan(20);expect(r.channels).toBe(2);expect(r.rms).toBeGreaterThan(.005);expect(Number.isFinite(r.peak)).toBe(true);expect(r.time).toBeGreaterThan(0);expect(r.paused).toBe(true);expect(r.loop).toBe(true);}
 fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(folder+'decoded-music.json',JSON.stringify(report,null,2));
});

test('the real title and Miso shop use the new tracks and the shop restores exploration on exit',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/arcade');await openAdventureMenu(page);const root=page.locator('[data-hexy-adventure]'),music=page.locator('audio').first();
 await expect(music).toHaveAttribute('src','/arcade/music/title.mp3');await expect.poll(()=>music.evaluate(a=>a.currentTime)).toBeGreaterThan(.03);await page.locator('[data-practice]').click();await expect(root).toHaveAttribute('data-phase','playing');await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>+document.querySelector('[data-adventure-canvas]').dataset.playerX>315);await page.keyboard.up('ArrowRight');await page.keyboard.press('KeyE');await expect(page.locator('[data-adventure-shop]')).toBeVisible();await expect(music).toHaveAttribute('src','/arcade/music/shop.mp3');await expect.poll(()=>music.evaluate(a=>a.currentTime)).toBeGreaterThan(.03);await page.keyboard.press('Escape');await expect(root).toHaveAttribute('data-phase','playing');await expect(music).toHaveAttribute('src',adventureMusic(0,'playing').src);
});

test('each real boss transition switches to its supplied score and pause stops playback',async({page})=>{
 test.setTimeout(90000);
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('function stepAdventure(s,input,dt){',`function stepAdventure(s,input,dt){
  if(window.musicReviewBoss&&!s.musicReviewBoss){s.musicReviewBoss=true;Object.assign(s.boss,{engaged:true,phase:'recover',timer:999});}
 `)});});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/arcade');await openAdventureMenu(page);const root=page.locator('[data-hexy-adventure]'),music=page.locator('audio').first();
 for(const index of [1,2,5]){
  await page.getByRole('button',{name:/Elegir cap/}).click();await page.locator('[data-level-choice="'+index+'"]').click();await page.evaluate(()=>window.musicReviewBoss=false);await page.locator('[data-practice]').click();await expect(root).toHaveAttribute('data-phase','playing');await expect(music).toHaveAttribute('src',adventureMusic(index,'playing').src);await page.evaluate(()=>window.musicReviewBoss=true);await expect(music).toHaveAttribute('src',adventureMusic(index,'playing',true).src);await expect.poll(()=>music.evaluate(a=>a.currentTime)).toBeGreaterThan(.03);await page.keyboard.press('KeyP');await expect(root).toHaveAttribute('data-phase','paused');await expect.poll(()=>music.evaluate(a=>a.paused)).toBe(true);await page.getByRole('button',{name:'Terminar práctica',exact:true}).click();await expect(root).toHaveAttribute('data-phase','ready');await expect(music).toHaveAttribute('src','/arcade/music/title.mp3');
 }
});
