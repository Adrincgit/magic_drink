import {openAdventureMenu} from './arcade-input.helpers';
import {test,expect} from '@playwright/test';
import {MEADOW_PLANES,meadowPlanePlacement} from '../src/components/arcade/adventure/world/adventureParallax';

test('opaque meadow panoramas cover the whole chapter and retain distinct depth speeds',()=>{
 const image={width:2172,height:724},end=4400-960;
 for(const plane of MEADOW_PLANES){
  for(const x of [0,1000,2200,end]){const p=meadowPlanePlacement(image,{x,y:0},plane,4400);expect(p.x).toBeLessThanOrEqual(0);expect(p.x+p.width).toBeGreaterThanOrEqual(960);}
  const a=meadowPlanePlacement(image,{x:1000,y:0},plane),b=meadowPlanePlacement(image,{x:1100,y:0},plane);expect(a.x-b.x).toBeCloseTo(100*plane.speed);
 }
 expect(MEADOW_PLANES[1].speed).toBeGreaterThan(MEADOW_PLANES[0].speed);
});
test('Original colors and painted stars cover the game screen, clear on expiry, and stay still with reduced motion',async({page})=>{
 await page.goto('/arcade');await openAdventureMenu(page);
 const result=await page.evaluate(async()=>{
  const {paintOriginalScreen}=await import('/src/components/arcade/adventure/engine/adventureOriginal.js');
  const img=new Image();img.src='/arcade/sprites/props/collectible-star.webp';await img.decode();
  // Keep pixel comparisons on one renderer; repeated readback can otherwise
  // switch Chrome from GPU to CPU halfway through the identical drawings.
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const c=canvas.getContext('2d',{willReadFrequently:true}),s={overdrive:9,time:2,player:{drinkCast:0}};
  const draw=reduced=>{c.clearRect(0,0,960,540);paintOriginalScreen(c,s,{'collectible-star':img},reduced);return c.getImageData(0,0,960,540).data;};
  const active=draw(false),count=(x0,y0,w,h)=>{let n=0;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if(active[(y*960+x)*4+3]>15)n++;return n;};
  const edges=[count(0,0,120,540),count(840,0,120,540),count(0,0,960,90),count(0,450,960,90)];
  const still=draw(true);s.time=11;const later=draw(true);let difference=0;for(let i=0;i<still.length;i++)difference=Math.max(difference,Math.abs(still[i]-later[i]));
  s.overdrive=0;const ended=draw(false);return{edges,difference,ended:[...ended].some(n=>n>0),centerAlpha:active[(270*960+480)*4+3]};
 });
 expect(result.edges.every(n=>n>1000)).toBe(true);expect(result.centerAlpha).toBeLessThan(100);expect(result.difference).toBeLessThanOrEqual(1);expect(result.ended).toBe(false);
});
