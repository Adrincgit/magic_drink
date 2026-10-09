import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {updateBoss} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {harborPanoramaPlacement,harborFairPlacement,harborBoatPlacement,HARBOR_BOATS} from '../src/components/arcade/adventure/render/adventureHarborCanvas';
import {riverFlow,riverBridgePiers} from '../src/components/arcade/adventure/render/adventureRiverCanvas';
const folder='tests/artifacts/arcade/harbor-barge/';

test('three distant depths visibly separate without moving physical piers or their water contacts',()=>{
 const s=createAdventure(2),img={width:2172,height:724};s.camera={x:2800,y:55,zoom:1,backdropY:70};
 const before=[harborPanoramaPlacement(s,img),harborFairPlacement(s,img),...HARBOR_BOATS.map(q=>harborBoatPlacement(s,q))];
 const river=s.level.rivers[0],flow=riverFlow(s,river),bridge=s.platforms.find(q=>q.bridge),piers=riverBridgePiers(bridge,img);s.camera.x+=200;
 const after=[harborPanoramaPlacement(s,img),harborFairPlacement(s,img),...HARBOR_BOATS.map(q=>harborBoatPlacement(s,q))];
 for(const [i,dx]of [4.4,36,68,86,72].entries()){expect(before[i].x-after[i].x).toBeCloseTo(dx);expect(after[i].y).toBe(before[i].y);}
 expect((before[1].x-after[1].x)/(before[0].x-after[0].x)).toBeGreaterThan(8);expect(riverFlow(s,river)).toEqual(flow);expect(riverBridgePiers(bridge,img)).toEqual(piers);
 s.camera.zoom=.52;s.camera.y=-326;expect(harborFairPlacement(s,img)).toEqual(after[1]);expect(harborBoatPlacement(s,HARBOR_BOATS[0])).toEqual(after[2]);
 for(const x of [0,s.level.width-960/.52]){s.camera.x=x;const q=harborPanoramaPlacement(s,img);expect(q.x).toBeLessThanOrEqual(0);expect(q.x+q.w).toBeGreaterThanOrEqual(960);}
});

test('barge has exactly two stages and the damaged stage increases volleys and combines heights',()=>{
 const report={};
 for(const stage of [1,2])for(const move of ['drumroll','mortar','tidal']){
  const s=createAdventure(2),b=s.boss,a=s.level.arena;s.damage=()=>{};Object.assign(s.player,{x:a.left+400,y:a.y});Object.assign(b,{phase:'warn',timer:.001,move,hp:stage===2?100:320,transformed:stage===2,armorBroken:stage===2});
  for(let i=0;i<510;i++)updateBoss(s,1/120,{body:playerBody,say:()=>{},particles:()=>{}});
  expect(b.stage).toBe(stage);report[move+stage]=s.hostile;
 }
 expect(report.drumroll2.length).toBeGreaterThan(report.drumroll1.length);expect(report.mortar2.length).toBeGreaterThan(report.mortar1.length);
 expect(report.tidal1.every(q=>q.kind==='barge-wave')).toBe(true);expect(new Set(report.tidal2.map(q=>q.kind))).toEqual(new Set(['barge-wave','barge-hoop']));
 const s=createAdventure(2);s.damage=()=>{};Object.assign(s.boss,{hp:1,transformed:true,phase:'recover',timer:10});updateBoss(s,1/120,{body:playerBody,say:()=>{},particles:()=>{}});expect(s.boss.stage).toBe(2);
});

test('new layers animate reflections, join continuously, and remain steady in reduced motion',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 const report=await page.evaluate(async()=>{
  const [{createAdventure},{loadAdventureArt,renderAdventure},{drawHarborBackdrop,harborFairPlacement}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureHarborCanvas.js')]);
  const s=createAdventure(2),art=await loadAdventureArt(),probe=document.createElement('canvas');probe.width=960;probe.height=540;const ctx=probe.getContext('2d');s.camera={x:3000,y:55,backdropY:70,zoom:1};
  const draw=(time,reduced)=>{s.time=time;ctx.clearRect(0,0,960,540);drawHarborBackdrop(ctx,s,art,reduced);return ctx.getImageData(0,0,960,540).data;};
  const delta=(a,b)=>{let sum=0,changed=0;for(let i=0;i<a.length;i+=4){const d=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);sum+=d;if(d>9)changed++;}return{mean:sum/(a.length/4*3),changed};};
  const motion=delta(draw(0,false),draw(1.7,false)),reduced=delta(draw(0,true),draw(1.7,true));
  const edge=harborFairPlacement(s,art['harbor-fair']).w/.18;s.camera.x=edge-.05;const left=draw(0,true);s.camera.x=edge+.05;const seam=delta(left,draw(0,true));
  const c=document.createElement('canvas');c.id='harbor-parallax';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  window.harborDepth={s,c,art,renderAdventure};return{motion,reduced,seam};
 });
 expect(report.motion.changed).toBeGreaterThan(1000);expect(report.reduced.changed).toBe(0);expect(report.seam.mean).toBeLessThan(1);
 for(const [name,x]of [['depth-pan-a',7400],['depth-pan-b',7800],['depth-pan-c',8200]]){await page.evaluate(x=>{const w=window.harborDepth;w.s.player.x=x+300;w.s.player.y=460;w.s.time=3;w.s.camera={x,y:50,backdropY:50,zoom:1};w.renderAdventure(w.c,w.s,w.art);},x);await page.locator('#harbor-parallax').screenshot({path:folder+name+'.jpg'});}
 fs.writeFileSync(folder+'parallax-motion.json',JSON.stringify(report,null,2));expect(errors).toEqual([]);
});
