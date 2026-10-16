import {test,expect} from '@playwright/test';

test('the bank and road shift together while clouds drift above a stationary landscape',async({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const result=await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',{drawVillageGroundBank,drawVillageRoad,drawVillageBackdrop}=await import(root+'render/villageCanvas.js'),{createAdventure}=await import(root+'engine/adventureModel.js'),art={};
  const paths={'village-berm-v5':'village/berm-v5','village-country-road-v5':'village/country-road-v5','village-road-entry-v5':'village/road-entry-v5','village-road-v3':'village/road-v3','village-clouds-v6':'village/clouds-v6','village-night-sky-v4':'village/night-sky-v4','village-town-bank-v2':'village/town-bank-v2','village-blocks-v3':'village/blocks-v3','nightmare-depth-mountains-v2':'halloween/depth-mountains-v2','nightmare-depth-woods-v2':'halloween/depth-woods-v2'};
  await Promise.all(Object.entries(paths).map(async([key,path])=>{const img=new Image();img.src='/arcade/maps/'+path+'.webp';await img.decode();art[key]=img;}));
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const c=canvas.getContext('2d'),s=createAdventure(7),frames=[];s.camera.y=40;
  for(const x of [2100,2200]){s.camera.x=x;c.clearRect(0,0,960,540);c.save();c.translate(-x,-40);drawVillageGroundBank(c,s,art);for(const q of s.level.route)if(q.x+q.w>x&&q.x<x+960)drawVillageRoad(c,q,art);c.restore();frames.push(c.getImageData(0,0,960,540).data);}
  // Allow two color levels for rasterization rounding at transformed clip edges.
  let slipping=0,maxDifference=0;const changedAt=[];for(let y=150;y<530;y++)for(let x=5;x<855;x++){const a=(y*960+x+100)*4,b=(y*960+x)*4;for(let k=0;k<4;k++){const d=Math.abs(frames[0][a+k]-frames[1][b+k]);maxDifference=Math.max(maxDifference,d);if(d>2){slipping++;if(changedAt.length<10)changedAt.push([x,y,k,d]);}}}
  frames.length=0;s.camera.x=2100;s.village.furthest=2400;
  for(const time of [0,10]){s.time=time;drawVillageBackdrop(c,s,art);frames.push(c.getImageData(0,0,960,540).data);}
  let skyChanges=0,landChanges=0;for(let y=0;y<540;y++)for(let x=0;x<960;x++){const a=(y*960+x)*4;if(frames[0][a]!==frames[1][a]){if(y<180)skyChanges++;if(y>350)landChanges++;}}
  return{slipping,maxDifference,changedAt,skyChanges,landChanges};
 });
 expect(result.slipping,JSON.stringify(result)).toBe(0);expect(result.skyChanges).toBeGreaterThan(1000);expect(result.landChanges).toBe(0);
});
