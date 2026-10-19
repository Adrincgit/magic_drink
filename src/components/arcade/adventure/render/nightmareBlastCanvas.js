import {nightmareFX} from './nightmarePaintedFX';
import {paintMagicLight} from './projectileLightsCanvas';
export function drawNightmareBlast(c,s,art,reduced=false){
 const q=s.boss.nightmareBlast;if(!q)return;const t=Math.min(1,q.age/1.6),size=500+Math.min(1,t*4)*1000;
 paintMagicLight(c,q.x,q.y-100,size*.5,'#b65cff',(1-t)*.7);
 // The full painted blast advances from hot purple fire into rolling smoke.
 // Its floor stays registered while the separate pressure front expands.
 nightmareFX(c,art,'purple-detonation',Math.min(7,Math.floor(t*8)),q.x,q.y-size*.43,size,size,false,Math.min(1,(1-t)*4));
 if(q.age<.65){const radius=70+Math.min(1,q.age/.55)*800;nightmareFX(c,art,'fast-wind',reduced?4:Math.min(7,Math.floor(q.age/.65*8)),q.x,q.y-8,radius*2,90,false,Math.sin(q.age/.65*Math.PI)*.85);}
}
