import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';
const folder='tests/artifacts/arcade/popcorn-panic/';
test('record the painted normal blast, extended blast and aimed casts in the actual village renderer',async({page})=>{
 test.setTimeout(120000);fs.mkdirSync(folder,{recursive:true});const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.popReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/adventureAmmo.js','render/adventureCanvas.js','actors/enemies/adventureEnemies.js','world/adventureTerrain.js','actors/hexy/hexyAnimation.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='pop-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:99999';document.body.append(w.c);
  w.setup=name=>{w.name=name;const s=w.s=w.createAdventure(7),x=9000,y=w.groundY(s.level.route,x);s.noticeTime=0;s.stars=[];s.supplies=[];s.pickups=[];s.cages=[];s.villagers=[];s.enemies=[];s.camera={x:x-300,y:y-440,backdropY:40,zoom:1};Object.assign(s.player,{x,y,ground:s.platforms.indexOf(w.groundAt(s.platforms,x)),hurt:999,dir:1,aimX:1});w.equipDrink(s,13);
   if(['normal','strong'].includes(name)){const dx=name==='normal'?150:380;const e=w.makeEnemy(x+dx,w.groundY(s.level.route,x+dx),18);e.nightmareVariant=0;e.active=false;s.enemies=[e];}
   w.action=t=>name==='normal'?{attack:t>.7&&t<.75||t>2.5&&t<2.55}:name==='strong'?{special:t>.7&&t<.75||t>2.5&&t<2.55}:name==='aim'?{left:t<.15,attack:t>.7&&t<.75,jump:t>1.4&&t<1.65,up:t>1.4&&t<2.7,special:t>2.1&&t<2.15}:{right:t<2,attack:t>.7&&t<.75,left:t>2.5&&t<3.5,down:t>3.5,special:t>3.8&&t<3.85};
  };
  w.paint=()=>{const hurt=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=hurt;};
  w.record=async()=>{
   w.paint();const chunks=[],stream=w.c.captureStream(60),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:7000000});const done=new Promise(r=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const f=new FileReader();f.onload=()=>r(String(f.result).split(',')[1]);f.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
   const stats={frames:[],angles:[],costs:[],casts:0,render:[],startAmmo:w.s.ammo},snapshots=[];rec.start();let start,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;
    while(acc>=1/120){const old=w.s.ammo;w.stepAdventure(w.s,w.action(w.s.time),1/120);if(w.s.ammo<old){stats.casts++;stats.costs.push({time:w.s.time,magic:w.s.magic,ammo:w.s.ammo});}acc-=1/120;}
    const t=performance.now();w.paint();stats.render.push(performance.now()-t);
    for(const q of w.s.effects)if(q.popcornBlast){const f=Math.min(7,Math.floor(q.age/q.duration*8));if(!stats.frames.includes(f))stats.frames.push(f);if(!stats.angles.includes(q.angle))stats.angles.push(q.angle);if([2,4,6].includes(f)&&!snapshots.some(n=>n.frame===f))snapshots.push({frame:f,data:w.c.toDataURL('image/png').split(',')[1]});}
    if(now-start<5000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   stats.enemyHP=w.s.enemies.map(e=>e.hp);stats.finalMagic=w.s.magic;stats.finalAmmo=w.s.ammo;stats.simulationTime=w.s.time;stats.render.sort((a,b)=>a-b);stats.renderP95=stats.render[Math.floor(stats.render.length*.95)];delete stats.render;rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats,snapshots};
  };
 });
 for(const name of ['normal','strong','aim','moving']){
  await page.evaluate(name=>window.popReview.setup(name),name);const r=await page.evaluate(()=>window.popReview.record());fs.writeFileSync(folder+name+'.webm',Buffer.from(r.data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(r.stats,null,2));for(const n of r.snapshots)fs.writeFileSync(folder+name+'-blast-'+n.frame+'.png',Buffer.from(n.data,'base64'));
  expect(r.stats.casts).toBeGreaterThanOrEqual(2);expect(r.stats.frames).toContain(2);expect(r.stats.frames).toContain(6);if(name==='strong')expect(r.stats.costs[0].magic).toBe(55);if(name==='normal')expect(r.stats.costs[0].magic).toBe(100);
 }
 expect(errors).toEqual([]);expect(missing).toEqual([]);
});
test('Popcorn can be purchased and equipped in the real shop with its own can and accurate cost',async({page})=>{
 test.setTimeout(90000);fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('magic-drink-arcade:owner-reset:2026-10-06-stage-polish','done');localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,campaign:4,economy:2,coins:2,stars:2000,adventureUnlocked:7,modSlots:1}));});
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-insert-coin]').click();const canvas=page.locator('[data-adventure-canvas]'),shop=page.locator('[data-adventure-shop]');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 await canvas.focus();await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>Number(document.querySelector('[data-adventure-canvas]').dataset.playerX)>315);await page.keyboard.up('ArrowRight');await page.keyboard.press('KeyE');await expect(shop).toBeVisible();
 const item=shop.locator('[data-mod="starter-13"]');for(let i=0;i<12&&!await item.count();i++)await shop.getByRole('button',{name:'Página siguiente',exact:true}).click();await expect(item).toBeVisible();await expect.poll(()=>item.locator('img').evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);await item.click();const popup=page.locator('[data-item-popup="starter-13"]');await expect(popup).toContainText('45');await page.locator('[data-buy-mod="starter-13"]').click();await page.locator('[data-equip-mod="starter-13"]').click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).modsEquipped)).toContain('starter-13');await popup.screenshot({path:folder+'shop.png'});expect(errors).toEqual([]);
});
