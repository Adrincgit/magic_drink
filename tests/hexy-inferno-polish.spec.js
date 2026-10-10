import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {fortTargets,fortSystems} from '../src/components/arcade/adventure/actors/bosses/adventureEmberFort';
import {captureInBubble} from '../src/components/arcade/adventure/engine/adventureBubbles';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {emberAudioProfile} from '../src/components/arcade/shared/audio/emberVoice';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function scene(x=10800){const s=createAdventure(5);for(const k of ['enemies','stars','supplies','outposts','cages'])s[k]=[];Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),hurt:999});s.emberEnvironment.trees.forEach(q=>q.phase='spent');return s;}
function shot(s,x,y,extra={}){s.shots.push({x,y,vx:0,vy:0,r:9,kind:-1,damage:2,age:0,life:1,hits:[],...extra});}

test('fire troops have ten percent extra health and the breather plays all eight defeat drawings',()=>{
 const s=scene(),e=makeEnemy(11000,-520,10);s.enemies=[e];e.timer=999;
 for(const type of [10,11,13])expect(makeEnemy(0,0,type).hp).toBeCloseTo(makeEnemy(0,0,0).hp*1.1,6);
 shot(s,e.x,e.y-45,{damage:999});tick(s,1);expect(e.hp).toBe(0);expect(s.enemies).toContain(e);
 const frames=new Set();for(let i=0;i<180;i++){tick(s,1);frames.add(enemyDrawing(e).frame);}
 expect([...frames]).toEqual([8,9,10,11,12,13,14,15]);tick(s,40);expect(s.enemies).not.toContain(e);
});
for(const type of [5,7,9,12])test(`Bubble Tape never traps machinery ${type}, including powered bubbles`,()=>{
  for(const heavy of [false,true]){const s=scene(),e=makeEnemy(11000,-520,type);s.camera.x=10600;e.timer=999;if(type===7){e.flightActive=true;e.patrol={left:10800,right:11200,speed:40};}s.enemies=[e];tick(s,1);shot(s,e.x,e.y-40,{kind:3,damage:.01,r:35,heavy});tick(s,1);expect(e.trap>0).toBe(false);}
});
test('captured fire keeps its extinguished identity; normal bubbles reject large ordnance and jets',()=>{
 const bubble=extra=>({kind:3,life:2,vx:200,vy:0,...extra});
 for(const kind of ['ember-torch','ember-cinder','harlequin-card']){const q=bubble(),h={kind,ember:true,life:2,r:13,drawSize:58};expect(captureInBubble(q,h)).toBe(true);expect(q.captured[0]).toMatchObject({kind,extinguished:true});expect(h.life).toBe(0);}
 for(const kind of ['ember-mortar','barge-shell']){const h={kind,life:2,r:26,drawSize:100};expect(captureInBubble(bubble(),h)).toBe(false);expect(captureInBubble(bubble({scale:1.3}),h)).toBe(true);}
 for(const kind of ['ember-breath','fort-breath','harlequin-groundfire'])expect(captureInBubble(bubble({heavy:true}),{kind,life:2,r:0})).toBe(false);
});
test('the core can be reached on foot and destroyed with ordinary horizontal shots while both guns survive',()=>{
 const s=scene(31400);Object.assign(s.boss,{phase:'recover',engaged:true,vulnerable:true,timer:999});s.arenaLocked=true;
 expect(fortTargets(s).map(q=>q.part)).toContain('core');
 tick(s,135,{right:true});expect(s.player.x).toBeGreaterThan(s.boss.x-150);expect(s.player.x).toBeLessThan(s.boss.x);
 for(let i=0;i<8000&&s.boss.hp>0;i++)stepAdventure(s,{attack:true,hold:true},1/120);
 const parts=fortSystems(s);expect(parts.core.hp).toBe(0);expect(parts.upper.hp).toBe(parts.upper.maxHp);expect(parts.lower.hp).toBe(parts.lower.maxHp);expect(s.boss.hp).toBe(0);
 tick(s,360);expect(s.boss.defeat.ready).toBe(true);expect(s.arenaLocked).toBe(false);
});
test('fort flamethrowers warn, sustain damaging jets, ignite ground and turn off when defeated',()=>{
 const s=scene(31500);Object.assign(s.boss,{phase:'recover',engaged:true,vulnerable:true,timer:0,turn:1});s.arenaLocked=true;
 tick(s,1);expect(s.boss.move).toBe('vent');expect(s.boss.phase).toBe('warn');tick(s,180);expect(s.hostile.some(q=>q.kind==='fort-breath')).toBe(false);
 tick(s,80);const jets=s.hostile.filter(q=>q.kind==='fort-breath');expect(jets).toHaveLength(2);expect(jets.every(q=>q.range>250)).toBe(true);expect(emberAudioProfile(s).intensity).toBeGreaterThan(.2);
 s.boss.hp=0;tick(s,2);expect(s.hostile.some(q=>q.kind==='fort-breath')).toBe(false);expect(emberAudioProfile(s)).toBeNull();
});
test('balloon incendiaries drift above the forest, warn and drop igniting projectiles',()=>{
 const s=scene(23000),e=makeEnemy(23200,460,13);s.enemies=[e];e.timer=0;
 tick(s,1);expect(e.phase).toBe('windup');tick(s,120);expect(s.hostile).toHaveLength(0);tick(s,60);expect(s.hostile.some(q=>q.kind==='ember-cinder')).toBe(true);expect(e.y).toBeLessThan(500);
 tick(s,180);expect(s.hostile.some(q=>q.source==='forest')).toBe(true);
 const live=createAdventure(5);expect(live.enemies.filter(e=>e.x>21500&&e.x<29600).length).toBeGreaterThan(20);expect(live.level.bushes.filter(q=>q.x>22100&&q.x<24400).length).toBeGreaterThan(15);
});
test('fire audio has a sustained roar, respects stop and can be decoded alongside the new music',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{
  const {createEmberVoice,playEmberSound}=await import('/src/components/arcade/shared/audio/emberVoice.js'),ctx=new OfflineAudioContext(2,44100*4,44100);let time=0;
  const proxy=new Proxy(ctx,{get(t,k){if(k==='currentTime')return time;const v=Reflect.get(t,k,t);return typeof v==='function'?v.bind(t):v;}});
  const voice=createEmberVoice(proxy,ctx.destination);voice.update({intensity:1});playEmberSound(proxy,ctx.destination,'emberIgnite',.5);time=2;voice.stop();const b=await ctx.startRendering(),d=b.getChannelData(0);
  const rms=(a,z)=>Math.sqrt(d.slice(a*44100,z*44100).reduce((sum,n)=>sum+n*n,0)/((z-a)*44100));
  const music=await fetch('/arcade/music/exploration/ember-march.wav').then(r=>r.arrayBuffer()),decoded=await ctx.decodeAudioData(music);return{on:rms(.5,1.9),off:rms(2.3,4),duration:decoded.duration,channels:decoded.numberOfChannels};
 });expect(result.on).toBeGreaterThan(.02);expect(result.off).toBe(0);expect(result.duration).toBeGreaterThan(50);expect(result.channels).toBe(2);
});

