import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {harlequinChargeAge,harlequinChargeParticle,harlequinChargeTrail} from '../src/components/arcade/adventure/render/clashAtmosphereCanvas';
import {beginHarlequinUltimate,stepHarlequinUltimate,HARLEQUIN_ULTIMATE,ultimateHand} from '../src/components/arcade/adventure/actors/bosses/harlequinUltimate';
import {SUPER_WINDUP} from '../src/components/arcade/adventure/engine/adventureMagic';

function charge(dir=1){const s=createAdventure(3);Object.assign(s.boss,{dir,stage:3,phase:'ultimate-charge',ultimate:{state:'charge',age:0}});s.camera={x:s.boss.x-600,y:s.boss.y-480,zoom:1,backdropY:40};return s;}
for(const dir of [-1,1])test(`fire motes have continuous bounded trails and arrive at the real hands, facing ${dir}`,()=>{
 const s=charge(dir);
 for(let i=0;i<48;i++){
  let previous=0;
  for(const age of [.08,.27,.53,.91,1.37,1.89,2.23,2.62]){
   const p=harlequinChargeParticle(s,i,age),trail=harlequinChargeTrail(s,i,age);expect(p.phase).toBeGreaterThanOrEqual(previous);previous=p.phase;
   expect(trail.at(-1)).toEqual(p);expect(trail.length).toBeLessThanOrEqual(9);
   for(let j=1;j<trail.length;j++){expect(trail[j].phase).toBeGreaterThanOrEqual(trail[j-1].phase);expect(Math.hypot(trail[j].x-trail[j-1].x,trail[j].y-trail[j-1].y)).toBeLessThan(80);}
  }
  const arrived=harlequinChargeParticle(s,i,HARLEQUIN_ULTIMATE.charge-.18),hand=ultimateHand(s.boss);expect(arrived.phase).toBe(1);expect(arrived.x).toBeCloseTo(hand.x,8);expect(arrived.y).toBeCloseTo(hand.y,8);
  expect(harlequinChargeTrail(s,i,1,true).length).toBeLessThanOrEqual(5);
 }
});

test('answering with Hexy continues the existing fire journeys and gathers all embers before the shared release',()=>{
 for(const started of [.1,.8,2.2]){
  const s=charge();s.boss.ultimate.age=started;const before=Array.from({length:48},(_,i)=>harlequinChargeParticle(s,i));s.powerClash={state:'windup',age:0};
  expect(harlequinChargeAge(s)).toBe(started);for(let i=0;i<48;i++)expect(harlequinChargeParticle(s,i)).toEqual(before[i]);
  s.powerClash.age=SUPER_WINDUP-.05;for(let i=0;i<48;i++)expect(harlequinChargeParticle(s,i).phase).toBe(1);
 }
});

test('fire charging retains the existing real attack duration',()=>{
 const s=createAdventure(3);Object.assign(s.boss,{stage:3,hp:240});expect(beginHarlequinUltimate(s)).toBe(true);
 for(let n=0;n<150&&s.boss.ultimate.state==='leap';n++)stepHarlequinUltimate(s,1/120);
 expect(s.boss.ultimate.state).toBe('charge');for(let n=0;n<335;n++)stepHarlequinUltimate(s,1/120);expect(s.boss.ultimate.state).toBe('charge');stepHarlequinUltimate(s,1/120);stepHarlequinUltimate(s,1/120);expect(s.boss.ultimate.state).toBe('fire');expect(HARLEQUIN_ULTIMATE.charge).toBe(2.8);
});

test('the shared renderer paints red travelling light, keeps Hexy pink and draws nothing after charge',async({page})=>{
 await page.route('**/__charge_light_probe',route=>route.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#161018"></body>'}));await page.goto('/__charge_light_probe');
 const result=await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',[{drawChargeStreak},{drawChargeStreams}]=await Promise.all([import(root+'render/chargeEnergyCanvas.js'),import(root+'render/clashAtmosphereCanvas.js')]);
  const canvas=document.createElement('canvas');canvas.width=800;canvas.height=180;document.body.append(canvas);const c=canvas.getContext('2d'),samples=[];
  for(const [i,fire]of [false,true].entries()){
   c.save();c.translate(i*400,0);drawChargeStreak(c,[{x:80,y:90},{x:140,y:90},{x:200,y:90},{x:260,y:90},{x:320,y:90}],1,false,fire);c.restore();samples.push([...c.getImageData(i*400+320,104,1,1).data]);
  }
  c.save();c.globalAlpha=.37;c.globalCompositeOperation='source-over';c.lineWidth=2;drawChargeStreak(c,[{x:10,y:10},{x:20,y:10}],.2,false,true);const restored=c.globalAlpha===.37&&c.globalCompositeOperation==='source-over'&&c.lineWidth===2;c.restore();
  const empty=document.createElement('canvas').getContext('2d');for(const state of ['leap','fire','recover'])drawChargeStreams(empty,{boss:{ultimate:{state}}},{},false);
  return{samples,restored,empty:[...empty.getImageData(0,0,1,1).data]};
 });
 const [pink,fire]=result.samples;expect(fire[3]).toBeGreaterThan(3);expect(fire[0]).toBeGreaterThan(fire[1]+20);expect(fire[1]).toBeGreaterThan(fire[2]+10);expect(pink[2]).toBeGreaterThan(fire[2]+40);expect(result.restored).toBe(true);expect(result.empty).toEqual([0,0,0,0]);fs.mkdirSync('context/arcade/harlequin-charge-light',{recursive:true});await page.screenshot({path:'context/arcade/harlequin-charge-light/shared-light.png'});
});
