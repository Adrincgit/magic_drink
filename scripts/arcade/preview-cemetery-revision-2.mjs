import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder='tests/artifacts/arcade/cemetery-revision-2/';fs.mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:810}});page.on('pageerror',e=>console.error(e.message));await page.goto('http://localhost:4321');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.review=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','world/adventureTerrain.js'].map(f=>import(root+f))));w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
 });
 for(const x of [90,2700,4200,4550,7000,9500]){
  await page.evaluate(x=>{const w=window.review,s=w.createAdventure(6);s.noticeTime=0;s.enemies=[];s.stars=[];s.pickups=[];s.supplies=[];Object.assign(s.player,{x,y:w.groundY(s.level.route,x),ground:s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),hurt:0});s.camera={x:Math.max(0,x-300),y:s.player.y-440,backdropY:40,zoom:1};w.renderAdventure(w.c,s,w.art);},x);
  await page.locator('#review').screenshot({path:folder+'preview-'+x+'.png'});
 }
}finally{await browser.close();}
