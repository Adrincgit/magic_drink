// Sizes account for transparent padding: the acrobat occupies less of its cell
// than the clown. Projectiles leave the enlarged drawing's mouth/hand/barrel.
export const AIR_ENEMY_SCALE=.85;
export const RED_CLOWN_SCALE=.85;
const profiles=[
 {size:148,w:64,h:91,muzzle:[53,-57]},
 {size:164.5,w:68.25,h:82.25,muzzle:[48,-50]},
 {size:220,w:65,h:105,muzzle:[57,-85]},
 {size:160,w:76,h:112,muzzle:[56,-78]},
 {size:164.5,w:68.25,h:82.25,muzzle:[48,-50]},
 {size:164,w:105,h:101,muzzle:[34,-63]},
 {size:148,w:64,h:91,muzzle:[53,-57]},
 {size:228,w:206,h:153,muzzle:[88.92,-41.52]},
];
const scaledProfiles=profiles.map((g,i)=>{const scale=[0,6].includes(i)?RED_CLOWN_SCALE:[2,7].includes(i)?AIR_ENEMY_SCALE:1;return{size:g.size*scale,w:g.w*scale,h:g.h*scale,muzzle:g.muzzle.map(v=>v*scale)};});
export const enemyGeometry=e=>scaledProfiles[e.type]||scaledProfiles[0];
export function enemyBody(e,padding=0){const g=enemyGeometry(e);return{x:e.x-g.w/2-padding,y:e.y-g.h-padding,w:g.w+padding*2,h:g.h+padding*2};}
export function enemyMuzzle(e){const g=enemyGeometry(e);return{x:e.x+e.dir*g.muzzle[0],y:e.y+g.muzzle[1]};}
