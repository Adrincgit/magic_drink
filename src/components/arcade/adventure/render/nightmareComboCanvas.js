import {drawNightmareMote} from './nightmareMotesCanvas';
import {paintMagicLight} from './projectileLightsCanvas';
import {nightmarePrismStrength} from '../actors/bosses/nightmareStaffCombo';
import {nightmareFX} from './nightmarePaintedFX';
const clamp=n=>Math.max(0,Math.min(1,n));
let prismBuffer;
export function drawNightmarePrismScreen(c,s,reduced=false){
 const strength=nightmarePrismStrength(s);if(!strength)return;
 // A smooth neon grade of the completed world, applied before UI/cut-ins.
 // No strobing, mask art, or deformation of character drawings.
 prismBuffer??=new OffscreenCanvas(960,540);const b=prismBuffer.getContext('2d');b.clearRect(0,0,960,540);b.drawImage(c.canvas,0,0,960,540);
 c.save();c.globalAlpha=strength*(reduced?.55:.8);c.filter='saturate(1.7) contrast(1.16) hue-rotate(-24deg)';c.drawImage(prismBuffer,0,0,960,540);c.filter='none';
 const g=c.createLinearGradient(0,0,960,540);g.addColorStop(0,'#04dce950');g.addColorStop(.45,'#1d06385a');g.addColorStop(1,'#fa087b65');
 c.globalCompositeOperation='soft-light';c.fillStyle=g;c.fillRect(0,0,960,540);c.restore();
}
export function drawNightmareSlam(c,s,art,reduced=false){
 const q=s.boss.staffImpact;if(!q)return;const age=s.time-q.at;if(age<0||age>.85)return;
 const t=clamp(age/.85),alpha=1-t;
 paintMagicLight(c,q.x,q.y-12,110+t*90,'#b772ff',alpha*.6);
 nightmareFX(c,art,'fast-wind',Math.min(7,Math.floor(t*8)),q.x,q.y-8,90+t*400,40+t*35,false,alpha);
}
export function drawNightmareForceWind(c,s,art,reduced=false){
 const b=s.boss,g=b.game;if(!['wind-tug','wind-push'].includes(g?.kind)||!['game-windup','game-attack'].includes(b.phase))return;
 const pulling=g.kind==='wind-tug',warning=b.phase==='game-windup',age=b.phaseAge;
 const strength=warning?clamp(age/.35)*.18:Math.sin(Math.PI*clamp(age/.42));
 const dir=(Math.sign(s.player.x-b.x)||b.dir)*(pulling?-1:1),frame=warning?0:Math.min(7,Math.floor(age/.42*8));
 nightmareFX(c,art,'fast-wind',reduced?3:frame,(b.x+s.player.x)/2,b.y-48,Math.abs(s.player.x-b.x)+150,130,dir>0,strength);
}
export function drawNightmareStaffContact(c,s,art,reduced=false){
 const q=s.boss.staffContact;if(!q)return;const age=s.time-q.at;if(age<0||age>.22)return;
 nightmareFX(c,art,'clash-plasma',reduced?2:Math.min(7,Math.floor(age/.22*8)),q.x,q.y,58,70,false,1-age/.22);
}
