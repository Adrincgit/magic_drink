import {groundY} from './adventureTerrain';
export const BALLOON_SIZE=400;
export const cameraView=s=>({zoom:s.camera.zoom||1,width:960/(s.camera.zoom||1),height:540/(s.camera.zoom||1)});
export function adventureBounds(s){
 if(!s.arenaLocked)return{left:18,right:s.level.width-18};
 const a=s.level.arena,view=cameraView(s);
 if(s.index===0)return{left:Math.max(a.left+16,s.camera.x+16),right:Math.min(a.right-16,s.camera.x+view.width-16)};
 const center=(a.left+a.right)/2;
 return{left:center-450,right:s.index===1?Math.min(center+450,a.right-370):center+450};
}
export function followAdventureCamera(s,dt){
 const a=s.level.arena,balloon=s.index===0&&(s.arenaLocked||!!s.clear||!!s.boss.defeat);
 const zoom=balloon ? (s.boss.move==='bombing-run'&&['warn','attack'].includes(s.boss.phase)?.72:.82) : 1;
 s.camera.zoom=(s.camera.zoom??1)+(zoom-(s.camera.zoom??1))*Math.min(1,dt*3.4);
 const view=cameraView(s),center=(a.left+a.right)/2;
 const battleX=s.index===0?Math.max(a.left,Math.min(a.right-view.width,s.player.x-view.width*.42)):center-view.width/2;
 const x=s.arenaLocked?battleX:Math.max(0,Math.min(s.level.width-view.width,s.player.x-view.width*.3125));
 // A zoomed battle keeps the floor visible and opens room above the balloon.
 const y=balloon?a.y-475/view.zoom:s.level.groundRoute?groundY(s.platforms,s.player.x)-440:s.arenaLocked?a.y-420:Math.max(-190,Math.min(150,s.player.y-380));
 s.camera.x+=(x-s.camera.x)*Math.min(1,dt*7);s.camera.y+=(y-s.camera.y)*Math.min(1,dt*5);
}
// Front basket mouths/hands: the same points drive anticipation and release.
export function balloonSockets(s){
 const b=s.boss,z=BALLOON_SIZE/256,lift={balls:102,swoop:102,bombs:100,drop:43,streamers:72}[b.move]||72;
 return [{x:b.x-53*z,y:b.y-lift*z},{x:b.x,y:b.y-lift*z},{x:b.x+53*z,y:b.y-lift*z}];
}
