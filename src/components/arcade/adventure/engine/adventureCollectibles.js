import {LEVELS} from '../world/adventureLevels';
import {groundY} from '../world/adventureTerrain';

// Authored positions form stable identities. Adding a different coin does not
// renumber the existing ones, and replaying a chapter cannot create a new ID.
export const COLLECTIBLES=LEVELS.map(level=>{
 const normal=level.stars||level.platforms.filter(p=>p.w<700).flatMap(p=>{
  const row=[];for(let x=p.x+45;x<p.x+p.w-20;x+=70)row.push([x,p.y-48]);return row;
 });
 const stars=normal.map(([x,y])=>({id:`${level.id}:star:${x}:${y}`,x,y,value:1}));
 const tents=(level.outposts||[]).slice(0,2);
 const count=5-tents.length;
 for(let i=0;i<count;i++){
  const target=level.arena.left*(.17+i*.23);
  const platform=level.platforms.filter(p=>p.x+p.w/2<level.arena.left).reduce((a,b)=>Math.abs(b.x+b.w/2-target)<Math.abs(a.x+a.w/2-target)?b:a);
  const x=level.groundRoute?target:platform.x+platform.w/2;
  const floor=level.groundRoute?groundY(level.platforms,x):platform.y;
  stars.push({id:`${level.id}:treasure:jump-${i}`,x,y:floor-(i===0?85:155+i*12),value:10});
 }
 tents.forEach((q,i)=>stars.push({id:`${level.id}:treasure:tent-${i}`,x:q.x,y:q.y-80,value:10,outpost:i}));
 return stars;
});
const receipts=new Map(COLLECTIBLES.flat().map(q=>[q.id,q.value]));
export const validCollectedStars=ids=>[...new Set(Array.isArray(ids)?ids:[])].filter(id=>receipts.has(id));
export const collectibleValue=id=>receipts.get(id)||0;
export function createCollectibles(index,collected=[]){
 const taken=new Set(collected);
 return COLLECTIBLES[index].map(q=>({...q,taken:taken.has(q.id),hidden:q.outpost!==undefined}));
}