test('browser review: new walk and defeat frames, airborne troops, fort vents and empty boss tent',async({page})=>{
 test.setTimeout(90000);const folder='tests/artifacts/arcade/inferno-polish';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const base='/src/components/arcade/adventure/',[model,render,terrain,camera,enemies,shop]=await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','world/adventureTerrain.js','render/adventureCamera.js','actors/enemies/adventureEnemies.js','engine/adventureShop.js'].map(p=>import(base+p)));
  const c=document.createElement('canvas');c.id='inferno-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);const w=window.inferno={...model,...render,...terrain,...camera,...enemies,...shop,c,art:await render.loadAdventureArt()};
  w.scene=(x,index=5)=>{const s=model.createAdventure(index);s.player.x=x;s.player.y=index===5?terrain.groundY(s.level.route,x):s.level.arena.y;s.player.ground=0;s.player.hurt=999;s.time=s.fxTime=12;s.noticeTime=0;w.s=s;for(let i=0;i<800;i++)w.followAdventureCamera(s,1/120);return s;};w.paint=()=>w.renderAdventure(c,w.s,w.art);
 });
 const capture=async name=>page.locator('#inferno-review').screenshot({path:folder+'/'+name+'.jpg'});
 for(const [name,x]of [['dry-path',1600],['outcrop',2400],['bush-gauntlet',23100],['balloon-troops',25800],['ash-army',29100]]){await page.evaluate(x=>{const w=window.inferno;w.scene(x);w.paint();},x);await capture(name);}
 for(const t of [.1,.45,.8,1.1]){await page.evaluate(t=>{const w=window.inferno,s=w.scene(10800),e=w.makeEnemy(10950,-520,10);e.hp=0;e.deathAge=t;e.deadTime=1.55-t;s.enemies=[e];w.paint();},t);await capture('defeat-'+t);}
 await page.evaluate(()=>{const w=window.inferno,s=w.scene(10800);s.enemies=[];for(const [i,kind]of ['ember-torch','ember-cinder','harlequin-card'].entries())s.shots.push({kind:3,x:10900+i*100,y:-575,vx:0,vy:0,r:32,scale:1.3,age:.4,life:1,captured:[{kind,extinguished:true}]});w.paint();});await capture('extinguished-captures');
 await page.evaluate(()=>{const w=window.inferno,s=w.scene(31600);s.enemies=[];s.arenaLocked=true;Object.assign(s.boss,{phase:'recover',timer:0,turn:1,engaged:true,vulnerable:true});for(let i=0;i<270;i++)w.stepAdventure(s,{},1/120);w.paint();});await capture('fort-flamethrowers');
 const shop=await page.evaluate(()=>{const w=window.inferno,s=w.scene(950,3);w.paint();return w.shopForLevel(s.level);});expect(shop).toBeNull();await capture('arlequin-no-shop');
 expect(errors).toEqual([]);
});
