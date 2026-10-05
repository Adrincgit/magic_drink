// Authored encounter sequences inserted before each final arena. Distances are
// in world pixels, not screen pixels; jump gaps stay within Hexy's normal reach.
const encounters=[
 [[260,0],[650,3],[1130,2],[1560,4],[2030,0],[2440,5],[2840,3],[3370,2],[3790,4],[4210,5],[4660,0],[5130,3],[5520,2],[5950,4],[6360,5],[7080,3],[7520,2]],
 [[280,4],[760,5],[1190,3],[1660,2],[2100,4],[2610,5],[3020,0],[3490,3],[3950,2],[4420,5],[4890,4],[5350,3],[5800,5],[6240,2],[6840,4],[7320,5],[7710,0]],
 [[260,4],[730,2],[1170,3],[1640,4],[2110,2],[2530,3],[3070,4],[3520,2],[4050,3],[4570,4],[5070,2],[5520,3],[6080,4],[6520,2],[7110,3],[7550,4]],
 [[240,5],[660,4],[1150,3],[1570,2],[2030,5],[2480,4],[3070,3],[3480,5],[4030,2],[4520,4],[5070,5],[5540,3],[6100,2],[6570,5],[7100,4],[7540,3]],
 [[270,4],[690,2],[1150,5],[1680,3],[2110,4],[2560,2],[3070,5],[3550,3],[4100,4],[4530,2],[5080,5],[5500,4],[6090,3],[6540,5],[7060,2],[7540,4]],
];
export function extendAdventureRoutes(levels){
 for(const [i,l] of levels.entries()){
  const start=l.arena.left,length=8000,y=l.arena.y;
  for(const p of l.platforms)if(p.x>=start)p.x+=length;
  l.width+=length;l.arena={...l.arena,left:start+length,right:l.arena.right+length,entry:l.arena.entry+length};l.boss[0]+=length;l.exit[0]+=length;
  for(const q of l.pickups)if(q.x>=start)q.x+=length;
  l.platforms.push(...(i===0?[{x:start,y,w:length,h:24,kind:'earth'}]:Array.from({length:8},(_,n)=>({x:start+n*1000,y,w:920,h:24,kind:i<3?'moss':'stone'}))));
  if(i>0)for(let n=0;n<8;n++){
   l.platforms.push({x:start+n*1000+240,y:y-75,w:210,h:24,kind:'stone'});
   if(n%2===i%2)l.platforms.push({x:start+n*1000+595,y:y-140,w:220,h:24,kind:n%3===0?'moving':'stone',axis:'y',range:25,speed:.7});
  }
  l.platforms.sort((a,b)=>a.x-b.x||b.y-a.y);
  l.enemies.push(...encounters[i].map(([x,type])=>[start+x,y-(type===2?130:0),type]));
  l.cages[2]=[start+6670,y];
  l.checkpoints=[l.checkpoint,[start+2200,y],[start+5200,y],[start+7300,y]];
  for(const [offset,kind] of [[1700,i],[4300,(i+1)%5],[6400,i]])l.pickups.push({x:start+offset,y:y-28,kind});
  for(const offset of [1430,3730,5730,7430])l.hazards.push([start+offset,y-22,48]);
  if(l.stars)for(let n=0;n<8;n++)for(let k=0;k<4;k++)l.stars.push([start+n*1000+450+k*50,y-47-(k%2)*22]);
  l.sections=[{x:0,name:l.name},{x:start,name:[['Los faroles del bosque','Forest lanterns'],['La marcha de los cañones','The cannon march'],['Los puentes del coro','The chorus bridges'],['Tras los bastidores','Behind the curtains'],['Las jaulas del silencio','The silence cages']][i]},{x:start+4000,name:[['Caravanas entre los árboles','Caravans among the trees'],['El campamento del director','The conductor’s camp'],['El claro de los malabares','The juggling clearing'],['El corredor de los acróbatas','The acrobats’ corridor'],['La galería de los ecos','The echo gallery']][i]},{x:l.arena.left,name:l.bossName}];
  if(l.scenery){
   for(const q of l.scenery)if(q.x>=start)q.x+=length;
   for(let n=0;n<8;n++)l.scenery.push({kind:'trees',x:start+350+n*1000,y:y-20,h:330+(n%3)*32,depth:.9},{kind:n%2?'wagon':'tent',x:start+760+n*1000,y:y-12,h:n%2?145:200,depth:.96});
   l.scenery.sort((a,b)=>a.x-b.x);
  }
 }
}
