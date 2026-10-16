// Sizes account for transparent padding: the acrobat occupies less of its cell
// than the clown. Projectiles leave the enlarged drawing's mouth/hand/barrel.
export const AIR_ENEMY_SCALE=.85;
export const RED_CLOWN_SCALE=.85;
export const DIVER_SCALE=.75;
export const RIVER_BOAT_SCALE=.8*1.15;
const profiles=[
 {size:148,w:64,h:91,muzzle:[53,-57]},
 {size:164.5,w:68.25,h:82.25,muzzle:[48,-50]},
 {size:220,w:65,h:105,muzzle:[57,-85]},
 {size:160,w:76,h:112,muzzle:[56,-78]},
 {size:164.5,w:68.25,h:82.25,muzzle:[48,-50]},
 {size:164,w:105,h:101,muzzle:[34,-72]},
 {size:148,w:64,h:91,muzzle:[53,-57]},
 {size:228,w:206,h:153,muzzle:[88.92,-41.52]},
 {size:136,w:61,h:95,muzzle:[49,-60]},
 {size:160,w:132,h:76,muzzle:[58,-126]},
 {size:122,w:53,h:104,muzzle:[23,-47]},
 {size:132,w:57,h:100,muzzle:[43,-58]},
 {size:184,w:135,h:120,muzzle:[52,-83]},
 {size:192,w:62,h:172,muzzle:[30,-12]},
 {size:132,w:49,h:94,muzzle:[68,-45]},
];
profiles[18]={size:148,w:58,h:112,muzzle:[48,-72]};
profiles[19]={size:108,w:44,h:58,muzzle:[30,-42]};
profiles[20]={size:320,w:62,h:250,muzzle:[55,-185]};
profiles[21]={size:166,w:91,h:66,muzzle:[48,-38]};
profiles[22]={size:172,w:50,h:114,muzzle:[64,-61]};
profiles[23]={size:280,w:152,h:180,muzzle:[90,-70]};
// Match a severed clown glove, including its contact area, rather than a
// second character almost as broad as the zombie that dropped it.
profiles[24]={size:58,w:34,h:22,muzzle:[17,-14]};
profiles[25]={size:185,w:58,h:112,muzzle:[46,-78]};
profiles[26]={size:198,w:72.6,h:140.8,muzzle:[58.3,-90.2]};
profiles[27]={size:120,w:68,h:78,muzzle:[26,-40]};
profiles[28]={size:246.5,w:98.6,h:192.1,muzzle:[112.2,-134.3]};
profiles[29]={size:160,w:60,h:115,muzzle:[48,-65]};
profiles[30]={size:168,w:58,h:124,muzzle:[48,-72]};
profiles[31]={size:174,w:67,h:130,muzzle:[54,-72]};
profiles[32]={size:78,w:50,h:42,muzzle:[22,-15]};
const scaledProfiles=profiles.map((g,i)=>{const scale=[0,6].includes(i)?RED_CLOWN_SCALE:[2,7].includes(i)?AIR_ENEMY_SCALE:i===8?DIVER_SCALE:i===9?RIVER_BOAT_SCALE:1;return{size:g.size*scale,w:g.w*scale,h:g.h*scale,muzzle:g.muzzle.map(v=>v*scale)};});
const fragments={skull:{size:49,w:34,h:33,muzzle:[17,-18]},arm:{size:46,w:31,h:23,muzzle:[15,-12]},leg:{size:46,w:27,h:35,muzzle:[13,-18]}};
const orbitGeometry={...scaledProfiles[27],size:86.4,w:48.96,h:56.16,muzzle:[18.72,-28.8]};
export const enemyGeometry=e=>e.orbitEscort?orbitGeometry:fragments[e.fragmentKind]||scaledProfiles[e.type]||scaledProfiles[0];
export function enemyBody(e,padding=0){
 if(e.nightmareHidden||e.fleeing||e.phase==='manifest'&&e.cryptScale<.85||e.type===19&&['vanish','appear','soulRise'].includes(e.phase))return{x:e.x,y:e.baseY+5000,w:0,h:0};
 if(e.type===8&&['hidden','submerged'].includes(e.phase))return{x:e.x,y:(e.waterY||e.y)+250,w:0,h:0};
 const g=enemyGeometry(e),swimming=e.type===8&&e.phase==='swim';
 if(e.type===8&&['emerge','dive','surfaceFire'].includes(e.phase)){
  const visible=e.phase==='emerge'?Math.min(1,(e.phaseAge||0)/.85):e.phase==='dive'?Math.max(0,1-(e.phaseAge||0)/.65):1,h=12+visible*40;
  return{x:e.x-g.w/2-padding,y:e.waterY-h-padding,w:g.w+2*padding,h:h+2*padding};
 }
 const w=swimming?g.size*.78:g.w,h=e.type===20&&['slam','crouch','landing'].includes(e.phase)?g.h*(e.phase==='slam'?.44:.66):swimming?g.size*.44:g.h,offset=swimming?g.size*.17:e.type===19&&e.ghostForm!=='sheet'?24:0;return{x:e.x-w/2-padding,y:e.y-h-offset-padding,w:w+padding*2,h:h+padding*2};
}
export function enemyMuzzle(e){const g=enemyGeometry(e);return{x:e.x+e.dir*g.muzzle[0],y:e.y+g.muzzle[1]};}
