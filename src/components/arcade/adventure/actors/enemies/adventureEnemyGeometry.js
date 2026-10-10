// Sizes account for transparent padding: the acrobat occupies less of its cell
// than the clown. Projectiles leave the enlarged drawing's mouth/hand/barrel.
export const AIR_ENEMY_SCALE=.85;
export const RED_CLOWN_SCALE=.85;
export const DIVER_SCALE=.75;
export const RIVER_BOAT_SCALE=.8;
const profiles=[
 {size:148,w:64,h:91,muzzle:[53,-57]},
 {size:164.5,w:68.25,h:82.25,muzzle:[48,-50]},
 {size:220,w:65,h:105,muzzle:[57,-85]},
 {size:160,w:76,h:112,muzzle:[56,-78]},
 {size:164.5,w:68.25,h:82.25,muzzle:[48,-50]},
 {size:164,w:105,h:101,muzzle:[34,-63]},
 {size:148,w:64,h:91,muzzle:[53,-57]},
 {size:228,w:206,h:153,muzzle:[88.92,-41.52]},
 {size:136,w:61,h:95,muzzle:[49,-60]},
 {size:160,w:132,h:76,muzzle:[58,-126]},
 {size:122,w:53,h:104,muzzle:[23,-47]},
 {size:132,w:57,h:100,muzzle:[43,-58]},
 {size:184,w:135,h:120,muzzle:[52,-83]},
 {size:192,w:62,h:172,muzzle:[30,-12]},
];
const scaledProfiles=profiles.map((g,i)=>{const scale=[0,6].includes(i)?RED_CLOWN_SCALE:[2,7].includes(i)?AIR_ENEMY_SCALE:i===8?DIVER_SCALE:i===9?RIVER_BOAT_SCALE:1;return{size:g.size*scale,w:g.w*scale,h:g.h*scale,muzzle:g.muzzle.map(v=>v*scale)};});
export const enemyGeometry=e=>scaledProfiles[e.type]||scaledProfiles[0];
export function enemyBody(e,padding=0){
 if(e.type===8&&['hidden','submerged'].includes(e.phase))return{x:e.x,y:(e.waterY||e.y)+250,w:0,h:0};
 const g=enemyGeometry(e),swimming=e.type===8&&e.phase==='swim';
 if(e.type===8&&['emerge','dive','surfaceFire'].includes(e.phase)){
  const visible=e.phase==='emerge'?Math.min(1,(e.phaseAge||0)/.85):e.phase==='dive'?Math.max(0,1-(e.phaseAge||0)/.65):1,h=12+visible*40;
  return{x:e.x-g.w/2-padding,y:e.waterY-h-padding,w:g.w+2*padding,h:h+2*padding};
 }
 const w=swimming?g.size*.78:g.w,h=swimming?g.size*.44:g.h,offset=swimming?g.size*.17:0;return{x:e.x-w/2-padding,y:e.y-h-offset-padding,w:w+padding*2,h:h+padding*2};
}
export function enemyMuzzle(e){const g=enemyGeometry(e);return{x:e.x+e.dir*g.muzzle[0],y:e.y+g.muzzle[1]};}
