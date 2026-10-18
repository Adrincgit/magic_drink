import {surfaceY} from './adventureTerrain';
import {shopForLevel} from '../engine/adventureShop';

export function safeSupplyPosition(level,x,y,occupied=[]){
 const shop=shopForLevel(level),candidates=[];
 const clear=(at,floor)=>{
  if((level.hazards||[]).some(([hx,hy,w])=>at>hx-85&&at<hx+w+85&&Math.abs(floor-hy)<120))return false;
  if((level.outposts||[]).some(q=>Math.abs(at-q.x)<210&&Math.abs(floor-q.y)<190))return false;
  if((level.campTents||[]).some(q=>Math.abs(at-q.x)<q.w/2+85))return false;
  if((level.scenery||[]).some(q=>q.kind==='tent'&&Math.abs(at-q.x)<q.h*.8+75&&Math.abs(floor-q.y)<120))return false;
  if((level.cages||[]).some(([cx,cy])=>Math.abs(at-cx)<110&&Math.abs(floor-cy)<90))return false;
  if((level.graves||[]).some(q=>Math.abs(at-q.x)<(q.kind==='crypt'?250:135)&&Math.abs(floor-q.y)<140))return false;
  if((level.nightmareProps||[]).some(q=>Math.abs(at-q.x)<q.size*.5+70&&Math.abs(floor-q.y)<100))return false;
  if((level.obstacles||[]).some(q=>Math.abs(at-q.x)<q.w/2+80&&Math.abs(floor-q.y)<q.h+100))return false;
  if((level.rubble||[]).some(q=>Math.abs(at-q.x)<150&&Math.abs(floor-q.y)<100))return false;
  if(shop&&Math.abs(at-shop.x)<195&&Math.abs(floor-shop.y)<150)return false;
  if(occupied.some(q=>Math.abs(at-q.x)<125&&Math.abs(floor-q.y)<100))return false;
  return !level.platforms.some(q=>q.solid&&!q.gone&&at>q.x-65&&at<q.x+q.w+65&&q.y<floor&&q.y+q.h>floor-110);
 };
 for(const p of level.platforms){
  if(p.gone||p.solid||p.kind==='moving'||p.kind==='ember-bed'||p.w<155)continue;
  for(let at=Math.max(p.x+75,x-900);at<=Math.min(p.x+p.w-75,x+900);at+=25){
   const floor=surfaceY(p,at);if(clear(at,floor))candidates.push({x:at,y:floor,score:Math.abs(at-x)+Math.abs(floor-y)*2});
  }
 }
 return candidates.sort((a,b)=>a.score-b.score)[0]||null;
}
